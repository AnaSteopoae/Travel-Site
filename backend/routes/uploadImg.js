import { v2 as cloudinary } from 'cloudinary';
import express from 'express';
import multer from 'multer';

const router = express.Router();
const upload = multer({storage : multer.memoryStorage() });


router.post('/upload-image', upload.single('image'), async (req, res) => {
    try{
        if(!req.file){
            return res.status(400).json({message: 'Nu s-a trimis nicio imagine'});
        }
        const fileStr = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
        const uploadResult = await cloudinary.uploader.upload(fileStr, {
            folder: 'properties',
            resource_type: 'auto',
            transformation: [
                { width: 1200, crop: 'limit' },
                { quality: 'auto:good' }
            ]
        });
        return res.status(200).json({
            url: uploadResult.secure_url,
            publicId: uploadResult.public_id
          });
    }catch (error) {
        console.error('Eroare la încărcarea imaginii:', error);
        return res.status(500).json({
          message: 'Eroare la încărcarea imaginii',
          error: error.message
        });
      }
});

export default router;