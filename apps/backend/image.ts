import axios from "axios";
import { InferenceClient } from "@huggingface/inference";
import { existsSync, mkdirSync, writeFileSync } from "fs";

const client = new InferenceClient(Bun.env.HUGGING_FACE_API_KEY);

export async function generateAvatar(imageUrl: string) {
  console.log(`Downloading image via Axios from: ${imageUrl}`);

  const imageResponse = await axios.get(imageUrl, {
    responseType: "arraybuffer",
  });

  const contentType = imageResponse.headers["content-type"];

  const sourceBlob = new Blob([imageResponse.data], {
    type: typeof contentType === "string" ? contentType : undefined,
  });

  console.log("Image downloaded successfully. Sending to Hugging Face...");

  const result = await client.imageToImage({
    model: "black-forest-labs/FLUX.1-Kontext-dev",
    inputs: sourceBlob,
    parameters: {
      prompt:
        "Create a left side of this profile for this user. Given the image, create a portfolio headshot from the left side of this user",
      strength: 0.85,
      seed: 42,
    },
  });

  if (!existsSync("assets")) {
    mkdirSync("assets");
  }

  const editedBuffer = Buffer.from(await result.arrayBuffer());

  const fileName = `edited_image_${Date.now()}.png`;
  const filePath = `assets/${fileName}`;

  writeFileSync(filePath, editedBuffer);

  console.log(`Saved edited image to ${filePath}`);

  return filePath;
}