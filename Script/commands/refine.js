const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const https = require("https");

const STABILITY_KEY = "sk-p8IMaKP42j1jPyt77DDxRjPPHkB2X8Aepx6yWJJgP4pOd0eM";
const IMGUR_CLIENT_ID = "546d12c6b3c67d3"; // Replace this if needed

module.exports.config = {
  name: "refine",
  version: "2.0",
  credits: "ChatGPT",
  countDown: 5,
  hasPermssion: 1,
  description: "Edit image using Stability AI",
};

async function uploadToImgur(imageUrl) {
  const tempPath = "/tmp/refine.jpg";
  const file = fs.createWriteStream(tempPath);
  await new Promise((resolve, reject) => {
    https.get(imageUrl, response => {
      response.pipe(file);
      file.on("finish", resolve);
      file.on("error", reject);
    });
  });

  const form = new FormData();
  form.append("image", fs.createReadStream(tempPath));
  const response = await axios.post("https://api.imgur.com/3/image", form, {
    headers: {
      ...form.getHeaders(),
      Authorization: `Client-ID ${IMGUR_CLIENT_ID}`,
    },
  });

  fs.unlinkSync(tempPath);
  return response.data.data.link;
}

async function editImage(api, event, args) {
  const imageUrl = event.messageReply?.attachments?.[0]?.url;
  const prompt = args.join(" ") || "Make it better";

  if (!imageUrl) return api.sendMessage("❌ Please reply to an image.", event.threadID, event.messageID);

  let finalUrl = imageUrl;

  // Upload to imgur if it's Facebook CDN
  if (imageUrl.includes("fbcdn.net")) {
    try {
      finalUrl = await uploadToImgur(imageUrl);
    } catch (err) {
      console.error("❌ Imgur Upload Failed:", err.message);
      return api.sendMessage("❌ Failed to upload image to Imgur.", event.threadID, event.messageID);
    }
  }

  try {
    const response = await axios.post(
      "https://api.stability.ai/v2beta/image-to-image",
      {
        image: finalUrl,
        prompt: prompt,
        output_format: "png",
        strength: 0.65,
        style_preset: "photographic",
      },
      {
        headers: {
          Authorization: `Bearer ${STABILITY_KEY}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        responseType: "stream",
        validateStatus: () => true,
      }
    );

    const type = response.headers["content-type"];

    if (type?.startsWith("image/")) {
      return api.sendMessage({ attachment: response.data }, event.threadID, event.messageID);
    }

    let result = "";
    for await (const chunk of response.data) result += chunk.toString();

    const json = JSON.parse(result);
    console.error("[🔴 STABILITY ERROR]", json);
    return api.sendMessage(`❌ ${json.message || "Image generation failed."}`, event.threadID, event.messageID);

  } catch (err) {
    console.error("❌ API Error:", err.message);
    return api.sendMessage("❌ Something went wrong.", event.threadID, event.messageID);
  }
}

module.exports.run = async function ({ api, event, args }) {
  if (!event.messageReply?.attachments?.length)
    return api.sendMessage("❌ Please reply to an image.", event.threadID, event.messageID);

  await editImage(api, event, args);
};


---
