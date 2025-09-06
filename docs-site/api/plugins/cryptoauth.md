# CryptoAuth Plugin API Reference

CryptoAuth plugin autentifikatsiya va kripto operatsiyalari uchun mo'ljallangan.
Bu plugin E-IMZO tizimida foydalanuvchi autentifikatsiyasi va xavfsiz aloqa
o'rnatish uchun ishlatiladi.

## Overview

CryptoAuth plugin quyidagi funksiyalarni taqdim etadi:

- Foydalanuvchi autentifikatsiyasi
- Challenge-Response protokoli
- Session management
- Cryptographic operations
- Token management
- Multi-factor authentication

## Import

```typescript
// ES6 import
import { cryptoAuthPlugin } from 'imzo-agnost';

// CommonJS
const { cryptoAuthPlugin } = require('imzo-agnost');

// Global object (browser)
window.eimzoApi.cryptoAuth;
```

## Types

```typescript
interface AuthResponse {
  success: boolean;
  sessionId?: string;
  token?: string;
  expiresAt?: string;
  reason?: string;
}

interface ChallengeResponse {
  success: boolean;
  challenge: string;
  nonce: string;
  expiresAt: string;
}

interface AuthCredentials {
  username?: string;
  password?: string;
  pin?: string;
  keyId?: string;
  certificate?: string;
}

interface SessionInfo {
  sessionId: string;
  isActive: boolean;
  expiresAt: string;
  permissions: string[];
}

interface AuthOptions {
  method: 'password' | 'pin' | 'certificate' | 'biometric';
  timeout?: number;
  rememberSession?: boolean;
  multiFactorRequired?: boolean;
}
```

## Authentication Methods

### authenticateAsync()

Asosiy autentifikatsiya methodi.

**Password Authentication:**

```typescript
try {
  const credentials: AuthCredentials = {
    username: 'user123',
    password: 'securePassword123'
  };

  const options: AuthOptions = {
    method: 'password',
    timeout: 30000,
    rememberSession: true
  };

  const result = await cryptoAuthPlugin.authenticateAsync(credentials, options);

  if (result.success) {
    console.log('✅ Password authentication successful');
    console.log('Session ID:', result.sessionId);
    console.log('Token:', result.token);
    console.log('Expires at:', result.expiresAt);
  }
} catch (error) {
  console.error('❌ Password authentication failed:', error);
}
```

**PIN Authentication:**

```typescript
try {
  const credentials: AuthCredentials = {
    pin: '123456',
    keyId: 'user_key_id'
  };

  const result = await cryptoAuthPlugin.authenticateAsync(credentials, {
    method: 'pin',
    timeout: 15000
  });

  if (result.success) {
    console.log('✅ PIN authentication successful');
    console.log('Session:', result.sessionId);
  }
} catch (error) {
  console.error('❌ PIN authentication failed:', error);
}
```

**Certificate Authentication:**

```typescript
try {
  const credentials: AuthCredentials = {
    certificate: 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8A...',
    keyId: 'cert_key_id'
  };

  const result = await cryptoAuthPlugin.authenticateAsync(credentials, {
    method: 'certificate'
  });

  if (result.success) {
    console.log('✅ Certificate authentication successful');
  }
} catch (error) {
  console.error('❌ Certificate authentication failed:', error);
}
```

### challengeAsync()

Challenge-Response autentifikatsiyasi uchun challenge olish.

```typescript
try {
  const challenge = await cryptoAuthPlugin.challengeAsync();

  if (challenge.success) {
    console.log('Challenge received:');
    console.log('Challenge data:', challenge.challenge);
    console.log('Nonce:', challenge.nonce);
    console.log('Expires at:', challenge.expiresAt);

    // Challenge ni imzolash va response yuborish
    const response = await signChallenge(challenge.challenge);
    const authResult = await cryptoAuthPlugin.respondToChallengeAsync(
      challenge.nonce,
      response
    );

    if (authResult.success) {
      console.log('✅ Challenge-response authentication successful');
    }
  }
} catch (error) {
  console.error('❌ Challenge failed:', error);
}
```

### respondToChallengeAsync()

Challenge ga javob berish.

```typescript
try {
  const nonce = 'received_nonce_value';
  const signedChallenge = 'signed_challenge_response';

  const result = await cryptoAuthPlugin.respondToChallengeAsync(
    nonce,
    signedChallenge
  );

  if (result.success) {
    console.log('✅ Challenge response accepted');
    console.log('Session ID:', result.sessionId);
  }
} catch (error) {
  console.error('❌ Challenge response failed:', error);
}
```

