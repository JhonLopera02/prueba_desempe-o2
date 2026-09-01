import { Response } from "express";
import { Solicitud, Clinica, Medicamento, Almacen, Inventario, User } from "../models/index.js";
import { AuthRequest } from "../middleware/auth.middleware.js";

/** Estados que se consideran activos para filtrado de solicitudes. */
const ESTADOS_ACTIVOS: string[] = ["pendiente", "aprobada", "rechazada", "entregada"];

/**
 * Crea una nueva solicitud de abastecimiento de medicamentos y descuenta
 * automáticamente la cantidad solicitada del inventario del almacén asignado.
 *
 * @param req - AuthRequest con `body`: clinicaId, medicamentoId, almacenId, cantidad.
 *              El id del usuario se obtiene desde `req.user.id` (token JWT).
 * @param res - Response con la solicitud creada.
 * @returns 201 si la solicitud fue creada exitosamente.
 * @returns 404 si no existe inventario para el par almacén/medicamento.
 * @returns 400 en caso de error de validación o negocio.
 */
export const createSolicitud = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { clinicaId, medicamentoId, almacenId, cantidad } = req.body;
        const usuarioId = req.user?.id;

        const inventario = await Inventario.findOne({ where: { almacenId, medicamentoId } as any });
        if (!inventario) {
            res.status(404).json({ success: false, message: "No existe inventario para ese almacén/medicamento" });
            return;
        }

        const solicitud = await Solicitud.create({
            clinicaId,
            medicamentoId,
            almacenId,
            cantidad,
            usuarioId,
            estado: "pendiente",
        } as any);

        await inventario.update({ cantidad: inventario.get("cantidad") - Number(cantidad) } as any);

        res.status(201).json({ success: true, message: "Solicitud creada exitosamente", data: solicitud });
    } catch (error: any) {
        console.error("Error en createSolicitud:", error);
        res.status(400).json({ success: false, message: error.message || "Error al crear la solicitud" });
    }
};

/**
 * Actualiza el estado de una solicitud existente.
 * Solo acepta los estados definidos en el ENUM del modelo (validado previamente por middleware).
 *
 * @param req - AuthRequest con `params.id` (UUID de la solicitud) y `body.estado`.
 * @param res - Response con la solicitud actualizada.
 * @returns 200 si el estado fue actualizado.
 * @returns 404 si la solicitud no existe o ya está eliminada.
 * @returns 400 en caso de error de validación.
 */
export const updateEstadoSolicitud = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { estado } = req.body;
        const solicitud = await Solicitud.findOne({
            where: { id: req.params.id, estado: ESTADOS_ACTIVOS } as any,
        });

        if (!solicitud) {
            res.status(404).json({ success: false, message: "Solicitud no encontrada" });
            return;
        }

        await solicitud.update({ estado } as any);
        res.status(200).json({ success: true, message: "Estado actualizado", data: solicitud });
    } catch (error: any) {
        console.error("Error en updateEstadoSolicitud:", error);
        res.status(400).json({ success: false, message: error.message || "Error al actualizar el estado" });
    }
};

/**
 * Devuelve todas las solicitudes activas (no eliminadas) con sus relaciones
 * de clínica, medicamento, almacén y usuario.
 *
 * Accesible por cualquier usuario autenticado (Administrador y Gestor de Solicitudes).
 *
 * @param req - AuthRequest (requiere token válido).
 * @param res - Response con el listado de solicitudes activas.
 * @returns 200 con el array de solicitudes.
 * @returns 500 en caso de error interno.
 */
export const getSolicitudesActivas = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const solicitudes = await Solicitud.findAll({
            where: { estado: ESTADOS_ACTIVOS } as any,
            include: [
                { model: Clinica, as: "clinica" },
                { model: Medicamento, as: "medicamento" },
                { model: Almacen, as: "almacen" },
                { model: User, as: "usuario", attributes: { exclude: ["password"] } },
            ],
        });
        res.status(200).json({ success: true, data: solicitudes });
    } catch (error) {
        console.error("Error en getSolicitudesActivas:", error);
        res.status(500).json({ success: false, message: "Error al obtener las solicitudes" });
    }
};

