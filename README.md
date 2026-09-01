# RiwiMediCare Plus API

##  Coder Information
- **Coder Name:** _[Jhon Michael Lopera Velasquez]_
- **Clan:** _[Centurion]_

##  Project Description

RiwiMediCare Plus is a medicine and medical supplies distribution company that needed a system to manage supply requests made by its different clinics and healthcare centers.

This project is a **REST API** built to replace the manual process (emails and spreadsheets) previously used to register requests — which caused information loss, inventory errors, approval delays, and poor traceability.

The API allows:
- Registering clinics and their responsible contacts.
- Managing the medicine inventory available in warehouses.
- Creating medicine supply requests.
- Assigning requests to a specific warehouse.
- Controlling the status of each request.
- Consulting the request history for each clinic.
- Seeding the database from uploaded JSON files (via an endpoint using Multer).

##  Technologies Used

- **Node.js** (v18 or higher)
- **TypeScript**
- **Express**
- **Sequelize** (ORM)
- **PostgreSQL**
- **JSON Web Token (JWT)** — authentication & route protection
- **bcrypt** — password hashing
- **Multer** — JSON file uploads for seeding
- **Docker & Docker Compose**
- **Swagger (swagger-jsdoc + swagger-ui-express)** — API documentation

##  Project Structure

```
src/
├── app.ts                  # Application entry point
├── config/
│   └── db.ts                # Sequelize/PostgreSQL connection
├── controllers/              # Business logic per resource
├── middleware/                # Auth, role-check, validation, upload
├── models/                    # Sequelize models and associations
├── routes/                    # Express routers
└── seeders/
    └── seed.ts                # Initial data seeder (roles, users, clinics, warehouses, medicines, inventory)
```

##  Installation Guide

### Prerequisites
- Node.js v18 or higher
- Docker & Docker Compose (recommended for the database)
- npm

### 1. Clone the repository

```bash
git clone https://github.com/JhonLopera02/base_prueba.git
cd base_prueba
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root based on `.env.example`:

```env
DATABASE_URL=postgres://postgres:123456@localhost:5432/clanes_db
PORT=3000
JWT_SECRET=your_super_secure_secret_key
```

> If you run the API through Docker Compose alongside PostgreSQL, use `postgres` (the service name) instead of `localhost` as the host in `DATABASE_URL`.

### 4. Start PostgreSQL with Docker

```bash
docker compose up -d postgres
```

### 5. Run the project

**Development mode** (auto-reload with `tsx`):

```bash
npm run dev
```

**Production mode:**

```bash
npm run build
npm start
```

The API will be available at: `http://localhost:3000`

### 6. Run the full stack with Docker Compose (API + PostgreSQL)

```bash
docker compose up -d --build
```

This will start:
- `riwimedicare-api` — the REST API (port `3000`)
- `postgres-centurion` — the PostgreSQL database (port `5432`)

both connected through an internal Docker network, with a named volume for data persistence.

##  Seeding the Database

### Automatic seeder (on server start)

Every time the server starts (`npm run dev` or `npm start`), an automatic seeder runs and populates, if they don't already exist:
- **Roles:** `Administrador`, `Gestor de Solicitudes`
- **Test users:**
  | Email | Password | Role |
  |---|---|---|
  | admin@test.com | 123456 | Administrador |
  | gestor@test.com | 123456 | Gestor de Solicitudes |
- **Clinics**, **warehouses**, **medicines**, and initial **inventory** stock.

### Manual seeder (CLI)

You can re-run the seeder manually at any time:

```bash
npm run seed
```

### JSON file seeder endpoint (Multer)

The API also exposes an endpoint to upload JSON files and bulk-load data into a specific entity — useful for loading custom test data:

```
POST /api/seeder/upload
Content-Type: multipart/form-data

Form fields:
  - archivo: <your_file.json>   (file, required)
  - entidad: "clinicas" | "almacenes" | "medicamentos" | "inventarios"
```

The `seed-data/` folder contains ready-to-use JSON example files:

| File | Entity |
|---|---|
| `seed-data/clinicas.json` | clinicas |
| `seed-data/almacenes.json` | almacenes |
| `seed-data/medicamentos.json` | medicamentos |

Example with `curl` using the included files:

```bash
curl -X POST http://localhost:3000/api/seeder/upload \
  -F "archivo=@./seed-data/clinicas.json" \
  -F "entidad=clinicas"

curl -X POST http://localhost:3000/api/seeder/upload \
  -F "archivo=@./seed-data/almacenes.json" \
  -F "entidad=almacenes"

curl -X POST http://localhost:3000/api/seeder/upload \
  -F "archivo=@./seed-data/medicamentos.json" \
  -F "entidad=medicamentos"
```

The uploaded JSON file must be an array of objects matching the target entity's fields.


##  Authentication

### Register a user

```
POST /api/auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@test.com",
  "password": "123456",
  "phone": "3001234567",
  "role": "Administrador"
}
```

> `role` must be either `"Administrador"` or `"Gestor de Solicitudes"`. This endpoint has no JWT restriction, as required by the assignment — it only validates the submitted data.

### Login

```
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@test.com",
  "password": "123456"
}
```

Response includes a JWT `token` to be sent in subsequent requests:

```
Authorization: Bearer <token>
```

All routes except `/api/auth/register` and `/api/auth/login` require this header.

##  Roles & Permissions

| Role | Permissions |
|---|---|
| **Administrador** | Full CRUD on Clinics, Warehouses, Medicines and Requests. Can use every endpoint. |
| **Gestor de Solicitudes** | Can create supply requests and update their status. Can consult active requests and clinic history. |
| Both (any authenticated user) | Can consult active requests and request history per clinic. |

Logical deletion is used everywhere (`estado: "eliminado"` / `"eliminada"`) instead of physically removing records.

##  API Documentation (Swagger)

Once the server is running, interactive documentation is available at:

```
http://localhost:3000/api-docs
```

##  Running Tests

```bash
npm test -- --coverage
```

Unit tests cover critical functionality such as request creation, status updates and clinic lookups.

##  Git Workflow

This project follows **Gitflow** with **Conventional Commits**:

- `main` — production-ready code.
- `develop` — integration branch.
- `feature/*` — one branch per feature, merged into `develop`.

Commit examples: `feat: add request status update endpoint`, `fix: correct role name mismatch`, `docs: update README`.

##  Repository

[https://github.com/JhonLopera02/base_prueba.git](https://github.com/JhonLopera02/base_prueba.git)
