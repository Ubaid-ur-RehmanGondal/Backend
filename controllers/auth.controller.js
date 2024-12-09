import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { generateTokenanSetCookie } from "../lib/utils/generateTokenanSetCookie.js";

export const register = async (req, res) => {
  try {
    const { fullName, username, email, password } = req.body;
    // full Name validation
    const fullNameRegex = /^[a-zA-Z\s]+$/;
    const existingFullName = await User.findOne({ fullName });
    if (existingFullName)
      return res.status(400).json({ message: "Full Name already exists." });
    if (!fullNameRegex.test(fullName))
      return res
        .status(400)
        .json({ message: "Full Name can only contain letters." });
    if (fullName.length < 3 || fullName.length > 30)
      return res
        .status(400)
        .json({ message: "Full Name must be between 3 and 30 characters." });
    // username validation
    const existingUsername = await User.findOne({ username });
    if (existingUsername)
      return res.status(400).json({ message: "Username already exists." });
    if (username.length < 3 || username.length > 30)
      return res
        .status(400)
        .json({ message: "Username must be between 3 and 30 characters." });
    // email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const existingEmail = await User.findOne({ email });
    if (existingEmail)
      return res.status(400).json({ message: "Email already exists." });
    if (!emailRegex.test(email))
      return res.status(400).json({ message: "Invalid Email." });
    if (email.length < 3 || email.length > 50)
      return res
        .status(400)
        .json({ message: "Email must be between 3 and 50 characters." });
    // password validation
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    if (password.length < 6)
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters." });
    // create new user
    const newUser = new User({
      fullName,
      username,
      email,
      password: hashedPassword,
    });
    if (newUser) {
      generateTokenanSetCookie(newUser._id, res);
      await newUser.save();
      res.status(200).json({
        _id: newUser._id,
        fullName: newUser.fullName,
        username: newUser.username,
        email: newUser.email,
        followers: newUser.followers,
        following: newUser.following,
        profilePicture: newUser.profilePicture,
        coverImage: newUser.coverImage,
        bio: newUser.bio,
        link: newUser.link,
        token: newUser.token,
      });
    } else {
      res.status(400).json({ message: "User not created." });
    }
  } catch (error) {
    console.log("error in register: ", error);
    res.status(500).json({ message: "Something went wrong." });
  }
};

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const isAdmin = req.query?.isAdmin;

    if (isAdmin === "true") {
      const admin = await User.findOne({ isAdmin: true });

      if (!admin) {
        res.status(400).json({ message: "Invalid Credentials" });
        return;
      }
      // Compare the provided password with the hashed password stored in the database
      const passwordMatch = await bcrypt.compare(password, admin.password);
      if (!passwordMatch) {
        res.status(400).json({ message: "Invalid Credentials" });
        return;
      }

      const userObj = { ...admin._doc };
      delete userObj["password"];

      generateTokenanSetCookie(userObj._id, res);
      res.status(200).json({
        _id: userObj._id,
        username: userObj.username,
        email: userObj.email,
        token: userObj.token,
      });
    } else {
      const user = await User.findOne({ username });
      const isMatch = await bcrypt.compare(password, user?.password || "");
      if (!user || !isMatch)
        return res.status(400).json({ message: "Invalid credentials." });
      generateTokenanSetCookie(user._id, res);
      res.status(200).json({
        _id: user._id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        followers: user.followers,
        following: user.following,
        profilePicture: user.profilePicture,
        coverImage: user.coverImage,
        bio: user.bio,
        link: user.link,
        token: user.token,
      });
    }
  } catch (error) {
    console.log("error in login: ", error);
    res.status(500).json({ message: "Something went wrong." });
  }
};

export const logout = async (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out." });
  } catch (error) {
    console.log("error in logout: ", error);
    res.status(500).json({ message: "Something went wrong." });
  }
};

export const me = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found." });
    res.status(200).json(user);
  } catch (error) {
    console.log("error in me: ", error);
    res.status(500).json({ message: "Something went wrong." });
  }
};
