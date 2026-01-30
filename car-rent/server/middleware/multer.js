import multer from "multer";
import path from "path";
import fs from "fs";

// Ensure 'tmp' folder exists
const tmpDir = path.join(process.cwd(), "tmp");
if (!fs.existsSync(tmpDir)) {
  try {
    fs.mkdirSync(tmpDir, { recursive: true });
  } catch (error) {
    console.error("❌ Failed to create tmp directory:", error.message);
    throw new Error("Unable to initialize file upload directory");
  }
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, tmpDir); // Save all files to ./tmp
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const ext = path.extname(file.originalname).toLowerCase();
  const mimeType = allowedTypes.test(file.mimetype);

  if (allowedTypes.test(ext) && mimeType) {
    return cb(null, true);
  } else {
    cb(new Error("Only image files (jpeg, jpg, png, webp) are allowed!"));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit to 5MB
});

export default upload;