const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

// API URL ক্যাশ করার জন্য ভেরিয়েবল
let cachedApiUrl = null;

async function getApiUrl() {
  if (cachedApiUrl) return cachedApiUrl;
  try {
    const res = await axios.get("https://raw.githubusercontent.com/Saim-x69x/sakura/main/ApiUrl.json");
    cachedApiUrl = res.data.apiv4;
    return cachedApiUrl;
  } catch (e) {
    console.error("Failed to fetch API URL, using fallback.");
    return null; 
  }
}

module.exports = {
  config: {
    name: "4k",
    aliases: ["hd","clear","5k","6k"],
    version: "1.1",
    author: "Siyuuuu",
    category: "image",
    shortDescription: "image clear & HD",
    longDescription: "picture quality Hd and clear",
    guide: "{pn} (reply to image)"
  },

  onStart: async function ({ api, event }) {
    let imageUrl = "";
    let processingMsg;

    try {
      // ইমেজ ইউআরএল ডিটেকশন
      if (event.messageReply?.attachments?.length > 0) {
        imageUrl = event.messageReply.attachments[0].url;
      } else if (event.attachments?.length > 0) {
        imageUrl = event.attachments[0].url;
      } else {
        return api.sendMessage("❌ দয়া করে একটি ছবিতে রিপ্লাই দিন অথবা ছবিসহ কমান্ডটি লিখুন।", event.threadID, event.messageID);
      }

      processingMsg = await api.sendMessage("⏳ আপনার ছবিটি 4K করা হচ্ছে, দয়া করে অপেক্ষা করুন...", event.threadID);

      const BASE_API = await getApiUrl();
      if (!BASE_API) throw new Error("API Server is down");

      const apiUrl = `${BASE_API}/4k?url=${encodeURIComponent(imageUrl)}`;
      const res = await axios.get(apiUrl);

      if (!res.data || !res.data.image) {
        throw new Error("Invalid API response");
      }

      // ফাইল সেভ করার পাথ
      const cacheDir = path.join(__dirname, "cache");
      await fs.ensureDir(cacheDir);
      const imgPath = path.join(cacheDir, `${Date.now()}_4k.jpg`);

      // ইমেজ ডাউনলোড
      const imgRes = await axios.get(res.data.image, { responseType: "arraybuffer" });
      await fs.writeFile(imgPath, Buffer.from(imgRes.data));

      // মেসেজ পাঠানো
      await api.sendMessage({
        body: "✅ আপনার HD  ছবি তৈরি!",
        attachment: fs.createReadStream(imgPath)
      }, event.threadID, () => {
        // পাঠানোর পর ফাইল এবং মেসেজ ডিলিট
        if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
        if (processingMsg?.messageID) api.unsendMessage(processingMsg.messageID);
      }, event.messageID);

    } catch (error) {
      console.error("4k command error:", error);
      if (processingMsg?.messageID) api.unsendMessage(processingMsg.messageID);
      api.sendMessage("❌ দুঃখিত, ছবিটি 4K করতে সমস্যা হয়েছে। পরে আবার চেষ্টা করুন।", event.threadID, event.messageID);
    }
  }
};
