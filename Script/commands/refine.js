const axios = require('axios');

const STABILITY_API_KEY = "sk-p8IMaKP42j1jPyt77DDxRjPPHkB2X8Aepx6yWJJgP4pOd0eM"; // তোমার API Key

module.exports.config = {
  name: "refine",
  version: "1.0",
  credits: "ChatGPT + Dipto",
  countDown: 5,
  hasPermssion: 1,
  category: "AI",
  commandCategory: "AI",
  description: "Edit images using Stability AI",
  guide: {
    en: "Reply to an image with: refine [your prompt here]"
  }
};

async function handleEdit(api, event, args) {
  const imageUrl = event.messageReply?.attachments?.[0]?.url;
  const prompt = args.join(" ") || "Make it better";

  if (!imageUrl) {
    return api.sendMessage("❌ Please reply to an image to edit it.", event.threadID, event.messageID);
  }

  try {
    const response = await axios.post(
      'https://api.stability.ai/v2beta/image-to-image',
      {
        image: imageUrl,
        prompt: prompt,
        output_format: "png"
      },
      {
        headers: {
          Authorization: `Bearer ${STABILITY_API_KEY}`,
          Accept: "application/json",
          "Content-Type": "application/json"
        },
        responseType: "stream",
        validateStatus: () => true
      }
    );

    if (response.headers['content-type']?.startsWith("image/")) {
      return api.sendMessage({ attachment: response.data }, event.threadID, event.messageID);
    }

    let result = "";
    for await (const chunk of response.data) {
      result += chunk.toString();
    }

    const json = JSON.parse(result);
    if (json?.message) {
      return api.sendMessage(`⚠️ ${json.message}`, event.threadID, event.messageID);
    }

    return api.sendMessage("❌ No image received from AI.", event.threadID, event.messageID);

  } catch (err) {
    console.error("Refine error:", err.message);
    return api.sendMessage("❌ Failed to connect to Stability AI. Try again later.", event.threadID, event.messageID);
  }
}

module.exports.run = async ({ api, event, args }) => {
  if (!event.messageReply || !event.messageReply.attachments?.length) {
    return api.sendMessage("❌ Please reply to an image.", event.threadID, event.messageID);
  }

  await handleEdit(api, event, args);
};

module.exports.handleReply = async function ({ api, event, args }) {
  await handleEdit(api, event, args);
};
