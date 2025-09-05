# React Integration

`imzo-agnost` kutubxonasini React aplikatsiyalarida ishlatish bo'yicha to'liq
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

## React Hooks

### 1. useEimzo Custom Hook

```typescript
// hooks/useEimzo.ts
import { useState, useCallback, useEffect } from 'react';
import EIMZOClient from 'imzo-agnost';

interface Certificate {
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

interface EimzoState {
  isAvailable: boolean;
  version: string;
  certificates: Certificate[];
  loading: boolean;
  error: string | null;
}

export function useEimzo() {
  const [state, setState] = useState<EimzoState>({
    isAvailable: false,
    version: '',
    certificates: [],
    loading: false,
    error: null
  });

  // E-IMZO mavjudligini tekshirish
  const checkEimzo = useCallback((): Promise<boolean> => {
    return new Promise(resolve => {
      setState(prev => ({ ...prev, loading: true, error: null }));

      EIMZOClient.checkVersion(
        (major, minor) => {
          const version = `${major}.${minor}`;
          setState(prev => ({ ...prev, version, isAvailable: true }));

          // API kalitlarini o'rnatish
          EIMZOClient.installApiKeys(
            () => {
              setState(prev => ({ ...prev, loading: false }));
              resolve(true);
            },
            (error, reason) => {
              setState(prev => ({
                ...prev,
                loading: false,
                error: reason || 'API keys installation failed'
              }));
              resolve(false);
            }
          );
        },
        (error, reason) => {
          setState(prev => ({
            ...prev,
            loading: false,
            error: reason || 'E-IMZO not available',
            isAvailable: false
          }));
          resolve(false);
        }
      );
    });
  }, []);

  // Sertifikatlar ro'yxatini olish
  const listCertificates = useCallback((): Promise<Certificate[]> => {
    return new Promise(resolve => {
      if (!state.isAvailable) {
        setState(prev => ({ ...prev, error: 'E-IMZO is not available' }));
        resolve([]);
        return;
      }

      setState(prev => ({ ...prev, loading: true }));

      EIMZOClient.listAllUserKeys(
        (cert, idx) => `cert_${idx}`,
        (id, cert) => ({
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
        certificates => {
          setState(prev => ({ ...prev, certificates, loading: false }));
          resolve(certificates);
        },
        (error, reason) => {
          setState(prev => ({
            ...prev,
            loading: false,
            error: reason || 'Failed to list certificates'
          }));
          resolve([]);
        }
      );
    });
  }, [state.isAvailable]);

  // Hujjatni imzolash
  const signDocument = useCallback(
    (
      certificate: Certificate,
      content: string
    ): Promise<{ success: boolean; signature?: string; error?: string }> => {
      return new Promise(resolve => {
        setState(prev => ({ ...prev, loading: true }));

        EIMZOClient.loadKey(
          certificate.cert,
          keyId => {
            EIMZOClient.createPkcs7(
              keyId,
              content,
              null, // timestamp server
              signature => {
                setState(prev => ({ ...prev, loading: false }));
                resolve({ success: true, signature });
              },
              (error, reason) => {
                setState(prev => ({
                  ...prev,
                  loading: false,
                  error: reason || 'Signing failed'
                }));
                resolve({ success: false, error: reason || 'Signing failed' });
              }
            );
          },
          (error, reason) => {
            setState(prev => ({
              ...prev,
              loading: false,
              error: reason || 'Key loading failed'
            }));
            resolve({ success: false, error: reason || 'Key loading failed' });
          }
        );
      });
    },
    []
  );

  // Initialize on mount
  useEffect(() => {
    checkEimzo();
  }, [checkEimzo]);

  return {
    ...state,
    checkEimzo,
    listCertificates,
    signDocument,
    clearError: () => setState(prev => ({ ...prev, error: null }))
  };
}
```

### 2. React Component

