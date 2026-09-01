import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from "sequelize";
import { sequelize } from "../config/db.js";

/**
 * Modelo Sequelize que representa un usuario del sistema.
 * Cada usuario pertenece a un rol (Administrador o Gestor de Solicitudes).
 */
class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
  /** Identificador único UUID generado automáticamente. */
  declare id: CreationOptional<string>;

  /** Nombre de pila del usuario. */
  declare firstName: string;

  /** Apellido del usuario. */
  declare lastName: string;

  /** Correo electrónico único usado para autenticación. */
  declare email: string;

  /** Contraseña almacenada en formato hash bcrypt. */
  declare password: string;

  /** Número de teléfono de contacto (opcional). */
  declare phone: CreationOptional<string>;

  /** Fecha de nacimiento (opcional). */
  declare birthDate: CreationOptional<Date>;

  /** Indica si la cuenta está activa. Por defecto true. */
  declare isActive: CreationOptional<boolean>;

  /** FK hacia la tabla de roles. */
  declare roleId: CreationOptional<string>;
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "first_name",
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "last_name",
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
    },
    birthDate: {
      type: DataTypes.DATE,
      field: "birth_date",
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: "is_active",
    },
    roleId: {
      type: DataTypes.UUID,
      field: "role_id",
      references: {
        model: "roles",
        key: "id",
      },
    },
  },
  {
    sequelize,
    tableName: "user",
    timestamps: false,
  }
);

export default User;
