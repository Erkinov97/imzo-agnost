// Type definitions for E-IMZO Client
import CAPIWS from './e-imzo/capiws';

// Extend Date interface to include custom methods
declare global {
  interface Date {
    yyyymmdd(): string;
    ddmmyyyy(): string;
  }

  interface String {
    splitKeep(splitter: string | RegExp, ahead?: boolean): string[];
  }
}

// Date prototype extensions
Date.prototype.yyyymmdd = function (): string {
  const yyyy = this.getFullYear().toString();
  const mm = (this.getMonth() + 1).toString(); // getMonth() is zero-based
  const dd = this.getDate().toString();
  return yyyy + (mm[1] ? mm : '0' + mm[0]) + (dd[1] ? dd : '0' + dd[0]); // padding
};

Date.prototype.ddmmyyyy = function (): string {
  const yyyy = this.getFullYear().toString();
  const mm = (this.getMonth() + 1).toString(); // getMonth() is zero-based
  const dd = this.getDate().toString();
  return (dd[1] ? dd : '0' + dd[0]) + '.' + (mm[1] ? mm : '0' + mm[0]) + '.' + yyyy; // padding
};

// Type definitions
interface DateConvertible {
  year?: number;
  month?: number;
  date?: number;
}

interface DatesUtility {
  convert(d: Date | number[] | number | string | DateConvertible): Date | number;
  compare(a: any, b: any): number;
  inRange(d: any, start: any, end: any): boolean | number;
}

interface CertificateInfo {
  disk?: string;
  path?: string;
  name?: string;
  alias?: string;
  cardUID?: string;
  statusInfo?: string;
  ownerName?: string;
  info?: string;
  serialNumber: string;
  validFrom: Date;
  validTo: Date;
  CN: string;
  TIN: string;
  UID: string;
  PINFL: string;
  O: string;
  T: string;
  type: 'pfx' | 'ftjc';
}

interface ErrorInfo {
  e?: any;
  r?: string;
}

type FailCallback = (error: unknown, reason: string | null) => void;

type ItemIdGenerator = (vo: CertificateInfo, rec: string) => string;

type ItemUiGenerator = (key: string, vo: CertificateInfo) => any;

interface ApiResponse {
  success: boolean;
  reason?: string;
  major?: string;
  minor?: string;
  keyId?: string;
  pkcs7_64?: string;
  readers?: any[];
  certificates?: any[];
  tokens?: any[];
}

interface EIMZOClientType {
  NEW_API: boolean;
  NEW_API2: boolean;
  API_KEYS: string[];
  checkVersion(success: (major: string, minor: string) => void, fail: FailCallback): void;
  installApiKeys(success: () => void, fail: FailCallback): void;
  listAllUserKeys(
    itemIdGen: ItemIdGenerator,
    itemUiGen: ItemUiGenerator,
    success: (items: any[], firstId: string | null) => void,
    fail: FailCallback
  ): void;
  idCardIsPLuggedIn(success: (isPlugged: boolean) => void, fail: FailCallback): void;
  loadKey(
    itemObject: CertificateInfo,
    success: (id: string) => void,
    fail: FailCallback,
    verifyPassword?: boolean
  ): void;
  changeKeyPassword(itemObject: CertificateInfo, success: () => void, fail: FailCallback): void;
  createPkcs7(
    id: string,
    data: string,
    timestamper: any,
    success: (pkcs7: string) => void,
    fail: FailCallback,
    detached?: boolean,
    isDataBase64Encoded?: boolean
  ): void;
  _getX500Val(s: string, f: string): string;
  _findPfxs2(
    itemIdGen: ItemIdGenerator,
    itemUiGen: ItemUiGenerator,
    items: any[],
    errors: ErrorInfo[],
    callback: (firstItemId?: string) => void
  ): void;
  _findTokens2(
    itemIdGen: ItemIdGenerator,
    itemUiGen: ItemUiGenerator,
    items: any[],
    errors: ErrorInfo[],
    callback: (firstItemId?: string) => void
  ): void;
}

