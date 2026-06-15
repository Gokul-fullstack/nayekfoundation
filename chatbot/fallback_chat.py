"""
NayePankh 3D Volunteer Nexus — Rule-based Fallback Chatbot
Used when Gemini API is unavailable or not configured.
"""

_RESPONSES = {
    'volunteer': {
        'reply': (
            "We'd love to have you as a volunteer! 🙌 NayePankh Foundation welcomes volunteers "
            "in Education, Healthcare, Environment, Food Distribution, and more. "
            "Click the 'Register' button to sign up, or visit our registration page."
        ),
        'suggestions': ['How do I register?', 'What skills are needed?', 'Tell me about events'],
    },
    'join': {
        'reply': (
            "Joining NayePankh is easy! Simply register on our platform with your details and skills. "
            "Our team will review your application, and you'll be matched with initiatives that suit you. "
            "Start your journey of giving wings to dreams today! 🦋"
        ),
        'suggestions': ['Register now', 'What are the requirements?', 'Tell me about NayePankh'],
    },
    'donate': {
        'reply': (
            "Your donations make a real difference! 💝 NayePankh Foundation has helped 200,000+ people "
            "through generous contributions. You can donate through our website. Every rupee counts! "
            "Contact us at contact@nayepankh.com for details."
        ),
        'suggestions': ['How to donate?', 'Is it tax-deductible?', 'Other ways to help'],
    },
    'contribution': {
        'reply': (
            "There are many ways to contribute — donate funds, volunteer your time, or spread the word! "
            "Even sharing our mission on social media helps us reach more people in need. "
            "Contact: contact@nayepankh.com or +91-8318500748."
        ),
        'suggestions': ['Volunteer', 'Donate', 'Share on social media'],
    },
    'internship': {
        'reply': (
            "NayePankh offers meaningful internship opportunities for students and young professionals! 📚 "
            "Gain real-world experience while making a social impact. Areas include content writing, "
            "social media management, event coordination, and tech development."
        ),
        'suggestions': ['How to apply?', 'Internship duration?', 'Available roles'],
    },
    'event': {
        'reply': (
            "We organize impactful events like Education Drives, Tree Plantations, Health Camps, "
            "Blood Donation Camps, and Food Distribution drives across India. 🌍 "
            "Check our Events page for upcoming activities near you!"
        ),
        'suggestions': ['Upcoming events', 'Past events', 'Organize an event'],
    },
    'campaign': {
        'reply': (
            "Our campaigns focus on creating lasting change! From Clean City drives to Digital Literacy "
            "workshops and Women Empowerment programs, there's always something happening. "
            "Join us and be part of the movement! ✊"
        ),
        'suggestions': ['Current campaigns', 'How to participate?', 'Start a campaign'],
    },
    'education': {
        'reply': (
            "Education is at the heart of NayePankh! 📖 We run learning centres, distribute school supplies, "
            "conduct digital literacy workshops, and mentor underprivileged students. "
            "Every child deserves the wings to fly!"
        ),
        'suggestions': ['Volunteer for education', 'Donate supplies', 'Our education stats'],
    },
    'health': {
        'reply': (
            "Healthcare is a key focus! 🏥 We organize free health camps, blood donation drives, "
            "mental health awareness sessions, and distribute medicines and hygiene kits to communities in need."
        ),
        'suggestions': ['Health camps near me', 'Donate medical supplies', 'Volunteer as a doctor'],
    },
    'environment': {
        'reply': (
            "We care deeply about our planet! 🌱 NayePankh conducts tree plantation drives, "
            "beach and river clean-ups, plastic-free campaigns, and environmental awareness workshops. "
            "Join us in making Earth greener!"
        ),
        'suggestions': ['Tree plantation events', 'Clean-up drives', 'Eco-volunteering'],
    },
    'mission': {
        'reply': (
            "NayePankh Foundation — 'Giving Wings to Every Dream' 🦋 Founded in 2020, we are a "
            "youth-driven Indian NGO that has helped 200,000+ people across Education, Healthcare, "
            "Environment, Food Distribution, Clothing, and Youth Engagement."
        ),
        'suggestions': ['Our impact', 'Meet the team', 'How to join'],
    },
    'about': {
        'reply': (
            "NayePankh ('New Wings') is a registered Indian NGO driven by passionate young volunteers. "
            "Since 2020 we've impacted 200,000+ lives across 6 focus areas. "
            "Our primary colour is Orange 🧡 — representing energy and optimism!"
        ),
        'suggestions': ['Focus areas', 'Our achievements', 'Join the mission'],
    },
    'contact': {
        'reply': (
            "You can reach us at:\n📧 contact@nayepankh.com\n📞 +91-8318500748\n"
            "We'd love to hear from you — whether it's a question, partnership idea, or just to say hi! 👋"
        ),
        'suggestions': ['Send a message', 'Visit our office', 'Social media links'],
    },
    'hello': {
        'reply': (
            "Hello! 👋 Welcome to NayePankh Foundation — Giving Wings to Every Dream! "
            "I'm here to help you learn about volunteering, donating, events, and our mission. "
            "How can I assist you today?"
        ),
        'suggestions': ['Tell me about NayePankh', 'How can I volunteer?', 'Upcoming events'],
    },
    'hi': {
        'reply': (
            "Hi there! 😊 Great to see you at NayePankh Foundation. "
            "Ask me anything about volunteering, our initiatives, or how you can make a difference!"
        ),
        'suggestions': ['Volunteer', 'Donate', 'Learn more'],
    },
    'hey': {
        'reply': (
            "Hey! 🙌 Welcome to NayePankh. I'm your AI assistant. "
            "Feel free to ask about our mission, events, or how to get involved!"
        ),
        'suggestions': ['About NayePankh', 'Events', 'How to help'],
    },
    'help': {
        'reply': (
            "Here's what I can help you with:\n"
            "🙋 **Volunteering** — How to join and register\n"
            "💰 **Donations** — Ways to contribute\n"
            "📅 **Events** — Upcoming campaigns and drives\n"
            "🎓 **Education** — Our learning initiatives\n"
            "🏥 **Healthcare** — Health camps and drives\n"
            "🌱 **Environment** — Green initiatives\n"
            "📞 **Contact** — Get in touch\n"
            "Just type a topic to learn more!"
        ),
        'suggestions': ['Volunteer', 'Donate', 'Events'],
    },
    'thank': {
        'reply': (
            "You're welcome! 😊 Thank YOU for your interest in NayePankh Foundation. "
            "Together, we can give wings to every dream. Don't hesitate to reach out anytime!"
        ),
        'suggestions': ['Anything else?', 'Share NayePankh', 'Visit our website'],
    },
}

_DEFAULT_RESPONSE = {
    'reply': (
        "I'd love to help! You can ask me about volunteering, donating, internships, events, "
        'or our mission. Type "help" to see all topics.'
    ),
    'suggestions': ['Help', 'Volunteer', 'About NayePankh'],
}


def fallback_chat(message):
    """
    Rule-based keyword matching chatbot.

    Returns
    -------
    dict  {reply, suggestions}
    """
    msg = message.lower().strip()

    for keyword, response in _RESPONSES.items():
        if keyword in msg:
            return dict(response)  # return a copy

    return dict(_DEFAULT_RESPONSE)
