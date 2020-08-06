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
        
// connect to database
mongoose.connect("mongodb://localhost/raw-dirt", {useNewUrlParser: true, useFindAndModify: false, useCreateIndex: true, useUnifiedTopology: true});

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");  
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(cookieParser('secret'));

// Sets up user session for storing 
app.use(require("express-session")({
    secret: "Yellowww",
    resave: false,
    saveUninitialized: false,
}));
app.use(flash());

// passport setup
app.use(passport.initialize());
// authenticates the session
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
// used on login request to store user id in session
passport.serializeUser(User.serializeUser());
// called on subsequent requests to load user info on every request using the id
passport.deserializeUser(User.deserializeUser());

// Setting up date for listings, error messages, and current user
// res.locals makes the data available for view
app.use(function(req ,res, next) {  
    res.locals.moment = require('moment-timezone');
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
})

// Routes URL prefixes
app.use("/", indexRoutes);
app.use("/offroads", offroadRoutes);
app.use("/offroads/:id/comments", commentRoutes);

// Server
app.listen(process.env.PORT || 3000, function() {
    console.log("Server started!");
});
