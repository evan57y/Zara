const axios = require("axios");
const fs = require("fs");
const path = require("path");

const apiJsonUrl = "https://raw.githubusercontent.com/goatbotnx/Sexy-nx2.0Updated/refs/heads/main/nx-apis.json"; 
const ADMIN_UID = "61587427123882";

module.exports = {
  config: {
    name: "album",
    aliases: ["gallery", "alb"],
    version: "7.1",
    author: "xalman & siyuu", 
    role: 0,
    category: "media",
    shortDescription: "🌸 Dynamic Album with Auto-Unsend",
    guide: "{p}album [page]"
  },

  onStart: async function ({ message, event, args }) {
    try {
      const apiListResponse = await axios.get(apiJsonUrl);
      const BASE_API = apiListResponse.data.album;

      const catRes = await axios.get(`${BASE_API}/categories`);
      const allCategories = catRes.data.categories;

      if (!allCategories || allCategories.length === 0) {
        return message.reply("⚠️ 𝐍𝐨 𝐜𝐚𝐭𝐞𝐠𝐨𝐫𝐢𝐞𝐬 𝐟𝐨𝐮𝐧𝐝 𝐢𝐧 𝐀𝐏𝐈.");
      }

      const itemsPerPage = 8;
      const totalPages = Math.ceil(allCategories.length / itemsPerPage);
      let page = parseInt(args[0]) || 1;
      if (page < 1) page = 1;
      if (page > totalPages) page = totalPages;

      const startIndex = (page - 1) * itemsPerPage;
      const currentPageCategories = allCategories.slice(startIndex, startIndex + itemsPerPage);

      const fancy = (t) => t.replace(/[a-z]/gi, c => String.fromCodePoint(0x1d400 + c.toLowerCase().charCodeAt(0) - 97));
      const numStyle = (n) => String(n).replace(/[0-9]/g, d => String.fromCodePoint(0x1d7ec + Number(d)));

      // 🏷️ MENU TEXT
      let menuText = `╔═══════ 🌸 𝐀𝐋𝐁𝐔𝐌 🌸 ═══════╗\n`;
      currentPageCategories.forEach((cat, index) => {
        menuText += `✨ ${numStyle(index + 1)} ┊ ${fancy(cat)}\n`;
      });
      menuText += `╚══════════════════════════╝\n`;
      menuText += `📖 𝐏𝐚𝐠𝐞 ${numStyle(page)} / ${numStyle(totalPages)}\n`;
      
      if (page < totalPages) {
        menuText += `➕ Type: album ${page + 1} ⏭️\n`;
      } else if (totalPages > 1) {
        menuText += `↩️ Type: album 1 🔄 to return to start\n`;
      }

      menuText += `💌 Reply with number to open album`;

      return message.reply(menuText, (err, info) => {
        // ৬০ সেকেন্ড পর অটো আনসেন্ড
        setTimeout(() => message.unsend(info.messageID), 60000);

        global.GoatBot.onReply.set(info.messageID, {
          commandName: "album",
          author: event.senderID,
          categories: currentPageCategories,
          BASE_API: BASE_API,
          messageID: info.messageID
        });
      });

    } catch (err) {
      console.error(err);
      return message.reply("⚠️ 𝐂𝐨𝐧𝐧𝐞𝐜𝐭𝐢𝐨𝐧 𝐞𝐫𝐫𝐨𝐫! 𝐂𝐡𝐞𝐜𝐤 𝐘𝐨𝐮𝐫 𝐀𝐏𝐈 𝐨𝐧𝐥𝐢𝐧𝐞.");
    }
  },

  onReply: async function ({ message, event, Reply }) {
    const { author, categories, BASE_API, messageID } = Reply;
    if (event.senderID !== author) return message.reply("⛔ 𝐓𝐡𝐢𝐬 𝐦𝐞𝐧𝐮 𝐢𝐬 𝐧𝐨𝐭 𝐟𝐨𝐫 𝐲𝐨𝐮.");

    const pick = parseInt(event.body);
    if (isNaN(pick)) return message.reply("🔢 𝐏𝐥𝐞𝐚𝐬𝐞 𝐫𝐞𝐩𝐥𝐲 𝐰𝐢𝐭𝐡 𝐚 𝐯𝐚𝐥𝐢𝐝 𝐧𝐮𝐦𝐛𝐞𝐫.");
    if (pick < 1 || pick > categories.length) return message.reply("❌ 𝐈𝐧𝐯𝐚𝐥𝐢𝐝 𝐬𝐞𝐥𝐞𝐜𝐭𝐢𝐨𝐧.");

    // ইউজার রিপ্লাই দেওয়ার সাথে সাথে লিস্টটি আনসেন্ড
    message.unsend(messageID);

    const category = categories[pick - 1];
    const restricted = ["hot", "horny"];
    
    if (restricted.includes(category.toLowerCase()) && event.senderID !== ADMIN_UID) {
        return message.reply("🫢 𝐒𝐨𝐫𝐫𝐲, 𝐲𝐨𝐮 𝐜𝐚𝐧'𝐭 𝐚𝐜𝐜𝐞𝐬𝐬 𝐭𝐡𝐢𝐬 𝐜𝐚𝐭𝐞𝐠𝐨𝐫𝐲!");
    }

    try {
      message.reply(`⏳ 𝐏𝐥𝐞𝐚𝐬𝐞 𝐰𝐚𝐢𝐭... Loading ${category} ✨`);

      const res = await axios.get(`${BASE_API}/album?type=${category}`);
      const mediaUrl = res.data.data;

      if (!mediaUrl) return message.reply("❌ 𝐍𝐨 𝐜𝐨𝐧𝐭𝐞𝐧𝐭 𝐟𝐨𝐮𝐧𝐝 𝐟𝐨𝐫 𝐭𝐡𝐢𝐬 𝐜𝐚𝐭𝐞𝐠𝐨𝐫𝐲.");

      const ext = mediaUrl.split(".").pop().split("?")[0] || "mp4";
      const filePath = path.join(__dirname, "cache", `album_${Date.now()}.${ext}`);

      const response = await axios({ url: mediaUrl, method: 'GET', responseType: 'stream' });
      const writer = fs.createWriteStream(filePath);
      response.data.pipe(writer);

      writer.on("finish", () => {
        message.reply({
          body: `🌸 𝐀𝐋𝐁𝐔𝐌 𝐃𝐄𝐋𝐈𝐕𝐄𝐑𝐄𝐃 🌸\n💖 𝐂𝐚𝐭𝐞𝐠𝐨𝐫𝐲 : ${category}\n👑 𝐎𝐰𝐧𝐞𝐫 : XALMAN`,
          attachment: fs.createReadStream(filePath)
        }, () => {
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        });
      });
    } catch (err) {
      console.error(err);
      message.reply("⚠️ 𝐅𝐚𝐢𝐥𝐞𝐝 𝐭𝐨 𝐝𝐨𝐰𝐧𝐥𝐨𝐚𝐝 𝐨𝐫 𝐬𝐞𝐧𝐝 𝐦𝐞𝐝𝐢𝐚.");
    }
  }
};