// Dates utility object
const dates: DatesUtility = {
  convert(d: Date | number[] | number | string | DateConvertible): Date | number {
    // Converts the date in d to a date-object. The input can be:
    //   a date object: returned without modification
    //  an array      : Interpreted as [year,month,day]. NOTE: month is 0-11.
    //   a number     : Interpreted as number of milliseconds
    //                  since 1 Jan 1970 (a timestamp)
    //   a string     : Any format supported by the javascript engine, like
    //                  "YYYY/MM/DD", "MM/DD/YYYY", "Jan 31 2009" etc.
    //  an object     : Interpreted as an object with year, month and date
    //                  attributes.  **NOTE** month is 0-11.
    if (d instanceof Date) {
      return d;
    } else if (Array.isArray(d) && d.length >= 3) {
      return new Date(d[0] || 0, d[1] || 0, d[2] || 0);
    } else if (typeof d === 'number') {
      return new Date(d);
    } else if (typeof d === 'string') {
      return new Date(d);
    } else if (typeof d === 'object' && d !== null) {
      const dateObj = d as DateConvertible;
      return new Date(dateObj.year || 0, dateObj.month || 0, dateObj.date || 0);
    }
    return NaN;
  },

  compare(a: any, b: any): number {
    // Compare two dates (could be of any type supported by the convert
    // function above) and returns:
    //  -1 : if a < b
    //   0 : if a = b
    //   1 : if a > b
    // NaN : if a or b is an illegal date
    // NOTE: The code inside isFinite does an assignment (=).
    const aVal = this.convert(a).valueOf();
    const bVal = this.convert(b).valueOf();
    return isFinite(aVal) && isFinite(bVal) ? (aVal > bVal ? 1 : 0) - (aVal < bVal ? 1 : 0) : NaN;
  },

  inRange(d: any, start: any, end: any): boolean | number {
    // Checks if date in d is between dates in start and end.
    // Returns a boolean or NaN:
    //    true  : if d is between start and end (inclusive)
    //    false : if d is before start or after end
    //    NaN   : if one or more of the dates is illegal.
    // NOTE: The code inside isFinite does an assignment (=).
    const dVal = this.convert(d).valueOf();
    const startVal = this.convert(start).valueOf();
    const endVal = this.convert(end).valueOf();
    return isFinite(dVal) && isFinite(startVal) && isFinite(endVal)
      ? startVal <= dVal && dVal <= endVal
      : NaN;
  }
};

// String prototype extension
String.prototype.splitKeep = function (splitter: string | RegExp, ahead?: boolean): string[] {
  const inputString = this;
  const result: string[] = [];

  if (splitter !== '') {
    // Substitution of matched string
    function getSubst(value: string): string {
      const substChar = value[0] === '0' ? '1' : '0';
      let subst = '';
      for (let i = 0; i < value.length; i++) {
        subst += substChar;
      }
      return subst;
    }

    const matches: Array<{ value: string; index: number }> = [];

    // Getting matched value and its index
    const replaceName = splitter instanceof RegExp ? 'replace' : 'replaceAll';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (inputString as any)[replaceName](splitter, (m: string, i: number) => {
      matches.push({ value: m, index: i });
      return getSubst(m);
    });

    // Finds split substrings
    let lastIndex = 0;
    for (let i = 0; i < matches.length; i++) {
      const m = matches[i];
      if (m) {
        const nextIndex = ahead === true ? m.index : m.index + m.value.length;
        if (nextIndex !== lastIndex) {
          const part = inputString.substring(lastIndex, nextIndex);
          result.push(part);
          lastIndex = nextIndex;
        }
      }
    }
    if (lastIndex < inputString.length) {
      const part = inputString.substring(lastIndex, inputString.length);
      result.push(part);
    }
  } else {
    result.push(inputString.toString());
  }
  return result;
};

