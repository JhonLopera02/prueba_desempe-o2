import { Router } from "express";
import { verifyToken, checkRole, ROLES } from "../middleware/auth.middleware.js";
import { crudController } from "../controllers/crud.factory.js";
import Medicamento from "../models/medicamento.model.js";

/**
 * Router de medicamentos. Todos los endpoints requieren token JWT válido.
 * Las operaciones de escritura (POST, PUT, DELETE) requieren rol Administrador.
 */
const router = Router();
const { getAll, getById, create, update, remove } = crudController(Medicamento, "Medicamento");

router.use(verifyToken);

/**
 * @swagger
 * /medicamentos:
 *   get:
 *     summary: Listar todos los medicamentos activos
 *     tags: [Medicamentos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de medicamentos activos
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 - id: "uuid-medicamento-1"
 *                   nombre: "Acetaminofén 500mg"
 *                   descripcion: "Analgésico"
 *                   stockMinimo: 50
 *                   estado: "activo"
 *       401:
 *         description: Token no proporcionado o inválido
 */
router.get("/", getAll);

/**
 * @swagger
 * /medicamentos/{id}:
 *   get:
 *     summary: Obtener un medicamento por su id
 *     tags: [Medicamentos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: UUID del medicamento
 *     responses:
 *       200:
 *         description: Medicamento encontrado
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 id: "uuid-medicamento-1"
 *                 nombre: "Acetaminofén 500mg"
 *                 descripcion: "Analgésico"
 *                 stockMinimo: 50
 *                 estado: "activo"
 *       404:
 *         description: Medicamento no encontrado
 */
router.get("/:id", getById);

/**
 * @swagger
 * /medicamentos:
 *   post:
 *     summary: Crear un nuevo medicamento (solo Administrador)
 *     tags: [Medicamentos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nombre]
 *             properties:
 *               nombre: { type: string, example: "Acetaminofén 500mg" }
 *               descripcion: { type: string, example: "Analgésico" }
 *               stockMinimo: { type: integer, example: 50 }
 *           example:
 *             nombre: "Acetaminofén 500mg"
 *             descripcion: "Analgésico de amplio espectro"
 *             stockMinimo: 50
 *     responses:
 *       201:
 *         description: Medicamento creado exitosamente
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Medicamento creado"
 *               data:
 *                 id: "uuid-nuevo"
 *                 nombre: "Acetaminofén 500mg"
 *                 descripcion: "Analgésico de amplio espectro"
 *                 stockMinimo: 50
 *                 estado: "activo"
 *       403:
 *         description: Rol Administrador requerido
 */
router.post("/", checkRole([ROLES.ADMIN]), create);

/**
 * @swagger
 * /medicamentos/{id}:
 *   put:
 *     summary: Actualizar un medicamento (solo Administrador)
 *     tags: [Medicamentos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: UUID del medicamento a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre: { type: string, example: "Acetaminofén 1000mg" }
 *               descripcion: { type: string, example: "Analgésico de alta dosis" }
 *               stockMinimo: { type: integer, example: 100 }
 *           example:
 *             nombre: "Acetaminofén 1000mg"
 *             stockMinimo: 100
 *     responses:
 *       200:
 *         description: Medicamento actualizado exitosamente
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Medicamento actualizado"
 *       404:
 *         description: Medicamento no encontrado
 */
router.put("/:id", checkRole([ROLES.ADMIN]), update);

/**
 * @swagger
 * /medicamentos/{id}:
 *   delete:
 *     summary: Eliminar lógicamente un medicamento (solo Administrador)
 *     tags: [Medicamentos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: UUID del medicamento a eliminar
 *     responses:
 *       200:
 *         description: Medicamento marcado como eliminado
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Medicamento eliminado"
 *       404:
 *         description: Medicamento no encontrado
 */
router.delete("/:id", checkRole([ROLES.ADMIN]), remove);

export default router;