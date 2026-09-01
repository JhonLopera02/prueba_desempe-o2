import Role from "./role.model.js";
import User from "./user.model.js";
import Clinica from "./clinica.model.js";
import Almacen from "./almacen.model.js";
import Medicamento from "./medicamento.model.js";
import Inventario from "./inventario.model.js";
import Solicitud from "./solicitud.model.js";

/**
 * Define las asociaciones entre los modelos Sequelize.
 *
 * Nivel 1 (sin dependencias externas):
 *   Role, Clinica, Almacen, Medicamento
 *
 * Nivel 2 (depende de nivel 1):
 *   User (→ Role), Inventario (→ Almacen, Medicamento)
 *
 * Nivel 3 (depende de niveles 1 y 2):
 *   Solicitud (→ Clinica, Medicamento, Almacen, User)
 */

Role.hasMany(User, { foreignKey: "roleId", as: "users" });
User.belongsTo(Role, { foreignKey: "roleId", as: "role" });

Almacen.hasMany(Inventario, { foreignKey: "almacenId", as: "inventarios" });
Inventario.belongsTo(Almacen, { foreignKey: "almacenId", as: "almacen" });

Medicamento.hasMany(Inventario, { foreignKey: "medicamentoId", as: "inventarios" });
Inventario.belongsTo(Medicamento, { foreignKey: "medicamentoId", as: "medicamento" });

Clinica.hasMany(Solicitud, { foreignKey: "clinicaId", as: "solicitudes" });
Solicitud.belongsTo(Clinica, { foreignKey: "clinicaId", as: "clinica" });

Medicamento.hasMany(Solicitud, { foreignKey: "medicamentoId", as: "solicitudes" });
Solicitud.belongsTo(Medicamento, { foreignKey: "medicamentoId", as: "medicamento" });

Almacen.hasMany(Solicitud, { foreignKey: "almacenId", as: "solicitudes" });
Solicitud.belongsTo(Almacen, { foreignKey: "almacenId", as: "almacen" });

User.hasMany(Solicitud, { foreignKey: "usuarioId", as: "solicitudes" });
Solicitud.belongsTo(User, { foreignKey: "usuarioId", as: "usuario" });

/**
 * Sincroniza las tablas con la base de datos respetando el orden de dependencias
 * para evitar errores de FK.
 *
 * @returns {Promise<void>} Resuelve cuando todas las tablas están sincronizadas.
 * @throws Relanza el error si la sincronización falla.
 */
export async function syncDatabase(): Promise<void> {
  try {
    await Role.sync();
    await Clinica.sync();
    await Almacen.sync();
    await Medicamento.sync();

    await User.sync();
    await Inventario.sync();

    await Solicitud.sync();

    console.log("Tablas sincronizadas en orden de dependencia");
  } catch (error) {
    console.error("Error al sincronizar:", error);
    throw error;
  }
}

export { Role, User, Clinica, Almacen, Medicamento, Inventario, Solicitud };