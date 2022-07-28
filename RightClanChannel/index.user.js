// ==UserScript==
// @name         CCO: 右側切換公會頻道
// @namespace    -
// @version      0
// @description  讓右側區塊可以切換公會頻道，方便邊做事邊聊天
// @author       CCO Project
// @include      https://cybercodeonline.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=cybercodeonline.com
// @license      MIT
// @grant        none
// @grant        GM_addStyle
// @run-at       document-start
// ==/UserScript==

const clanMessageTemplate = {
    "text": "你們玩真兇",
    "windowType": "CLAN",
    "channelId": "zh",
    "cid": "m6q8pL",
    "a0": "=QDIkVubKGFe2GV6y5kZC8hKxP5wx3qMrq0EZuj8aKkZilLBP9",
    "a1": "+au1L5vi3e9ci0NR126sE="
};

const globalMessageTemplate = {
    "text": "送樓下 7 個黃箱",
    "windowType": "GLOBAL",
    "channelId": "zh",
    "cid": "CoYuIX",
    "a0": "=QDIkVubKGFe2GV6y5kZC8hKxP5wx3qMrq0EZuj8aKkZilLBP9",
    "a1": "80mrxdqgLj2N3rC3WSf4s="
};

(function () {
    const id = setInterval(() => {
        if (window.__CCO_CORE_INITIALIZED === true) {
            clearInterval(id);

            JSON.__listener_stringify.push(function (value, replacer, space) {
                console.info(value);
            });
        }
    }, 1);

    function initUi() {
        const id = setInterval(() => {
            const rightPanel = document.querySelector("ion-menu[side='end']");
        }, 1);
    }
})();