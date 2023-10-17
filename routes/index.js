var express = require("express");
var router = express.Router();

var userModel = require("./users");
const passport = require("passport");

var postModel = require("./post");

/* important line of code */
const localStrategy = require("passport-local");
passport.use(new localStrategy(userModel.authenticate()));

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "home page" });
});

/* GET Register page. */
router.post("/register", function (req, res, next) {
  userModel.findOne({ username: req.body.username }).then(function (foundUser) {
    if (foundUser) {
      res.send("user name is already exits");
    } else {
      var newUser = new userModel({
        username: req.body.username,
        age: req.body.age,
        email: req.body.email,
        image: req.body.image,
      });
      userModel.register(newUser, req.body.password).then(function (u) {
        passport.authenticate("local")(req, res, function () {
          res.redirect("/profile", { title: "home page" });
        });
      });
    }
  });
});

/* GET profile page. */
router.get("/profile", isLoggedIn, function (req, res, next) {
  userModel
    .findOne({ username: req.session.passport.user })
    .populate("post")
    .then(function (foundUser) {
      console.log(foundUser);
      res.render("profile", { foundUser });
    });
});

/* GET login page. */
router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/profile",
    failureRedirect: "/login",
  }),
  function (req, res, next) {}
);

router.get("/login", function (req, res, next) {
  res.render("login", { title: "login page" });
});

/* GET logoout page. */
router.get("/logout", function (req, res, next) {
  res.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/login");
  });
});

/* post router */
router.post("/post", isLoggedIn, function (req, res, next) {
  userModel
    .findOne({ username: req.session.passport.user })
    .then(function (user) {
      postModel
        .create({
          userid: user._id,
          data: req.body.post,
        })
        .then(function (post) {
          user.post.push(post._id);
          user.save().then(function () {
            res.redirect("back");
          });
        });
    });
});

/* feed router */
router.get("/feed", isLoggedIn, function (req, res, next) {
  postModel
    .find()
    .populate("userid")
    .then(function (allposts) {
      res.render("feed", { allposts }, { title: "feed page" });
    });
});

/* like router */
router.get("/like/:postid", isLoggedIn, function (req, res, next) {
  userModel
    .findOne({ username: req.session.passport.user })
    .then(function (user) {
      postModel.findOne({ _id: req.params.postid }).then(function (post) {
        if (post.likes.indexOf(user._id) == -1) {
          post.likes.push(user._id);
        } else {
          post.likes.splice(post.likes.indexOf(user._id), 1);
        }
        post.save().then(function () {
          res.redirect("back");
        });
      });
    });
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.redirect("/login");
  }
}

module.exports = router;
