"""
App Ideas Generator - Pulls from database or generates via AI
"""
import json
import os
import random
from datetime import datetime
from openai import OpenAI
from bot.config import OPENAI_API_KEY, OPENAI_BASE_URL, IDEAS_DB

# Sample app ideas database
DEFAULT_IDEAS = [
    {
        "title": "Habit Streak Tracker",
        "description": "Track your daily habits with beautiful streak visualizations. Get motivated by seeing your progress over time.",
        "category": "productivity"
    },
    {
        "title": "Quick Recipe Finder",
        "description": "Snap a photo of ingredients you have and get recipe suggestions instantly using AI.",
        "category": "lifestyle"
    },
    {
        "title": "Mood Journal",
        "description": "Log your daily mood with just one tap. See patterns and insights about your emotional wellbeing.",
        "category": "health"
    },
    {
        "title": "Split Bill Calculator",
        "description": "Never argue about splitting the check again. Handles tips, tax, and uneven splits.",
        "category": "finance"
    },
    {
        "title": "Focus Timer",
        "description": "Pomodoro timer with ambient sounds and productivity tracking. Stay focused, get things done.",
        "category": "productivity"
    },
    {
        "title": "Plant Care Reminder",
        "description": "Never forget to water your plants. Get reminders based on each plant's specific needs.",
        "category": "lifestyle"
    },
    {
        "title": "Workout Generator",
        "description": "Get personalized workout routines based on your fitness level and available equipment.",
        "category": "fitness"
    },
    {
        "title": "Language Flashcards",
        "description": "Learn new languages with spaced repetition flashcards. 10 minutes a day, fluency in months.",
        "category": "education"
    },
    {
        "title": "Budget Visualizer",
        "description": "See where your money goes with beautiful charts. Set goals and track spending patterns.",
        "category": "finance"
    },
    {
        "title": "Micro Journal",
        "description": "Write just one sentence a day. Build a meaningful journal without the pressure.",
        "category": "lifestyle"
    },
    {
        "title": "Trivia Challenge",
        "description": "Daily trivia questions across multiple categories. Compete with friends on leaderboards.",
        "category": "games"
    },
    {
        "title": "Sleep Soundscapes",
        "description": "Relaxing ambient sounds to help you fall asleep. White noise, rain, ocean waves, and more.",
        "category": "health"
    },
    {
        "title": "Quick Poll Maker",
        "description": "Create instant polls and share with friends. Perfect for group decisions.",
        "category": "social"
    },
    {
        "title": "Closet Organizer",
        "description": "Catalog your wardrobe and get outfit suggestions. Never say 'I have nothing to wear' again.",
        "category": "lifestyle"
    },
    {
        "title": "Parking Spot Finder",
        "description": "Find and save where you parked. Set reminders for meter expiration.",
        "category": "utility"
    }
]


def ensure_ideas_db():
    """Initialize the ideas database if it doesn't exist"""
    os.makedirs(os.path.dirname(IDEAS_DB), exist_ok=True)
    if not os.path.exists(IDEAS_DB):
        data = {
            "ideas": DEFAULT_IDEAS,
            "used": [],
            "generated": []
        }
        with open(IDEAS_DB, "w") as f:
            json.dump(data, f, indent=2)
    return True


def load_ideas():
    """Load ideas from database"""
    ensure_ideas_db()
    with open(IDEAS_DB, "r") as f:
        return json.load(f)


def save_ideas(data):
    """Save ideas to database"""
    with open(IDEAS_DB, "w") as f:
        json.dump(data, f, indent=2)


def get_unused_idea():
    """Get an unused idea from the database"""
    data = load_ideas()
    unused = [idea for idea in data["ideas"] if idea["title"] not in data["used"]]
    
    if not unused:
        # Reset if all ideas used
        data["used"] = []
        unused = data["ideas"]
    
    idea = random.choice(unused)
    data["used"].append(idea["title"])
    save_ideas(data)
    
    return idea


def generate_ai_idea():
    """Generate a fresh app idea using AI"""
    if not OPENAI_API_KEY:
        return None
    
    client = OpenAI(
        api_key=OPENAI_API_KEY,
        base_url=OPENAI_BASE_URL
    )
    
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": """You are a creative app idea generator. Generate unique, practical mobile app ideas that would appeal to a wide audience.
                    
Return your response as JSON with these fields:
- title: Short catchy app name (2-4 words)
- description: 2 sentences describing the app and its main benefit
- category: One of: productivity, lifestyle, health, fitness, finance, education, games, social, utility"""
                },
                {
                    "role": "user",
                    "content": "Generate a creative and unique mobile app idea that would be fun to build and useful to users."
                }
            ],
            temperature=0.9,
            max_tokens=200,
            response_format={"type": "json_object"}
        )
        
        content = response.choices[0].message.content or "{}"
        idea = json.loads(content)
        
        # Save generated idea to database
        data = load_ideas()
        data["generated"].append({
            **idea,
            "generated_at": datetime.now().isoformat()
        })
        save_ideas(data)
        
        return idea
        
    except Exception as e:
        print(f"Error generating AI idea: {e}")
        return None


def get_daily_idea(prefer_ai=False):
    """Get today's app idea - either from database or AI generated"""
    if prefer_ai and OPENAI_API_KEY:
        idea = generate_ai_idea()
        if idea:
            return idea
    
    return get_unused_idea()
