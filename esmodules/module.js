import { libWrapper } from "./shim.js";

const MODULE_ID = "pf2e-karmic-dice";
const ROLES = Object.freeze(["none", "player", "trusted", "assistant", "gamemaster"]);

/**
 * Whether a roll is a PF2e check roll. PF2e registers subclasses of CheckRoll (e.g. StrikeAttackRoll for attacks),
 * so walk the prototype chain instead of comparing only the roll's own class name.
 */
function isCheckRoll(roll) {
    for (let cls = roll?.constructor; cls && cls !== Object; cls = Object.getPrototypeOf(cls)) {
        if (cls.name === "CheckRoll") return true;
    }
    return false;
}

Hooks.once("init", () => {
    libWrapper.register(MODULE_ID, "foundry.dice.terms.DiceTerm.prototype.roll", async function (wrapped, options) {
        const oldRoll = await wrapped(options);
        const newRoll = { ...oldRoll };

        if (isCheckRoll(this._root) && game.settings.get(MODULE_ID, ROLES[game.user.role])) {
            const userKarma = game.user.getFlag(MODULE_ID, "karma") ?? { history: [], cumulative: 0 };

            userKarma.history.push(oldRoll.result);
            while (userKarma.history.length > game.settings.get(MODULE_ID, "history.value")) {
                userKarma.history.shift();
            }

            if (this._root.options.heroPoint && game.settings.get(MODULE_ID, "heroPoint.enabled")) {
                if (oldRoll.result <= game.settings.get(MODULE_ID, "heroPoint.threshold")) {
                    newRoll.result = Math.clamp(oldRoll.result + game.settings.get(MODULE_ID, "heroPoint.value"), 1, this.faces);
                }
            } else if (userKarma.history.length === game.settings.get(MODULE_ID, "history.value")) {
                const average = userKarma.history.reduce((a, b) => a + b, 0) / userKarma.history.length;

                if (game.settings.get(MODULE_ID, "lowerThreshold.enabled") && average <= game.settings.get(MODULE_ID, "lowerThreshold.value")) {
                    userKarma.cumulative = ((game.settings.get(MODULE_ID, "nudge.cumulative")) ? userKarma.cumulative + 1 : 1);
                    const nudge = game.settings.get(MODULE_ID, "nudge.value") * userKarma.cumulative;
                    newRoll.result = Math.clamp(oldRoll.result + nudge, 1, this.faces);
                }

                if (game.settings.get(MODULE_ID, "upperThreshold.enabled") && average >= game.settings.get(MODULE_ID, "upperThreshold.value")) {
                    userKarma.cumulative = ((game.settings.get(MODULE_ID, "nudge.cumulative")) ? userKarma.cumulative + 1 : 1);
                    const nudge = game.settings.get(MODULE_ID, "nudge.value") * userKarma.cumulative;
                    newRoll.result = Math.clamp(oldRoll.result - nudge, 1, this.faces);
                }
            }

            if (oldRoll.result != newRoll.result) {
                userKarma.history[userKarma.history.length - 1] = newRoll.result;
                newRoll.originalResult = oldRoll.result;
                this.options.karma = true;
            } else {
                userKarma.cumulative = 0;
            }

            game.user.setFlag(MODULE_ID, "karma", userKarma);
        }

        // Replace the result that was just rolled (normally the last one) with the possibly adjusted copy
        const index = this.results.lastIndexOf(oldRoll);
        this.results[index === -1 ? this.results.length - 1 : index] = newRoll;
        return newRoll;
    });

    game.settings.register(MODULE_ID, "player", {
        name: "USER.RolePlayer",
        scope: "world",
        config: true,
        type: Boolean,
        default: true
    });

    game.settings.register(MODULE_ID, "trusted", {
        name: "USER.RoleTrusted",
        scope: "world",
        config: true,
        type: Boolean,
        default: true
    });

    game.settings.register(MODULE_ID, "assistant", {
        name: "USER.RoleAssistant",
        scope: "world",
        config: true,
        type: Boolean,
        default: true
    });

    game.settings.register(MODULE_ID, "gamemaster", {
        name: "USER.RoleGamemaster",
        scope: "world",
        config: true,
        type: Boolean,
        default: true
    });

    game.settings.register(MODULE_ID, "history.value", {
        name: "pf2e-karmic-dice.settings.history.value.name",
        hint: "pf2e-karmic-dice.settings.history.value.hint",
        scope: "world",
        config: true,
        type: new foundry.data.fields.NumberField({ min: 2, max: 15, step: 1, initial: 5 })
    });

    game.settings.register(MODULE_ID, "lowerThreshold.enabled", {
        name: "pf2e-karmic-dice.settings.lowerThreshold.enabled.name",
        hint: "pf2e-karmic-dice.settings.lowerThreshold.enabled.hint",
        scope: "world",
        config: true,
        type: Boolean,
        default: true,
    });

    game.settings.register(MODULE_ID, "lowerThreshold.value", {
        name: "pf2e-karmic-dice.settings.lowerThreshold.value.name",
        hint: "pf2e-karmic-dice.settings.lowerThreshold.value.hint",
        scope: "world",
        config: true,
        type: new foundry.data.fields.NumberField({ min: 1, max: 20, step: 1, initial: 5 })
    });

    game.settings.register(MODULE_ID, "upperThreshold.enabled", {
        name: "pf2e-karmic-dice.settings.upperThreshold.enabled.name",
        hint: "pf2e-karmic-dice.settings.upperThreshold.enabled.hint",
        scope: "world",
        config: true,
        type: Boolean,
        default: true,
    });

    game.settings.register(MODULE_ID, "upperThreshold.value", {
        name: "pf2e-karmic-dice.settings.upperThreshold.value.name",
        hint: "pf2e-karmic-dice.settings.upperThreshold.value.hint",
        scope: "world",
        config: true,
        type: new foundry.data.fields.NumberField({ min: 1, max: 20, step: 1, initial: 15 })
    });

    game.settings.register(MODULE_ID, "nudge.value", {
        name: "pf2e-karmic-dice.settings.nudge.value.name",
        hint: "pf2e-karmic-dice.settings.nudge.value.hint",
        scope: "world",
        config: true,
        type: new foundry.data.fields.NumberField({ min: 1, max: 10, step: 1, initial: 5 })
    });

    game.settings.register(MODULE_ID, "nudge.cumulative", {
        name: "pf2e-karmic-dice.settings.nudge.cumulative.name",
        hint: "pf2e-karmic-dice.settings.nudge.cumulative.hint",
        scope: "world",
        config: true,
        type: Boolean,
        default: true
    });

    game.settings.register(MODULE_ID, "heroPoint.enabled", {
        name: "pf2e-karmic-dice.settings.heroPoint.enabled.name",
        hint: "pf2e-karmic-dice.settings.heroPoint.enabled.hint",
        scope: "world",
        config: true,
        type: Boolean,
        default: true
    });

    game.settings.register(MODULE_ID, "heroPoint.value", {
        name: "pf2e-karmic-dice.settings.heroPoint.value.name",
        hint: "pf2e-karmic-dice.settings.heroPoint.value.hint",
        scope: "world",
        config: true,
        type: new foundry.data.fields.NumberField({ min: 1, max: 10, step: 1, initial: 10 })
    });

    game.settings.register(MODULE_ID, "heroPoint.threshold", {
        name: "pf2e-karmic-dice.settings.heroPoint.threshold.name",
        hint: "pf2e-karmic-dice.settings.heroPoint.threshold.hint",
        scope: "world",
        config: true,
        type: new foundry.data.fields.NumberField({ min: 1, max: 20, step: 1, initial: 9 })
    });

});

