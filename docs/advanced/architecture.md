# Architecture Overview

Understanding the E-IMZO Agnostic Library architecture and design principles.

## 🏗️ System Architecture

E-IMZO Agnostic Library follows a modular, plugin-based architecture designed
for flexibility, maintainability, and ease of use.

```
┌─────────────────────────────────────────────────────────────┐
│                    Application Layer                         │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────────┐ │
│  │   Browser   │ │   Node.js   │ │     Electron App       │ │
│  │    App      │ │    Server   │ │                        │ │
│  └─────────────┘ └─────────────┘ └─────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                  E-IMZO Agnostic Library                     │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                    Public API                          │ │
│  │    eimzoApi, pfxPlugin, pkcs7Plugin, ftjcPlugin...    │ │
│  └─────────────────────────────────────────────────────────┘ │
│                               │                              │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                  Plugin System                         │ │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐ │ │
│  │  │ PFX Plugin  │ │PKCS7 Plugin │ │   FTJC Plugin      │ │ │
│  │  └─────────────┘ └─────────────┘ └─────────────────────┘ │ │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐ │ │
│  │  │ CRL Plugin  │ │ X509 Plugin │ │   Custom Plugins   │ │ │
│  │  └─────────────┘ └─────────────┘ └─────────────────────┘ │ │
│  └─────────────────────────────────────────────────────────┘ │
│                               │                              │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                    Core System                         │ │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐ │ │
│  │  │Plugin Base  │ │   Types     │ │   Utilities        │ │ │
│  │  └─────────────┘ └─────────────┘ └─────────────────────┘ │ │
│  └─────────────────────────────────────────────────────────┘ │
│                               │                              │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │               Communication Layer                       │ │
│  │              WebSocket Client (CAPIWS)                 │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    E-IMZO System                             │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                  E-IMZO Service                        │ │
│  │            (Windows Service / Daemon)                  │ │
│  │              Port: 127.0.0.1:64443                    │ │
│  └─────────────────────────────────────────────────────────┘ │
│                               │                              │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │               Certificate Storage                       │ │
│  │        Windows Certificate Store / File System         │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## 🔧 Core Components

### 1. Communication Layer (CAPIWS)

The foundation of the library that handles WebSocket communication with E-IMZO.

```typescript
// capiws.ts
class CAPIWS {
  private ws: WebSocket | null = null;
  private callbacks: Map<string, Function> = new Map();

  async connect(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket('wss://127.0.0.1:64443/');

      this.ws.onopen = () => resolve(true);
      this.ws.onerror = error => reject(error);
      this.ws.onmessage = event => this.handleMessage(event);
    });
  }

  async call(method: string, params: any[]): Promise<any> {
    const id = this.generateId();
    const message = {
      id,
      method,
      params
    };

    return new Promise((resolve, reject) => {
      this.callbacks.set(id, { resolve, reject });
      this.ws?.send(JSON.stringify(message));
    });
  }
}
```

**Responsibilities:**

- WebSocket connection management
- Message serialization/deserialization
- Request/response correlation
- Connection retry logic
- Error handling

### 2. Plugin Base System

Provides the foundation for all plugins with common functionality.

```typescript
// plugin-base.ts
export abstract class EIMZOPlugin {
  protected name: string;
  protected capiws: CAPIWS;

  constructor(name: string) {
    this.name = name;
    this.capiws = new CAPIWS();
  }

  protected async callEimzoMethod(
    method: string,
    params: unknown[] = []
  ): Promise<unknown> {
    await this.ensureConnected();
    return this.capiws.call(method, params);
  }

  protected async ensureConnected(): Promise<void> {
    if (!this.capiws.isConnected()) {
      await this.capiws.connect();
    }
  }