/**
 * Devuelve el historial completo de todas las solicitudes registradas en el sistema,
 * incluyendo las eliminadas. Ordenadas de más reciente a más antigua.
 *
 * Disponible para Administrador y Gestor de Solicitudes.
 *
 * @param req - AuthRequest (requiere token válido).
 * @param res - Response con el historial completo de solicitudes.
 * @returns 200 con el array de todas las solicitudes.
 * @returns 500 en caso de error interno.
 */
export const getHistorialCompleto = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const solicitudes = await Solicitud.findAll({
            include: [
                { model: Clinica, as: "clinica" },
                { model: Medicamento, as: "medicamento" },
                { model: Almacen, as: "almacen" },
                { model: User, as: "usuario", attributes: { exclude: ["password"] } },
            ],
            order: [["createdAt", "DESC"]],
        });
        res.status(200).json({ success: true, data: solicitudes });
    } catch (error) {
        console.error("Error en getHistorialCompleto:", error);
        res.status(500).json({ success: false, message: "Error al obtener el historial completo" });
    }
};

/**
 * Devuelve el historial completo de solicitudes realizadas por una clínica específica.
 * Incluye solicitudes en todos los estados. Ordenadas de más reciente a más antigua.
 *
 * @param req - AuthRequest con `params.clinicaId` (UUID de la clínica).
 * @param res - Response con el historial de solicitudes de la clínica.
 * @returns 200 con el array de solicitudes.
 * @returns 404 si la clínica no existe o está eliminada.
 * @returns 500 en caso de error interno.
 */
export const getHistorialPorClinica = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { clinicaId } = req.params;

        const clinica = await Clinica.findOne({ where: { id: clinicaId, estado: "activo" } as any });
        if (!clinica) {
            res.status(404).json({ success: false, message: "Clínica no encontrada" });
            return;
        }

        const solicitudes = await Solicitud.findAll({
            where: { clinicaId } as any,
            include: [
                { model: Medicamento, as: "medicamento" },
                { model: Almacen, as: "almacen" },
                { model: User, as: "usuario", attributes: { exclude: ["password"] } },
            ],
            order: [["createdAt", "DESC"]],
        });

        res.status(200).json({ success: true, data: solicitudes });
    } catch (error) {
        console.error("Error en getHistorialPorClinica:", error);
        res.status(500).json({ success: false, message: "Error al obtener el historial" });
    }
};

/**
 * Obtiene una solicitud individual por su UUID.
 * Solo devuelve solicitudes que no han sido eliminadas lógicamente.
 *
 * @param req - AuthRequest con `params.id` (UUID de la solicitud).
 * @param res - Response con la solicitud encontrada y sus relaciones.
 * @returns 200 con la solicitud.
 * @returns 404 si no existe o fue eliminada.
 * @returns 500 en caso de error interno.
 */
export const getSolicitudById = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const solicitud = await Solicitud.findOne({
            where: { id: req.params.id, estado: ESTADOS_ACTIVOS } as any,
            include: [
                { model: Clinica, as: "clinica" },
                { model: Medicamento, as: "medicamento" },
                { model: Almacen, as: "almacen" },
            ],
        });
        if (!solicitud) {
            res.status(404).json({ success: false, message: "Solicitud no encontrada" });
            return;
        }
        res.status(200).json({ success: true, data: solicitud });
    } catch (error) {
        console.error("Error en getSolicitudById:", error);
        res.status(500).json({ success: false, message: "Error al obtener la solicitud" });
    }
};

/**
 * Elimina lógicamente una solicitud cambiando su estado a "eliminada".
 * Solo disponible para usuarios con rol Administrador.
 * No elimina el registro físicamente de la base de datos.
 *
 * @param req - AuthRequest con `params.id` (UUID de la solicitud).
 * @param res - Response con mensaje de confirmación.
 * @returns 200 si la solicitud fue marcada como eliminada.
 * @returns 404 si la solicitud no existe.
 * @returns 500 en caso de error interno.
 */
export const deleteSolicitud = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const solicitud = await Solicitud.findOne({ where: { id: req.params.id } as any });
        if (!solicitud) {
            res.status(404).json({ success: false, message: "Solicitud no encontrada" });
            return;
        }
        await solicitud.update({ estado: "eliminada" } as any);
        res.status(200).json({ success: true, message: "Solicitud eliminada" });
    } catch (error) {
        console.error("Error en deleteSolicitud:", error);
        res.status(500).json({ success: false, message: "Error al eliminar la solicitud" });
    }
};