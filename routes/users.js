import express from "express";
import path from "path";
import multer from "multer";

import {
  getUser,
  getAllUsers,
  createUserAbout,
  getUserAbout,
  updateUserAbout,
  verifyUserManually,
  deleteUser,
  deleteUserAbout,
  setProfilePicture,
  updateUser,
  setCoverPicture,
} from "../controllers/user.js";
import { getUserPosts } from "../controllers/post.js";
import { verifyEmail } from "../controllers/user.js";

import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

router.get("/users", getAllUsers);
router.get("/users/:userId", getUser);
router.put(
  "/users/profilePicture/:userId",
  upload.array("profilePicture", 1),
  setProfilePicture
);
router.post(
  "/users/coverPicture/:userId",
  upload.array("coverPicture", 1),
  setCoverPicture
);
router.get("/users/:userId/posts", getUserPosts);
router.post("/users/:userId/about", createUserAbout);
router.get("/users/:userId/about", getUserAbout);
router.put("/users/:userId/about", updateUserAbout);
router.put("/update/:userId", updateUser);
router.put("/users/:userId/", verifyUserManually);
router.delete("/users/:userId", deleteUser);
router.delete("/users/:aboutId", deleteUserAbout);

// router.get("/verified", (req, res) => {
//   res.sendFile(path.join(__dirname, "./views/build", "index.html"));
// });

router.get("/verified", (req, res) => {
  const filePath = path.join(__dirname, "../views/build", "index.html");
  res.sendFile(filePath, (err) => {
    if (err) {
      console.error(err);
      res.status(500).send("Error serving HTML file");
    }
  });
});

//EMAIL VERIFICATION
router.get("/users/verify/:userId/:token", verifyEmail);

// PASSWORD RESET
// router.post("/request-passwordreset", requestPasswordReset);
// router.get("/reset-password/:userId/:token", resetPassword);
// router.post("/reset-password", changePassword);

export default router;
