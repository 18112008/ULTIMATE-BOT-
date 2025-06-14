const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports.config = {
  name: 'cartoon',
  version: '1.0.0',
  hasPermssion: 0,
  credits: 'OpenAI + You',
  description: 'Convert image to cartoon using free AI',
  commandCategory: 'image',
  usages: 'Reply to an image',
  cooldowns: 5,
};

module.exports.run = async function ({ api, event }) {
  const { messageReply, threadID, messageID } = event;

  if (!messageReply || !messageReply.attachments || messageReply.attachments[0].type !== 'photo') {
    return api.sendMessage('❌ Please reply to a photo.', threadID, messageID);
  }

  const imageUrl = messageReply.attachments[0].url;
  const tempFile = path.join(__dirname, '/cache/cartoon.png');

  try {
    api.sendMessage('🎨 Converting to cartoon, please wait...', threadID, messageID);

    const response = await axios.post(
      'https://api.rthdr.com/cartoonify',
      { image: imageUrl },
      { responseType: 'arraybuffer' }
    );

    fs.writeFileSync(tempFile, response.data);

    api.sendMessage({
      body: '✅ Cartoonified image!',
      attachment: fs.createReadStream(tempFile)
    }, threadID, () => fs.unlinkSync(tempFile), messageID);

  } catch (err) {
    console.error(err);
    api.sendMessage('❌ Error cartoonifying image: ' + err.message, threadID, messageID);
  }
};
