# Vanilla JavaScript Integration

`imzo-agnost` kutubxonasini vanilla JavaScript loyihalarida ishlatish bo'yicha
to'liq qo'llanma.

## O'rnatish

### CDN orqali (tavsiya qilinadi)

```html
<!DOCTYPE html>
<html lang="uz">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>E-IMZO Integration</title>

    <!-- E-IMZO kutubxonasi -->
    <script src="https://unpkg.com/imzo-agnost@latest/dist/index.umd.js"></script>
  </head>
  <body>
    <!-- Sizning HTML kodingiz -->
  </body>
</html>
```

### NPM/PNPM orqali

```bash
# npm
npm install imzo-agnost

# pnpm (tavsiya qilinadi)
pnpm add imzo-agnost

# yarn
yarn add imzo-agnost
```

```html
<!-- bundler bilan -->
<script type="module">
  import EIMZOClient from 'imzo-agnost';
</script>
```

## To'liq HTML Misol

```html
<!DOCTYPE html>
<html lang="uz">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>E-IMZO - Raqamli Imzo</title>

    <!-- E-IMZO kutubxonasi -->
    <script src="https://unpkg.com/imzo-agnost@latest/dist/index.umd.js"></script>

    <!-- Bootstrap CSS -->
    <link
      href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css"
      rel="stylesheet"
    />

    <!-- Custom CSS -->
    <style>
      .eimzo-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 20px;
      }

      .status-indicator {
        display: inline-block;
        width: 12px;
        height: 12px;
        border-radius: 50%;
        margin-right: 8px;
      }

      .status-online {
        background-color: #28a745;
        animation: pulse 2s infinite;
      }

      .status-offline {
        background-color: #dc3545;
      }

      @keyframes pulse {
        0% {
          transform: scale(1);
          opacity: 1;
        }
        50% {
          transform: scale(1.1);
          opacity: 0.7;
        }
        100% {
          transform: scale(1);
          opacity: 1;
        }
      }

      .certificate-card {
        border: 1px solid #dee2e6;
        border-radius: 8px;
        padding: 15px;
        margin-bottom: 10px;
        cursor: pointer;
        transition: all 0.3s ease;
      }

      .certificate-card:hover {
        border-color: #007bff;
        box-shadow: 0 4px 8px rgba(0, 123, 255, 0.25);
      }

      .certificate-card.selected {
        border-color: #007bff;
        background-color: #f8f9fa;
      }

      .certificate-info {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .certificate-badge {
        font-size: 0.8em;
        padding: 2px 8px;
        border-radius: 12px;
      }

      .loading-spinner {
        display: none;
        width: 20px;
        height: 20px;
        border: 2px solid #f3f3f3;
        border-top: 2px solid #007bff;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }

      @keyframes spin {
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(360deg);
        }
      }

      .result-area {
        background-color: #f8f9fa;
        border: 1px solid #dee2e6;
        border-radius: 8px;
        padding: 15px;
        margin-top: 20px;
        min-height: 150px;
        font-family: 'Courier New', monospace;
        font-size: 0.9em;
        white-space: pre-wrap;
        overflow-wrap: break-word;
      }

      .alert-custom {
        border-radius: 8px;
        padding: 12px 16px;
        margin-bottom: 15px;
      }
    </style>
  </head>
  <body>
    <!-- Navigation -->
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
      <div class="container">
        <a class="navbar-brand" href="#">E-IMZO Integration</a>
        <div class="navbar-nav ms-auto">
          <div class="nav-item">
            <span
              id="statusIndicator"
              class="status-indicator status-offline"
            ></span>
            <span id="statusText" class="text-white">E-IMZO: Offline</span>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <div class="eimzo-container">
      <!-- Header -->
      <div class="row mb-4">
        <div class="col-12">
          <h1 class="display-6">Raqamli Imzo Tizimi</h1>
          <p class="lead">E-IMZO yordamida hujjatlarni raqamli imzolash</p>
        </div>
      </div>

      <!-- Status Alert -->
      <div id="statusAlert" class="alert alert-warning alert-custom d-none">
        <i class="bi bi-exclamation-triangle"></i>
        E-IMZO dasturi ishlamayapti. Iltimos, dasturni ishga tushiring.
      </div>

      <!-- Certificates Section -->
      <div class="row">
        <div class="col-md-6">
          <div class="card">
            <div
              class="card-header d-flex justify-content-between align-items-center"
            >
              <h5 class="mb-0">Sertifikatlar</h5>
              <button
                id="refreshCertificates"
                class="btn btn-outline-primary btn-sm"
              >
                <span class="loading-spinner"></span>
                Yangilash
              </button>
            </div>
            <div class="card-body" style="max-height: 400px; overflow-y: auto;">
              <div id="certificatesList">
                <div class="text-center text-muted py-4">
                  Sertifikatlar yuklanmoqda...
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Document Signing -->
        <div class="col-md-6">
          <div class="card">
            <div class="card-header">
              <h5 class="mb-0">Hujjatni Imzolash</h5>
            </div>
            <div class="card-body">
              <form id="signingForm">
                <div class="mb-3">
                  <label for="documentContent" class="form-label"
                    >Hujjat matni</label
                  >
                  <textarea
                    id="documentContent"
                    class="form-control"
                    rows="6"
                    placeholder="Imzolanishi kerak bo'lgan matnni kiriting..."
                    required
                  ></textarea>
                </div>

                <div class="mb-3">
                  <div class="form-check">
                    <input
                      class="form-check-input"
                      type="checkbox"
                      id="addTimestamp"
                    />
                    <label class="form-check-label" for="addTimestamp">
                      Vaqt tamg'asi qo'shish
                    </label>
                  </div>
                  <div class="form-check">
                    <input
                      class="form-check-input"
                      type="checkbox"
                      id="detachedSignature"
                    />
                    <label class="form-check-label" for="detachedSignature">
                      Ajratilgan imzo
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  id="signButton"
                  class="btn btn-success w-100"
                  disabled
                >
                  <span class="loading-spinner"></span>
                  Hujjatni Imzolash
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <!-- Results Section -->
      <div class="row mt-4">
        <div class="col-12">
          <div class="card">
            <div
              class="card-header d-flex justify-content-between align-items-center"
            >
              <h5 class="mb-0">Natijalar</h5>
              <div>
                <button
                  id="copyResult"
                  class="btn btn-outline-secondary btn-sm me-2"
                  disabled
                >
                  Nusxalash
                </button>
                <button id="clearResult" class="btn btn-outline-danger btn-sm">
                  Tozalash
                </button>
              </div>
            </div>
            <div class="card-body">
              <div id="resultArea" class="result-area">
                Natijalar bu yerda ko'rsatiladi...
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Statistics -->
      <div class="row mt-4">
        <div class="col-md-3">
          <div class="card text-center">
            <div class="card-body">
              <h4 id="totalCertificates" class="text-primary">0</h4>
              <p class="mb-0">Sertifikatlar</p>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card text-center">
            <div class="card-body">
              <h4 id="successfulSigns" class="text-success">0</h4>
              <p class="mb-0">Muvaffaqiyatli</p>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card text-center">
            <div class="card-body">
              <h4 id="failedSigns" class="text-danger">0</h4>
              <p class="mb-0">Xatolik</p>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card text-center">
            <div class="card-body">
              <h4 id="eimzoVersion" class="text-info">-</h4>
              <p class="mb-0">E-IMZO versiya</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Bootstrap JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>

    <!-- Main Application Script -->
    <script>
      // Global variables
      let selectedCertificate = null;
      let certificates = [];
      let statistics = {
        successful: 0,
        failed: 0
      };

      // DOM Elements
      const elements = {
        statusIndicator: document.getElementById('statusIndicator'),
        statusText: document.getElementById('statusText'),
        statusAlert: document.getElementById('statusAlert'),
        certificatesList: document.getElementById('certificatesList'),
        refreshCertificates: document.getElementById('refreshCertificates'),
        signingForm: document.getElementById('signingForm'),
        documentContent: document.getElementById('documentContent'),
        addTimestamp: document.getElementById('addTimestamp'),
        detachedSignature: document.getElementById('detachedSignature'),
        signButton: document.getElementById('signButton'),
        resultArea: document.getElementById('resultArea'),
        copyResult: document.getElementById('copyResult'),
        clearResult: document.getElementById('clearResult'),
        totalCertificates: document.getElementById('totalCertificates'),
        successfulSigns: document.getElementById('successfulSigns'),
        failedSigns: document.getElementById('failedSigns'),
        eimzoVersion: document.getElementById('eimzoVersion')
      };

      // E-IMZO Manager Class
      class EIMZOManager {
        constructor() {
          this.isInitialized = false;
          this.version = null;
        }

        // E-IMZO ni tekshirish va ishga tushirish
        async initialize() {
          try {
            await this.checkVersion();
            await this.installApiKeys();
            this.isInitialized = true;
            this.updateStatus(true);
            this.loadCertificates();
            this.log('E-IMZO muvaffaqiyatli ishga tushirildi');
          } catch (error) {
            this.updateStatus(false);
            this.log(
              'E-IMZO ishga tushirishda xatolik: ' + error.message,
              'error'
            );
          }
        }

        // Versiyani tekshirish
        checkVersion() {
          return new Promise((resolve, reject) => {
            if (typeof EIMZOClient === 'undefined') {
              reject(new Error('E-IMZO kutubxonasi yuklanmagan'));
              return;
            }

            EIMZOClient.checkVersion(
              (major, minor) => {
                this.version = `${major}.${minor}`;
                elements.eimzoVersion.textContent = this.version;
                this.log(`E-IMZO versiya ${this.version} aniqlandi`);
                resolve(this.version);
              },
              (error, reason) => {
                const message = reason || 'E-IMZO dasturi ishlamayapti';
                reject(new Error(message));
              }
            );
          });
        }

        // API kalitlarini o'rnatish
        installApiKeys() {
          return new Promise((resolve, reject) => {
            EIMZOClient.installApiKeys(
              () => {
                this.log("API kalitlar muvaffaqiyatli o'rnatildi");
                resolve();
              },
              (error, reason) => {
                reject(
                  new Error(reason || "API kalitlarini o'rnatishda xatolik")
                );
              }
            );
          });
        }

        // Sertifikatlarni yuklash
        loadCertificates() {
          if (!this.isInitialized) {
            this.log('E-IMZO ishga tushirilmagan', 'error');
            return;
          }

          this.showLoading(elements.refreshCertificates, true);

          EIMZOClient.listAllUserKeys(
            (cert, index) => `cert_${index}`,
            (id, cert) => ({
              id,
              name: cert.CN || "Noma'lum",
              organization: cert.O || '',
              tin: cert.TIN || '',
              serialNumber: cert.serialNumber,
              validFrom: cert.validFrom,
              validTo: cert.validTo,
              issuer: cert.issuer,
              type: cert.type
            }),
            certs => {
              certificates = certs;
              this.renderCertificates(certs);
              elements.totalCertificates.textContent = certs.length;
              this.log(`${certs.length} ta sertifikat topildi`);
              this.showLoading(elements.refreshCertificates, false);
            },
            (error, reason) => {
              this.log(
                'Sertifikatlarni yuklashda xatolik: ' +
                  (reason || "Noma'lum xatolik"),
                'error'
              );
              this.showLoading(elements.refreshCertificates, false);
            }
          );
        }

        // Sertifikatlarni HTML da ko'rsatish
        renderCertificates(certs) {
          if (certs.length === 0) {
            elements.certificatesList.innerHTML = `
                        <div class="text-center text-muted py-4">
                            <i class="bi bi-inbox"></i>
                            <p class="mb-0 mt-2">Sertifikat topilmadi</p>
                        </div>
                    `;
            return;
          }

          const html = certs
            .map(cert => {
              const isValid = new Date(cert.validTo) > new Date();
              const badgeClass = isValid ? 'bg-success' : 'bg-danger';
              const badgeText = isValid ? 'Amal qiladi' : 'Muddati tugagan';

              return `
                        <div class="certificate-card" data-cert-id="${cert.id}">
                            <div class="certificate-info">
                                <div>
                                    <div class="fw-bold">${cert.name}</div>
                                    <div class="text-muted small">${cert.organization}</div>
                                    <div class="text-muted small">TIN: ${cert.tin}</div>
                                </div>
                                <div>
                                    <span class="badge certificate-badge ${badgeClass}">${badgeText}</span>
                                </div>
                            </div>
                        </div>
                    `;
            })
            .join('');

          elements.certificatesList.innerHTML = html;

          // Sertifikat tanlash event handler
          elements.certificatesList.addEventListener('click', e => {
            const card = e.target.closest('.certificate-card');
            if (card) {
              this.selectCertificate(card.dataset.certId);
            }
          });
        }

        // Sertifikatni tanlash
        selectCertificate(certId) {
          // Oldingi tanlovni tozalash
          elements.certificatesList
            .querySelectorAll('.certificate-card')
            .forEach(card => {
              card.classList.remove('selected');
            });

          // Yangi tanlovni belgilash
          const selectedCard = elements.certificatesList.querySelector(
            `[data-cert-id="${certId}"]`
          );
          if (selectedCard) {
            selectedCard.classList.add('selected');
            selectedCertificate = certificates.find(cert => cert.id === certId);
            elements.signButton.disabled = false;
            this.log(`Sertifikat tanlandi: ${selectedCertificate.name}`);
          }
        }

        // Hujjatni imzolash
        async signDocument(content, options = {}) {
          if (!selectedCertificate) {
            throw new Error('Sertifikat tanlanmagan');
          }

          if (!content.trim()) {
            throw new Error("Hujjat matni bo'sh bo'lishi mumkin emas");
          }

          return new Promise((resolve, reject) => {
            // Sertifikatni yuklash
            EIMZOClient.loadKey(
              selectedCertificate,
              keyId => {
                // PKCS7 imzo yaratish
                EIMZOClient.createPkcs7(
                  keyId,
                  content,
                  options.timestamp ? 'http://timestamp.server' : null,
                  signature => {
                    const result = {
                      signature,
                      certificate: selectedCertificate,
                      timestamp: options.timestamp
                        ? new Date().toISOString()
                        : null,
                      detached: options.detached || false
                    };
                    resolve(result);
                  },
                  (error, reason) => {
                    reject(new Error(reason || 'Imzolashda xatolik'));
                  },
                  options.detached || false,
                  false
                );
              },
              (error, reason) => {
                reject(new Error(reason || 'Kalitni yuklashda xatolik'));
              }
            );
          });
        }

        // Statusni yangilash
        updateStatus(isOnline) {
          if (isOnline) {
            elements.statusIndicator.className =
              'status-indicator status-online';
            elements.statusText.textContent = `E-IMZO: Online (v${this.version || 'Unknown'})`;
            elements.statusAlert.classList.add('d-none');
          } else {
            elements.statusIndicator.className =
              'status-indicator status-offline';
            elements.statusText.textContent = 'E-IMZO: Offline';
            elements.statusAlert.classList.remove('d-none');
          }
        }

        // Loading indicator
        showLoading(button, show) {
          const spinner = button.querySelector('.loading-spinner');
          if (spinner) {
            spinner.style.display = show ? 'inline-block' : 'none';
          }
          button.disabled = show;
        }

        // Log ma'lumotlarini ko'rsatish
        log(message, type = 'info') {
          const timestamp = new Date().toLocaleTimeString();
          const prefix =
            type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';

          const logMessage = `[${timestamp}] ${prefix} ${message}\n`;
          elements.resultArea.textContent += logMessage;
          elements.resultArea.scrollTop = elements.resultArea.scrollHeight;

          console.log(`[EIMZO] ${message}`);
        }

        // Statistikani yangilash
        updateStatistics(success) {
          if (success) {
            statistics.successful++;
            elements.successfulSigns.textContent = statistics.successful;
          } else {
            statistics.failed++;
            elements.failedSigns.textContent = statistics.failed;
          }
        }
      }

      // E-IMZO Manager instance
      const eimzoManager = new EIMZOManager();

      // Event Listeners
      document.addEventListener('DOMContentLoaded', () => {
        // E-IMZO ni ishga tushirish
        eimzoManager.initialize();

        // Sertifikatlarni yangilash
        elements.refreshCertificates.addEventListener('click', () => {
          eimzoManager.loadCertificates();
        });

        // Hujjatni imzolash
        elements.signingForm.addEventListener('submit', async e => {
          e.preventDefault();

          const content = elements.documentContent.value.trim();
          const options = {
            timestamp: elements.addTimestamp.checked,
            detached: elements.detachedSignature.checked
          };

          if (!content) {
            eimzoManager.log(
              "Hujjat matni bo'sh bo'lishi mumkin emas",
              'error'
            );
            return;
          }

          if (!selectedCertificate) {
            eimzoManager.log('Iltimos, sertifikatni tanlang', 'error');
            return;
          }

          try {
            eimzoManager.showLoading(elements.signButton, true);
            eimzoManager.log('Hujjat imzolanmoqda...');

            const result = await eimzoManager.signDocument(content, options);

            eimzoManager.log('Hujjat muvaffaqiyatli imzolandi', 'success');
            eimzoManager.updateStatistics(true);

            // Natijani ko'rsatish
            const output = {
              success: true,
              timestamp: new Date().toISOString(),
              signature: result.signature,
              certificate: {
                name: result.certificate.name,
                organization: result.certificate.organization,
                tin: result.certificate.tin,
                validTo: result.certificate.validTo
              },
              options: options,
              originalContent: content
            };

            elements.resultArea.textContent +=
              '\n' + JSON.stringify(output, null, 2) + '\n';
            elements.copyResult.disabled = false;
          } catch (error) {
            eimzoManager.log('Imzolashda xatolik: ' + error.message, 'error');
            eimzoManager.updateStatistics(false);
          } finally {
            eimzoManager.showLoading(elements.signButton, false);
          }
        });

        // Natijani nusxalash
        elements.copyResult.addEventListener('click', () => {
          navigator.clipboard
            .writeText(elements.resultArea.textContent)
            .then(() => {
              eimzoManager.log('Natija clipboard ga nusxalandi', 'success');
            })
            .catch(() => {
              eimzoManager.log('Nusxalashda xatolik', 'error');
            });
        });

        // Natijani tozalash
        elements.clearResult.addEventListener('click', () => {
          elements.resultArea.textContent =
            "Natijalar bu yerda ko'rsatiladi...\n";
          elements.copyResult.disabled = true;
          eimzoManager.log('Natijalar tozalandi');
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', e => {
          // Ctrl+Enter - imzolash
          if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            if (!elements.signButton.disabled) {
              elements.signingForm.dispatchEvent(new Event('submit'));
            }
          }

          // F5 - sertifikatlarni yangilash
          if (e.key === 'F5') {
            e.preventDefault();
            eimzoManager.loadCertificates();
          }
        });
      });

      // Error handling
      window.addEventListener('error', e => {
        eimzoManager.log(`JavaScript xatoligi: ${e.message}`, 'error');
      });

      window.addEventListener('unhandledrejection', e => {
        eimzoManager.log(`Promise xatoligi: ${e.reason}`, 'error');
      });

      // Auto-retry connection
      setInterval(() => {
        if (!eimzoManager.isInitialized) {
          eimzoManager.initialize();
        }
      }, 30000); // 30 soniyada bir marta
    </script>
  </body>
</html>
```

