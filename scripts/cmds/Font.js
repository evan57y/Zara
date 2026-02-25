const axios = require("axios");

module.exports = {
  config: {
    name: "font",
    aliases: ["fonts", "style"],
    version: "1.2",
    author: "Siyuuu",
    countDown: 5,
    role: 0,
    category: "style",
    shortDescription: "Convert text to fancy fonts via API",
    longDescription: "Use /font <id> <text> or /font list",
    guide: "{pn} list | {pn} 16 Siyuuu"
  },

  onStart: async function ({ message, event, api, threadPrefix }) {
    try {
      const prefix = threadPrefix || "/font";
      const body = event.body || "";
      const args = body.split(" ").slice(1);

      if (!args.length) {
        return api.sendMessage(
          `❌ Invalid usage!\nUse ${prefix} list to see available fonts\nor ${prefix} [number] [text] to convert`,
          event.threadID,
          event.messageID
        );
      }

      if (args[0].toLowerCase() === "list") {
        const preview = `✨ 𝐀𝐯𝐚𝐢𝐥𝐚𝐛𝐥𝐞 𝐅𝐨𝐧𝐭 𝐒𝐭𝐲𝐥𝐞𝐬 ✨
━━━━━━━━━━━━━━━━━━━━☆
1 ⟶ 𝐒𝐢𝐲𝐮𝐮
2 ⟶ 𝑺𝒊𝒚𝒖𝒖
3 ⟶ 𝗦𝗶𝘆𝘂𝘂
4 ⟶ 𝘚𝘪𝘺𝘂𝘂
5 ⟶ [S][i][y][u][u]
6 ⟶ 𝕾𝖎𝖞𝖚𝖚
7 ⟶ Ｓｉｙｕｕ
8 ⟶ ᴿˢⁱʸᵘᵘ
9 ⟶ sɪʏᴜᴜ
10 ⟶ 🅂🄸🅈🅄🅄
11 ⟶ 🆂🅸🆈🆄🆄
12 ⟶ 𝒮𝒾𝓎𝓊𝓊
13 ⟶ ⓈⓘⓎⓤⓤ
14 ⟶ 🅂🅸🅈🅄🅄
15 ⟶ 𝙎𝙞𝙮𝙪𝙪
16 ⟶ 𝐒𝐢𝐲𝐮𝐮
17 ⟶ 𝔖𝔦𝔂𝔲𝔲
18 ⟶ 𝓢𝓲𝔂𝓾𝓾
19 ⟶ 𝙎𝙞𝙮𝙪𝙪
20 ⟶ ᴿˢⁱʸᵘᵘ
21 ⟶ 𝐒𝑖𝑦𝑢𝑢
22 ⟶ 𝑺𝒊𝒚𝒖𝒖
23 ⟶ 𝔖𝕚𝕪𝕦𝕦
24 ⟶ 𝕾𝓲𝔂𝓾𝓾
25 ⟶ 𝕾𝓲𝔂𝓾𝓾
26 ⟶ 𝕾𝓲𝔂𝓾𝓾
27 ⟶ 𝕾𝓲𝔂𝓾𝓾
28 ⟶ 𝕾𝓲𝔂𝓾𝓾
29 ⟶ 𝕾𝓲𝔂𝓾𝓾
30 ⟶ 𝕾𝓲𝔂𝓾𝓾
31 ⟶ 𝕾𝓲𝔂𝓾𝓾
━━━━━━━━━━━━━━━━━━━━━☆`;
        return api.sendMessage(preview, event.threadID, event.messageID);
      }

      const id = args[0];
      // If no text given, default to "Siyuuu"
      let text = args.slice(1).join(" ") || "Siyuuu";

      // Always replace any EWR/Saim remnants with "Siyuuu"
      text = text.replace(/Ew'?r Saim/gi, "Siyuuu");

      const apiUrl = `https://xsaim8x-xxx-api.onrender.com/api/font?id=${id}&text=${encodeURIComponent(text)}`;
      const response = await axios.get(apiUrl);

      if (response.data.output) {
        return api.sendMessage(response.data.output, event.threadID, event.messageID);
      } else {
        return api.sendMessage(`❌ Font ${id} not found!`, event.threadID, event.messageID);
      }

    } catch (err) {
      console.error(err);
      return api.sendMessage("❌ An error occurred! Please try again later.", event.threadID, event.messageID);
    }
  }
};
