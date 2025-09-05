# Angular Integration

`imzo-agnost` kutubxonasini Angular aplikatsiyalarida ishlatish bo'yicha to'liq
qo'llanma.

## O'rnatish

```bash
# npm
npm install imzo-agnost

# pnpm (tavsiya qilinadi)
pnpm add imzo-agnost

# yarn
yarn add imzo-agnost
```

## Angular Service

### 1. E-IMZO Service yaratish

```typescript
// services/eimzo.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, from } from 'rxjs';
import EIMZOClient from 'imzo-agnost';

export interface Certificate {
  id: string;
  name: string;
  organization: string;
  tin: string;
  validFrom: Date;
  validTo: Date;
  type: string;
  isValid: boolean;
  cert: any;
}

export interface EimzoState {
  isAvailable: boolean;
  version: string;
  certificates: Certificate[];
  loading: boolean;
  error: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class EimzoService {
  private stateSubject = new BehaviorSubject<EimzoState>({
    isAvailable: false,
    version: '',
    certificates: [],
    loading: false,
    error: null
  });

  public state$ = this.stateSubject.asObservable();

  constructor() {
    // Service yaratilganda avtomatik initialization
    this.initialize();
  }

  get currentState(): EimzoState {
    return this.stateSubject.value;
  }

  private updateState(partial: Partial<EimzoState>): void {
    const currentState = this.stateSubject.value;
    this.stateSubject.next({ ...currentState, ...partial });
  }

  // E-IMZO ni tekshirish va ishga tushirish
  initialize(): Observable<boolean> {
    return from(
      new Promise<boolean>(resolve => {
        this.updateState({ loading: true, error: null });

        EIMZOClient.checkVersion(
          (major: string, minor: string) => {
            const version = `${major}.${minor}`;
            this.updateState({ version, isAvailable: true });

            // API kalitlarini o'rnatish
            EIMZOClient.installApiKeys(
              () => {
                this.updateState({ loading: false });
                resolve(true);
              },
              (error: any, reason: string | null) => {
                this.updateState({
                  loading: false,
                  error: reason || 'API keys installation failed'
                });
                resolve(false);
              }
            );
          },
          (error: any, reason: string | null) => {
            this.updateState({
              loading: false,
              error: reason || 'E-IMZO not available',
              isAvailable: false
            });
            resolve(false);
          }
        );
      })
    );
  }

  // Sertifikatlar ro'yxatini olish
  listCertificates(): Observable<Certificate[]> {
    return from(
      new Promise<Certificate[]>(resolve => {
        if (!this.currentState.isAvailable) {
          this.updateState({ error: 'E-IMZO is not available' });
          resolve([]);
          return;
        }

        this.updateState({ loading: true });

        EIMZOClient.listAllUserKeys(
          (cert: any, idx: number) => `cert_${idx}`,
          (id: string, cert: any) => ({
            id,
            name: cert.CN || 'Unknown Certificate',
            organization: cert.O || '',
            tin: cert.TIN || '',
            validFrom: cert.validFrom,
            validTo: cert.validTo,
            type: cert.type,
            isValid: cert.validTo > new Date(),
            cert
          }),
          (certificates: Certificate[]) => {
            this.updateState({ certificates, loading: false });
            resolve(certificates);
          },
          (error: any, reason: string | null) => {
            this.updateState({
              loading: false,
              error: reason || 'Failed to list certificates'
            });
            resolve([]);
          }
        );
      })
    );
  }

  // Hujjatni imzolash
  signDocument(
    certificate: Certificate,
    content: string
  ): Observable<{ success: boolean; signature?: string; error?: string }> {
    return from(
      new Promise<{ success: boolean; signature?: string; error?: string }>(
        resolve => {
          this.updateState({ loading: true });

          EIMZOClient.loadKey(
            certificate.cert,
            (keyId: string) => {
              EIMZOClient.createPkcs7(
                keyId,
                content,
                null, // timestamp server
                (signature: string) => {
                  this.updateState({ loading: false });
                  resolve({ success: true, signature });
                },
                (error: any, reason: string | null) => {
                  this.updateState({
                    loading: false,
                    error: reason || 'Signing failed'
                  });
                  resolve({
                    success: false,
                    error: reason || 'Signing failed'
                  });
                }
              );
            },
            (error: any, reason: string | null) => {
              this.updateState({
                loading: false,
                error: reason || 'Key loading failed'
              });
              resolve({
                success: false,
                error: reason || 'Key loading failed'
              });
            }
          );
        }
      )
    );
  }

  // Xatoni tozalash
  clearError(): void {
    this.updateState({ error: null });
  }

  // Version tekshirish
  checkVersion(): Observable<{ major: string; minor: string } | null> {
    return from(
      new Promise<{ major: string; minor: string } | null>(resolve => {
        EIMZOClient.checkVersion(
          (major: string, minor: string) => {
            resolve({ major, minor });
          },
          (error: any, reason: string | null) => {
            console.error('Version check failed:', reason);
            resolve(null);
          }
        );
      })
    );
  }
}
```

