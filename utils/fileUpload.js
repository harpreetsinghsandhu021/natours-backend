const multer = require("multer");
const sharp = require("sharp");

const multerStorage = multer.memoryStorage;

const filters = async function (req, file, sb) {
  if (file.mimeType.startsWith("Image")) {
    console.log(file);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: filters,
});

exports.uploadSingle = upload.single("photo");
