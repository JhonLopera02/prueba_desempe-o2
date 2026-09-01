import { Router } from "express";
import authRoutes from "./auth.routes.js";
import clinicaRoutes from "./clinica.routes.js";
import almacenRoutes from "./almacen.routes.js";
import medicamentoRoutes from "./medicamento.routes.js";
import solicitudRoutes from "./solicitud.routes.js";
import seederRoutes from "./seeder.routes.js";

/**
 * Router raíz de la API. Agrupa todos los subrouters bajo el prefijo /api.
 *
 * Rutas disponibles:
 * - /api/auth        — Registro e inicio de sesión (sin JWT)
 * - /api/clinicas    — CRUD de clínicas (requiere JWT)
 * - /api/almacenes   — CRUD de almacenes (requiere JWT)
 * - /api/medicamentos — CRUD de medicamentos (requiere JWT)
 * - /api/solicitudes — Ciclo de vida de solicitudes (requiere JWT)
 * - /api/seeder      — Carga masiva de datos desde JSON (sin JWT)
 */
const router = Router();

router.use("/auth", authRoutes);
router.use("/clinicas", clinicaRoutes);
router.use("/almacenes", almacenRoutes);
router.use("/medicamentos", medicamentoRoutes);
router.use("/solicitudes", solicitudRoutes);
router.use("/seeder", seederRoutes);

export default router;
