const fs = require("fs");
const { mongoose } = require("mongoose");
const Post = require('../models/post')

// connect to DB
mongoose.connect(
  "mongodb+srv://ahmedkhaledg49:node-js-123@learn-mongo-db.jvk8d.mongodb.net/mern?retryWrites=true&w=majority&appName=learn-mongo-db"
);

// Read data
const posts = JSON.parse(fs.readFileSync("./blogs.json"));

// Insert data into DB
const insertData = async () => {
  try {
    await Post.create(posts);

    console.log("Data Inserted");
    process.exit();
  } catch (error) {
    console.log(error);
  }
};

// Delete data from DB
const destroyData = async () => {
  try {
    await Post.deleteMany();
    console.log("Data Destroyed");
    process.exit();
  } catch (error) {
    console.log(error);
  }
};

// node seeder.js -d
if (process.argv[2] === "-i") {
  insertData();
} else if (process.argv[2] === "-d") {
  destroyData();
}
