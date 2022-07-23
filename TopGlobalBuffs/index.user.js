// ==UserScript==
// @name         [Module] CCO: 中間頁上方顯示全球增益
// @namespace    -
// @version      0.1
// @description  在中間頁上方顯示全球增益，減少確認增益時的操作
// @author       CCO Project
// @include      https://cybercodeonline.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=cybercodeonline.com
// @license      MIT
// @grant        GM_addStyle
// @run-at       document-start
// ==/UserScript==

(function () {
    const GlobalBuffsTypeMap = {
        "突觸": {
            lang: {
                en: "Syna.",
                zh: "突觸"
            },
            ids: ["TIME_REDUCTION_GLOBAL_STACKABLE", "TIME_REDUCTION_GLOBAL_STACKABLE_2"],
            max: 80
        },
        "額葉": {
            lang: {
                en: "Fntl.",
                zh: "額葉"
            },
            ids: ["EXP_MULTIPLIER_GLOBAL"],
            max: 80
        },
        "交易": {
            lang: {
                en: "Trade",
                zh: "交易"
            },
            ids: ["BTC_MULTIPLIER_GLOBAL"],
            max: 100
        },
        "校準": {
            lang: {
                en: "Cali.",
                zh: "校準"
            },
            ids: ["UPGRADE_CHANCE_GLOBAL_1", "UPGRADE_CHANCE_GLOBAL_2", "UPGRADE_CHANCE_GLOBAL_3", "UPGRADE_CHANCE_GLOBAL_4", "UPGRADE_CHANCE_GLOBAL_5"],
            max: 666
        },
        "防爆": {
            lang: {
                en: "Prot.",
                zh: "防爆"
            },
            ids: ["UPGRADE_NO_BREAK_GLOBAL"]
        },
        "RNG": {
            lang: {
                en: "RNG",
                zh: "RNG"
            },
            ids: ["RNG_INTERFERER"]
        }
    };

    const GlobalBuffsIdMap = {
        TIME_REDUCTION_GLOBAL_STACKABLE: {
            type: "突觸",
            each: 5,
            limit: 80
        },
        TIME_REDUCTION_GLOBAL_STACKABLE_2: {
            type: "突觸",
            each: 40,
            limit: 80
        },
        EXP_MULTIPLIER_GLOBAL: {
            type: "額葉",
            each: 40,
            limit: 80
        },
        BTC_MULTIPLIER_GLOBAL: {
            type: "交易",
            each: 40,
            limit: 100
        },
        UPGRADE_CHANCE_GLOBAL_1: {
            type: "校準",
            each: 5,
            limit: 666
        },
        UPGRADE_CHANCE_GLOBAL_2: {
            type: "校準",
            each: 10,
            limit: 20
        },
        UPGRADE_CHANCE_GLOBAL_3: {
            type: "校準",
            each: 50,
            limit: 100
        },
        UPGRADE_CHANCE_GLOBAL_4: {
            type: "校準",
            each: 100,
            limit: 200
        },
        UPGRADE_CHANCE_GLOBAL_5: {
            type: "校準",
            each: 300,
            limit: 600
        },
        UPGRADE_NO_BREAK_GLOBAL: {
            type: "防爆",
            each: 100,
            limit: 100
        },
        RNG_INTERFERER: {
            type: "RNG",
        }
    };

    const id = setInterval(() => {
        if (unsafeWindow.__CCO_CORE_INITIALIZED === true) {
            clearInterval(id);
            unsafeWindow.__listener_WebSocket_onmessage.push(getAllBuffs);
        }
    }, 1);

    const LANG = unsafeWindow.localStorage.getItem("lang") === "TAIWAN" ? "zh" : "en";
    const intervalIds = [];
    const timeoutIds = [];
    initUi();

    class Buff {
        /**
         * @param {boolean} isShort
         * @param {string} id
         * @param {string} name
         * @param {number} endTime
         * @param {number} [stack]
         * @param {number} [percent]
         */
        constructor(isShort, id, name, endTime, stack = -1, percent = -1) {
            this.isShort = isShort;
            this.id = id;
            this.name = name;
            this.endTime = endTime;

            if (isShort === false) {
                this.percent = percent;
                this.stack = stack;
            }
        }
    }

    /**
     * 介面初始化
     */
    function initUi() {
        const id = setInterval(() => {
            /** @type {HTMLElement} */
            const mainPanel = document.querySelector("#main");

            if (mainPanel) {
                clearInterval(id);

                const buffsArea = document.createElement("div");
                let mainOffsetLeft = 0;
                setInterval(() => {
                    if (mainPanel.offsetLeft != mainOffsetLeft) {
                        mainOffsetLeft = mainPanel.offsetLeft;
                        buffsArea.style.left = `${mainOffsetLeft}px`;
                    }
                }, 1);

                buffsArea.style.cssText = "position: absolute; padding: 8px;";
                buffsArea.classList.add("global-buffs-area");

                mainPanel.style.cssText = "margin-top: 50px; border-top: 1px dashed gray";
                mainPanel.insertAdjacentElement("beforebegin", buffsArea);
            }
        }, 1);
    }

    /**
     * 更新全球效應狀態
     * 
     * @param {Buff[]} buffs
     */
    function updateUi(buffs) {
        /** @type {HTMLElement} */
        const buffsArea = document.querySelector(".global-buffs-area");
        /** @type {HTMLElement} */
        const mainPanel = document.querySelector("#main");
        let maxCombo = 0;

        buffsArea.innerHTML = "";
        timeoutIds.forEach(e => clearTimeout(e));
        timeoutIds.length = 0;
        intervalIds.forEach(e => clearInterval(e));
        intervalIds.length = 0;

        Object.entries(GlobalBuffsTypeMap).forEach(([type, value]) => {
            const intersectionBuffs = buffs.filter(buff => value.ids.includes(buff.id));

            const combo = [];
            const time = [];
            let totalPercent = 0;
            let showFlag = false;

            intersectionBuffs.forEach(buff => {
                const diffMs = buff.endTime - Date.now();
                timeoutIds.push(setTimeout(_ => updateUi(buffs), diffMs));

                if (diffMs > 0) {
                    showFlag = true;
                    time.push(buff.endTime);

                    if (buff.isShort === false) {
                        const thisPercent = ("  " + GlobalBuffsIdMap[buff.id].each).substr(-3).replace(/\ /g, "&nbsp;");
                        const comboInfo = `[${thisPercent}%] x${buff.stack}`;
                        combo.push(comboInfo);
                        totalPercent += buff.percent;
                        totalPercent = Math.min(totalPercent, value.max);
                    }
                }
            });

            maxCombo = Math.max(maxCombo, combo.length);

            if (showFlag === false) {
                return;
            }

            if (intersectionBuffs.length > 0) {
                let ge;
                if (value.max) {
                    ge = getGlobalEffectElement(value.lang[LANG], time, {
                        percent: totalPercent,
                        combos: combo
                    });
                } else {
                    ge = getGlobalEffectElement(value.lang[LANG], time, {
                        isShort: true
                    });
                }

                intervalIds.push(ge.intervalId);
                buffsArea.insertAdjacentElement("beforeend", ge.element);
            }
        });

        const marginTop = Math.max((maxCombo - 1) * 10 + 50, 50);
        mainPanel.style.marginTop = `${marginTop}px`;
    }

    /**
     * 取得所有全球效應（未篩選）
     * 
     * @param {MessageEvent} event
     */
    function getAllBuffs(event) {
        try {
            const message = JSON.parse(event.data);

            if (message.d && message.d.b && message.d.b.p === "code-game/prod/ss") {
                const data = Object.values(message.d.b.d.ste);
                const buffs = [];

                data.forEach(v => {
                    const effectId = v.t;
                    const thisBuff = GlobalBuffsIdMap[effectId];
                    const name = thisBuff ? thisBuff.type : `???`;
                    const stack = v.sa;
                    const duringSeconds = v.d.seconds;
                    const endTime = (
                        t => new Date(v.st).getTime() + (t * 1000)
                    )(duringSeconds);

                    let percent = -1;

                    if (thisBuff && thisBuff.each) {
                        percent = thisBuff.each * stack > thisBuff.limit ? thisBuff.limit : thisBuff.each * stack;
                    }

                    if (["UPGRADE_NO_BREAK_GLOBAL", "RNG_INTERFERER"].includes(effectId)) {
                        buffs.push(new Buff(true, effectId, name, endTime));
                    } else if (effectId.startsWith("UPGRADE_CHANCE_GLOBAL") || effectId.startsWith("TIME_REDUCTION_GLOBAL") || ["EXP_MULTIPLIER_GLOBAL", "BTC_MULTIPLIER_GLOBAL"].includes(effectId)) {
                        buffs.push(new Buff(false, effectId, name, endTime, stack, percent));
                    }
                });

                updateUi(buffs);
            }
        } catch (e) { }
    }

    /**
     * 取得全球效應的 dom
     * 
     * @param {string} name 全球效應類型
     * @param {number[]} endTime 截止時間戳
     * @param {{isShort?: boolean, percent?: number, combos?: string[]}} options 其餘資訊
     * @returns {{element: HTMLElement, intervalId: number}}
     */
    function getGlobalEffectElement(name, endTime, options = {}) {
        const ge = document.createElement("global-effect");
        const gen = document.createElement("ge-name");
        const get = document.createElement("ge-time");

        ge.append(gen, get);
        gen.innerHTML = name;

        get.innerHTML = endTime.map(e => getTimeString(e)).join("<br>");

        if (options.isShort) {
            ge.classList.add("short");
        } else {
            const gep = document.createElement("ge-percent");
            const gec = document.createElement("ge-combo");

            gep.innerHTML = `${options.percent}%`;
            gec.innerHTML = options.combos.join("<br>");
            ge.append(gep, gec);
        }

        const id = setInterval(() => {
            get.innerHTML = endTime.map(e => getTimeString(e)).join("<br>");
        }, 250);

        return {
            element: ge,
            intervalId: id
        };
    }

    /**
     * 取得 mm:ss 的格式字串
     * 
     * @param {number} ms
     * @returns {string}
     */
    function getTimeString(ms) {
        const now = Date.now();
        const diff = Math.floor((ms - now) / 1000);
        const min = ("0" + Math.floor(diff / 60)).substr(-2);
        const sec = ("0" + diff % 60).substr(-2);

        return `${min}:${sec}`;
    }

    GM_addStyle(` 
        .global-buffs-area {
            font-family: Consolas, Menlo, Monaco, Lucida Console, Liberation Mono, DejaVu Sans Mono, Bitstream Vera Sans Mono, Courier New, monospace, serif;
            width: 512px;
            display: inline-block;
            user-select: none;
        }
        
        global-effect {
            position: relative;
            display: inline-block;
            margin-left: 4px;
            background-color: #333;
            border-radius: 4px;
            width: 5.25rem;
            height: 1.5rem;
        }
        
        global-effect.short {
            width: fit-content;
        }
        
        ge-name {
            display: inline-block;
            margin: 0.1rem 2px;
            font-size: 0.8rem;
        }
        
        ge-percent {
            display: inline-block;
            margin: 0.3rem 2px;
            font-size: 0.7rem;
            float: right;
        }
        
        ge-time {
            position: absolute;
            display: inline-block;
            font-size: 0.5rem;
            right: 2px;
            top: 1.5rem;
        }
        
        ge-combo {
            font-family: monospace;
            position: absolute;
            display: inline-block;
            font-size: 0.5rem;
            left: 2px;
            top: 1.5rem;
        }
    `);
})();