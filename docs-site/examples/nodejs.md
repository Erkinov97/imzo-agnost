# Node.js Server Integration

`imzo-agnost` kutubxonasini Node.js server aplikatsiyalarida ishlatish bo'yicha
to'liq qo'llanma.

## O'rnatish

```bash
# npm
npm install imzo-agnost

# pnpm (tavsiya qilinadi)
pnpm add imzo-agnost

# yarn
yarn add imzo-agnost
```

## Express.js Integration

### 1. Basic Express Server

```typescript
// server.ts
import express from 'express';
import cors from 'cors';
import { EIMZOApi } from 'imzo-agnost';

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// E-IMZO routes
app.use('/api/eimzo', eimzoRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
```

### 2. E-IMZO Routes

```typescript
// routes/eimzo.ts
import { Router } from 'express';
import { EimzoController } from '../controllers/eimzo.controller';
import { validateSignRequest } from '../middleware/validation';

const router = Router();
const eimzoController = new EimzoController();

// E-IMZO status tekshirish
router.get('/status', eimzoController.checkStatus);

// Sertifikatlar ro'yxati
router.get('/certificates', eimzoController.listCertificates);

// Hujjatni imzolash
router.post('/sign', validateSignRequest, eimzoController.signDocument);

// Imzoni tekshirish
router.post('/verify', eimzoController.verifySignature);

// Batch imzolash
router.post('/sign-batch', eimzoController.signBatch);

export default router;
```

### 3. E-IMZO Controller

```typescript
// controllers/eimzo.controller.ts
import { Request, Response } from 'express';
import EIMZOClient from 'imzo-agnost';
import { EimzoService } from '../services/eimzo.service';

export class EimzoController {
  private eimzoService = new EimzoService();

  // E-IMZO status
  checkStatus = async (req: Request, res: Response) => {
    try {
      const status = await this.eimzoService.getStatus();
      res.json({
        success: true,
        data: status
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'E-IMZO status check failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  // Sertifikatlar ro'yxati
  listCertificates = async (req: Request, res: Response) => {
    try {
      const certificates = await this.eimzoService.listCertificates();
      res.json({
        success: true,
        data: certificates,
        count: certificates.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to list certificates',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  // Hujjatni imzolash
  signDocument = async (req: Request, res: Response) => {
    try {
      const { certificateId, content, options = {} } = req.body;

      const result = await this.eimzoService.signDocument({
        certificateId,
        content,
        options
      });

      res.json({
        success: true,
        data: {
          signature: result.signature,
          timestamp: result.timestamp,
          certificateInfo: result.certificateInfo
        }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: 'Document signing failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  // Imzoni tekshirish
  verifySignature = async (req: Request, res: Response) => {
    try {
      const { signature, originalContent } = req.body;

      const verification = await this.eimzoService.verifySignature(
        signature,
        originalContent
      );

      res.json({
        success: true,
        data: verification
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: 'Signature verification failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  // Batch imzolash
  signBatch = async (req: Request, res: Response) => {
    try {
      const { documents, certificateId } = req.body;

      const results = await this.eimzoService.signMultiple(
        documents,
        certificateId
      );

      res.json({
        success: true,
        data: results,
        processed: results.length
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: 'Batch signing failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };
}
```

### 4. E-IMZO Service

