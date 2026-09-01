import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from "sequelize";
import { sequelize } from "../config/db.js";

/**
 * Modelo Sequelize que representa un rol de usuario en el sistema.
 * Los roles posibles son: "Administrador" y "Gestor de Solicitudes".
 */
class Role extends Model<InferAttributes<Role>, InferCreationAttributes<Role>> {
  /** Identificador único UUID generado automáticamente. */
  declare id: CreationOptional<string>;

  /** Nombre del rol (p. ej. "Administrador" o "Gestor de Solicitudes"). */
  declare name: string;
}

Role.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "roles",
    timestamps: false,
  }
);

export default Role;
