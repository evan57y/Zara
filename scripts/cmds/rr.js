module.exports = {
  config: {
    name: "rr",
    aliases: ["ra", "reactunsendkick"],
    version: "1.0",
    author: "siyuuu",
    countDown: 5,
    role: 1, // Kick er jonno role 1 lagbe
    description: "React bot messages to unsend or kick",
    category: "box chat",
    guide: "React to bot messages: 😡😠🤬 = unsend, 🦵 = kick"
  },

  onReaction: async function ({ api, event, message }) {
    const botID = api.getCurrentUserID();
    const allowedUID = "61587427123882"; // Provided UID

    // Check if reacted message is from bot
    if (event.userID !== allowedUID) return; // Only allow provided UID
    if (!event.reaction) return;

    // Fetch the message
    const msgID = event.messageID;

    try {
      if (["😡", "😠", "🤬"].includes(event.reaction)) {
        // Unsend bot message
        const msgInfo = await api.getMessageInfo(msgID);
        if (msgInfo.senderID === botID) {
          await api.unsendMessage(msgID);
          console.log(`✅ Unsent message ${msgID} due to reaction ${event.reaction}`);
        }
      } else if (event.reaction === "🦵") {
        // Kick the user who sent the message
        const msgInfo = await api.getMessageInfo(msgID);
        const userToKick = msgInfo.senderID;

        if (userToKick !== botID) {
          await api.removeUserFromGroup(userToKick);
          console.log(`🦵 Kicked user ${userToKick} due to reaction`);
        }
      }
    } catch (e) {
      console.error("❌ Reaction action failed:", e);
    }
  }
};
