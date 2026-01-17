"""
Social Media Poster - Posts content to Instagram, TikTok, and X
"""
import os
import json
import httpx
import tweepy
from typing import Optional
from bot.config import (
    INSTAGRAM_ACCESS_TOKEN, INSTAGRAM_BUSINESS_ID,
    TIKTOK_ACCESS_TOKEN, TIKTOK_OPEN_ID,
    X_API_KEY, X_API_SECRET, X_ACCESS_TOKEN, X_ACCESS_TOKEN_SECRET, X_BEARER_TOKEN
)


class InstagramPoster:
    """Post Reels to Instagram via Graph API"""
    
    def __init__(self):
        self.access_token = INSTAGRAM_ACCESS_TOKEN
        self.business_id = INSTAGRAM_BUSINESS_ID
        self.base_url = "https://graph.facebook.com/v18.0"
    
    def is_configured(self) -> bool:
        return bool(self.access_token and self.business_id)
    
    def upload_reel(self, video_path: str, caption: str) -> dict:
        """Upload a video as an Instagram Reel"""
        if not self.is_configured():
            return {"success": False, "error": "Instagram not configured"}
        
        try:
            # Step 1: Create media container
            # Note: For Reels, the video must be hosted at a public URL
            # In production, you'd upload to a CDN first
            
            # For now, return a placeholder response
            # Real implementation would require:
            # 1. Upload video to accessible URL
            # 2. Create container with video_url
            # 3. Publish the container
            
            return {
                "success": False,
                "error": "Instagram Reels requires video hosting. Please configure a CDN.",
                "requires": "Video must be accessible via public URL"
            }
            
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def upload_image(self, image_path: str, caption: str) -> dict:
        """Upload an image post to Instagram"""
        if not self.is_configured():
            return {"success": False, "error": "Instagram not configured"}
        
        try:
            # Similar limitation - needs public URL
            return {
                "success": False,
                "error": "Instagram API requires image hosting",
                "requires": "Image must be accessible via public URL"
            }
            
        except Exception as e:
            return {"success": False, "error": str(e)}


class TikTokPoster:
    """Post videos to TikTok via Official API"""
    
    def __init__(self):
        self.access_token = TIKTOK_ACCESS_TOKEN
        self.open_id = TIKTOK_OPEN_ID
        self.base_url = "https://open.tiktokapis.com/v2"
    
    def is_configured(self) -> bool:
        return bool(self.access_token and self.open_id)
    
    def upload_video(self, video_path: str, caption: str) -> dict:
        """Upload a video to TikTok"""
        if not self.is_configured():
            return {"success": False, "error": "TikTok not configured"}
        
        try:
            # TikTok Content Posting API flow:
            # 1. Initialize upload
            # 2. Upload video chunks
            # 3. Publish
            
            headers = {
                "Authorization": f"Bearer {self.access_token}",
                "Content-Type": "application/json"
            }
            
            # Get video file size
            file_size = os.path.getsize(video_path)
            
            # Step 1: Initialize upload
            init_url = f"{self.base_url}/post/publish/video/init/"
            init_data = {
                "post_info": {
                    "title": caption[:150],  # TikTok title limit
                    "privacy_level": "PUBLIC_TO_EVERYONE",
                    "disable_duet": False,
                    "disable_comment": False,
                    "disable_stitch": False
                },
                "source_info": {
                    "source": "FILE_UPLOAD",
                    "video_size": file_size,
                    "chunk_size": file_size,
                    "total_chunk_count": 1
                }
            }
            
            with httpx.Client(timeout=120.0) as client:
                init_response = client.post(init_url, json=init_data, headers=headers)
                
                if init_response.status_code != 200:
                    return {
                        "success": False,
                        "error": f"TikTok init failed: {init_response.text}"
                    }
                
                init_result = init_response.json()
                upload_url = init_result.get("data", {}).get("upload_url")
                publish_id = init_result.get("data", {}).get("publish_id")
                
                if not upload_url:
                    return {"success": False, "error": "No upload URL received"}
                
                # Step 2: Upload video
                with open(video_path, "rb") as f:
                    video_data = f.read()
                
                upload_headers = {
                    "Content-Type": "video/mp4",
                    "Content-Length": str(file_size),
                    "Content-Range": f"bytes 0-{file_size-1}/{file_size}"
                }
                
                upload_response = client.put(upload_url, content=video_data, headers=upload_headers)
                
                if upload_response.status_code not in [200, 201]:
                    return {
                        "success": False,
                        "error": f"TikTok upload failed: {upload_response.text}"
                    }
            
            return {
                "success": True,
                "publish_id": publish_id,
                "platform": "tiktok"
            }
            
        except Exception as e:
            return {"success": False, "error": str(e)}


