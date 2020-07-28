const Offroad = require("../models/offroad");
const Comment    = require("../models/comment");
const multer = require("multer");

const middlewareObj = {};

// checks if offroad listing belongs to user
middlewareObj.checkOffroadOwnership = async (req, res, next) => {
    if(req.isAuthenticated()) {
        try {
            let foundOffroad = await Offroad.findById(req.params.id);
            if(foundOffroad.author.id.equals(req.user._id)) {
                next();
            }
        } catch(err) {
            req.flash("error", err.message)
            return res.redirect("back");
        }
    }
}

// checks if comment belongs to user
middlewareObj.checkCommentOwnership = async (req, res, next) => {
    if(req.isAuthenticated()) {
        let foundComment = await Comment.findById(req.params.comment_id);
        try {
            if(foundComment.author.id.equals(req.user._id)) {
                next();
            }
        } catch(err) {
            req.flash("error", err.message)
            res.redirect("back");
        }
    }
}

// checks is user is logged in 
middlewareObj.isLoggedIn = (req, res, next) => {
    if(req.isAuthenticated()) {
        return next();
    }
    req.flash("error", "You need to be logged in first")
    res.redirect("/login");
}

// Set The Storage Engine for Cloudinary
middlewareObj.storage = multer.diskStorage({
    filename: function (req, file, cb) {
      cb(
        null, Date.now() + file.originalname);
    },
});

// Check File Type
middlewareObj.imageFilter = (req, file, cb) => {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};

// Init Upload
middlewareObj.upload = multer({
    storage: middlewareObj.storage,
    fileFilter: middlewareObj.imageFilter
 })
  
module.exports = middlewareObj;