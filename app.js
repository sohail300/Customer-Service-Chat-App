const express = require('express');
const path = require('path');
const bodyParser = require('body-parser')
const multer = require('multer')
const http = require('http');
const { sendMessage } = require('./controllers/sendMessages');
const { webhook } = require('./controllers/webhook');
const { setupWebhook } = require('./controllers/setupWebhook');

// Set up multer to handle multipart/form-data
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const app = express();
app.use(bodyParser.json())

app.use(express.static(path.join(__dirname, 'public')));

// Endpoint to send a message to WhatsApp
app.post('/send-message', upload.fields([{ name: 'message' }, { name: 'file' }]), sendMessage);

// Endpoint for webhook
app.post("/webhook", webhook);

// accepts GET requests at the /webhook endpoint. We need this URL to setup webhook initially.
app.get("/webhook", setupWebhook);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});