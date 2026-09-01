import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = path.resolve("uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

/**
 * Configuración del almacenamiento en disco para Multer.
 * Los archivos se guardan en el directorio "uploads/" con un prefijo de timestamp
 * para evitar colisiones de nombres.
 */
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

/**
 * Filtro de archivos para Multer. Solo acepta archivos con tipo MIME
 * "application/json" o extensión ".json".
 *
 * @param req  - Request de Express.
 * @param file - Archivo recibido en la petición multipart.
 * @param cb   - Callback de Multer para aceptar o rechazar el archivo.
 */
const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback): void => {
    if (file.mimetype !== "application/json" && !file.originalname.endsWith(".json")) {
        cb(new Error("Solo se permiten archivos .json"));
        return;
    }
    cb(null, true);
};

/**
 * Instancia de Multer configurada con almacenamiento en disco y filtro de JSON.
 * Usada en el endpoint de carga masiva de datos (`POST /api/seeder/upload`).
 */
export const upload = multer({ storage, fileFilter });