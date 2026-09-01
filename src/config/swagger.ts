import swaggerJSDoc from "swagger-jsdoc";

/**
 * Opciones de configuración para swagger-jsdoc.
 * Lee los comentarios @swagger de todos los archivos de rutas en src/routes/*.ts.
 */
const options: swaggerJSDoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "RiwiMediCare Plus API",
      version: "1.0.0",
      description:
        "REST API for managing medicine supply requests between clinics and warehouses for RiwiMediCare Plus.",
    },
    servers: [{ url: "http://localhost:3000/api", description: "Local server" }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        ErrorResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string", example: "Error message" },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
    tags: [
      { name: "Auth", description: "Registration and login" },
      { name: "Clínicas", description: "Clinic management" },
      { name: "Almacenes", description: "Warehouse management" },
      { name: "Medicamentos", description: "Medicine management" },
      { name: "Solicitudes", description: "Supply request lifecycle" },
      { name: "Seeder", description: "Bulk data loading from JSON files" },
    ],
  },
  apis: ["./src/routes/*.ts"],
};

/**
 * Especificación OpenAPI generada a partir de los comentarios JSDoc de las rutas.
 */
export const swaggerSpec = swaggerJSDoc(options);