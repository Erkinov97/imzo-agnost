# Tunnel Plugin API Reference

Tunnel plugin xavfsiz tunnel ulanishlarini yaratish va boshqarish uchun
mo'ljallangan. Bu plugin VPN, proxy, secure channels va network tunneling
operatsiyalarini amalga oshirish uchun ishlatiladi.

## Overview

Tunnel plugin quyidagi funksiyalarni taqdim etadi:

- Secure tunnel yaratish va boshqarish
- VPN ulanishlarini o'rnatish
- Proxy tunnel konfiguratsiyasi
- SSL/TLS tunnel yaratish
- Network traffic routing
- Tunnel monitoring va logging
- Multi-protocol tunnel support

## Import

```typescript
// ES6 import
import { tunnelPlugin } from 'imzo-agnost';

// CommonJS
const { tunnelPlugin } = require('imzo-agnost');

// Global object (browser)
window.eimzoApi.tunnel;
```

## Types

```typescript
interface TunnelConfiguration {
  tunnelId: string;
  name: string;
  type: 'VPN' | 'PROXY' | 'SSL' | 'SSH' | 'IPSEC' | 'CUSTOM';
  protocol: 'TCP' | 'UDP' | 'HTTP' | 'HTTPS' | 'SOCKS5' | 'PPTP' | 'L2TP';
  localEndpoint: TunnelEndpoint;
  remoteEndpoint: TunnelEndpoint;
  authentication: TunnelAuthentication;
  encryption: TunnelEncryption;
  routing: TunnelRouting;
  status: 'INACTIVE' | 'CONNECTING' | 'CONNECTED' | 'DISCONNECTING' | 'ERROR';
  created: string;
  lastConnected?: string;
  lastDisconnected?: string;
  statistics: TunnelStatistics;
}

interface TunnelEndpoint {
  host: string;
  port: number;
  interface?: string;
  bindAddress?: string;
  keepAlive?: boolean;
  timeout?: number;
  retryAttempts?: number;
  healthCheck?: HealthCheckConfig;
}

interface TunnelAuthentication {
  method:
    | 'NONE'
    | 'PASSWORD'
    | 'CERTIFICATE'
    | 'PSK'
    | 'TOKEN'
    | 'MULTI_FACTOR';
  username?: string;
  password?: string;
  certificate?: string;
  privateKey?: string;
  presharedKey?: string;
  token?: string;
  mfaConfig?: MFAConfig;
  sessionTimeout?: number;
}

interface TunnelEncryption {
  enabled: boolean;
  algorithm: 'AES-256' | 'AES-128' | 'CHACHA20' | '3DES' | 'BLOWFISH';
  mode: 'CBC' | 'GCM' | 'CTR' | 'OFB' | 'CFB';
  keySize: number;
  keyExchange: 'DHE' | 'ECDHE' | 'RSA' | 'PSK';
  integrityCheck: 'HMAC-SHA256' | 'HMAC-SHA1' | 'POLY1305';
  compression?: boolean;
}

interface TunnelRouting {
  mode: 'FULL' | 'SPLIT' | 'CUSTOM';
  routes: TunnelRoute[];
  dnsServers?: string[];
  defaultGateway?: boolean;
  bypassRules?: BypassRule[];
  priorities?: number[];
}

interface TunnelRoute {
  destination: string; // IP range or domain
  gateway?: string;
  metric?: number;
  interface?: string;
  enabled: boolean;
}

interface BypassRule {
  type: 'IP' | 'DOMAIN' | 'PORT' | 'APPLICATION';
  pattern: string;
  action: 'ALLOW' | 'DENY' | 'DIRECT';
  enabled: boolean;
}

interface TunnelStatistics {
  bytesReceived: number;
  bytesSent: number;
  packetsReceived: number;
  packetsSent: number;
  connectionTime: number; // milliseconds
  reconnectCount: number;
  errorCount: number;
  lastError?: string;
  throughput: ThroughputStats;
  latency: LatencyStats;
}

interface ThroughputStats {
  downloadSpeed: number; // bytes/sec
  uploadSpeed: number; // bytes/sec
  peakDownload: number;
  peakUpload: number;
  averageDownload: number;
  averageUpload: number;
}

interface LatencyStats {
  current: number; // milliseconds
  average: number;
  minimum: number;
  maximum: number;
  jitter: number;
}

interface HealthCheckConfig {
  enabled: boolean;
  interval: number; // seconds
  timeout: number; // seconds
  retries: number;
  endpoint: string;
  method: 'PING' | 'HTTP' | 'TCP' | 'CUSTOM';
  expectedResponse?: string;
}

interface MFAConfig {
  methods: ('SMS' | 'EMAIL' | 'TOTP' | 'HARDWARE_TOKEN')[];
  requiredMethods: number;
  timeout: number;
  retryAttempts: number;
}
```

## Tunnel Management

### createTunnelAsync()

Yangi tunnel yaratish.

