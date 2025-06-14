const axios = require('axios');

// তোমার AI Image Editing API URL (এখানে demo URL দেওয়া হয়েছে)
const EDIT_API_URL = "https://api.example.com/v1/edit"; // <-- প্রকৃত API endpoint বসাও

// তোমার API Key (গোপন রাখো)
const API_KEY = "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";

module.exports.config = {
  name: "refine",
  version: "1.0",
  credits: "dipto + ChatGPT",
  countDown: 5,
  hasPermssion: 1,
  category: "AI",
  commandCategory: "AI",
  description: "Edit an image using AI",
  guide: {
    en: "Reply to an image with: refine [your prompt]"
  }
};

async function handleEdit(api, event, args) {
  const imageUrl = event.messageReply?.attachments?.[0]?.url;
  const prompt = args.join(" ") || "Enhance this image";

  if (!imageUrl) {
    return api.sendMessage("❌ Please reply to an image to edit it.", event.threadID, event.messageID);
  }

  try {
    const response = await axios.post(
      EDIT_API_URL,
      {
        image_url: imageUrl,
        prompt: prompt
      },
      {
        headers: {
          "Authorization": `Bearer ${API_KEY}`,
          "Content-Type": "application/json"
        },
        responseType: "stream",
        validateStatus: () => true
      }
    );

    const contentType = response.headers['content-type'];

    if (contentType?.startsWith("image/")) {
      return api.sendMessage(
        { attachment: response.data },
        event.threadID,
        event.messageID
      );
    }

    // fallback: JSON message
    let responseData = "";
    for await (const chunk of response.data) {
      responseData += chunk.toString();
    }

    const json = JSON.parse(responseData);
    if (json?.message) {
      return api.sendMessage(json.message, event.threadID, event.messageID);
    }

    return api.sendMessage("❌ No valid response from the API.", event.threadID, event.messageID);

  } catch (error) {
    console.error("Edit command error:", error.message);
    return api.sendMessage("❌ Failed to process your request. Try again later.", event.threadID, event.messageID);
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