class XPoster:
    """Post tweets/videos to X (Twitter)"""
    
    def __init__(self):
        self.api_key = X_API_KEY
        self.api_secret = X_API_SECRET
        self.access_token = X_ACCESS_TOKEN
        self.access_token_secret = X_ACCESS_TOKEN_SECRET
        self.bearer_token = X_BEARER_TOKEN
        self._client = None
        self._api = None
    
    def is_configured(self) -> bool:
        return bool(self.api_key and self.api_secret and 
                   self.access_token and self.access_token_secret)
    
    def _get_client(self):
        """Get Tweepy Client for v2 API"""
        if not self._client:
            self._client = tweepy.Client(
                bearer_token=self.bearer_token,
                consumer_key=self.api_key,
                consumer_secret=self.api_secret,
                access_token=self.access_token,
                access_token_secret=self.access_token_secret
            )
        return self._client
    
    def _get_api(self):
        """Get Tweepy API for v1.1 (media upload)"""
        if not self._api:
            auth = tweepy.OAuth1UserHandler(
                self.api_key,
                self.api_secret,
                self.access_token,
                self.access_token_secret
            )
            self._api = tweepy.API(auth)
        return self._api
    
    def post_tweet(self, text: str, media_path: Optional[str] = None) -> dict:
        """Post a tweet, optionally with media"""
        if not self.is_configured():
            return {"success": False, "error": "X (Twitter) not configured"}
        
        try:
            client = self._get_client()
            media_ids = None
            
            if media_path and os.path.exists(media_path):
                api = self._get_api()
                
                # Check if it's a video
                if media_path.endswith(('.mp4', '.mov')):
                    media = api.media_upload(
                        media_path,
                        media_category="tweet_video",
                        chunked=True
                    )
                else:
                    media = api.media_upload(media_path)
                
                if media is not None:
                    media_ids = [media.media_id]
            
            # Post tweet
            response = client.create_tweet(
                text=text[:280],  # Twitter character limit
                media_ids=media_ids
            )
            
            tweet_id = None
            if response and response.data:
                tweet_id = response.data.get("id")
            
            return {
                "success": True,
                "tweet_id": tweet_id,
                "platform": "x"
            }
            
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def post_video(self, video_path: str, caption: str) -> dict:
        """Post a video tweet"""
        return self.post_tweet(caption, video_path)


def post_to_all_platforms(media_path: str, caption: str) -> dict:
    """Post content to all configured platforms"""
    results = {
        "instagram": None,
        "tiktok": None,
        "x": None,
        "summary": {
            "total": 0,
            "success": 0,
            "failed": 0
        }
    }
    
    is_video = media_path.endswith(('.mp4', '.mov'))
    
    # Instagram
    instagram = InstagramPoster()
    if instagram.is_configured():
        results["summary"]["total"] += 1
        if is_video:
            results["instagram"] = instagram.upload_reel(media_path, caption)
        else:
            results["instagram"] = instagram.upload_image(media_path, caption)
        
        if results["instagram"].get("success"):
            results["summary"]["success"] += 1
        else:
            results["summary"]["failed"] += 1
    else:
        results["instagram"] = {"skipped": True, "reason": "Not configured"}
    
    # TikTok
    tiktok = TikTokPoster()
    if tiktok.is_configured():
        results["summary"]["total"] += 1
        if is_video:
            results["tiktok"] = tiktok.upload_video(media_path, caption)
            if results["tiktok"].get("success"):
                results["summary"]["success"] += 1
            else:
                results["summary"]["failed"] += 1
        else:
            results["tiktok"] = {"skipped": True, "reason": "TikTok requires video"}
    else:
        results["tiktok"] = {"skipped": True, "reason": "Not configured"}
    
    # X (Twitter)
    x_poster = XPoster()
    if x_poster.is_configured():
        results["summary"]["total"] += 1
        results["x"] = x_poster.post_video(media_path, caption) if is_video else x_poster.post_tweet(caption, media_path)
        if results["x"].get("success"):
            results["summary"]["success"] += 1
        else:
            results["summary"]["failed"] += 1
    else:
        results["x"] = {"skipped": True, "reason": "Not configured"}
    
    return results
