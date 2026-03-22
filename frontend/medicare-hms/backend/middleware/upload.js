import { upload } from "../config/multer.js";

export const uploadAvatar = upload.single("file");
export const uploadDocument = upload.single("file");
