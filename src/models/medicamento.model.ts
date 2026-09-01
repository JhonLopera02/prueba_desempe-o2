import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from "sequelize";
import { sequelize } from "../config/db.js";

/**
 * Modelo Sequelize que representa un medicamento o insumo médico disponible
 * en el sistema de distribución de RiwiMediCare Plus.
 */
class Medicamento extends Model<InferAttributes<Medicamento>, InferCreationAttributes<Medicamento>> {
  /** Identificador único UUID generado automáticamente. */
  declare id: CreationOptional<string>;

  /** Nombre del medicamento (p. ej. "Acetaminofén 500mg"). */
  declare nombre: string;

  /** Descripción o categoría terapéutica del medicamento (opcional). */
  declare descripcion: CreationOptional<string>;

  /** Cantidad mínima de stock que debe mantenerse en inventario. */
  declare stockMinimo: CreationOptional<number>;

  /**
   * Estado lógico del registro.
   * Valores posibles: "activo" | "eliminado".
   */
  declare estado: CreationOptional<string>;
}

Medicamento.init(
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
    descripcion: {
      type: DataTypes.STRING,
    },
    stockMinimo: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: "stock_minimo",
    },
    estado: {
      type: DataTypes.STRING,
      defaultValue: "activo",
    },
  },
  {
    sequelize,
    tableName: "medicamentos",
    timestamps: true,
  }
);

export default Medicamento;