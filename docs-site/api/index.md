# API Reference

`imzo-agnost` kutubxonasining to'liq API ma'lumotnomasi va fayl imzolash
misollari.

## Core Classes

### EIMZOClient

Asosiy E-IMZO client klassi barcha funksiyalarni ta'minlaydi.

```typescript
import EIMZOClient from 'imzo-agnost';
```

#### Static Methods

##### checkVersion()

E-IMZO dasturining versiyasini tekshiradi.

```typescript
EIMZOClient.checkVersion(
  (major: string, minor: string) => {
    console.log(`E-IMZO v${major}.${minor} topildi`);
  },
  (error: any, reason: string | null) => {
    console.error('E-IMZO topilmadi:', reason);
  }
);
```

##### installApiKeys()

E-IMZO API kalitlarini o'rnatadi.

```typescript
EIMZOClient.installApiKeys(
  () => {
    console.log("API kalitlar o'rnatildi");
  },
  (error: any, reason: string | null) => {
    console.error('Xatolik:', reason);
  }
);
```

##### listAllUserKeys()

Barcha foydalanuvchi kalitlarini ro'yxatini oladi.

```typescript
EIMZOClient.listAllUserKeys(
  // ID generator function
  (cert: any, index: number) => `cert_${index}`,

  // UI generator function
  (id: string, cert: any) => ({
    id,
    name: cert.CN || "Noma'lum",
    organization: cert.O || '',
    tin: cert.TIN || '',
    serialNumber: cert.serialNumber,
    validFrom: cert.validFrom,
    validTo: cert.validTo,
    isValid: new Date(cert.validTo) > new Date()
  }),

  // Success callback
  (certificates: any[]) => {
    console.log('Sertifikatlar:', certificates);
  },

  // Error callback
  (error: any, reason: string | null) => {
    console.error('Xatolik:', reason);
  }
);
```

##### loadKey()

Sertifikatni yuklaydi va kalitni aktiv qiladi.

```typescript
EIMZOClient.loadKey(
  certificate, // sertifikat obyekti
  (keyId: string) => {
    console.log('Kalit yuklandi:', keyId);
  },
  (error: any, reason: string | null) => {
    console.error('Kalit yuklanmadi:', reason);
  }
);
```

##### createPkcs7()

PKCS#7 formatida raqamli imzo yaratadi.

```typescript
EIMZOClient.createPkcs7(
  keyId, // yuklangan kalit ID si
  data, // imzolanishi kerak bo'lgan ma'lumot
  timestampServer, // timestamp server URL (null bo'lishi mumkin)
  (signature: string) => {
    console.log('Imzo yaratildi:', signature);
  },
  (error: any, reason: string | null) => {
    console.error('Imzolashda xatolik:', reason);
  },
  false, // detached (ajratilgan imzo)
  false // base64 encoding
);
```

## Plugin System

### Available Plugins

#### CertKeyPlugin

Sertifikat va kalit boshqaruvi.

```typescript
import { eimzoApi } from 'imzo-agnost';

// Sertifikat ma'lumotlarini olish
eimzoApi.certkey.getCertificateInfo(
  certificate,
  info => console.log('Sertifikat:', info),
  (error, reason) => console.error('Xatolik:', reason)
);

// Kalit yuklash
eimzoApi.certkey.loadKey(
  certificate,
  keyId => console.log('Kalit ID:', keyId),
  (error, reason) => console.error('Xatolik:', reason)
);
```

#### CipherPlugin

Shifrlash va deshifrlash operatsiyalari.

```typescript
// Ma'lumotni shifrlash
eimzoApi.cipher.encrypt(
  keyId,
  data,
  encryptedData => console.log('Shifrlangan:', encryptedData),
  (error, reason) => console.error('Xatolik:', reason)
);

// Ma'lumotni deshifrlash
eimzoApi.cipher.decrypt(
  keyId,
  encryptedData,
  decryptedData => console.log('Deshifrlangan:', decryptedData),
  (error, reason) => console.error('Xatolik:', reason)
);
```

#### PKCS7Plugin

PKCS#7 imzo operatsiyalari.

