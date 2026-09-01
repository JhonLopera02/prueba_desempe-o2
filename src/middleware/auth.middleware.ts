import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { Role, User } from "../models/index.js";

/**
 * Extiende la interfaz Request de Express para incluir el payload
 * del usuario autenticado tras la verificación del token JWT.
 */
export interface AuthRequest extends Request {
  user?: {
    /** UUID del usuario autenticado. */
    id: string;
    /** Correo electrónico del usuario. */
    email: string;
    /** UUID del rol asignado al usuario. */
    roleId: string;
    /** Nombre del rol (p. ej. "Administrador" o "Gestor de Solicitudes"). */
    roleName?: string;
  };
}

/**
 * Constantes con los nombres exactos de los roles disponibles en el sistema.
 * Se usan para la verificación de permisos en los middlewares de autorización.
 */
export const ROLES = {
  ADMIN: "Administrador",
  GESTOR: "Gestor de Solicitudes",
} as const;

const JWT_SECRET: string = process.env.JWT_SECRET || "";

/**
 * Middleware de autenticación. Verifica que la petición incluya un token JWT
 * válido en el header `Authorization: Bearer <token>`.
 *
 * Adjunta el objeto `user` al request para que los middlewares posteriores
 * puedan acceder al id, email, roleId y roleName del usuario autenticado.
 *
 * @param req  - Request extendido con la interfaz AuthRequest.
 * @param res  - Response de Express.
 * @param next - Función next para continuar la cadena de middlewares.
 * @returns 401 si el token no es proporcionado, está malformado o ha expirado.
 */
export const verifyToken = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ success: false, message: "Token no proporcionado" });
      return;
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      res.status(401).json({ success: false, message: "Token no proporcionado" });
      return;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as unknown as { id: string; email: string; roleId: string };

    const user = await User.findByPk(decoded.id, { include: [{ model: Role, as: "role" }] });
    if (!user) {
      res.status(401).json({ success: false, message: "Usuario no válido" });
      return;
    }

    req.user = {
      id: user.id,
      email: user.email,
      roleId: user.roleId as string,
      roleName: (user as any).role?.name,
    };

    next();
  } catch (error) {
    res.status(401).json({ success: false, message: "Token inválido o expirado" });
  }
};

/**
 * Middleware de autorización basado en roles. Verifica que el usuario autenticado
 * posea uno de los roles indicados en `allowedRoles`.
 *
 * Debe usarse SIEMPRE después de `verifyToken` en la cadena de middlewares.
 *
 * @param allowedRoles - Array con los nombres de roles permitidos para acceder al recurso.
 * @returns Middleware que responde con 401 si no hay usuario autenticado o 403 si el rol no está permitido.
 */
export const checkRole = (allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: "No autenticado" });
      return;
    }

    if (!req.user.roleName || !allowedRoles.includes(req.user.roleName)) {
      res.status(403).json({ success: false, message: "No tienes permiso para esta acción" });
      return;
    }

    next();
  };
};