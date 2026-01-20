import { BskyAgent, RichText } from "@atproto/api";

const BLUESKY_HANDLE = process.env.BLUESKY_HANDLE;
const BLUESKY_APP_PASSWORD = process.env.BLUESKY_APP_PASSWORD;

let agent: BskyAgent | null = null;
let isLoggedIn = false;

export function isBlueskyAvailable(): boolean {
  return !!(BLUESKY_HANDLE && BLUESKY_APP_PASSWORD);
}

async function getAgent(): Promise<BskyAgent> {
  if (agent && isLoggedIn) {
    return agent;
  }

  if (!BLUESKY_HANDLE || !BLUESKY_APP_PASSWORD) {
    throw new Error("Bluesky credentials not configured");
  }

  agent = new BskyAgent({
    service: "https://bsky.social",
  });

  await agent.login({
    identifier: BLUESKY_HANDLE,
    password: BLUESKY_APP_PASSWORD,
  });

  isLoggedIn = true;
  return agent;
}

export interface PostToBlueskyOptions {
  text: string;
  videoPageUrl: string;
  thumbnailUrl?: string;
}

export async function postToBluesky(options: PostToBlueskyOptions): Promise<{ uri: string; cid: string }> {
  const { text, videoPageUrl, thumbnailUrl } = options;
  
  const bskyAgent = await getAgent();
  
  const rt = new RichText({ text: `${text}\n\n${videoPageUrl}` });
  await rt.detectFacets(bskyAgent);

  let embed: any = {
    $type: "app.bsky.embed.external",
    external: {
      uri: videoPageUrl,
      title: "SolveForge Video",
      description: "Watch this video and discover more at SolveForge",
    },
  };

  if (thumbnailUrl) {
    try {
      const imageResponse = await fetch(thumbnailUrl);
      if (imageResponse.ok) {
        const imageBuffer = await imageResponse.arrayBuffer();
        const uint8Array = new Uint8Array(imageBuffer);
        
        const uploadResult = await bskyAgent.uploadBlob(uint8Array, {
          encoding: "image/jpeg",
        });
        
        embed.external.thumb = uploadResult.data.blob;
      }
    } catch (err) {
      console.error("Failed to upload thumbnail to Bluesky:", err);
    }
  }

  const result = await bskyAgent.post({
    text: rt.text,
    facets: rt.facets,
    embed,
    createdAt: new Date().toISOString(),
  });

  return {
    uri: result.uri,
    cid: result.cid,
  };
}

export async function postVideoToBluesky(
  text: string,
  videoPageUrl: string,
  thumbnailUrl?: string
): Promise<{ uri: string; cid: string; postUrl: string }> {
  const result = await postToBluesky({
    text,
    videoPageUrl,
    thumbnailUrl,
  });

  const postUrl = uriToPostUrl(result.uri);

  return {
    ...result,
    postUrl,
  };
}

function uriToPostUrl(uri: string): string {
  const parts = uri.replace("at://", "").split("/");
  if (parts.length >= 3) {
    const did = parts[0];
    const rkey = parts[2];
    return `https://bsky.app/profile/${did}/post/${rkey}`;
  }
  return `https://bsky.app`;
}
