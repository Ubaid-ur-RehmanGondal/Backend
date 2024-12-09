import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { v2 as cloudinary } from "cloudinary";
import sendEmail from "../lib/utils/sendEmail.js";
import ResetToken from "../models/resettoken.model.js";

export const getUserProfile = async (req, res) => {
  const { username } = req.params;

  try {
    const user = await User.findOne({ username }).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user);
  } catch (error) {
    console.log("Error in getUserProfile: ", error.message);
    res.status(500).json({ error: error.message });
  }
};

const mailTemplate = (content, buttonUrl, buttonText) => {
  return `<!DOCTYPE html>
  <html>
  <body style="text-align: center; font-family: 'Verdana', serif; color: #000;">
    <div
      style="
        max-width: 400px;
        margin: 10px;
        background-color: #fafafa;
        padding: 25px;
        border-radius: 20px;
      "
    >
      <p style="text-align: left;">
        ${content}
      </p>
      <a href="${buttonUrl}" target="_blank">
        <button
          style="
            background-color: #fe6347;
            border: 0;
            width: 200px;
            height: 30px;
            border-radius: 6px;
            color: #fff;
          "
        >
          ${buttonText}
        </button>
      </a>
      <p style="text-align: left;">
        If you are unable to click the above button, copy paste the below URL into your address bar
      </p>
      <a href="${buttonUrl}" target="_blank">
          <p style="margin: 0px; text-align: left; font-size: 10px; text-decoration: none;">
            ${buttonUrl}
          </p>
      </a>
    </div>
  </body>
</html>`;
};

