var express = require("express");
var router = express.Router();

const Photo = require("../models/Photo");
const User = require("../models/User");

const cloudinary = require("../middleware/cloudinary");
const upload = require("../middleware/multer");
const isAuthenticated = require("../middleware/isAuthenticated");
const isPhotoOwner = require('../middleware/isPhotoOwner')

router.post("/image-upload", upload.single("image"), async (req, res, next) => {

  try {
    if (!req.file) {
      next(new Error("No file uploaded!"));
      return;
    }
  
    const result = await cloudinary.uploader.upload(req.file.path, {
      image_metadata: true,
    });

    let alternateUrl;

    if (result.secure_url.split(".")[3] === "heic") {
      console.log("WE have an HEIC FILE!!!!!");
      const newResult = await cloudinary.uploader.upload(req.file.path, {
        image_metadata: true,
        format: "jpg",
      });

      alternateUrl = newResult.secure_url;
    }
      console.log("this is file", result.secure_url, alternateUrl);
      res.json({ image: alternateUrl || result.secure_url });
    
  } catch (error) {
    console.log("Error creating photo====>", error)
  }

});

router.post(
  "/new-photo",
  isAuthenticated,
  upload.single("imageUrl"),
  async (req, res) => {
    console.log("Reached new-photo route", req.file.path);
    try {
      const result = await cloudinary.uploader.upload(req.file.path, {
        image_metadata: true,
      });

      let alternateUrl;

      if (result.secure_url.split(".")[3] === "heic") {
        console.log("WE have an HEIC FILE!!!!!");
        const newResult = await cloudinary.uploader.upload(req.file.path, {
          image_metadata: true,
          format: "jpg",
        });

        alternateUrl = newResult.secure_url;
      }

      Photo.create({
        description: req.body.description,
        tags: req.body.tags,
        postDate: result.created_at,
        imageUrl: alternateUrl || result.secure_url,
        cloudinary_id: result.public_id,
        latitude: result.image_metadata.GPSLatitude,
        longitude: result.image_metadata.GPSLongitude,
        photographedDate: result.image_metadata.CreateDate,
        contributor: req.user._id,
      })
        .then((newlyCreatedPhotoFromDB) => {
          res.json({ newlyCreatedPhotoFromDB });
        })
        .catch((error) =>
          console.log(`Error while creating a new photo: ${error}`)
        );
    } catch (err) {
      console.log({ errorMessage: "Error posting photo", err });
    }
  }
);

router.post("/:id/add-after", isAuthenticated, (req, res, next) => {
  Photo.findByIdAndUpdate(req.params.id, {
    description: req.body.description,
    tags: req.body.tags,
  })

    .then(function (updatedPhoto) {
      res.json(updatedPhoto);
    })
    .catch(function (error) {
      res.json(error);
    });
});

router.get("/all-photos", (req, res) => {
  Photo.find()
    .populate({
      path: "contributor",
    })
    .sort({ createdAt: -1 })
    .then((photosFromDB) => {
      res.json({ photos: photosFromDB });
    })
    .catch((err) =>
      console.log(`Error while getting the photos from the DB: ${err}`)
    );
});

router.get("/:thisTag/tag", (req, res) => {
  console.log("Hiiting this route, line 96 *****************", req.params)
  const { thisTag } = req.params
  Photo.find({ tags: { $in: [`${thisTag}`] } })
    .populate({
      path: "contributor",
    })
    .then((photosFromDB) => {
      res.json({ photos: photosFromDB });
    })
    .catch((err) =>
      console.log(`Error while getting the photos from the DB: ${err}`)
    );
});

router.get("/:id/user-photos", (req, res) => {
  Photo.find({ contributor: req.params.id })
    .then((photosFromDB) => {
      res.json({ photos: photosFromDB });
    })
    .catch((err) =>
      console.log(`Error while getting the photos from the DB: ${err}`)
    );
});

router.get("/:id/contributor", (req, res, next) => {
  User.findById(req.params.id)
    .then((foundUser) => {
      Photo.find({ contributor: req.params.id })
        .populate({
          path: "contributor",
        })
        .then((foundPhotos) => {
          res.json({ foundUser: foundUser, foundPhotos: foundPhotos });
        });
    })
    .catch((error) => {
      console.log(error);
    });
});

router.get("/:id/details", (req, res, next) => {
  Photo.findById(req.params.id)
    .populate({ path: "contributor" })
    .populate({
      path: "comments",
      populate: {
        path: "user",
      },
    })

    .then(function (result) {
      res.json({ result });
    })
    .catch(function (error) {
      res.json(error);
    });
});

router.post("/:id/delete", isAuthenticated, isPhotoOwner, (req, res, next) => {
  Photo.findByIdAndDelete(req.params.id)
    .then(() => {
      res.json({ message: "photo deleted" });
    })
    .catch((error) => {
      res.json(error);
    });
});

// router.post("/:id/edit", (req, res, next) => {
//   Photo.findByIdAndUpdate(req.params.id, { ...req.body })
//     .then(() => {
//       res.json({ message: "updated" });
//     })
//     .catch(function (error) {
//       res.json(error);
//     });
// });

module.exports = router;
