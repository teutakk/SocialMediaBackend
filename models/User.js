import mongoose, { Schema } from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      min: 2,
      max: 30,
    },
    lastName: {
      type: String,
      required: true,
      min: 2,
      max: 30,
    },
    profilePicture: [{ type: String }],
    coverPicture: [{ type: String }],
    email: {
      type: String,
      required: true,
      max: 30,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      min: 8,
    },
    confirmPassword: {
      type: String,
      required: true,
      validate: {
        validator: function (validate) {
          return validate === this.password;
        },
        message: "Password confirmation does not match the password.",
      },
    },
    friends: [{ type: Schema.Types.ObjectId, ref: "User" }],
    views: [{ type: String }],
    gender: {
      type: String,
      enum: ["Male", "Female", "Other", "Prefer not to say"],
    },
    birthday: {
      type: Date,
    },
    verified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const User = mongoose.model("User", UserSchema);

export default User;
