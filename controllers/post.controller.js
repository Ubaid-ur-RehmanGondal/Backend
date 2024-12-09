import Notification from "../models/notification.model.js";
import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import { v2 as cloudinary } from "cloudinary";

export const createPost = async (req, res) => {
  try {
    const { text, label } = req.body;
    let { image } = req.body;
    const userId = req.user._id.toString();
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (!text && !image)
      return res.status(400).json({ error: "Post must have text or image" });
    if (!label)
      return res.status(400).json({ error: "Post must have a label" });
    if (image) {
      const uploadedResponse = await cloudinary.uploader.upload(image);
      image = uploadedResponse.secure_url;
    }
    const newPost = new Post({
      user: userId,
      text,
      label,
      image,
    });
    await newPost.save();
    res.status(201).json(newPost);
  } catch (error) {
    console.log("Error in createPost: ", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    if (post.user.toString() !== req.user._id.toString())
      return res.status(401).json({ message: "Unauthorized" });
    if (post.image) {
      const imageId = post.image.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(imageId);
    }
    await Post.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.log("Error in deletePost: ", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
export const commentOnPost = async (req, res) => {
  try {
    const { text } = req.body;
    const postId = req.params.id;
    const userId = req.user._id;

    if (!text) return res.status(400).json({ message: "Text is required" });

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const comment = {
      user: userId,
      text,
    };
    post.comments.push(comment);
    await post.save();
    res.status(201).json(post);
  } catch (error) {
    console.log("Error in commentOnPost: ", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const likeUnlikePost = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id: postId } = req.params;
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });
    const userLiked = post.likes.includes(userId);
    if (userLiked) {
      // Unlike
      await Post.updateOne({ _id: postId }, { $pull: { likes: userId } });
      await Post.updateOne({ _id: userId }, { $pull: { likedPosts: postId } });
      const updatedLikes = post.likes.filter(
        (id) => id.toString() !== userId.toString()
      );
      res.status(200).json(updatedLikes);
    } else {
      // like
      post.likes.push(userId);
      await User.updateOne({ _id: userId }, { $push: { likedPosts: postId } });
      await post.save();
      const notification = new Notification({
        from: userId,
        to: post.user,
        type: "like",
      });
      await notification.save();
      const updatedLikes = post.likes;
      res.status(201).json(updatedLikes);
    }
  } catch (error) {
    console.log("Error in likeUnlikePost: ", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find({...req.query})
      .sort({ createdAt: -1 })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password",
      });

    if (posts.length === 0) {
      return res.status(200).json([]);
    }

    res.status(200).json(posts.filter(p=> p.user));
  } catch (error) {
    console.log("Error in getAllPosts controller: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
export const getLikedPosts = async (req, res) => {
  const userId = req.params.id;
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    const likedPost = await Post.find({ _id: { $in: user.likedPosts } })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password",
      });
    res.status(200).json(likedPost);
  } catch (error) {
    console.log("Error in getLikedPosts: ", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
export const getFollowingPosts = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    const following = user.following;
    const feedPosts = await Post.find({ user: { $in: following } })
      .sort({ createdAt: -1 })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password",
      });
    res.status(200).json(feedPosts);
  } catch (error) {
    console.log("Error in getFollowingPosts: ", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
export const getUserPosts = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: "User not found" });

    const posts = await Post.find({ user: user._id })
      .sort({ createdAt: -1 })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password",
      });
    res.status(200).json(posts);
  } catch (error) {
    console.log("Error in getUserPosts: ", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
