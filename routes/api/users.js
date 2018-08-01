// Deals only with Authentication

const express = require("express");
const router = express();
const User = require("../../models/User");
var gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
// Getting web token
const jwt = require("jsonwebtoken");
const passport = require("passport");

// Load input validation
const validateRegisterInput = require("../../validation/register");
const validateLoginInput = require("../../validation/login");

const keys = require("../../config/keys");
// @router GET /api/users/test
// @desc   router to test
// @acess  Public
router.get("/test", (req, res) => {});

// @router GET /api/users/register
// @desc   router to register user
// @acess  Public
router.post("/register", (req, res) => {
  console.log("Name in backend is this " + req.body.name);
  const { errors, isValid } = validateRegisterInput(req.body);
  //  Check validation
  if (!isValid) {
    return res.status(400).json(errors);
  }

  User.findOne({
    email: req.body.email
  }).then(user => {
    if (user) {
      errors.email = "Email already exists";
      return res.status(400).json(errors);
    } else {
      const avatar = gravatar.url(req.body.email, {
        s: "200", //Size
        r: "ps", //Rating
        d: "mm" //Default
      });
      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        avatar,
        password: req.body.password
      });
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;
          newUser.password = hash;
          newUser
            .save()
            .then(user =>
              //   req.flash(
              //     "success_msg",
              //     "Registration Sucessfull , Please login"
              //   );
              res.json(user)
            )
            .catch(err => {
              console.log(err);
            });
        });
      });
    }
  });
});

// @router GET /api/users/login
// @desc   router to login a user //Returning token
// @acess  Public
router.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const { errors, isValid } = validateLoginInput(req.body);
  //  Check validation
  if (!isValid) {
    return res.status(400).json(errors);
  }
  User.findOne({ email }).then(user => {
    if (!user) {
      errors.email = "User not found";
      return res.status(404).json(errors);
    }
console.log(password)
    //   Check Password
    // Returns true or false value
    bcrypt.compare(password, user.password).then(isMatch => {
      if (isMatch) {
        // User logged in
        const payload = {
          id: user.id,
          name: user.name,
          avatar: user.avatar
          // Create jwt payload
        };

        // Sign token
        // Expires seconds
        jwt.sign(
          payload,
          keys.secretOrKey,
          { expiresIn: 3600 },
          (err, token) => {
            res.json({
              success: true,
              token: "Bearer " + token
            });
            // Bearer puts the token in the header
            // We are using bearer token function , make usre there is a space between Bearer and token
          }
        );
      } else {
        errors.password = `Password incorrect`;
        return res.status(400).json(errors);
      }
    });
  });
});

// @router GET /api/users/current
// @desc   router to return current user
// @acess  Private
router.get(
  "/current",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    res.json({ msg: req.user });
  }
);

module.exports = router;
