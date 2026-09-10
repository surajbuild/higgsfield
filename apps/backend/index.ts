import express from "express";
import path from "node:path";
import { prisma } from "./db";
import {
  CreateAvatarSchema,
  CreateLoginSchema,
  CreateUserSchema,
  CreateVideoSchema,
} from "./types";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import { createImage } from "./image";
import { generateVideo } from "./video";
import { uuid } from "uuidv4";
import cors from "cors"

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({ origin: 'http://localhost:5000', credentials: true }));

const backendDir = process.cwd();
app.use("/assets", express.static(path.join(backendDir, "assets")));
app.use("/videos", express.static(path.join(backendDir, "videos")));

type JwtPayload = { id: string; username: string };

function getAuthUser(req: express.Request): JwtPayload | null {
  const { token } = req.cookies;
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    if (typeof decoded === "string") return null;
    return { id: decoded.id as string, username: decoded.username as string };
  } catch {
    return null;
  }
}

function assetUrl(req: express.Request, filePath: string): string {
  return `${req.protocol}://${req.get("host")}/${filePath}`;
}

app.post("/api/v1/signup", async (req, res) => {
  console.log("signup called");
  const { success, data } = CreateUserSchema.safeParse(req.body);

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

  const user = await prisma.user.findUnique({
    where: {
      username: data.username,
    },
  });

  if (!user) {
    return res.status(401).json({
      message: "Incorrect username",
    });
  }

  const isMatch = await bcrypt.compare(data.password, user.password);

  if (!isMatch) {
    return res.status(401).json({
      message: "Incorrect password",
    });
  }

  const token = jwt.sign(
    { id: user.id, username: username },
    process.env.JWT_SECRET!,
    {
      expiresIn: "24h",
    },
  );

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 24 * 60 * 60 * 1000,
  };

  res.cookie("token", token, cookieOptions);

  return res.status(201).json({
    message: "user Logged in successfully",
    user: {
      token,
      user: {
        id: user.id,
        username: user.username,
      },
    },
  });
});

app.get("/api/v1/me", (req, res) => {
  console.log("me called");
  const user = getAuthUser(req);
  if (!user) {
    return res.status(401).json({
      message: "Not authenticated",
    });
  }

  return res.status(200).json({
    user,
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

  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  });

  return res.status(200).json({
    message: "Logout successfully",
  });
});

