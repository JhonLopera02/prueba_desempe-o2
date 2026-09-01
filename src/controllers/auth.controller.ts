import { Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User, Role } from "../models/index.js";
import { AuthRequest } from "../middleware/auth.middleware.js";

const JWT_SECRET: string = process.env.JWT_SECRET || "";
const JWT_EXPIRES_IN = "8h";

/**
 * Controlador que autentica un usuario registrado y devuelve un token JWT.
 *
 * Valida el formato del correo y la longitud mínima de la contraseña antes
 * de consultar la base de datos. Compara la contraseña con el hash almacenado
 * y, si es válida, emite un token firmado con el id, email y roleId del usuario.
 *
 * @param req - Request con `body.email` y `body.password`.
 * @param res - Response con el token JWT y los datos del usuario (sin contraseña).
 * @returns 200 con el token si las credenciales son correctas.
 * @returns 400 si el correo o contraseña tienen formato inválido.
 * @returns 401 si la contraseña no coincide.
 * @returns 404 si no existe un usuario con el correo indicado.
 * @returns 500 en caso de error interno del servidor.
 */
export const login = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || typeof email !== "string") {
      res.status(400).json({ success: false, message: "El correo electrónico es requerido" });
      return;
    }

    if (!password || typeof password !== "string") {
      res.status(400).json({ success: false, message: "La contraseña es requerida" });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ success: false, message: "La contraseña debe tener mínimo 6 caracteres o más" });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ success: false, message: "El formato del correo electrónico no es válido" });
      return;
    }

    const user = await User.findOne({ where: { email }, include: [{ model: Role, as: "role" }] });

    if (!user) {
      res.status(404).json({ success: false, message: "Usuario no encontrado con el correo especificado" });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ success: false, message: "Contraseña incorrecta" });
      return;
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, roleId: user.roleId },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    const { password: _, ...userWithoutPassword } = user.toJSON();

    res.status(200).json({
      success: true,
      message: "Inicio de sesión exitoso",
      token,
      data: userWithoutPassword,
    });
  } catch (error) {
    console.error("Error en login controller:", error);
    res.status(500).json({ success: false, message: "Error interno del servidor" });
  }
};
