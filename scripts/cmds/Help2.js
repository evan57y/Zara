const { getPrefix } = global.utils;
const { commands } = global.GoatBot;

module.exports = {
  config: {
    name: "help2",
    aliases: ["h2"],
    version: "1.1",
    author: "Siyuu 🎀",
    role: 0,
    shortDescription: "Show commands by emoji or category",
    longDescription: "Use prefix+help2<emoji> or prefix+help2<category> to see commands of that category",
    category: "info",
    guide: "{pn} | {pn}<emoji/category>"
  },

  onStart: async function({ message, event, args }) {
    const prefix = await getPrefix(event.threadID);

    if (!args[0]) {
      return message.reply(`❌ Please provide a category emoji or name.\nExample: ${prefix}help2🎮 or ${prefix}help2game`);
    }

    const inputArg = args[0].trim().toLowerCase();

    // CATEGORY → multiple optional emojis
    const emojiCategoryMap = {
      "fun": ["😂","🤣","😁","😆","😹"],
      "game": ["🎮","🧩","🎰","⚽","🎲","🕹️"],
      "ai": ["🍓","🤖","🧠"],
      "group": ["⚙️","👥"],
      "music": ["🎵","🎶","🎼"],
      "owner": ["👑","🛡️"],
      "special": ["🌟","✨"],
      "image": ["🖼️","📷","🖌️"],
      "image generator": ["💻","🖥️","🎨"],
      "image generator 2": ["💡","🔮"],
      "info": ["ℹ️","📄"],
      "information": ["📚","📖"],
      "love": ["💌","❤️","💖","💞"],
      "media": ["📺","🎥","📹","🎬"],
      "economy": ["💰","🏦","💳"],
      "tools": ["🛠️","🔧","⚒️"],
      "utility": ["⚡","🧰"],
      "wiki": ["🌐","📡"],
      "market": ["🛒","🏪","💹"],
      "rank": ["📊","🏆"],
      "software": ["🖥️","💻"],
      "system": ["💾","🖥️","🛡️"]
    };

    // FIND CATEGORY BY EMOJI OR TEXT
    let categoryName = Object.keys(emojiCategoryMap).find(cat =>
      emojiCategoryMap[cat].includes(inputArg) || cat === inputArg
    );

    if (!categoryName) {
      return message.reply(`❌ Command not found!\nPlease check your category or emoji and try again. And type ${prefix}help to see available command`);
    }

    // COLLECT COMMANDS BY CATEGORY
    const categories = {};
    for (const cmd of commands.values()) {
      if (cmd.config.role > 1) continue; // skip admin only
      const cate = (cmd.config.category || "other").toLowerCase();
      if (!categories[cate]) categories[cate] = [];
      categories[cate].push(cmd.config.name);
    }

    if (!categories[categoryName] || categories[categoryName].length === 0) {
      return message.reply(`❌ No commands found in category "${categoryName}"`);
    }

    // PICK FIRST EMOJI OF CATEGORY
    const displayEmoji = emojiCategoryMap[categoryName][0] || "🌸";

    // BUILD OUTPUT
    let text = `✦『 ${displayEmoji} ${categoryName.toUpperCase()} 🌸 』✦\n`;
    text += `⌬ Commands:\n`;
    for (const name of categories[categoryName].sort()) {
      text += `• ${name.toUpperCase()}\n`;
    }

    return message.reply(text);
  },

  onChat: async function({ event, message }) {
    const body = event.body?.trim();
    if (!body) return;

    // Detect .help2<emoji/category> usage
    if (body.startsWith("help2")) {
      const arg = body.replace("help2", "").trim();
      return this.onStart({ message, event, args: arg ? [arg] : [] });
    }
  }
};
