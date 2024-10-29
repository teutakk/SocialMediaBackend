import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import mongoose from "mongoose";

import friendsRoutes from "./routes/friends.routes.js";
import authRoutes from "./routes/auth.js";
import postRoutes from "./routes/posts.js";
import userRoutes from "./routes/users.js";
import commentRoutes from "./routes/comment.routes.js";
import productRoutes from "./routes/product.js";
import chatRoutes from "./routes/chat.routes.js"
import messagesRoutes from "./routes/messages.routes.js"

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration
app.use(cors());

// Logging
app.use(morgan("common"));

// Routes
app.use(authRoutes);
app.use(postRoutes);
app.use(userRoutes);
app.use(commentRoutes);
app.use(friendsRoutes);
app.use(productRoutes);
app.use('/chat', chatRoutes);
app.use('/message', messagesRoutes);

const MONGO_URL = process.env.MONGO_URL;
const PORT = process.env.PORT;
console.log("Connecting to MongoDB using URL:", MONGO_URL);
try {
  mongoose
    .connect(MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log("DB Connected Successfully"); 
    })
    .catch((err) => {
      console.error("DB Connection Error: ", err.message);
    });
} catch (err) {
  console.log(`${err}: did not connect.`);
}

app.listen(PORT, () => {
  console.log(`Listening on PORT ${PORT}`);
});
