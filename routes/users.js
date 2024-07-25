var express = require("express");
var router = express.Router();

const User = require("../models/User");
const Photo = require("../models/Photo");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const saltRounds = 10;
require("dotenv/config");

const isAuthenticated = require("../middleware/isAuthenticated");

const cloudinary = require("../middleware/cloudinary");
const upload = require("../middleware/multer");

router.post(
  "/edit-profile-with-picture",
  isAuthenticated,
  upload.single("imageUrl"),
  async (req, res) => {
    try {
      const result = await cloudinary.uploader.upload(req.file.path);

      User.findByIdAndUpdate(req.user._id, {
        imageUrl: result.secure_url,
      })
        .then((newlyCreatedProfile) => {
          res.json({ newlyCreatedProfile });
        })
        .catch((error) =>
          console.log(`Error while creating a new profile: ${error}`)
        );
    } catch (err) {
      console.log(err);
    }
  }
);

router.post("/edit-profile-without-picture", isAuthenticated, (req, res, next) => {
  User.findByIdAndUpdate(req.user._id, { ...req.body }, { new: true })
    .then(function (updatedProfile) {
      res.json(updatedProfile);
    })
    .catch(function (error) {
      res.json(error);
    });
});

router.get("/my-profile", isAuthenticated, (req, res, next) => {

  User.findById(req.user._id)
    .then((foundUser) => {

      console.log("This is line 58 =====>", foundUser, req.user)

      Photo.find({ contributor: foundUser._id })
        .populate("contributor")
        .sort({createdAt: -1})
        .then((foundPhotos) => {
          console.log("This is line 58 =====>", foundPhotos)
          res.json(foundPhotos);
        });
    })
    .catch(function (error) {
      console.log(error);
    });
});

router.post("/delete-profile", isAuthenticated, (req, res, next) => {
  User.findById(req.user._id)
    .then((foundUser) => {
      const doesMatch = bcrypt.compareSync(
        req.body.password,
        foundUser.password
      );
      if (doesMatch) {
        foundUser.delete();
        res.json({ message: "success" });
      } else {
        res.status(401).json({ message: "password doesn't match" });
      }
    })
    .catch((error) => {
      res.status(400).json(error.message);
    });
});

module.exports = router;
