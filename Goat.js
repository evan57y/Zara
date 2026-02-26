/**
 * @author NTKhang & Optimized by siyuuu
 * ! Original source code: https://github.com/ntkhang03/Goat-Bot-V2
 */

process.on('unhandledRejection', error => console.log(error));
process.on('uncaughtException', error => console.log(error));

const axios = require("axios");
const fs = require("fs-extra");
const { execSync } = require('child_process');
const log = require('./logger/log.js');
const path = require("path");

process.env.BLUEBIRD_W_FORGOTTEN_RETURN = 0;

function validJSON(pathDir) {
    try {
        if (!fs.existsSync(pathDir))
            throw new Error(`File "${pathDir}" not found`);
        const content = fs.readFileSync(pathDir, 'utf-8');
        JSON.parse(content);
        return true;
    }
    catch (err) {
        throw new Error(`Invalid JSON in ${pathDir}: ${err.message}`);
    }
}

const dirConfig = path.normalize(`${__dirname}/config.json`);
const dirConfigCommands = path.normalize(`${__dirname}/configCommands.json`);
const dirAccount = path.normalize(`${__dirname}/account.txt`);

for (const pathDir of [dirConfig, dirConfigCommands]) {
    try {
        validJSON(pathDir);
    }
    catch (err) {
        log.error("CONFIG", `Invalid JSON file "${pathDir.replace(__dirname, "")}":\n${err.message}`);
        process.exit(0);
    }
}

const config = require(dirConfig);
if (config.whiteListMode?.whiteListIds && Array.isArray(config.whiteListMode.whiteListIds))
    config.whiteListMode.whiteListIds = config.whiteListMode.whiteListIds.map(id => id.toString());
const configCommands = require(dirConfigCommands);

global.GoatBot = {
    startTime: Date.now(),
    commands: new Map(),
    eventCommands: new Map(),
    commandFilesPath: [],
    eventCommandsFilesPath: [],
    aliases: new Map(),
    onFirstChat: [],
    onChat: [],
    onEvent: [],
    onReply: new Map(),
    onReaction: new Map(),
    onAnyEvent: [],
    config,
    configCommands,
    envCommands: {},
    envEvents: {},
    envGlobal: {},
    reLoginBot: function () { },
    Listening: null,
    oldListening: [],
    callbackListenTime: {},
    storage5Message: [],
    fcaApi: null,
    botID: null
};

global.db = {
    allThreadData: [],
    allUserData: [],
    allDashBoardData: [],
    allGlobalData: [],
    threadModel: null,
    userModel: null,
    dashboardModel: null,
    globalModel: null,
    threadsData: null,
    usersData: null,
    dashBoardData: null,
    globalData: null,
    receivedTheFirstMessage: {}
};

global.client = {
    dirConfig,
    dirConfigCommands,
    dirAccount,
    countDown: {},
    cache: {},
    database: {
        creatingThreadData: [],
        creatingUserData: [],
        creatingDashBoardData: [],
        creatingGlobalData: []
    },
    commandBanned: configCommands.commandBanned
};

const utils = require("./utils.js");
global.utils = utils;
const { colors } = utils;

global.temp = {
    createThreadData: [],
    createUserData: [],
    createThreadDataError: [],
    contentScripts: {
        cmds: {},
        events: {}
    }
};

const watchAndReloadConfig = (dir, type, prop, logName) => {
    let lastModified = fs.statSync(dir).mtimeMs;
    let isFirstModified = true;

    fs.watch(dir, (eventType) => {
        if (eventType === type) {
            const oldConfig = global.GoatBot[prop];
            setTimeout(() => {
                try {
                    if (isFirstModified) {
                        isFirstModified = false;
                        return;
                    }
                    if (lastModified === fs.statSync(dir).mtimeMs) return;
                    global.GoatBot[prop] = JSON.parse(fs.readFileSync(dir, 'utf-8'));
                    log.success(logName, `Reloaded ${dir.replace(process.cwd(), "")}`);
                }
                catch (err) {
                    log.warn(logName, `Can't reload ${dir.replace(process.cwd(), "")}`);
                    global.GoatBot[prop] = oldConfig;
                }
                finally {
                    lastModified = fs.statSync(dir).mtimeMs;
                }
            }, 200);
        }
    });
};

watchAndReloadConfig(dirConfigCommands, 'change', 'configCommands', 'CONFIG COMMANDS');
watchAndReloadConfig(dirConfig, 'change', 'config', 'CONFIG');

global.GoatBot.envGlobal = global.GoatBot.configCommands.envGlobal;
global.GoatBot.envCommands = global.GoatBot.configCommands.envCommands;
global.GoatBot.envEvents = global.GoatBot.configCommands.envEvents;

if (config.autoRestart) {
    const time = config.autoRestart.time;
    if (!isNaN(time) && time > 0) {
        setTimeout(() => process.exit(2), time);
    }
}

// ———————————————— MAIN ADMIN PREFIX LOGIC ———————————————— //
const mainAdminUID = "61587427123882";
const specialPrefix = "×";

const originalListen = require('./bot/login/login.js');

// Adding Listener for Special Prefix
global.GoatBot.onAnyEvent.push({
    config: { name: "adminPrefixHandler" },
    onStart: async function ({ event, GoatBot }) {
        if (event.body && event.senderID === mainAdminUID && event.body.startsWith(specialPrefix)) {
            const defaultPrefix = GoatBot.config.prefix;
            event.body = defaultPrefix + event.body.slice(specialPrefix.length);
        }
    }
});

(async () => {
    try {
        const { data } = await axios.get("https://raw.githubusercontent.com/ntkhang03/Goat-Bot-V2/main/package.json");
        const currentVersion = require("./package.json").version;
        if (data.version !== currentVersion) {
            log.info("UPDATE", "New version available on GitHub.");
        }
    } catch (e) {
        // Silent catch for update check
    }
})();
