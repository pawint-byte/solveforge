"""
Email Notifications for Bot Status
"""
import os
from datetime import datetime
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
from bot.config import SENDGRID_API_KEY, NOTIFICATION_EMAIL, FROM_EMAIL, APP_NAME


def send_email(subject: str, html_content: str) -> dict:
    """Send an email notification via SendGrid"""
    if not SENDGRID_API_KEY or not NOTIFICATION_EMAIL:
        return {"success": False, "error": "Email not configured"}
    
    try:
        message = Mail(
            from_email=FROM_EMAIL,
            to_emails=NOTIFICATION_EMAIL,
            subject=subject,
            html_content=html_content
        )
        
        sg = SendGridAPIClient(SENDGRID_API_KEY)
        response = sg.send(message)
        
        return {
            "success": True,
            "status_code": response.status_code
        }
        
    except Exception as e:
        return {"success": False, "error": str(e)}


def notify_success(idea: dict, post_results: dict) -> dict:
    """Send success notification"""
    title = idea.get("title", "App Idea")
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    summary = post_results.get("summary", {})
    success_count = summary.get("success", 0)
    total_count = summary.get("total", 0)
    
    html = f"""
    <html>
    <body style="font-family: Arial, sans-serif; padding: 20px;">
        <h1 style="color: #4CAF50;">Daily Content Posted Successfully</h1>
        
        <p><strong>Time:</strong> {timestamp}</p>
        <p><strong>App Idea:</strong> {title}</p>
        
        <h2>Posting Results</h2>
        <p><strong>Summary:</strong> {success_count}/{total_count} platforms successful</p>
        
        <h3>Platform Details:</h3>
        <ul>
            <li><strong>Instagram:</strong> {_format_result(post_results.get('instagram', {}))}</li>
            <li><strong>TikTok:</strong> {_format_result(post_results.get('tiktok', {}))}</li>
            <li><strong>X (Twitter):</strong> {_format_result(post_results.get('x', {}))}</li>
        </ul>
        
        <hr>
        <p style="color: #666; font-size: 12px;">
            This is an automated notification from your {APP_NAME} Content Bot.
        </p>
    </body>
    </html>
    """
    
    return send_email(f"[{APP_NAME}] Daily Content Posted - {title}", html)


def notify_failure(idea: dict, error: str, stage: str) -> dict:
    """Send failure notification"""
    title = idea.get("title", "Unknown") if idea else "Unknown"
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    html = f"""
    <html>
    <body style="font-family: Arial, sans-serif; padding: 20px;">
        <h1 style="color: #f44336;">Content Creation Failed</h1>
        
        <p><strong>Time:</strong> {timestamp}</p>
        <p><strong>App Idea:</strong> {title}</p>
        <p><strong>Failed Stage:</strong> {stage}</p>
        
        <h2>Error Details</h2>
        <pre style="background: #f5f5f5; padding: 15px; border-radius: 5px;">
{error}
        </pre>
        
        <p>Please check the logs and fix the issue.</p>
        
        <hr>
        <p style="color: #666; font-size: 12px;">
            This is an automated notification from your {APP_NAME} Content Bot.
        </p>
    </body>
    </html>
    """
    
    return send_email(f"[{APP_NAME}] Content Creation Failed - {stage}", html)


def notify_partial_success(idea: dict, post_results: dict) -> dict:
    """Send partial success notification"""
    title = idea.get("title", "App Idea")
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    summary = post_results.get("summary", {})
    success_count = summary.get("success", 0)
    failed_count = summary.get("failed", 0)
    total_count = summary.get("total", 0)
    
    html = f"""
    <html>
    <body style="font-family: Arial, sans-serif; padding: 20px;">
        <h1 style="color: #FF9800;">Content Partially Posted</h1>
        
        <p><strong>Time:</strong> {timestamp}</p>
        <p><strong>App Idea:</strong> {title}</p>
        
        <h2>Results Summary</h2>
        <p style="color: #4CAF50;"><strong>Successful:</strong> {success_count}</p>
        <p style="color: #f44336;"><strong>Failed:</strong> {failed_count}</p>
        <p><strong>Total Attempted:</strong> {total_count}</p>
        
        <h3>Platform Details:</h3>
        <ul>
            <li><strong>Instagram:</strong> {_format_result(post_results.get('instagram', {}))}</li>
            <li><strong>TikTok:</strong> {_format_result(post_results.get('tiktok', {}))}</li>
            <li><strong>X (Twitter):</strong> {_format_result(post_results.get('x', {}))}</li>
        </ul>
        
        <hr>
        <p style="color: #666; font-size: 12px;">
            This is an automated notification from your {APP_NAME} Content Bot.
        </p>
    </body>
    </html>
    """
    
    return send_email(f"[{APP_NAME}] Partial Success - {title}", html)


def _format_result(result: dict) -> str:
    """Format a platform result for HTML display"""
    if result.get("skipped"):
        return f"<span style='color: #999;'>Skipped - {result.get('reason', 'Unknown')}</span>"
    elif result.get("success"):
        return "<span style='color: #4CAF50;'>Success</span>"
    else:
        error = result.get("error", "Unknown error")
        return f"<span style='color: #f44336;'>Failed - {error}</span>"
