const axios = require('axios');
const dotenv = require('dotenv');
const FormData = require('form-data');

dotenv.config();
const accessToken = process.env.GRAPH_API_TOKEN;

async function sendMessage(req, res) {
    try {
        const message = req.body.message;
        const media = req.files?.file?.[0];

        console.log(media)
        console.log(message)

        let mediaId = null;
        if (media) {
            mediaId = await uploadMedia(media);
        }

        console.log(mediaId)

        if (message !== '') {
            sendTextMessage(message);
        }

        if (mediaId !== null) {
            console.log('1')
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

// Function to upload the media and get the mediaId
async function uploadMedia(mediaFile) {
    const apiUrlUpload = `https://graph.facebook.com/v19.0/${process.env.BUSINESS_PHONE_NUMBER_ID}/media`;
    console.log(apiUrlUpload)

    const form = new FormData();
    console.log('running')
    form.append('file', mediaFile.buffer, {
        filename: mediaFile.originalname,
        contentType: mediaFile.mimetype
    });
    form.append('messaging_product', 'whatsapp');

    const response = await axios.post(apiUrlUpload, form, {
        headers: {
            "Authorization": `Bearer ${accessToken}`,
        }
    })

    console.log(response.data.id);
    return response.data.id;
}

module.exports = { sendMessage }