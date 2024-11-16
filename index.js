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
const secret = process.env.SECRET;


const multer = require("multer");
const uploadMiddlewar = multer({ dest: "uploads/" });

dotenv.config({ path: "config.env" });

const app = express();

const corsOptions = {
  credentials: true,
  origin: ["https://client-rho-dusky-52.vercel.app/"],
  methods:["GET","POST","PUT","DELETE"],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use('/uploads',express.static(__dirname +'/uploads'))

const url = process.env.URL;
mongoose.connect(url);

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

app.post("/post", uploadMiddlewar.single("file"), async (req, res) => {
  const { originalname, path } = req.file;
  const parts = originalname.split(".");
  const ext = parts[parts.length - 1];
  const newPath = path + "." + ext;
  fs.renameSync(path, newPath);

  const { token } = req.cookies;
  jwt.verify(token, secret, {},async (err, info) => {
    if (err) throw err;

    const { title, summary, content } = req.body;
    const postDoc = await Post.create({
    title,
    summary,
    content,
    cover: newPath,
    author:info.id,
  });
    res.json(postDoc);
  })
});

app.get("/post",async(req,res)=>{
  const posts = await Post.find().populate("author", ["username"]).sort({createdAt:-1}).limit(20);
  res.json(posts);
})

app.get('/post/:id',async(req,res)=>{
  const {id}=req.params
  const postDoc = await Post.findById(id).populate("author", ["username"]);
  res.json(postDoc);
})

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`listening from port ${PORT}`);
});