```tsx
// components/EimzoIntegration.tsx
import React, { useState } from 'react';
import { useEimzo } from '../hooks/useEimzo';

const EimzoIntegration: React.FC = () => {
  const {
    isAvailable,
    version,
    certificates,
    loading,
    error,
    checkEimzo,
    listCertificates,
    signDocument,
    clearError
  } = useEimzo();

  const [selectedCert, setSelectedCert] = useState<any>(null);
  const [documentContent, setDocumentContent] = useState('Bu test hujjati!');
  const [signatureResult, setSignatureResult] = useState('');

  const handleCertificateSelect = (cert: any) => {
    setSelectedCert(cert);
    setSignatureResult('');
  };

  const handleSign = async () => {
    if (!selectedCert || !documentContent) return;

    const result = await signDocument(selectedCert, documentContent);

    if (result.success) {
      setSignatureResult(result.signature || '');
    } else {
      alert('Imzolashda xatolik: ' + result.error);
    }
  };

  return (
    <div className="eimzo-integration">
      <h2>E-IMZO React Integration</h2>

      {/* Status Section */}
      <div className="status-section">
        <button
          onClick={checkEimzo}
          disabled={loading}
          className="btn btn-primary"
        >
          {loading ? 'Tekshirilmoqda...' : 'E-IMZO ni tekshirish'}
        </button>

        {isAvailable && (
          <div className="status success">✅ E-IMZO {version} mavjud</div>
        )}

        {error && (
          <div className="status error">
            ❌ {error}
            <button onClick={clearError} className="btn btn-sm">
              ×
            </button>
          </div>
        )}
      </div>

      {/* Certificates Section */}
      {isAvailable && (
        <div className="certificates-section">
          <button
            onClick={listCertificates}
            disabled={loading}
            className="btn btn-secondary"
          >
            Sertifikatlarni yuklash
          </button>

          {certificates.length > 0 && (
            <div className="certificates-list">
              <h3>Mavjud sertifikatlar:</h3>
              {certificates.map(cert => (
                <div
                  key={cert.id}
                  className={`certificate-item ${!cert.isValid ? 'expired' : ''}`}
                  onClick={() => handleCertificateSelect(cert)}
                  style={{
                    cursor: 'pointer',
                    border:
                      selectedCert?.id === cert.id
                        ? '2px solid #007bff'
                        : '1px solid #ddd'
                  }}
                >
                  <h4>{cert.name}</h4>
                  <p>
                    <strong>Tashkilot:</strong> {cert.organization}
                  </p>
                  <p>
                    <strong>STIR:</strong> {cert.tin}
                  </p>
                  <p>
                    <strong>Muddati:</strong>{' '}
                    {new Date(cert.validTo).toLocaleDateString()}
                  </p>
                  <div className="cert-badges">
                    <span
                      className={`badge ${cert.type === 'pfx' ? 'badge-info' : 'badge-warning'}`}
                    >
                      {cert.type === 'pfx' ? 'Dasturiy' : 'Apparat'}
                    </span>
                    <span
                      className={`badge ${cert.isValid ? 'badge-success' : 'badge-danger'}`}
                    >
                      {cert.isValid ? 'Yaroqli' : 'Muddati tugagan'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Signing Section */}
      {selectedCert && (
        <div className="signing-section">
          <h3>Hujjatni imzolash</h3>
          <p>
            <strong>Tanlangan sertifikat:</strong> {selectedCert.name}
          </p>

          <textarea
            value={documentContent}
            onChange={e => setDocumentContent(e.target.value)}
            placeholder="Imzolanadigan matn..."
            rows={4}
            className="form-control"
          />

          <button
            onClick={handleSign}
            disabled={loading || !selectedCert.isValid}
            className="btn btn-success"
          >
            {loading ? 'Imzolanmoqda...' : 'Imzolash'}
          </button>

          {signatureResult && (
            <div className="signature-result">
              <h4>Imzo natijasi:</h4>
              <pre className="signature-output">{signatureResult}</pre>
              <button
                onClick={() => navigator.clipboard.writeText(signatureResult)}
                className="btn btn-sm btn-outline-secondary"
              >
                Nusxalash
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EimzoIntegration;
```

## Class Component (Legacy)

