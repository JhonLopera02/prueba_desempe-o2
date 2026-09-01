import { Router } from "express";
import { verifyToken, checkRole, ROLES } from "../middleware/auth.middleware.js";
import { crudController } from "../controllers/crud.factory.js";
import Almacen from "../models/almacen.model.js";

/**
 * Router de almacenes. Todos los endpoints requieren token JWT válido.
 * Las operaciones de escritura (POST, PUT, DELETE) requieren rol Administrador.
 */
const router = Router();
const { getAll, getById, create, update, remove } = crudController(Almacen, "Almacén");

router.use(verifyToken);

/**
 * @swagger
 * /almacenes:
 *   get:
 *     summary: Listar todos los almacenes activos
 *     tags: [Almacenes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de almacenes activos
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 - id: "uuid-almacen-1"
 *                   nombre: "Almacén Central"
 *                   ubicacion: "Zona Industrial"
 *                   estado: "activo"
 *       401:
 *         description: Token no proporcionado o inválido
 */
router.get("/", getAll);

/**
 * @swagger
 * /almacenes/{id}:
 *   get:
 *     summary: Obtener un almacén por su id
 *     tags: [Almacenes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: UUID del almacén
 *     responses:
 *       200:
 *         description: Almacén encontrado
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 id: "uuid-almacen-1"
 *                 nombre: "Almacén Central"
 *                 ubicacion: "Zona Industrial"
 *                 estado: "activo"
 *       404:
 *         description: Almacén no encontrado
 */
router.get("/:id", getById);

/**
 * @swagger
 * /almacenes:
 *   post:
 *     summary: Crear un nuevo almacén (solo Administrador)
 *     tags: [Almacenes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nombre, ubicacion]
 *             properties:
 *               nombre: { type: string, example: "Almacén Central" }
 *               ubicacion: { type: string, example: "Zona Industrial" }
 *           example:
 *             nombre: "Almacén Central"
 *             ubicacion: "Zona Industrial"
 *     responses:
 *       201:
 *         description: Almacén creado exitosamente
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Almacén creado"
 *               data:
 *                 id: "uuid-nuevo"
 *                 nombre: "Almacén Central"
 *                 ubicacion: "Zona Industrial"
 *                 estado: "activo"
 *       403:
 *         description: Rol Administrador requerido
 */
router.post("/", checkRole([ROLES.ADMIN]), create);

/**
 * @swagger
 * /almacenes/{id}:
 *   put:
 *     summary: Actualizar un almacén (solo Administrador)
 *     tags: [Almacenes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: UUID del almacén a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre: { type: string, example: "Almacén Central Sur" }
 *               ubicacion: { type: string, example: "Parque Industrial Norte" }
 *           example:
 *             nombre: "Almacén Central Sur"
 *             ubicacion: "Parque Industrial Norte"
 *     responses:
 *       200:
 *         description: Almacén actualizado exitosamente
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Almacén actualizado"
 *       404:
 *         description: Almacén no encontrado
 */
router.put("/:id", checkRole([ROLES.ADMIN]), update);

/**
 * @swagger
 * /almacenes/{id}:
 *   delete:
 *     summary: Eliminar lógicamente un almacén (solo Administrador)
 *     tags: [Almacenes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: UUID del almacén a eliminar
 *     responses:
 *       200:
 *         description: Almacén marcado como eliminado
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Almacén eliminado"
 *       404:
 *         description: Almacén no encontrado
 */
router.delete("/:id", checkRole([ROLES.ADMIN]), remove);

export default router;