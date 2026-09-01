import { Router } from "express";
import { upload } from "../middleware/upload.middleware.js";
import { seedFromFile } from "../controllers/seeder.controller.js";

const router = Router();

/**
 * @swagger
 * /seeder/upload:
 *   post:
 *     summary: Bulk-load records from a JSON file into a given entity
 *     tags: [Seeder]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [archivo, entidad]
 *             properties:
 *               archivo:
 *                 type: string
 *                 format: binary
 *                 description: JSON file containing an array of records
 *               entidad:
 *                 type: string
 *                 enum: [clinicas, almacenes, medicamentos, inventarios]
 *                 example: clinicas
 *     responses:
 *       201:
 *         description: Records loaded successfully
 *       400:
 *         description: Invalid entity or malformed JSON
 */
// Endpoint sin JWT, pensado solo para poblar datos de prueba
router.post("/upload", upload.single("archivo"), seedFromFile);

export default router;