export const forgotPassword = async (req, res) => {
  try {
    const email = req.body.email;
    const user = await User.findOne({ email });

    if (!user) {
      res.status(500).json({ message: "You are not registered!" });
    } else {
      const token = crypto.randomBytes(20).toString("hex");
      const resetToken = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");
      const newToken = new ResetToken({
        token: resetToken,
        user: user._id?.toString(),
        expiresAt: new Date(Date.now() + 60 * 60 * 24 * 1000).toISOString(),
      });

      await newToken.save();

      const mailOption = {
        email: user.email,
        subject: "Forgot Password Link | Anjuman",
        message: mailTemplate(
          "We have received a request to reset your password. Please reset your password using the link below.",
          `${
            process.env.FRONTEND_URL
          }/reset-password?id=${user._id?.toString()}&token=${resetToken}`,
          "Reset Password"
        ),
      };
      await sendEmail(mailOption);
      res.json({
        success: true,
        message: "A password reset link has been sent to your email.",
      });
    }
  } catch (err) {
    console.log(err);
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({...req.query})
      .sort({ createdAt: -1 }); 

    if (users.length === 0) {
      return res.status(200).json([]);
    }

    res.status(200).json(users);
  } catch (error) {
    console.log("Error in getAllUsers controller: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updatePassword = async (req, res) => {
  try {
    const { password, confirmpassword, token, userId } = req.body;

    if(password !== confirmpassword) {
      res.status(500).json({ status: false, error: "Passwords do not match!" });
      return;
    }

    const userToken = await ResetToken.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(1);
    if (!res || res.length === 0) {
      res.status(500).json({ message: "Some proble occured!" });
    } else {
      const currDateTime = new Date();
      const expiresAt = new Date(userToken[0]?.expiresAt);
      if (currDateTime > expiresAt) {
        res.status(500).json({
          success: false,
          message: "Reset Password link has expired!",
        });
      } else if (userToken[0]?.token !== token) {
        res.status(500).json({
          success: false,
          message: "Reset Password link is invalid!",
        });
      } else {
        await ResetToken.deleteMany({ user: userId });
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await User.findByIdAndUpdate(userId, {
          password: hashedPassword,
        });
        res.json({
          success: true,
          message: "Reset password done! You can log in with new credentials!",
        });
      }
    }
  } catch (err) {
    console.log(err);
  }
};

export const getSuggestedUsers = async (req, res) => {
  try {
    const userId = req.user._id;
    const userFollowedByMe = await User.findById(userId).select("following");
    const users = await User.aggregate([
      { $match: { _id: { $ne: userId } } }, // exclude current user
      { $sample: { size: 10 } }, // get 10 random users
    ]);
    const filtredUsers = users.filter(
      (user) => !userFollowedByMe.following.includes(user._id)
    );
    const suggestedUsers = filtredUsers.slice(0, 4);
    suggestedUsers.forEach((user) => (user.password = null));
    res.status(200).json(suggestedUsers);
  } catch (error) {
    console.log("error in getSuggestedUsers: ", error);
    res.status(500).json({ message: "Something went wrong." });
  }
};

export const reportPost = async (req, res) => {
  try {
    const { post, user } = req.body;

    const userData = await User.findOne({ _id: user });

    await sendEmail({
      email: "mjunaid.swe@gmail.com",
      subject: "Report from Anjuman User",
      message: `<!DOCTYPE html>
  <html>
  <body>
     <h4>A report request has been received: </h4>

     <p><strong>Post ID: </strong>${post}</p>
     <p><strong>Author Username: </strong>@${userData?.username}</p>
     <p><strong>Author Email: </strong>${userData?.email}</p>
  </body>
</html>`,
    });
    res.status(201).json(true);
  } catch (error) {
    console.log("Error in createBookmark: ", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const followUnfollowUser = async (req, res) => {
  try {
    const { id } = req.params;
    const userToModify = await User.findById(id);
    const currentUser = await User.findById(req.user._id);

    if (id === req.user._id.toString()) {
      return res
        .status(400)
        .json({ error: "You can't follow/unfollow yourself" });
    }

    if (!userToModify || !currentUser)
      return res.status(400).json({ error: "User not found" });

    const isFollowing = currentUser.following.includes(id);

    if (isFollowing) {
      // Unfollow the user
      await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } });
      await User.findByIdAndUpdate(req.user._id, { $pull: { following: id } });

      res.status(200).json({ message: "User unfollowed successfully" });
    } else {
      // Follow the user
      await User.findByIdAndUpdate(id, { $push: { followers: req.user._id } });
      await User.findByIdAndUpdate(req.user._id, { $push: { following: id } });
      // Send notification to the user
      const newNotification = new Notification({
        type: "follow",
        from: req.user._id,
        to: userToModify._id,
      });

      await newNotification.save();

      res.status(200).json({ message: "User followed successfully" });
    }
  } catch (error) {
    console.log("Error in followUnfollowUser: ", error.message);
    res.status(500).json({ error: error.message });
  }
};

export const updateUser = async (req, res) => {
  const { fullName, email, username, currentPassword, newPassword, bio, link } =
    req.body;
  let { profileImg, coverImg } = req.body;

  const userId = req.user._id;

  try {
    let user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (
      (!newPassword && currentPassword) ||
      (!currentPassword && newPassword)
    ) {
      return res.status(400).json({
        error: "Please provide both current password and new password",
      });
    }

    if (currentPassword && newPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch)
        return res.status(400).json({ error: "Current password is incorrect" });
      if (newPassword.length < 6) {
        return res
          .status(400)
          .json({ error: "Password must be at least 6 characters long" });
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    if (profileImg) {
      if (user.profileImg) {
        await cloudinary.uploader.destroy(
          user.profileImg.split("/").pop().split(".")[0]
        );
      }

      const uploadedResponse = await cloudinary.uploader.upload(profileImg);
      profileImg = uploadedResponse.secure_url;
    }

    if (coverImg) {
      if (user.coverImg) {
        await cloudinary.uploader.destroy(
          user.coverImg.split("/").pop().split(".")[0]
        );
      }

      const uploadedResponse = await cloudinary.uploader.upload(coverImg);
      coverImg = uploadedResponse.secure_url;
    }

    user.fullName = fullName || user.fullName;
    user.email = email || user.email;
    user.username = username || user.username;
    user.bio = bio || user.bio;
    user.link = link || user.link;
    user.profilePicture = profileImg || user.profilePicture;
    user.coverImage = coverImg || user.coverImage;

    user = await user.save();

    user.password = null;

    return res.status(200).json(user);
  } catch (error) {
    console.log("error in updateUser: ", error);
    res.status(500).json({ message: "Something went wrong." });
  }
};
