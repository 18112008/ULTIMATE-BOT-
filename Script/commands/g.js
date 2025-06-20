const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "g",
    version: "1.0",
    description: "Grok AI reply and image",
    usage: "/g prompt or reply image",
    commandCategory: "ai",
    hasPrefix: true,
    credits: "AnikAI"
  },

  onStart: async function ({ api, event, args }) {
    const prompt = args.join(" ");
    const reply = event.messageReply;
    const threadID = event.threadID;

    // Image reply detected
    if (reply && reply.attachments[0]?.type === "photo") {
      const imageUrl = reply.attachments[0].url;

      // Send image to Grok for edit
      const imageResponse = await axios.post("https://api.grok.com/edit-image", {
        prompt,
        image: imageUrl
      }, {
        headers: { Authorization: "Bearer xai-ZuWv98wADpXf4BxRfQQGxeaMaMqMpVvxyI9ZZuuzsqu0p4N6HuaxyjEi2L6g32l00Vsm15bpaehmZPIp" }
      });

      const image = await axios.get(imageResponse.data.image_url, { responseType: "stream" });
      return api.sendMessage({
        body: `🎨 Edited with: ${prompt}`,
        attachment: image.data
      }, threadID);
    }

    // If prompt includes "image", generate new image
    if (prompt.toLowerCase().includes("image") || prompt.toLowerCase().includes("photo")) {
      const genResponse = await axios.post("https://api.grok.com/generate-image", {
        prompt
      }, {
        headers: { Authorization: "Bearer xai-ZuWv98wADpXf4BxRfQQGxeaMaMqMpVvxyI9ZZuuzsqu0p4N6HuaxyjEi2L6g32l00Vsm15bpaehmZPIp" }
      });

      const image = await axios.get(genResponse.data.image_url, { responseType: "stream" });
      return api.sendMessage({
        body: `🖼️ Image for: ${prompt}`,
        attachment: image.data
      }, threadID);
    }

    // Normal text reply from Grok
    const replyResponse = await axios.post("https://api.grok.com/chat", {
      prompt
    }, {
      headers: { Authorization: "Bearer xai-ZuWv98wADpXf4BxRfQQGxeaMaMqMpVvxyI9ZZuuzsqu0p4N6HuaxyjEi2L6g32l00Vsm15bpaehmZPIp" }
    });

    return api.sendMessage(replyResponse.data.response, threadID);
  }
};