```typescript
// Imzo yaratish
eimzoApi.pkcs7.sign(
  keyId,
  data,
  false, // detached
  signature => console.log('Imzo:', signature),
  (error, reason) => console.error('Xatolik:', reason)
);

// Imzoni tekshirish
eimzoApi.pkcs7.verify(
  signature,
  originalData,
  isValid => console.log("Imzo to'g'ri:", isValid),
  (error, reason) => console.error('Xatolik:', reason)
);
```

#### FileIOPlugin

Fayl operatsiyalari va fayl imzolash.

```typescript
// Faylni o'qish
eimzoApi.fileio.readFile(
  filePath,
  fileContent => console.log('Fayl mazmuni:', fileContent),
  (error, reason) => console.error('Xatolik:', reason)
);

// Faylga yozish
eimzoApi.fileio.writeFile(
  filePath,
  content,
  () => console.log('Fayl saqlandi'),
  (error, reason) => console.error('Xatolik:', reason)
);

// Fayl imzolash
eimzoApi.fileio.signFile(
  keyId,
  filePath,
  outputPath,
  result => console.log('Fayl imzolandi:', result),
  (error, reason) => console.error('Xatolik:', reason)
);
```

#### X509Plugin

X.509 sertifikat operatsiyalari.

```typescript
// Sertifikat ma'lumotlarini parsing qilish
eimzoApi.x509.parseCertificate(
  certificateData,
  parsed => console.log('Parsed:', parsed),
  (error, reason) => console.error('Xatolik:', reason)
);

// Sertifikat zanjirini tekshirish
eimzoApi.x509.validateChain(
  certificates,
  isValid => console.log("Zanjir to'g'ri:", isValid),
  (error, reason) => console.error('Xatolik:', reason)
);
```

#### YTKSPlugin

YTKS format bilan ishlash.

```typescript
// Disklarni ro'yxatlash
eimzoApi.ytks.listDisks(
  result => console.log('Disklar:', result.disks),
  (error, reason) => console.error('Xatolik:', reason)
);

// Sertifikatlarni ro'yxatlash
eimzoApi.ytks.listCertificates(
  disk,
  result => console.log('Sertifikatlar:', result.certificates),
  (error, reason) => console.error('Xatolik:', reason)
);

// Kalitni yuklash
eimzoApi.ytks.loadKey(
  disk,
  path,
  name,
  alias,
  result => console.log('Kalit ID:', result.keyId),
  (error, reason) => console.error('Xatolik:', reason)
);

// Parolni o'zgartirish
eimzoApi.ytks.changePassword(
  disk,
  path,
  name,
  oldPassword,
  newPassword,
  success => console.log("Parol o'zgartirildi:", success),
  (error, reason) => console.error('Xatolik:', reason)
);
```

#### PFXPlugin

PFX/P12 format bilan ishlash.

```typescript
// PFX faylni yuklash
eimzoApi.pfx.loadPfx(
  filePath,
  password,
  result => console.log('PFX yuklandi:', result),
  (error, reason) => console.error('Xatolik:', reason)
);

// PFX dan sertifikat olish
eimzoApi.pfx.extractCertificate(
  pfxData,
  certificate => console.log('Sertifikat:', certificate),
  (error, reason) => console.error('Xatolik:', reason)
);
```

#### CRLPlugin

Certificate Revocation List (CRL) operatsiyalari.

```typescript
// CRL yuklash
eimzoApi.crl.loadCrl(
  crlUrl,
  crl => console.log('CRL yuklandi:', crl),
  (error, reason) => console.error('Xatolik:', reason)
);

// Sertifikat bekor qilinganligini tekshirish
eimzoApi.crl.checkRevocation(
  certificate,
  crl,
  isRevoked => console.log('Bekor qilingan:', isRevoked),
  (error, reason) => console.error('Xatolik:', reason)
);
```

#### TSAClientPlugin

Timestamp Authority (TSA) operatsiyalari.

