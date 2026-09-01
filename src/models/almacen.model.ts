import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from "sequelize";
import { sequelize } from "../config/db.js";

/**
 * Modelo Sequelize que representa un almacén de distribución de medicamentos.
 * Cada almacén contiene un inventario de medicamentos disponibles.
 */
class Almacen extends Model<InferAttributes<Almacen>, InferCreationAttributes<Almacen>> {
  /** Identificador único UUID generado automáticamente. */
  declare id: CreationOptional<string>;

  /** Nombre descriptivo del almacén. */
  declare nombre: string;

  /** Ubicación física del almacén. */
  declare ubicacion: string;

  /**
   * Estado lógico del registro.
   * Valores posibles: "activo" | "eliminado".
   */
  declare estado: CreationOptional<string>;
}

Almacen.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    ubicacion: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    estado: {
      type: DataTypes.STRING,
      defaultValue: "activo",
    },
  },
  {
    sequelize,
    tableName: "almacenes",
    timestamps: true,
  }
);

export default Almacen;