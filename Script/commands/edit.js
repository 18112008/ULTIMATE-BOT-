const axios = require('axios');

// ইউজার ইনপুট নেওয়া
const userInput = process.argv[2];

if (!userInput) {
    console.log("❌ দয়া করে প্রম্পট দিন। যেমন:");
    console.log('✅ node edit.js "একটা সিংহের ছবি যেটা টুপি পরেছে"');
    process.exit(1);
}

// AI Image Generator Function
async function generateImage(prompt) {
    try {
        console.log(`📥 আপনার ইনপুট: "${prompt}"`);
        
        // ⚠️ নিচের API টা demo, আপনি নিজের API endpoint ব্যবহার করতে পারেন
        const response = await axios.post("https://fake-ai-image-api.com/generate", {
            prompt: prompt
        });

        const imageUrl = response.data.imageUrl;

        console.log("✅ আপনার এডিটেড ছবি তৈরি হয়েছে:");
        console.log(imageUrl);
    } catch (error) {
        console.error("❌ ছবি তৈরি করতে ব্যর্থ:", error.message);
    }
}

// কল করো
generateImage(userInput);
