import mongoose from "mongoose";
import sendEmail from "../lib/utils/sendEmail.js";
import Post from "../models/post.model.js";
import User from "../models/user.model.js";

export const sendEmailMessage = async (req, res) => {
  try {
    const { subject, body, to } = req.body;
    await sendEmail({
      email: to,
      subject: subject,
      message: `<!DOCTYPE html>
  <html>
  <body>
        <p>${body}</p>

        <br/>
        <p>Anjuman @2024</p>
  </body>
</html>`,
    });
    res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to send email" });
  }
};

export const deleteUser = async (req, res) => {
  try {

    const userId = req.body.user;
    await User.findByIdAndDelete(userId); 
    const del = await Post.deleteMany({
      user: userId
    }); 


    res.status(200).json({ message: "User Deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete user" });
  }
};


export const deletePost = async (req, res) => {
  try {

    const postId = req.body.post;
    const del = await Post.findByIdAndDelete(postId); 

    res.status(200).json({ message: "Post Deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete post" });
  }
};