```typescript
// services/eimzo.service.ts
import EIMZOClient from 'imzo-agnost';
import { Logger } from '../utils/logger';

interface SigningRequest {
  certificateId: string;
  content: string;
  options?: {
    timestamp?: boolean;
    detached?: boolean;
    encoding?: 'base64' | 'hex';
  };
}

interface SigningResult {
  signature: string;
  timestamp?: string;
  certificateInfo: any;
}

export class EimzoService {
  private logger = new Logger('EimzoService');
  private isInitialized = false;

  constructor() {
    this.initialize();
  }

  // E-IMZO ni ishga tushirish
  private async initialize(): Promise<void> {
    try {
      const status = await this.checkEimzoAvailability();
      if (status.available) {
        await this.installApiKeys();
        this.isInitialized = true;
        this.logger.info('E-IMZO successfully initialized');
      } else {
        this.logger.error('E-IMZO is not available');
      }
    } catch (error) {
      this.logger.error('E-IMZO initialization failed:', error);
    }
  }

  // E-IMZO mavjudligini tekshirish
  private async checkEimzoAvailability(): Promise<{
    available: boolean;
    version?: string;
  }> {
    return new Promise(resolve => {
      EIMZOClient.checkVersion(
        (major: string, minor: string) => {
          resolve({ available: true, version: `${major}.${minor}` });
        },
        (error: any, reason: string | null) => {
          this.logger.warn('E-IMZO not available:', reason);
          resolve({ available: false });
        }
      );
    });
  }

  // API kalitlarini o'rnatish
  private async installApiKeys(): Promise<void> {
    return new Promise((resolve, reject) => {
      EIMZOClient.installApiKeys(
        () => {
          this.logger.info('API keys installed successfully');
          resolve();
        },
        (error: any, reason: string | null) => {
          this.logger.error('API keys installation failed:', reason);
          reject(new Error(reason || 'API keys installation failed'));
        }
      );
    });
  }

  // Status olish
  async getStatus(): Promise<any> {
    const availability = await this.checkEimzoAvailability();
    return {
      available: availability.available,
      version: availability.version,
      initialized: this.isInitialized,
      timestamp: new Date().toISOString()
    };
  }

  // Sertifikatlar ro'yxati
  async listCertificates(): Promise<any[]> {
    if (!this.isInitialized) {
      throw new Error('E-IMZO is not initialized');
    }

    return new Promise((resolve, reject) => {
      EIMZOClient.listAllUserKeys(
        (cert: any, idx: number) => `cert_${idx}`,
        (id: string, cert: any) => ({
          id,
          name: cert.CN || 'Unknown',
          organization: cert.O || '',
          tin: cert.TIN || '',
          serialNumber: cert.serialNumber,
          validFrom: cert.validFrom,
          validTo: cert.validTo,
          issuer: cert.issuer,
          type: cert.type,
          isValid: cert.validTo > new Date()
        }),
        (certificates: any[]) => {
          this.logger.info(`Found ${certificates.length} certificates`);
          resolve(certificates);
        },
        (error: any, reason: string | null) => {
          this.logger.error('Failed to list certificates:', reason);
          reject(new Error(reason || 'Failed to list certificates'));
        }
      );
    });
  }

  // Hujjatni imzolash
  async signDocument(request: SigningRequest): Promise<SigningResult> {
    if (!this.isInitialized) {
      throw new Error('E-IMZO is not initialized');
    }

    const { certificateId, content, options = {} } = request;

    // Sertifikatni topish
    const certificates = await this.listCertificates();
    const certificate = certificates.find(cert => cert.id === certificateId);

    if (!certificate) {
      throw new Error('Certificate not found');
    }

    if (!certificate.isValid) {
      throw new Error('Certificate is not valid or expired');
    }

    return new Promise((resolve, reject) => {
      // Kalitni yuklash
      EIMZOClient.loadKey(
        certificate,
        (keyId: string) => {
          // PKCS7 imzo yaratish
          EIMZOClient.createPkcs7(
            keyId,
            content,
            options.timestamp ? 'http://timestamp.server' : null,
            (signature: string) => {
              this.logger.info('Document signed successfully');
              resolve({
                signature,
                certificateInfo: certificate,
                timestamp: options.timestamp
                  ? new Date().toISOString()
                  : undefined
              });
            },
            (error: any, reason: string | null) => {
              this.logger.error('Signing failed:', reason);
              reject(new Error(reason || 'Signing failed'));
            },
            options.detached || false,
            false // isDataBase64Encoded
          );
        },
        (error: any, reason: string | null) => {
          this.logger.error('Key loading failed:', reason);
          reject(new Error(reason || 'Key loading failed'));
        }
      );
    });
  }

  // Imzoni tekshirish
  async verifySignature(
    signature: string,
    originalContent?: string
  ): Promise<any> {
    // Bu method E-IMZO API orqali implement qilinishi kerak
    // Hozircha oddiy format tekshirish
    try {
      const isValidFormat =
        signature.includes('-----BEGIN PKCS7-----') ||
        signature.match(/^[0-9a-fA-F]+$/);

      return {
        valid: isValidFormat,
        certificate: null, // certificate info extraction needed
        timestamp: null,
        verified: isValidFormat
      };
    } catch (error) {
      throw new Error('Signature verification failed');
    }
  }

  // Ko'p hujjatni imzolash
  async signMultiple(
    documents: Array<{ id: string; content: string }>,
    certificateId: string
  ): Promise<any[]> {
    const results = [];

    for (const doc of documents) {
      try {
        const result = await this.signDocument({
          certificateId,
          content: doc.content
        });

        results.push({
          documentId: doc.id,
          success: true,
          signature: result.signature
        });
      } catch (error) {
        results.push({
          documentId: doc.id,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return results;
  }
}
```

