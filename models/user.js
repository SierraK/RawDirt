const mongoose = require("mongoose"),
    passportLocalMongoose = require("passport-local-mongoose");

const UserSchema = new mongoose.Schema({
    username: {type: String},
    avatar:  {type: String, default: 'https://www.nicepng.com/png/detail/162-1626559_photo-one-punch-man-steam-avatar.png'},
    firstName: {type: String},
    lastName: {type: String}, 
    email: {type: String, unique: true, required: true},
    password: {type: String},
    phoneNumber: {type: String},
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    isAdmin: {type: Boolean, default: false},
});
UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);
