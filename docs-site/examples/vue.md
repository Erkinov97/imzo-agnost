# Vue.js Integration

Bu sahifada `imzo-agnost` kutubxonasini Vue.js aplikatsiyalarida qanday
ishlatish ko'rsatilgan.

## O'rnatish

```bash
# npm
npm install imzo-agnost

# pnpm (tavsiya qilinadi)
pnpm add imzo-agnost

# yarn
yarn add imzo-agnost
```

## Vue 3 Composition API

### 1. Composable yaratish

```typescript
// composables/useEimzo.ts
import { ref, reactive } from 'vue';
import EIMZOClient from 'imzo-agnost';

export function useEimzo() {
  const isAvailable = ref(false);
  const version = ref('');
  const certificates = ref([]);
  const loading = ref(false);
  const error = ref('');

  // E-IMZO mavjudligini tekshirish
  const checkEimzo = async () => {
    loading.value = true;
    error.value = '';

    return new Promise(resolve => {
      EIMZOClient.checkVersion(
        (major, minor) => {
          version.value = `${major}.${minor}`;
          isAvailable.value = true;

          // API kalitlarini o'rnatish
          EIMZOClient.installApiKeys(
            () => {
              loading.value = false;
              resolve(true);
            },
            (err, reason) => {
              error.value = reason || 'API keys installation failed';
              loading.value = false;
              resolve(false);
            }
          );
        },
        (err, reason) => {
          error.value = reason || 'E-IMZO not available';
          isAvailable.value = false;
          loading.value = false;
          resolve(false);
        }
      );
    });
  };

  // Sertifikatlar ro'yxatini olish
  const listCertificates = async () => {
    if (!isAvailable.value) {
      error.value = 'E-IMZO is not available';
      return;
    }

    loading.value = true;

    return new Promise(resolve => {
      EIMZOClient.listAllUserKeys(
        (cert, idx) => `cert_${idx}`,
        (id, cert) => ({
          id,
          name: cert.CN || "Noma'lum sertifikat",
          organization: cert.O || '',
          tin: cert.TIN || '',
          validFrom: cert.validFrom,
          validTo: cert.validTo,
          type: cert.type,
          isValid: cert.validTo > new Date(),
          cert
        }),
        certs => {
          certificates.value = certs;
          loading.value = false;
          resolve(certs);
        },
        (err, reason) => {
          error.value = reason || 'Failed to list certificates';
          loading.value = false;
          resolve([]);
        }
      );
    });
  };

  // Hujjatni imzolash
  const signDocument = async (certificateData, content) => {
    loading.value = true;

    return new Promise(resolve => {
      EIMZOClient.loadKey(
        certificateData.cert,
        keyId => {
          EIMZOClient.createPkcs7(
            keyId,
            content,
            null, // timestamp server
            signature => {
              loading.value = false;
              resolve({ success: true, signature });
            },
            (err, reason) => {
              error.value = reason || 'Signing failed';
              loading.value = false;
              resolve({ success: false, error: reason });
            }
          );
        },
        (err, reason) => {
          error.value = reason || 'Key loading failed';
          loading.value = false;
          resolve({ success: false, error: reason });
        }
      );
    });
  };

  return {
    // State
    isAvailable,
    version,
    certificates,
    loading,
    error,

    // Methods
    checkEimzo,
    listCertificates,
    signDocument
  };
}
```

### 2. Vue komponenti

