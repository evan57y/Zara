module.exports = {
  config: {
    name: "fork",
    aliases: ["repo", "git"],
    version: "1.0",
    author: "siyuuu",
    countDown: 3,
    role: 0,
    longDescription: "Returns the link to the official, updated fork of the bot's repository.",
    category: "system",
    guide: { en: "{pn}" }
  },

  onStart: async function({ message }) {
    const text = "✓ | Here is the updated fork:\n\nhttps://github.com/siyuuu-x1/maiko_main_goatv2\n\n" +
                 "Changes:\n all fixed \n\n" +
                 "🚩⚙️🔓";
    
    message.reply(text);
  }
};
