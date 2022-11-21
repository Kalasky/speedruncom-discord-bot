const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    discord_id: {
      type: String,
      trim: true,
      required: true,
      unique: true,
    },
    speedrun_categories: {
        type: Array,
        trim: true,
    },
    placings: {
        type: Array,
        trim: true
    },
    speedruncom_username: {
        type: String,
        required: true,
        trim: true,
        unique: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);