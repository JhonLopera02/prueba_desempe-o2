import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from "sequelize";
import { sequelize } from "../config/db.js";

/**
 * Modelo Sequelize que representa una solicitud de abastecimiento de medicamentos
 * realizada por una clínica a un almacén específico.
 *
 * El ciclo de vida de una solicitud sigue los estados:
 * pendiente → aprobada | rechazada → entregada | eliminada.
 */
class Solicitud extends Model<InferAttributes<Solicitud>, InferCreationAttributes<Solicitud>> {
  /** Identificador único UUID generado automáticamente. */
  declare id: CreationOptional<string>;

  /** Cantidad de unidades del medicamento solicitadas. Debe ser mayor a cero. */
  declare cantidad: number;

  /**
   * Estado actual de la solicitud.
   * Valores posibles: "pendiente" | "aprobada" | "rechazada" | "entregada" | "eliminada".
   * Las solicitudes con estado "eliminada" se consideran borradas lógicamente.
   */
  declare estado: CreationOptional<string>;

  /** FK hacia la clínica que realiza la solicitud. */
  declare clinicaId: string;

  /** FK hacia el medicamento solicitado. */
  declare medicamentoId: string;

  /** FK hacia el almacén que proveerá el medicamento. */
  declare almacenId: string;

  /** FK hacia el usuario (gestor o administrador) que registró la solicitud. */
  declare usuarioId: string;
}

Solicitud.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    cantidad: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1 },
    },
    estado: {
      type: DataTypes.ENUM("pendiente", "aprobada", "rechazada", "entregada", "eliminada"),
      allowNull: false,
      defaultValue: "pendiente",
    },
    clinicaId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "clinica_id",
      references: { model: "clinicas", key: "id" },
    },
    medicamentoId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "medicamento_id",
      references: { model: "medicamentos", key: "id" },
    },
    almacenId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "almacen_id",
      references: { model: "almacenes", key: "id" },
    },
    usuarioId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "usuario_id",
      references: { model: "user", key: "id" },
    },
  },
  {
    sequelize,
    tableName: "solicitudes",
    timestamps: true,
  }
);

export default Solicitud;