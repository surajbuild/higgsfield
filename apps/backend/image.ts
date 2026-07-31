import axios from "axios";
import { InferenceClient } from "@huggingface/inference";
import { existsSync, mkdirSync, writeFileSync } from "fs";

const apiKey = process.env.HUGGING_FACE_API_KEY;
const client = new InferenceClient(apiKey);

const MODEL_ID = "black-forest-labs/FLUX.1-Kontext-dev";

export async function createImage(
  imageUrl: string,
  prompt: string,
  variant: "left" | "right" | "front" = "front",
) {
  if (!imageUrl || !/^https?:\/\//i.test(imageUrl)) {
    throw new Error("Please provide a valid image URL.");
  }

  if (!apiKey) {
    throw new Error("Missing HUGGING_FACE_API_KEY environment variable.");
  }

  console.log(`Downloading source image from: ${imageUrl}`);

  const imageResponse = await axios.get(imageUrl, {
    responseType: "arraybuffer",
    timeout: 20_000,
    validateStatus: (status) => status >= 200 && status < 300,
  });

  const contentType = imageResponse.headers["content-type"];
  const sourceBlob = new Blob([imageResponse.data], {
    type: typeof contentType === "string" ? contentType : "image/jpeg",
  });

  console.log(`Generating ${variant} profile image with Hugging Face...`);

  const result = await client.imageToImage({
    model: MODEL_ID,
    inputs: sourceBlob,
    parameters: {
      prompt,
      strength: 0.82,
      seed: variant === "left" ? 11 : variant === "right" ? 22 : 33,
    },
  });

  if (!existsSync("assets")) {
    mkdirSync("assets", { recursive: true });
  }

  const editedBuffer = Buffer.from(await result.arrayBuffer());
  const fileName = `${variant}_profile_${Date.now()}.png`;
  const filePath = `assets/${fileName}`;

  writeFileSync(filePath, editedBuffer);

  console.log(`Saved ${variant} image to ${filePath}`);

  return filePath;
}