```tsx
// components/EimzoClassComponent.tsx
import React, { Component } from 'react';
import EIMZOClient from 'imzo-agnost';

interface State {
  isAvailable: boolean;
  version: string;
  certificates: any[];
  loading: boolean;
  error: string | null;
  selectedCert: any;
  documentText: string;
  signature: string;
}

class EimzoClassComponent extends Component<{}, State> {
  constructor(props: {}) {
    super(props);
    this.state = {
      isAvailable: false,
      version: '',
      certificates: [],
      loading: false,
      error: null,
      selectedCert: null,
      documentText: 'Test document for signing',
      signature: ''
    };
  }

  componentDidMount() {
    this.initializeEimzo();
  }

  initializeEimzo = (): void => {
    this.setState({ loading: true, error: null });

    EIMZOClient.checkVersion(
      (major, minor) => {
        this.setState({
          version: `${major}.${minor}`,
          isAvailable: true
        });

        EIMZOClient.installApiKeys(
          () => {
            this.loadCertificates();
          },
          (error, reason) => {
            this.setState({
              loading: false,
              error: `API keys installation failed: ${reason}`
            });
          }
        );
      },
      (error, reason) => {
        this.setState({
          loading: false,
          error: `E-IMZO not available: ${reason}`,
          isAvailable: false
        });
      }
    );
  };

  loadCertificates = (): void => {
    EIMZOClient.listAllUserKeys(
      (cert, idx) => `cert_${idx}`,
      (id, cert) => ({
        id,
        name: cert.CN || 'Unknown',
        organization: cert.O || '',
        cert: cert
      }),
      certificates => {
        this.setState({ certificates, loading: false });
      },
      (error, reason) => {
        this.setState({
          loading: false,
          error: `Failed to load certificates: ${reason}`
        });
      }
    );
  };

  signDocument = (): void => {
    const { selectedCert, documentText } = this.state;

    if (!selectedCert || !documentText) {
      alert('Please select a certificate and enter document text');
      return;
    }

    this.setState({ loading: true });

    EIMZOClient.loadKey(
      selectedCert.cert,
      keyId => {
        EIMZOClient.createPkcs7(
          keyId,
          documentText,
          null,
          signature => {
            this.setState({
              signature,
              loading: false
            });
          },
          (error, reason) => {
            this.setState({
              loading: false,
              error: `Signing failed: ${reason}`
            });
          }
        );
      },
      (error, reason) => {
        this.setState({
          loading: false,
          error: `Key loading failed: ${reason}`
        });
      }
    );
  };

  render() {
    const {
      isAvailable,
      version,
      certificates,
      loading,
      error,
      selectedCert,
      documentText,
      signature
    } = this.state;

    return (
      <div className="eimzo-class-component">
        <h2>E-IMZO Class Component</h2>

        <button onClick={this.initializeEimzo} disabled={loading}>
          {loading ? 'Loading...' : 'Initialize E-IMZO'}
        </button>

        {error && <div className="alert alert-danger">{error}</div>}

        {isAvailable && (
          <div className="alert alert-success">
            E-IMZO {version} is available
          </div>
        )}

        {certificates.length > 0 && (
          <div>
            <h3>Certificates</h3>
            <select
              value={selectedCert?.id || ''}
              onChange={e => {
                const cert = certificates.find(c => c.id === e.target.value);
                this.setState({ selectedCert: cert || null });
              }}
            >
              <option value="">Select a certificate</option>
              {certificates.map(cert => (
                <option key={cert.id} value={cert.id}>
                  {cert.name} ({cert.organization})
                </option>
              ))}
            </select>
          </div>
        )}

        {selectedCert && (
          <div>
            <h3>Sign Document</h3>
            <textarea
              value={documentText}
              onChange={e => this.setState({ documentText: e.target.value })}
              rows={4}
              cols={50}
            />
            <br />
            <button onClick={this.signDocument} disabled={loading}>
              Sign Document
            </button>
          </div>
        )}

        {signature && (
          <div>
            <h4>Signature:</h4>
            <pre style={{ backgroundColor: '#f8f9fa', padding: '10px' }}>
              {signature}
            </pre>
          </div>
        )}
      </div>
    );
  }
}

export default EimzoClassComponent;
```