```typescript
try {
  console.log('🚇 Creating secure tunnel...');

  const tunnelResult = await tunnelPlugin.createTunnelAsync({
    name: 'Corporate VPN Tunnel',
    type: 'VPN',
    protocol: 'HTTPS',
    localEndpoint: {
      host: '0.0.0.0', // Bind to all interfaces
      port: 8443,
      interface: 'eth0',
      keepAlive: true,
      timeout: 30000, // 30 seconds
      retryAttempts: 3,
      healthCheck: {
        enabled: true,
        interval: 60, // Check every minute
        timeout: 10,
        retries: 3,
        method: 'PING',
        endpoint: '8.8.8.8'
      }
    },
    remoteEndpoint: {
      host: 'vpn.company.com',
      port: 443,
      keepAlive: true,
      timeout: 30000,
      retryAttempts: 5
    },
    authentication: {
      method: 'CERTIFICATE',
      certificate: 'MIIDcert...', // Client certificate
      privateKey: 'MIIEpri...', // Private key
      username: 'vpn_user',
      sessionTimeout: 28800 // 8 hours
    },
    encryption: {
      enabled: true,
      algorithm: 'AES-256',
      mode: 'GCM',
      keySize: 256,
      keyExchange: 'ECDHE',
      integrityCheck: 'HMAC-SHA256',
      compression: true
    },
    routing: {
      mode: 'SPLIT', // Split tunneling
      routes: [
        {
          destination: '10.0.0.0/8', // Corporate network
          enabled: true
        },
        {
          destination: '192.168.0.0/16', // Local networks
          enabled: true
        }
      ],
      dnsServers: ['10.0.1.1', '10.0.1.2'],
      defaultGateway: false, // Don't route all traffic
      bypassRules: [
        {
          type: 'DOMAIN',
          pattern: '*.local',
          action: 'DIRECT',
          enabled: true
        },
        {
          type: 'IP',
          pattern: '192.168.1.0/24',
          action: 'DIRECT',
          enabled: true
        }
      ]
    },
    autoConnect: false, // Manual connection
    persistConfiguration: true, // Save configuration
    loggingEnabled: true,
    monitoring: {
      enabled: true,
      interval: 30, // Monitor every 30 seconds
      alertThresholds: {
        latency: 1000, // Alert if latency > 1000ms
        packetLoss: 5, // Alert if packet loss > 5%
        disconnectCount: 3 // Alert if disconnects > 3 in hour
      }
    }
  });

  if (tunnelResult.success) {
    console.log('✅ Tunnel created successfully');
    console.log('Tunnel ID:', tunnelResult.tunnelId);
    console.log('Name:', tunnelResult.name);
    console.log('Type:', tunnelResult.type);
    console.log('Protocol:', tunnelResult.protocol);
    console.log('Status:', tunnelResult.status);
    console.log(
      'Local endpoint:',
      `${tunnelResult.localEndpoint.host}:${tunnelResult.localEndpoint.port}`
    );
    console.log(
      'Remote endpoint:',
      `${tunnelResult.remoteEndpoint.host}:${tunnelResult.remoteEndpoint.port}`
    );

    // Configuration summary
    console.log('\n⚙️ Configuration Summary:');
    console.log('Authentication:', tunnelResult.authentication.method);
    console.log(
      'Encryption:',
      tunnelResult.encryption.enabled
        ? `${tunnelResult.encryption.algorithm}-${tunnelResult.encryption.keySize}`
        : 'Disabled'
    );
    console.log('Routing mode:', tunnelResult.routing.mode);
    console.log('Routes configured:', tunnelResult.routing.routes.length);
    console.log('Bypass rules:', tunnelResult.routing.bypassRules?.length || 0);

    // Security information
    if (tunnelResult.securityInfo) {
      console.log('\n🔒 Security Information:');
      console.log(
        'Encryption strength:',
        tunnelResult.securityInfo.encryptionStrength
      );
      console.log(
        'Key exchange method:',
        tunnelResult.securityInfo.keyExchange
      );
      console.log(
        'Integrity protection:',
        tunnelResult.securityInfo.integrityProtection
      );
      console.log(
        'Perfect forward secrecy:',
        tunnelResult.securityInfo.pfs ? '✅' : '❌'
      );
    }

    return tunnelResult.tunnelId;
  } else {
    console.error('❌ Tunnel creation failed:', tunnelResult.reason);
  }
} catch (error) {
  console.error('❌ Tunnel creation error:', error);
}
```

### connectTunnelAsync()

Tunnel ga ulanish.

```typescript
try {
  const tunnelId = 'corporate_vpn_tunnel';

  console.log('🔌 Connecting to tunnel...');
  console.log('Tunnel ID:', tunnelId);

  const connectResult = await tunnelPlugin.connectTunnelAsync(tunnelId, {
    timeout: 60000, // 60 seconds connection timeout
    retryAttempts: 3,
    retryDelay: 5000, // 5 seconds between retries
    waitForEstablishment: true, // Wait for full establishment
    validateConnection: true, // Validate connection after establishment
    enableMonitoring: true, // Start monitoring after connection
    preserveExistingRoutes: false, // Replace existing routes
    dnsConfiguration: {
      updateSystemDNS: true,
      backupOriginalDNS: true,
      validateDNSResolution: true
    }
  });

  if (connectResult.success) {
    console.log('✅ Tunnel connected successfully');

    const connection = connectResult.connectionInfo;
    console.log('\n🔗 Connection Information:');
    console.log('Status:', connection.status);
    console.log(
      'Connected at:',
      new Date(connection.connectedAt).toLocaleString()
    );
    console.log('Connection time:', `${connection.connectionTime}ms`);
    console.log('Local IP:', connection.localIP);
    console.log('Remote IP:', connection.remoteIP);
    console.log('Assigned IP:', connection.assignedIP);

    // Network configuration
    if (connection.networkConfig) {
      console.log('\n🌐 Network Configuration:');
      console.log('Gateway:', connection.networkConfig.gateway);
      console.log('Subnet mask:', connection.networkConfig.subnetMask);
      console.log(
        'DNS servers:',
        connection.networkConfig.dnsServers.join(', ')
      );
      console.log('MTU:', connection.networkConfig.mtu);

      if (connection.networkConfig.routes.length > 0) {
        console.log('\nActive routes:');
        connection.networkConfig.routes.forEach((route, index) => {
          console.log(
            `${index + 1}. ${route.destination} via ${route.gateway}`
          );
        });
      }
    }

    // Security information
    if (connection.securityInfo) {
      console.log('\n🔐 Security Details:');
      console.log('Cipher suite:', connection.securityInfo.cipherSuite);
      console.log('Protocol version:', connection.securityInfo.protocolVersion);
      console.log('Key length:', connection.securityInfo.keyLength);
      console.log('Session ID:', connection.securityInfo.sessionId);
      console.log(
        'Certificate verified:',
        connection.securityInfo.certificateVerified ? '✅' : '❌'
      );
    }

    // Connection quality
    if (connection.quality) {
      console.log('\n📊 Connection Quality:');
      console.log('Latency:', `${connection.quality.latency}ms`);
      console.log(
        'Bandwidth:',
        `${formatBandwidth(connection.quality.bandwidth)}`
      );
      console.log('Packet loss:', `${connection.quality.packetLoss}%`);
      console.log('Signal strength:', `${connection.quality.signalStrength}%`);
    }

    // Start connection monitoring
    console.log('\n👁️ Starting connection monitoring...');

    const monitoringResult = await tunnelPlugin.startMonitoringAsync(tunnelId, {
      interval: 30, // Monitor every 30 seconds
      metrics: ['latency', 'throughput', 'packet_loss', 'connection_stability'],
      alerting: {
        enabled: true,
        email: 'admin@company.com',
        thresholds: {
          latency: 1000, // Alert if > 1000ms
          packetLoss: 5, // Alert if > 5%
          disconnects: 3 // Alert if > 3 disconnects/hour
        }
      },
      logging: {
        enabled: true,
        level: 'INFO',
        retention: 7 // Keep logs for 7 days
      }
    });

    if (monitoringResult.success) {
      console.log('✅ Monitoring started');
    }

    return connection;
  } else {
    console.error('❌ Tunnel connection failed:', connectResult.reason);

    // Connection diagnostics
    if (connectResult.diagnostics) {
      console.log('\n🔍 Connection Diagnostics:');
      console.log(
        'DNS resolution:',
        connectResult.diagnostics.dnsResolution ? '✅' : '❌'
      );
      console.log(
        'Network reachability:',
        connectResult.diagnostics.networkReachability ? '✅' : '❌'
      );
      console.log(
        'Authentication:',
        connectResult.diagnostics.authentication ? '✅' : '❌'
      );
      console.log(
        'Certificate validation:',
        connectResult.diagnostics.certificateValidation ? '✅' : '❌'
      );
      console.log(
        'Firewall blocking:',
        connectResult.diagnostics.firewallBlocking ? '⚠️' : '✅'
      );

      if (connectResult.diagnostics.suggestions.length > 0) {
        console.log('\n💡 Suggestions:');
        connectResult.diagnostics.suggestions.forEach(suggestion => {
          console.log(`- ${suggestion}`);
        });
      }
    }
  }
} catch (error) {
  console.error('❌ Tunnel connection error:', error);
}

function formatBandwidth(bandwidth: number): string {
  if (bandwidth < 1024) return `${bandwidth} bps`;
  if (bandwidth < 1024 * 1024) return `${(bandwidth / 1024).toFixed(2)} Kbps`;
  if (bandwidth < 1024 * 1024 * 1024)
    return `${(bandwidth / (1024 * 1024)).toFixed(2)} Mbps`;
  return `${(bandwidth / (1024 * 1024 * 1024)).toFixed(2)} Gbps`;
}
```