```vue
<template>
  <div class="eimzo-integration">
    <h2>E-IMZO Integration</h2>

    <!-- E-IMZO holati -->
    <div class="status-section">
      <button @click="checkEimzo" :disabled="loading">
        {{ loading ? 'Tekshirilmoqda...' : 'E-IMZO ni tekshirish' }}
      </button>

      <div v-if="isAvailable" class="status success">
        ✅ E-IMZO {{ version }} mavjud
      </div>
      <div v-else-if="error" class="status error">❌ {{ error }}</div>
    </div>

    <!-- Sertifikatlar ro'yxati -->
    <div v-if="isAvailable" class="certificates-section">
      <button @click="listCertificates" :disabled="loading">
        Sertifikatlar ro'yxati
      </button>

      <div v-if="certificates.length > 0" class="certificates-list">
        <div
          v-for="cert in certificates"
          :key="cert.id"
          class="certificate-item"
          :class="{ expired: !cert.isValid }"
        >
          <h4>{{ cert.name }}</h4>
          <p><strong>Tashkilot:</strong> {{ cert.organization }}</p>
          <p><strong>STIR:</strong> {{ cert.tin }}</p>
          <p>
            <strong>Amal qilish muddati:</strong>
            {{ new Date(cert.validTo).toLocaleDateString() }}
          </p>
          <span class="cert-type">{{
            cert.type === 'pfx' ? 'Dasturiy' : 'Apparat'
          }}</span>
          <span :class="cert.isValid ? 'valid' : 'expired'">
            {{ cert.isValid ? 'Yaroqli' : 'Muddati tugagan' }}
          </span>

          <button
            @click="signWithCert(cert)"
            :disabled="!cert.isValid || loading"
            class="sign-btn"
          >
            Bu sertifikat bilan imzolash
          </button>
        </div>
      </div>
    </div>

    <!-- Imzolash bo'limi -->
    <div v-if="selectedCert" class="signing-section">
      <h3>Hujjatni imzolash</h3>
      <textarea
        v-model="documentContent"
        placeholder="Imzolanadigan matn..."
        rows="4"
      ></textarea>
      <button @click="performSigning" :disabled="loading">
        {{ loading ? 'Imzolanmoqda...' : 'Imzolash' }}
      </button>

      <div v-if="signatureResult" class="signature-result">
        <h4>Imzo natijasi:</h4>
        <pre>{{ signatureResult }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useEimzo } from '@/composables/useEimzo';

const {
  isAvailable,
  version,
  certificates,
  loading,
  error,
  checkEimzo,
  listCertificates,
  signDocument
} = useEimzo();

const selectedCert = ref(null);
const documentContent = ref('Salom, bu test hujjati!');
const signatureResult = ref('');

const signWithCert = cert => {
  selectedCert.value = cert;
};

const performSigning = async () => {
  if (!selectedCert.value || !documentContent.value) return;

  const result = await signDocument(selectedCert.value, documentContent.value);

  if (result.success) {
    signatureResult.value = result.signature;
  } else {
    alert('Imzolashda xatolik: ' + result.error);
  }
};
</script>

<style scoped>
.eimzo-integration {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.status-section,
.certificates-section,
.signing-section {
  margin: 20px 0;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.status.success {
  color: green;
  font-weight: bold;
}

.status.error {
  color: red;
  font-weight: bold;
}

.certificate-item {
  border: 1px solid #ccc;
  padding: 15px;
  margin: 10px 0;
  border-radius: 5px;
}

.certificate-item.expired {
  opacity: 0.6;
  border-color: #f00;
}

.cert-type {
  background: #007bff;
  color: white;
  padding: 2px 8px;
  border-radius: 3px;
  font-size: 12px;
}

.valid {
  color: green;
  font-weight: bold;
}

.expired {
  color: red;
  font-weight: bold;
}

.sign-btn {
  background: #28a745;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 10px;
}

.sign-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

textarea {
  width: 100%;
  margin: 10px 0;
  padding: 10px;
}

.signature-result {
  margin-top: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 5px;
}

.signature-result pre {
  background: #fff;
  padding: 10px;
  border-radius: 3px;
  font-size: 12px;
  overflow-x: auto;
}
</style>
```

## Vue 2 Options API