// E-IMZO Client implementation
const EIMZOClient: EIMZOClientType = {
  NEW_API: false,
  NEW_API2: false,
  API_KEYS: [
    'localhost',
    '96D0C1491615C82B9A54D9989779DF825B690748224C2B04F500F370D51827CE2644D8D4A82C18184D73AB8530BB8ED537269603F61DB0D03D2104ABF789970B',
    '127.0.0.1',
    'A7BCFA5D490B351BE0754130DF03A068F855DB4333D43921125B9CF2670EF6A40370C646B90401955E1F7BC9CDBF59CE0B2C5467D820BE189C845D0B79CFC96F'
  ],

  checkVersion(success: (major: string, minor: string) => void, fail: FailCallback): void {
    CAPIWS.version(
      (event: MessageEvent, data: ApiResponse) => {
        if (data.success === true) {
          if (data.major && data.minor) {
            const installedVersion = parseInt(data.major) * 100 + parseInt(data.minor);
            EIMZOClient.NEW_API = installedVersion >= 336;
            EIMZOClient.NEW_API2 = installedVersion >= 412;
            success(data.major, data.minor);
          } else {
            fail(null, 'E-IMZO Version is undefined');
          }
        } else {
          fail(null, data.reason || 'Unknown error');
        }
      },
      (e: any) => {
        fail(e, null);
      }
    );
  },

  installApiKeys(success: () => void, fail: FailCallback): void {
    CAPIWS.apikey(
      EIMZOClient.API_KEYS,
      (event: MessageEvent, data: ApiResponse) => {
        if (data.success) {
          success();
        } else {
          fail(null, data.reason || 'Unknown error');
        }
      },
      (e: any) => {
        fail(e, null);
      }
    );
  },

  listAllUserKeys(
    itemIdGen: ItemIdGenerator,
    itemUiGen: ItemUiGenerator,
    success: (items: any[], firstId: string | null) => void,
    fail: FailCallback
  ): void {
    const items: any[] = [];
    const errors: ErrorInfo[] = [];

    if (!EIMZOClient.NEW_API) {
      fail(null, 'Please install new version of E-IMZO');
    } else {
      if (EIMZOClient.NEW_API2) {
        EIMZOClient._findPfxs2(itemIdGen, itemUiGen, items, errors, (firstItmId2?: string) => {
          if (items.length === 0 && errors.length > 0) {
            const firstError = errors[0];
            if (firstError) {
              fail(firstError.e, firstError.r || null);
            }
          } else {
            let firstId: string | null = null;
            if (items.length === 1 && firstItmId2) {
              firstId = firstItmId2;
            }
            success(items, firstId);
          }
        });
      } else {
        EIMZOClient._findPfxs2(itemIdGen, itemUiGen, items, errors, (firstItmId2?: string) => {
          EIMZOClient._findTokens2(itemIdGen, itemUiGen, items, errors, (firstItmId3?: string) => {
            if (items.length === 0 && errors.length > 0) {
              const firstError = errors[0];
              if (firstError) {
                fail(firstError.e, firstError.r || null);
              }
            } else {
              let firstId: string | null = null;
              if (items.length === 1) {
                if (firstItmId2) {
                  firstId = firstItmId2;
                } else if (firstItmId3) {
                  firstId = firstItmId3;
                }
              }
              success(items, firstId);
            }
          });
        });
      }
    }
  },

  idCardIsPLuggedIn(success: (isPlugged: boolean) => void, fail: FailCallback): void {
    if (!EIMZOClient.NEW_API2) {
      console.log('E-IMZO version should be 4.12 or newer');
      success(false);
    } else {
      CAPIWS.callFunction(
        { plugin: 'idcard', name: 'list_readers' },
        (event: MessageEvent, data: ApiResponse) => {
          if (data.success) {
            success((data.readers?.length || 0) > 0);
          } else {
            fail(null, data.reason || 'Unknown error');
          }
        },
        (e: any) => {
          fail(e, null);
        }
      );
    }
  },

  loadKey(
    itemObject: CertificateInfo,
    success: (id: string) => void,
    fail: FailCallback,
    verifyPassword?: boolean
  ): void {
    if (itemObject) {
      const vo = itemObject;
      if (vo.type === 'pfx') {
        CAPIWS.callFunction(
          {
            plugin: 'pfx',
            name: 'load_key',
            arguments: [vo.disk, vo.path, vo.name, vo.alias]
          },
          (event: MessageEvent, data: ApiResponse) => {
            if (data.success && data.keyId) {
              const id = data.keyId;
              if (verifyPassword) {
                CAPIWS.callFunction(
                  { name: 'verify_password', plugin: 'pfx', arguments: [id] },
                  (event: MessageEvent, data: ApiResponse) => {
                    if (data.success) {
                      success(id);
                    } else {
                      fail(null, data.reason || 'Password verification failed');
                    }
                  },
                  (e: any) => {
                    fail(e, null);
                  }
                );
              } else {
                success(id);
              }
            } else {
              fail(null, data.reason || 'Failed to load key');
            }
          },
          (e: any) => {
            fail(e, null);
          }
        );
      } else if (vo.type === 'ftjc') {
        CAPIWS.callFunction(
          { plugin: 'ftjc', name: 'load_key', arguments: [vo.cardUID] },
          (event: MessageEvent, data: ApiResponse) => {
            if (data.success && data.keyId) {
              const id = data.keyId;
              if (verifyPassword) {
                CAPIWS.callFunction(
                  { plugin: 'ftjc', name: 'verify_pin', arguments: [id, '1'] },
                  (event: MessageEvent, data: ApiResponse) => {
                    if (data.success) {
                      success(id);
                    } else {
                      fail(null, data.reason || 'PIN verification failed');
                    }
                  },
                  (e: any) => {
                    fail(e, null);
                  }
                );
              } else {
                success(id);
              }
            } else {
              fail(null, data.reason || 'Failed to load key');
            }
          },
          (e: any) => {
            fail(e, null);
          }
        );
      }
    }
  },

  changeKeyPassword(itemObject: CertificateInfo, success: () => void, fail: FailCallback): void {
    if (itemObject) {
      const vo = itemObject;
      if (vo.type === 'pfx') {
        CAPIWS.callFunction(
          {
            plugin: 'pfx',
            name: 'load_key',
            arguments: [vo.disk, vo.path, vo.name, vo.alias]
          },
          (event: MessageEvent, data: ApiResponse) => {
            if (data.success && data.keyId) {
              const id = data.keyId;
              CAPIWS.callFunction(
                { name: 'change_password', plugin: 'pfx', arguments: [id] },
                (event: MessageEvent, data: ApiResponse) => {
                  if (data.success) {
                    success();
                  } else {
                    fail(null, data.reason || 'Failed to change password');
                  }
                },
                (e: any) => {
                  fail(e, null);
                }
              );
            } else {
              fail(null, data.reason || 'Failed to load key');
            }
          },
          (e: any) => {
            fail(e, null);
          }
        );
      } else if (vo.type === 'ftjc') {
        CAPIWS.callFunction(
          { plugin: 'ftjc', name: 'load_key', arguments: [vo.cardUID] },
          (event: MessageEvent, data: ApiResponse) => {
            if (data.success && data.keyId) {
              const id = data.keyId;
              CAPIWS.callFunction(
                { name: 'change_pin', plugin: 'ftjc', arguments: [id, '1'] },
                (event: MessageEvent, data: ApiResponse) => {
                  if (data.success) {
                    success();
                  } else {
                    fail(null, data.reason || 'Failed to change PIN');
                  }
                },
                (e: any) => {
                  fail(e, null);
                }
              );
            } else {
              fail(null, data.reason || 'Failed to load key');
            }
          },
          (e: any) => {
            fail(e, null);
          }
        );
      }
    }
  },

  createPkcs7(
    id: string,
    data: string,
    timestamper: any,
    success: (pkcs7: string) => void,
    fail: FailCallback,
    detached?: boolean,
    isDataBase64Encoded?: boolean
  ): void {
    // Note: Base64 should be imported or defined elsewhere
    let data64: string;
    if (isDataBase64Encoded === true) {
      data64 = data;
    } else {
      // Assuming Base64 utility is available globally or imported
      data64 = (globalThis as any).Base64?.encode(data) || btoa(data);
    }

    const detachedStr = detached === true ? 'yes' : 'no';

    CAPIWS.callFunction(
      {
        plugin: 'pkcs7',
        name: 'create_pkcs7',
        arguments: [data64, id, detachedStr]
      },
      (event: MessageEvent, data: ApiResponse) => {
        if (data.success && data.pkcs7_64) {
          const pkcs7 = data.pkcs7_64;
          success(pkcs7);
        } else {
          fail(null, data.reason || 'Failed to create PKCS7');
        }
      },
      (e: any) => {
        fail(e, null);
      }
    );
  },

  _getX500Val(s: string, f: string): string {
    const res = s.splitKeep(/,[A-Z]+=/g, true);
    for (const i in res) {
      const resItem = res[i];
      if (resItem) {
        const n = resItem.search((parseInt(i) > 0 ? ',' : '') + f + '=');
        if (n !== -1) {
          return resItem.slice(n + f.length + 1 + (parseInt(i) > 0 ? 1 : 0));
        }
      }
    }
    return '';
  },

  _findPfxs2(
    itemIdGen: ItemIdGenerator,
    itemUiGen: ItemUiGenerator,
    items: any[],
    errors: ErrorInfo[],
    callback: (firstItemId?: string) => void
  ): void {
    let itmkey0: string | undefined;

    CAPIWS.callFunction(
      { plugin: 'pfx', name: 'list_all_certificates' },
      (event: MessageEvent, data: ApiResponse) => {
        if (data.success && data.certificates) {
          for (const rec in data.certificates) {
            const el = data.certificates[rec];
            let x500name_ex = el.alias.toUpperCase();
            x500name_ex = x500name_ex.replace('1.2.860.3.16.1.1=', 'INN=');
            x500name_ex = x500name_ex.replace('1.2.860.3.16.1.2=', 'PINFL=');

            const vo: CertificateInfo = {
              disk: el.disk,
              path: el.path,
              name: el.name,
              alias: el.alias,
              serialNumber: EIMZOClient._getX500Val(x500name_ex, 'SERIALNUMBER'),
              validFrom: new Date(
                EIMZOClient._getX500Val(x500name_ex, 'VALIDFROM')
                  .replace(/\./g, '-')
                  .replace(' ', 'T')
              ),
              validTo: new Date(
                EIMZOClient._getX500Val(x500name_ex, 'VALIDTO')
                  .replace(/\./g, '-')
                  .replace(' ', 'T')
              ),
              CN: EIMZOClient._getX500Val(x500name_ex, 'CN'),
              TIN:
                EIMZOClient._getX500Val(x500name_ex, 'INN') ||
                EIMZOClient._getX500Val(x500name_ex, 'UID'),
              UID: EIMZOClient._getX500Val(x500name_ex, 'UID'),
              PINFL: EIMZOClient._getX500Val(x500name_ex, 'PINFL'),
              O: EIMZOClient._getX500Val(x500name_ex, 'O'),
              T: EIMZOClient._getX500Val(x500name_ex, 'T'),
              type: 'pfx'
            };

            if (!vo.TIN && !vo.PINFL) continue;

            const itmkey = itemIdGen(vo, rec);
            if (!itmkey0) {
              itmkey0 = itmkey;
            }
            const itm = itemUiGen(itmkey, vo);
            items.push(itm);
          }
        } else {
          errors.push({ r: data.reason || 'Failed to list certificates' });
        }
        callback(itmkey0);
      },
      (e: any) => {
        errors.push({ e: e });
        callback(itmkey0);
      }
    );
  },

  _findTokens2(
    itemIdGen: ItemIdGenerator,
    itemUiGen: ItemUiGenerator,
    items: any[],
    errors: ErrorInfo[],
    callback: (firstItemId?: string) => void
  ): void {
    let itmkey0: string | undefined;

    CAPIWS.callFunction(
      { plugin: 'ftjc', name: 'list_all_keys', arguments: [''] },
      (event: MessageEvent, data: ApiResponse) => {
        if (data.success && data.tokens) {
          for (const rec in data.tokens) {
            const el = data.tokens[rec];
            let x500name_ex = el.info.toUpperCase();
            x500name_ex = x500name_ex.replace('1.2.860.3.16.1.1=', 'INN=');
            x500name_ex = x500name_ex.replace('1.2.860.3.16.1.2=', 'PINFL=');

            const vo: CertificateInfo = {
              cardUID: el.cardUID,
              statusInfo: el.statusInfo,
              ownerName: el.ownerName,
              info: el.info,
              serialNumber: EIMZOClient._getX500Val(x500name_ex, 'SERIALNUMBER'),
              validFrom: new Date(EIMZOClient._getX500Val(x500name_ex, 'VALIDFROM')),
              validTo: new Date(EIMZOClient._getX500Val(x500name_ex, 'VALIDTO')),
              CN: EIMZOClient._getX500Val(x500name_ex, 'CN'),
              TIN:
                EIMZOClient._getX500Val(x500name_ex, 'INN') ||
                EIMZOClient._getX500Val(x500name_ex, 'UID'),
              UID: EIMZOClient._getX500Val(x500name_ex, 'UID'),
              PINFL: EIMZOClient._getX500Val(x500name_ex, 'PINFL'),
              O: EIMZOClient._getX500Val(x500name_ex, 'O'),
              T: EIMZOClient._getX500Val(x500name_ex, 'T'),
              type: 'ftjc'
            };

            if (!vo.TIN && !vo.PINFL) continue;

            const itmkey = itemIdGen(vo, rec);
            if (!itmkey0) {
              itmkey0 = itmkey;
            }
            const itm = itemUiGen(itmkey, vo);
            items.push(itm);
          }
        } else {
          errors.push({ r: data.reason || 'Failed to list tokens' });
        }
        callback(itmkey0);
      },
      (e: any) => {
        errors.push({ e: e });
        callback(itmkey0);
      }
    );
  }
};

export default EIMZOClient;
export { dates, type CertificateInfo, type EIMZOClientType };
