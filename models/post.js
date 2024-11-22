const mongoose = require('mongoose')
const { Schema, model } = mongoose;

const postSchema = new Schema(
  {
    title: String,
    summary: String,
    content: String,
    cover: String,
    author: { type: String, ref: "User" },
    authorPic: String,
    published_date: String,
    reading_time: String,
    tags: Array,
  },
  {
    timestamps: true,
  }
);

const PostModel = model("Post", postSchema);

module.exports = PostModel;