## Oddiy Integratsiya Misoli

```html
<!DOCTYPE html>
<html lang="uz">
  <head>
    <meta charset="UTF-8" />
    <title>Oddiy E-IMZO</title>
    <script src="https://unpkg.com/imzo-agnost@latest/dist/index.umd.js"></script>
  </head>
  <body>
    <h1>E-IMZO Test</h1>

    <div id="status">Tekshirilmoqda...</div>

    <div>
      <h3>Sertifikatlar:</h3>
      <select id="certificates" disabled>
        <option>Yuklanmoqda...</option>
      </select>
    </div>

    <div>
      <h3>Imzolash:</h3>
      <textarea
        id="content"
        placeholder="Matn kiriting..."
        rows="4"
        cols="50"
        disabled
      ></textarea
      ><br />
      <button id="signBtn" disabled>Imzolash</button>
    </div>

    <div>
      <h3>Natija:</h3>
      <textarea id="result" rows="6" cols="50" readonly></textarea>
    </div>

    <script>
      let selectedCert = null;
      let isInitialized = false;

      // E-IMZO ni tekshirish
      function checkEIMZO() {
        EIMZOClient.checkVersion(
          (major, minor) => {
            document.getElementById('status').textContent =
              `E-IMZO ${major}.${minor} ishlamoqda`;
            installApiKeys();
          },
          (error, reason) => {
            document.getElementById('status').textContent =
              'E-IMZO ishlamayapti: ' + reason;
          }
        );
      }

      // API kalitlarni o'rnatish
      function installApiKeys() {
        EIMZOClient.installApiKeys(
          () => {
            isInitialized = true;
            loadCertificates();
          },
          (error, reason) => {
            document.getElementById('status').textContent =
              'API kalitlar xatoligi: ' + reason;
          }
        );
      }

      // Sertifikatlarni yuklash
      function loadCertificates() {
        const select = document.getElementById('certificates');

        EIMZOClient.listAllUserKeys(
          (cert, index) => `cert_${index}`,
          (id, cert) => ({ id, name: cert.CN, cert }),
          certificates => {
            select.innerHTML = '<option value="">Sertifikatni tanlang</option>';

            certificates.forEach(item => {
              const option = document.createElement('option');
              option.value = item.id;
              option.textContent = item.name;
              option.dataset.cert = JSON.stringify(item.cert);
              select.appendChild(option);
            });

            select.disabled = false;
            document.getElementById('content').disabled = false;
          },
          (error, reason) => {
            select.innerHTML = '<option>Xatolik: ' + reason + '</option>';
          }
        );
      }

      // Sertifikat tanlash
      document.getElementById('certificates').addEventListener('change', e => {
        if (e.target.value) {
          selectedCert = JSON.parse(e.target.selectedOptions[0].dataset.cert);
          document.getElementById('signBtn').disabled = false;
        } else {
          selectedCert = null;
          document.getElementById('signBtn').disabled = true;
        }
      });

      // Imzolash
      document.getElementById('signBtn').addEventListener('click', () => {
        const content = document.getElementById('content').value;

        if (!content.trim()) {
          alert('Matn kiriting!');
          return;
        }

        document.getElementById('signBtn').disabled = true;
        document.getElementById('signBtn').textContent = 'Imzolanmoqda...';

        EIMZOClient.loadKey(
          selectedCert,
          keyId => {
            EIMZOClient.createPkcs7(
              keyId,
              content,
              null, // timestamp server
              signature => {
                document.getElementById('result').value = signature;
                document.getElementById('signBtn').disabled = false;
                document.getElementById('signBtn').textContent = 'Imzolash';
                alert('Muvaffaqiyatli imzolandi!');
              },
              (error, reason) => {
                document.getElementById('result').value = 'Xatolik: ' + reason;
                document.getElementById('signBtn').disabled = false;
                document.getElementById('signBtn').textContent = 'Imzolash';
              },
              false, // detached
              false // base64
            );
          },
          (error, reason) => {
            alert('Kalit yuklashda xatolik: ' + reason);
            document.getElementById('signBtn').disabled = false;
            document.getElementById('signBtn').textContent = 'Imzolash';
          }
        );
      });

      // Boshlash
      checkEIMZO();
    </script>
  </body>
</html>
```

