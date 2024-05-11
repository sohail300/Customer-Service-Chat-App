const axios = require('axios');
const dotenv = require('dotenv');
const WebSocket = require('ws');
dotenv.config({});

// Set up WebSocket server
const wss = new WebSocket.Server({ port: 8080 });

// Store connected clients
const clients = [];

// WebSocket server event handlers
wss.on('connection', (ws) => {
    clients.push(ws);
    console.log('Client connected');

    ws.on('close', () => {
        clients.splice(clients.indexOf(ws), 1);
        console.log('Client disconnected');
    });
});

// Error handling
wss.on('error', (error) => {
    console.error('WebSocket server error:', error);
});

const { WEBHOOK_VERIFY_TOKEN, GRAPH_API_TOKEN } = process.env;

async function webhook(req, res) {
    // log incoming messages
    console.log("Incoming webhook message:", JSON.stringify(req.body, null, 2));

    // check if the webhook request contains a message
    const message = req.body.entry?.[0]?.changes[0]?.value?.messages?.[0];

    // check if the incoming message contains text
    if (message?.type === "text") {

        // extract the business number to send the reply from it
        const business_phone_number_id =
            req.body.entry?.[0].changes?.[0].value?.metadata?.phone_number_id;

        clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(message.text.body));
            }
        });

        // mark incoming message as read
        await axios({
            method: "POST",
            url: `https://graph.facebook.com/v18.0/${business_phone_number_id}/messages`,
            headers: {
                Authorization: `Bearer ${GRAPH_API_TOKEN}`,
            },
            data: {
                messaging_product: "whatsapp",
                status: "read",
                message_id: message.id,
            },
        });
    }

    // check if the incoming message contains text
    if (message?.type === "image") {

        // extract the business number to send the reply from it
        const business_phone_number_id =
            req.body.entry?.[0].changes?.[0].value?.metadata?.phone_number_id;

        await axios({
            method: "POST",
            url: `https://graph.facebook.com/v18.0/${business_phone_number_id}/messages`,
            headers: {
                Authorization: `Bearer ${GRAPH_API_TOKEN}`,
            },
            data: {
                messaging_product: "whatsapp",
                to: message.from,
                "type": "image",
                "image": {
                    "id": message.image.id
                }
            },
        });

        clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(message.text.body));
            }
        });

        // mark incoming message as read
        await axios({
            method: "POST",
            url: `https://graph.facebook.com/v18.0/${business_phone_number_id}/messages`,
            headers: {
                Authorization: `Bearer ${GRAPH_API_TOKEN}`,
            },
            data: {
                messaging_product: "whatsapp",
                status: "read",
                message_id: message.id,
            },
        });
    }


    res.sendStatus(200);
}

module.exports = { webhook };