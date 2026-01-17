"""
Main Content Creation Bot - Daily Workflow
"""
import os
import json
import logging
from datetime import datetime

from bot.config import LOGS_DIR, OUTPUT_DIR
from bot.ideas_generator import get_daily_idea
from bot.script_generator import generate_script, get_caption
from bot.video_generator import generate_video, generate_static_image
from bot.social_poster import post_to_all_platforms
from bot.notifications import notify_success, notify_failure, notify_partial_success

# Setup logging
os.makedirs(LOGS_DIR, exist_ok=True)
log_file = os.path.join(LOGS_DIR, f"bot_{datetime.now().strftime('%Y%m%d')}.log")

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(log_file),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)


def run_daily_workflow(prefer_ai_ideas: bool = True) -> dict:
    """Execute the complete daily content creation workflow"""
    result = {
        "success": False,
        "timestamp": datetime.now().isoformat(),
        "idea": None,
        "script": None,
        "media_path": None,
        "post_results": None,
        "errors": []
    }
    
    logger.info("=" * 50)
    logger.info("Starting daily content creation workflow")
    logger.info("=" * 50)
    
    try:
        # Step 1: Get app idea
        logger.info("Step 1: Getting app idea...")
        idea = get_daily_idea(prefer_ai=prefer_ai_ideas)
        if not idea:
            raise Exception("Failed to get app idea")
        
        result["idea"] = idea
        logger.info(f"Got idea: {idea.get('title')}")
        
        # Step 2: Generate script
        logger.info("Step 2: Generating video script...")
        script = generate_script(idea)
        if not script:
            raise Exception("Failed to generate script")
        
        result["script"] = script
        logger.info(f"Generated script with hook: {script.get('hook', '')[:50]}...")
        
        # Step 3: Generate video/image
        logger.info("Step 3: Generating video content...")
        try:
            media_path = generate_video(idea, script)
        except Exception as video_error:
            logger.warning(f"Video generation failed: {video_error}")
            logger.info("Falling back to static image...")
            media_path = generate_static_image(idea, script)
        
        if not media_path or not os.path.exists(media_path):
            raise Exception("Failed to generate media content")
        
        result["media_path"] = media_path
        logger.info(f"Generated media: {media_path}")
        
        # Step 4: Generate caption
        caption = get_caption(idea, script)
        logger.info(f"Generated caption ({len(caption)} chars)")
        
        # Step 5: Post to social platforms
        logger.info("Step 5: Posting to social platforms...")
        post_results = post_to_all_platforms(media_path, caption)
        result["post_results"] = post_results
        
        summary = post_results.get("summary", {})
        logger.info(f"Posting complete: {summary.get('success', 0)}/{summary.get('total', 0)} successful")
        
        # Step 6: Send notifications
        logger.info("Step 6: Sending notifications...")
        if summary.get("total", 0) == 0:
            logger.warning("No platforms configured - skipping notifications")
        elif summary.get("failed", 0) == 0 and summary.get("success", 0) > 0:
            notify_success(idea, post_results)
            logger.info("Success notification sent")
        elif summary.get("success", 0) > 0:
            notify_partial_success(idea, post_results)
            logger.info("Partial success notification sent")
        else:
            notify_failure(idea, "All platform posts failed", "Posting")
            logger.error("Failure notification sent")
        
        result["success"] = summary.get("success", 0) > 0 or summary.get("total", 0) == 0
        
    except Exception as e:
        error_msg = str(e)
        result["errors"].append(error_msg)
        logger.error(f"Workflow failed: {error_msg}")
        
        # Send failure notification
        idea_data = result.get("idea")
        if idea_data is None:
            idea_data = {"title": "Unknown", "description": ""}
        notify_failure(
            idea_data,
            error_msg,
            "Content Creation"
        )
    
    # Save run result
    save_run_result(result)
    
    logger.info("=" * 50)
    logger.info(f"Workflow completed. Success: {result['success']}")
    logger.info("=" * 50)
    
    return result


def save_run_result(result: dict):
    """Save the run result to a JSON file"""
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    result_file = os.path.join(OUTPUT_DIR, f"run_result_{timestamp}.json")
    
    with open(result_file, "w") as f:
        json.dump(result, f, indent=2, default=str)
    
    logger.info(f"Run result saved to {result_file}")


def get_bot_status() -> dict:
    """Get current bot status and configuration"""
    from bot.config import (
        ELEVENLABS_API_KEY, SENDGRID_API_KEY,
        INSTAGRAM_ACCESS_TOKEN, TIKTOK_ACCESS_TOKEN,
        X_API_KEY, OPENAI_API_KEY
    )
    
    return {
        "configured": {
            "openai": bool(OPENAI_API_KEY),
            "elevenlabs": bool(ELEVENLABS_API_KEY),
            "sendgrid": bool(SENDGRID_API_KEY),
            "instagram": bool(INSTAGRAM_ACCESS_TOKEN),
            "tiktok": bool(TIKTOK_ACCESS_TOKEN),
            "x_twitter": bool(X_API_KEY)
        },
        "ready": bool(OPENAI_API_KEY)  # Minimum requirement
    }


if __name__ == "__main__":
    result = run_daily_workflow()
    print(json.dumps(result, indent=2, default=str))