```typescript
// Timestamp token olish
eimzoApi.tsaclient.getTimestamp(
  data,
  tsaUrl,
  token => console.log('Timestamp:', token),
  (error, reason) => console.error('Xatolik:', reason)
);

// Timestamp ni tekshirish
eimzoApi.tsaclient.verifyTimestamp(
  token,
  originalData,
  isValid => console.log("Timestamp to'g'ri:", isValid),
  (error, reason) => console.error('Xatolik:', reason)
);
```

## Complete File Signing Examples

### PDF faylni imzolash

```typescript
import EIMZOClient, { eimzoApi } from 'imzo-agnost';

async function signPdfFile(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    // 1. E-IMZO versiyasini tekshirish
    EIMZOClient.checkVersion(
      (major, minor) => {
        console.log(`E-IMZO ${major}.${minor} topildi`);

        // 2. API kalitlarini o'rnatish
        EIMZOClient.installApiKeys(
          () => {
            console.log("API kalitlar o'rnatildi");

            // 3. Sertifikatlarni ro'yxatlash
            EIMZOClient.listAllUserKeys(
              (cert, idx) => `cert_${idx}`,
              (id, cert) => ({ id, cert, name: cert.CN }),
              certificates => {
                if (certificates.length === 0) {
                  reject(new Error('Sertifikat topilmadi'));
                  return;
                }

                const firstCert = certificates[0];
                console.log('Tanlangan sertifikat:', firstCert.name);

                // 4. Kalitni yuklash
                EIMZOClient.loadKey(
                  firstCert.cert,
                  keyId => {
                    console.log('Kalit yuklandi:', keyId);

                    // 5. Faylni o'qish
                    eimzoApi.fileio.readFile(
                      filePath,
                      fileContent => {
                        console.log("Fayl o'qildi");

                        // 6. PKCS#7 imzo yaratish
                        EIMZOClient.createPkcs7(
                          keyId,
                          fileContent,
                          null, // timestamp server
                          signature => {
                            console.log('Imzo yaratildi');

                            // 7. Imzolangan faylni saqlash
                            const signedFilePath = filePath.replace(
                              '.pdf',
                              '_signed.pdf'
                            );
                            const signedContent =
                              fileContent + '\n' + signature;

                            eimzoApi.fileio.writeFile(
                              signedFilePath,
                              signedContent,
                              () => {
                                console.log(
                                  'Imzolangan fayl saqlandi:',
                                  signedFilePath
                                );
                                resolve(signedFilePath);
                              },
                              (error, reason) => {
                                reject(new Error(`Fayl saqlanmadi: ${reason}`));
                              }
                            );
                          },
                          (error, reason) => {
                            reject(new Error(`Imzolashda xatolik: ${reason}`));
                          }
                        );
                      },
                      (error, reason) => {
                        reject(new Error(`Fayl o'qilmadi: ${reason}`));
                      }
                    );
                  },
                  (error, reason) => {
                    reject(new Error(`Kalit yuklanmadi: ${reason}`));
                  }
                );
              },
              (error, reason) => {
                reject(new Error(`Sertifikatlar topilmadi: ${reason}`));
              }
            );
          },
          (error, reason) => {
            reject(new Error(`API kalitlar o'rnatilmadi: ${reason}`));
          }
        );
      },
      (error, reason) => {
        reject(new Error(`E-IMZO topilmadi: ${reason}`));
      }
    );
  });
}

// Ishlatish
signPdfFile('/path/to/document.pdf')
  .then(signedPath => {
    console.log('✅ Fayl muvaffaqiyatli imzolandi:', signedPath);
  })
  .catch(error => {
    console.error('❌ Xatolik:', error.message);
  });
