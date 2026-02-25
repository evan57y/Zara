const os = require("os");
const pidusage = require("pidusage");
const fs = require("fs");

module.exports = {
  config: {
    name: "uptime3",
    aliases: ["upt3"],
    version: "2.7",
    author: "siyuuu",
    countDown: 1,
    role: 0,
    shortDescription: "Show system and bot status",
    category: "info",
    guide: "{pn}",
    noPrefix: true
  },

  onStart: async function (ctx) {
    await module.exports.sendUptime(ctx);
  },

  onChat: async function (ctx) {

    const input = ctx.event.body?.toLowerCase().trim();

    const triggers = [
      module.exports.config.name,
      ...(module.exports.config.aliases || [])
    ];

    if (!triggers.includes(input)) return;

    await module.exports.sendUptime(ctx);

  },


  sendUptime: async function ({
    message,
    usersData,
    threadsData,
    api
  }) {

    const loadingMsg = await message.reply("⏳ Starting...");


    const frames = [

"⏳ [░░░░░░░░░░] 0%",
"⏳ [█░░░░░░░░░] 10%",
"⏳ [██░░░░░░░░] 20%",
"⏳ [███░░░░░░░] 30%",
"⏳ [████░░░░░░] 40%",
"⏳ [█████░░░░░] 50%",
"⏳ [██████░░░░] 60%",
"⏳ [███████░░░] 70%",
"⏳ [████████░░] 80%",
"⏳ [█████████░] 90%",
"⏳ [██████████] 100%"

    ];


    for (const frame of frames) {

      await new Promise(r => setTimeout(r, 300));

      try {

        api.editMessage(
          frame,
          loadingMsg.messageID
        );

      } catch {}

    }



    const now = new Date();

    const formatDate =
      now.toLocaleString(
        "en-US",
        { timeZone: "Asia/Dhaka" }
      );



    const toTime = (sec) => {

      const d = Math.floor(sec / 86400);

      const h =
        Math.floor((sec % 86400) / 3600);

      const m =
        Math.floor((sec % 3600) / 60);

      const s =
        Math.floor(sec % 60);

      return `${d ? d + "d " : ""}${h}h ${m}m ${s}s`;

    };



    const usage =
      await pidusage(process.pid);



    const totalRam =
      (os.totalmem() / 1024 ** 3).toFixed(1);

    const freeRam =
      (os.freemem() / 1024 ** 3).toFixed(1);

    const usedRam =
      (usage.memory / 1024 / 1024).toFixed(1);



    const cpuModel =
      os.cpus()[0].model;

    const cpuCores =
      os.cpus().length;

    const cpuUsage =
      usage.cpu.toFixed(1);



    let pkgCount = 0;

    try {

      const pkg =
        JSON.parse(
          fs.readFileSync(
            "package.json",
            "utf8"
          )
        );

      pkgCount =
        Object.keys(
          pkg.dependencies || {}
        ).length;

    } catch {}



    const users =
      await usersData.getAll();

    const threads =
      await threadsData.getAll();




    const finalMsg =

`📅 Date : ${formatDate}

⏱ Bot Uptime : ${toTime(process.uptime())}
🖥 System Uptime : ${toTime(os.uptime())}

💻 CPU : ${cpuModel}
⚙ Cores : ${cpuCores}
📊 Usage : ${cpuUsage}%

💾 RAM : ${usedRam} MB / ${totalRam} GB
💾 Free : ${freeRam} GB

📦 Packages : ${pkgCount}

👥 Users : ${users.length}
👨‍👩‍👧 Groups : ${threads.length}

✅ Status : ONLINE & RUNNING🔥 - siyuu's system`;


    api.editMessage(
      finalMsg,
      loadingMsg.messageID
    );


  }

};