## React Context API

```tsx
// context/EimzoContext.tsx
import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import EIMZOClient from 'imzo-agnost';

interface EimzoState {
  isInitialized: boolean;
  isAvailable: boolean;
  version: string;
  certificates: any[];
  loading: boolean;
  error: string | null;
}

type EimzoAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_AVAILABLE'; payload: { available: boolean; version?: string } }
  | { type: 'SET_CERTIFICATES'; payload: any[] }
  | { type: 'SET_INITIALIZED'; payload: boolean };

const initialState: EimzoState = {
  isInitialized: false,
  isAvailable: false,
  version: '',
  certificates: [],
  loading: false,
  error: null
};

function eimzoReducer(state: EimzoState, action: EimzoAction): EimzoState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SET_AVAILABLE':
      return {
        ...state,
        isAvailable: action.payload.available,
        version: action.payload.version || '',
        loading: false
      };
    case 'SET_CERTIFICATES':
      return { ...state, certificates: action.payload, loading: false };
    case 'SET_INITIALIZED':
      return { ...state, isInitialized: action.payload };
    default:
      return state;
  }
}

interface EimzoContextType {
  state: EimzoState;
  initialize: () => Promise<boolean>;
  listCertificates: () => Promise<any[]>;
  signDocument: (cert: any, content: string) => Promise<any>;
}

const EimzoContext = createContext<EimzoContextType | undefined>(undefined);

export function EimzoProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(eimzoReducer, initialState);

  const initialize = async (): Promise<boolean> => {
    dispatch({ type: 'SET_LOADING', payload: true });

    return new Promise(resolve => {
      EIMZOClient.checkVersion(
        (major, minor) => {
          dispatch({
            type: 'SET_AVAILABLE',
            payload: { available: true, version: `${major}.${minor}` }
          });

          EIMZOClient.installApiKeys(
            () => {
              dispatch({ type: 'SET_INITIALIZED', payload: true });
              resolve(true);
            },
            (error, reason) => {
              dispatch({
                type: 'SET_ERROR',
                payload: reason || 'API installation failed'
              });
              resolve(false);
            }
          );
        },
        (error, reason) => {
          dispatch({
            type: 'SET_AVAILABLE',
            payload: { available: false }
          });
          dispatch({
            type: 'SET_ERROR',
            payload: reason || 'E-IMZO not available'
          });
          resolve(false);
        }
      );
    });
  };

  const listCertificates = async (): Promise<any[]> => {
    dispatch({ type: 'SET_LOADING', payload: true });

    return new Promise(resolve => {
      EIMZOClient.listAllUserKeys(
        (cert, idx) => `cert_${idx}`,
        (id, cert) => ({ id, ...cert }),
        certificates => {
          dispatch({ type: 'SET_CERTIFICATES', payload: certificates });
          resolve(certificates);
        },
        (error, reason) => {
          dispatch({
            type: 'SET_ERROR',
            payload: reason || 'Failed to list certificates'
          });
          resolve([]);
        }
      );
    });
  };

  const signDocument = async (cert: any, content: string): Promise<any> => {
    dispatch({ type: 'SET_LOADING', payload: true });

    return new Promise(resolve => {
      EIMZOClient.loadKey(
        cert,
        keyId => {
          EIMZOClient.createPkcs7(
            keyId,
            content,
            null,
            signature => {
              dispatch({ type: 'SET_LOADING', payload: false });
              resolve({ success: true, signature });
            },
            (error, reason) => {
              dispatch({
                type: 'SET_ERROR',
                payload: reason || 'Signing failed'
              });
              resolve({ success: false, error: reason });
            }
          );
        },
        (error, reason) => {
          dispatch({
            type: 'SET_ERROR',
            payload: reason || 'Key loading failed'
          });
          resolve({ success: false, error: reason });
        }
      );
    });
  };

  return (
    <EimzoContext.Provider
      value={{ state, initialize, listCertificates, signDocument }}
    >
      {children}
    </EimzoContext.Provider>
  );
}

export function useEimzoContext() {
  const context = useContext(EimzoContext);
  if (context === undefined) {
    throw new Error('useEimzoContext must be used within an EimzoProvider');
  }
  return context;
}
```

