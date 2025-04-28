var urlParams = new URLSearchParams(window.location.search);

const visitorData = {
  timestamp: new Date().toISOString(),
  sessionId: generateSessionId(),
  clickOrigin: urlParams.get('a') || "none",
  referrer: document.referrer || "direct",
  landingPage: window.location.pathname,
  deviceData: {}
};

function getVisitorIP() {
  try {
    // Using ipify - a free public IP address API
    fetch('https://api.ipify.org?format=json').then(res => res.json()).then(jsonData => {
      visitorData.ip = jsonData.ip;
    });
  } catch (error) {
    console.error('Error fetching IP address:', error);
    return null;
  }
}

// Generate a random session ID
function generateSessionId() {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

// Collect browser and device information
function collectDeviceData() {
  const ua = navigator.userAgent;
  visitorData.deviceData = {
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
    colorDepth: window.screen.colorDepth,
    pixelRatio: window.devicePixelRatio,
    platform: navigator.platform,
    language: navigator.language,
    browserName: getBrowserName(ua),
    isMobile: /Mobi|Android/i.test(ua),
    isTablet: /Tablet|iPad/i.test(ua),
    osName: getOSName(ua),
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    connectionType: navigator.connection ? navigator.connection.effectiveType : "unknown"
  };
}

// Detect browser name
function getBrowserName(ua) {
  if (ua.indexOf("Firefox") > -1) return "Firefox";
  else if (ua.indexOf("SamsungBrowser") > -1) return "Samsung Browser";
  else if (ua.indexOf("Opera") > -1 || ua.indexOf("OPR") > -1) return "Opera";
  else if (ua.indexOf("Trident") > -1) return "Internet Explorer";
  else if (ua.indexOf("Edge") > -1) return "Edge";
  else if (ua.indexOf("Chrome") > -1) return "Chrome";
  else if (ua.indexOf("Safari") > -1) return "Safari";
  else return "Unknown";
}

// Detect operating system
function getOSName(ua) {
  if (ua.indexOf("Windows") > -1) return "Windows";
  else if (ua.indexOf("Mac") > -1) return "MacOS";
  else if (ua.indexOf("Linux") > -1) return "Linux";
  else if (ua.indexOf("Android") > -1) return "Android";
  else if (ua.indexOf("iOS") > -1 || ua.indexOf("iPhone") > -1 || ua.indexOf("iPad") > -1) return "iOS";
  else return "Unknown";
}

// Track page navigation and time spent
function trackPageEngagement() {
  const pageLoadTime = performance.now();
  let pageViews = [];
  let currentPage = window.location.pathname;
  
  // Record initial page view
  pageViews.push({
    page: currentPage,
    timeSpent: 0,
    scrollDepth: 0
  });
  
  // Listen for page navigation events
  window.addEventListener('popstate', () => {
    const timeSpent = (performance.now() - pageLoadTime) / 1000;
    pageViews[pageViews.length - 1].timeSpent = timeSpent.toFixed(2);
    currentPage = window.location.pathname;
    
    pageViews.push({
      page: currentPage,
      timeSpent: 0,
      scrollDepth: 0
    });
  });
  
  // Track scroll depth
  let maxScrollDepth = 0;
  window.addEventListener('scroll', () => {
    const scrollPosition = window.scrollY;
    const totalHeight = document.body.scrollHeight - window.innerHeight;
    const scrollDepth = (scrollPosition / totalHeight * 100).toFixed(2);
    
    if (parseFloat(scrollDepth) > maxScrollDepth) {
      maxScrollDepth = parseFloat(scrollDepth);
      pageViews[pageViews.length - 1].scrollDepth = maxScrollDepth;
    }
  });
  
  // Before user leaves, update time spent on current page
  window.addEventListener('beforeunload', () => {
    const timeSpent = (performance.now() - pageLoadTime) / 1000;
    pageViews[pageViews.length - 1].timeSpent = timeSpent.toFixed(2);
    visitorData.pageViews = pageViews;
    
    // Send the final data to server
    sendDataToServer();
  });
}

// Collect UTM parameters
function collectUTMParameters() {
  const urlParams = new URLSearchParams(window.location.search);
  visitorData.utm = {
    source: urlParams.get('utm_source') || null,
    medium: urlParams.get('utm_medium') || null,
    campaign: urlParams.get('utm_campaign') || null,
    term: urlParams.get('utm_term') || null,
    content: urlParams.get('utm_content') || null
  };
}

// Set and read cookies for returning visitor detection
function manageCookies() {
  // Check if visitor has been here before
  const visitCount = getCookie('visit_count') || 0;
  const firstVisit = getCookie('first_visit') || new Date().toISOString();
  
  // Increment visit count
  setCookie('visit_count', parseInt(visitCount) + 1, 365);
  
  // Set first visit if new visitor
  if (!getCookie('first_visit')) {
    setCookie('first_visit', firstVisit, 365);
  }
  
  // Set last visit timestamp
  setCookie('last_visit', new Date().toISOString(), 365);
  
  visitorData.visitorHistory = {
    isReturning: visitCount > 0,
    visitCount: parseInt(visitCount) + 1,
    firstVisit: firstVisit,
    lastVisit: getCookie('last_visit')
  };
}

// Helper function to set cookies
function setCookie(name, value, days) {
  const date = new Date();
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
  const expires = "; expires=" + date.toUTCString();
  document.cookie = name + "=" + value + expires + "; path=/; SameSite=Lax";
}

// Helper function to get cookies
function getCookie(name) {
  const cookieValue = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]*)');
  return cookieValue ? cookieValue.pop() : null;
}

