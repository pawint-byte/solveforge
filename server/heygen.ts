/**
 * HeyGen API Integration
 * 
 * This module provides functions to generate AI avatar videos using HeyGen's API.
 * Videos are generated asynchronously - you create a video request, then poll for completion.
 * 
 * Required environment variable: HEYGEN_API_KEY
 * 
 * API Documentation: https://docs.heygen.com/
 */

const HEYGEN_API_BASE = 'https://api.heygen.com';

/**
 * Get the HeyGen API key from environment
 */
function getApiKey(): string {
  const apiKey = process.env.HEYGEN_API_KEY;
  if (!apiKey) {
    throw new Error('HEYGEN_API_KEY environment variable is not set');
  }
  return apiKey;
}

/**
 * Make an authenticated request to the HeyGen API
 */
async function heygenRequest(
  endpoint: string,
  method: 'GET' | 'POST' = 'GET',
  body?: any
): Promise<any> {
  const apiKey = getApiKey();
  
  const response = await fetch(`${HEYGEN_API_BASE}${endpoint}`, {
    method,
    headers: {
      'X-API-KEY': apiKey,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HeyGen API error (${response.status}): ${errorText}`);
  }

  return response.json();
}

// ============================================
// Avatar & Voice Management
// ============================================

export interface Avatar {
  avatar_id: string;
  avatar_name: string;
  preview_image_url?: string;
  preview_video_url?: string;
}

export interface Voice {
  voice_id: string;
  name: string;
  language: string;
  gender?: string;
  preview_audio?: string;
}

/**
 * List all available avatars
 * Use this to get avatar_id for video generation
 */
export async function listAvatars(): Promise<Avatar[]> {
  const response = await heygenRequest('/v2/avatars');
  return response.data?.avatars || [];
}

/**
 * List all available voices
 * Use this to get voice_id for video generation
 */
export async function listVoices(): Promise<Voice[]> {
  const response = await heygenRequest('/v2/voices');
  return response.data?.voices || [];
}

// ============================================
// Video Generation
// ============================================

export interface VideoInput {
  character: {
    type: 'avatar' | 'talking_photo';
    avatar_id?: string;
    photo_url?: string;
  };
  voice: {
    type: 'text' | 'audio';
    voice_id?: string;
    input_text?: string;
    audio_url?: string;
  };
  background?: {
    type: 'color' | 'image' | 'video';
    value?: string;
    url?: string;
  };
}

export interface VideoGenerateRequest {
  video_inputs: VideoInput[];
  dimension?: {
    width: number;
    height: number;
  };
  aspect_ratio?: '16:9' | '9:16' | '1:1';
  test?: boolean;
}

export interface VideoGenerateResponse {
  video_id: string;
}

/**
 * Create a new avatar video
 * 
 * @param avatarId - The avatar to use (get from listAvatars)
 * @param voiceId - The voice to use (get from listVoices)
 * @param script - The text script for the avatar to speak
 * @param options - Additional options (background, dimensions, etc.)
 * @returns The video_id to use for status checking
 * 
 * @example
 * const videoId = await createAvatarVideo(
 *   'avatar_abc123',
 *   'voice_xyz789',
 *   'Hello! Welcome to our platform.'
 * );
 */
export async function createAvatarVideo(
  avatarId: string,
  voiceId: string,
  script: string,
  options?: {
    aspectRatio?: '16:9' | '9:16' | '1:1';
    backgroundColor?: string;
    test?: boolean;
  }
): Promise<string> {
  // Use 720p dimension instead of aspect_ratio for Creator plan compatibility
  const getDimension = (aspectRatio?: string) => {
    switch (aspectRatio) {
      case '9:16': return { width: 720, height: 1280 };
      case '1:1': return { width: 720, height: 720 };
      default: return { width: 1280, height: 720 }; // 16:9
    }
  };

  const payload: VideoGenerateRequest = {
    video_inputs: [
      {
        character: {
          type: 'avatar',
          avatar_id: avatarId,
        },
        voice: {
          type: 'text',
          voice_id: voiceId,
          input_text: script,
        },
      },
    ],
    dimension: getDimension(options?.aspectRatio),
    test: options?.test || false,
  };

  // Add background if specified
  if (options?.backgroundColor) {
    payload.video_inputs[0].background = {
      type: 'color',
      value: options.backgroundColor,
    };
  }

  const response = await heygenRequest('/v2/video/generate', 'POST', payload);
  
  if (!response.data?.video_id) {
    throw new Error('Failed to get video_id from HeyGen response');
  }

  return response.data.video_id;
}

/**
 * Create a video from a talking photo
 * 
 * @param photoUrl - URL of the photo to animate
 * @param voiceId - The voice to use
 * @param script - The text script
 * @returns The video_id to use for status checking
 */
export async function createTalkingPhotoVideo(
  photoUrl: string,
  voiceId: string,
  script: string,
  options?: {
    aspectRatio?: '16:9' | '9:16' | '1:1';
    test?: boolean;
  }
): Promise<string> {
  // Use 720p dimension instead of aspect_ratio for Creator plan compatibility
  const getDimension = (aspectRatio?: string) => {
    switch (aspectRatio) {
      case '9:16': return { width: 720, height: 1280 };
      case '1:1': return { width: 720, height: 720 };
      default: return { width: 1280, height: 720 }; // 16:9
    }
  };

  const payload: VideoGenerateRequest = {
    video_inputs: [
      {
        character: {
          type: 'talking_photo',
          photo_url: photoUrl,
        },
        voice: {
          type: 'text',
          voice_id: voiceId,
          input_text: script,
        },
      },
    ],
    dimension: getDimension(options?.aspectRatio),
    test: options?.test || false,
  };

  const response = await heygenRequest('/v2/video/generate', 'POST', payload);
  
  if (!response.data?.video_id) {
    throw new Error('Failed to get video_id from HeyGen response');
  }

  return response.data.video_id;
}

// ============================================
// Video Status & Retrieval
// ============================================

export type VideoStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface VideoStatusResponse {
  video_id: string;
  status: VideoStatus;
  video_url?: string;
  thumbnail_url?: string;
  duration?: number;
  error?: string;
}

/**
 * Check the status of a video generation request
 * 
 * @param videoId - The video_id returned from video creation
 * @returns Video status and URL (if completed)
 * 
 * Status values:
 * - 'pending': Queued and waiting to render
 * - 'processing': Currently rendering
 * - 'completed': Ready to download (includes video_url)
 * - 'failed': Error occurred
 */
export async function getVideoStatus(videoId: string): Promise<VideoStatusResponse> {
  const response = await heygenRequest(`/v1/video_status.get?video_id=${videoId}`);
  
  return {
    video_id: videoId,
    status: response.data?.status || 'pending',
    video_url: response.data?.video_url,
    thumbnail_url: response.data?.thumbnail_url,
    duration: response.data?.duration,
    error: response.data?.error,
  };
}

/**
 * Wait for a video to complete generation
 * Polls the status endpoint until video is ready or fails
 * 
 * @param videoId - The video_id to wait for
 * @param maxWaitMs - Maximum time to wait (default: 10 minutes)
 * @param pollIntervalMs - How often to check status (default: 5 seconds)
 * @returns The final video status with URL
 */
export async function waitForVideo(
  videoId: string,
  maxWaitMs: number = 600000, // 10 minutes
  pollIntervalMs: number = 5000 // 5 seconds
): Promise<VideoStatusResponse> {
  const startTime = Date.now();

  while (Date.now() - startTime < maxWaitMs) {
    const status = await getVideoStatus(videoId);

    if (status.status === 'completed') {
      return status;
    }

    if (status.status === 'failed') {
      throw new Error(`Video generation failed: ${status.error || 'Unknown error'}`);
    }

    // Wait before next poll
    await new Promise(resolve => setTimeout(resolve, pollIntervalMs));
  }

  throw new Error(`Video generation timed out after ${maxWaitMs / 1000} seconds`);
}

// ============================================
// High-Level Helper Functions
// ============================================

/**
 * Generate a video from a website URL and script
 * This is a convenience function that:
 * 1. Uses a default avatar and voice
 * 2. Creates the video
 * 3. Optionally waits for completion
 * 
 * @param websiteUrl - The website URL to reference (for context in the script)
 * @param script - The text script for the avatar to speak
 * @param options - Configuration options
 * @returns Video ID and optionally the final video URL
 * 
 * @example
 * // Quick generation (returns immediately with video_id)
 * const result = await generateVideoFromUrlAndScript(
 *   'https://example.com',
 *   'Welcome to Example.com! Let me show you around.',
 *   { waitForCompletion: false }
 * );
 * console.log('Video ID:', result.video_id);
 * 
 * // Full generation (waits for video to complete)
 * const result = await generateVideoFromUrlAndScript(
 *   'https://example.com',
 *   'Welcome to Example.com!',
 *   { waitForCompletion: true }
 * );
 * console.log('Video URL:', result.video_url);
 */
export async function generateVideoFromUrlAndScript(
  websiteUrl: string,
  script: string,
  options?: {
    avatarId?: string;
    voiceId?: string;
    aspectRatio?: '16:9' | '9:16' | '1:1';
    waitForCompletion?: boolean;
    test?: boolean;
  }
): Promise<{
  video_id: string;
  status: VideoStatus;
  video_url?: string;
  website_url: string;
}> {
  // Default avatar and voice IDs (user should customize these)
  // You can get available IDs by calling listAvatars() and listVoices()
  const avatarId = options?.avatarId || 'Kristin_public_2_20240108';
  const voiceId = options?.voiceId || '1bd001e7e50f421d891986aad5158bc8'; // Default English voice

  // Create the video
  const videoId = await createAvatarVideo(avatarId, voiceId, script, {
    aspectRatio: options?.aspectRatio || '16:9',
    test: options?.test,
  });

  // If not waiting for completion, return immediately
  if (!options?.waitForCompletion) {
    return {
      video_id: videoId,
      status: 'pending',
      website_url: websiteUrl,
    };
  }

  // Wait for video to complete
  const finalStatus = await waitForVideo(videoId);

  return {
    video_id: videoId,
    status: finalStatus.status,
    video_url: finalStatus.video_url,
    website_url: websiteUrl,
  };
}

/**
 * Check if HeyGen API is available and configured
 */
export function isHeyGenAvailable(): boolean {
  return !!process.env.HEYGEN_API_KEY;
}
