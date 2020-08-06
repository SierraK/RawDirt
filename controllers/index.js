const passport   = require("passport");
const User = require("../models/user");
const Offroad = require("../models/offroad");
const async = require('async');
const nodemailer = require('nodemailer');
const crypto = require('crypto');


let indexController = {
  // render landing view
    getLanding: (req, res) => {
        res.render("landing");
    },
    // render register view
    getRegister: (req, res) => {
        res.render("register");
    },
    // Create new account for user 
    postRegister: async (req, res) => {
      //  add new user
        var newUser = new User(
            {
              username: req.body.username, 
              email: req.body.email
            });
          try { 
            // registers new user
            let user = await User.register(newUser, req.body.password);
            passport.authenticate("local")(req, res, () => {
              req.flash("success", "Welcome to RawDirt " + user.username);
              res.redirect("/offroads")
            });
          } catch(err) {
            req.flash("error", err.message);
            return res.redirect("register");
          }
    }, 
    // render login view
    getLogin: (req, res) => {
        res.render("login");
    },
    // Takes login inputs to sign in 
    postLogin: (req, res, next) => {
      // passport checks to authenticate
        passport.authenticate('local', (err, user, info) => {
            if(err) { return next(err); }
            if(!user) { return req.flash("error", "Login Failed"), res.redirect('/login');
            }
            // establishes a login session
            req.logIn(user, (err) => {
              if(err) { return next(err); }
              return res.redirect('/offroads');
            });
          })(req, res, next);
    },
    // render logout view
    getLogout: (req, res) => {
      // passport logs out terminating the login session
        req.logout();
        req.flash("success", "You logged out!")
        res.redirect("/offroads");    
    },
    // renders forgotten password view
    getForgot: (req, res) => {
        res.render("forgot");
    },
    //  Sends email to user account for forgotten password
    postForgot: (req, res, next) => {
      //  pass the return value, of every function to the next, then when done will call the main callback - last result of last function, passing its error, if an error happens
        async.waterfall([
            function(done) {
              // creates random token to reset password
              crypto.randomBytes(20, (err, buf) => {
                var token = buf.toString('hex');
                done(err, token);
              });
            },
            function(token, done) {
              // finds user with the email of forgotten password
              User.findOne({ email: req.body.email }, function(err, user) {
                if (!user) {
                  req.flash('error', 'No account with that email address exists.');
                  return res.redirect('/forgot');
                }
        
                user.resetPasswordToken = token;
                user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        
                user.save(function(err) {
                  done(err, token, user);
                });
              });
            },
            // uses my email info to send email to user
            function(token, user, done) {
              var smtpTransport = nodemailer.createTransport({
                service: 'Gmail', 
                auth: {
                  user: 'kingxsierra',
                  pass: process.env.GMAILPW
                }
              });
              // email that is sent
              var mailOptions = {
                to: user.email,
                from: 'kingxsierra@gmail.com',
                subject: 'RawDirt Password Reset',
                text: 'You are receiving this because you have requested the reset of the password for your account.\n\n' +
                  'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                  'http://' + req.headers.host + '/reset/' + token + '\n\n' +
                  'If you did not request this, please ignore this email and your password will remain unchanged.\n'
              };
              // sends email
              smtpTransport.sendMail(mailOptions, function(err) {
                req.flash('success', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
                done(err, 'done');
              });
            }
          ], function(err) {
            if (err) return next(err);
            res.redirect('/forgot');
          });      
    }, 
    // renders reset view
    getResetToken: (req, res) => {
      // finds user with reset password token along with date expiration
        User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
            if (!user) {
              req.flash('error', 'Password reset token is invalid or has expired.');
              return res.redirect('/forgot');
            }
            res.render('reset', {token: req.params.token});
          });      
    }, 
    // User resets password with new password and confirms it
    postResetToken: (req, res) => {
        //  pass the return value, of every function to the next, then when done will call the main callback - last result of last function, passing its error, if an error happens
        async.waterfall([
            function(done) {
              // finds user with reset password token along with date expiration
              User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
                if (!user) {
                  req.flash('error', 'Password reset token is invalid or has expired.');
                  return res.redirect('back');
                }
                // if password is equal to confirm password
                if(req.body.password === req.body.confirm) {
                  // set password to the new confirmed password
                  user.setPassword(req.body.password, function(err) {
                    // reset the token and token expires
                    user.resetPasswordToken = undefined;
                    user.resetPasswordExpires = undefined;
                    
                    // save user info and login
                    user.save(function(err) {
                      req.logIn(user, function(err) {
                        done(err, user);
                      });
                    });
                  })
                } else {
                    req.flash("error", "Passwords do not match.");
                    return res.redirect('back');
                }
              });
            },
            // uses admin email info to send email
            function(user, done) {
              var smtpTransport = nodemailer.createTransport({
                service: 'Gmail', 
                auth: {
                  user: 'kingxsierra',
                  pass: process.env.GMAILPW
                }
              });
              // Email that is sent to user confirming password reset
              var mailOptions = {
                to: user.email,
                from: 'kingxsierra@gmail.com',
                subject: 'Your password has been changed',
                text: 'Hello,\n\n' +
                  'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
              };
              //  success email
              smtpTransport.sendMail(mailOptions, function(err) {
                req.flash('success', 'Success! Your password has been changed.');
                done(err);
              });
            }
          ], function(err) {
            res.redirect('/offroads');
          });      
    },
    //render user profile view 
    getUsersId: (req, res) => {
      // finds user by if
        User.findById(req.params.id, async (err, foundUser) => {
            if(err) {
              req.flash("error", "User Not Found");
              res.redirect("/")
            }
            try {
              // finds all offroad machine associated with that specific user
              let offroads = await Offroad.find().where('author.id').equals(foundUser._id).exec();
              res.render("users/show", {user: foundUser, offroads: offroads});
            } catch(err) {
              req.flash("error", "User Not Found");
              return res.redirect("/")
            }
          });        
    },
    // render users profile edit view
    getUsersIdEdit: async (req, res) => {
        try {
          // find user by id
            let foundUser = await User.findById(req.params.id);
            res.render("users/edit", {user: foundUser});
          } catch(err) {
            req.flash("error", err.message);
            return res.redirect("/")
          }     
    },
    // updated users profile
    updateUsersId: async (req, res) => {
        try {
          // find user by id and update it based on the body user params
            await User.findByIdAndUpdate(req.params.id, req.body.user);
            res.redirect("/users/" + req.params.id);
          } catch(err) {
            req.flash("error", err.message);
            return res.redirect("users/show")
          }        
    },
    // delete user profile
    deleteUsersId: async (req, res) => {
      // find user by id
        User.findById(req.params.id, async (err, foundUser) => {
            if(err) {
              req.flash("error", err.message);
              res.redirect("/users/" + req.params.id);
            }
          try {
            // find all offoad machines associated with user id and delete them
            let offroads = await Offroad.find().where('author.id').equals(foundUser._id).remove().exec();
            // delete user account
            await User.findByIdAndRemove(req.params.id);
            req.flash("success", "User Account and Campgrounds Deleted");
            res.redirect("/offroads");
          } catch(err) {
            req.flash("error", err.message);
            res.redirect("/users/" + req.params.id);
          }
          });        
    }, 
    // render user favorites offroad machine view
    getUsersFavorites: (req, res) => {
      // find user by id
        User.findById(req.params.id, async (err, foundUser) => {
            if(err) {
              req.flash("error", "User Not Found");
              res.redirect("/")
            }
            try {
              // find all favorites off road machines are associated with user id
              let offroads = await Offroad.find().where('favorites').equals(foundUser._id).exec();
              res.render("users/favorites", {offroads: offroads});
            } catch(err) {
              req.flash("error", "User Not Found");
              return res.redirect("/")
            }
          });
    }
}
module.exports = indexController;