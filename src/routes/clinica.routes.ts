import { Router } from "express";
import { verifyToken, checkRole, ROLES } from "../middleware/auth.middleware.js";
import { validateNitUnico } from "../middleware/validation.middleware.js";
import { crudController } from "../controllers/crud.factory.js";
import Clinica from "../models/clinica.model.js";

/**
 * Router de clínicas. Todos los endpoints requieren token JWT válido.
 * Las operaciones de escritura (POST, PUT, DELETE) requieren rol Administrador.
 */
const router = Router();
const { getAll, getById, create, update, remove } = crudController(Clinica, "Clínica");

router.use(verifyToken);

/**
 * @swagger
 * /clinicas:
 *   get:
 *     summary: Listar todas las clínicas activas
 *     tags: [Clínicas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de clínicas activas
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 - id: "uuid-clinica-1"
 *                   nombre: "Clínica Norte"
 *                   nit: "900123456-1"
 *                   direccion: "Cra 45 #10-20"
 *                   telefono: "3001234567"
 *                   estado: "activo"
 *       401:
 *         description: Token no proporcionado o inválido
 */
router.get("/", getAll);

/**
 * @swagger
 * /clinicas/{id}:
 *   get:
 *     summary: Obtener una clínica por su id
 *     tags: [Clínicas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: UUID de la clínica
 *     responses:
 *       200:
 *         description: Clínica encontrada
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 id: "uuid-clinica-1"
 *                 nombre: "Clínica Norte"
 *                 nit: "900123456-1"
 *                 direccion: "Cra 45 #10-20"
 *                 telefono: "3001234567"
 *                 estado: "activo"
 *       404:
 *         description: Clínica no encontrada
 */
router.get("/:id", getById);

/**
 * @swagger
 * /clinicas:
 *   post:
 *     summary: Crear una nueva clínica (solo Administrador)
 *     tags: [Clínicas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nombre, nit, direccion]
 *             properties:
 *               nombre: { type: string, example: "Clínica Norte" }
 *               nit: { type: string, example: "900123456-1" }
 *               direccion: { type: string, example: "Cra 45 #10-20" }
 *               telefono: { type: string, example: "3001234567" }
 *           example:
 *             nombre: "Clínica Norte"
 *             nit: "900123456-1"
 *             direccion: "Cra 45 #10-20"
 *             telefono: "3001234567"
 *     responses:
 *       201:
 *         description: Clínica creada exitosamente
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Clínica creado"
 *               data:
 *                 id: "uuid-nuevo"
 *                 nombre: "Clínica Norte"
 *                 nit: "900123456-1"
 *                 estado: "activo"
 *       403:
 *         description: Rol Administrador requerido
 *       409:
 *         description: Ya existe una clínica con ese NIT
 */
router.post("/", checkRole([ROLES.ADMIN]), validateNitUnico, create);

/**
 * @swagger
 * /clinicas/{id}:
 *   put:
 *     summary: Actualizar una clínica (solo Administrador)
 *     tags: [Clínicas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: UUID de la clínica a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre: { type: string, example: "Clínica Norte Actualizada" }
 *               nit: { type: string, example: "900123456-1" }
 *               direccion: { type: string, example: "Av. Principal #1-100" }
 *               telefono: { type: string, example: "3009999999" }
 *           example:
 *             nombre: "Clínica Norte Actualizada"
 *             direccion: "Av. Principal #1-100"
 *     responses:
 *       200:
 *         description: Clínica actualizada exitosamente
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Clínica actualizado"
 *       404:
 *         description: Clínica no encontrada
 *       409:
 *         description: NIT duplicado
 */
router.put("/:id", checkRole([ROLES.ADMIN]), validateNitUnico, update);

/**
 * @swagger
 * /clinicas/{id}:
 *   delete:
 *     summary: Eliminar lógicamente una clínica (solo Administrador)
 *     tags: [Clínicas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: UUID de la clínica a eliminar
 *     responses:
 *       200:
 *         description: Clínica marcada como eliminada
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Clínica eliminado"
 *       404:
 *         description: Clínica no encontrada
 */
router.delete("/:id", checkRole([ROLES.ADMIN]), remove);

export default router;