// Creation and all action related to profiles

const express = require("express");
const router = express();
const mongoose = require("mongoose");
const passport = require("passport");

// Load profile model

const Profile = require("../../models/Profile");
// Load Validation
const validateProfileInput = require("../../validation/profile");
const validateExperienceInput = require("../../validation/experience");
const validateEducationInput = require("../../validation/education");

// Load user model
const User = require("../../models/User");
// @router GET /api/profile/test
// @desc   router to test
// @acess  Public
router.get("/test", (req, res) => {
  res.json({
    msg: "Users work"
  });
});

// @router GET /api/profile
// @desc   get current user profile
// @acess  Private
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const errors = {};
    Profile.findOne({
      user: req.user.id
    })
      .populate("user", ["name", "avatar"])
      .then(profile => {
        if (!profile) {
          errors.noprofile = "Profile not found";
          return res.status(404).json({ errors });
        }
        res.status(200).json(profile);
      })
      .catch(err => res.status(404).json(err));
  }
);
// @router GET /api/profile/all
// @desc   get all profiles
// @acess  Public

router.get("/all", (req, res) => {
  const errors = {};
  Profile.find()
    .populate("user", ["name", "avatar"])
    .then(profiles => {
      if (!profiles) {
        errors.noprofile = "There are no profiles found";
        return res.status(404).json(errors);
      } else {
        res.json({ profiles });
      }
    })
    .catch(err => {
      res.status(404).json({ profiles: "There are no profiles" });
    });
});

// @router GET /api/profile/user/:user_id
// @desc   get user profile using the id
// @acess  Public

router.get("/user/:user_id", (req, res) => {
  const errors = {};
  Profile.findOne({
    handle: req.params.user_id
  })
    .populate("user", ["avatar", "name"])
    .then(profile => {
      if (!profile) {
        errors.noprofile = "No profile found";
        res.status(404).json({ errors });
      }
      res.json(profile);
    })
    .catch(err => {
      res.status(404).json({ profile: "There is no profile for this user" });
    });
});

// @router GET /api/profile/handle/:handle
// @desc   get user profile using the handle
// @acess  Public

router.get("/handle/:handle", (req, res) => {
  const errors = {};
  Profile.findOne({
    handle: req.params.handle
  })
    .populate("user", ["avatar", "name"])
    .then(profile => {
      if (!profile) {
        errors.noprofile = "No profile found";
        res.status(404).json({ errors });
      }
      res.json(profile);
    })
    .catch(err => {
      res.status(404).json({ err });
    });
});

// @router GET /api/profile/user/:user_id
// @desc   get user profile using the id
// @acess  Public

router.get("/user/:user_id", (req, res) => {
  const errors = {};
  Profile.findOne({
    handle: req.params.user_id
  })
    .populate("user", ["avatar", "name"])
    .then(profile => {
      if (!profile) {
        errors.noprofile = "No profile found";
        res.status(404).json({ errors });
      }
      res.json(profile);
    })
    .catch(err => {
      res.status(404).json({ profile: "There is no profile for this user" });
    });
});

