"""
Scheduler for automated daily content creation
"""
import schedule
import time
import logging
from datetime import datetime

from bot.config import POST_HOUR, POST_MINUTE
from bot.main import run_daily_workflow

logger = logging.getLogger(__name__)


def scheduled_job():
    """The job that runs on schedule"""
    logger.info(f"Scheduled job triggered at {datetime.now()}")
    run_daily_workflow(prefer_ai_ideas=True)


def start_scheduler():
    """Start the scheduler"""
    schedule_time = f"{POST_HOUR:02d}:{POST_MINUTE:02d}"
    
    logger.info(f"Setting up scheduler to run daily at {schedule_time}")
    
    # Schedule daily job
    schedule.every().day.at(schedule_time).do(scheduled_job)
    
    logger.info("Scheduler started. Waiting for scheduled time...")
    logger.info(f"Next run: {schedule.next_run()}")
    
    # Run the scheduler loop
    while True:
        schedule.run_pending()
        time.sleep(60)  # Check every minute


def run_once():
    """Run the workflow once immediately"""
    logger.info("Running workflow immediately (manual trigger)")
    return run_daily_workflow(prefer_ai_ideas=True)


if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == "--now":
        # Run immediately
        run_once()
    else:
        # Start scheduler
        start_scheduler()
