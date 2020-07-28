const express = require("express");
const router = express.Router({mergeParams: true});
const middleware = require("../middleware")
const controller = require('../controllers/comments.js');


// Comments Routes
router.get("/new", middleware.isLoggedIn, controller.getNewComment);
router.post("/", middleware.isLoggedIn, controller.postComments);
router.get("/:comment_id/edit", middleware.checkCommentOwnership, controller.getCommentIdEdit);
router.put("/:comment_id", middleware.checkCommentOwnership, controller.updateCommentId);
router.delete("/:comment_id", middleware.checkCommentOwnership, controller.deleteCommentId);


module.exports = router;
