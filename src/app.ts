import 'reflect-metadata';
import express, { Application } from 'express';
import 'dotenv/config';
import swaggerUi from 'swagger-ui-express';
import { ConnectDB } from './config/db.js';
import routes from './routes/index.js';
import { swaggerSpec } from './config/swagger.js';

const { PORT } = process.env;

/**
 * Instancia principal de la aplicación Express para la API RiwiMediCare Plus.
 */
const app: Application = express();

app.use(express.json());

app.use('/api', routes);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * Ruta raíz de health-check. Confirma que la API está en ejecución.
 *
 * @returns JSON con un mensaje de estado.
 */
app.get('/', (req, res) => {
  res.json({ message: 'API RiwiMediCare Plus funcionando 🚀' });
});

/**
 * Inicia el servidor HTTP en el puerto indicado en la variable de entorno PORT.
 * Tras arrancar, establece la conexión con la base de datos y ejecuta el seeder.
 */
app.listen(PORT, async () => {
  await ConnectDB();
  console.log(`Servidor corriendo en el puerto ${PORT}`);
  console.log(`Swagger docs disponibles en http://localhost:${PORT}/api-docs`);
});