/**
 * @author NTKhang & Optimized for Speed
 * ! Source: https://github.com/ntkhang03/Goat-Bot-V2
 */

process.on('unhandledRejection', error => console.error('Unhandled Rejection:', error));
process.on('uncaughtException', error => console.error('Uncaught Exception:', error));

const axios = require("axios");
const fs = require("fs-extra");
const { execSync } = require('child_process');
const log = require('./logger/log.js');
const path = require("path");

process.env.BLUEBIRD_W_FORGOTTEN_RETURN = 0;

// JSON ভ্যালিডেশন ফাংশন (অপ্টিমাইজড)
function validJSON(pathDir) {
    try {
        if (!fs.existsSync(pathDir)) return false;
        const content = fs.readFileSync(pathDir, 'utf-8');
        JSON.parse(content);
        return true;
    } catch (err) {
        throw new Error(`Invalid JSON in ${pathDir}: ${err.message}`);
    }
}

const dirConfig = path.normalize(`${__dirname}/config.json`);
const dirConfigCommands = path.normalize(`${__dirname}/configCommands.json`);
const dirAccount = path.normalize(`${__dirname}/account.txt`);

// স্টার্টআপ চেক
for (const pathDir of [dirConfig, dirConfigCommands]) {
    try {
        validJSON(pathDir);
    } catch (err) {
        log.error("CONFIG", err.message);
        process.exit(0);
    }
}

const config = require(dirConfig);
const configCommands = require(dirConfigCommands);

if (config.whiteListMode?.whiteListIds) {
    config.whiteListMode.whiteListIds = config.whiteListMode.whiteListIds.map(id => id.toString());
}

// Global Object Initialization
global.GoatBot = {
    startTime: Date.now(),
    commands: new Map(),
    eventCommands: new Map(),
    aliases: new Map(),
    onFirstChat: [],
    onChat: [],
    onEvent: [],
    onReply: new Map(),
    onReaction: new Map(),
    config,
    configCommands,
    envCommands: configCommands.envCommands || {},
    envEvents: configCommands.envEvents || {},
    envGlobal: configCommands.envGlobal || {},
    botID: null
};

global.db = {
    allThreadData: [], allUserData: [],
    receivedTheFirstMessage: {}
};

global.client = {
    dirConfig, dirConfigCommands, dirAccount,
    countDown: {}, cache: {},
    commandBanned: configCommands.commandBanned || []
};

global.utils = require("./utils.js");
global.temp = { contentScripts: { cmds: {}, events: {} } };

// কনফিগ অটো-রিলোড (স্মুথ হ্যান্ডলিং)
const watchConfig = (dir, prop) => {
    fs.watch(dir, (eventType) => {
        if (eventType === 'change') {
            setTimeout(() => {
                try {
                    global.GoatBot[prop] = JSON.parse(fs.readFileSync(dir, 'utf-8'));
                    log.success("RELOAD", `Updated ${path.basename(dir)}`);
                } catch (e) { /* সাইলেন্ট এরর যাতে বট ক্র্যাশ না করে */ }
            }, 500);
        }
    });
};

watchConfig(dirConfig, 'config');
watchConfig(dirConfigCommands, 'configCommands');

// ———————————————— AUTO RESTART ———————————————— //
if (config.autoRestart?.time) {
    const restartTime = config.autoRestart.time;
    if (!isNaN(restartTime) && restartTime > 0) {
        setTimeout(() => process.exit(2), restartTime);
    }
}

// ———————————————— STARTUP & LOGIN ———————————————— //
(async () => {
    try {
        log.info("SYSTEM", "Checking for updates...");
        // ভার্সন চেক ব্যাকগ্রাউন্ডে রাখা হয়েছে যাতে স্টার্টআপ স্লো না হয়
        axios.get("https://raw.githubusercontent.com/ntkhang03/Goat-Bot-V2/main/package.json")
            .then(res => {
                const latest = res.data.version;
                const current = require("./package.json").version;
                if (latest !== current) log.warn("UPDATE", `New version available: ${latest}`);
            }).catch(() => {});

        require('./bot/login/login.js');
    } catch (err) {
        log.error("LOGIN", err.message);
    }
})();
