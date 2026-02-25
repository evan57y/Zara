const axios = require("axios");

module.exports = {
	config: {
		name: "ai",
		aliases: ["ais"],
		version: "1.0",
		author: "siyuuu",
		countDown: 5,
		role: 0,
		shortDescription: "Chat with AI",
		longDescription: "Send a message and get a friendly AI response along with related suggestions.",
		category: "ai",
		guide: {
			en: "{pn} <your message>"
		}
	},

	langs: {
		en: {
			noInput: "⚠️ Please type something to ask.",
			loading: "⏳ Fetching AI response...",
			error: "❌ Failed to get response from AI."
		}
	},

	onStart: async function ({ message, args, getLang }) {
		// Combine arguments into a single input string
		const input = args.join(" ");
		if (!input) return message.reply(getLang("noInput"));

		// Notify user that AI is processing
		message.reply(getLang("loading"));

		try {
			// API call to AI service
			const apiUrl = `https://betadash-api-swordslush-production.up.railway.app/you?chat=${encodeURIComponent(input)}`;
			const res = await axios.get(apiUrl);
			const data = res.data;

			// Check if AI response exists
			if (!data || !data.response) return message.reply(getLang("error"));

			// Format related suggestions if available
			const related = data.relatedSearch?.length
				? "\n\n💡 Related suggestions:\n" + data.relatedSearch.map((r) => `• ${r}`).join("\n")
				: "";

			// Send final AI response
			return message.reply(`🧠 ${data.response}${related}`);
		} catch (err) {
			console.error("YouAI Error:", err.message || err);
			return message.reply(getLang("error"));
		}
	}
};
