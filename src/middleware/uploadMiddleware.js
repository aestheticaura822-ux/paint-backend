// backend/src/middleware/uploadMiddleware.js
import { upload, uploadMultiple } from '../config/multer.js';
import cloudinary from '../config/cloudinary.js';
import fs from 'fs';

// Single image upload to Cloudinary
export const uploadSingleImage = async (req, res, next) => {
  upload.single('image')(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    
    if (req.file) {
      try {
        const result = await cloudinary.uploader.upload(req.file.path);
        req.imageUrl = result.secure_url;
        
        // Delete local file
        fs.unlinkSync(req.file.path);
        
        next();
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    } else {
      next();
    }
  });
};

// Multiple images upload to Cloudinary
export const uploadMultipleImages = async (req, res, next) => {
  uploadMultiple(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    
    if (req.files && req.files.length > 0) {
      try {
        const imageUrls = [];
        
        for (const file of req.files) {
          const result = await cloudinary.uploader.upload(file.path);
          imageUrls.push(result.secure_url);
          
          // Delete local file
          fs.unlinkSync(file.path);
        }
        
        req.imageUrls = imageUrls;
        next();
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    } else {
      next();
    }
  });
};