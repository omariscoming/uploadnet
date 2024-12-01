const mongoose = require("mongoose");
const mediaSchema = new mongoose.Schema(
    {
        mediaID: { type: String, required: true, unique: true }, // Unique ID for media
        userId: { type: Number, required: true }, // User ID who uploaded the media
        type: { type: String, required: true }, // Type of media (photo, video, document, etc.)
        createdAt: { type: Date, default: Date.now }, // Date of upload
        channel: [String],
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Media', mediaSchema);