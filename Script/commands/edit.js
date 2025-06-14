const axios = require('axios');

// ইউজার প্রম্পট ইনপুট নেওয়া
const userInput = process.argv[2];

if (!userInput) {
    console.log("❌ ইনপুট দেন ভাই!");
    console.log('✅ ব্যবহার করুন: node edit.js "একটা বিড়াল যেটা চশমা পরে আছে"');
    process.exit(1);
}

// ⛳ API KEY (আপনার দেওয়া key সেট করা)
const API_KEY = "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";

// AI Image Generator Function
async function generateImage(prompt) {
    try {
        console.log(`📥 আপনার ইনপুট: "${prompt}"`);

        const response = await axios.post('https://api.openai.com/v1/images/generations', {
            prompt: prompt,
            n: 1,
            size: "512x512"
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            }
        });

        const imageUrl = response.data.data[0].url;
        console.log("✅ আপনার এডিটেড ছবি তৈরি হয়েছে:");
        console.log(imageUrl);
    } catch (error) {
        console.error("❌ ছবি বানাতে সমস্যা হয়েছে:", error.response?.data || error.message);
    }
}

// কল করুন
generateImage(userInput);


---