  // Plugin lifecycle methods
  abstract isAvailable(): Promise<boolean>;
}
```

**Features:**

- Connection management
- Method call abstraction
- Error handling standardization
- Lifecycle management
- Type safety

### 3. Plugin System

Each plugin encapsulates specific E-IMZO functionality.

```typescript
// Plugin structure example
export class PFXPlugin extends EIMZOPlugin {
  constructor() {
    super('pfx');
  }

  async listCertificates(): Promise<Certificate[]> {
    const result = await this.callEimzoMethod('PFX_LIST_CERTIFICATES');
    return this.parseCertificates(result);
  }

  async loadKeyFromId(certId: string, password: string): Promise<boolean> {
    return this.callEimzoMethod('PFX_LOAD_KEY', [certId, password]);
  }

  async isAvailable(): Promise<boolean> {
    try {
      await this.callEimzoMethod('PFX_CHECK_AVAILABILITY');
      return true;
    } catch {
      return false;
    }
  }
}
```

## 🎯 Design Principles

### 1. Modularity

Each plugin is self-contained and independent:

```typescript
// Only import what you need
import { pfxPlugin } from 'imzo-agnost'; // Only PFX functionality
import { pfxPlugin, pkcs7Plugin } from 'imzo-agnost'; // PFX + PKCS7
import * as eimzo from 'imzo-agnost'; // Everything
```

### 2. Type Safety

Comprehensive TypeScript support:

```typescript
// Strong typing throughout
interface Certificate {
    serialNumber: string;
    subjectName: string;
    issuerName: string;
    validFrom: string;
    validTo: string;
    keyUsage: string;
    publicKey: string;
}

// Type-safe plugin methods
async listCertificates(): Promise<Certificate[]> {
    // Implementation
}
```

### 3. Error Handling

Consistent error handling across all plugins:

```typescript
class EIMZOError extends Error {
  public readonly code: string;
  public readonly details?: unknown;

  constructor(message: string, code: string, details?: unknown) {
    super(message);
    this.code = code;
    this.details = details;
    this.name = 'EIMZOError';
  }
}

// Usage in plugins
try {
  return await this.callEimzoMethod('SOME_METHOD', params);
} catch (error) {
  throw new EIMZOError('Operation failed', 'OPERATION_ERROR', error);
}
```

### 4. Async/Promise-Based

All operations are asynchronous:

```typescript
// Everything returns promises
const certificates = await pfxPlugin.listCertificates();
const signature = await pkcs7Plugin.createPKCS7(data, certId);
const isValid = await pkcs7Plugin.verifyPKCS7(signature, data);
```

## 🔄 Data Flow

### 1. Method Call Flow

```
Application
    │
    ▼
Plugin Method (e.g., pfxPlugin.listCertificates())
    │
    ▼
Plugin Base (callEimzoMethod)
    │
    ▼
CAPIWS (WebSocket call)
    │
    ▼
E-IMZO Service
    │
    ▼
Certificate Store / Cryptographic Operations
    │
    ▼
Response (JSON)
    │
    ▼
CAPIWS (Parse response)
    │
    ▼
Plugin Base (Handle result/error)
    │
    ▼
Plugin Method (Transform data)
    │
    ▼
Application (Typed result)
```

### 2. Error Propagation

```
E-IMZO Error
    │
    ▼
CAPIWS (Catch WebSocket/JSON errors)
    │
    ▼
Plugin Base (Wrap in EIMZOError)
    │
    ▼
Plugin Method (Add context)
    │
    ▼
Application (Handle typed error)
```

## 🏭 Plugin Architecture

### Plugin Registration

```typescript
// core/plugin-manager.ts
class PluginManager {
  private static plugins = new Map<string, EIMZOPlugin>();

  static registerPlugin(plugin: EIMZOPlugin): void {
    this.plugins.set(plugin.name, plugin);
  }

  static getPlugin(name: string): EIMZOPlugin | undefined {
    return this.plugins.get(name);
  }

  static getAvailablePlugins(): string[] {
    return Array.from(this.plugins.keys());
  }
}

