const express = require("express");
const router = express.Router();
const middleware = require("../middleware");
const controller = require('../controllers/offroads.js');

// Retrieve offroad landing page and post new offroad machines
router.get("/", controller.getOffroad);
router.post("/", middleware.isLoggedIn, middleware.upload.single('image'), controller.postOffroad);

// Retrieve all offroad and new offroad machines
router.get("/all", controller.getAllOffroad);
router.get("/s", controller.getSearchOffroad);
router.get("/new", middleware.isLoggedIn, controller.getNewOffroad);

// Retrieve, Post, Update, and Delete all things related to a specific offroad machine
router.get("/:id", controller.getIdOffroad);
router.get("/:id/edit", middleware.checkOffroadOwnership, controller.getIdEditOffroad);
router.put("/:id", middleware.upload.single('image'), middleware.checkOffroadOwnership, controller.updateIdOffroad);
router.delete("/:id", middleware.checkOffroadOwnership, controller.deleteIdOffroad);
router.post("/:id/favorite", middleware.isLoggedIn, controller.postIdFavoriteOffroad);

module.exports = router;
