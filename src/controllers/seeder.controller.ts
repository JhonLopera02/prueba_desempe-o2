import { Request, Response } from "express";
import fs from "fs";
import { Clinica, Almacen, Medicamento, Inventario } from "../models/index.js";

/**
 * Mapa de entidades disponibles para la carga masiva de datos.
 * La clave corresponde al valor que debe enviarse en el campo `entidad` del form-data.
 */
const ENTIDADES_DISPONIBLES: Record<string, any> = {
    clinicas: Clinica,
    almacenes: Almacen,
    medicamentos: Medicamento,
    inventarios: Inventario,
};

/**
 * Controlador que procesa un archivo JSON cargado con Multer y realiza
 * una inserción masiva (bulk create) en la entidad indicada.
 *
 * El archivo debe ser un array de objetos cuyos campos correspondan
 * al modelo Sequelize de la entidad destino. El archivo temporal
 * es eliminado del disco tras procesarse, sin importar si hubo error.
 *
 * @param req - Request multipart con:
 *   - `file`: archivo JSON subido vía multer (campo "archivo").
 *   - `body.entidad`: nombre de la entidad destino ("clinicas" | "almacenes" | "medicamentos" | "inventarios").
 * @param res - Response con el número de registros insertados y sus datos.
 * @returns 201 con los registros creados si el proceso es exitoso.
 * @returns 400 si no se envió archivo, la entidad es inválida o el JSON tiene formato incorrecto.
 */
export const seedFromFile = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.file) {
            res.status(400).json({ success: false, message: "No se envió ningún archivo" });
            return;
        }

        const { entidad } = req.body;
        const model = ENTIDADES_DISPONIBLES[entidad];

        if (!model) {
            fs.unlinkSync(req.file.path);
            res.status(400).json({
                success: false,
                message: `Entidad no válida. Usa: ${Object.keys(ENTIDADES_DISPONIBLES).join(", ")}`,
            });
            return;
        }

        const contenido = fs.readFileSync(req.file.path, "utf-8");
        const datos = JSON.parse(contenido);

        if (!Array.isArray(datos)) {
            fs.unlinkSync(req.file.path);
            res.status(400).json({ success: false, message: "El JSON debe ser un arreglo de objetos" });
            return;
        }

        const registrosCreados = await model.bulkCreate(datos, { validate: true });

        fs.unlinkSync(req.file.path);

        res.status(201).json({
            success: true,
            message: `${registrosCreados.length} registros de "${entidad}" cargados exitosamente`,
            data: registrosCreados,
        });
    } catch (error: any) {
        console.error("Error en seedFromFile:", error);
        if (req.file?.path && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        res.status(400).json({ success: false, message: error.message || "Error al procesar el archivo" });
    }
};