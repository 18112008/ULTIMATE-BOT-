const { Telegraf } = require("telegraf");
const fetch = require("node-fetch");

const bot = new Telegraf("YOUR_BOT_TOKEN"); // 👈 Replace with your Telegram/Messenger bot token
const STABILITY_API_KEY = "sk-8UO7ko4CYhmo8ktG0CbUq2K07pRh5qd8Uea5QXfD6h1FGjk5";

// Common image generation function
async function generateImage(ctx, stylePrompt) {
  const repliedPhoto = ctx.message?.reply_to_message?.photo?.pop();
  if (!repliedPhoto) return ctx.reply("📸 Reply kore photo dao!");

  const file = await ctx.telegram.getFileLink(repliedPhoto.file_id);
  ctx.reply("🧠 AI edit korche... please wait 5-10 sec");

  const response = await fetch("https://api.stability.ai/v1/generation/image-to-image", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${STABILITY_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      init_image: file.href,
      prompt: stylePrompt,
      cfg_scale: 7,
      strength: 0.6
    })
  });

  try {
    const data = await response.json();
    const imageUrl = data.artifacts?.[0]?.url;

    if (imageUrl) {
      ctx.replyWithPhoto({ url: imageUrl });
    } else {
      ctx.reply("❌ Fail hoise. Try again.");
    }
  } catch (err) {
    ctx.reply("🚫 Error hoye gese. API thik ache to check koro.");
  }
}

// 👇 Commands
bot.command("cartoon", (ctx) =>
  generateImage(ctx, "Pixar style cartoon, colorful, smooth lines, clean background")
);

bot.command("sketch", (ctx) =>
  generateImage(ctx, "black and white pencil sketch, shading, realistic drawing")
);

bot.command("animefy", (ctx) =>
  generateImage(ctx, "anime style face, soft light, clean background, pastel colors")
);

// Start the bot
bot.launch();
console.log("🤖 Bot is running...");