### disconnectTunnelAsync()

Tunnel dan uzilish.

```typescript
try {
  const tunnelId = 'corporate_vpn_tunnel';

  console.log('🔌 Disconnecting from tunnel...');
  console.log('Tunnel ID:', tunnelId);

  // Get current connection info before disconnecting
  const statusResult = await tunnelPlugin.getTunnelStatusAsync(tunnelId);

  if (statusResult.success && statusResult.status.status === 'CONNECTED') {
    const preDisconnectStats = statusResult.status.statistics;
    console.log('\n📊 Connection Statistics (before disconnect):');
    console.log(
      'Connection duration:',
      formatDuration(preDisconnectStats.connectionTime)
    );
    console.log(
      'Data received:',
      formatBytes(preDisconnectStats.bytesReceived)
    );
    console.log('Data sent:', formatBytes(preDisconnectStats.bytesSent));
    console.log('Average latency:', `${preDisconnectStats.latency.average}ms`);
  }

  const disconnectResult = await tunnelPlugin.disconnectTunnelAsync(tunnelId, {
    graceful: true, // Graceful disconnection
    timeout: 30000, // 30 seconds timeout
    cleanupRoutes: true, // Remove tunnel routes
    restoreDNS: true, // Restore original DNS settings
    saveStatistics: true, // Save session statistics
    reason: 'User requested disconnection',
    generateReport: true // Generate disconnection report
  });

  if (disconnectResult.success) {
    console.log('✅ Tunnel disconnected successfully');

    const disconnection = disconnectResult.disconnectionInfo;
    console.log('\n🔗 Disconnection Information:');
    console.log(
      'Disconnected at:',
      new Date(disconnection.disconnectedAt).toLocaleString()
    );
    console.log('Disconnection type:', disconnection.type); // 'GRACEFUL', 'FORCED', 'ERROR'
    console.log('Disconnection time:', `${disconnection.disconnectionTime}ms`);
    console.log('Reason:', disconnection.reason);

    // Session summary
    if (disconnection.sessionSummary) {
      const summary = disconnection.sessionSummary;
      console.log('\n📋 Session Summary:');
      console.log('Total duration:', formatDuration(summary.totalDuration));
      console.log(
        'Data transferred:',
        formatBytes(summary.totalBytesTransferred)
      );
      console.log(
        'Average throughput:',
        formatBandwidth(summary.averageThroughput)
      );
      console.log('Peak throughput:', formatBandwidth(summary.peakThroughput));
      console.log('Connection stability:', `${summary.stabilityScore}%`);
      console.log('Reconnect count:', summary.reconnectCount);
      console.log('Error count:', summary.errorCount);

      if (summary.qualityMetrics) {
        console.log('\n📈 Quality Metrics:');
        console.log(
          'Average latency:',
          `${summary.qualityMetrics.averageLatency}ms`
        );
        console.log(
          'Packet loss rate:',
          `${summary.qualityMetrics.packetLossRate}%`
        );
        console.log('Jitter:', `${summary.qualityMetrics.jitter}ms`);
        console.log('Availability:', `${summary.qualityMetrics.availability}%`);
      }
    }

    // Cleanup information
    if (disconnection.cleanup) {
      console.log('\n🧹 Cleanup Results:');
      console.log('Routes removed:', disconnection.cleanup.routesRemoved);
      console.log(
        'DNS restored:',
        disconnection.cleanup.dnsRestored ? '✅' : '❌'
      );
      console.log(
        'Firewall rules cleaned:',
        disconnection.cleanup.firewallRulesCleaned
      );
      console.log(
        'Temporary files removed:',
        disconnection.cleanup.tempFilesRemoved
      );

      if (disconnection.cleanup.warnings.length > 0) {
        console.log('\nCleanup warnings:');
        disconnection.cleanup.warnings.forEach(warning => {
          console.log(`- ${warning}`);
        });
      }
    }

    // Generate and save report
    if (disconnectResult.report) {
      const reportPath = `./reports/tunnel_session_${tunnelId}_${Date.now()}.json`;
      await saveTunnelReport(reportPath, disconnectResult.report);
      console.log(`\n📄 Session report saved: ${reportPath}`);
    }

    // Stop monitoring
    console.log('\n👁️ Stopping tunnel monitoring...');
    const stopMonitoringResult =
      await tunnelPlugin.stopMonitoringAsync(tunnelId);
    if (stopMonitoringResult.success) {
      console.log('✅ Monitoring stopped');
    }

    return disconnection;
  } else {
    console.error('❌ Tunnel disconnection failed:', disconnectResult.reason);

    // Force disconnection if graceful failed
    if (
      disconnectResult.reason.includes('timeout') ||
      disconnectResult.reason.includes('unresponsive')
    ) {
      console.log('⚡ Attempting forced disconnection...');

      const forceResult = await tunnelPlugin.disconnectTunnelAsync(tunnelId, {
        graceful: false,
        timeout: 10000,
        cleanupRoutes: true,
        restoreDNS: true,
        reason: 'Forced disconnection after graceful timeout'
      });

      if (forceResult.success) {
        console.log('✅ Forced disconnection successful');
        return forceResult.disconnectionInfo;
      } else {
        console.error(
          '❌ Forced disconnection also failed:',
          forceResult.reason
        );
      }
    }
  }
} catch (error) {
  console.error('❌ Tunnel disconnection error:', error);
}

function formatDuration(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

async function saveTunnelReport(filePath: string, report: any): Promise<void> {
  console.log(`💾 Saving tunnel report: ${filePath}`);
  // Implementation depends on environment
}
```

