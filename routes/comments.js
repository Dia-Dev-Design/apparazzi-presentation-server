var express = require("express");
var router = express.Router();

const Photo = require("../models/Photo");

const Comment = require("../models/Comment");

const isAuthenticated = require("../middleware/isAuthenticated");

router.post("/:id/add-comment", isAuthenticated, (req, res, next) => {
  Comment.create({
    user: req.user._id,
    comment: req.body.comment,
  })
    .then(function (newComment) {
      Photo.findByIdAndUpdate(
        { _id: req.params.id },
        { $addToSet: { comments: newComment } }
      ).then(function (result) {
        res.json(newComment);
      });
    })
    .catch(function (error) {
      res.json(error);
    });
});

module.exports = router;
