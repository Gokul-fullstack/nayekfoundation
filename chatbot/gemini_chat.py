"""
NayePankh 3D Volunteer Nexus — Gemini AI Chatbot
Uses Google Generative AI (Gemini) for conversational responses.
"""

import os
import google.generativeai as genai

SYSTEM_PROMPT = (
    "You are NayePankh Foundation's friendly AI assistant. "
    'NayePankh ("New Wings") is a youth-driven Indian NGO founded in 2020. '
    "Focus areas: Education, Healthcare, Environment, Food Distribution, Clothing, Youth Engagement. "
    "200,000+ people helped. Always be warm, helpful, and encourage volunteering. "
    "Keep responses concise (2-3 sentences). "
    "Contact: contact@nayepankh.com, +91-8318500748."
)


def _get_suggestions(message):
    """Return contextual quick-reply suggestions based on the user message."""
    msg = message.lower()
    if any(w in msg for w in ['volunteer', 'join', 'register']):
        return ['How do I register?', 'What skills are needed?', 'Tell me about events']
    if any(w in msg for w in ['donate', 'contribution', 'fund']):
        return ['How can I donate?', 'Is donation tax-free?', 'Other ways to help']
    if any(w in msg for w in ['event', 'campaign', 'drive']):
        return ['Upcoming events', 'How to organize an event?', 'Past campaigns']
    if any(w in msg for w in ['education', 'school', 'teach']):
        return ['Education initiatives', 'How to volunteer for teaching?', 'Donate books']
    if any(w in msg for w in ['health', 'medical', 'camp']):
        return ['Health camps', 'Blood donation drives', 'Medical volunteering']
    return ['Tell me about NayePankh', 'How can I volunteer?', 'Upcoming events']


def chat_with_gemini(message, history=None):
    """
    Send a message to Gemini and return a reply with suggestions.

    Returns
    -------
    dict  {reply, suggestions}  or  None on failure.
    """
    api_key = os.environ.get('GEMINI_API_KEY', '')
    if not api_key:
        return None

    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-1.5-flash')

        # Build conversation context
        chat_history = []
        if history:
            for msg in history:
                role = 'user' if msg.get('role') == 'user' else 'model'
                chat_history.append({'role': role, 'parts': [msg.get('content', '')]})

        chat = model.start_chat(history=chat_history)

        # Prepend system prompt to the first user message
        prompt = f"{SYSTEM_PROMPT}\n\nUser: {message}"
        response = chat.send_message(prompt)

        reply = response.text.strip()
        suggestions = _get_suggestions(message)

        return {
            'reply': reply,
            'suggestions': suggestions,
        }
    except Exception as exc:
        print(f"[Gemini Error] {exc}")
        return None