### 2. Angular Component

```typescript
// components/eimzo-integration/eimzo-integration.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
  EimzoService,
  Certificate,
  EimzoState
} from '../../services/eimzo.service';

@Component({
  selector: 'app-eimzo-integration',
  templateUrl: './eimzo-integration.component.html',
  styleUrls: ['./eimzo-integration.component.scss']
})
export class EimzoIntegrationComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  eimzoState: EimzoState = {
    isAvailable: false,
    version: '',
    certificates: [],
    loading: false,
    error: null
  };

  selectedCertificate: Certificate | null = null;
  documentContent = 'Bu test hujjati!';
  signatureResult = '';

  constructor(private eimzoService: EimzoService) {}

  ngOnInit(): void {
    // E-IMZO state ni kuzatish
    this.eimzoService.state$.pipe(takeUntil(this.destroy$)).subscribe(state => {
      this.eimzoState = state;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // E-IMZO ni ishga tushirish
  initializeEimzo(): void {
    this.eimzoService
      .initialize()
      .pipe(takeUntil(this.destroy$))
      .subscribe(success => {
        if (success) {
          console.log('E-IMZO muvaffaqiyatli ishga tushirildi');
        }
      });
  }

  // Sertifikatlarni yuklash
  loadCertificates(): void {
    this.eimzoService
      .listCertificates()
      .pipe(takeUntil(this.destroy$))
      .subscribe(certificates => {
        console.log('Sertifikatlar yuklandi:', certificates);
      });
  }

  // Sertifikatni tanlash
  selectCertificate(certificate: Certificate): void {
    this.selectedCertificate = certificate;
    this.signatureResult = '';
  }

  // Hujjatni imzolash
  signDocument(): void {
    if (!this.selectedCertificate || !this.documentContent) {
      return;
    }

    this.eimzoService
      .signDocument(this.selectedCertificate, this.documentContent)
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        if (result.success) {
          this.signatureResult = result.signature || '';
        } else {
          alert('Imzolashda xatolik: ' + result.error);
        }
      });
  }

  // Xatoni tozalash
  clearError(): void {
    this.eimzoService.clearError();
  }

  // Imzoni nusxalash
  copySignature(): void {
    if (this.signatureResult) {
      navigator.clipboard.writeText(this.signatureResult);
      alert('Imzo nusxalandi!');
    }
  }
}
```

### 3. Angular Template

```html
<!-- components/eimzo-integration/eimzo-integration.component.html -->
<div class="eimzo-integration">
  <h2>E-IMZO Angular Integration</h2>

  <!-- Status Section -->
  <div class="status-section">
    <button
      (click)="initializeEimzo()"
      [disabled]="eimzoState.loading"
      class="btn btn-primary"
    >
      {{ eimzoState.loading ? 'Tekshirilmoqda...' : 'E-IMZO ni tekshirish' }}
    </button>

    <div *ngIf="eimzoState.isAvailable" class="alert alert-success">
      ✅ E-IMZO {{ eimzoState.version }} mavjud
    </div>

    <div *ngIf="eimzoState.error" class="alert alert-danger">
      ❌ {{ eimzoState.error }}
      <button (click)="clearError()" class="btn btn-sm btn-outline-danger ms-2">
        ×
      </button>
    </div>
  </div>

  <!-- Certificates Section -->
  <div *ngIf="eimzoState.isAvailable" class="certificates-section">
    <button
      (click)="loadCertificates()"
      [disabled]="eimzoState.loading"
      class="btn btn-secondary"
    >
      Sertifikatlarni yuklash
    </button>

    <div *ngIf="eimzoState.certificates.length > 0" class="certificates-list">
      <h3>Mavjud sertifikatlar:</h3>

      <div
        *ngFor="let cert of eimzoState.certificates; trackBy: trackByCertId"
        class="certificate-item"
        [class.expired]="!cert.isValid"
        [class.selected]="selectedCertificate?.id === cert.id"
        (click)="selectCertificate(cert)"
      >
        <h4>{{ cert.name }}</h4>
        <p><strong>Tashkilot:</strong> {{ cert.organization }}</p>
        <p><strong>STIR:</strong> {{ cert.tin }}</p>
        <p><strong>Muddati:</strong> {{ cert.validTo | date:'short' }}</p>

        <div class="cert-badges">
          <span
            class="badge"
            [class]="cert.type === 'pfx' ? 'badge-info' : 'badge-warning'"
          >
            {{ cert.type === 'pfx' ? 'Dasturiy' : 'Apparat' }}
          </span>
          <span
            class="badge"
            [class]="cert.isValid ? 'badge-success' : 'badge-danger'"
          >
            {{ cert.isValid ? 'Yaroqli' : 'Muddati tugagan' }}
          </span>
        </div>
      </div>
    </div>
  </div>

  <!-- Signing Section -->
  <div *ngIf="selectedCertificate" class="signing-section">
    <h3>Hujjatni imzolash</h3>
    <p><strong>Tanlangan sertifikat:</strong> {{ selectedCertificate.name }}</p>

    <textarea
      [(ngModel)]="documentContent"
      placeholder="Imzolanadigan matn..."
      rows="4"
      class="form-control"
    ></textarea>

    <button
      (click)="signDocument()"
      [disabled]="eimzoState.loading || !selectedCertificate.isValid"
      class="btn btn-success"
    >
      {{ eimzoState.loading ? 'Imzolanmoqda...' : 'Imzolash' }}
    </button>

    <div *ngIf="signatureResult" class="signature-result">
      <h4>Imzo natijasi:</h4>
      <pre class="signature-output">{{ signatureResult }}</pre>
      <button
        (click)="copySignature()"
        class="btn btn-sm btn-outline-secondary"
      >
        Nusxalash
      </button>
    </div>
  </div>

  <!-- Loading Spinner -->
  <div *ngIf="eimzoState.loading" class="loading-spinner">
    <div class="spinner-border" role="status">
      <span class="sr-only">Yuklanmoqda...</span>
    </div>
  </div>
</div>
```

