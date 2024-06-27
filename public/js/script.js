document.addEventListener('DOMContentLoaded', function () {
    const messageForm = document.getElementById('message-form');
    const messageInput = document.getElementById('message');
    const mediaInput = document.getElementById('media');
    const messageDisplay = document.getElementById('message-display');

    // Handling Web Socket to load the messages sent by the user
    const ws = new WebSocket('ws://localhost:8080');

    ws.onmessage = function (event) {
        const messageData = JSON.parse(event.data);

        const messageElement = document.createElement('div');
        messageElement.classList.add('message');
        messageElement.innerHTML = `<strong>Customer Service: </strong> ${messageData}`;
        messageDisplay.appendChild(messageElement);
    };

    // When submiting the form, we will get the message and mediaFile. We uplaod the mediaFile to get the mediaId and then use the message and mediaId to send the required things to whatsapp
    messageForm.addEventListener('submit', async function (event) {
        event.preventDefault();
        const messageText = messageInput.value.trim();
        const mediaFile = mediaInput.files[0];

        if (mediaFile) {
            displayMessage('You', 'photo');
        }

        if (messageText !== '') {
            displayMessage('You', messageText);
        }

        if (messageText !== '' || mediaFile) {
            sendMessage(messageText, mediaFile);
        }
        // Clear the input fields
        messageInput.value = '';
        mediaInput.value = '';
    });

    // For handling the UI part
    function displayMessage(sender, message) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message');
        messageElement.innerHTML = `<strong>${sender}:</strong> ${message}`;
        messageDisplay.appendChild(messageElement);
    }

    // Function to send message and mediaId to the backend
    async function sendMessage(message, media) {
        try {
            const formData = new FormData();
            formData.append('message', message);
            formData.append('file', media);

            const response = await fetch('/send-message', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                console.log('Message sent successfully');
            } else {
                console.error('Failed to send message:', response.statusText);
            }
        } catch (error) {
            console.error('Error sending message:', error.message);
        }
    }
});
