import multer from 'multer'
import path from 'path'

export default {
  storage: multer.diskStorage({
    destination: path.resolve(__dirname, '..', '..', 'tmp', 'uploads'),
    filename: function (req, file, cb) {
      const filename = `${Date.now()}_${file.originalname}`
      cb(null, filename)
    }
  }),
  fileFilter: function (req, file, cb) {
    if (file.mimetype === 'image/png' ||
      file.mimetype === 'image/jpg' ||
      file.mimetype === 'image/jpeg') {
      cb(null, true)
    } else {
      req.fileError = 'File entension not supported'
      cb(null, false)
    }
  },
  limits: {
    fieldSize: 1024 * 1024 * 2
  }
}
