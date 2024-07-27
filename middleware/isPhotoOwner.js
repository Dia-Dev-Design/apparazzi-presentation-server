const Photo = require('../models/Photo')

const isPhotoOwner = (req, res, next) => {
  const { id } = req.params;

  Photo.findById(id)
    .then((foundPhoto) => {
      if (foundPhoto.contributor.toString() === req.user._id) {
        console.log("Is owner!!!")
        next();
      } else {
        res.status(402).json({ message: "Not authorized" });
      }
    })
    .catch((err) => {
      console.log(err);
      res.json(err);
    });
};

module.exports = isPhotoOwner;