// Automatic registration
export const pfxPlugin = new PFXPlugin();
PluginManager.registerPlugin(pfxPlugin);
```

### Plugin Lifecycle

```typescript
abstract class EIMZOPlugin {
  // Initialization (lazy)
  protected async initialize(): Promise<void> {
    if (!this.initialized) {
      await this.setup();
      this.initialized = true;
    }
  }

  // Cleanup
  async cleanup(): Promise<void> {
    if (this.capiws) {
      await this.capiws.disconnect();
    }
  }

  // Health check
  abstract isAvailable(): Promise<boolean>;
}
```

## 🔧 Configuration System

### Environment-Based Configuration

```typescript
// config.ts
interface EIMZOConfig {
  host: string;
  port: number;
  secure: boolean;
  timeout: number;
  retryAttempts: number;
}

const defaultConfig: EIMZOConfig = {
  host: '127.0.0.1',
  port: 64443,
  secure: true,
  timeout: 30000,
  retryAttempts: 3
};

// Environment overrides
const config: EIMZOConfig = {
  ...defaultConfig,
  host: process.env.EIMZO_HOST || defaultConfig.host,
  port: parseInt(process.env.EIMZO_PORT || defaultConfig.port.toString()),
  timeout: parseInt(
    process.env.EIMZO_TIMEOUT || defaultConfig.timeout.toString()
  )
};
```

### Plugin Configuration

```typescript
// Individual plugin configuration
interface PluginConfig {
  enabled: boolean;
  timeout?: number;
  retryAttempts?: number;
  customOptions?: Record<string, unknown>;
}

const pluginConfigs: Record<string, PluginConfig> = {
  pfx: { enabled: true, timeout: 10000 },
  pkcs7: { enabled: true, timeout: 15000 },
  ftjc: { enabled: true, customOptions: { validateSchema: true } }
};
```

## 🔄 Build System Architecture

### Multi-Format Output

The library supports multiple output formats for maximum compatibility:

```javascript
// tsup.config.ts
export default defineConfig([
  {
    entry: ['src/index.ts'],
    format: ['esm', 'cjs', 'iife'],
    dts: true,
    sourcemap: true,
    clean: true,
    globalName: 'EIMZOAgnost', // For IIFE
    noExternal: ['ws'] // Bundle dependencies for browser
  }
]);
```

**Output Files:**

- `dist/index.mjs` - ES Modules (56.64KB)
- `dist/index.cjs` - CommonJS (56.81KB)
- `dist/index.js` - IIFE/Browser Global (60.36KB)
- `dist/index.d.ts` - TypeScript declarations (35.82KB)

### Dependency Management

```json
{
  "dependencies": {
    "ws": "^8.x.x"
  },
  "peerDependencies": {
    "typescript": ">=4.5.0"
  },
  "devDependencies": {
    "tsup": "^8.5.0",
    "typescript": "^5.9.2"
  }
}
```

## 🔐 Security Architecture

### Connection Security

```typescript
// Secure WebSocket connection
class SecureConnection {
  private validateCertificate(cert: any): boolean {
    // Validate E-IMZO certificate
    return cert.issuer.includes('E-IMZO');
  }

  private createSecureWebSocket(): WebSocket {
    return new WebSocket('wss://127.0.0.1:64443/', {
      rejectUnauthorized: false, // E-IMZO uses self-signed cert
      checkServerIdentity: this.validateCertificate
    });
  }
}
```

### Data Protection

```typescript
// Sensitive data handling
class DataProtection {
  static sanitizeError(error: Error): Error {
    const sensitivePatterns = [/password/i, /key/i, /certificate.*data/i];

    let message = error.message;
    sensitivePatterns.forEach(pattern => {
      message = message.replace(pattern, '[REDACTED]');
    });

    return new Error(message);
  }
}
```

## 🚀 Performance Considerations

### Connection Pooling

```typescript
class ConnectionPool {
  private connections: Map<string, CAPIWS> = new Map();
  private maxConnections = 5;