### 4. Component Styles

```scss
// components/eimzo-integration/eimzo-integration.component.scss
.eimzo-integration {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;

  .status-section,
  .certificates-section,
  .signing-section {
    margin: 20px 0;
    padding: 20px;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    background: #fafafa;
  }

  .certificates-list {
    margin-top: 20px;

    .certificate-item {
      border: 1px solid #dee2e6;
      padding: 15px;
      margin: 10px 0;
      border-radius: 8px;
      background: white;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        transform: translateY(-1px);
      }

      &.selected {
        border-color: #007bff;
        border-width: 2px;
      }

      &.expired {
        opacity: 0.6;
        border-color: #dc3545;
      }

      h4 {
        margin: 0 0 10px 0;
        color: #333;
      }

      p {
        margin: 5px 0;
        color: #666;
      }

      .cert-badges {
        margin-top: 10px;

        .badge {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
          margin-right: 8px;

          &.badge-info {
            background: #17a2b8;
            color: white;
          }

          &.badge-warning {
            background: #ffc107;
            color: #212529;
          }

          &.badge-success {
            background: #28a745;
            color: white;
          }

          &.badge-danger {
            background: #dc3545;
            color: white;
          }
        }
      }
    }
  }

  .signature-result {
    margin-top: 20px;
    padding: 15px;
    background: #e9ecef;
    border-radius: 8px;

    .signature-output {
      background: white;
      padding: 15px;
      border-radius: 4px;
      font-size: 12px;
      overflow-x: auto;
      white-space: pre-wrap;
      word-break: break-all;
      max-height: 300px;
    }
  }

  .loading-spinner {
    display: flex;
    justify-content: center;
    padding: 20px;
  }

  .btn {
    margin: 5px;
  }

  .form-control {
    margin: 10px 0;
  }

  @media (max-width: 768px) {
    padding: 10px;

    .certificate-item {
      padding: 10px;
    }

    .btn {
      width: 100%;
      margin: 5px 0;
    }
  }
}
```

## Module Configuration

### 1. App Module

```typescript
// app.module.ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { EimzoIntegrationComponent } from './components/eimzo-integration/eimzo-integration.component';
import { EimzoService } from './services/eimzo.service';

@NgModule({
  declarations: [AppComponent, EimzoIntegrationComponent],
  imports: [BrowserModule, FormsModule],
  providers: [EimzoService],
  bootstrap: [AppComponent]
})
export class AppModule {}
```

### 2. Feature Module

```typescript
// modules/eimzo/eimzo.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { EimzoRoutingModule } from './eimzo-routing.module';
import { EimzoIntegrationComponent } from './components/eimzo-integration/eimzo-integration.component';
import { CertificateListComponent } from './components/certificate-list/certificate-list.component';
import { SigningFormComponent } from './components/signing-form/signing-form.component';
import { EimzoService } from './services/eimzo.service';

@NgModule({
  declarations: [
    EimzoIntegrationComponent,
    CertificateListComponent,
    SigningFormComponent
  ],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, EimzoRoutingModule],
  providers: [EimzoService],
  exports: [EimzoIntegrationComponent]
})
export class EimzoModule {}
```