## Tunnel Configuration Management

### listTunnelsAsync()

Barcha tunnel'larni ro'yxatlash.

```typescript
try {
  console.log('📋 Listing all tunnels...');

  const listResult = await tunnelPlugin.listTunnelsAsync({
    status: ['CONNECTED', 'INACTIVE'], // Filter by status
    type: ['VPN', 'PROXY'], // Filter by type
    protocol: ['HTTPS', 'SOCKS5'], // Filter by protocol
    includeStatistics: true, // Include statistics
    includeConfiguration: false, // Don't include full config
    sortBy: 'lastConnected', // Sort by last connection
    sortOrder: 'desc', // Descending order
    limit: 50 // Limit results
  });

  if (listResult.success) {
    const tunnels = listResult.tunnels;

    console.log('✅ Tunnels Retrieved:');
    console.log(`Total tunnels: ${tunnels.length}`);
    console.log('═══════════════════════════════════════');

    tunnels.forEach((tunnel, index) => {
      console.log(`\n${index + 1}. ${tunnel.name}`);
      console.log(`   ID: ${tunnel.tunnelId}`);
      console.log(`   Type: ${tunnel.type}`);
      console.log(`   Protocol: ${tunnel.protocol}`);
      console.log(
        `   Status: ${getStatusIcon(tunnel.status)} ${tunnel.status}`
      );
      console.log(
        `   Local: ${tunnel.localEndpoint.host}:${tunnel.localEndpoint.port}`
      );
      console.log(
        `   Remote: ${tunnel.remoteEndpoint.host}:${tunnel.remoteEndpoint.port}`
      );
      console.log(
        `   Created: ${new Date(tunnel.created).toLocaleDateString()}`
      );

      if (tunnel.lastConnected) {
        console.log(
          `   Last connected: ${new Date(tunnel.lastConnected).toLocaleString()}`
        );
      }

      if (tunnel.lastDisconnected) {
        console.log(
          `   Last disconnected: ${new Date(tunnel.lastDisconnected).toLocaleString()}`
        );
      }

      // Statistics if available
      if (tunnel.statistics) {
        const stats = tunnel.statistics;
        console.log(
          `   Data transferred: ${formatBytes(stats.bytesReceived + stats.bytesSent)}`
        );
        console.log(
          `   Connection time: ${formatDuration(stats.connectionTime)}`
        );
        console.log(`   Reconnects: ${stats.reconnectCount}`);
        console.log(`   Errors: ${stats.errorCount}`);

        if (stats.latency.current > 0) {
          console.log(`   Current latency: ${stats.latency.current}ms`);
        }

        if (stats.throughput.downloadSpeed > 0) {
          console.log(
            `   Download speed: ${formatBandwidth(stats.throughput.downloadSpeed)}`
          );
        }
      }

      // Health status
      const healthStatus = getTunnelHealth(tunnel);
      console.log(`   Health: ${healthStatus.icon} ${healthStatus.status}`);

      if (healthStatus.issues.length > 0) {
        console.log(`   Issues: ${healthStatus.issues.join(', ')}`);
      }
    });

    // Summary statistics
    console.log('\n📊 Summary:');
    const summary = {
      total: tunnels.length,
      connected: tunnels.filter(t => t.status === 'CONNECTED').length,
      inactive: tunnels.filter(t => t.status === 'INACTIVE').length,
      error: tunnels.filter(t => t.status === 'ERROR').length,
      vpn: tunnels.filter(t => t.type === 'VPN').length,
      proxy: tunnels.filter(t => t.type === 'PROXY').length,
      ssl: tunnels.filter(t => t.type === 'SSL').length
    };

    console.log(`Connected: ${summary.connected}`);
    console.log(`Inactive: ${summary.inactive}`);
    console.log(`Error: ${summary.error}`);
    console.log(`VPN tunnels: ${summary.vpn}`);
    console.log(`Proxy tunnels: ${summary.proxy}`);
    console.log(`SSL tunnels: ${summary.ssl}`);

    // Recent activity
    const recentlyActive = tunnels
      .filter(t => t.lastConnected)
      .sort(
        (a, b) =>
          new Date(b.lastConnected!).getTime() -
          new Date(a.lastConnected!).getTime()
      )
      .slice(0, 5);

    if (recentlyActive.length > 0) {
      console.log('\n🕒 Recently Active:');
      recentlyActive.forEach((tunnel, index) => {
        console.log(
          `${index + 1}. ${tunnel.name} - ${new Date(tunnel.lastConnected!).toLocaleString()}`
        );
      });
    }

    return tunnels;
  } else {
    console.error('❌ Failed to list tunnels:', listResult.reason);
  }
} catch (error) {
  console.error('❌ Tunnel listing error:', error);
}

function getStatusIcon(status: string): string {
  switch (status) {
    case 'CONNECTED':
      return '🟢';
    case 'CONNECTING':
      return '🟡';
    case 'DISCONNECTING':
      return '🟠';
    case 'INACTIVE':
      return '⚪';
    case 'ERROR':
      return '🔴';
    default:
      return '❓';
  }
}

function getTunnelHealth(tunnel: any): {
  icon: string;
  status: string;
  issues: string[];
} {
  const issues: string[] = [];

  if (tunnel.statistics) {
    const stats = tunnel.statistics;

    if (stats.latency.current > 1000) {
      issues.push('High latency');
    }

    if (stats.errorCount > 10) {
      issues.push('Frequent errors');
    }

    if (stats.reconnectCount > 5) {
      issues.push('Connection instability');
    }

    if (stats.throughput.downloadSpeed < 1024 * 1024) {
      // < 1 Mbps
      issues.push('Low bandwidth');
    }
  }

  if (tunnel.status === 'ERROR') {
    issues.push('Connection error');
  }

  if (issues.length === 0) {
    return { icon: '✅', status: 'Healthy', issues: [] };
  } else if (issues.length <= 2) {
    return { icon: '⚠️', status: 'Warning', issues };
  } else {
    return { icon: '❌', status: 'Critical', issues };
  }
}
```

