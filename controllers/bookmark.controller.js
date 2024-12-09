import Notification from "../models/notification.model.js";
import Bookmark from "../models/bookmark.model.js";
import Post from "../models/post.model.js";

export const createBookmark = async (req, res) => {
  try {
    const { post, user } = req.body;

    const newBookmark = new Bookmark({
      user,
      post,
    });
    await newBookmark.save();
    const postItem = await Post.findById(post);
    const notification = new Notification({
      from: user,
      to: postItem.user,
      type: "bookmark",
    });
    await notification.save();
    res.status(201).json(newBookmark);
  } catch (error) {
    console.log("Error in createBookmark: ", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getBookmarks = async (req, res) => {
  try {
    const bookmarks = await Bookmark.find({ user: req.params.id })
      .sort({ createdAt: -1 })
      .populate({
        path: "post",
        select: "-password",
      });

    if (bookmarks.length === 0) {
      return res.status(200).json([]);
    }

    // Use Promise.all to handle all async operations for each post
    const posts = await Promise.all(
      bookmarks.map(async (bookmark) => {
        const post = await Post.findById(bookmark.post)
          .populate({
            path: "user",
            select: "-password",
          })
          .populate({
            path: "comments.user",
            select: "-password",
          });
        return post;
      })
    );

    res.status(200).json(posts.filter(p => p));
  } catch (error) {
    console.log("Error in getAllbookmarks controller: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