## Session Management

### getSessionInfoAsync()

Sessiya ma'lumotlarini olish.

```typescript
try {
  const sessionId = 'current_session_id';

  const info = await cryptoAuthPlugin.getSessionInfoAsync(sessionId);

  console.log('Session Information:');
  console.log('Session ID:', info.sessionId);
  console.log('Active:', info.isActive);
  console.log('Expires at:', info.expiresAt);
  console.log('Permissions:', info.permissions);
} catch (error) {
  console.error('❌ Session info failed:', error);
}
```

### refreshSessionAsync()

Sessiyani yangilash.

```typescript
try {
  const sessionId = 'current_session_id';

  const result = await cryptoAuthPlugin.refreshSessionAsync(sessionId);

  if (result.success) {
    console.log('✅ Session refreshed');
    console.log('New expiry:', result.expiresAt);
  }
} catch (error) {
  console.error('❌ Session refresh failed:', error);
}
```

### logoutAsync()

Sessiyani tugatish.

```typescript
try {
  const sessionId = 'current_session_id';

  const result = await cryptoAuthPlugin.logoutAsync(sessionId);

  if (result.success) {
    console.log('✅ Logged out successfully');
  }
} catch (error) {
  console.error('❌ Logout failed:', error);
}
```

### validateSessionAsync()

Sessiya yaroqliligini tekshirish.

```typescript
try {
  const sessionId = 'session_to_validate';

  const isValid = await cryptoAuthPlugin.validateSessionAsync(sessionId);

  console.log('Session valid:', isValid.success);

  if (!isValid.success) {
    console.log('Session expired or invalid');
    // Redirect to login
  }
} catch (error) {
  console.error('❌ Session validation failed:', error);
}
```

## Token Management

### generateTokenAsync()

Autentifikatsiya tokeni yaratish.

```typescript
try {
  const tokenOptions = {
    expiresIn: '24h',
    permissions: ['read', 'write', 'sign'],
    sessionId: 'current_session'
  };

  const token = await cryptoAuthPlugin.generateTokenAsync(tokenOptions);

  if (token.success) {
    console.log('✅ Token generated');
    console.log('Token:', token.token);
    console.log('Expires at:', token.expiresAt);
  }
} catch (error) {
  console.error('❌ Token generation failed:', error);
}
```

### validateTokenAsync()

Token yaroqliligini tekshirish.

```typescript
try {
  const tokenValue = 'jwt_token_string';

  const validation = await cryptoAuthPlugin.validateTokenAsync(tokenValue);

  if (validation.success) {
    console.log('✅ Token is valid');
    console.log('User ID:', validation.userId);
    console.log('Permissions:', validation.permissions);
    console.log('Expires at:', validation.expiresAt);
  } else {
    console.log('❌ Token is invalid or expired');
  }
} catch (error) {
  console.error('❌ Token validation failed:', error);
}
```

### refreshTokenAsync()

Token yangilash.

```typescript
try {
  const oldToken = 'expiring_token';

  const newToken = await cryptoAuthPlugin.refreshTokenAsync(oldToken);

  if (newToken.success) {
    console.log('✅ Token refreshed');
    console.log('New token:', newToken.token);
  }
} catch (error) {
  console.error('❌ Token refresh failed:', error);
}
```

## Multi-Factor Authentication

### initiateMfaAsync()

Ko'p faktorli autentifikatsiya boshlash.

```typescript
try {
  const mfaOptions = {
    primaryMethod: 'password',
    secondaryMethod: 'sms',
    phoneNumber: '+998901234567'
  };

  const mfaInit = await cryptoAuthPlugin.initiateMfaAsync(mfaOptions);

  if (mfaInit.success) {
    console.log('✅ MFA initiated');
    console.log('MFA ID:', mfaInit.mfaId);
    console.log('SMS sent to:', mfaOptions.phoneNumber);
  }
} catch (error) {
  console.error('❌ MFA initiation failed:', error);
}
```

### completeMfaAsync()

MFA jarayonini yakunlash.

```typescript
try {
  const mfaId = 'mfa_session_id';
  const verificationCode = '123456'; // SMS kod

  const mfaResult = await cryptoAuthPlugin.completeMfaAsync(
    mfaId,
    verificationCode
  );

  if (mfaResult.success) {
    console.log('✅ MFA completed successfully');
    console.log('Session ID:', mfaResult.sessionId);
    console.log('Access token:', mfaResult.token);
  }
} catch (error) {
  console.error('❌ MFA completion failed:', error);
}
```

