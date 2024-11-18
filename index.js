const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { default: mongoose } = require("mongoose");
const User = require("./models/user");
const Post = require("./models/post");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");
const fs = require("fs");

dotenv.config({ path: "config.env" });
const salt = bcrypt.genSaltSync(10);
const secret = "powieuvmqpieucvmiuwteqwoicmqroim";

const multer = require("multer");
const uploadMiddleware = multer({ dest: "uploads/" });

dotenv.config({ path: "config.env" });

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static(__dirname + "/uploads"));

app.use(cors({
    origin: ["https://client-rho-dusky-52.vercel.app"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.options("https://client-rho-dusky-52.vercel.app/", cors()); // Handle preflight requests

mongoose.connect(
  "mongodb+srv://ahmedkhaledg49:node-js-123@learn-mongo-db.jvk8d.mongodb.net/mern?retryWrites=true&w=majority&appName=learn-mongo-db"
);

app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  try {
    const userDoc = await User.create({
      username,
      password: bcrypt.hashSync(password, salt),
    });
    res.json(userDoc);
  } catch (e) {
    res.status(400).json(e);
  }
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const userDoc = await User.findOne({ username });
  if(!userDoc){
    res.status(400).json({msg:"invalid username or password"})
  }
  const passOk = bcrypt.compareSync(password, userDoc.password);
  if (passOk) {
    jwt.sign({ username, id: userDoc._id }, secret, {}, (err, token) => {
      if (err) throw err;
      res.cookie("token", token).json({
        id: userDoc._id,
        username,
      });
    });
  } else {
    res.status(400).json("wrong credentials");
  }
});

app.get("/profile", (req, res) => {
  const { token } = req.cookies;

  jwt.verify(token, secret, {}, (err, info) => {
    if (err) throw err;
    res.json(info);
  });
});

app.post("/logout", (req, res) => {
  res.cookie("token", "").json("ok");
});

app.post("/post", uploadMiddleware.single("file"), async (req, res) => {
  try {


    const token = req.cookies.token;
    jwt.verify(token, secret, {}, async (err, info) => {
      if (err) {
        return res.status(500).json({ msg: "invalid token", error: err });
      }
      const { title, summary, content } = req.body;
      const postDoc = await Post.create({
        title,
        summary,
        content,
        
        author: info.id,
      });
      res.json(postDoc);
    });
  } catch (error) {
    res.status(500).json({ msg: "internal server error", error });
  }
});


app.get("/post", async (req, res) => {
  const posts = await Post.find()
    .populate("author", ["username"])
    .sort({ createdAt: -1 })
    .limit(20);
  res.json(posts);
});

app.get("/post/:id", async (req, res) => {
  const { id } = req.params;
  const postDoc = await Post.findById(id).populate("author", ["username"]);
  res.json(postDoc);
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`listening from port ${PORT}`);
});
