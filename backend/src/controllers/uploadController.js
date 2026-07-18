const { uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');

const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }
    
    const folder = req.query.folder || 'reportfraud';
    const result = await uploadToCloudinary(req.file.buffer, folder);
    
    res.json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        url: result.secure_url,
        public_id: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
        bytes: result.bytes
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while uploading file'
    });
  }
};

const deleteImage = async (req, res) => {
  try {
    const { public_id } = req.body;
    
    if (!public_id) {
      return res.status(400).json({
        success: false,
        message: 'Public ID is required'
      });
    }
    
    const result = await deleteFromCloudinary(public_id);
    
    res.json({
      success: true,
      message: 'File deleted successfully',
      data: result
    });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting file'
    });
  }
};

module.exports = {
  uploadImage,
  deleteImage
};