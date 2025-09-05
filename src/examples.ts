import { 
  EIMZOApi,
  type PfxPlugin,
  type Pkcs7Plugin,
  type CryptoAuthPlugin,
  type IDCardPlugin,
  type X509Plugin,
  type TSAClientPlugin,
  type CRLPlugin,
  type FileIOPlugin,
  type TunnelPlugin
} from './eimzo-api.js';

/**
 * Example usage of the E-IMZO API with proper TypeScript patterns
 */
const api = new EIMZOApi();

// Example 1: Initialize and setup
async function initializeExample() {
  try {
    const version = await api.initialize();
    console.log('E-IMZO Version:', version);

    await api.installApiKeys();
    console.log('API keys installed');
  } catch (error) {
    console.error('Initialization failed:', error);
  }
}

// Example 2: PFX operations using callback API
function pfxCallbackExample() {
  const pfx = api.pfx as PfxPlugin;
  if (!pfx) {
    console.error('PFX plugin not available');
    return;
  }

  pfx.listDisks(
    (event: MessageEvent, data: any) => {
      console.log('Available disks:', data);

      if (data.disks && data.disks.length > 0) {
        // List certificates from first disk
        pfx.listCertificates(
          data.disks[0].name,
          (event: MessageEvent, certData: any) => {
            console.log('Certificates found:', certData.certificates?.length || 0);
          },
          (error: any) => {
            console.error('Error listing certificates:', error);
          }
        );
      }
    },
    (error: any) => {
      console.error('Error listing disks:', error);
    }
  );
}

// Example 3: PKCS7 signing
function pkcs7Example() {
  const pkcs7 = api.pkcs7 as Pkcs7Plugin;
  if (!pkcs7) {
    console.error('PKCS7 plugin not available');
    return;
  }

  const keyId = 'your-key-id';
  const data = 'Hello, World!';

  pkcs7.createPkcs7(
    keyId,
    data,
    'no', // not detached
    (event: MessageEvent, response: any) => {
      console.log('PKCS7 signature created successfully');
      if (response.pkcs7) {
        console.log('Signature length:', response.pkcs7.length);
      }
    },
    (error: any) => {
      console.error('Signing failed:', error);
    }
  );
}

// Example 4: Cryptographic operations
function cryptoAuthExample() {
  const cryptoauth = api.cryptoauth as CryptoAuthPlugin;
  if (!cryptoauth) {
    console.error('CryptoAuth plugin not available');
    return;
  }

  const keyId = 'your-key-id';
  const data = 'Data to sign';

  // Get signature
  cryptoauth.getSignature(
    keyId,
    data,
    (event: MessageEvent, signatureData: any) => {
      console.log('Signature created');
      const signature = signatureData.signature || signatureData;

      // Verify signature with the same key
      cryptoauth.verifySignatureWithId(
        data,
        signature,
        keyId,
        (event: MessageEvent, result: any) => {
          console.log('Signature verification result:', result);
        },
        (error: any) => {
          console.error('Verification failed:', error);
        }
      );
    },
    (error: any) => {
      console.error('Signing failed:', error);
    }
  );
}

// Example 5: ID Card operations
function idCardExample() {
  const idcard = api.idcard as IDCardPlugin;
  if (!idcard) {
    console.error('IDCard plugin not available');
    return;
  }

  // Check available card readers
  idcard.listReaders(
    (event: MessageEvent, readers: any) => {
      const readerList = readers.readers || readers;
      console.log('Available card readers:', readerList.length);

      const connectedReader = readerList.find((r: any) => r.connected && r.cardPresent);
      if (connectedReader) {
        console.log('ID card detected in reader:', connectedReader.name);
      } else {
        console.log('No ID card detected');
      }
    },
    (error: any) => {
      console.error('Error checking card readers:', error);
    }
  );
}

// Example 6: X.509 certificate operations
function x509Example() {
  const x509 = api.x509 as X509Plugin;
  if (!x509) {
    console.error('X509 plugin not available');
    return;
  }

  const keyId = 'your-key-id';

  // Get certificate chain
  x509.getCertificateChain(
    keyId,
    (event: MessageEvent, chainData: any) => {
      const chain = chainData.chain || chainData;
      console.log('Certificate chain retrieved:', chain.length, 'certificates');

      if (chain.length > 0) {
        // Get detailed info about the first certificate
        x509.getCertificateInfo(
          chain[0],
          (event: MessageEvent, info: any) => {
            console.log('Certificate subject:', info.subject);
            console.log('Certificate valid from:', info.validFrom);
            console.log('Certificate valid to:', info.validTo);
          },
          (error: any) => {
            console.error('Error getting certificate info:', error);
          }
        );
      }
    },
    (error: any) => {
      console.error('Error getting certificate chain:', error);
    }
  );
}

// Example 7: Timestamp operations
function timestampExample() {
  const tsaclient = api.tsaclient as TSAClientPlugin;
  if (!tsaclient) {
    console.error('TSAClient plugin not available');
    return;
  }

  const data = 'Document content to timestamp';
  const tsaUrl = 'https://timestamp.example.com/tsa';

  tsaclient.getTimestampTokenForData(
    data,
    tsaUrl,
    (event: MessageEvent, tokenData: any) => {
      const token = tokenData.token || tokenData;
      console.log('Timestamp token received');

      // Get detailed token information
      tsaclient.getTimestampTokenInfo(
        token,
        (event: MessageEvent, info: any) => {
          console.log('Timestamp:', info.timestamp);
          console.log('TSA name:', info.tsaName);
          console.log('Serial number:', info.serialNumber);
        },
        (error: any) => {
          console.error('Error getting token info:', error);
        }
      );
    },
    (error: any) => {
      console.error('Error getting timestamp token:', error);
    }
  );
}

