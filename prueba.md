# Plan de ejecución — RiwiMediCare Plus (Módulo 5.2 Node.js)

> Excluye explícitamente: **Pruebas Unitarias con Jest** y **Documentación Swagger** (no forman parte de este plan).
> Base: este repo (`base_prueba-main`) ya trae Express + TS + Sequelize + JWT + patrón RBAC reutilizable (`crud.factory.ts`, `crud.routes.ts`, `auth.middleware.ts`). La idea es **reutilizar ese esqueleto** y reemplazar las entidades de ejemplo (Clan, City, Campus, Room, Schedule, TypeRoute, Identification, AddressUser, TypeIdentification) por el dominio real: Clínicas, Almacenes, Medicamentos, Inventario y Solicitudes.

---

## 0. Preparación (Git primero)

1. `git init` (o clona tu fork) → crea rama `develop` desde `main`.
2. Para cada bloque de trabajo abre `feature/<nombre>` desde `develop` (ej. `feature/auth-roles`, `feature/clinicas`, `feature/solicitudes`, `feature/seeder-multer`).
3. Commits en Conventional Commits desde el primer commit: `feat:`, `fix:`, `docs:`, `chore:`, `refactor:`.

---

## 1. Diseñar el esquema por niveles de dependencia

| Nivel | Entidad | FK |
|---|---|---|
| 1 | `Role`, `Clinica`, `Almacen`, `Medicamento` | ninguna |
| 2 | `User` (roleId), `Inventario` (almacenId, medicamentoId) | Nivel 1 |
| 3 | `Solicitud` (clinicaId, medicamentoId, almacenId, usuarioId) | Nivel 1-2 |

Este orden se usa en `syncDatabase()` y guía el orden en que creas los modelos.

---

## 2. Limpiar el proyecto base (quitar ejemplos que no aplican)

Elimina (o deja fuera del `app.ts`/`models/index.ts`) todo lo que pertenece al dominio de ejemplo "clanes":

- `src/models/models.ciudad.ts`, `models.campus.ts`, `models.room.ts`, `models.schedule.ts`, `models.typeRoute.ts`, `models.identification.ts`, `models.TypeIdentification.ts`, `models.addressUser.ts`, `models.clan.ts`, `models.coderClan.ts`
- Sus rutas equivalentes en `src/routes/*.routes.ts`
- Sus `import`/`app.use` en `src/app.ts`
- Simplifica `models.user.ts`: quita `identificationId` y `addressUserId` (no aplican aquí).

Conserva y reutiliza tal cual: `crud.factory.ts`, `crud.routes.ts`, `auth.middleware.ts`, `auth.controller.ts`, `db.ts`, patrón de `user.controller.ts` (register/getMe) y `seed.ts`.

---

## 3. Variables de entorno y Docker

- `.env`:
  ```
  DATABASE_URL=postgres://postgres:123456@localhost:5432/riwimedicare_db
  PORT=3000
  JWT_SECRET=una_clave_larga_y_aleatoria
  ```
- En `docker-compose.yml` cambia `POSTGRES_DB` a `riwimedicare_db`.
- `docker compose up -d` y verifica con `docker ps`.

---

## 4. Roles y autenticación (ajustar lo existente)

En `src/middleware/auth.middleware.ts` cambia el objeto `ROLES`:

```ts
export const ROLES = {
  ADMIN: "Administrador",
  GESTOR: "Gestor de Solicitudes",
} as const;
```

- `login` (`auth.controller.ts`) se reutiliza sin cambios.
- `register` (`user.controller.ts`) se reutiliza: el enunciado pide que sea un endpoint **sin restricción** que solo valide los datos y permita elegir el rol (Administrador o Gestor de Solicitudes) — es justo lo que ya hace este controller, solo ajusta el rol por defecto si no envían `roleId`.

---

## 5. Modelos nuevos

`src/models/models.clinica.ts`
```ts
class Clinica extends Model<InferAttributes<Clinica>, InferCreationAttributes<Clinica>> {
  declare id: CreationOptional<string>;
  declare nombre: string;
  declare nit: string;              // unique
  declare responsable: string;
  declare telefono: string;
  declare estado: CreationOptional<"ACTIVO" | "ELIMINADO">; // borrado lógico
}
// nit: { type: DataTypes.STRING, allowNull: false, unique: true }
// estado: { type: DataTypes.ENUM("ACTIVO","ELIMINADO"), defaultValue: "ACTIVO" }
```