## Next.js Integration

### 1. Dynamic Import

```tsx
// components/EimzoWrapper.tsx
import dynamic from 'next/dynamic';

const EimzoComponent = dynamic(() => import('./EimzoIntegration'), {
  ssr: false, // E-IMZO faqat client-side da ishlaydi
  loading: () => <p>E-IMZO yuklanmoqda...</p>
});

export default function EimzoWrapper() {
  return <EimzoComponent />;
}
```

### 2. Next.js Page

```tsx
// pages/eimzo.tsx
import { GetStaticProps } from 'next';
import EimzoWrapper from '../components/EimzoWrapper';

export default function EimzoPage() {
  return (
    <div>
      <h1>E-IMZO Integration</h1>
      <EimzoWrapper />
    </div>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {}
  };
};
```

## TypeScript Interfaces

```typescript
// types/eimzo.ts
export interface Certificate {
  id: string;
  CN: string;
  O: string;
  TIN: string;
  validFrom: Date;
  validTo: Date;
  type: 'pfx' | 'token';
  isValid: boolean;
}

export interface SigningResult {
  success: boolean;
  signature?: string;
  error?: string;
}

export interface EimzoHookResult {
  isAvailable: boolean;
  version: string;
  certificates: Certificate[];
  loading: boolean;
  error: string | null;
  checkEimzo: () => Promise<boolean>;
  listCertificates: () => Promise<Certificate[]>;
  signDocument: (cert: Certificate, content: string) => Promise<SigningResult>;
  clearError: () => void;
}
```

## CSS Styles

```css
/* styles/eimzo.css */
.eimzo-integration {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
}

.status-section,
.certificates-section,
.signing-section {
  margin: 20px 0;
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: #fafafa;
}

.status.success {
  color: #28a745;
  font-weight: 600;
  padding: 10px;
  background: #d4edda;
  border-radius: 4px;
  margin-top: 10px;
}

.status.error {
  color: #dc3545;
  font-weight: 600;
  padding: 10px;
  background: #f8d7da;
  border-radius: 4px;
  margin-top: 10px;
}

.certificate-item {
  border: 1px solid #dee2e6;
  padding: 15px;
  margin: 10px 0;
  border-radius: 8px;
  background: white;
  transition: all 0.2s ease;
}

.certificate-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

.certificate-item.expired {
  opacity: 0.6;
  border-color: #dc3545;
}

.cert-badges {
  margin-top: 10px;
}

.badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  margin-right: 8px;
}

.badge-info {
  background: #17a2b8;
  color: white;
}
.badge-warning {
  background: #ffc107;
  color: #212529;
}
.badge-success {
  background: #28a745;
  color: white;
}
.badge-danger {
  background: #dc3545;
  color: white;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.2s ease;
  margin: 5px;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: #007bff;
  color: white;
}
.btn-secondary {
  background: #6c757d;
  color: white;
}
.btn-success {
  background: #28a745;
  color: white;
}

.form-control {
  width: 100%;
  padding: 12px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 14px;
  margin: 10px 0;
}

.signature-result {
  margin-top: 20px;
  padding: 15px;
  background: #e9ecef;
  border-radius: 8px;
}

.signature-output {
  background: white;
  padding: 15px;
  border-radius: 4px;
  font-size: 12px;
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-all;
}

@media (max-width: 768px) {
  .eimzo-integration {
    padding: 10px;
  }

  .certificate-item {
    padding: 10px;
  }

  .btn {
    width: 100%;
    margin: 5px 0;
  }
}
```

Bu React integration misollar profesional darajada `imzo-agnost` kutubxonasini
React ekosistemida ishlatish yo'llarini ko'rsatadi.
