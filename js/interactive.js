// Scroll Animations
document.addEventListener('DOMContentLoaded', () => {
    // Initialize AOS
    AOS.init({
        duration: 1000,
        once: true,
        offset: 100
    });
});

// Back to Top Button
const backToTopButton = document.createElement('button');
backToTopButton.id = 'back-to-top';
backToTopButton.innerHTML = '<i class="fas fa-arrow-up"></i>';
document.body.appendChild(backToTopButton);

window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
        backToTopButton.classList.add('show');
    } else {
        backToTopButton.classList.remove('show');
    }
});

backToTopButton.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// Loading Animation
window.addEventListener('load', () => {
    const loader = document.querySelector('.loader-wrapper');
    if (loader) {
        loader.classList.add('fade-out');
        setTimeout(() => {
            loader.style.display = 'none';
        }, 1000);
    }
});

// Simple Chatbot
class SimpleChat {
    constructor() {
        this.createChatUI();
        this.responses = {
            'hello': 'Hi there! How can I help you today?',
            'contact': 'You can contact me through the contact form or via email.',
            'projects': 'Check out my projects page to see my latest work!',
            'skills': 'I specialize in web development, using technologies like HTML, CSS, and JavaScript.',
            'default': 'I apologize, but I\'m not sure how to help with that. Please check the contact page for direct communication.'
        };
    }

    createChatUI() {
        const chatContainer = document.createElement('div');
        chatContainer.className = 'chat-container';
        chatContainer.innerHTML = `
            <div class="chat-icon" id="chat-icon">
                <i class="fas fa-comments"></i>
            </div>
            <div class="chat-box" id="chat-box">
                <div class="chat-header">
                    <h4>Chat Assistant</h4>
                    <button class="close-chat">×</button>
                </div>
                <div class="chat-messages" id="chat-messages">
                    <div class="bot-message">Hi! How can I help you today?</div>
                </div>
                <div class="chat-input">
                    <input type="text" id="user-input" placeholder="Type your message...">
                    <button id="send-message"><i class="fas fa-paper-plane"></i></button>
                </div>
            </div>
        `;
        document.body.appendChild(chatContainer);

        this.initializeEventListeners();
    }

    initializeEventListeners() {
        const chatIcon = document.getElementById('chat-icon');
        const chatBox = document.getElementById('chat-box');
        const closeChat = document.querySelector('.close-chat');
        const sendButton = document.getElementById('send-message');
        const userInput = document.getElementById('user-input');

        chatIcon.addEventListener('click', () => {
            chatBox.classList.toggle('show');
            chatIcon.classList.toggle('hide');
        });

        closeChat.addEventListener('click', () => {
            chatBox.classList.remove('show');
            chatIcon.classList.remove('hide');
        });

        sendButton.addEventListener('click', () => this.handleUserInput());
        userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleUserInput();
            }
        });
    }

    handleUserInput() {
        const userInput = document.getElementById('user-input');
        const message = userInput.value.trim().toLowerCase();
        if (!message) return;

        this.addMessage('user', userInput.value);
        userInput.value = '';

        // Simple response logic
        let response = this.responses.default;
        for (let key in this.responses) {
            if (message.includes(key)) {
                response = this.responses[key];
                break;
            }
        }

        setTimeout(() => {
            this.addMessage('bot', response);
        }, 500);
    }

    addMessage(type, message) {
        const messagesContainer = document.getElementById('chat-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = type === 'user' ? 'user-message' : 'bot-message';
        messageDiv.textContent = message;
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
}

// Initialize chatbot
document.addEventListener('DOMContentLoaded', () => {
    new SimpleChat();
}); 