### updateTunnelConfigurationAsync()

Tunnel konfiguratsiyasini yangilash.

```typescript
try {
  const tunnelId = 'corporate_vpn_tunnel';

  console.log('⚙️ Updating tunnel configuration...');
  console.log('Tunnel ID:', tunnelId);

  // First, get current configuration
  const currentConfig =
    await tunnelPlugin.getTunnelConfigurationAsync(tunnelId);

  if (currentConfig.success) {
    console.log('Current configuration retrieved');

    // Check if tunnel is connected
    if (currentConfig.configuration.status === 'CONNECTED') {
      console.log(
        '⚠️ Tunnel is currently connected. Some changes may require reconnection.'
      );
    }
  }

  const updateResult = await tunnelPlugin.updateTunnelConfigurationAsync(
    tunnelId,
    {
      // Update authentication settings
      authentication: {
        method: 'MULTI_FACTOR',
        username: 'vpn_user_updated',
        certificate: 'MIIDnew...', // New certificate
        privateKey: 'MIIEnew...', // New private key
        mfaConfig: {
          methods: ['TOTP', 'SMS'],
          requiredMethods: 1,
          timeout: 300, // 5 minutes
          retryAttempts: 3
        },
        sessionTimeout: 14400 // 4 hours (reduced from 8)
      },

      // Update encryption settings
      encryption: {
        enabled: true,
        algorithm: 'AES-256', // Keep same algorithm
        mode: 'GCM', // Keep same mode
        keySize: 256,
        keyExchange: 'ECDHE', // Upgrade to ECDHE
        integrityCheck: 'HMAC-SHA256',
        compression: false // Disable compression for security
      },

      // Update routing configuration
      routing: {
        mode: 'CUSTOM', // Change from SPLIT to CUSTOM
        routes: [
          {
            destination: '10.0.0.0/8',
            enabled: true
          },
          {
            destination: '172.16.0.0/12', // Add new route
            enabled: true
          },
          {
            destination: '192.168.0.0/16',
            enabled: true
          }
        ],
        dnsServers: ['10.0.1.1', '10.0.1.2', '8.8.8.8'], // Add fallback DNS
        defaultGateway: false,
        bypassRules: [
          {
            type: 'DOMAIN',
            pattern: '*.local',
            action: 'DIRECT',
            enabled: true
          },
          {
            type: 'DOMAIN',
            pattern: '*.company.com', // Add company domains
            action: 'DIRECT',
            enabled: true
          },
          {
            type: 'IP',
            pattern: '192.168.1.0/24',
            action: 'DIRECT',
            enabled: true
          }
        ]
      },

      // Update monitoring settings
      monitoring: {
        enabled: true,
        interval: 15, // More frequent monitoring (30 -> 15 seconds)
        alertThresholds: {
          latency: 800, // Lower threshold (1000 -> 800ms)
          packetLoss: 3, // Lower threshold (5 -> 3%)
          disconnectCount: 2 // Lower threshold (3 -> 2)
        },
        logging: {
          enabled: true,
          level: 'DEBUG', // More verbose logging
          retention: 14 // Longer retention (7 -> 14 days)
        }
      },

      updateOptions: {
        validateConfiguration: true, // Validate before applying
        backupCurrent: true, // Backup current configuration
        applyImmediately: false, // Don't apply immediately if connected
        requireReconnection: true, // Force reconnection for security changes
        testConnectivity: true, // Test connectivity after update
        rollbackOnFailure: true // Rollback if update fails
      }
    }
  );

  if (updateResult.success) {
    console.log('✅ Tunnel configuration updated successfully');

    const result = updateResult.updateResult;
    console.log('\n📊 Update Summary:');
    console.log('Configuration changes:', result.changesApplied);
    console.log(
      'Requires reconnection:',
      result.requiresReconnection ? '⚠️ Yes' : '✅ No'
    );
    console.log('Backup created:', result.backupCreated ? '✅ Yes' : '❌ No');

    if (result.backupPath) {
      console.log('Backup location:', result.backupPath);
    }

    // Detail changes made
    if (result.changeDetails && result.changeDetails.length > 0) {
      console.log('\n📋 Configuration Changes:');
      result.changeDetails.forEach((change, index) => {
        console.log(`${index + 1}. ${change.section}: ${change.field}`);
        console.log(`   Old value: ${change.oldValue}`);
        console.log(`   New value: ${change.newValue}`);
        console.log(`   Impact: ${change.impact}`);
      });
    }

    // Validation results
    if (result.validation) {
      console.log('\n🔍 Configuration Validation:');
      console.log(
        'Configuration valid:',
        result.validation.configValid ? '✅' : '❌'
      );
      console.log(
        'Security check:',
        result.validation.securityCheck ? '✅' : '❌'
      );
      console.log(
        'Connectivity test:',
        result.validation.connectivityTest ? '✅' : '❌'
      );

      if (result.validation.warnings.length > 0) {
        console.log('\nValidation warnings:');
        result.validation.warnings.forEach(warning => {
          console.log(`- ${warning}`);
        });
      }

      if (result.validation.errors.length > 0) {
        console.log('\nValidation errors:');
        result.validation.errors.forEach(error => {
          console.log(`- ${error}`);
        });
      }
    }

    // Handle reconnection if required
    if (
      result.requiresReconnection &&
      currentConfig.configuration.status === 'CONNECTED'
    ) {
      console.log('\n🔄 Reconnection required for changes to take effect');

      const confirmReconnect = await confirmReconnection(
        tunnelId,
        result.changeDetails
      );

      if (confirmReconnect) {
        console.log('Initiating reconnection...');

        // Disconnect first
        const disconnectResult = await tunnelPlugin.disconnectTunnelAsync(
          tunnelId,
          {
            graceful: true,
            reason: 'Configuration update requires reconnection'
          }
        );

        if (disconnectResult.success) {
          console.log('✅ Disconnected successfully');

          // Wait a moment before reconnecting
          await new Promise(resolve => setTimeout(resolve, 2000));

          // Reconnect with new configuration
          const reconnectResult =
            await tunnelPlugin.connectTunnelAsync(tunnelId);

          if (reconnectResult.success) {
            console.log('✅ Reconnected with new configuration');
          } else {
            console.error('❌ Reconnection failed:', reconnectResult.reason);

            // Offer to rollback
            const rollback = await confirmRollback();
            if (rollback && result.backupPath) {
              const rollbackResult =
                await tunnelPlugin.restoreConfigurationAsync(
                  tunnelId,
                  result.backupPath
                );
              if (rollbackResult.success) {
                console.log('✅ Configuration rolled back successfully');
              }
            }
          }
        }
      } else {
        console.log(
          'ℹ️ Reconnection postponed. Changes will take effect on next connection.'
        );
      }
    }

    return result;
  } else {
    console.error(
      '❌ Tunnel configuration update failed:',
      updateResult.reason
    );
  }
} catch (error) {
  console.error('❌ Tunnel configuration update error:', error);
}

async function confirmReconnection(
  tunnelId: string,
  changes: any[]
): Promise<boolean> {
  console.log(
    `\nThe following changes require reconnection for tunnel ${tunnelId}:`
  );
  changes.forEach(change => {
    if (change.impact === 'REQUIRES_RECONNECTION') {
      console.log(
        `- ${change.section}.${change.field}: ${change.oldValue} → ${change.newValue}`
      );
    }
  });

  // In real application, this would be a user confirmation dialog
  console.log('Do you want to reconnect now? (y/N)');

  // Simulate user confirmation
  return new Promise(resolve => {
    setTimeout(() => resolve(true), 1000);
  });
}

async function confirmRollback(): Promise<boolean> {
  console.log('Do you want to rollback to the previous configuration? (y/N)');

  // Simulate user confirmation
  return new Promise(resolve => {
    setTimeout(() => resolve(true), 1000);
  });
}
```

