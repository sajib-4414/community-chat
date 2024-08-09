import multer from "multer";


const storage = multer.memoryStorage();

const filter = (req:any, file:any, cb:any) => {
    if (file.mimetype.split("/")[0] === 'image') {
        cb(null, true);
    } else {
        cb(new Error("Only images are allowed!"));
    }
};

export const upload = multer({
    storage,
    fileFilter: filter
});
