// backend/controllers/uploadController.js
import { cloudinary } from "../config/cloudinary.js";

// 1. Upload Image
export const uploadImage = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }
  // Multer-Cloudinary automatically gives us the path
  res.json({ 
    url: req.file.path, 
    publicId: req.file.filename // We need this ID to delete it later!
  });
};

// 2. Delete Image
export const deleteImage = async (req, res) => {
  const { publicId } = req.body;

  try {
    if (!publicId) return res.status(400).json({ message: "No publicId provided" });

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(publicId);

    res.json({ message: "Image deleted successfully" });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ message: "Failed to delete image" });
  }
};