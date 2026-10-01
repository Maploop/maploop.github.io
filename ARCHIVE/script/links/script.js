(() => {
  'use strict';

  const VISITOR_KEY = 'links.visitor.v1';
  const SESSION_KEY = 'links.session.v1';
  const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  function clip(value, limit = 160) {
    let text = String(value || '').slice(0, limit);
    // Bound serialized size too: control characters expand when encoded as JSON.
    while (JSON.stringify(text).replace(/`/g, '\\u0060').length > limit + 2) text = text.slice(0, -1);
    return text;
  }

  function newId() {
    if (crypto.randomUUID) return crypto.randomUUID();
    const bytes = crypto.getRandomValues(new Uint8Array(16));
    bytes[6] = (bytes[6] & 15) | 64;
    bytes[8] = (bytes[8] & 63) | 128;
    const hex = Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }

  function readStorage(name, key) {
    try { return JSON.parse(window[name].getItem(key)); } catch { return null; }
  }

  function writeStorage(name, key, value) {
    try {
      window[name].setItem(key, JSON.stringify(value));
      return true;
    } catch { return false; }
  }

  function validVisitor(record) {
    return record && UUID.test(record.id) &&
      Number.isSafeInteger(record.visitCount) && record.visitCount > 0 &&
      record.visitCount < Number.MAX_SAFE_INTEGER &&
      typeof record.firstVisit === 'string' && Number.isFinite(Date.parse(record.firstVisit)) &&
      typeof record.lastVisit === 'string' && Number.isFinite(Date.parse(record.lastVisit));
  }

  function identifyVisitor() {
    // A random first-party ID identifies this browser profile, not a person or device.
    // Session storage is used only when persistent storage is unavailable.
    for (const storage of ['localStorage', 'sessionStorage']) {
      const saved = readStorage(storage, VISITOR_KEY);
      const previous = validVisitor(saved) ? saved : null;
      const now = new Date().toISOString();
      const record = {
        id: previous ? previous.id : newId(),
        visitCount: previous ? previous.visitCount + 1 : 1,
        firstVisit: previous ? new Date(previous.firstVisit).toISOString() : now,
        lastVisit: now
      };
      if (writeStorage(storage, VISITOR_KEY, record)) {
        return {
          visitorId: record.id,
          identityScope: storage === 'localStorage' ? 'browser' : 'tab',
          visitorHistory: {
            isReturning: Boolean(previous),
            visitCount: record.visitCount,
            firstVisit: record.firstVisit,
            lastVisit: previous ? new Date(previous.lastVisit).toISOString() : null
          }
        };
      }
    }
    return { visitorId: newId(), identityScope: 'page', visitorHistory: null };
  }

  function sessionId() {
    const saved = readStorage('sessionStorage', SESSION_KEY);
    const id = typeof saved === 'string' && UUID.test(saved) ? saved : newId();
    writeStorage('sessionStorage', SESSION_KEY, id);
    return id;
  }

  function deviceData() {
    const ua = navigator.userAgent;
    let timeZone = 'unknown';
    try { timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone; } catch { /* optional */ }
    const browsers = [
      [/Edg(?:e|A|iOS)?\//, 'Edge'], [/SamsungBrowser\//, 'Samsung Browser'],
      [/OPR\/|Opera|OPiOS\//, 'Opera'], [/Firefox\/|FxiOS\//, 'Firefox'],
      [/Chrome\/|CriOS\//, 'Chrome'], [/Safari\//, 'Safari']
    ];
    const ios = /iPhone|iPad|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const osName = ios ? 'iOS' : /Android/.test(ua) ? 'Android' :
      /Windows/.test(ua) ? 'Windows' : /Mac/.test(ua) ? 'MacOS' : /Linux/.test(ua) ? 'Linux' : 'Unknown';
    return {
      browserName: (browsers.find(([pattern]) => pattern.test(ua)) || [null, 'Unknown'])[1],
      osName,
      language: clip(navigator.language, 40),
      timeZone: clip(timeZone, 80),
      screenWidth: screen.width,
      screenHeight: screen.height,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      pixelRatio: window.devicePixelRatio
    };
  }

  const params = new URLSearchParams(window.location.search);
  const context = {
    schemaVersion: 1,
    ...identifyVisitor(),
    sessionId: sessionId(),
    pageViewId: newId(),
    landingPage: clip(window.location.pathname),
    referrer: clip(document.referrer) || 'direct',
    clickOrigin: clip(params.get('a')) || 'none',
    utm: Object.fromEntries(['source', 'medium', 'campaign', 'term', 'content']
      .map(key => [key, clip(params.get(`utm_${key}`)) || null])),
    deviceData: deviceData(),
    network: { status: 'pending' }
  };

  // AES-GCM keeps URLs out of plaintext source. The browser also receives the key,
  // so this is obfuscation, not secret storage. A server relay is required for secrecy.
  const encryptedWebhooks = {
    "key": "UnNWWgAlwymzzVG7jV0NQSc+2dz8AO7b4Q7e+qVSCz0=",
    "iv": "Fa72d9c+II3lhkVe",
    "data": "1QbL6LHp3Sx0wfEgf9Wx5AP0ImPI7aHL9o9pr8191mq/zIrIgPPJE+SoR452lfcnWABM2KblcOeVyqsfKeN1VZHdtEevdtuoM/cj/XdC2mpf43TiitQ1zMiemFLM/34AayG9FPLnxcRLf7Ea+EHp5QNPp03onA39HMel3fNYqNWpXdK3ksBj8tINNW5yfAnvb0ZvEGGlq2WBWvSsWf2djJuVsExS1IqEOCJue1N+QGQZPanqPFhDELbWiWWXNTGvkeAi8kujTQYHY1BRI609l+H4slsOlsawvjJ/Ms6rcSreRXIoS7waRPDX4aw7q/taU1AqjOjaWC3bjKcqNpar6uDUmZlXVC9JzEU5QpZ9z6QZS5RoaH/nGM4="
  };
  let destinations;
  async function decryptWebhooks() {
    const bytes = value => Uint8Array.from(atob(value), character => character.charCodeAt(0));
    const key = await crypto.subtle.importKey('raw', bytes(encryptedWebhooks.key), 'AES-GCM', false, ['decrypt']);
    const plaintext = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: bytes(encryptedWebhooks.iv) }, key, bytes(encryptedWebhooks.data)
    );
    destinations = JSON.parse(new TextDecoder().decode(plaintext));
    return destinations;
  }
  const webhookReady = decryptWebhooks().catch(() => {
    console.warn('Links analytics: webhook decryption failed; HTTPS and Web Crypto are required.');
    return null;
  });

  function reportSummary(data) {
    // Keep supplied values on one line and prevent them from adding Discord formatting.
    const text = (value, limit = 60) => clip(value, limit)
      .replace(/[\u0000-\u001f\u007f]/g, ' ')
      .replace(/[\\`*_~|<>\[\]()#]/g, '\\$&');
    const titles = {
      page_view: 'Page visit',
      visitor_context: 'Visitor details update',
      link_click: 'Link click',
      engagement: 'Engagement update'
    };
    const history = data.visitorHistory;
    const visitor = history
      ? `${history.isReturning ? 'Returning' : 'New'} visitor · recorded visit #${history.visitCount}`
      : 'Visit history unavailable';
    const lines = [
      `**Links report — ${titles[data.event]}**`,
      `**Visitor:** ${visitor}`,
      `**Visitor ID:** ${data.visitorId} (${data.identityScope} scope)`,
      `**Page:** ${text(data.landingPage)} · **Time:** ${data.timestamp}`,
      `**Device:** ${text(data.deviceData.browserName)} on ${text(data.deviceData.osName)}`,
      `**Locale:** ${text(data.deviceData.language)} · ${text(data.deviceData.timeZone)}`
    ];
    if (history && history.lastVisit) lines.push(`**Previous visit:** ${history.lastVisit}`);

    const network = data.network;
    if (network.status === 'pending') {
      lines.push('**Network:** Lookup pending; details will follow.');
    } else if (network.status === 'unavailable') {
      lines.push('**Network:** Public IP/location lookup failed (see lookup results in raw data).');
    } else {
      const location = [network.city, network.region, network.country].filter(Boolean)
        .map(value => text(value, 40)).join(', ');
      lines.push(`**IP:** ${text(network.ip)}`);
      lines.push(`**Approximate location:** ${location || 'Unavailable'}`);
    }

    lines.push(`**Referrer:** ${text(data.referrer, 80)}`);
    if (data.clickOrigin !== 'none') lines.push(`**Click origin:** ${text(data.clickOrigin)}`);
    const campaign = ['source', 'medium', 'campaign']
      .filter(key => data.utm[key]).map(key => `${key}: ${text(data.utm[key], 40)}`);
    if (campaign.length) lines.push(`**Campaign:** ${campaign.join(' · ')}`);
    if (data.event === 'link_click') {
      lines.push(data.clicked === 'discord'
        ? '**Action:** Discord username copy attempted.'
        : `**Clicked:** ${text(data.clicked)}`);
    }
    if (data.event === 'engagement') {
      lines.push(`**Engagement:** ${data.activeSeconds}s active · ${data.scrollDepth}% maximum scroll (cumulative for this page view).`);
    }
    lines.push(`**Page view ID:** ${data.pageViewId}`);
    // Content has its own 2000-character limit, separate from the raw-data embed.
    const report = lines.join('\n');
    return report.length > 2000 ? report.slice(0, 1999) + '…' : report;
  }

  function sendEvent(event, details = {}) {
    const payload = {
      ...context,
      event,
      eventId: newId(),
      timestamp: new Date().toISOString(),
      ...details
    };
    const common = {
      username: 'Links analytics',
      allowed_mentions: { parse: [] }
    };
    // Build both bodies now so late network enrichment cannot mutate a queued event.
    const summaryBody = JSON.stringify({ ...common, content: reportSummary(payload) });
    // Escape code fences without changing the JSON value when parsed.
    const rawJSON = JSON.stringify(payload).replace(/`/g, '\\u0060');
    const rawBody = JSON.stringify({
      ...common,
      embeds: [{ title: event, description: '```json\n' + rawJSON + '\n```' }]
    });
    const deliver = endpoints => {
      if (!endpoints) return;
      postWebhook(endpoints.summary, summaryBody, 'summary');
      postWebhook(endpoints.raw, rawBody, 'raw');
    };
    if (destinations) deliver(destinations);
    else void webhookReady.then(deliver);
  }

  function postWebhook(url, body, channel) {
    // keepalive belongs to fetch options, not to the webhook JSON body.
    // Do not retry ambiguous failures: the server may already have accepted the event.
    try {
      void fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
        keepalive: true
      }).then(response => {
        if (!response.ok) console.warn(`Links analytics: ${channel} delivery failed (HTTP ${response.status}).`);
      }).catch(() => console.warn(`Links analytics: ${channel} delivery failed.`));
    } catch {
      console.warn(`Links analytics: ${channel} delivery unavailable.`);
    }
  }

  async function fetchJSON(url) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    try {
      const response = await fetch(url, {
        signal: controller.signal, credentials: 'omit', cache: 'no-store', referrerPolicy: 'no-referrer'
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      if (!data || data.error || data.success === false) throw new Error('Provider rejected lookup');
      return data;
    } catch (error) {
      if (controller.signal.aborted) throw new Error('Timeout');
      if (error instanceof TypeError) throw new Error('Network or CORS failure');
      if (error instanceof SyntaxError) throw new Error('Invalid JSON');
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }

  function publicIP(value) {
    if (typeof value !== 'string' || value.length > 45) return null;
    const ip = value.trim();
    if (/^(\d{1,3}\.){3}\d{1,3}$/.test(ip)) {
      const parts = ip.split('.').map(Number);
      const [a, b, c] = parts;
      if (parts.some(part => part > 255) || a === 0 || a === 10 || a === 127 || a >= 224 ||
          (a === 100 && b >= 64 && b <= 127) || (a === 169 && b === 254) ||
          (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) ||
          (a === 192 && b === 0 && (c === 0 || c === 2)) || (a === 198 && (b === 18 || b === 19)) ||
          (a === 198 && b === 51 && c === 100) || (a === 203 && b === 0 && c === 113)) return null;
      return parts.join('.');
    }
    // Accept global-unicast IPv6, excluding the documentation range.
    try {
      const normalized = new URL(`https://[${ip}]/`).hostname.slice(1, -1);
      return /^[23][0-9a-f]{3}:/.test(normalized) && !normalized.startsWith('2001:db8:') ? normalized : null;
    } catch { return null; }
  }

  async function collectNetwork() {
    const providers = [
      { name: 'ipwhois', url: 'https://ipwho.is/', location: true },
      { name: 'ipapi', url: 'https://ipapi.co/json/', location: true },
      { name: 'ipify_ipv6', url: 'https://api64.ipify.org?format=json' },
      { name: 'ipify_ipv4', url: 'https://api.ipify.org?format=json' }
    ];
    const lookups = [];
    let best = null;
    for (const provider of providers) {
      // Preserve an already observed public IP if location providers returned only IPs.
      if (best && !provider.location) break;
      try {
        const data = await fetchJSON(provider.url);
        const ip = publicIP(data.ip);
        if (!ip) throw new Error('Missing or non-public IP');
        const city = provider.location ? clip(data.city, 80) : '';
        const region = provider.location ? clip(data.region, 80) : '';
        const country = provider.location ? clip(data.country_name || data.country, 80) : '';
        const located = Boolean(city || region || country);
        const result = {
          status: located ? 'available' : 'ip_only', source: provider.name, ip,
          ...(located ? { city, region, country } : {})
        };
        lookups.push({ provider: provider.name, status: result.status });
        if (!best || located) best = result;
        if (located || !provider.location) break;
      } catch (error) {
        lookups.push({ provider: provider.name, status: 'failed', reason: clip(error.message, 60) });
      }
    }
    context.network = { ...(best || { status: 'unavailable' }), lookups };
    // Enrichment shares pageViewId; this is not an additional page view.
    sendEvent('visitor_context');
  }

  let activeSince = document.visibilityState === 'hidden' ? null : performance.now();
  let activeMilliseconds = 0;
  let maxScrollDepth = 0;
  let lastEngagement = '';

  function updateScroll() {
    const height = document.documentElement.scrollHeight - window.innerHeight;
    const depth = height <= 0 ? 100 : Math.max(0, Math.min(100, window.scrollY / height * 100));
    maxScrollDepth = Math.max(maxScrollDepth, Math.round(depth));
  }

  function reportEngagement() {
    if (activeSince !== null) {
      activeMilliseconds += Math.max(0, performance.now() - activeSince);
      activeSince = null;
    }
    updateScroll();
    const details = { activeSeconds: Math.round(activeMilliseconds / 10) / 100, scrollDepth: maxScrollDepth };
    const snapshot = JSON.stringify(details);
    if (snapshot !== lastEngagement) {
      lastEngagement = snapshot;
      sendEvent('engagement', details);
    }
  }

  document.addEventListener('click', event => {
    const target = event.target.closest('[data-track]');
    if (target) sendEvent('link_click', { clicked: clip(target.dataset.track, 80) });
  });
  document.addEventListener('auxclick', event => {
    const target = event.target.closest('a[data-track]');
    if (event.button === 1 && target) sendEvent('link_click', { clicked: clip(target.dataset.track, 80) });
  });
  window.addEventListener('scroll', updateScroll, { passive: true });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') reportEngagement();
    else if (activeSince === null) activeSince = performance.now();
  });
  window.addEventListener('pagehide', reportEngagement);
  window.addEventListener('pageshow', () => {
    if (document.visibilityState !== 'hidden' && activeSince === null) activeSince = performance.now();
  });

  updateScroll();
  sendEvent('page_view');
  void collectNetwork();
})();

function goToExpeirmental() {
  window.open('https://maploop.github.io/exp/', '_blank', 'noopener,noreferrer');
}
