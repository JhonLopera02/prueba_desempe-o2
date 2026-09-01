import bcrypt from "bcrypt";
import { Role, User, Clinica, Almacen, Medicamento, Inventario, syncDatabase } from "../models/index.js";
import { sequelize } from "../config/db.js";

/** Roles disponibles en el sistema. */
export const DEFAULT_ROLES = [
  { name: "Administrador" },
  { name: "Gestor de Solicitudes" },
];

/**
 * Pobla la base de datos con datos iniciales de prueba si aún no existen.
 *
 * Crea en orden:
 * 1. Roles: "Administrador" y "Gestor de Solicitudes".
 * 2. Usuarios de prueba con contraseña "123456" (hasheada).
 * 3. Dos clínicas de ejemplo.
 * 4. Dos almacenes de ejemplo.
 * 5. Tres medicamentos de ejemplo.
 * 6. Inventario inicial de 100 unidades por cada par almacén-medicamento.
 *
 * Usa `findOrCreate` para garantizar idempotencia: ejecutar el seeder
 * múltiples veces no genera duplicados.
 *
 * @returns {Promise<void>} Resuelve cuando todos los datos han sido insertados.
 * @throws Relanza el error si alguna operación de base de datos falla.
 */
export const seedDatabase = async (): Promise<void> => {
  try {
    console.log("iniciando seeder de datos base...");

    const createdRoles: Record<string, string> = {};
    for (const roleData of DEFAULT_ROLES) {
      const [role] = await Role.findOrCreate({ where: { name: roleData.name }, defaults: roleData });
      createdRoles[role.name] = role.id;
    }

    const defaultPassword = await bcrypt.hash("123456", 12);
    const testUsers = [
      { firstName: "Admin", lastName: "Sistema", email: "admin@test.com", password: defaultPassword, roleId: createdRoles["Administrador"] },
      { firstName: "Gestor", lastName: "Solicitudes", email: "gestor@test.com", password: defaultPassword, roleId: createdRoles["Gestor de Solicitudes"] },
    ];
    for (const userData of testUsers) {
      await User.findOrCreate({ where: { email: userData.email }, defaults: userData });
    }

    const clinicasData = [
      { nombre: "Clínica Norte", nit: "900123456-1", direccion: "Cra 45 #10-20", telefono: "3001234567" },
      { nombre: "Clínica Sur", nit: "900123457-2", direccion: "Calle 8 #5-30", telefono: "3007654321" },
    ];
    const clinicas = [];
    for (const c of clinicasData) {
      const [clinica] = await Clinica.findOrCreate({ where: { nit: c.nit }, defaults: c });
      clinicas.push(clinica);
    }

    const almacenesData = [
      { nombre: "Almacén Central", ubicacion: "Zona Industrial" },
      { nombre: "Almacén Norte", ubicacion: "Barrio La Paz" },
    ];
    const almacenes = [];
    for (const a of almacenesData) {
      const [almacen] = await Almacen.findOrCreate({ where: { nombre: a.nombre }, defaults: a });
      almacenes.push(almacen);
    }

    const medicamentosData = [
      { nombre: "Acetaminofén 500mg", descripcion: "Analgésico", stockMinimo: 50 },
      { nombre: "Amoxicilina 250mg", descripcion: "Antibiótico", stockMinimo: 30 },
      { nombre: "Ibuprofeno 400mg", descripcion: "Antiinflamatorio", stockMinimo: 40 },
    ];
    const medicamentos = [];
    for (const m of medicamentosData) {
      const [medicamento] = await Medicamento.findOrCreate({ where: { nombre: m.nombre }, defaults: m });
      medicamentos.push(medicamento);
    }

    for (const almacen of almacenes) {
      for (const medicamento of medicamentos) {
        await Inventario.findOrCreate({
          where: { almacenId: almacen.id, medicamentoId: medicamento.id },
          defaults: { almacenId: almacen.id, medicamentoId: medicamento.id, cantidad: 100 },
        });
      }
    }

    console.log("Seeder completado exitosamente.");
  } catch (error) {
    console.error("Error en el seeder de base de datos:", error);
    throw error;
  }
};
import "dotenv/config";
import url from "url";
import path from "path";

const isMain = process.argv[1] && import.meta.url === url.pathToFileURL(path.resolve(process.argv[1])).href;

if (isMain) {
  (async () => {
    try {
      await sequelize.authenticate();
      await syncDatabase();
      await seedDatabase();
      process.exit(0);
    } catch (err) {
      console.error(err);
      process.exit(1);
    }
  })();
}