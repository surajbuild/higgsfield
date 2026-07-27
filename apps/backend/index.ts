import express from "express";
import { prisma } from "./db";
import { CreateUserSchema } from "./types";
import bcrypt from "bcryptjs";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



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
      username,
    },
  });

  if (existingUser) {
    return res.status(409).json({
      message: "Username already exists",
    });
  }
  const hashedPassword = await bcrypt.hash(password, 10)

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

app.get("/api/v1/signin", (req, res) => {
  console.log("signin called");
});

app.get("/api/v1/avatar", (req, res) => {
  console.log("avatar called");
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