## Fastify Integration

```typescript
// fastify-server.ts
import Fastify from 'fastify';
import cors from '@fastify/cors';
import { EimzoService } from './services/eimzo.service';

const fastify = Fastify({ logger: true });

// Plugins
fastify.register(cors);

// E-IMZO service instance
const eimzoService = new EimzoService();

// Routes
fastify.get('/api/eimzo/status', async (request, reply) => {
  try {
    const status = await eimzoService.getStatus();
    return { success: true, data: status };
  } catch (error) {
    reply.code(500);
    return {
      success: false,
      error: 'E-IMZO status check failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    };
  }
});

fastify.post('/api/eimzo/sign', async (request, reply) => {
  try {
    const { certificateId, content, options } = request.body as any;

    const result = await eimzoService.signDocument({
      certificateId,
      content,
      options
    });

    return { success: true, data: result };
  } catch (error) {
    reply.code(400);
    return {
      success: false,
      error: 'Document signing failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    };
  }
});

// Server start
const start = async () => {
  try {
    await fastify.listen({ port: 3000, host: '0.0.0.0' });
    console.log('🚀 Fastify server running on port 3000');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
```

## NestJS Integration

### 1. E-IMZO Module

```typescript
// modules/eimzo/eimzo.module.ts
import { Module } from '@nestjs/common';
import { EimzoController } from './eimzo.controller';
import { EimzoService } from './eimzo.service';

@Module({
  controllers: [EimzoController],
  providers: [EimzoService],
  exports: [EimzoService]
})
export class EimzoModule {}
```

### 2. NestJS Service

```typescript
// modules/eimzo/eimzo.service.ts
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import EIMZOClient from 'imzo-agnost';

@Injectable()
export class EimzoService implements OnModuleInit {
  private readonly logger = new Logger(EimzoService.name);
  private isInitialized = false;

  async onModuleInit() {
    await this.initialize();
  }

  private async initialize(): Promise<void> {
    try {
      const available = await this.checkAvailability();
      if (available) {
        await this.installApiKeys();
        this.isInitialized = true;
        this.logger.log('E-IMZO service initialized successfully');
      }
    } catch (error) {
      this.logger.error('E-IMZO initialization failed', error);
    }
  }

  private async checkAvailability(): Promise<boolean> {
    return new Promise(resolve => {
      EIMZOClient.checkVersion(
        (major, minor) => {
          this.logger.log(`E-IMZO ${major}.${minor} detected`);
          resolve(true);
        },
        (error, reason) => {
          this.logger.warn(`E-IMZO not available: ${reason}`);
          resolve(false);
        }
      );
    });
  }

  private async installApiKeys(): Promise<void> {
    return new Promise((resolve, reject) => {
      EIMZOClient.installApiKeys(
        () => resolve(),
        (error, reason) =>
          reject(new Error(reason || 'API keys installation failed'))
      );
    });
  }

  async getStatus() {
    return {
      initialized: this.isInitialized,
      available: await this.checkAvailability(),
      timestamp: new Date().toISOString()
    };
  }

  // Boshqa metodlar...
}
```

