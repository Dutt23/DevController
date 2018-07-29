// For posts
const express = require("express");
const router = express();
const mongoose = require("mongoose");
const passport = require("passport");

// Load profile model

const Profile = require("../../models/Profile");
const Post = require("../../models/Post");
// Load Validation
const validateProfileInput = require("../../validation/profile");
const validateExperienceInput = require("../../validation/experience");
const validateEducationInput = require("../../validation/education");
const validatePostInput = require("../../validation/post");
// Load user model
const User = require("../../models/User");

// @router GET /api/posts/tests
// @desc   router to test
// @acess  Public
router.get("/test", (req, res) => {
  res.json({
    msg: "Users work"
  });
});

// @router GET /api/posts
// @desc   Get posts
// @acess  Public
router.get("/", (req, res) => {
  Post.find()
    .sort({ date: -1 })
    .then(posts => {
      res.json(posts);
    })
    .catch(err => res.status(404).json({ nopostfound: "No posts found " }));
});

// @router GET /api/posts/:id
// @desc   Get single post
// @acess  Public
router.get("/:id", (req, res) => {
  Post.findById(req.params.id)
    .then(post => {
      res.json(post);
    })
    .catch(err => res.status(404).json({ nopostfound: "No post found " }));
});

// @router GET /api/posts
// @desc   Create posts
// @acess  Private
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validatePostInput(req.body);
    if (!isValid) {
      res.status(400).json(errors);
    }
    const newPost = new Post({
      text: req.body.text,
      name: req.body.name,
      avatar: req.body.avatar,
      user: req.user.id
    });
    newPost.save().then(post => res.json(post));
  }
);

// @router Delete /api/posts/:id
// @desc   Get single post
// @acess  Private
router.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then(user => {
      Post.findById(req.params.id).then(post => {
        if (post.user.toString() !== req.user.id) {
          return res.status(401).json({ notauthorized: "user not authorized" });
        }

        post
          .remove()
          .then(() => {
            res.json({ sucess: true });
          })
          .catch(err => {
            res.status(404).json({ postnotfound: "post not found " });
          });
      });
    });
  }
);

// @router Post /api/posts/like/:id
// @desc   Like a post
// @acess  Private
router.post(
  "/like/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then(user => {
      Post.findById(req.params.id).then(post => {
        if (
          post.likes.filter(like => like.user.toString() === req.user.id)
            .length > 0
        ) {
          res.status(400).json({
            alreadyliked: "Yoou have already liked this post"
          });
        }
        // Add to likes array
        post.likes.unshift({ user: req.user.id });
        post.save().then(post => {
          res.json(post);
        });
      });
    });
  }
);

// @router Post /api/posts/unlike/:id
// @desc   Like a post
// @acess  Private
router.post(
  "/unlike/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then(user => {
      Post.findById(req.params.id).then(post => {
        if (
          (post.likes.filter(
            like => like.user.toString() === req.user.id
          ).length = 0)
        ) {
          res.status(400).json({
            notliked: "You have not yet liked this post"
          });
        }
        // Add to likes array
        // Maps the education array with onlky id's
        const removeIndex = post.likes
          .map(item => item.user.toString())
          .indexOf(req.user.id);

        // Splice out of array
        post.likes.splice(removeIndex, 1);

        post.save().then(post => {
          res.json(post);
        });
      });
    });
  }
);

// @router Post /api/posts/comment/:id
// @desc   comment on a post
// @acess  Private
router.post(
  "/comment/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validatePostInput(req.body);
    if (!isValid) {
      res.status(400).json(errors);
    }
    Post.findById(req.params.id).then(post => {
      const newComment = {
        text: req.body.text,
        name: req.body.name,
        avatar: req.body.avatar,
        user: req.user.id
      };
      // Push to array
      post.comments.unshift(newComment);
      //  Save
      post
        .save()
        .then(post => {
          res.json({ success: true });
        })
        .catch(err => res.status(404).json({ postnotfound: "post not found" }));
    });
  }
);

// @router DELETE /api/posts/comment/:id/comment:id
// @desc   delete a comment
// @acess  Private
router.delete(
  "/comment/:id/:comment_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Post.findById(req.params.id).then(post => {
      if (
        post.comments.filter(
          comment => comment._id.toString() === req.params.comment_id
        ).length === 0
      ) {
        return res
          .status(404)
          .json({ commentnotexists: "Comment does not exist" });
      }
      //   Remove index
      //   Maps each comment to it's id
      const removeIndex = post.comments
        .map(item => item._id.toString())
        .indexOf(req.params.comment_id);
      post.comments.splice(removeIndex, 1);
      post.save().then(post => {
        res.json(post);
      });
    });
  }
);

module.exports = router;