## Complete Examples

### Complete VPN Tunnel Setup and Management

```typescript
async function setupCorporateVPNTunnel() {
  try {
    console.log('🏢 Setting up corporate VPN tunnel...');

    // 1. Create VPN tunnel configuration
    console.log('\n1. Creating VPN tunnel...');

    const createResult = await tunnelPlugin.createTunnelAsync({
      name: 'Corporate VPN - Main Office',
      type: 'VPN',
      protocol: 'HTTPS',
      localEndpoint: {
        host: '0.0.0.0',
        port: 8443,
        interface: 'eth0',
        keepAlive: true,
        timeout: 30000,
        retryAttempts: 3,
        healthCheck: {
          enabled: true,
          interval: 60,
          timeout: 10,
          retries: 3,
          method: 'PING',
          endpoint: '8.8.8.8'
        }
      },
      remoteEndpoint: {
        host: 'vpn.corporate.com',
        port: 443,
        keepAlive: true,
        timeout: 30000,
        retryAttempts: 5
      },
      authentication: {
        method: 'CERTIFICATE',
        certificate: await loadCertificate('./certs/vpn-client.crt'),
        privateKey: await loadPrivateKey('./certs/vpn-client.key'),
        username: 'corporate_user',
        sessionTimeout: 28800
      },
      encryption: {
        enabled: true,
        algorithm: 'AES-256',
        mode: 'GCM',
        keySize: 256,
        keyExchange: 'ECDHE',
        integrityCheck: 'HMAC-SHA256',
        compression: true
      },
      routing: {
        mode: 'SPLIT',
        routes: [
          { destination: '10.0.0.0/8', enabled: true },
          { destination: '192.168.0.0/16', enabled: true },
          { destination: '172.16.0.0/12', enabled: true }
        ],
        dnsServers: ['10.0.1.1', '10.0.1.2'],
        defaultGateway: false,
        bypassRules: [
          {
            type: 'DOMAIN',
            pattern: '*.local',
            action: 'DIRECT',
            enabled: true
          },
          {
            type: 'DOMAIN',
            pattern: '*.corporate.com',
            action: 'DIRECT',
            enabled: true
          }
        ]
      },
      monitoring: {
        enabled: true,
        interval: 30,
        alertThresholds: {
          latency: 1000,
          packetLoss: 5,
          disconnectCount: 3
        }
      }
    });

    if (!createResult.success) {
      throw new Error(`VPN tunnel creation failed: ${createResult.reason}`);
    }

    const tunnelId = createResult.tunnelId;
    console.log('✅ VPN tunnel created:', tunnelId);

    // 2. Test tunnel connectivity before connecting
    console.log('\n2. Testing tunnel connectivity...');

    const connectivityTest = await tunnelPlugin.testTunnelConnectivityAsync(
      tunnelId,
      {
        tests: [
          'DNS_RESOLUTION',
          'NETWORK_REACHABILITY',
          'CERTIFICATE_VALIDATION',
          'AUTHENTICATION'
        ],
        timeout: 30000,
        verbose: true
      }
    );

    if (connectivityTest.success) {
      console.log('✅ Connectivity test passed');

      connectivityTest.testResults.forEach(test => {
        console.log(
          `${test.testName}: ${test.passed ? '✅' : '❌'} (${test.responseTime}ms)`
        );
        if (!test.passed && test.error) {
          console.log(`  Error: ${test.error}`);
        }
      });
    } else {
      console.log('⚠️ Connectivity test failed:', connectivityTest.reason);
      console.log('Continuing with connection attempt...');
    }

    // 3. Connect to VPN
    console.log('\n3. Connecting to VPN...');

    const connectResult = await tunnelPlugin.connectTunnelAsync(tunnelId, {
      timeout: 60000,
      retryAttempts: 3,
      retryDelay: 5000,
      waitForEstablishment: true,
      validateConnection: true,
      enableMonitoring: true,
      dnsConfiguration: {
        updateSystemDNS: true,
        backupOriginalDNS: true,
        validateDNSResolution: true
      }
    });

    if (!connectResult.success) {
      throw new Error(`VPN connection failed: ${connectResult.reason}`);
    }

    console.log('✅ VPN connected successfully');

    // 4. Verify connection and network configuration
    console.log('\n4. Verifying connection...');

    const connection = connectResult.connectionInfo;
    console.log('Assigned IP:', connection.assignedIP);
    console.log('Gateway:', connection.networkConfig.gateway);
    console.log('DNS servers:', connection.networkConfig.dnsServers.join(', '));

    // Test internal network access
    const internalTest = await testInternalAccess([
      'internal.corporate.com',
      '10.0.1.100',
      'fileserver.corporate.com'
    ]);

    console.log(
      'Internal network access:',
      internalTest.allPassed ? '✅' : '⚠️'
    );

    // 5. Set up monitoring and alerting
    console.log('\n5. Setting up monitoring...');

    const monitoringResult = await tunnelPlugin.startMonitoringAsync(tunnelId, {
      interval: 30,
      metrics: ['latency', 'throughput', 'packet_loss', 'connection_stability'],
      alerting: {
        enabled: true,
        email: 'it-admin@corporate.com',
        webhook: 'https://monitoring.corporate.com/webhook',
        thresholds: {
          latency: 1000,
          packetLoss: 5,
          disconnects: 3,
          bandwidth: 1048576 // 1 Mbps minimum
        }
      },
      logging: {
        enabled: true,
        level: 'INFO',
        retention: 30,
        location: './logs/vpn'
      }
    });

    if (monitoringResult.success) {
      console.log('✅ Monitoring started');
    }

    // 6. Set up automatic reconnection
    console.log('\n6. Configuring automatic reconnection...');

    const autoReconnectResult = await tunnelPlugin.configureAutoReconnectAsync(
      tunnelId,
      {
        enabled: true,
        maxAttempts: 10,
        retryDelay: 30000, // 30 seconds
        exponentialBackoff: true,
        healthCheckInterval: 60000, // 1 minute
        triggers: ['CONNECTION_LOST', 'HIGH_LATENCY', 'AUTHENTICATION_EXPIRED'],
        notifications: {
          onReconnectAttempt: true,
          onReconnectSuccess: true,
          onReconnectFailure: true
        }
      }
    );

    if (autoReconnectResult.success) {
      console.log('✅ Auto-reconnection configured');
    }

    // 7. Create scheduled tasks
    console.log('\n7. Setting up scheduled tasks...');

    // Daily connection report
    const reportTask = await scheduleTask('daily-vpn-report', {
      schedule: '0 9 * * *', // 9 AM daily
      task: async () => {
        const report = await generateVPNReport(tunnelId);
        await sendReportEmail(report, 'it-admin@corporate.com');
      }
    });

    // Weekly configuration backup
    const backupTask = await scheduleTask('weekly-vpn-backup', {
      schedule: '0 2 * * 0', // 2 AM on Sundays
      task: async () => {
        const backup = await tunnelPlugin.backupConfigurationAsync(tunnelId);
        await storeBackup(backup, './backups/vpn');
      }
    });

    console.log('✅ Scheduled tasks configured');

    // 8. Create emergency procedures
    console.log('\n8. Setting up emergency procedures...');

    const emergencyConfig = {
      killSwitch: {
        enabled: true,
        blockAllTraffic: true,
        allowedHosts: ['emergency.corporate.com'],
        triggerConditions: ['VPN_DISCONNECTED', 'SECURITY_BREACH']
      },
      fallbackTunnels: ['backup_vpn_tunnel_1', 'backup_vpn_tunnel_2'],
      emergencyContacts: ['it-emergency@corporate.com', '+1-555-IT-HELP']
    };

    const emergencyResult =
      await tunnelPlugin.configureEmergencyProceduresAsync(
        tunnelId,
        emergencyConfig
      );

    if (emergencyResult.success) {
      console.log('✅ Emergency procedures configured');
    }

    // 9. Generate setup summary
    console.log('\n9. Generating setup summary...');

    const setupSummary = {
      timestamp: new Date().toISOString(),
      tunnel: {
        id: tunnelId,
        name: createResult.name,
        type: createResult.type,
        status: 'CONNECTED'
      },
      connection: {
        remoteEndpoint: `${createResult.remoteEndpoint.host}:${createResult.remoteEndpoint.port}`,
        assignedIP: connection.assignedIP,
        gateway: connection.networkConfig.gateway,
        dnsServers: connection.networkConfig.dnsServers
      },
      security: {
        encryption: `${createResult.encryption.algorithm}-${createResult.encryption.keySize}`,
        authentication: createResult.authentication.method,
        integrityCheck: createResult.encryption.integrityCheck
      },
      monitoring: {
        enabled: monitoringResult.success,
        interval: 30,
        alerting: true
      },
      features: {
        autoReconnect: autoReconnectResult.success,
        killSwitch: emergencyResult.success,
        splitTunneling: true,
        dnsManagement: true
      },
      status: {
        connectivityTest: connectivityTest.success,
        internalAccess: internalTest.allPassed,
        overall: 'OPERATIONAL'
      }
    };

    const summaryPath = `./reports/vpn_setup_summary_${Date.now()}.json`;
    await saveSetupSummary(summaryPath, setupSummary);

    console.log('\n🎉 Corporate VPN tunnel setup completed successfully!');
    console.log('═══════════════════════════════════════════════');
    console.log('📋 Setup Summary:');
    console.log(`Tunnel ID: ${tunnelId}`);
    console.log(`Status: ${setupSummary.status.overall}`);
    console.log(`Assigned IP: ${setupSummary.connection.assignedIP}`);
    console.log(
      `Security: ${setupSummary.security.encryption} + ${setupSummary.security.authentication}`
    );
    console.log(
      `Monitoring: ${setupSummary.monitoring.enabled ? 'Enabled' : 'Disabled'}`
    );
    console.log(
      `Auto-reconnect: ${setupSummary.features.autoReconnect ? 'Enabled' : 'Disabled'}`
    );
    console.log(`Report: ${summaryPath}`);

    return {
      tunnelId: tunnelId,
      summary: setupSummary,
      reportPath: summaryPath
    };
  } catch (error) {
    console.error('❌ Corporate VPN tunnel setup failed:', error);

    // Cleanup on failure
    if (typeof tunnelId !== 'undefined') {
      console.log('🧹 Cleaning up failed setup...');
      await tunnelPlugin.deleteTunnelAsync(tunnelId, { force: true });
    }

    throw error;
  }
}

async function loadCertificate(path: string): Promise<string> {
  // Load certificate from file
  console.log(`Loading certificate: ${path}`);
  return 'MIIDcert...'; // Placeholder
}

async function loadPrivateKey(path: string): Promise<string> {
  // Load private key from file
  console.log(`Loading private key: ${path}`);
  return 'MIIEkey...'; // Placeholder
}

async function testInternalAccess(
  hosts: string[]
): Promise<{ allPassed: boolean; results: any[] }> {
  console.log('Testing internal network access...');

  const results = [];
  let allPassed = true;

  for (const host of hosts) {
    try {
      // Simulate network test
      const testResult = {
        host: host,
        reachable: Math.random() > 0.1, // 90% success rate
        responseTime: Math.random() * 100 + 50
      };

      results.push(testResult);

      if (!testResult.reachable) {
        allPassed = false;
      }

      console.log(
        `${host}: ${testResult.reachable ? '✅' : '❌'} (${testResult.responseTime.toFixed(2)}ms)`
      );
    } catch (error) {
      results.push({ host: host, reachable: false, error: error.message });
      allPassed = false;
    }
  }

  return { allPassed, results };
}

async function scheduleTask(name: string, config: any): Promise<boolean> {
  console.log(`Scheduling task: ${name}`);
  // Implementation would depend on task scheduler
  return true;
}

async function generateVPNReport(tunnelId: string): Promise<any> {
  // Generate VPN usage and performance report
  return {
    tunnelId: tunnelId,
    reportDate: new Date().toISOString()
    // ... report data
  };
}

async function sendReportEmail(report: any, email: string): Promise<void> {
  console.log(`Sending report to: ${email}`);
  // Implementation would depend on email service
}

async function storeBackup(backup: any, location: string): Promise<void> {
  console.log(`Storing backup to: ${location}`);
  // Implementation would depend on storage system
}

async function saveSetupSummary(path: string, summary: any): Promise<void> {
  console.log(`💾 Saving setup summary: ${path}`);
  // Implementation depends on environment
}
```