```

### Word hujjatini imzolash

```typescript
async function signWordDocument(filePath: string): Promise<void> {
  // Sertifikatni tanlash
  const certificates = await new Promise<any[]>(resolve => {
    EIMZOClient.listAllUserKeys(
      (cert, idx) => `cert_${idx}`,
      (id, cert) => ({ id, cert, name: cert.CN, org: cert.O }),
      resolve,
      () => resolve([])
    );
  });

  if (certificates.length === 0) {
    throw new Error('Sertifikat topilmadi');
  }

  // Eng yaxshi sertifikatni tanlash
  const selectedCert =
    certificates.find(
      c => c.cert.validTo > new Date() && c.cert.type === 'pfx'
    ) || certificates[0];

  // Kalitni yuklash
  const keyId = await new Promise<string>((resolve, reject) => {
    EIMZOClient.loadKey(selectedCert.cert, resolve, (error, reason) =>
      reject(new Error(reason || 'Kalit yuklanmadi'))
    );
  });

  // Faylni o'qish
  const fileContent = await new Promise<string>((resolve, reject) => {
    eimzoApi.fileio.readFile(filePath, resolve, (error, reason) =>
      reject(new Error(reason || "Fayl o'qilmadi"))
    );
  });

  // Imzolash
  const signature = await new Promise<string>((resolve, reject) => {
    EIMZOClient.createPkcs7(
      keyId,
      fileContent,
      'http://timestamp.server.uz', // timestamp
      resolve,
      (error, reason) => reject(new Error(reason || 'Imzolashda xatolik'))
    );
  });

  // Imzolangan faylni saqlash
  const outputPath = filePath.replace(/\.(docx?)$/, '_signed.$1');
  await new Promise<void>((resolve, reject) => {
    eimzoApi.fileio.writeFile(
      outputPath,
      JSON.stringify(
        {
          originalFile: filePath,
          content: fileContent,
          signature: signature,
          certificate: selectedCert.cert,
          timestamp: new Date().toISOString()
        },
        null,
        2
      ),
      resolve,
      (error, reason) => reject(new Error(reason || 'Fayl saqlanmadi'))
    );
  });

  console.log(`Hujjat imzolandi: ${outputPath}`);
}
```

### Excel faylini imzolash

```typescript
interface SignedExcelFile {
  originalPath: string;
  signedPath: string;
  signature: string;
  certificate: any;
  timestamp: string;
}

async function signExcelFile(filePath: string): Promise<SignedExcelFile> {
  // E-IMZO ni tekshirish va ishga tushirish
  await initializeEIMZO();

  // Foydalanuvchiga sertifikat tanlash imkoniyati
  const certificate = await selectCertificateInteractive();

  // Kalitni yuklash
  const keyId = await loadCertificateKey(certificate);

  // Excel faylni o'qish
  const excelData = await readExcelFile(filePath);

  // Ma'lumotlarni imzolash
  const signature = await signData(keyId, excelData);

  // Imzolangan faylni saqlash
  const signedPath = await saveSignedExcel(
    filePath,
    excelData,
    signature,
    certificate
  );

  return {
    originalPath: filePath,
    signedPath,
    signature,
    certificate,
    timestamp: new Date().toISOString()
  };
}

// Yordamchi funksiyalar
async function initializeEIMZO(): Promise<void> {
  const versionCheck = await new Promise<boolean>(resolve => {
    EIMZOClient.checkVersion(
      () => resolve(true),
      () => resolve(false)
    );
  });

  if (!versionCheck) {
    throw new Error('E-IMZO dasturi ishlamayapti');
  }

  const keysInstalled = await new Promise<boolean>(resolve => {
    EIMZOClient.installApiKeys(
      () => resolve(true),
      () => resolve(false)
    );
  });

  if (!keysInstalled) {
    throw new Error("API kalitlar o'rnatilmadi");
  }
}

async function selectCertificateInteractive(): Promise<any> {
  const certificates = await new Promise<any[]>(resolve => {
    EIMZOClient.listAllUserKeys(
      (cert, idx) => `cert_${idx}`,
      (id, cert) => ({
        id,
        cert,
        name: cert.CN,
        organization: cert.O,
        validTo: cert.validTo,
        isValid: new Date(cert.validTo) > new Date()
      }),
      resolve,
      () => resolve([])
    );
  });

  // Amal qiluvchi sertifikatlarni filterlash
  const validCerts = certificates.filter(c => c.isValid);

  if (validCerts.length === 0) {
    throw new Error('Amal qiluvchi sertifikat topilmadi');
  }

  // Birinchi amal qiluvchi sertifikatni qaytarish
  return validCerts[0].cert;
}

