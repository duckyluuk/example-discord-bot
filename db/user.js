const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    user_id: String,
    username: String,
    score: Number,
});

module.exports = mongoose.model("User", UserSchema);