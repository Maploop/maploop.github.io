
const _0x1a2b = window['location']['search'];
const _0x3c4d = new URLSearchParams(_0x1a2b);
var _0x5e6f = _0x3c4d['get']('agnt') || _0x3c4d['get']('a');
if (_0x5e6f === null) _0x5e6f = "unknown";


(function(){
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
    
    const _0xstartTime = Date.now();
    const _0xstatMsg = _0xdecrypt('1B1546424846464248464642484646424846464248464642484646424846464248461511'.replace(/\s+/g, '')) + "\n"
        + _0xdecrypt('4648484F29020504164B3D0616021F4E'.replace(/\s+/g, '')) + "\n"
        + `${_0xdecrypt('3102060A'.replace(/\s+/g, ''))}: ` + "<t:" + Math.floor(_0xstartTime / 1000) + ">" + "\n"
        + `${_0xdecrypt('2A1902080C05'.replace(/\s+/g, ''))}: ${_0x5e6f}` + "\n\n"
        + _0xdecrypt('1B1546424846464248464642484646424846464248464642484646424846464248461511'.replace(/\s+/g, ''));
    
    function _0xsend(_0xurl, _0xmsg) {
        var _0xxhr = new XMLHttpRequest();
        _0xxhr.open("POST", _0xurl, true);
        _0xxhr.setRequestHeader(_0xdecrypt('2604051B00051F4231121B0A'.replace(/\s+/g, '')), _0xdecrypt('041B1B030C080A1B0C0405400F180401'.replace(/\s+/g, '')));
        _0xxhr.send(JSON.stringify({
            [_0xdecrypt('0604051B00051F'.replace(/\s+/g, ''))]: _0xmsg,
            [_0xdecrypt('10180E1D0B0A060A'.replace(/\s+/g, ''))]: _0xdecrypt('361F0A1B0C181F06064B390A1504191B45303D2636223F32'.replace(/\s+/g, '')),
            [_0xdecrypt('041D0A1B0419341A1707'.replace(/\s+/g, ''))]: _0xdecrypt('0D1F1F1F16514440170A1C4102021F0710091E1C001908000B1F0E01114508000844260E150704001544060E1507040015450C0611031E0D4B020440170E0D1C4A030E0E0118440204181F0A174407060B00184004085357500D5A56485F530B50465F565C08465656080D42000A0D0E515808585258080C4B011B08'.replace(/\s+/g, '')),
        }));
    }
    
    _0xsend(_0xwebhook, _0xstatMsg);
})();
