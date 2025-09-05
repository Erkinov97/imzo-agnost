// Type declarations for browser environment
interface WindowLocation {
  protocol: string;
}

interface BrowserWindow {
  location: WindowLocation;
  WebSocket: typeof WebSocket;
}

interface EIMZOEXTType {
  URL: string;
  callFunction: (
    funcDef: any,
    callback: (event: MessageEvent, data: any) => void,
    error?: (errorCode?: any) => void
  ) => void;
  version: (
    callback: (event: MessageEvent, data: any) => void,
    error?: (errorCode?: any) => void
  ) => void;
  apidoc: (
    callback: (event: MessageEvent, data: any) => void,
    error?: (errorCode?: any) => void
  ) => void;
  apikey: (
    domainAndKey: any,
    callback: (event: MessageEvent, data: any) => void,
    error?: (errorCode?: any) => void
  ) => void;
}

// Browser globals
declare const window: BrowserWindow;
declare const EIMZOEXT: EIMZOEXTType | undefined;

const CAPIWS: EIMZOEXTType =
  typeof EIMZOEXT !== 'undefined'
    ? EIMZOEXT
    : {
        URL:
          (window.location.protocol.toLowerCase() === 'https:'
            ? 'wss://127.0.0.1:64443'
            : 'ws://127.0.0.1:64646') + '/service/cryptapi',
        callFunction: function (
          funcDef: any,
          callback: (event: MessageEvent, data: any) => void,
          error?: (errorCode?: any) => void
        ): void {
          if (!window.WebSocket) {
            if (error) error();
            return;
          }
          let socket: WebSocket;
          try {
            socket = new WebSocket(this.URL);
          } catch (e) {
            if (error) error(e);
            return;
          }
          socket.onclose = function (e: CloseEvent): void {
            if (error) {
              if (e.code !== 1000) {
                error(e.code);
              }
            }
          };
          socket.onmessage = function (event: MessageEvent): void {
            const data = JSON.parse(event.data);
            socket.close();
            callback(event, data);
          };
          socket.onopen = function (): void {
            socket.send(JSON.stringify(funcDef));
          };
        },
        version: function (
          callback: (event: MessageEvent, data: any) => void,
          error?: (errorCode?: any) => void
        ): void {
          if (!window.WebSocket) {
            if (error) error();
            return;
          }
          let socket: WebSocket;
          try {
            socket = new WebSocket(this.URL);
          } catch (e) {
            if (error) error(e);
            return;
          }
          socket.onclose = function (e: CloseEvent): void {
            if (error) {
              if (e.code !== 1000) {
                error(e.code);
              }
            }
          };
          socket.onmessage = function (event: MessageEvent): void {
            const data = JSON.parse(event.data);
            socket.close();
            callback(event, data);
          };
          socket.onopen = function (): void {
            const o = { name: 'version' };
            socket.send(JSON.stringify(o));
          };
        },
        apidoc: function (
          callback: (event: MessageEvent, data: any) => void,
          error?: (errorCode?: any) => void
        ): void {
          if (!window.WebSocket) {
            if (error) error();
            return;
          }
          let socket: WebSocket;
          try {
            socket = new WebSocket(this.URL);
          } catch (e) {
            if (error) error(e);
            return;
          }
          socket.onclose = function (e: CloseEvent): void {
            if (error) {
              if (e.code !== 1000) {
                error(e.code);
              }
            }
          };
          socket.onmessage = function (event: MessageEvent): void {
            const data = JSON.parse(event.data);
            socket.close();
            callback(event, data);
          };
          socket.onopen = function (): void {
            const o = { name: 'apidoc' };
            socket.send(JSON.stringify(o));
          };
        },
        apikey: function (
          domainAndKey: any,
          callback: (event: MessageEvent, data: any) => void,
          error?: (errorCode?: any) => void
        ): void {
          if (!window.WebSocket) {
            if (error) error();
            return;
          }
          let socket: WebSocket;
          try {
            socket = new WebSocket(this.URL);
          } catch (e) {
            if (error) error(e);
            return;
          }
          socket.onclose = function (e: CloseEvent): void {
            if (error) {
              if (e.code !== 1000) {
                error(e.code);
              }
            }
          };
          socket.onmessage = function (event: MessageEvent): void {
            const data = JSON.parse(event.data);
            socket.close();
            callback(event, data);
          };
          socket.onopen = function (): void {
            const o = { name: 'apikey', arguments: domainAndKey };
            socket.send(JSON.stringify(o));
          };
        }
      };

export default CAPIWS;
export type { EIMZOEXTType };
