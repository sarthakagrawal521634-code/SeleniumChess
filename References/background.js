( () => {
    "use strict";
    class e {
        constructor(e) {
            this.map = new Map,
            this.nextId = 1,
            this.send = e
        }
        ask(e) {
            const t = this.nextId++;
            return new Promise(i => {
                this.map.set(t, i),
                this.send(t, e)
            }
            )
        }
        reply(e, t) {
            const i = this.map.get(e);
            i && (i(t),
            this.map.delete(e))
        }
    }
    let t;
    function i(e, i) {
        return n = this,
        o = void 0,
        r = function*() {
            var n;
            const o = F.getGlobalDevice();
            return o.app ? o.getI18nMessage(e, i) : void 0 !== (null === (n = chrome.i18n) || void 0 === n ? void 0 : n.getMessage) ? Promise.resolve(chrome.i18n.getMessage(e, i)) : t.ask({
                tag: e,
                params: i
            })
        }
        ,
        new ((s = void 0) || (s = Promise))(function(e, t) {
            function i(e) {
                try {
                    c(r.next(e))
                } catch (e) {
                    t(e)
                }
            }
            function a(e) {
                try {
                    c(r.throw(e))
                } catch (e) {
                    t(e)
                }
            }
            function c(t) {
                var n;
                t.done ? e(t.value) : (n = t.value,
                n instanceof s ? n : new s(function(e) {
                    e(n)
                }
                )).then(i, a)
            }
            c((r = r.apply(n, o || [])).next())
        }
        );
        var n, o, s, r
    }
    function n() {
        return i("languageCode")
    }
    function o(e, t) {
        if (e.placeholders)
            for (const i of Object.keys(e.placeholders))
                if (e.placeholders[i].content === "$" + t)
                    return i;
        return null
    }
    class s {
        constructor(e, t) {
            this.isCanceled = !1,
            this.tasks = [],
            this.timeoutMs = null != e ? e : 0,
            this.maxRetries = null != t ? t : 0
        }
        send(e, t, i) {
            const n = new r(this,e,t,this.timeoutMs,this.maxRetries,i);
            return this.tasks.push(n),
            e(),
            n.promise
        }
        receive(e) {
            if (this.isCanceled)
                return !1;
            for (let t = 0; t < this.tasks.length; t++)
                if (this.tasks[t].handle(e))
                    return this.tasks.splice(t, 1),
                    !0;
            return !1
        }
        cancelAll(e) {
            this.tasks.forEach(t => {
                e && t.comment !== e || t.rejector(new Error("Task was canceled. This is no error"))
            }
            ),
            this.tasks = this.tasks.filter(t => t.comment !== e)
        }
    }
    class r {
        constructor(e, t, i, n, o, s) {
            this.buffer = e,
            this.sendFunc = t,
            this.testFunc = i,
            this.retryCount = o,
            this.comment = s,
            this.promise = new Promise( (e, t) => {
                this.resolver = e,
                this.rejector = t
            }
            ),
            n > 0 && (this.timeout = setTimeout( () => {
                this.retry(n)
            }
            , n))
        }
        retry(e) {
            --this.retryCount >= 0 && !this.buffer.isCanceled ? (this.sendFunc(),
            e > 0 && (this.timeout = setTimeout( () => {
                this.retry(e)
            }
            , e))) : (console.log("sendAndWait giving up for " + this.comment),
            this.rejector(new Error("Timeout")))
        }
        handle(e) {
            return !(this.buffer.isCanceled || !this.testFunc(e) || (this.timeout && clearTimeout(this.timeout),
            this.resolver(e),
            0))
        }
    }
    var a = function(e, t, i, n) {
        return new (i || (i = Promise))(function(o, s) {
            function r(e) {
                try {
                    c(n.next(e))
                } catch (e) {
                    s(e)
                }
            }
            function a(e) {
                try {
                    c(n.throw(e))
                } catch (e) {
                    s(e)
                }
            }
            function c(e) {
                var t;
                e.done ? o(e.value) : (t = e.value,
                t instanceof i ? t : new i(function(e) {
                    e(t)
                }
                )).then(r, a)
            }
            c((n = n.apply(e, t || [])).next())
        }
        )
    };
    let c = !1;
    function l(e, t, n, o) {
        return a(this, void 0, void 0, function*() {
            if (c)
                return Promise.resolve(!1);
            {
                c = !0,
                yield h(t + "/yesnodialog.html"),
                document.getElementById("yesNoDialogMessage").textContent = e;
                const s = document.getElementById("dialog-backdrop")
                  , r = document.getElementById("yesNoDialog")
                  , a = document.getElementById("yesNoDialogYesButton")
                  , l = document.getElementById("yesNoDialogNoButton");
                return a.innerHTML = n || (yield i("Yes")),
                l.innerHTML = o || (yield i("No")),
                new Promise(e => {
                    a.onclick = () => {
                        r.remove(),
                        s.remove(),
                        c = !1,
                        e(!0)
                    }
                    ,
                    l.onclick = () => {
                        r.remove(),
                        s.remove(),
                        c = !1,
                        e(!1)
                    }
                }
                )
            }
        })
    }
    function d(e, t, i) {
        return c ? Promise.resolve() : (c = !0,
        new Promise(n => {
            h(t + "/yesnodialog.html").then( () => {
                document.getElementById("yesNoDialogMessage").textContent = e;
                const t = document.getElementById("yesNoDialog")
                  , o = document.getElementById("dialog-backdrop")
                  , s = document.getElementById("yesNoDialogYesButton");
                document.getElementById("yesNoDialogNoButton").style.display = "none",
                s.innerHTML = i || "Ok",
                s.onclick = () => {
                    t.remove(),
                    o.remove(),
                    c = !1,
                    n()
                }
            }
            )
        }
        ))
    }
    function h(e) {
        return a(this, void 0, void 0, function*() {
            let t;
            if (F.getGlobalDevice().isApp())
                t = yield F.getGlobalDevice().loadAssetContent(e.substring(e.lastIndexOf("/") + 1));
            else {
                const i = yield fetch(e);
                t = yield i.text()
            }
            const i = document.createElement("div");
            document.body.appendChild(i),
            i.id = "yesNoDialog",
            i.style.zIndex = "1001",
            i.style.display = "block",
            i.style.position = "fixed",
            i.style.left = "50%",
            i.style.top = "50%",
            i.style.width = "fit-content",
            i.style.height = "fit-content",
            i.style.transform = "translate(-50%, -50%)",
            i.style.overflow = "auto",
            i.style.backgroundColor = "#eceef3",
            i.innerHTML = t;
            const n = document.createElement("div");
            n.id = "dialog-backdrop",
            n.style.zIndex = "1000",
            n.style.position = "fixed",
            n.style.top = "0",
            n.style.left = "0",
            n.style.width = "100vw",
            n.style.height = "100vh",
            n.style.backgroundColor = "rgba(0, 0, 0, 0.75)",
            n.style.display = "block",
            document.body.appendChild(n)
        })
    }
    var u = function(e, t, i, n) {
        return new (i || (i = Promise))(function(o, s) {
            function r(e) {
                try {
                    c(n.next(e))
                } catch (e) {
                    s(e)
                }
            }
            function a(e) {
                try {
                    c(n.throw(e))
                } catch (e) {
                    s(e)
                }
            }
            function c(e) {
                var t;
                e.done ? o(e.value) : (t = e.value,
                t instanceof i ? t : new i(function(e) {
                    e(t)
                }
                )).then(r, a)
            }
            c((n = n.apply(e, t || [])).next())
        }
        )
    };
    const v = "undefined" != typeof jest;
    let g = "";
    var f;
    function p(e) {
        return new Promise(t => setTimeout(t, e))
    }
    function m() {
        const e = new Date;
        return Math.floor(e.getTime() / 1e3)
    }
    function y(e, t=2) {
        return e.toString().padStart(t, "0")
    }
    function w(e, t, i) {
        return u(this, void 0, void 0, function*() {
            const n = Date.now();
            for (; !(yield e()); )
                if (yield p(t),
                i && Date.now() - n > i)
                    return !1;
            return !0
        })
    }
    function S(e) {
        return Array.from(e, e => e.toString(16).padStart(2, "0")).join(" ")
    }
    function C(e) {
        return new TextDecoder("utf-8").decode(e)
    }
    function P(e) {
        return (new TextEncoder).encode(e)
    }
    function M(e) {
        let t = "";
        for (let i = 0; i < e.byteLength; i++)
            t += String.fromCharCode(e.getUint8(i));
        return t
    }
    function T(e, t) {
        return u(this, void 0, void 0, function*() {
            var i;
            if (e) {
                const n = 1e3;
                let o;
                try {
                    if (e instanceof Error) {
                        if (e.message.includes("is already open"))
                            return;
                        o = null !== (i = e.stack) && void 0 !== i ? i : e.message;
                        try {
                            o = o.length > n ? o.substring(0, n) + "..." : o,
                            b("error:" + o)
                        } catch (e) {
                            b("Error processing error message:" + e)
                        }
                    } else if ("object" == typeof e) {
                        const t = JSON.stringify(e);
                        o = t.length > n ? t.substring(0, n) + "..." : t,
                        b(o)
                    } else
                        "string" == typeof e ? (o = e.length > n ? e.substring(0, n) + "..." : e,
                        b(o)) : (console.log(e),
                        o = JSON.stringify(e),
                        b("error: " + o));
                    t && (yield d(o, g))
                } catch (e) {
                    b("Error logging data:" + e)
                }
            }
        })
    }
    function b(e) {
        var t, i;
        const n = function() {
            const e = new Date;
            return `${e.getFullYear()}-${y(e.getMonth() + 1)}-${y(e.getDate())} ${y(e.getHours())}:${y(e.getMinutes())}:${y(e.getSeconds())}.${y(e.getMilliseconds(), 3)}`
        }() + ": " + e;
        console.log(n),
        "undefined" != typeof window && (null === (i = null === (t = null === window || void 0 === window ? void 0 : window.webkit) || void 0 === t ? void 0 : t.messageHandlers) || void 0 === i ? void 0 : i.debuglog) && window.webkit.messageHandlers.debuglog.postMessage(n)
    }
    function B() {
        return "undefined" != typeof isPhoenix
    }
    !function(e) {
        e[e.NONE = 0] = "NONE",
        e[e.BATTERY = 1] = "BATTERY",
        e[e.BOARD = 2] = "BOARD",
        e[e.PIECES = 3] = "PIECES"
    }(f || (f = {}));
    const E = new class {
        requestPersistentData(e, t) {
            var i, n;
            null === (n = null === (i = window.webkit) || void 0 === i ? void 0 : i.messageHandlers.requestPersistentData) || void 0 === n || n.postMessage({
                replyId: e,
                key: t
            })
        }
        savePersistentData(e, t) {
            var i, n;
            null === (n = null === (i = window.webkit) || void 0 === i ? void 0 : i.messageHandlers.savePersistentData) || void 0 === n || n.postMessage({
                key: e,
                data: t
            })
        }
        requestLocale(e) {
            var t, i;
            null === (i = null === (t = window.webkit) || void 0 === t ? void 0 : t.messageHandlers.requestLocale) || void 0 === i || i.postMessage(e)
        }
        requestI18nMessages(e) {
            var t, i;
            null === (i = null === (t = window.webkit) || void 0 === t ? void 0 : t.messageHandlers.requestI18nMessages) || void 0 === i || i.postMessage(e)
        }
        requestManifest(e) {
            var t, i;
            null === (i = null === (t = window.webkit) || void 0 === t ? void 0 : t.messageHandlers.requestManifest) || void 0 === i || i.postMessage(e)
        }
        closePage() {
            var e, t;
            null === (t = null === (e = window.webkit) || void 0 === e ? void 0 : e.messageHandlers.closePage) || void 0 === t || t.postMessage()
        }
        reportCommunicationParameters(e, t, i, n, o, s, r, a) {
            var c, l;
            null === (l = null === (c = window.webkit) || void 0 === c ? void 0 : c.messageHandlers.reportCommunicationParameters) || void 0 === l || l.postMessage({
                boardName: e,
                connectionType: t,
                channelIds: i,
                deviceNameSubstring: n,
                maxMessageSize: o,
                minMillsBetweenSends: s,
                serialSettings: r,
                sendSingleBytes: a
            })
        }
        sendDataToBoard(e, t) {
            var i, n;
            null === (n = null === (i = window.webkit) || void 0 === i ? void 0 : i.messageHandlers.sendDataToBoard) || void 0 === n || n.postMessage({
                data: e,
                channel: t
            })
        }
        loadAssetContent(e, t) {
            var i, n;
            null === (n = null === (i = window.webkit) || void 0 === i ? void 0 : i.messageHandlers.loadAssetContent) || void 0 === n || n.postMessage({
                replyId: e,
                asset: t
            })
        }
        batteryLevelChanged(e, t) {
            var i, n;
            null === (n = null === (i = window.webkit) || void 0 === i ? void 0 : i.messageHandlers.batteryLevelChanged) || void 0 === n || n.postMessage({
                level: e,
                icon: t
            })
        }
        isConnectedToBoard(e) {
            var t, i;
            null === (i = null === (t = window.webkit) || void 0 === t ? void 0 : t.messageHandlers.isConnectedToBoard) || void 0 === i || i.postMessage(e)
        }
        initTextToSpeech() {}
        say(e) {
            var t, i;
            null === (i = null === (t = window.webkit) || void 0 === t ? void 0 : t.messageHandlers.say) || void 0 === i || i.postMessage(e)
        }
        playSound(e, t) {
            var i, n;
            null === (n = null === (i = window.webkit) || void 0 === i ? void 0 : i.messageHandlers.playSound) || void 0 === n || n.postMessage({
                event: e,
                sound: t
            })
        }
        setTapNsetDeviceId(e) {
            var t, i;
            null === (i = null === (t = window.webkit) || void 0 === t ? void 0 : t.messageHandlers.setTapNsetDeviceId) || void 0 === i || i.postMessage(e)
        }
        sendDataToTapNset(e) {
            var t, i;
            null === (i = null === (t = window.webkit) || void 0 === t ? void 0 : t.messageHandlers.sendDataToTapNset) || void 0 === i || i.postMessage(e)
        }
        setClockAdapter(e) {
            var t, i;
            null === (i = null === (t = window.webkit) || void 0 === t ? void 0 : t.messageHandlers.setClockAdapter) || void 0 === i || i.postMessage(e)
        }
    }
    ;
    var I = function(e, t, i, n) {
        return new (i || (i = Promise))(function(o, s) {
            function r(e) {
                try {
                    c(n.next(e))
                } catch (e) {
                    s(e)
                }
            }
            function a(e) {
                try {
                    c(n.throw(e))
                } catch (e) {
                    s(e)
                }
            }
            function c(e) {
                var t;
                e.done ? o(e.value) : (t = e.value,
                t instanceof i ? t : new i(function(e) {
                    e(t)
                }
                )).then(r, a)
            }
            c((n = n.apply(e, t || [])).next())
        }
        )
    };
    class F {
        static createGlobalDevice() {
            window.chessconnectDevice || (window.chessconnectDevice = new F)
        }
        static getGlobalDevice() {
            return window.chessconnectDevice
        }
        constructor() {
            this.nextMessageId = 0,
            this.sendAndWaitBuffer = new s,
            this.connectionManager = null,
            window.device = this,
            this.initialized = new Promise(e => {
                this.initialize().then(e)
            }
            )
        }
        get app() {
            var e;
            return "chessconnectApp"in window ? window.chessconnectApp : (null === (e = window.webkit) || void 0 === e ? void 0 : e.messageHandlers.debuglog) ? E : void 0
        }
        isApp() {
            return !!this.app
        }
        isAndroid() {
            return "chessconnectApp"in window
        }
        isIOS() {
            var e;
            return void 0 !== (null === (e = window.webkit) || void 0 === e ? void 0 : e.messageHandlers.debuglog)
        }
        initialize() {
            return I(this, void 0, void 0, function*() {
                this.app && (this.lang = (yield this.sendMessageToApp(e => {
                    this.app.requestLocale(e)
                }
                )).data,
                this.i18nMessages = JSON.parse((yield this.sendMessageToApp(e => {
                    this.app.requestI18nMessages(e)
                }
                )).data),
                document.dispatchEvent(new Event("DOMContentLoaded")))
            })
        }
        isConnectedToBoard() {
            return I(this, void 0, void 0, function*() {
                return (yield this.sendMessageToApp(e => {
                    this.app.isConnectedToBoard(e)
                }
                )).data
            })
        }
        loadAssetContent(e) {
            return I(this, void 0, void 0, function*() {
                const t = yield this.sendMessageToApp(t => {
                    this.app.loadAssetContent(t, e)
                }
                );
                return atob(t.data)
            })
        }
        isInitialized() {
            return this.initialized
        }
        receiveMessageFromApp(e, t) {
            this.sendAndWaitBuffer.receive({
                messageId: e,
                data: t
            })
        }
        sendMessageToApp(e) {
            return I(this, void 0, void 0, function*() {
                const t = this.nextMessageId++;
                return yield this.sendAndWaitBuffer.send( () => {
                    e(t)
                }
                , e => e.messageId === t, "loadOptions")
            })
        }
        chromeRuntimeGetURL(e) {
            return this.app ? e : chrome.runtime.getURL(e)
        }
        loadOptions(e) {
            return I(this, void 0, void 0, function*() {
                if (this.app) {
                    const t = yield this.sendMessageToApp(e => {
                        this.app.requestPersistentData(e, "options")
                    }
                    );
                    if (t.data)
                        try {
                            Object.assign(e, JSON.parse(t.data))
                        } catch (e) {
                            b("Error parsing options from app: " + t.data)
                        }
                    return e.resUrl = "",
                    e.currentVersion = yield this.getVersion(),
                    e
                }
                return yield chrome.storage.sync.get(e)
            })
        }
        saveOptions(e) {
            return I(this, void 0, void 0, function*() {
                this.app ? this.app.savePersistentData("options", JSON.stringify(e)) : yield chrome.storage.sync.set(e)
            })
        }
        getI18nMessage(e, t) {
            return I(this, void 0, void 0, function*() {
                var i;
                yield this.initialized;
                const n = this.i18nMessages[e];
                let s = null !== (i = null == n ? void 0 : n.message) && void 0 !== i ? i : e;
                if (t) {
                    "string" == typeof t && (t = [t]);
                    for (let e = 0; e < t.length; e++) {
                        const i = o(n, e + 1);
                        i && (s = s.replace("$" + i + "$", t[e]))
                    }
                }
                return s
            })
        }
        getVersion() {
            return I(this, void 0, void 0, function*() {
                if (this.app) {
                    const e = yield this.sendMessageToApp(e => {
                        this.app.requestManifest(e)
                    }
                    );
                    return JSON.parse(e.data).version
                }
                return chrome.runtime.getManifest().version
            })
        }
        closePage() {
            this.app ? this.app.closePage() : window.close()
        }
        static arrayToString(e) {
            let t = "";
            for (const i of e)
                "" !== t && (t += "\n"),
                t += i;
            return t
        }
        static base64ToUint8Array(e) {
            const t = atob(e)
              , i = t.length
              , n = new Uint8Array(i);
            for (let e = 0; e < i; e++)
                n[e] = t.charCodeAt(e);
            return n
        }
        sendDataToBoard(e, t=0) {
            var i;
            null === (i = this.app) || void 0 === i || i.sendDataToBoard(btoa(String.fromCharCode(...e)), t)
        }
        sendDataToTapNset(e) {
            var t;
            null === (t = this.app) || void 0 === t || t.sendDataToTapNset(btoa(String.fromCharCode(...e)))
        }
        processDataFromTapNset(e) {
            return I(this, void 0, void 0, function*() {
                var t, i, n, o;
                const s = null === (o = null === (n = null === (i = null === (t = window.chessconnect) || void 0 === t ? void 0 : t.siteManager) || void 0 === i ? void 0 : i.connectionManager) || void 0 === n ? void 0 : n.currentBoard) || void 0 === o ? void 0 : o.getClock();
                if (s && "function" == typeof s.processClockMessage) {
                    const t = F.base64ToUint8Array(e);
                    yield s.processClockMessage(t, window.chessconnect.siteManager)
                }
            })
        }
    }
    var L, O, k, A, D, R, N, H = function(e, t, i, n) {
        return new (i || (i = Promise))(function(o, s) {
            function r(e) {
                try {
                    c(n.next(e))
                } catch (e) {
                    s(e)
                }
            }
            function a(e) {
                try {
                    c(n.throw(e))
                } catch (e) {
                    s(e)
                }
            }
            function c(e) {
                var t;
                e.done ? o(e.value) : (t = e.value,
                t instanceof i ? t : new i(function(e) {
                    e(t)
                }
                )).then(r, a)
            }
            c((n = n.apply(e, t || [])).next())
        }
        )
    };
    !function(e) {
        e[e.BLUETOOTH = 5] = "BLUETOOTH",
        e[e.USB = 6] = "USB",
        e[e.PHOENIX = 7] = "PHOENIX",
        e[e.APP = 8] = "APP"
    }(L || (L = {})),
    function(e) {
        e[e.CHESSNUT = 1] = "CHESSNUT",
        e[e.MILLENNIUM = 2] = "MILLENNIUM",
        e[e.TABUTRONIC = 3] = "TABUTRONIC",
        e[e.STAUNTON = 4] = "STAUNTON",
        e[e.DGT = 5] = "DGT",
        e[e.DGT_PEGASUS = 6] = "DGT_PEGASUS",
        e[e.ICHESSONE = 7] = "ICHESSONE",
        e[e.YIZHI = 8] = "YIZHI",
        e[e.CHESSUP = 9] = "CHESSUP",
        e[e.DGT_REVELATION_II = 10] = "DGT_REVELATION_II",
        e[e.TABUTRONIC_SPECTRUM = 11] = "TABUTRONIC_SPECTRUM"
    }(O || (O = {})),
    function(e) {
        e[e.NO_CLOCK = 0] = "NO_CLOCK",
        e[e.DGT3000 = 1] = "DGT3000",
        e[e.DGT3000_GATEWAY = 2] = "DGT3000_GATEWAY",
        e[e.ZMARTFUN_TAPNSETPRO = 3] = "ZMARTFUN_TAPNSETPRO",
        e[e.TAPNSET_ADAPTER = 4] = "TAPNSET_ADAPTER"
    }(k || (k = {})),
    function(e) {
        e[e.WHITE_LEFT = 1] = "WHITE_LEFT",
        e[e.WHITE_RIGHT = 2] = "WHITE_RIGHT",
        e[e.PLAYER_LEFT = 3] = "PLAYER_LEFT",
        e[e.PLAYER_RIGHT = 4] = "PLAYER_RIGHT"
    }(A || (A = {})),
    function(e) {
        e[e.NOTHING = 0] = "NOTHING",
        e[e.BEEP = 1] = "BEEP",
        e[e.KNOCK = 2] = "KNOCK",
        e[e.SPEECH = 3] = "SPEECH"
    }(D || (D = {})),
    function(e) {
        e[e.OPPONENT_MOVED = 0] = "OPPONENT_MOVED",
        e[e.POSITIONS_MATCH = 1] = "POSITIONS_MATCH"
    }(R || (R = {}));
    class x {
        constructor() {
            this.speakChatMessages = !1,
            this.connectionType = L.BLUETOOTH,
            this.boardType = O.CHESSNUT,
            this.moveSound = D.NOTHING,
            this.latency = 200,
            this.volume = .5,
            this.ledColor = "#0000ff",
            this.ledColorStart = "#ff0000",
            this.ledColorTarget = "#00ff00",
            this.ledColorCheck = "#ff00ff",
            this.ledBrightness = 50,
            this.showLedClock = !1,
            this.ledClockColor = "#00ff00",
            this.ledClockBrightness = 10,
            this.lastChangelogVersion = "0.0.0.0",
            this.certaboMapping = {},
            this.lichess = {
                apiToken: "",
                userName: ""
            },
            this.learnPiecesOnNextConnect = !1,
            this.clockType = k.NO_CLOCK,
            this.clockPosition = A.WHITE_LEFT,
            this.playSoundWhenBoardsMatch = !0,
            this.lang = "en",
            this.voiceName = null,
            this.reversePositionWhenBlack = !1,
            this.chesscomApi = {},
            this.accessTokens = {},
            this.lastSerialPort = null,
            this.lastHidDevice = null,
            this.lastBleDevice = null,
            this.loginData = {},
            this.tapnsetDeviceId = null,
            this.transmitMovesOnClockPress = !1,
            this.noReconnectWarningShown = !1,
            this.showMovesOnClock = !0
        }
        static getFromStorage() {
            return H(this, void 0, void 0, function*() {
                var e;
                const t = yield F.getGlobalDevice().loadOptions(new x);
                return t.connectionType || (t.connectionType = L.BLUETOOTH),
                t.boardType || (t.boardType = O.CHESSNUT),
                void 0 === t.clockType && ((null === (e = t.tapnsetDeviceId) || void 0 === e ? void 0 : e.length) ? t.clockType = k.ZMARTFUN_TAPNSETPRO : t.clockType = k.NO_CLOCK),
                t.clockPosition < A.WHITE_LEFT && (t.clockPosition = A.WHITE_LEFT),
                t
            })
        }
        static writeToStorage(e) {
            return H(this, void 0, void 0, function*() {
                yield F.getGlobalDevice().saveOptions(e)
            })
        }
        saveToken(e, t, i) {
            this.accessTokens || (this.accessTokens = {});
            const n = this.accessTokens[e] || {};
            n[t] = i,
            this.accessTokens[e] = n
        }
        getToken(e, t) {
            var i, n;
            return (null === (n = null === (i = this.accessTokens) || void 0 === i ? void 0 : i[e]) || void 0 === n ? void 0 : n[t]) || null
        }
        saveLoginData(e, t) {
            this.loginData || (this.loginData = {}),
            this.loginData[e] = t
        }
        getLoginData(e) {
            var t;
            return (null === (t = this.loginData) || void 0 === t ? void 0 : t[e]) || null
        }
    }
    x.ANY_USER = "any_user";
    class W {
        constructor(e, t) {
            this.row = e,
            this.col = t
        }
        asString() {
            return "abcdefgh".substring(this.col, this.col + 1) + (this.row + 1)
        }
        static fromString(e) {
            const t = (e = e.toLowerCase()).charCodeAt(1) - "1".charCodeAt(0)
              , i = e.charCodeAt(0) - "a".charCodeAt(0);
            return new W(t,i)
        }
        equals(e) {
            return null !== e && this.row === e.row && this.col === e.col
        }
        isOnBoard() {
            return this.row >= 0 && this.row < 8 && this.col >= 0 && this.col < 8
        }
        asSpeech() {
            const e = this.asString();
            return e[0] + "-" + e[1]
        }
    }
    !function(e) {
        e[e.KING_TAKES_ROOK = 0] = "KING_TAKES_ROOK",
        e[e.KING_MOVES_TWO_FIELDS = 1] = "KING_MOVES_TWO_FIELDS"
    }(N || (N = {}));
    class U {
        constructor(e, t, i, n) {
            this.fromField = e,
            this.toField = t,
            this.promPiece = i,
            this.player = n
        }
        asString() {
            return this.promPiece ? "(" + this.fromField.asString() + ")->(" + this.toField.asString() + ")=" + this.promPiece : "(" + this.fromField.asString() + ")->(" + this.toField.asString() + ")"
        }
        isCastle(e) {
            return this.isCastleShort(e) || this.isCastleLong(e)
        }
        isCastleShort(e) {
            const t = e.getColorOnField(this.fromField)
              , i = e.getColorOnField(this.toField)
              , n = e.getPieceOnField(this.toField);
            return t === i && this.movedPiece === te.KING && n === te.ROOK && this.fromField.col < this.toField.col
        }
        isCastleLong(e) {
            const t = e.getColorOnField(this.fromField)
              , i = e.getColorOnField(this.toField)
              , n = e.getPieceOnField(this.toField);
            return t === i && this.movedPiece === te.KING && n === te.ROOK && this.fromField.col > this.toField.col
        }
        convertCastleMove(e, t) {
            if (e === N.KING_TAKES_ROOK)
                return this;
            if (this.isCastleLong(t)) {
                const e = new W(this.fromField.row,4)
                  , t = new W(this.toField.row,2);
                return new U(e,t)
            }
            if (this.isCastleShort(t)) {
                const e = new W(this.fromField.row,4)
                  , t = new W(this.toField.row,6);
                return new U(e,t)
            }
            return this
        }
        isPromotion() {
            return !!this.promPiece && this.promPiece > 0
        }
        asUciString() {
            return this.isPromotion() ? this.fromField.asString() + this.toField.asString() + te.pieceAsString(this.promPiece) : this.fromField.asString() + this.toField.asString()
        }
        static fromUciString(e, t) {
            const i = U.fieldFromUciString(e.substring(0, 2))
              , n = U.fieldFromUciString(e.substring(2, 4))
              , o = new U(i,n);
            return o.player = t,
            e.length > 4 && (o.promPiece = te.pieceFromString(e[4]) | t),
            o
        }
        static fieldFromUciString(e) {
            const t = e.charCodeAt(0) - "a".charCodeAt(0)
              , i = e.charCodeAt(1) - "1".charCodeAt(0);
            return new W(i,t)
        }
        isObviouslyIllegal() {
            return this.movedPiece === te.KING && (Math.abs(this.fromField.row - this.toField.row) > 1 || Math.abs(this.fromField.col - this.toField.col) > 1)
        }
        isStraight() {
            return this.fromField.row === this.toField.row || this.fromField.col === this.toField.col
        }
        isDiagonal() {
            return Math.abs(this.fromField.row - this.toField.row) === Math.abs(this.fromField.col - this.toField.col)
        }
    }
    function _(e, t, i) {
        const n = e.getColorOnField(i.fromField);
        let o;
        if (G(t, n))
            o = !1;
        else if (i.isCastleLong(e))
            o = function(e, t) {
                const i = W.fromString("e1")
                  , n = W.fromString("e8");
                if (t.fromField.equals(i)) {
                    const t = W.fromString("d1")
                      , n = W.fromString("c1")
                      , o = W.fromString("b1");
                    return !q(i, te.BLACK, e) && !q(t, te.BLACK, e) && !q(n, te.BLACK, e) && e.fieldIsEmpty(t) && e.fieldIsEmpty(n) && e.fieldIsEmpty(o)
                }
                if (t.fromField.equals(n)) {
                    const t = W.fromString("d8")
                      , i = W.fromString("c8")
                      , o = W.fromString("b8");
                    return !q(n, te.WHITE, e) && !q(t, te.WHITE, e) && !q(i, te.WHITE, e) && e.fieldIsEmpty(t) && e.fieldIsEmpty(i) && e.fieldIsEmpty(o)
                }
                return !1
            }(e, i);
        else if (i.isCastleShort(e))
            o = function(e, t) {
                const i = W.fromString("e1")
                  , n = W.fromString("e8");
                if (t.fromField.equals(i)) {
                    const t = W.fromString("f1")
                      , n = W.fromString("g1");
                    return !q(i, te.BLACK, e) && !q(t, te.BLACK, e) && !q(n, te.BLACK, e) && e.fieldIsEmpty(t) && e.fieldIsEmpty(n)
                }
                if (t.fromField.equals(n)) {
                    const t = W.fromString("f8")
                      , i = W.fromString("g8");
                    return !q(n, te.WHITE, e) && !q(t, te.WHITE, e) && !q(i, te.WHITE, e) && e.fieldIsEmpty(t) && e.fieldIsEmpty(i)
                }
                return !1
            }(e, i);
        else {
            const t = Y(e, i.fromField, !1)
              , s = t && function(e, t) {
                for (const i of t)
                    if (i.row === e.row && i.col === e.col)
                        return !0;
                return !1
            }(i.toField, t);
            o = i.isPromotion() ? s && function(e, t) {
                return (e.getPieceOnField(t.fromField) & te.PAWN) > 0
            }(e, i) && function(e, t) {
                const i = [te.BISHOP, te.KNIGHT, te.QUEEN, te.ROOK];
                return (1 & t) === e && i.includes(t - e)
            }(n, i.promPiece) : s
        }
        return o
    }
    function G(e, t) {
        return q(K(e, t), te.oppositeColor(t), e)
    }
    function K(e, t) {
        for (let i = 0; i < 8; i++)
            for (let n = 0; n < 8; n++) {
                const o = new W(i,n)
                  , s = e.getPieceOnField(o)
                  , r = e.getColorOnField(o);
                if (s === te.KING && r === t)
                    return o
            }
        throw new Error((t === te.BLACK ? "Black" : "White") + " king missing")
    }
    function q(e, t, i) {
        return z(e, t, i).length > 0
    }
    function z(e, t, i) {
        const n = [];
        for (let o = 0; o < 8; o++)
            for (let s = 0; s < 8; s++) {
                const r = new W(o,s);
                i.fieldIsEmpty(r) || i.getColorOnField(r) !== t || $(e, Y(i, r, !0, !0)) && n.push(r)
            }
        return n
    }
    function $(e, t) {
        return [...t].some(t => t.equals(e))
    }
    function Y(e, t, i, n=!1) {
        const o = e.getColorOnField(t);
        switch (e.getPieceOnField(t)) {
        case te.BISHOP:
            return J(e, t);
        case te.KING:
            return function(e, t, i, n) {
                const o = new Set
                  , s = te.oppositeColor(i);
                for (let r = -1; r <= 1; r++)
                    for (let a = -1; a <= 1; a++)
                        if (0 !== r || 0 !== a) {
                            const c = new W(t.row + r,t.col + a);
                            if (V(c, e, e.getColorOnField(t)) && (n || !q(c, s, e))) {
                                const r = e.clone();
                                r.setField(t.row, t.col, i, te.EMPTY),
                                r.setField(c.row, c.col, i, te.KING),
                                !n && q(c, s, r) || o.add(c)
                            }
                        }
                return o
            }(e, t, o, i);
        case te.KNIGHT:
            return function(e, t) {
                const i = new Set;
                let n = new W(t.row + 2,t.col + 1);
                return V(n, e, e.getColorOnField(t)) && i.add(n),
                n = new W(t.row + 2,t.col - 1),
                V(n, e, e.getColorOnField(t)) && i.add(n),
                n = new W(t.row - 2,t.col + 1),
                V(n, e, e.getColorOnField(t)) && i.add(n),
                n = new W(t.row - 2,t.col - 1),
                V(n, e, e.getColorOnField(t)) && i.add(n),
                n = new W(t.row + 1,t.col + 2),
                V(n, e, e.getColorOnField(t)) && i.add(n),
                n = new W(t.row - 1,t.col - 2),
                V(n, e, e.getColorOnField(t)) && i.add(n),
                n = new W(t.row + 1,t.col - 2),
                V(n, e, e.getColorOnField(t)) && i.add(n),
                n = new W(t.row - 1,t.col - 2),
                V(n, e, e.getColorOnField(t)) && i.add(n),
                i
            }(e, t);
        case te.PAWN:
            return function(e, t, i) {
                const n = e.getColorOnField(t)
                  , o = te.oppositeColor(n)
                  , s = n === te.WHITE ? 1 : -1
                  , r = new Set;
                let a = new W(t.row + s,t.col);
                !i && a.isOnBoard() && e.fieldIsEmpty(a) && r.add(a),
                !i && r.size > 0 && (n === te.WHITE && 1 === t.row || n === te.BLACK && 6 === t.row) && (a = new W(t.row + 2 * s,t.col),
                a.isOnBoard() && e.fieldIsEmpty(a) && r.add(a));
                for (const i of [-1, 1])
                    if (a = new W(t.row + s,t.col + i),
                    V(a, e, n) && !e.fieldIsEmpty(a) && r.add(a),
                    n === te.WHITE && 4 === t.row || n === te.BLACK && 3 === t.row) {
                        const n = new W(t.row,t.col + i);
                        n.isOnBoard() && e.getColorOnField(n) === o && e.getPieceOnField(n) === te.PAWN && (a = new W(t.row + s,t.col + i),
                        a.isOnBoard() && e.fieldIsEmpty(a) && r.add(a))
                    }
                return r
            }(e, t, n);
        case te.QUEEN:
            return function(e, t) {
                const i = j(e, t);
                return Q(i, J(e, t)),
                i
            }(e, t);
        case te.ROOK:
            return j(e, t)
        }
        throw new Error("Illegal piece on field")
    }
    function V(e, t, i) {
        return e.isOnBoard() && (t.fieldIsEmpty(e) || t.getColorOnField(e) === te.oppositeColor(i))
    }
    function Q(e, t) {
        for (const i of t)
            e.add(i)
    }
    function j(e, t) {
        const i = new Set;
        return Q(i, X(e, t, 0, 1)),
        Q(i, X(e, t, 0, -1)),
        Q(i, X(e, t, 1, 0)),
        Q(i, X(e, t, -1, 0)),
        i
    }
    function J(e, t) {
        const i = new Set;
        return Q(i, X(e, t, 1, 1)),
        Q(i, X(e, t, -1, 1)),
        Q(i, X(e, t, 1, -1)),
        Q(i, X(e, t, -1, -1)),
        i
    }
    function X(e, t, i, n) {
        const o = new Set
          , s = e.getColorOnField(t);
        for (let r = 1; r < 8; r++) {
            const a = new W(t.row + i * r,t.col + n * r);
            if (!a.isOnBoard())
                break;
            if (!e.fieldIsEmpty(a)) {
                if (e.getColorOnField(a) !== s) {
                    o.add(a);
                    break
                }
                break
            }
            o.add(a)
        }
        return o
    }
    function Z(e, t, i) {
        if (i.getPieceOnField(e) === te.KING)
            return !1;
        for (const n of t) {
            const t = new U(e,n)
              , o = i.clone();
            if (o.makeMove(t),
            _(i, o, t))
                return !0
        }
        return !1
    }
    class ee {
        constructor() {
            this.board = new Uint8Array(64),
            this.colorToMove = ee.WHITE,
            this.castleRights = {
                black: ee.KING_CASTLE + ee.QUEEN_CASTLE,
                white: ee.KING_CASTLE + ee.QUEEN_CASTLE
            },
            this.enPassantField = null,
            this.halfMovesSinceLastPawnMove = 0,
            this.moveCounter = 1
        }
        setField(e, t, i, n) {
            this.board[8 * e + t] = i | n
        }
        equals(e) {
            if (e) {
                for (let t = 0; t < 64; t++)
                    if (this.board[t] !== e.board[t] && (254 & this.board[t] || 254 & e.board[t]))
                        return !1;
                return !0
            }
            return !1
        }
        equalsForColor(e, t) {
            for (let i = 0; i < 64; i++) {
                const n = !(254 & this.board[i])
                  , o = (1 & this.board[i]) === t
                  , s = !(254 & e.board[i])
                  , r = (1 & e.board[i]) === t;
                if ((!n && o || !s && r) && !(this.board[i] === e.board[i] || n && s))
                    return !1
            }
            return !0
        }
        print(e) {
            if (!v || "test" === e) {
                b("---- " + e + ":");
                for (let e = 7; e >= 0; e--) {
                    let t = "";
                    for (let i = 0; i < 8; i++)
                        t += this.fieldAsCharacter(e, i);
                    b(e + 1 + " " + t)
                }
                b("colorToMove: " + (this.colorToMove === ee.WHITE ? "white" : "black"))
            }
        }
        fieldAsCharacter(e, t) {
            const i = ee.indexFromRowAndCol(e, t)
              , n = this.board[i];
            let o = ee.pieceAsString(n);
            return o || (o = "_"),
            n & ee.WHITE ? o.toUpperCase() : o
        }
        static indexFromRowAndCol(e, t) {
            return 8 * e + t
        }
        static pieceAsString(e) {
            switch (254 & e) {
            case ee.PAWN:
                return "p";
            case ee.ROOK:
                return "r";
            case ee.KNIGHT:
                return "n";
            case ee.BISHOP:
                return "b";
            case ee.KING:
                return "k";
            case ee.QUEEN:
                return "q";
            case ee.OTHER:
                return "o";
            default:
                return "."
            }
        }
        fieldIsEmpty(e) {
            const t = ee.indexFromRowAndCol(e.row, e.col);
            return ee.isEmpty(this.board[t])
        }
        static isEmpty(e) {
            return e < 2
        }
        getPieceOnField(e) {
            const t = ee.indexFromRowAndCol(e.row, e.col);
            return ee.pieceOnly(this.board[t])
        }
        static pieceOnly(e) {
            return 254 & e
        }
        getColorOnField(e) {
            const t = ee.indexFromRowAndCol(e.row, e.col);
            return ee.colorOnly(this.board[t])
        }
        static colorOnly(e) {
            return 1 & e
        }
        static oppositeColor(e) {
            return e === ee.BLACK ? ee.WHITE : ee.BLACK
        }
        getFieldsOfColor(e) {
            const t = [];
            for (let i = 0; i < 8; i++)
                for (let n = 0; n < 8; n++) {
                    const o = new W(i,n);
                    this.fieldIsEmpty(o) || this.getColorOnField(o) !== e || t.push(o)
                }
            return t
        }
        static pieceFromString(e) {
            switch (e.toLowerCase()) {
            case "p":
                return ee.PAWN;
            case "r":
                return ee.ROOK;
            case "n":
                return ee.KNIGHT;
            case "b":
                return ee.BISHOP;
            case "k":
                return ee.KING;
            case "q":
                return ee.QUEEN;
            case "o":
                return ee.OTHER;
            default:
                return ee.EMPTY
            }
        }
        static pieceAsSpeech(e) {
            return t = this,
            n = void 0,
            s = function*() {
                switch (254 & e) {
                case ee.PAWN:
                    return yield i("pawn");
                case ee.ROOK:
                    return yield i("rook");
                case ee.KNIGHT:
                    return yield i("knight");
                case ee.BISHOP:
                    return yield i("bishop");
                case ee.KING:
                    return yield i("king");
                case ee.QUEEN:
                    return yield i("queen");
                default:
                    return yield i("piece")
                }
            }
            ,
            new ((o = void 0) || (o = Promise))(function(e, i) {
                function r(e) {
                    try {
                        c(s.next(e))
                    } catch (e) {
                        i(e)
                    }
                }
                function a(e) {
                    try {
                        c(s.throw(e))
                    } catch (e) {
                        i(e)
                    }
                }
                function c(t) {
                    var i;
                    t.done ? e(t.value) : (i = t.value,
                    i instanceof o ? i : new o(function(e) {
                        e(i)
                    }
                    )).then(r, a)
                }
                c((s = s.apply(t, n || [])).next())
            }
            );
            var t, n, o, s
        }
        clearField(e) {
            "string" == typeof e && (e = W.fromString(e)),
            this.setField(e.row, e.col, ee.BLACK, ee.EMPTY)
        }
        hasOtherPieces() {
            for (let e = 0; e < 8; e++)
                for (let t = 0; t < 8; t++)
                    if (this.getPieceOnField(new W(e,t)) === ee.OTHER)
                        return !0;
            return !1
        }
        isPawnOnBackRank() {
            for (let e = 0; e < 8; e++) {
                const t = new W(0,e);
                if (this.getPieceOnField(t) === ee.PAWN)
                    return !0;
                if (t.row = 7,
                this.getPieceOnField(t) === ee.PAWN)
                    return !0
            }
            return !1
        }
        removeCastleRight(e, t) {
            return t & e ? t - e : t
        }
        guessCastlerights() {
            this.getPieceOnField(W.fromString("e1")) !== ee.KING || this.getColorOnField(W.fromString("e1")) !== ee.WHITE ? this.castleRights.white = 0 : (this.getPieceOnField(W.fromString("h1")) === ee.ROOK && this.getColorOnField(W.fromString("h1")) === ee.WHITE || (this.castleRights.white = this.removeCastleRight(ee.KING_CASTLE, this.castleRights.white)),
            this.getPieceOnField(W.fromString("a1")) === ee.ROOK && this.getColorOnField(W.fromString("a1")) === ee.WHITE || (this.castleRights.white = this.removeCastleRight(ee.QUEEN_CASTLE, this.castleRights.white))),
            this.getPieceOnField(W.fromString("e8")) !== ee.KING || this.getColorOnField(W.fromString("e8")) !== ee.BLACK ? this.castleRights.black = 0 : (this.getPieceOnField(W.fromString("h8")) === ee.ROOK && this.getColorOnField(W.fromString("h8")) === ee.BLACK || (this.castleRights.black = this.removeCastleRight(ee.KING_CASTLE, this.castleRights.black)),
            this.getPieceOnField(W.fromString("a8")) === ee.ROOK && this.getColorOnField(W.fromString("a8")) === ee.BLACK || (this.castleRights.black = this.removeCastleRight(ee.QUEEN_CASTLE, this.castleRights.black)))
        }
        static pieceAndColorFromChar(e) {
            const t = e === e.toUpperCase() ? ee.WHITE : ee.BLACK;
            return {
                piece: ee.pieceFromString(e.toLowerCase()),
                color: t
            }
        }
        isPromotionMove(e) {
            return this.getPieceOnField(e.fromField) === ee.PAWN && (0 === e.toField.row || 7 === e.toField.row)
        }
        findPieceOnNewField(e, t) {
            for (let i = 0; i < 8; i++)
                for (let n = 0; n < 8; n++) {
                    const o = new W(i,n);
                    if (!t.fieldIsEmpty(o) && t.getColorOnField(o) === e && t.getPieceOnField(o) !== this.getPieceOnField(o))
                        return o
                }
            return null
        }
        isEmptyBoard() {
            for (let e = 0; e < 8; e++)
                for (let t = 0; t < 8; t++) {
                    const i = new W(e,t);
                    if (!this.fieldIsEmpty(i))
                        return !1
                }
            return !0
        }
    }
    ee.EMPTY = 0,
    ee.BLACK = 0,
    ee.WHITE = 1,
    ee.PAWN = 2,
    ee.ROOK = 4,
    ee.KNIGHT = 8,
    ee.BISHOP = 16,
    ee.KING = 32,
    ee.QUEEN = 64,
    ee.OTHER = 128,
    ee.GHOST = 256,
    ee.KING_CASTLE = 1,
    ee.QUEEN_CASTLE = 2;
    class te extends ee {
        clone() {
            const e = new te;
            return e.board = this.board.slice(),
            e.enPassantField = this.enPassantField,
            e.castleRights = this.castleRights,
            e.colorToMove = this.colorToMove,
            e.halfMovesSinceLastPawnMove = this.halfMovesSinceLastPawnMove,
            e.moveCounter = this.moveCounter,
            e
        }
        static fromStringifiedPosition(e) {
            const t = new te;
            return t.board = Uint8Array.from(Object.values(e.board)),
            t.enPassantField = e.enPassantField,
            t.castleRights = e.castleRights,
            t.colorToMove = e.colorToMove,
            t.halfMovesSinceLastPawnMove = e.halfMovesSinceLastPawnMove,
            t.moveCounter = e.moveCounter,
            t
        }
        moveAsSpeech(e) {
            return t = this,
            n = void 0,
            s = function*() {
                const t = {
                    speech: "",
                    algebraic: ""
                }
                  , n = this.computeMoveTo(e);
                if (n) {
                    if (n.isCastleShort(this))
                        t.speech = yield i("shortCastle"),
                        t.algebraic = "0-0";
                    else if (n.isCastleLong(this))
                        t.speech = yield i("longCastle"),
                        t.algebraic = "0-0-0";
                    else {
                        n.movedPiece = this.getPieceOnField(n.fromField);
                        const e = yield te.pieceAsSpeech(n.movedPiece)
                          , o = this.moveIsCapture(n);
                        t.speech = o ? yield i("chessMoveTakes", [e, n.fromField.asSpeech(), n.toField.asSpeech()]) : yield i("chessMove", [e, n.fromField.asSpeech(), n.toField.asSpeech()]),
                        t.algebraic = te.pieceAsString(n.movedPiece).toUpperCase() + n.fromField.asString() + (o ? "x" : "") + n.toField.asString(),
                        n.promPiece && (t.speech += " " + (yield i("andPromoteTo", yield te.pieceAsSpeech(n.promPiece))),
                        t.algebraic += "=" + te.pieceAsString(n.promPiece).toUpperCase())
                    }
                    e.isCheckMate() ? (t.speech += " . " + (yield i("mate")),
                    t.algebraic += "#") : e.isCheck() && (t.speech += " . " + (yield i("check")),
                    t.algebraic += "+")
                }
                return t
            }
            ,
            new ((o = void 0) || (o = Promise))(function(e, i) {
                function r(e) {
                    try {
                        c(s.next(e))
                    } catch (e) {
                        i(e)
                    }
                }
                function a(e) {
                    try {
                        c(s.throw(e))
                    } catch (e) {
                        i(e)
                    }
                }
                function c(t) {
                    var i;
                    t.done ? e(t.value) : (i = t.value,
                    i instanceof o ? i : new o(function(e) {
                        e(i)
                    }
                    )).then(r, a)
                }
                c((s = s.apply(t, n || [])).next())
            }
            );
            var t, n, o, s
        }
        moveIsCapture(e) {
            return !this.fieldIsEmpty(e.toField) || this.getPieceOnField(e.fromField) === te.PAWN && e.fromField.col !== e.toField.col
        }
        computeMoveTo(e) {
            if (e.isPawnOnBackRank())
                return null;
            let t = null;
            const i = this.computeModifiedFields(e);
            return e.hasOtherPieces() || this.hasOtherPieces() ? null : i.length >= 2 && (t = this.computeCastleMove(e, i),
            t) ? t : (2 === i.length ? t = this.computeNormalMove(e, i) : t || 3 !== i.length || (t = this.computeEnPasantMove(e, i)),
            t && (t.player = this.getColorOnField(t.fromField),
            e.getPieceOnField(t.toField) !== this.getPieceOnField(t.fromField) && (t.promPiece = e.getPieceOnField(t.toField))),
            t || null)
        }
        printModifiedFields(e, t) {
            const i = this.computeModifiedFields(t);
            let n = e + ":";
            for (const e of i)
                n += " " + e.asString();
            b(n)
        }
        computeEnPasantMove(e, t) {
            if (3 !== t.length)
                throw new Error("en passent wrong number of modified fields");
            let i, n;
            for (let n = 0; n < 3; n++)
                e.fieldIsEmpty(t[n]) || (i = t[n]);
            if (!i)
                return null;
            for (let e = 0; e < 3; e++) {
                const o = t[e];
                i.row !== o.row && i.col !== o.col && (n = o)
            }
            return n && i ? new U(n,i) : null
        }
        computeNormalMove(e, t) {
            let i, n;
            if (e.fieldIsEmpty(t[0]) && !e.fieldIsEmpty(t[1]))
                i = t[0],
                n = t[1];
            else {
                if (!e.fieldIsEmpty(t[1]) || e.fieldIsEmpty(t[0]))
                    return null;
                i = t[1],
                n = t[0]
            }
            const o = new U(i,n);
            return o.movedPiece = this.getPieceOnField(o.fromField),
            o.isObviouslyIllegal() ? null : o
        }
        computeCastleMove(e, t) {
            const i = te.getModifiedRow(t);
            let n = null;
            if (null !== i) {
                const t = 0 === i ? te.WHITE : te.BLACK
                  , o = this.findKingAndRooksForCastle(t, !1);
                if (o) {
                    const s = e.findKingAndRooksForCastle(t, !0);
                    s && (o.kingRook && s.kingRook && o.kingRook.col > o.king.col && 6 === s.king.col && 5 === s.kingRook.col ? (n = new U(o.king,o.kingRook),
                    n.movedPiece = te.KING,
                    n.player = 0 === i ? te.WHITE : te.BLACK) : o.queenRook && s.queenRook && o.queenRook.col < o.king.col && 2 === s.king.col && 3 === s.queenRook.col && (n = new U(o.king,o.queenRook),
                    n.movedPiece = te.KING,
                    n.player = 0 === i ? te.WHITE : te.BLACK))
                }
            }
            return n
        }
        findKingAndRooksForCastle(e, t) {
            t = null != t && t;
            const i = e === te.WHITE ? 0 : 7
              , n = [];
            let o = null;
            for (let t = 0; t < 8; t++) {
                const s = new W(i,t);
                if (this.getColorOnField(s) === e) {
                    const e = this.getPieceOnField(s);
                    e === te.KING ? o = t : e === te.ROOK && n.push(t)
                }
            }
            if (null !== o && n.length) {
                let e = null
                  , s = null;
                return 1 === n.length ? t ? n[0] < o ? e = n[0] : s = n[0] : n[0] > o ? e = n[0] : s = n[0] : (e = Math.max(n[0], n[1]),
                s = Math.min(n[0], n[1])),
                {
                    king: new W(i,o),
                    kingRook: null === e ? null : new W(i,e),
                    queenRook: null === s ? null : new W(i,s)
                }
            }
            return null
        }
        static getModifiedRow(e) {
            const t = e[0].row;
            for (let i = 1; i < e.length; i++)
                if (e[i].row !== t)
                    return null;
            return t
        }
        computeModifiedFields(e, t) {
            const i = [];
            for (let n = 0; n < 8; n++)
                for (let o = 0; o < 8; o++) {
                    const s = te.indexFromRowAndCol(n, o)
                      , r = new W(n,o);
                    this.fieldIsEmpty(r) && e.fieldIsEmpty(r) || this.board[s] === e.board[s] || (void 0 === t || !this.fieldIsEmpty(r) && this.getColorOnField(r) === t || !e.fieldIsEmpty(r) && e.getColorOnField(r) === t) && i.push(new W(n,o))
                }
            return i
        }
        flipped() {
            const e = new te;
            for (let t = 0; t < 8; t++)
                for (let i = 0; i < 8; i++) {
                    const n = new W(t,i)
                      , o = this.getPieceOnField(n)
                      , s = this.getColorOnField(n);
                    e.setField(7 - t, 7 - i, s, o)
                }
            return e
        }
        isStartingPosition() {
            return this.equals(te.getStartingPosition())
        }
        static getStartingPosition() {
            const e = new te;
            e.setField(0, 0, this.ROOK, this.WHITE),
            e.setField(0, 1, this.KNIGHT, this.WHITE),
            e.setField(0, 2, this.BISHOP, this.WHITE),
            e.setField(0, 3, this.QUEEN, this.WHITE),
            e.setField(0, 4, this.KING, this.WHITE),
            e.setField(0, 5, this.BISHOP, this.WHITE),
            e.setField(0, 6, this.KNIGHT, this.WHITE),
            e.setField(0, 7, this.ROOK, this.WHITE),
            e.setField(7, 0, this.ROOK, this.BLACK),
            e.setField(7, 1, this.KNIGHT, this.BLACK),
            e.setField(7, 2, this.BISHOP, this.BLACK),
            e.setField(7, 3, this.QUEEN, this.BLACK),
            e.setField(7, 4, this.KING, this.BLACK),
            e.setField(7, 5, this.BISHOP, this.BLACK),
            e.setField(7, 6, this.KNIGHT, this.BLACK),
            e.setField(7, 7, this.ROOK, this.BLACK);
            for (let t = 0; t < 8; t++)
                e.setField(1, t, this.PAWN, this.WHITE),
                e.setField(6, t, this.PAWN, this.BLACK);
            return e
        }
        makeMove(e) {
            const t = this.clone();
            if (e.movedPiece = this.getPieceOnField(e.fromField),
            e.player = this.getColorOnField(e.fromField),
            this.updateCastleRights(e),
            e.isCastleLong(t) || e.isCastleShort(t))
                this.setField(e.fromField.row, e.fromField.col, e.player, te.EMPTY),
                this.setField(e.toField.row, e.toField.col, e.player, te.EMPTY),
                e.isCastleLong(t) ? (this.setField(e.fromField.row, 2, e.player, te.KING),
                this.setField(e.fromField.row, 3, e.player, te.ROOK)) : (this.setField(e.fromField.row, 6, e.player, te.KING),
                this.setField(e.fromField.row, 5, e.player, te.ROOK));
            else {
                if (e.isPromotion())
                    this.setField(e.toField.row, e.toField.col, e.player, e.promPiece);
                else {
                    this.isEnPassant(e) && this.setField(e.fromField.row, e.toField.col, 0, te.EMPTY);
                    const t = this.getPieceOnField(e.fromField);
                    this.setField(e.toField.row, e.toField.col, e.player, t)
                }
                this.setField(e.fromField.row, e.fromField.col, 0, te.EMPTY)
            }
            this.colorToMove === te.BLACK && ++this.moveCounter,
            this.colorToMove = te.oppositeColor(this.colorToMove),
            this.updateEnPassantField(e),
            e.movedPiece === te.PAWN ? this.halfMovesSinceLastPawnMove = 0 : ++this.halfMovesSinceLastPawnMove
        }
        newPositionFromMove(e) {
            const t = this.clone();
            return t.makeMove(e),
            t
        }
        updateCastleRights(e) {
            (e.isCastleLong(this) || e.isCastleShort(this)) && (e.player === te.WHITE ? (this.castleRights.white = this.removeCastleRight(te.QUEEN_CASTLE, this.castleRights.white),
            this.castleRights.white = this.removeCastleRight(te.KING_CASTLE, this.castleRights.white)) : (this.castleRights.black = this.removeCastleRight(te.QUEEN_CASTLE, this.castleRights.black),
            this.castleRights.black = this.removeCastleRight(te.KING_CASTLE, this.castleRights.black)))
        }
        updateEnPassantField(e) {
            e.movedPiece === te.PAWN && 2 === Math.abs(e.fromField.row - e.toField.row) ? e.player === te.WHITE ? this.enPassantField = new W(e.fromField.row + 1,e.fromField.col) : this.enPassantField = new W(e.fromField.row - 1,e.fromField.col) : this.enPassantField = null
        }
        isEnPassant(e) {
            const t = this.getColorOnField(e.fromField) === te.WHITE ? 1 : -1;
            return this.getPieceOnField(e.fromField) === te.PAWN && 1 === Math.abs(e.fromField.col - e.toField.col) && e.fromField.row + t === e.toField.row && this.fieldIsEmpty(e.toField)
        }
        canPromoteNextMove() {
            for (let e = 0; e < 8; e++) {
                let t = new W(6,e);
                if (this.getColorOnField(t) === te.WHITE && this.getPieceOnField(t) === te.PAWN)
                    return !0;
                if (t = new W(1,e),
                this.getColorOnField(t) === te.BLACK && this.getPieceOnField(t) === te.PAWN)
                    return !0
            }
            return !1
        }
        isCheck() {
            return G(this, te.WHITE) || G(this, te.BLACK)
        }
        isCheckMate() {
            let e;
            if (G(this, te.WHITE) ? e = te.WHITE : G(this, te.BLACK) && (e = te.BLACK),
            void 0 !== e) {
                const t = K(this, e);
                if (Y(this, t, !1).size > 0)
                    return !1;
                {
                    const i = z(t, te.oppositeColor(e), this);
                    return i.length > 1 || !function(e, t) {
                        const i = t.getColorOnField(e)
                          , n = te.oppositeColor(i)
                          , o = z(e, n, t);
                        for (const i of o) {
                            const o = new U(i,e)
                              , s = t.clone();
                            if (s.makeMove(o),
                            !G(s, n))
                                return !0
                        }
                        return !1
                    }(i[0], this) && !this.checkCanBeBlockedFrom(i[0], t)
                }
            }
            return !1
        }
        checkCanBeBlockedFrom(e, t) {
            const i = function(e, t) {
                const i = [];
                let n = 0;
                e.col > t.col ? n = -1 : e.col < t.col && (n = 1);
                let o = 0;
                e.row > t.row ? o = -1 : e.row < t.row && (o = 1);
                let s = 1;
                for (; e.row + s * o !== t.row || e.col + s * n !== t.col; )
                    i.push(new W(e.row + s * o,e.col + s * n)),
                    ++s;
                return i
            }(e, t);
            if (0 === i.length)
                return !1;
            {
                const e = this.getFieldsOfColor(this.getColorOnField(t));
                for (const t of e)
                    if (Z(t, i, this))
                        return !0;
                return !1
            }
        }
        static isNewGame(e, t) {
            if (t) {
                if (e) {
                    if (1 === t.moveCounter) {
                        const i = e.computeMoveTo(t);
                        return (null === i || i.player !== e.colorToMove) && (b("----------------------------------------------------"),
                        b("New game detected"),
                        e.print("Old position"),
                        t.print("New position"),
                        b("----------------------------------------------------"),
                        !0)
                    }
                    return !1
                }
                return b("First site position: starting new game"),
                !0
            }
            return !1
        }
    }
    const ie = {
        "0.5.3.1": '<li><strong><span style="color: red;">Chessconnect is now available as an app for Android and iOS!</strong></span></li><li><strong>Support for the TapNset Chessconnect adapter.</strong></li><li><strong>Much more features available on lichess. E.g. studies, puzzles, analysis,...</strong></li>'
    };
    function ne(e, t, n) {
        return o = this,
        s = void 0,
        a = function*() {
            const o = yield function(e) {
                let t = "";
                if (e.lastChangelogVersion)
                    for (const i in ie)
                        i > e.lastChangelogVersion && (t += ie[i]);
                return Promise.resolve(t)
            }(e);
            if (o.length > 0 && e.currentVersion > e.lastChangelogVersion) {
                const s = document.createElement("div");
                document.body.appendChild(s),
                s.id = "chessconnectDialog",
                s.style.display = "block",
                s.style.position = "fixed",
                s.style.zIndex = "1",
                s.style.left = "0",
                s.style.top = "0",
                s.style.width = "100%",
                s.style.height = "100%",
                s.style.overflow = "auto",
                s.style.backgroundColor = "rgba(0,0,0,0.4)",
                s.innerHTML = '<div style="color:black; background-color: #eceef3; margin: 15% auto; padding: 20px; border: 1px solid #888; width: 50%;">    <span id="closeDialogBtn" style="color: #777; float: right; font-size: 28px; font-weight: bold;">&times;</span>    <h2 style="color: black">' + (yield i("NewInThisVersion")) + "</h2><ul>" + o + "</ul>     </div>",
                document.getElementById("closeDialogBtn").onclick = () => {
                    s.style.display = "none",
                    e.lastChangelogVersion = e.currentVersion,
                    t.postMessage({
                        type: "saveOptions",
                        senderTabId: n,
                        options: e
                    })
                }
            }
        }
        ,
        new ((r = void 0) || (r = Promise))(function(e, t) {
            function i(e) {
                try {
                    c(a.next(e))
                } catch (e) {
                    t(e)
                }
            }
            function n(e) {
                try {
                    c(a.throw(e))
                } catch (e) {
                    t(e)
                }
            }
            function c(t) {
                var o;
                t.done ? e(t.value) : (o = t.value,
                o instanceof r ? o : new r(function(e) {
                    e(o)
                }
                )).then(i, n)
            }
            c((a = a.apply(o, s || [])).next())
        }
        );
        var o, s, r, a
    }
    class oe {
        constructor(e) {
            this.id = e
        }
        isPiece() {
            return 0 !== this.id[0] || 0 !== this.id[1] || 0 !== this.id[2] || 0 !== this.id[3] || 0 !== this.id[4]
        }
        toString() {
            return this.id[0] + ":" + this.id[1] + ":" + this.id[2] + ":" + this.id[3] + ":" + this.id[4]
        }
        toArray() {
            return this.id
        }
        equals(e) {
            return this.toString() === e.toString()
        }
    }
    var se, re, ae, ce;
    (ce = se || (se = {}))[ce.DRAW = 0] = "DRAW",
    ce[ce.WHITE_WINS = 1] = "WHITE_WINS",
    ce[ce.BLACK_WINS = 2] = "BLACK_WINS",
    ce[ce.ABORTED = 3] = "ABORTED",
    (ae = re || (re = {}))[ae.NOT_STARTED = 0] = "NOT_STARTED",
    ae[ae.ONGOING = 1] = "ONGOING",
    ae[ae.FINISHED = 2] = "FINISHED";
    class le {
        equals(e) {
            return !!e && Math.floor(this.whiteMs / 1e3) === Math.floor(e.whiteMs / 1e3) && Math.floor(this.blackMs / 1e3) === Math.floor(e.blackMs / 1e3) && this.whiteStartMs === e.whiteStartMs && this.blackStartMs === e.blackStartMs && this.runningForPlayer === e.runningForPlayer && this.gameResult === e.gameResult && this.algebraic === e.algebraic && this.lifecycle === e.lifecycle
        }
        constructor() {
            this.whiteMs = 0,
            this.blackMs = 0,
            this.whiteStartMs = 0,
            this.blackStartMs = 0,
            this.runningForPlayer = null,
            this.timestamp = Date.now(),
            this.lifecycle = re.NOT_STARTED
        }
        isCountingDown() {
            return this.whiteMs > 0 && this.blackMs > 0
        }
        toString() {
            return this.getWhiteHours() + ":" + this.getWhiteMinutes() + ":" + this.getWhiteSeconds() + " / " + this.getBlackHours() + ":" + this.getBlackMinutes() + ":" + this.getBlackSeconds() + " (" + (this.runningForPlayer ? this.runningForPlayer : "not running") + "), result=" + this.gameResult + " " + this.getWhiteMs() + "/" + this.getBlackMs()
        }
        getWhiteMs() {
            return this.runningForPlayer === te.WHITE ? this.whiteMs - (Date.now() - this.timestamp) : this.whiteMs
        }
        getBlackMs() {
            return this.runningForPlayer === te.BLACK ? this.blackMs - (Date.now() - this.timestamp) : this.blackMs
        }
        getWhiteHours() {
            return Math.floor(this.getWhiteMs() / 36e5)
        }
        getBlackHours() {
            return Math.floor(this.getBlackMs() / 36e5)
        }
        getWhiteMinutes() {
            const e = this.getWhiteMs() - 1e3 * this.getWhiteHours() * 60 * 60;
            return Math.floor(e / 6e4)
        }
        getBlackMinutes() {
            const e = this.getBlackMs() - 1e3 * this.getBlackHours() * 60 * 60;
            return Math.floor(e / 6e4)
        }
        getWhiteSeconds() {
            const e = this.getWhiteMs() - 1e3 * this.getWhiteHours() * 60 * 60 - 1e3 * this.getWhiteMinutes() * 60;
            return Math.min(Math.round(e / 1e3), 59)
        }
        getBlackSeconds() {
            const e = this.getBlackMs() - 1e3 * this.getBlackHours() * 60 * 60 - 1e3 * this.getBlackMinutes() * 60;
            return Math.min(Math.round(e / 1e3), 59)
        }
        getHours(e) {
            return e === te.WHITE ? this.getWhiteHours() : this.getBlackHours()
        }
        getMinutes(e) {
            return e === te.WHITE ? this.getWhiteMinutes() : this.getBlackMinutes()
        }
        getSeconds(e) {
            return e === te.WHITE ? this.getWhiteSeconds() : this.getBlackSeconds()
        }
        isGameOver() {
            return null !== this.gameResult && void 0 !== this.gameResult
        }
        gameResultAsString() {
            switch (this.gameResult) {
            case se.ABORTED:
                return "aborted";
            case se.BLACK_WINS:
                return "BlackWins";
            case se.WHITE_WINS:
                return "WhiteWins";
            case se.DRAW:
                return "draw";
            default:
                return ""
            }
        }
        gameResultAsLocale(e) {
            return i(this.gameResultAsString(), e)
        }
        hasTimeLeft() {
            return this.whiteMs > 0 && this.blackMs > 0
        }
        static colorOnLeftSide(e, t) {
            switch (e.clockPosition) {
            case A.WHITE_LEFT:
                return te.WHITE;
            case A.WHITE_RIGHT:
                return te.BLACK;
            case A.PLAYER_LEFT:
                return t;
            case A.PLAYER_RIGHT:
                return te.oppositeColor(t);
            default:
                return te.WHITE
            }
        }
    }
    var de, he, ue = function(e, t, i, n) {
        return new (i || (i = Promise))(function(o, s) {
            function r(e) {
                try {
                    c(n.next(e))
                } catch (e) {
                    s(e)
                }
            }
            function a(e) {
                try {
                    c(n.throw(e))
                } catch (e) {
                    s(e)
                }
            }
            function c(e) {
                var t;
                e.done ? o(e.value) : (t = e.value,
                t instanceof i ? t : new i(function(e) {
                    e(t)
                }
                )).then(r, a)
            }
            c((n = n.apply(e, t || [])).next())
        }
        )
    };
    (he = de || (de = {}))[he.NORMAL_CHESS = 0] = "NORMAL_CHESS",
    he[he.CHESS960 = 1] = "CHESS960";
    class ve {
        getPlayersColor() {
            return ue(this, void 0, void 0, function*() {
                return (yield this.isWhite()) ? te.WHITE : te.BLACK
            })
        }
        constructor(e) {
            this.lastKnownPosition = null,
            this.lastKnownClockState = null,
            this.siteManager = e
        }
        sendPositionToSmartboard(e, t) {
            return ue(this, void 0, void 0, function*() {
                var i, n;
                this.lastKnownPosition || b("Player color is " + ((yield this.getPlayersColor()) === te.WHITE ? "white" : "black")),
                this.lastKnownPosition = e,
                this.lastKnownClockState = t,
                (null === (n = null === (i = this.siteManager) || void 0 === i ? void 0 : i.connectionManager) || void 0 === n ? void 0 : n.currentBoard) && (yield this.siteManager.connectionManager.currentBoard.setSitePosition(e, t))
            })
        }
        getCurrentPosition() {
            return this.lastKnownPosition
        }
        getCurrentClockState() {
            return this.lastKnownClockState
        }
        clearLEDs() {
            return ue(this, void 0, void 0, function*() {
                var e, t, i;
                (null === (t = null === (e = this.siteManager) || void 0 === e ? void 0 : e.connectionManager) || void 0 === t ? void 0 : t.currentBoard) && (yield null === (i = this.siteManager) || void 0 === i ? void 0 : i.connectionManager.currentBoard.clearLEDs())
            })
        }
        sayMove(e, t) {
            return ue(this, void 0, void 0, function*() {
                const i = yield this.siteManager.getOptions()
                  , n = yield e.moveAsSpeech(t);
                return i.moveSound === D.SPEECH && this.siteManager.say(n.speech),
                n.algebraic
            })
        }
        shutdown() {}
    }
    class ge {
        static createPositionFromFen(e) {
            const t = new te
              , i = e.split(" ");
            let n = 7
              , o = 0;
            for (let i = 0; i < e.length && n >= 0; i++) {
                const s = e[i];
                if (s.match("[0-8]"))
                    o += Number(s);
                else if (s.toLowerCase().match("[prnbqk]")) {
                    const e = s === s.toLowerCase() ? te.BLACK : te.WHITE
                      , i = te.pieceFromString(s);
                    t.setField(n, o, e, i),
                    ++o
                } else
                    "/" !== s && " " !== s || (--n,
                    o = 0)
            }
            if (i.length > 1 && (i[1].includes("b") ? t.colorToMove = te.BLACK : t.colorToMove = te.WHITE),
            i.length > 2) {
                const e = i[2];
                t.castleRights.black = t.castleRights.white = 0,
                (e.includes("k") || e.includes(ge.kingsideRookFile(t, te.BLACK))) && (t.castleRights.black += te.KING_CASTLE),
                (e.includes("q") || e.includes(ge.queensideRookFile(t, te.BLACK))) && (t.castleRights.black += te.QUEEN_CASTLE),
                (e.includes("K") || e.includes(ge.kingsideRookFile(t, te.WHITE))) && (t.castleRights.white += te.KING_CASTLE),
                (e.includes("Q") || e.includes(ge.queensideRookFile(t, te.WHITE))) && (t.castleRights.white += te.QUEEN_CASTLE)
            }
            if (i.length > 3 && !i[3].includes("-") && (t.enPassantField = W.fromString(i[3])),
            i.length > 4)
                try {
                    t.halfMovesSinceLastPawnMove = Number.parseInt(i[4])
                } catch (e) {
                    b("Error parsing FEN: " + e)
                }
            if (i.length > 5)
                try {
                    t.moveCounter = Number.parseInt(i[5])
                } catch (e) {
                    b("Error parsing FEN: " + e)
                }
            return t
        }
        static createFenFromPosition(e, t, i) {
            i = null != i ? i : 6,
            t = null != t ? t : de.NORMAL_CHESS;
            let n = "";
            for (let t = 7; t >= 0; t--) {
                let i = 0;
                for (let o = 0; o < 8; o++) {
                    const s = new W(t,o);
                    e.fieldIsEmpty(s) ? ++i : (i > 0 && (n += i,
                    i = 0),
                    n += e.fieldAsCharacter(t, o))
                }
                i > 0 && (n += i),
                t > 0 && (n += "/")
            }
            if (i >= 2 && (n += " " + (e.colorToMove === te.BLACK ? "b" : "w")),
            i >= 3) {
                let i = "";
                e.castleRights.white & te.KING_CASTLE && (i += t === de.NORMAL_CHESS ? "K" : ge.kingsideRookFile(e, te.WHITE)),
                e.castleRights.white & te.QUEEN_CASTLE && (i += t === de.NORMAL_CHESS ? "Q" : ge.queensideRookFile(e, te.WHITE)),
                e.castleRights.black & te.KING_CASTLE && (i += t === de.NORMAL_CHESS ? "k" : ge.kingsideRookFile(e, te.BLACK)),
                e.castleRights.black & te.QUEEN_CASTLE && (i += t === de.NORMAL_CHESS ? "q" : ge.queensideRookFile(e, te.BLACK)),
                i.length ? n += " " + i : n += " -"
            }
            return i >= 4 && (e.enPassantField ? n += " " + e.enPassantField.asString().toLowerCase() : n += " -"),
            i >= 5 && (n += " " + e.halfMovesSinceLastPawnMove),
            i >= 6 && (n += " " + e.moveCounter),
            n
        }
        static kingsideRookFile(e, t) {
            const i = e.findKingAndRooksForCastle(t);
            if (null == i ? void 0 : i.kingRook) {
                const e = "abcdefgh".charAt(i.kingRook.col);
                return t === te.WHITE ? e.toUpperCase() : e
            }
            return ""
        }
        static queensideRookFile(e, t) {
            const i = e.findKingAndRooksForCastle(t);
            if (null == i ? void 0 : i.queenRook) {
                const e = "abcdefgh".charAt(i.queenRook.col);
                return t === te.WHITE ? e.toUpperCase() : e
            }
            return ""
        }
        static isChess960(e) {
            const t = ge.createPositionFromFen(e);
            return !!(t.castleRights.white & ee.KING_CASTLE && (t.getPieceOnField(W.fromString("e1")) !== ee.KING || t.getColorOnField(W.fromString("e1")) !== ee.WHITE || t.getPieceOnField(W.fromString("h1")) !== ee.ROOK || t.getColorOnField(W.fromString("h1")) !== ee.WHITE) || t.castleRights.white & ee.QUEEN_CASTLE && (t.getPieceOnField(W.fromString("e1")) !== ee.KING || t.getColorOnField(W.fromString("e1")) !== ee.WHITE || t.getPieceOnField(W.fromString("a1")) !== ee.ROOK || t.getColorOnField(W.fromString("a1")) !== ee.WHITE) || t.castleRights.black & ee.KING_CASTLE && (t.getPieceOnField(W.fromString("e8")) !== ee.KING || t.getColorOnField(W.fromString("e8")) !== ee.BLACK || t.getPieceOnField(W.fromString("h8")) !== ee.ROOK || t.getColorOnField(W.fromString("h8")) !== ee.BLACK) || t.castleRights.black & ee.QUEEN_CASTLE && (t.getPieceOnField(W.fromString("e8")) !== ee.KING || t.getColorOnField(W.fromString("e8")) !== ee.BLACK || t.getPieceOnField(W.fromString("a8")) !== ee.ROOK || t.getColorOnField(W.fromString("a8")) !== ee.BLACK))
        }
    }
    var fe, pe = function(e, t, i, n) {
        return new (i || (i = Promise))(function(o, s) {
            function r(e) {
                try {
                    c(n.next(e))
                } catch (e) {
                    s(e)
                }
            }
            function a(e) {
                try {
                    c(n.throw(e))
                } catch (e) {
                    s(e)
                }
            }
            function c(e) {
                var t;
                e.done ? o(e.value) : (t = e.value,
                t instanceof i ? t : new i(function(e) {
                    e(t)
                }
                )).then(r, a)
            }
            c((n = n.apply(e, t || [])).next())
        }
        )
    };
    !function(e) {
        e[e.NORMAL = 0] = "NORMAL",
        e[e.FLIPPED = 1] = "FLIPPED"
    }(fe || (fe = {}));
    let me = 0;
    class ye {
        constructor(e) {
            this.onlyShowLedsForOpponentPieces = !1,
            this.boardOrientation = fe.NORMAL,
            this.clock = null,
            this.lastClockState = null,
            this.lastWrongPieceWarning = 0,
            this.onBatteryChanged = () => {}
            ,
            this.siteManager = e,
            this._instanceCounter = ++me
        }
        get lastLedState() {
            return this._lastLedState
        }
        set lastLedState(e) {
            this._lastLedState = e
        }
        get instanceCounter() {
            return this._instanceCounter
        }
        setSitePosition(e, t) {
            return pe(this, void 0, void 0, function*() {
                return yield this.setClockState(t),
                !(this.sitePosition && this.sitePosition.equals(e) || (this.sitePosition = e,
                this.cancelMisplacedPieceWarning(),
                this.sitePosition.print("new site position for board " + ge.createFenFromPosition(e, de.NORMAL_CHESS)),
                this.lastPositionReceived && (e.equals(this.lastPositionReceived) && (this.lastMatchingPosition = e),
                yield this.lightLEDs(this.applyBoardOrientation(this.lastPositionReceived, this.sitePosition), this.sitePosition)),
                0))
            })
        }
        getSitePosition() {
            return this.sitePosition
        }
        setClockState(e) {
            return pe(this, void 0, void 0, function*() {
                var t, i;
                const n = yield this.siteManager.getOptions()
                  , o = (yield this.siteManager.isWhiteLeftOnClock()) ? te.WHITE : te.BLACK;
                this.siteManager.checkForTapnsetAdapter(this, n),
                this.siteManager.checkForDgt3000Gateway(this, n),
                n.clockType === k.NO_CLOCK || e.equals(this.lastClockState) ? null !== e.runningForPlayer && (yield null === (i = this.getClock()) || void 0 === i ? void 0 : i.setRunningForPlayer(e.runningForPlayer, o)) : (yield null === (t = this.getClock()) || void 0 === t ? void 0 : t.update(e, o, n),
                this.lastClockState = e)
            })
        }
        getLastClockState() {
            return this.lastClockState
        }
        disconnect() {
            return pe(this, void 0, void 0, function*() {
                var e;
                yield null === (e = this.clock) || void 0 === e ? void 0 : e.disconnect()
            })
        }
        reset() {
            return pe(this, void 0, void 0, function*() {
                var e;
                this.lastPositionReceived = null,
                this.lastLedState = null,
                yield null === (e = this.getClock()) || void 0 === e ? void 0 : e.reset()
            })
        }
        needsToCopyChesscomPosition() {
            return null !== this.sitePosition
        }
        getCurrentPosition() {
            return this.lastPositionReceived
        }
        getPlayerColor() {
            return pe(this, void 0, void 0, function*() {
                return (yield this.siteManager.siteBoard.isWhite()) ? te.WHITE : te.BLACK
            })
        }
        getPlayerToMove() {
            const e = this.getCurrentPosition();
            return e ? e.colorToMove : te.WHITE
        }
        onBoardChanged(e) {
            return pe(this, void 0, void 0, function*() {
                var t;
                this.lastPositionReceived = e,
                clearTimeout(this.pendingMoveTimeout);
                const i = yield this.siteManager.getOptions();
                if (this.sitePosition) {
                    (e = this.applyBoardOrientation(e, this.sitePosition)).print("onBoardChanged " + this._instanceCounter),
                    this.sitePosition.printModifiedFields("modified fields", e),
                    yield this.lightLEDs(this.sitePosition, e),
                    this.hasLEDs() || (yield this.sayWrongPieces(this.sitePosition, e)),
                    this.sitePosition.equals(e) && (yield null === (t = this.getClock()) || void 0 === t ? void 0 : t.clearTextDisplay(),
                    i.playSoundWhenBoardsMatch && this.siteManager.playSound(R.POSITIONS_MATCH),
                    this.lastMatchingPosition = e,
                    this.cancelMisplacedPieceWarning());
                    const n = this.sitePosition.computeMoveTo(e)
                      , o = yield this.getPlayerColor()
                      , s = null !== n && (yield this.siteManager.isLegalMove(this.sitePosition, e, n))
                      , r = this.siteManager.siteBoard.isAnalysisBoard;
                    b("results in move: " + (null == n ? void 0 : n.asString()) + ", move.player=" + (null == n ? void 0 : n.player) + ", player=" + o + ", isLegalMove=" + s + ", isAnalysisBoard=" + r),
                    n && (n.player === o || r) && s ? (this.cancelMisplacedPieceWarning(),
                    i.transmitMovesOnClockPress && this.getClock() ? this.getClock().setPendingMove(n) : i.latency > 0 ? (clearTimeout(this.pendingMoveTimeout),
                    this.pendingMoveTimeout = setTimeout( () => {
                        b("transmitting delayed move " + n.asString()),
                        this.siteManager.siteBoard.makeMove(n).then( () => {
                            this.queryBattery()
                        }
                        )
                    }
                    , i.latency)) : (b("transmitting move " + n.asString()),
                    yield this.siteManager.siteBoard.makeMove(n),
                    yield this.queryBattery())) : this.hasLEDs() || this.armMisplacedPieceWarning(e)
                } else
                    e.print("onBoardChanged (but no site position) " + this._instanceCounter)
            })
        }
        cancelMisplacedPieceWarning() {
            this.misplacedPieceWarningTimeout && (clearTimeout(this.misplacedPieceWarningTimeout),
            this.misplacedPieceWarningTimeout = null)
        }
        armMisplacedPieceWarning(e) {
            return pe(this, void 0, void 0, function*() {
                var t, i;
                if (!this.misplacedPieceWarningTimeout) {
                    const n = yield this.getPlayerColor()
                      , o = te.oppositeColor(n)
                      , s = null === (t = this.sitePosition) || void 0 === t ? void 0 : t.findPieceOnNewField(o, e);
                    s && (null === (i = this.sitePosition) || void 0 === i ? void 0 : i.equalsForColor(e, n)) && (this.misplacedPieceWarningTimeout = setTimeout( () => {
                        this.announceMisplacedPiece(e, s)
                    }
                    , 3e3))
                }
            })
        }
        announceMisplacedPiece(e, t) {
            return pe(this, void 0, void 0, function*() {
                const n = e.getPieceOnField(t);
                this.siteManager.say(yield i("MISPLACED_WARNING", [yield te.pieceAsSpeech(n), t.asSpeech()]))
            })
        }
        applyBoardOrientation(e, t) {
            return this.checkBoardOrientation(e, t),
            this.boardOrientation === fe.FLIPPED ? e.flipped() : e
        }
        checkBoardOrientation(e, t) {
            e.equals(t) && !e.equals(t.flipped()) ? (b("Board orientation is normal"),
            this.boardOrientation = fe.NORMAL) : !e.equals(t) && e.equals(t.flipped()) ? (b("Board orientation is flipped"),
            this.boardOrientation = fe.FLIPPED) : b("Board orientation remains " + (this.boardOrientation === fe.NORMAL ? "normal" : "flipped"))
        }
        lightLEDs(e, t) {
            return pe(this, void 0, void 0, function*() {
                this.boardOrientation === fe.FLIPPED && (e = e.flipped(),
                t = t.flipped());
                const i = new we;
                i.init();
                const n = this.onlyShowLedsForOpponentPieces ? te.oppositeColor(yield this.getPlayerColor()) : void 0
                  , o = e.computeModifiedFields(t, n);
                for (let e = 0; e < o.length; e++) {
                    const t = o[e];
                    i.ledOn(t.row, t.col)
                }
                b(`${i.countLedsLit()} LEDs need to be lit`),
                this.lastLedState && this.lastLedState.equals(i) ? b("LEDs do not need to be changed") : (b("Lighting " + i.countLedsLit() + " LEDs"),
                yield this.sendLedStateToBoard(i),
                this.lastLedState = i)
            })
        }
        sayWrongPieces(e, t) {
            return pe(this, void 0, void 0, function*() {
                var i;
                if ((null === (i = this.lastClockState) || void 0 === i ? void 0 : i.lifecycle) === re.ONGOING && Date.now() - this.lastWrongPieceWarning > 5e3) {
                    const i = yield this.getPlayerColor()
                      , n = te.oppositeColor(i);
                    if (e.getFieldsOfColor(i).length === t.getFieldsOfColor(i).length && e.findPieceOnNewField(i, t)) {
                        const i = e.findPieceOnNewField(n, t);
                        i && (this.announceMisplacedPiece(e, i),
                        this.lastWrongPieceWarning = Date.now())
                    }
                }
            })
        }
        clearLEDs() {
            return pe(this, void 0, void 0, function*() {
                yield this.sendLedStateToBoard(new we)
            })
        }
        getClock() {
            return this.clock
        }
        setClock(e) {
            this.clock = e
        }
        hasLEDs() {
            return !0
        }
        isConnected() {
            var e, t;
            return null !== (t = null === (e = this.siteManager.connectionManager) || void 0 === e ? void 0 : e.isConnected()) && void 0 !== t && t
        }
        supportsSoundEvent(e) {
            return Promise.resolve(!1)
        }
        playSound(e) {
            return Promise.resolve()
        }
        initializeBoard(e) {
            return Promise.resolve()
        }
    }
    class we {
        constructor() {
            this.leds = new Array(64)
        }
        init() {
            this.leds.fill(!1)
        }
        equals(e) {
            if (!(e && e instanceof we))
                return !1;
            for (let t = 0; t < this.leds.length; t++)
                if (this.leds[t] !== e.leds[t])
                    return !1;
            return !0
        }
        ledOn(e, t) {
            this.leds[8 * e + t] = !0
        }
        isLedOn(e, t) {
            return this.leds[8 * e + t]
        }
        isAllLedsOff() {
            return 0 === this.countLedsLit()
        }
        countLedsLit() {
            let e = 0;
            for (const t of this.leds)
                t && ++e;
            return e
        }
        getLitFields() {
            const e = [];
            for (let t = 0; t < 8; t++)
                for (let i = 0; i < 8; i++)
                    this.isLedOn(t, i) && e.push(new W(t,i));
            return e
        }
        getDebugString() {
            let e = "";
            for (let t = 7; t >= 0; t--) {
                for (let i = 0; i < 8; i++)
                    e += this.isLedOn(t, i) ? "X" : ".";
                e += "\n"
            }
            return e
        }
        applyBoardOrientation(e) {
            e === fe.FLIPPED && this.assign(this.flipped())
        }
        flipped() {
            const e = new we;
            for (let t = 0; t < 8; t++)
                for (let i = 0; i < 8; i++)
                    this.isLedOn(t, i) && e.ledOn(7 - t, 7 - i);
            return e
        }
        assign(e) {
            this.leds = [...e.leds]
        }
    }
    var Se = function(e, t, i, n) {
        return new (i || (i = Promise))(function(o, s) {
            function r(e) {
                try {
                    c(n.next(e))
                } catch (e) {
                    s(e)
                }
            }
            function a(e) {
                try {
                    c(n.throw(e))
                } catch (e) {
                    s(e)
                }
            }
            function c(e) {
                var t;
                e.done ? o(e.value) : (t = e.value,
                t instanceof i ? t : new i(function(e) {
                    e(t)
                }
                )).then(r, a)
            }
            c((n = n.apply(e, t || [])).next())
        }
        )
    };
    const Ce = W.fromString("a1")
      , Pe = W.fromString("c1")
      , Me = W.fromString("d1")
      , Te = W.fromString("e1")
      , be = W.fromString("f1")
      , Be = W.fromString("g1")
      , Ee = W.fromString("h1")
      , Ie = W.fromString("a8")
      , Fe = W.fromString("c8")
      , Le = W.fromString("d8")
      , Oe = W.fromString("e8")
      , ke = W.fromString("f8")
      , Ae = W.fromString("g8")
      , De = W.fromString("h8");
    let Re = null
      , Ne = null;
    class He {
        constructor(e) {
            if (this.data = new Uint8Array(8),
            e)
                for (let t = 0; t < 8; t++)
                    this.data[t] = Number.parseInt(e[t])
        }
        static createFromPosition(e) {
            const t = new He;
            for (let i = 0; i < 8; i++)
                for (let n = 0; n < 8; n++) {
                    const o = new W(i,n);
                    e.fieldIsEmpty(o) || t.setPieceOnField(o)
                }
            return t
        }
        equals(e) {
            if (e) {
                for (let t = 0; t < 8; t++)
                    if (this.data[t] !== e.data[t])
                        return !1;
                return !0
            }
            return !1
        }
        isStartingPosition() {
            for (let e = 0; e < 8; e++)
                if (0 === e || 1 === e || 6 === e || 7 === e) {
                    if (255 !== this.data[e])
                        return !1
                } else if (0 !== this.data[e])
                    return !1;
            return !0
        }
        extrapolateFrom(e, t, i, n, o) {
            return Se(this, void 0, void 0, function*() {
                let s;
                return t.sort( (e, t) => e.row === t.row && e.col === t.col ? 0 : e.row < t.row || e.row === t.row && e.col < t.col ? -1 : 1),
                s = i === de.CHESS960 ? this.computeCastleMoveChess960(e, t) : this.computeCastleMoveNormalChess(e, t),
                s || (s = this.computeEnPassentMove(e, t),
                s || (s = yield this.computeNormalMove(e, t, n, o),
                s || this.computeDifference(e)))
            })
        }
        computeDifference(e) {
            const t = e.clone();
            for (let i = 0; i < 8; i++)
                for (let n = 0; n < 8; n++) {
                    const o = new W(i,n)
                      , s = e.fieldIsEmpty(o)
                      , r = this.fieldIsEmpty(o);
                    r && !s ? t.setField(i, n, te.EMPTY, te.EMPTY) : !r && s && t.setField(i, n, te.WHITE, te.OTHER)
                }
            return t
        }
        computeChangedFieldsFrom(e) {
            const t = [];
            for (let i = 0; i < 8; i++)
                for (let n = 0; n < 8; n++) {
                    const o = new W(i,n);
                    e.fieldIsEmpty(o) !== this.fieldIsEmpty(o) && t.push(o)
                }
            return t
        }
        fieldIsEmpty(e) {
            return !(this.data[7 - e.row] & 1 << 7 - e.col)
        }
        setPieceOnField(e) {
            const t = 1 << 7 - e.col;
            this.data[7 - e.row] |= t
        }
        computeCastleMoveChess960(e, t) {
            if (2 === t.length && this.fieldIsEmpty(t[0]) && this.fieldIsEmpty(t[1]) && t[0].row === t[1].row && e.getColorOnField(t[0]) === e.getColorOnField(t[1])) {
                const i = e.getPieceOnField(t[0])
                  , n = e.getPieceOnField(t[1]);
                if (i === te.KING && n === te.ROOK || i === te.ROOK && n === te.KING) {
                    const n = i === te.KING ? t[0] : t[1]
                      , o = i === te.ROOK ? t[0] : t[1]
                      , s = e.getColorOnField(n)
                      , r = e.clone();
                    return r.setField(n.row, n.col, s, te.EMPTY),
                    r.setField(o.row, o.col, s, te.EMPTY),
                    n.col < o.col ? (r.setField(n.row, 6, s, te.KING),
                    r.setField(n.row, 5, s, te.ROOK)) : (r.setField(n.row, 2, s, te.KING),
                    r.setField(n.row, 3, s, te.ROOK)),
                    r
                }
            }
            return null
        }
        computeCastleMoveNormalChess(e, t) {
            if (4 !== t.length)
                return null;
            const i = e.clone();
            if (t[0].equals(Ce) && t[1].equals(Pe) && t[2].equals(Me) && t[3].equals(Te))
                i.setField(Ce.row, Ce.col, te.WHITE, te.EMPTY),
                i.setField(Pe.row, Pe.col, te.WHITE, te.KING),
                i.setField(Me.row, Me.col, te.WHITE, te.ROOK),
                i.setField(Te.row, Te.col, te.WHITE, te.EMPTY);
            else if (t[0].equals(Te) && t[1].equals(be) && t[2].equals(Be) && t[3].equals(Ee))
                i.setField(Te.row, Te.col, te.WHITE, te.EMPTY),
                i.setField(be.row, be.col, te.WHITE, te.ROOK),
                i.setField(Be.row, Be.col, te.WHITE, te.KING),
                i.setField(Ee.row, Ee.col, te.WHITE, te.EMPTY);
            else if (t[0].equals(Ie) && t[1].equals(Fe) && t[2].equals(Le) && t[3].equals(Oe))
                i.setField(Ie.row, Ie.col, te.BLACK, te.EMPTY),
                i.setField(Fe.row, Fe.col, te.BLACK, te.KING),
                i.setField(Le.row, Le.col, te.BLACK, te.ROOK),
                i.setField(Oe.row, Oe.col, te.BLACK, te.EMPTY);
            else {
                if (!(t[0].equals(Oe) && t[1].equals(ke) && t[2].equals(Ae) && t[3].equals(De)))
                    return null;
                i.setField(Oe.row, Oe.col, te.BLACK, te.EMPTY),
                i.setField(ke.row, ke.col, te.BLACK, te.ROOK),
                i.setField(Ae.row, Ae.col, te.BLACK, te.KING),
                i.setField(De.row, De.col, te.BLACK, te.EMPTY)
            }
            return i
        }
        computeNormalMove(e, t, i, n) {
            return Se(this, void 0, void 0, function*() {
                let o;
                if (3 === t.length && t.find(e => 0 === e.row || 7 === e.row) && t.find(e => 1 === e.row || 6 === e.row) && (o = t.find(e => 0 === e.row || 7 === e.row),
                t = t.filter(e => e !== o)),
                2 !== t.length)
                    return null;
                const s = e.clone()
                  , r = this.fieldIsEmpty(t[0]) ? t[0] : t[1]
                  , a = this.fieldIsEmpty(t[0]) ? t[1] : t[0];
                return this.fieldIsEmpty(r) && this.fieldIsEmpty(a) ? null : (s.setField(a.row, a.col, e.getColorOnField(r), e.getPieceOnField(r)),
                s.setField(r.row, r.col, te.EMPTY, te.EMPTY),
                this.computePromotionMove(e, s, r, a, o, i, n))
            })
        }
        computeEnPassentMove(e, t) {
            if (3 !== t.length)
                return null;
            const i = e.clone();
            let n, o, s;
            for (let e = 0; e < 3; e++)
                this.fieldIsEmpty(t[e]) || (n = t[e]);
            if (!n)
                return null;
            for (let e = 0; e < 3; e++) {
                const i = t[e];
                n.row !== i.row && n.col !== i.col && (o = i)
            }
            if (!o)
                return null;
            for (let e = 0; e < 3; e++) {
                const i = t[e];
                i.equals(n) || i.equals(o) || (s = i)
            }
            const r = e.getColorOnField(o) === te.WHITE ? 1 : -1;
            return (null == s ? void 0 : s.col) !== n.col || 1 !== Math.abs(o.col - n.col) || o.row + r !== n.row ? null : (i.setField(n.row, n.col, e.getColorOnField(o), e.getPieceOnField(o)),
            i.setField(o.row, o.col, te.EMPTY, te.EMPTY),
            s && i.setField(s.row, s.col, te.EMPTY, te.EMPTY),
            i)
        }
        computePromotionMove(e, t, i, n, o, s, r) {
            return Se(this, void 0, void 0, function*() {
                if (Re && Re.equals(t))
                    return Ne;
                if (!e.canPromoteNextMove())
                    return t;
                if (e.getPieceOnField(i) !== te.PAWN)
                    return t;
                const a = e.getColorOnField(i);
                if (a === te.WHITE && 6 !== i.row || a === te.BLACK && 1 !== i.row)
                    return t;
                let c, l;
                return a === te.WHITE && 7 === n.row || a === te.BLACK && 0 === n.row ? (c = yield this.askPromotionPiece(s, r),
                l = n) : (c = te.getStartingPosition().getPieceOnField(new W(0,n.col)),
                t.setField(n.row, n.col, a, te.EMPTY),
                o ? (t.setField(o.row, o.col, te.BLACK, te.EMPTY),
                l = o) : l = new W(a === te.WHITE ? 7 : 0,i.col)),
                Re = t.clone(),
                t.setField(l.row, l.col, a, c),
                Ne = t.clone(),
                t
            })
        }
        matches(e) {
            for (let t = 0; t < 8; t++)
                for (let i = 0; i < 8; i++) {
                    const n = new W(t,i);
                    if (this.fieldIsEmpty(n) !== e.fieldIsEmpty(n))
                        return !1
                }
            return !0
        }
        askPromotionPiece(e, t) {
            return Se(this, void 0, void 0, function*() {
                const n = yield i("ChoosePromotion");
                t(n);
                const o = yield i("queen")
                  , s = yield i("knight")
                  , r = yield i("rook")
                  , l = yield i("bishop")
                  , d = yield function(e, t, i) {
                    return a(this, void 0, void 0, function*() {
                        if (c)
                            return Promise.resolve("");
                        {
                            c = !0,
                            yield h(t + "/optionsdialog.html"),
                            document.getElementById("optionsDialogMessage").textContent = e;
                            const n = document.getElementById("dialog-backdrop")
                              , o = document.getElementById("yesNoDialog")
                              , s = document.getElementById("buttonContainer");
                            return new Promise(e => {
                                i.forEach(t => {
                                    const i = document.createElement("button");
                                    i.textContent = t,
                                    i.classList.add("btn"),
                                    i.classList.add("btn-yes"),
                                    i.onclick = () => {
                                        o.remove(),
                                        n.remove(),
                                        c = !1,
                                        e(t)
                                    }
                                    ,
                                    s.appendChild(i)
                                }
                                )
                            }
                            )
                        }
                    })
                }(n, e.resUrl, [o, s, r, l]);
                switch (d) {
                case o:
                    return te.QUEEN;
                case s:
                    return te.KNIGHT;
                case r:
                    return te.ROOK;
                case l:
                    return te.BISHOP;
                default:
                    return te.QUEEN
                }
            })
        }
        and(e) {
            const t = new te;
            for (let i = 0; i < 8; i++)
                for (let n = 0; n < 8; n++) {
                    const o = new W(i,n);
                    this.fieldIsEmpty(o) || e.fieldIsEmpty(o) || t.setField(i, n, e.getColorOnField(o), e.getPieceOnField(o))
                }
            return t
        }
    }
    var xe = function(e, t, i, n) {
        return new (i || (i = Promise))(function(o, s) {
            function r(e) {
                try {
                    c(n.next(e))
                } catch (e) {
                    s(e)
                }
            }
            function a(e) {
                try {
                    c(n.throw(e))
                } catch (e) {
                    s(e)
                }
            }
            function c(e) {
                var t;
                e.done ? o(e.value) : (t = e.value,
                t instanceof i ? t : new i(function(e) {
                    e(t)
                }
                )).then(r, a)
            }
            c((n = n.apply(e, t || [])).next())
        }
        )
    };
    class We extends ye {
        constructor() {
            super(...arguments),
            this.magnetChangedFields = [],
            this.lastBinaryPosition = null
        }
        setSitePosition(e, t) {
            const i = Object.create(null, {
                setSitePosition: {
                    get: () => super.setSitePosition
                }
            });
            return xe(this, void 0, void 0, function*() {
                var n, o;
                const s = yield this.siteManager.siteBoard.getPlayersColor()
                  , r = null === (n = this.getSitePosition()) || void 0 === n ? void 0 : n.computeMoveTo(e);
                let a = null;
                if ((!this.getSitePosition() || !(null === (o = this.getSitePosition()) || void 0 === o ? void 0 : o.equals(e))) && (this.magnetChangedFields.length = 0,
                this.lastBinaryPosition))
                    if (this.lastBinaryPosition.matches(e) && (null == r ? void 0 : r.player) === s)
                        this.lastPositionReceived = e,
                        this.lastBinaryPosition = null;
                    else if (this.getSitePosition() && We.wasCastleMove(this.getSitePosition(), e))
                        if ((null == r ? void 0 : r.player) === s) {
                            const t = this.lastBinaryPosition.and(e);
                            yield this.onBoardChanged(t)
                        } else
                            a = new we,
                            a.ledOn(r.fromField.row, r.fromField.col),
                            a.ledOn(r.toField.row, r.toField.col),
                            a.applyBoardOrientation(this.boardOrientation);
                    else
                        this.lastBinaryPosition = null;
                const c = yield i.setSitePosition.call(this, e, t);
                return a && (yield this.sendLedStateToBoard(a)),
                c
            })
        }
        static wasCastleMove(e, t) {
            var i, n;
            return null !== (n = null === (i = e.computeMoveTo(t)) || void 0 === i ? void 0 : i.isCastle(e)) && void 0 !== n && n
        }
        getBoardFromBinaryPosition(e) {
            return xe(this, void 0, void 0, function*() {
                var t, i;
                if (null === (t = this.lastBinaryPosition) || void 0 === t ? void 0 : t.equals(e))
                    return null;
                this.lastBinaryPosition = e;
                const n = null !== (i = this.lastMatchingPosition) && void 0 !== i ? i : this.sitePosition;
                return this.sitePosition && e.matches(this.sitePosition) ? (this.magnetChangedFields.length = 0,
                this.sitePosition) : n ? (this.addToChangedFields(e.computeChangedFieldsFrom(n)),
                e.extrapolateFrom(n, this.magnetChangedFields, yield this.siteManager.siteBoard.getGameFormat(), yield this.siteManager.getOptions(), e => {
                    this.siteManager.say(e)
                }
                )) : null
            })
        }
        addToChangedFields(e) {
            for (const t of e)
                t && !this.magnetChangedFields.find(e => e.equals(t)) && this.magnetChangedFields.push(t)
        }
    }
    class Ue {
        constructor(e, t, i) {
            this.red = e,
            this.green = t,
            this.blue = i
        }
        minus(e) {
            return new Ue(this.red - e.red,this.green - e.green,this.blue - e.blue)
        }
        plus(e) {
            return new Ue(this.red + e.red,this.green + e.green,this.blue + e.blue)
        }
        times(e) {
            return new Ue(this.red * e,this.green * e,this.blue * e)
        }
        dividedBy(e) {
            return new Ue(this.red / e,this.green / e,this.blue / e)
        }
        equals(e) {
            return this.red === e.red && this.green === e.green && this.blue === e.blue
        }
        static fromHtmlHexString(e) {
            e = e.replace(/^#/, "");
            const t = parseInt(e, 16);
            return new Ue(t >> 16 & 255,t >> 8 & 255,255 & t)
        }
    }
    class _e {
        constructor(e, t) {
            this.row = 0,
            this.col = 0,
            this.row = e,
            this.col = t
        }
        equals(e) {
            return this.row === e.row && this.col === e.col
        }
        advance(e) {
            return new _e(this.row + e.yIncrement,this.col + e.xIncrement)
        }
    }
    class Ge {
        constructor(e) {
            this.isShowingMove = !1,
            this.ledsPerRow = e,
            this.leds = new Array(e * e),
            this.init()
        }
        static fromStringifiedObject(e) {
            const t = new Ge(e.ledsPerRow);
            t.isShowingMove = e.isShowingMove;
            for (let i = 0; i < e.leds.length; i++)
                t.leds[i] = new Ue(e.leds[i].red,e.leds[i].green,e.leds[i].blue);
            return t
        }
        init() {
            this.leds.fill(new Ue(0,0,0))
        }
        equals(e) {
            var t, i, n, o, s, r;
            if (!(e && e instanceof Ge))
                return !1;
            for (let a = 0; a < this.leds.length; a++) {
                const c = this.leds[a]
                  , l = e.leds[a];
                if ((null !== (t = c.red) && void 0 !== t ? t : 0) !== (null !== (i = l.red) && void 0 !== i ? i : 0) || (null !== (n = c.blue) && void 0 !== n ? n : 0) !== (null !== (o = l.blue) && void 0 !== o ? o : 0) || (null !== (s = c.green) && void 0 !== s ? s : 0) !== (null !== (r = l.green) && void 0 !== r ? r : 0))
                    return !1
            }
            return !0
        }
        setLed(e, t, i) {
            e >= 0 && e < this.ledsPerRow && t >= 0 && t < this.ledsPerRow && (this.leds[e * this.ledsPerRow + t] = i)
        }
        setAllLeds(e) {
            for (let t = 0; t < this.leds.length; t++)
                this.leds[t] = e
        }
        getLed(e, t) {
            return this.leds[e * this.ledsPerRow + t]
        }
        isAllLedsOff() {
            return 0 === this.countLedsLit()
        }
        countLedsLit() {
            let e = 0;
            for (const t of this.leds)
                t.red + t.green + t.blue > 0 && ++e;
            return e
        }
        countColor(e) {
            let t = 0;
            for (const i of this.leds)
                i.equals(e) && ++t;
            return t
        }
        rotated180() {
            const e = new Ge(this.ledsPerRow);
            e.isShowingMove = this.isShowingMove;
            for (let t = 0; t < this.ledsPerRow; t++)
                for (let i = 0; i < this.ledsPerRow; i++)
                    e.setLed(i, t, this.getLed(this.ledsPerRow - 1 - i, this.ledsPerRow - 1 - t));
            return e
        }
        setPattern(e, t) {
            for (let i = 0; i < this.ledsPerRow * this.ledsPerRow; i++)
                if ("#" === e.charAt(i)) {
                    const e = Math.floor(i / this.ledsPerRow)
                      , n = i % this.ledsPerRow;
                    this.setLed(this.ledsPerRow - 1 - e, n, t)
                }
        }
        overlayWith(e) {
            const t = new Ge(this.ledsPerRow);
            t.isShowingMove = this.isShowingMove || e.isShowingMove;
            for (let i = 0; i < this.ledsPerRow * this.ledsPerRow; i++)
                e.leds[i].red + e.leds[i].green + e.leds[i].blue > 0 ? t.leds[i] = e.leds[i] : t.leds[i] = this.leds[i];
            return t
        }
        dimTo(e) {
            for (let t = 0; t < this.leds.length; t++) {
                const i = this.leds[t];
                this.leds[t] = i.times(e)
            }
        }
        getColors() {
            const e = new Array
              , t = new Ue(0,0,0);
            for (const i of this.leds)
                i.equals(t) || e.find(e => e.equals(i)) || e.push(i);
            return e
        }
        hasColor(e, t, i) {
            return this.getLed(t, i).equals(e)
        }
    }
    class Ke extends Ge {
        constructor() {
            super(9),
            this.isGameOverAnimation = !1
        }
        static fromStringifiedObject(e) {
            const t = new Ke;
            t.isShowingMove = e.isShowingMove;
            for (let i = 0; i < e.leds.length; i++)
                t.leds[i] = new Ue(e.leds[i].red,e.leds[i].green,e.leds[i].blue);
            return t
        }
        cloneFromLedStateRgb(e) {
            const t = new Ke;
            t.isShowingMove = e.isShowingMove;
            for (let i = 0; i < 9; i++)
                for (let n = 0; n < 9; n++)
                    t.setLed(i, n, e.getLed(i, n));
            return t.isGameOverAnimation = this.isGameOverAnimation,
            t
        }
        equals(e) {
            return !!(e && e instanceof Ke) && super.equals(e)
        }
        fieldCorner(e, t, i) {
            const n = new _e(e.row,e.col)
              , o = t.xIncrement + i.xIncrement > 0 ? 1 : 0
              , s = t.yIncrement + i.yIncrement > 0 ? 1 : 0;
            return new _e(n.row + s,n.col + o)
        }
        rotated180() {
            return this.cloneFromLedStateRgb(super.rotated180())
        }
        overlayWith(e) {
            return this.cloneFromLedStateRgb(super.overlayWith(e))
        }
    }
    class qe {
        constructor(e, t) {
            if (this.xIncrement = -1,
            this.yIncrement = -1,
            e instanceof U) {
                const t = e;
                this.xIncrement = Math.sign(t.toField.col - t.fromField.col),
                this.yIncrement = Math.sign(t.toField.row - t.fromField.row)
            } else if (e instanceof _e) {
                const i = e
                  , n = t;
                this.xIncrement = Math.sign(n.col - i.col),
                this.yIncrement = Math.sign(n.row - i.row)
            } else
                this.xIncrement = e,
                this.yIncrement = t
        }
        orthogonalDirections() {
            const e = new qe(this.yIncrement,-this.xIncrement);
            return [e, e.oppositeDirection()]
        }
        oppositeDirection() {
            return new qe(-this.xIncrement,-this.yIncrement)
        }
    }
    const ze = new Ue(0,255,0)
      , $e = new Ue(255,0,0)
      , Ye = new Ue(255,255,255);
    class Ve {
        constructor(e) {
            this.colorMoveStart = Ue.fromHtmlHexString(e.ledColorStart),
            this.colorMoveEnd = Ue.fromHtmlHexString(e.ledColorTarget),
            this.colorModifiedField = Ue.fromHtmlHexString(e.ledColor),
            this.colorCheck = Ue.fromHtmlHexString(e.ledColorCheck),
            this.brightessFactor = e.ledBrightness / 100
        }
        createLedState(e, t, i) {
            const n = e.computeMoveTo(t);
            let o;
            if (n && n.player !== i) {
                if (n.player === i)
                    o = new Ke;
                else if (o = this.createLedStateForMove(n),
                void 0 !== n.player && G(t, te.oppositeColor(n.player))) {
                    const e = K(t, te.oppositeColor(n.player));
                    this.lightField(e, this.colorCheck, o)
                }
            } else
                o = this.createLedStateForModifiedFields(t.computeModifiedFields(e));
            return o.dimTo(this.brightessFactor),
            o
        }
        createLedStateForMove(e) {
            let t;
            return e.isStraight() ? t = this.createLedStateForStraightMove(e) : e.isDiagonal() ? t = this.createLedStateForDiagonalMove(e) : (t = new Ke,
            this.lightField(e.fromField, this.colorMoveStart, t),
            this.lightField(e.toField, this.colorMoveEnd, t)),
            t.isShowingMove = !0,
            t
        }
        createLedStateForStraightMove(e) {
            const t = new qe(e)
              , i = new Ke;
            return t.orthogonalDirections().forEach(n => {
                const o = i.fieldCorner(e.fromField, t.oppositeDirection(), n)
                  , s = i.fieldCorner(e.toField, t, n);
                this.animateLedLine(o, s, i)
            }
            ),
            i
        }
        createLedStateForDiagonalMove(e) {
            const t = new qe(e)
              , i = new Ke
              , n = i.fieldCorner(e.fromField, t.oppositeDirection(), t.oppositeDirection())
              , o = i.fieldCorner(e.toField, t, t);
            return this.animateLedLine(n, o, i),
            t.orthogonalDirections().forEach(t => {
                const n = i.fieldCorner(e.fromField, t, t)
                  , o = i.fieldCorner(e.toField, t, t);
                i.setLed(n.row, n.col, this.colorMoveStart),
                i.setLed(o.row, o.col, this.colorMoveEnd)
            }
            ),
            i
        }
        animateLedLine(e, t, i) {
            const n = new qe(e,t);
            i.setLed(e.row, e.col, this.colorMoveStart),
            i.setLed(t.row, t.col, this.colorMoveEnd);
            const o = Math.max(Math.abs(e.row - t.row), Math.abs(e.col - t.col))
              , s = this.colorMoveEnd.minus(this.colorMoveStart).dividedBy(o);
            let r = 0;
            for (let o = e.advance(n); !o.equals(t); o = o.advance(n))
                i.setLed(o.row, o.col, this.colorMoveStart.plus(s.times(++r)))
        }
        createLedStateForModifiedFields(e) {
            const t = new Ke;
            for (const i of e)
                this.lightField(i, this.colorModifiedField, t);
            return t
        }
        lightField(e, t, i) {
            i.setLed(e.row, e.col, t),
            i.setLed(e.row + 1, e.col, t),
            i.setLed(e.row, e.col + 1, t),
            i.setLed(e.row + 1, e.col + 1, t)
        }
        static createResultPattern(e, t) {
            const i = new Ke;
            switch (i.isGameOverAnimation = !0,
            e) {
            case se.WHITE_WINS:
                i.setPattern("-#------#-#-----#--#----#---#---#----#--#-###---#--#-#--#---#-#-#----#-##-----###", t === te.WHITE ? ze : $e);
                break;
            case se.BLACK_WINS:
                i.setPattern("###-----##-#----#-#-#---#--#-#--#---###-#--#----#---#---#----#--#-----#-#------#-", t === te.BLACK ? ze : $e);
                break;
            case se.DRAW:
                i.setPattern("-#------#-#-----#--#----#---#---#----#--#-###---#----#--#---###-#----#--#-----###", Ye)
            }
            return t === te.WHITE ? i : i.rotated180()
        }
    }
    const Qe = new Ue(255,255,0)
      , je = new Ue(255,0,0);
    class Je {
        constructor(e, t, i, n) {
            this.autoUpdateInterval = null,
            this.startMsWhite = null,
            this.startMsBlack = null,
            this.lastClockState = null,
            this.smartboard = e,
            this.color = t,
            this.ledSteps = Je.computeLedSteps(5, t),
            this.brightnessFactor = i,
            this.ledsPerPlayer = n
        }
        reset() {
            return Promise.resolve()
        }
        clearTextDisplay() {
            return Promise.resolve()
        }
        update(e, t) {
            return e.isGameOver() ? (this.autoUpdateInterval && clearInterval(this.autoUpdateInterval),
            this.startMsBlack = null,
            this.startMsWhite = null) : this.startMsWhite && this.startMsBlack || !e.whiteMs || !e.blackMs || null === e.runningForPlayer || (this.startMsWhite = e.whiteStartMs ? e.whiteStartMs : e.whiteMs,
            this.startMsBlack = e.blackStartMs ? e.blackStartMs : e.blackMs,
            this.autoUpdate(),
            this.autoUpdateInterval = setInterval( () => {
                this.autoUpdate()
            }
            , 2e3)),
            this.lastClockState = e,
            Promise.resolve()
        }
        autoUpdate() {
            this.lastClockState && this.smartboard.sendLedStateToBoard(this.smartboard.lastLedState)
        }
        imprintTimeOnLedState(e, t) {
            if (this.lastClockState && 0 === e.countLedsLit()) {
                const i = Date.now() - this.lastClockState.timestamp
                  , n = this.nextClockState(this.lastClockState, i);
                let o = this.visualiseClockState(n);
                return t && (o = o.rotated180()),
                o.overlayWith(e)
            }
            return e
        }
        nextClockState(e, t) {
            return (e = structuredClone(e)).runningForPlayer === te.WHITE ? e.whiteMs -= t : e.blackMs -= t,
            e
        }
        static computeLedSteps(e, t) {
            const i = []
              , n = Math.floor(e / 2)
              , o = e - n;
            for (let e = 0; e < n; e++)
                i.push(Je.gradientColor(je, Qe, n, e));
            for (let e = 0; e < o; e++)
                i.push(Je.gradientColor(Qe, t, o, e));
            return i
        }
        static gradientColor(e, t, i, n) {
            const o = Math.floor(n * (t.red - e.red) / i + e.red)
              , s = Math.floor(n * (t.green - e.green) / i + e.green)
              , r = Math.floor(n * (t.blue - e.blue) / i + e.blue);
            return new Ue(o,s,r)
        }
        visualiseClockState(e) {
            const t = this.ledsForPlayer(e.whiteMs, te.WHITE)
              , i = this.ledsForPlayer(e.blackMs, te.BLACK);
            return this.createLedState(t, i)
        }
        ledsForPlayer(e, t) {
            const i = []
              , n = 5 * this.ledsPerPlayer
              , o = t === te.WHITE ? this.startMsWhite : this.startMsBlack;
            if (o) {
                const t = o / n
                  , s = Math.floor(e / (5 * t));
                for (let e = 0; e < s; e++)
                    i.push(this.color);
                const r = e - s * t * 5;
                r > 0 && i.push(this.ledSteps[Math.floor(r / t)])
            }
            return i
        }
        createLedState(e, t) {
            const i = new Ke;
            for (let t = 0; t < e.length; t++)
                i.setLed(0, t, e[t]);
            for (let e = 0; e < t.length; e++)
                i.setLed(8, 8 - e, t[e]);
            return i.dimTo(this.brightnessFactor),
            i
        }
        getClockLeds(e) {
            if (!this.lastClockState)
                return [];
            const t = Date.now() - this.lastClockState.timestamp
              , i = this.nextClockState(this.lastClockState, t);
            return e === te.WHITE ? this.ledsForPlayer(i.whiteMs, te.WHITE) : this.ledsForPlayer(i.blackMs, te.BLACK)
        }
        disconnect() {
            return Promise.resolve()
        }
        setPendingMove(e) {}
        setRunningForPlayer(e, t) {
            return Promise.resolve()
        }
    }
    class Xe extends Array {
        equals(e) {
            if (this.length !== e.length)
                return !1;
            for (let t = 0; t < this.length; t++)
                if (!this[t].equals(e[t]))
                    return !1;
            return !0
        }
        toString() {
            let e = "[";
            for (let t = 0; t < this.length; t++)
                e += this[t].toString(),
                t < this.length - 1 && (e += ", ");
            return e += "]",
            e
        }
    }
    class Ze {
        constructor(e) {
            this.readings = [],
            this.minReadings = e
        }
        readingConfirmed(e) {
            const t = this.readings.find(t => t.reading.equals(e));
            return t ? (t.counter++,
            t.counter >= this.minReadings) : (this.readings.push({
                reading: e,
                counter: 1
            }),
            !1)
        }
    }
    var et = function(e, t, i, n) {
        return new (i || (i = Promise))(function(o, s) {
            function r(e) {
                try {
                    c(n.next(e))
                } catch (e) {
                    s(e)
                }
            }
            function a(e) {
                try {
                    c(n.throw(e))
                } catch (e) {
                    s(e)
                }
            }
            function c(e) {
                var t;
                e.done ? o(e.value) : (t = e.value,
                t instanceof i ? t : new i(function(e) {
                    e(t)
                }
                )).then(r, a)
            }
            c((n = n.apply(e, t || [])).next())
        }
        )
    };
    class tt {
        constructor(e) {
            this.maxQueueLength = 0,
            this.pauseTimer = Promise.resolve(),
            this.pauseMs = 0,
            this.queue = [],
            this.isProcessing = !1,
            this.pauseMs = null != e ? e : 0
        }
        setPauseMs(e) {
            this.pauseMs = e
        }
        getQueueLength() {
            return this.queue.length
        }
        enqueue(e, t) {
            return et(this, arguments, void 0, function*(e, t, i=!1) {
                return new Promise( (n, o) => {
                    i && (this.queue = []),
                    this.queue.push( () => et(this, void 0, void 0, function*() {
                        try {
                            yield this.pauseTimer,
                            yield e(),
                            this.pauseTimer = this.pauseMs ? p(this.pauseMs) : Promise.resolve(),
                            n()
                        } catch (e) {
                            o(e instanceof Error ? e : new Error("Serializer: " + e))
                        }
                    })),
                    this.queue.length > this.maxQueueLength && (this.maxQueueLength = this.queue.length,
                    b("Serializer hat neue Rekordlänge: " + this.maxQueueLength + (t ? " (" + t + ")" : ""))),
                    this.processQueue()
                }
                )
            })
        }
        processQueue() {
            return et(this, void 0, void 0, function*() {
                if (!this.isProcessing)
                    for (; this.queue.length > 0; ) {
                        const e = this.queue.shift();
                        e && (this.isProcessing = !0,
                        yield e(),
                        this.isProcessing = !1)
                    }
            })
        }
    }
    var it = function(e, t, i, n) {
        return new (i || (i = Promise))(function(o, s) {
            function r(e) {
                try {
                    c(n.next(e))
                } catch (e) {
                    s(e)
                }
            }
            function a(e) {
                try {
                    c(n.throw(e))
                } catch (e) {
                    s(e)
                }
            }
            function c(e) {
                var t;
                e.done ? o(e.value) : (t = e.value,
                t instanceof i ? t : new i(function(e) {
                    e(t)
                }
                )).then(r, a)
            }
            c((n = n.apply(e, t || [])).next())
        }
        )
    };
    class nt extends We {
        constructor(e, t) {
            super(e),
            this.isFullRgbBoard = !1,
            this.currentInputLine = null,
            this.learnPiecesWarningActive = !0,
            this.writeSerialiser = new tt(750),
            this.readSerialiser = new tt,
            this.sendAndWaitBuffer = new s(1e3,0),
            this.ledStateLastSent = null,
            this.noiseFilter = null,
            this.isFullRgbBoard = t.boardType === O.TABUTRONIC_SPECTRUM,
            this.isFullRgbBoard && t.showLedClock && (this.clock = new Je(this,Ue.fromHtmlHexString(t.ledClockColor),t.ledClockBrightness / 100,9))
        }
        checkForLearnedPieces() {
            return it(this, void 0, void 0, function*() {
                if (this.learnPiecesWarningActive) {
                    const e = yield this.siteManager.getOptions();
                    (!e.certaboMapping || 0 === Object.keys(e.certaboMapping).length) && !e.learnPiecesOnNextConnect && (yield T("No pieces known. Please open options and let Chessconnect learn your pieces before this board can be used.", !0)),
                    this.learnPiecesWarningActive = !1
                }
            })
        }
        parsePosition(e) {
            return it(this, void 0, void 0, function*() {
                const t = yield this.getBoardFromPositionData(e);
                !t || this.lastPositionReceived && this.lastPositionReceived.equals(t) || (this.lastPositionReceived = t,
                yield this.onBoardChanged(t))
            })
        }
        getBoardFromPositionData(e) {
            return it(this, void 0, void 0, function*() {
                const t = yield this.siteManager.getOptions()
                  , i = new te
                  , n = e.trim().split(" ");
                if (8 === n.length)
                    return this.getBoardFromSentioPositionData(n);
                if (320 === n.length) {
                    const e = new Xe(64);
                    yield this.checkForLearnedPieces();
                    let o = !1;
                    for (let t = 0; t < 8; t++)
                        for (let s = 0; s < 8; s++) {
                            const r = 8 * (7 - t) + s
                              , a = [Number.parseInt(n[5 * r]), Number.parseInt(n[5 * r + 1]), Number.parseInt(n[5 * r + 2]), Number.parseInt(n[5 * r + 3]), Number.parseInt(n[5 * r + 4])]
                              , c = new oe(a);
                            e[8 * t + s] = c;
                            let l = yield this.getPieceForRfId(c);
                            null === l && (o = !0,
                            l = null != l ? l : te.EMPTY),
                            i.setField(t, s, te.colorOnly(l), te.pieceOnly(l))
                        }
                    if (t.learnPiecesOnNextConnect && this.positionConfirmed(e, 1))
                        yield this.learnPiecesWithInfo(e);
                    else if (o)
                        return b("Discarding position data because of invalid RFIDs"),
                        null;
                    return i
                }
                return null
            })
        }
        learnPiecesWithInfo(e) {
            return it(this, void 0, void 0, function*() {
                const t = yield this.siteManager.getOptions()
                  , n = "reportCommunicationParameters"in this.siteManager;
                if (t.learnPiecesOnNextConnect && !n) {
                    let n = Object.keys(t.certaboMapping).length;
                    yield this.learnRfIds(e);
                    const o = Object.keys(t.certaboMapping).length - n;
                    n = Object.keys(t.certaboMapping).length,
                    yield d((yield i("NewPiecesMemorized", o.toString())) + " " + (yield i("KnownPieces", n.toString())), t.resUrl),
                    t.learnPiecesOnNextConnect = !1,
                    yield this.siteManager.saveOptionsAndWait(t, e => !1 === e.learnPiecesOnNextConnect)
                }
            })
        }
        learnRfIds(e) {
            return it(this, void 0, void 0, function*() {
                const t = te.getStartingPosition();
                t.setField(2, 3, te.WHITE, te.QUEEN),
                t.setField(5, 3, te.BLACK, te.QUEEN);
                const i = yield this.siteManager.getOptions();
                i.certaboMapping || (i.certaboMapping = {});
                for (let n = 0; n < 8; n++)
                    for (let o = 0; o < 8; o++) {
                        const s = new W(n,o)
                          , r = e[8 * n + o];
                        if (r.isPiece() && !t.fieldIsEmpty(s) && null === (yield this.getPieceForRfId(r))) {
                            const e = t.getPieceOnField(s) | t.getColorOnField(s);
                            b("New piece: " + s.asString() + ", " + te.pieceAsString(e) + " (" + r.toString() + ")"),
                            i.certaboMapping[r.toString()] = e
                        }
                    }
                this.siteManager.saveOptions()
            })
        }
        getPieceForRfId(e) {
            return it(this, void 0, void 0, function*() {
                if (e.isPiece()) {
                    const t = yield this.siteManager.getOptions()
                      , i = t.certaboMapping ? t.certaboMapping[e.toString()] : null;
                    return void 0 !== i ? i : null
                }
                return te.EMPTY
            })
        }
        encodeLedState(e) {
            return e instanceof Ke && this.isFullRgbBoard ? this.encodeLedState9x9rgb(e) : e instanceof we ? this.encodeLedStateSimple(e) : null
        }
        encodeLedStateSimple(e) {
            const t = new Uint8Array(8);
            for (let i = 0; i < 8; i++)
                for (let n = 0; n < 8; n++)
                    if (e.isLedOn(i, n)) {
                        let e = t[7 - i];
                        e |= 1 << n,
                        t[7 - i] = e
                    }
            return t
        }
        encodeLedState9x9rgb(e) {
            const t = new Uint8Array(247);
            t[0] = 255,
            t[1] = 85;
            for (let i = 0; i < 9; i++)
                for (let n = 0; n < 9; n++) {
                    const o = 9 * i + 8 - n
                      , s = e.getLed(i, n);
                    t[2 + 3 * o] = nt.safeguardColor(s.red),
                    t[2 + 3 * o + 1] = nt.safeguardColor(s.green),
                    t[2 + 3 * o + 2] = nt.safeguardColor(s.blue)
                }
            return t[245] = 13,
            t[246] = 10,
            t
        }
        static safeguardColor(e) {
            switch (e) {
            case 85:
                return 86;
            case 100:
                return 11;
            default:
                return e
            }
        }
        processDataFromBoard(e) {
            return it(this, void 0, void 0, function*() {
                for (const t of e)
                    t === "D".charCodeAt(0) && this.sendAndWaitBuffer.receive("D"),
                    null === this.currentInputLine ? t === ":".charCodeAt(0) && (this.currentInputLine = "") : 10 === t ? (yield this.parsePosition(this.currentInputLine),
                    this.currentInputLine = null) : 13 !== t && (this.currentInputLine = this.currentInputLine + String.fromCharCode(t))
            })
        }
        queryBattery() {
            return Promise.resolve()
        }
        getBoardFromSentioPositionData(e) {
            return it(this, void 0, void 0, function*() {
                const t = new He(e);
                return this.positionConfirmed(t, 4) ? yield this.getBoardFromBinaryPosition(t) : null
            })
        }
        positionConfirmed(e, t) {
            return this.noiseFilter || (this.noiseFilter = new Ze(t)),
            !!this.noiseFilter.readingConfirmed(e) && (this.noiseFilter = null,
            !0)
        }
        lightLEDs(e, t) {
            const i = Object.create(null, {
                lightLEDs: {
                    get: () => super.lightLEDs
                }
            });
            return it(this, void 0, void 0, function*() {
                if (this.isFullRgbBoard) {
                    this.boardOrientation === fe.FLIPPED && (e = e.flipped(),
                    t = t.flipped());
                    const i = new Ve(yield this.siteManager.getOptions()).createLedState(e, t, yield this.getPlayerColor())
                      , n = this.lastLedState;
                    (null == n ? void 0 : n.isShowingMove) && 0 !== i.countLedsLit() || (b(`${i.countLedsLit()} LEDs need to be lit`),
                    this.lastLedState && this.lastLedState.equals(i) || (b("Lighting " + i.countLedsLit() + " LEDs"),
                    this.sendLedStateToBoard(i),
                    this.lastLedState = i))
                } else
                    yield i.lightLEDs.call(this, e, t)
            })
        }
        clearLEDs() {
            return this.sendLedStateToBoard(this.isFullRgbBoard ? new Ke : new we),
            Promise.resolve()
        }
        setClockState(e) {
            const t = Object.create(null, {
                setClockState: {
                    get: () => super.setClockState
                }
            });
            return it(this, void 0, void 0, function*() {
                if (yield t.setClockState.call(this, e),
                this.isFullRgbBoard && e.isGameOver()) {
                    this.sitePosition = null;
                    const t = yield this.getPlayerColor()
                      , i = Ve.createResultPattern(e.gameResult, t);
                    this.sendLedStateToBoard(i)
                }
            })
        }
        setSitePosition(e, t) {
            return te.isNewGame(this.getSitePosition(), e) && (this.ledStateLastSent = null),
            super.setSitePosition(e, t)
        }
        sendLedStateToBoard(e) {
            return it(this, void 0, void 0, function*() {
                var t;
                if (this.isFullRgbBoard ? (e = null != e ? e : new Ke,
                this.clock instanceof Je && (e = this.clock.imprintTimeOnLedState(e, this.boardOrientation === fe.FLIPPED))) : e = null != e ? e : new we,
                !(this.ledStateLastSent instanceof Ke && (null === (t = this.ledStateLastSent) || void 0 === t ? void 0 : t.isGameOverAnimation) || e.equals(this.ledStateLastSent))) {
                    const t = this.encodeLedState(e);
                    t && (yield this.writeSerialiser.enqueue( () => it(this, void 0, void 0, function*() {
                        this.ledStateLastSent = e,
                        this.isFullRgbBoard ? yield this.sendAndWaitBuffer.send( () => {
                            this.sendDataToBoard(t)
                        }
                        , e => "D" === e, "RGB-LEDs") : yield this.sendDataToBoard(t)
                    })))
                }
            })
        }
    }
    const ot = 6e4;
    class st {
        constructor(e, t) {
            this.currentBoard = null,
            this.wasShutdown = !1,
            this.siteManager = e,
            this.candidateBoard = t,
            this.startReconnectService()
        }
        shutdown() {
            return e = this,
            t = void 0,
            n = function*() {
                this.wasShutdown = !0,
                this.currentBoard && (yield this.currentBoard.disconnect()),
                this.stopReconnectService()
            }
            ,
            new ((i = void 0) || (i = Promise))(function(o, s) {
                function r(e) {
                    try {
                        c(n.next(e))
                    } catch (e) {
                        s(e)
                    }
                }
                function a(e) {
                    try {
                        c(n.throw(e))
                    } catch (e) {
                        s(e)
                    }
                }
                function c(e) {
                    var t;
                    e.done ? o(e.value) : (t = e.value,
                    t instanceof i ? t : new i(function(e) {
                        e(t)
                    }
                    )).then(r, a)
                }
                c((n = n.apply(e, t || [])).next())
            }
            );
            var e, t, i, n
        }
        isConnected() {
            return null !== this.currentBoard
        }
        startReconnectService() {
            return Promise.resolve()
        }
        stopReconnectService() {
            var e;
            null === (e = this.reconnectAbortController) || void 0 === e || e.abort(),
            this.reconnectAbortController = null
        }
        boardDisconnected() {
            this.currentBoard = null,
            this.stopReconnectService(),
            this.startReconnectService()
        }
    }
    new Error("timeout while waiting for mutex to become available"),
    new Error("mutex already locked");
    const rt = new Error("request for lock canceled");
    class at {
        constructor(e, t=rt) {
            this._value = e,
            this._cancelError = t,
            this._queue = [],
            this._weightedWaiters = []
        }
        acquire(e=1, t=0) {
            if (e <= 0)
                throw new Error(`invalid weight ${e}: must be positive`);
            return new Promise( (i, n) => {
                const o = {
                    resolve: i,
                    reject: n,
                    weight: e,
                    priority: t
                }
                  , s = ct(this._queue, e => t <= e.priority);
                -1 === s && e <= this._value ? this._dispatchItem(o) : this._queue.splice(s + 1, 0, o)
            }
            )
        }
        runExclusive(e) {
            return t = this,
            i = arguments,
            o = function*(e, t=1, i=0) {
                const [n,o] = yield this.acquire(t, i);
                try {
                    return yield e(n)
                } finally {
                    o()
                }
            }
            ,
            new ((n = void 0) || (n = Promise))(function(e, s) {
                function r(e) {
                    try {
                        c(o.next(e))
                    } catch (e) {
                        s(e)
                    }
                }
                function a(e) {
                    try {
                        c(o.throw(e))
                    } catch (e) {
                        s(e)
                    }
                }
                function c(t) {
                    var i;
                    t.done ? e(t.value) : (i = t.value,
                    i instanceof n ? i : new n(function(e) {
                        e(i)
                    }
                    )).then(r, a)
                }
                c((o = o.apply(t, i || [])).next())
            }
            );
            var t, i, n, o
        }
        waitForUnlock(e=1, t=0) {
            if (e <= 0)
                throw new Error(`invalid weight ${e}: must be positive`);
            return this._couldLockImmediately(e, t) ? Promise.resolve() : new Promise(i => {
                this._weightedWaiters[e - 1] || (this._weightedWaiters[e - 1] = []),
                function(e, t) {
                    const i = ct(e, e => t.priority <= e.priority);
                    e.splice(i + 1, 0, t)
                }(this._weightedWaiters[e - 1], {
                    resolve: i,
                    priority: t
                })
            }
            )
        }
        isLocked() {
            return this._value <= 0
        }
        getValue() {
            return this._value
        }
        setValue(e) {
            this._value = e,
            this._dispatchQueue()
        }
        release(e=1) {
            if (e <= 0)
                throw new Error(`invalid weight ${e}: must be positive`);
            this._value += e,
            this._dispatchQueue()
        }
        cancel() {
            this._queue.forEach(e => e.reject(this._cancelError)),
            this._queue = []
        }
        _dispatchQueue() {
            for (this._drainUnlockWaiters(); this._queue.length > 0 && this._queue[0].weight <= this._value; )
                this._dispatchItem(this._queue.shift()),
                this._drainUnlockWaiters()
        }
        _dispatchItem(e) {
            const t = this._value;
            this._value -= e.weight,
            e.resolve([t, this._newReleaser(e.weight)])
        }
        _newReleaser(e) {
            let t = !1;
            return () => {
                t || (t = !0,
                this.release(e))
            }
        }
        _drainUnlockWaiters() {
            if (0 === this._queue.length)
                for (let e = this._value; e > 0; e--) {
                    const t = this._weightedWaiters[e - 1];
                    t && (t.forEach(e => e.resolve()),
                    this._weightedWaiters[e - 1] = [])
                }
            else {
                const e = this._queue[0].priority;
                for (let t = this._value; t > 0; t--) {
                    const i = this._weightedWaiters[t - 1];
                    if (!i)
                        continue;
                    const n = i.findIndex(t => t.priority <= e);
                    (-1 === n ? i : i.splice(0, n)).forEach(e => e.resolve())
                }
            }
        }
        _couldLockImmediately(e, t) {
            return (0 === this._queue.length || this._queue[0].priority < t) && e <= this._value
        }
    }
    function ct(e, t) {
        for (let i = e.length - 1; i >= 0; i--)
            if (t(e[i]))
                return i;
        return -1
    }
    class lt {
        constructor(e) {
            this._semaphore = new at(1,e)
        }
        acquire() {
            return e = this,
            t = arguments,
            n = function*(e=0) {
                const [,t] = yield this._semaphore.acquire(1, e);
                return t
            }
            ,
            new ((i = void 0) || (i = Promise))(function(o, s) {
                function r(e) {
                    try {
                        c(n.next(e))
                    } catch (e) {
                        s(e)
                    }
                }
                function a(e) {
                    try {
                        c(n.throw(e))
                    } catch (e) {
                        s(e)
                    }
                }
                function c(e) {
                    var t;
                    e.done ? o(e.value) : (t = e.value,
                    t instanceof i ? t : new i(function(e) {
                        e(t)
                    }
                    )).then(r, a)
                }
                c((n = n.apply(e, t || [])).next())
            }
            );
            var e, t, i, n
        }
        runExclusive(e, t=0) {
            return this._semaphore.runExclusive( () => e(), 1, t)
        }
        isLocked() {
            return this._semaphore.isLocked()
        }
        waitForUnlock(e=0) {
            return this._semaphore.waitForUnlock(1, e)
        }
        release() {
            this._semaphore.isLocked() && this._semaphore.release()
        }
        cancel() {
            return this._semaphore.cancel()
        }
    }
    var dt = function(e, t, i, n) {
        return new (i || (i = Promise))(function(o, s) {
            function r(e) {
                try {
                    c(n.next(e))
                } catch (e) {
                    s(e)
                }
            }
            function a(e) {
                try {
                    c(n.throw(e))
                } catch (e) {
                    s(e)
                }
            }
            function c(e) {
                var t;
                e.done ? o(e.value) : (t = e.value,
                t instanceof i ? t : new i(function(e) {
                    e(t)
                }
                )).then(r, a)
            }
            c((n = n.apply(e, t || [])).next())
        }
        )
    };
    class ht extends st {
        constructor(e, t) {
            super(e, t),
            this.sendSerializer = new tt(150),
            this.reconnectTimedOut = !1,
            this.reconnectTimer = null,
            this.reconnectMutex = new lt,
            this.advertistementListener = e => {
                this.reconnectMutex.runExclusive( () => dt(this, void 0, void 0, function*() {
                    b("advertisement received from " + e.device.name),
                    this.reconnectTryTimeout && (clearTimeout(this.reconnectTryTimeout),
                    this.reconnectTryTimeout = null),
                    this.stopReconnectService(),
                    this.currentBoard || (yield this.siteManager.startConnecting(!1),
                    yield this.reconnectToDevice(e.device))
                }))
            }
            ,
            this.candidateBoard = t
        }
        setSendDelay(e) {
            this.sendSerializer.setPauseMs(e)
        }
        connectToBoard() {
            return dt(this, void 0, void 0, function*() {
                if (yield this.checkAvailability())
                    try {
                        const e = {
                            filters: this.candidateBoard.getScanFilter(),
                            optionalServices: this.candidateBoard.getServiceUUIDs()
                        }
                          , t = yield navigator.bluetooth.requestDevice(e);
                        yield this.siteManager.startConnecting(!0),
                        yield this.candidateBoard.connectToDevice(t, !0),
                        this.siteManager.onSmartboardConnect(this.candidateBoard),
                        this.currentBoard = this.candidateBoard,
                        yield this.siteManager.saveOptionProperty("lastBleDevice", t.id)
                    } catch (e) {
                        yield T(e, !1)
                    }
                return void 0 !== this.currentBoard
            })
        }
        checkAvailability() {
            return dt(this, void 0, void 0, function*() {
                const e = yield this.siteManager.getOptions();
                return "bluetooth"in navigator && "getAvailability"in navigator.bluetooth ? (yield navigator.bluetooth.getAvailability()) ? (e.noReconnectWarningShown || "function" == typeof navigator.bluetooth.getDevices || (yield d((yield i("NoReconnect")) + "\n" + (yield i("FLAGS_INFO")), e.resUrl),
                yield this.siteManager.saveOptionProperty("noReconnectWarningShown", !0)),
                !0) : (yield d((yield i("NoBLE")) + " " + (yield i("FLAGS_INFO")), e.resUrl),
                !1) : (yield d((yield i("NoBleAPI")) + " " + (yield i("FLAGS_INFO")), e.resUrl),
                !1)
            })
        }
        startReconnectService() {
            return dt(this, void 0, void 0, function*() {
                var e;
                const t = yield this.siteManager.getOptions();
                if (!this.reconnectAbortController && "function" == typeof (null === (e = navigator.bluetooth) || void 0 === e ? void 0 : e.getDevices)) {
                    this.reconnectTimer || (this.reconnectTimer = setTimeout( () => {
                        b("reconnect timeout"),
                        this.reconnectTimedOut = !0,
                        this.stopReconnectService(),
                        this.reconnectTimer = null
                    }
                    , ot)),
                    yield this.siteManager.startSearching(),
                    this.reconnectAbortController = new AbortController;
                    let e = !1;
                    for (; !e && this.reconnectAbortController; )
                        try {
                            const i = yield navigator.bluetooth.getDevices();
                            for (const e of i)
                                e.id === t.lastBleDevice && (e.removeEventListener("advertisementreceived", this.advertistementListener),
                                e.addEventListener("advertisementreceived", this.advertistementListener),
                                yield e.watchAdvertisements({
                                    signal: this.reconnectAbortController.signal
                                }));
                            this.currentBoard ? this.stopReconnectService() : setTimeout( () => {
                                this.stopReconnectService(),
                                this.isConnected() || this.wasShutdown || this.reconnectTimedOut || this.startReconnectService()
                            }
                            , 3e3),
                            e = !0
                        } catch (e) {
                            yield T(e, !1),
                            yield p(1e3)
                        }
                }
            })
        }
        getGattServer(e) {
            return dt(this, void 0, void 0, function*() {
                return e.gatt && !e.gatt.connected && (yield e.gatt.connect()),
                e.gatt
            })
        }
        reconnectToDevice(e) {
            return dt(this, void 0, void 0, function*() {
                yield this.candidateBoard.disconnect(),
                yield this.candidateBoard.connectToDevice(e, !1),
                this.currentBoard = this.candidateBoard,
                this.siteManager.onSmartboardConnect(this.currentBoard)
            })
        }
        static getCharacteristic(e, t, i) {
            return dt(this, void 0, void 0, function*() {
                const n = yield e.getPrimaryService(t);
                return yield n.getCharacteristic(i)
            })
        }
        sendToBoard(e, t, i) {
            return dt(this, void 0, void 0, function*() {
                yield this.sendSerializer.enqueue( () => dt(this, void 0, void 0, function*() {
                    let n = !1;
                    for (; !n; )
                        try {
                            i ? yield t.writeValueWithoutResponse(new Uint8Array(e)) : yield t.writeValueWithResponse(new Uint8Array(e)),
                            n = !0
                        } catch (e) {
                            console.log(e),
                            yield p(100)
                        }
                    return Promise.resolve()
                }))
            })
        }
    }
    var ut = function(e, t, i, n) {
        return new (i || (i = Promise))(function(o, s) {
            function r(e) {
                try {
                    c(n.next(e))
                } catch (e) {
                    s(e)
                }
            }
            function a(e) {
                try {
                    c(n.throw(e))
                } catch (e) {
                    s(e)
                }
            }
            function c(e) {
                var t;
                e.done ? o(e.value) : (t = e.value,
                t instanceof i ? t : new i(function(e) {
                    e(t)
                }
                )).then(r, a)
            }
            c((n = n.apply(e, t || [])).next())
        }
        )
    };
    const vt = "6e400001-b5a3-f393-e0a9-e50e24dcca9e"
      , gt = "6e400003-b5a3-f393-e0a9-e50e24dcca9e"
      , ft = "6e400002-b5a3-f393-e0a9-e50e24dcca9e";
    class pt extends nt {
        constructor() {
            super(...arguments),
            this.disconnectListener = () => {
                this.siteManager.onSmartboardDisconnect()
            }
            ,
            this.dataListener = e => {
                this.onDataReceived(e)
            }
        }
        getServiceUUIDs() {
            return [vt]
        }
        getScanFilter() {
            return [{
                services: this.getServiceUUIDs()
            }]
        }
        connectToDevice(e, t) {
            return ut(this, void 0, void 0, function*() {
                try {
                    this.device = e,
                    this.siteManager.showStatusMessage("connecting (1/3)", !t);
                    const i = yield e.gatt.connect();
                    this.siteManager.showStatusMessage("connecting (2/3)", !t),
                    this.writeChannel = yield ht.getCharacteristic(i, vt, ft),
                    this.siteManager.showStatusMessage("connecting (3/3)", !t);
                    const n = yield ht.getCharacteristic(i, vt, gt);
                    n.addEventListener("characteristicvaluechanged", this.dataListener),
                    n.startNotifications(),
                    e.addEventListener("gattserverdisconnected", this.disconnectListener),
                    this.initializeBoard()
                } catch (e) {
                    throw yield T(e, !1),
                    this.siteManager.showStatusMessage("", !t),
                    e
                }
            })
        }
        disconnect() {
            var e, t;
            return null === (e = this.device) || void 0 === e || e.removeEventListener("gattserverdisconnected", this.disconnectListener),
            null === (t = this.device) || void 0 === t || t.removeEventListener("characteristicvaluechanged", this.dataListener),
            super.disconnect()
        }
        onDataReceived(e) {
            return ut(this, void 0, void 0, function*() {
                yield this.readSerialiser.enqueue( () => ut(this, void 0, void 0, function*() {
                    yield this.processDataFromBoard(new Uint8Array(e.target.value.buffer))
                }))
            })
        }
        getBluetoothNamePrefix() {
            return "Certabo"
        }
        sendDataToBoard(e) {
            const t = this.siteManager.connectionManager;
            return t.setSendDelay(750),
            t.sendToBoard(e, this.writeChannel)
        }
    }
    var mt = function(e, t, i, n) {
        return new (i || (i = Promise))(function(o, s) {
            function r(e) {
                try {
                    c(n.next(e))
                } catch (e) {
                    s(e)
                }
            }
            function a(e) {
                try {
                    c(n.throw(e))
                } catch (e) {
                    s(e)
                }
            }
            function c(e) {
                var t;
                e.done ? o(e.value) : (t = e.value,
                t instanceof i ? t : new i(function(e) {
                    e(t)
                }
                )).then(r, a)
            }
            c((n = n.apply(e, t || [])).next())
        }
        )
    };
    class yt extends nt {
        constructor(e, t) {
            super(e, t),
            this.disconnectListener = () => {
                this.siteManager.onSmartboardDisconnect()
            }
        }
        connectToPort(e, t) {
            return mt(this, void 0, void 0, function*() {
                try {
                    this.siteManager.showStatusMessage("connecting (1/3)..", !t);
                    try {
                        yield e.close()
                    } catch (e) {}
                    try {
                        yield e.open({
                            baudRate: 38400
                        })
                    } catch (e) {
                        yield T(e, !1)
                    }
                    this.siteManager.showStatusMessage("connecting (2/3)..", !t),
                    this.port = e,
                    e.addEventListener("disconnect", this.disconnectListener),
                    this.siteManager.showStatusMessage("connecting (3/3)..", !t),
                    this.readFromPort(e),
                    this.initializeBoard()
                } catch (e) {
                    throw yield T(e, !1),
                    this.siteManager.showStatusMessage("", !t),
                    e
                }
            })
        }
        disconnect() {
            const e = Object.create(null, {
                disconnect: {
                    get: () => super.disconnect
                }
            });
            return mt(this, void 0, void 0, function*() {
                var t, i;
                if (yt.reader)
                    try {
                        yield yt.reader.cancel(),
                        yield null === (t = this.port) || void 0 === t ? void 0 : t.close()
                    } catch (e) {
                        yield T(e, !1)
                    }
                null === (i = this.port) || void 0 === i || i.removeEventListener("disconnect", this.disconnectListener),
                this.port = null,
                yield e.disconnect.call(this)
            })
        }
        readFromPort(e) {
            return mt(this, void 0, void 0, function*() {
                var t;
                try {
                    yt.reader = e.readable.getReader()
                } catch (e) {}
                try {
                    let e = yield yt.reader.read();
                    for (; !e.done; ) {
                        const t = e;
                        yield this.readSerialiser.enqueue( () => mt(this, void 0, void 0, function*() {
                            yield this.processDataFromBoard(t.value)
                        })),
                        e = yield yt.reader.read()
                    }
                } catch (e) {
                    yield T(e, !1)
                } finally {
                    null === (t = yt.reader) || void 0 === t || t.releaseLock()
                }
            })
        }
        setSitePosition(e, t) {
            return this.ledStateLastSent = null,
            super.setSitePosition(e, t)
        }
        sendDataToBoard(e) {
            return mt(this, void 0, void 0, function*() {
                var t, i;
                const n = null === (i = null === (t = this.port) || void 0 === t ? void 0 : t.writable) || void 0 === i ? void 0 : i.getWriter();
                if (!n)
                    throw new Error("No writer available");
                b("sending data to board" + S(e)),
                yield n.write(e),
                b("data sent to board"),
                n.releaseLock()
            })
        }
    }
    var wt = function(e, t, i, n) {
        return new (i || (i = Promise))(function(o, s) {
            function r(e) {
                try {
                    c(n.next(e))
                } catch (e) {
                    s(e)
                }
            }
            function a(e) {
                try {
                    c(n.throw(e))
                } catch (e) {
                    s(e)
                }
            }
            function c(e) {
                var t;
                e.done ? o(e.value) : (t = e.value,
                t instanceof i ? t : new i(function(e) {
                    e(t)
                }
                )).then(r, a)
            }
            c((n = n.apply(e, t || [])).next())
        }
        )
    };
    const St = ["_", "q", "k", "b", "p", "n", "R", "P", "r", "B", "N", "Q", "K"]
      , Ct = new Uint8Array([65, 1, 12])
      , Pt = new Uint8Array([65, 1, 11]);
    class Mt {
        constructor(e) {
            this.batteryLevelBoard = 100,
            this.batteryLevelPieces = 100,
            b("ChessnutMoveHandler.constructor()"),
            this.chessnutBoard = e
        }
        queryBattery() {
            return this.chessnutBoard.sendDataToBoard(Ct, Et)
        }
        queryPieces() {
            return this.chessnutBoard.sendDataToBoard(Pt, Et)
        }
        processDataFromBoard(e, t) {
            return wt(this, void 0, void 0, function*() {
                if (t === Ft) {
                    if (65 === e[0] && 3 === e[1] && 12 === e[2])
                        return this.batteryLevelBoard = e[4],
                        void this.onBatteryChanged();
                    if (65 === e[0] && 137 === e[1] && 11 === e[2])
                        return void this.processDataFromPieces(e)
                } else if (t === It && e.length >= 36) {
                    const t = yield this.getBoardFromPositionData(e, 2);
                    return void (yield this.chessnutBoard.processNewPosition(t))
                }
                console.warn(`Unknown data from Chessnut Move board channel ${t}: ` + e[0].toString(16) + " " + e[1].toString(16))
            })
        }
        processDataFromPieces(e) {
            let t = 101;
            for (let i = 0; i < 32; i++) {
                const n = e[3 + 4 * i + 3];
                n < t && (t = n)
            }
            this.batteryLevelPieces = t,
            this.onBatteryChanged()
        }
        onBatteryChanged() {
            this.chessnutBoard.onBatteryChanged && (this.batteryLevelBoard < this.batteryLevelPieces ? this.chessnutBoard.onBatteryChanged(this.batteryLevelBoard, f.BOARD) : this.chessnutBoard.onBatteryChanged(this.batteryLevelPieces, f.PIECES))
        }
        sendLedStateToBoard(e) {
            return wt(this, void 0, void 0, function*() {
                (yield this.blackPiecesOnFirstRanks()) && (e = e.flipped());
                const t = new Uint8Array(34);
                t.fill(0),
                t[0] = 67,
                t[1] = 32;
                for (let i = 0; i < 32; i++) {
                    const n = 7 - Math.floor(i / 4)
                      , o = 7 - i % 4 * 2;
                    e.isLedOn(n, o) && (t[2 + i] |= 2),
                    e.isLedOn(n, o - 1) && (t[2 + i] |= 32)
                }
                return this.chessnutBoard.sendDataToBoard(t, Et)
            })
        }
        blackPiecesOnFirstRanks() {
            return wt(this, void 0, void 0, function*() {
                const e = yield this.chessnutBoard.siteManager.getOptions();
                return (yield this.chessnutBoard.siteManager.siteBoard.getPlayersColor()) === te.BLACK && e.reversePositionWhenBlack
            })
        }
        movePiecesTo(e) {
            return wt(this, void 0, void 0, function*() {
                e.print("ChessnutMoveHandler.movePiecesTo()"),
                (yield this.blackPiecesOnFirstRanks()) && (e = e.flipped());
                const t = new Uint8Array(35);
                t.fill(0),
                t[0] = 66,
                t[1] = 33,
                t[34] = 1;
                for (let i = 0; i < 32; i++) {
                    const n = 7 - Math.floor(i / 4)
                      , o = 7 - i % 4 * 2;
                    let s = new W(n,o);
                    if (!e.fieldIsEmpty(s)) {
                        const n = Mt.encodePiece(e.getPieceOnField(s), e.getColorOnField(s));
                        t[2 + i] |= n
                    }
                    if (s = new W(n,o - 1),
                    !e.fieldIsEmpty(s)) {
                        const n = Mt.encodePiece(e.getPieceOnField(s), e.getColorOnField(s));
                        t[2 + i] |= n << 4
                    }
                }
                yield this.chessnutBoard.sendDataToBoard(t, Et),
                yield this.queryPieces()
            })
        }
        static encodePiece(e, t) {
            let i = te.pieceAsString(e);
            return e !== te.EMPTY && t === te.WHITE && (i = i.toUpperCase()),
            St.indexOf(i)
        }
        static decodePiece(e) {
            if (e >= 0 && e < St.length) {
                const t = St[e]
                  , i = t === t.toUpperCase() ? te.WHITE : te.BLACK;
                return {
                    piece: te.pieceFromString(t),
                    color: i
                }
            }
            return {
                piece: te.EMPTY,
                color: te.EMPTY
            }
        }
        getBoardFromPositionData(e, t) {
            return wt(this, void 0, void 0, function*() {
                const i = new te;
                for (let n = 0; n < 32; n++) {
                    const o = e[t + n]
                      , s = 15 & o
                      , r = o >>> 4
                      , a = 7 - Math.floor(n / 4)
                      , c = 7 - n % 4 * 2;
                    let l = Mt.decodePiece(s);
                    l.piece !== te.EMPTY && i.setField(a, c, l.color, l.piece),
                    l = Mt.decodePiece(r),
                    l.piece !== te.EMPTY && i.setField(a, c - 1, l.color, l.piece)
                }
                return (yield this.blackPiecesOnFirstRanks()) ? i.flipped() : i
            })
        }
    }
    var Tt = function(e, t, i, n) {
        return new (i || (i = Promise))(function(o, s) {
            function r(e) {
                try {
                    c(n.next(e))
                } catch (e) {
                    s(e)
                }
            }
            function a(e) {
                try {
                    c(n.throw(e))
                } catch (e) {
                    s(e)
                }
            }
            function c(e) {
                var t;
                e.done ? o(e.value) : (t = e.value,
                t instanceof i ? t : new i(function(e) {
                    e(t)
                }
                )).then(r, a)
            }
            c((n = n.apply(e, t || [])).next())
        }
        )
    };
    const bt = new Uint8Array([41, 1, 0])
      , Bt = new Uint8Array([33, 1, 0])
      , Et = 0
      , It = 1
      , Ft = 2;
    class Lt extends ye {
        constructor(e) {
            super(e),
            this.chessnutMoveHandler = null,
            this.isProcessingPosition = !1
        }
        static setField(e, t, i, n) {
            0 !== n && e.setField(t, i, Lt.getColor(n), Lt.getPiece(n))
        }
        static getColor(e) {
            switch (e) {
            case 1:
            case 2:
            case 3:
            case 4:
            case 5:
            case 8:
                return te.BLACK;
            default:
                return te.WHITE
            }
        }
        static getPiece(e) {
            switch (e) {
            case 1:
            case 11:
                return te.QUEEN;
            case 2:
            case 12:
                return te.KING;
            case 3:
            case 9:
                return te.BISHOP;
            case 4:
            case 7:
                return te.PAWN;
            case 5:
            case 10:
                return te.KNIGHT;
            case 6:
            case 8:
                return te.ROOK
            }
            throw new Error("Illegal piece code: " + e)
        }
        writeLedStateToBuffer(e, t, i) {
            for (let n = 0; n < 8; n++)
                for (let o = 0; o < 8; o++)
                    if (e.isLedOn(n, o)) {
                        const e = i + (7 - n)
                          , s = 1 << 7 - o;
                        t[e] = t[e] | s
                    }
        }
        static getBoardFromPositionData(e, t) {
            const i = new te;
            for (let n = 0; n < 32; n++) {
                const o = e[t + n]
                  , s = 15 & o
                  , r = o >>> 4
                  , a = 7 - Math.floor(n / 4)
                  , c = 7 - n % 4 * 2;
                Lt.setField(i, a, c, s),
                Lt.setField(i, a, c - 1, r)
            }
            return i
        }
        isChessnutMoveBoard() {
            return null !== this.chessnutMoveHandler
        }
        queryBattery() {
            return Tt(this, void 0, void 0, function*() {
                this.chessnutMoveHandler ? yield this.chessnutMoveHandler.queryBattery() : yield this.sendDataToBoard(bt, Et)
            })
        }
        sendLedStateToBoard(e) {
            return Tt(this, void 0, void 0, function*() {
                if (e = null != e ? e : new we,
                this.chessnutMoveHandler)
                    yield this.chessnutMoveHandler.sendLedStateToBoard(e);
                else {
                    const t = new Uint8Array(10);
                    t.fill(0),
                    t[0] = 10,
                    t[1] = 8,
                    this.writeLedStateToBuffer(e, t, 2),
                    yield this.sendDataToBoard(t, Et)
                }
            })
        }
        initializeBoard(e) {
            return Tt(this, void 0, void 0, function*() {
                (null == e ? void 0 : e.toLowerCase().includes("chessnut move")) && (this.chessnutMoveHandler = new Mt(this)),
                yield this.sendDataToBoard(Bt, Et),
                yield this.queryBattery()
            })
        }
        processDataFromBoard(e, t) {
            return Tt(this, void 0, void 0, function*() {
                if (!this.isProcessingPosition) {
                    if (this.isProcessingPosition = !0,
                    this.chessnutMoveHandler)
                        yield this.chessnutMoveHandler.processDataFromBoard(e, t);
                    else if (1 !== e[0] || 36 !== e[1] && 61 !== e[1])
                        42 === e[0] && 2 === e[1] && this.onBatteryChanged ? this.onBatteryChanged(e[2], f.BATTERY) : console.warn(`Unknown data from Chessnut board channel ${t}: ` + e[0].toString(16) + " " + e[1].toString(16));
                    else {
                        const t = Lt.getBoardFromPositionData(e, 2);
                        yield this.processNewPosition(t)
                    }
                    this.isProcessingPosition = !1
                }
            })
        }
        processNewPosition(e) {
            return Tt(this, void 0, void 0, function*() {
                this.lastPositionReceived && this.lastPositionReceived.equals(e) || (this.lastPositionReceived = e,
                yield this.onBoardChanged(e))
            })
        }
        setSitePosition(e, t) {
            const i = Object.create(null, {
                setSitePosition: {
                    get: () => super.setSitePosition
                }
            });
            return Tt(this, void 0, void 0, function*() {
                var n;
                const o = yield i.setSitePosition.call(this, e, t);
                return o && (yield null === (n = this.chessnutMoveHandler) || void 0 === n ? void 0 : n.movePiecesTo(e)),
                o
            })
        }
        moveToStartingPosition() {
            return Tt(this, void 0, void 0, function*() {
                const e = yield this.siteManager.getOptions()
                  , t = yield i("confirmMoveHomePosition");
                (yield l(t, e.resUrl)) && (yield this.setSitePosition(te.getStartingPosition(), new le))
            })
        }
    }
    var Ot = function(e, t, i, n) {
        return new (i || (i = Promise))(function(o, s) {
            function r(e) {
                try {
                    c(n.next(e))
                } catch (e) {
                    s(e)
                }
            }
            function a(e) {
                try {
                    c(n.throw(e))
                } catch (e) {
                    s(e)
                }
            }
            function c(e) {
                var t;
                e.done ? o(e.value) : (t = e.value,
                t instanceof i ? t : new i(function(e) {
                    e(t)
                }
                )).then(r, a)
            }
            c((n = n.apply(e, t || [])).next())
        }
        )
    };
    const kt = "1b7e8261-2877-41c3-b46e-cf057c562023"
      , At = "1b7e8271-2877-41c3-b46e-cf057c562023"
      , Dt = "1b7e8272-2877-41c3-b46e-cf057c562023"
      , Rt = "1b7e8262-2877-41c3-b46e-cf057c562023"
      , Nt = "1b7e8273-2877-41c3-b46e-cf057c562023";
    class Ht extends Lt {
        constructor() {
            super(...arguments),
            this.disconnectListener = () => {
                this.siteManager.onSmartboardDisconnect()
            }
            ,
            this.positionListener = e => {
                this.onBleDataReceived(e)
            }
            ,
            this.confirmListener = e => {
                this.onBleConfirmReceived(e)
            }
        }
        getServiceUUIDs() {
            return [kt, At, "1b7e8281-2877-41c3-b46e-cf057c562023"]
        }
        getScanFilter() {
            return [{
                namePrefix: "Chessnut"
            }]
        }
        connectToDevice(e, t) {
            return Ot(this, void 0, void 0, function*() {
                var i;
                try {
                    (null === (i = e.name) || void 0 === i ? void 0 : i.toLowerCase().includes("chessnut move")) && (this.chessnutMoveHandler = new Mt(this)),
                    this.device = e,
                    this.siteManager.showStatusMessage("connecting (1/4)", !t);
                    const n = yield e.gatt.connect();
                    this.siteManager.showStatusMessage("connecting (2/4)", !t);
                    let o = yield ht.getCharacteristic(n, kt, Rt);
                    o.addEventListener("characteristicvaluechanged", this.positionListener),
                    o.startNotifications(),
                    this.siteManager.showStatusMessage("connecting (3/4)", !t),
                    o = yield ht.getCharacteristic(n, At, Nt),
                    o.addEventListener("characteristicvaluechanged", this.confirmListener),
                    o.startNotifications(),
                    this.siteManager.showStatusMessage("connecting (4/4)", !t),
                    this.writeChannel = yield ht.getCharacteristic(n, At, Dt),
                    yield this.initializeBoard(),
                    e.addEventListener("gattserverdisconnected", this.disconnectListener)
                } catch (e) {
                    throw yield T(e, !1),
                    this.siteManager.showStatusMessage("", !t),
                    e
                }
            })
        }
        disconnect() {
            var e, t, i;
            return null === (e = this.device) || void 0 === e || e.removeEventListener("gattserverdisconnected", this.disconnectListener),
            null === (t = this.device) || void 0 === t || t.removeEventListener("characteristicvaluechanged", this.positionListener),
            null === (i = this.device) || void 0 === i || i.removeEventListener("characteristicvaluechanged", this.confirmListener),
            super.disconnect()
        }
        onBleDataReceived(e) {
            const t = new Uint8Array(e.target.value.buffer,e.target.value.byteOffset,e.target.value.byteLength);
            super.processDataFromBoard(t, It)
        }
        onBleConfirmReceived(e) {
            const t = new Uint8Array(e.target.value.buffer,e.target.value.byteOffset,e.target.value.byteLength);
            super.processDataFromBoard(t, Ft)
        }
        sendDataToBoard(e) {
            return Ot(this, void 0, void 0, function*() {
                const t = this.siteManager.connectionManager;
                yield t.sendToBoard(e, this.writeChannel)
            })
        }
    }
    var xt = function(e, t, i, n) {
        return new (i || (i = Promise))(function(o, s) {
            function r(e) {
                try {
                    c(n.next(e))
                } catch (e) {
                    s(e)
                }
            }
            function a(e) {
                try {
                    c(n.throw(e))
                } catch (e) {
                    s(e)
                }
            }
            function c(e) {
                var t;
                e.done ? o(e.value) : (t = e.value,
                t instanceof i ? t : new i(function(e) {
                    e(t)
                }
                )).then(r, a)
            }
            c((n = n.apply(e, t || [])).next())
        }
        )
    };
    const Wt = 11648
      , Ut = new Uint8Array([1, 0]);
    class _t extends Lt {
        constructor() {
            super(...arguments),
            this.disconnectListener = e => {
                b(`HID disconnected: ${e.device.productName}`),
                e.device.vendorId === Wt && this.siteManager.onSmartboardDisconnect()
            }
            ,
            this.inputreportListener = e => {
                var t;
                if (e.device === this.hidDevice && 1 === e.reportId && 61 === e.data.getUint8(0) && (null === (t = this.siteManager.connectionManager) || void 0 === t ? void 0 : t.currentBoard) === this) {
                    const t = new Uint8Array(e.data.buffer,e.data.byteOffset,e.data.byteLength)
                      , i = Lt.getBoardFromPositionData(t, 1);
                    this.lastPositionReceived && this.lastPositionReceived.equals(i) || (this.lastPositionReceived = i,
                    this.onBoardChanged(i))
                }
            }
        }
        connectToDevice(e) {
            return xt(this, void 0, void 0, function*() {
                e.opened || (yield e.open()),
                this.hidDevice = e,
                navigator.hid.addEventListener("disconnect", this.disconnectListener),
                e.sendReport(33, Ut),
                e.addEventListener("inputreport", this.inputreportListener)
            })
        }
        disconnect() {
            var e;
            return navigator.hid.removeEventListener("disconnect", this.disconnectListener),
            null === (e = this.hidDevice) || void 0 === e || e.removeEventListener("inputreport", this.inputreportListener),
            this.hidDevice = null,
            super.disconnect()
        }
        getVendorId() {
            return Wt
        }
        getHidFilter() {
            return [{
                vendorId: Wt,
                usagePage: 65280
            }]
        }
        sendDataToBoard(e, t) {
            return xt(this, void 0, void 0, function*() {
                var t, i;
                e.length < 10 ? yield null === (t = this.hidDevice) || void 0 === t ? void 0 : t.sendReport(41, new Uint8Array(e)) : yield null === (i = this.hidDevice) || void 0 === i ? void 0 : i.sendReport(10, new Uint8Array(e))
            })
        }
        sendLedStateToBoard(e) {
            return xt(this, void 0, void 0, function*() {
                var t;
                e = null != e ? e : new we;
                const i = new Uint8Array(9);
                i.fill(0),
                i[0] = 8,
                this.writeLedStateToBuffer(e, i, 1),
                yield null === (t = this.hidDevice) || void 0 === t ? void 0 : t.sendReport(10, i)
            })
        }
    }
    class Gt {
        constructor(e, t) {
            this.needSecondSizeByte = !1,
            this.command = e,
            this.data = t,
            t && (this.size = t.length)
        }
        static byteArrayToHexString(e) {
            let t = "";
            for (const i of e)
                t += i.toString(16) + " ";
            return t
        }
        toString() {
            var e;
            return (null === (e = this.command) || void 0 === e ? void 0 : e.toString(16)) + ": " + (this.data ? Gt.byteArrayToHexString(new Uint8Array(this.data)) : "")
        }
    }
    var Kt = function(e, t, i, n) {
        return new (i || (i = Promise))(function(o, s) {
            function r(e) {
                try {
                    c(n.next(e))
                } catch (e) {
                    s(e)
                }
            }
            function a(e) {
                try {
                    c(n.throw(e))
                } catch (e) {
                    s(e)
                }
            }
            function c(e) {
                var t;
                e.done ? o(e.value) : (t = e.value,
                t instanceof i ? t : new i(function(e) {
                    e(t)
                }
                )).then(r, a)
            }
            c((n = n.apply(e, t || [])).next())
        }
        )
    };
    const qt = 100;
    class zt extends We {
        constructor() {
            super(...arguments),
            this.sendAndWaitBuffer = new s(500,2),
            this.sendTimer = p(0)
        }
        encodeMessage(e) {
            if (e.size) {
                const t = new Uint8Array(e.size + 3);
                return t[0] = e.command,
                t[1] = e.size + 1,
                t.set(e.data, 2),
                t[t.length - 1] = 0,
                t
            }
            return Uint8Array.from([e.command])
        }
        processDataFromBoard(e, t) {
            return Kt(this, void 0, void 0, function*() {
                for (const t of e)
                    128 & t ? this.currentIncomingMessage = new Gt(t) : this.currentIncomingMessage && (void 0 === this.currentIncomingMessage.size ? (this.currentIncomingMessage.size = t << 7,
                    this.currentIncomingMessage.data = [],
                    this.currentIncomingMessage.needSecondSizeByte = !0) : this.currentIncomingMessage.needSecondSizeByte ? (this.currentIncomingMessage.size += 127 & t,
                    this.currentIncomingMessage.needSecondSizeByte = !1) : (this.currentIncomingMessage.data.push(t),
                    this.currentIncomingMessage.data.length >= this.currentIncomingMessage.size - 3 && (yield this.handleMessageFromBoard(this.currentIncomingMessage),
                    this.currentIncomingMessage = null)))
            })
        }
        handleMessageFromBoard(e) {
            return Kt(this, void 0, void 0, function*() {
                const t = this.getClock();
                if (!this.sendAndWaitBuffer.receive(e))
                    switch (e.command) {
                    case 134:
                        yield this.parsePosition(e);
                        break;
                    case 142:
                        this.sendMessageToBoard(new Gt(66));
                        break;
                    case 160:
                        this.handleBatteryMessage(e);
                        break;
                    case 141:
                        yield null == t ? void 0 : t.handleClockMessage(e.data, this.siteManager);
                        break;
                    default:
                        b("Unhandled message from DGT board: " + e.toString())
                    }
            })
        }
        handleBatteryMessage(e) {
            const t = e.data[0];
            this.onBatteryChanged(t, f.BATTERY)
        }
        static fieldIndexOf(e) {
            return 8 * (7 - e.row) + e.col
        }
        static fieldFromIndex(e) {
            const t = e % 8
              , i = 7 - Math.floor(e / 8);
            return new W(i,t)
        }
        parsePosition(e) {
            return Kt(this, void 0, void 0, function*() {
                var t;
                const i = yield this.getBoardFromPositionData(e);
                i && !(null === (t = this.lastPositionReceived) || void 0 === t ? void 0 : t.equals(i)) && (this.lastPositionReceived = i,
                yield this.onBoardChanged(i))
            })
        }
        getBoardFromPositionData(e) {
            const t = new te;
            for (let i = 0; i < 8; i++)
                for (let n = 0; n < 8; n++) {
                    const o = 8 * (7 - i) + n
                      , s = e.data[o];
                    t.setField(i, n, this.colorOf(s), this.pieceOf(s))
                }
            return Promise.resolve(t)
        }
        colorOf(e) {
            return 0 === e ? te.EMPTY : e < 7 ? te.WHITE : te.BLACK
        }
        pieceOf(e) {
            return 1 === e || 7 === e ? te.PAWN : 2 === e || 8 === e ? te.ROOK : 3 === e || 9 === e ? te.KNIGHT : 4 === e || 10 === e ? te.BISHOP : 5 === e || 11 === e ? te.KING : 6 === e || 12 === e ? te.QUEEN : te.EMPTY
        }
        queryBattery() {
            return this.sendMessageToBoard(new Gt(76))
        }
        sendLedStateToBoard(e) {
            return Promise.resolve()
        }
        sendAndWait(e, t, i) {
            return Kt(this, void 0, void 0, function*() {
                return yield this.sendAndWaitBuffer.send( () => {
                    this.sendMessageToBoard(e)
                }
                , e => e.command === t, i)
            })
        }
        sendAndWaitClock(e) {
            return Kt(this, void 0, void 0, function*() {
                b("============= Sending message to clock: " + e.toString()),
                yield this.sendMessageToBoard(e);
                try {
                    return yield this.sendAndWaitBuffer.send( () => {
                        this.sendMessageToBoard(new Gt(65))
                    }
                    , e => {
                        const t = e.data.slice(0, 6).every(e => 0 === e);
                        return 141 === e.command && !t
                    }
                    , "Sending Message to Clock")
                } catch (e) {
                    return null
                }
            })
        }
        setSitePosition(e, t) {
            const i = Object.create(null, {
                setSitePosition: {
                    get: () => super.setSitePosition
                }
            });
            return Kt(this, void 0, void 0, function*() {
                return this.sitePosition && this.sitePosition.equals(e) || (yield this.sendMessageToBoard(new Gt(66))),
                yield i.setSitePosition.call(this, e, t)
            })
        }
    }
    var $t = function(e, t, i, n) {
        return new (i || (i = Promise))(function(o, s) {
            function r(e) {
                try {
                    c(n.next(e))
                } catch (e) {
                    s(e)
                }
            }
            function a(e) {
                try {
                    c(n.throw(e))
                } catch (e) {
                    s(e)
                }
            }
            function c(e) {
                var t;
                e.done ? o(e.value) : (t = e.value,
                t instanceof i ? t : new i(function(e) {
                    e(t)
                }
                )).then(r, a)
            }
            c((n = n.apply(e, t || [])).next())
        }
        )
    };
    class Yt {
        constructor(e) {
            this.lastLeverPosition = 0,
            this.pendingMove = null,
            this.serializer = new tt,
            this.sendFunc = e
        }
        reset() {
            return Promise.resolve()
        }
        update(e, t, i) {
            return $t(this, void 0, void 0, function*() {
                var n;
                if (this.leftColor = t,
                e.lifecycle === re.FINISHED)
                    yield this.sendAscii(this.gameResultAsString(e.gameResult).toUpperCase());
                else if ((null === (n = e.algebraic) || void 0 === n ? void 0 : n.length) > 0 && (null == i ? void 0 : i.showMovesOnClock))
                    yield this.sendAscii(e.algebraic.toUpperCase()),
                    this.pendingClockState = e;
                else if (e.hasTimeLeft()) {
                    if (e.isCountingDown()) {
                        let i = 0;
                        e.runningForPlayer === te.WHITE ? i = t === te.WHITE ? 1 : 2 : e.runningForPlayer === te.BLACK && (i = t === te.WHITE ? 2 : 1),
                        yield this.sendCommand([10, e.getHours(t), e.getMinutes(t), e.getSeconds(t), e.getHours(te.oppositeColor(t)), e.getMinutes(te.oppositeColor(t)), e.getSeconds(te.oppositeColor(t)), i])
                    }
                } else
                    yield this.sendCommand([3])
            })
        }
        clearTextDisplay() {
            return $t(this, void 0, void 0, function*() {
                this.pendingClockState && (this.pendingClockState.algebraic = "",
                yield this.update(this.pendingClockState, this.leftColor),
                this.pendingClockState = null)
            })
        }
        gameResultAsString(e) {
            return e === se.WHITE_WINS ? "1-0" : e === se.BLACK_WINS ? "0-1" : "0-0"
        }
        sendAscii(e) {
            return $t(this, void 0, void 0, function*() {
                e.length > 8 ? e = e.slice(0, 8) : e.length < 8 && (e = e.padEnd(8, " "));
                const t = (new TextEncoder).encode(e);
                yield this.sendCommand([12, ...t, 0])
            })
        }
        sendCommand(e) {
            return $t(this, void 0, void 0, function*() {
                yield this.serializer.enqueue( () => $t(this, void 0, void 0, function*() {
                    b("Dgt3000Sbi.sendCommand: " + S(Uint8Array.from(e))),
                    yield this.sendFunc(Yt.encodeCommand(e))
                }))
            })
        }
        static encodeCommand(e) {
            const t = [3, ...e];
            return new Gt(43,t)
        }
        disconnect() {
            return Promise.resolve()
        }
        setPendingMove(e) {
            this.pendingMove = e
        }
        setRunningForPlayer(e, t) {
            return Promise.resolve()
        }
        handleClockMessage(e, t) {
            return $t(this, void 0, void 0, function*() {
                var i, n;
                if (10 != (15 & e[1]) && 10 != (15 & e[4])) {
                    const o = yield t.getOptions()
                      , s = 2 & e[6];
                    if (o.transmitMovesOnClockPress && this.pendingMove && s !== this.lastLeverPosition) {
                        const e = this.pendingMove;
                        this.pendingMove = null,
                        yield t.siteBoard.makeMove(e),
                        yield null === (n = null === (i = t.connectionManager) || void 0 === i ? void 0 : i.currentBoard) || void 0 === n ? void 0 : n.queryBattery()
                    }
                    this.lastLeverPosition = s
                }
            })
        }
    }
    var Vt = function(e, t, i, n) {
        return new (i || (i = Promise))(function(o, s) {
            function r(e) {
                try {
                    c(n.next(e))
                } catch (e) {
                    s(e)
                }
            }
            function a(e) {
                try {
                    c(n.throw(e))
                } catch (e) {
                    s(e)
                }
            }
            function c(e) {
                var t;
                e.done ? o(e.value) : (t = e.value,
                t instanceof i ? t : new i(function(e) {
                    e(t)
                }
                )).then(r, a)
            }
            c((n = n.apply(e, t || [])).next())
        }
        )
    };
    class Qt extends zt {
        constructor(e, t) {
            super(e),
            this.sendSerializer = new tt,
            this.isRevelation2 = !1,
            this.disconnectListener = () => {
                this.siteManager.onSmartboardDisconnect()
            }
            ,
            this.isRevelation2 = t
        }
        connectToPort(e, t) {
            return Vt(this, void 0, void 0, function*() {
                try {
                    this.siteManager.showStatusMessage("connecting (1/4)", !t);
                    try {
                        yield e.close()
                    } catch (e) {}
                    this.siteManager.showStatusMessage("connecting (2/4)", !t);
                    try {
                        yield e.open({
                            baudRate: 9600,
                            dataBits: 8,
                            parity: "none",
                            stopBits: 1
                        })
                    } catch (e) {
                        yield T(e, !1)
                    }
                    this.port = e,
                    e.addEventListener("disconnect", this.disconnectListener),
                    this.readFromPort(e),
                    this.siteManager.showStatusMessage("connecting (3/4)", !t),
                    this.sendAndWaitBuffer && (this.sendAndWaitBuffer.isCanceled = !0),
                    this.sendAndWaitBuffer = new s(500,2),
                    yield this.initializeBoard(),
                    this.siteManager.showStatusMessage("connecting (4/4)", !t),
                    this.setBoardDumpTimeout()
                } catch (e) {
                    throw yield T(e, !1),
                    this.siteManager.showStatusMessage("", !t),
                    e
                }
            })
        }
        setBoardDumpTimeout() {
            this.boardDumpTimeout = setTimeout( () => {
                this.sendMessageToBoard(new Gt(66))
            }
            , 500)
        }
        disconnect() {
            const e = Object.create(null, {
                disconnect: {
                    get: () => super.disconnect
                }
            });
            return Vt(this, void 0, void 0, function*() {
                var t, i;
                if (Qt.reader)
                    try {
                        yield Qt.reader.cancel(),
                        yield null === (t = this.port) || void 0 === t ? void 0 : t.close()
                    } catch (e) {
                        yield T(e, !1)
                    }
                null === (i = this.port) || void 0 === i || i.removeEventListener("disconnect", this.disconnectListener),
                this.port = null,
                yield e.disconnect.call(this)
            })
        }
        initializeBoard() {
            return Vt(this, void 0, void 0, function*() {
                if (!this.isRevelation2) {
                    const e = yield this.sendAndWait(new Gt(71), 146, "Trademark");
                    b("Trademark: " + C(Uint8Array.from(e.data)))
                }
                yield this.sendMessageToBoard(new Gt(96,[2, 1, 0])),
                yield this.sendMessageToBoard(new Gt(96,[2, 2, 0])),
                yield this.sendMessageToBoard(new Gt(68)),
                yield this.sendMessageToBoard(new Gt(75)),
                yield this.sendMessageToBoard(new Gt(66)),
                (yield this.siteManager.getOptions()).clockType === k.DGT3000 && (this.clock = new Yt(e => Vt(this, void 0, void 0, function*() {
                    yield this.sendMessageToBoard(e)
                })))
            })
        }
        readFromPort(e) {
            return Vt(this, void 0, void 0, function*() {
                var t;
                try {
                    Qt.reader = e.readable.getReader()
                } catch (e) {
                    b("Error getting reader: " + e)
                }
                try {
                    let e = yield Qt.reader.read();
                    for (; !e.done; )
                        yield this.processDataFromBoard(e.value),
                        e = yield Qt.reader.read()
                } catch (e) {
                    yield T(e, !1)
                } finally {
                    null === (t = Qt.reader) || void 0 === t || t.releaseLock()
                }
            })
        }
        sendMessageToBoard(e) {
            return Vt(this, void 0, void 0, function*() {
                yield this.sendSerializer.enqueue( () => Vt(this, void 0, void 0, function*() {
                    const t = this.encodeMessage(e);
                    yield this.sendDataToBoard(t)
                }))
            })
        }
        sendDataToBoard(e) {
            return Vt(this, void 0, void 0, function*() {
                var t, i;
                yield this.sendTimer;
                const n = null === (i = null === (t = this.port) || void 0 === t ? void 0 : t.writable) || void 0 === i ? void 0 : i.getWriter();
                if (!n)
                    throw new Error("No writer available");
                yield n.write(e),
                n.releaseLock(),
                this.sendTimer = p(qt)
            })
        }
        lightLEDs(e, t) {
            return Vt(this, void 0, void 0, function*() {
                if (this.isRevelation2) {
                    let i;
                    if (e.equals(t))
                        i = [0, 64, 0];
                    else {
                        this.boardOrientation === fe.FLIPPED && (e = e.flipped(),
                        t = t.flipped()),
                        i = [1];
                        const n = e.computeMoveTo(t);
                        if (n)
                            i.push(zt.fieldIndexOf(n.fromField)),
                            i.push(zt.fieldIndexOf(n.toField));
                        else {
                            const n = e.computeModifiedFields(t);
                            for (const e of n)
                                i.length < 3 && i.push(zt.fieldIndexOf(e))
                        }
                        i.push(0)
                    }
                    b("lightLEDs: " + S(new Uint8Array(i))),
                    yield this.sendMessageToBoard(new Gt(96,i))
                }
            })
        }
        hasLEDs() {
            return !1
        }
        handleMessageFromBoard(e) {
            const t = Object.create(null, {
                handleMessageFromBoard: {
                    get: () => super.handleMessageFromBoard
                }
            });
            return Vt(this, void 0, void 0, function*() {
                134 === e.command && clearTimeout(this.boardDumpTimeout),
                yield t.handleMessageFromBoard.call(this, e),
                134 === e.command && this.setBoardDumpTimeout()
            })
        }
    }
    var jt = function(e, t, i, n) {
        return new (i || (i = Promise))(function(o, s) {
            function r(e) {
                try {
                    c(n.next(e))
                } catch (e) {
                    s(e)
                }
            }
            function a(e) {
                try {
                    c(n.throw(e))
                } catch (e) {
                    s(e)
                }
            }
            function c(e) {
                var t;
                e.done ? o(e.value) : (t = e.value,
                t instanceof i ? t : new i(function(e) {
                    e(t)
                }
                )).then(r, a)
            }
            c((n = n.apply(e, t || [])).next())
        }
        )
    };
    const Jt = [47, 61, 244, 163, 193, 175]
      , Xt = "6e400001-b5a3-f393-e0a9-e50e24dcca9e"
      , Zt = "6e400002-b5a3-f393-e0a9-e50e24dcca9e"
      , ei = "6e400003-b5a3-f393-e0a9-e50e24dcca9e";
    class ti extends zt {
        constructor() {
            super(...arguments),
            this.isProcessingPosition = !1,
            this.disconnectListener = () => {
                this.siteManager.onSmartboardDisconnect()
            }
            ,
            this.eventListener = e => {
                this.onBleDataReceived(e)
            }
        }
        getServiceUUIDs() {
            return [Xt]
        }
        getScanFilter() {
            return [{
                services: this.getServiceUUIDs()
            }]
        }
        connectToDevice(e, t) {
            return jt(this, void 0, void 0, function*() {
                try {
                    this.device = e,
                    this.siteManager.showStatusMessage("connecting (1/6)..", !t),
                    yield e.gatt.connect(),
                    this.siteManager.showStatusMessage("connecting (2/6)..", !t);
                    const i = yield ht.getCharacteristic(e.gatt, Xt, ei);
                    i.addEventListener("characteristicvaluechanged", this.eventListener),
                    i.startNotifications(),
                    this.siteManager.showStatusMessage("connecting (3/6)..", !t),
                    this.writeChannel = yield ht.getCharacteristic(e.gatt, Xt, Zt),
                    this.siteManager.showStatusMessage("connecting (4/6)..", !t),
                    this.sendAndWaitBuffer && (this.sendAndWaitBuffer.isCanceled = !0),
                    this.sendAndWaitBuffer = new s(500,2),
                    this.siteManager.showStatusMessage("connecting (5/6)..", !t),
                    yield this.initializeBoard(),
                    this.siteManager.showStatusMessage("connecting (6/6)..", !t),
                    e.addEventListener("gattserverdisconnected", this.disconnectListener)
                } catch (e) {
                    throw yield T(e, !1),
                    this.siteManager.showStatusMessage("", !t),
                    e
                }
            })
        }
        initializeBoard() {
            return jt(this, void 0, void 0, function*() {
                yield this.sendMessageToBoard(new Gt(64));
                let e = yield this.sendAndWait(new Gt(85), 162, "long serial");
                b("Long serial is " + String.fromCharCode(...e.data)),
                e = yield this.sendAndWait(new Gt(72), 150, "hardware version"),
                b("DGT board hardware version is " + e.data[0] + ", " + e.data[1]),
                yield this.sendMessageToBoard(new Gt(99,Jt)),
                e = yield this.sendAndWait(new Gt(90), 165, "devkey state"),
                b("Devkey state is " + e.data[0]),
                yield this.sendMessageToBoard(new Gt(68)),
                e = yield this.sendAndWait(new Gt(76), 160, "battery state"),
                b("Battery state is " + e.data[0] + "%")
            })
        }
        disconnect() {
            var e, t;
            return null === (e = this.device) || void 0 === e || e.removeEventListener("gattserverdisconnected", this.disconnectListener),
            null === (t = this.device) || void 0 === t || t.removeEventListener("characteristicvaluechanged", this.eventListener),
            super.disconnect()
        }
        onBleDataReceived(e) {
            return jt(this, void 0, void 0, function*() {
                if (!this.isProcessingPosition) {
                    this.isProcessingPosition = !0;
                    const t = e.target.value;
                    yield this.processDataFromBoard(new Uint8Array(t.buffer,t.byteOffset,t.byteLength)),
                    this.isProcessingPosition = !1
                }
            })
        }
        sendMessageToBoard(e) {
            const t = this.encodeMessage(e);
            return this.sendDataToBoard(t)
        }
        sendDataToBoard(e) {
            return jt(this, void 0, void 0, function*() {
                const t = this.siteManager.connectionManager;
                yield this.sendTimer,
                yield t.sendToBoard(e, this.writeChannel),
                this.sendTimer = p(qt)
            })
        }
        lightLEDs(e, t) {
            let i;
            if (e.equals(t))
                i = [0, 0];
            else {
                i = [3, 10];
                const n = e.computeMoveTo(t);
                if (n)
                    for (const e of ti.animateMove(n))
                        i.push(zt.fieldIndexOf(e));
                else {
                    const n = e.computeModifiedFields(t);
                    for (const e of n)
                        i.push(zt.fieldIndexOf(e))
                }
            }
            return this.sendMessageToBoard(new Gt(96,i)),
            Promise.resolve()
        }
        clearLEDs() {
            return this.sendMessageToBoard(new Gt(96,[0, 0])),
            Promise.resolve()
        }
        getBoardFromPositionData(e) {
            return jt(this, void 0, void 0, function*() {
                const t = this.createBinaryPosition(e);
                return yield this.getBoardFromBinaryPosition(t)
            })
        }
        createBinaryPosition(e) {
            const t = new He;
            for (let i = 0; i < 8; i++)
                for (let n = 0; n < 8; n++) {
                    const o = 8 * (7 - i) + n
                      , s = e.data[o]
                      , r = new W(i,n);
                    s && t.setPieceOnField(r)
                }
            return t
        }
        static animateMove(e) {
            let t = 0
              , i = 0;
            if (e.fromField.row === e.toField.row ? i = e.toField.col > e.fromField.col ? 1 : -1 : e.fromField.col === e.toField.col ? t = e.toField.row > e.fromField.row ? 1 : -1 : Math.abs(e.fromField.row - e.toField.row) === Math.abs(e.fromField.col - e.toField.col) && (i = e.toField.col > e.fromField.col ? 1 : -1,
            t = e.toField.row > e.fromField.row ? 1 : -1),
            t || i) {
                const n = []
                  , o = Math.max(Math.abs(e.fromField.row - e.toField.row), Math.abs(e.fromField.col - e.toField.col));
                for (let s = 0; s <= o; s++)
                    n.push(new W(e.fromField.row + s * t,e.fromField.col + s * i));
                return n
            }
            return [e.fromField, e.toField]
        }
    }
    class ii {
        constructor(e) {
            this.colorMoveStart = Ue.fromHtmlHexString(e.ledColorStart),
            this.colorMoveEnd = Ue.fromHtmlHexString(e.ledColorTarget),
            this.colorModifiedField = Ue.fromHtmlHexString(e.ledColor),
            this.colorCheck = Ue.fromHtmlHexString(e.ledColorCheck),
            this.brightessFactor = e.ledBrightness / 100
        }
        createLedState(e, t, i) {
            const n = e.computeMoveTo(t);
            let o;
            if (n && n.player !== i) {
                if (n.player === i)
                    o = new Ge(8);
                else if (o = this.createLedStateForMove(n),
                void 0 !== n.player && G(t, te.oppositeColor(n.player))) {
                    const e = K(t, te.oppositeColor(n.player));
                    o.setLed(e.row, e.col, this.colorCheck)
                }
            } else
                o = this.createLedStateForModifiedFields(t.computeModifiedFields(e));
            return o.dimTo(this.brightessFactor),
            o
        }
        createLedStateForMove(e) {
            const t = new Ge(8);
            return t.setLed(e.fromField.row, e.fromField.col, this.colorMoveStart),
            t.setLed(e.toField.row, e.toField.col, this.colorMoveEnd),
            t.isShowingMove = !0,
            t
        }
        createLedStateForModifiedFields(e) {
            const t = new Ge(8);
            for (const i of e)
                t.setLed(i.row, i.col, this.colorModifiedField);
            return t
        }
    }
    var ni = function(e, t, i, n) {
        return new (i || (i = Promise))(function(o, s) {
            function r(e) {
                try {
                    c(n.next(e))
                } catch (e) {
                    s(e)
                }
            }
            function a(e) {
                try {
                    c(n.throw(e))
                } catch (e) {
                    s(e)
                }
            }
            function c(e) {
                var t;
                e.done ? o(e.value) : (t = e.value,
                t instanceof i ? t : new i(function(e) {
                    e(t)
                }
                )).then(r, a)
            }
            c((n = n.apply(e, t || [])).next())
        }
        )
    };
    class oi extends ye {
        constructor(e, t) {
            super(e),
            this.currentInputLine = [],
            this.lastLedStateCommands = [],
            this.commandSerializer = new tt,
            t.showLedClock && (this.clock = new Je(this,Ue.fromHtmlHexString(t.ledClockColor),t.ledClockBrightness / 100,8))
        }
        ledStateCommands(e) {
            const t = [];
            if ((e = null != e ? e : new Ge(8)).isAllLedsOff())
                t.push(oi.ledStateCommmand(e, new Ue(0,0,0), !0));
            else {
                let i = !0;
                for (const n of e.getColors())
                    t.push(oi.ledStateCommmand(e, n, i)),
                    i = !1
            }
            return this.clock instanceof Je && t.push(...this.getLedClockCommands()),
            oi.commandArraysEqual(t, this.lastLedStateCommands) ? [] : (this.lastLedStateCommands = t,
            t)
        }
        static commandArraysEqual(e, t) {
            if (e.length !== t.length)
                return !1;
            for (let i = 0; i < e.length; i++)
                if (!e[i].every( (e, n) => e === t[i][n]))
                    return !1;
            return !0
        }
        getLedClockCommands() {
            const e = [];
            if (this.clock instanceof Je) {
                const t = this.clock.getClockLeds(te.BLACK)
                  , i = this.clock.getClockLeds(te.WHITE)
                  , n = [...new Set([...t, ...i])];
                for (const o of n)
                    e.push(this.getClockLedCommand(o, t, i))
            }
            return e
        }
        getClockLedCommand(e, t, i) {
            const n = new Uint8Array(16);
            return n.fill(0),
            n[0] = "E".charCodeAt(0),
            n[1] = "L".charCodeAt(0),
            n[2] = 240 | Math.ceil(e.red / 255 * 15),
            n[3] = Math.ceil(e.green / 255 * 15) << 4 | Math.ceil(e.blue / 255 * 15),
            n[4] = this.ledsAsBits(e, t),
            n[13] = this.ledsAsBits(e, i),
            n[14] = 0,
            n[15] = 255,
            n
        }
        ledsAsBits(e, t) {
            let i = 0;
            for (let n = 0; n < t.length; n++)
                e.equals(t[n]) && (i |= 1 << n);
            return i
        }
        static ledStateCommmand(e, t, i) {
            const n = new Uint8Array(16);
            n.fill(0),
            n[0] = "E".charCodeAt(0),
            n[1] = "L".charCodeAt(0),
            n[2] = 240 | Math.ceil(t.red / 255 * 15),
            n[3] = Math.ceil(t.green / 255 * 15) << 4 | Math.ceil(t.blue / 255 * 15),
            n[4] = 0,
            n[13] = 0,
            n[14] = 0 + (i ? 1 : 0),
            n[15] = 255;
            for (let i = 0; i < 8; i++)
                for (let o = 0; o < 8; o++)
                    e.hasColor(t, i, o) && (n[7 - i + 5] |= 1 << o);
            return n
        }
        processDataFromBoard(e) {
            for (const t of e)
                0 === this.currentInputLine.length ? t === "=".charCodeAt(0) && (this.currentInputLine[0] = t) : (this.currentInputLine.push(t),
                oi.commandIsComplete(this.currentInputLine) && (this.processCommand(new Uint8Array(this.currentInputLine)),
                this.currentInputLine.length = 0));
            return Promise.resolve()
        }
        static commandIsComplete(e) {
            if (e[0] !== "=".charCodeAt(0))
                return !0;
            switch (String.fromCharCode(e[1])) {
            case "p":
                return e.length >= 34;
            case "b":
                return e.length >= 4;
            default:
                return !0
            }
        }
        processCommand(e) {
            switch (String.fromCharCode(e[1])) {
            case "b":
                this.onBatteryChanged(e[3], f.BATTERY);
                break;
            case "p":
                this.processPositionReport(e)
            }
        }
        processPositionReport(e) {
            const t = oi.getBoardFromPositionData(e);
            this.lastPositionReceived && this.lastPositionReceived.equals(t) || (this.lastPositionReceived = t,
            this.onBoardChanged(t))
        }
        static getBoardFromPositionData(e) {
            const t = new te;
            for (let i = 0; i < 8; i++)
                for (let n = 0; n < 8; n++) {
                    const o = e[2 + (4 * (7 - i) + Math.floor(n / 2))]
                      , s = n % 2 == 0 ? o >> 4 : 15 & o;
                    t.setField(i, n, oi.getColorFromNibble(s), oi.getPieceFromNibble(s))
                }
            return t
        }
        static getColorFromNibble(e) {
            return e < 7 ? te.WHITE : te.BLACK
        }
        static getPieceFromNibble(e) {
            switch (e) {
            case 1:
            case 7:
                return te.PAWN;
            case 2:
            case 8:
                return te.KNIGHT;
            case 3:
            case 9:
                return te.BISHOP;
            case 4:
            case 10:
                return te.ROOK;
            case 5:
            case 11:
                return te.QUEEN;
            case 6:
            case 12:
                return te.KING;
            default:
                return te.EMPTY
            }
        }
        lightLEDs(e, t) {
            return ni(this, void 0, void 0, function*() {
                this.boardOrientation === fe.FLIPPED && (e = e.flipped(),
                t = t.flipped());
                const i = new ii(yield this.siteManager.getOptions()).createLedState(e, t, yield this.getPlayerColor())
                  , n = this.lastLedState;
                (null == n ? void 0 : n.isShowingMove) && 0 !== i.countLedsLit() || (b(`${i.countLedsLit()} LEDs need to be lit`),
                this.lastLedState && this.lastLedState.equals(i) || (b("Lighting " + i.countLedsLit() + " LEDs"),
                this.sendLedStateToBoard(i),
                this.lastLedState = i))
            })
        }
        clearLEDs() {
            return ni(this, void 0, void 0, function*() {
                yield this.sendLedStateToBoard(new Ge(8))
            })
        }
        supportsSoundEvent(e) {
            return ni(this, void 0, void 0, function*() {
                return (yield this.siteManager.getOptions()).moveSound === D.BEEP && e === R.OPPONENT_MOVED
            })
        }
        getBeepCommand() {
            return new Uint8Array(["E".charCodeAt(0), "S".charCodeAt(0), 129, 10, 0])
        }
        sendLedStateToBoard(e) {
            return this.commandSerializer.enqueue( () => ni(this, void 0, void 0, function*() {
                e = null != e ? e : new Ge(8);
                for (const t of this.ledStateCommands(e))
                    yield this.sendDataToBoard(t),
                    yield p(30)
            }))
        }
        reset() {
            const e = Object.create(null, {
                reset: {
                    get: () => super.reset
                }
            });
            return ni(this, void 0, void 0, function*() {
                yield e.reset.call(this),
                yield this.sendDataToBoard(P("RP"))
            })
        }
        queryBattery() {
            return this.commandSerializer.enqueue( () => ni(this, void 0, void 0, function*() {
                yield this.sendDataToBoard(P("RB"))
            }))
        }
        playSound(e) {
            return ni(this, void 0, void 0, function*() {
                const e = this.getBeepCommand();
                yield this.sendDataToBoard(e)
            })
        }
        sendStringToBoard(e) {
            return this.sendDataToBoard((new TextEncoder).encode(e))
        }
        initializeBoard() {
            return this.commandSerializer.enqueue( () => ni(this, void 0, void 0, function*() {
                yield this.sendStringToBoard("CPIRQ"),
                yield this.sendDataToBoard(P("RB"))
            }))
        }
    }
    var si = function(e, t, i, n) {
        return new (i || (i = Promise))(function(o, s) {
            function r(e) {
                try {
                    c(n.next(e))
                } catch (e) {
                    s(e)
                }
            }
            function a(e) {
                try {
                    c(n.throw(e))
                } catch (e) {
                    s(e)
                }
            }
            function c(e) {
                var t;
                e.done ? o(e.value) : (t = e.value,
                t instanceof i ? t : new i(function(e) {
                    e(t)
                }
                )).then(r, a)
            }
            c((n = n.apply(e, t || [])).next())
        }
        )
    };
    const ri = "iChessOne"
      , ai = "6e400001-b5a3-f393-e0a9-e50e24dcca9e"
      , ci = "6e400002-b5a3-f393-e0a9-e50e24dcca9e"
      , li = "6e400003-b5a3-f393-e0a9-e50e24dcca9e";
    class di extends oi {
        constructor() {
            super(...arguments),
            this.positionListener = e => {
                this.onDataReceived(e)
            }
            ,
            this.disconnectListener = () => {
                this.siteManager.onSmartboardDisconnect()
            }
        }
        getServiceUUIDs() {
            return [ai]
        }
        getScanFilter() {
            return [{
                namePrefix: ri
            }]
        }
        connectToDevice(e, t) {
            return si(this, void 0, void 0, function*() {
                try {
                    this.device = e,
                    this.siteManager.showStatusMessage("connecting (1/4)", !t);
                    const i = yield e.gatt.connect();
                    this.siteManager.showStatusMessage("connecting (2/4)", !t);
                    const n = yield ht.getCharacteristic(i, ai, li);
                    n.addEventListener("characteristicvaluechanged", this.positionListener),
                    n.startNotifications(),
                    this.siteManager.showStatusMessage("connecting (3/4)", !t),
                    this.writeChannel = yield ht.getCharacteristic(i, ai, ci),
                    yield this.initializeBoard(),
                    e.addEventListener("gattserverdisconnected", this.disconnectListener),
                    this.siteManager.showStatusMessage("connecting (4/4)", !t)
                } catch (e) {
                    throw yield T(e, !1),
                    this.siteManager.showStatusMessage("", !t),
                    e
                }
            })
        }
        sendDataToBoard(e) {
            return si(this, void 0, void 0, function*() {
                const t = this.siteManager.connectionManager;
                yield t.sendToBoard(e, this.writeChannel)
            })
        }
        disconnect() {
            var e, t;
            return null === (e = this.device) || void 0 === e || e.removeEventListener("gattserverdisconnected", this.disconnectListener),
            null === (t = this.device) || void 0 === t || t.removeEventListener("characteristicvaluechanged", this.positionListener),
            super.disconnect()
        }
        onDataReceived(e) {
            const t = new Uint8Array(e.target.value.buffer,e.target.value.byteOffset,e.target.value.byteLength);
            this.processDataFromBoard(new Uint8Array(t))
        }
    }
    class hi {
        static lengthOfCommand(e) {
            switch (e) {
            case "s":
                return 67;
            case "l":
            case "x":
                return 3;
            case "v":
            case "w":
            case "r":
                return 7;
            case "i":
                return 100;
            default:
                return 1
            }
        }
        static boardFromPositionData(e) {
            if ((null == e ? void 0 : e.length) < 65)
                return null;
            const t = new te;
            for (let i = 0; i < 8; i++)
                for (let n = 0; n < 8; n++) {
                    const o = hi.idxInPositionData(n, i);
                    hi.setField(t, n, i, e.charAt(o))
                }
            return t
        }
        static idxInPositionData(e, t) {
            return 7 - e + 1 + 8 * t
        }
        static setField(e, t, i, n) {
            const o = n >= "A" && n <= "Z" ? te.WHITE : te.BLACK
              , s = hi.getPieceCodeFromPositionData(n);
            e.setField(i, t, o, s)
        }
        static getPieceCodeFromPositionData(e) {
            switch (e[0].toLowerCase()) {
            case "k":
                return te.KING;
            case "q":
                return te.QUEEN;
            case "r":
                return te.ROOK;
            case "n":
                return te.KNIGHT;
            case "b":
                return te.BISHOP;
            case "p":
            case "o":
                return te.PAWN;
            case ".":
                return te.EMPTY
            }
            throw new Error("Illegal piece code: " + e)
        }
        static ledStateToCommandString(e, t, i) {
            const n = i instanceof Je ? i : null;
            if (null === n && e.isAllLedsOff())
                return "X";
            {
                let i = "L32";
                const o = hi.ledStateToBoardLeds(e, t);
                n && hi.addClockToBoardLeds(n, o);
                for (const e of o)
                    i += e;
                return i
            }
        }
        static addClockToBoardLeds(e, t) {
            const i = new Ue(0,0,0)
              , n = e.getClockLeds(te.BLACK)
              , o = e.getClockLeds(te.WHITE);
            for (let e = 0; e < o.length; e++)
                if (!o[e].equals(i)) {
                    const i = 9 * (8 - e);
                    "00" === t[i] && (t[i] = "FF")
                }
            for (let e = 0; e < n.length; e++)
                if (!n[e].equals(i)) {
                    const i = 9 * e + 8;
                    "00" === t[i] && (t[i] = "FF")
                }
        }
        static ledStateToBoardLeds(e, t) {
            const i = new Array(81);
            i.fill("00");
            let n = 0;
            for (let o = 0; o < 8; o++)
                for (let s = 0; s < 8; s++)
                    if (e.isLedOn(o, s)) {
                        const e = o + 9 * (7 - s)
                          , r = e + 1
                          , a = e + 9
                          , c = a + 1;
                        t ? (i[e] = n % 2 == 0 ? "55" : "AA",
                        i[r] = n % 2 == 0 ? "55" : "AA",
                        i[c] = n % 2 == 0 ? "55" : "AA",
                        i[a] = n % 2 == 0 ? "55" : "AA") : (i[e] = "FF",
                        i[r] = "FF",
                        i[c] = "FF",
                        i[a] = "FF"),
                        ++n
                    }
            return i
        }
    }
    class ui {
        static yParityBytesFor(e) {
            let t = 0;
            for (let i = 0; i < e.length; i++)
                t ^= e.charCodeAt(i);
            return (255 & t).toString(16).padStart(2, "0").toUpperCase()
        }
        static yParityOk(e) {
            if (e.length < 3)
                return !1;
            const t = ui.removeYParity(e);
            return e === t + ui.yParityBytesFor(t)
        }
        static computeXParity(e) {
            const t = new Uint8Array(e.length);
            for (let i = 0; i < e.length; i++)
                t[i] = ui.addParityBit(e[i]);
            return t
        }
        static addParityBit(e) {
            e |= 128;
            for (let t = 0; t < 7; t++)
                e & 1 << t && (e ^= 128);
            return e
        }
        static removeXParity(e) {
            let t = "";
            for (let i = 0; i < e.byteLength; i++)
                t += String.fromCharCode(127 & e[i]);
            return t
        }
        static removeYParity(e) {
            return e.substring(0, e.length - 2)
        }
    }
    ui.UUID_SERVICE = "49535343-fe7d-4ae5-8fa9-9fafd205e455",
    ui.UUID_CHARACTERISTIC_RECEIVE = "49535343-1e4d-4bd9-ba61-23c647249616",
    ui.UUID_CHARACTERISTIC_SEND = "49535343-8841-43f4-a8d4-ecbe34729bb3";
    var vi = function(e, t, i, n) {
        return new (i || (i = Promise))(function(o, s) {
            function r(e) {
                try {
                    c(n.next(e))
                } catch (e) {
                    s(e)
                }
            }
            function a(e) {
                try {
                    c(n.throw(e))
                } catch (e) {
                    s(e)
                }
            }
            function c(e) {
                var t;
                e.done ? o(e.value) : (t = e.value,
                t instanceof i ? t : new i(function(e) {
                    e(t)
                }
                )).then(r, a)
            }
            c((n = n.apply(e, t || [])).next())
        }
        )
    };
    class gi extends We {
        constructor(e, t) {
            super(e),
            this.isEone = !1,
            this.enableRCommand = !1,
            this.isMagnetMode = !1,
            this.sendAndWaitBuffer = new s(700,2),
            this.lastLedCommand = null,
            this.currentInputLine = null,
            this.vCommandReceived = !1,
            t.showLedClock && (this.clock = new Je(this,Ue.fromHtmlHexString(t.ledClockColor),1,9))
        }
        queryBattery() {
            return Promise.resolve()
        }
        isCommandLetter(e) {
            return this.enableRCommand ? "slxvwri".includes(e) : "slxvwi".includes(e)
        }
        sendCommand(e) {
            return e += ui.yParityBytesFor(e),
            this.sendDataToBoard((new TextEncoder).encode(e))
        }
        onCommandReceived(e) {
            return vi(this, void 0, void 0, function*() {
                this.sendAndWaitBuffer.receive(e),
                "s" !== e[0] || (yield this.onPositionUpdate(e))
            })
        }
        initializeBoard() {
            return vi(this, void 0, void 0, function*() {
                const e = yield this.sendCommandAndWait("V");
                if (b("Board version: " + e),
                this.isEone = !1,
                this.isMagnetMode = !1,
                e.slice(1, 3) >= "02") {
                    const e = (yield this.sendCommandAndWait("I00")).slice(3);
                    b("Boardname: " + e),
                    e.startsWith("e-one") && (b("Board is an e-one"),
                    this.isEone = !0,
                    this.clock = null)
                }
                try {
                    yield this.sendCommandAndWait("W0000"),
                    yield this.sendCommandAndWait("W0114"),
                    yield this.sendCommandAndWait("W0200"),
                    yield this.sendCommandAndWait("W030A"),
                    yield this.sendCommandAndWait("W04FF")
                } catch (e) {
                    console.warn("Board did not reply to W-Command. Probably a Performance board.")
                }
                if (this.isEone && this.getSitePosition()) {
                    const e = yield this.siteManager.siteBoard.getGameFormat();
                    yield this.configureEoneFor(e)
                }
            })
        }
        sendCommandAndWait(e) {
            return vi(this, void 0, void 0, function*() {
                return yield this.sendAndWaitBuffer.send( () => {
                    this.sendCommand(e)
                }
                , t => t[0] === e[0].toLowerCase(), e)
            })
        }
        sendLedStateToBoard(e) {
            return vi(this, void 0, void 0, function*() {
                e = null != e ? e : new we;
                const t = hi.ledStateToCommandString(e, !0, this.clock);
                t !== this.lastLedCommand && (this.lastLedCommand = t,
                yield this.sendCommand(t))
            })
        }
        onPositionUpdate(e) {
            return vi(this, void 0, void 0, function*() {
                let t = hi.boardFromPositionData(e);
                if (t && this.isEone && this.isMagnetMode) {
                    const e = He.createFromPosition(t);
                    t = yield this.getBoardFromBinaryPosition(e)
                }
                !t || this.lastPositionReceived && this.lastPositionReceived.equals(t) || (this.lastPositionReceived = t,
                this.onBoardChanged(t))
            })
        }
        processDataFromBoard(e) {
            return vi(this, void 0, void 0, function*() {
                for (const t of e) {
                    const e = String.fromCharCode(t);
                    if (this.vCommandReceived || "v" === e)
                        if (this.vCommandReceived = !0,
                        this.currentInputLine && this.currentInputLine.length > hi.lengthOfCommand(this.currentInputLine[0]) && (b("command too long: " + this.currentInputLine),
                        this.currentInputLine = null),
                        null === this.currentInputLine)
                            this.isCommandLetter(e) && (this.currentInputLine = e);
                        else {
                            const t = this.currentInputLine + e;
                            gi.commandIsComplete(t) ? (ui.yParityOk(t) ? yield this.onCommandReceived(ui.removeYParity(t)) : console.warn("Parity error in command: " + t),
                            this.currentInputLine = null) : this.currentInputLine += e
                        }
                }
            })
        }
        static commandIsComplete(e) {
            if ("i" === e[0]) {
                const t = e.indexOf("\n");
                return t > 0 && e.length === t + 3
            }
            return e.length === hi.lengthOfCommand(e[0])
        }
        setSitePosition(e, t) {
            const i = Object.create(null, {
                setSitePosition: {
                    get: () => super.setSitePosition
                }
            });
            return vi(this, void 0, void 0, function*() {
                var n;
                if ((!this.getSitePosition() || !(null === (n = this.getSitePosition()) || void 0 === n ? void 0 : n.equals(e))) && this.isEone && te.isNewGame(this.getSitePosition(), e)) {
                    const e = yield this.siteManager.siteBoard.getGameFormat();
                    yield this.configureEoneFor(e)
                }
                return i.setSitePosition.call(this, e, t)
            })
        }
        configureEoneFor(e) {
            return vi(this, void 0, void 0, function*() {
                if (this.isEone) {
                    this.enableRCommand = !0;
                    let t = Number.parseInt((yield this.sendCommandAndWait("R06")).slice(3), 16);
                    this.enableRCommand = !1,
                    t |= 4,
                    e === de.CHESS960 ? (t &= 223,
                    b("######### disabeling chess rules on e-one ########"),
                    this.isMagnetMode = !0) : (t |= 32,
                    b("######### enabeling chess rules on e-one ########"),
                    this.isMagnetMode = !1),
                    yield this.sendCommandAndWait("W06" + t.toString(16).toUpperCase().padStart(2, "0"))
                }
            })
        }
        getClock() {
            return this.clock
        }
        disconnect() {
            return this.sendAndWaitBuffer.cancelAll(),
            super.disconnect()
        }
    }
    var fi = function(e, t, i, n) {
        return new (i || (i = Promise))(function(o, s) {
            function r(e) {
                try {
                    c(n.next(e))
                } catch (e) {
                    s(e)
                }
            }
            function a(e) {
                try {
                    c(n.throw(e))
                } catch (e) {
                    s(e)
                }
            }
            function c(e) {
                var t;
                e.done ? o(e.value) : (t = e.value,
                t instanceof i ? t : new i(function(e) {
                    e(t)
                }
                )).then(r, a)
            }
            c((n = n.apply(e, t || [])).next())
        }
        )
    };
    class pi extends gi {
        constructor() {
            super(...arguments),
            this.serializer = new tt,
            this.disconnectListener = () => {
                this.siteManager.onSmartboardDisconnect()
            }
            ,
            this.dataListener = e => {
                const t = e;
                this.serializer.enqueue( () => {
                    const e = new Uint8Array(t.target.value.buffer,t.target.value.byteOffset,t.target.value.byteLength)
                      , i = ui.removeXParity(e);
                    return this.processDataFromBoard(P(i))
                }
                )
            }
        }
        getServiceUUIDs() {
            return [ui.UUID_SERVICE]
        }
        getScanFilter() {
            return [{
                namePrefix: "MILLENNIUM CHESS"
            }]
        }
        connectToDevice(e, t) {
            return fi(this, void 0, void 0, function*() {
                try {
                    this.device = e,
                    this.siteManager.showStatusMessage("connecting (1/3)", !t);
                    const i = yield e.gatt.connect();
                    this.siteManager.showStatusMessage("connecting (2/3)", !t),
                    this.writeChannel = yield ht.getCharacteristic(i, ui.UUID_SERVICE, ui.UUID_CHARACTERISTIC_SEND),
                    this.siteManager.showStatusMessage("connecting (3/3)", !t);
                    const n = yield ht.getCharacteristic(i, ui.UUID_SERVICE, ui.UUID_CHARACTERISTIC_RECEIVE);
                    n.addEventListener("characteristicvaluechanged", this.dataListener),
                    n.startNotifications(),
                    e.addEventListener("gattserverdisconnected", this.disconnectListener),
                    yield this.initializeBoard()
                } catch (e) {
                    throw yield T(e, !1),
                    this.siteManager.showStatusMessage("", !t),
                    e
                }
            })
        }
        disconnect() {
            var e, t;
            return null === (e = this.device) || void 0 === e || e.removeEventListener("gattserverdisconnected", this.disconnectListener),
            null === (t = this.device) || void 0 === t || t.removeEventListener("characteristicvaluechanged", this.dataListener),
            super.disconnect()
        }
        sendDataToBoard(e) {
            return fi(this, void 0, void 0, function*() {
                const t = this.siteManager.connectionManager;
                yield t.sendToBoard(ui.computeXParity(e), this.writeChannel)
            })
        }
    }
    var mi = function(e, t, i, n) {
        return new (i || (i = Promise))(function(o, s) {
            function r(e) {
                try {
                    c(n.next(e))
                } catch (e) {
                    s(e)
                }
            }
            function a(e) {
                try {
                    c(n.throw(e))
                } catch (e) {
                    s(e)
                }
            }
            function c(e) {
                var t;
                e.done ? o(e.value) : (t = e.value,
                t instanceof i ? t : new i(function(e) {
                    e(t)
                }
                )).then(r, a)
            }
            c((n = n.apply(e, t || [])).next())
        }
        )
    };
    class yi extends gi {
        constructor(e, t) {
            super(e, t),
            this.sendSerializer = new tt(150),
            this.disconnectListener = () => {
                this.siteManager.onSmartboardDisconnect()
            }
        }
        connectToPort(e, t) {
            return mi(this, void 0, void 0, function*() {
                try {
                    this.siteManager.showStatusMessage("connecting (1/4)..", !t);
                    try {
                        yield e.close()
                    } catch (e) {}
                    try {
                        yield e.open({
                            baudRate: 38400,
                            dataBits: 7,
                            parity: "odd",
                            stopBits: 1
                        })
                    } catch (e) {
                        yield T(e, !1)
                    }
                    this.siteManager.showStatusMessage("connecting (2/4)..", !t),
                    yield e.setSignals({
                        dataTerminalReady: !1
                    }),
                    this.port = e,
                    e.addEventListener("disconnect", this.disconnectListener),
                    this.readFromPort(e),
                    this.siteManager.showStatusMessage("connecting (3/4)..", !t),
                    yield this.initializeBoard(),
                    this.siteManager.showStatusMessage("connecting (4/4)..", !t)
                } catch (e) {
                    throw yield T(e, !1),
                    this.siteManager.showStatusMessage("", !t),
                    e
                }
            })
        }
        disconnect() {
            const e = Object.create(null, {
                disconnect: {
                    get: () => super.disconnect
                }
            });
            return mi(this, void 0, void 0, function*() {
                var t, i;
                if (this.sendSerializer = new tt(150),
                yi.reader)
                    try {
                        yield yi.reader.cancel(),
                        yield null === (t = this.port) || void 0 === t ? void 0 : t.close()
                    } catch (e) {
                        yield T(e, !1)
                    }
                null === (i = this.port) || void 0 === i || i.removeEventListener("disconnect", this.disconnectListener),
                this.port = null,
                yield e.disconnect.call(this)
            })
        }
        readFromPort(e) {
            return mi(this, void 0, void 0, function*() {
                var t;
                try {
                    yi.reader = e.readable.getReader(),
                    b("reader created")
                } catch (e) {}
                try {
                    let e = yield yi.reader.read();
                    for (; !e.done; )
                        yield this.processDataFromBoard(e.value),
                        e = yield yi.reader.read()
                } catch (e) {
                    yield T(e, !1)
                } finally {
                    yield this.disconnect(),
                    null === (t = yi.reader) || void 0 === t || t.releaseLock()
                }
                b("reader released")
            })
        }
        sendDataToBoard(e) {
            return this.sendSerializer.enqueue( () => mi(this, void 0, void 0, function*() {
                var t, i;
                const n = null === (i = null === (t = this.port) || void 0 === t ? void 0 : t.writable) || void 0 === i ? void 0 : i.getWriter();
                if (!n)
                    throw new Error("No writer available");
                yield n.write(e),
                n.releaseLock()
            }), C(e))
        }
    }
    var wi = function(e, t, i, n) {
        return new (i || (i = Promise))(function(o, s) {
            function r(e) {
                try {
                    c(n.next(e))
                } catch (e) {
                    s(e)
                }
            }
            function a(e) {
                try {
                    c(n.throw(e))
                } catch (e) {
                    s(e)
                }
            }
            function c(e) {
                var t;
                e.done ? o(e.value) : (t = e.value,
                t instanceof i ? t : new i(function(e) {
                    e(t)
                }
                )).then(r, a)
            }
            c((n = n.apply(e, t || [])).next())
        }
        )
    };
    class Si {
        constructor(e, t, i) {
            this.ledLightTimeMs = 500,
            this.sleepResolver = () => {}
            ,
            this.cancelPatternRunner = !1,
            this.currentPatternRunner = null,
            this.ledLightTimeMs = e,
            this.lightField = t,
            this.clearAll = i
        }
        set ledLightTime(e) {
            this.ledLightTimeMs = e
        }
        start(e) {
            return wi(this, void 0, void 0, function*() {
                yield this.stop(),
                this.currentLedState = e;
                const t = e.getLitFields();
                this.currentPatternRunner = this.runPattern(t.slice(0, 2))
            })
        }
        stop() {
            return wi(this, void 0, void 0, function*() {
                this.currentPatternRunner ? (this.cancelPatternRunner = !0,
                this.sleepResolver(),
                yield this.currentPatternRunner,
                this.currentPatternRunner = null) : yield this.clearAll(),
                this.currentLedState = null
            })
        }
        runPattern(e) {
            return wi(this, void 0, void 0, function*() {
                for (this.cancelPatternRunner = !1; !this.cancelPatternRunner; )
                    for (let t = 0; t < e.length && !this.cancelPatternRunner; t++) {
                        const i = e[t];
                        yield this.lightField(i),
                        yield new Promise(e => {
                            this.sleepResolver = e,
                            setTimeout(e, this.ledLightTimeMs)
                        }
                        )
                    }
                yield this.clearAll()
            })
        }
        getCurrentLedState() {
            return this.currentLedState
        }
    }
    var Ci = function(e, t, i, n) {
        return new (i || (i = Promise))(function(o, s) {
            function r(e) {
                try {
                    c(n.next(e))
                } catch (e) {
                    s(e)
                }
            }
            function a(e) {
                try {
                    c(n.throw(e))
                } catch (e) {
                    s(e)
                }
            }
            function c(e) {
                var t;
                e.done ? o(e.value) : (t = e.value,
                t instanceof i ? t : new i(function(e) {
                    e(t)
                }
                )).then(r, a)
            }
            c((n = n.apply(e, t || [])).next())
        }
        )
    };
    class Pi {
        constructor(e) {
            this.resetTimer = Promise.resolve(),
            this.pendingMove = null,
            this.sendFunc = e
        }
        reset() {
            return Ci(this, void 0, void 0, function*() {
                yield this.sendFunc([179]),
                this.resetTimer = p(1e3)
            })
        }
        clearTextDisplay() {
            return Promise.resolve()
        }
        update(e, t) {
            return Ci(this, void 0, void 0, function*() {
                const i = te.oppositeColor(t);
                e.blackMs > 0 && e.whiteMs > 0 && (yield this.resetTimer,
                yield this.sendFunc([174, e.getHours(t), e.getMinutes(t), e.getSeconds(t), e.getHours(i), e.getMinutes(i), e.getSeconds(i), 0]),
                e.runningForPlayer === t ? yield this.sendFunc([180]) : e.runningForPlayer === i ? yield this.sendFunc([181]) : yield this.sendFunc([175]))
            })
        }
        setRunningForPlayer(e, t) {
            return Ci(this, void 0, void 0, function*() {
                e === t ? yield this.sendFunc([180]) : yield this.sendFunc([181])
            })
        }
        disconnect() {
            return Promise.resolve()
        }
        setPendingMove(e) {
            this.pendingMove = e
        }
        processClockMessage(e, t) {
            return Ci(this, void 0, void 0, function*() {
                var i, n;
                const o = yield t.getOptions();
                if (o.transmitMovesOnClockPress && this.pendingMove) {
                    const s = yield t.siteBoard.getPlayersColor()
                      , r = le.colorOnLeftSide(o, s)
                      , a = !!(128 & e[7])
                      , c = 64 & e[7] ? te.oppositeColor(r) : r;
                    if (a && c !== s) {
                        const e = this.pendingMove;
                        this.pendingMove = null,
                        yield t.siteBoard.makeMove(e),
                        yield null === (n = null === (i = t.connectionManager) || void 0 === i ? void 0 : i.currentBoard) || void 0 === n ? void 0 : n.queryBattery()
                    }
                }
            })
        }
    }
    var Mi = function(e, t, i, n) {
        return new (i || (i = Promise))(function(o, s) {
            function r(e) {
                try {
                    c(n.next(e))
                } catch (e) {
                    s(e)
                }
            }
            function a(e) {
                try {
                    c(n.throw(e))
                } catch (e) {
                    s(e)
                }
            }
            function c(e) {
                var t;
                e.done ? o(e.value) : (t = e.value,
                t instanceof i ? t : new i(function(e) {
                    e(t)
                }
                )).then(r, a)
            }
            c((n = n.apply(e, t || [])).next())
        }
        )
    };
    class Ti extends ye {
        constructor(e, t, i) {
            super(e),
            this.ledSerializer = new tt,
            this.sendSerializer = new tt,
            this.onlyShowLedsForOpponentPieces = !0,
            this.ledLighter = new Si(t,e => Mi(this, void 0, void 0, function*() {
                yield this.sendDataToBoard(new Uint8Array([100 + 8 * e.row + e.col]))
            }), () => Mi(this, void 0, void 0, function*() {
                yield this.sendDataToBoard(new Uint8Array([186]))
            })),
            i.clockType === k.TAPNSET_ADAPTER && (this.clock = new Pi(e => this.sendDataToBoard(new Uint8Array(e))))
        }
        queryBattery() {
            return Promise.resolve()
        }
        sendLedStateToBoard(e) {
            return Mi(this, void 0, void 0, function*() {
                var t;
                (e = null != e ? e : new we).equals(null !== (t = this.ledLighter.getCurrentLedState()) && void 0 !== t ? t : new we) || (yield this.ledSerializer.enqueue( () => Mi(this, void 0, void 0, function*() {
                    e.isAllLedsOff() || e.countLedsLit() > 4 ? yield this.ledLighter.stop() : yield this.ledLighter.start(e)
                }), "", !0))
            })
        }
        static getBoardFromPositionData(e) {
            const t = new te;
            for (let i = 0; i < 8; i++)
                for (let n = 0; n < 8; n++) {
                    const o = Ti.getNibbleFromPositionData(i, n, e)
                      , s = Ti.getPieceFromPositionData(o);
                    t.setField(i, n, te.colorOnly(s), te.pieceOnly(s))
                }
            return t
        }
        static getNibbleFromPositionData(e, t, i) {
            const n = 8 * e + t
              , o = n % 2 != 0
              , s = i[Math.floor(n / 2)];
            return o ? (240 & s) >> 4 : 15 & s
        }
        static getPieceFromPositionData(e) {
            switch (e) {
            case 1:
                return te.WHITE | te.KING;
            case 2:
                return te.WHITE | te.QUEEN;
            case 3:
                return te.WHITE | te.ROOK;
            case 4:
                return te.WHITE | te.KNIGHT;
            case 5:
                return te.WHITE | te.BISHOP;
            case 6:
                return te.WHITE | te.PAWN;
            case 7:
                return te.BLACK | te.KING;
            case 8:
                return te.BLACK | te.QUEEN;
            case 9:
                return te.BLACK | te.ROOK;
            case 10:
                return te.BLACK | te.KNIGHT;
            case 11:
                return te.BLACK | te.BISHOP;
            case 12:
                return te.BLACK | te.PAWN;
            default:
                return te.EMPTY
            }
        }
        getClock() {
            return this.clock
        }
        parseInputData(e) {
            return Mi(this, void 0, void 0, function*() {
                if (32 === e.byteLength && 255 !== e[0]) {
                    const t = Ti.getBoardFromPositionData(e);
                    this.lastPositionReceived && this.lastPositionReceived.equals(t) || (this.lastPositionReceived = t,
                    this.onBoardChanged(t))
                } else
                    255 === e[0] && 202 === e[1] && this.clock && "function" == typeof this.clock.processClockMessage && (yield this.clock.processClockMessage(e, this.siteManager))
            })
        }
        processDataFromBoard(e) {
            throw new Error("Not implemented")
        }
    }
    var bi = function(e, t, i, n) {
        return new (i || (i = Promise))(function(o, s) {
            function r(e) {
                try {
                    c(n.next(e))
                } catch (e) {
                    s(e)
                }
            }
            function a(e) {
                try {
                    c(n.throw(e))
                } catch (e) {
                    s(e)
                }
            }
            function c(e) {
                var t;
                e.done ? o(e.value) : (t = e.value,
                t instanceof i ? t : new i(function(e) {
                    e(t)
                }
                )).then(r, a)
            }
            c((n = n.apply(e, t || [])).next())
        }
        )
    };
    const Bi = 2341;
    class Ei extends Ti {
        constructor(e, t) {
            super(e, 1e3, t),
            this.disconnectListener = e => {
                b(`HID disconnected: ${e.device.productName}`),
                e.device.vendorId === Bi && this.siteManager.onSmartboardDisconnect()
            }
            ,
            this.inputreportListener = e => {
                var t;
                e.reportId >= 0 && this.parseInputData((t = e.data,
                new Uint8Array(t.buffer,t.byteOffset,t.byteLength)))
            }
            ,
            this.sendSerializer.setPauseMs(50)
        }
        connectToDevice(e) {
            return bi(this, void 0, void 0, function*() {
                e.opened || (yield e.open()),
                this.hidDevice = e,
                navigator.hid.addEventListener("disconnect", this.disconnectListener),
                e.addEventListener("inputreport", this.inputreportListener)
            })
        }
        disconnect() {
            var e;
            return navigator.hid.removeEventListener("disconnect", this.disconnectListener),
            null === (e = this.hidDevice) || void 0 === e || e.removeEventListener("inputreport", this.inputreportListener),
            this.hidDevice = null,
            super.disconnect()
        }
        getVendorId() {
            return Bi
        }
        getHidFilter() {
            return [{
                vendorId: Bi
            }]
        }
        sendDataToBoard(e) {
            return this.sendSerializer.enqueue( () => bi(this, void 0, void 0, function*() {
                var t;
                try {
                    for (const i of e)
                        yield null === (t = this.hidDevice) || void 0 === t ? void 0 : t.sendReport(0, Uint8Array.from([i]))
                } catch (e) {
                    console.error("Error sending data to board:", e)
                }
            }))
        }
    }
    var Ii = function(e, t, i, n) {
        return new (i || (i = Promise))(function(o, s) {
            function r(e) {
                try {
                    c(n.next(e))
                } catch (e) {
                    s(e)
                }
            }
            function a(e) {
                try {
                    c(n.throw(e))
                } catch (e) {
                    s(e)
                }
            }
            function c(e) {
                var t;
                e.done ? o(e.value) : (t = e.value,
                t instanceof i ? t : new i(function(e) {
                    e(t)
                }
                )).then(r, a)
            }
            c((n = n.apply(e, t || [])).next())
        }
        )
    };
    class Fi extends ye {
        constructor() {
            super(...arguments),
            this.currentInputLine = ""
        }
        parseInputData(e) {
            return Ii(this, void 0, void 0, function*() {
                for (const t of e)
                    0 === this.currentInputLine.length ? "#" === t && (this.currentInputLine = t) : "\n" === t ? (yield this.processMessage(this.currentInputLine),
                    this.currentInputLine = "") : this.currentInputLine += t
            })
        }
        processMessage(e) {
            return Ii(this, void 0, void 0, function*() {
                e.startsWith("#FEN:") && (yield this.processPositionReport(e))
            })
        }
        processPositionReport(e) {
            return Ii(this, void 0, void 0, function*() {
                var t;
                clearTimeout(this.boardDumpTimeout);
                const i = e.slice(5)
                  , n = ge.createPositionFromFen(i);
                n && !(null === (t = this.lastPositionReceived) || void 0 === t ? void 0 : t.equals(n)) && (this.lastPositionReceived = n,
                yield this.onBoardChanged(n)),
                this.setBoardDumpTimeout()
            })
        }
        setBoardDumpTimeout() {
            this.boardDumpTimeout = setTimeout( () => {
                this.sendStringToBoard("#FEN:?\r\n")
            }
            , 500)
        }
        sendStringToBoard(e) {
            return this.sendDataToBoard((new TextEncoder).encode(e))
        }
        sendLedStateToBoard(e) {
            return Ii(this, void 0, void 0, function*() {
                if (this.sitePosition) {
                    const e = ge.createFenFromPosition(this.sitePosition, de.NORMAL_CHESS);
                    yield this.sendStringToBoard("#FEN:" + e + "\r\n")
                }
            })
        }
        queryBattery() {
            return Promise.resolve()
        }
    }
    var Li = function(e, t, i, n) {
        return new (i || (i = Promise))(function(o, s) {
            function r(e) {
                try {
                    c(n.next(e))
                } catch (e) {
                    s(e)
                }
            }
            function a(e) {
                try {
                    c(n.throw(e))
                } catch (e) {
                    s(e)
                }
            }
            function c(e) {
                var t;
                e.done ? o(e.value) : (t = e.value,
                t instanceof i ? t : new i(function(e) {
                    e(t)
                }
                )).then(r, a)
            }
            c((n = n.apply(e, t || [])).next())
        }
        )
    };
    const Oi = "0000ffe0-0000-1000-8000-00805f9b34fb"
      , ki = "0000ffe1-0000-1000-8000-00805f9b34fb";
    class Ai extends Fi {
        constructor() {
            super(...arguments),
            this.positionListener = e => {
                this.onDataReceived(e)
            }
            ,
            this.disconnectListener = () => {
                this.siteManager.onSmartboardDisconnect()
            }
        }
        getServiceUUIDs() {
            return [Oi]
        }
        getScanFilter() {
            return [{
                namePrefix: "QM"
            }]
        }
        connectToDevice(e, t) {
            return Li(this, void 0, void 0, function*() {
                try {
                    this.device = e,
                    this.siteManager.showStatusMessage("connecting (1/3)", !t);
                    const i = yield e.gatt.connect();
                    this.siteManager.showStatusMessage("connecting (2/3)", !t),
                    this.boardChannel = yield ht.getCharacteristic(i, Oi, ki),
                    this.boardChannel.addEventListener("characteristicvaluechanged", this.positionListener),
                    yield this.boardChannel.startNotifications(),
                    e.addEventListener("gattserverdisconnected", this.disconnectListener),
                    this.siteManager.showStatusMessage("connecting (3/3)", !t),
                    this.setBoardDumpTimeout()
                } catch (e) {
                    throw yield T(e, !1),
                    this.siteManager.showStatusMessage("", !t),
                    e
                }
            })
        }
        sendDataToBoard(e) {
            return Li(this, void 0, void 0, function*() {
                return this.siteManager.connectionManager.sendToBoard(e, this.boardChannel)
            })
        }
        disconnect() {
            var e, t;
            return null === (e = this.device) || void 0 === e || e.removeEventListener("gattserverdisconnected", this.disconnectListener),
            null === (t = this.device) || void 0 === t || t.removeEventListener("characteristicvaluechanged", this.positionListener),
            super.disconnect()
        }
        onDataReceived(e) {
            const t = M(e.target.value);
            this.parseInputData(t)
        }
        processDataFromBoard(e) {
            return super.parseInputData(C(e))
        }
    }
    var Di = function(e, t, i, n) {
        return new (i || (i = Promise))(function(o, s) {
            function r(e) {
                try {
                    c(n.next(e))
                } catch (e) {
                    s(e)
                }
            }
            function a(e) {
                try {
                    c(n.throw(e))
                } catch (e) {
                    s(e)
                }
            }
            function c(e) {
                var t;
                e.done ? o(e.value) : (t = e.value,
                t instanceof i ? t : new i(function(e) {
                    e(t)
                }
                )).then(r, a)
            }
            c((n = n.apply(e, t || [])).next())
        }
        )
    };
    class Ri extends st {
        constructor(e, t) {
            super(e, t),
            this.board = t
        }
        connectToBoard() {
            return Di(this, void 0, void 0, function*() {
                if (yield this.checkAvailability())
                    try {
                        const e = {
                            filters: this.board.getHidFilter()
                        }
                          , t = yield navigator.hid.requestDevice(e);
                        if (t.length > 0) {
                            const e = t[0];
                            yield this.siteManager.startConnecting(!0),
                            yield this.board.disconnect(),
                            yield this.board.connectToDevice(e, !0),
                            this.currentBoard = this.board,
                            yield this.siteManager.onSmartboardConnect(this.currentBoard),
                            yield this.siteManager.saveOptionProperty("lastHidDevice", Ri.getDeviceId(e))
                        }
                    } catch (e) {
                        yield T(e, !1)
                    }
                return null !== this.currentBoard
            })
        }
        checkAvailability() {
            return Di(this, void 0, void 0, function*() {
                const e = yield this.siteManager.getOptions();
                return "hid"in navigator || (d(yield i("NoHidAPI"), e.resUrl),
                !1)
            })
        }
        tryReconnect() {
            return Di(this, void 0, void 0, function*() {
                const e = yield this.siteManager.getOptions();
                if ("function" == typeof navigator.hid.getDevices) {
                    const t = yield navigator.hid.getDevices();
                    for (const i of t)
                        if (Ri.getDeviceId(i) === e.lastHidDevice && !this.isConnected() && !this.currentBoard)
                            return yield this.siteManager.startConnecting(!1),
                            void this.reconnectToDevice(i)
                }
            })
        }
        static getDeviceId(e) {
            return e.vendorId + ":" + e.productId
        }
        reconnectToDevice(e) {
            return Di(this, void 0, void 0, function*() {
                yield this.board.connectToDevice(e, !1),
                this.currentBoard = this.board,
                this.siteManager.onSmartboardConnect(this.board)
            })
        }
        startReconnectService() {
            setTimeout( () => {
                this.stopReconnectService()
            }
            , ot),
            this.reconnectAbortController = new AbortController;
            const e = setInterval( () => {
                this.isConnected() ? this.stopReconnectService() : this.tryReconnect()
            }
            , 2e3);
            return this.reconnectAbortController.signal.addEventListener("abort", () => {
                clearInterval(e)
            }
            ),
            Promise.resolve()
        }
    }
    var Ni = function(e, t, i, n) {
        return new (i || (i = Promise))(function(o, s) {
            function r(e) {
                try {
                    c(n.next(e))
                } catch (e) {
                    s(e)
                }
            }
            function a(e) {
                try {
                    c(n.throw(e))
                } catch (e) {
                    s(e)
                }
            }
            function c(e) {
                var t;
                e.done ? o(e.value) : (t = e.value,
                t instanceof i ? t : new i(function(e) {
                    e(t)
                }
                )).then(r, a)
            }
            c((n = n.apply(e, t || [])).next())
        }
        )
    };
    class Hi extends st {
        constructor(e, t) {
            super(e, t),
            this.board = t
        }
        connectToBoard() {
            return Ni(this, void 0, void 0, function*() {
                if (yield this.checkAvailability())
                    try {
                        const e = yield navigator.serial.requestPort();
                        yield this.siteManager.startConnecting(!0),
                        yield this.board.connectToPort(e, !0),
                        this.currentBoard = this.board,
                        yield this.siteManager.onSmartboardConnect(this.currentBoard),
                        yield this.siteManager.saveOptionProperty("lastSerialPort", this.getPortId(e))
                    } catch (e) {
                        yield T(e, !1)
                    }
                return null !== this.currentBoard
            })
        }
        checkAvailability() {
            return Ni(this, void 0, void 0, function*() {
                const e = yield this.siteManager.getOptions();
                return "serial"in navigator || (d(yield i("NoSerialAPI"), e.resUrl),
                !1)
            })
        }
        tryReconnect() {
            return Ni(this, void 0, void 0, function*() {
                var e;
                const t = yield this.siteManager.getOptions();
                if ("function" == typeof (null === (e = navigator.serial) || void 0 === e ? void 0 : e.getPorts)) {
                    const e = yield navigator.serial.getPorts();
                    for (const i of e)
                        if (this.getPortId(i) === t.lastSerialPort && !this.isConnected() && !this.currentBoard) {
                            yield this.siteManager.startConnecting(!1);
                            try {
                                return void (yield this.reconnectToPort(i))
                            } catch (e) {
                                b("Error while trying to reconnect to port" + e)
                            }
                        }
                }
            })
        }
        getPortId(e) {
            return e.getInfo().usbProductId + ":" + e.getInfo().usbVendorId
        }
        reconnectToPort(e) {
            return Ni(this, void 0, void 0, function*() {
                yield this.board.disconnect(),
                yield this.board.connectToPort(e, !1),
                this.currentBoard = this.board,
                this.siteManager.onSmartboardConnect(this.board)
            })
        }
        startReconnectService() {
            let e = !1;
            setTimeout( () => {
                this.stopReconnectService()
            }
            , ot),
            this.reconnectAbortController = new AbortController;
            const t = setInterval( () => {
                e || (e = !0,
                this.isConnected() ? (this.stopReconnectService(),
                e = !1) : this.tryReconnect().then( () => {
                    e = !1
                }
                ).catch( () => {
                    e = !1
                }
                ))
            }
            , 2e3);
            return this.reconnectAbortController.signal.addEventListener("abort", () => {
                clearInterval(t)
            }
            ),
            Promise.resolve()
        }
    }
    var xi = function(e, t, i, n) {
        return new (i || (i = Promise))(function(o, s) {
            function r(e) {
                try {
                    c(n.next(e))
                } catch (e) {
                    s(e)
                }
            }
            function a(e) {
                try {
                    c(n.throw(e))
                } catch (e) {
                    s(e)
                }
            }
            function c(e) {
                var t;
                e.done ? o(e.value) : (t = e.value,
                t instanceof i ? t : new i(function(e) {
                    e(t)
                }
                )).then(r, a)
            }
            c((n = n.apply(e, t || [])).next())
        }
        )
    };
    class Wi extends oi {
        constructor() {
            super(...arguments),
            this.sendSerializer = new tt(150),
            this.disconnectListener = () => {
                this.siteManager.onSmartboardDisconnect()
            }
        }
        connectToPort(e, t) {
            return xi(this, void 0, void 0, function*() {
                try {
                    this.siteManager.showStatusMessage("connecting (1/4)..", !t);
                    try {
                        yield e.close()
                    } catch (e) {}
                    try {
                        yield e.open({
                            baudRate: 115200,
                            dataBits: 8,
                            parity: "none",
                            stopBits: 1
                        })
                    } catch (e) {
                        yield T(e, !1)
                    }
                    this.siteManager.showStatusMessage("connecting (2/4)..", !t),
                    this.port = e,
                    e.addEventListener("disconnect", this.disconnectListener),
                    this.readFromPort(e),
                    this.siteManager.showStatusMessage("connecting (3/4)..", !t),
                    yield this.initializeBoard(),
                    this.siteManager.showStatusMessage("connecting (4/4)..", !t)
                } catch (e) {
                    throw yield T(e, !1),
                    this.siteManager.showStatusMessage("", !t),
                    e
                }
            })
        }
        disconnect() {
            const e = Object.create(null, {
                disconnect: {
                    get: () => super.disconnect
                }
            });
            return xi(this, void 0, void 0, function*() {
                var t, i;
                if (Wi.reader)
                    try {
                        yield Wi.reader.cancel(),
                        yield null === (t = this.port) || void 0 === t ? void 0 : t.close()
                    } catch (e) {
                        yield T(e, !1)
                    }
                null === (i = this.port) || void 0 === i || i.removeEventListener("disconnect", this.disconnectListener),
                this.port = null,
                yield e.disconnect.call(this)
            })
        }
        readFromPort(e) {
            return xi(this, void 0, void 0, function*() {
                var t;
                try {
                    Wi.reader = e.readable.getReader()
                } catch (e) {}
                try {
                    let e = yield Wi.reader.read();
                    for (; !e.done; )
                        yield this.processDataFromBoard(e.value),
                        e = yield Wi.reader.read()
                } catch (e) {
                    yield T(e, !1)
                } finally {
                    null === (t = Wi.reader) || void 0 === t || t.releaseLock()
                }
            })
        }
        sendDataToBoard(e) {
            return this.sendSerializer.enqueue( () => xi(this, void 0, void 0, function*() {
                var t, i;
                const n = null === (i = null === (t = this.port) || void 0 === t ? void 0 : t.writable) || void 0 === i ? void 0 : i.getWriter();
                if (!n)
                    throw new Error("No writer available");
                yield n.write(e),
                n.releaseLock()
            }))
        }
    }
    var Ui = function(e, t, i, n) {
        return new (i || (i = Promise))(function(o, s) {
            function r(e) {
                try {
                    c(n.next(e))
                } catch (e) {
                    s(e)
                }
            }
            function a(e) {
                try {
                    c(n.throw(e))
                } catch (e) {
                    s(e)
                }
            }
            function c(e) {
                var t;
                e.done ? o(e.value) : (t = e.value,
                t instanceof i ? t : new i(function(e) {
                    e(t)
                }
                )).then(r, a)
            }
            c((n = n.apply(e, t || [])).next())
        }
        )
    };
    const _i = "HOSBoard"
      , Gi = "0000ffe0-0000-1000-8000-00805f9b34fb"
      , Ki = "0000ffe1-0000-1000-8000-00805f9b34fb"
      , qi = 3e3;
    class zi extends Ti {
        getServiceUUIDs() {
            return [Gi]
        }
        getScanFilter() {
            return [{
                namePrefix: _i
            }]
        }
        constructor(e, t) {
            super(e, qi, t),
            this.currentInputData = [],
            this.positionListener = e => {
                this.onDataReceived(e)
            }
            ,
            this.disconnectListener = () => {
                this.siteManager.onSmartboardDisconnect()
            }
            ,
            this.sendSerializer.setPauseMs(qi)
        }
        connectToDevice(e, t) {
            return Ui(this, void 0, void 0, function*() {
                try {
                    this.device = e,
                    this.siteManager.showStatusMessage("connecting (1/3)", !t);
                    const i = yield e.gatt.connect();
                    this.siteManager.showStatusMessage("connecting (2/3)", !t),
                    this.writeChannel = yield ht.getCharacteristic(i, Gi, Ki),
                    this.writeChannel.addEventListener("characteristicvaluechanged", this.positionListener),
                    this.writeChannel.startNotifications(),
                    e.addEventListener("gattserverdisconnected", this.disconnectListener),
                    this.siteManager.showStatusMessage("connecting (3/3)", !t)
                } catch (e) {
                    throw yield T(e, !1),
                    this.siteManager.showStatusMessage("", !t),
                    e
                }
            })
        }
        disconnect() {
            var e, t;
            return null === (e = this.device) || void 0 === e || e.removeEventListener("gattserverdisconnected", this.disconnectListener),
            null === (t = this.device) || void 0 === t || t.removeEventListener("characteristicvaluechanged", this.positionListener),
            super.disconnect()
        }
        onDataReceived(e) {
            return this.parseInputData(new Uint8Array(e.target.value.buffer,e.target.value.byteOffset,e.target.value.byteLength))
        }
        parseInputData(e) {
            const t = Object.create(null, {
                parseInputData: {
                    get: () => super.parseInputData
                }
            });
            return Ui(this, void 0, void 0, function*() {
                for (const i of e)
                    44 === i ? (yield t.parseInputData.call(this, zi.convertDataToHidFormat(this.currentInputData)),
                    this.currentInputData.length = 0) : this.currentInputData.push(i)
            })
        }
        static convertDataToHidFormat(e) {
            const t = [];
            for (let i = 0; i < e.length; i += 2) {
                const n = zi.asciiToNibble(e[i])
                  , o = zi.asciiToNibble(e[i + 1]) | n << 4;
                t.push(o)
            }
            return Uint8Array.from(t)
        }
        static asciiToNibble(e) {
            return e <= "9".charCodeAt(0) ? e - "0".charCodeAt(0) : e - "A".charCodeAt(0) + 10
        }
        sendDataToBoard(e) {
            return this.sendSerializer.enqueue( () => Ui(this, void 0, void 0, function*() {
                const t = this.siteManager.connectionManager;
                yield t.sendToBoard(e, this.writeChannel)
            }))
        }
    }
    class $i extends gi {
        constructor(e, t) {
            super(e, t),
            this.vCommandReceived = !0
        }
        sendLedStateToBoard(e) {
            e = null != e ? e : new we;
            let t = "";
            for (let i = 0; i < 8; i++)
                for (let n = 0; n < 8; n++)
                    t += "L" + (8 * i + n).toString(16).padStart(2, "0") + (e.isLedOn(i, n) ? "01" : "00");
            return this.sendCommand(t)
        }
        queryBattery() {
            return e = this,
            t = void 0,
            n = function*() {
                return Promise.resolve()
            }
            ,
            new ((i = void 0) || (i = Promise))(function(o, s) {
                function r(e) {
                    try {
                        c(n.next(e))
                    } catch (e) {
                        s(e)
                    }
                }
                function a(e) {
                    try {
                        c(n.throw(e))
                    } catch (e) {
                        s(e)
                    }
                }
                function c(e) {
                    var t;
                    e.done ? o(e.value) : (t = e.value,
                    t instanceof i ? t : new i(function(e) {
                        e(t)
                    }
                    )).then(r, a)
                }
                c((n = n.apply(e, t || [])).next())
            }
            );
            var e, t, i, n
        }
        get phoenixManager() {
            return this.siteManager.connectionManager
        }
        sendCommand(e) {
            return this.phoenixManager.sendMessage({
                type: "data",
                payload: e
            }),
            Promise.resolve()
        }
        sendDataToBoard(e) {
            throw new Error("PhoenixBoard.sendDataToBoard: Not implemented")
        }
    }
    var Yi = function(e, t, i, n) {
        return new (i || (i = Promise))(function(o, s) {
            function r(e) {
                try {
                    c(n.next(e))
                } catch (e) {
                    s(e)
                }
            }
            function a(e) {
                try {
                    c(n.throw(e))
                } catch (e) {
                    s(e)
                }
            }
            function c(e) {
                var t;
                e.done ? o(e.value) : (t = e.value,
                t instanceof i ? t : new i(function(e) {
                    e(t)
                }
                )).then(r, a)
            }
            c((n = n.apply(e, t || [])).next())
        }
        )
    };
    class Vi extends st {
        constructor(e, t) {
            super(e, t),
            this.board = t,
            e.onUnknownBackgroundEvent = e => Yi(this, void 0, void 0, function*() {
                if ("phoenix" === e.data.type) {
                    const t = e.data.phoenixMessage;
                    switch (t.type) {
                    case "socketClosed":
                        this.onPhoenixSocketClosed();
                        break;
                    case "socketConnected":
                        this.onPhoenixSocketConnected();
                        break;
                    case "error":
                        this.onPhoenixSocketError();
                        break;
                    case "message":
                        yield this.onPhoenixMessage(t.message)
                    }
                }
            })
        }
        get phoenixSiteManager() {
            return this.siteManager
        }
        onPhoenixSocketClosed() {
            this.siteManager.onSmartboardDisconnect(),
            this.currentBoard = null
        }
        onPhoenixSocketConnected() {
            this.currentBoard = this.board
        }
        onPhoenixSocketError() {
            this.siteManager.onSmartboardDisconnect(),
            this.connectToBoardResolver(!1)
        }
        onPhoenixMessage(e) {
            return Yi(this, void 0, void 0, function*() {
                if ("server" === e.type && "ready" === e.payload)
                    console.log("server ready"),
                    this.sendMessage({
                        type: "setup"
                    }),
                    yield this.siteManager.onSmartboardConnect(this.board),
                    this.connectToBoardResolver(!0);
                else if ("data" === e.type)
                    yield this.board.processDataFromBoard(Uint8Array.from(Object.values(e.payload)));
                else if ("setParams" === e.type) {
                    let t = new x;
                    try {
                        t = Object.assign(new x, JSON.parse(e.payload))
                    } catch (e) {
                        console.log(e)
                    }
                    this.siteManager.setOptions(t)
                }
            })
        }
        connectToBoard() {
            return new Promise(e => {
                this.connectToBoardResolver = e,
                this.phoenixSiteManager.sendToBackend({
                    type: "createPhoenixSocket"
                })
            }
            )
        }
        sendMessage(e) {
            this.phoenixSiteManager.sendToBackend({
                type: "phoenix",
                text: JSON.stringify(e)
            })
        }
        exitApp() {
            this.phoenixSiteManager.sendToBackend({
                type: "exitApp"
            })
        }
        checkAvailability() {
            return Promise.resolve(!0)
        }
        startReconnectService() {
            return this.connectToBoardResolver || this.connectToBoard(),
            Promise.resolve()
        }
        playSound(e) {
            return Yi(this, void 0, void 0, function*() {
                const t = yield this.getSoundFileForEvent(e);
                this.sendMessage({
                    type: "playSound",
                    payload: t
                })
            })
        }
        getSoundFileForEvent(e) {
            return Yi(this, void 0, void 0, function*() {
                const t = yield this.siteManager.getOptions();
                switch (e) {
                case R.POSITIONS_MATCH:
                    return "pling.wav";
                case R.OPPONENT_MOVED:
                    switch (t.moveSound) {
                    case D.BEEP:
                        return "beep.wav";
                    case D.KNOCK:
                        return "knock.wav"
                    }
                }
                throw new Error("Unknown sound event")
            })
        }
    }
    var Qi = function(e, t, i, n) {
        return new (i || (i = Promise))(function(o, s) {
            function r(e) {
                try {
                    c(n.next(e))
                } catch (e) {
                    s(e)
                }
            }
            function a(e) {
                try {
                    c(n.throw(e))
                } catch (e) {
                    s(e)
                }
            }
            function c(e) {
                var t;
                e.done ? o(e.value) : (t = e.value,
                t instanceof i ? t : new i(function(e) {
                    e(t)
                }
                )).then(r, a)
            }
            c((n = n.apply(e, t || [])).next())
        }
        )
    };
    class ji extends ye {
        constructor() {
            super(...arguments),
            this.rookTouchedCounter = 0,
            this.sendAndWaitBuffer = new s,
            this.pendingPromotionMove = null
        }
        reset() {
            const e = Object.create(null, {
                reset: {
                    get: () => super.reset
                }
            });
            return Qi(this, void 0, void 0, function*() {
                b("RESETTING BOARD"),
                yield e.reset.call(this),
                this.pendingPromotionMove = null,
                this.rookTouchedCounter = 0
            })
        }
        waitForBoardPosition(e) {
            return Qi(this, void 0, void 0, function*() {
                const t = ge.createFenFromPosition(e, de.NORMAL_CHESS)
                  , i = ji.fen2Uint8(t);
                b("sending fen to board: " + t),
                this.sendAndWaitBuffer.cancelAll("Wait for board position"),
                yield this.sendAndWaitBuffer.send( () => {
                    this.sendDataToBoard(new Uint8Array([102, i.length, ...i]))
                }
                , e => 177 === e[0], "Wait for board position"),
                yield this.onBoardChanged(e)
            })
        }
        static fen2Uint8(e) {
            const t = new TextEncoder
              , i = e.split(" ");
            e = i[0] + " " + i[1] + " " + i[2] + " " + i[3] + " ";
            const n = t.encode(e)
              , o = new Uint8Array(n.length + 3);
            o.set(n);
            const s = Number.parseInt(i[4]);
            o[n.length] = 255 & s;
            const r = Number.parseInt(i[5]);
            return o[n.length + 1] = r >> 8 & 255,
            o[n.length + 2] = 255 & r,
            o
        }
        setSitePosition(e, t) {
            return Qi(this, void 0, void 0, function*() {
                if (yield this.setClockState(t),
                this.sitePosition && this.sitePosition.equals(e))
                    return !1;
                {
                    e.print("new site position");
                    const t = this.sitePosition;
                    return this.sitePosition = e,
                    te.isNewGame(t, e) ? (b("new game detected"),
                    this.gameStarted = this.startGame()) : t && (b("game continues"),
                    yield this.gameStarted,
                    e.equals(this.lastPositionReceived) || (b("sending move to board"),
                    yield this.sendMoveToBoard(t, e))),
                    !0
                }
            })
        }
        startGame() {
            return Qi(this, void 0, void 0, function*() {
                b("starting new game"),
                this.rookTouchedCounter = 0,
                this.gameFormat = yield this.siteManager.siteBoard.getGameFormat(),
                yield this.sendDataToBoard(Uint8Array.from([100])),
                yield this.waitForBoardPosition(this.sitePosition),
                yield this.sendGameSettings(),
                b("game start completed")
            })
        }
        sendMoveToBoard(e, t) {
            return Qi(this, void 0, void 0, function*() {
                let i = e.computeMoveTo(t);
                if (i && i.player !== (yield this.getPlayerColor()))
                    if (this.gameFormat === de.CHESS960 && i.isCastle(e))
                        yield this.waitForBoardPosition(t);
                    else {
                        this.rookTouchedCounter = 0,
                        i = i.convertCastleMove(N.KING_MOVES_TWO_FIELDS, e);
                        const t = ji.fieldToIndex(i.fromField)
                          , n = ji.fieldToIndex(i.toField);
                        yield this.sendAndWaitBuffer.send( () => {
                            this.sendDataToBoard(new Uint8Array([153, t, n]))
                        }
                        , e => 34 === e[0], "Sending move to board"),
                        i.isPromotion() && (yield this.completePromotion(i.promPiece))
                    }
            })
        }
        static fieldToIndex(e) {
            return 8 * e.row + e.col
        }
        static indexToField(e) {
            return new W(Math.floor(e / 8),e % 8)
        }
        sendLedStateToBoard(e) {
            return Promise.resolve()
        }
        onPieceTouched(e) {
            return Qi(this, void 0, void 0, function*() {
                var t;
                if (this.gameFormat === de.CHESS960 && this.getPlayerToMove() === (yield this.getPlayerColor())) {
                    const i = ji.indexToField(e[1])
                      , n = this.getCurrentPosition();
                    if (!n)
                        return;
                    const o = n.getPieceOnField(i);
                    if (n.getColorOnField(i) !== (yield this.getPlayerColor()))
                        return;
                    if (o === te.ROOK) {
                        if (++this.rookTouchedCounter >= 3) {
                            b("castle detected");
                            const e = null === (t = n.findKingAndRooksForCastle(yield this.getPlayerColor())) || void 0 === t ? void 0 : t.king;
                            e && (yield this.onCastleChess960FromBoard(e, i)),
                            this.rookTouchedCounter = 0
                        }
                        b("rook touch counter is now " + this.rookTouchedCounter)
                    }
                }
            })
        }
        onCastleChess960FromBoard(e, t) {
            return Qi(this, void 0, void 0, function*() {
                const i = this.getCurrentPosition().clone()
                  , n = new U(e,t);
                i.makeMove(n),
                yield this.waitForBoardPosition(i),
                yield this.onBoardChanged(i)
            })
        }
        onMoveFromBoard(e) {
            return Qi(this, void 0, void 0, function*() {
                var t;
                if (53 === e[1]) {
                    yield this.sendDataToBoard(Uint8Array.from([33])),
                    this.rookTouchedCounter = 0;
                    const i = null !== (t = this.getCurrentPosition()) && void 0 !== t ? t : this.sitePosition
                      , n = new W(e[3],e[2])
                      , o = new W(e[5],e[4])
                      , s = this.convertCastleMove(new U(n,o), i);
                    if (i.isPromotionMove(s))
                        b("received promotion move from board: " + s.asString()),
                        this.pendingPromotionMove = s;
                    else {
                        b("received move from board: " + s.asString());
                        const e = i.clone();
                        e.print("old position before move"),
                        e.makeMove(s),
                        yield this.onBoardChanged(e)
                    }
                } else
                    b("move from board had invalid second byte")
            })
        }
        convertCastleMove(e, t) {
            if (t.getPieceOnField(e.fromField) === te.KING) {
                const t = W.fromString("e1")
                  , i = W.fromString("g1")
                  , n = W.fromString("h1")
                  , o = W.fromString("c1")
                  , s = W.fromString("a1");
                if (e.fromField.equals(t) && e.toField.equals(i))
                    return new U(t,n);
                if (e.fromField.equals(t) && e.toField.equals(o))
                    return new U(t,s);
                const r = W.fromString("e8")
                  , a = W.fromString("g8")
                  , c = W.fromString("h8")
                  , l = W.fromString("c8")
                  , d = W.fromString("a8");
                if (e.fromField.equals(r) && e.toField.equals(a))
                    return new U(r,c);
                if (e.fromField.equals(r) && e.toField.equals(l))
                    return new U(r,d)
            }
            return e
        }
        onPawnPromotionFromBoard(e) {
            return Qi(this, void 0, void 0, function*() {
                if (!this.pendingPromotionMove)
                    throw new Error("received pawn promotion from board without pending promotion");
                const t = this.pendingPromotionMove;
                switch (this.pendingPromotionMove = null,
                e[1]) {
                case 1:
                    t.promPiece = te.ROOK;
                    break;
                case 2:
                    t.promPiece = te.KNIGHT;
                    break;
                case 3:
                    t.promPiece = te.BISHOP;
                    break;
                case 4:
                    t.promPiece = te.QUEEN;
                    break;
                default:
                    throw new Error("received invalid pawn promotion from board")
                }
                const i = this.sitePosition.clone();
                i.makeMove(t),
                yield this.onBoardChanged(i),
                yield this.sendDataToBoard(Uint8Array.from([35]))
            })
        }
        completePromotion(e) {
            return Qi(this, void 0, void 0, function*() {
                let t;
                switch (e) {
                case te.ROOK:
                    t = 1;
                    break;
                case te.KNIGHT:
                    t = 2;
                    break;
                case te.BISHOP:
                    t = 3;
                    break;
                case te.QUEEN:
                    t = 4;
                    break;
                default:
                    throw new Error("invalid promotion piece")
                }
                yield this.sendDataToBoard(Uint8Array.from([151, t]))
            })
        }
        queryBattery() {
            return Promise.resolve()
        }
        sendGameSettings() {
            return Qi(this, void 0, void 0, function*() {
                const e = (yield this.getPlayerColor()) === te.WHITE
                  , t = this.siteManager.siteBoard.isAnalysisBoard;
                b("we play " + (e ? "white" : "black")),
                yield this.sendAndWaitBuffer.send( () => {
                    this.sendDataToBoard(Uint8Array.from([185, 2, 0, 1, 1, 0, 1, 1, 0, t || e ? 0 : 1, t ? 0 : e ? 1 : 0, e ? 0 : 1]))
                }
                , e => 36 === e[0], "Send game settings")
            })
        }
        processDataFromBoard(e) {
            return Qi(this, void 0, void 0, function*() {
                if (!this.sendAndWaitBuffer.receive(e))
                    switch (e[0]) {
                    case 163:
                        yield this.onMoveFromBoard(e);
                        break;
                    case 151:
                        yield this.onPawnPromotionFromBoard(e);
                        break;
                    case 184:
                        yield this.onPieceTouched(e);
                        break;
                    case 38:
                        b("RECEIVED ERROR FROM CHESSUP BOARD: " + S(e))
                    }
            })
        }
    }
    var Ji = function(e, t, i, n) {
        return new (i || (i = Promise))(function(o, s) {
            function r(e) {
                try {
                    c(n.next(e))
                } catch (e) {
                    s(e)
                }
            }
            function a(e) {
                try {
                    c(n.throw(e))
                } catch (e) {
                    s(e)
                }
            }
            function c(e) {
                var t;
                e.done ? o(e.value) : (t = e.value,
                t instanceof i ? t : new i(function(e) {
                    e(t)
                }
                )).then(r, a)
            }
            c((n = n.apply(e, t || [])).next())
        }
        )
    };
    const Xi = "ChessUp"
      , Zi = "6e400001-b5a3-f393-e0a9-e50e24dcca9e"
      , en = "6e400002-b5a3-f393-e0a9-e50e24dcca9e"
      , tn = "6e400003-b5a3-f393-e0a9-e50e24dcca9e";
    class nn extends ji {
        constructor() {
            super(...arguments),
            this.positionListener = e => {
                const t = e;
                this.onDataReceived(t)
            }
            ,
            this.batteryListener = e => {
                const t = e;
                this.onBatteryChanged(t.target.value.getUint8(0), f.BATTERY)
            }
            ,
            this.disconnectListener = () => {
                this.siteManager.onSmartboardDisconnect()
            }
        }
        getServiceUUIDs() {
            return [Zi, "battery_service"]
        }
        getScanFilter() {
            return [{
                namePrefix: Xi
            }]
        }
        connectToDevice(e, t) {
            return Ji(this, void 0, void 0, function*() {
                try {
                    const i = 5;
                    let n = 0;
                    this.device = e,
                    this.siteManager.showStatusMessage(`connecting (${++n}/${i})`, !t);
                    const o = yield e.gatt.connect();
                    this.siteManager.showStatusMessage(`connecting (${++n}/${i})`, !t);
                    const s = yield ht.getCharacteristic(o, Zi, tn);
                    s.addEventListener("characteristicvaluechanged", this.positionListener),
                    yield s.startNotifications();
                    try {
                        this.siteManager.showStatusMessage(`connecting (${++n}/${i})`, !t),
                        b("Connected to ChessUp Board, setting up battery listener");
                        const e = yield ht.getCharacteristic(o, "battery_service", "battery_level");
                        b("Battery channel found, setting up listener"),
                        e.addEventListener("characteristicvaluechanged", this.batteryListener),
                        b("Starting battery notifications"),
                        yield e.startNotifications(),
                        b("Battery notifications started")
                    } catch (e) {
                        b("No battery service found on ChessUp Board")
                    }
                    this.siteManager.showStatusMessage(`connecting (${++n}/${i})`, !t),
                    this.writeChannel = yield ht.getCharacteristic(o, Zi, en),
                    e.addEventListener("gattserverdisconnected", this.disconnectListener),
                    this.siteManager.showStatusMessage(`connecting (${++n}/${i})`, !t),
                    this.sitePosition && (this.gameStarted = this.startGame())
                } catch (e) {
                    throw yield T(e, !1),
                    this.siteManager.showStatusMessage("", !t),
                    e
                }
            })
        }
        disconnect() {
            var e, t, i;
            return null === (e = this.device) || void 0 === e || e.removeEventListener("gattserverdisconnected", this.disconnectListener),
            null === (t = this.device) || void 0 === t || t.removeEventListener("characteristicvaluechanged", this.positionListener),
            null === (i = this.device) || void 0 === i || i.removeEventListener("characteristicvaluechanged", this.batteryListener),
            super.disconnect()
        }
        sendDataToBoard(e) {
            return Ji(this, void 0, void 0, function*() {
                const t = this.siteManager.connectionManager;
                b(`sending to ChessUpBoard: ${S(e)}`),
                yield t.sendToBoard(e, this.writeChannel)
            })
        }
        onDataReceived(e) {
            const t = new Uint8Array(e.target.value.buffer,e.target.value.byteOffset,e.target.value.byteLength);
            return this.processDataFromBoard(t)
        }
    }
    class on extends nt {
        sendDataToBoard(e, t=0) {
            return F.getGlobalDevice().sendDataToBoard(e, t),
            Promise.resolve()
        }
        processDataFromBoard(e, t=0) {
            return "string" == typeof e && (e = F.base64ToUint8Array(e)),
            super.processDataFromBoard(e)
        }
        getChannelIds() {
            return [`${vt}~${ft}`, `${vt}~${gt}`]
        }
        getDeviceNameSubstring(e) {
            return "Certabo"
        }
        getMaxMessageSize() {
            return 255
        }
        getMinMillsBetweenSends() {
            return 750
        }
        getSerialSettings() {
            return "38400,N,8,1"
        }
        needsSingleByteSends() {
            return !1
        }
    }
    class sn extends st {
        checkAvailability() {
            return Promise.resolve(!0)
        }
        connectToBoard() {
            return Promise.resolve(!1)
        }
    }
    class rn extends Lt {
        constructor(e) {
            super(e),
            this.onBatteryChanged = (e, t) => {
                var i;
                null === (i = F.getGlobalDevice().app) || void 0 === i || i.batteryLevelChanged(e, t)
            }
        }
        sendDataToBoard(e) {
            return F.getGlobalDevice().sendDataToBoard(e),
            Promise.resolve()
        }
        processDataFromBoard(e, t) {
            return "string" == typeof e && (e = F.base64ToUint8Array(e)),
            super.processDataFromBoard(e, t)
        }
        getChannelIds() {
            return [`${At}~${Dt}`, `${kt}~${Rt}`, `${At}~${Nt}`]
        }
        getDeviceNameSubstring(e) {
            return "Chessnut"
        }
        getMaxMessageSize() {
            return 80
        }
        getMinMillsBetweenSends() {
            return 25
        }
        getSerialSettings() {
            return "9600,N,8,1"
        }
        needsSingleByteSends() {
            return !1
        }
    }
    class an extends gi {
        constructor(e, t) {
            super(e, t),
            this.connectionType = t.connectionType,
            this.onBatteryChanged = (e, t) => {
                var i;
                null === (i = F.getGlobalDevice().app) || void 0 === i || i.batteryLevelChanged(e, t)
            }
        }
        sendDataToBoard(e, t) {
            return this.connectionType === L.BLUETOOTH && (e = ui.computeXParity(e)),
            F.getGlobalDevice().sendDataToBoard(e, t),
            Promise.resolve()
        }
        processDataFromBoard(e) {
            return "string" == typeof e && (e = F.base64ToUint8Array(e)),
            this.connectionType === L.BLUETOOTH && (e = P(ui.removeXParity(e))),
            super.processDataFromBoard(e)
        }
        getChannelIds() {
            return [`${ui.UUID_SERVICE}~${ui.UUID_CHARACTERISTIC_SEND}`, `${ui.UUID_SERVICE}~${ui.UUID_CHARACTERISTIC_RECEIVE}`]
        }
        getDeviceNameSubstring(e) {
            return "Millennium"
        }
        getMaxMessageSize() {
            return 128
        }
        getMinMillsBetweenSends() {
            return 150
        }
        getSerialSettings() {
            return "38400,O,7,1"
        }
        needsSingleByteSends() {
            return !1
        }
    }
    class cn extends oi {
        constructor(e, t) {
            super(e, t),
            this.onBatteryChanged = (e, t) => {
                var i;
                null === (i = F.getGlobalDevice().app) || void 0 === i || i.batteryLevelChanged(e, t)
            }
        }
        sendDataToBoard(e, t) {
            return F.getGlobalDevice().sendDataToBoard(e, t),
            Promise.resolve()
        }
        processDataFromBoard(e) {
            return "string" == typeof e && (e = F.base64ToUint8Array(e)),
            super.processDataFromBoard(e)
        }
        getChannelIds() {
            return [`${ai}~${ci}`, `${ai}~${li}`]
        }
        getDeviceNameSubstring(e) {
            return ri
        }
        getMaxMessageSize() {
            return 128
        }
        getMinMillsBetweenSends() {
            return 150
        }
        getSerialSettings() {
            return "115200,N,8,1"
        }
        needsSingleByteSends() {
            return !1
        }
    }
    class ln extends ji {
        constructor(e) {
            super(e),
            this.onBatteryChanged = (e, t) => {
                var i;
                null === (i = F.getGlobalDevice().app) || void 0 === i || i.batteryLevelChanged(e, t)
            }
        }
        sendDataToBoard(e, t) {
            return F.getGlobalDevice().sendDataToBoard(e, t),
            Promise.resolve()
        }
        processDataFromBoard(e) {
            return "string" == typeof e && (e = F.base64ToUint8Array(e)),
            super.processDataFromBoard(e)
        }
        getChannelIds() {
            return [`${Zi}~${en}`, `${Zi}~${tn}`]
        }
        getDeviceNameSubstring(e) {
            return Xi
        }
        getMaxMessageSize() {
            return 50
        }
        getMinMillsBetweenSends() {
            return 25
        }
        getSerialSettings() {
            return "9600,N,8,1"
        }
        needsSingleByteSends() {
            return !1
        }
    }
    var dn = function(e, t, i, n) {
        return new (i || (i = Promise))(function(o, s) {
            function r(e) {
                try {
                    c(n.next(e))
                } catch (e) {
                    s(e)
                }
            }
            function a(e) {
                try {
                    c(n.throw(e))
                } catch (e) {
                    s(e)
                }
            }
            function c(e) {
                var t;
                e.done ? o(e.value) : (t = e.value,
                t instanceof i ? t : new i(function(e) {
                    e(t)
                }
                )).then(r, a)
            }
            c((n = n.apply(e, t || [])).next())
        }
        )
    };
    class hn extends Ti {
        constructor(e, t) {
            var i;
            super(e, 0, t),
            this.currentInputData = [],
            this.connectionType = t.connectionType,
            this.ledLighter.ledLightTime = this.connectionType === L.BLUETOOTH ? qi : 1e3,
            this.sendSerializer.setPauseMs(this.connectionType === L.BLUETOOTH ? qi : 10),
            this.onBatteryChanged = (e, t) => {
                var i;
                null === (i = F.getGlobalDevice().app) || void 0 === i || i.batteryLevelChanged(e, t)
            }
            ,
            null === (i = this.getClock()) || void 0 === i || i.reset()
        }
        sendDataToBoard(e, t) {
            return dn(this, void 0, void 0, function*() {
                return this.sendSerializer.enqueue( () => (F.getGlobalDevice().sendDataToBoard(e, t),
                Promise.resolve()))
            })
        }
        processDataFromBoard(e) {
            const t = Object.create(null, {
                parseInputData: {
                    get: () => super.parseInputData
                }
            });
            return dn(this, void 0, void 0, function*() {
                if ("string" == typeof e && (e = F.base64ToUint8Array(e)),
                this.connectionType === L.BLUETOOTH)
                    for (const i of e)
                        44 === i ? (yield t.parseInputData.call(this, zi.convertDataToHidFormat(this.currentInputData)),
                        this.currentInputData.length = 0) : this.currentInputData.push(i);
                else
                    this.connectionType === L.USB && (yield t.parseInputData.call(this, e));
                return Promise.resolve()
            })
        }
        getChannelIds() {
            return [`${Gi}~${Ki}`]
        }
        getDeviceNameSubstring(e) {
            return _i
        }
        getMaxMessageSize() {
            return 40
        }
        getMinMillsBetweenSends() {
            return this.connectionType === L.BLUETOOTH ? qi : 10
        }
        getSerialSettings() {
            return "9600,N,8,1"
        }
        needsSingleByteSends() {
            return this.connectionType === L.USB
        }
    }
    class un extends Fi {
        constructor(e) {
            super(e),
            this.onBatteryChanged = (e, t) => {
                var i;
                null === (i = F.getGlobalDevice().app) || void 0 === i || i.batteryLevelChanged(e, t)
            }
        }
        sendDataToBoard(e, t) {
            return F.getGlobalDevice().sendDataToBoard(e, t),
            Promise.resolve()
        }
        processDataFromBoard(e) {
            return "string" == typeof e ? super.parseInputData(atob(e)) : super.parseInputData(C(e))
        }
        getChannelIds() {
            return [`${Oi}~${ki}`]
        }
        getDeviceNameSubstring(e) {
            return "QM"
        }
        getMaxMessageSize() {
            return 128
        }
        getMinMillsBetweenSends() {
            return 25
        }
        getSerialSettings() {
            return "9600,N,8,1"
        }
        initializeBoard() {
            return super.setBoardDumpTimeout(),
            Promise.resolve()
        }
        needsSingleByteSends() {
            return !1
        }
    }
    class vn extends ti {
        constructor(e) {
            super(e),
            this.onBatteryChanged = (e, t) => {
                var i;
                null === (i = F.getGlobalDevice().app) || void 0 === i || i.batteryLevelChanged(e, t)
            }
        }
        sendDataToBoard(e) {
            return F.getGlobalDevice().sendDataToBoard(e),
            Promise.resolve()
        }
        processDataFromBoard(e) {
            return "string" == typeof e && (e = F.base64ToUint8Array(e)),
            super.processDataFromBoard(e)
        }
        getChannelIds() {
            return [`${Xt}~${Zt}`, `${Xt}~${ei}`]
        }
        getDeviceNameSubstring(e) {
            return ""
        }
        getMaxMessageSize() {
            return 150
        }
        getMinMillsBetweenSends() {
            return qt
        }
        getSerialSettings() {
            return "9600,N,8,1"
        }
        needsSingleByteSends() {
            return !1
        }
    }
    class gn extends Qt {
        constructor(e, t) {
            super(e, t),
            this.onBatteryChanged = (e, t) => {
                var i;
                null === (i = F.getGlobalDevice().app) || void 0 === i || i.batteryLevelChanged(e, t)
            }
        }
        sendDataToBoard(e) {
            return F.getGlobalDevice().sendDataToBoard(e),
            Promise.resolve()
        }
        processDataFromBoard(e, t) {
            return "string" == typeof e && (e = F.base64ToUint8Array(e)),
            1 === t ? (b("Chessconnect Adapter Log: " + C(e)),
            Promise.resolve()) : super.processDataFromBoard(e)
        }
        getChannelIds() {
            const e = "4019bf5b-5fb6-458d-9ecc-0d07056d04bc";
            return [`${e}~4019bf5b-5fb6-458d-9ecc-0d07056d04bd`, `${e}~4019bf5b-5fb6-458d-9ecc-0d07056d04be`]
        }
        getDeviceNameSubstring(e) {
            return F.getGlobalDevice().isIOS() ? "Chessconnect Adapter" : e.boardType === O.DGT_REVELATION_II ? "PCS-" : "DGT"
        }
        getMaxMessageSize() {
            return 150
        }
        getMinMillsBetweenSends() {
            return qt
        }
        getSerialSettings() {
            return "9600,N,8,1"
        }
        needsSingleByteSends() {
            return !1
        }
    }
    class fn {
        createConnectionManager(e, t, i) {
            return n = this,
            o = void 0,
            r = function*() {
                const n = yield i.getOptions();
                switch (e) {
                case L.BLUETOOTH:
                    return this.createNewBluetoothConnectionManager(t, i, n);
                case L.USB:
                    return this.createNewUsbConnectionManager(t, i, n);
                case L.PHOENIX:
                    return new Vi(i,new $i(i,n));
                case L.APP:
                    return this.createNewAppConnectionManager(t, i, n)
                }
            }
            ,
            new ((s = void 0) || (s = Promise))(function(e, t) {
                function i(e) {
                    try {
                        c(r.next(e))
                    } catch (e) {
                        t(e)
                    }
                }
                function a(e) {
                    try {
                        c(r.throw(e))
                    } catch (e) {
                        t(e)
                    }
                }
                function c(t) {
                    var n;
                    t.done ? e(t.value) : (n = t.value,
                    n instanceof s ? n : new s(function(e) {
                        e(n)
                    }
                    )).then(i, a)
                }
                c((r = r.apply(n, o || [])).next())
            }
            );
            var n, o, s, r
        }
        createNewBluetoothConnectionManager(e, t, i) {
            switch (e) {
            case O.CHESSNUT:
                return new ht(t,new Ht(t));
            case O.MILLENNIUM:
                return new ht(t,new pi(t,i));
            case O.TABUTRONIC:
            case O.TABUTRONIC_SPECTRUM:
                return new ht(t,new pt(t,i));
            case O.DGT:
                return new Hi(t,new Qt(t,!1));
            case O.DGT_REVELATION_II:
                return new Hi(t,new Qt(t,!0));
            case O.DGT_PEGASUS:
                return new ht(t,new ti(t));
            case O.ICHESSONE:
                return new ht(t,new di(t,i));
            case O.YIZHI:
                return new ht(t,new Ai(t));
            case O.STAUNTON:
                return new ht(t,new zi(t,i));
            case O.CHESSUP:
                return new ht(t,new nn(t));
            default:
                throw new Error("Board cannot be connected with this method")
            }
        }
        createNewUsbConnectionManager(e, t, i) {
            switch (e) {
            case O.CHESSNUT:
                return new Ri(t,new _t(t));
            case O.MILLENNIUM:
                return new Hi(t,new yi(t,i));
            case O.TABUTRONIC:
            case O.TABUTRONIC_SPECTRUM:
                return new Hi(t,new yt(t,i));
            case O.STAUNTON:
                return new Ri(t,new Ei(t,i));
            case O.DGT:
                return new Hi(t,new Qt(t,!1));
            case O.DGT_REVELATION_II:
                return new Hi(t,new Qt(t,!0));
            case O.ICHESSONE:
                return new Hi(t,new Wi(t,i));
            default:
                throw new Error("Board cannot be connected with this method")
            }
        }
        createNewAppConnectionManager(e, t, i) {
            switch (e) {
            case O.TABUTRONIC:
            case O.TABUTRONIC_SPECTRUM:
                return new sn(t,new on(t,i));
            case O.CHESSNUT:
                return new sn(t,new rn(t));
            case O.MILLENNIUM:
                return new sn(t,new an(t,i));
            case O.ICHESSONE:
                return new sn(t,new cn(t,i));
            case O.CHESSUP:
                return new sn(t,new ln(t));
            case O.STAUNTON:
                return new sn(t,new hn(t,i));
            case O.YIZHI:
                return new sn(t,new un(t));
            case O.DGT_PEGASUS:
                return new sn(t,new vn(t));
            case O.DGT:
                return new sn(t,new gn(t,!1));
            case O.DGT_REVELATION_II:
                return new sn(t,new gn(t,!0));
            default:
                throw new Error("Board cannot be connected with this method")
            }
        }
    }
    class pn {
        constructor() {
            this.intervalId = null,
            this.isRunning = !1
        }
        start(e, t) {
            if (this.intervalId)
                throw new Error("Interval is already active.");
            this.intervalId = setInterval( () => {
                if (!this.isRunning) {
                    this.isRunning = !0;
                    try {
                        e()
                    } finally {
                        this.isRunning = !1
                    }
                }
            }
            , t)
        }
        stop() {
            this.intervalId && (clearInterval(this.intervalId),
            this.intervalId = null)
        }
        checkActive() {
            return null !== this.intervalId
        }
    }
    var mn = function(e, t, i, n) {
        return new (i || (i = Promise))(function(o, s) {
            function r(e) {
                try {
                    c(n.next(e))
                } catch (e) {
                    s(e)
                }
            }
            function a(e) {
                try {
                    c(n.throw(e))
                } catch (e) {
                    s(e)
                }
            }
            function c(e) {
                var t;
                e.done ? o(e.value) : (t = e.value,
                t instanceof i ? t : new i(function(e) {
                    e(t)
                }
                )).then(r, a)
            }
            c((n = n.apply(e, t || [])).next())
        }
        )
    };
    class yn {
        constructor(e, t, i) {
            this.ledClock = null,
            this.messagePasser = e,
            i.showLedClock && (this.ledClock = new Je(t,Ue.fromHtmlHexString(i.ledClockColor),i.ledClockBrightness / 100,9))
        }
        reset() {
            return Promise.resolve()
        }
        update(e, t) {
            return mn(this, void 0, void 0, function*() {
                var i;
                yield this.messagePasser.ask({
                    type: "setClock",
                    clockState: e
                }),
                yield null === (i = this.ledClock) || void 0 === i ? void 0 : i.update(e, t)
            })
        }
        clearTextDisplay() {
            return mn(this, void 0, void 0, function*() {
                yield this.messagePasser.ask({
                    type: "clearClockText"
                })
            })
        }
        disconnect() {
            return Promise.resolve()
        }
        setPendingMove(e) {}
        setRunningForPlayer(e, t) {
            return Promise.resolve()
        }
    }
    var wn = function(e, t, i, n) {
        return new (i || (i = Promise))(function(o, s) {
            function r(e) {
                try {
                    c(n.next(e))
                } catch (e) {
                    s(e)
                }
            }
            function a(e) {
                try {
                    c(n.throw(e))
                } catch (e) {
                    s(e)
                }
            }
            function c(e) {
                var t;
                e.done ? o(e.value) : (t = e.value,
                t instanceof i ? t : new i(function(e) {
                    e(t)
                }
                )).then(r, a)
            }
            c((n = n.apply(e, t || [])).next())
        }
        )
    };
    class Sn extends ye {
        constructor(e, t) {
            super(e.siteManager),
            this.pollingInterval = new pn,
            this.connectionManager = e,
            this.clock = new yn(this.connectionManager.messagePasser,this,t),
            this.startPolling()
        }
        startPolling() {
            this.pollingInterval.start( () => wn(this, void 0, void 0, function*() {
                const e = yield this.connectionManager.messagePasser.ask({
                    type: "position?"
                });
                if ("position!" === e.type) {
                    const t = te.fromStringifiedPosition(e.position);
                    null !== this.lastPositionReceived && t.equals(this.lastPositionReceived) || (this.lastPositionReceived = t,
                    yield this.onBoardChanged(t))
                }
            }), 250)
        }
        sendLedStateToBoard(e) {
            return wn(this, void 0, void 0, function*() {
                e = null != e ? e : new Ke,
                this.clock instanceof yn && this.clock.ledClock && (e = this.clock.ledClock.imprintTimeOnLedState(e, this.boardOrientation === fe.FLIPPED)),
                yield this.connectionManager.messagePasser.ask({
                    type: "setLEDs",
                    ledState: e,
                    position: this.sitePosition
                })
            })
        }
        queryBattery() {
            return Promise.resolve()
        }
        lightLEDs(e, t) {
            return wn(this, void 0, void 0, function*() {
                this.boardOrientation === fe.FLIPPED && (e = e.flipped(),
                t = t.flipped());
                const i = new Ve(yield this.siteManager.getOptions()).createLedState(e, t, yield this.getPlayerColor())
                  , n = this.lastLedState;
                (null == n ? void 0 : n.isShowingMove) && 0 !== i.countLedsLit() || (b(`${i.countLedsLit()} LEDs need to be lit`),
                this.lastLedState && this.lastLedState.equals(i) || (b("Lighting " + i.countLedsLit() + " LEDs"),
                yield this.sendLedStateToBoard(i),
                this.lastLedState = i))
            })
        }
        setClockState(e) {
            const t = Object.create(null, {
                setClockState: {
                    get: () => super.setClockState
                }
            });
            return wn(this, void 0, void 0, function*() {
                if (yield t.setClockState.call(this, e),
                e.isGameOver()) {
                    const t = yield this.getPlayerColor()
                      , i = Ve.createResultPattern(e.gameResult, t);
                    yield this.sendLedStateToBoard(i)
                }
            })
        }
        clearLEDs() {
            return wn(this, void 0, void 0, function*() {
                yield this.sendLedStateToBoard(new Ke)
            })
        }
        sendDataToBoard(e) {
            throw new Error("Method not implemented.")
        }
        processDataFromBoard(e) {
            throw new Error("Not implemented")
        }
    }
    var Cn = function(e, t, i, n) {
        return new (i || (i = Promise))(function(o, s) {
            function r(e) {
                try {
                    c(n.next(e))
                } catch (e) {
                    s(e)
                }
            }
            function a(e) {
                try {
                    c(n.throw(e))
                } catch (e) {
                    s(e)
                }
            }
            function c(e) {
                var t;
                e.done ? o(e.value) : (t = e.value,
                t instanceof i ? t : new i(function(e) {
                    e(t)
                }
                )).then(r, a)
            }
            c((n = n.apply(e, t || [])).next())
        }
        )
    };
    class Pn extends We {
        constructor(e, t) {
            super(e.siteManager),
            this.pollingInterval = new pn,
            this.connectionManager = e,
            this.clock = new yn(this.connectionManager.messagePasser,this,t),
            this.startPolling()
        }
        startPolling() {
            this.pollingInterval.start( () => Cn(this, void 0, void 0, function*() {
                const e = yield this.connectionManager.messagePasser.ask({
                    type: "position?"
                });
                if ("position!" === e.type) {
                    const t = te.fromStringifiedPosition(e.position)
                      , i = He.createFromPosition(t)
                      , n = yield this.getBoardFromBinaryPosition(i);
                    !n || this.lastPositionReceived && this.lastPositionReceived.equals(n) || (this.lastPositionReceived = n,
                    yield this.onBoardChanged(n))
                }
            }), 250)
        }
        sendLedStateToBoard(e) {
            return Cn(this, void 0, void 0, function*() {
                e = null != e ? e : new we,
                yield this.connectionManager.messagePasser.ask({
                    type: "setLEDs",
                    ledState: e,
                    position: this.sitePosition
                })
            })
        }
        queryBattery() {
            return Promise.resolve()
        }
        getClock() {
            return this.clock
        }
        sendDataToBoard(e) {
            throw new Error("Method not implemented.")
        }
        processDataFromBoard(e) {
            throw new Error("Not implemented")
        }
    }
    class Mn extends st {
        constructor(e, t) {
            super(e, null),
            this._messagePasser = t
        }
        connectToBoard() {
            return e = this,
            t = void 0,
            n = function*() {
                yield this.siteManager.startConnecting(!0);
                const e = yield this.siteManager.getOptions()
                  , t = yield this.messagePasser.ask({
                    type: "connect"
                });
                return "connected" === t.type && (this.currentBoard = t.isMagnetBoard ? new Pn(this,e) : new Sn(this,e),
                this.siteManager.onSmartboardConnect(this.currentBoard)),
                "connected" === t.type
            }
            ,
            new ((i = void 0) || (i = Promise))(function(o, s) {
                function r(e) {
                    try {
                        c(n.next(e))
                    } catch (e) {
                        s(e)
                    }
                }
                function a(e) {
                    try {
                        c(n.throw(e))
                    } catch (e) {
                        s(e)
                    }
                }
                function c(e) {
                    var t;
                    e.done ? o(e.value) : (t = e.value,
                    t instanceof i ? t : new i(function(e) {
                        e(t)
                    }
                    )).then(r, a)
                }
                c((n = n.apply(e, t || [])).next())
            }
            );
            var e, t, i, n
        }
        checkAvailability() {
            return Promise.resolve(!0)
        }
        get messagePasser() {
            return this._messagePasser
        }
    }
    function Tn(e, t, i, n) {
        return o = this,
        s = void 0,
        a = function*() {
            i || (i = "POST");
            const o = {
                method: i,
                headers: {
                    "Content-Type": "application/json"
                }
            };
            t && (o.headers.Authorization = "Bearer " + t),
            n && (o.body = JSON.stringify(n));
            try {
                return yield fetch(e, o)
            } catch (e) {
                return console.log(e),
                new Response
            }
        }
        ,
        new ((r = void 0) || (r = Promise))(function(e, t) {
            function i(e) {
                try {
                    c(a.next(e))
                } catch (e) {
                    t(e)
                }
            }
            function n(e) {
                try {
                    c(a.throw(e))
                } catch (e) {
                    t(e)
                }
            }
            function c(t) {
                var o;
                t.done ? e(t.value) : (o = t.value,
                o instanceof r ? o : new r(function(e) {
                    e(o)
                }
                )).then(i, n)
            }
            c((a = a.apply(o, s || [])).next())
        }
        );
        var o, s, r, a
    }
    function bn(e, t) {
        return i = this,
        n = void 0,
        s = function*() {
            var i;
            const n = yield Tn(e + "/account", t, "GET");
            if (200 === n.status) {
                const e = yield n.json();
                if ((null === (i = e.username) || void 0 === i ? void 0 : i.length) > 0)
                    return e.username
            }
            return null
        }
        ,
        new ((o = void 0) || (o = Promise))(function(e, t) {
            function r(e) {
                try {
                    c(s.next(e))
                } catch (e) {
                    t(e)
                }
            }
            function a(e) {
                try {
                    c(s.throw(e))
                } catch (e) {
                    t(e)
                }
            }
            function c(t) {
                var i;
                t.done ? e(t.value) : (i = t.value,
                i instanceof o ? i : new o(function(e) {
                    e(i)
                }
                )).then(r, a)
            }
            c((s = s.apply(i, n || [])).next())
        }
        );
        var i, n, o, s
    }
    var Bn = function(e, t, i, n) {
        return new (i || (i = Promise))(function(o, s) {
            function r(e) {
                try {
                    c(n.next(e))
                } catch (e) {
                    s(e)
                }
            }
            function a(e) {
                try {
                    c(n.throw(e))
                } catch (e) {
                    s(e)
                }
            }
            function c(e) {
                var t;
                e.done ? o(e.value) : (t = e.value,
                t instanceof i ? t : new i(function(e) {
                    e(t)
                }
                )).then(r, a)
            }
            c((n = n.apply(e, t || [])).next())
        }
        )
    };
    const En = "#a28777";
    class In {
        constructor(e) {
            this.buttonColorBrown = En,
            this.siteManager = e,
            this.findOrCreateHtmlElements()
        }
        findOrCreateHtmlElements() {
            this.div = document.createElement("div"),
            this.connectButton = document.createElement("button"),
            this.messageDiv = document.createElement("div"),
            this.messageDiv.style.display = "flex",
            this.messageDiv.style.alignItems = "center",
            this.connectButtonSmall = document.createElement("button")
        }
        initialize() {
            return Bn(this, void 0, void 0, function*() {
                this.div && (this.div.style.display = "flex",
                this.div.style.flexDirection = "column",
                this.div.style.alignItems = "center",
                this.div.id = "chessnutdiv"),
                B() ? this.connectButton.innerHTML = "Connect" : this.connectButton.innerHTML = "Exit App",
                this.connectButton.innerHTML = yield this.getConnectButtonText("Connect"),
                this.connectButton.style.height = "20",
                this.connectButton.style.width = "60",
                this.connectButton.style.backgroundColor = this.buttonColorBrown,
                this.connectButton.style.borderRadius = "4px",
                this.messageDiv && (this.messageDiv.style.display = "none"),
                this.connectButtonSmall && (this.connectButtonSmall.style.width = "60%",
                this.connectButtonSmall.style.paddingTop = "100%",
                this.connectButtonSmall.style.border = "none"),
                this.div && (this.div.appendChild(this.connectButton),
                this.div.appendChild(this.connectButtonSmall),
                this.div.appendChild(this.messageDiv))
            })
        }
        getConnectButtonText(e) {
            return Bn(this, void 0, void 0, function*() {
                return yield this.siteManager.initI18n(),
                B() ? i("ExitApp") : yield i(e)
            })
        }
        static installVirtualKeyboard(e, t) {
            return Bn(this, void 0, void 0, function*() {
                yield w( () => "undefined" != typeof ccInstallVirtualKeyboard, 500),
                setInterval( () => {
                    ccInstallVirtualKeyboard(e, t)
                }
                , 500)
            })
        }
        startConnecting(e) {
            return Bn(this, void 0, void 0, function*() {
                this.connectButton.style.backgroundColor = this.buttonColorBrown,
                this.connectButton.innerHTML = yield this.getConnectButtonText("Connect"),
                this.connectButtonSmall && !B() && (this.connectButtonSmall.style.background = 'url("' + (yield this.siteManager.getOptions()).resUrl + '/icon128downyellow.png") center/contain no-repeat'),
                this.messageDiv && e && (this.messageDiv.style.display = "flex",
                this.messageDiv.innerHTML = "connecting..")
            })
        }
        startSearching() {
            return Bn(this, void 0, void 0, function*() {
                (yield this.siteManager.getSessionData()).wasConnected && (this.connectButton.style.backgroundColor = this.buttonColorBrown,
                this.connectButton.innerHTML = yield this.getConnectButtonText("Connect"),
                this.connectButtonSmall && (this.connectButtonSmall.style.background = 'url("' + (yield this.siteManager.getOptions()).resUrl + '/icon128downyellow.png") center/contain no-repeat'))
            })
        }
        showStatusMessage(e, t) {
            b(e),
            this.messageDiv && !t && (this.messageDiv.innerHTML = e,
            this.messageDiv.style.display = "flex")
        }
        setButtonIcon(e, t) {
            return Bn(this, void 0, void 0, function*() {
                var i;
                const n = yield this.siteManager.getOptions();
                if (n.resUrl) {
                    let o = "icon128down.png";
                    (null === (i = this.siteManager.connectionManager) || void 0 === i ? void 0 : i.currentBoard) ? (this.connectButton.innerHTML = yield this.getConnectButtonText("Connected"),
                    e && e <= 33 ? (o = "icon128upred.png",
                    this.connectButton.style.backgroundColor = "#ff0000") : (o = "icon128upgreen.png",
                    this.siteManager.usesOfficialApi() ? this.connectButton.style.backgroundColor = "#64acac" : this.connectButton.style.backgroundColor = "#64ac71")) : (this.connectButton.innerHTML = yield this.getConnectButtonText("Connect"),
                    this.connectButton.style.backgroundColor = this.buttonColorBrown),
                    B() && (o = this.siteManager.usesOfficialApi() ? "icon128exit_api.png" : "icon128exit.png"),
                    this.connectButtonSmall && (this.connectButtonSmall.style.background = 'url("' + n.resUrl + "/" + o + '") center/contain no-repeat'),
                    void 0 !== e ? this.showStatusMessage(In.batteryIconAsHtml(null != t ? t : f.BATTERY, n) + e + "%", !1) : this.messageDiv && (this.messageDiv.style.display = "none")
                }
            })
        }
        static batteryIconAsHtml(e, t) {
            switch (e) {
            case f.BATTERY:
                return `<img src="${t.resUrl}/battery.png" width="25px"> `;
            case f.BOARD:
                return `<img src="${t.resUrl}/battery_board.png" width="25px"> `;
            case f.PIECES:
                return `<img src="${t.resUrl}/battery_pieces.png" width="25px"> `;
            case f.NONE:
            default:
                return ""
            }
        }
        static isInDom(e) {
            return null !== document.getElementById(e.id)
        }
    }
    var Fn = function(e, t, i, n) {
        return new (i || (i = Promise))(function(o, s) {
            function r(e) {
                try {
                    c(n.next(e))
                } catch (e) {
                    s(e)
                }
            }
            function a(e) {
                try {
                    c(n.throw(e))
                } catch (e) {
                    s(e)
                }
            }
            function c(e) {
                var t;
                e.done ? o(e.value) : (t = e.value,
                t instanceof i ? t : new i(function(e) {
                    e(t)
                }
                )).then(r, a)
            }
            c((n = n.apply(e, t || [])).next())
        }
        )
    };
    const Ln = "DGT3000-Gateway"
      , On = "73822f6e-edcd-44bb-974b-93ee97cb0000";
    class kn extends Yt {
        constructor(e, t) {
            super( () => Promise.resolve()),
            this.isConnected = !1,
            this.device = null,
            this.commandCharacteristic = null,
            this.reconnectInterval = null,
            this.sendSerializer = new tt,
            this.sendAndWaitBuffer = new s,
            this.isReconnectTryActive = !1,
            this.isReconnectServiceStarted = !1,
            this.lastCommandId = 0,
            this.disconnectListener = e => {
                b("DGT3000-Gateway disconnected"),
                this.disconnect()
            }
            ,
            this.siteManager = e,
            F.getGlobalDevice().isApp() ? this.initClock() : t ? kn.pairNewDevice().then(e => {
                e && (this.device = e,
                this.startReconnectService())
            }
            ) : this.deviceAvailable().then(e => {
                e && this.startReconnectService()
            }
            )
        }
        static pairNewDevice() {
            return Fn(this, void 0, void 0, function*() {
                try {
                    const e = {
                        filters: [{
                            namePrefix: Ln
                        }],
                        optionalServices: [On]
                    };
                    return yield navigator.bluetooth.requestDevice(e)
                } catch (e) {
                    yield T(e, !1)
                }
                return null
            })
        }
        deviceAvailable() {
            return Fn(this, void 0, void 0, function*() {
                const e = yield navigator.bluetooth.getDevices();
                for (const t of e)
                    if (t.name === Ln)
                        return !0;
                return !1
            })
        }
        startReconnectService() {
            this.isReconnectServiceStarted || (this.isReconnectServiceStarted = !0,
            b("Starting DGT3000-Gateway reconnect service"),
            this.reconnectInterval || (this.reconnectInterval = setInterval( () => {
                this.tryReconnect()
            }
            , 3e3)))
        }
        tryReconnect() {
            return Fn(this, void 0, void 0, function*() {
                if (!this.isReconnectTryActive && !this.isConnected) {
                    this.isReconnectTryActive = !0;
                    const e = yield navigator.bluetooth.getDevices();
                    for (const t of e)
                        t.name === Ln && (this.device = t,
                        yield this.connectToDevice());
                    this.isReconnectTryActive = !1
                }
            })
        }
        connectToDevice() {
            return Fn(this, void 0, void 0, function*() {
                try {
                    b("DGT3000-Gateway: connecting to gatt...");
                    const e = yield this.device.gatt.connect();
                    b("DGT3000-Gateway: obtaining protocol characteristic...");
                    const t = yield ht.getCharacteristic(e, On, "73822f6e-edcd-44bb-974b-93ee97cb0001");
                    b("DGT3000-Gateway: reading protocol version..."),
                    b("DGT3000-Gateway Protocol Version: " + M(yield t.readValue())),
                    b("DGT3000-Gateway: obtaining event characteristic...");
                    const i = yield ht.getCharacteristic(e, On, "73822f6e-edcd-44bb-974b-93ee97cb0003");
                    i.addEventListener("characteristicvaluechanged", e => {
                        this.handleClockEvent(e)
                    }
                    ),
                    yield i.startNotifications(),
                    b("DGT3000-Gateway: obtaining command characteristic..."),
                    this.commandCharacteristic = yield ht.getCharacteristic(e, On, "73822f6e-edcd-44bb-974b-93ee97cb0002"),
                    this.isConnected = !0,
                    this.device.addEventListener("gattserverdisconnected", this.disconnectListener),
                    b("DGT3000-Gateway: initializing clock..."),
                    yield this.initClock(),
                    b("DGT3000-Gateway: connected")
                } catch (e) {
                    yield T(e, !1)
                }
            })
        }
        initClock() {
            return Fn(this, void 0, void 0, function*() {
                var e, t;
                this.isConnected = !0;
                const i = null === (t = null === (e = this.siteManager.connectionManager) || void 0 === e ? void 0 : e.currentBoard) || void 0 === t ? void 0 : t.getLastClockState()
                  , n = yield this.siteManager.isWhiteLeftOnClock();
                yield this.reset(),
                i && (yield this.update(i, n ? te.WHITE : te.BLACK))
            })
        }
        disconnect() {
            return b("DGT3000-Gateway actively disconnected"),
            navigator.bluetooth.removeEventListener("disconnect", this.disconnectListener),
            this.isConnected = !1,
            super.disconnect()
        }
        update(e, t, i) {
            return Fn(this, void 0, void 0, function*() {
                var n;
                if (this.leftColor = t,
                e.lifecycle === re.FINISHED)
                    yield this.sendAscii(this.gameResultAsString(e.gameResult).toUpperCase());
                else if ((null === (n = e.algebraic) || void 0 === n ? void 0 : n.length) > 0 && (null == i ? void 0 : i.showMovesOnClock))
                    yield this.sendAscii(e.algebraic.toUpperCase()),
                    this.pendingClockState = e;
                else if (e.hasTimeLeft()) {
                    if (e.isCountingDown()) {
                        let i = !1
                          , n = !1;
                        e.runningForPlayer === te.WHITE ? (i = t === te.WHITE,
                        n = t === te.BLACK) : e.runningForPlayer === te.BLACK && (i = t === te.BLACK,
                        n = t === te.WHITE),
                        yield this.sendToGateway({
                            command: "setTime",
                            id: "" + ++this.lastCommandId,
                            params: {
                                leftMode: i ? 1 : 0,
                                leftHours: e.getHours(t),
                                leftMinutes: e.getMinutes(t),
                                leftSeconds: e.getSeconds(t),
                                rightMode: n ? 1 : 0,
                                rightHours: e.getHours(te.oppositeColor(t)),
                                rightMinutes: e.getMinutes(te.oppositeColor(t)),
                                rightSeconds: e.getSeconds(te.oppositeColor(t))
                            }
                        })
                    }
                } else
                    yield this.sendToGateway({
                        command: "endDisplay",
                        id: "" + ++this.lastCommandId
                    })
            })
        }
        sendAscii(e) {
            return Fn(this, void 0, void 0, function*() {
                yield this.sendToGateway({
                    command: "displayText",
                    id: "" + ++this.lastCommandId,
                    params: {
                        text: e
                    }
                })
            })
        }
        sendToGateway(e) {
            return Fn(this, void 0, void 0, function*() {
                const t = JSON.stringify(e);
                b("hallo10"),
                this.isConnected && (b("hallo11"),
                yield this.sendSerializer.enqueue( () => Fn(this, void 0, void 0, function*() {
                    yield this.sendAndWaitBuffer.send( () => {
                        if (F.getGlobalDevice().isApp())
                            F.getGlobalDevice().app.sendDataToTapNset(btoa(t));
                        else {
                            const e = (new TextEncoder).encode(t);
                            this.commandCharacteristic.writeValue(e)
                        }
                    }
                    , t => t.id === e.id, `DGT3000-Gateway command ${e.command}, ID ${e.id}`)
                }))),
                b("hallo12")
            })
        }
        handleClockEvent(e) {
            return Fn(this, void 0, void 0, function*() {
                try {
                    let t;
                    if ("string" == typeof e)
                        t = JSON.parse(atob(e));
                    else {
                        const i = C(new Uint8Array(e.target.value.buffer,e.target.value.byteOffset,e.target.value.byteLength));
                        t = JSON.parse(i)
                    }
                    !this.sendAndWaitBuffer.receive(t) && "type"in t && "buttonEvent" === t.type && (yield this.processButtonEvent(t))
                } catch (e) {
                    T("DGT3000-Gateway: Fehler beim Verarbeiten der Nachricht: " + e, !1)
                }
            })
        }
        processButtonEvent(e) {
            return Fn(this, void 0, void 0, function*() {
                var t, i;
                if (!e.data.isRepeat && (yield this.siteManager.getOptions()).transmitMovesOnClockPress && this.pendingMove) {
                    const e = this.pendingMove;
                    this.pendingMove = null,
                    yield this.siteManager.siteBoard.makeMove(e),
                    yield null === (i = null === (t = this.siteManager.connectionManager) || void 0 === t ? void 0 : t.currentBoard) || void 0 === i ? void 0 : i.queryBattery()
                }
            })
        }
    }
    var An = function(e, t, i, n) {
        return new (i || (i = Promise))(function(o, s) {
            function r(e) {
                try {
                    c(n.next(e))
                } catch (e) {
                    s(e)
                }
            }
            function a(e) {
                try {
                    c(n.throw(e))
                } catch (e) {
                    s(e)
                }
            }
            function c(e) {
                var t;
                e.done ? o(e.value) : (t = e.value,
                t instanceof i ? t : new i(function(e) {
                    e(t)
                }
                )).then(r, a)
            }
            c((n = n.apply(e, t || [])).next())
        }
        )
    };
    class Dn extends Pi {
        constructor(e, t) {
            super(e => An(this, void 0, void 0, function*() {
                yield this.sendDataToClock(new Uint8Array(e))
            })),
            this.reconnectInterval = null,
            this.sendSerializer = new tt,
            this.isReconnectTryActive = !1,
            this.disconnectListener = e => {
                b("TapnSetHidClock disconnected"),
                this.hidDevice = null
            }
            ,
            this.inputreportListener = e => {
                e.reportId >= 0 && 32 === e.data.byteLength && 255 === e.data.getUint8(0) && 202 === e.data.getUint8(1) && this.processClockMessage(new Uint8Array(e.data.buffer), this.siteManager)
            }
            ,
            this.siteManager = e,
            F.getGlobalDevice().isApp() ? this.initClock() : this.deviceAvailable(t.tapnsetDeviceId).then(i => {
                i ? (this.deviceId = t.tapnsetDeviceId,
                this.startReconnectService()) : Dn.pairNewDevice().then(i => {
                    i && (this.deviceId = i,
                    t.tapnsetDeviceId = i,
                    e.saveOptionsAndWait(t, e => e.tapnsetDeviceId === i).then( () => {
                        this.startReconnectService()
                    }
                    ))
                }
                )
            }
            )
        }
        static pairNewDevice() {
            return An(this, void 0, void 0, function*() {
                const e = {
                    filters: [{
                        vendorId: Bi
                    }]
                };
                try {
                    const t = yield navigator.hid.requestDevice(e);
                    if (t.length > 0)
                        return Ri.getDeviceId(t[0])
                } catch (e) {
                    T(e, !1)
                }
                return null
            })
        }
        deviceAvailable(e) {
            return An(this, void 0, void 0, function*() {
                if (e && "unknown" !== e) {
                    const t = yield navigator.hid.getDevices();
                    if (t)
                        for (const i of t)
                            if (Ri.getDeviceId(i) === e)
                                return !0;
                    return !1
                }
                return !1
            })
        }
        startReconnectService() {
            b("Starting TapnSetHidClock reconnect service"),
            this.reconnectInterval || (this.reconnectInterval = setInterval( () => {
                this.tryReconnect()
            }
            , 1e3))
        }
        tryReconnect() {
            return An(this, void 0, void 0, function*() {
                var e;
                const t = yield this.siteManager.getOptions();
                if ("function" == typeof navigator.hid.getDevices && !this.isReconnectTryActive && (null === (e = t.tapnsetDeviceId) || void 0 === e ? void 0 : e.length) && "unknown" !== t.tapnsetDeviceId && "unknown" !== t.tapnsetDeviceId && !this.hidDevice) {
                    this.isReconnectTryActive = !0;
                    const e = yield navigator.hid.getDevices();
                    for (const t of e)
                        Ri.getDeviceId(t) === this.deviceId && (yield this.connectToDevice(t));
                    this.isReconnectTryActive = !1
                }
            })
        }
        connectToDevice(e) {
            return An(this, void 0, void 0, function*() {
                e.opened || (yield e.open()),
                b("Connected to TapnSetHidClock"),
                this.hidDevice = e,
                navigator.hid.addEventListener("disconnect", this.disconnectListener),
                e.addEventListener("inputreport", this.inputreportListener),
                yield this.initClock()
            })
        }
        initClock() {
            return An(this, void 0, void 0, function*() {
                var e, t;
                const i = null === (t = null === (e = this.siteManager.connectionManager) || void 0 === e ? void 0 : e.currentBoard) || void 0 === t ? void 0 : t.getLastClockState()
                  , n = yield this.siteManager.isWhiteLeftOnClock();
                yield this.reset(),
                i && (yield this.update(i, n ? te.WHITE : te.BLACK))
            })
        }
        sendDataToClock(e) {
            return this.sendSerializer.enqueue( () => An(this, void 0, void 0, function*() {
                var t, i, n;
                try {
                    const o = yield this.siteManager.getOptions()
                      , s = F.getGlobalDevice();
                    if (b("Sending to TapNset: " + (n = e,
                    Array.from(n, e => e.toString(10).padStart(3, "0")).join(" "))),
                    (null === (t = o.tapnsetDeviceId) || void 0 === t ? void 0 : t.length) && s.isApp())
                        s.sendDataToTapNset(e);
                    else
                        for (const t of e)
                            null === (i = this.hidDevice) || void 0 === i || i.sendReport(0, Uint8Array.from([t]))
                } catch (e) {
                    console.error("Error sending data to TapNset adapter:", e)
                }
            }))
        }
        disconnect() {
            var e;
            return b("TapnSetHidClock actively disconnected"),
            navigator.hid.removeEventListener("disconnect", this.disconnectListener),
            null === (e = this.hidDevice) || void 0 === e || e.removeEventListener("inputreport", this.inputreportListener),
            this.hidDevice = null,
            super.disconnect()
        }
    }
    var Rn = function(e, t, i, n) {
        return new (i || (i = Promise))(function(o, s) {
            function r(e) {
                try {
                    c(n.next(e))
                } catch (e) {
                    s(e)
                }
            }
            function a(e) {
                try {
                    c(n.throw(e))
                } catch (e) {
                    s(e)
                }
            }
            function c(e) {
                var t;
                e.done ? o(e.value) : (t = e.value,
                t instanceof i ? t : new i(function(e) {
                    e(t)
                }
                )).then(r, a)
            }
            c((n = n.apply(e, t || [])).next())
        }
        )
    };
    const Nn = "chessconnect-connect-menu"
      , Hn = "chessconnect-ConnectMenuBoard"
      , xn = "chessconnect-ConnectTapNSet"
      , Wn = "chessconnect-ConnectDgt3000Gateway"
      , Un = "chessconnect-ConnectMenuHomePosition";
    class _n {
        static get instance() {
            return _n._instance || (_n._instance = new _n),
            _n._instance
        }
        show(e, t) {
            return Rn(this, void 0, void 0, function*() {
                const i = yield this.getHtmlElement();
                yield this.createActions(t),
                i.style.display = "flex",
                i.style.left = "0px",
                i.style.top = "0px";
                const n = i.getBoundingClientRect()
                  , o = n.width
                  , s = n.height
                  , r = window.innerWidth
                  , a = window.innerHeight;
                let c = e.pageX
                  , l = e.pageY;
                c + o > r && (c = r - o),
                l + s > a && (l = a - s),
                c = Math.max(0, c),
                l = Math.max(0, l),
                i.style.left = c + "px",
                i.style.top = l + "px"
            })
        }
        getHtmlElement() {
            return Rn(this, void 0, void 0, function*() {
                const e = document.getElementById(Nn);
                return null != e ? e : yield this.createMenu()
            })
        }
        createMenu() {
            return Rn(this, void 0, void 0, function*() {
                const e = `style="background-color: ${En}; border-radius: 4px; height: 30px; display: block"`
                  , t = yield i("connectToChessboard")
                  , n = yield i("connectTapNset")
                  , o = yield i("connectDGT3000Gateway")
                  , s = yield i("moveHomePosition")
                  , r = document.createElement("div");
                return r.id = Nn,
                r.className = "connect-menu",
                r.style.display = "flex",
                r.style.flexDirection = "column",
                r.style.position = "absolute",
                r.style.zIndex = "10000",
                r.style.padding = "5px",
                r.style.backgroundColor = "white",
                r.style.border = "1px solid #ccc",
                r.style.boxShadow = "0 2px 10px rgba(0, 0, 0, 0.1)",
                r.style.borderRadius = "4px",
                r.style.gap = "10px",
                r.innerHTML = `\n      <button id="${Hn}" ${e}>${t}</button>\n      <button id="${xn}" ${e}>${n}</button>\n      <button id="${Wn}" ${e}>${o}</button>\n      <button id="${Un}" ${e}>${s}</button>\n    `,
                document.body.appendChild(r),
                document.addEventListener("mousedown", e => {
                    this.getHtmlElement().then(t => {
                        t.contains(e.target) || (t.style.display = "none")
                    }
                    )
                }
                ),
                r
            })
        }
        createActions(e) {
            return Rn(this, void 0, void 0, function*() {
                var t;
                const i = yield e.getOptions()
                  , n = null === (t = e.connectionManager) || void 0 === t ? void 0 : t.currentBoard
                  , o = document.getElementById(Hn);
                o && (o.onclick = this.createAction( () => {
                    var t;
                    null === (t = e.connectionManager) || void 0 === t || t.connectToBoard()
                }
                ));
                const s = document.getElementById(xn);
                s && (i.clockType !== k.TAPNSET_ADAPTER ? s.style.display = "none" : (s.style.display = "block",
                n ? (s.disabled = !1,
                s.onclick = this.createAction( () => {
                    n.setClock(new Dn(e,i))
                }
                )) : s.disabled = !0));
                const r = document.getElementById(Wn);
                r && (i.clockType !== k.DGT3000_GATEWAY ? r.style.display = "none" : (r.style.display = "block",
                n ? (r.disabled = !1,
                r.onclick = this.createAction( () => {
                    n.setClock(new kn(e,!0))
                }
                )) : r.disabled = !0));
                const a = document.getElementById(Un);
                n && n instanceof Lt && n.isChessnutMoveBoard() ? (a.style.display = "block",
                a.onclick = this.createAction( () => {
                    n.moveToStartingPosition()
                }
                )) : a.style.display = "none"
            })
        }
        createAction(e) {
            return t => {
                t.stopPropagation(),
                this.getHtmlElement().then(e => {
                    e.style.display = "none"
                }
                ),
                e(t)
            }
        }
    }
    var Gn = function(e, t, i, n) {
        return new (i || (i = Promise))(function(o, s) {
            function r(e) {
                try {
                    c(n.next(e))
                } catch (e) {
                    s(e)
                }
            }
            function a(e) {
                try {
                    c(n.throw(e))
                } catch (e) {
                    s(e)
                }
            }
            function c(e) {
                var t;
                e.done ? o(e.value) : (t = e.value,
                t instanceof i ? t : new i(function(e) {
                    e(t)
                }
                )).then(r, a)
            }
            c((n = n.apply(e, t || [])).next())
        }
        )
    };
    const Kn = new fn;
    class qn {
        constructor() {
            this.getSessionDataPromise = null,
            this.channelConnectionResolved = !1,
            this.tabId = Date.now().toString(36) + Math.random().toString(36).slice(2),
            this.onUnknownBackgroundEvent = e => Promise.resolve(),
            this.apiUrls = new Set,
            this.debugBoardMessagePasser = new e( (e, t) => {
                var i;
                null === (i = this.channel) || void 0 === i || i.postMessage({
                    type: "debugBoardQuestion",
                    senderTabId: this.tabId,
                    messageId: e,
                    debugBoardMessage: t
                })
            }
            ),
            this.broadcastHandler = e => Gn(this, void 0, void 0, function*() {
                var i, n, o, s;
                switch (e.data.type) {
                case "connectFromBackend":
                    void 0 !== e.data.senderTabId || this.channelConnectionResolved ? e.data.senderTabId === this.tabId && (this.channelConnectedResolver(),
                    this.channelConnectionResolved = !0) : null === (i = this.channel) || void 0 === i || i.postMessage({
                        type: "connectFromFrontend",
                        senderTabId: this.tabId
                    });
                    break;
                case "getOptionsFromBackend":
                    this.tabId === e.data.senderTabId && (this.globalOptions = Object.assign(new x, e.data.options),
                    s = this.globalOptions.resUrl,
                    g = s,
                    this.optionsResolver(),
                    this.connectionManager && this.connectionManager.isConnected() || (yield this.createConnectionManager()));
                    break;
                case "getSessionDataReply":
                    this.tabId === e.data.senderTabId && (this.sessionData = e.data.sessionData,
                    this.getSessionDataResolver());
                    break;
                case "anybodyConnected?":
                    this.tabId !== e.data.senderTabId && (null === (n = this.connectionManager) || void 0 === n ? void 0 : n.isConnected()) && (null === (o = this.channel) || void 0 === o || o.postMessage({
                        type: "anybodyConnected!",
                        senderTabId: this.tabId
                    }));
                    break;
                case "anybodyConnected!":
                    this.anybodyConnectedResolver && this.anybodyConnectedResolver(!0);
                    break;
                case "i18nAnswer":
                    this.tabId === e.data.senderTabId && t.reply(e.data.i18nId, e.data.i18nAnswer);
                    break;
                case "debugBoardAnswer":
                    this.debugBoardMessagePasser.reply(e.data.messageId, e.data.debugBoardMessage);
                    break;
                default:
                    yield this.onUnknownBackgroundEvent(e)
                }
            }),
            (window.chessconnect || (window.chessconnect = {}),
            window.chessconnect).siteManager = this,
            this.htmlHelper = new In(this),
            F.createGlobalDevice();
            const i = F.getGlobalDevice();
            this.optionsPromise = i.app ? Promise.resolve() : new Promise(e => {
                this.optionsResolver = e
            }
            ),
            this.getSessionDataPromise = i.app ? Promise.resolve() : new Promise(e => {
                this.getSessionDataResolver = e
            }
            ),
            this.channelConnected = i.app ? Promise.resolve() : new Promise(e => {
                this.channelConnectedResolver = e
            }
            ),
            v || i.app || (this.channel = new BroadcastChannel("1"),
            this.channel.onmessage = this.broadcastHandler,
            this.channel.postMessage({
                type: "connectFromFrontend",
                senderTabId: this.tabId
            })),
            i.app || this.channelConnected.then( () => {
                var e;
                null === (e = this.channel) || void 0 === e || e.postMessage({
                    type: "getOptionsFromFrontend",
                    senderTabId: this.tabId
                })
            }
            ),
            i.app ? i.loadOptions(new x).then(e => {
                this.globalOptions = e,
                this.onOptionsReceived()
            }
            ) : this.optionsPromise.then( () => {
                this.onOptionsReceived()
            }
            ),
            v || i.app || setInterval( () => {
                this.checkForDebugBoard()
            }
            , 1e3)
        }
        forceReloadOptions() {
            return Gn(this, void 0, void 0, function*() {
                var e;
                const t = F.getGlobalDevice();
                return t.app ? this.globalOptions = yield t.loadOptions(new x) : (this.optionsPromise = new Promise(e => {
                    this.optionsResolver = e
                }
                ),
                null === (e = this.channel) || void 0 === e || e.postMessage({
                    type: "getOptionsFromFrontend",
                    senderTabId: this.tabId
                })),
                yield this.getOptions()
            })
        }
        initialize() {
            return Gn(this, void 0, void 0, function*() {
                yield this.initI18n();
                const e = yield this.getOptions();
                F.getGlobalDevice().isApp() && (yield this.initForAppEnvironment(e)),
                b(`============= Chessconnect version ${e.currentVersion} =============`),
                yield this.htmlHelper.initialize()
            })
        }
        initForAppEnvironment(e) {
            return Gn(this, void 0, void 0, function*() {
                var t;
                const i = F.getGlobalDevice();
                yield i.isInitialized(),
                i.connectionManager = yield(new fn).createConnectionManager(L.APP, e.boardType, this),
                this.connectionManager = i.connectionManager,
                this.connectionManager.currentBoard = this.connectionManager.candidateBoard,
                null === (t = i.app) || void 0 === t || t.initTextToSpeech();
                const n = yield i.isConnectedToBoard();
                n.length && this.connectionManager.currentBoard.initializeBoard(n)
            })
        }
        initI18n() {
            return Gn(this, void 0, void 0, function*() {
                F.getGlobalDevice().app || (yield this.channelConnected,
                t || (t = new e( (e, t) => {
                    var i;
                    null === (i = this.channel) || void 0 === i || i.postMessage({
                        type: "i18nQuestion",
                        i18nId: e,
                        i18nQuestion: t,
                        senderTabId: this.tabId
                    })
                }
                )))
            })
        }
        checkForDebugBoard() {
            return Gn(this, void 0, void 0, function*() {
                var e, t;
                !(null === (e = this.connectionManager) || void 0 === e ? void 0 : e.isConnected()) && (yield this.isDebugBoardPresent()) && (yield this.createConnectionManager(),
                yield null === (t = this.connectionManager) || void 0 === t ? void 0 : t.connectToBoard())
            })
        }
        getOptions() {
            return Gn(this, void 0, void 0, function*() {
                const e = F.getGlobalDevice();
                return e.app ? this.globalOptions || (this.globalOptions = yield e.loadOptions(new x)) : yield this.optionsPromise,
                this.globalOptions
            })
        }
        setOptions(e) {
            this.globalOptions = e
        }
        saveOptions() {
            var e;
            const t = F.getGlobalDevice();
            t.app ? t.saveOptions(this.globalOptions) : (null === (e = this.channel) || void 0 === e || e.postMessage({
                type: "saveOptions",
                options: this.globalOptions,
                senderTabId: this.tabId
            }),
            this.connectionManager instanceof Vi && this.connectionManager.sendMessage({
                type: "setParams",
                payload: JSON.stringify(this.globalOptions)
            }))
        }
        saveOptionsAndWait(e, t) {
            return Gn(this, void 0, void 0, function*() {
                let i = yield this.getOptions();
                this.setOptions(e),
                this.saveOptions();
                do {
                    i = yield this.forceReloadOptions(),
                    b("waiting for options to be saved")
                } while (!t(i))
            })
        }
        saveOptionProperty(e, t) {
            return Gn(this, void 0, void 0, function*() {
                const i = yield this.getOptions();
                i[e] = t,
                yield this.saveOptionsAndWait(i, i => i[e] === t)
            })
        }
        onSmartboardConnect(e) {
            return Gn(this, void 0, void 0, function*() {
                var t, i;
                b("smartboard connected " + e.instanceCounter),
                yield this.getSessionData(),
                this.sessionData.wasConnected = !0,
                this.sendSessionData(this.sessionData),
                yield e.reset();
                const n = null === (t = this.siteBoard) || void 0 === t ? void 0 : t.getCurrentPosition()
                  , o = null === (i = this.siteBoard) || void 0 === i ? void 0 : i.getCurrentClockState();
                n && (yield e.setSitePosition(n, o || new le)),
                this.htmlHelper.setButtonIcon(),
                F.getGlobalDevice().isApp() || (e.onBatteryChanged = (e, t) => {
                    this.htmlHelper.setButtonIcon(e, t)
                }
                ),
                yield e.queryBattery()
            })
        }
        onSmartboardDisconnect() {
            var e, t, i;
            b("disconnect detected " + (null === (t = null === (e = this.connectionManager) || void 0 === e ? void 0 : e.currentBoard) || void 0 === t ? void 0 : t.instanceCounter)),
            null === (i = this.connectionManager) || void 0 === i || i.boardDisconnected(),
            this.htmlHelper.setButtonIcon()
        }
        sendSessionData(e) {
            const t = {
                type: "setSessionData",
                sessionData: e,
                senderTabId: this.tabId
            };
            this.sendToBackend(t)
        }
        playSound(e) {
            return Gn(this, void 0, void 0, function*() {
                var t, i, n, o;
                if (this.connectionManager instanceof Vi)
                    this.connectionManager.playSound(e);
                else if (F.getGlobalDevice().isApp()) {
                    const i = yield this.getOptions();
                    null === (t = F.getGlobalDevice().app) || void 0 === t || t.playSound(e.valueOf(), i.moveSound.valueOf())
                } else if (null === (i = this.connectionManager) || void 0 === i ? void 0 : i.isConnected())
                    if (yield null === (n = this.connectionManager.currentBoard) || void 0 === n ? void 0 : n.supportsSoundEvent(e))
                        null === (o = this.connectionManager.currentBoard) || void 0 === o || o.playSound(e);
                    else {
                        const t = {
                            type: "soundEvent",
                            soundEvent: e,
                            senderTabId: this.tabId
                        };
                        this.sendToBackend(t)
                    }
            })
        }
        say(e) {
            var t, i;
            if (F.getGlobalDevice().isApp())
                null === (t = F.getGlobalDevice().app) || void 0 === t || t.say(e);
            else if (null === (i = this.connectionManager) || void 0 === i ? void 0 : i.isConnected()) {
                const t = {
                    type: "say",
                    text: e,
                    senderTabId: this.tabId
                };
                this.sendToBackend(t)
            }
        }
        sendToBackend(e) {
            return Gn(this, void 0, void 0, function*() {
                var t;
                yield this.channelConnected,
                e.senderTabId = this.tabId,
                null === (t = this.channel) || void 0 === t || t.postMessage(e)
            })
        }
        getSessionData() {
            return Gn(this, void 0, void 0, function*() {
                yield this.channelConnected,
                null === this.getSessionDataPromise && (this.getSessionDataPromise = new Promise(e => {
                    this.getSessionDataResolver = e
                }
                ));
                const e = {
                    type: "getSessionData",
                    senderTabId: this.tabId
                };
                return yield this.sendToBackend(e),
                yield this.getSessionDataPromise,
                this.sessionData
            })
        }
        onOptionsReceived() {
            return Gn(this, void 0, void 0, function*() {
                const e = yield this.getOptions();
                In.installVirtualKeyboard(e.lang.slice(0, 2), e.resUrl),
                this.htmlHelper.setButtonIcon(),
                !B() && this.channel && ne(e, this.channel, this.tabId)
            })
        }
        onConnectButtonPressed(e) {
            return Gn(this, void 0, void 0, function*() {
                const t = yield this.getOptions();
                B() ? yield this.exitApp() : (yield this.anotherTabIsActive()) ? yield d(yield i("SECOND_TAB_ACTIVE"), t.resUrl) : function(e, t) {
                    const i = navigator.userAgent.includes("CrOS");
                    return i && e === L.USB && t === O.CHESSNUT || e === L.USB && t === O.DGT_PEGASUS || i && e === L.BLUETOOTH && t === O.MILLENNIUM || e === L.USB && t === O.YIZHI || e === L.USB && t === O.CHESSUP || i && e === L.USB && t === O.STAUNTON
                }(t.connectionType, t.boardType) || !this.connectionManager ? yield d(yield i("NO_CONNECTION_MANAGER"), t.resUrl) : t.clockType === k.DGT3000_GATEWAY || t.clockType === k.TAPNSET_ADAPTER ? yield _n.instance.show(e, this) : yield this.connectionManager.connectToBoard()
            })
        }
        exitApp() {
            return Gn(this, void 0, void 0, function*() {
                const e = yield this.getOptions();
                (yield l(yield i("ConfirmExitApp"), e.resUrl)) && this.connectionManager.exitApp()
            })
        }
        anotherTabIsActive() {
            return new Promise(e => {
                var t;
                this.anybodyConnectedResolver = e,
                null === (t = this.channel) || void 0 === t || t.postMessage({
                    type: "anybodyConnected?",
                    senderTabId: this.tabId
                }),
                setTimeout( () => {
                    e(!1)
                }
                , 300)
            }
            )
        }
        createConnectionManager() {
            return Gn(this, void 0, void 0, function*() {
                const e = yield this.getOptions();
                this.connectionManager && (yield this.connectionManager.shutdown()),
                B() ? this.connectionManager = new Vi(this,new $i(this,e)) : (yield this.isDebugBoardPresent()) ? this.connectionManager = new Mn(this,this.debugBoardMessagePasser) : this.connectionManager = yield Kn.createConnectionManager(e.connectionType, e.boardType, this)
            })
        }
        isDebugBoardPresent() {
            return Gn(this, void 0, void 0, function*() {
                return !F.getGlobalDevice().app && "debugBoardPresent!" === (yield this.debugBoardMessagePasser.ask({
                    type: "debugBoardPresent?"
                })).type
            })
        }
        saveToken(e) {
            return Promise.resolve()
        }
        usesOfficialApi() {
            return !1
        }
        savePasswords(e, t, i) {
            return Gn(this, void 0, void 0, function*() {
                const n = yield this.getOptions();
                n.saveLoginData(e, {
                    username: t,
                    password: i
                }),
                yield this.saveOptionsAndWait(n, n => {
                    const o = n.getLoginData(e);
                    return (null == o ? void 0 : o.username) === t && o.password === i
                }
                )
            })
        }
        showStatusMessage(e, t) {
            this.htmlHelper.showStatusMessage(e, t)
        }
        startConnecting(e) {
            return Gn(this, void 0, void 0, function*() {
                yield this.htmlHelper.startConnecting(e)
            })
        }
        startSearching() {
            return Gn(this, void 0, void 0, function*() {
                yield this.htmlHelper.startSearching()
            })
        }
        isWhiteLeftOnClock() {
            return Gn(this, void 0, void 0, function*() {
                const e = yield this.getOptions()
                  , t = (yield this.siteBoard.getPlayersColor()) === te.WHITE;
                switch (e.clockPosition) {
                case A.WHITE_LEFT:
                    return !0;
                case A.WHITE_RIGHT:
                    return !1;
                case A.PLAYER_LEFT:
                    return t;
                case A.PLAYER_RIGHT:
                    return !t;
                default:
                    return !0
                }
            })
        }
        checkForTapnsetAdapter(e, t) {
            e.getClock() && e.getClock()instanceof Dn || t.clockType !== k.TAPNSET_ADAPTER || !t.tapnsetDeviceId || !(t.tapnsetDeviceId.length > 0) || e.setClock(new Dn(this,t))
        }
        checkForDgt3000Gateway(e, t) {
            e.getClock() && e.getClock()instanceof kn || t.clockType !== k.DGT3000_GATEWAY || e.setClock(new kn(this,!1))
        }
    }
    var zn;
    class $n {
        constructor(e) {
            this.isStopped = !1,
            this.processLine = e => {}
            ,
            this.url = e
        }
        setApiToken(e) {
            this.apiToken = e
        }
        stop() {
            this.isStopped = !0
        }
        start() {
            return e = this,
            t = void 0,
            n = function*() {
                var e;
                this.isStopped = !1;
                const t = {
                    headers: {
                        Authorization: `Bearer ${this.apiToken}`
                    }
                }
                  , i = yield fetch(this.url, t);
                if (!i.ok)
                    return yield T("Error opening stream: " + i.status + " : " + i.statusText, !1),
                    i.status;
                const n = null === (e = i.body) || void 0 === e ? void 0 : e.getReader();
                if (!n)
                    return yield T("Could not get response body reader", !1),
                    i.status;
                const o = /\r?\n/
                  , s = new TextDecoder;
                let r = ""
                  , a = !1;
                for (; !a; ) {
                    const e = yield n.read();
                    if (a = this.isStopped || e.done,
                    a)
                        !this.isStopped && r.length > 0 && this.processLine(JSON.parse(r));
                    else {
                        r += s.decode(e.value, {
                            stream: !0
                        });
                        const t = r.split(o);
                        r = t.pop() || "";
                        for (const e of t.filter(e => e))
                            this.processLine(JSON.parse(e))
                    }
                }
                return i.status
            }
            ,
            new ((i = void 0) || (i = Promise))(function(o, s) {
                function r(e) {
                    try {
                        c(n.next(e))
                    } catch (e) {
                        s(e)
                    }
                }
                function a(e) {
                    try {
                        c(n.throw(e))
                    } catch (e) {
                        s(e)
                    }
                }
                function c(e) {
                    var t;
                    e.done ? o(e.value) : (t = e.value,
                    t instanceof i ? t : new i(function(e) {
                        e(t)
                    }
                    )).then(r, a)
                }
                c((n = n.apply(e, t || [])).next())
            }
            );
            var e, t, i, n
        }
    }
    function Yn(e, t) {
        const i = t.clone()
          , n = function(e) {
            const t = []
              , i = e.moves.split(" ");
            for (let e = 0; e < i.length; e++)
                i[e].length && t.push(U.fromUciString(i[e], e % 2 == 0 ? te.WHITE : te.BLACK));
            return t
        }(e);
        for (let e of n)
            e = Vn(i, e),
            i.makeMove(e);
        return i
    }
    function Vn(e, t) {
        if (e.getPieceOnField(t.fromField) === te.KING) {
            if (t.fromField.col + 2 === t.toField.col) {
                const e = new W(t.fromField.row,7);
                return new U(t.fromField,e)
            }
            if (t.fromField.col - 2 === t.toField.col) {
                const e = new W(t.fromField.row,0);
                return new U(t.fromField,e)
            }
        }
        return t
    }
    function Qn(e) {
        return e.moves.split(" ").length % 2 == 1 ? te.WHITE : te.BLACK
    }
    function jn(e) {
        const t = new le;
        return t.whiteMs = e.wtime,
        t.blackMs = e.btime,
        e.status !== zn.created && e.status !== zn.started ? t.gameResult = function(e) {
            switch (e.status) {
            case zn.created:
            case zn.started:
                return null;
            case zn.aborted:
            case zn.noStart:
            case zn.unknownFinish:
            case zn.variantEnd:
                return se.ABORTED;
            case zn.draw:
            case zn.stalemate:
                return se.DRAW;
            case zn.mate:
            case zn.resign:
            case zn.timeout:
            case zn.outoftime:
            case zn.cheat:
                return "white" === e.winner ? se.WHITE_WINS : se.BLACK_WINS;
            default:
                return null
            }
        }(e) : t.runningForPlayer = function(e) {
            return e.moves.length > 0 ? function(e) {
                return 0 === e.moves.length ? te.WHITE : te.oppositeColor(Qn(e))
            }(e) : null
        }(e),
        t.lifecycle = function(e) {
            switch (e) {
            case zn.created:
                return re.NOT_STARTED;
            case zn.started:
                return re.ONGOING;
            default:
                return re.FINISHED
            }
        }(e.status),
        t
    }
    !function(e) {
        e.created = "created",
        e.started = "started",
        e.aborted = "aborted",
        e.mate = "mate",
        e.resign = "resign",
        e.stalemate = "stalemate",
        e.timeout = "timeout",
        e.draw = "draw",
        e.outoftime = "outoftime",
        e.cheat = "cheat",
        e.noStart = "noStart",
        e.unknownFinish = "unknownFinish",
        e.variantEnd = "variantEnd"
    }(zn || (zn = {}));
    var Jn = function(e, t, i, n) {
        return new (i || (i = Promise))(function(o, s) {
            function r(e) {
                try {
                    c(n.next(e))
                } catch (e) {
                    s(e)
                }
            }
            function a(e) {
                try {
                    c(n.throw(e))
                } catch (e) {
                    s(e)
                }
            }
            function c(e) {
                var t;
                e.done ? o(e.value) : (t = e.value,
                t instanceof i ? t : new i(function(e) {
                    e(t)
                }
                )).then(r, a)
            }
            c((n = n.apply(e, t || [])).next())
        }
        )
    };
    function Xn(e, t) {
        return Jn(this, void 0, void 0, function*() {
            if (e.error) {
                const t = e;
                return b(t.error + "\n" + t.error_description + "\n" + t.message + "\n" + t.hint),
                null
            }
            {
                const i = e;
                return i.expires_in && (i.expires_at = m() + i.expires_in),
                b("Received token " + i.access_token + "\nExpires in: " + i.expires_in + "\nRefresh token: " + i.refresh_token),
                yield t.saveToken(i),
                i
            }
        })
    }
    var Zn = function(e, t, i, n) {
        return new (i || (i = Promise))(function(o, s) {
            function r(e) {
                try {
                    c(n.next(e))
                } catch (e) {
                    s(e)
                }
            }
            function a(e) {
                try {
                    c(n.throw(e))
                } catch (e) {
                    s(e)
                }
            }
            function c(e) {
                var t;
                e.done ? o(e.value) : (t = e.value,
                t instanceof i ? t : new i(function(e) {
                    e(t)
                }
                )).then(r, a)
            }
            c((n = n.apply(e, t || [])).next())
        }
        )
    };
    const eo = "Chessconnect"
      , to = "https://chessconnect.de/lichess";
    function io(e) {
        const t = e.getCurrentUser();
        return function(e, t, i, n, o) {
            return Jn(this, void 0, void 0, function*() {
                const s = (yield e.getOptions()).getToken(t, i);
                return s ? function(e) {
                    if (e.expires_at) {
                        const t = m();
                        return e.expires_at - 100 < t
                    }
                    return !1
                }(s) ? yield function(e, t, i, n) {
                    return Jn(this, void 0, void 0, function*() {
                        b("renewing token");
                        const o = yield fetch(t, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/x-www-form-urlencoded"
                            },
                            body: `grant_type=refresh_token&client_id=${i}&refresh_token=${e.refresh_token}`
                        })
                          , s = yield o.json();
                        return yield Xn(s, n)
                    })
                }(s, n, o, e) : s : null
            })
        }(e, mo.SITENAME, t, "https://lichess.org/api/token", eo)
    }
    class no {
        constructor(e, t, i) {
            this.intervalTimeout = null,
            this.userId = e,
            this.gameId = t,
            this.siteManager = i,
            this.intervalTimeout = setInterval( () => {
                this.reportMove("")
            }
            , 2900)
        }
        stop() {
            this.intervalTimeout && clearInterval(this.intervalTimeout)
        }
        reportMove(e) {
            this.siteManager.connectionManager instanceof Vi && this.siteManager.connectionManager.sendMessage({
                type: "m2kreport",
                payload: JSON.stringify({
                    id: this.userId,
                    board: 42,
                    playing: !0,
                    game: this.gameId,
                    move: e
                })
            })
        }
    }
    var oo = function(e, t, i, n) {
        return new (i || (i = Promise))(function(o, s) {
            function r(e) {
                try {
                    c(n.next(e))
                } catch (e) {
                    s(e)
                }
            }
            function a(e) {
                try {
                    c(n.throw(e))
                } catch (e) {
                    s(e)
                }
            }
            function c(e) {
                var t;
                e.done ? o(e.value) : (t = e.value,
                t instanceof i ? t : new i(function(e) {
                    e(t)
                }
                )).then(r, a)
            }
            c((n = n.apply(e, t || [])).next())
        }
        )
    };
    class so extends ve {
        constructor() {
            super(...arguments),
            this.gameId = null,
            this.isChess960 = !1
        }
        get apiUrl() {
            return "https://lichess.org/api"
        }
        getGameId() {
            return this.gameId
        }
        getGameFormat() {
            return Promise.resolve(this.isChess960 ? de.CHESS960 : de.NORMAL_CHESS)
        }
        reset() {
            return oo(this, void 0, void 0, function*() {})
        }
        createApiEventObserver(e) {
            return oo(this, void 0, void 0, function*() {
                var t;
                null === (t = this.apiObserver) || void 0 === t || t.stop(),
                yield p(300),
                this.apiObserver = new $n(this.apiUrl + "/stream/event"),
                this.apiObserver.setApiToken(e.access_token),
                this.apiObserver.processLine = t => {
                    this.onApiEventReceived(t, e)
                }
                ,
                b("starting api observer");
                const i = yield this.apiObserver.start();
                200 === i ? b("API event observer connected") : yield T("Could not create API event observer. Error " + i, !1)
            })
        }
        onApiEventReceived(e, t) {
            return oo(this, void 0, void 0, function*() {
                const i = e;
                if (b("received api event: " + JSON.stringify(e.type)),
                "gameStart" === i.type && location.href.includes(i.game.id)) {
                    this.gameId = i.game.id,
                    this.siteManager.apiUrls.add(window.location.href),
                    this.createGameObserver(this.gameId, t);
                    let e = !1;
                    "arena" === i.game.source ? e = yield this.isM2kArena(i.game.tournamentId, t) : "swiss" === i.game.source && (e = yield this.isM2kSwiss(i.game.swissId, t)),
                    e && (this.m2kTournamentReporter = new no(yield this.getUserId(t),this.gameId,this.siteManager))
                } else
                    "gameFinish" === i.type && location.href.includes(i.game.id) && (this.gameId = null,
                    this.m2kTournamentReporter && (this.m2kTournamentReporter.stop(),
                    this.m2kTournamentReporter = null))
            })
        }
        getUserId(e) {
            return oo(this, void 0, void 0, function*() {
                const t = yield Tn(this.apiUrl + "/account", null == e ? void 0 : e.access_token, "GET");
                return 200 === t.status ? (yield t.json()).id : (b("Could not get user ID from lichess.org"),
                "")
            })
        }
        isM2kArena(e, t) {
            return oo(this, void 0, void 0, function*() {
                const i = yield Tn(this.apiUrl + "/tournament/" + e, null == t ? void 0 : t.access_token, "GET");
                return 200 === i.status && (yield i.json()).fullName.includes("+eBoards+")
            })
        }
        isM2kSwiss(e, t) {
            return oo(this, void 0, void 0, function*() {
                const i = yield Tn(this.apiUrl + "/swiss/" + e, null == t ? void 0 : t.access_token, "GET");
                return 200 === i.status && (yield i.json()).name.includes("+eBoards+")
            })
        }
        createGameObserver(e, t) {
            return oo(this, void 0, void 0, function*() {
                var n;
                yield w( () => {
                    var e, t;
                    return null !== (t = null === (e = this.siteManager.connectionManager) || void 0 === e ? void 0 : e.isConnected()) && void 0 !== t && t
                }
                , 1e3),
                null === (n = this.gameObserver) || void 0 === n || n.stop(),
                this.gameObserver = new $n(this.apiUrl + "/board/game/stream/" + e),
                this.gameObserver.setApiToken(t.access_token),
                this.gameObserver.processLine = e => {
                    this.onBoardDataReceived(e)
                }
                ;
                let o = 404;
                for (; 200 !== o; )
                    switch (o = yield this.gameObserver.start(),
                    o) {
                    case 200:
                        b("stream connected");
                        break;
                    case 400:
                        return void (yield T(yield i("LICHESS_TIME_FORMATS"), !0));
                    case 401:
                        return void (yield T(yield i("LICHESS_TOKEN_ERROR"), !0));
                    default:
                        yield T("Could not access game on lichess.org. Error " + o, !1),
                        yield p(1e3)
                    }
            })
        }
        onBoardDataReceived(e) {
            return oo(this, void 0, void 0, function*() {
                var t, n;
                const o = yield this.siteManager.getOptions()
                  , s = this.siteManager.getCurrentUser();
                let r, a;
                if (b("received board data: " + e.type),
                "gameFull" === e.type) {
                    const c = e;
                    "startpos" === c.initialFen ? this.startingPosition = te.getStartingPosition() : this.startingPosition = ge.createPositionFromFen(c.initialFen),
                    this.isChess960 = "chess960" === c.variant.key,
                    "fromPosition" === c.variant.key && (this.isChess960 = ge.isChess960(c.initialFen)),
                    b("Game format is " + (this.isChess960 ? "chess960" : "normal chess (" + c.variant.key + ")")),
                    r = Yn(c.state, this.startingPosition),
                    a = jn(c.state),
                    a.whiteStartMs = a.blackStartMs = null !== (n = null === (t = c.clock) || void 0 === t ? void 0 : t.initial) && void 0 !== n ? n : 0,
                    this.userIsWhite = c.white.name === s,
                    c.white.name !== s && c.black.name !== s && d(yield i("LICHESS_USER_WARNING"), o.resUrl)
                } else if ("gameState" === e.type) {
                    const t = e;
                    r = Yn(t, this.startingPosition),
                    a = jn(t),
                    a.isGameOver() ? o.moveSound === D.SPEECH && this.siteManager.say(yield a.gameResultAsLocale(o.lang)) : Qn(t) !== (yield this.getPlayersColor()) && (yield this.sayMoveFromGameState(t, a),
                    o.moveSound !== D.BEEP && o.moveSound !== D.KNOCK || this.siteManager.playSound(R.OPPONENT_MOVED))
                } else
                    "chatLine" === e.type && o.speakChatMessages ? this.siteManager.say(e.text) : "chatLine" !== e.type && "opponentGone" !== e.type && T("received unknown message type: " + e.type, !1);
                r && (yield this.sendPositionToSmartboard(r, a))
            })
        }
        sayMoveFromGameState(e, t) {
            return oo(this, void 0, void 0, function*() {
                const i = Yn(function(e) {
                    const t = Object.assign({}, e)
                      , i = t.moves.lastIndexOf(" ");
                    return t.moves = t.moves.substring(0, i),
                    t
                }(e), this.startingPosition)
                  , n = Yn(e, this.startingPosition);
                t.algebraic = yield this.sayMove(i, n)
            })
        }
        isWhite() {
            return Promise.resolve(this.userIsWhite)
        }
        makeMove(e) {
            return oo(this, void 0, void 0, function*() {
                b("make move called for move (api)" + e.asString());
                const t = this.getCurrentPosition();
                t && (e = e.convertCastleMove(yield this.getCastleFormat(), t));
                const i = yield io(this.siteManager);
                Tn(this.apiUrl + "/board/game/" + this.gameId + "/move/" + e.asUciString(), i.access_token),
                this.m2kTournamentReporter && this.m2kTournamentReporter.reportMove(e.asUciString())
            })
        }
        getCastleFormat() {
            return oo(this, void 0, void 0, function*() {
                return (yield this.getGameFormat()) === de.CHESS960 ? N.KING_TAKES_ROOK : N.KING_MOVES_TWO_FIELDS
            })
        }
        get isAnalysisBoard() {
            return !1
        }
    }
    class ro {
        constructor(e, t) {
            this.x = e,
            this.y = t
        }
        asString() {
            return "(" + this.x + "," + this.y + ")"
        }
    }
    class ao {
        static dispatchPointerEvent(e, t, i) {
            e.dispatchEvent(new PointerEvent(t,{
                bubbles: !0,
                cancelable: !0,
                view: window,
                clientX: i.x,
                clientY: i.y,
                button: 0
            }))
        }
        static centerOfElement(e) {
            const {left: t, top: i, width: n, height: o} = e.getBoundingClientRect();
            return new ro(t + n / 2,i + o / 2)
        }
        static makeMouseClick(e, t) {
            return i = this,
            n = arguments,
            s = function*(e, t, i="pointer") {
                this.dispatchPointerEvent(e, i + "down", t),
                yield p(100),
                this.dispatchPointerEvent(e, i + "up", t),
                this.dispatchPointerEvent(e, "click", t)
            }
            ,
            new ((o = void 0) || (o = Promise))(function(e, t) {
                function r(e) {
                    try {
                        c(s.next(e))
                    } catch (e) {
                        t(e)
                    }
                }
                function a(e) {
                    try {
                        c(s.throw(e))
                    } catch (e) {
                        t(e)
                    }
                }
                function c(t) {
                    var i;
                    t.done ? e(t.value) : (i = t.value,
                    i instanceof o ? i : new o(function(e) {
                        e(i)
                    }
                    )).then(r, a)
                }
                c((s = s.apply(i, n || [])).next())
            }
            );
            var i, n, o, s
        }
        static centerOfField(e, t, i) {
            const n = e.getBoundingClientRect()
              , o = n.width / 8
              , s = n.height / 8
              , r = o * (Math.random() - .5) * .9
              , a = s * (Math.random() - .5) * .9;
            let c;
            return c = i ? new ro(n.left + o * t.col + o / 2 + r,n.top + n.height - s * t.row - s / 2 + a) : new ro(n.left + n.width - o * t.col - o / 2 + r,n.top + s * t.row + s / 2 + a),
            c
        }
    }
    var co = function(e, t, i, n) {
        return new (i || (i = Promise))(function(o, s) {
            function r(e) {
                try {
                    c(n.next(e))
                } catch (e) {
                    s(e)
                }
            }
            function a(e) {
                try {
                    c(n.throw(e))
                } catch (e) {
                    s(e)
                }
            }
            function c(e) {
                var t;
                e.done ? o(e.value) : (t = e.value,
                t instanceof i ? t : new i(function(e) {
                    e(t)
                }
                )).then(r, a)
            }
            c((n = n.apply(e, t || [])).next())
        }
        )
    };
    class lo {
        constructor(e) {
            this.positionConfirmCount = 0,
            this.playerMoveInProgress = !1,
            this.lastPosition = null,
            this.lastUnconfirmedPosition = null,
            this.intendedUserPosition = null,
            this.boardCheckIntervall = new pn,
            this.lastGameResult = null,
            this.boardCheckIntervallActive = !1,
            this.lastProcessedPosition = null,
            this.nextConfirmedPositionResolvers = [],
            this.siteManager = e
        }
        stop() {
            this.boardCheckIntervall.stop()
        }
        reset() {
            this.start()
        }
        isRunning() {
            return this.boardCheckIntervall.checkActive()
        }
        start() {
            this.boardCheckIntervall.stop(),
            this.lastGameResult = null,
            this.lastKnownUrl = null === location || void 0 === location ? void 0 : location.href,
            this.lastPosition = null,
            this.positionConfirmCount = 0,
            b("HtmlPositionWatcher: Start watching for position changes"),
            this.boardCheckIntervall.start( () => co(this, void 0, void 0, function*() {
                yield this.doBoardCheck()
            }), lo.CHECK_BOARD_INTERVAL_MS)
        }
        doBoardCheck() {
            return co(this, void 0, void 0, function*() {
                var e;
                if (!this.boardCheckIntervallActive) {
                    if (this.boardCheckIntervallActive = !0,
                    this.siteManager.apiUrls.has(null === location || void 0 === location ? void 0 : location.href))
                        return b("HtmlPositionWatcher: Stopping watcher because API URLs are available"),
                        void this.stop();
                    const t = yield this.getClockState()
                      , i = yield this.getPosition();
                    if (i)
                        if (t.isGameOver() && !(null === (e = this.lastGameResult) || void 0 === e ? void 0 : e.isGameOver())) {
                            this.lastGameResult = t;
                            const e = yield this.siteManager.getOptions();
                            e.moveSound === D.SPEECH && this.lastPosition && this.siteManager.say(yield t.gameResultAsLocale(e.lang)),
                            yield this.siteManager.siteBoard.sendPositionToSmartboard(i, t)
                        } else
                            this.positionConfirmed(i) && !i.equals(this.lastProcessedPosition) ? (b("HtmlPositionWatcher: New position detected: " + ge.createFenFromPosition(i)),
                            this.intendedUserPosition && !this.intendedUserPosition.equals(i) && (b("Opponent move overtook user move"),
                            yield this.processNewPosition(this.intendedUserPosition, new le),
                            this.lastProcessedPosition = this.intendedUserPosition),
                            yield this.processNewPosition(i, t),
                            this.lastProcessedPosition = i,
                            this.intendedUserPosition = null) : i.equals(this.lastProcessedPosition) || (this.lastProcessedPosition = null);
                    this.boardCheckIntervallActive = !1,
                    this.lastGameResult = t
                }
            })
        }
        processNewPosition(e, t) {
            return co(this, void 0, void 0, function*() {
                var i, n;
                if (e.isEmptyBoard())
                    return;
                const o = yield this.siteManager.getOptions();
                if (function(e, t) {
                    if (!e || !t)
                        return !1;
                    try {
                        const i = new URL(e)
                          , n = new URL(t);
                        return i.protocol === n.protocol && i.host === n.host && i.pathname === n.pathname
                    } catch (e) {
                        return !1
                    }
                }(null === location || void 0 === location ? void 0 : location.href, this.lastKnownUrl) || (this.reset(),
                yield null === (n = null === (i = this.siteManager.connectionManager) || void 0 === i ? void 0 : i.currentBoard) || void 0 === n ? void 0 : n.reset()),
                this.lastPosition && ((yield this.lastMoveWasOpponent(e)) || this.siteManager.siteBoard.isAnalysisBoard)) {
                    const i = yield this.siteManager.siteBoard.sayMove(this.lastPosition, e);
                    t && (t.algebraic = i),
                    o.moveSound !== D.BEEP && o.moveSound !== D.KNOCK || this.siteManager.playSound(R.OPPONENT_MOVED)
                }
                this.lastPosition = e,
                yield this.siteManager.siteBoard.sendPositionToSmartboard(e, t)
            })
        }
        lastMoveWasOpponent(e) {
            return co(this, void 0, void 0, function*() {
                var t;
                if (this.lastPosition) {
                    const i = null === (t = this.lastPosition) || void 0 === t ? void 0 : t.computeMoveTo(e);
                    if (i) {
                        const e = (yield this.siteManager.siteBoard.isWhite()) ? te.WHITE : te.BLACK;
                        return i.player !== e
                    }
                }
                return !1
            })
        }
        positionConfirmed(e) {
            this.lastUnconfirmedPosition && this.lastUnconfirmedPosition.equals(e) ? this.positionConfirmCount++ : (this.positionConfirmCount = 1,
            this.lastUnconfirmedPosition = e);
            const t = this.positionConfirmCount >= lo.POSITION_CONFIRM_THRESHOLD;
            if (t && this.nextConfirmedPositionResolvers.length > 0) {
                for (const t of this.nextConfirmedPositionResolvers)
                    t(e);
                this.nextConfirmedPositionResolvers = []
            }
            return t
        }
        getNextConfirmedPosition() {
            return co(this, void 0, void 0, function*() {
                return new Promise(e => {
                    this.nextConfirmedPositionResolvers.push(e)
                }
                )
            })
        }
    }
    lo.CHECK_BOARD_INTERVAL_MS = 100,
    lo.POSITION_CONFIRM_THRESHOLD = 10;
    var ho = function(e, t, i, n) {
        return new (i || (i = Promise))(function(o, s) {
            function r(e) {
                try {
                    c(n.next(e))
                } catch (e) {
                    s(e)
                }
            }
            function a(e) {
                try {
                    c(n.throw(e))
                } catch (e) {
                    s(e)
                }
            }
            function c(e) {
                var t;
                e.done ? o(e.value) : (t = e.value,
                t instanceof i ? t : new i(function(e) {
                    e(t)
                }
                )).then(r, a)
            }
            c((n = n.apply(e, t || [])).next())
        }
        )
    };
    class uo extends lo {
        getClockState() {
            return Promise.resolve(new le)
        }
        getPosition() {
            return ho(this, void 0, void 0, function*() {
                const e = new te
                  , t = document.querySelector("div.main-board cg-board");
                if (t) {
                    const i = t.getBoundingClientRect();
                    for (const n of t.querySelectorAll("piece")) {
                        const t = uo.getColorOfPiece(n)
                          , o = uo.getTypeOfPiece(n);
                        if (o === te.GHOST)
                            return null;
                        const s = yield this.getFieldOfPiece(n, i);
                        if (!e.fieldIsEmpty(s))
                            return null;
                        e.setField(s.row, s.col, t, o)
                    }
                    for (const n of t.querySelectorAll("square.last-move")) {
                        const t = yield this.getFieldOfPiece(n, i);
                        if (!e.fieldIsEmpty(t)) {
                            const i = e.getColorOnField(t);
                            e.colorToMove = te.oppositeColor(i)
                        }
                    }
                }
                return e.guessCastlerights(),
                e
            })
        }
        isStartingPosition() {
            return Promise.resolve(null === this.lastPosition || this.lastPosition.isStartingPosition())
        }
        static getColorOfPiece(e) {
            return "black" === e.className.split(" ")[0] ? te.BLACK : te.WHITE
        }
        static getTypeOfPiece(e) {
            const t = e.className.toLowerCase();
            return t.includes("pawn") ? te.PAWN : t.includes("knight") ? te.KNIGHT : t.includes("bishop") ? te.BISHOP : t.includes("rook") ? te.ROOK : t.includes("queen") ? te.QUEEN : t.includes("king") ? te.KING : t.includes("ghost") ? te.GHOST : te.OTHER
        }
        getFieldOfPiece(e, t) {
            return ho(this, void 0, void 0, function*() {
                const i = e.getBoundingClientRect()
                  , n = Math.floor((i.left + i.width / 2 - t.left) / i.width)
                  , o = Math.floor((t.bottom - (i.bottom - i.height / 2)) / i.height)
                  , s = new W(o,n);
                return (yield this.siteManager.siteBoard.isWhite()) || (s.row = 7 - s.row,
                s.col = 7 - s.col),
                s
            })
        }
    }
    var vo = function(e, t, i, n) {
        return new (i || (i = Promise))(function(o, s) {
            function r(e) {
                try {
                    c(n.next(e))
                } catch (e) {
                    s(e)
                }
            }
            function a(e) {
                try {
                    c(n.throw(e))
                } catch (e) {
                    s(e)
                }
            }
            function c(e) {
                var t;
                e.done ? o(e.value) : (t = e.value,
                t instanceof i ? t : new i(function(e) {
                    e(t)
                }
                )).then(r, a)
            }
            c((n = n.apply(e, t || [])).next())
        }
        )
    };
    class go extends ve {
        constructor(e) {
            super(e),
            this.positionWatcher = new uo(e)
        }
        reset() {
            return this.positionWatcher.reset(),
            Promise.resolve()
        }
        isWhite() {
            return Promise.resolve(null !== document.querySelector("div.main-board .orientation-white"))
        }
        get isAnalysisBoard() {
            var e, t;
            return null !== (t = null === (e = document.querySelector("main")) || void 0 === e ? void 0 : e.classList.contains("analyse")) && void 0 !== t && t
        }
        getGameFormat() {
            const e = document.querySelector(".variant-chess960");
            return Promise.resolve(e ? de.CHESS960 : de.NORMAL_CHESS)
        }
        getCastleFormat() {
            return vo(this, void 0, void 0, function*() {
                return (yield this.getGameFormat()) === de.CHESS960 ? N.KING_TAKES_ROOK : N.KING_MOVES_TWO_FIELDS
            })
        }
        getValidPosition() {
            return this.positionWatcher.getNextConfirmedPosition()
        }
        makeMove(e) {
            return vo(this, void 0, void 0, function*() {
                if (!this.siteManager.apiUrls.has(window.location.href)) {
                    this.lastKnownPosition && (e = e.convertCastleMove(yield this.getCastleFormat(), this.lastKnownPosition));
                    const t = document.querySelector("cg-board");
                    b("make move called for move (html)" + e.asString()),
                    yield w( () => !this.positionWatcher.playerMoveInProgress, 500, 1e3),
                    b("no player move in progress, proceeding with move");
                    const i = yield this.getValidPosition();
                    this.positionWatcher.intendedUserPosition = i.newPositionFromMove(e),
                    this.positionWatcher.playerMoveInProgress = !0;
                    const n = .1 + .5 * Math.random();
                    if (yield ao.makeMouseClick(t, ao.centerOfField(t, e.fromField, yield this.isWhite()), "mouse"),
                    yield p(1e3 * n),
                    yield ao.makeMouseClick(t, ao.centerOfField(t, e.toField, yield this.isWhite()), "mouse"),
                    b("mouse clicks transmitted"),
                    e.promPiece) {
                        let t;
                        switch (e.promPiece) {
                        case te.QUEEN:
                            t = "queen";
                            break;
                        case te.ROOK:
                            t = "rook";
                            break;
                        case te.BISHOP:
                            t = "bishop";
                            break;
                        case te.KNIGHT:
                            t = "knight";
                            break;
                        default:
                            throw new Error("Unknown promotion piece: " + e.promPiece)
                        }
                        const i = "#promotion-choice piece." + t
                          , o = yield function(e, t) {
                            return u(this, void 0, void 0, function*() {
                                return yield w( () => null !== e.querySelector(t), 100, 1e3),
                                e.querySelector(t)
                            })
                        }(document, i);
                        o && (yield p(1e3 * n),
                        yield ao.makeMouseClick(o, ao.centerOfElement(o)),
                        b("promotion click transmitted"))
                    }
                    b("player move finished"),
                    this.positionWatcher.playerMoveInProgress = !1
                }
            })
        }
        runPositionWatcher(e) {
            e !== this.positionWatcher.isRunning() && (e ? this.positionWatcher.start() : this.positionWatcher.stop())
        }
    }
    var fo = function(e, t, i, n) {
        return new (i || (i = Promise))(function(o, s) {
            function r(e) {
                try {
                    c(n.next(e))
                } catch (e) {
                    s(e)
                }
            }
            function a(e) {
                try {
                    c(n.throw(e))
                } catch (e) {
                    s(e)
                }
            }
            function c(e) {
                var t;
                e.done ? o(e.value) : (t = e.value,
                t instanceof i ? t : new i(function(e) {
                    e(t)
                }
                )).then(r, a)
            }
            c((n = n.apply(e, t || [])).next())
        }
        )
    };
    const po = "rgb(167 134 117)";
    class mo extends qn {
        constructor() {
            super(),
            this.validToken = null,
            this.htmlHelper.connectButton.style.padding = "0px 10px 0px 10px",
            this.htmlHelper.connectButton.style.margin = "5px",
            this.htmlHelper.buttonColorBrown = po,
            this.htmlHelper.connectButton.style.backgroundColor = po
        }
        initialize() {
            const e = Object.create(null, {
                initialize: {
                    get: () => super.initialize
                }
            });
            return fo(this, void 0, void 0, function*() {
                yield e.initialize.call(this),
                this.addToLichess(this.htmlHelper.div),
                this.htmlHelper.connectButton.onclick = e => {
                    this.onConnectButtonPressed(e)
                }
                ,
                this.htmlHelper.connectButtonSmall && (this.htmlHelper.connectButtonSmall.onclick = this.htmlHelper.connectButton.onclick),
                B() && this.redirectToLoginIfNeccessary();
                const t = new URL(window.location.href)
                  , n = new URLSearchParams(t.search).get("code");
                if (n)
                    yield function(e, t) {
                        return Zn(this, void 0, void 0, function*() {
                            const i = (yield t.getOptions()).lichess.oAuthVerifier;
                            yield function(e, t, i, n, o, s) {
                                return Jn(this, void 0, void 0, function*() {
                                    const t = yield fetch("https://lichess.org/api/token", {
                                        method: "POST",
                                        headers: {
                                            "Content-Type": "application/x-www-form-urlencoded"
                                        },
                                        body: `grant_type=authorization_code&client_id=${i}&redirect_uri=${o}&code=${e}&code_verifier=${n}`
                                    })
                                      , r = yield t.json();
                                    return yield Xn(r, s)
                                })
                            }(e, 0, eo, i, to, t)
                        })
                    }(n, this),
                    window.location.href = "https://lichess.org";
                else if (this.isUserLoggedIn() && !(yield io(this)))
                    if (this.canDoOauth())
                        yield function(e) {
                            return Zn(this, void 0, void 0, function*() {
                                if (!window.location.href.startsWith("https://lichess.org/oauth")) {
                                    const t = yield e.getOptions()
                                      , i = e.getCurrentUser()
                                      , n = function() {
                                        const e = new Uint8Array(32);
                                        return window.crypto.getRandomValues(e),
                                        btoa(String.fromCharCode(...e)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
                                    }()
                                      , o = yield function(e) {
                                        return Jn(this, void 0, void 0, function*() {
                                            const t = (new TextEncoder).encode(e)
                                              , i = yield crypto.subtle.digest("SHA-256", t);
                                            return btoa(String.fromCharCode(...new Uint8Array(i))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
                                        })
                                    }(n)
                                      , s = `https://lichess.org/oauth?response_type=code&client_id=${eo}&redirect_uri=${encodeURIComponent(to)}&code_challenge_method=S256&code_challenge=${o}&scope=board:play&username=${i}&state=478264361`;
                                    t.lichess.oAuthVerifier = n,
                                    yield e.saveOptionsAndWait(t, e => e.lichess.oAuthVerifier === n),
                                    window.location.href = s
                                }
                            })
                        }(this);
                    else if (this.apiBoard.getGameId()) {
                        const e = yield this.getOptions();
                        yield d(yield i("LICHESS_TOKEN_ERROR"), e.resUrl)
                    }
                yield this.createSiteboards()
            })
        }
        canDoOauth() {
            return !0
        }
        isUserLoggedIn() {
            const e = this.getCurrentUser();
            return null != e && e.length > 0
        }
        redirectToLoginIfNeccessary() {
            const e = window.location.href;
            if (e.includes("/login") || e.includes("/oauth") || e.includes("chessconnect.de"))
                this.restorePasswords(),
                this.enablePasswordSaving();
            else {
                const e = this.getCurrentUser();
                (null == e ? void 0 : e.length) || (window.location.href = "https://lichess.org/login")
            }
        }
        checkApiToken(e) {
            return fo(this, void 0, void 0, function*() {
                if (!(null === location || void 0 === location ? void 0 : location.href.includes("/login")) && !(null === location || void 0 === location ? void 0 : location.href.includes("/oauth?"))) {
                    const t = yield this.getOptions()
                      , n = this.getCurrentUser();
                    if (!(null == n ? void 0 : n.length) && document.querySelector("a.signin"))
                        this.redirectToLoginIfNeccessary();
                    else if (null == n ? void 0 : n.length) {
                        const n = yield io(this);
                        if (n) {
                            if (n === this.validToken)
                                return n;
                            if (this.canDoOauth())
                                return this.validToken = n,
                                n;
                            {
                                yield p(300);
                                const o = yield Tn(e + "/stream/event", null == n ? void 0 : n.access_token, "GET");
                                if (401 !== o.status && 403 !== o.status)
                                    return this.validToken = n,
                                    n;
                                d(yield i("LICHESS_TOKEN_ERROR"), t.resUrl)
                            }
                        } else
                            this.apiBoard.getGameId() && (yield d(yield i("LICHESS_TOKEN_ERROR"), t.resUrl))
                    }
                }
                return null
            })
        }
        getCurrentUser() {
            var e;
            return (null === (e = document.getElementById("user_tag")) || void 0 === e ? void 0 : e.textContent) || null
        }
        addToLichess(e) {
            F.getGlobalDevice().isApp() || setInterval( () => {
                if (!In.isInDom(e) || !e.offsetWidth) {
                    let e = document.querySelector("div#zenzone");
                    (null == e ? void 0 : e.offsetWidth) || (e = document.querySelector("div.site-buttons")),
                    e && (e.appendChild(this.htmlHelper.div),
                    this.htmlHelper.connectButton.style.display = "block",
                    this.htmlHelper.connectButtonSmall.style.display = "none")
                }
            }
            , 250)
        }
        createSiteboards() {
            return fo(this, void 0, void 0, function*() {
                this.apiBoard = new so(this);
                const e = yield this.checkApiToken(this.apiBoard.apiUrl);
                e && this.apiBoard.createApiEventObserver(e),
                this.htmlBoard = new go(this),
                this.htmlBoard.runPositionWatcher(!0)
            })
        }
        isGamePresent() {
            return !0
        }
        isLegalMove(e, t, i) {
            return Promise.resolve(!0)
        }
        saveToken(e) {
            return fo(this, void 0, void 0, function*() {
                const t = yield this.getOptions()
                  , i = yield bn("https://lichess.org/api", e.access_token);
                i && (t.saveToken(mo.SITENAME, i, e),
                yield this.saveOptionsAndWait(t, t => {
                    var n;
                    return (null === (n = t.getToken(mo.SITENAME, i)) || void 0 === n ? void 0 : n.access_token) === e.access_token
                }
                ))
            })
        }
        enablePasswordSaving() {
            const e = document.querySelector("form.form3")
              , t = document.getElementById("form3-username")
              , i = document.getElementById("form3-password");
            e && t && i && e.addEventListener("submit", n => {
                if (!n.composed) {
                    n.preventDefault();
                    const o = t.value
                      , s = i.value;
                    this.savePasswords(mo.SITENAME, o, s).then( () => {
                        const t = new Event("submit",{
                            bubbles: !0,
                            cancelable: !0,
                            composed: !0
                        });
                        e.dispatchEvent(t)
                    }
                    )
                }
            }
            )
        }
        restorePasswords() {
            return fo(this, void 0, void 0, function*() {
                const e = document.getElementById("form3-username")
                  , t = document.getElementById("form3-password");
                if (e && t) {
                    const i = (yield this.getOptions()).getLoginData(mo.SITENAME);
                    i && (e.value = i.username,
                    t.value = i.password)
                }
            })
        }
        onSmartboardConnect(e) {
            const t = Object.create(null, {
                onSmartboardConnect: {
                    get: () => super.onSmartboardConnect
                }
            });
            return fo(this, void 0, void 0, function*() {
                if (this.siteBoard instanceof so) {
                    const e = yield this.checkApiToken(this.siteBoard.apiUrl);
                    e && this.siteBoard.createApiEventObserver(e)
                }
                yield t.onSmartboardConnect.call(this, e)
            })
        }
        get siteBoard() {
            return this.apiBoard.getGameId() || this.apiUrls.has(window.location.href) ? (this.htmlBoard.runPositionWatcher(!1),
            this.apiBoard) : (this.htmlBoard.runPositionWatcher(!0),
            this.htmlBoard)
        }
    }
    function yo() {
        const e = document.getElementsByClassName("board");
        return e.length ? e[0] : null
    }
    mo.SITENAME = "lichess";
    var wo = function(e, t, i, n) {
        return new (i || (i = Promise))(function(o, s) {
            function r(e) {
                try {
                    c(n.next(e))
                } catch (e) {
                    s(e)
                }
            }
            function a(e) {
                try {
                    c(n.throw(e))
                } catch (e) {
                    s(e)
                }
            }
            function c(e) {
                var t;
                e.done ? o(e.value) : (t = e.value,
                t instanceof i ? t : new i(function(e) {
                    e(t)
                }
                )).then(r, a)
            }
            c((n = n.apply(e, t || [])).next())
        }
        )
    };
    class So extends qn {
        constructor() {
            super(...arguments),
            this.wasFocusMode = void 0,
            this.sidebarWasCollapsed = void 0
        }
        initialize() {
            const e = Object.create(null, {
                initialize: {
                    get: () => super.initialize
                }
            });
            return wo(this, void 0, void 0, function*() {
                yield e.initialize.call(this),
                this.addToChessCom(this.htmlHelper.div),
                this.htmlHelper.connectButton.onclick = this.htmlHelper.connectButtonSmall.onclick = e => {
                    this.onConnectButtonPressed(e)
                }
                ,
                B() && this.redirectToLoginIfNeccessary()
            })
        }
        redirectToLoginIfNeccessary() {
            (null === location || void 0 === location ? void 0 : location.href.includes("/login")) ? (this.restorePasswords(),
            this.enablePasswordSaving()) : document.getElementsByTagName("html")[0].classList.contains("user-logged-in") || (window.location.href = "https://www.chess.com/login_and_go?returnUrl=https://www.chess.com/play/online/connected-board")
        }
        static isFocusMode() {
            return null !== document.querySelector("div.focus-mode-sidebar-component") || null !== document.querySelector("div.player-theatre")
        }
        focusModeChanged() {
            return void 0 === this.wasFocusMode || this.wasFocusMode !== So.isFocusMode()
        }
        sidebarIsCollapsed() {
            if (navigator.userAgent.toLowerCase().indexOf("android") > -1)
                return !0;
            {
                let e = document.getElementById("favorited-tabs");
                return !!(e && e.offsetWidth < 80 && e.offsetWidth > 0) || (e = document.getElementById("sb"),
                null !== e && e.offsetWidth < 80)
            }
        }
        sidebarChanged() {
            return void 0 === this.sidebarWasCollapsed || this.sidebarWasCollapsed !== this.sidebarIsCollapsed()
        }
        addToChessCom(e) {
            F.getGlobalDevice().isApp() || setInterval( () => {
                if (!In.isInDom(e) || this.focusModeChanged() || this.sidebarChanged()) {
                    let t;
                    this.htmlHelper.div.classList.add("nav-link-wrapper");
                    const i = So.isFocusMode()
                      , n = this.sidebarIsCollapsed() && !i;
                    t = i ? document.querySelector("div.player-bottom div.user-tagline-compact-theatre") : document.querySelector("div[data-nav-top]"),
                    t || (t = document.getElementById("favorited-tabs")),
                    t && (t.appendChild(e),
                    this.wasFocusMode = So.isFocusMode(),
                    this.sidebarWasCollapsed = this.sidebarIsCollapsed(),
                    this.htmlHelper.connectButton.style.display = n ? "none" : "block",
                    this.htmlHelper.connectButtonSmall.style.display = n ? "block" : "none",
                    this.htmlHelper.messageDiv.style.fontSize = n ? "6pt" : "10pt")
                }
            }
            , 250)
        }
        onConnectButtonPressed(e) {
            const t = Object.create(null, {
                onConnectButtonPressed: {
                    get: () => super.onConnectButtonPressed
                }
            });
            return wo(this, void 0, void 0, function*() {
                const n = yield this.getOptions();
                this.isApiConnectionEstablished() ? yield t.onConnectButtonPressed.call(this, e) : function() {
                    const e = yo();
                    return !!e && !!e.classList.contains("board-webgl-2d")
                }() ? yield d(yield i("WEBGL_WARNING"), n.resUrl) : function() {
                    const e = yo();
                    if (null == e ? void 0 : e.game) {
                        const t = e.game.getOptions().moveMethod;
                        return "click" !== t && "drag" !== t
                    }
                    return !1
                }() ? yield d(yield i("MOVE_METHOD_WARNING"), n.resUrl) : yield t.onConnectButtonPressed.call(this, e)
            })
        }
        isGamePresent() {
            return null !== yo()
        }
        isLegalMove(e, t, i) {
            return wo(this, void 0, void 0, function*() {
                const t = this.siteBoard;
                return i = i.convertCastleMove(yield this.getCastleFormat(), e),
                yield t.isLegalMove(i)
            })
        }
        getCastleFormat() {
            return wo(this, void 0, void 0, function*() {
                const e = this.siteBoard;
                return (yield e.getGameFormat()) === de.CHESS960 ? N.KING_TAKES_ROOK : N.KING_MOVES_TWO_FIELDS
            })
        }
        isApiConnectionEstablished() {
            return !1
        }
        enablePasswordSaving() {
            const e = document.getElementsByTagName("form");
            if (e.length > 0) {
                const t = e[0];
                t.addEventListener("submit", e => {
                    e.preventDefault();
                    const i = document.getElementById("login-username").value
                      , n = document.getElementById("login-password").value;
                    document.getElementById("username").value = i,
                    document.getElementById("password").value = n,
                    this.savePasswords(So.SITENAME, i, n).then( () => {
                        t.submit()
                    }
                    )
                }
                )
            }
        }
        restorePasswords() {
            return wo(this, void 0, void 0, function*() {
                const e = (yield this.getOptions()).getLoginData(So.SITENAME);
                setInterval( () => {
                    var t, i, n, o;
                    const s = document.querySelector('#login-username:not([pwrestored="true"])')
                      , r = document.querySelector('#login-password:not([pwrestored="true"])')
                      , a = document.querySelector('#username:not([pwrestored="true"])')
                      , c = document.querySelector('#password:not([pwrestored="true"])');
                    a && (a.setAttribute("pwrestored", "true"),
                    a.value = null !== (t = null == e ? void 0 : e.username) && void 0 !== t ? t : ""),
                    c && (c.setAttribute("pwrestored", "true"),
                    c.value = null !== (i = null == e ? void 0 : e.password) && void 0 !== i ? i : ""),
                    s && (s.type = "text",
                    s.setAttribute("pwrestored", "true"),
                    s.value = null !== (n = null == e ? void 0 : e.username) && void 0 !== n ? n : ""),
                    r && (r.setAttribute("pwrestored", "true"),
                    r.value = null !== (o = null == e ? void 0 : e.password) && void 0 !== o ? o : "")
                }
                , 1e3)
            })
        }
    }
    So.SITENAME = "chess.com";
    var Co = function(e, t, i, n) {
        return new (i || (i = Promise))(function(o, s) {
            function r(e) {
                try {
                    c(n.next(e))
                } catch (e) {
                    s(e)
                }
            }
            function a(e) {
                try {
                    c(n.throw(e))
                } catch (e) {
                    s(e)
                }
            }
            function c(e) {
                var t;
                e.done ? o(e.value) : (t = e.value,
                t instanceof i ? t : new i(function(e) {
                    e(t)
                }
                )).then(r, a)
            }
            c((n = n.apply(e, t || [])).next())
        }
        )
    };
    F.createGlobalDevice();
    const Po = new BroadcastChannel("1")
      , Mo = "ChessconnectBoard"
      , To = "ChessconnectConnection";
    let bo, Bo;
    Po.onmessage = e => {
        if (e.data.senderTabId === Bo || void 0 === Bo && "connectFromFrontend" === e.data.type)
            switch (e.data.type) {
            case "connectFromFrontend":
                Bo = e.data.senderTabId,
                Po.postMessage({
                    type: "connectFromBackend",
                    senderTabId: Bo
                });
                break;
            case "getOptionsFromFrontend":
                Io();
                break;
            case "saveOptions":
                e.data.options && x.writeToStorage(e.data.options);
                break;
            case "getSessionData":
                !function() {
                    Co(this, void 0, void 0, function*() {
                        const e = {
                            type: "getSessionData",
                            senderTabId: Bo
                        }
                          , t = {
                            type: "getSessionDataReply",
                            sessionData: yield chrome.runtime.sendMessage(e),
                            senderTabId: Bo
                        };
                        Po.postMessage(t)
                    })
                }();
                break;
            case "setSessionData":
                e.data.sessionData && function(e) {
                    const t = {
                        type: "setSessionData",
                        sessionData: e,
                        senderTabId: Bo
                    };
                    chrome.runtime.sendMessage(t)
                }(e.data.sessionData);
                break;
            case "i18nQuestion":
                !function(e, t) {
                    Co(this, void 0, void 0, function*() {
                        const n = yield i(t.tag, t.params)
                          , o = {
                            type: "i18nAnswer",
                            senderTabId: Bo,
                            i18nId: e,
                            i18nAnswer: n
                        };
                        Po.postMessage(o)
                    })
                }(e.data.i18nId, e.data.i18nQuestion);
                break;
            case "soundEvent":
                !function(e) {
                    Co(this, void 0, void 0, function*() {
                        const t = yield Eo()
                          , i = {
                            type: "playSound",
                            senderTabId: Bo,
                            url: yield Fo(e),
                            volume: t.volume
                        };
                        chrome.runtime.sendMessage(i)
                    })
                }(e.data.soundEvent);
                break;
            case "say":
                !function(e) {
                    Co(this, void 0, void 0, function*() {
                        const t = yield Eo()
                          , i = {
                            type: "say",
                            senderTabId: Bo,
                            text: e,
                            lang: yield n(),
                            voiceName: t.voiceName
                        };
                        chrome.runtime.sendMessage(i)
                    })
                }(e.data.text);
                break;
            case "redirectTo":
                o = e.data.url,
                chrome.runtime.sendMessage({
                    type: "redirectTo",
                    url: o
                });
                break;
            case "createPhoenixSocket":
                bo = new WebSocket("ws://localhost:4742"),
                bo.addEventListener("close", () => {
                    const e = {
                        type: "phoenix",
                        senderTabId: Bo,
                        phoenixMessage: {
                            type: "socketClosed"
                        }
                    };
                    Po.postMessage(e)
                }
                ),
                bo.addEventListener("open", () => {
                    const e = {
                        type: "phoenix",
                        senderTabId: Bo,
                        phoenixMessage: {
                            type: "socketConnected"
                        }
                    };
                    Po.postMessage(e)
                }
                ),
                bo.addEventListener("error", e => {
                    console.log("Socket error", e);
                    const t = {
                        type: "phoenix",
                        senderTabId: Bo,
                        phoenixMessage: {
                            type: "error"
                        }
                    };
                    Po.postMessage(t)
                }
                ),
                bo.addEventListener("message", e => {
                    const t = JSON.parse(e.data)
                      , i = {
                        type: "phoenix",
                        senderTabId: Bo,
                        phoenixMessage: {
                            type: "message",
                            message: t
                        }
                    };
                    Po.postMessage(i)
                }
                );
                break;
            case "phoenix":
                t = e.data.text,
                bo.send(t);
                break;
            case "exitApp":
                chrome.runtime.sendMessage({
                    type: "exitApp"
                });
                break;
            case "debugBoardQuestion":
                !function(e, t) {
                    Co(this, void 0, void 0, function*() {
                        let i = yield chrome.runtime.sendMessage(t);
                        i || (i = {
                            type: "noreply"
                        });
                        const n = {
                            type: "debugBoardAnswer",
                            senderTabId: Bo,
                            messageId: e,
                            debugBoardMessage: i
                        };
                        Po.postMessage(n)
                    })
                }(e.data.messageId, e.data.debugBoardMessage)
            }
        var t, o
    }
    ,
    chrome.storage.onChanged.addListener( () => {
        Io()
    }
    );
    try {
        Po.postMessage({
            type: "connectFromBackend"
        })
    } catch (e) {
        console.log(e)
    }
    function Eo() {
        return Co(this, void 0, void 0, function*() {
            const e = Object.assign(new x, yield chrome.storage.sync.get(new x));
            return e.resUrl = chrome.runtime.getURL("res"),
            e.currentVersion = chrome.runtime.getManifest().version,
            e.lang = yield n(),
            function(e) {
                var t, i, n, o, s, r, a, c, l, d, h, u, v;
                (null === (i = null === (t = e.lichess) || void 0 === t ? void 0 : t.apiToken) || void 0 === i ? void 0 : i.length) && (null === (o = null === (n = e.lichess) || void 0 === n ? void 0 : n.userName) || void 0 === o ? void 0 : o.length) && e.saveToken(mo.SITENAME, e.lichess.userName, {
                    access_token: e.lichess.apiToken
                }),
                (null === (r = null === (s = e.lichess) || void 0 === s ? void 0 : s.apiToken2) || void 0 === r ? void 0 : r.length) && (null === (c = null === (a = e.lichess) || void 0 === a ? void 0 : a.userName2) || void 0 === c ? void 0 : c.length) && e.saveToken(mo.SITENAME, e.lichess.userName2, {
                    access_token: e.lichess.apiToken2
                }),
                (null === (d = null === (l = e.lichess) || void 0 === l ? void 0 : l.apiToken3) || void 0 === d ? void 0 : d.length) && (null === (u = null === (h = e.lichess) || void 0 === h ? void 0 : h.userName3) || void 0 === u ? void 0 : u.length) && e.saveToken(mo.SITENAME, e.lichess.userName3, {
                    access_token: e.lichess.apiToken3
                }),
                (null === (v = e.chesscomApi) || void 0 === v ? void 0 : v.token) && e.saveToken(So.SITENAME, x.ANY_USER, e.chesscomApi.token)
            }(e),
            function(e, t) {
                let i = !1;
                if (t.has(Mo)) {
                    const n = Number.parseInt(t.get(Mo));
                    i = n !== e.boardType,
                    e.boardType = n,
                    console.log("Board set to " + e.boardType)
                }
                if (t.has(To)) {
                    const n = Number.parseInt(t.get(To));
                    i = n !== e.connectionType,
                    e.connectionType = n,
                    console.log("Connection type set to " + e.connectionType)
                }
                i && x.writeToStorage(e)
            }(e, new URL(location.href).searchParams),
            e
        })
    }
    function Io() {
        return Co(this, void 0, void 0, function*() {
            const e = {
                type: "getOptionsFromBackend",
                options: yield Eo(),
                senderTabId: Bo
            };
            Po.postMessage(e)
        })
    }
    function Fo(e) {
        return Co(this, void 0, void 0, function*() {
            const t = chrome.runtime.getURL("res/")
              , i = yield Eo();
            switch (e) {
            case R.POSITIONS_MATCH:
                return t + "pling.mp3";
            case R.OPPONENT_MOVED:
                switch (i.moveSound) {
                case D.BEEP:
                    return t + "beep.mp3";
                case D.KNOCK:
                    return t + "knock.mp3"
                }
            }
            throw new Error("Unknown sound event")
        })
    }
}
)();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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Y2xDLEVBQVFrQyxVQUN2Q2xDLEVBQVFrQyxVQUFZQSxFQUNwQnBOLFFBQVFDLElBQUksZ0JBQWtCaUwsRUFBUWtDLFVBQ3hDLENBQ0EsR0FBSXZRLEVBQU80ckQsSUFBSXVHLElBQW1CLENBQ2hDLE1BQU1ybkQsRUFBaUM4YSxPQUFPSSxTQUFTaG1CLEVBQU9MLElBQUl3eUQsS0FDbEVrQixFQUFpQnZvRCxJQUFtQnVELEVBQVF2RCxlQUM1Q3VELEVBQVF2RCxlQUFpQkEsRUFDekIzSCxRQUFRQyxJQUFJLDBCQUE0QmlMLEVBQVF2RCxlQUNsRCxDQUVJdW9ELEdBQ0dqakQsRUFBUXlDLGVBQWV4RSxFQUVoQyxDQXhERWlsRCxDQUEyQmpsRCxFQUFTLElBQUk2OUMsSUFBSXBFLFNBQVNDLE1BQU13TCxjQUNwRGxsRCxDQUNULEUsQ0EyREEsU0FBZWdrRCxLLHlDQUNiLE1BQU1tQixFQUFtQyxDQUN2QzV4QyxLQUFNLHdCQUNOdlQsY0FBZTZXLEtBQ2ZyRCxZQUFhSixJQUVmd3dDLEdBQVFqb0QsWUFBWXdwRCxFQUN0QixFLENBNERBLFNBQWVmLEdBQW9CMW1ELEcseUNBQ2pDLE1BQU1rdkMsRUFBVTE2QyxPQUFPb04sUUFBUUMsT0FBTyxRQUNoQ1MsUUFBZ0I2VyxLQUN0QixPQUFRblosR0FDTixLQUFLbUUsRUFBVzZZLGdCQUNkLE9BQU9reUIsRUFBVSxZQUNuQixLQUFLL3FDLEVBQVd5N0IsZUFDZCxPQUFRdDlCLEVBQVFvQyxXQUNkLEtBQUtSLEVBQVV5N0IsS0FDYixPQUFPdVAsRUFBVSxXQUNuQixLQUFLaHJDLEVBQVVra0MsTUFDYixPQUFPOEcsRUFBVSxhQUd6QixNQUFNLElBQUl6NEMsTUFBTSxzQkFDbEIsRSIsInNvdXJjZXMiOlsid2VicGFjazovL0NoZXNzY29ubmVjdC8uL3NjcmlwdHMvdXRpbHMvbWVzc2FnZXBhc3Nlci50cyIsIndlYnBhY2s6Ly9DaGVzc2Nvbm5lY3QvLi9zY3JpcHRzL2kxOG4vaTE4bi50cyIsIndlYnBhY2s6Ly9DaGVzc2Nvbm5lY3QvLi9zY3JpcHRzL3V0aWxzL3NlbmRhbmR3YWl0YnVmZmVyLnRzIiwid2VicGFjazovL0NoZXNzY29ubmVjdC8uL3NjcmlwdHMvZGlhbG9nL3llc25vZGlhbG9nLnRzIiwid2VicGFjazovL0NoZXNzY29ubmVjdC8uL3NjcmlwdHMvdXRpbHMvdXRpbHMudHMiLCJ3ZWJwYWNrOi8vQ2hlc3Njb25uZWN0Ly4vc2NyaXB0cy9hcHAvaW9zaW50ZXJmYWNlLnRzIiwid2VicGFjazovL0NoZXNzY29ubmVjdC8uL3NjcmlwdHMvYXBwL2FwcGludGVyZmFjZS50cyIsIndlYnBhY2s6Ly9DaGVzc2Nvbm5lY3QvLi9zY3JpcHRzL29wdGlvbnMvb3B0aW9ucy50cyIsIndlYnBhY2s6Ly9DaGVzc2Nvbm5lY3QvLi9zY3JpcHRzL3Bvc2l0aW9ucy9tb3ZlLnRzIiwid2VicGFjazovL0NoZXNzY29ubmVjdC8uL3NjcmlwdHMvcG9zaXRpb25zL2ZpZWxkLnRzIiwid2VicGFjazovL0NoZXNzY29ubmVjdC8uL3NjcmlwdHMvcG9zaXRpb25zL2NoZXNzcnVsZXMudHMiLCJ3ZWJwYWNrOi8vQ2hlc3Njb25uZWN0Ly4vc2NyaXB0cy9wb3NpdGlvbnMvYmFzaWNwb3NpdGlvbi50cyIsIndlYnBhY2s6Ly9DaGVzc2Nvbm5lY3QvLi9zY3JpcHRzL3Bvc2l0aW9ucy9wb3NpdGlvbi50cyIsIndlYnBhY2s6Ly9DaGVzc2Nvbm5lY3QvLi9zY3JpcHRzL2NoYW5nZWxvZy9jaGFuZ2Vsb2cudHMiLCJ3ZWJwYWNrOi8vQ2hlc3Njb25uZWN0Ly4vc2NyaXB0cy9ib2FyZHMvY2VydGFiby9yZmlkLnRzIiwid2VicGFjazovL0NoZXNzY29ubmVjdC8uL3NjcmlwdHMvYm9hcmRzL2Nsb2NrLnRzIiwid2VicGFjazovL0NoZXNzY29ubmVjdC8uL3NjcmlwdHMvc2l0ZXMvc2l0ZWJvYXJkLnRzIiwid2VicGFjazovL0NoZXNzY29ubmVjdC8uL3NjcmlwdHMvcG9zaXRpb25zL2Zlbi50cyIsIndlYnBhY2s6Ly9DaGVzc2Nvbm5lY3QvLi9zY3JpcHRzL2JvYXJkcy9zbWFydGJvYXJkLnRzIiwid2VicGFjazovL0NoZXNzY29ubmVjdC8uL3NjcmlwdHMvbGVkcy9sZWRzdGF0ZXNpbXBsZS50cyIsIndlYnBhY2s6Ly9DaGVzc2Nvbm5lY3QvLi9zY3JpcHRzL3Bvc2l0aW9ucy9iaW5hcnlwb3NpdGlvbi50cyIsIndlYnBhY2s6Ly9DaGVzc2Nvbm5lY3QvLi9zY3JpcHRzL2JvYXJkcy9tYWduZXRib2FyZC50cyIsIndlYnBhY2s6Ly9DaGVzc2Nvbm5lY3QvLi9zY3JpcHRzL2xlZHMvY29sb3IudHMiLCJ3ZWJwYWNrOi8vQ2hlc3Njb25uZWN0Ly4vc2NyaXB0cy9sZWRzL2xlZGNvb3JkaW5hdGVzLnRzIiwid2VicGFjazovL0NoZXNzY29ubmVjdC8uL3NjcmlwdHMvbGVkcy9sZWRzdGF0ZXJnYi50cyIsIndlYnBhY2s6Ly9DaGVzc2Nvbm5lY3QvLi9zY3JpcHRzL2xlZHMvbGVkc3RhdGU5eDlyZ2IudHMiLCJ3ZWJwYWNrOi8vQ2hlc3Njb25uZWN0Ly4vc2NyaXB0cy9sZWRzL21vdmVkaXJlY3Rpb24udHMiLCJ3ZWJwYWNrOi8vQ2hlc3Njb25uZWN0Ly4vc2NyaXB0cy9sZWRzL2xlZHN0YXRlZmFjdG9yeTl4OXJnYi50cyIsIndlYnBhY2s6Ly9DaGVzc2Nvbm5lY3QvLi9zY3JpcHRzL2xlZHMvbGVkY2xvY2sudHMiLCJ3ZWJwYWNrOi8vQ2hlc3Njb25uZWN0Ly4vc2NyaXB0cy91dGlscy9hcnJheXdpdGhlcXVhbHMudHMiLCJ3ZWJwYWNrOi8vQ2hlc3Njb25uZWN0Ly4vc2NyaXB0cy91dGlscy9ub2lzZWZpbHRlci50cyIsIndlYnBhY2s6Ly9DaGVzc2Nvbm5lY3QvLi9zY3JpcHRzL3V0aWxzL3NlcmlhbGl6ZXIudHMiLCJ3ZWJwYWNrOi8vQ2hlc3Njb25uZWN0Ly4vc2NyaXB0cy9ib2FyZHMvY2VydGFiby9jZXJ0YWJvYm9hcmQudHMiLCJ3ZWJwYWNrOi8vQ2hlc3Njb25uZWN0Ly4vc2NyaXB0cy9ib2FyZHMvY29ubmVjdGlvbi9jb25uZWN0aW9ubWFuYWdlci50cyIsIndlYnBhY2s6Ly9DaGVzc2Nvbm5lY3QvLi9ub2RlX21vZHVsZXMvYXN5bmMtbXV0ZXgvaW5kZXgubWpzIiwid2VicGFjazovL0NoZXNzY29ubmVjdC8uL3NjcmlwdHMvYm9hcmRzL2Nvbm5lY3Rpb24vYmxlbWFuYWdlci50cyIsIndlYnBhY2s6Ly9DaGVzc2Nvbm5lY3QvLi9zY3JpcHRzL2JvYXJkcy9jZXJ0YWJvL2NlcnRhYm9ibGVib2FyZC50cyIsIndlYnBhY2s6Ly9DaGVzc2Nvbm5lY3QvLi9zY3JpcHRzL2JvYXJkcy9jZXJ0YWJvL2NlcnRhYm9zZXJpYWxib2FyZC50cyIsIndlYnBhY2s6Ly9DaGVzc2Nvbm5lY3QvLi9zY3JpcHRzL2JvYXJkcy9jaGVzc251dC9jaGVzbnV0bW92ZWhhbmRsZXIudHMiLCJ3ZWJwYWNrOi8vQ2hlc3Njb25uZWN0Ly4vc2NyaXB0cy9ib2FyZHMvY2hlc3NudXQvY2hlc3NudXRib2FyZC50cyIsIndlYnBhY2s6Ly9DaGVzc2Nvbm5lY3QvLi9zY3JpcHRzL2JvYXJkcy9jaGVzc251dC9jaGVzc251dGJsZWJvYXJkLnRzIiwid2VicGFjazovL0NoZXNzY29ubmVjdC8uL3NjcmlwdHMvYm9hcmRzL2NoZXNzbnV0L2NoZXNzbnV0aGlkYm9hcmQudHMiLCJ3ZWJwYWNrOi8vQ2hlc3Njb25uZWN0Ly4vc2NyaXB0cy9ib2FyZHMvZGd0L21lc3NhZ2UudHMiLCJ3ZWJwYWNrOi8vQ2hlc3Njb25uZWN0Ly4vc2NyaXB0cy9ib2FyZHMvZGd0L2RndGJvYXJkLnRzIiwid2VicGFjazovL0NoZXNzY29ubmVjdC8uL3NjcmlwdHMvYm9hcmRzL2RndC9kZ3QzMDAwc2JpLnRzIiwid2VicGFjazovL0NoZXNzY29ubmVjdC8uL3NjcmlwdHMvYm9hcmRzL2RndC9kZ3RzZXJpYWxib2FyZC50cyIsIndlYnBhY2s6Ly9DaGVzc2Nvbm5lY3QvLi9zY3JpcHRzL2JvYXJkcy9kZ3QvcGVnYXN1c2JvYXJkLnRzIiwid2VicGFjazovL0NoZXNzY29ubmVjdC8uL3NjcmlwdHMvbGVkcy9sZWRzdGF0ZWZhY3Rvcnk4eDhyZ2IudHMiLCJ3ZWJwYWNrOi8vQ2hlc3Njb25uZWN0Ly4vc2NyaXB0cy9ib2FyZHMvaWNoZXNzb25lL2ljaGVzc29uZWJvYXJkLnRzIiwid2VicGFjazovL0NoZXNzY29ubmVjdC8uL3NjcmlwdHMvYm9hcmRzL2ljaGVzc29uZS9pY2hlc3NvbmVibGVib2FyZC50cyIsIndlYnBhY2s6Ly9DaGVzc2Nvbm5lY3QvLi9zY3JpcHRzL2JvYXJkcy9taWxsZW5uaXVtL2NvbW1hbmRzLnRzIiwid2VicGFjazovL0NoZXNzY29ubmVjdC8uL3NjcmlwdHMvYm9hcmRzL21pbGxlbm5pdW0vcHJvdG9jb2wudHMiLCJ3ZWJwYWNrOi8vQ2hlc3Njb25uZWN0Ly4vc2NyaXB0cy9ib2FyZHMvbWlsbGVubml1bS9taWxsZW5uaXVtYm9hcmQudHMiLCJ3ZWJwYWNrOi8vQ2hlc3Njb25uZWN0Ly4vc2NyaXB0cy9ib2FyZHMvbWlsbGVubml1bS9taWxsZW5uaXVtYmxlYm9hcmQudHMiLCJ3ZWJwYWNrOi8vQ2hlc3Njb25uZWN0Ly4vc2NyaXB0cy9ib2FyZHMvbWlsbGVubml1bS9taWxsZW5uaXVtc2VyaWFsYm9hcmQudHMiLCJ3ZWJwYWNrOi8vQ2hlc3Njb25uZWN0Ly4vc2NyaXB0cy9ib2FyZHMvc3RhdW50b24vbGVkbGlnaHRlci50cyIsIndlYnBhY2s6Ly9DaGVzc2Nvbm5lY3QvLi9zY3JpcHRzL2JvYXJkcy9zdGF1bnRvbi9zdGF1bnRvbmNsb2NrLnRzIiwid2VicGFjazovL0NoZXNzY29ubmVjdC8uL3NjcmlwdHMvYm9hcmRzL3N0YXVudG9uL3N0YXVudG9uYm9hcmQudHMiLCJ3ZWJwYWNrOi8vQ2hlc3Njb25uZWN0Ly4vc2NyaXB0cy9ib2FyZHMvc3RhdW50b24vc3RhdW50b25oaWRib2FyZC50cyIsIndlYnBhY2s6Ly9DaGVzc2Nvbm5lY3QvLi9zY3JpcHRzL2JvYXJkcy93dXhpbmcveWl6aGlib2FyZC50cyIsIndlYnBhY2s6Ly9DaGVzc2Nvbm5lY3QvLi9zY3JpcHRzL2JvYXJkcy93dXhpbmcveWl6aGlibGVib2FyZC50cyIsIndlYnBhY2s6Ly9DaGVzc2Nvbm5lY3QvLi9zY3JpcHRzL2JvYXJkcy9jb25uZWN0aW9uL2hpZG1hbmFnZXIudHMiLCJ3ZWJwYWNrOi8vQ2hlc3Njb25uZWN0Ly4vc2NyaXB0cy9ib2FyZHMvY29ubmVjdGlvbi9zZXJpYWxtYW5hZ2VyLnRzIiwid2VicGFjazovL0NoZXNzY29ubmVjdC8uL3NjcmlwdHMvYm9hcmRzL2ljaGVzc29uZS9pY2hlc3NvbmVzZXJpYWxib2FyZC50cyIsIndlYnBhY2s6Ly9DaGVzc2Nvbm5lY3QvLi9zY3JpcHRzL2JvYXJkcy9zdGF1bnRvbi9zdGF1bnRvbmJsZWJvYXJkLnRzIiwid2VicGFjazovL0NoZXNzY29ubmVjdC8uL3NjcmlwdHMvYm9hcmRzL3Bob2VuaXgvcGhvZW5peGJvYXJkLnRzIiwid2VicGFjazovL0NoZXNzY29ubmVjdC8uL3NjcmlwdHMvYm9hcmRzL3Bob2VuaXgvcGhvZW5peGNvbm5lY3Rpb25tYW5hZ2VyLnRzIiwid2VicGFjazovL0NoZXNzY29ubmVjdC8uL3NjcmlwdHMvYm9hcmRzL2NoZXNzdXAvY2hlc3N1cGJvYXJkLnRzIiwid2VicGFjazovL0NoZXNzY29ubmVjdC8uL3NjcmlwdHMvYm9hcmRzL2NoZXNzdXAvY2hlc3N1cGJsZWJvYXJkLnRzIiwid2VicGFjazovL0NoZXNzY29ubmVjdC8uL3NjcmlwdHMvYm9hcmRzL2NlcnRhYm8vY2VydGFib2FwcGJvYXJkLnRzIiwid2VicGFjazovL0NoZXNzY29ubmVjdC8uL3NjcmlwdHMvYXBwL2FwcGNvbm5lY3Rpb25tYW5hZ2VyLnRzIiwid2VicGFjazovL0NoZXNzY29ubmVjdC8uL3NjcmlwdHMvYm9hcmRzL2NoZXNzbnV0L2NoZXNzbnV0YXBwYm9hcmQudHMiLCJ3ZWJwYWNrOi8vQ2hlc3Njb25uZWN0Ly4vc2NyaXB0cy9ib2FyZHMvbWlsbGVubml1bS9taWxsZW5uaXVtYXBwYm9hcmQudHMiLCJ3ZWJwYWNrOi8vQ2hlc3Njb25uZWN0Ly4vc2NyaXB0cy9ib2FyZHMvaWNoZXNzb25lL2ljaGVzc29uZWFwcGJvYXJkLnRzIiwid2VicGFjazovL0NoZXNzY29ubmVjdC8uL3NjcmlwdHMvYm9hcmRzL2NoZXNzdXAvY2hlc3N1cGFwcGJvYXJkLnRzIiwid2VicGFjazovL0NoZXNzY29ubmVjdC8uL3NjcmlwdHMvYm9hcmRzL3N0YXVudG9uL3N0YXVudG9uYXBwYm9hcmQudHMiLCJ3ZWJwYWNrOi8vQ2hlc3Njb25uZWN0Ly4vc2NyaXB0cy9ib2FyZHMvd3V4aW5nL3lpemhpYXBwYm9hcmQudHMiLCJ3ZWJwYWNrOi8vQ2hlc3Njb25uZWN0Ly4vc2NyaXB0cy9ib2FyZHMvZGd0L3BlZ2FzdXNhcHBib2FyZC50cyIsIndlYnBhY2s6Ly9DaGVzc2Nvbm5lY3QvLi9zY3JpcHRzL2JvYXJkcy9kZ3QvZGd0YXBwYm9hcmQudHMiLCJ3ZWJwYWNrOi8vQ2hlc3Njb25uZWN0Ly4vc2NyaXB0cy9ib2FyZHMvY29ubmVjdGlvbi9jb25uZWN0aW9ubWFuYWdlcmZhY3RvcnkudHMiLCJ3ZWJwYWNrOi8vQ2hlc3Njb25uZWN0Ly4vc2NyaXB0cy91dGlscy9zYWZlaW50ZXJ2YWwudHMiLCJ3ZWJwYWNrOi8vQ2hlc3Njb25uZWN0Ly4vc2NyaXB0cy9ib2FyZHMvZGVidWdib2FyZC9kZWJ1Z2Nsb2NrLnRzIiwid2VicGFjazovL0NoZXNzY29ubmVjdC8uL3NjcmlwdHMvYm9hcmRzL2RlYnVnYm9hcmQvZGVidWdib2FyZC50cyIsIndlYnBhY2s6Ly9DaGVzc2Nvbm5lY3QvLi9zY3JpcHRzL2JvYXJkcy9kZWJ1Z2JvYXJkL21hZ25ldGljZGVidWdib2FyZC50cyIsIndlYnBhY2s6Ly9DaGVzc2Nvbm5lY3QvLi9zY3JpcHRzL2JvYXJkcy9kZWJ1Z2JvYXJkL2RlYnVnYm9hcmRjb25uZWN0aW9ubWFuYWdlci50cyIsIndlYnBhY2s6Ly9DaGVzc2Nvbm5lY3QvLi9zY3JpcHRzL3NpdGVzL2xpY2hlc3MvaHR0cC50cyIsIndlYnBhY2s6Ly9DaGVzc2Nvbm5lY3QvLi9zY3JpcHRzL29wdGlvbnMvdXRpbHMudHMiLCJ3ZWJwYWNrOi8vQ2hlc3Njb25uZWN0Ly4vc2NyaXB0cy9zaXRlcy9zaXRlbWFuYWdlci9odG1saGVscGVyLnRzIiwid2VicGFjazovL0NoZXNzY29ubmVjdC8uL3NjcmlwdHMvYm9hcmRzL2RndC9kZ3QzMDAwZ2F0ZXdheS50cyIsIndlYnBhY2s6Ly9DaGVzc2Nvbm5lY3QvLi9zY3JpcHRzL2JvYXJkcy9zdGF1bnRvbi90YXBuc2V0aGlkY2xvY2sudHMiLCJ3ZWJwYWNrOi8vQ2hlc3Njb25uZWN0Ly4vc2NyaXB0cy9zaXRlcy9zaXRlbWFuYWdlci9jb25uZWN0bWVudS50cyIsIndlYnBhY2s6Ly9DaGVzc2Nvbm5lY3QvLi9zY3JpcHRzL3NpdGVzL3NpdGVtYW5hZ2VyL3NpdGVtYW5hZ2VyLnRzIiwid2VicGFjazovL0NoZXNzY29ubmVjdC8uL3NjcmlwdHMvdXRpbHMvZ2xvYmFscy50cyIsIndlYnBhY2s6Ly9DaGVzc2Nvbm5lY3QvLi9zY3JpcHRzL3NpdGVzL2xpY2hlc3MvZ2FtZXN0YXRlLnRzIiwid2VicGFjazovL0NoZXNzY29ubmVjdC8uL3NjcmlwdHMvc2l0ZXMvbGljaGVzcy9zdHJlYW1vYnNlcnZlci50cyIsIndlYnBhY2s6Ly9DaGVzc2Nvbm5lY3QvLi9zY3JpcHRzL3V0aWxzL29hdXRoLnRzIiwid2VicGFjazovL0NoZXNzY29ubmVjdC8uL3NjcmlwdHMvc2l0ZXMvbGljaGVzcy9vYXV0aC50cyIsIndlYnBhY2s6Ly9DaGVzc2Nvbm5lY3QvLi9zY3JpcHRzL2JvYXJkcy9taWxsZW5uaXVtL21rMnRvdXJuYW1lbnRyZXBvcnRlci50cyIsIndlYnBhY2s6Ly9DaGVzc2Nvbm5lY3QvLi9zY3JpcHRzL3NpdGVzL2xpY2hlc3MvbGljaGVzc2FwaWJvYXJkLnRzIiwid2VicGFjazovL0NoZXNzY29ubmVjdC8uL3NjcmlwdHMvc2l0ZXMvaHRtbGJvYXJkcy9wb2ludC50cyIsIndlYnBhY2s6Ly9DaGVzc2Nvbm5lY3QvLi9zY3JpcHRzL3NpdGVzL2h0bWxib2FyZHMvaHRtbGNsaWNrZXIudHMiLCJ3ZWJwYWNrOi8vQ2hlc3Njb25uZWN0Ly4vc2NyaXB0cy9zaXRlcy9odG1sYm9hcmRzL2h0bWxwb3NpdGlvbndhdGNoZXIudHMiLCJ3ZWJwYWNrOi8vQ2hlc3Njb25uZWN0Ly4vc2NyaXB0cy9zaXRlcy9saWNoZXNzL2xpY2hlc3NodG1scG9zaXRpb253YXRjaGVyLnRzIiwid2VicGFjazovL0NoZXNzY29ubmVjdC8uL3NjcmlwdHMvc2l0ZXMvbGljaGVzcy9saWNoZXNzaHRtbGJvYXJkLnRzIiwid2VicGFjazovL0NoZXNzY29ubmVjdC8uL3NjcmlwdHMvc2l0ZXMvbGljaGVzcy9saWNoZXNzbWFuYWdlci50cyIsIndlYnBhY2s6Ly9DaGVzc2Nvbm5lY3QvLi9zY3JpcHRzL3NpdGVzL2NoZXNzLmNvbS9kb21yZWFkZXIudHMiLCJ3ZWJwYWNrOi8vQ2hlc3Njb25uZWN0Ly4vc2NyaXB0cy9zaXRlcy9jaGVzcy5jb20vY2hlc3Njb21tYW5hZ2VyLnRzIiwid2VicGFjazovL0NoZXNzY29ubmVjdC8uL3NjcmlwdHMvYmFja2dyb3VuZC50cyJdLCJuYW1lcyI6WyJNZXNzYWdlUGFzc2VyIiwic2VuZCIsIm1hcCIsIk1hcCIsIm5leHRJZCIsInRoaXMiLCJhc2siLCJxdWVzdGlvbiIsImlkIiwiUHJvbWlzZSIsInJlc29sdmUiLCJzZXQiLCJyZXBseSIsImFuc3dlciIsImdldCIsImRlbGV0ZSIsImkxOG5NZXNzYWdlUGFzc2VyIiwiaTE4bkdldE1lc3NhZ2UiLCJ0YWciLCJwYXJhbXMiLCJkZXZpY2UiLCJBcHBJbnRlcmZhY2UiLCJnZXRHbG9iYWxEZXZpY2UiLCJhcHAiLCJnZXRJMThuTWVzc2FnZSIsInVuZGVmaW5lZCIsImNocm9tZSIsImkxOG4iLCJnZXRNZXNzYWdlIiwiaTE4bkdldExhbmd1YWdlIiwiaTE4bkZpbmRQbGFjZWhvbGRlciIsImkxOG5PYmplY3QiLCJwYXJhbU51bWJlciIsInBsYWNlaG9sZGVycyIsInBsYWNlaG9sZGVyIiwiT2JqZWN0Iiwia2V5cyIsImNvbnRlbnQiLCJTZW5kQW5kV2FpdEJ1ZmZlciIsInRpbWVvdXRNcyIsIm1heFJldHJpZXMiLCJpc0NhbmNlbGVkIiwidGFza3MiLCJzZW5kRnVuYyIsInRlc3RGdW5jIiwiY29tbWVudCIsInRhc2siLCJTZW5kQW5kV2FpdFRhc2siLCJwdXNoIiwicHJvbWlzZSIsInJlY2VpdmUiLCJtc2ciLCJpIiwibGVuZ3RoIiwiaGFuZGxlIiwic3BsaWNlIiwiY2FuY2VsQWxsIiwiZm9yRWFjaCIsInJlamVjdG9yIiwiRXJyb3IiLCJmaWx0ZXIiLCJidWZmZXIiLCJ0aW1lT3V0TXMiLCJyZXRyaWVzIiwicmV0cnlDb3VudCIsInJlamVjdCIsInJlc29sdmVyIiwidGltZW91dCIsInNldFRpbWVvdXQiLCJyZXRyeSIsImNvbnNvbGUiLCJsb2ciLCJjbGVhclRpbWVvdXQiLCJkaWFsb2dJc1Nob3dpbmciLCJjb25maXJtRGlhbG9nIiwibWVzc2FnZSIsInJlc1VybCIsInllc1RleHQiLCJub1RleHQiLCJsb2FkSHRtbCIsImRvY3VtZW50IiwiZ2V0RWxlbWVudEJ5SWQiLCJ0ZXh0Q29udGVudCIsImJhY2tkcm9wIiwiZGlhbG9nIiwieWVzQnV0dG9uIiwibm9CdXR0b24iLCJpbm5lckhUTUwiLCJvbmNsaWNrIiwicmVtb3ZlIiwib2tUZXh0IiwidGhlbiIsInN0eWxlIiwiZGlzcGxheSIsInVybCIsImh0bWwiLCJpc0FwcCIsImxvYWRBc3NldENvbnRlbnQiLCJzdWJzdHJpbmciLCJsYXN0SW5kZXhPZiIsInJlc3BvbnNlIiwiZmV0Y2giLCJ0ZXh0IiwiY3JlYXRlRWxlbWVudCIsImJvZHkiLCJhcHBlbmRDaGlsZCIsInpJbmRleCIsInBvc2l0aW9uIiwibGVmdCIsInRvcCIsIndpZHRoIiwiaGVpZ2h0IiwidHJhbnNmb3JtIiwib3ZlcmZsb3ciLCJiYWNrZ3JvdW5kQ29sb3IiLCJJU19URVNUSU5HX09OTFkiLCJqZXN0IiwidXRpbFJlc1VybCIsIkJhdHRlcnlJY29uIiwic2xlZXAiLCJtc2VjcyIsInIiLCJnZXRVbml4VGltZXN0YW1wIiwibm93IiwiRGF0ZSIsIk1hdGgiLCJmbG9vciIsImdldFRpbWUiLCJwYWROdW1iZXIiLCJudW0iLCJ0b1N0cmluZyIsInBhZFN0YXJ0IiwiY2hlY2tDb25kaXRpb24iLCJpbnRlcnZhbCIsIm1heFdhaXRNcyIsInN0YXJ0VGltZSIsInVpbnQ4QXJyYXlUb0hleCIsInU4QXJyYXkiLCJBcnJheSIsImZyb20iLCJieXRlIiwiam9pbiIsInVpbnQ4QXJyYXlUb1N0cmluZyIsIlRleHREZWNvZGVyIiwiZGVjb2RlIiwic3RyaW5nVG9VaW50OEFycmF5IiwicyIsIlRleHRFbmNvZGVyIiwiZW5jb2RlIiwiZGF0YVZpZXdUb1N0cmluZyIsImRhdGEiLCJieXRlTGVuZ3RoIiwiU3RyaW5nIiwiZnJvbUNoYXJDb2RlIiwiZ2V0VWludDgiLCJlcnJvcmxvZyIsImUiLCJzaG93VG9Vc2VyIiwibWF4TGVuZ3RoIiwiaW5jbHVkZXMiLCJzdGFjayIsImVyciIsImpzb25TdHJpbmciLCJKU09OIiwic3RyaW5naWZ5IiwiZXJyb3IiLCJjdXJyZW50RGF0ZSIsImdldEZ1bGxZZWFyIiwiZ2V0TW9udGgiLCJnZXREYXRlIiwiZ2V0SG91cnMiLCJnZXRNaW51dGVzIiwiZ2V0U2Vjb25kcyIsImdldE1pbGxpc2Vjb25kcyIsImdldEN1cnJlbnRUaW1lV2l0aE1pbGxpc2Vjb25kcyIsIndpbmRvdyIsIndlYmtpdCIsIm1lc3NhZ2VIYW5kbGVycyIsImRlYnVnbG9nIiwicG9zdE1lc3NhZ2UiLCJpc1Bob2VuaXhNb2RlIiwiaXNQaG9lbml4IiwiaW9zSW50ZXJmYWNlIiwicmVxdWVzdFBlcnNpc3RlbnREYXRhIiwicmVwbHlJZCIsImtleSIsInNhdmVQZXJzaXN0ZW50RGF0YSIsInJlcXVlc3RMb2NhbGUiLCJyZXF1ZXN0STE4bk1lc3NhZ2VzIiwicmVxdWVzdE1hbmlmZXN0IiwiY2xvc2VQYWdlIiwicmVwb3J0Q29tbXVuaWNhdGlvblBhcmFtZXRlcnMiLCJib2FyZE5hbWUiLCJjb25uZWN0aW9uVHlwZSIsImNoYW5uZWxJZHMiLCJkZXZpY2VOYW1lU3Vic3RyaW5nIiwibWF4TWVzc2FnZVNpemUiLCJtaW5NaWxsc0JldHdlZW5TZW5kcyIsInNlcmlhbFNldHRpbmdzIiwic2VuZFNpbmdsZUJ5dGVzIiwic2VuZERhdGFUb0JvYXJkIiwiY2hhbm5lbCIsImFzc2V0IiwiYmF0dGVyeUxldmVsQ2hhbmdlZCIsImxldmVsIiwiaWNvbiIsImlzQ29ubmVjdGVkVG9Cb2FyZCIsImluaXRUZXh0VG9TcGVlY2giLCJzYXkiLCJwbGF5U291bmQiLCJldmVudCIsInNvdW5kIiwic2V0VGFwTnNldERldmljZUlkIiwidGFwbnNldERldmljZUlkIiwic2VuZERhdGFUb1RhcE5zZXQiLCJzZXRDbG9ja0FkYXB0ZXIiLCJjbG9ja0FkYXB0ZXIiLCJjcmVhdGVHbG9iYWxEZXZpY2UiLCJuZXh0TWVzc2FnZUlkIiwic2VuZEFuZFdhaXRCdWZmZXIiLCJjb25uZWN0aW9uTWFuYWdlciIsImluaXRpYWxpemVkIiwiaW5pdGlhbGl6ZSIsImNoZXNzY29ubmVjdEFwcCIsImlzQW5kcm9pZCIsImlzSU9TIiwibGFuZyIsInNlbmRNZXNzYWdlVG9BcHAiLCJtZXNzYWdlSWQiLCJpMThuTWVzc2FnZXMiLCJwYXJzZSIsImRpc3BhdGNoRXZlbnQiLCJFdmVudCIsImF0b2IiLCJpc0luaXRpYWxpemVkIiwicmVjZWl2ZU1lc3NhZ2VGcm9tQXBwIiwiY2hyb21lUnVudGltZUdldFVSTCIsImZvbGRlciIsInJ1bnRpbWUiLCJnZXRVUkwiLCJsb2FkT3B0aW9ucyIsImRlZmF1bHRPcHRpb25zIiwiYXNzaWduIiwiY3VycmVudFZlcnNpb24iLCJnZXRWZXJzaW9uIiwic3RvcmFnZSIsInN5bmMiLCJzYXZlT3B0aW9ucyIsIm9wdGlvbnMiLCJpMThuSW5mbyIsInJlcGxhY2UiLCJ2ZXJzaW9uIiwiZ2V0TWFuaWZlc3QiLCJjbG9zZSIsImFycmF5VG9TdHJpbmciLCJhIiwicmVzdWx0IiwiYmFzZTY0VG9VaW50OEFycmF5IiwiYmluYXJ5U3RyaW5nIiwibGVuIiwiYnl0ZXMiLCJVaW50OEFycmF5IiwiY2hhckNvZGVBdCIsImJ0b2EiLCJwcm9jZXNzRGF0YUZyb21UYXBOc2V0IiwiZGF0YXN0cmluZyIsImNsb2NrIiwiY2hlc3Njb25uZWN0Iiwic2l0ZU1hbmFnZXIiLCJjdXJyZW50Qm9hcmQiLCJnZXRDbG9jayIsInByb2Nlc3NDbG9ja01lc3NhZ2UiLCJDb25uZWN0aW9uVHlwZSIsIkJvYXJkVHlwZSIsIkNoZXNzQ2xvY2tUeXBlIiwiQ2xvY2tQb3NpdGlvbiIsIk1vdmVTb3VuZCIsIlNvdW5kRXZlbnQiLCJDYXN0bGVGb3JtYXQiLCJPcHRpb25zIiwic3BlYWtDaGF0TWVzc2FnZXMiLCJCTFVFVE9PVEgiLCJib2FyZFR5cGUiLCJDSEVTU05VVCIsIm1vdmVTb3VuZCIsIk5PVEhJTkciLCJsYXRlbmN5Iiwidm9sdW1lIiwibGVkQ29sb3IiLCJsZWRDb2xvclN0YXJ0IiwibGVkQ29sb3JUYXJnZXQiLCJsZWRDb2xvckNoZWNrIiwibGVkQnJpZ2h0bmVzcyIsInNob3dMZWRDbG9jayIsImxlZENsb2NrQ29sb3IiLCJsZWRDbG9ja0JyaWdodG5lc3MiLCJsYXN0Q2hhbmdlbG9nVmVyc2lvbiIsImNlcnRhYm9NYXBwaW5nIiwibGljaGVzcyIsImFwaVRva2VuIiwidXNlck5hbWUiLCJsZWFyblBpZWNlc09uTmV4dENvbm5lY3QiLCJjbG9ja1R5cGUiLCJOT19DTE9DSyIsImNsb2NrUG9zaXRpb24iLCJXSElURV9MRUZUIiwicGxheVNvdW5kV2hlbkJvYXJkc01hdGNoIiwidm9pY2VOYW1lIiwicmV2ZXJzZVBvc2l0aW9uV2hlbkJsYWNrIiwiY2hlc3Njb21BcGkiLCJhY2Nlc3NUb2tlbnMiLCJsYXN0U2VyaWFsUG9ydCIsImxhc3RIaWREZXZpY2UiLCJsYXN0QmxlRGV2aWNlIiwibG9naW5EYXRhIiwidHJhbnNtaXRNb3Zlc09uQ2xvY2tQcmVzcyIsIm5vUmVjb25uZWN0V2FybmluZ1Nob3duIiwic2hvd01vdmVzT25DbG9jayIsImdldEZyb21TdG9yYWdlIiwiWk1BUlRGVU5fVEFQTlNFVFBSTyIsIndyaXRlVG9TdG9yYWdlIiwic2F2ZVRva2VuIiwic2l0ZW5hbWUiLCJ1c2VyIiwidG9rZW4iLCJzaXRlVG9rZW5zIiwiZ2V0VG9rZW4iLCJzYXZlTG9naW5EYXRhIiwiZ2V0TG9naW5EYXRhIiwiQU5ZX1VTRVIiLCJGaWVsZCIsInJvdyIsImNvbCIsImFzU3RyaW5nIiwiZnJvbVN0cmluZyIsInRvTG93ZXJDYXNlIiwiZXF1YWxzIiwiZiIsImlzT25Cb2FyZCIsImFzU3BlZWNoIiwiTW92ZSIsInRvIiwicHJvbVBpZWNlIiwicGxheWVyIiwiZnJvbUZpZWxkIiwidG9GaWVsZCIsImlzQ2FzdGxlIiwiZnJvbVBvc2l0aW9uIiwiaXNDYXN0bGVTaG9ydCIsImlzQ2FzdGxlTG9uZyIsImZyb21GaWVsZENvbG9yIiwiZ2V0Q29sb3JPbkZpZWxkIiwidG9GaWVsZENvbG9yIiwidG9GaWVsZFBpZWNlIiwiZ2V0UGllY2VPbkZpZWxkIiwibW92ZWRQaWVjZSIsIktJTkciLCJST09LIiwiY29udmVydENhc3RsZU1vdmUiLCJmb3JtYXQiLCJLSU5HX1RBS0VTX1JPT0siLCJpc1Byb21vdGlvbiIsImFzVWNpU3RyaW5nIiwicGllY2VBc1N0cmluZyIsImZyb21VY2lTdHJpbmciLCJ1Y2kiLCJjb2xvciIsImZpZWxkRnJvbVVjaVN0cmluZyIsIm1vdmUiLCJwaWVjZUZyb21TdHJpbmciLCJpc09idmlvdXNseUlsbGVnYWwiLCJhYnMiLCJpc1N0cmFpZ2h0IiwiaXNEaWFnb25hbCIsImlzTGVnYWxNb3ZlIiwic3RhcnRCb2FyZCIsImVuZEJvYXJkIiwia2luZ0lzSW5DaGVjayIsImUxIiwiZTgiLCJkMSIsImMxIiwiYjEiLCJmaWVsZElzSW5DaGVja0J5IiwiQkxBQ0siLCJmaWVsZElzRW1wdHkiLCJkOCIsImM4IiwiYjgiLCJXSElURSIsImlzTGVnYWxDYXN0bGVMb25nIiwiZjEiLCJnMSIsImY4IiwiZzgiLCJpc0xlZ2FsQ2FzdGxlU2hvcnQiLCJ0YXJnZXRTcXVhcmVzIiwiZ2V0UG9zc2libGVUYXJnZXRTcXVhcmVzIiwiaXNMZWdhbCIsImZpZWxkIiwiZmllbGRJc0luU2V0IiwiUEFXTiIsImlzUGF3bk1vdmUiLCJwaWVjZSIsInByb21vdGlvblBpZWNlcyIsIkJJU0hPUCIsIktOSUdIVCIsIlFVRUVOIiwiaXNMZWdhbFByb21vdGlvblBpZWNlIiwiZmluZEtpbmciLCJvcHBvc2l0ZUNvbG9yIiwicGllY2VDb2xvciIsImdldEF0dGFja2luZ0ZpZWxkcyIsImZpZWxkSW5GaWVsZFNldCIsImZpZWxkU2V0Iiwic29tZSIsInRmIiwiaW5jbHVkZUZpZWxkc0luQ2hlY2siLCJjYXB0dXJlT25seSIsInBsYXllckNvbG9yIiwiZ2V0QmlzaG9wVGFyZ2V0U3F1YXJlcyIsIlNldCIsIm9wcG9uZW50Q29sb3IiLCJqIiwidGFyZ2V0RmllbGQiLCJpc1ZhbGlkVGFyZ2V0RmllbGQiLCJuZXdQb3MiLCJjbG9uZSIsInNldEZpZWxkIiwiRU1QVFkiLCJhZGQiLCJnZXRLaW5nVGFyZ2V0U3F1YXJlcyIsImdldEtuaWdodFRhcmdldFNxdWFyZXMiLCJkaXJlY3Rpb24iLCJzaXplIiwicGF3bkZpZWxkIiwiZ2V0UGF3blRhcmdldFNxdWFyZXMiLCJnZXRSb29rVGFyZ2V0U3F1YXJlcyIsImFkZFRvU2V0IiwiZ2V0UXVlZW5UYXJnZXRTcXVhcmVzIiwidG9TZXQiLCJmcm9tU2V0IiwidGFyZ2V0U3F1YXJlc0luRGlyZWN0aW9uIiwicm93SW5jcmVtZW50IiwiY29sSW5jcmVtZW50IiwicGxheWVyc0NvbG9yIiwicGllY2VDYW5CbG9ja0NoZWNrIiwicGllY2VGaWVsZCIsImJsb2NraW5nRmllbGRzIiwiYmxvY2tGaWVsZCIsIm5ld1Bvc2l0aW9uIiwibWFrZU1vdmUiLCJCYXNpY1Bvc2l0aW9uIiwiYm9hcmQiLCJjb2xvclRvTW92ZSIsImNhc3RsZVJpZ2h0cyIsImJsYWNrIiwiS0lOR19DQVNUTEUiLCJRVUVFTl9DQVNUTEUiLCJ3aGl0ZSIsImVuUGFzc2FudEZpZWxkIiwiaGFsZk1vdmVzU2luY2VMYXN0UGF3bk1vdmUiLCJtb3ZlQ291bnRlciIsImNvbHVtbiIsImVxdWFsc0ZvckNvbG9yIiwib3VyRmllbGRFbXB0eSIsIm91ckNvbG9yRml0cyIsIm90aGVyRmllbGRFbXB0eSIsIm90aGVyQ29sb3JGaXRzIiwicHJpbnQiLCJ0aXRlbCIsImxpbmUiLCJmaWVsZEFzQ2hhcmFjdGVyIiwiaWR4IiwiaW5kZXhGcm9tUm93QW5kQ29sIiwidG9VcHBlckNhc2UiLCJPVEhFUiIsImlzRW1wdHkiLCJ2YWx1ZSIsInBpZWNlT25seSIsImNvbG9yT25seSIsImdldEZpZWxkc09mQ29sb3IiLCJwaWVjZUFzU3BlZWNoIiwiY2xlYXJGaWVsZCIsImhhc090aGVyUGllY2VzIiwiaXNQYXduT25CYWNrUmFuayIsInJlbW92ZUNhc3RsZVJpZ2h0IiwicmlnaHQiLCJvbGRSaWdodHMiLCJndWVzc0Nhc3RsZXJpZ2h0cyIsInBpZWNlQW5kQ29sb3JGcm9tQ2hhciIsImlzUHJvbW90aW9uTW92ZSIsImZpbmRQaWVjZU9uTmV3RmllbGQiLCJpc0VtcHR5Qm9hcmQiLCJHSE9TVCIsInNsaWNlIiwiZnJvbVN0cmluZ2lmaWVkUG9zaXRpb24iLCJwIiwidmFsdWVzIiwibW92ZUFzU3BlZWNoIiwiZW5kUG9zaXRpb24iLCJzcGVlY2giLCJhbGdlYnJhaWMiLCJjb21wdXRlTW92ZVRvIiwiaXNDYXB0dXJlIiwibW92ZUlzQ2FwdHVyZSIsImlzQ2hlY2tNYXRlIiwiaXNDaGVjayIsIm5ld0JvYXJkIiwibW9kaWZpZWRGaWVsZHMiLCJjb21wdXRlTW9kaWZpZWRGaWVsZHMiLCJjb21wdXRlQ2FzdGxlTW92ZSIsImNvbXB1dGVOb3JtYWxNb3ZlIiwiY29tcHV0ZUVuUGFzYW50TW92ZSIsInByaW50TW9kaWZpZWRGaWVsZHMiLCJsYWJlbCIsInR4dCIsImNoYW5nZWRGaWVsZHMiLCJnZXRNb2RpZmllZFJvdyIsIm9sZEtpbmdBbmRSb29rcyIsImZpbmRLaW5nQW5kUm9va3NGb3JDYXN0bGUiLCJuZXdLaW5nQW5kUm9va3MiLCJraW5nUm9vayIsImtpbmciLCJxdWVlblJvb2siLCJpc0Nhc3RsZWQiLCJyb29rQ29scyIsImtpbmdDb2wiLCJraW5nUm9va0NvbCIsInF1ZWVuUm9va0NvbCIsIm1heCIsIm1pbiIsIm9ubHlGb3JDb2xvciIsImZsaXBwZWQiLCJmbGlwcGVkQm9hcmQiLCJpc1N0YXJ0aW5nUG9zaXRpb24iLCJnZXRTdGFydGluZ1Bvc2l0aW9uIiwib2xkUG9zIiwidXBkYXRlQ2FzdGxlUmlnaHRzIiwiaXNFblBhc3NhbnQiLCJ1cGRhdGVFblBhc3NhbnRGaWVsZCIsIm5ld1Bvc2l0aW9uRnJvbU1vdmUiLCJjYW5Qcm9tb3RlTmV4dE1vdmUiLCJjb2xvckluQ2hlY2siLCJhdHRhY2tlcnMiLCJhdHRhY2tlckNvbG9yIiwiYXR0YWNrZXIiLCJjaGVja0NhbkJlQmxvY2tlZEZyb20iLCJhdHRhY2tlckZpZWxkIiwia2luZ0ZpZWxkIiwib3VyUGllY2VzIiwiaXNOZXdHYW1lIiwib2xkUG9zaXRpb24iLCJDSEFOR0VMT0ciLCJjcmVhdGVSZWxlYXNlTm90ZXNEaWFsb2ciLCJiYWNrZW5kQ2hhbm5lbCIsInRhYklkIiwiY2hhbmdlbG9nIiwiY3JlYXRlUmVsZWFzZU5vdGVzTGlzdCIsInR5cGUiLCJzZW5kZXJUYWJJZCIsIlJmSWQiLCJpc1BpZWNlIiwidG9BcnJheSIsIm90aGVyIiwiR2FtZUxpZmVjeWNsZSIsIkdhbWVSZXN1bHQiLCJ3aGl0ZU1zIiwiYmxhY2tNcyIsIndoaXRlU3RhcnRNcyIsImJsYWNrU3RhcnRNcyIsInJ1bm5pbmdGb3JQbGF5ZXIiLCJnYW1lUmVzdWx0IiwibGlmZWN5Y2xlIiwidGltZXN0YW1wIiwiTk9UX1NUQVJURUQiLCJpc0NvdW50aW5nRG93biIsImdldFdoaXRlSG91cnMiLCJnZXRXaGl0ZU1pbnV0ZXMiLCJnZXRXaGl0ZVNlY29uZHMiLCJnZXRCbGFja0hvdXJzIiwiZ2V0QmxhY2tNaW51dGVzIiwiZ2V0QmxhY2tTZWNvbmRzIiwiZ2V0V2hpdGVNcyIsImdldEJsYWNrTXMiLCJtcyIsInJvdW5kIiwiaXNHYW1lT3ZlciIsImdhbWVSZXN1bHRBc1N0cmluZyIsIkFCT1JURUQiLCJCTEFDS19XSU5TIiwiV0hJVEVfV0lOUyIsIkRSQVciLCJnYW1lUmVzdWx0QXNMb2NhbGUiLCJoYXNUaW1lTGVmdCIsImNvbG9yT25MZWZ0U2lkZSIsIldISVRFX1JJR0hUIiwiUExBWUVSX0xFRlQiLCJQTEFZRVJfUklHSFQiLCJHYW1lRm9ybWF0IiwiU2l0ZUJvYXJkIiwiZ2V0UGxheWVyc0NvbG9yIiwiaXNXaGl0ZSIsImxhc3RLbm93blBvc2l0aW9uIiwibGFzdEtub3duQ2xvY2tTdGF0ZSIsInNlbmRQb3NpdGlvblRvU21hcnRib2FyZCIsImNsb2NrU3RhdGUiLCJzZXRTaXRlUG9zaXRpb24iLCJnZXRDdXJyZW50UG9zaXRpb24iLCJnZXRDdXJyZW50Q2xvY2tTdGF0ZSIsImNsZWFyTEVEcyIsInNheU1vdmUiLCJzdGFydFBvc2l0aW9uIiwiZ2V0T3B0aW9ucyIsInNwZWVjaEFuZEFsZ2VicmFpYyIsIlNQRUVDSCIsInNodXRkb3duIiwiY3JlYXRlUG9zaXRpb25Gcm9tRmVuIiwiZmVuIiwiZmllbGRzIiwic3BsaXQiLCJjIiwibWF0Y2giLCJOdW1iZXIiLCJyaWdodHMiLCJraW5nc2lkZVJvb2tGaWxlIiwicXVlZW5zaWRlUm9va0ZpbGUiLCJwYXJzZUludCIsImNyZWF0ZUZlbkZyb21Qb3NpdGlvbiIsIk5PUk1BTF9DSEVTUyIsImVtcHR5RmllbGRDb3VudGVyIiwia2luZ0FuZFJvb2tzIiwibGV0dGVyIiwiY2hhckF0IiwiaXNDaGVzczk2MCIsInBvcyIsIkJvYXJkT3JpZW50YXRpb24iLCJpbnN0YW5jZUNvdW50ZXIiLCJTbWFydGJvYXJkIiwib25seVNob3dMZWRzRm9yT3Bwb25lbnRQaWVjZXMiLCJib2FyZE9yaWVudGF0aW9uIiwiTk9STUFMIiwibGFzdENsb2NrU3RhdGUiLCJsYXN0V3JvbmdQaWVjZVdhcm5pbmciLCJvbkJhdHRlcnlDaGFuZ2VkIiwiX2luc3RhbmNlQ291bnRlciIsImxhc3RMZWRTdGF0ZSIsIl9sYXN0TGVkU3RhdGUiLCJzZXRDbG9ja1N0YXRlIiwic2l0ZVBvc2l0aW9uIiwiY2FuY2VsTWlzcGxhY2VkUGllY2VXYXJuaW5nIiwibGFzdFBvc2l0aW9uUmVjZWl2ZWQiLCJsYXN0TWF0Y2hpbmdQb3NpdGlvbiIsImxpZ2h0TEVEcyIsImFwcGx5Qm9hcmRPcmllbnRhdGlvbiIsImdldFNpdGVQb3NpdGlvbiIsImxlZnRDb2xvciIsImlzV2hpdGVMZWZ0T25DbG9jayIsImNoZWNrRm9yVGFwbnNldEFkYXB0ZXIiLCJjaGVja0ZvckRndDMwMDBHYXRld2F5Iiwic2V0UnVubmluZ0ZvclBsYXllciIsInVwZGF0ZSIsImdldExhc3RDbG9ja1N0YXRlIiwiZGlzY29ubmVjdCIsInJlc2V0IiwibmVlZHNUb0NvcHlDaGVzc2NvbVBvc2l0aW9uIiwiZ2V0UGxheWVyQ29sb3IiLCJzaXRlQm9hcmQiLCJnZXRQbGF5ZXJUb01vdmUiLCJvbkJvYXJkQ2hhbmdlZCIsInBlbmRpbmdNb3ZlVGltZW91dCIsImhhc0xFRHMiLCJzYXlXcm9uZ1BpZWNlcyIsImNsZWFyVGV4dERpc3BsYXkiLCJQT1NJVElPTlNfTUFUQ0giLCJpc0FuYWx5c2lzQm9hcmQiLCJzZXRQZW5kaW5nTW92ZSIsInF1ZXJ5QmF0dGVyeSIsImFybU1pc3BsYWNlZFBpZWNlV2FybmluZyIsIm1pc3BsYWNlZFBpZWNlV2FybmluZ1RpbWVvdXQiLCJib2FyZFBvc2l0aW9uIiwid3JvbmdGaWVsZCIsImFubm91bmNlTWlzcGxhY2VkUGllY2UiLCJjaGVja0JvYXJkT3JpZW50YXRpb24iLCJGTElQUEVEIiwicDEiLCJwMiIsIm9sZEJvYXJkIiwibGVkcyIsIkxlZFN0YXRlU2ltcGxlIiwiaW5pdCIsImNvbXB1dGVPbmx5Rm9yQ29sb3IiLCJsZWRPbiIsImNvdW50TGVkc0xpdCIsInNlbmRMZWRTdGF0ZVRvQm9hcmQiLCJPTkdPSU5HIiwiV1JPTkdfUElFQ0VfV0FSTklOR19QQVVTRV9TRUNPTkRTIiwic2V0Q2xvY2siLCJpc0Nvbm5lY3RlZCIsInN1cHBvcnRzU291bmRFdmVudCIsIl9ldmVudCIsImluaXRpYWxpemVCb2FyZCIsIl9kZXZpY2VOYW1lIiwiZmlsbCIsImlzTGVkT24iLCJpc0FsbExlZHNPZmYiLCJjb3VudCIsImlzT24iLCJnZXRMaXRGaWVsZHMiLCJnZXREZWJ1Z1N0cmluZyIsIkExIiwiQzEiLCJEMSIsIkUxIiwiRjEiLCJHMSIsIkgxIiwiQTgiLCJDOCIsIkQ4IiwiRTgiLCJGOCIsIkc4IiwiSDgiLCJsYXN0UHJvbW90aW9uUG9zaXRpb24iLCJsYXN0UHJvbW90ZWRQb3NpdGlvbiIsIkJpbmFyeVBvc2l0aW9uIiwiZGF0YUZpZWxkcyIsImNyZWF0ZUZyb21Qb3NpdGlvbiIsInNldFBpZWNlT25GaWVsZCIsImV4dHJhcG9sYXRlRnJvbSIsImdhbWVGb3JtYXQiLCJzb3J0IiwiYiIsIkNIRVNTOTYwIiwiY29tcHV0ZUNhc3RsZU1vdmVDaGVzczk2MCIsImNvbXB1dGVDYXN0bGVNb3ZlTm9ybWFsQ2hlc3MiLCJjb21wdXRlRW5QYXNzZW50TW92ZSIsImNvbXB1dGVEaWZmZXJlbmNlIiwicG9zRW1wdHkiLCJ0aGlzRW1wdHkiLCJjb21wdXRlQ2hhbmdlZEZpZWxkc0Zyb20iLCJiaXQiLCJwaWVjZTEiLCJwaWVjZTIiLCJyb29rRmllbGQiLCJjYXB0dXJlZEZpZWxkIiwiZmluZCIsImNvbXB1dGVQcm9tb3Rpb25Nb3ZlIiwidGFrZW5QYXduRmllbGQiLCJwcm9tb3Rpb25QaWVjZSIsInByb21vdGlvbkZpZWxkIiwiYXNrUHJvbW90aW9uUGllY2UiLCJtYXRjaGVzIiwicXVlZW4iLCJrbmlnaHQiLCJyb29rIiwiYmlzaG9wIiwic2VsZWN0aW9uIiwiZGl2Iiwib3B0aW9uIiwiYnV0dG9uIiwiY2xhc3NMaXN0Iiwib3B0aW9uc0RpYWxvZyIsImFuZCIsIk1hZ25ldEJvYXJkIiwibWFnbmV0Q2hhbmdlZEZpZWxkcyIsImxhc3RCaW5hcnlQb3NpdGlvbiIsInRlbXBvcmFyeUxlZFN0YXRlIiwid2FzQ2FzdGxlTW92ZSIsInNtYXJ0Ym9hcmRQb3MiLCJnZXRCb2FyZEZyb21CaW5hcnlQb3NpdGlvbiIsImJpbmFyeVBvcyIsImJhc2VQb3NpdGlvbiIsImFkZFRvQ2hhbmdlZEZpZWxkcyIsImdldEdhbWVGb3JtYXQiLCJDb2xvciIsInJlZCIsImdyZWVuIiwiYmx1ZSIsIm1pbnVzIiwicGx1cyIsInRpbWVzIiwiZmFjdG9yIiwiZGl2aWRlZEJ5IiwiZnJvbUh0bWxIZXhTdHJpbmciLCJoZXgiLCJiaWdpbnQiLCJMZWRDb29yZGluYXRlcyIsImFkdmFuY2UiLCJ5SW5jcmVtZW50IiwieEluY3JlbWVudCIsIkxlZFN0YXRlUmdiIiwibGVkc1BlclJvdyIsImlzU2hvd2luZ01vdmUiLCJmcm9tU3RyaW5naWZpZWRPYmplY3QiLCJzdGF0ZSIsInNldExlZCIsInJnYiIsInNldEFsbExlZHMiLCJnZXRMZWQiLCJjb3VudENvbG9yIiwibGVkIiwicm90YXRlZDE4MCIsInNldFBhdHRlcm4iLCJwYXR0ZXJuIiwib3ZlcmxheVdpdGgiLCJkaW1UbyIsImdldENvbG9ycyIsImhhc0NvbG9yIiwiTGVkU3RhdGU5eDlSZ2IiLCJzdXBlciIsImlzR2FtZU92ZXJBbmltYXRpb24iLCJjbG9uZUZyb21MZWRTdGF0ZVJnYiIsImZpZWxkQ29ybmVyIiwiZGlyZWN0aW9uMSIsImRpcmVjdGlvbjIiLCJsZWZ0Qm90dG9tIiwiTW92ZURpcmVjdGlvbiIsIm1vdmVPclhJbmNyZW1lbnQiLCJ5SW5jcmVtZW50T3JFbmRMZWQiLCJzaWduIiwic3RhcnRMZWQiLCJlbmRMZWQiLCJvcnRob2dvbmFsRGlyZWN0aW9ucyIsIm9wcG9zaXRlRGlyZWN0aW9uIiwiQ09MT1JfV0lOIiwiQ09MT1JfTE9TRSIsIkNPTE9SX0RSQVciLCJMZWRTdGF0ZUZhY3Rvcnk5eDlSZ2IiLCJjb2xvck1vdmVTdGFydCIsImNvbG9yTW92ZUVuZCIsImNvbG9yTW9kaWZpZWRGaWVsZCIsImNvbG9yQ2hlY2siLCJicmlnaHRlc3NGYWN0b3IiLCJjcmVhdGVMZWRTdGF0ZSIsImxlZFN0YXRlIiwiY3JlYXRlTGVkU3RhdGVGb3JNb3ZlIiwibGlnaHRGaWVsZCIsImNyZWF0ZUxlZFN0YXRlRm9yTW9kaWZpZWRGaWVsZHMiLCJjcmVhdGVMZWRTdGF0ZUZvclN0cmFpZ2h0TW92ZSIsImNyZWF0ZUxlZFN0YXRlRm9yRGlhZ29uYWxNb3ZlIiwib3J0aG9nb25hbERpcmVjdGlvbiIsImFuaW1hdGVMZWRMaW5lIiwic3RhcnRMZWRDb3JuZXIiLCJlbmRMZWRDb3JuZXIiLCJzdGVwcyIsImNvbG9yU3RlcCIsInN0ZXAiLCJjcmVhdGVSZXN1bHRQYXR0ZXJuIiwiQ09MT1JfTEVEX0hBTEYiLCJDT0xPUl9MRURfRU1QVFkiLCJMZWRDbG9jayIsInNtYXJ0Ym9hcmQiLCJicmlnaHRuZXNzRmFjdG9yIiwibGVkc1BlclBsYXllciIsImF1dG9VcGRhdGVJbnRlcnZhbCIsInN0YXJ0TXNXaGl0ZSIsInN0YXJ0TXNCbGFjayIsImxlZFN0ZXBzIiwiY29tcHV0ZUxlZFN0ZXBzIiwiX2xlZnRDb2xvciIsImNsZWFySW50ZXJ2YWwiLCJhdXRvVXBkYXRlIiwic2V0SW50ZXJ2YWwiLCJpbXByaW50VGltZU9uTGVkU3RhdGUiLCJuZXh0Q2xvY2tTdGF0ZSIsInRpbWVMZWRTdGF0ZSIsInZpc3VhbGlzZUNsb2NrU3RhdGUiLCJzdHJ1Y3R1cmVkQ2xvbmUiLCJzdGVwc1BlckxlZCIsImNsb2NrQ29sb3IiLCJmaXJzdEhhbGZTdGVwcyIsInNlY29uZEhhbGZTdGVwcyIsImdyYWRpZW50Q29sb3IiLCJzdGFydENvbG9yIiwiZW5kQ29sb3IiLCJnIiwid2hpdGVMZWRzIiwibGVkc0ZvclBsYXllciIsImJsYWNrTGVkcyIsInRvdGFsU3RlcHMiLCJ0b3RhbE1zIiwibXNQZXJMZWRTdGVwIiwiZnVsbFN0ZXBzIiwicmVtYWluTXMiLCJnZXRDbG9ja0xlZHMiLCJfbW92ZSIsIl9wbGF5ZXIiLCJBcnJheVdpdGhFcXVhbHMiLCJOb2lzZUZpbHRlciIsIm1pblJlYWRpbmdzIiwicmVhZGluZ3MiLCJyZWFkaW5nQ29uZmlybWVkIiwicmVhZGluZyIsImZvdW5kIiwiY291bnRlciIsIlNlcmlhbGl6ZXIiLCJwYXVzZU1zIiwibWF4UXVldWVMZW5ndGgiLCJwYXVzZVRpbWVyIiwicXVldWUiLCJpc1Byb2Nlc3NpbmciLCJzZXRQYXVzZU1zIiwiZ2V0UXVldWVMZW5ndGgiLCJlbnF1ZXVlIiwiY2xlYXJRdWV1ZSIsInByb2Nlc3NRdWV1ZSIsInNoaWZ0IiwiQ2VydGFib0JvYXJkIiwiaXNGdWxsUmdiQm9hcmQiLCJjdXJyZW50SW5wdXRMaW5lIiwibGVhcm5QaWVjZXNXYXJuaW5nQWN0aXZlIiwid3JpdGVTZXJpYWxpc2VyIiwicmVhZFNlcmlhbGlzZXIiLCJsZWRTdGF0ZUxhc3RTZW50Iiwibm9pc2VGaWx0ZXIiLCJUQUJVVFJPTklDX1NQRUNUUlVNIiwiY2hlY2tGb3JMZWFybmVkUGllY2VzIiwicGFyc2VQb3NpdGlvbiIsImdldEJvYXJkRnJvbVBvc2l0aW9uRGF0YSIsInRyaW0iLCJnZXRCb2FyZEZyb21TZW50aW9Qb3NpdGlvbkRhdGEiLCJyZmlkcyIsImludmFsaWREYXRhIiwibnVtYmVycyIsImdldFBpZWNlRm9yUmZJZCIsInBvc2l0aW9uQ29uZmlybWVkIiwibGVhcm5QaWVjZXNXaXRoSW5mbyIsImlzQXBwU2l0ZU1hbmFnZXIiLCJrbm93blBpZWNlc0NvdW50IiwibGVhcm5SZklkcyIsInBpZWNlc0xlYXJuZWQiLCJzYXZlT3B0aW9uc0FuZFdhaXQiLCJvIiwiZW5jb2RlTGVkU3RhdGUiLCJlbmNvZGVMZWRTdGF0ZTl4OXJnYiIsImVuY29kZUxlZFN0YXRlU2ltcGxlIiwiaW5kZXgiLCJzYWZlZ3VhcmRDb2xvciIsInByb2Nlc3NEYXRhRnJvbUJvYXJkIiwic2VudGlvUG9zIiwibWF4Q291bnRlciIsIlJFQ09OTkVDVF9USU1FT1VUX01TIiwiQ29ubmVjdGlvbk1hbmFnZXIiLCJjYW5kaWRhdGVCb2FyZCIsIndhc1NodXRkb3duIiwic3RhcnRSZWNvbm5lY3RTZXJ2aWNlIiwic3RvcFJlY29ubmVjdFNlcnZpY2UiLCJyZWNvbm5lY3RBYm9ydENvbnRyb2xsZXIiLCJhYm9ydCIsImJvYXJkRGlzY29ubmVjdGVkIiwiRV9DQU5DRUxFRCIsIlNlbWFwaG9yZSIsImNvbnN0cnVjdG9yIiwiX3ZhbHVlIiwiX2NhbmNlbEVycm9yIiwiX3F1ZXVlIiwiX3dlaWdodGVkV2FpdGVycyIsImFjcXVpcmUiLCJ3ZWlnaHQiLCJwcmlvcml0eSIsImZpbmRJbmRleEZyb21FbmQiLCJfZGlzcGF0Y2hJdGVtIiwicnVuRXhjbHVzaXZlIiwiY2FsbGJhY2tfMSIsInRoaXNBcmciLCJfYXJndW1lbnRzIiwiYXJndW1lbnRzIiwiZ2VuZXJhdG9yIiwiY2FsbGJhY2siLCJyZWxlYXNlIiwiUCIsImZ1bGZpbGxlZCIsIm5leHQiLCJyZWplY3RlZCIsImRvbmUiLCJhcHBseSIsIndhaXRGb3JVbmxvY2siLCJfY291bGRMb2NrSW1tZWRpYXRlbHkiLCJ2IiwiaW5zZXJ0U29ydGVkIiwiaXNMb2NrZWQiLCJnZXRWYWx1ZSIsInNldFZhbHVlIiwiX2Rpc3BhdGNoUXVldWUiLCJjYW5jZWwiLCJlbnRyeSIsIl9kcmFpblVubG9ja1dhaXRlcnMiLCJpdGVtIiwicHJldmlvdXNWYWx1ZSIsIl9uZXdSZWxlYXNlciIsImNhbGxlZCIsIndhaXRlcnMiLCJ3YWl0ZXIiLCJxdWV1ZWRQcmlvcml0eSIsImZpbmRJbmRleCIsInByZWRpY2F0ZSIsIk11dGV4IiwiY2FuY2VsRXJyb3IiLCJfc2VtYXBob3JlIiwicmVsZWFzZXIiLCJCbGVNYW5hZ2VyIiwic2VuZFNlcmlhbGl6ZXIiLCJyZWNvbm5lY3RUaW1lZE91dCIsInJlY29ubmVjdFRpbWVyIiwicmVjb25uZWN0TXV0ZXgiLCJhZHZlcnRpc3RlbWVudExpc3RlbmVyIiwibmFtZSIsInJlY29ubmVjdFRyeVRpbWVvdXQiLCJzdGFydENvbm5lY3RpbmciLCJyZWNvbm5lY3RUb0RldmljZSIsInNldFNlbmREZWxheSIsImNvbm5lY3RUb0JvYXJkIiwiY2hlY2tBdmFpbGFiaWxpdHkiLCJmaWx0ZXJzIiwiZ2V0U2NhbkZpbHRlciIsIm9wdGlvbmFsU2VydmljZXMiLCJnZXRTZXJ2aWNlVVVJRHMiLCJuYXZpZ2F0b3IiLCJibHVldG9vdGgiLCJyZXF1ZXN0RGV2aWNlIiwiY29ubmVjdFRvRGV2aWNlIiwib25TbWFydGJvYXJkQ29ubmVjdCIsInNhdmVPcHRpb25Qcm9wZXJ0eSIsImdldEF2YWlsYWJpbGl0eSIsImdldERldmljZXMiLCJzdGFydFNlYXJjaGluZyIsIkFib3J0Q29udHJvbGxlciIsImxpc3RlbmVyc0VzdGFibGlzaGVkIiwiZGV2aWNlcyIsInJlbW92ZUV2ZW50TGlzdGVuZXIiLCJhZGRFdmVudExpc3RlbmVyIiwid2F0Y2hBZHZlcnRpc2VtZW50cyIsInNpZ25hbCIsImdldEdhdHRTZXJ2ZXIiLCJnYXR0IiwiY29ubmVjdGVkIiwiY29ubmVjdCIsImdldENoYXJhY3RlcmlzdGljIiwic2VydmVyIiwic2VydmljZVVVSUQiLCJjaGFyYWN0ZXJpc3RpY3NVVUlEIiwic2VydmljZSIsImdldFByaW1hcnlTZXJ2aWNlIiwic2VuZFRvQm9hcmQiLCJ3aXRob3V0UmVzcG9uc2UiLCJzdWNjZXNzIiwid3JpdGVWYWx1ZVdpdGhvdXRSZXNwb25zZSIsIndyaXRlVmFsdWVXaXRoUmVzcG9uc2UiLCJTRVJWSUNFX1VVSUQiLCJDSEFSQUNURVJJU1RJQ19VVUlEX1JYIiwiQ0hBUkFDVEVSSVNUSUNfVVVJRF9UWCIsIkNlcnRhYm9CbGVCb2FyZCIsImRpc2Nvbm5lY3RMaXN0ZW5lciIsIm9uU21hcnRib2FyZERpc2Nvbm5lY3QiLCJkYXRhTGlzdGVuZXIiLCJvbkRhdGFSZWNlaXZlZCIsInNlcnZpY2VzIiwic2hvd01lc3NhZ2VzIiwic2hvd1N0YXR1c01lc3NhZ2UiLCJ3cml0ZUNoYW5uZWwiLCJyZWFkQ2hhbm5lbCIsInN0YXJ0Tm90aWZpY2F0aW9ucyIsInRhcmdldCIsImdldEJsdWV0b290aE5hbWVQcmVmaXgiLCJibGVNYW5hZ2VyIiwiQ2VydGFib1NlcmlhbEJvYXJkIiwiY29ubmVjdFRvUG9ydCIsInBvcnQiLCJvcGVuIiwiYmF1ZFJhdGUiLCJyZWFkRnJvbVBvcnQiLCJyZWFkZXIiLCJyZWFkYWJsZSIsImdldFJlYWRlciIsInJlYWQiLCJjb25zdERhdGEiLCJyZWxlYXNlTG9jayIsIndyaXRlciIsIndyaXRhYmxlIiwiZ2V0V3JpdGVyIiwid3JpdGUiLCJQSUVDRVNfTklCQkxFUyIsIlFVRVJZX0JBVFRFUllfU1RBVEUiLCJRVUVSWV9CQVRURVJZX1BJRUNFUyIsIkNoZXNzbnV0TW92ZUhhbmRsZXIiLCJjaGVzc251dEJvYXJkIiwiYmF0dGVyeUxldmVsQm9hcmQiLCJiYXR0ZXJ5TGV2ZWxQaWVjZXMiLCJDT01fQ0hBTk5FTF9XUklURV9DT01NQU5EIiwicXVlcnlQaWVjZXMiLCJDT01fQ0hBTk5FTF9SRUFEX1JFU1BPTlNFIiwicHJvY2Vzc0RhdGFGcm9tUGllY2VzIiwiQ09NX0NIQU5ORUxfUkVBRF9CT0FSRCIsInByb2Nlc3NOZXdQb3NpdGlvbiIsIndhcm4iLCJsb3dlc3RCYXR0ZXJ5IiwiYmF0dGVyeUxldmVsIiwiQk9BUkQiLCJQSUVDRVMiLCJibGFja1BpZWNlc09uRmlyc3RSYW5rcyIsIkdSRUVOIiwibW92ZVBpZWNlc1RvIiwibmliYmxlIiwiZW5jb2RlUGllY2UiLCJwaWVjZUxldHRlciIsImluZGV4T2YiLCJkZWNvZGVQaWVjZSIsInN0YXJ0UG9zIiwidHdvRmllbGRzIiwiZmllbGQxIiwiZmllbGQyIiwicGllY2VXaXRoQ29sb3IiLCJJTklUX0JPQVJEX1NFUVVFTkNFIiwiQ2hlc3NudXRCb2FyZCIsImNoZXNzbnV0TW92ZUhhbmRsZXIiLCJpc1Byb2Nlc3NpbmdQb3NpdGlvbiIsImdldENvbG9yIiwiZ2V0UGllY2UiLCJ3cml0ZUxlZFN0YXRlVG9CdWZmZXIiLCJpc0NoZXNzbnV0TW92ZUJvYXJkIiwiZGV2aWNlTmFtZSIsIkJBVFRFUlkiLCJwb3NpdGlvbklzTmV3IiwibW92ZVRvU3RhcnRpbmdQb3NpdGlvbiIsImNvbmZpcm1UZXh0IiwiQkxFX1NFUlZJQ0UxX1VVSUQiLCJCTEVfU0VSVklDRTJfVVVJRCIsIkJMRV9DSEFSQUNURVJJU1RJQ19XUklURV9VVUlEIiwiQkxFX0NIQVJBQ1RFUklTVElDX1JFQURCT0FSRF9VVUlEIiwiQkxFX0NIQVJBQ1RFUklTVElDX1JFQURDT05GSVJNX1VVSUQiLCJDaGVzc251dEJsZUJvYXJkIiwicG9zaXRpb25MaXN0ZW5lciIsIm9uQmxlRGF0YVJlY2VpdmVkIiwiY29uZmlybUxpc3RlbmVyIiwib25CbGVDb25maXJtUmVjZWl2ZWQiLCJuYW1lUHJlZml4IiwiYm9hcmRDaGFubmVsIiwiYnl0ZU9mZnNldCIsIlZFTkRPUl9JRCIsIkNoZXNzbnV0SGlkQm9hcmQiLCJwcm9kdWN0TmFtZSIsInZlbmRvcklkIiwiaW5wdXRyZXBvcnRMaXN0ZW5lciIsImhpZERldmljZSIsInJlcG9ydElkIiwib3BlbmVkIiwiaGlkIiwic2VuZFJlcG9ydCIsImdldFZlbmRvcklkIiwiZ2V0SGlkRmlsdGVyIiwidXNhZ2VQYWdlIiwiX2NoYW5uZWwiLCJNZXNzYWdlIiwiY29tbWFuZCIsIm5lZWRTZWNvbmRTaXplQnl0ZSIsImJ5dGVBcnJheVRvSGV4U3RyaW5nIiwiRGd0Qm9hcmQiLCJzZW5kVGltZXIiLCJlbmNvZGVNZXNzYWdlIiwiY3VycmVudEluY29taW5nTWVzc2FnZSIsImhhbmRsZU1lc3NhZ2VGcm9tQm9hcmQiLCJzZW5kTWVzc2FnZVRvQm9hcmQiLCJoYW5kbGVCYXR0ZXJ5TWVzc2FnZSIsImhhbmRsZUNsb2NrTWVzc2FnZSIsInBlcmNlbnQiLCJmaWVsZEluZGV4T2YiLCJmaWVsZEZyb21JbmRleCIsImNvbG9yT2YiLCJwaWVjZU9mIiwiX2xlZFN0YXRlIiwic2VuZEFuZFdhaXQiLCJyZXBseUNvbW1hbmQiLCJzZW5kQW5kV2FpdENsb2NrIiwiYWxsWmVybyIsImV2ZXJ5IiwiRGd0MzAwMFNiaSIsImxhc3RMZXZlclBvc2l0aW9uIiwicGVuZGluZ01vdmUiLCJzZXJpYWxpemVyIiwiRklOSVNIRUQiLCJzZW5kQXNjaWkiLCJwZW5kaW5nQ2xvY2tTdGF0ZSIsImNvdW50VXBEb3duIiwic2VuZENvbW1hbmQiLCJwYWRFbmQiLCJ0ZXh0Qnl0ZXMiLCJlbmNvZGVDb21tYW5kIiwibmV3RGF0YSIsImxldmVyUG9zaXRpb24iLCJEZ3RTZXJpYWxCb2FyZCIsImhhc0xlZHMiLCJpc1JldmVsYXRpb24yIiwiZGF0YUJpdHMiLCJwYXJpdHkiLCJzdG9wQml0cyIsInNldEJvYXJkRHVtcFRpbWVvdXQiLCJib2FyZER1bXBUaW1lb3V0IiwidHJhZGVtYXJrIiwiREdUMzAwMCIsIkRFVkVMT1BFUl9LRVkiLCJCTEVfU0VSVklDRV9VVUlEIiwiQkxFX0NIQVJBQ1RFUklTVElDX1JFQURfVVVJRCIsIlBlZ2FzdXNCb2FyZCIsImV2ZW50TGlzdGVuZXIiLCJhbmltYXRlTW92ZSIsImNyZWF0ZUJpbmFyeVBvc2l0aW9uIiwiTGVkU3RhdGVGYWN0b3J5OHg4UmdiIiwiSWNoZXNzT25lQm9hcmQiLCJsYXN0TGVkU3RhdGVDb21tYW5kcyIsImNvbW1hbmRTZXJpYWxpemVyIiwibGVkU3RhdGVDb21tYW5kcyIsImxlZFN0YXRlQ29tbW1hbmQiLCJjbGVhckJvYXJkIiwiZ2V0TGVkQ2xvY2tDb21tYW5kcyIsImNvbW1hbmRBcnJheXNFcXVhbCIsImJsYWNrQ2xvY2siLCJ3aGl0ZUNsb2NrIiwiZGlzdGluY3RDb2xvcnMiLCJnZXRDbG9ja0xlZENvbW1hbmQiLCJjZWlsIiwibGVkc0FzQml0cyIsImxlZFNhdGUiLCJjb21tYW5kSXNDb21wbGV0ZSIsInByb2Nlc3NDb21tYW5kIiwicHJvY2Vzc1Bvc2l0aW9uUmVwb3J0IiwiZ2V0Q29sb3JGcm9tTmliYmxlIiwiZ2V0UGllY2VGcm9tTmliYmxlIiwiQkVFUCIsIk9QUE9ORU5UX01PVkVEIiwiZ2V0QmVlcENvbW1hbmQiLCJjbWQiLCJzZW5kU3RyaW5nVG9Cb2FyZCIsIkRFVklDRV9OQU1FIiwiV1JJVEVfQ0hBUkFDVEVSSVNUSUMiLCJSRUFEX0NIQVJBQ1RFUklTVElDIiwiSWNoZXNzT25lQmxlQm9hcmQiLCJDb21tYW5kcyIsImxlbmd0aE9mQ29tbWFuZCIsImJvYXJkRnJvbVBvc2l0aW9uRGF0YSIsImlkeEluUG9zaXRpb25EYXRhIiwiY29kZSIsImdldFBpZWNlQ29kZUZyb21Qb3NpdGlvbkRhdGEiLCJsZWRTdGF0ZVRvQ29tbWFuZFN0cmluZyIsImJsaW5rIiwibGVkY2xvY2siLCJib2FyZExlZHMiLCJsZWRTdGF0ZVRvQm9hcmRMZWRzIiwiYWRkQ2xvY2tUb0JvYXJkTGVkcyIsImxlZFBhdHRlcm4iLCJsZWRJbmRleCIsImZpZWxkQ291bnQiLCJib3R0b21SaWdodCIsImJvdHRvbUxlZnQiLCJ0b3BSaWdodCIsInRvcExlZnQiLCJQcm90b2NvbCIsInlQYXJpdHlCeXRlc0ZvciIsInkiLCJ5UGFyaXR5T2siLCJjbWRXaXRob3V0UGFyaXR5IiwicmVtb3ZlWVBhcml0eSIsImNvbXB1dGVYUGFyaXR5IiwiYWRkUGFyaXR5Qml0IiwicmVtb3ZlWFBhcml0eSIsIlVVSURfU0VSVklDRSIsIlVVSURfQ0hBUkFDVEVSSVNUSUNfUkVDRUlWRSIsIlVVSURfQ0hBUkFDVEVSSVNUSUNfU0VORCIsIk1pbGxlbm5pdW1Cb2FyZCIsImlzRW9uZSIsImVuYWJsZVJDb21tYW5kIiwiaXNNYWduZXRNb2RlIiwibGFzdExlZENvbW1hbmQiLCJ2Q29tbWFuZFJlY2VpdmVkIiwiaXNDb21tYW5kTGV0dGVyIiwib25Db21tYW5kUmVjZWl2ZWQiLCJvblBvc2l0aW9uVXBkYXRlIiwidmVyc2lvblRhZyIsInNlbmRDb21tYW5kQW5kV2FpdCIsInN0YXJ0c1dpdGgiLCJjb25maWd1cmVFb25lRm9yIiwiYmlucG9zIiwibmV3bGluZSIsInNldHRpbmdzIiwiTWlsbGVubml1bUJsZUJvYXJkIiwicGV2ZW50IiwiTWlsbGVubml1bVNlcmlhbEJvYXJkIiwic2V0U2lnbmFscyIsImRhdGFUZXJtaW5hbFJlYWR5IiwiTGVkTGlnaHRlciIsImxlZExpZ2h0VGltZSIsImNsZWFyQWxsIiwibGVkTGlnaHRUaW1lTXMiLCJzbGVlcFJlc29sdmVyIiwiY2FuY2VsUGF0dGVyblJ1bm5lciIsImN1cnJlbnRQYXR0ZXJuUnVubmVyIiwic3RhcnQiLCJzdG9wIiwiY3VycmVudExlZFN0YXRlIiwibGl0RmllbGRzIiwicnVuUGF0dGVybiIsImdldEN1cnJlbnRMZWRTdGF0ZSIsIlN0YXVudG9uQ2xvY2siLCJyZXNldFRpbWVyIiwicmlnaHRDb2xvciIsImxlZnRTaWRlQ29sb3IiLCJjbG9ja0lzUnVubmluZyIsImNvbG9yUnVubmluZyIsIlN0YXVudG9uQm9hcmQiLCJsZWRTZXJpYWxpemVyIiwibGVkTGlnaHRlciIsIlRBUE5TRVRfQURBUFRFUiIsImdldE5pYmJsZUZyb21Qb3NpdGlvbkRhdGEiLCJnZXRQaWVjZUZyb21Qb3NpdGlvbkRhdGEiLCJuaWJibGVJZHgiLCJpc0hpZ2hOaWJibGUiLCJwYXJzZUlucHV0RGF0YSIsIl9kYXRhIiwiU3RhdW50b25IaWRCb2FyZCIsIllpemhpQm9hcmQiLCJwcm9jZXNzTWVzc2FnZSIsIkNIQVJBQ1RFUklTVElDIiwiWWl6aGlCbGVCb2FyZCIsIkhpZE1hbmFnZXIiLCJnZXREZXZpY2VJZCIsInRyeVJlY29ubmVjdCIsInByb2R1Y3RJZCIsIlNlcmlhbE1hbmFnZXIiLCJzZXJpYWwiLCJyZXF1ZXN0UG9ydCIsImdldFBvcnRJZCIsImdldFBvcnRzIiwicG9ydHMiLCJyZWNvbm5lY3RUb1BvcnQiLCJnZXRJbmZvIiwidXNiUHJvZHVjdElkIiwidXNiVmVuZG9ySWQiLCJyZWNvbm5lY3RJblByb2dyZXNzIiwiY2F0Y2giLCJJY2hlc3NPbmVTZXJpYWxCb2FyZCIsIkFGVEVSX1NFTkRfUEFVU0VfTVMiLCJTdGF1bnRvbkJsZUJvYXJkIiwiY3VycmVudElucHV0RGF0YSIsImNvbnZlcnREYXRhVG9IaWRGb3JtYXQiLCJuaWJibGUxIiwiYXNjaWlUb05pYmJsZSIsImFzY2lpIiwiUGhvZW5peEJvYXJkIiwicGhvZW5peE1hbmFnZXIiLCJzZW5kTWVzc2FnZSIsInBheWxvYWQiLCJQaG9lbml4Q29ubmVjdGlvbk1hbmFnZXIiLCJvblVua25vd25CYWNrZ3JvdW5kRXZlbnQiLCJwaG9lbml4TWVzc2FnZSIsIm9uUGhvZW5peFNvY2tldENsb3NlZCIsIm9uUGhvZW5peFNvY2tldENvbm5lY3RlZCIsIm9uUGhvZW5peFNvY2tldEVycm9yIiwib25QaG9lbml4TWVzc2FnZSIsInBob2VuaXhTaXRlTWFuYWdlciIsImNvbm5lY3RUb0JvYXJkUmVzb2x2ZXIiLCJzZXRPcHRpb25zIiwic2VuZFRvQmFja2VuZCIsImV4aXRBcHAiLCJzb3VuZEZpbGUiLCJnZXRTb3VuZEZpbGVGb3JFdmVudCIsIktOT0NLIiwiQ2hlc3NVcEJvYXJkIiwicm9va1RvdWNoZWRDb3VudGVyIiwicGVuZGluZ1Byb21vdGlvbk1vdmUiLCJ3YWl0Rm9yQm9hcmRQb3NpdGlvbiIsImZlblVpbnQ4IiwiZmVuMlVpbnQ4IiwiZW5jb2RlciIsImZlbkFycmF5IiwiaGFsZk1vdmVzIiwibW92ZXMiLCJnYW1lU3RhcnRlZCIsInN0YXJ0R2FtZSIsInNlbmRNb3ZlVG9Cb2FyZCIsInNlbmRHYW1lU2V0dGluZ3MiLCJLSU5HX01PVkVTX1RXT19GSUVMRFMiLCJmaWVsZFRvSW5kZXgiLCJjb21wbGV0ZVByb21vdGlvbiIsImluZGV4VG9GaWVsZCIsIm9uUGllY2VUb3VjaGVkIiwib25DYXN0bGVDaGVzczk2MEZyb21Cb2FyZCIsIm9uTW92ZUZyb21Cb2FyZCIsImgxIiwiYTEiLCJoOCIsImE4Iiwib25QYXduUHJvbW90aW9uRnJvbUJvYXJkIiwiY2hlc3N1cFBpZWNlIiwid2VQbGF5V2hpdGUiLCJDaGVzc1VwQmxlQm9hcmQiLCJkYXRhRXZlbnQiLCJiYXR0ZXJ5TGlzdGVuZXIiLCJjb25uZWN0aW9uU3RlcHMiLCJiYXR0ZXJ5Q2hhbm5lbCIsIkNlcnRhYm9BcHBCb2FyZCIsImdldENoYW5uZWxJZHMiLCJnZXREZXZpY2VOYW1lU3Vic3RyaW5nIiwiX29wdGlvbnMiLCJnZXRNYXhNZXNzYWdlU2l6ZSIsImdldE1pbk1pbGxzQmV0d2VlblNlbmRzIiwiZ2V0U2VyaWFsU2V0dGluZ3MiLCJuZWVkc1NpbmdsZUJ5dGVTZW5kcyIsIkFwcENvbm5lY3Rpb25NYW5hZ2VyIiwiQ2hlc3NudXRBcHBCb2FyZCIsIk1pbGxlbm5pdW1BcHBCb2FyZCIsIkljaGVzc09uZUFwcEJvYXJkIiwiQ2hlc3NVcEFwcEJvYXJkIiwiU3RhdW50b25BcHBCb2FyZCIsIlVTQiIsIllpemhpQXBwQm9hcmQiLCJQZWdhc3VzQXBwQm9hcmQiLCJEZ3RBcHBCb2FyZCIsInNlcnZpY2VVdWlkIiwiREdUX1JFVkVMQVRJT05fSUkiLCJDb25uZWN0aW9uTWFuYWdlckZhY3RvcnkiLCJjcmVhdGVDb25uZWN0aW9uTWFuYWdlciIsImNyZWF0ZU5ld0JsdWV0b290aENvbm5lY3Rpb25NYW5hZ2VyIiwiY3JlYXRlTmV3VXNiQ29ubmVjdGlvbk1hbmFnZXIiLCJQSE9FTklYIiwiQVBQIiwiY3JlYXRlTmV3QXBwQ29ubmVjdGlvbk1hbmFnZXIiLCJNSUxMRU5OSVVNIiwiVEFCVVRST05JQyIsIkRHVCIsIkRHVF9QRUdBU1VTIiwiSUNIRVNTT05FIiwiWUlaSEkiLCJTVEFVTlRPTiIsIkNIRVNTVVAiLCJTYWZlSW50ZXJ2YWwiLCJpbnRlcnZhbElkIiwiaXNSdW5uaW5nIiwiaW50ZXJ2YWxNcyIsImNoZWNrQWN0aXZlIiwiRGVidWdDbG9jayIsIm1lc3NhZ2VQYXNzZXIiLCJsZWRDbG9jayIsIkRlYnVnQm9hcmQiLCJwb2xsaW5nSW50ZXJ2YWwiLCJzdGFydFBvbGxpbmciLCJNYWduZXRpY0RlYnVnQm9hcmQiLCJyZmlkUG9zIiwiRGVidWdCb2FyZENvbm5lY3Rpb25NYW5hZ2VyIiwiX21lc3NhZ2VQYXNzZXIiLCJpc01hZ25ldEJvYXJkIiwibWV0aG9kIiwicmVxdWVzdE9wdGlvbnMiLCJoZWFkZXJzIiwiUmVzcG9uc2UiLCJnZXRMaWNoZXNzVXNlcm5hbWUiLCJhcGlVUmwiLCJzdGF0dXMiLCJqc29uIiwidXNlcm5hbWUiLCJCVVRUT05fQlJPV04iLCJIdG1sSGVscGVyIiwic2l0ZW1hbmFnZXIiLCJidXR0b25Db2xvckJyb3duIiwiZmluZE9yQ3JlYXRlSHRtbEVsZW1lbnRzIiwiY29ubmVjdEJ1dHRvbiIsIm1lc3NhZ2VEaXYiLCJhbGlnbkl0ZW1zIiwiY29ubmVjdEJ1dHRvblNtYWxsIiwiZmxleERpcmVjdGlvbiIsImdldENvbm5lY3RCdXR0b25UZXh0IiwiYm9yZGVyUmFkaXVzIiwicGFkZGluZ1RvcCIsImJvcmRlciIsImluaXRJMThuIiwiaW5zdGFsbFZpcnR1YWxLZXlib2FyZCIsImJhc2VVcmwiLCJjY0luc3RhbGxWaXJ0dWFsS2V5Ym9hcmQiLCJiYWNrZ3JvdW5kIiwiZ2V0U2Vzc2lvbkRhdGEiLCJ3YXNDb25uZWN0ZWQiLCJvbmx5SW5Mb2dGaWxlIiwic2V0QnV0dG9uSWNvbiIsImJhdHRlcnlJY29uIiwidXNlc09mZmljaWFsQXBpIiwiYmF0dGVyeUljb25Bc0h0bWwiLCJOT05FIiwiaXNJbkRvbSIsIkJMRV9ERVZJQ0VfTkFNRSIsIkRndDMwMDBHYXRld2F5IiwiY2FsbGVkQnlVc2VyIiwiY29tbWFuZENoYXJhY3RlcmlzdGljIiwicmVjb25uZWN0SW50ZXJ2YWwiLCJpc1JlY29ubmVjdFRyeUFjdGl2ZSIsImlzUmVjb25uZWN0U2VydmljZVN0YXJ0ZWQiLCJsYXN0Q29tbWFuZElkIiwiaW5pdENsb2NrIiwicGFpck5ld0RldmljZSIsImRldmljZUF2YWlsYWJsZSIsImNoYXJhY3RlcmlzdGljUHJvdG9jb2xWZXJzaW9uIiwicmVhZFZhbHVlIiwiY2hhcmFjdGVyaXN0aWNOb3RpZmljYXRpb25zIiwiaGFuZGxlQ2xvY2tFdmVudCIsIndoaXRlSXNMZWZ0T25DbG9jayIsImxlZnRJc0NvdW50aW5nRG93biIsInJpZ2h0SXNDb3VudGluZ0Rvd24iLCJzZW5kVG9HYXRld2F5IiwibGVmdE1vZGUiLCJsZWZ0SG91cnMiLCJsZWZ0TWludXRlcyIsImxlZnRTZWNvbmRzIiwicmlnaHRNb2RlIiwicmlnaHRIb3VycyIsInJpZ2h0TWludXRlcyIsInJpZ2h0U2Vjb25kcyIsIndyaXRlVmFsdWUiLCJwcm9jZXNzQnV0dG9uRXZlbnQiLCJpc1JlcGVhdCIsIlRhcG5TZXRIaWRDbG9jayIsInNlbmREYXRhVG9DbG9jayIsImF2YWlsYWJsZSIsImRldmljZUlkIiwic2Nhbk9wdGlvbnMiLCJNRU5VX0lEIiwiQlVUVE9OX0JPQVJEX0lEIiwiQlVUVE9OX1RBUE5TRVRfSUQiLCJCVVRUT05fREdUMzAwMF9HQVRFV0FZX0lEIiwiQlVUVE9OX0hPTUVfUE9TSVRJT05fSUQiLCJDb25uZWN0TWVudSIsImluc3RhbmNlIiwiX2luc3RhbmNlIiwic2hvdyIsImVsZW1lbnQiLCJnZXRIdG1sRWxlbWVudCIsImNyZWF0ZUFjdGlvbnMiLCJtZW51UmVjdCIsImdldEJvdW5kaW5nQ2xpZW50UmVjdCIsIm1lbnVXaWR0aCIsIm1lbnVIZWlnaHQiLCJ2aWV3cG9ydFdpZHRoIiwiaW5uZXJXaWR0aCIsInZpZXdwb3J0SGVpZ2h0IiwiaW5uZXJIZWlnaHQiLCJwYWdlWCIsInBhZ2VZIiwiY3JlYXRlTWVudSIsImJ1dHRvblN0eWxlIiwiaTE4bkNvbm5lY3RUb0NoZXNzYm9hcmQiLCJpMThuQ29ubmVjdFRhcE5zZXQiLCJpMThuQ29ubmVjdERHVDMwMDBHYXRld2F5IiwiaTE4bk1vdmVIb21lUG9zaXRpb24iLCJjbGFzc05hbWUiLCJwYWRkaW5nIiwiYm94U2hhZG93IiwiZ2FwIiwiY29udGFpbnMiLCJib2FyZEJ1dHRvbiIsImNyZWF0ZUFjdGlvbiIsInRhcG5zZXRCdXR0b24iLCJkaXNhYmxlZCIsImRndDMwMDBHYXRld2F5QnV0dG9uIiwiREdUMzAwMF9HQVRFV0FZIiwiaG9tZVBvc2l0aW9uQnV0dG9uIiwiYWN0aW9uIiwic3RvcFByb3BhZ2F0aW9uIiwiQ09OTkVDVElPTl9NQU5BR0VSX0ZBQ1RPUlkiLCJTaXRlTWFuYWdlciIsImdldFNlc3Npb25EYXRhUHJvbWlzZSIsImNoYW5uZWxDb25uZWN0aW9uUmVzb2x2ZWQiLCJyYW5kb20iLCJhcGlVcmxzIiwiZGVidWdCb2FyZE1lc3NhZ2VQYXNzZXIiLCJxIiwiZGVidWdCb2FyZE1lc3NhZ2UiLCJicm9hZGNhc3RIYW5kbGVyIiwiY2hhbm5lbENvbm5lY3RlZFJlc29sdmVyIiwiZ2xvYmFsT3B0aW9ucyIsIm9wdGlvbnNSZXNvbHZlciIsInNlc3Npb25EYXRhIiwiZ2V0U2Vzc2lvbkRhdGFSZXNvbHZlciIsImFueWJvZHlDb25uZWN0ZWRSZXNvbHZlciIsImkxOG5JZCIsImkxOG5BbnN3ZXIiLCJodG1sSGVscGVyIiwib3B0aW9uc1Byb21pc2UiLCJjaGFubmVsQ29ubmVjdGVkIiwiQnJvYWRjYXN0Q2hhbm5lbCIsIm9ubWVzc2FnZSIsIm9uT3B0aW9uc1JlY2VpdmVkIiwiY2hlY2tGb3JEZWJ1Z0JvYXJkIiwiZm9yY2VSZWxvYWRPcHRpb25zIiwiaW5pdEZvckFwcEVudmlyb25tZW50IiwiaTE4blF1ZXN0aW9uIiwiaXNEZWJ1Z0JvYXJkUHJlc2VudCIsIm5ld09wdGlvbnMiLCJjb25kaXRpb24iLCJwcm9wZXJ0eSIsInNlbmRTZXNzaW9uRGF0YSIsInNpdGVDbG9ja1N0YXRlIiwiZXZlbnREYXRhIiwidmFsdWVPZiIsInNvdW5kRXZlbnQiLCJvbkNvbm5lY3RCdXR0b25QcmVzc2VkIiwiYW5vdGhlclRhYklzQWN0aXZlIiwidXNlckFnZW50IiwiaXNJbnZhbGlkQ29ubmVjdGlvblR5cGUiLCJfdG9rZW4iLCJzYXZlUGFzc3dvcmRzIiwicGFzc3dvcmQiLCJwbGF5ZXJJc1doaXRlIiwiR2FtZVN0YXR1c0NvZGUiLCJTdHJlYW1PYnNlcnZlciIsImlzU3RvcHBlZCIsInByb2Nlc3NMaW5lIiwic2V0QXBpVG9rZW4iLCJBdXRob3JpemF0aW9uIiwib2siLCJzdGF0dXNUZXh0IiwibWF0Y2hlciIsImRlY29kZXIiLCJidWYiLCJmaW5pc2hlZCIsInJlYWRSZXN1bHQiLCJzdHJlYW0iLCJwYXJ0cyIsInBvcCIsImdldFBvc2l0aW9uRnJvbUdhbWVTdGF0ZSIsInN0YXJ0aW5nUG9zaXRpb24iLCJ1Y2lNb3ZlcyIsImV4dHJhY3RNb3Zlc0Zyb21HYW1lU3RhdGUiLCJnZXRMYXN0TW92ZUNvbG9yRnJvbUdhbWVTdGF0ZSIsImdldENsb2NrU3RhdGVGcm9tR2FtZVN0YXRlIiwid3RpbWUiLCJidGltZSIsImNyZWF0ZWQiLCJzdGFydGVkIiwiYWJvcnRlZCIsIm5vU3RhcnQiLCJ1bmtub3duRmluaXNoIiwidmFyaWFudEVuZCIsImRyYXciLCJzdGFsZW1hdGUiLCJtYXRlIiwicmVzaWduIiwib3V0b2Z0aW1lIiwiY2hlYXQiLCJ3aW5uZXIiLCJnZXRHYW1lUmVzdWx0IiwiZ2V0TmV4dE1vdmVDb2xvckZyb21HYW1lU3RhdGUiLCJnZXRDbG9ja1J1bm5pbmdGb3JQbGF5ZXIiLCJnZXRMaWZlY3ljbGVTdGF0ZSIsInByb2Nlc3NUb2tlblJlc3BvbnNlIiwiZXJyb3JfZGVzY3JpcHRpb24iLCJoaW50IiwiZXhwaXJlc19pbiIsImV4cGlyZXNfYXQiLCJhY2Nlc3NfdG9rZW4iLCJyZWZyZXNoX3Rva2VuIiwiQ0xJRU5UX0lEIiwiUkVESVJFQ1RfVVJMIiwiZ2V0Q3VycmVudFVzZXIiLCJjbGllbnRJZCIsImlzVG9rZW5FeHBpcmVkIiwicmVzcG9uc2VPYmplY3QiLCJyZW5ld1Rva2VuIiwiTGljaGVzc01hbmFnZXIiLCJTSVRFTkFNRSIsIk0ya1RvdXJuYW1lbnRSZXBvcnRlciIsInVzZXJJZCIsImdhbWVkSWQiLCJpbnRlcnZhbFRpbWVvdXQiLCJnYW1lSWQiLCJyZXBvcnRNb3ZlIiwicGxheWluZyIsImdhbWUiLCJMaWNoZXNzQXBpQm9hcmQiLCJhcGlVcmwiLCJnZXRHYW1lSWQiLCJjcmVhdGVBcGlFdmVudE9ic2VydmVyIiwiYXBpT2JzZXJ2ZXIiLCJvbkFwaUV2ZW50UmVjZWl2ZWQiLCJsb2NhdGlvbiIsImhyZWYiLCJjcmVhdGVHYW1lT2JzZXJ2ZXIiLCJpc00ya1RvdXJuYW1lbnQiLCJzb3VyY2UiLCJpc00ya0FyZW5hIiwidG91cm5hbWVudElkIiwiaXNNMmtTd2lzcyIsInN3aXNzSWQiLCJtMmtUb3VybmFtZW50UmVwb3J0ZXIiLCJnZXRVc2VySWQiLCJhcmVuYUlkIiwiZnVsbE5hbWUiLCJnYW1lT2JzZXJ2ZXIiLCJvbkJvYXJkRGF0YVJlY2VpdmVkIiwiZnVsbERhdGEiLCJpbml0aWFsRmVuIiwidmFyaWFudCIsImluaXRpYWwiLCJ1c2VySXNXaGl0ZSIsInN0YXRlRGF0YSIsInNheU1vdmVGcm9tR2FtZVN0YXRlIiwicHJldmlvdXMiLCJsYXN0QmxhbmsiLCJwcmV2aW91c0dhbWVTdGF0ZSIsImdldENhc3RsZUZvcm1hdCIsIlBvaW50IiwieCIsIkh0bWxDbGlja2VyIiwiZGlzcGF0Y2hQb2ludGVyRXZlbnQiLCJwb2ludCIsIlBvaW50ZXJFdmVudCIsImJ1YmJsZXMiLCJjYW5jZWxhYmxlIiwidmlldyIsImNsaWVudFgiLCJjbGllbnRZIiwiY2VudGVyT2ZFbGVtZW50IiwibWFrZU1vdXNlQ2xpY2siLCJldmVudFR5cGUiLCJjZW50ZXJPZkZpZWxkIiwiYm9hcmRFbGVtZW50IiwiYmxhY2tJc09uVG9wIiwicmVjdCIsInNxdWFyZVdpZHRoIiwic3F1YXJlSGVpZ2h0IiwiZnV6enlYIiwiZnV6enlZIiwiSHRtbFBvc2l0aW9uV2F0Y2hlciIsInBvc2l0aW9uQ29uZmlybUNvdW50IiwicGxheWVyTW92ZUluUHJvZ3Jlc3MiLCJsYXN0UG9zaXRpb24iLCJsYXN0VW5jb25maXJtZWRQb3NpdGlvbiIsImludGVuZGVkVXNlclBvc2l0aW9uIiwiYm9hcmRDaGVja0ludGVydmFsbCIsImxhc3RHYW1lUmVzdWx0IiwiYm9hcmRDaGVja0ludGVydmFsbEFjdGl2ZSIsImxhc3RQcm9jZXNzZWRQb3NpdGlvbiIsIm5leHRDb25maXJtZWRQb3NpdGlvblJlc29sdmVycyIsImxhc3RLbm93blVybCIsImRvQm9hcmRDaGVjayIsIkNIRUNLX0JPQVJEX0lOVEVSVkFMX01TIiwiaGFzIiwiZ2V0Q2xvY2tTdGF0ZSIsImdldFBvc2l0aW9uIiwidXJsMSIsInVybDIiLCJ1MSIsIlVSTCIsInUyIiwicHJvdG9jb2wiLCJob3N0IiwicGF0aG5hbWUiLCJ1cmxQYXRoc0FyZUVxdWFsIiwibGFzdE1vdmVXYXNPcHBvbmVudCIsImNvbmZpcm1lZCIsIlBPU0lUSU9OX0NPTkZJUk1fVEhSRVNIT0xEIiwiZ2V0TmV4dENvbmZpcm1lZFBvc2l0aW9uIiwiTGljaGVzc0h0bWxQb3NpdGlvbldhdGNoZXIiLCJjZ0JvYXJkIiwicXVlcnlTZWxlY3RvciIsInF1ZXJ5U2VsZWN0b3JBbGwiLCJnZXRDb2xvck9mUGllY2UiLCJwaWVjZVR5cGUiLCJnZXRUeXBlT2ZQaWVjZSIsImdldEZpZWxkT2ZQaWVjZSIsImxhc3RNb3ZlIiwibGFzdE1vdmVDb2xvciIsImNsYXNzZXMiLCJib2FyZFJlY3QiLCJwaWVjZVJlY3QiLCJib3R0b20iLCJMaWNoZXNzSHRtbEJvYXJkIiwicG9zaXRpb25XYXRjaGVyIiwiZ2V0VmFsaWRQb3NpdGlvbiIsInNlY3NEZWxheSIsInBpZWNlQ2xhc3MiLCJzZWxlY3RvciIsInByb21FbGVtZW50IiwicGFyZW50IiwicnVuUG9zaXRpb25XYXRjaGVyIiwiZmxhZyIsIkJVVFRPTl9OT1RfQ09OTkVDVEVEX0JST1dOIiwidmFsaWRUb2tlbiIsIm1hcmdpbiIsImFkZFRvTGljaGVzcyIsInJlZGlyZWN0VG9Mb2dpbklmTmVjY2Vzc2FyeSIsIlVSTFNlYXJjaFBhcmFtcyIsInNlYXJjaCIsInZlcmlmaWVyIiwib0F1dGhWZXJpZmllciIsInJlZGlyZWN0VXJsIiwiaXNVc2VyTG9nZ2VkSW4iLCJjYW5Eb09hdXRoIiwiYXJyYXlCdWZmZXIiLCJjcnlwdG8iLCJnZXRSYW5kb21WYWx1ZXMiLCJjb2RlQ2hhbGxlbmdlIiwiaGFzaEJ1ZmZlciIsInN1YnRsZSIsImRpZ2VzdCIsImVuY29kZVVSSUNvbXBvbmVudCIsImFwaUJvYXJkIiwiY3JlYXRlU2l0ZWJvYXJkcyIsInJlc3RvcmVQYXNzd29yZHMiLCJlbmFibGVQYXNzd29yZFNhdmluZyIsImNoZWNrQXBpVG9rZW4iLCJvZmZzZXRXaWR0aCIsImNvbnRhaW5lciIsImh0bWxCb2FyZCIsImlzR2FtZVByZXNlbnQiLCJfc3RhcnRCb2FyZCIsIl9lbmRCb2FyZCIsImZvcm0iLCJ1c2VySW5wdXQiLCJwYXNzd29yZElucHV0IiwiY29tcG9zZWQiLCJwcmV2ZW50RGVmYXVsdCIsInN1Ym1pdEV2ZW50IiwiZ2V0Qm9hcmRFbGVtZW50IiwiZWxlbWVudHMiLCJnZXRFbGVtZW50c0J5Q2xhc3NOYW1lIiwiQ2hlc3Njb21NYW5hZ2VyIiwid2FzRm9jdXNNb2RlIiwic2lkZWJhcldhc0NvbGxhcHNlZCIsImFkZFRvQ2hlc3NDb20iLCJnZXRFbGVtZW50c0J5VGFnTmFtZSIsImlzRm9jdXNNb2RlIiwiZm9jdXNNb2RlQ2hhbmdlZCIsInNpZGViYXJJc0NvbGxhcHNlZCIsInNpZGViYXIiLCJzaWRlYmFyQ2hhbmdlZCIsImlzQ29sbGFwc2VkIiwiZm9udFNpemUiLCJpc0FwaUNvbm5lY3Rpb25Fc3RhYmxpc2hlZCIsIm1vdmVNZXRob2QiLCJmb3JtcyIsInN1Ym1pdCIsInZpc2libGVVc2VybmFtZSIsInZpc2libGVQYXNzd29yZCIsImhpZGRlblVzZXJuYW1lIiwiaGlkZGVuUGFzc3dvcmQiLCJzZXRBdHRyaWJ1dGUiLCJDSEFOTkVMIiwiUEFSQU1fQk9BUkQiLCJQQVJBTV9DT05ORUNUSU9OIiwicGhvZW5peFNvY2tldCIsInNlbmRPcHRpb25zIiwiaGFuZGxlR2V0U2Vzc2lvbkRhdGEiLCJoYW5kbGVTZXRTZXNzaW9uRGF0YSIsImhhbmRsZUkxOG5SZXF1ZXN0IiwiZ2V0U291bmRVcmxGb3JFdmVudCIsImhhbmRsZVNvdW5kRXZlbnQiLCJoYW5kbGVTYXlSZXF1ZXN0IiwiV2ViU29ja2V0IiwiaGFuZGxlRGVidWdCb2FyZFF1ZXN0aW9uIiwib25DaGFuZ2VkIiwiYWRkTGlzdGVuZXIiLCJhcGlUb2tlbjIiLCJ1c2VyTmFtZTIiLCJhcGlUb2tlbjMiLCJ1c2VyTmFtZTMiLCJtaWdyYXRlQXBpVG9rZW5zIiwib3B0aW9uc0NoYW5nZWQiLCJzZXRPcHRpb25zRnJvbVNlYXJjaFBhcmFtcyIsInNlYXJjaFBhcmFtcyIsIm9wdGlvbkV2ZW50Il0sInNvdXJjZVJvb3QiOiIifQ==