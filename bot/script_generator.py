"""
Video Script Generator for App Idea Promos
"""
from openai import OpenAI
from bot.config import OPENAI_API_KEY, OPENAI_BASE_URL, APP_NAME, APP_LINK


def generate_script(idea: dict) -> dict:
    """Generate a 15-20 second video script for the app idea"""
    
    title = idea.get("title", "Cool App")
    description = idea.get("description", "An awesome app idea")
    
    # If we have AI, generate a creative script
    if OPENAI_API_KEY:
        try:
            client = OpenAI(
                api_key=OPENAI_API_KEY,
                base_url=OPENAI_BASE_URL
            )
            
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {
                        "role": "system",
                        "content": """You are a short-form video script writer. Create engaging 15-20 second scripts for app idea promos.

Structure:
1. HOOK (2-3 seconds): Attention-grabbing question or statement
2. IDEA (8-10 seconds): Quick description of the app idea
3. CTA (3-4 seconds): Call to action

Keep it punchy, energetic, and suitable for TikTok/Reels.
Return as JSON with: hook, idea_pitch, cta, full_script (complete voiceover text)"""
                    },
                    {
                        "role": "user",
                        "content": f"""Create a promo script for this app idea:

Title: {title}
Description: {description}

End with a CTA pointing to "{APP_NAME}" app."""
                    }
                ],
                temperature=0.8,
                max_tokens=300,
                response_format={"type": "json_object"}
            )
            
            import json
            content = response.choices[0].message.content or "{}"
            script = json.loads(content)
            script["title"] = title
            return script
            
        except Exception as e:
            print(f"Error generating script with AI: {e}")
    
    # Fallback to template-based script
    return {
        "title": title,
        "hook": f"What if there was an app that could change your life?",
        "idea_pitch": f"Introducing the idea for {title}. {description}",
        "cta": f"Want more app ideas like this? Check out {APP_NAME}! Link in bio.",
        "full_script": f"What if there was an app that could change your life? Introducing {title}. {description} Want more app ideas like this? Check out {APP_NAME}! Link in bio."
    }


def get_caption(idea: dict, script: dict) -> str:
    """Generate social media caption"""
    title = idea.get("title", "App Idea")
    description = idea.get("description", "")
    
    from bot.config import HASHTAGS, APP_LINK
    
    caption = f"""💡 App Idea of the Day: {title}

{description}

🚀 Get more app ideas in the {APP_NAME} app!
🔗 {APP_LINK}

{HASHTAGS}"""
    
    return caption
