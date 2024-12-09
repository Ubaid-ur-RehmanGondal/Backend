import Post from "../models/post.model.js";
import User from "../models/user.model.js";

export const search = async (req, res) => {
  const { searchTerm, type } = req.query;

  if (!searchTerm) {
    return res.status(500).json({ error: "Search term is required" });
  }

  let results;

  switch (type) {
    case "posts":
      results = await Post.find({ text: { $regex: searchTerm, $options: "i" } })
        .sort({ createdAt: -1 })
        .populate({
          path: "user",
          select: "-password",
        })
        .populate({
          path: "comments.user",
          select: "-password",
        });
      break;
    case "users":
      results = await User.find({
        username: { $regex: searchTerm, $options: "i" },
      });
      break;
    case "labels":
      results = await Post.find({
        label: { $regex: searchTerm, $options: "i" },
      });
      break;
    default:
      return res.status(400).json({ error: "Invalid search type" });
  }
  console.log(results);

  res.json(results);
};
