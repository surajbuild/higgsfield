import express, { response } from "express";
import { prisma } from "./db";
import {
  CreateAvatarSchema,
  CreateLoginSchema,
  CreateUserSchema,
} from "./types";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { InferenceClient } from "@huggingface/inference";
import axios from "axios";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const client = new InferenceClient(process.env.HUGGING_FACE_API_KEY);

app.post("/api/v1/signup", async (req, res) => {
  console.log("signup called");
  const { success, data } = CreateUserSchema.safeParse(req.body);

  console.log("success", success);
  console.log("data", data);
  if (!success) {
    return res.status(400).json({
      message: "Incorrect credentials",
    });
  }
  const { username, password } = data;

  const existingUser = await prisma.user.findUnique({
    where: {
      username: data.username,
    },
  });

  if (existingUser) {
    return res.status(409).json({
      message: "Username already exists",
    });
  }
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      username: username,
      password: hashedPassword,
    },
  });
  res.json({
    id: user.id,
  });
});

app.post("/api/v1/signin", async (req, res) => {
  console.log("signin called");
  const { success, data } = CreateLoginSchema.safeParse(req.body);
  if (!success) {
    return res.status(400).json({
      message: "Incorrect credentials",
    });
  }

  const { username, password } = data;
  console.log("username", username);
  console.log("password", password);

  const user = await prisma.user.findUnique({
    where: {
      username: data.username,
    },
  });

  const isMatch = await bcrypt.compare(data.password, user?.password!);
  console.log(user?.password);
  console.log(data.password);

  if (!isMatch) {
    return res.status(401).json({
      message: "Incorrect password",
    });
  }

  const token = jwt.sign(
    { id: user?.id, username: username },
    process.env.JWT_SECRET!,
    {
      expiresIn: "24h",
    },
  );

  const cookieOptions = {
    httpOnly: true,
    secure: true,
    maxAge: 24 * 60 * 60 * 1000,
  };

  res.cookie("token", token, cookieOptions);

  return res.status(201).json({
    message: "user Logged in successfully",
    user: {
      token,
      user: {
        id: user?.id,
        username: user?.username,
      },
    },
  });
});

app.get("/api/v1/me", (req, res) => {
  console.log("me called");
  const { token } = req.cookies;
  console.log(token);
  if (!token) {
    return res.status(400).json({
      message: "Can't get token",
    });
  }

  const data = jwt.verify(token, process.env.JWT_SECRET!);

  return res.status(201).json({
    data: data,
  });
});

app.post("/api/v1/logout", (req, res) => {
  console.log("Logout called");

  const { token } = req.cookies;
  if (!token) {
    return res.status(400).json({
      message: "Already logged out",
    });
  }

  const response = res.clearCookie("token");

  if (response) {
    return res.status(201).json({
      message: "Logout successfully",
    });
  }
});

app.post("/api/v1/avatar", async (req, res) => {
  console.log("Avatar called");
  try {
    const { success, data } = CreateAvatarSchema.safeParse(req.body);

    if (!success) {
      return res.status(411).json({
        message: "Incorrect inputs provided",
      });
    }

    const imageUrl = data.image;

    if (!imageUrl) {
      return res.status(400).json({
        message: "Image URL is required",
      });
    }

    console.log(`Downloading image via Axios from: ${imageUrl}`);

    const imageResponse = await axios.get(imageUrl, {
      responseType: "arraybuffer",
    });

    const contentType = imageResponse.headers["content-type"]

    const sourceBlob = new Blob([imageResponse.data], {
      type:  typeof contentType === "string" ? contentType : undefined,
    });

    console.log("Image downloaded successfully. Sending to Hugging Face...");


    const result = await client.imageToImage({
      // model: "black-forest-labs/FLUX.2-klein-9B",
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

    return res.status(200).json({
      message: "success",
      filePath: filePath,
    });
  } catch (error: any) {

    console.error("API Error:", error.response ? error.response.data : error.message);

    return res.status(500).json({
      message: "Something went wrong during image generation",
      error,
    });
  }
});

app.get("/api/v1/video", (req, res) => {
  console.log("video called");
});

app.get("/api/v1/video/:videoId", (req, res) => {
  console.log("videoId called");
});

app.get("/api/v1/me", (req, res) => {
  console.log("me called");
});

app.get("/api/v1/videos", (req, res) => {
  console.log("videos called");
});

app.get("/api/v1/avatar", (req, res) => {
  console.log("avatar called");
});

app.get("/api/v1/avatar/:avatarId", (req, res) => {
  console.log("avatarId called");
});

app.get("/api/v1/models", (req, res) => {
  console.log("models called");
});

app.get("/api/v1/avatars", (req, res) => {
  console.log("avatars called");
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log("App is listining on port ", PORT);
});
