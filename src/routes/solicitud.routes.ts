import { Router } from "express";
import { verifyToken, checkRole, ROLES } from "../middleware/auth.middleware.js";
import {
    validateCantidadPositiva,
    validateExistenciaClinicaYMedicamento,
    validateInventarioDisponible,
    validateEstadoSolicitud,
} from "../middleware/validation.middleware.js";
import {
    createSolicitud,
    updateEstadoSolicitud,
    getSolicitudesActivas,
    getHistorialCompleto,
    getHistorialPorClinica,
    getSolicitudById,
    deleteSolicitud,
} from "../controllers/solicitud.controller.js";

const router = Router();

router.use(verifyToken);

/**
 * @swagger
 * /solicitudes:
 *   post:
 *     summary: Registrar una solicitud de abastecimiento (Administrador o Gestor de Solicitudes)
 *     tags: [Solicitudes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [clinicaId, medicamentoId, almacenId, cantidad]
 *             properties:
 *               clinicaId: { type: string, example: "uuid-clinica" }
 *               medicamentoId: { type: string, example: "uuid-medicamento" }
 *               almacenId: { type: string, example: "uuid-almacen" }
 *               cantidad: { type: integer, example: 10 }
 *           example:
 *             clinicaId: "uuid-clinica"
 *             medicamentoId: "uuid-medicamento"
 *             almacenId: "uuid-almacen"
 *             cantidad: 10
 *     responses:
 *       201:
 *         description: Solicitud creada e inventario descontado
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Solicitud creada exitosamente"
 *       400:
 *         description: Inventario insuficiente o cantidad inválida
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Rol no permitido
 *       404:
 *         description: Clínica, medicamento o almacén no encontrado
 */
router.post(
    "/",
    checkRole([ROLES.ADMIN, ROLES.GESTOR]),
    validateCantidadPositiva,
    validateExistenciaClinicaYMedicamento,
    validateInventarioDisponible,
    createSolicitud
);

/**
 * @swagger
 * /solicitudes/{id}/estado:
 *   patch:
 *     summary: Actualizar el estado de una solicitud existente
 *     tags: [Solicitudes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: UUID de la solicitud
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [estado]
 *             properties:
 *               estado:
 *                 type: string
 *                 enum: [pendiente, aprobada, rechazada, entregada]
 *                 example: aprobada
 *           example:
 *             estado: "aprobada"
 *     responses:
 *       200:
 *         description: Estado actualizado correctamente
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Estado actualizado"
 *       400:
 *         description: Estado no válido
 *       404:
 *         description: Solicitud no encontrada
 */
router.patch(
    "/:id/estado",
    checkRole([ROLES.ADMIN, ROLES.GESTOR]),
    validateEstadoSolicitud,
    updateEstadoSolicitud
);

/**
 * @swagger
 * /solicitudes/activas:
 *   get:
 *     summary: Listar todas las solicitudes activas (cualquier usuario autenticado)
 *     tags: [Solicitudes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de solicitudes activas
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data: []
 */
router.get("/activas", getSolicitudesActivas);

/**
 * @swagger
 * /solicitudes/historial:
 *   get:
 *     summary: Consultar el historial completo de todas las solicitudes (Administrador o Gestor)
 *     tags: [Solicitudes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Historial completo de solicitudes
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data: []
 */
router.get("/historial", checkRole([ROLES.ADMIN, ROLES.GESTOR]), getHistorialCompleto);

/**
 * @swagger
 * /solicitudes/historial/{clinicaId}:
 *   get:
 *     summary: Consultar el historial de solicitudes de una clínica específica
 *     tags: [Solicitudes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: clinicaId
 *         required: true
 *         schema: { type: string }
 *         description: UUID de la clínica
 *     responses:
 *       200:
 *         description: Historial de solicitudes de la clínica indicada
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data: []
 *       404:
 *         description: Clínica no encontrada
 */
router.get("/historial/:clinicaId", getHistorialPorClinica);

/**
 * @swagger
 * /solicitudes/{id}:
 *   get:
 *     summary: Obtener una solicitud por su id
 *     tags: [Solicitudes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: UUID de la solicitud
 *     responses:
 *       200:
 *         description: Solicitud encontrada
 *       404:
 *         description: Solicitud no encontrada
 */
router.get("/:id", getSolicitudById);

/**
 * @swagger
 * /solicitudes/{id}:
 *   delete:
 *     summary: Eliminar lógicamente una solicitud (solo Administrador)
 *     tags: [Solicitudes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: UUID de la solicitud a eliminar
 *     responses:
 *       200:
 *         description: Solicitud marcada como eliminada
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Solicitud eliminada"
 *       404:
 *         description: Solicitud no encontrada
 */
router.delete("/:id", checkRole([ROLES.ADMIN]), deleteSolicitud);

export default router;