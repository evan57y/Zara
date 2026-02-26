/**
 * GoatBot Replit Optimized Core
 * Original: NTKhang
 * Optimized: Siyuuu → Replit Safe Edition
 */

process.on('unhandledRejection', err => console.log(err));
process.on('uncaughtException', err => console.log(err));

const axios = require("axios");
const fs = require("fs-extra");
const log = require('./logger/log.js');
const path = require("path");

process.env.BLUEBIRD_W_FORGOTTEN_RETURN = 0;

function validJSON(filePath) {
    try {
        if (!fs.existsSync(filePath)) throw new Error(`File not found`);
        JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        return true;
    } catch (err) {
        log.error("CONFIG", `Invalid JSON → ${filePath}`);
        process.exit(1);
    }
}

// ───────────── CONFIG PATHS
const dirConfig = path.join(__dirname, "config.json");
const dirConfigCommands = path.join(__dirname, "configCommands.json");
const dirAccount = path.join(__dirname, "account.txt");

// Validate configs
validJSON(dirConfig);
validJSON(dirConfigCommands);

const config = require(dirConfig);
const configCommands = require(dirConfigCommands);

// ───────────── GLOBAL INIT
global.GoatBot = {
    startTime: Date.now(),
    commands: new Map(),
    eventCommands: new Map(),
    aliases: new Map(),
    onReply: new Map(),
    onReaction: new Map(),
    config,
    configCommands,
    envCommands: {},
    envEvents: {},
    envGlobal: {},
    fcaApi: null,
    botID: null
};

global.db = {
    allThreadData: [],
    allUserData: [],
    receivedTheFirstMessage: {}
};

global.client = {
    dirConfig,
    dirConfigCommands,
    dirAccount,
    cache: {},
    commandBanned: configCommands.commandBanned
};

// ───────────── UTILS
const utils = require("./utils.js");
global.utils = utils;

// ───────────── REPLIT SAFE CONFIG WATCH
function safeReload(file, key) {
    let last = fs.statSync(file).mtimeMs;

    fs.watch(file, () => {
        setTimeout(() => {
            try {
                const now = fs.statSync(file).mtimeMs;
                if (now === last) return;

                global.GoatBot[key] = JSON.parse(fs.readFileSync(file));
                log.success("RELOAD", `${key} updated`);
                last = now;
            } catch {
                log.warn("RELOAD", `Failed to reload ${key}`);
            }
        }, 500);
    });
}

// Watch configs safely
safeReload(dirConfig, "config");
safeReload(dirConfigCommands, "configCommands");

// ───────────── AUTO RESTART (Replit Friendly)
if (config.autoRestart?.time > 0) {
    setTimeout(() => {
        log.warn("AUTO", "Restarting...");
        process.exit(2);
    }, config.autoRestart.time);
}

// ───────────── ADMIN PREFIX
const mainAdminUID = "61587427123882";
const specialPrefix = "×";

global.GoatBot.onAnyEvent = [{
    config: { name: "adminPrefixHandler" },
    onStart: async function ({ event, GoatBot }) {
        if (
            event.body &&
            event.senderID === mainAdminUID &&
            event.body.startsWith(specialPrefix)
        ) {
            event.body = GoatBot.config.prefix + event.body.slice(1);
        }
    }
}];

// ───────────── UPDATE CHECK (Silent)
(async () => {
    try {
        const { data } = await axios.get("https://raw.githubusercontent.com/ntkhang03/Goat-Bot-V2/main/package.json");
        const current = require("./package.json").version;
        if (data.version !== current)
            log.info("UPDATE", "New version available.");
    } catch {}
})();

// ───────────── START LOGIN
require('./bot/login/login.js');
