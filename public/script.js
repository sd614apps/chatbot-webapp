const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");

function sendMessage() {
    
    // User Message
    const userMessage = `<div style="text-align:right; margin:10px;">${userInput.value}</div>`;
    chatBox.innerHTML += userMessage;
    
    // Bot Response
    let botMessage = "I'm sorry, I don't understand.";
    const userQuestion = userInput.value.toLowerCase().trim();
    if (userQuestion === 'hello') {
        botMessage = "Hi there!";
    } else if (userQuestion === 'how are you?') {
        botMessage = "I'm good, thanks for asking!";
    } else if (userQuestion === 'what is your name?') {
        botMessage = "I'm a chatbot created by ChatGPT!";
    } else if (userQuestion === 'what can you do?') {
        botMessage = "I can answer simple questions and have a chat with you!";
    } else if (userQuestion === 'where are you from?') {
        botMessage = "I'm from the digital world!";
    } else if (userQuestion.startsWith('tell me a joke')) {
        botMessage = "Why don't scientists trust atoms? Because they make up everything!";
    } else if (userQuestion.startsWith('what is the weather in')) {
        const city = userQuestion.substring(23);
        botMessage = `I'm sorry, I can't fetch the weather for ${city} right now. Please check a weather website.`;
    } else if (userQuestion === 'goodbye') {
        botMessage = "Goodbye! Have a great day!";
    }
    setTimeout(() => {
        chatBox.innerHTML += `<div style="text-align:left; margin:10px;">${botMessage}</div>`;
    }, 1000);

    // Store chat messages
    storeChat(userInput.value, botMessage);
  
    // Clear the input field
    userInput.value = '';
  
    // Scroll to the bottom of the chat
    chatBox.scrollTop = chatBox.scrollHeight;
}

function storeChat(userMessage, botMessage) {
  fetch('/store-chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userMessage, botMessage }),
  });
}

// Load past chats when the page loads
window.onload = () => {
  fetch('/get-chats')
    .then((response) => {
        if (response.status === 403) {
          alert('Please log in to access chats.');
          window.location.href = '/login.html'; // Redirect to login page if not authenticated
          return;
        }
        return response.json();
    })
    .then((chats) => {
        if (chats) {
            chats.forEach((chat) => {
                const userMessage = `<div style="text-align:right; margin:10px;">${chat.user_message}</div>`;
                const botMessage = `<div style="text-align:left; margin:10px;">${chat.bot_message}</div>`;
                chatBox.innerHTML += userMessage + botMessage;
            });
            chatBox.scrollTop = chatBox.scrollHeight;
        }
    })
    .catch((error) => alert(error.message));
};

// Allow pressing enter to send messages
document.getElementById("user-input").addEventListener("keyup", function(event) {
    if (event.key === "Enter") {
        sendMessage();
    }
});