app.post("/api/v1/avatar", async (req, res) => {
  try {
    const user = getAuthUser(req);
    if (!user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const { success, data } = CreateAvatarSchema.safeParse(req.body);

    if (!success) {
      return res.status(411).json({
        message: "Incorrect inputs provided",
      });
    }

    const avatarId = uuid();
    const leftImageId = uuid();
    const rightImageId = uuid();
    const frontImageId = uuid();
    const videoId = uuid();

    const leftPrompt =
      "Create a high-quality portfolio headshot showing the user from the left side profile. Keep the identity, face shape, hairstyle, and outfit recognizable while producing a natural studio-quality left-facing portrait.";
    const rightPrompt =
      "Create a high-quality portfolio headshot showing the user from the right side profile. Keep the identity, face shape, hairstyle, and outfit recognizable while producing a natural studio-quality right-facing portrait.";
    const frontPrompt =
      "Create a high-quality front-facing portfolio headshot from the provided photo. Preserve the user's identity and facial features while producing a polished studio-quality front portrait.";

    const [leftFilePath, rightFilePath, frontFilePath] = await Promise.all([
      createImage(data.image, leftPrompt, "left"),
      createImage(data.image, rightPrompt, "right"),
      createImage(data.image, frontPrompt, "front"),
    ]);

    const videoPrompt = `Create a smooth 3-5 second portfolio motion video that pans gently across the generated avatar images. Use the front, left, and right profile variations to produce a polished studio-quality identity video with natural motion.`;

    const videoFilePath = await generateVideo(
      videoPrompt,
      [leftFilePath, rightFilePath, frontFilePath],
      `avatar_${avatarId}`,
    );

    const avatar = await prisma.avatar.create({
      data: {
        id: avatarId,
        userId: user.id,
        name: data.name,
        avatarImages: {
          create: [
            { id: leftImageId, type: "Model", url: assetUrl(req, leftFilePath) },
            { id: rightImageId, type: "Model", url: assetUrl(req, rightFilePath) },
            { id: frontImageId, type: "Model", url: assetUrl(req, frontFilePath) },
          ],
        },
      },
      include: {
        avatarImages: true,
      },
    });

    const now = new Date();
    const video = await prisma.avatarVideo.create({
      data: {
        id: videoId,
        prompt: videoPrompt,
        userId: user.id,
        url: assetUrl(req, videoFilePath),
        startFrame: now,
        endFrame: new Date(now.getTime() + 2000),
        duration: 2,
        width: 768,
        height: 768,
        status: "Done",
      },
    });

    const avatarImages = avatar.avatarImages;
    const leftImage = avatarImages.find((img) => img.id === leftImageId);
    const rightImage = avatarImages.find((img) => img.id === rightImageId);
    const frontImage = avatarImages.find((img) => img.id === frontImageId);

    return res.status(200).json({
      message: "success",
      avatar: {
        id: avatar.id,
        name: avatar.name,
      },
      images: [
        { id: leftImageId, type: "left", url: leftImage?.url },
        { id: rightImageId, type: "right", url: rightImage?.url },
        { id: frontImageId, type: "front", url: frontImage?.url },
      ],
      video: {
        id: video.id,
        url: video.url,
      },
    });
  } catch (error: any) {
    console.error("API Error:", error);

    return res.status(500).json({
      message: "Something went wrong during image generation",
      error: error.message,
    });
  }
});

app.post("/api/v1/video", async (req, res) => {
  try {
    const user = getAuthUser(req);
    if (!user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const { success, data } = CreateVideoSchema.safeParse(req.body);

    if (!success) {
      return res.status(411).json({
        message: "Incorrect inputs provided",
      });
    }

    const videoId = uuid();
    const videoFilePath = await generateVideo(
      data.prompt,
      data.imagePaths,
      `video_${videoId}`,
    );

    const now = new Date();
    const video = await prisma.avatarVideo.create({
      data: {
        id: videoId,
        prompt: data.prompt,
        userId: user.id,
        url: assetUrl(req, videoFilePath),
        startFrame: now,
        endFrame: new Date(now.getTime() + 2000),
        duration: 2,
        width: 768,
        height: 768,
        status: "Done",
      },
    });

    return res.status(200).json({
      message: "success",
      video: {
        id: video.id,
        url: video.url,
      },
    });
  } catch (error: any) {
    console.error("Video API Error:", error);

    return res.status(500).json({
      message: "Something went wrong during video generation",
      error: error.message,
    });
  }
});

app.get("/api/v1/avatars", async (req, res) => {
  const user = getAuthUser(req);
  if (!user) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  const avatars = await prisma.avatar.findMany({
    where: { userId: user.id },
    include: {
      avatarImages: {
        orderBy: { type: "asc" },
      },
    },
    orderBy: { id: "asc" },
  });

  return res.status(200).json({
    avatars: avatars.map((avatar) => ({
      id: avatar.id,
      name: avatar.name,
      images: avatar.avatarImages.map((image) => ({
        id: image.id,
        type: image.type,
        url: image.url,
      })),
    })),
  });
});

app.get("/api/v1/avatar/:avatarId", async (req, res) => {
  const user = getAuthUser(req);
  if (!user) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  const avatar = await prisma.avatar.findFirst({
    where: {
      id: req.params.avatarId,
      userId: user.id,
    },
    include: {
      avatarImages: true,
    },
  });

  if (!avatar) {
    return res.status(404).json({ message: "Avatar not found" });
  }

  return res.status(200).json({
    avatar: {
      id: avatar.id,
      name: avatar.name,
      images: avatar.avatarImages.map((image) => ({
        id: image.id,
        type: image.type,
        url: image.url,
      })),
    },
  });
});

app.get("/api/v1/videos", async (req, res) => {
  const user = getAuthUser(req);
  if (!user) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  const videos = await prisma.avatarVideo.findMany({
    where: { userId: user.id },
    orderBy: { id: "asc" },
  });

  return res.status(200).json({
    videos: videos.map((video) => ({
      id: video.id,
      prompt: video.prompt,
      status: video.status,
      startFrame: video.startFrame,
      endFrame: video.endFrame,
      duration: video.duration,
      width: video.width,
      height: video.height,
      url: video.url,
    })),
  });
});

app.get("/api/v1/video/:videoId", async (req, res) => {
  const user = getAuthUser(req);
  if (!user) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  const video = await prisma.avatarVideo.findFirst({
    where: {
      id: req.params.videoId,
      userId: user.id,
    },
  });

  if (!video) {
    return res.status(404).json({ message: "Video not found" });
  }

  return res.status(200).json({
    video: {
      id: video.id,
      prompt: video.prompt,
      status: video.status,
      startFrame: video.startFrame,
      endFrame: video.endFrame,
      duration: video.duration,
      width: video.width,
      height: video.height,
      url: video.url,
    },
  });
});

app.get("/api/v1/models", (req, res) => {
  return res.status(200).json({
    models: [
      {
        id: "flux-kontext",
        name: "FLUX.1-Kontext-dev",
        description: "Image-to-image avatar generation",
      },
      {
        id: "wan2.1-i2v",
        name: "Wan-AI/Wan2.1-I2V-14B-720P",
        description: "Image-to-video motion generation",
      },
    ],
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("App is listening on port ", PORT);
});