## ES Modules bilan

```html
<!DOCTYPE html>
<html lang="uz">
  <head>
    <meta charset="UTF-8" />
    <title>E-IMZO ES Modules</title>
  </head>
  <body>
    <div id="app">
      <h1>E-IMZO ES Modules</h1>
      <button id="checkBtn">E-IMZO ni tekshirish</button>
      <div id="output"></div>
    </div>

    <script type="module">
      import EIMZOClient from 'https://unpkg.com/imzo-agnost@latest/dist/index.esm.js';

      class EIMZOApp {
        constructor() {
          this.output = document.getElementById('output');
          this.setupEventListeners();
        }

        setupEventListeners() {
          document.getElementById('checkBtn').addEventListener('click', () => {
            this.checkEIMZO();
          });
        }

        log(message) {
          this.output.innerHTML += `<p>${new Date().toLocaleTimeString()}: ${message}</p>`;
        }

        async checkEIMZO() {
          try {
            this.log('E-IMZO tekshirilmoqda...');

            const version = await this.getVersion();
            this.log(`E-IMZO versiya ${version} topildi`);

            await this.installKeys();
            this.log("API kalitlar o'rnatildi");

            const certificates = await this.getCertificates();
            this.log(`${certificates.length} ta sertifikat topildi`);

            certificates.forEach((cert, index) => {
              this.log(`${index + 1}. ${cert.name}`);
            });
          } catch (error) {
            this.log(`Xatolik: ${error.message}`);
          }
        }

        getVersion() {
          return new Promise((resolve, reject) => {
            EIMZOClient.checkVersion(
              (major, minor) => resolve(`${major}.${minor}`),
              (error, reason) => reject(new Error(reason))
            );
          });
        }

        installKeys() {
          return new Promise((resolve, reject) => {
            EIMZOClient.installApiKeys(
              () => resolve(),
              (error, reason) => reject(new Error(reason))
            );
          });
        }

        getCertificates() {
          return new Promise((resolve, reject) => {
            EIMZOClient.listAllUserKeys(
              (cert, index) => `cert_${index}`,
              (id, cert) => ({ id, name: cert.CN || "Noma'lum", cert }),
              certificates => resolve(certificates),
              (error, reason) => reject(new Error(reason))
            );
          });
        }
      }

      // App ni ishga tushirish
      new EIMZOApp();
    </script>
  </body>
</html>
```

