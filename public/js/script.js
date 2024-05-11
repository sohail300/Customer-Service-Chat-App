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

        let mediaId = null;

        if (mediaFile) {
            mediaId = await uploadMedia(mediaFile);
            displayMessage('You', 'photo');
            console.log(mediaId)
        }

        if (messageText !== '') {
            displayMessage('You', messageText);
            sendMessage(messageText, mediaId);
        } else if (messageText === '' && mediaFile) {
            console.log(mediaId)
            sendMessage(messageText, mediaId);
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
    async function sendMessage(message, mediaId) {
        try {
            console.log(mediaId)
            const formData = new FormData();
            formData.append('message', message);
            formData.append('mediaId', mediaId);

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

// Function to upload the media and get the mediaId
async function uploadMedia(mediaFile) {
    const accessToken = 'EAALZBuA4gLOwBO7oleQMbs9UM92GcGh3lPaMfazarvJQXGVIOSfZASb8o5CZBmPws0AvLy3fLsfdxk38d58NBB8ZASZAjycue8WOZBp87Rtl4sG71wUFjoe2y1pFuVldv6XHU5KiGN3n3h2rneVtoFIMFT98wWxskNGxS2ZCBHHLNODicwEaFVqtHoXqYfUY9CZCRbthgqx4MvjXksitsRUZD';

    const formData = new FormData();
    formData.append('file', mediaFile);
    formData.append('messaging_product', 'whatsapp');

    const response = await fetch(`https://graph.facebook.com/v19.0/303164166215061/media`, {
        method: 'POST',
        headers: {
            "Authorization": `Bearer ${accessToken}`,
        },
        body: formData
    })
    const responseData = await response.json();
    console.log(responseData.id);

    return responseData.id;
}
