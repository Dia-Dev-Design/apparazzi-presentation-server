const { Schema, model } = require("mongoose");

const photoSchema = new Schema(
  {
    description: String,
    tags: [String],
    postDate: String,
    imageUrl: String,
    cloudinary_id: String,
    latitude: Schema.Types.Mixed,
    longitude: Schema.Types.Mixed,
    photographedDate: String,
    contributor: { type: Schema.Types.ObjectId, ref: "User", required: true },
    comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
  },
  {
    timestamps: true,
  }
);

module.exports = model("Photo", photoSchema);
