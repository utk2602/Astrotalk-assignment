const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Upload image to Cloudinary
const uploadImage = async (file, folder = 'astrotalk') => {
  try {
    if (!file) {
      throw new Error('No file provided');
    }

    const result = await cloudinary.uploader.upload(file.path, {
      folder: folder,
      resource_type: 'auto',
      transformation: [
        { width: 400, height: 400, crop: 'fill', gravity: 'face' },
        { quality: 'auto', fetch_format: 'auto' }
      ]
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload image');
  }
};

// Delete image from Cloudinary
const deleteImage = async (publicId) => {
  try {
    if (!publicId) {
      throw new Error('No public ID provided');
    }

    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw new Error('Failed to delete image');
  }
};

// Update image (delete old and upload new)
const updateImage = async (file, oldPublicId, folder = 'astrotalk') => {
  try {
    // Delete old image if exists
    if (oldPublicId) {
      await deleteImage(oldPublicId);
    }

    // Upload new image
    const newImage = await uploadImage(file, folder);
    return newImage;
  } catch (error) {
    console.error('Cloudinary update error:', error);
    throw new Error('Failed to update image');
  }
};

// Generate optimized image URL
const getOptimizedImageUrl = (publicId, options = {}) => {
  try {
    if (!publicId) {
      return null;
    }

    const defaultOptions = {
      width: 400,
      height: 400,
      crop: 'fill',
      gravity: 'face',
      quality: 'auto',
      fetch_format: 'auto'
    };

    const transformationOptions = { ...defaultOptions, ...options };
    
    return cloudinary.url(publicId, {
      transformation: [transformationOptions]
    });
  } catch (error) {
    console.error('Cloudinary URL generation error:', error);
    return null;
  }
};

// Upload multiple images
const uploadMultipleImages = async (files, folder = 'astrotalk') => {
  try {
    if (!files || files.length === 0) {
      throw new Error('No files provided');
    }

    const uploadPromises = files.map(file => uploadImage(file, folder));
    const results = await Promise.all(uploadPromises);

    return results;
  } catch (error) {
    console.error('Cloudinary multiple upload error:', error);
    throw new Error('Failed to upload multiple images');
  }
};

// Generate thumbnail URL
const getThumbnailUrl = (publicId, width = 150, height = 150) => {
  return getOptimizedImageUrl(publicId, {
    width,
    height,
    crop: 'fill',
    gravity: 'face'
  });
};

// Generate profile image URL
const getProfileImageUrl = (publicId, width = 200, height = 200) => {
  return getOptimizedImageUrl(publicId, {
    width,
    height,
    crop: 'fill',
    gravity: 'face',
    radius: 'max'
  });
};

module.exports = {
  uploadImage,
  deleteImage,
  updateImage,
  getOptimizedImageUrl,
  uploadMultipleImages,
  getThumbnailUrl,
  getProfileImageUrl
}; 