### getMfaMethodsAsync()

Mavjud MFA metodlarini olish.

```typescript
try {
  const methods = await cryptoAuthPlugin.getMfaMethodsAsync();

  if (methods.success) {
    console.log('Available MFA methods:');
    methods.list.forEach(method => {
      console.log(`- ${method.type}: ${method.description}`);
      console.log(`  Enabled: ${method.enabled}`);
    });
  }
} catch (error) {
  console.error('❌ MFA methods retrieval failed:', error);
}
```

## Biometric Authentication

### initiateBiometricAsync()

Biometrik autentifikatsiya boshlash.

```typescript
try {
  const biometricOptions = {
    type: 'fingerprint', // 'fingerprint', 'face', 'voice'
    timeout: 30000
  };

  const result =
    await cryptoAuthPlugin.initiateBiometricAsync(biometricOptions);

  if (result.success) {
    console.log('✅ Biometric authentication initiated');
    console.log('Please provide biometric sample...');
  }
} catch (error) {
  console.error('❌ Biometric initiation failed:', error);
}
```

### verifyBiometricAsync()

Biometrik ma'lumotlarni tekshirish.

```typescript
try {
  const biometricData = 'captured_biometric_template';
  const userId = 'user_identifier';

  const verification = await cryptoAuthPlugin.verifyBiometricAsync(
    biometricData,
    userId
  );

  if (verification.success) {
    console.log('✅ Biometric verification successful');
    console.log('Match score:', verification.matchScore);
    console.log('Session ID:', verification.sessionId);
  }
} catch (error) {
  console.error('❌ Biometric verification failed:', error);
}
```

## Complete Examples

### Full Authentication Workflow

```typescript
async function completeAuthWorkflow() {
  try {
    console.log('🔐 Starting authentication workflow...');

    // 1. Primary authentication (password)
    console.log('1. Primary authentication...');
    const primaryAuth = await cryptoAuthPlugin.authenticateAsync(
      {
        username: 'user123',
        password: 'securePassword'
      },
      {
        method: 'password',
        multiFactorRequired: true
      }
    );

    if (!primaryAuth.success) {
      throw new Error('Primary authentication failed');
    }
    console.log('✅ Primary authentication successful');

    // 2. Initiate MFA
    console.log('2. Initiating MFA...');
    const mfaInit = await cryptoAuthPlugin.initiateMfaAsync({
      primaryMethod: 'password',
      secondaryMethod: 'sms',
      phoneNumber: '+998901234567'
    });

    if (!mfaInit.success) {
      throw new Error('MFA initiation failed');
    }
    console.log('✅ MFA initiated, SMS sent');

    // 3. Simulate user entering SMS code
    const smsCode = await promptUserForSmsCode(); // User input

    // 4. Complete MFA
    console.log('3. Completing MFA...');
    const mfaComplete = await cryptoAuthPlugin.completeMfaAsync(
      mfaInit.mfaId,
      smsCode
    );

    if (!mfaComplete.success) {
      throw new Error('MFA completion failed');
    }
    console.log('✅ MFA completed successfully');

    // 5. Generate session token
    console.log('4. Generating session token...');
    const token = await cryptoAuthPlugin.generateTokenAsync({
      expiresIn: '24h',
      permissions: ['read', 'write', 'sign'],
      sessionId: mfaComplete.sessionId
    });

    if (!token.success) {
      throw new Error('Token generation failed');
    }
    console.log('✅ Token generated');

    // 6. Validate session
    console.log('5. Validating session...');
    const sessionInfo = await cryptoAuthPlugin.getSessionInfoAsync(
      mfaComplete.sessionId
    );

    console.log('Session Details:');
    console.log(`  Session ID: ${sessionInfo.sessionId}`);
    console.log(`  Active: ${sessionInfo.isActive}`);
    console.log(`  Expires: ${sessionInfo.expiresAt}`);
    console.log(`  Permissions: ${sessionInfo.permissions.join(', ')}`);

    console.log('🎉 Authentication workflow completed!');

    return {
      sessionId: mfaComplete.sessionId,
      token: token.token,
      expiresAt: token.expiresAt,
      permissions: sessionInfo.permissions
    };
  } catch (error) {
    console.error('❌ Authentication workflow failed:', error);
    throw error;
  }
}

// Helper function for user input simulation
async function promptUserForSmsCode(): Promise<string> {
  // In real application, this would be user input
  return new Promise(resolve => {
    // Simulate user entering code after delay
    setTimeout(() => {
      resolve('123456'); // Mock SMS code
    }, 2000);
  });
}
```