```vue
<template>
  <div class="eimzo-vue2">
    <h2>E-IMZO Vue 2 Integration</h2>

    <button @click="initializeEimzo" :disabled="loading">
      E-IMZO ni boshlash
    </button>

    <div v-if="status" :class="statusClass">
      {{ status }}
    </div>

    <div v-if="certificates.length > 0">
      <h3>Sertifikatlar</h3>
      <select v-model="selectedCertificate">
        <option value="">Sertifikatni tanlang</option>
        <option v-for="cert in certificates" :key="cert.id" :value="cert">
          {{ cert.name }} ({{ cert.organization }})
        </option>
      </select>
    </div>

    <div v-if="selectedCertificate">
      <textarea
        v-model="documentText"
        placeholder="Imzolanadigan matn"
      ></textarea>
      <br />
      <button @click="signDocument" :disabled="loading">
        Hujjatni imzolash
      </button>
    </div>

    <div v-if="signature">
      <h4>Imzo:</h4>
      <pre>{{ signature }}</pre>
    </div>
  </div>
</template>

<script>
import EIMZOClient from 'imzo-agnost';

export default {
  name: 'EimzoVue2',
  data() {
    return {
      loading: false,
      status: '',
      statusClass: '',
      certificates: [],
      selectedCertificate: null,
      documentText: 'Test document content',
      signature: ''
    };
  },

  methods: {
    async initializeEimzo() {
      this.loading = true;
      this.status = 'E-IMZO tekshirilmoqda...';
      this.statusClass = 'status-loading';

      // Version check
      EIMZOClient.checkVersion(
        (major, minor) => {
          this.status = `E-IMZO ${major}.${minor} topildi`;
          this.statusClass = 'status-success';

          // Install API keys
          EIMZOClient.installApiKeys(
            () => {
              this.loadCertificates();
            },
            (error, reason) => {
              this.status = "API kalitlar o'rnatilmadi: " + reason;
              this.statusClass = 'status-error';
              this.loading = false;
            }
          );
        },
        (error, reason) => {
          this.status = 'E-IMZO topilmadi: ' + reason;
          this.statusClass = 'status-error';
          this.loading = false;
        }
      );
    },

    loadCertificates() {
      EIMZOClient.listAllUserKeys(
        (cert, idx) => `cert_${idx}`,
        (id, cert) => ({
          id,
          name: cert.CN || 'Unknown',
          organization: cert.O || '',
          cert: cert
        }),
        certificates => {
          this.certificates = certificates;
          this.loading = false;
          this.status += ' - Sertifikatlar yuklandi';
        },
        (error, reason) => {
          this.status = 'Sertifikatlar yuklanmadi: ' + reason;
          this.statusClass = 'status-error';
          this.loading = false;
        }
      );
    },

    signDocument() {
      if (!this.selectedCertificate || !this.documentText) {
        alert('Sertifikat va hujjat matnini tanlang');
        return;
      }

      this.loading = true;

      EIMZOClient.loadKey(
        this.selectedCertificate.cert,
        keyId => {
          EIMZOClient.createPkcs7(
            keyId,
            this.documentText,
            null,
            signature => {
              this.signature = signature;
              this.loading = false;
              alert('Hujjat muvaffaqiyatli imzolandi!');
            },
            (error, reason) => {
              alert('Imzolashda xatolik: ' + reason);
              this.loading = false;
            }
          );
        },
        (error, reason) => {
          alert('Kalit yuklanmadi: ' + reason);
          this.loading = false;
        }
      );
    }
  }
};
</script>

<style scoped>
.eimzo-vue2 {
  max-width: 600px;
  margin: 20px auto;
  padding: 20px;
}

.status-loading {
  color: orange;
}
.status-success {
  color: green;
}
.status-error {
  color: red;
}

select,
textarea {
  width: 100%;
  margin: 10px 0;
  padding: 8px;
}

button {
  background: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  margin: 5px;
}

button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

pre {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 5px;
  font-size: 12px;
  overflow-x: auto;
}
</style>
```

## Nuxt.js Integration

### 1. Plugin yaratish

```typescript
// plugins/eimzo.client.ts
import EIMZOClient from 'imzo-agnost';

export default defineNuxtPlugin(() => {
  // Faqat client-side da ishlaydi
  if (process.client) {
    return {
      provide: {
        eimzo: EIMZOClient
      }
    };
  }
});
```

### 2. Nuxt sahifasida ishlatish