async function loadCertificateKey(certificate: any): Promise<string> {
  return new Promise((resolve, reject) => {
    EIMZOClient.loadKey(certificate, resolve, (error, reason) =>
      reject(new Error(reason || 'Kalit yuklanmadi'))
    );
  });
}

async function readExcelFile(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    eimzoApi.fileio.readFile(filePath, resolve, (error, reason) =>
      reject(new Error(reason || "Excel fayl o'qilmadi"))
    );
  });
}

async function signData(keyId: string, data: string): Promise<string> {
  return new Promise((resolve, reject) => {
    EIMZOClient.createPkcs7(
      keyId,
      data,
      'http://timestamp.server.uz',
      resolve,
      (error, reason) => reject(new Error(reason || 'Imzolashda xatolik'))
    );
  });
}

async function saveSignedExcel(
  originalPath: string,
  data: string,
  signature: string,
  certificate: any
): Promise<string> {
  const signedPath = originalPath.replace(/\.xlsx?$/, '_signed.json');

  const signedData = {
    originalFile: originalPath,
    data: data,
    signature: signature,
    certificate: {
      name: certificate.CN,
      organization: certificate.O,
      serialNumber: certificate.serialNumber,
      validTo: certificate.validTo
    },
    signedAt: new Date().toISOString()
  };

  return new Promise((resolve, reject) => {
    eimzoApi.fileio.writeFile(
      signedPath,
      JSON.stringify(signedData, null, 2),
      () => resolve(signedPath),
      (error, reason) =>
        reject(new Error(reason || 'Imzolangan fayl saqlanmadi'))
    );
  });
}
```

## Error Handling

### Common Error Patterns

```typescript
// Xatoliklarni to'g'ri boshqarish
function handleEIMZOError(error: any, reason: string | null): never {
  if (reason?.includes('E-IMZO not found')) {
    throw new Error("E-IMZO dasturi o'rnatilmagan yoki ishlamayapti");
  }

  if (reason?.includes('certificate')) {
    throw new Error('Sertifikat muammosi: ' + reason);
  }

  if (reason?.includes('password')) {
    throw new Error("Noto'g'ri parol");
  }

  if (reason?.includes('network')) {
    throw new Error('Tarmoq xatoligi: ' + reason);
  }

  throw new Error(reason || "Noma'lum xatolik");
}

// Retry mexanizmi
async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }

      console.warn(`Attempt ${attempt} failed, retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2; // exponential backoff
    }
  }

  throw new Error('Bu yerga hech qachon yetmaslik kerak');
}
```

## TypeScript Interfaces

```typescript
// Sertifikat ma'lumotlari
interface CertificateInfo {
  CN: string; // Common Name
  O: string; // Organization
  TIN: string; // Tax Identification Number
  serialNumber: string; // Serial Number
  validFrom: Date; // Valid From
  validTo: Date; // Valid To
  issuer: string; // Issuer
  type: 'pfx' | 'ytks'; // Certificate Type
}

// Imzo natijasi
interface SignatureResult {
  signature: string; // PKCS#7 imzo
  certificate: CertificateInfo;
  timestamp?: string; // Timestamp (agar mavjud bo'lsa)
  algorithm: string; // Imzo algoritmi
}

// Fayl ma'lumotlari
interface FileSignatureInfo {
  filePath: string; // Fayl yo'li
  fileSize: number; // Fayl hajmi
  signature: string; // Fayl imzosi
  checksum: string; // Fayl checksum
  signedAt: Date; // Imzolangan vaqt
}
```

## Framework Integration

- **[Vue.js Integration](/examples/vue)** - Vue 3 Composition API va Nuxt.js
- **[React Integration](/examples/react)** - React hooks va Next.js
- **[Angular Integration](/examples/angular)** - Angular services va components
- **[Vanilla JavaScript](/examples/vanilla)** - Browser va ES modules
- **[Node.js Integration](/examples/nodejs)** - Express.js, Fastify, NestJS

Bu to'liq API ma'lumotnomasi barcha plugin metodlari va fayl imzolash misollari
bilan birga `imzo-agnost` kutubxonasining barcha imkoniyatlarini ko'rsatadi.
