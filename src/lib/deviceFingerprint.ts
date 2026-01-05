// Device fingerprinting utility

interface DeviceInfo {
  fingerprint: string;
  browser: string;
  os: string;
  deviceName: string;
}

const getBrowserInfo = (): string => {
  const ua = navigator.userAgent;
  
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Edg')) return 'Edge';
  if (ua.includes('Chrome')) return 'Chrome';
  if (ua.includes('Safari')) return 'Safari';
  if (ua.includes('Opera') || ua.includes('OPR')) return 'Opera';
  
  return 'Unknown Browser';
};

const getOSInfo = (): string => {
  const ua = navigator.userAgent;
  
  if (ua.includes('Windows NT 10.0')) return 'Windows 10/11';
  if (ua.includes('Windows')) return 'Windows';
  if (ua.includes('Mac OS X')) return 'macOS';
  if (ua.includes('Linux')) return 'Linux';
  if (ua.includes('Android')) return 'Android';
  if (ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
  
  return 'Unknown OS';
};

const getDeviceName = (browser: string, os: string): string => {
  const isMobile = /Mobile|Android|iPhone|iPad/i.test(navigator.userAgent);
  const deviceType = isMobile ? 'Mobile' : 'Desktop';
  
  return `${browser} on ${os} (${deviceType})`;
};

const generateFingerprint = async (): Promise<string> => {
  const components: string[] = [];
  
  // Screen info
  components.push(`${screen.width}x${screen.height}x${screen.colorDepth}`);
  
  // Timezone
  components.push(Intl.DateTimeFormat().resolvedOptions().timeZone);
  
  // Language
  components.push(navigator.language);
  
  // Platform
  components.push(navigator.platform);
  
  // User agent (simplified)
  components.push(navigator.userAgent.substring(0, 100));
  
  // Canvas fingerprint (simplified)
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('fingerprint', 2, 2);
      components.push(canvas.toDataURL().slice(-50));
    }
  } catch {
    components.push('no-canvas');
  }
  
  // WebGL renderer (if available)
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl');
    if (gl) {
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        components.push(gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL));
      }
    }
  } catch {
    components.push('no-webgl');
  }
  
  // Hardware concurrency
  components.push(String(navigator.hardwareConcurrency || 0));
  
  // Device memory (if available)
  components.push(String((navigator as any).deviceMemory || 0));
  
  // Generate hash
  const fingerprintString = components.join('|');
  const encoder = new TextEncoder();
  const data = encoder.encode(fingerprintString);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 32);
};

export const getDeviceInfo = async (): Promise<DeviceInfo> => {
  const browser = getBrowserInfo();
  const os = getOSInfo();
  const deviceName = getDeviceName(browser, os);
  const fingerprint = await generateFingerprint();
  
  return {
    fingerprint,
    browser,
    os,
    deviceName
  };
};