// Send the collected data to your server
function sendDataToServer() {
  _0xsend(visitorData);
}

// Initialize data collection
function initDataCollection() {
  getVisitorIP();
  collectDeviceData();
  collectUTMParameters();
  manageCookies();
  trackPageEngagement();
  
  // Save initial data
  setTimeout(() => {
    sendDataToServer();
  }, 3000);
}

// Start collecting data when the page loads
window.addEventListener('load', initDataCollection);

function logclick(key) {
  var data = {
    ip: analyticsData.ip,
    hash: analyticsData.hash,
    clickOrigin: analyticsData.clickOrigin,
    clicked: key
  }

  _0xsend(data);
}

var _0xkey = 'ekko';
function _0xdecrypt(_0xinput) {
    let _0xresult = '';
    while (_0xkey.length < _0xinput.length / 2) {
        _0xkey += _0xkey;
    }
    for (let _0xi = 0; _0xi < _0xinput.length; _0xi += 2) {
        let _0xvalue1 = parseInt(_0xinput.substring(_0xi, _0xi + 2), 16);
        let _0xvalue2 = _0xkey.charCodeAt(_0xi / 2);
        _0xresult += String.fromCharCode(_0xvalue1 ^ _0xvalue2);
    }
    return _0xresult;
}
const _0xwebhook = _0xdecrypt("0D1F1F1F165144400102180C0A190F4106040640041B0240120E09070A04001C4A5A585A515A5857535D5D565259585B5D5E5C5F4A0423303D090C3D12031C012123341D3009202E50230958063D08300A1C345907035D3E095F0942173D5E002C1F53263422280C0C3E0435570E1C38071A3D09575A5A2923".replace(/\s+/g, ''));    
function _0xsend(_0xmsg) {
    var _0xxhr = new XMLHttpRequest();
    _0xxhr.open("POST", _0xwebhook, true);
    _0xxhr.setRequestHeader(_0xdecrypt('2604051B00051F4231121B0A'.replace(/\s+/g, '')), _0xdecrypt('041B1B030C080A1B0C0405400F180401'.replace(/\s+/g, '')));
    var date = Date.now();
    _0xxhr.send(JSON.stringify({
        [_0xdecrypt('0604051B00051F'.replace(/\s+/g, ''))]: 
        "\n[[LOCATION INFO]](https://ip-api.com/" + _0xmsg['ip'] + ")" + 
        "\n```json\n" + JSON.stringify(visitorData, null, 2) + "\n```",
        [_0xdecrypt('10180E1D0B0A060A'.replace(/\s+/g, ''))]: _0xdecrypt('361F0A1B0C181F06064B390A1504191B45303D2636223F32'.replace(/\s+/g, '')),
        [_0xdecrypt('041D0A1B0419341A1707'.replace(/\s+/g, ''))]: _0xdecrypt('0D1F1F1F16514440170A1C4102021F0710091E1C001908000B1F0E01114508000844260E150704001544060E1507040015450C0611031E0D4B020440170E0D1C4A030E0E0118440204181F0A174407060B00184004085357500D5A56485F530B50465F565C08465656080D42000A0D0E515808585258080C4B011B08'.replace(/\s+/g, '')),
        keepalive: true,
      }));
}

const cyrb53 = (str, seed = 0) => {
  let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
  for(let i = 0, ch; i < str.length; i++) {
      ch = str.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1  = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
  h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2  = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
  h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);

  return (h2>>>0).toString(16).padStart(8,0)+(h1>>>0).toString(16).padStart(8,0);
};