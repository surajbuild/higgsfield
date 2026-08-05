import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { InferenceClient } from "@huggingface/inference";

const apiKey = process.env.HUGGING_FACE_API_KEY;
const client = new InferenceClient(apiKey);

const VIDEO_MODEL = "Wan-AI/Wan2.1-I2V-14B-720P";

export async function generateVideo(
  prompt: string,
  imagePaths: string[],
  videoName = "avatar_video",
) {
  if (!apiKey) {
    throw new Error("Missing HUGGING_FACE_API_KEY environment variable.");
  }

  if (!imagePaths || imagePaths.length === 0) {
    throw new Error("At least one image path is required to generate a video.");
  }

  const referenceImagePath =
    imagePaths.find((path) => path.includes("front_profile")) ?? imagePaths[0];

  if (!referenceImagePath) {
    throw new Error("No valid image path found for video generation.");
  }

  const imageBuffer = readFileSync(referenceImagePath);
  const referenceImage = new Blob([imageBuffer], {
    type: "image/png",
  });

  const videoBlob = await client.imageToVideo({
    model: VIDEO_MODEL,
    inputs: referenceImage,
    parameters: {
      prompt,
      width: 768,
      height: 768,
      num_frames: 16,
      fps: 8,
    },
  });

  if (!existsSync("videos")) {
    mkdirSync("videos", { recursive: true });
  }

  const filePath = `videos/${videoName}_${Date.now()}.mp4`;
  const videoBuffer = Buffer.from(await videoBlob.arrayBuffer());

  writeFileSync(filePath, videoBuffer);

  return filePath;
}
