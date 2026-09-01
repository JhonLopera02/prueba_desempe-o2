import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from "sequelize";
import { sequelize } from "../config/db.js";

/**
 * Modelo Sequelize que representa una clínica o centro de atención médica
 * que realiza solicitudes de abastecimiento de medicamentos.
 */
class Clinica extends Model<InferAttributes<Clinica>, InferCreationAttributes<Clinica>> {
    /** Identificador único UUID generado automáticamente. */
    declare id: CreationOptional<string>;

    /** Nombre comercial de la clínica. */
    declare nombre: string;

    /** NIT (Número de Identificación Tributaria) único de la clínica. */
    declare nit: string;

    /** Dirección física de la clínica. */
    declare direccion: string;

    /** Número de teléfono de contacto (opcional). */
    declare telefono: CreationOptional<string>;

    /**
     * Estado lógico del registro.
     * Valores posibles: "activo" | "eliminado".
     * El borrado físico no se realiza; solo se cambia el estado.
     */
    declare estado: CreationOptional<string>;
}

Clinica.init(
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
        nit: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        direccion: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        telefono: {
            type: DataTypes.STRING,
        },
        estado: {
            type: DataTypes.STRING,
            defaultValue: "activo",
        },
    },
    {
        sequelize,
        tableName: "clinicas",
        timestamps: true,
    }
);

export default Clinica;