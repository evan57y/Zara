const delay = ms => new Promise(res => setTimeout(res, ms));

module.exports = {
  config: {
    name: "kick",
    version: "1.5",
    author: "siyuuu",
    countDown: 5,
    role: 1,
    description: {
      vi: "Kick thành viên khỏi box chat",
      en: "Kick member out of chat box"
    },
    category: "box chat",
    guide: {
      vi: "{pn} @tags: dùng để kick những người được tag hoặc react 🦵 để kick",
      en: "{pn} @tags: use to kick members who are tagged or react 🦵 to kick"
    }
  },

  langs: {
    vi: {
      needAdmin: "Vui lòng thêm quản trị viên cho bot trước khi sử dụng tính năng này"
    },
    en: {
      needAdmin: "Please add admin for bot before using this feature"
    }
  },

  onStart: async function ({ message, event, args, threadsData, api, getLang, usersData }) {
    const adminIDs = await threadsData.get(event.threadID, "adminIDs");
    if (!adminIDs.includes(api.getCurrentUserID()))
      return message.reply(getLang("needAdmin"));

    async function kickWithBye(uid) {
      try {
        const user = await usersData.get(uid);
        const name = user?.name || "User";

        // goodbye message
        await message.reply(`👋 Ok bye ${name}`);

        // wait 1 second
        await delay(1000);

        // kick user
        await api.removeUserFromGroup(uid, event.threadID);
      }
      catch (e) {
        message.reply(getLang("needAdmin"));
        return "ERROR";
      }
    }

    // Command based kick
    if (!args[0]) {
      if (!event.messageReply)
        return message.SyntaxError();

      await kickWithBye(event.messageReply.senderID);
    }
    else {
      const uids = Object.keys(event.mentions);
      if (uids.length === 0)
        return message.SyntaxError();

      for (const uid of uids) {
        if (await kickWithBye(uid) === "ERROR") return;
      }
    }
  },

  // New reaction handler
  onReaction: async function ({ event, api, threadsData, usersData, getLang }) {
    try {
      // Only trigger on 🦵 emoji
      if (event.reaction !== "🦵") return;

      const adminIDs = await threadsData.get(event.threadID, "adminIDs");
      if (!adminIDs.includes(api.getCurrentUserID())) return;

      const uid = event.userID; // user who reacted
      const messageID = event.messageID;

      // fetch sender of the reacted message
      const threadInfo = await api.getThreadInfo(event.threadID);
      const messageInfo = threadInfo?.messages?.find(msg => msg.messageID === messageID);
      if (!messageInfo) return;

      const targetID = messageInfo.senderID;

      // kick using same function
      const delay = ms => new Promise(res => setTimeout(res, ms));
      async function kickWithBye(uid) {
        try {
          const user = await usersData.get(uid);
          const name = user?.name || "User";

          await api.sendMessage(`👋 Ok bye ${name}`, event.threadID);
          await delay(1000);
          await api.removeUserFromGroup(uid, event.threadID);
        }
        catch (e) {
          api.sendMessage(getLang("needAdmin"), event.threadID);
          return "ERROR";
        }
      }

      await kickWithBye(targetID);
    }
    catch (e) {
      console.error(e);
    }
  }
};