`src/models/models.almacen.ts` → `nombre`, `ubicacion`, `estado` (ACTIVO/ELIMINADO).

`src/models/models.medicamento.ts` → `nombre`, `descripcion`, `unidadMedida`, `estado` (ACTIVO/ELIMINADO).

`src/models/models.inventario.ts` (tabla intermedia Almacén–Medicamento) → `almacenId`, `medicamentoId`, `cantidadDisponible` (integer, default 0).

`src/models/models.solicitud.ts` →
```ts
declare clinicaId: string;
declare medicamentoId: string;
declare almacenId: string;
declare usuarioId: string;          // quién la creó (Gestor)
declare cantidadSolicitada: number;
declare estado: CreationOptional<"PENDIENTE"|"APROBADA"|"RECHAZADA"|"ENTREGADA"|"CANCELADA">;
declare eliminado: CreationOptional<boolean>; // borrado lógico, independiente del estado de negocio
```

---

## 6. Asociaciones y sync (`src/models/index.ts`)

```ts
Role.hasMany(User, { foreignKey: "roleId", as: "users" });
User.belongsTo(Role, { foreignKey: "roleId", as: "role" });

Almacen.belongsToMany(Medicamento, { through: Inventario, foreignKey: "almacenId", otherKey: "medicamentoId", as: "medicamentos" });
Medicamento.belongsToMany(Almacen, { through: Inventario, foreignKey: "medicamentoId", otherKey: "almacenId", as: "almacenes" });
Inventario.belongsTo(Almacen, { foreignKey: "almacenId", as: "almacen" });
Inventario.belongsTo(Medicamento, { foreignKey: "medicamentoId", as: "medicamento" });

Clinica.hasMany(Solicitud, { foreignKey: "clinicaId", as: "solicitudes" });
Solicitud.belongsTo(Clinica, { foreignKey: "clinicaId", as: "clinica" });
Medicamento.hasMany(Solicitud, { foreignKey: "medicamentoId", as: "solicitudes" });
Solicitud.belongsTo(Medicamento, { foreignKey: "medicamentoId", as: "medicamento" });
Almacen.hasMany(Solicitud, { foreignKey: "almacenId", as: "solicitudes" });
Solicitud.belongsTo(Almacen, { foreignKey: "almacenId", as: "almacen" });
User.hasMany(Solicitud, { foreignKey: "usuarioId", as: "solicitudes" });
Solicitud.belongsTo(User, { foreignKey: "usuarioId", as: "usuario" });
```

`syncDatabase()` en el mismo orden de niveles (sección 1) y exporta todos los modelos nuevos.

---

## 7. Middlewares de validación (nuevos, siguiendo el patrón de `auth.middleware.ts`)

`src/middleware/clinica.middleware.ts`
- `validarNitUnico`: antes de crear/actualizar, `Clinica.findOne({ where: { nit } })` → si existe (y no es el mismo id en update) → 409.

`src/middleware/solicitud.middleware.ts`
- `validarCantidadPositiva`: `cantidadSolicitada <= 0` → 400.
- `validarExistenciaClinicaYMedicamento`: verifica que `clinicaId` y `medicamentoId` existan y estén `ACTIVO`.
- `validarInventarioSuficiente`: busca `Inventario` por `almacenId`+`medicamentoId`; si `cantidadDisponible < cantidadSolicitada` → 400.
- `validarEstadoPermitido`: en el update de estado, el nuevo valor debe pertenecer al enum válido (`PENDIENTE|APROBADA|RECHAZADA|ENTREGADA|CANCELADA`) → si no, 400.

---

## 8. Controladores y rutas por entidad

**Clínicas** (`clinica.controller.ts` + `clinica.routes.ts`)
- Reusa `crudController(Clinica, "Clínica")` de `crud.factory.ts` para `getAll`/`getById`.
- Para `create`/`update` usa un controller propio que aplique `validarNitUnico` antes de llamar al modelo.
- `remove` → en vez de `.destroy()`, hacer `update({ estado: "ELIMINADO" })` (borrado lógico).
- Rutas: `GET/GET :id` → todos autenticados; `POST/PUT/DELETE` → solo `Administrador`.

**Almacenes** y **Medicamentos**: mismo patrón que Clínicas (puedes usar `crudRoutes()` directo si no necesitas validación extra, salvo el `remove` lógico — puedes sobreescribir solo esa función).

