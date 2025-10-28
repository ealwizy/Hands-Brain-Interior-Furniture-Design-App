import express from "express";
import cors from "cors";
import fileUpload from "express-fileupload";
import cloudinary from "cloudinary";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(fileUpload({ useTempFiles: true }));

// configure cloudinary from CLOUDINARY_URL if provided
if (process.env.CLOUDINARY_URL) cloudinary.config({ cloudinary_url: process.env.CLOUDINARY_URL });
else cloudinary.v2.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET
});

// simple admin code
const ADMIN_CODE = process.env.ADMIN_CODE || "081386";

app.post("/admin/login", (req, res) => {
  const { code } = req.body;
  if (code === ADMIN_CODE) return res.json({ success: true });
  return res.json({ success: false });
});

// upload endpoint: accepts form-data with field "image" (file) and optional "price"
app.post("/upload", async (req, res) => {
  try {
    if (!req.files || !req.files.image) return res.status(400).json({ error: "no file" });
    const file = req.files.image;
    const result = await cloudinary.v2.uploader.upload(file.tempFilePath, { folder: "hands_brain_uploads" });
    return res.json({ success: true, url: result.secure_url, public_id: result.public_id });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message });
  }
});

// delete endpoint (admin only)
app.post("/delete", async (req, res) => {
  try {
    const { publicId } = req.body;
    if (!publicId) return res.status(400).json({ error: "publicId required" });
    const r = await cloudinary.v2.uploader.destroy(publicId, { resource_type: "image" });
    return res.json({ ok: true, result: r });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message });
  }
});

app.get("/", (req, res) => res.send("Hands & Brain server OK"));

const PORT = process.env.PORT || 4000;
app.listen(PORT, ()=>console.log("Server started on",PORT));
