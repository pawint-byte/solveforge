"""
Video Generator - Creates short-form promo videos
Uses ElevenLabs for TTS and MoviePy for video composition
"""
import os
import tempfile
from datetime import datetime
from PIL import Image, ImageDraw, ImageFont
import httpx

from bot.config import (
    ELEVENLABS_API_KEY, ELEVENLABS_VOICE_ID,
    VIDEO_WIDTH, VIDEO_HEIGHT, VIDEO_FPS, VIDEO_DURATION,
    BACKGROUND_COLOR, ACCENT_COLOR, OUTPUT_DIR,
    WATERMARK_PATH, APP_NAME
)


def ensure_output_dir():
    """Ensure output directory exists"""
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    return OUTPUT_DIR


def generate_audio_elevenlabs(text: str, output_path: str) -> bool:
    """Generate audio using ElevenLabs TTS API"""
    if not ELEVENLABS_API_KEY:
        print("ElevenLabs API key not configured")
        return False
    
    try:
        url = f"https://api.elevenlabs.io/v1/text-to-speech/{ELEVENLABS_VOICE_ID}"
        
        headers = {
            "Accept": "audio/mpeg",
            "Content-Type": "application/json",
            "xi-api-key": ELEVENLABS_API_KEY
        }
        
        data = {
            "text": text,
            "model_id": "eleven_monolingual_v1",
            "voice_settings": {
                "stability": 0.5,
                "similarity_boost": 0.75
            }
        }
        
        with httpx.Client(timeout=60.0) as client:
            response = client.post(url, json=data, headers=headers)
            response.raise_for_status()
            
            with open(output_path, "wb") as f:
                f.write(response.content)
        
        return True
        
    except Exception as e:
        print(f"Error generating audio with ElevenLabs: {e}")
        return False


def create_text_image(text: str, width: int, height: int, 
                      bg_color: tuple = BACKGROUND_COLOR,
                      text_color: tuple = (255, 255, 255)) -> Image.Image:
    """Create an image with centered text"""
    img = Image.new('RGB', (width, height), bg_color)
    draw = ImageDraw.Draw(img)
    
    # Try to load a nice font, fall back to default
    font_size = 60
    try:
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", font_size)
    except Exception:
        try:
            font = ImageFont.truetype("arial.ttf", font_size)
        except Exception:
            font = ImageFont.load_default()
    
    # Wrap text
    words = text.split()
    lines = []
    current_line = ""
    max_width = width - 100  # padding
    
    for word in words:
        test_line = f"{current_line} {word}".strip()
        bbox = draw.textbbox((0, 0), test_line, font=font)
        if bbox[2] - bbox[0] <= max_width:
            current_line = test_line
        else:
            if current_line:
                lines.append(current_line)
            current_line = word
    if current_line:
        lines.append(current_line)
    
    # Calculate total text height
    line_height = font_size + 20
    total_height = len(lines) * line_height
    y_start = (height - total_height) // 2
    
    # Draw each line centered
    for i, line in enumerate(lines):
        bbox = draw.textbbox((0, 0), line, font=font)
        text_width = bbox[2] - bbox[0]
        x = (width - text_width) // 2
        y = y_start + (i * line_height)
        draw.text((x, y), line, font=font, fill=text_color)
    
    return img


def create_hook_frame(hook_text: str) -> Image.Image:
    """Create the hook frame with attention-grabbing style"""
    img = Image.new('RGB', (VIDEO_WIDTH, VIDEO_HEIGHT), BACKGROUND_COLOR)
    draw = ImageDraw.Draw(img)
    
    # Add gradient or accent elements
    for i in range(100):
        alpha = int(255 * (1 - i / 100))
        color = (*ACCENT_COLOR, alpha)
        draw.rectangle([0, i * 5, VIDEO_WIDTH, (i + 1) * 5], fill=ACCENT_COLOR[:3])
    
    # Add hook text
    hook_img = create_text_image(hook_text, VIDEO_WIDTH, VIDEO_HEIGHT)
    return hook_img


