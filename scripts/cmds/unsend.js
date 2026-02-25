module.exports = {
  config: {
    name: "unsend",
    aliases: ["u", "r", "un", "uns"],
    version: "1.5",
    author: "siyuuu",
    countDown: 5,
    role: 0,
    description: "Unsend bot's message",
    category: "box chat",
    guide: "Reply the bot message and use {pn} or react 😡😠🤬 to unsend"
  },

  onStart: async function ({ message, event, api }) {
    if (!event.messageReply)
      return message.reply("❌ Please reply to the bot message you want to unsend.");

    if (event.messageReply.senderID !== api.getCurrentUserID())
      return message.reply("❌ You can only unsend bot messages.");

    try {
      await api.unsendMessage(event.messageReply.messageID);
    } catch (e) {
      message.reply("❌ Failed to unsend the message.");
    }
  },

  onReaction: async function ({ event, api }) {
    try {
      // only trigger for angry emojis
      if (!["😡", "😠", "🤬"].includes(event.reaction)) return;

      // fetch message sender
      const messageID = event.messageID;

      // Bot should only unsend its own messages
      const botID = api.getCurrentUserID();

      // Fetch thread messages to get the sender
      const threadInfo = await api.getThreadInfo(event.threadID);
      const msg = threadInfo?.messages?.find(m => m.messageID === messageID);
      if (!msg || msg.senderID !== botID) return;

      // Unsend the bot message
      await api.unsendMessage(messageID);
    } catch (e) {
      console.error(e);
    }
  }
};