**Inventario** (`inventario.controller.ts` + `inventario.routes.ts`)
- `POST /api/inventario` → asigna/actualiza cantidad de un medicamento en un almacén (upsert). Solo `Administrador`.
- `GET /api/inventario` → consulta stock por almacén. Todos autenticados.

**Solicitudes** (`solicitud.controller.ts` + `solicitud.routes.ts`)
- `POST /api/solicitudes` → rol `Administrador` o `Gestor de Solicitudes`. Pasa por: `validarCantidadPositiva` → `validarExistenciaClinicaYMedicamento` → `validarInventarioSuficiente`. Al crear: `estado = "PENDIENTE"`, descuenta `cantidadDisponible` del `Inventario` correspondiente.
- `PUT /api/solicitudes/:id/estado` → `validarEstadoPermitido`. Roles: `Administrador`, `Gestor de Solicitudes`.
- `GET /api/solicitudes` → solicitudes activas (`eliminado = false`). Todos autenticados.
- `GET /api/solicitudes/historial/:clinicaId` → historial completo por clínica. Todos autenticados.
- `DELETE /api/solicitudes/:id` → borrado lógico (`eliminado = true`). Solo `Administrador`.

---

## 9. Seeders

**Seeder inicial (arranque del server)** — extiende `src/seeders/seed.ts` con el patrón `findOrCreate` que ya usa el archivo:
- Roles: `Administrador`, `Gestor de Solicitudes`.
- Usuario admin de prueba.
- 2-3 Clínicas, 2 Almacenes, varios Medicamentos, e Inventario inicial con stock.

**Seeder por archivo JSON (requisito obligatorio del enunciado)**
`src/middleware/upload.middleware.ts` con `multer` (memoryStorage, filtro `application/json`).

`src/controllers/seeder.controller.ts`:
```ts
export const cargarSeed = async (req: Request, res: Response) => {
  const { entidad } = req.body; // "clinicas" | "almacenes" | "medicamentos" | "usuarios"
  const data = JSON.parse(req.file!.buffer.toString("utf-8"));
  const modelo = { clinicas: Clinica, almacenes: Almacen, medicamentos: Medicamento, usuarios: User }[entidad];
  const creados = await modelo.bulkCreate(data, { ignoreDuplicates: true });
  res.status(201).json({ success: true, message: `${creados.length} registros cargados`, data: creados });
};
```

`src/routes/seeder.routes.ts`:
```ts
router.post("/upload", verifyToken, checkRole(["Administrador"]), upload.single("file"), cargarSeed);
```
Monta en `app.ts` como `app.use("/api/seeders", seederRoutes)`.

---

## 10. Registrar todo en `src/app.ts`

Reemplaza los `import`/`app.use` de las entidades de ejemplo por:
```ts
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/clinicas', clinicaRoutes);
app.use('/api/almacenes', almacenRoutes);
app.use('/api/medicamentos', medicamentoRoutes);
app.use('/api/inventario', inventarioRoutes);
app.use('/api/solicitudes', solicitudRoutes);
app.use('/api/seeders', seederRoutes);
```

---

## 11. Clean Code (checklist obligatorio del enunciado)

- Separar responsabilidades: controller ≠ middleware de validación ≠ modelo.
- Tipar todo (interfaces para `req.body` de create/update de cada entidad).
- Nombres descriptivos (`validarInventarioSuficiente`, no `check1`).
- Sin código comentado antes de entregar.
- JSDoc en cada función de controller/middleware (requisito de documentación de entrega).

---

## 12. README.md (reemplazar el actual)

Debe incluir: Nombre del Coder, Clan, tecnologías usadas, instructivo de instalación, ejemplo de `.env`, cómo ejecutar (`npm run dev`), cómo correr el seeder (`npm run seed` y ejemplo de `POST /api/seeders/upload`), y URL del repo público en GitHub.

---

## 13. Entrega

1. `pg_dump` de la base para el backup `.sql`.
2. Comprimir el proyecto en `.zip` **sin `node_modules`**.
3. Verificar que el repo esté en GitHub, público, con ramas `main`/`develop`/`feature/*` y commits convencionales.
4. Subir a Moodle antes del horario de cierre (AM 12:59 p.m. / PM 8:59 p.m.).

---

## Fuera de alcance de este plan (por pedido explícito)

- Puntos extra de **Jest** (pruebas unitarias / cobertura).
- Puntos extra de **Swagger** (documentación de endpoints).
- Docker/Docker Compose avanzado y despliegue quedan igual que el `docker-compose.yml` base; si luego quieres sumarlos como puntos extra, se agregan aparte.
