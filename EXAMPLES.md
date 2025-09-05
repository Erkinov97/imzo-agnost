# E-IMZO Agnostic Library - Full Examples

Bu fayl E-IMZO Agnostic kutubxonasining barcha imkoniyatlari uchun to'liq
misollarni o'z ichiga oladi.

## 📋 Mundarija

1. [Boshlang'ich sozlash](#boshlangich-sozlash)
2. [PFX Plugin - Kalit fayllari](#pfx-plugin)
3. [PKCS7 Plugin - Raqamli imzo](#pkcs7-plugin)
4. [FTJC Plugin - USB Token](#ftjc-plugin)
5. [CryptoAuth Plugin - Kriptografik operatsiyalar](#cryptoauth-plugin)
6. [X509 Plugin - Sertifikatlar](#x509-plugin)
7. [IDCard Plugin - ID kartalar](#idcard-plugin)
8. [TSAClient Plugin - Vaqt tamg'asi](#tsaclient-plugin)
9. [FileIO Plugin - Fayl operatsiyalari](#fileio-plugin)
10. [CRL Plugin - Bekor qilingan sertifikatlar](#crl-plugin)
11. [Cipher Plugin - Shifrlash](#cipher-plugin)
12. [PKI Plugin - Ochiq kalit infratuzilmasi](#pki-plugin)
13. [PKCS10 Plugin - Sertifikat so'rovi](#pkcs10-plugin)
14. [Truststore Plugin - Ishonchli do'kon](#truststore-plugin)
15. [Tunnel Plugin - Shifrlangan tunnel](#tunnel-plugin)
16. [YTKS Plugin - YTKS fayllari](#ytks-plugin)
17. [To'liq ish jarayoni misollari](#toliq-ish-jarayoni)

---

## Boshlang'ich sozlash

### 1. Kutubxonani import qilish

```typescript
import {
  EIMZOApi,
  eimzoApi,
  // Plugins
  pfxPlugin,
  pkcs7Plugin,
  ftjcPlugin,
  cryptoauthPlugin,
  x509Plugin,
  idcardPlugin,
  tsaclientPlugin,
  fileioPlugin,
  crlPlugin,
  cipherPlugin,
  pkiPlugin,
  pkcs10Plugin,
  truststorePlugin,
  tunnelPlugin,
  ytksPlugin
} from 'imzo-agnost';
```

### 2. Global obyektlar (Legacy support)

Kutubxonani import qilgandan keyin avtomatik ravishda global obyektlar
yaratiladi:

```javascript
// Import qilish (avtomatik global setup)
import 'imzo-agnost';

// Keyin browserda global obyektlar ishlatish mumkin
console.log(CAPIWS); // ✅ Original CAPIWS object
console.log(EIMZOClient); // ✅ Original EIMZOClient object
console.log(capiws); // ✅ Lowercase alias
console.log(eimzoApi); // ✅ Modern API

// Legacy usuli (boshqalar qilganidek)
CAPIWS.version(
  (event, data) => console.log('Version:', data),
  error => console.error('Error:', error)
);

EIMZOClient.checkVersion(
  (major, minor) => console.log(`Version: ${major}.${minor}`),
  (error, reason) => console.error('Error:', error || reason)
);

// Modern API global access
eimzoApi.initialize().then(version => {
  console.log('Modern API Version:', version);
});
```

### 2. API ni ishga tushirish

```typescript
async function initializeEIMZO() {
  try {
    // Versiyani tekshirish
    const version = await eimzoApi.initialize();
    console.log(`E-IMZO Version: ${version.major}.${version.minor}`);

    // API kalitlarini o'rnatish
    await eimzoApi.installApiKeys();
    console.log("✅ API kalitlari muvaffaqiyatli o'rnatildi");

    // ID karta mavjudligini tekshirish
    const isCardPlugged = await eimzoApi.isIdCardPluggedIn();
    console.log(`ID karta holati: ${isCardPlugged ? 'Ulangan' : 'Ulanmagan'}`);

    return true;
  } catch (error) {
    console.error('❌ Xatolik:', error);
    throw error;
  }
}

// Global obyektlar bilan ham ishlatish mumkin
function initializeWithGlobal() {
  // Legacy usuli
  EIMZOClient.checkVersion(
    (major, minor) => {
      console.log(`Global EIMZOClient Version: ${major}.${minor}`);

      // API kalitlarini o'rnatish
      EIMZOClient.installApiKeys(
        () => console.log("✅ Global API kalitlari o'rnatildi"),
        (error, reason) => console.error('❌ Xatolik:', error || reason)
      );
    },
    (error, reason) => console.error('❌ Version xatolik:', error || reason)
  );

  // CAPIWS bilan to'g'ridan-to'g'ri
  CAPIWS.version(
    (event, data) => console.log('CAPIWS Version:', data),
    error => console.error('CAPIWS Error:', error)
  );
}
```

---

## PFX Plugin

PFX kalitlari bilan ishlash uchun misollar.

### Barcha sertifikatlarni ko'rish

```typescript
async function listAllCertificates() {
  try {
    // Promise usuli
    const result = await pfxPlugin.listAllCertificatesAsync();

    console.log('Topilgan sertifikatlar soni:', result.certificates.length);

    result.certificates.forEach((cert, index) => {
      console.log(`${index + 1}. Sertifikat:`);
      console.log(`   CN: ${cert.CN}`);
      console.log(`   O: ${cert.O}`);
      console.log(`   OU: ${cert.OU}`);
      console.log(`   Seriyal: ${cert.serialNumber}`);
      console.log(
        `   Amal qilish muddati: ${cert.validFrom} - ${cert.validTo}`
      );
      console.log(`   Disk: ${cert.disk}`);
      console.log(`   Fayl: ${cert.path}`);
      console.log('---');
    });

    return result;
  } catch (error) {
    console.error('Sertifikatlarni olishda xatolik:', error);
    throw error;
  }
}

// Callback usuli
function listCertificatesCallback() {
  pfxPlugin.listAllCertificates(
    (event, data) => {
      console.log('Sertifikatlar muvaffaqiyatli yuklandi:', data);
    },
    error => {
      console.error('Xatolik:', error);
    }
  );
}
```

### Kalitni yuklash va unload qilish

```typescript
async function loadAndUnloadKey() {
  try {
    // Sertifikatlarni olish
    const certificates = await pfxPlugin.listAllCertificatesAsync();

    if (certificates.certificates.length === 0) {
      throw new Error('Hech qanday sertifikat topilmadi');
    }

    const cert = certificates.certificates[0];

    // Kalitni yuklash
    const loadResult = await pfxPlugin.loadKeyAsync(
      cert.disk || '',
      cert.path || '',
      cert.name || '',
      cert.alias || ''
    );

    console.log('✅ Kalit yuklandi, ID:', loadResult.keyId);

    // Parolni tekshirish
    const isPasswordValid = await pfxPlugin.verifyPasswordAsync(
      loadResult.keyId
    );
    console.log('Parol holati:', isPasswordValid ? "To'g'ri" : "Noto'g'ri");

    // Kalit haqida ma'lumot
    const keyInfo = await pfxPlugin.getKeyInfoAsync(loadResult.keyId);
    console.log("Kalit ma'lumotlari:", keyInfo);

    // Kalitni unload qilish
    await pfxPlugin.unloadKeyAsync(loadResult.keyId);
    console.log('✅ Kalit muvaffaqiyatli unload qilindi');

    return loadResult.keyId;
  } catch (error) {
    console.error('Kalit operatsiyasida xatolik:', error);
    throw error;
  }
}
```

### Disklarni ko'rish

```typescript
async function listDisks() {
  try {
    const disks = await pfxPlugin.listDisksAsync();

    console.log('Mavjud disklar:');
    disks.disks.forEach((disk, index) => {
      console.log(`${index + 1}. ${disk.name} (${disk.type})`);
    });

    return disks;
  } catch (error) {
    console.error('Disklarni olishda xatolik:', error);
    throw error;
  }
}
```

---

## PKCS7 Plugin

Raqamli imzo yaratish va tekshirish.

### Hujjatga imzo qo'yish

```typescript
async function signDocument() {
  try {
    // Avval kalitni yuklash
    const certificates = await pfxPlugin.listAllCertificatesAsync();
    const cert = certificates.certificates[0];

    const keyResult = await pfxPlugin.loadKeyAsync(
      cert.disk || '',
      cert.path || '',
      cert.name || '',
      cert.alias || ''
    );

    // Imzolanadigan ma'lumot
    const data = 'Bu muhim hujjat matni';
    const dataBase64 = btoa(data);

    // PKCS7 imzo yaratish
    const pkcs7Result = await pkcs7Plugin.createPkcs7Async(
      keyResult.keyId,
      dataBase64,
      'no' // attached signature
    );

    console.log('✅ Raqamli imzo yaratildi');
    console.log('Imzo (Base64):', pkcs7Result.pkcs7);

    // Kalitni tozalash
    await pfxPlugin.unloadKeyAsync(keyResult.keyId);

    return pkcs7Result;
  } catch (error) {
    console.error('Imzo yaratishda xatolik:', error);
    throw error;
  }
}
```

### Detached imzo yaratish

```typescript
async function createDetachedSignature() {
  try {
    const certificates = await pfxPlugin.listAllCertificatesAsync();
    const cert = certificates.certificates[0];

    const keyResult = await pfxPlugin.loadKeyAsync(
      cert.disk || '',
      cert.path || '',
      cert.name || '',
      cert.alias || ''
    );

    const data = "Alohida imzolanadigan ma'lumot";
    const dataBase64 = btoa(data);

    // Detached PKCS7 imzo
    const pkcs7Result = await pkcs7Plugin.createPkcs7Async(
      keyResult.keyId,
      dataBase64,
      'yes' // detached signature
    );

    console.log('✅ Detached imzo yaratildi');
    console.log('Detached imzo:', pkcs7Result.pkcs7);

    await pfxPlugin.unloadKeyAsync(keyResult.keyId);

    return pkcs7Result;
  } catch (error) {
    console.error('Detached imzo yaratishda xatolik:', error);
    throw error;
  }
}
```

### Imzoni tekshirish

```typescript
async function verifySignature(pkcs7Base64: string, trustStoreId?: string) {
  try {
    // Attached imzoni tekshirish
    const verifyResult = await pkcs7Plugin.verifyPkcs7AttachedAsync(
      pkcs7Base64,
      trustStoreId || ''
    );

    if (verifyResult.isValid) {
      console.log("✅ Imzo to'g'ri");
      console.log('Imzolovchi:', verifyResult.signerInfo?.CN);
      console.log('Imzo vaqti:', verifyResult.signTime);
    } else {
      console.log("❌ Imzo noto'g'ri");
      console.log('Xatolik:', verifyResult.error);
    }

    return verifyResult;
  } catch (error) {
    console.error('Imzoni tekshirishda xatolik:', error);
    throw error;
  }
}
```

### PKCS7 ma'lumotlarini olish

```typescript
async function getPkcs7Info(pkcs7Base64: string) {
  try {
    const info = await pkcs7Plugin.getPkcs7AttachedInfoAsync(pkcs7Base64);

    console.log("PKCS7 ma'lumotlari:");
    console.log('Imzolovchilar soni:', info.signers?.length || 0);
    console.log('Sertifikatlar soni:', info.certificates?.length || 0);

    info.signers?.forEach((signer, index) => {
      console.log(`Imzolovchi ${index + 1}:`);
      console.log(`  CN: ${signer.CN}`);
      console.log(`  Imzo algoritmi: ${signer.signatureAlgorithm}`);
      console.log(`  Imzo vaqti: ${signer.signTime}`);
    });

    return info;
  } catch (error) {
    console.error("PKCS7 ma'lumotlarini olishda xatolik:", error);
    throw error;
  }
}
```

---

## FTJC Plugin

USB token bilan ishlash.

### Barcha tokenlarni ko'rish

```typescript
async function listAllTokens() {
  try {
    const tokens = await ftjcPlugin.listAllKeysAsync();

    console.log('Topilgan tokenlar:');
    tokens.keys?.forEach((token, index) => {
      console.log(`${index + 1}. Token:`);
      console.log(`   ID: ${token.id}`);
      console.log(`   Nomi: ${token.name}`);
      console.log(`   Turi: ${token.type}`);
      console.log(`   Seriyal: ${token.serialNumber}`);
      console.log('---');
    });

    return tokens;
  } catch (error) {
    console.error('Tokenlarni olishda xatolik:', error);
    throw error;
  }
}
```

### Token kalitini yuklash

```typescript
async function loadTokenKey(cardUID: string) {
  try {
    const keyResult = await ftjcPlugin.loadKeyAsync(cardUID);

    console.log('✅ Token kaliti yuklandi');
    console.log('Token ID:', keyResult.tokenId);
    console.log('Kalit ID:', keyResult.keyId);

    return keyResult;
  } catch (error) {
    console.error('Token kalitini yuklashda xatolik:', error);
    throw error;
  }
}
```

### PIN kodni tekshirish

```typescript
async function verifyTokenPin(
  tokenId: string,
  pinType: 'user' | 'admin' = 'user'
) {
  try {
    const pinResult = await ftjcPlugin.verifyPinAsync(tokenId, pinType);

    if (pinResult.success) {
      console.log("✅ PIN kod to'g'ri");
      console.log('Qolgan urinishlar:', pinResult.retriesLeft);
    } else {
      console.log("❌ PIN kod noto'g'ri");
      console.log('Qolgan urinishlar:', pinResult.retriesLeft);
    }

    return pinResult;
  } catch (error) {
    console.error('PIN kodni tekshirishda xatolik:', error);
    throw error;
  }
}
```

### Token ma'lumotlarini olish

```typescript
async function getTokenInfo(tokenId: string) {
  try {
    const tokenInfo = await ftjcPlugin.getTokenInfoAsync(tokenId);

    console.log("Token ma'lumotlari:");
    console.log('Nomi:', tokenInfo.name);
    console.log('Versiya:', tokenInfo.version);
    console.log('Seriyal raqam:', tokenInfo.serialNumber);
    console.log('Xotira hajmi:', tokenInfo.totalMemory);
    console.log("Bo'sh xotira:", tokenInfo.freeMemory);

    return tokenInfo;
  } catch (error) {
    console.error("Token ma'lumotlarini olishda xatolik:", error);
    throw error;
  }
}
```

---

## CryptoAuth Plugin

Past darajadagi kriptografik operatsiyalar.

### Ma'lumotga imzo qo'yish

```typescript
async function signData(keyId: string, data: string) {
  try {
    const signature = await cryptoauthPlugin.getSignatureAsync(keyId, data);

    console.log("✅ Ma'lumot imzolandi");
    console.log('Imzo:', signature.signature);
    console.log('Algoritm:', signature.algorithm);

    return signature;
  } catch (error) {
    console.error("Ma'lumotni imzolashda xatolik:", error);
    throw error;
  }
}
```

### Imzoni tekshirish

```typescript
async function verifySignature(data: string, signature: string, keyId: string) {
  try {
    const isValid = await cryptoauthPlugin.verifySignatureWithIdAsync(
      data,
      signature,
      keyId
    );

    if (isValid) {
      console.log("✅ Imzo to'g'ri");
    } else {
      console.log("❌ Imzo noto'g'ri");
    }

    return isValid;
  } catch (error) {
    console.error('Imzoni tekshirishda xatolik:', error);
    throw error;
  }
}
```

### Hash yaratish

```typescript
async function createHash(
  data: string,
  algorithm: 'md5' | 'sha1' | 'sha256' = 'sha256'
) {
  try {
    const hash = await cryptoauthPlugin.createHashAsync(data, algorithm);

    console.log(`${algorithm.toUpperCase()} hash:`, hash.hash);

    return hash;
  } catch (error) {
    console.error('Hash yaratishda xatolik:', error);
    throw error;
  }
}
```

---

## X509 Plugin

X.509 sertifikatlari bilan ishlash.

### Sertifikat zanjirini olish

```typescript
async function getCertificateChain(keyId: string) {
  try {
    const chain = await x509Plugin.getCertificateChainAsync(keyId);

    console.log('Sertifikat zanjiri:');
    chain.certificates?.forEach((cert, index) => {
      console.log(`${index + 1}. ${cert.subject}`);
    });

    return chain;
  } catch (error) {
    console.error('Sertifikat zanjirini olishda xatolik:', error);
    throw error;
  }
}
```

### Sertifikat ma'lumotlarini olish

```typescript
async function getCertificateInfo(certificateBase64: string) {
  try {
    const info = await x509Plugin.getCertificateInfoAsync(certificateBase64);

    console.log("Sertifikat ma'lumotlari:");
    console.log('Subject:', info.subject);
    console.log('Issuer:', info.issuer);
    console.log('Seriyal raqam:', info.serialNumber);
    console.log('Amal qilish muddati:', `${info.validFrom} - ${info.validTo}`);
    console.log('Ochiq kalit algoritmi:', info.publicKeyAlgorithm);
    console.log('Imzo algoritmi:', info.signatureAlgorithm);

    return info;
  } catch (error) {
    console.error("Sertifikat ma'lumotlarini olishda xatolik:", error);
    throw error;
  }
}
```

### Sertifikatni tekshirish

```typescript
async function verifyCertificate(
  certificateBase64: string,
  issuerCertBase64?: string
) {
  try {
    const isValid = await x509Plugin.verifyCertificateAsync(
      certificateBase64,
      issuerCertBase64
    );

    if (isValid.valid) {
      console.log("✅ Sertifikat to'g'ri");
    } else {
      console.log("❌ Sertifikat noto'g'ri");
      console.log('Sabab:', isValid.reason);
    }

    return isValid;
  } catch (error) {
    console.error('Sertifikatni tekshirishda xatolik:', error);
    throw error;
  }
}
```

---

## IDCard Plugin

ID kartalar bilan ishlash.

### Karta o'quvchilarni ko'rish

```typescript
async function listCardReaders() {
  try {
    const readers = await idcardPlugin.listReadersAsync();

    console.log("ID karta o'quvchilari:");
    readers.readers?.forEach((reader, index) => {
      console.log(`${index + 1}. ${reader.name}`);
      console.log(`   Holati: ${reader.connected ? 'Ulangan' : 'Ulanmagan'}`);
      console.log(`   Karta: ${reader.cardPresent ? 'Mavjud' : "Yo'q"}`);
      console.log('---');
    });

    return readers;
  } catch (error) {
    console.error("O'quvchilarni olishda xatolik:", error);
    throw error;
  }
}
```

### ID karta ma'lumotlarini o'qish

```typescript
async function readIdCard(readerName: string) {
  try {
    const cardData = await idcardPlugin.readCardDataAsync(readerName);

    console.log("ID karta ma'lumotlari:");
    console.log('Ism-familiya:', cardData.fullName);
    console.log('Passport raqami:', cardData.passportNumber);
    console.log("Tug'ilgan sana:", cardData.birthDate);
    console.log('Jinsi:', cardData.gender);
    console.log('Millati:', cardData.nationality);

    return cardData;
  } catch (error) {
    console.error("ID kartani o'qishda xatolik:", error);
    throw error;
  }
}
```

---

## TSAClient Plugin

Vaqt tamg'asi (timestamp) operatsiyalari.

### Ma'lumot uchun timestamp olish

```typescript
async function getTimestampForData(data: string, tsaUrl: string) {
  try {
    const timestamp = await tsaclientPlugin.getTimestampTokenForDataAsync(
      data,
      tsaUrl
    );

    console.log('✅ Timestamp token olindi');
    console.log('Token:', timestamp.token);

    return timestamp;
  } catch (error) {
    console.error('Timestamp olishda xatolik:', error);
    throw error;
  }
}
```

### Imzo uchun timestamp olish

```typescript
async function getTimestampForSignature(
  signatureBase64: string,
  tsaUrl: string
) {
  try {
    const timestamp = await tsaclientPlugin.getTimestampTokenForSignatureAsync(
      signatureBase64,
      tsaUrl
    );

    console.log('✅ Imzo uchun timestamp olindi');

    return timestamp;
  } catch (error) {
    console.error('Imzo timestamp olishda xatolik:', error);
    throw error;
  }
}
```

### Timestamp ma'lumotlarini olish

```typescript
async function getTimestampInfo(timestampToken: string) {
  try {
    const info =
      await tsaclientPlugin.getTimestampTokenInfoAsync(timestampToken);

    console.log("Timestamp ma'lumotlari:");
    console.log('Vaqt:', info.timestamp);
    console.log('TSA nomi:', info.tsaName);
    console.log('Seriyal raqam:', info.serialNumber);
    console.log('Algoritm:', info.hashAlgorithm);

    return info;
  } catch (error) {
    console.error("Timestamp ma'lumotlarini olishda xatolik:", error);
    throw error;
  }
}
```

---

## FileIO Plugin

Fayl operatsiyalari.

### Faylni yuklash

```typescript
async function loadFile(filePath: string) {
  try {
    const fileContent = await fileioPlugin.loadFileAsync(filePath);

    console.log('✅ Fayl yuklandi');
    console.log('Fayl hajmi:', fileContent.size);
    console.log('MIME turi:', fileContent.mimeType);

    return fileContent;
  } catch (error) {
    console.error('Faylni yuklashda xatolik:', error);
    throw error;
  }
}
```

### Faylni saqlash

```typescript
async function saveFile(content: string, filePath: string) {
  try {
    const result = await fileioPlugin.writeFileAsync(content, filePath);

    if (result.success) {
      console.log('✅ Fayl saqlandi:', filePath);
    } else {
      console.log('❌ Faylni saqlashda xatolik');
    }

    return result;
  } catch (error) {
    console.error('Faylni saqlashda xatolik:', error);
    throw error;
  }
}
```

### Papka tanlash

```typescript
async function selectFolder() {
  try {
    const folder = await fileioPlugin.selectFolderAsync();

    console.log('Tanlangan papka:', folder.path);

    return folder;
  } catch (error) {
    console.error('Papka tanlashda xatolik:', error);
    throw error;
  }
}
```

---

## CRL Plugin

Certificate Revocation List (Bekor qilingan sertifikatlar ro'yxati).

### CRL ni ochish

```typescript
async function openCRL(crlData: string) {
  try {
    const crlInfo = await crlPlugin.openCrlAsync(crlData);

    console.log('✅ CRL ochildi');
    console.log('CRL ID:', crlInfo.crlId);
    console.log('Chiqaruvchi:', crlInfo.issuer);
    console.log('Keyingi yangilanish:', crlInfo.nextUpdate);

    return crlInfo;
  } catch (error) {
    console.error('CRL ochishda xatolik:', error);
    throw error;
  }
}
```

### Sertifikatni CRL da tekshirish

```typescript
async function checkCertificateInCRL(certificateBase64: string, crlId: string) {
  try {
    const status = await crlPlugin.checkCertificateAsync(
      certificateBase64,
      crlId
    );

    if (status.isRevoked) {
      console.log('❌ Sertifikat bekor qilingan');
      console.log('Bekor qilingan sana:', status.revocationDate);
      console.log('Sababi:', status.reason);
    } else {
      console.log('✅ Sertifikat amal qilmoqda');
    }

    return status;
  } catch (error) {
    console.error('Sertifikatni CRL da tekshirishda xatolik:', error);
    throw error;
  }
}
```

---

## Cipher Plugin

Ma'lumotlarni shifrlash va deshifrlash.

### Ma'lumotni shifrlash

```typescript
async function encryptData(data: string, publicKeyId: string) {
  try {
    const encrypted = await cipherPlugin.encryptAsync(data, publicKeyId);

    console.log("✅ Ma'lumot shifrlandi");
    console.log("Shifrlangan ma'lumot:", encrypted.encryptedData);

    return encrypted;
  } catch (error) {
    console.error('Shifrashda xatolik:', error);
    throw error;
  }
}
```

### Ma'lumotni deshifrlash

```typescript
async function decryptData(encryptedData: string, privateKeyId: string) {
  try {
    const decrypted = await cipherPlugin.decryptAsync(
      encryptedData,
      privateKeyId
    );

    console.log("✅ Ma'lumot deshifrlandi");
    console.log("Deshifrlangan ma'lumot:", decrypted.data);

    return decrypted;
  } catch (error) {
    console.error('Deshifrlashda xatolik:', error);
    throw error;
  }
}
```

---

## PKI Plugin

Ochiq kalit infratuzilmasi operatsiyalari.

### Kalit juftini yaratish

```typescript
async function generateKeyPair(
  algorithm: string = 'RSA',
  keySize: number = 2048
) {
  try {
    const keyPair = await pkiPlugin.generateKeyPairAsync(algorithm, keySize);

    console.log('✅ Kalit jufti yaratildi');
    console.log('Ochiq kalit ID:', keyPair.publicKeyId);
    console.log('Maxfiy kalit ID:', keyPair.privateKeyId);

    return keyPair;
  } catch (error) {
    console.error('Kalit jufti yaratishda xatolik:', error);
    throw error;
  }
}
```

### Kalitlarni eksport qilish

```typescript
async function exportKeys(keyId: string, format: 'PEM' | 'DER' = 'PEM') {
  try {
    const exportedKey = await pkiPlugin.exportKeyAsync(keyId, format);

    console.log('✅ Kalit eksport qilindi');
    console.log(`${format} format:`, exportedKey.key);

    return exportedKey;
  } catch (error) {
    console.error('Kalitni eksport qilishda xatolik:', error);
    throw error;
  }
}
```

---

## PKCS10 Plugin

Sertifikat so'rovi yaratish.

### Sertifikat so'rovi yaratish

```typescript
async function createCertificateRequest(keyId: string, subject: string) {
  try {
    const request = await pkcs10Plugin.createRequestAsync(keyId, subject);

    console.log("✅ Sertifikat so'rovi yaratildi");
    console.log("PKCS10 so'rov:", request.pkcs10);

    return request;
  } catch (error) {
    console.error("Sertifikat so'rovi yaratishda xatolik:", error);
    throw error;
  }
}
```

### So'rov ma'lumotlarini olish

```typescript
async function getRequestInfo(pkcs10Base64: string) {
  try {
    const info = await pkcs10Plugin.getRequestInfoAsync(pkcs10Base64);

    console.log("PKCS10 so'rov ma'lumotlari:");
    console.log('Subject:', info.subject);
    console.log('Ochiq kalit algoritmi:', info.publicKeyAlgorithm);
    console.log('Imzo algoritmi:', info.signatureAlgorithm);

    return info;
  } catch (error) {
    console.error("So'rov ma'lumotlarini olishda xatolik:", error);
    throw error;
  }
}
```

---

## Truststore Plugin

Ishonchli sertifikatlar do'koni.

### Truststore yaratish

```typescript
async function createTruststore() {
  try {
    const truststore = await truststorePlugin.createTruststoreAsync();

    console.log('✅ Truststore yaratildi');
    console.log('Truststore ID:', truststore.truststoreId);

    return truststore;
  } catch (error) {
    console.error('Truststore yaratishda xatolik:', error);
    throw error;
  }
}
```

### Sertifikatni truststore ga qo'shish

```typescript
async function addCertificateToTruststore(
  truststoreId: string,
  certificateBase64: string,
  alias: string
) {
  try {
    const result = await truststorePlugin.addCertificateAsync(
      truststoreId,
      certificateBase64,
      alias
    );

    if (result.success) {
      console.log("✅ Sertifikat truststore ga qo'shildi");
    }

    return result;
  } catch (error) {
    console.error("Sertifikatni qo'shishda xatolik:", error);
    throw error;
  }
}
```

---

## Tunnel Plugin

Shifrlangan tunnel yaratish.

### Xavfsiz tunnel yaratish

```typescript
async function createSecureTunnel(
  serverHost: string,
  serverPort: number,
  keyId: string
) {
  try {
    const tunnel = await tunnelPlugin.createTunnelAsync(
      serverHost,
      serverPort,
      keyId
    );

    console.log('✅ Xavfsiz tunnel yaratildi');
    console.log('Lokal port:', tunnel.localPort);
    console.log('Server manzili:', `${serverHost}:${serverPort}`);

    return tunnel;
  } catch (error) {
    console.error('Tunnel yaratishda xatolik:', error);
    throw error;
  }
}
```

### Tunnelni yopish

```typescript
async function closeTunnel(tunnelId: string) {
  try {
    await tunnelPlugin.closeTunnelAsync(tunnelId);

    console.log('✅ Tunnel yopildi');
  } catch (error) {
    console.error('Tunnelni yopishda xatolik:', error);
    throw error;
  }
}
```

---

## YTKS Plugin

YTKS fayllari bilan ishlash.

### YTKS faylini yuklash

```typescript
async function loadYTKSFile(filePath: string, password: string) {
  try {
    const result = await ytksPlugin.loadFileAsync(filePath, password);

    console.log('✅ YTKS fayli yuklandi');
    console.log('Kalit ID:', result.keyId);

    return result;
  } catch (error) {
    console.error('YTKS faylini yuklashda xatolik:', error);
    throw error;
  }
}
```

---

## To'liq ish jarayoni

### 1. Hujjatga imzo qo'yib, timestamp qo'shish

```typescript
async function completeSigningWorkflow() {
  try {
    console.log("🚀 To'liq imzolash jarayoni boshlandi...");

    // 1. API ni ishga tushirish
    await initializeEIMZO();

    // 2. Sertifikatlarni olish
    const certificates = await pfxPlugin.listAllCertificatesAsync();

    if (certificates.certificates.length === 0) {
      throw new Error('Hech qanday sertifikat topilmadi');
    }

    const selectedCert = certificates.certificates[0];
    console.log('Tanlangan sertifikat:', selectedCert.CN);

    // 3. Kalitni yuklash
    const keyResult = await pfxPlugin.loadKeyAsync(
      selectedCert.disk || '',
      selectedCert.path || '',
      selectedCert.name || '',
      selectedCert.alias || ''
    );

    console.log('✅ Kalit yuklandi, ID:', keyResult.keyId);

    // 4. Hujjat matnini tayyorlash
    const documentText = `
      MUHIM HUJJAT
      
      Bu hujjat E-IMZO Agnostic kutubxonasi yordamida 
      raqamli imzo bilan imzolangan.
      
      Sana: ${new Date().toLocaleString('uz-UZ')}
      Imzolovchi: ${selectedCert.CN}
    `;

    const documentBase64 = btoa(documentText);

    // 5. PKCS7 imzo yaratish
    const pkcs7Result = await pkcs7Plugin.createPkcs7Async(
      keyResult.keyId,
      documentBase64,
      'no' // attached
    );

    console.log('✅ PKCS7 imzo yaratildi');

    // 6. Timestamp qo'shish (ixtiyoriy)
    try {
      const timestampResult =
        await tsaclientPlugin.getTimestampTokenForSignatureAsync(
          pkcs7Result.pkcs7,
          'http://timestamp.example.com' // real TSA URL
        );

      console.log("✅ Timestamp qo'shildi");
    } catch (timestampError) {
      console.log(
        "⚠️ Timestamp qo'shishda xatolik (ixtiyoriy):",
        timestampError
      );
    }

    // 7. Imzoni tekshirish
    const verifyResult = await pkcs7Plugin.verifyPkcs7AttachedAsync(
      pkcs7Result.pkcs7,
      '' // truststore ID
    );

    if (verifyResult.isValid) {
      console.log("✅ Imzo tekshirildi va to'g'ri");
    } else {
      console.log('❌ Imzo tekshirishda xatolik');
    }

    // 8. Kalitni tozalash
    await pfxPlugin.unloadKeyAsync(keyResult.keyId);
    console.log('✅ Kalit tozalandi');

    console.log("🎉 To'liq jarayon muvaffaqiyatli tugadi!");

    return {
      signature: pkcs7Result.pkcs7,
      signerInfo: selectedCert,
      documentText,
      isValid: verifyResult.isValid
    };
  } catch (error) {
    console.error("❌ To'liq jarayonda xatolik:", error);
    throw error;
  }
}
```

### 2. Fayl imzolash va saqlash

```typescript
async function signAndSaveFile(inputFilePath: string, outputFilePath: string) {
  try {
    console.log('📁 Fayl imzolash jarayoni...');

    // 1. Faylni yuklash
    const fileContent = await fileioPlugin.loadFileAsync(inputFilePath);
    console.log('✅ Fayl yuklandi:', inputFilePath);

    // 2. Kalitni tayyorlash
    const certificates = await pfxPlugin.listAllCertificatesAsync();
    const cert = certificates.certificates[0];

    const keyResult = await pfxPlugin.loadKeyAsync(
      cert.disk || '',
      cert.path || '',
      cert.name || '',
      cert.alias || ''
    );

    // 3. Faylni imzolash
    const pkcs7Result = await pkcs7Plugin.createPkcs7Async(
      keyResult.keyId,
      fileContent.content,
      'no'
    );

    // 4. Imzolangan faylni saqlash
    const signedFileData = {
      originalFile: {
        name: inputFilePath.split('/').pop(),
        content: fileContent.content,
        mimeType: fileContent.mimeType
      },
      signature: pkcs7Result.pkcs7,
      signerInfo: cert,
      signedAt: new Date().toISOString()
    };

    const signedFileJson = JSON.stringify(signedFileData, null, 2);
    const signedFileBase64 = btoa(signedFileJson);

    await fileioPlugin.writeFileAsync(signedFileBase64, outputFilePath);

    console.log('✅ Imzolangan fayl saqlandi:', outputFilePath);

    // 5. Tozalash
    await pfxPlugin.unloadKeyAsync(keyResult.keyId);

    return signedFileData;
  } catch (error) {
    console.error('Fayl imzolashda xatolik:', error);
    throw error;
  }
}
```

### 3. Ommaviy imzolash (bir nechta fayllar)

```typescript
async function bulkSignFiles(filePaths: string[], outputDir: string) {
  try {
    console.log('📦 Ommaviy imzolash boshlandi...');

    // Kalitni bir marta yuklash
    const certificates = await pfxPlugin.listAllCertificatesAsync();
    const cert = certificates.certificates[0];

    const keyResult = await pfxPlugin.loadKeyAsync(
      cert.disk || '',
      cert.path || '',
      cert.name || '',
      cert.alias || ''
    );

    const results = [];

    for (let i = 0; i < filePaths.length; i++) {
      const filePath = filePaths[i];

      try {
        console.log(`${i + 1}/${filePaths.length}: ${filePath}`);

        // Faylni yuklash
        const fileContent = await fileioPlugin.loadFileAsync(filePath);

        // Imzolash
        const pkcs7Result = await pkcs7Plugin.createPkcs7Async(
          keyResult.keyId,
          fileContent.content,
          'no'
        );

        // Saqlash
        const fileName =
          filePath
            .split('/')
            .pop()
            ?.replace(/\.[^/.]+$/, '') || 'file';
        const outputPath = `${outputDir}/${fileName}_signed.json`;

        const signedData = {
          originalFile: filePath,
          signature: pkcs7Result.pkcs7,
          signedAt: new Date().toISOString()
        };

        await fileioPlugin.writeFileAsync(
          btoa(JSON.stringify(signedData, null, 2)),
          outputPath
        );

        results.push({
          originalFile: filePath,
          signedFile: outputPath,
          success: true
        });

        console.log(`✅ ${filePath} imzolandi`);
      } catch (error) {
        console.error(`❌ ${filePath} xatolik:`, error);
        results.push({
          originalFile: filePath,
          success: false,
          error: error.message
        });
      }
    }

    // Kalitni tozalash
    await pfxPlugin.unloadKeyAsync(keyResult.keyId);

    console.log('🎉 Ommaviy imzolash tugadi!');
    console.log(`Muvaffaqiyatli: ${results.filter(r => r.success).length}`);
    console.log(`Xatolik: ${results.filter(r => !r.success).length}`);

    return results;
  } catch (error) {
    console.error('Ommaviy imzolashda xatolik:', error);
    throw error;
  }
}
```

---

## Xatoliklarni boshqarish

### Umumiy xatolik boshqaruvchi

```typescript
function handleEIMZOError(error: any): string {
  if (typeof error === 'string') {
    return error;
  }

  if (error.message) {
    // Umumiy xatoliklar
    if (error.message.includes('password')) {
      return "Parol noto'g'ri yoki talab qilinadi";
    }

    if (error.message.includes('certificate')) {
      return "Sertifikat bilan bog'liq xatolik";
    }

    if (error.message.includes('connection')) {
      return 'E-IMZO ga ulanishda xatolik. E-IMZO dasturi ishga tushirilganligini tekshiring';
    }

    if (error.message.includes('key')) {
      return "Kalit bilan bog'liq xatolik";
    }

    return error.message;
  }

  return "Noma'lum xatolik yuz berdi";
}
```

### Error handling wrapper

```typescript
function withErrorHandling<T extends any[], R>(fn: (...args: T) => Promise<R>) {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args);
    } catch (error) {
      const message = handleEIMZOError(error);
      console.error('E-IMZO xatolik:', message);
      throw new Error(message);
    }
  };
}

// Foydalanish
const safeSignDocument = withErrorHandling(signDocument);
```

---

## Foydali yordamchi funksiyalar

### Base64 konvertatsiya

```typescript
function stringToBase64(str: string): string {
  return btoa(unescape(encodeURIComponent(str)));
}

function base64ToString(base64: string): string {
  return decodeURIComponent(escape(atob(base64)));
}
```

### Fayl o'lchamini aniqlash

```typescript
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
```

### Sertifikat ma'lumotlarini formatlash

```typescript
function formatCertificateInfo(cert: any): string {
  return `
    Ism: ${cert.CN || "Noma'lum"}
    Tashkilot: ${cert.O || "Noma'lum"}
    Bo\'lim: ${cert.OU || "Noma'lum"}
    Seriyal: ${cert.serialNumber || "Noma'lum"}
    Amal qilish muddati: ${cert.validFrom} - ${cert.validTo}
  `.trim();
}
```

---

## Muhim eslatmalar

1. **Xavfsizlik**: Kalitlarni ishlatgandan keyin doimo `unloadKey` qiling
2. **Performance**: Ko'p operatsiyalar uchun kalitni bir marta yuklang
3. **Error Handling**: Har doim try-catch ishlatib xatoliklarni boshqaring
4. **Callback vs Promise**: Promise usulini afzal ko'ring, zamonaviy va osonroq
5. **API Keys**: Dasturni ishga tushirishdan oldin API kalitlarini o'rnating

Bu misollar E-IMZO Agnostic kutubxonasining barcha imkoniyatlarini to'liq
ishlatishga yordam beradi. Har bir plugin va funksiya uchun batafsil misollar
keltirilgan.
