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

// Example 2: PFX operations with proper typing
function pfxExample() {
  const pfx = api.pfx as PfxPlugin;
  if (pfx) {
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
}

// Example 3: PKCS7 signing with proper typing
function pkcs7Example() {
  const pkcs7 = api.pkcs7 as Pkcs7Plugin;
  if (pkcs7) {
    const keyId = 'your-key-id';
    const data = 'Hello, World!';

    pkcs7.createPkcs7(
      keyId,
      data,
      'no', // not detached
      (event: MessageEvent, response: any) => {
        console.log('PKCS7 signature created:', response);
      },
      (error: any) => {
        console.error('Signing failed:', error);
      }
    );
  }
}

// Example 4: Cryptographic operations with proper typing
function cryptoAuthExample() {
  const cryptoauth = api.cryptoauth as CryptoAuthPlugin;
  if (cryptoauth) {
    const keyId = 'your-key-id';
    const data = 'Data to sign';

    // Get signature
    cryptoauth.getSignature(
      keyId,
      data,
      (event: MessageEvent, signature: any) => {
        console.log('Signature:', signature);

        // Verify signature with the same key
        cryptoauth.verifySignatureWithId(
          data,
          signature,
          keyId,
          (event: MessageEvent, result: any) => {
            console.log('Signature valid:', result);
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
}

// Example 5: ID Card operations with proper typing
function idCardExample() {
  const idcard = api.idcard as IDCardPlugin;
  if (idcard) {
    // Check if ID card is plugged in
    idcard.listReaders(
      (event: MessageEvent, readers: any) => {
        console.log('Available readers:', readers);

        const connectedReader = readers.find((r: any) => r.connected && r.cardPresent);
        if (connectedReader) {
          console.log('ID card detected in:', connectedReader.name);
        }
      },
      (error: any) => {
        console.error('Error checking readers:', error);
      }
    );
  }
}

// Example 6: X.509 certificate operations with proper typing
function x509Example() {
  const x509 = api.x509 as X509Plugin;
  if (x509) {
    const keyId = 'your-key-id';

    // Get certificate chain
    x509.getCertificateChain(
      keyId,
      (event: MessageEvent, chain: any) => {
        console.log('Certificate chain:', chain);

        if (chain.length > 0) {
          // Get certificate info
          x509.getCertificateInfo(
            chain[0],
            (event: MessageEvent, info: any) => {
              console.log('Certificate info:', info);
            },
            (error: any) => {
              console.error('Error getting cert info:', error);
            }
          );
        }
      },
      (error: any) => {
        console.error('Error getting certificate chain:', error);
      }
    );
  }
}

// Example 7: Timestamp operations with proper typing
function timestampExample() {
  const tsaclient = api.tsaclient as TSAClientPlugin;
  if (tsaclient) {
    const data = 'Document to timestamp';
    const tsaUrl = 'https://tsa.example.com';

    tsaclient.getTimestampTokenForData(
      data,
      tsaUrl,
      (event: MessageEvent, token: any) => {
        console.log('Timestamp token:', token);

        // Get token info
        tsaclient.getTimestampTokenInfo(
          token,
          (event: MessageEvent, info: any) => {
            console.log('Token info:', info);
          },
          (error: any) => {
            console.error('Error getting token info:', error);
          }
        );
      },
      (error: any) => {
        console.error('Error getting timestamp:', error);
      }
    );
  }
}

// Example 8: File operations with proper typing
function fileIOExample() {
  const fileio = api.fileio as FileIOPlugin;
  if (fileio) {
    const filePath = 'C:\\path\\to\\file.txt';

    fileio.loadFile(
      filePath,
      (event: MessageEvent, content: any) => {
        console.log('File content loaded');

        // Process and save
        const zipContent = btoa(content); // Convert to base64
        fileio.writeFile(
          zipContent,
          'C:\\path\\to\\output',
          (event: MessageEvent, success: any) => {
            console.log('File written:', success);
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
}

// Example 9: Certificate revocation check with proper typing
function crlExample() {
  const crl = api.crl as CRLPlugin;
  if (crl) {
    const certificate = 'base64-encoded-certificate';
    const crlData = 'base64-encoded-crl';

    // Open CRL
    crl.openCrl(
      crlData,
      (event: MessageEvent, crlId: any) => {
        console.log('CRL opened with ID:', crlId);

        // Check certificate status
        crl.checkCertificate(
          certificate,
          crlId,
          (event: MessageEvent, status: any) => {
            if (status.isRevoked) {
              console.log('Certificate is revoked:', status.revocationDate);
            } else {
              console.log('Certificate is valid');
            }
          },
          (error: any) => {
            console.error('Error checking certificate:', error);
          }
        );
      },
      (error: any) => {
        console.error('Error opening CRL:', error);
      }
    );
  }
}

// Example 10: Encrypted tunnel with proper typing
function tunnelExample() {
  const tunnel = api.tunnel as TunnelPlugin;
  if (tunnel) {
    const serverHost = 'secure.example.com';
    const serverPort = 443;
    const keyId = 'your-key-id';

    tunnel.createTunnel(
      serverHost,
      serverPort,
      keyId,
      (event: MessageEvent, result: any) => {
        console.log('Secure tunnel created on port:', result.port);
        // Use the local port for secure communication
      },
      (error: any) => {
        console.error('Error creating tunnel:', error);
      }
    );
  }
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
          if (data.certificates && data.certificates.length > 0) {
            const cert = data.certificates[0];
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
                    'no', // not detached
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

// Run examples
console.log('🚀 E-IMZO API Comprehensive Examples');
console.log('=====================================');

initializeExample();

export {
  initializeExample,
  pfxExample,
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
