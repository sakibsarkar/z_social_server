import { Schema, model } from "mongoose";

const onlineStatusScehma = new Schema({
  isOnline: { type: Boolean, default: false },
  time: { type: Date, require: true, default: Date.now() },
});

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    gender: {
      type: String,
      required: true,
      enum: ["male", "female"],
    },
    profilePic: {
      type: String,
      default: "",
    },
    onlineStatus: {
      type: onlineStatusScehma,
      required: false,
      default: { isOnline: true, time: Date.now() },
    },
  },
  { timestamps: true }
);

const User = model("User", userSchema);

export default User;