Hooks.on("renderSettingsConfig", (_app, html) => {
    if (!game.user.isGM) return;
    const root = html instanceof HTMLElement ? html : html[0];

    function beforeGroup(settingKey, labelKey) {
        const group = root.querySelector(`[name="${MODULE_ID}.${settingKey}"]`)?.closest(".form-group");
        if (!group || group.previousElementSibling?.classList.contains("pf2e-karmic-dice-header")) return;

        const header = document.createElement("h3");
        header.classList.add("pf2e-karmic-dice-header");
        header.textContent = game.i18n.localize(labelKey);
        group.before(header);
    }

    beforeGroup("player", `${MODULE_ID}.headers.roles`);
    beforeGroup("history.value", `${MODULE_ID}.headers.history`);
    beforeGroup("lowerThreshold.enabled", `${MODULE_ID}.headers.lowerThreshold`);
    beforeGroup("upperThreshold.enabled", `${MODULE_ID}.headers.upperThreshold`);
    beforeGroup("nudge.value", `${MODULE_ID}.headers.nudge`);
    beforeGroup("heroPoint.enabled", `${MODULE_ID}.headers.heroPoints`);
});

Hooks.on("renderChatMessageHTML", (message, html) => {
    if (!game.user.isGM || !message.rolls?.length) return;

    const lines = [];
    for (const roll of message.rolls) {
        for (const die of roll.dice) {
            if (!die.options.karma) continue;
            for (const result of die.results) {
                if (Object.hasOwn(result, "originalResult")) {
                    lines.push(game.i18n.format(`${MODULE_ID}.adjustRoll`, { originalResult: result.originalResult, result: result.result }));
                }
            }
        }
    }
    if (lines.length === 0) return;

    const metadata = html.querySelector(".message-metadata");
    if (!metadata) return;

    const indicator = document.createElement("span");
    indicator.classList.add("pf2e-karmic-dice-indicator");
    indicator.dataset.tooltipHtml = lines.join("<br>");
    indicator.dataset.tooltipDirection = "LEFT";
    indicator.innerHTML = '<i class="fa-solid fa-yin-yang"></i>';
    metadata.append(indicator);
});

/**
 * PF2e passes the spent resource (hero points, mythic points...) as the third argument; older versions passed a boolean.
 * Always set the flag explicitly so that a later reroll of this roll (which clones its options) is not mistaken
 * for a Hero Point reroll.
 */
Hooks.on("pf2e.preReroll", (_oldRoll, unevaluatedNewRoll, resource) => {
    unevaluatedNewRoll.options.heroPoint = resource === true || resource?.slug === "hero-points";
});
