/* ============================================================
   chatbot-ui.js — Chatbot UI Controller
   NayePankh 3D Volunteer Nexus
   ============================================================ */

(function () {
  'use strict';

  /* ---------- DOM refs ---------- */
  var fab = document.querySelector('.chatbot-fab');
  var chatWindow = document.querySelector('.chatbot-window');
  if (!fab || !chatWindow) return;

  var messagesContainer = chatWindow.querySelector('.chatbot-messages');
  var input = chatWindow.querySelector('.chatbot-input input, .chatbot-input-field');
  var sendBtn = chatWindow.querySelector('.chatbot-send, .chatbot-input button');
  var closeBtn = chatWindow.querySelector('.chatbot-close');

  /* ---------- Session ---------- */
  var sessionId = 'session_' + Math.random().toString(36).substring(2, 12);
  var hasGreeted = false;

  /* ---------- Toggle Window ---------- */
  fab.addEventListener('click', function () {
    chatWindow.classList.toggle('active');
    if (chatWindow.classList.contains('active') && !hasGreeted) {
      hasGreeted = true;
      setTimeout(function () {
        addMessage("Hi! 👋 I'm NayePankh's AI assistant. How can I help you today?", 'bot');
        addSuggestions([
          'How can I volunteer?',
          'Tell me about NayePankh',
          'Upcoming events'
        ]);
      }, 400);
    }
    if (chatWindow.classList.contains('active') && input) {
      input.focus();
    }
  });

  /* ---------- Close Button ---------- */
  if (closeBtn) {
    closeBtn.addEventListener('click', function () {
      chatWindow.classList.remove('active');
    });
  }

  /* ---------- Send Message ---------- */
  function handleSend() {
    if (!input) return;
    var text = input.value.trim();
    if (!text) return;
    input.value = '';
    sendMessage(text);
  }

  if (sendBtn) {
    sendBtn.addEventListener('click', handleSend);
  }

  if (input) {
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSend();
      }
    });
  }

  /* ---------- Send & receive ---------- */
  function sendMessage(text) {
    addMessage(text, 'user');

    // Remove any existing suggestions
    removeSuggestions();

    var typingEl = showTyping();

    fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text, session_id: sessionId })
    })
      .then(function (res) { return res.json(); })
      .then(function (data) {
        removeTyping(typingEl);
        var reply = data.reply || data.response || data.message || "I'm sorry, I couldn't process that. Please try again.";
        addMessage(reply, 'bot');

        if (data.suggestions && data.suggestions.length) {
          addSuggestions(data.suggestions);
        }
      })
      .catch(function () {
        removeTyping(typingEl);
        addMessage("Oops! Something went wrong. Please try again later.", 'bot');
      });
  }

  /* ---------- Add Message Bubble ---------- */
  function addMessage(text, sender) {
    if (!messagesContainer) return;

    var wrapper = document.createElement('div');
    wrapper.className = 'chat-message ' + sender;

    var bubble = document.createElement('div');
    bubble.className = 'chat-bubble';
    bubble.textContent = text;

    wrapper.appendChild(bubble);
    messagesContainer.appendChild(wrapper);
    scrollToBottom();
  }

  /* ---------- Typing Indicator ---------- */
  function showTyping() {
    if (!messagesContainer) return null;

    var wrapper = document.createElement('div');
    wrapper.className = 'chat-message bot typing-indicator';

    var bubble = document.createElement('div');
    bubble.className = 'chat-bubble';
    bubble.innerHTML = '<span class="dot"></span><span class="dot"></span><span class="dot"></span>';

    wrapper.appendChild(bubble);
    messagesContainer.appendChild(wrapper);
    scrollToBottom();
    return wrapper;
  }

  function removeTyping(el) {
    if (el && el.parentNode) {
      el.parentNode.removeChild(el);
    }
  }

  /* ---------- Suggestions ---------- */
  function addSuggestions(items) {
    if (!messagesContainer || !items || !items.length) return;

    var container = document.createElement('div');
    container.className = 'chat-suggestions';

    items.forEach(function (text) {
      var btn = document.createElement('button');
      btn.className = 'chat-suggestion-btn';
      btn.textContent = text;
      btn.addEventListener('click', function () {
        if (input) input.value = text;
        handleSend();
      });
      container.appendChild(btn);
    });

    messagesContainer.appendChild(container);
    scrollToBottom();
  }

  function removeSuggestions() {
    if (!messagesContainer) return;
    var existing = messagesContainer.querySelectorAll('.chat-suggestions');
    existing.forEach(function (el) { el.remove(); });
  }

  /* ---------- Scroll to Bottom ---------- */
  function scrollToBottom() {
    if (!messagesContainer) return;
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }
})();
