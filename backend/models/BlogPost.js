const mongoose = require('mongoose');

const BlogPostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
    },
    siteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Site",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    content: {
      type: String,
      default: "",
    },

    description: {
      type: String,
      default: "",
    },
    keywords: {
      type: String,
      default: "",
    },
    publishTime: {
      type: String,
      default: "",
    },
    publishDate: {
      type: String,
      default: "",
    },
    image: {
      type: String,
      default: "",
    },
    imageCaption: {
      type: String,
      default: "",
    },
    imageAbstract: {
      type: String,
      default: "",
    },
    imageAlternativeHeadline: {
      type: String,
      default: "",
    },
    imageKeywords: {
      type: String,
      default: "",
    },
    twitterLabel1: {
      type: String,
      default: "",
    },
    twitterData1: {
      type: String,
      default: "",
    },
    twitterLabel2: {
      type: String,
      default: "",
    },
    twitterData2: {
      type: String,
      default: "",
    },
    articleSection: {
      type: String,
      default: "",
    },
    articleTag1: {
      type: String,
      default: "",
    },
    articleTag2: {
      type: String,
      default: "",
    },
    articleTag3: {
      type: String,
      default: "",
    },
    articleTag4: {
      type: String,
      default: "",
    },
    articleTag5: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('BlogPost', BlogPostSchema);