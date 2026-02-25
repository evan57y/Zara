const { getPrefix } = global.utils;
const { commands } = global.GoatBot;

module.exports = {
  config: {
    name: "help",
    aliases: ["h"],
    version: "5.0",
    author: "Siyuu 🎀",
    role: 0,
    shortDescription: "Show help menu",
    longDescription: "Show all commands or command detail",
    category: "info",
    guide: "{pn} | {pn} <command>"
  },

  onStart: async function({ message, event, args }) {
    const prefix = await getPrefix(event.threadID);

    // ===== COMMAND DETAIL =====
    if (args[0]) {
      const cmdName = args[0].toLowerCase();
      const cmd =
        commands.get(cmdName) ||
        [...commands.values()].find(c =>
          c.config.aliases?.includes(cmdName)
        );

      if (!cmd) return message.reply(`❌ Command "${cmdName}" not found.`);

      const { name, category, version, author, countDown, shortDescription, longDescription, guide } = cmd.config;

      const desc =
        typeof longDescription === "string"
          ? longDescription
          : longDescription?.en || shortDescription?.en || "No description";

      const usage =
        typeof guide === "string"
          ? guide.replace(/{pn}/g, `${prefix}${name}`)
          : guide?.en?.replace(/{pn}/g, `${prefix}${name}`) || `${prefix}${name}`;

      const box = 
`✦『 🌸 ${name.toUpperCase()} 🌸 』✦
✦ Category: ${category || "Uncategorized"} ✦
✦ Version: ${version || "1.0"} ✦
✦ Author: ${author || "Unknown"} ✦
✦ Cooldown: ${countDown || 0}s ✦

📘 Description: ${desc}
📗 Usage: ${usage}`;

      return message.reply(box);
    }

    // ===== FULL HELP MENU =====
    const botName = "MAIKO";
    const creator = "SIYUU";

    // Collect commands by category
    const categories = {};
    for (const cmd of commands.values()) {
      if (cmd.config.role > 1) continue; // skip admin/mod only
      const cate = cmd.config.category || "OTHER";
      if (!categories[cate]) categories[cate] = [];
      categories[cate].push(cmd.config.name);
    }

    // Build menu text
    let text = 
`✦『 maiko goatbot 』✦
✦ AI ✦
✦ HELP MENU ✦
`;

    for (const cate of Object.keys(categories).sort()) {
      text += `\n〔 ${cate.toUpperCase()} 〕\n`;
      for (const name of categories[cate].sort()) {
        text += `⌬ ${name.toUpperCase()}  `;
      }
      text += `\n`;
    }

    text += `
✦ TOTAL: ${commands.size}
✦ PREFIX: ${prefix || "/"}
✦ OWNER: ${creator}
`;

    return message.reply(text);
  },

  onChat: async function({ event, message }) {
    if (event.body?.toLowerCase().trim() === "help") {
      return this.onStart({ message, event, args: [] });
    }
  }
};