## Webpack/Vite bilan

```javascript
// main.js
import EIMZOClient from 'imzo-agnost';

class EIMZOService {
  constructor() {
    this.isReady = false;
    this.certificates = [];
  }

  async init() {
    try {
      await this.checkVersion();
      await this.installApiKeys();
      await this.loadCertificates();
      this.isReady = true;
      console.log('E-IMZO service ready');
    } catch (error) {
      console.error('E-IMZO init failed:', error);
    }
  }

  checkVersion() {
    return new Promise((resolve, reject) => {
      EIMZOClient.checkVersion(
        (major, minor) => {
          this.version = `${major}.${minor}`;
          resolve(this.version);
        },
        (error, reason) => reject(new Error(reason))
      );
    });
  }

  installApiKeys() {
    return new Promise((resolve, reject) => {
      EIMZOClient.installApiKeys(
        () => resolve(),
        (error, reason) => reject(new Error(reason))
      );
    });
  }

  loadCertificates() {
    return new Promise((resolve, reject) => {
      EIMZOClient.listAllUserKeys(
        (cert, index) => `cert_${index}`,
        (id, cert) => ({
          id,
          name: cert.CN,
          organization: cert.O,
          tin: cert.TIN,
          validTo: cert.validTo,
          cert
        }),
        certificates => {
          this.certificates = certificates;
          resolve(certificates);
        },
        (error, reason) => reject(new Error(reason))
      );
    });
  }

  async signData(certificateId, data, options = {}) {
    const certificate = this.certificates.find(c => c.id === certificateId);
    if (!certificate) {
      throw new Error('Certificate not found');
    }

    return new Promise((resolve, reject) => {
      EIMZOClient.loadKey(
        certificate.cert,
        keyId => {
          EIMZOClient.createPkcs7(
            keyId,
            data,
            options.timestamp ? 'http://timestamp.server' : null,
            signature =>
              resolve({
                signature,
                certificate: certificate,
                timestamp: new Date().toISOString()
              }),
            (error, reason) => reject(new Error(reason)),
            options.detached || false,
            false
          );
        },
        (error, reason) => reject(new Error(reason))
      );
    });
  }
}

// Usage
const eimzoService = new EIMZOService();

// DOM ready
document.addEventListener('DOMContentLoaded', async () => {
  await eimzoService.init();

  // UI logic here
  if (eimzoService.isReady) {
    console.log('Certificates:', eimzoService.certificates);
  }
});

export default eimzoService;
```

Bu vanilla JavaScript integratsiya misollar `imzo-agnost` kutubxonasini har
qanday JavaScript loyihasida professional darajada ishlatishning to'liq
yo'llarini ko'rsatadi.