def create_idea_frame(title: str, description: str) -> Image.Image:
    """Create the main idea presentation frame"""
    img = Image.new('RGB', (VIDEO_WIDTH, VIDEO_HEIGHT), BACKGROUND_COLOR)
    draw = ImageDraw.Draw(img)
    
    # Title font
    try:
        title_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 72)
        desc_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 48)
    except Exception:
        title_font = ImageFont.load_default()
        desc_font = ImageFont.load_default()
    
    # Draw title
    bbox = draw.textbbox((0, 0), title, font=title_font)
    title_width = bbox[2] - bbox[0]
    draw.text(((VIDEO_WIDTH - title_width) // 2, 600), title, font=title_font, fill=ACCENT_COLOR)
    
    # Draw description wrapped
    words = description.split()
    lines = []
    current_line = ""
    max_width = VIDEO_WIDTH - 120
    
    for word in words:
        test_line = f"{current_line} {word}".strip()
        bbox = draw.textbbox((0, 0), test_line, font=desc_font)
        if bbox[2] - bbox[0] <= max_width:
            current_line = test_line
        else:
            if current_line:
                lines.append(current_line)
            current_line = word
    if current_line:
        lines.append(current_line)
    
    y = 750
    for line in lines:
        bbox = draw.textbbox((0, 0), line, font=desc_font)
        text_width = bbox[2] - bbox[0]
        draw.text(((VIDEO_WIDTH - text_width) // 2, y), line, font=desc_font, fill=(255, 255, 255))
        y += 60
    
    return img


def create_cta_frame(cta_text: str) -> Image.Image:
    """Create the call-to-action frame"""
    img = Image.new('RGB', (VIDEO_WIDTH, VIDEO_HEIGHT), ACCENT_COLOR)
    draw = ImageDraw.Draw(img)
    
    try:
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 56)
    except Exception:
        font = ImageFont.load_default()
    
    # Wrap and center CTA text
    words = cta_text.split()
    lines = []
    current_line = ""
    max_width = VIDEO_WIDTH - 100
    
    for word in words:
        test_line = f"{current_line} {word}".strip()
        bbox = draw.textbbox((0, 0), test_line, font=font)
        if bbox[2] - bbox[0] <= max_width:
            current_line = test_line
        else:
            if current_line:
                lines.append(current_line)
            current_line = word
    if current_line:
        lines.append(current_line)
    
    line_height = 70
    total_height = len(lines) * line_height
    y_start = (VIDEO_HEIGHT - total_height) // 2
    
    for i, line in enumerate(lines):
        bbox = draw.textbbox((0, 0), line, font=font)
        text_width = bbox[2] - bbox[0]
        x = (VIDEO_WIDTH - text_width) // 2
        y = y_start + (i * line_height)
        draw.text((x, y), line, font=font, fill=(255, 255, 255))
    
    return img


def add_watermark(img: Image.Image) -> Image.Image:
    """Add watermark to image"""
    if os.path.exists(WATERMARK_PATH):
        try:
            watermark = Image.open(WATERMARK_PATH).convert("RGBA")
            # Resize watermark
            watermark.thumbnail((150, 150))
            # Position in bottom right
            position = (VIDEO_WIDTH - watermark.width - 30, VIDEO_HEIGHT - watermark.height - 30)
            img.paste(watermark, position, watermark)
        except Exception as e:
            print(f"Could not add watermark: {e}")
    
    return img


def generate_video(idea: dict, script: dict) -> str:
    """Generate the complete promo video"""
    ensure_output_dir()
    
    title = idea.get("title", "App Idea")
    description = idea.get("description", "")
    hook = script.get("hook", "")
    cta = script.get("cta", "")
    full_script = script.get("full_script", "")
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    video_path = os.path.join(OUTPUT_DIR, f"promo_{timestamp}.mp4")
    
    # Create frames
    frames = []
    
    # Hook frame (3 seconds = 90 frames at 30fps)
    hook_frame = create_hook_frame(hook)
    hook_frame = add_watermark(hook_frame)
    for _ in range(90):
        frames.append(hook_frame)
    
    # Idea frame (9 seconds = 270 frames)
    idea_frame = create_idea_frame(title, description)
    idea_frame = add_watermark(idea_frame)
    for _ in range(270):
        frames.append(idea_frame)
    
    # CTA frame (3 seconds = 90 frames)
    cta_frame = create_cta_frame(cta)
    cta_frame = add_watermark(cta_frame)
    for _ in range(90):
        frames.append(cta_frame)
    
    # Try to generate audio
    audio_path = None
    if ELEVENLABS_API_KEY:
        audio_path = os.path.join(OUTPUT_DIR, f"audio_{timestamp}.mp3")
        if not generate_audio_elevenlabs(full_script, audio_path):
            audio_path = None
    
    # Create video using MoviePy
    try:
        from moviepy import ImageSequenceClip, AudioFileClip, CompositeVideoClip
        
        # Save frames as temporary images
        temp_dir = tempfile.mkdtemp()
        frame_paths = []
        for i, frame in enumerate(frames):
            frame_path = os.path.join(temp_dir, f"frame_{i:04d}.png")
            frame.save(frame_path)
            frame_paths.append(frame_path)
        
        # Create video clip
        video_clip = ImageSequenceClip(frame_paths, fps=VIDEO_FPS)
        
        # Add audio if available
        if audio_path and os.path.exists(audio_path):
            audio_clip = AudioFileClip(audio_path)
            # Match audio to video duration
            if audio_clip.duration > video_clip.duration:
                audio_clip = audio_clip.subclipped(0, video_clip.duration)
            video_clip = video_clip.with_audio(audio_clip)
        
        # Write final video
        video_clip.write_videofile(
            video_path,
            codec="libx264",
            audio_codec="aac" if audio_path else None,
            fps=VIDEO_FPS,
            logger=None
        )
        
        # Cleanup temp files
        for path in frame_paths:
            try:
                os.remove(path)
            except Exception:
                pass
        try:
            os.rmdir(temp_dir)
        except Exception:
            pass
        
        print(f"Video generated: {video_path}")
        return video_path
        
    except Exception as e:
        print(f"Error generating video with MoviePy: {e}")
        
        # Fallback: Save as static image
        fallback_path = os.path.join(OUTPUT_DIR, f"promo_{timestamp}.png")
        idea_frame.save(fallback_path)
        print(f"Fallback image saved: {fallback_path}")
        return fallback_path


def generate_static_image(idea: dict, script: dict) -> str:
    """Generate a static promo image (fallback)"""
    ensure_output_dir()
    
    title = idea.get("title", "App Idea")
    description = idea.get("description", "")
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    image_path = os.path.join(OUTPUT_DIR, f"promo_{timestamp}.png")
    
    img = create_idea_frame(title, description)
    img = add_watermark(img)
    img.save(image_path)
    
    print(f"Static image generated: {image_path}")
    return image_path
