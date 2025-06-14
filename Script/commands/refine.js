const express = require("express");
const bodyParser = require("body-parser");
const fetch = require("node-fetch");

const app = express();
app.use(bodyParser.json({ limit: "10mb" }));

const API_KEY = "sk-8UO7ko4CYhmo8ktG0CbUq2K07pRh5qd8Uea5QXfD6h1FGjk5";

app.post("/webhook", async (req, res) => {
  const message = req.body.message;     // User message (e.g., /refine add sunglasses)
  const image = req.body.image_base64;  // Base64 encoded image string

  if (message.startsWith("/refine")) {
    const prompt = message.replace("/refine", "").trim();
    try {
      const editedImage = await editImageWithStability(image, prompt);
      res.json({
        reply: "🖼️ Image edited successfully!",
        image: editedImage
      });
    } catch (error) {
      res.json({ reply: "❌ Error editing image." });
    }
  } else {
    res.json({ reply: "Unknown command. Use /refine <prompt>" });
  }
});

async function editImageWithStability(base64Image, prompt) {
  const response = await fetch("https://api.stability.ai/v2beta/stable-image/edit", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      image: base64Image,
      prompt: prompt,
      output_format: "base64"
    })
  });

  const data = await response.json();
  if (data.image) {
    return `data:image/jpeg;base64,${data.image}`;
  } else {
    throw new Error("Image edit failed");
  }
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🔥 Bot running on port ${PORT}`);
});


---
