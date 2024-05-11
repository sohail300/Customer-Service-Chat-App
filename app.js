const express = require('express');
const path = require('path');
const bodyParser = require('body-parser')
const multer = require('multer')
const http = require('http');
const { Server } = require("socket.io");

const { sendMessage } = require('./controllers/sendMessages');
const { webhook } = require('./controllers/webhook');
const { setupWebhook } = require('./controllers/setupWebhook');

const upload = multer();

const app = express();
app.use(bodyParser.json())

const server = http.createServer(app);
const io = new Server(server);

// Handle WebSocket connections
io.on('connection', (socket) => {
    console.log('Client connected');

    // Handle events from the client
    socket.on('message', (data) => {
        console.log('Client message:', data);
        // You can broadcast the message to all clients
        io.emit('message', data);
    });

    // Handle client disconnection
    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Endpoint to send a message via WhatsApp
app.post('/send-message', upload.fields([{ name: 'message', maxCount: 1 }, { name: 'media', maxCount: 1 }]), sendMessage);

// Endpoint to for webhook
app.post("/webhook", webhook);

// accepts GET requests at the /webhook endpoint. You need this URL to setup webhook initially.
app.get("/webhook", setupWebhook);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});