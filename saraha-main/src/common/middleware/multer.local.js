
import multer from "multer";
import path from "node:path";
import fs from "node:fs";

import { BadRequestException } from "../exceptions/index.js";
import {
    fileTypeFromBuffer,
    fileTypeFromFile
} from "file-type";

export const fileTypes = {
    images: [
        "image/png",
        "image/jpeg",
        "image/webp"
    ],
    pdf: [
        "application/pdf"
    ],
    video: [
        "video/mp4"
    ]
};

const uploadFolder = path.resolve("./uploads");

if (!fs.existsSync(uploadFolder)) {
    fs.mkdirSync(uploadFolder, { recursive: true });
}

// Local Storage
export const multerLocal = ({ filetype = [] } = {}) => {
    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            const folderPath = uploadFolder;

            if (!fs.existsSync(folderPath)) {
                fs.mkdirSync(folderPath, { recursive: true });
            }

            cb(null, folderPath);
        },

        filename: (req, file, cb) => {
            cb(
                null,
                `${Date.now()}-${file.originalname}`
            );
        }
    });

    const fileFilter = (req, file, cb) => {
        if (
            filetype.length &&
            !filetype.includes(file.mimetype)
        ) {
            return cb(
                BadRequestException("Wrong file type")
            );
        }

        cb(null, true);
    };

    return multer({
        storage,
        fileFilter
    });
};

// Memory Storage
export const multerMemory = ({ filetype = [] } = {}) => {
    const storage = multer.memoryStorage();

    const fileFilter = (req, file, cb) => {
        if (
            filetype.length &&
            !filetype.includes(file.mimetype)
        ) {
            return cb(
                BadRequestException("Wrong file type")
            );
        }

        cb(null, true);
    };

    return multer({
        storage,
        fileFilter
    });
};

// Validate the real file type and save it
const processSingleFile = async (file, filetype) => {
    let result;

    if (file.buffer) {
        result = await fileTypeFromBuffer(file.buffer);
    } else if (file.path) {
        result = await fileTypeFromFile(file.path);
    }

    if (!result || !filetype.includes(result.mime)) {
        if (file.path && fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
        }

        BadRequestException("Invalid file type");
    }

    // Save files received through memory storage
    if (file.buffer) {
        const fullPath = path.join(
            uploadFolder,
            `${Date.now()}-${Math.random().toString(36).slice(2)}.${result.ext}`
        );

        fs.writeFileSync(fullPath, file.buffer);

        file.fullPath = fullPath;
        file.path = fullPath;
    } else {
        file.fullPath = file.path;
    }

    return file;
};

// Process uploaded files
export const processFiles = ({ filetype = [] } = {}) => {
    return async (req, res, next) => {
        try {
            if (req.file) {
                req.file = await processSingleFile(
                    req.file,
                    filetype
                );
            } else if (
                Array.isArray(req.files) &&
                req.files.length > 0
            ) {
                for (let i = 0; i < req.files.length; i++) {
                    req.files[i] = await processSingleFile(
                        req.files[i],
                        filetype
                    );
                }
            } else if (
                req.files &&
                typeof req.files === "object"
            ) {
                const keys = Object.keys(req.files);

                for (const key of keys) {
                    for (
                        let i = 0;
                        i < req.files[key].length;
                        i++
                    ) {
                        req.files[key][i] =
                            await processSingleFile(
                                req.files[key][i],
                                filetype
                            );
                    }
                }
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};
