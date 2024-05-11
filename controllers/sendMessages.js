const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config({});
const accessToken = process.env.GRAPH_API_TOKEN;

async function sendMessage(req, res) {
    try {
        const message = req.body.message;
        const mediaId = req.body.mediaId;
        console.log(mediaId)
        console.log(typeof(mediaId))

        if (message !== '') {
            sendTextMessage(message);
        }

        if (mediaId!=='null') {
            sendMedia(mediaId);
        }

        res.send('Msg sent successfully');
    } catch (error) {
        console.error('Error sending message:', error.message);
        res.status(500).send('Error sending message');
    }
}

async function sendTextMessage(message) {
    const apiUrl = `https://graph.facebook.com/v19.0/${process.env.BUSINESS_PHONE_NUMBER_ID}/messages`;

    const messageData = JSON.stringify({
        "messaging_product": "whatsapp",
        "preview_url": false,
        "recipient_type": "individual",
        to: '+916206591116',
        "type": "text",
        "text": {
            "body": message
        }
    });

    const response = await axios.post(apiUrl, messageData, {
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        }
    });

    console.log('Message sent successfully:', response.data);

}

async function sendMedia(mediaId) {
    const apiUrl = `https://graph.facebook.com/v19.0/${process.env.BUSINESS_PHONE_NUMBER_ID}/messages`;
    console.log(mediaId)

    const messageDataMedia = JSON.stringify({
        "messaging_product": "whatsapp",
        "recipient_type": "individual",
        to: '+916206591116',
        "type": "image",
        "image": {
            "id": mediaId
        }
    });

    const responseMedia = await axios.post(apiUrl, messageDataMedia, {
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        }
    });

    console.log('Message sent successfully:', responseMedia);
}

module.exports = { sendMessage }