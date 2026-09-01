import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from "sequelize";
import { sequelize } from "../config/db.js";

/**
 * Modelo Sequelize que representa el stock de un medicamento específico
 * dentro de un almacén determinado.
 * Actúa como tabla intermedia entre Almacen y Medicamento con cantidad disponible.
 */
class Inventario extends Model<InferAttributes<Inventario>, InferCreationAttributes<Inventario>> {
  /** Identificador único UUID generado automáticamente. */
  declare id: CreationOptional<string>;

  /** Cantidad de unidades disponibles del medicamento en el almacén. */
  declare cantidad: number;

  /** FK hacia el almacén que contiene el medicamento. */
  declare almacenId: string;

  /** FK hacia el medicamento cuyo stock se registra. */
  declare medicamentoId: string;
}

Inventario.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    cantidad: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    almacenId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "almacen_id",
      references: {
        model: "almacenes",
        key: "id",
      },
    },
    medicamentoId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "medicamento_id",
      references: {
        model: "medicamentos",
        key: "id",
      },
    },
  },
  {
    sequelize,
    tableName: "inventarios",
    timestamps: true,
  }
);

export default Inventario;