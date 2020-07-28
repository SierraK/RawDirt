require('dotenv').config()

const   express         = require("express"),
        app             = express();
        bodyParser      = require("body-parser"),
        mongoose        = require("mongoose"),
        flash           = require("connect-flash"),
        passport        = require("passport"),
        cookieParser    = require("cookie-parser"),
        localStrategy   = require("passport-local"),
        methodOverride  = require("method-override"),
        Offroad         = require("./models/offroad"),
        Comment         = require("./models/comment"),
        User            = require("./models/user"),
        multer          = require('multer')

// Requiring routes files
const   offroadRoutes        = require("./routes/offroads"),
        commentRoutes       = require("./routes/comments"),
        indexRoutes         = require("./routes/index");


app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");  
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(cookieParser('secret'));


// Passport Config
app.use(require("express-session")({
    secret: "Yellowww",
    resave: false,
    saveUninitialized: false,
}));
app.use(flash());
// passport setup
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Setting up date for listings, error messages, and current user
app.use(function(req ,res, next) {  
    res.locals.moment = require('moment-timezone');
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
})

// Routes 
app.use("/", indexRoutes);
app.use("/offroads", offroadRoutes);
app.use("/offroads/:id/comments", commentRoutes);

// Server
app.listen(process.env.PORT || 3000, function() {
    console.log("Server started!");
});
