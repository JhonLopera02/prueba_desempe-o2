import { Request, Response, NextFunction } from "express";
import { Clinica, Medicamento, Almacen, Inventario } from "../models/index.js";

/** Estados que se consideran válidos para una solicitud activa. */
const ESTADOS_VALIDOS: string[] = ["pendiente", "aprobada", "rechazada", "entregada"];

/**
 * Middleware que valida unicidad del NIT al crear o actualizar una clínica.
 * Permite que la propia clínica conserve su NIT durante una actualización.
 *
 * @param req  - Request con `body.nit` y opcionalmente `params.id`.
 * @param res  - Response de Express.
 * @param next - Función next de la cadena de middlewares.
 * @returns 400 si el NIT no fue enviado; 409 si ya existe otra clínica con ese NIT.
 */
export const validateNitUnico = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { nit } = req.body;
        if (!nit) {
            res.status(400).json({ success: false, message: "El NIT es obligatorio" });
            return;
        }

        const existente = await Clinica.findOne({ where: { nit, estado: "activo" } as any });

        if (existente && existente.get("id") !== req.params.id) {
            res.status(409).json({ success: false, message: "Ya existe una clínica registrada con ese NIT" });
            return;
        }

        next();
    } catch (error) {
        console.error("Error en validateNitUnico:", error);
        res.status(500).json({ success: false, message: "Error interno validando NIT" });
    }
};

/**
 * Middleware que impide registrar solicitudes con una cantidad menor o igual a cero.
 *
 * @param req  - Request con `body.cantidad`.
 * @param res  - Response de Express.
 * @param next - Función next de la cadena de middlewares.
 * @returns 400 si la cantidad no es válida.
 */
export const validateCantidadPositiva = (req: Request, res: Response, next: NextFunction): void => {
    const { cantidad } = req.body;
    if (cantidad === undefined || Number(cantidad) <= 0) {
        res.status(400).json({ success: false, message: "La cantidad solicitada debe ser mayor a cero" });
        return;
    }
    next();
};

/**
 * Middleware que verifica que la clínica, el medicamento y el almacén
 * referenciados en una solicitud existan y estén en estado activo.
 *
 * @param req  - Request con `body.clinicaId`, `body.medicamentoId` y `body.almacenId`.
 * @param res  - Response de Express.
 * @param next - Función next de la cadena de middlewares.
 * @returns 404 si alguno de los tres recursos no existe o está eliminado.
 */
export const validateExistenciaClinicaYMedicamento = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { clinicaId, medicamentoId, almacenId } = req.body;

        const clinica = await Clinica.findOne({ where: { id: clinicaId, estado: "activo" } as any });
        if (!clinica) {
            res.status(404).json({ success: false, message: "La clínica indicada no existe" });
            return;
        }

        const medicamento = await Medicamento.findOne({ where: { id: medicamentoId, estado: "activo" } as any });
        if (!medicamento) {
            res.status(404).json({ success: false, message: "El medicamento indicado no existe" });
            return;
        }

        const almacen = await Almacen.findOne({ where: { id: almacenId, estado: "activo" } as any });
        if (!almacen) {
            res.status(404).json({ success: false, message: "El almacén indicado no existe" });
            return;
        }

        next();
    } catch (error) {
        console.error("Error en validateExistenciaClinicaYMedicamento:", error);
        res.status(500).json({ success: false, message: "Error interno validando existencia de datos" });
    }
};

/**
 * Middleware que verifica que el almacén tenga inventario suficiente
 * del medicamento solicitado antes de registrar una solicitud.
 *
 * @param req  - Request con `body.almacenId`, `body.medicamentoId` y `body.cantidad`.
 * @param res  - Response de Express.
 * @param next - Función next de la cadena de middlewares.
 * @returns 400 si no hay inventario suficiente del medicamento en el almacén indicado.
 */
export const validateInventarioDisponible = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { almacenId, medicamentoId, cantidad } = req.body;

        const inventario = await Inventario.findOne({ where: { almacenId, medicamentoId } as any });

        if (!inventario || inventario.get("cantidad") < Number(cantidad)) {
            res.status(400).json({
                success: false,
                message: "El almacén no tiene inventario suficiente de este medicamento",
            });
            return;
        }

        next();
    } catch (error) {
        console.error("Error en validateInventarioDisponible:", error);
        res.status(500).json({ success: false, message: "Error interno validando inventario" });
    }
};

/**
 * Middleware que impide actualizar una solicitud a un estado no reconocido por el sistema.
 * Los estados válidos son: "pendiente", "aprobada", "rechazada" y "entregada".
 *
 * @param req  - Request con `body.estado`.
 * @param res  - Response de Express.
 * @param next - Función next de la cadena de middlewares.
 * @returns 400 si el estado no pertenece a la lista de estados válidos.
 */
export const validateEstadoSolicitud = (req: Request, res: Response, next: NextFunction): void => {
    const { estado } = req.body;
    if (!estado || !ESTADOS_VALIDOS.includes(estado)) {
        res.status(400).json({
            success: false,
            message: `Estado no válido. Estados permitidos: ${ESTADOS_VALIDOS.join(", ")}`,
        });
        return;
    }
    next();
};