  async getConnection(key: string): Promise<CAPIWS> {
    if (!this.connections.has(key)) {
      if (this.connections.size >= this.maxConnections) {
        // Implement LRU eviction
        this.evictOldest();
      }

      const connection = new CAPIWS();
      await connection.connect();
      this.connections.set(key, connection);
    }

    return this.connections.get(key)!;
  }
}
```

### Method Caching

```typescript
class MethodCache {
  private cache = new Map<string, { result: any; expiry: number }>();
  private defaultTTL = 60000; // 1 minute

  get(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && cached.expiry > Date.now()) {
      return cached.result;
    }
    this.cache.delete(key);
    return null;
  }

  set(key: string, result: any, ttl = this.defaultTTL): void {
    this.cache.set(key, {
      result,
      expiry: Date.now() + ttl
    });
  }
}
```

## 🔄 Extension Points

### Custom Plugin Development

```typescript
// Template for custom plugins
abstract class CustomEIMZOPlugin extends EIMZOPlugin {
  // Required methods
  abstract getPluginInfo(): PluginInfo;
  abstract validateRequirements(): Promise<boolean>;

  // Optional overrides
  protected async onInitialize(): Promise<void> {
    // Custom initialization logic
  }

  protected async onCleanup(): Promise<void> {
    // Custom cleanup logic
  }
}

// Plugin registration
export function registerCustomPlugin(plugin: CustomEIMZOPlugin): void {
  if (plugin.validateRequirements()) {
    PluginManager.registerPlugin(plugin);
  } else {
    console.warn(`Plugin ${plugin.name} requirements not met`);
  }
}
```

### Middleware System

```typescript
interface Middleware {
  name: string;
  before?(method: string, params: any[]): Promise<any[]>;
  after?(method: string, result: any): Promise<any>;
  onError?(method: string, error: Error): Promise<Error>;
}

class MiddlewareManager {
  private middlewares: Middleware[] = [];

  use(middleware: Middleware): void {
    this.middlewares.push(middleware);
  }

  async executeMiddlewares(
    phase: 'before' | 'after' | 'onError',
    context: any
  ): Promise<any> {
    for (const middleware of this.middlewares) {
      if (middleware[phase]) {
        context = await middleware[phase]!(context);
      }
    }
    return context;
  }
}
```

## 📊 Monitoring & Debugging

### Debug Mode

```typescript
class DebugManager {
  private static enabled = process.env.EIMZO_DEBUG === 'true';

  static log(category: string, message: string, data?: any): void {
    if (this.enabled) {
      console.log(`[EIMZO:${category}] ${message}`, data || '');
    }
  }

  static time(label: string): void {
    if (this.enabled) {
      console.time(`[EIMZO] ${label}`);
    }
  }

  static timeEnd(label: string): void {
    if (this.enabled) {
      console.timeEnd(`[EIMZO] ${label}`);
    }
  }
}
```

### Performance Metrics

```typescript
class PerformanceMetrics {
  private metrics = new Map<string, number[]>();

  recordTime(operation: string, duration: number): void {
    if (!this.metrics.has(operation)) {
      this.metrics.set(operation, []);
    }
    this.metrics.get(operation)!.push(duration);
  }

  getAverageTime(operation: string): number {
    const times = this.metrics.get(operation) || [];
    return times.reduce((a, b) => a + b, 0) / times.length;
  }

  getReport(): Record<string, any> {
    const report: Record<string, any> = {};

    for (const [operation, times] of this.metrics) {
      report[operation] = {
        count: times.length,
        average: this.getAverageTime(operation),
        min: Math.min(...times),
        max: Math.max(...times)
      };
    }

    return report;
  }
}
```

## 🔗 Related Documentation

- [Plugin Development Guide](./custom-plugins.md)
- [Performance Optimization](./performance.md)
- [Security Best Practices](./security.md)
- [API Reference](../api.md)
