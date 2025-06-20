// commands/g.js
const axios = require("axios");

module.exports = {
  config: {
    name: "g",
    version: "1.0",
    description: "Grok AI chatbot + image gen/edit",
    usage: "/g <prompt>",
    commandCategory: "ai",
    hasPrefix: true,
    credits: "AnikAI"
  },

  onStart: async function({ api, event, args }) {
    try {
      const prompt = args.join(" ").trim();
      const reply = event.messageReply;
      const threadID = event.threadID;
      console.log("⚡ /g triggered with prompt:", prompt);

      if (!prompt) {
        return api.sendMessage("❗ Please provide a prompt after /g", threadID);
      }

      // Image reply → edit
      if (reply && reply.attachments && reply.attachments[0]?.type === "photo") {
        const imageUrl = reply.attachments[0].url;
        const res = await axios.post("https://api.grok.com/edit-image", {
          prompt,
          image: imageUrl
        }, {
          headers: { Authorization: "Bearer xai-ZuWv98wADpXf4BxRfQQGxeaMaMqMpVvxyI9ZZuuzsqu0p4N6HuaxyjEi2L6g32l00Vsm15bpaehmZPIp" }
        });

        const imgStream = await axios.get(res.data.image_url, { responseType: "stream" });
        return api.sendMessage({
          body: `🎨 Edited Image: ${prompt}`,
          attachment: imgStream.data
        }, threadID);
      }

      // Prompt contains image or photo → new image gen
      if (/image|photo/i.test(prompt)) {
        const res = await axios.post("https://api.grok.com/generate-image", {
          prompt
        }, {
          headers: { Authorization: "Bearer xai-ZuWv98wADpXf4BxRfQQGxeaMaMqMpVvxyI9ZZuuzsqu0p4N6HuaxyjEi2L6g32l00Vsm15bpaehmZPIp" }
        });

        const imgStream = await axios.get(res.data.image_url, { responseType: "stream" });
        return api.sendMessage({
          body: `🖼️ Generated Image: ${prompt}`,
          attachment: imgStream.data
        }, threadID);
      }

      // Else → regular chat reply
      const replyRes = await axios.post("https://api.grok.com/chat", {
        prompt
      }, {
        headers: { Authorization: "Bearer xai-ZuWv98wADpXf4BxRfQQGxeaMaMqMpVvxyI9ZZuuzsqu0p4N6HuaxyjEi2L6g32l00Vsm15bpaehmZPIp" }
      });

      return api.sendMessage(replyRes.data.response, threadID);
    } catch (err) {
      console.error("❌ Error in /g:", err);
      return api.sendMessage("⚠️ Sorry, something went wrong with the `/g` command.", event.threadID);
    }
  }
};


---
