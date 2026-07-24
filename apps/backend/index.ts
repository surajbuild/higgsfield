import express from "express";

const app = express();

app.post("/api/v1/signup", (req, res) => {
  console.log("signup called");
  res.send("Hello sir");
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

app.get('/api/v1/models', (req, res) => {
    console.log('models called');
})

app.get('/api/v1/avatars', (req, res) => {
    console.log('avatars called');
})


const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
    console.log('App is listining on port ', PORT);
})