import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloudinary_url: process.env.CLOUDINARY_URL
});

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      // Expecting a base64 image from the frontend
      const { file } = req.body;
      const uploadResponse = await cloudinary.uploader.upload(file);
      res.status(200).json({ url: uploadResponse.secure_url });
    } catch (err) {
      res.status(500).json({ error: 'Upload failed', details: err.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
  }