### Challenge-Response Authentication

```typescript
async function challengeResponseAuth(keyId: string) {
  try {
    console.log('🔑 Starting challenge-response authentication...');

    // 1. Request challenge
    console.log('1. Requesting challenge...');
    const challenge = await cryptoAuthPlugin.challengeAsync();

    if (!challenge.success) {
      throw new Error('Challenge request failed');
    }

    console.log('✅ Challenge received');
    console.log('Challenge:', challenge.challenge);
    console.log('Nonce:', challenge.nonce);

    // 2. Sign challenge with user's private key
    console.log('2. Signing challenge...');
    const signedChallenge = await signChallengeWithKey(
      challenge.challenge,
      keyId
    );

    // 3. Submit response
    console.log('3. Submitting response...');
    const authResult = await cryptoAuthPlugin.respondToChallengeAsync(
      challenge.nonce,
      signedChallenge
    );

    if (!authResult.success) {
      throw new Error('Challenge response failed');
    }

    console.log('✅ Challenge-response authentication successful');
    console.log('Session ID:', authResult.sessionId);

    // 4. Validate session
    const sessionValid = await cryptoAuthPlugin.validateSessionAsync(
      authResult.sessionId
    );

    console.log('Session validation:', sessionValid.success);

    return {
      authenticated: true,
      sessionId: authResult.sessionId,
      method: 'challenge-response'
    };
  } catch (error) {
    console.error('❌ Challenge-response auth failed:', error);
    throw error;
  }
}

async function signChallengeWithKey(
  challenge: string,
  keyId: string
): Promise<string> {
  // This would use PKCS7 or other signing plugins
  // Placeholder implementation
  return btoa(challenge + '_signed_with_' + keyId);
}
```

### Session Management Example

```typescript
async function sessionManagementExample() {
  try {
    console.log('📋 Session management example...');

    // 1. Authenticate and get session
    const auth = await cryptoAuthPlugin.authenticateAsync(
      { username: 'user123', password: 'pass123' },
      { method: 'password', rememberSession: true }
    );

    if (!auth.success) {
      throw new Error('Authentication failed');
    }

    const sessionId = auth.sessionId!;
    console.log('✅ Authenticated, session:', sessionId);

    // 2. Check session info
    console.log('📊 Session info:');
    const info = await cryptoAuthPlugin.getSessionInfoAsync(sessionId);
    console.log(`  Active: ${info.isActive}`);
    console.log(`  Expires: ${info.expiresAt}`);

    // 3. Simulate some time passing
    console.log('⏳ Simulating time passage...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    // 4. Refresh session
    console.log('🔄 Refreshing session...');
    const refreshed = await cryptoAuthPlugin.refreshSessionAsync(sessionId);

    if (refreshed.success) {
      console.log('✅ Session refreshed, new expiry:', refreshed.expiresAt);
    }

    // 5. Generate API token
    console.log('🎫 Generating API token...');
    const token = await cryptoAuthPlugin.generateTokenAsync({
      expiresIn: '1h',
      permissions: ['api:read', 'api:write'],
      sessionId: sessionId
    });

    if (token.success) {
      console.log('✅ API token generated');
    }

    // 6. Validate token
    console.log('✔️ Validating token...');
    const tokenValid = await cryptoAuthPlugin.validateTokenAsync(token.token!);

    if (tokenValid.success) {
      console.log('✅ Token is valid');
      console.log('Token permissions:', tokenValid.permissions);
    }

    // 7. Logout
    console.log('👋 Logging out...');
    const logout = await cryptoAuthPlugin.logoutAsync(sessionId);

    if (logout.success) {
      console.log('✅ Logged out successfully');
    }

    // 8. Verify session is terminated
    const finalValidation =
      await cryptoAuthPlugin.validateSessionAsync(sessionId);
    console.log(
      'Final session status:',
      finalValidation.success ? 'Active' : 'Terminated'
    );
  } catch (error) {
    console.error('❌ Session management failed:', error);
  }
}
```

### Biometric Authentication Example

