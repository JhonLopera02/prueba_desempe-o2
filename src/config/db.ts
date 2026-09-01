import { Sequelize } from "sequelize";

/**
 * Instancia principal de Sequelize configurada con la URL de conexión
 * especificada en la variable de entorno DATABASE_URL.
 */
export const sequelize = new Sequelize(
    process.env.DATABASE_URL as string,
    {
        dialect: "postgres",
        logging: false,
    }
);

/**
 * Establece la conexión con PostgreSQL, sincroniza los modelos
 * y ejecuta el seeder de datos base.
 *
 * @returns {Promise<void>} Resuelve cuando la conexión y sincronización son exitosas.
 * @throws Termina el proceso con código 1 si la conexión falla.
 */
export const ConnectDB = async (): Promise<void> => {
    try {
        await sequelize.authenticate();
        console.log("PostgreSQL conectado");

        const { syncDatabase } = await import("../models/index.js");
        await syncDatabase();

        const { seedDatabase } = await import("../seeders/seed.js");
        await seedDatabase();
    } catch (err) {
        console.error("Error conectando a PostgreSQL:", err);
        process.exit(1);
    }
};