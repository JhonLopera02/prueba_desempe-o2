--
-- PostgreSQL database dump
--

\restrict bfcEkftDktFvb2lBwLxhcKLfUTWjKbOX4SNSnky2gRMW32paNmp8WmZ7XHc15kz

-- Dumped from database version 16.15 (Debian 16.15-1.pgdg13+2)
-- Dumped by pg_dump version 16.15 (Debian 16.15-1.pgdg13+2)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: enum_solicitudes_estado; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_solicitudes_estado AS ENUM (
    'pendiente',
    'aprobada',
    'rechazada',
    'entregada',
    'eliminada'
);


ALTER TYPE public.enum_solicitudes_estado OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: almacenes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.almacenes (
    id uuid NOT NULL,
    nombre character varying(255) NOT NULL,
    ubicacion character varying(255) NOT NULL,
    estado character varying(255) DEFAULT 'activo'::character varying,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.almacenes OWNER TO postgres;

--
-- Name: clinicas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.clinicas (
    id uuid NOT NULL,
    nombre character varying(255) NOT NULL,
    nit character varying(255) NOT NULL,
    direccion character varying(255) NOT NULL,
    telefono character varying(255),
    estado character varying(255) DEFAULT 'activo'::character varying,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.clinicas OWNER TO postgres;

--
-- Name: inventarios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.inventarios (
    id uuid NOT NULL,
    cantidad integer DEFAULT 0 NOT NULL,
    almacen_id uuid NOT NULL,
    medicamento_id uuid NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.inventarios OWNER TO postgres;

--
-- Name: medicamentos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.medicamentos (
    id uuid NOT NULL,
    nombre character varying(255) NOT NULL,
    descripcion character varying(255),
    stock_minimo integer DEFAULT 0,
    estado character varying(255) DEFAULT 'activo'::character varying,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.medicamentos OWNER TO postgres;

--
-- Name: roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roles (
    id uuid NOT NULL,
    name character varying(255) NOT NULL
);


ALTER TABLE public.roles OWNER TO postgres;

--
-- Name: solicitudes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.solicitudes (
    id uuid NOT NULL,
    cantidad integer NOT NULL,
    estado public.enum_solicitudes_estado DEFAULT 'pendiente'::public.enum_solicitudes_estado NOT NULL,
    clinica_id uuid NOT NULL,
    medicamento_id uuid NOT NULL,
    almacen_id uuid NOT NULL,
    usuario_id uuid NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.solicitudes OWNER TO postgres;

--
-- Name: user; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."user" (
    id uuid NOT NULL,
    first_name character varying(255) NOT NULL,
    last_name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    phone character varying(255),
    birth_date timestamp with time zone,
    is_active boolean DEFAULT true,
    role_id uuid
);


ALTER TABLE public."user" OWNER TO postgres;

--
-- Data for Name: almacenes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.almacenes (id, nombre, ubicacion, estado, "createdAt", "updatedAt") FROM stdin;
d20c6e6a-4573-4e8d-8f36-cf6632ffa0ae	Almacén Central	Zona Industrial	activo	2026-09-01 00:17:04.974+00	2026-09-01 00:17:04.974+00
90fd6200-2d51-4add-b24c-41639f8302d4	Almacén Norte	Barrio La Paz	activo	2026-09-01 00:17:04.976+00	2026-09-01 00:17:04.976+00
\.


--
-- Data for Name: clinicas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.clinicas (id, nombre, nit, direccion, telefono, estado, "createdAt", "updatedAt") FROM stdin;
d3071f24-2564-45e8-810f-8dcbaa567aaf	Clínica Norte	900123456-1	Cra 45 #10-20	3001234567	activo	2026-09-01 00:17:04.969+00	2026-09-01 00:17:04.969+00
f820cf5e-559f-42ec-82d5-07b61efd639d	Clínica Sur	900123457-2	Calle 8 #5-30	3007654321	activo	2026-09-01 00:17:04.972+00	2026-09-01 00:17:04.972+00
\.


--
-- Data for Name: inventarios; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.inventarios (id, cantidad, almacen_id, medicamento_id, "createdAt", "updatedAt") FROM stdin;
8351bac9-8b4a-464b-adc2-41d508f644fa	100	d20c6e6a-4573-4e8d-8f36-cf6632ffa0ae	8cec252b-5961-48b4-a506-fc23e36ee46b	2026-09-01 00:17:04.983+00	2026-09-01 00:17:04.983+00
fa2ef137-b112-4407-bcd6-89aaa47f0c32	100	d20c6e6a-4573-4e8d-8f36-cf6632ffa0ae	e65001e9-de6d-4b59-b12e-92e14f579a26	2026-09-01 00:17:04.985+00	2026-09-01 00:17:04.985+00
1f0f2ca8-dc35-4807-9597-d1c4e23485c9	100	d20c6e6a-4573-4e8d-8f36-cf6632ffa0ae	8f8df90d-d13e-4130-a0c9-d23404f8bc78	2026-09-01 00:17:04.987+00	2026-09-01 00:17:04.987+00
570fe223-77dd-4f0f-8b60-ce6386962e45	100	90fd6200-2d51-4add-b24c-41639f8302d4	8cec252b-5961-48b4-a506-fc23e36ee46b	2026-09-01 00:17:04.988+00	2026-09-01 00:17:04.988+00
7cd90077-c82b-4700-bbbf-96097b8c9e75	100	90fd6200-2d51-4add-b24c-41639f8302d4	e65001e9-de6d-4b59-b12e-92e14f579a26	2026-09-01 00:17:04.99+00	2026-09-01 00:17:04.99+00
9082b18c-c92a-49de-b1a2-55c0cebea331	100	90fd6200-2d51-4add-b24c-41639f8302d4	8f8df90d-d13e-4130-a0c9-d23404f8bc78	2026-09-01 00:17:04.991+00	2026-09-01 00:17:04.991+00
\.


--
-- Data for Name: medicamentos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.medicamentos (id, nombre, descripcion, stock_minimo, estado, "createdAt", "updatedAt") FROM stdin;
8cec252b-5961-48b4-a506-fc23e36ee46b	Acetaminofén 500mg	Analgésico	50	activo	2026-09-01 00:17:04.978+00	2026-09-01 00:17:04.978+00
e65001e9-de6d-4b59-b12e-92e14f579a26	Amoxicilina 250mg	Antibiótico	30	activo	2026-09-01 00:17:04.98+00	2026-09-01 00:17:04.98+00
8f8df90d-d13e-4130-a0c9-d23404f8bc78	Ibuprofeno 400mg	Antiinflamatorio	40	activo	2026-09-01 00:17:04.982+00	2026-09-01 00:17:04.982+00
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.roles (id, name) FROM stdin;
9ac65720-ae04-4ae0-bcbb-d06041c92c89	Administrador
6be3c910-cc7c-4e12-bc1b-3a900a2a6a0f	Gestor de Solicitudes
\.


--
-- Data for Name: solicitudes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.solicitudes (id, cantidad, estado, clinica_id, medicamento_id, almacen_id, usuario_id, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: user; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."user" (id, first_name, last_name, email, password, phone, birth_date, is_active, role_id) FROM stdin;
d22968dc-2f2c-4dea-b30a-db7cd3892889	Admin	Sistema	admin@test.com	$2b$12$Nq2yRXYUDR13B8KAf45M5uj/EsRTE7gs57YyZFulMwHEEXEBrlGY.	\N	\N	t	9ac65720-ae04-4ae0-bcbb-d06041c92c89
78d1b612-15a8-4b71-88cd-d61bc5036f4f	Gestor	Solicitudes	gestor@test.com	$2b$12$Nq2yRXYUDR13B8KAf45M5uj/EsRTE7gs57YyZFulMwHEEXEBrlGY.	\N	\N	t	6be3c910-cc7c-4e12-bc1b-3a900a2a6a0f
\.


--
-- Name: almacenes almacenes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.almacenes
    ADD CONSTRAINT almacenes_pkey PRIMARY KEY (id);


--
-- Name: clinicas clinicas_nit_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clinicas
    ADD CONSTRAINT clinicas_nit_key UNIQUE (nit);


--
-- Name: clinicas clinicas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clinicas
    ADD CONSTRAINT clinicas_pkey PRIMARY KEY (id);


--
-- Name: inventarios inventarios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventarios
    ADD CONSTRAINT inventarios_pkey PRIMARY KEY (id);


--
-- Name: medicamentos medicamentos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medicamentos
    ADD CONSTRAINT medicamentos_pkey PRIMARY KEY (id);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: solicitudes solicitudes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.solicitudes
    ADD CONSTRAINT solicitudes_pkey PRIMARY KEY (id);


--
-- Name: user user_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT user_email_key UNIQUE (email);


--
-- Name: user user_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT user_pkey PRIMARY KEY (id);


--
-- Name: inventarios inventarios_almacen_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventarios
    ADD CONSTRAINT inventarios_almacen_id_fkey FOREIGN KEY (almacen_id) REFERENCES public.almacenes(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: inventarios inventarios_medicamento_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventarios
    ADD CONSTRAINT inventarios_medicamento_id_fkey FOREIGN KEY (medicamento_id) REFERENCES public.medicamentos(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: solicitudes solicitudes_almacen_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.solicitudes
    ADD CONSTRAINT solicitudes_almacen_id_fkey FOREIGN KEY (almacen_id) REFERENCES public.almacenes(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: solicitudes solicitudes_clinica_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.solicitudes
    ADD CONSTRAINT solicitudes_clinica_id_fkey FOREIGN KEY (clinica_id) REFERENCES public.clinicas(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: solicitudes solicitudes_medicamento_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.solicitudes
    ADD CONSTRAINT solicitudes_medicamento_id_fkey FOREIGN KEY (medicamento_id) REFERENCES public.medicamentos(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: solicitudes solicitudes_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.solicitudes
    ADD CONSTRAINT solicitudes_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public."user"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user user_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT user_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict bfcEkftDktFvb2lBwLxhcKLfUTWjKbOX4SNSnky2gRMW32paNmp8WmZ7XHc15kz

