import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { User, Role } from "../models/index.js";

/**
 * Controlador que registra un nuevo usuario en el sistema.
 *
 * El endpoint no requiere JWT, ya que el propio usuario indica el rol
 * con el que desea registrarse ("Administrador" o "Gestor de Solicitudes").
 * Solo se validan los datos enviados; no se aplica ningún control de autorización.
 *
 * @param req - Request con `body`: firstName, lastName, email, password, phone?, birthDate?, role.
 * @param res - Response con los datos del usuario creado (sin contraseña).
 * @returns 201 si el usuario fue registrado correctamente.
 * @returns 400 si faltan campos obligatorios, la contraseña es corta o el rol es inválido.
 * @returns 409 si el correo ya está registrado.
 * @returns 500 en caso de error interno del servidor.
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { firstName, lastName, email, password, phone, birthDate, role } = req.body;

    if (!firstName || !lastName || !email || !password || !role) {
      res.status(400).json({
        success: false,
        message: "firstName, lastName, email, password y role son obligatorios",
      });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({
        success: false,
        message: "La contraseña debe tener mínimo 6 caracteres",
      });
      return;
    }

    const ROLES_VALIDOS: string[] = ["Administrador", "Gestor de Solicitudes"];
    if (!ROLES_VALIDOS.includes(role)) {
      res.status(400).json({
        success: false,
        message: `role debe ser uno de: ${ROLES_VALIDOS.join(", ")}`,
      });
      return;
    }

    const rolEncontrado = await Role.findOne({ where: { name: role } });
    if (!rolEncontrado) {
      res.status(400).json({ success: false, message: "El rol indicado no existe" });
      return;
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      res.status(409).json({ success: false, message: "Ya existe un usuario con ese correo" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phone,
      birthDate,
      roleId: rolEncontrado.id,
    });

    const { password: _, ...userWithoutPassword } = newUser.toJSON();

    res.status(201).json({ success: true, message: "Usuario registrado exitosamente", data: userWithoutPassword });
  } catch (error: any) {
    console.error("Error en register:", error);
    res.status(500).json({ success: false, message: error.message || "Error interno del servidor" });
  }
};