## Callback API (Legacy)

### createTunnel() - Callback Version

```typescript
tunnelPlugin.createTunnel(
  {
    name: 'My VPN Tunnel',
    type: 'VPN',
    protocol: 'HTTPS',
    remoteEndpoint: {
      host: 'vpn.example.com',
      port: 443
    }
  },
  (event, response) => {
    if (response.success) {
      console.log('Callback: Tunnel created');
      console.log('ID:', response.tunnelId);
    } else {
      console.error('Callback: Creation failed:', response.reason);
    }
  },
  error => {
    console.error('Callback: Creation error:', error);
  }
);
```

### connectTunnel() - Callback Version

```typescript
tunnelPlugin.connectTunnel(
  tunnelId,
  {
    timeout: 60000,
    enableMonitoring: true
  },
  (event, response) => {
    if (response.success) {
      console.log('Callback: Tunnel connected');
      console.log('Assigned IP:', response.connectionInfo.assignedIP);
    } else {
      console.error('Callback: Connection failed:', response.reason);
    }
  },
  error => {
    console.error('Callback: Connection error:', error);
  }
);
```

## Error Handling

### Tunnel Creation Errors

```typescript
try {
  const result = await tunnelPlugin.createTunnelAsync(params);
} catch (error) {
  if (error.message.includes('invalid endpoint')) {
    console.error('❌ Invalid tunnel endpoint configuration');
  } else if (error.message.includes('authentication failed')) {
    console.error('❌ Tunnel authentication configuration invalid');
  } else if (error.message.includes('encryption not supported')) {
    console.error('❌ Specified encryption method not supported');
  } else if (error.message.includes('port in use')) {
    console.error('❌ Local port already in use');
  } else {
    console.error('❌ Tunnel creation error:', error.message);
  }
}
```

