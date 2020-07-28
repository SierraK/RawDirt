const Offroad = require("../models/offroad");
const Comment    = require("../models/comment");

let commentController = {
    // renders new comment view associated for that specific offroad machine
    getNewComment: async (req, res) => {
        try {
            let offroad = await Offroad.findById(req.params.id);
            res.render("comments/new", {offroad: offroad});
        } catch(err) {
            req.flash("error", err.message);
            res.redirect("/offroads/" + offroad._id);
        }    
    },
    postComments: (req, res) => {
        // creates the new comment associated for that specific offroad machine
        Offroad.findById(req.params.id, async (err, offroad) => {
            try {
                let comment = await Comment.create(req.body.comment);
                // add username and id
                comment.author.id = req.user._id;
                comment.author.username = req.user.username;
    
                // save comment
                comment.save();
                // add comment to offroad comments array
                offroad.comments.push(comment);
                // save offroad
                offroad.save();
                req.flash("success", "Successfully Added Comment");
                res.redirect("/offroads/" + offroad._id);
            } catch(err) {
                req.flash("error", err.message);
                return res.redirect("/offroads/" + offroad._id);
            }  
        });    
    },
    // renders the edit comment page for a specific comment
    getCommentIdEdit: async (req, res) => {
        try {
            let foundComment = await Comment.findById(req.params.comment_id);
            res.render("comments/edit", {offroad_id: req.params.id, comment: foundComment});
        } catch(err) {
            req.flash("error", err.message);
            res.render("/offroads/" + req.params.id);
        }    
    },
    //  updates the comment for a specific comment
    updateCommentId: async (req, res) => {
        try {
            let updatedComment = await Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment);
            req.flash("success", "Comment Updated")
            res.redirect("/offroads/" + req.params.id);
        } catch(err) {
            req.flash("error", err.message);
            return res.redirect("back");
        }    
    },
    // deleted the comment for a specific comment
    deleteCommentId: async (req, res) => {
        try {
            await Comment.findByIdAndRemove(req.params.comment_id);
            req.flash("success", "Comment deleted")
            res.redirect("/offroads/" + req.params.id);
        } catch(err) {
            req.flash("error", err.message);
            return res.redirect("back");
        }    
    }
}

module.exports = commentController;