// Example 8: File operations
function fileIOExample() {
  const fileio = api.fileio as FileIOPlugin;
  if (!fileio) {
    console.error('FileIO plugin not available');
    return;
  }

  const filePath = 'C:\\Documents\\sample.txt';

  fileio.loadFile(
    filePath,
    (event: MessageEvent, contentData: any) => {
      const content = contentData.content || contentData;
      console.log('File loaded successfully, size:', content.length);

      // Create a zip archive and save it
      const zipContent = btoa(content); // Convert to base64 for zip
      fileio.writeFile(
        zipContent,
        'C:\\Documents\\output',
        (event: MessageEvent, result: any) => {
          const success = result.success !== false;
          console.log('File write operation result:', success);
        },
        (error: any) => {
          console.error('Error writing file:', error);
        }
      );
    },
    (error: any) => {
      console.error('Error loading file:', error);
    }
  );
}

// Example 9: Certificate revocation checking
function crlExample() {
  const crl = api.crl as CRLPlugin;
  if (!crl) {
    console.error('CRL plugin not available');
    return;
  }

  const certificate = 'base64-encoded-certificate-data';
  const crlData = 'base64-encoded-crl-data';

  // First, open the CRL
  crl.openCrl(
    crlData,
    (event: MessageEvent, crlResult: any) => {
      const crlId = crlResult.crlId || crlResult;
      console.log('CRL opened with ID:', crlId);

      // Now check if our certificate is revoked
      crl.checkCertificate(
        certificate,
        crlId,
        (event: MessageEvent, status: any) => {
          if (status.isRevoked) {
            console.log('⚠️ Certificate is REVOKED!');
            console.log('Revocation date:', status.revocationDate);
            console.log('Reason:', status.reason);
          } else {
            console.log('✅ Certificate is valid (not revoked)');
          }
        },
        (error: any) => {
          console.error('Error checking certificate status:', error);
        }
      );
    },
    (error: any) => {
      console.error('Error opening CRL:', error);
    }
  );
}

// Example 10: Secure tunnel creation
function tunnelExample() {
  const tunnel = api.tunnel as TunnelPlugin;
  if (!tunnel) {
    console.error('Tunnel plugin not available');
    return;
  }

  const serverHost = 'secure-server.example.com';
  const serverPort = 443;
  const keyId = 'your-encryption-key-id';

  tunnel.createTunnel(
    serverHost,
    serverPort,
    keyId,
    (event: MessageEvent, result: any) => {
      console.log('🔐 Secure tunnel established!');
      console.log('Local tunnel port:', result.port);
      console.log('Connect to localhost:' + result.port + ' for secure communication');
    },
    (error: any) => {
      console.error('Failed to create secure tunnel:', error);
    }
  );
}

// Example 11: Complete workflow - Sign document with timestamp
async function completeWorkflowExample() {
  try {
    // 1. Initialize
    await initializeExample();

    // 2. Get available certificates (callback style)
    const pfx = api.pfx as PfxPlugin;
    if (pfx) {
      pfx.listAllCertificates(
        (event: MessageEvent, data: any) => {
          const certificates = data.certificates || [];
          if (certificates.length > 0) {
            const cert = certificates[0];
            console.log('Using certificate:', cert.CN);

            // 3. Load key
            pfx.loadKey(
              cert.disk || '',
              cert.path || '',
              cert.name || '',
              cert.alias || '',
              (event: MessageEvent, keyData: any) => {
                const keyId = keyData.keyId;
                console.log('Key loaded with ID:', keyId);

                // 4. Sign document
                const pkcs7 = api.pkcs7 as Pkcs7Plugin;
                if (pkcs7) {
                  pkcs7.createPkcs7(
                    keyId,
                    'Important document content',
                    'no',
                    (event: MessageEvent, signResult: any) => {
                      console.log('✅ Document signed successfully!');

                      // 5. Add timestamp (optional)
                      const tsaclient = api.tsaclient as TSAClientPlugin;
                      if (tsaclient) {
                        tsaclient.getTimestampTokenForSignature(
                          signResult.pkcs7,
                          'https://tsa.example.com',
                          (_event: MessageEvent, _timestamp: unknown) => {
                            console.log('📅 Timestamp added to signature');
                          },
                          (error: any) => {
                            console.log('Timestamp failed (optional):', error);
                          }
                        );
                      }
                    },
                    (error: any) => {
                      console.error('Signing failed:', error);
                    }
                  );
                }
              },
              (error: any) => {
                console.error('Key loading failed:', error);
              }
            );
          }
        },
        (error: any) => {
          console.error('Certificate listing failed:', error);
        }
      );
    }
  } catch (error) {
    console.error('Complete workflow failed:', error);
  }
}

// Usage examples - uncomment to run
console.log('🚀 E-IMZO API Examples');
console.log('======================');

// You can run individual examples:
// initializeExample();
// pfxCallbackExample();
// pkcs7Example();
// cryptoAuthExample();
// idCardExample();
// x509Example();
// timestampExample();
// fileIOExample();
// crlExample();
// tunnelExample();
// completeWorkflowExample();

export {
  initializeExample,
  pfxCallbackExample,
  pkcs7Example,
  cryptoAuthExample,
  idCardExample,
  x509Example,
  timestampExample,
  fileIOExample,
  crlExample,
  tunnelExample,
  completeWorkflowExample
};