// @route   POST api/profile
// @desc    Create or edit user profile
// @access  Private
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validateProfileInput(req.body);

    // Check Validation
    if (!isValid) {
      // Return any errors with 400 status
      return res.status(400).json(errors);
    }

    // Get fields
    const profileFields = {};
    profileFields.user = req.user.id;
    if (req.body.handle) profileFields.handle = req.body.handle;
    if (req.body.company) profileFields.company = req.body.company;
    if (req.body.website) profileFields.website = req.body.website;
    if (req.body.location) profileFields.location = req.body.location;
    if (req.body.bio) profileFields.bio = req.body.bio;
    if (req.body.status) profileFields.status = req.body.status;
    if (req.body.githubusername)
      profileFields.githubusername = req.body.githubusername;
    // Skills - Spilt into array
    if (typeof req.body.skills !== "undefined") {
      profileFields.skills = req.body.skills.split(",");
    }

    // Social
    profileFields.social = {};
    if (req.body.youtube) profileFields.social.youtube = req.body.youtube;
    if (req.body.twitter) profileFields.social.twitter = req.body.twitter;
    if (req.body.facebook) profileFields.social.facebook = req.body.facebook;
    if (req.body.linkedin) profileFields.social.linkedin = req.body.linkedin;
    if (req.body.instagram) profileFields.social.instagram = req.body.instagram;

    Profile.findOne({ user: req.user.id }).then(profile => {
      if (profile) {
        // Update
        Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        ).then(profile => res.json(profile));
      } else {
        // Create

        // Check if handle exists
        Profile.findOne({ handle: profileFields.handle }).then(profile => {
          if (profile) {
            errors.handle = "That handle already exists";
            res.status(400).json(errors);
          }

          // Save Profile
          new Profile(profileFields).save().then(profile => res.json(profile));
        });
      }
    });
  }
);

// @router GET /api/profile/experience
// @desc   Add experience to profile
// @acess  Private
router.post(
  "/experience",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validateExperienceInput(req.body);
    if (!isValid) {
      return res.status(400).json(errors);
    }
    Profile.findOne({
      user: req.user.id
    }).then(profile => {
      const newExp = {
        title: req.body.title,
        company: req.body.company,
        location: req.body.location,
        from: req.body.from,
        to: req.body.to,
        current: req.body.current,
        description: req.body.description
      };
      //   Add to expereince array
      profile.experience.unshift(newExp);
      profile.save().then(profile => res.json(profile));
    });
  }
);

// @router GET /api/profile/education
// @desc   Add education to profile
// @acess  Private
router.post(
  "/education",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validateEducationInput(req.body);
    if (!isValid) {
      return res.status(400).json(errors);
    }
    Profile.findOne({
      user: req.user.id
    }).then(profile => {
      const newEdu = {
        school: req.body.school,
        degree: req.body.degree,
        fieldofstudy: req.body.fieldofstudy,
        from: req.body.from,
        to: req.body.to,
        current: req.body.current,
        description: req.body.description
      };
      //   Add to expereince array
      profile.education.unshift(newEdu);
      profile.save().then(profile => res.json(profile));
    });
  }
);

// @router DELETE /api/profile/experience/:exp_id
// @desc   Deletee eperience from profile
// @acess  Private
router.delete(
  "/experience/:exp_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({
      user: req.user.id
    }).then(profile => {
      // Maps the experience array with onlky id's
      const removeIndex = profile.experience
        .map(item => item.id)
        .indexOf(req.params.exp_id);

        // Splice out of array
        profile.experience.splice(removeIndex,1);

        // 

        profile.save().then(profile => {
            res.json(profile);
        })
    }).catch(err => {
        res.status(404).json(err);
    });
  }
);

// @router DELETE /api/profile/education/:edu_id
// @desc   Deletee education from profile
// @acess  Private
router.delete(
    "/education/:edu_id",
    passport.authenticate("jwt", { session: false }),
    (req, res) => {
      Profile.findOne({
        user: req.user.id
      }).then(profile => {
        // Maps the education array with onlky id's
        const removeIndex = profile.education
          .map(item => item.id)
          .indexOf(req.params.exp_id);
  
          // Splice out of array
          profile.education.splice(removeIndex,1);
  
          // 
  
          profile.save().then(profile => {
              res.json(profile);
          })
      }).catch(err => {
          res.status(404).json(err);
      });
    }
  );

// @router DELETE /api/profile
// @desc   Deletee profile
// @acess  Private
router.delete("/",passport.authenticate("jwt", { session: false }),(req,res)=>{
    Profile.findOneAndRemove({
        user: req.user.id
    }).then(()=>{
      User.findOneAndRemove({
          _id: req.user.id
      }).then(()=>{
res.json({success: true})
      })  
    })

})
module.exports = router;