// ==UserScript==
// @name         [Core] CCO 自定義工具核心模組
// @namespace    -
// @version      0.1
// @description  RT
// @author       CCO Project
// @include      https://cybercodeonline.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=cybercodeonline.com
// @license      MIT
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function () {
    console.clear = () => { };

    if (JSON.__original_stringify === undefined) {
        JSON.__original_stringify = JSON.stringify;
        JSON.__listener_stringify = [];

        JSON.stringify = function (value, replacer, space) {
            JSON.__listener_stringify.forEach(listener => {
                const temp = listener(value, replacer, space);

                if (temp !== undefined) {
                    value = temp;
                }
            });

            return JSON.__original_stringify(value, replacer, space);
        };
    }

    if (window.__original_WebSocket === undefined) {
        const allMethod = ["send", "close", "onopen", "onmessage", "onclose", "onerror"];
        allMethod.forEach(method => {
            window[`__listener_WebSocket_${method}`] = [];
        });

        window.__original_WebSocket = window.WebSocket;
        window.WebSocket = function (url, protocols) {
            const ws = new window.__original_WebSocket(url, protocols);

            allMethod.forEach(method => {
                const id = setInterval(() => {
                    if (ws[method] !== null) {
                        clearInterval(id);
                        ws[`__original_${method}`] = ws[method];

                        ws[method] = function (...args) {
                            window[`__listener_WebSocket_${method}`].forEach(listener => {
                                listener(...args);
                            });

                            return ws[`__original_${method}`](...args);
                        };
                    }
                }, 1);
            });

            return ws;
        };
    }

    window.__CCO_CORE_INITIALIZED = true;
})();