```typescript
async function biometricAuthExample() {
  try {
    console.log('👆 Starting biometric authentication...');

    // 1. Check available biometric methods
    console.log('1. Checking biometric methods...');
    const methods = await cryptoAuthPlugin.getMfaMethodsAsync();

    const biometricMethods = methods.list.filter(
      m =>
        m.type.includes('biometric') ||
        m.type.includes('fingerprint') ||
        m.type.includes('face')
    );

    if (biometricMethods.length === 0) {
      throw new Error('No biometric methods available');
    }

    console.log('Available biometric methods:');
    biometricMethods.forEach(method => {
      console.log(`  - ${method.type}: ${method.description}`);
    });

    // 2. Initiate fingerprint authentication
    console.log('2. Initiating fingerprint authentication...');
    const biometricInit = await cryptoAuthPlugin.initiateBiometricAsync({
      type: 'fingerprint',
      timeout: 30000
    });

    if (!biometricInit.success) {
      throw new Error('Biometric initiation failed');
    }

    console.log('✅ Please place finger on sensor...');

    // 3. Simulate biometric capture
    await new Promise(resolve => setTimeout(resolve, 3000));
    const biometricData = 'captured_fingerprint_template_data';

    // 4. Verify biometric
    console.log('3. Verifying biometric...');
    const verification = await cryptoAuthPlugin.verifyBiometricAsync(
      biometricData,
      'user123'
    );

    if (!verification.success) {
      throw new Error('Biometric verification failed');
    }

    console.log('✅ Biometric authentication successful');
    console.log('Match score:', verification.matchScore);
    console.log('Session ID:', verification.sessionId);

    // 5. Get session info
    const sessionInfo = await cryptoAuthPlugin.getSessionInfoAsync(
      verification.sessionId
    );

    console.log('🎉 Biometric authentication completed!');
    console.log('Session expires:', sessionInfo.expiresAt);

    return {
      authenticated: true,
      method: 'biometric',
      sessionId: verification.sessionId,
      matchScore: verification.matchScore
    };
  } catch (error) {
    console.error('❌ Biometric authentication failed:', error);
    throw error;
  }
}
```

## Callback API (Legacy)

### authenticate() - Callback Version

```typescript
cryptoAuthPlugin.authenticate(
  {
    username: 'user123',
    password: 'password123'
  },
  {
    method: 'password'
  },
  (event, response) => {
    if (response.success) {
      console.log('Callback: Authentication successful');
      console.log('Session ID:', response.sessionId);
    } else {
      console.error('Callback: Authentication failed:', response.reason);
    }
  },
  error => {
    console.error('Callback: Authentication error:', error);
  }
);
```

### challenge() - Callback Version

```typescript
cryptoAuthPlugin.challenge(
  (event, response) => {
    if (response.success) {
      console.log('Callback: Challenge received');
      console.log('Challenge:', response.challenge);
      console.log('Nonce:', response.nonce);
    }
  },
  error => {
    console.error('Callback: Challenge error:', error);
  }
);
```

## Error Handling

### Authentication Errors

```typescript
try {
  const result = await cryptoAuthPlugin.authenticateAsync(credentials, options);
} catch (error) {
  if (error.message.includes('invalid credentials')) {
    console.error('❌ Username or password incorrect');
  } else if (error.message.includes('account locked')) {
    console.error('❌ Account temporarily locked');
  } else if (error.message.includes('expired')) {
    console.error('❌ Password expired');
  } else if (error.message.includes('mfa required')) {
    console.error('❌ Multi-factor authentication required');
  } else {
    console.error('❌ Authentication error:', error.message);
  }
}
```

### Session Errors

```typescript
try {
  const session = await cryptoAuthPlugin.validateSessionAsync(sessionId);
} catch (error) {
  if (error.message.includes('session not found')) {
    console.error('❌ Session does not exist');
  } else if (error.message.includes('session expired')) {
    console.error('❌ Session has expired');
  } else if (error.message.includes('session invalid')) {
    console.error('❌ Session is invalid');
  } else {
    console.error('❌ Session error:', error.message);
  }
}
```

## Best Practices

1. **Secure Credentials**: Never log passwords or sensitive data
2. **Session Management**: Always validate sessions before operations
3. **Token Expiry**: Handle token expiration gracefully
4. **MFA Implementation**: Use multi-factor when possible
5. **Error Handling**: Provide user-friendly error messages
6. **Timeout Management**: Set appropriate timeouts
7. **Cleanup**: Always logout when done
8. **Rate Limiting**: Handle authentication rate limits
9. **Biometric Fallback**: Provide alternative auth methods
10. **Security Logging**: Log authentication events for audit
