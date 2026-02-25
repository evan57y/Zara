const fs = require("fs-extra");
const { utils } = global;

module.exports = {
  config: {
    name: "prefix",
    version: "1.5",
    author: "NTKhang & siyuuu",
    countDown: 5,
    role: 0,
    description: "Change bot prefix in chat or globally (admin only)",
    category: "config",
    guide: {
      en: "   {pn} <new prefix>: change prefix in this chat"
        + "\n   Example:"
        + "\n    {pn} #"
        + "\n\n   {pn} <new prefix> -g: change prefix globally (admin only)"
        + "\n   Example:"
        + "\n    {pn} # -g"
        + "\n\n   {pn} reset: reset prefix to default"
    }
  },

  langs: {
    en: {
      reset: "Prefix reset to default: %1",
      onlyAdmin: "Only bot admin can change global prefix.",
      confirmGlobal: "React to this message to confirm changing the global prefix.",
      confirmThisThread: "React to this message to confirm changing the prefix in this chat.",
      successGlobal: "Global prefix changed to: %1",
      successThisThread: "Chat prefix changed to: %1",

      // 🔥 SELECTED SMS (#14)
      myPrefix: "Sup %1 ⚡\n\nCommand prefixes:\n🌍 %2\n💬 %3\n\nHandled by %4"
    }
  },

  onStart: async function ({ message, role, args, commandName, event, threadsData, getLang }) {
    if (!args[0])
      return message.SyntaxError();

    if (args[0] === "reset") {
      await threadsData.set(event.threadID, null, "data.prefix");
      return message.reply(getLang("reset", global.GoatBot.config.prefix));
    }

    const newPrefix = args[0];
    const formSet = {
      commandName,
      author: event.senderID,
      newPrefix
    };

    if (args[1] === "-g") {
      if (role < 2)
        return message.reply(getLang("onlyAdmin"));
      formSet.setGlobal = true;
    }
    else {
      formSet.setGlobal = false;
    }

    return message.reply(
      args[1] === "-g"
        ? getLang("confirmGlobal")
        : getLang("confirmThisThread"),
      (err, info) => {
        formSet.messageID = info.messageID;
        global.GoatBot.onReaction.set(info.messageID, formSet);
      }
    );
  },

  onReaction: async function ({ message, threadsData, event, Reaction, getLang }) {
    const { author, newPrefix, setGlobal } = Reaction;
    if (event.userID !== author)
      return;

    if (setGlobal) {
      global.GoatBot.config.prefix = newPrefix;
      fs.writeFileSync(
        global.client.dirConfig,
        JSON.stringify(global.GoatBot.config, null, 2)
      );
      return message.reply(getLang("successGlobal", newPrefix));
    }
    else {
      await threadsData.set(event.threadID, newPrefix, "data.prefix");
      return message.reply(getLang("successThisThread", newPrefix));
    }
  },

  onChat: async function ({ event, message, getLang, usersData }) {
    if (event.body && event.body.toLowerCase() === "prefix") {
      const userName = await usersData.getName(event.senderID);
      const botName = global.GoatBot.config.nickNameBot || "Bot";

      return message.reply(
        getLang(
          "myPrefix",
          userName,
          global.GoatBot.config.prefix,
          utils.getPrefix(event.threadID),
          botName
        )
      );
    }
  }
};