```vue
<template>
  <div>
    <h1>E-IMZO Nuxt Integration</h1>
    <button @click="checkEimzo">E-IMZO ni tekshirish</button>
    <div v-if="result">{{ result }}</div>
  </div>
</template>

<script setup>
const { $eimzo } = useNuxtApp();
const result = ref('');

const checkEimzo = () => {
  $eimzo.checkVersion(
    (major, minor) => {
      result.value = `E-IMZO ${major}.${minor} mavjud`;
    },
    (error, reason) => {
      result.value = `Xatolik: ${reason}`;
    }
  );
};
</script>
```

## Xatoliklarni boshqarish

```typescript
// utils/eimzoErrors.ts
export class EIMZOError extends Error {
  constructor(
    message: string,
    public code: string,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'EIMZOError';
  }
}

export function handleEIMZOError(
  error: unknown,
  reason: string | null
): EIMZOError {
  if (reason?.includes('E-IMZO not found')) {
    return new EIMZOError(
      "E-IMZO dasturi o'rnatilmagan yoki ishlamayapti",
      'EIMZO_NOT_FOUND',
      error
    );
  }

  if (reason?.includes('certificate')) {
    return new EIMZOError(
      'Sertifikat xatosi: ' + reason,
      'CERTIFICATE_ERROR',
      error
    );
  }

  if (reason?.includes('password')) {
    return new EIMZOError(
      "Sertifikat paroli noto'g'ri",
      'INVALID_PASSWORD',
      error
    );
  }

  return new EIMZOError(
    reason || "Noma'lum E-IMZO xatosi",
    'UNKNOWN_ERROR',
    error
  );
}

// Vue composable da ishlatish
export function useEimzoErrorHandler() {
  const handleError = (error: unknown, reason: string | null) => {
    const eimzoError = handleEIMZOError(error, reason);

    // User-friendly xabarlar
    const userMessages = {
      EIMZO_NOT_FOUND: "E-IMZO dasturini e-imzo.uz saytidan yuklab o'rnating",
      CERTIFICATE_ERROR: "Sertifikat bilan bog'liq muammo yuz berdi",
      INVALID_PASSWORD: "Sertifikat paroli noto'g'ri kiritildi",
      UNKNOWN_ERROR: 'Kutilmagan xatolik yuz berdi'
    };

    return {
      error: eimzoError,
      userMessage: userMessages[eimzoError.code] || eimzoError.message
    };
  };

  return { handleError };
}
```

## Performance Optimizatsiyasi

```typescript
// composables/useEimzoOptimized.ts
import { ref, computed, onMounted, onUnmounted } from 'vue';
import EIMZOClient from 'imzo-agnost';

export function useEimzoOptimized() {
  const cache = new Map();
  const isInitialized = ref(false);

  // Cacheli version check
  const getCachedVersion = () => {
    const cached = cache.get('version');
    if (cached && Date.now() - cached.timestamp < 60000) {
      // 1 daqiqa cache
      return cached.data;
    }
    return null;
  };

  const checkVersionCached = async () => {
    const cached = getCachedVersion();
    if (cached) {
      return cached;
    }

    return new Promise(resolve => {
      EIMZOClient.checkVersion(
        (major, minor) => {
          const versionData = { major, minor, available: true };
          cache.set('version', {
            data: versionData,
            timestamp: Date.now()
          });
          resolve(versionData);
        },
        (error, reason) => {
          const errorData = { available: false, error: reason };
          resolve(errorData);
        }
      );
    });
  };

  // Memory leak oldini olish
  onUnmounted(() => {
    cache.clear();
  });

  return {
    isInitialized,
    checkVersionCached,
    clearCache: () => cache.clear()
  };
}
```

## Best Practices

1. **Lazy Loading**: E-IMZO funksiyalarini faqat kerak bo'lganda yuklang
2. **Error Boundaries**: Vue da error handling uchun errorCaptured hook
3. **Loading States**: Foydalanuvchiga loading holatini ko'rsating
4. **Caching**: Version check va sertifikatlar ro'yxatini cache qiling
5. **Type Safety**: TypeScript bilan to'liq type safety ta'minlang

Bu misollar Vue.js da `imzo-agnost` kutubxonasini professional darajada
ishlatishning to'liq yo'llarini ko'rsatadi.
