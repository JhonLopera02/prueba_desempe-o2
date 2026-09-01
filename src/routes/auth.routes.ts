import { Router } from "express";
import { register } from "../controllers/user.controller.js";
import { login } from "../controllers/auth.controller.js";

/**
 * Router de autenticación. Todos los endpoints de este módulo
 * son públicos y no requieren token JWT.
 */
const router = Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registrar un nuevo usuario (sin JWT)
 *     description: >
 *       Crea un usuario con el rol indicado. No requiere autenticación.
 *       El campo `role` debe ser exactamente "Administrador" o "Gestor de Solicitudes".
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [firstName, lastName, email, password, role]
 *             properties:
 *               firstName: { type: string, example: "John" }
 *               lastName: { type: string, example: "Doe" }
 *               email: { type: string, example: "john.doe@test.com" }
 *               password: { type: string, example: "123456" }
 *               phone: { type: string, example: "3001234567" }
 *               birthDate: { type: string, format: date, example: "1995-05-10" }
 *               role:
 *                 type: string
 *                 enum: [Administrador, "Gestor de Solicitudes"]
 *                 example: "Administrador"
 *           example:
 *             firstName: "John"
 *             lastName: "Doe"
 *             email: "john.doe@test.com"
 *             password: "123456"
 *             phone: "3001234567"
 *             role: "Administrador"
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Usuario registrado exitosamente"
 *               data:
 *                 id: "uuid-generado"
 *                 firstName: "John"
 *                 lastName: "Doe"
 *                 email: "john.doe@test.com"
 *       400:
 *         description: Datos faltantes, contraseña corta o rol inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: El correo ya está registrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/register", register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Iniciar sesión y obtener un token JWT
 *     description: >
 *       Valida las credenciales del usuario y devuelve un token JWT firmado.
 *       El token debe enviarse en las peticiones protegidas usando el header
 *       `Authorization: Bearer <token>`.
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, example: "admin@test.com" }
 *               password: { type: string, example: "123456" }
 *           example:
 *             email: "admin@test.com"
 *             password: "123456"
 *     responses:
 *       200:
 *         description: Inicio de sesión exitoso, retorna token JWT
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Inicio de sesión exitoso"
 *               token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *               data:
 *                 id: "uuid"
 *                 email: "admin@test.com"
 *       400:
 *         description: Formato de correo o contraseña inválido
 *       401:
 *         description: Contraseña incorrecta
 *       404:
 *         description: Usuario no encontrado
 */
router.post("/login", login);

export default router;