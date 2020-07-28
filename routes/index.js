const express = require("express");
const router = express.Router();
const middleware = require("../middleware");
const controller = require('../controllers/index.js');

// Landing Page
router.get("/", controller.getLanding);

// Auth Routes
router.get("/register", controller.getRegister);
router.post("/register", controller.postRegister);
router.get("/login", controller.getLogin);
router.post('/login', controller.postLogin);
router.get("/logout", controller.getLogout);
router.get("/forgot", controller.getForgot);
router.post('/forgot', controller.postForgot);
router.get('/reset/:token', controller.getResetToken);
router.post('/reset/:token', controller.postResetToken);

//User profile router
router.get('/users/:id', middleware.isLoggedIn, controller.getUsersId);
router.get('/users/:id/edit', middleware.isLoggedIn, controller.getUsersIdEdit);
router.put('/users/:id', middleware.isLoggedIn, controller.updateUsersId);
router.delete("/users/:id", middleware.isLoggedIn, controller.deleteUsersId);
router.get("/users/:id/favorites", middleware.isLoggedIn, controller.getUsersFavorites);

module.exports = router;
