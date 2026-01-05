// Device fingerprinting utility with enhanced device detection

export interface DeviceInfo {
  fingerprint: string;
  browser: string;
  browserVersion: string;
  os: string;
  osVersion: string;
  deviceName: string;
  deviceType: 'mobile' | 'tablet' | 'desktop' | 'unknown';
  deviceModel: string;
  screenResolution: string;
  timezone: string;
  language: string;
}

const getBrowserInfo = (): { name: string; version: string } => {
  const ua = navigator.userAgent;
  let name = 'Unknown Browser';
  let version = '';
  
  // Extract browser and version
  const browserPatterns = [
    { pattern: /Firefox\/(\d+(?:\.\d+)?)/, name: 'Firefox' },
    { pattern: /Edg\/(\d+(?:\.\d+)?)/, name: 'Edge' },
    { pattern: /OPR\/(\d+(?:\.\d+)?)/, name: 'Opera' },
    { pattern: /Chrome\/(\d+(?:\.\d+)?)/, name: 'Chrome' },
    { pattern: /Safari\/(\d+(?:\.\d+)?)/, name: 'Safari' },
    { pattern: /Version\/(\d+(?:\.\d+)?).*Safari/, name: 'Safari' },
  ];
  
  for (const { pattern, name: browserName } of browserPatterns) {
    const match = ua.match(pattern);
    if (match) {
      name = browserName;
      version = match[1] || '';
      // Special case for Safari - get version from Version/
      if (browserName === 'Safari' && ua.includes('Version/')) {
        const versionMatch = ua.match(/Version\/(\d+(?:\.\d+)?)/);
        if (versionMatch) version = versionMatch[1];
      }
      break;
    }
  }
  
  return { name, version };
};

const getOSInfo = (): { name: string; version: string } => {
  const ua = navigator.userAgent;
  let name = 'Unknown OS';
  let version = '';
  
  const osPatterns = [
    { pattern: /Windows NT 10\.0/, name: 'Windows', version: '10/11' },
    { pattern: /Windows NT 6\.3/, name: 'Windows', version: '8.1' },
    { pattern: /Windows NT 6\.2/, name: 'Windows', version: '8' },
    { pattern: /Windows NT 6\.1/, name: 'Windows', version: '7' },
    { pattern: /Mac OS X (\d+[._]\d+(?:[._]\d+)?)/, name: 'macOS' },
    { pattern: /Android (\d+(?:\.\d+)?)/, name: 'Android' },
    { pattern: /iPhone OS (\d+[_]\d+)/, name: 'iOS' },
    { pattern: /iPad.*OS (\d+[_]\d+)/, name: 'iPadOS' },
    { pattern: /Linux/, name: 'Linux', version: '' },
    { pattern: /CrOS/, name: 'Chrome OS', version: '' },
  ];
  
  for (const { pattern, name: osName, version: defaultVersion } of osPatterns) {
    const match = ua.match(pattern);
    if (match) {
      name = osName;
      if (match[1]) {
        version = match[1].replace(/_/g, '.');
      } else if (defaultVersion) {
        version = defaultVersion;
      }
      break;
    }
  }
  
  return { name, version };
};

const getDeviceType = (): 'mobile' | 'tablet' | 'desktop' | 'unknown' => {
  const ua = navigator.userAgent.toLowerCase();
  
  // Check for tablets first (before mobile check)
  const isTablet = 
    /ipad/.test(ua) ||
    (/android/.test(ua) && !/mobile/.test(ua)) ||
    /tablet/.test(ua);
  
  if (isTablet) return 'tablet';
  
  // Check for mobile
  const isMobile = 
    /iphone|ipod|android.*mobile|windows phone|blackberry|opera mini|opera mobi/i.test(ua);
  
  if (isMobile) return 'mobile';
  
  // Check for desktop indicators
  const isDesktop = 
    /windows nt|macintosh|linux x86|linux i686|linux amd64/i.test(ua);
  
  if (isDesktop) return 'desktop';
  
  return 'unknown';
};

const getDeviceModel = (): string => {
  const ua = navigator.userAgent;
  
  // iPhone models
  if (ua.includes('iPhone')) {
    const match = ua.match(/iPhone\s*(\d+)?/);
    return match ? `iPhone ${match[1] || ''}`.trim() : 'iPhone';
  }
  
  // iPad models
  if (ua.includes('iPad')) {
    return 'iPad';
  }
  
  // Android device models
  const androidMatch = ua.match(/;\s*([^;)]+)\s+Build\//);
  if (androidMatch) {
    return androidMatch[1].trim();
  }
  
  // Fallback for Android
  if (ua.includes('Android')) {
    const mobileMatch = ua.match(/Android[^;]*;\s*([^;)]+)/);
    if (mobileMatch) {
      return mobileMatch[1].replace(/Build.*/, '').trim();
    }
    return 'Android Device';
  }
  
  // Mac
  if (ua.includes('Macintosh')) {
    if (ua.includes('MacBook')) return 'MacBook';
    if (ua.includes('iMac')) return 'iMac';
    return 'Mac';
  }
  
  // Windows
  if (ua.includes('Windows')) {
    return 'Windows PC';
  }
  
  // Linux
  if (ua.includes('Linux')) {
    return 'Linux PC';
  }
  
  // Chrome OS
  if (ua.includes('CrOS')) {
    return 'Chromebook';
  }
  
  return 'Unknown Device';
};

const getDeviceName = (browser: string, os: string, deviceType: string, model: string): string => {
  const typeLabel = {
    'mobile': '📱 Phone',
    'tablet': '📱 Tablet',
    'desktop': '💻 Desktop',
    'unknown': '🖥️ Device'
  }[deviceType] || 'Device';
  
  return `${model} - ${browser} on ${os}`;
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
  const { name: browser, version: browserVersion } = getBrowserInfo();
  const { name: os, version: osVersion } = getOSInfo();
  const deviceType = getDeviceType();
  const deviceModel = getDeviceModel();
  const deviceName = getDeviceName(browser, os, deviceType, deviceModel);
  const fingerprint = await generateFingerprint();
  const screenResolution = `${screen.width}x${screen.height}`;
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const language = navigator.language;
  
  return {
    fingerprint,
    browser,
    browserVersion,
    os,
    osVersion,
    deviceName,
    deviceType,
    deviceModel,
    screenResolution,
    timezone,
    language
  };
};