### 3. NestJS Controller

```typescript
// modules/eimzo/eimzo.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  HttpException,
  HttpStatus
} from '@nestjs/common';
import { EimzoService } from './eimzo.service';
import { SignDocumentDto } from './dto/sign-document.dto';

@Controller('api/eimzo')
export class EimzoController {
  constructor(private readonly eimzoService: EimzoService) {}

  @Get('status')
  async getStatus() {
    try {
      const status = await this.eimzoService.getStatus();
      return { success: true, data: status };
    } catch (error) {
      throw new HttpException(
        'E-IMZO status check failed',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('sign')
  async signDocument(@Body() signDocumentDto: SignDocumentDto) {
    try {
      const result = await this.eimzoService.signDocument(signDocumentDto);
      return { success: true, data: result };
    } catch (error) {
      throw new HttpException(
        'Document signing failed',
        HttpStatus.BAD_REQUEST
      );
    }
  }
}
```

## Middleware va Validation

### 1. Validation Middleware

```typescript
// middleware/validation.ts
import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

const signRequestSchema = Joi.object({
  certificateId: Joi.string().required(),
  content: Joi.string().required(),
  options: Joi.object({
    timestamp: Joi.boolean().default(false),
    detached: Joi.boolean().default(false),
    encoding: Joi.string().valid('base64', 'hex').default('hex')
  }).default({})
});

export const validateSignRequest = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { error, value } = signRequestSchema.validate(req.body);

  if (error) {
    return res.status(400).json({
      success: false,
      error: 'Validation error',
      details: error.details.map(d => d.message)
    });
  }

  req.body = value;
  next();
};
```

### 2. Error Handling Middleware

```typescript
// middleware/error-handler.ts
import { Request, Response, NextFunction } from 'express';
import { Logger } from '../utils/logger';

const logger = new Logger('ErrorHandler');

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error('Request error:', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    body: req.body
  });

  // E-IMZO specific errors
  if (error.message.includes('E-IMZO')) {
    return res.status(503).json({
      success: false,
      error: 'E-IMZO service unavailable',
      code: 'EIMZO_UNAVAILABLE'
    });
  }

  // Certificate errors
  if (error.message.includes('certificate')) {
    return res.status(400).json({
      success: false,
      error: 'Certificate error',
      code: 'CERTIFICATE_ERROR'
    });
  }

  // Default error
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    code: 'INTERNAL_ERROR'
  });
};
```

## Environment Configuration

```typescript
// config/environment.ts
import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  eimzo: {
    timeoutMs: parseInt(process.env.EIMZO_TIMEOUT_MS || '30000'),
    retryAttempts: parseInt(process.env.EIMZO_RETRY_ATTEMPTS || '3'),
    apiKeys: process.env.EIMZO_API_KEYS?.split(',') || [],
    timestampServer:
      process.env.EIMZO_TIMESTAMP_SERVER || 'http://timestamp.server'
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'json'
  }
};
```

## Docker Configuration

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

# Dependencies
COPY package*.json ./
RUN npm ci --only=production

# App source
COPY . .

# Build
RUN npm run build

# Non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S eimzo -u 1001
USER eimzo

EXPOSE 3000

CMD ["node", "dist/server.js"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  eimzo-server:
    build: .
    ports:
      - '3000:3000'
    environment:
      - NODE_ENV=production
      - PORT=3000
      - EIMZO_TIMEOUT_MS=30000
    volumes:
      - ./logs:/app/logs
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - '80:80'
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - eimzo-server
```

Bu Node.js integration misollar professional darajada `imzo-agnost`
kutubxonasini server-side aplikatsiyalarda ishlatishning to'liq yo'llarini
ko'rsatadi.