### Connection Errors

```typescript
try {
  const result = await tunnelPlugin.connectTunnelAsync(tunnelId, params);
} catch (error) {
  if (error.message.includes('network unreachable')) {
    console.error('❌ Remote endpoint unreachable');
  } else if (error.message.includes('authentication failed')) {
    console.error('❌ Authentication failed - check credentials');
  } else if (error.message.includes('certificate invalid')) {
    console.error('❌ SSL certificate validation failed');
  } else if (error.message.includes('timeout')) {
    console.error('❌ Connection timeout - check network connectivity');
  } else {
    console.error('❌ Tunnel connection error:', error.message);
  }
}
```

## Best Practices

1. **Security Configuration**: Use strong encryption and authentication methods
2. **Network Testing**: Test connectivity before establishing tunnels
3. **Monitoring Setup**: Implement comprehensive monitoring and alerting
4. **Auto-Reconnection**: Configure automatic reconnection for reliability
5. **Split Tunneling**: Use split tunneling to optimize performance
6. **DNS Management**: Properly configure DNS settings
7. **Emergency Procedures**: Set up kill switches and fallback mechanisms
8. **Regular Backups**: Backup tunnel configurations regularly
9. **Performance Tuning**: Monitor and optimize tunnel performance
10. **Documentation**: Document tunnel configurations and procedures
