const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req: Request, file: Express.Multer.File, cb: any) => {
      cb(null, "public/uploads");
    },
    filename: (req: Request, file: Express.Multer.File, cb: any) => {
      cb(null, Date.now() + path.extname(file.originalname));
    },
  });
  
  const upload = multer({ storage: storage });

module.exports = upload;