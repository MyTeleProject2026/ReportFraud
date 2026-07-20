const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { uploadToCloudinary } = require('../config/cloudinary');

// Public upload - NO authentication required
router.post('/upload/image', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        const folder = req.query.folder || 'reportfraud/suspects';
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
        console.error('Public upload error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while uploading file'
        });
    }
});

module.exports = router;