## Reactive Forms

```typescript
// components/signing-form/signing-form.component.ts
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Certificate } from '../../services/eimzo.service';

@Component({
  selector: 'app-signing-form',
  template: `
    <form [formGroup]="signingForm" (ngSubmit)="onSubmit()">
      <div class="form-group">
        <label for="certificate">Sertifikat:</label>
        <select
          id="certificate"
          formControlName="certificate"
          class="form-control"
        >
          <option value="">Sertifikatni tanlang</option>
          <option
            *ngFor="let cert of certificates"
            [value]="cert.id"
            [disabled]="!cert.isValid"
          >
            {{ cert.name }} - {{ cert.organization }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label for="content">Hujjat matni:</label>
        <textarea
          id="content"
          formControlName="content"
          class="form-control"
          rows="4"
          placeholder="Imzolanadigan matn..."
        ></textarea>
      </div>

      <button
        type="submit"
        [disabled]="signingForm.invalid || loading"
        class="btn btn-primary"
      >
        {{ loading ? 'Imzolanmoqda...' : 'Imzolash' }}
      </button>
    </form>
  `
})
export class SigningFormComponent implements OnInit {
  @Input() certificates: Certificate[] = [];
  @Input() loading = false;
  @Output() sign = new EventEmitter<{
    certificate: Certificate;
    content: string;
  }>();

  signingForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.signingForm = this.fb.group({
      certificate: ['', Validators.required],
      content: ['Bu test hujjati!', Validators.required]
    });
  }

  ngOnInit(): void {}

  onSubmit(): void {
    if (this.signingForm.valid) {
      const certificateId = this.signingForm.value.certificate;
      const certificate = this.certificates.find(c => c.id === certificateId);

      if (certificate) {
        this.sign.emit({
          certificate,
          content: this.signingForm.value.content
        });
      }
    }
  }
}
```

## Guards va Resolvers

```typescript
// guards/eimzo.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { EimzoService } from '../services/eimzo.service';

@Injectable({
  providedIn: 'root'
})
export class EimzoGuard implements CanActivate {
  constructor(
    private eimzoService: EimzoService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean> {
    return this.eimzoService.checkVersion().pipe(
      map(version => {
        if (version) {
          return true;
        } else {
          this.router.navigate(['/eimzo-not-available']);
          return false;
        }
      }),
      catchError(() => {
        this.router.navigate(['/eimzo-not-available']);
        return of(false);
      })
    );
  }
}
```

## Interceptors

```typescript
// interceptors/eimzo-error.interceptor.ts
import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpErrorResponse
} from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable()
export class EimzoErrorInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler) {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 0 && error.url?.includes('ws://')) {
          // E-IMZO WebSocket connection xatolari
          console.error('E-IMZO connection error:', error);
        }
        return throwError(error);
      })
    );
  }
}
```

## Testing

```typescript
// services/eimzo.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { EimzoService } from './eimzo.service';

// E-IMZO mock
const mockEIMZOClient = {
  checkVersion: jest.fn(),
  installApiKeys: jest.fn(),
  listAllUserKeys: jest.fn(),
  loadKey: jest.fn(),
  createPkcs7: jest.fn()
};

jest.mock('imzo-agnost', () => mockEIMZOClient);

describe('EimzoService', () => {
  let service: EimzoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EimzoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize E-IMZO successfully', done => {
    mockEIMZOClient.checkVersion.mockImplementation((success, fail) => {
      success('4', '2');
    });

    mockEIMZOClient.installApiKeys.mockImplementation((success, fail) => {
      success();
    });

    service.initialize().subscribe(result => {
      expect(result).toBe(true);
      expect(service.currentState.isAvailable).toBe(true);
      expect(service.currentState.version).toBe('4.2');
      done();
    });
  });

  it('should handle E-IMZO not available', done => {
    mockEIMZOClient.checkVersion.mockImplementation((success, fail) => {
      fail(null, 'E-IMZO not found');
    });

    service.initialize().subscribe(result => {
      expect(result).toBe(false);
      expect(service.currentState.isAvailable).toBe(false);
      expect(service.currentState.error).toContain('E-IMZO not found');
      done();
    });
  });
});
```

Bu Angular integration misollar professional darajada `imzo-agnost`
kutubxonasini Angular ekosistemida ishlatishning to'liq yo'llarini ko'rsatadi.
