const express               = require("express"),
    mongoose                = require("mongoose"),
    passport                = require("passport"),
    bodyParser              = require("body-parser"),
    LocalStrategy           = require("passport-local"),
    passportLocalMongoose   = require("passport-local-mongoose"),
    User                    = require("./models/user"),
    expressSession          = require("express-session");

const app = express();

const port = process.env.PORT || 3000;

// CONFIG ---------------------------------------------------------

mongoose.connect("mongodb://localhost/auth_demo_app");

app.set("view engine", "ejs");
app.use(expressSession({
    secret: "the most encrypted secret in the world",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.urlencoded({extended: true}));

passport.use(new LocalStrategy(User.authenticate()));
// serialize: encode - deserialize: decode
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// CUSTOM MIDDLEWARE ----------------------------------------------

// check if user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
}

// ROUTES ---------------------------------------------------------

app.get("/", (req, res) => {
    res.render("home");
});

app.get("/secret", isLoggedIn, (req, res) => {
    res.render("secret");
});

// sign up routes
app.get("/signup", (req, res) => {
    res.render("signup");
});

app.post("/signup", (req, res) => {
    let newUser = new User({username: req.body.username});
    User.register(newUser, req.body.password, (err, user) => {
        if (err) {
            console.log(`Error: ${err}`);
            return res.render("signup");
        } else {
            passport.authenticate("local")(req, res, () => {
                res.redirect("/secret");
            });
        }
    });
});

// login routes
app.get("/login", (req, res) => {
    res.render("login");
});

app.post("/login", passport.authenticate("local", {
    successRedirect: "/secret",
    failureRedirect: "/login"
}), (req, res) => {
    console.log("User logged in");
});

// logout routes
app.get("/logout", (req, res) => {
    req.logout();
    res.redirect("/");
    console.log("User logged out");
});


// LISTEN ---------------------------------------------------------

app.listen(port, () => {
    console.log(`Server listening at port ${port}`);
});