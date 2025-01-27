import Comments from "../models/CommentModel.js";
import Post from "../models/Post.js";
import User from "../models/User.js";
import Notification from "../models/notificationModel.js";
import { createCommentNotification }  from "../models/notification.js";

export const createComment = async (req, res) => {
  try {
    console.log(req.body)
    const { content, postId, from } = req.body;
    const userId = req.body.userId;

    const user = await User.findOne({
      _id: userId,
    });
    console.log(userId)
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    const { firstName, lastName, profilePicture } = user;

    const author = firstName + " " + lastName;
    const post = await Post.findById(postId);
    await createCommentNotification(author, postId, post.userId);

    
    
    const comment = new Comments({
      postId,
      userId,
      content: req.body.content,
      author: author,
      commenterProfilePicture: profilePicture
    });
    

    await comment.save();

    await Post.findByIdAndUpdate(
      postId,
      { $push: { comments: comment } },
      { new: true },
    );

    return res.status(201).json(comment);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

export const updateComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    const updatedComment = await Comments.findByIdAndUpdate(
      id,
      { content },
      { new: true },
    );

    return res.json(updatedComment);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;

    const userId = req.body.userId;
    const postId = req.body.postId;

    const deletedComment = await Comments.findOne({
      _id: id,
      postId,
      userId,
    });

    if (!deletedComment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    await Post.findByIdAndUpdate(
      postId,
      { $pull: { comments: deletedComment._id } },
      { new: true },
    );

    await Comments.deleteOne({ _id: deletedComment._id });

    return res.status(201).json({
      message: "Comment deleted successfully",
      _id: deletedComment._id,
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

export const getCommentsForPost = async (req, res, next) => {
  try {
    const { postId } = req.params;

    const postComments = await Comments.find({ postId })
      .populate({
        path: "userId",
        select: "firstName lastName location profileUrl",
      })
      .populate({
        path: "replies.userId",
        select: "firstName lastName location profileUrl",
      })
      .sort({ _id: -1 });

    res.status(200).json({
      sucess: true,
      message: "successfully",
      data: postComments,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};

export const likePostComment = async (req, res, next) => {
  const { userId } = req.body;
  const { id, rid } = req.params;

  try {
    if (rid === undefined || rid === null || rid === `false`) {
      const comment = await Comments.findById(id);

      const index = comment.likes.findIndex((el) => el === String(userId));

      if (index === -1) {
        comment.likes.push(userId);
      } else {
        comment.likes = comment.likes.filter((i) => i !== String(userId));
      }

      const updated = await comment.save();

      res.status(201).json(updated);
    } else {
      const replyComments = await Comments.findOne(
        { _id: id },
        {
          replies: {
            $elemMatch: {
              _id: rid,
            },
          },
        },
      );

      const index = replyComments?.replies[0]?.likes.findIndex(
        (i) => i === String(userId),
      );

      if (index === -1) {
        replyComments.replies[0].likes.push(userId);
      } else {
        replyComments.replies[0].likes = replyComments.replies[0]?.likes.filter(
          (i) => i !== String(userId),
        );
      }

      const query = { _id: id, "replies._id": rid };

      const updated = {
        $set: {
          "replies.$.likes": replyComments.replies[0].likes,
        },
      };

      const result = await Comments.updateOne(query, updated, { new: true });

      res.status(201).json(result);
    }
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};

export const commentPost = async (req, res, next) => {
  try {
    const { comment, from } = req.body;
    const { userId } = req.body.user;
    const { id } = req.params;

    if (comment === null) {
      return res.status(404).json({ message: "Comment is required." });
    }

    const newComment = new Comments({ comment, author, userId, postId: id });

    await newComment.save();

    const post = await Post.findById(id);

    post.comments.push(newComment._id);

    const updatedPost = await Post.findByIdAndUpdate(id, post, {
      new: true,
    });

    res.status(201).json(newComment);
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};

export const replyPostComment = async (req, res, next) => {
  try {
    const userId = req.body.userId;
    const { content } = req.body;
    const { id } = req.params;

    const user = await User.findOne({
      _id: userId,
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { firstName, lastName } = user;

    const author = firstName + " " + lastName;

    if (!content) {
      return res.status(404).json({ message: "Content is required." });
    }

    const commentInfo = await Comments.findById(id);

    commentInfo.replies.push({
      content,
      author,
      userId,
      created_At: Date.now(),
    });

    await commentInfo.save();

    const updatedCommentInfo = await Comments.findById(id)
      .populate({
        path: "replies.userId",
        select: "firstName lastName location profileUrl",
      })
      .populate({
        path: "replies.likes",
        select: "firstName lastName location profileUrl",
      })
      .populate({
        path: "replies",
        select: "content author userId likes created_At",
      });

    res.status(200).json(updatedCommentInfo);
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};
