const axios = require("axios");
const fs = require("fs");
const path = require("path");
const yts = require("yt-search");

const nix = "https://raw.githubusercontent.com/aryannix/stuffs/master/raw/apis.json";

async function getStream(url) {
  const res = await axios({ url, responseType: "stream" });
  return res.data;
}

async function downloadSong(baseApi, url, api, event, title = null) {
  try {
    const apiUrl = `${baseApi}/play?url=${encodeURIComponent(url)}`;
    const res = await axios.get(apiUrl);
    const data = res.data;

    if (!data.status || !data.downloadUrl)
      throw new Error("Failed to fetch song.");

    const songTitle = title || data.title;
    const fileName = `${songTitle}.mp3`.replace(/[\\/:"*?<>|]/g, "");
    const filePath = path.join(__dirname, fileName);

    const audio = await axios.get(data.downloadUrl, {
      responseType: "arraybuffer"
    });
    fs.writeFileSync(filePath, audio.data);

    const caption =
`• Title: ${songTitle}
• Quality: 360p
(Fixed by : siyuuu)`;

    await api.sendMessage(
      {
        body: caption,
        attachment: fs.createReadStream(filePath)
      },
      event.threadID,
      () => fs.unlinkSync(filePath),
      event.messageID
    );
  } catch (err) {
    console.error(err);
    api.sendMessage(
      "❌ Song download failed.",
      event.threadID,
      event.messageID
    );
  }
}

module.exports = {
  config: {
    name: "song",
    aliases: ["music", "play"],
    version: "1.1.0",
    author: "ArYAN × siyuuu",
    role: 0,
    shortDescription: "Play music",
    longDescription: "Search & download YouTube songs",
    category: "MUSIC",
    guide: "/song <name or url>"
  },

  onStart: async function ({ api, event, args, commandName }) {
    let baseApi;
    try {
      const res = await axios.get(nix);
      baseApi = res.data.api;
      if (!baseApi) throw new Error();
    } catch {
      return api.sendMessage(
        "❌ API load failed.",
        event.threadID,
        event.messageID
      );
    }

    if (!args.length)
      return api.sendMessage(
        "❌ Song name দাও।",
        event.threadID,
        event.messageID
      );

    const query = args.join(" ");
    if (query.startsWith("http"))
      return downloadSong(baseApi, query, api, event);

    const search = await yts(query);
    const results = search.videos.slice(0, 6);
    if (!results.length)
      return api.sendMessage(
        "❌ No results found.",
        event.threadID,
        event.messageID
      );

    let msg = "🎵 Select a song:\n\n";
    results.forEach((v, i) => {
      msg += `${i + 1}. ${v.title}\n⏱ ${v.timestamp}\n\n`;
    });

    const thumbs = await Promise.all(
      results.map(v => getStream(v.thumbnail))
    );

    api.sendMessage(
      {
        body: msg + "Reply 1-6",
        attachment: thumbs
      },
      event.threadID,
      (err, info) => {
        if (err) return;
        global.GoatBot.onReply.set(info.messageID, {
          commandName,
          messageID: info.messageID,
          author: event.senderID,
          results,
          baseApi
        });
      },
      event.messageID
    );
  },

  onReply: async function ({ api, event, Reply }) {
    if (event.senderID !== Reply.author) return;

    const choice = parseInt(event.body);
    if (isNaN(choice) || choice < 1 || choice > Reply.results.length)
      return api.sendMessage(
        "❌ Wrong number.",
        event.threadID,
        event.messageID
      );

    const song = Reply.results[choice - 1];
    await api.unsendMessage(Reply.messageID);

    downloadSong(
      Reply.baseApi,
      song.url,
      api,
      event,
      song.title
    );
  }
};
