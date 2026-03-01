const { config } = global.GoatBot;
const { writeFileSync } = require("fs-extra");

// 👑 OWNER UID (Multiple owners possible)
const OWNER_ID = ["61584554519161", "100070428133686"];

module.exports = {
  config: {
    name: "admin",
    version: "4.1",
    author: "Siyuuu",
    countDown: 5,
    role: 0,
    description: {
      en: "👑 Manage bot admins (Owner-only for add/remove, everyone can list)"
    },
    category: "system",
    guide: {
      en:
        "⚙️  Commands:\n" +
        "• {pn} add <uid | @tag> → Add admin (Owner only)\n" +
        "• {pn} remove <uid | @tag> → Remove admin (Owner only)\n" +
        "• {pn} list → Show all admins (Everyone can use)"
    }
  },

  langs: {  
    en: {  
      noPermission: "🚫 | Only the 👑 Owner can use this command!",  
      added: "✨ | Successfully added admin role for %1 user(s):\n%2",  
      alreadyAdmin: "\n⚠️ | %1 user(s) already have admin role:\n%2",  
      missingIdAdd: "⚠️ | Please provide a UID, reply, or tag to add admin.",  
      removed: "✅ | Removed admin role from %1 user(s):\n%2",  
      notAdmin: "⚠️ | %1 user(s) are not admin:\n%2",  
      missingIdRemove: "⚠️ | Please provide a UID, reply, or tag to remove admin.",  
      listAdmin:
`┏━━━━━━━━━━━━━━━━━━━━━━━┓
┃       🧾 [ ALL ADMINS ]       ┃
┗━━━━━━━━━━━━━━━━━━━━━━━┛

👑 𝗢𝗪𝗡𝗘𝗥(S): 
Evan
Mim

💫 𝗔𝗗𝗠𝗜𝗡𝗦:
%2

━━━━━━━━━━━━━━━━━━━━━━━
🔒 𝗢𝗻𝗹𝘆 𝗢𝘄𝗻𝗲𝗿 𝗰𝗮𝗻 𝘂𝘀𝗲 → admin add / remove`
    }
  },

  onStart: async function ({ message, args, usersData, event, getLang }) {  
    const senderID = event.senderID;  

    // Check if sender is an owner
    const isOwner = OWNER_ID.includes(senderID);

    switch (args[0]) {  
      // ➕ Add admin (Owner only)  
      case "add":  
      case "-a": {  
        if (!isOwner)  
          return message.reply(getLang("noPermission"));  

        if (!args[1] && !Object.keys(event.mentions).length && !event.messageReply)  
          return message.reply(getLang("missingIdAdd"));  

        let uids = [];  
        if (Object.keys(event.mentions).length > 0)  
          uids = Object.keys(event.mentions);  
        else if (event.messageReply)  
          uids.push(event.messageReply.senderID);  
        else  
          uids = args.filter(arg => !isNaN(arg));  

        const notAdminIds = [];  
        const alreadyAdmin = [];  

        for (const uid of uids) {  
          if (config.adminBot.includes(uid))  
            alreadyAdmin.push(uid);  
          else  
            notAdminIds.push(uid);  
        }  

        if (notAdminIds.length > 0)  
          config.adminBot.push(...notAdminIds);  

        writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));  

        const getNames = await Promise.all(  
          uids.map(uid => usersData.getName(uid).then(name => ({ uid, name })))  
        );  

        return message.reply(  
          (notAdminIds.length > 0  
            ? getLang("added", notAdminIds.length, getNames  
              .filter(({ uid }) => notAdminIds.includes(uid))  
              .map(({ uid, name }) => `• ${name} (${uid})`).join("\n"))  
            : "")  
          + (alreadyAdmin.length > 0  
            ? getLang("alreadyAdmin", alreadyAdmin.length, getNames  
              .filter(({ uid }) => alreadyAdmin.includes(uid))  
              .map(({ uid, name }) => `• ${name} (${uid})`).join("\n"))  
            : "")  
        );  
      }  

      // ➖ Remove admin (Owner only)  
      case "remove":  
      case "-r": {  
        if (!isOwner)  
          return message.reply(getLang("noPermission"));  

        if (!args[1] && !Object.keys(event.mentions).length && !event.messageReply)  
          return message.reply(getLang("missingIdRemove"));  

        let uids = [];  
        if (Object.keys(event.mentions).length > 0)  
          uids = Object.keys(event.mentions);  
        else if (event.messageReply)  
          uids.push(event.messageReply.senderID);  
        else  
          uids = args.filter(arg => !isNaN(arg));  

        const removedIds = [];  
        const notAdminIds = [];  

        for (const uid of uids) {  
          if (config.adminBot.includes(uid)) {  
            removedIds.push(uid);  
            config.adminBot.splice(config.adminBot.indexOf(uid), 1);  
          } else {  
            notAdminIds.push(uid);  
          }  
        }  

        writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));  

        const getNames = await Promise.all(  
          uids.map(uid => usersData.getName(uid).then(name => ({ uid, name })))  
        );  

        return message.reply(  
          (removedIds.length > 0  
            ? getLang("removed", removedIds.length, getNames  
              .filter(({ uid }) => removedIds.includes(uid))  
              .map(({ uid, name }) => `• ${name} (${uid})`).join("\n"))  
            : "")  
          + (notAdminIds.length > 0  
            ? getLang("notAdmin", notAdminIds.length, getNames  
              .filter(({ uid }) => notAdminIds.includes(uid))  
              .map(({ uid, name }) => `• ${name} (${uid})`).join("\n"))  
            : "")  
        );  
      }  

      // 📜 List all admins (Everyone can use)  
      case "list":  
      case "-l": {  
        let allAdmins = [...config.adminBot];  

        // Remove owners from admin list if present  
        allAdmins = allAdmins.filter(uid => !OWNER_ID.includes(uid));  

        // Get owner names
        const ownerNames = await Promise.all(
          OWNER_ID.map(uid => usersData.getName(uid).then(name => `• ${name} (${uid})`))
        );

        const adminList = allAdmins.length > 0  
          ? (await Promise.all(allAdmins.map(uid =>  
              usersData.getName(uid).then(name => `• ${name} (${uid})`)  
            ))).join("\n")  
          : "• No other admins added yet.";  

        return message.reply(getLang("listAdmin", ownerNames.join("\n"), OWNER_ID[0], adminList));  
      }  
    }  
  }
};
