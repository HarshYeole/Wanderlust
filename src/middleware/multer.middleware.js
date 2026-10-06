import multer from "multer"
import { randomUUID } from "node:crypto"
import { tmpdir } from "node:os"
import { extname } from "node:path"

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, tmpdir())
    },
    filename: function (req, file, cb) {
        cb(null, `${randomUUID()}${extname(file.originalname)}`)
    }
});

export const upload = multer({
    storage
});