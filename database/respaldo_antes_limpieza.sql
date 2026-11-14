--
-- PostgreSQL database dump
--

\restrict 0tmadc4b3FAbxiUbVtojliVtGbM1ZwsmCrVBgCKngJW4pfNSzWeA752DpvieKnO

-- Dumped from database version 18.6
-- Dumped by pg_dump version 18.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: btree_gist; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS btree_gist WITH SCHEMA public;


--
-- Name: EXTENSION btree_gist; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION btree_gist IS 'support for indexing common datatypes in GiST';


--
-- Name: sincronizar_habitaciones_viaje(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.sincronizar_habitaciones_viaje() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  UPDATE viaje_habitacion SET activa = (NEW.estado = 'reservado') WHERE id_vp = NEW.id_vp;
  RETURN NEW;
END $$;


--
-- Name: validar_capacidad_habitacion(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.validar_capacidad_habitacion() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE v_cap INT;
BEGIN
  SELECT capacidad INTO v_cap FROM habitacion WHERE id_habitacion = NEW.id_habitacion;
  IF NEW.personas_asignadas > v_cap THEN
    RAISE EXCEPTION 'La habitación % admite máximo % personas', NEW.id_habitacion, v_cap;
  END IF;
  RETURN NEW;
END $$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: actividades; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.actividades (
    id_actividades integer NOT NULL,
    id_destino integer NOT NULL,
    descripcion text NOT NULL,
    contacto character varying(100),
    foto_referencia character varying(255)
);


--
-- Name: deptos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.deptos (
    id_depto integer NOT NULL,
    nombre character varying(100) NOT NULL,
    foto_referencia character varying(255),
    descripcion text
);


--
-- Name: destinos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.destinos (
    id_destino integer NOT NULL,
    id_depto integer NOT NULL,
    nombre character varying(150) NOT NULL,
    foto_referencia character varying(255),
    nombre_del_destino text,
    generalidades text,
    id_contacto character varying(10),
    fecha_registro timestamp without time zone NOT NULL,
    clima character varying(100)
);


--
-- Name: ferias; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ferias (
    id_feria integer NOT NULL,
    id_depto integer,
    id_destino integer,
    nombre character varying NOT NULL,
    tipo character varying NOT NULL,
    descripcion text,
    foto_referencia character varying,
    fecha_inicio timestamp without time zone,
    fecha_fin timestamp without time zone,
    descuento_porcentaje numeric,
    activo boolean,
    fecha_registro timestamp without time zone
);


--
-- Name: ferias_id_feria_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ferias_id_feria_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ferias_id_feria_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.ferias_id_feria_seq OWNED BY public.ferias.id_feria;


--
-- Name: gastronomia; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.gastronomia (
    id_gastronomia integer NOT NULL,
    id_destino integer NOT NULL,
    descripcion text NOT NULL,
    contacto character varying(100),
    foto_referencia character varying(255)
);


--
-- Name: habitacion; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.habitacion (
    id_habitacion integer NOT NULL,
    id_hotel integer NOT NULL,
    descripcion character varying(250) NOT NULL,
    estado character varying(20),
    precio numeric NOT NULL,
    foto_referencia character varying(255),
    nombre character varying(150),
    tipo_cama character varying(60),
    capacidad integer DEFAULT 2 NOT NULL,
    activa boolean DEFAULT true NOT NULL,
    CONSTRAINT chk_habitacion_capacidad CHECK (((capacidad >= 1) AND (capacidad <= 10)))
);


--
-- Name: hotel; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.hotel (
    id_hotel integer NOT NULL,
    id_destino integer NOT NULL,
    nombre character varying(150) NOT NULL,
    foto_referencia character varying(255),
    direccion character varying(200) NOT NULL,
    descripcion text,
    id_contacto character varying(10),
    precio_promedio numeric,
    porcentaje_ocupacion numeric,
    fecha_registro timestamp without time zone NOT NULL,
    id_propietario character varying,
    contacto character varying(50),
    categoria character varying(50),
    politicas text,
    activo boolean DEFAULT true NOT NULL,
    id_solicitud integer
);


--
-- Name: solicitud_admin; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.solicitud_admin (
    id_solicitud integer NOT NULL,
    nombre character varying(100) NOT NULL,
    apellidos character varying(100),
    documento character varying(30) NOT NULL,
    cargo character varying(60) NOT NULL,
    correo character varying(150) NOT NULL,
    telefono character varying(30),
    password_hash character varying(255) NOT NULL,
    nombre_hotel character varying(150) NOT NULL,
    direccion_hotel character varying(200) NOT NULL,
    contacto_hotel character varying(50) NOT NULL,
    categoria character varying(50) NOT NULL,
    descripcion text NOT NULL,
    politicas text NOT NULL,
    id_destino integer,
    estado character varying(12) DEFAULT 'pendiente'::character varying NOT NULL,
    resuelta_por character varying,
    motivo_rechazo text,
    fecha_registro timestamp without time zone DEFAULT now() NOT NULL,
    fecha_resolucion timestamp without time zone,
    CONSTRAINT solicitud_admin_estado_check CHECK (((estado)::text = ANY ((ARRAY['pendiente'::character varying, 'aprobada'::character varying, 'rechazada'::character varying])::text[])))
);


--
-- Name: solicitud_admin_id_solicitud_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.solicitud_admin_id_solicitud_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: solicitud_admin_id_solicitud_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.solicitud_admin_id_solicitud_seq OWNED BY public.solicitud_admin.id_solicitud;


--
-- Name: transporte; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.transporte (
    id_transporte integer NOT NULL,
    id_destino integer NOT NULL,
    descripcion text NOT NULL,
    contacto character varying(100),
    foto_referencia character varying(255)
);


--
-- Name: usuario; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.usuario (
    id_usuario character varying(10) NOT NULL,
    nombre character varying(100) NOT NULL,
    apellidos character varying(150) NOT NULL,
    ciudad character varying(100) NOT NULL,
    direccion character varying(150) NOT NULL,
    correo character varying(150) NOT NULL,
    telefono character varying(20),
    rol character varying(20) DEFAULT 'usuario'::character varying NOT NULL,
    contrasena character varying(255) NOT NULL,
    fecha_registro timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    aprobado boolean DEFAULT false,
    documento character varying(30),
    activo boolean DEFAULT true NOT NULL,
    CONSTRAINT chk_usuario_rol CHECK (((rol)::text = ANY ((ARRAY['usuario'::character varying, 'admin_hotel'::character varying, 'super_admin'::character varying])::text[])))
);


--
-- Name: viaje_habitacion; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.viaje_habitacion (
    id_vh integer NOT NULL,
    id_vp integer NOT NULL,
    id_habitacion integer NOT NULL,
    personas_asignadas integer NOT NULL,
    precio_noche numeric(12,2) NOT NULL,
    fechas daterange NOT NULL,
    activa boolean DEFAULT true NOT NULL,
    CONSTRAINT viaje_habitacion_personas_asignadas_check CHECK ((personas_asignadas >= 1))
);


--
-- Name: v_habitacion; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.v_habitacion AS
 SELECT id_habitacion,
    id_hotel,
    nombre,
    descripcion,
    tipo_cama,
    capacidad,
    precio,
    foto_referencia,
    activa,
    (EXISTS ( SELECT 1
           FROM public.viaje_habitacion vh
          WHERE ((vh.id_habitacion = hab.id_habitacion) AND vh.activa AND (upper(vh.fechas) > CURRENT_DATE)))) AS ocupada
   FROM public.habitacion hab
  WHERE activa;


--
-- Name: v_hotel; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.v_hotel AS
SELECT
    NULL::integer AS id_hotel,
    NULL::integer AS id_destino,
    NULL::character varying AS id_propietario,
    NULL::character varying(150) AS nombre,
    NULL::character varying(255) AS foto_referencia,
    NULL::character varying(200) AS direccion,
    NULL::text AS descripcion,
    NULL::character varying(50) AS contacto,
    NULL::character varying(50) AS categoria,
    NULL::text AS politicas,
    NULL::boolean AS activo,
    NULL::timestamp without time zone AS fecha_registro,
    NULL::bigint AS total_habitaciones,
    NULL::numeric AS precio_promedio,
    NULL::bigint AS habitaciones_ocupadas,
    NULL::numeric AS porcentaje_ocupacion;


--
-- Name: viaje_habitacion_id_vh_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.viaje_habitacion_id_vh_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: viaje_habitacion_id_vh_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.viaje_habitacion_id_vh_seq OWNED BY public.viaje_habitacion.id_vh;


--
-- Name: viaje_personalizado_id_vp_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.viaje_personalizado_id_vp_seq
    START WITH 23
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: viaje_personalizado; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.viaje_personalizado (
    id_vp integer DEFAULT nextval('public.viaje_personalizado_id_vp_seq'::regclass) NOT NULL,
    id_usuario character varying(10) NOT NULL,
    id_habitacion integer,
    id_destino integer NOT NULL,
    fecha_inicial date NOT NULL,
    fecha_final date NOT NULL,
    precio numeric DEFAULT 0 NOT NULL,
    estado character varying(20) DEFAULT 'reservado'::character varying NOT NULL,
    fecha_registro timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    id_hotel integer NOT NULL,
    num_personas integer DEFAULT 1 NOT NULL,
    CONSTRAINT chk_vp_personas CHECK ((num_personas >= 1))
);


--
-- Name: ferias id_feria; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ferias ALTER COLUMN id_feria SET DEFAULT nextval('public.ferias_id_feria_seq'::regclass);


--
-- Name: solicitud_admin id_solicitud; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.solicitud_admin ALTER COLUMN id_solicitud SET DEFAULT nextval('public.solicitud_admin_id_solicitud_seq'::regclass);


--
-- Name: viaje_habitacion id_vh; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.viaje_habitacion ALTER COLUMN id_vh SET DEFAULT nextval('public.viaje_habitacion_id_vh_seq'::regclass);


--
-- Data for Name: actividades; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.actividades (id_actividades, id_destino, descripcion, contacto, foto_referencia) FROM stdin;
3	2	Vive la magia del café desde su origen con un recorrido guiado entre cafetales y aromas tradicionales.	3009090909	/actividades/CAMINAR_JARDIN.png
6	3	Siente la libertad recorriendo los caminos veredales a caballo con vistas espectaculares de la cordillera.	3010101010	/actividades/CABALLOS_SALENTO.png
8	4	Captura la luz dorada desde miradores estratégicos mientras el sol se oculta sobre las montañas cafeteras.	3011111111	/actividades/ATARDECER_FILANDIA.png
9	5	Viaja en el tiempo caminando por el empedrado ancestral del Camino Real que conecta Barichara con Guane.	3012121212	/actividades/CAMINO_REAL_BARICHARA.png
10	5	Descubre los secretos de la arquitectura colonial en tapia pisada recorriendo las calles más bellas de Colombia.	3012121212	/actividades/CASAS_BARICHARA.png
12	6	Explora el paisaje desértico de La Candelaria y descubre monasterios antiguos llenos de paz y misticismo.	3013131313	/actividades/CANDELARIA_VILLALEYVA.png
14	7	Navega pacíficamente por las aguas del río Magdalena a bordo de un tradicional champán al atardecer.	3014141414	/actividades/CHAMPAN_MOMPOX.png
18	17	Maravíllate con el imponente Arco del Morro, una formación rocosa natural labrada por el Océano Pacífico.	3015151515	/actividades/ARCO_TUMACO.png
19	17	Embárcate en un fascinante avistamiento de ballenas jorobadas mientras surcan las aguas cálidas del Pacífico.	3015151515	/actividades/BALLENASJO_TUMACO.png
21	9	Recorre las encantadoras calles coloniales de Buga y descubre el patrimonio histórico de su centro urbano.	3016161616	/actividades/CENTRO_HISTORICO_BUGA.png
22	9	Visita la emblemática Basílica del Señor de los Milagros y vive una experiencia cultural y espiritual única.	3016161616	/actividades/MILAGROS_BUGA.png
23	16	Contempla la impresionante arquitectura gótica del Santuario de Las Lajas incrustado en el cañón del río Guáitara.	3018181818	/actividades/IGLESIA_SANTUARIO.png
24	16	Cruza el puente del Santuario de Las Lajas y disfruta de las vistas panorámicas más deslumbrantes de la frontera.	3018181818	/actividades/PUENTE_SANTUARIO.png
25	10	Navega por las serenas aguas del Lago Calima en un relajante paseo en lancha rodeado de paisajes verdes.	3019191919	/actividades/LANCHA_LAGOCALIMA.png
26	10	Aprovecha los potentes vientos del Lago Calima para vivir la adrenalina del windsurf y deportes acuáticos.	3019191919	/actividades/WINDSURF_LAGOCALIMA.png
27	15	Recorre los senderos ecológicos rodeados de frailejones y naturaleza mística alrededor de la Laguna La Cocha.	3018181818	/actividades/SENDERISMO_LAGUNACOCHA.png
28	15	Navega en lancha por las frías y pacíficas aguas de la Laguna La Cocha hasta la isla de La Corota.	3018181818	/actividades/LANCHAS_LAGUNACOCHA.png
29	11	Adéntrate en la selva tropical de San Cipriano a bordo de las tradicionales brujitas y nada en sus ríos cristalinos.	3017171717	/actividades/SANCIPRIANO_BUENAVENTURA.png
30	1	Sube los escalones de la imponente Piedra del Peñol para disfrutar de una vista panorámica de 360 grados sobre el embalse.	3001010101	/actividades/PIEDRA_GUATAPE.avif
31	1	Diviértete en las atracciones acuáticas e inflables en las aguas cristalinas del embalse de Guatapé.	3001010101	/actividades/INFLA_GUATAPE.jpg
32	2	Admira la impresionante arquitectura neogótica de la Basílica Menor de la Inmaculada Concepción en la plaza principal.	3009090909	/actividades/BASILICA_JARDIN.jpg
33	28	Disfruta de parques acuáticos y piscinas para refrescarte bajo el cálido clima colonial.	3015151515	/actividades/ACUATICA_SANTAFE.jpg
34	28	Recorre sus históricas calles empedradas, fuentes coloniales y la hermosa arquitectura de sus iglesias.	3015151515	/actividades/CENTRO_HISTORICO_SANTAFE.jpg
35	7	Vive la vibrante cultura, música y expresiones artísticas durante los festivales tradicionales a orillas del río.	3014141414	/actividades/FESTIVAL_MOMPOX.webp
36	29	Explora las paradisíacas aguas turquesas e islas de arena blanca del Archipiélago del Rosario.	3016161616	/actividades/ARCHIPIELAGO_CARTAGENA.avif
37	29	Descubre el encanto colonial, plazas centenarias y la majestuosidad del centro histórico amurallado.	3016161616	/actividades/PARQUE_CARTAGENA.jpeg
38	30	Conecta con las raíces africanas, la música tradicional del tambor y la gastronomía ancestral del primer pueblo libre de América.	3017171717	/actividades/RAICES_SANBASILIO.jpg
39	30	Visita la plaza principal y el monumento a Benkos Biohó para aprender sobre la historia de libertad y resistencia.	3017171717	/actividades/MONUMENTO_SANBASILIO.jpg
41	6	Déjate envolver por la magia de las plazas monumentales y el ambiente colonial único de Villa de Leyva.	3013131313	/actividades/MAGICA_VILLALEYVA.avif
42	31	Visita el imponente monumento a los Lanceros en el Pantano de Vargas, lugar histórico de la independencia.	3019191919	/actividades/PANTANO_PAIPA.jpg
43	31	Relájate y renueva tus energías en las famosas piscinas de aguas termales con propiedades medicinales.	3019191919	/actividades/PIS_PAIPA.jpg
44	32	Realiza desafiantes caminatas y escalada en las imponentes cumbres nevadas del Parque Nacional Natural.	3020202020	/actividades/ESCALADA_COCUY.jpg
45	32	Camina hasta la majestuosa formación rocosa del Púlpito del Diablo rodeada de glaciares espectaculares.	3020202020	/actividades/PULPITO_COCUY.jpg
46	8	Vive la emoción del rafting descendiendo por los apasionantes rápidos del río Magdalena.	3021212121	/actividades/RAFTING_SANAGUSTIN.jpg
47	8	Maravíllate con las imponentes caídas de agua y la naturaleza exuberante que rodea la región.	3021212121	/actividades/CASCADA_SANAGUSTIN.jpg
48	33	Aprende sobre las tradiciones y la vida local de las comunidades que habitan el ecosistema árido.	3022222222	/actividades/COMUNIDAD_DESIERTOTATACOA.avif
49	33	Recorre los fascinantes laberintos rojizos y grises del desierto en un paseo a caballo.	3022222222	/actividades/CABALLO_DESIERTOTATACOA.avif
50	3	Camina entre las majestuosas Palmas de Cera, los árboles nacionales de Colombia, en el emblemático Valle del Cocora.	3002020202	/actividades/PALMAS_SALENTO.jpg
60	36	Disfruta de la naturaleza y recorre los hermosos senderos del parque natural en la capital del turismo de aventura.	3012121212	/actividades/PARQUENATURAL_SANGIL.jpg
62	34	Relájate y descansa en las deliciosas aguas termales naturales en un entorno tranquilo y verde.	3008080808	/actividades/TERMAL_RIVERA.avif
63	34	Explora los senderos ecoturísticos y admira la fauna local observando los guácharos en la región.	3008080808	/actividades/GUACHARO_RIVERA.jpg
64	36	Siente la adrenalina volando sobre el majestuoso cañón en una experiencia inolvidable de tirolesa.	3012121212	/actividades/TIROLESA_SANGIL.jpg
65	36	Disfruta de la naturaleza y recorre los hermosos senderos del parque natural en la capital del turismo de aventura.	3012121212	/actividades/PARQUENATURAL_SANGIL.jpg
67	35	Siente la adrenalina pura en la icónica montaña rusa rodeada de exuberante vegetación cafetera.	3002020202	/actividades/MONTAÑARUSA_PARQUECAFE.png
68	35	Disfruta de las muestras culturales y artísticas tradicionales de la región cafetera.	3002020202	/actividades/SHOW_PARQUECAFE.jpg
69	4	Visita la majestuosa iglesia central y admira la arquitectura colonial del municipio.	3003030303	/actividades/IGLESIA_FILANDIA.jpg
70	37	Diviértete en las emocionantes atracciones extremas con vista al majestuoso cañón.	3012121212	/actividades/ATRACCIÓN_CHICAMOCHA.jpg
71	37	Relájate y disfruta de un refrescante baño en el parque acuático rodeado de montañas.	3012121212	/actividades/PISCINA_CHICAMOCHA.webp
72	11	Avista a las impresionantes ballenas jorobadas en sus aguas pacíficas.	3007070707	/actividades/BALLENAS_BUENAVENTURA.png
\.


--
-- Data for Name: deptos; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.deptos (id_depto, nombre, foto_referencia, descripcion) FROM stdin;
1	Antioquia	/deptos/ANTIOQUIA.jpg	Tierra de montañas, pueblos coloridos y la vibrante Medellín. Ideal para turismo cultural y de aventura.
5	Bolívar	/deptos/BOLIVAR.png	Hogar de Cartagena, con playas caribeñas, historia colonial y arquitectura amurallada.
4	Boyacá	/deptos/BOYACA.jpg	Pueblos patrimonio, paisajes andinos y la histórica Villa de Leyva. Perfecto para turismo histórico y rural.
6	Huila	/deptos/HUILA.jpg	Cuna del Desierto de la Tatacoa y el Parque Arqueológico de San Agustín. Naturaleza y misterio ancestral.
2	Quindío	/deptos/QUINDIO.jpg	Corazón del Eje Cafetero, con el Valle de Cocora, fincas cafeteras y pueblos como Salento y Filandia.
3	Santander	/deptos/SANTANDER.webp	Destino de deportes extremos, cañones impresionantes y el pueblo colonial de Barichara.
8	Nariño	/deptos/NARIÑO.webp	Tierra de cultura, el majestuoso Santuario de Las Lajas, la Laguna de la Cocha y paisajes andinos únicos.
7	Valle del Cauca	/deptos/VALLE_DEL_CAUCA.jpg	Región del Pacífico con diversidad cultural, paisajes de montaña y mar, Lago Calima y la Basílica de Buga.
\.


--
-- Data for Name: destinos; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.destinos (id_destino, id_depto, nombre, foto_referencia, nombre_del_destino, generalidades, id_contacto, fecha_registro, clima) FROM stdin;
9	7	Buga	/destinos/BUGA.png	Basílica del Señor de los Milagros	Es un destino conocido principalmente por la Basílica del Señor de los Milagros. Los turistas pueden conocer su patrimonio religioso, recorrer sus calles y disfrutar de la gastronomía local.	U002	2026-09-02 10:09:17.319101	Cálido y agradable
10	7	Lago Calima	/destinos/LAGO_CALIMA.png	Embalse del Calima	Es un destino rodeado de naturaleza y paisajes atractivos. Es conocido por sus actividades acuáticas, paseos, deportes y espacios ideales para disfrutar de un día al aire libre.	U003	2026-09-02 10:09:17.319101	Templado y fresco
11	7	Buenaventura	/destinos/BUENAVENTURA.png	Malecón Bahía de la Cruz	Es uno de los principales destinos del Pacífico colombiano, reconocido por sus playas, biodiversidad y cultura. Los turistas pueden disfrutar de la naturaleza, la gastronomía y conocer diferentes lugares de la región.	U004	2026-09-02 10:09:17.319101	Cálido y húmedo
6	4	Villa de Leyva	/destinos/VILLA_DE_LEYVA.jpg	Mirador Santo Ecce Homo	Pueblo colonial con la plaza empedrada más grande de Colombia, rodeado de desierto y fósiles.	U005	2026-08-20 21:21:04.432456	Templado y seco
1	1	Guatapé	/destinos/GUATAPE.avif	Piedra del Peñol	Pueblo de casas coloridas y zócalos junto al embalse, uno de los más visitados de Antioquia.	U002	2026-08-20 21:21:04.432456	Templado y moderado
2	1	Jardín	/destinos/JARDIN.png	Cerro de las Cruces	Pueblo cafetero de fachadas de colores vivos, rodeado de montañas y fincas cafeteras.	U002	2026-08-20 21:21:04.432456	Templado y fresco
3	2	Salento	/destinos/SALENTO.jpg	Mirador Alto de la Cruz	Pueblo quindiano famoso por el Valle de Cocora y las palmas de cera más altas del mundo.	U003	2026-08-20 21:21:04.432456	Templado y fresco
4	2	Filandia	/destinos/FILANDIA.webp	Mirador Colina Iluminada	Pueblo cafetero tranquilo con arquitectura tradicional y miradores sobre el Quindío.	U003	2026-08-20 21:21:04.432456	Templado y fresco
5	3	Barichara	/destinos/BARICHARA.webp	Mirador El Peñón	Considerado uno de los pueblos más bonitos de Colombia, calles empedradas y casas de tapia pisada.	U004	2026-08-20 21:21:04.432456	Templado y seco
7	5	Mompox	/destinos/MOMPOX.jpg	Iglesia Santa Bárbara	Pueblo colonial a orillas del río Magdalena, patrimonio de la humanidad, tradición orfebre.	U006	2026-08-20 21:21:04.432456	Cálido y húmedo
8	6	San Agustín	/destinos/SAN_AGUSTIN.webp	Parque Arqueológico	Pueblo huilense famoso por sus estatuas precolombinas y paisajes de montaña.	U004	2026-08-20 21:21:04.432456	Templado
15	8	Laguna La Cocha	/destinos/LAGUNA_LA_COCHA.png	Isla de La Corota	Es un hermoso destino natural rodeado de montañas y vegetación exuberante. Los turistas pueden disfrutar de paseos en barco, observar la naturaleza y visitar la isla de La Corota.	U002	2026-09-02 16:48:24.452037	Frío y húmedo
16	8	Santuario de Las Lajas	/destinos/SANTUARIO.png	Cañón del río Guáitara	Es uno de los lugares más emblemáticos de Nariño, famoso por su impresionante arquitectura construida en un cañón. Es ideal para conocer su historia, disfrutar del paisaje y experimentar el turismo religioso.	U003	2026-09-02 16:48:24.452037	Templado y fresco
17	8	Tumaco	/destinos/TUMACO.png	Playas del Pacífico	Un destino situado en la costa pacífica de Colombia, famoso por sus playas, cultura y gastronomía. Los visitantes pueden disfrutar del mar, probar platos locales y aprender sobre las tradiciones de la región.	U004	2026-09-02 16:48:24.452037	Cálido y húmedo
28	1	Santa Fe de Antioquia	/destinos/SANTA_FE.png	Puente de Occidente	Es una ciudad histórica reconocida por su arquitectura colonial, calles adoquinadas y clima cálido. Los turistas pueden explorar el centro histórico, visitar el Western Bridge y disfrutar de su gastronomía y paisajes.	U001	2026-09-02 19:31:13.574121	Cálido seco, temperatura promedio entre 27°C y 30°C durante todo el año.
29	5	Cartagena de Indias	/destinos/CARTAGENA_DE_INDIAS.png	Ciudad Amurallada	Es uno de los destinos turísticos más reconocidos de Colombia, famoso por su centro histórico, sus murallas y sus playas. Los visitantes pueden explorar la Ciudad Amurallada, saborear la gastronomía local y descubrir lugares históricos.	U002	2026-09-02 19:31:13.574121	Cálido tropical costero, temperatura promedio entre 28°C y 32°C, con alta humedad.
30	5	San Basilio de Palenque	/destinos/SAN_BASILIO.png	Primer Pueblo Libre de América	Es un destino reconocido por su historia, cultura y tradiciones afrocolombianas. Los visitantes pueden experimentar sus expresiones musicales, gastronomía, artesanía y aprender sobre las tradiciones de su comunidad.	U003	2026-09-02 19:31:13.574121	Cálido tropical, temperatura promedio alrededor de 28°C, similar al clima de Cartagena.
31	4	Paipa	/destinos/PAIPA.png	Lago Sochagota	Es un destino conocido por sus aguas termales, paisajes y actividades relajantes. Los visitantes pueden disfrutar de las aguas termales, participar en deportes acuáticos y explorar el lago Sochagota.	U004	2026-09-02 19:31:13.574121	Frío de altiplano, temperatura promedio entre 12°C y 18°C.
32	4	El Cocuy	/destinos/EL_COCUY.png	Sierra Nevada del Cocuy	Es un destino ideal para los amantes de la naturaleza y de la montaña. Destaca por sus paisajes, picos nevados y senderos, donde los turistas pueden hacer senderismo y disfrutar de la biodiversidad.	U005	2026-09-02 19:31:13.574121	Frío de páramo, con temperaturas bajo cero en los picos nevados y cerca de 12°C-14°C en el pueblo.
33	6	Desierto de Tatacoa	/destinos/DESIERTO_TATACOA.png	Observatorio Astronómico de la Tatacoa	Es uno de los lugares naturales más emblemáticos de Huila, conocido por sus paisajes de color gris rojizo. Los turistas pueden hacer senderismo, explorar sus formaciones naturales y disfrutar de la observación de las estrellas.	U006	2026-09-02 19:31:13.574121	Cálido y muy seco, temperaturas diurnas que superan los 35°C y noches frescas.
34	6	Rivera	/destinos/RIVERA.png	Balnearios de Aguas Termales	Es un municipio conocido por sus aguas termales y paisajes naturales. Los turistas pueden disfrutar de los balnearios, relajarse en las aguas termales y explorar los alrededores.	U001	2026-09-02 19:31:13.574121	Cálido, temperatura promedio alrededor de 28°C.
35	2	Parque de Café	/destinos/PARQUE_CAFE.png	Torre Mirador del Parque del Café	Es una de las principales atracciones turísticas de Quindío, donde los visitantes pueden aprender más sobre la cultura cafetera y disfrutar de diversas atracciones. Es ideal para pasar el día en familia y disfrutar de actividades recreativas.	U002	2026-09-02 19:31:13.574121	Templado de zona cafetera, temperatura promedio entre 18°C y 22°C.
36	3	San Gil	/destinos/SAN_GIL.png	Río Fonce	Es uno de los destinos de aventura más populares de Santander. Los turistas pueden disfrutar de actividades como rafting, senderismo y explorar los paisajes naturales de la región.	U003	2026-09-02 19:31:13.574121	Templado, temperatura promedio entre 22°C y 25°C.
37	3	Chicamocha	/destinos/CHICAMOCHA.png	Teleférico del Chicamocha (PANACHI)	El Cañón Chicamocha es uno de los paisajes naturales más impresionantes de Santander. Los turistas pueden visitar el Parque Nacional de Chicamocha, disfrutar del teleférico y admirar las montañas y el cañón.	U004	2026-09-02 19:31:13.574121	Cálido y seco en el fondo del cañón, temperatura promedio entre 26°C y 30°C.
\.


--
-- Data for Name: ferias; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.ferias (id_feria, id_depto, id_destino, nombre, tipo, descripcion, foto_referencia, fecha_inicio, fecha_fin, descuento_porcentaje, activo, fecha_registro) FROM stdin;
1	4	\N	Festival del Torbellino	feria	Celebración tradicional con música, danza y gastronomía típica boyacense.	\N	2026-10-01 00:00:00	2026-10-05 00:00:00	\N	t	\N
2	4	\N	Escapada relámpago a Monguí	oferta	Hospedaje + desayuno con descuento especial por tiempo limitado.	\N	2026-09-15 00:00:00	2026-09-22 00:00:00	20.00	t	\N
3	4	31	Feria de la Panela y el Dulce	feria	Muestra gastronómica y cultural alrededor de la panela boyacense, con artesanías y música en vivo.	\N	2026-09-10 00:00:00	2026-09-14 00:00:00	\N	t	\N
4	4	6	Festival de Cine de Villa de Leyva	feria	Proyecciones al aire libre, charlas con realizadores y actividades culturales en el centro histórico.	\N	2026-09-24 00:00:00	2026-09-28 00:00:00	\N	t	\N
5	1	\N	Fiestas del Vino y el Turismo	feria	Cata de vinos regionales, mercado de productores locales y actividades para toda la familia.	\N	2026-09-18 00:00:00	2026-09-21 00:00:00	\N	t	\N
6	5	\N	Encuentro Cultural del Caribe	feria	Danza, música y gastronomía caribeña en un solo fin de semana.	\N	2026-09-19 00:00:00	2026-09-20 00:00:00	\N	t	\N
7	4	32	Festival de la Nieve	feria	Celebración tradicional en el páramo, con caminatas guiadas y gastronomía típica.	\N	2026-10-05 00:00:00	2026-10-08 00:00:00	\N	t	\N
8	4	31	Termales con descuento en Paipa	oferta	Entrada a termales + almuerzo típico con precio especial por tiempo limitado.	\N	2026-09-10 00:00:00	2026-09-30 00:00:00	15.00	t	\N
9	1	\N	Plan relámpago a Guatapé	oferta	Transporte + entrada al Peñol con descuento especial, cupos limitados.	\N	2026-09-16 00:00:00	2026-09-19 00:00:00	25.00	t	\N
10	4	32	Escapada de montaña a El Cocuy	oferta	Hospedaje 2 noches con descuento especial de temporada.	\N	2026-09-20 00:00:00	2026-10-10 00:00:00	18.00	t	\N
12	1	1	guatape	feria	string	string	2026-09-23 22:07:54.487	2026-09-23 22:07:54.487	0	t	\N
13	1	1	guatape	feria	string	string	2026-09-23 22:07:54.487	2026-09-23 22:07:54.487	0	t	\N
16	1	1	Feria de Prueba	feria	Registro de prueba	\N	\N	\N	\N	t	\N
17	1	1	Feria de Prueba	feria	Registro de prueba	\N	\N	\N	\N	t	\N
18	1	1	Feria de Prueba	feria	Registro de prueba	\N	\N	\N	\N	t	\N
20	1	1	Feria de Prueba API	feria	Prueba desde FastAPI	\N	\N	\N	\N	t	\N
21	4	1	Feria de Octubre	feria	Feria cultural y gastronómica	\N	2026-10-10 00:00:00	2026-10-12 00:00:00	15	t	\N
\.


--
-- Data for Name: gastronomia; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.gastronomia (id_gastronomia, id_destino, descripcion, contacto, foto_referencia) FROM stdin;
8	8	Asado huilense tradicional, plato típico de San Agustín.	3007070707	/gastronomia/ASADO_SANAGUSTIN.png
6	6	Longaniza artesanal boyacense, servida tradicionalmente en la plaza principal.	3005050505	/gastronomia/LONGANIZA_BOYACA.png
4	4	Café filandiano en tostadoras locales.	3003030303	/gastronomia/CAFE_FILANDIANO_FILANDIA.png
9	2	Arepas de mote rellenas, especialidad de las fondas de Jardín.	3001010101	/gastronomia/AREPAS_JARDIN.webp
10	2	Picada paisa para compartir, con chicharrón, chorizo y arepa.	3001010101	/gastronomia/PICADA_JARDIN.webp
11	3	Patacón con hogao y queso, acompañante infaltable en Salento.	3002020202	/gastronomia/PATACON_SALENTO.png
12	3	Trucha fresca servida con vista al Valle de Cocora.	3002020202	/gastronomia/TRUCHA_COCORA_GUATAPE.jpg
5	5	Cabrito guisado tradicional, delicia santandereana.	3004040404	/gastronomia/CABRITO_GUISADO_BARICHARA.png
7	7	Pescado de río, arroz de fríjol y dulces de Mompox.	3006060606	/gastronomia/PESCADO_RIO_MOMPOX.png
2	2	Café de origen local, cultivado en las fincas tradicionales de Jardín.	3001010101	/gastronomia/CAFE_JARDIN.jpg
15	5	Variedad de delicias santandereanas para compartir.	3004040404	/gastronomia/DELICIAS_SANTANDEREANAS_BARICHARA.png
16	5	Hormiga culona tostada, manjar tradicional santandereano.	3004040404	/gastronomia/HORMIGA_CULONA_BARICHARA.png
17	6	Mazorca asada boyacense, infaltable en las plazas de pueblo.	3005050505	/gastronomia/MAZORCA_BOYACA.png
18	6	Chicha de maíz, bebida tradicional boyacense.	3005050505	/gastronomia/CHICHA_BOYACA.png
19	7	Arroz con fríjol, plato típico de Mompox.	3006060606	/gastronomia/ARROZ_FRIJOL_MOMPOX.png
20	7	Dulces artesanales de Mompox, herencia de la Depresión Momposina.	3006060606	/gastronomia/DULCES_MOMPOX.png
21	8	Bizcocho de achira recién horneado, típico de San Agustín.	3007070707	/gastronomia/ACHIRA_SANAGUSTIN.png
22	28	Bandeja paisa tradicional con frijoles, chicharrón, carne molida, chorizo, huevo frito, tajada de plátano, aguacate y arepa.	\N	/gastronomia/BANDEJA_PAISA_SANTAFE.png
23	28	Tamal antioqueño envuelto en hoja de plátano, servido caliente con arepa de maíz.	\N	/gastronomia/TAMAL_SANTAFE.png
24	28	Sopa de mondongo tradicional acompañada de mazorca, arroz y aguacate.	\N	/gastronomia/MONDONGO_SANTAFE.png
25	28	Arepa antioqueña de maíz blanco, dorada al carbón, ideal para acompañar con mantequilla y queso.	\N	/gastronomia/AREPA_ANTIOQUEÑA_SANTAFE.png
26	29	Arroz con coco tradicional cartagenero, de sabor dulce y dorado, elaborado con leche de coco y titoté.	\N	/gastronomia/ARROZ_COCO_CARTAGENA.png
27	29	Pescado frito crujiente acompañado de patacones de plátano verde y ensalada fresca.	\N	/gastronomia/PESCADO_PATACONES_CARTAGENA.png
28	29	Cazuela de mariscos cremosa preparada con leche de coco, camarones, calamares y especias caribeñas.	\N	/gastronomia/CAZUELA_CARTAGENA.png
29	30	Arroz con coco artesanal de Palenque, preparado con técnica tradicional de titoté y leche de coco fresca.	\N	/gastronomia/ARROZ_COCO_BASILIO.png
30	30	Carimañolas crujientes de yuca rellenas de carne molida frita, plato típico de la herencia afrocolombiana.	\N	/gastronomia/CARIMAÑOLAS_BASILIO.png
31	30	Pescado guisado en zumo de coco y hortalizas, una receta ancestral llena de sabor caribeño.	\N	/gastronomia/PECADO_GUISADO_BASILIO.png
32	31	Arepa boyacense tradicional de maíz amarillo rellena de queso Paipa y horneada al carbón.	\N	/gastronomia/AREPA_BOYA_PAIPA.png
33	31	Cocido boyacense preparado con tubérculos andinos como ibias, cubios, chuguas y carnes variadas.	\N	/gastronomia/COCIDO_PAIPA.png
34	31	Cuchuco de trigo con espinazo de cerdo, sopa espesa tradicional de los campos boyacenses.	\N	/gastronomia/CUCHUCO_PAIPA.png
35	31	Mazamorra chiquita boyacense, sopa tradicional a base de maíz, menudencias, carne y verduras.	\N	/gastronomia/MAZAMORRA_CHIQUI_PAIPA.png
36	31	Changua boyacense preparada con leche, huevo calfado, cilantro fresco y calado.	\N	/gastronomia/CHANGUA_PAIPA.png
37	32	Mute boyacense reconfortante, preparado con maíz pelado, carne de res, cerdo y verduras de la sierra.	\N	/gastronomia/MUTE_COCUY.png
38	32	Cocido típico de la sierra con tubérculos andinos, longaniza, carne de cerdo y mazorca.	\N	/gastronomia/COCIDO_COCUY.png
39	32	Cuchuco tradicional servido bien caliente, ideal para el clima de alta montaña en El Cocuy.	\N	/gastronomia/CUCHUCO_COCUY.png
40	9	Sancocho de gallina tradicional cocinado a la leña, acompañado de platano, yuca y mazorca.	\N	/gastronomia/SANCOCHO_BUGA.png
41	9	Chuleta valluna apanada, crujiente por fuera y jugosa por dentro, emblema del Valle del Cauca.	\N	/gastronomia/CHULETA_BUGA.png
42	9	Arroz atollado espeso y sazonado, preparado con diferentes carnes, verduras y guiso criollo.	\N	/gastronomia/ATOLLADO_BUGA.png
43	9	Manjar blanco valluno, postre artesanal a base de leche y azúcar servido en mate tradicional.	\N	/gastronomia/MANJAR_BLANCO_BUGA.png
44	17	Encocado tradicional tumaqueño preparado con leche de coco fresca, refrito pacífico y hierbas azoteas.	\N	/gastronomia/ENCOCADO_TUMACO.png
45	17	Cebiche o salteado de camarón y piangua extraída de los manglares, sazonado con limón y cilantro de monte.	\N	/gastronomia/CAMARON_PIANGUA_TUMACO.png
46	17	Arroz marinero estilo Tumaco, sazonado con achiote, frutos del mar y coco.	\N	/gastronomia/ARROZ_MARINERO.png
47	16	Cuy asado a las brasas, plato insignia nariñense servido con papas al vapor y ají de maní.	\N	/gastronomia/CUY_SANTUARIO.png
48	16	Hornado pastuso, jugosa carne de cerdo asada en horno de leña acompañada de mote y agrio.	\N	/gastronomia/HORNADO_SANTUARIO.png
49	16	Empanadas de añejo crujientes preparadas con masa de maíz fermentado y guiso tradicional.	\N	/gastronomia/EMPANADAS_AÑEJO_SANTUARIO.png
50	15	Trucha arcoíris frita o a la plancha, plato insignia cultivado en las frías aguas de La Cocha.	\N	/gastronomia/TRUCHA_LAGUNA_COCHA.png
51	15	Plato típico nariñense acompañado de trucha frita, papas al vapor, ensalada fresca y patacón.	\N	/gastronomia/PLATO_TIPICO_LAGUNA_COCHA.png
52	15	Acompañamientos tradicionales regionales como arepas de choclo, queso campesino y hervidos calientes.	\N	/gastronomia/ACOMPAÑAMIENTOS_LAGUNA_COCHA.png
53	11	Pescado fresco bañado en suculenta salsa de coco, refrito del Pacífico y finas hierbas azoteas.	\N	/gastronomia/ENCOCADO_PESCADO_BUENAVENTURA.png
54	11	Arroz autóctono sazonado con variedad de mariscos del Pacífico, piangua, camarones y achiote.	\N	/gastronomia/ARROZ_MARISCOS_BUENAVENTURA.png
55	11	Cazuela cremosa de mariscos frescos cocinada en leche de coco, servida en cazuela de barro caliente.	\N	/gastronomia/CAZUELA_MARISCOS_BUENAVENTURA.png
56	1	Trucha frita tradicional servida fresca en los restaurantes junto al embalse de Guatapé.	3009990011	/gastronomia/TRUCHA_GUATAPE.jpg
57	1	Bandeja paisa típica con frijoles, chicharrón, carne molida, huevo, tajada y arepa.	3009990011	/gastronomia/BANDEJA_GUATAPE.jpg
1	1	Mazamorra antioqueña tradicional acompañada con bocadillo y leche.	3009990011	/gastronomia/MAZAMORRA_GUATAPE.jpg
58	8	Torteaditos tradicionales, plato típico de San Agustín.	3007070707	/gastronomia/TORTEADITOS_SANAGUSTIN.jpg
59	4	Chicharrón crocante tradicional, especialidad de los restaurantes de Filandia.	3003030303	/gastronomia/CHICHARRON_FILANDIA.webp
63	4	Plato de gastronomía asiática oriental, oferta gastronómica moderna en Filandia.	3003030303	/gastronomia/ASIATICO_FILANDIA.jpg
70	33	Viudo de pescado tradicional, preparado al vapor con plátano y yuca.	3008080808	/gastronomia/VIUDO_DESIERTO.png
71	33	Tamal huilense tradicional envuelto en hoja de plátano.	3008080808	/gastronomia/TAMAL_DESIERTO.png
72	33	Asado huilense típico servido con arepa y plátano maduro.	3008080808	/gastronomia/ASADO_DESIERTO.png
73	34	Arepas de choclo tradicionales con queso de la región.	3008080808	/gastronomia/AREPAS_RIVERA.png
74	34	Asado huilense típico acompañado de insulsos y arepa.	3008080808	/gastronomia/ASADO_RIVERA.png
75	34	Viudo de pescado tradicional servido con yuca y plátano.	3008080808	/gastronomia/VIUDO_RIVERA.png
76	35	Patacones crujientes servidos con guacamole y ahogado tradicional.	3003030303	/gastronomia/PATACONES_PARQUECAFE.png
77	35	Plato típico paisa completo con fríjoles, chicharrón, chorizo y acompañamientos.	3003030303	/gastronomia/PAISA_PARQUECAFE.png
78	35	Chicharrón crocante acompañado de limón y arepa.	3003030303	/gastronomia/CHICHARRON_PARQUECAFE.png
79	3	Sopa tradicional artesanal, un plato reconfortante típico de Salento.	3003030303	/gastronomia/SOPA_SALENTO.jpg
80	36	Sopa tradicional santandereana preparada con variadas carnes, maíz y verduras.	3006060606	/gastronomia/MUTE_SANGIL.png
81	36	Pepitoria santandereana plato autóctono elaborado a base de visceras de cabro, arroz y especias.	3006060606	/gastronomia/PEPITORIA_SANGIL.png
82	36	Hormigas culonas tostadas y saladas, pasaboca exótico e icónico de la región.	3006060606	/gastronomia/HORMIGAS_SANGIL.png
83	36	Cabro asado a la parrilla servido con yuca, arepa santandereana y pepitoria.	3006060606	/gastronomia/CABRO_SANGIL.png
84	37	Dulce tradicional santandereano, postre típico de la región del Chicamocha.	3007070707	/gastronomia/DULCE_CHICAMOCHA.jpg
85	37	Picada típica santandereana con variedad de carnes, morcilla y arepa.	3007070707	/gastronomia/PICADA_CHICAMOCHA.jpg
86	37	Cabrito asado acompañado de pepitoria, yuca y arepa santandereana.	3007070707	/gastronomia/CABROO_CHICAMOCHA.jpg
87	10	Bandeja típica de la región, servida con acompañamientos tradicionales.	3005050505	/gastronomia/BANDEJA_LAGOCALIMA.jpg
88	10	Cóctel refrescante ideal para disfrutar en la zona turística del lago.	3005050505	/gastronomia/COCTEL_LAGOCALIMA.jpg
89	10	Pizza artesanal horneada, opción gastronómica popular para visitantes.	3005050505	/gastronomia/PIZZA_LAGOCALIMA.jpg
\.


--
-- Data for Name: habitacion; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.habitacion (id_habitacion, id_hotel, descripcion, estado, precio, foto_referencia, nombre, tipo_cama, capacidad, activa) FROM stdin;
3	2	Habitación rústica finca cafetera	disponible	180000.00	\N	Habitación rústica finca cafetera	1 cama doble	2	t
4	2	Cabaña doble con chimenea	disponible	260000.00	\N	Cabaña doble con chimenea	1 cama doble	2	t
5	3	Cabaña individual de madera	disponible	140000.00	\N	Cabaña individual de madera	1 cama sencilla	1	t
7	4	Habitación colonial estándar	disponible	160000.00	\N	Habitación colonial estándar	1 cama doble	2	t
8	4	Suite con vista a la plaza	disponible	250000.00	\N	Suite con vista a la plaza	1 cama doble	2	t
10	5	Suite con piscina privada	disponible	380000.00	\N	Suite con piscina privada	1 cama doble	2	t
11	6	Habitación doble boyacense	disponible	190000.00	\N	Habitación doble boyacense	1 cama doble	2	t
13	7	Habitación colonial junto al río	disponible	210000.00	\N	Habitación colonial junto al río	1 cama doble	2	t
15	8	Habitación finca San Agustín	disponible	130000.00	\N	Habitación finca San Agustín	1 cama doble	2	t
16	8	Cabaña doble con vista al valle	disponible	240000.00	\N	Cabaña doble con vista al valle	1 cama doble	2	t
309	84	Habitación doble estándar	disponible	170000.00	https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=800&q=80	Habitación doble estándar	1 cama doble	2	t
6	3	Cabaña familiar Valle de Cocora	ocupada	300000.00	\N	Cabaña familiar Valle de Cocora	2 camas dobles	4	t
9	5	Habitación patio interior	ocupada	200000.00	\N	Habitación patio interior	1 cama doble	2	t
12	6	Habitación familiar Villa de Leyva	ocupada	280000.00	\N	Habitación familiar Villa de Leyva	2 camas dobles	4	t
14	7	Suite Mompox con aljibe	ocupada	320000.00	\N	Suite Mompox con aljibe	1 cama doble	2	t
310	84	Suite familiar	disponible	150000.00	https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80	Suite familiar	2 camas dobles	4	t
311	84	Habitación con balcón	disponible	150000.00	https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80	Habitación con balcón	1 cama doble	2	t
312	84	Habitación matrimonial	disponible	130000.00	https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80	Habitación matrimonial	1 cama doble	2	t
313	85	Suite familiar	disponible	110000.00	https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80	Suite familiar	2 camas dobles	4	t
314	85	Habitación con balcón	disponible	220000.00	https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80	Habitación con balcón	1 cama doble	2	t
1	1	Habitación sencilla vista al embalse	ocupada	150000.00	\N	Habitación sencilla vista al embalse	1 cama sencilla	1	t
315	85	Habitación matrimonial	disponible	90000.00	https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80	Habitación matrimonial	1 cama doble	2	t
316	85	Suite con vista	disponible	90000.00	https://images.unsplash.com/photo-1611892441198-45b1a0a3b7f4?w=800&q=80	Suite con vista	1 cama doble	2	t
317	86	Habitación con balcón	disponible	90000.00	https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80	Habitación con balcón	1 cama doble	2	t
318	86	Habitación matrimonial	disponible	150000.00	https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80	Habitación matrimonial	1 cama doble	2	t
319	86	Suite con vista	disponible	220000.00	https://images.unsplash.com/photo-1611892441198-45b1a0a3b7f4?w=800&q=80	Suite con vista	1 cama doble	2	t
320	86	Habitación sencilla	disponible	150000.00	https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80	Habitación sencilla	1 cama sencilla	1	t
321	87	Habitación matrimonial	disponible	90000.00	https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80	Habitación matrimonial	1 cama doble	2	t
322	87	Suite con vista	disponible	130000.00	https://images.unsplash.com/photo-1611892441198-45b1a0a3b7f4?w=800&q=80	Suite con vista	1 cama doble	2	t
323	87	Habitación sencilla	disponible	220000.00	https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80	Habitación sencilla	1 cama sencilla	1	t
324	87	Habitación doble estándar	disponible	190000.00	https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=800&q=80	Habitación doble estándar	1 cama doble	2	t
325	88	Suite con vista	disponible	190000.00	https://images.unsplash.com/photo-1611892441198-45b1a0a3b7f4?w=800&q=80	Suite con vista	1 cama doble	2	t
326	88	Habitación sencilla	disponible	110000.00	https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80	Habitación sencilla	1 cama sencilla	1	t
327	88	Habitación doble estándar	disponible	110000.00	https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=800&q=80	Habitación doble estándar	1 cama doble	2	t
328	88	Suite familiar	disponible	220000.00	https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80	Suite familiar	2 camas dobles	4	t
329	89	Habitación sencilla	disponible	170000.00	https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80	Habitación sencilla	1 cama sencilla	1	t
697	185	Suite con vista	disponible	260000.00	https://images.unsplash.com/photo-1611892441198-45b1a0a3b7f4?w=800&q=80	Suite con vista	1 cama doble	2	t
330	89	Habitación doble estándar	disponible	90000.00	https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=800&q=80	Habitación doble estándar	1 cama doble	2	t
331	89	Suite familiar	disponible	260000.00	https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80	Suite familiar	2 camas dobles	4	t
332	89	Habitación con balcón	disponible	110000.00	https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80	Habitación con balcón	1 cama doble	2	t
333	90	Habitación doble estándar	disponible	170000.00	https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=800&q=80	Habitación doble estándar	1 cama doble	2	t
334	90	Suite familiar	disponible	190000.00	https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80	Suite familiar	2 camas dobles	4	t
335	90	Habitación con balcón	disponible	150000.00	https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80	Habitación con balcón	1 cama doble	2	t
336	90	Habitación matrimonial	disponible	110000.00	https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80	Habitación matrimonial	1 cama doble	2	t
337	91	Suite familiar	disponible	170000.00	https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80	Suite familiar	2 camas dobles	4	t
338	91	Habitación con balcón	disponible	110000.00	https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80	Habitación con balcón	1 cama doble	2	t
339	91	Habitación matrimonial	disponible	150000.00	https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80	Habitación matrimonial	1 cama doble	2	t
340	91	Suite con vista	disponible	110000.00	https://images.unsplash.com/photo-1611892441198-45b1a0a3b7f4?w=800&q=80	Suite con vista	1 cama doble	2	t
341	92	Habitación con balcón	disponible	190000.00	https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80	Habitación con balcón	1 cama doble	2	t
342	92	Habitación matrimonial	disponible	130000.00	https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80	Habitación matrimonial	1 cama doble	2	t
343	92	Suite con vista	disponible	190000.00	https://images.unsplash.com/photo-1611892441198-45b1a0a3b7f4?w=800&q=80	Suite con vista	1 cama doble	2	t
344	92	Habitación sencilla	disponible	190000.00	https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80	Habitación sencilla	1 cama sencilla	1	t
345	93	Habitación matrimonial	disponible	110000.00	https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80	Habitación matrimonial	1 cama doble	2	t
346	93	Suite con vista	disponible	130000.00	https://images.unsplash.com/photo-1611892441198-45b1a0a3b7f4?w=800&q=80	Suite con vista	1 cama doble	2	t
347	93	Habitación sencilla	disponible	150000.00	https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80	Habitación sencilla	1 cama sencilla	1	t
348	93	Habitación doble estándar	disponible	130000.00	https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=800&q=80	Habitación doble estándar	1 cama doble	2	t
349	94	Suite con vista	disponible	150000.00	https://images.unsplash.com/photo-1611892441198-45b1a0a3b7f4?w=800&q=80	Suite con vista	1 cama doble	2	t
350	94	Habitación sencilla	disponible	190000.00	https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80	Habitación sencilla	1 cama sencilla	1	t
351	94	Habitación doble estándar	disponible	90000.00	https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=800&q=80	Habitación doble estándar	1 cama doble	2	t
352	94	Suite familiar	disponible	150000.00	https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80	Suite familiar	2 camas dobles	4	t
2	1	Habitación doble con balcón	ocupada	220000.00	\N	Habitación doble con balcón	1 cama doble	2	t
353	95	Habitación sencilla	disponible	220000.00	https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80	Habitación sencilla	1 cama sencilla	1	t
354	95	Habitación doble estándar	disponible	170000.00	https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=800&q=80	Habitación doble estándar	1 cama doble	2	t
355	95	Suite familiar	disponible	110000.00	https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80	Suite familiar	2 camas dobles	4	t
356	95	Habitación con balcón	disponible	150000.00	https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80	Habitación con balcón	1 cama doble	2	t
357	96	Habitación doble estándar	disponible	150000.00	https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=800&q=80	Habitación doble estándar	1 cama doble	2	t
358	96	Suite familiar	disponible	260000.00	https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80	Suite familiar	2 camas dobles	4	t
359	96	Habitación con balcón	disponible	220000.00	https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80	Habitación con balcón	1 cama doble	2	t
360	96	Habitación matrimonial	disponible	260000.00	https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80	Habitación matrimonial	1 cama doble	2	t
361	97	Suite familiar	disponible	150000.00	https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80	Suite familiar	2 camas dobles	4	t
362	97	Habitación con balcón	disponible	170000.00	https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80	Habitación con balcón	1 cama doble	2	t
363	97	Habitación matrimonial	disponible	220000.00	https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80	Habitación matrimonial	1 cama doble	2	t
364	97	Suite con vista	disponible	220000.00	https://images.unsplash.com/photo-1611892441198-45b1a0a3b7f4?w=800&q=80	Suite con vista	1 cama doble	2	t
365	98	Habitación con balcón	disponible	260000.00	https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80	Habitación con balcón	1 cama doble	2	t
366	98	Habitación matrimonial	disponible	110000.00	https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80	Habitación matrimonial	1 cama doble	2	t
367	98	Suite con vista	disponible	90000.00	https://images.unsplash.com/photo-1611892441198-45b1a0a3b7f4?w=800&q=80	Suite con vista	1 cama doble	2	t
368	98	Habitación sencilla	disponible	110000.00	https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80	Habitación sencilla	1 cama sencilla	1	t
369	99	Habitación matrimonial	disponible	220000.00	https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80	Habitación matrimonial	1 cama doble	2	t
370	99	Suite con vista	disponible	110000.00	https://images.unsplash.com/photo-1611892441198-45b1a0a3b7f4?w=800&q=80	Suite con vista	1 cama doble	2	t
371	99	Habitación sencilla	disponible	220000.00	https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80	Habitación sencilla	1 cama sencilla	1	t
372	99	Habitación doble estándar	disponible	220000.00	https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=800&q=80	Habitación doble estándar	1 cama doble	2	t
373	100	Suite con vista	disponible	170000.00	https://images.unsplash.com/photo-1611892441198-45b1a0a3b7f4?w=800&q=80	Suite con vista	1 cama doble	2	t
374	100	Habitación sencilla	disponible	90000.00	https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80	Habitación sencilla	1 cama sencilla	1	t
375	100	Habitación doble estándar	disponible	110000.00	https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=800&q=80	Habitación doble estándar	1 cama doble	2	t
376	100	Suite familiar	disponible	170000.00	https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80	Suite familiar	2 camas dobles	4	t
377	101	Habitación sencilla	disponible	110000.00	https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80	Habitación sencilla	1 cama sencilla	1	t
378	101	Habitación doble estándar	disponible	170000.00	https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=800&q=80	Habitación doble estándar	1 cama doble	2	t
379	101	Suite familiar	disponible	220000.00	https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80	Suite familiar	2 camas dobles	4	t
380	101	Habitación con balcón	disponible	130000.00	https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80	Habitación con balcón	1 cama doble	2	t
381	102	Habitación doble estándar	disponible	130000.00	https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=800&q=80	Habitación doble estándar	1 cama doble	2	t
382	102	Suite familiar	disponible	110000.00	https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80	Suite familiar	2 camas dobles	4	t
383	102	Habitación con balcón	disponible	170000.00	https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80	Habitación con balcón	1 cama doble	2	t
384	102	Habitación matrimonial	disponible	150000.00	https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80	Habitación matrimonial	1 cama doble	2	t
385	103	Suite familiar	disponible	90000.00	https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80	Suite familiar	2 camas dobles	4	t
386	103	Habitación con balcón	disponible	190000.00	https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80	Habitación con balcón	1 cama doble	2	t
387	103	Habitación matrimonial	disponible	260000.00	https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80	Habitación matrimonial	1 cama doble	2	t
388	103	Suite con vista	disponible	90000.00	https://images.unsplash.com/photo-1611892441198-45b1a0a3b7f4?w=800&q=80	Suite con vista	1 cama doble	2	t
389	104	Habitación con balcón	disponible	150000.00	https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80	Habitación con balcón	1 cama doble	2	t
390	104	Habitación matrimonial	disponible	90000.00	https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80	Habitación matrimonial	1 cama doble	2	t
711	189	Habitación Estándar Superior	disponible	210000.00	https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=800&q=80	Habitación Estándar Superior	1 cama doble	2	t
712	189	Suite Ejecutiva	disponible	270000.00	https://images.unsplash.com/photo-1611892441198-45b1a0a3b7f4?w=800&q=80	Suite Ejecutiva	1 cama doble	2	t
713	189	Habitación Familiar con Vista al Jardín	disponible	240000.00	https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80	Habitación Familiar con Vista al Jardín	2 camas dobles	4	t
714	190	Habitación Doble Tradicional	disponible	130000.00	https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80	Habitación Doble Tradicional	1 cama doble	2	t
715	190	Habitación Triple Superior	disponible	170000.00	https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&q=80	Habitación Triple Superior	3 camas sencillas	3	t
716	191	Habitación Cabaña con Chimenea	disponible	260000.00	https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80	Habitación Cabaña con Chimenea	1 cama doble	2	t
717	191	Suite Panorámica con Vista a la Laguna	disponible	300000.00	https://images.unsplash.com/photo-1591088398332-8a7791972843?w=800&q=80	Suite Panorámica con Vista a la Laguna	1 cama doble	2	t
718	192	Habitación Matrimonial Rústica	disponible	140000.00	https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800&q=80	Habitación Matrimonial Rústica	1 cama doble	2	t
719	192	Cabaña Familiar Ecológica	disponible	180000.00	https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800&q=80	Cabaña Familiar Ecológica	2 camas dobles	4	t
720	193	Habitación Doble Confort	disponible	160000.00	https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=800&q=80	Habitación Doble Confort	1 cama doble	2	t
721	193	Habitación Familiar Premium	disponible	200000.00	https://images.unsplash.com/photo-1611892441198-45b1a0a3b7f4?w=800&q=80	Habitación Familiar Premium	2 camas dobles	4	t
722	194	Habitación Sencilla Estándar	disponible	110000.00	https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80	Habitación Sencilla Estándar	1 cama sencilla	1	t
723	194	Habitación Doble Twin	disponible	150000.00	https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&q=80	Habitación Doble Twin	2 camas sencillas	2	t
724	195	Habitación Superior Frente al Mar	disponible	280000.00	https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80	Habitación Superior Frente al Mar	1 cama doble	2	t
725	195	Suite Del Mar con Balcón	disponible	340000.00	https://images.unsplash.com/photo-1591088398332-8a7791972843?w=800&q=80	Suite Del Mar con Balcón	1 cama doble	2	t
726	196	Habitación Doble Ejecutiva	disponible	170000.00	https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80	Habitación Doble Ejecutiva	1 cama doble	2	t
727	196	Suite Familiar con Aire Acondicionado	disponible	210000.00	https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800&q=80	Suite Familiar con Aire Acondicionado	2 camas dobles	4	t
729	197	Suite Termal Especial	disponible	460000.00	https://images.unsplash.com/photo-1611892441198-45b1a0a3b7f4?w=800&q=80	Suite Termal Especial	1 cama doble	2	t
730	198	Cabaña Pareja con Termales	disponible	240000.00	https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80	Cabaña Pareja con Termales	1 cama doble	2	t
731	198	Cabaña Familiar con Jacuzzi Termal	disponible	280000.00	https://images.unsplash.com/photo-1591088398332-8a7791972843?w=800&q=80	Cabaña Familiar con Jacuzzi Termal	2 camas dobles	4	t
728	197	Habitación Standard Lake View	ocupada	380000.00	https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=800&q=80	Habitación Standard Lake View	1 cama doble	2	t
536	144	Habitación doble estándar	ocupada	90000.00	https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=800&q=80	Habitación doble estándar	1 cama doble	2	t
504	136	Suite con vista	disponible	220000.00	https://images.unsplash.com/photo-1611892441198-45b1a0a3b7f4?w=800&q=80	Suite con vista	1 cama doble	2	t
505	136	Habitación sencilla	disponible	190000.00	https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80	Habitación sencilla	1 cama sencilla	1	t
506	136	Habitación doble estándar	disponible	220000.00	https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=800&q=80	Habitación doble estándar	1 cama doble	2	t
507	136	Suite familiar	disponible	220000.00	https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80	Suite familiar	2 camas dobles	4	t
508	137	Habitación sencilla	disponible	110000.00	https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80	Habitación sencilla	1 cama sencilla	1	t
509	137	Habitación doble estándar	disponible	90000.00	https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=800&q=80	Habitación doble estándar	1 cama doble	2	t
510	137	Suite familiar	disponible	220000.00	https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80	Suite familiar	2 camas dobles	4	t
511	137	Habitación con balcón	disponible	190000.00	https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80	Habitación con balcón	1 cama doble	2	t
512	138	Habitación doble estándar	disponible	150000.00	https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=800&q=80	Habitación doble estándar	1 cama doble	2	t
513	138	Suite familiar	disponible	150000.00	https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80	Suite familiar	2 camas dobles	4	t
514	138	Habitación con balcón	disponible	150000.00	https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80	Habitación con balcón	1 cama doble	2	t
515	138	Habitación matrimonial	disponible	260000.00	https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80	Habitación matrimonial	1 cama doble	2	t
516	139	Suite familiar	disponible	170000.00	https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80	Suite familiar	2 camas dobles	4	t
517	139	Habitación con balcón	disponible	260000.00	https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80	Habitación con balcón	1 cama doble	2	t
518	139	Habitación matrimonial	disponible	150000.00	https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80	Habitación matrimonial	1 cama doble	2	t
519	139	Suite con vista	disponible	110000.00	https://images.unsplash.com/photo-1611892441198-45b1a0a3b7f4?w=800&q=80	Suite con vista	1 cama doble	2	t
520	140	Habitación con balcón	disponible	110000.00	https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80	Habitación con balcón	1 cama doble	2	t
521	140	Habitación matrimonial	disponible	90000.00	https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80	Habitación matrimonial	1 cama doble	2	t
522	140	Suite con vista	disponible	90000.00	https://images.unsplash.com/photo-1611892441198-45b1a0a3b7f4?w=800&q=80	Suite con vista	1 cama doble	2	t
523	140	Habitación sencilla	disponible	110000.00	https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80	Habitación sencilla	1 cama sencilla	1	t
524	141	Habitación matrimonial	disponible	130000.00	https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80	Habitación matrimonial	1 cama doble	2	t
525	141	Suite con vista	disponible	220000.00	https://images.unsplash.com/photo-1611892441198-45b1a0a3b7f4?w=800&q=80	Suite con vista	1 cama doble	2	t
526	141	Habitación sencilla	disponible	260000.00	https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80	Habitación sencilla	1 cama sencilla	1	t
527	141	Habitación doble estándar	disponible	260000.00	https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=800&q=80	Habitación doble estándar	1 cama doble	2	t
528	142	Suite con vista	disponible	90000.00	https://images.unsplash.com/photo-1611892441198-45b1a0a3b7f4?w=800&q=80	Suite con vista	1 cama doble	2	t
529	142	Habitación sencilla	disponible	130000.00	https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80	Habitación sencilla	1 cama sencilla	1	t
530	142	Habitación doble estándar	disponible	220000.00	https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=800&q=80	Habitación doble estándar	1 cama doble	2	t
531	142	Suite familiar	disponible	90000.00	https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80	Suite familiar	2 camas dobles	4	t
532	143	Habitación sencilla	disponible	170000.00	https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80	Habitación sencilla	1 cama sencilla	1	t
533	143	Habitación doble estándar	disponible	220000.00	https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=800&q=80	Habitación doble estándar	1 cama doble	2	t
534	143	Suite familiar	disponible	260000.00	https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80	Suite familiar	2 camas dobles	4	t
535	143	Habitación con balcón	disponible	130000.00	https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80	Habitación con balcón	1 cama doble	2	t
537	144	Suite familiar	disponible	90000.00	https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80	Suite familiar	2 camas dobles	4	t
539	144	Habitación matrimonial	disponible	90000.00	https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80	Habitación matrimonial	1 cama doble	2	t
540	145	Suite familiar	disponible	130000.00	https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80	Suite familiar	2 camas dobles	4	t
541	145	Habitación con balcón	disponible	90000.00	https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80	Habitación con balcón	1 cama doble	2	t
543	145	Suite con vista	disponible	130000.00	https://images.unsplash.com/photo-1611892441198-45b1a0a3b7f4?w=800&q=80	Suite con vista	1 cama doble	2	t
545	146	Habitación matrimonial	disponible	220000.00	https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80	Habitación matrimonial	1 cama doble	2	t
546	146	Suite con vista	disponible	110000.00	https://images.unsplash.com/photo-1611892441198-45b1a0a3b7f4?w=800&q=80	Suite con vista	1 cama doble	2	t
549	147	Suite con vista	disponible	220000.00	https://images.unsplash.com/photo-1611892441198-45b1a0a3b7f4?w=800&q=80	Suite con vista	1 cama doble	2	t
550	147	Habitación sencilla	disponible	190000.00	https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80	Habitación sencilla	1 cama sencilla	1	t
551	147	Habitación doble estándar	disponible	170000.00	https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=800&q=80	Habitación doble estándar	1 cama doble	2	t
552	148	Suite con vista	disponible	150000.00	https://images.unsplash.com/photo-1611892441198-45b1a0a3b7f4?w=800&q=80	Suite con vista	1 cama doble	2	t
553	148	Habitación sencilla	disponible	170000.00	https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80	Habitación sencilla	1 cama sencilla	1	t
554	148	Habitación doble estándar	disponible	220000.00	https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=800&q=80	Habitación doble estándar	1 cama doble	2	t
555	148	Suite familiar	disponible	130000.00	https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80	Suite familiar	2 camas dobles	4	t
556	149	Habitación sencilla	disponible	260000.00	https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80	Habitación sencilla	1 cama sencilla	1	t
557	149	Habitación doble estándar	disponible	190000.00	https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=800&q=80	Habitación doble estándar	1 cama doble	2	t
558	149	Suite familiar	disponible	110000.00	https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80	Suite familiar	2 camas dobles	4	t
559	149	Habitación con balcón	disponible	90000.00	https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80	Habitación con balcón	1 cama doble	2	t
560	150	Habitación doble estándar	disponible	110000.00	https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=800&q=80	Habitación doble estándar	1 cama doble	2	t
561	150	Suite familiar	disponible	110000.00	https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80	Suite familiar	2 camas dobles	4	t
562	150	Habitación con balcón	disponible	150000.00	https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80	Habitación con balcón	1 cama doble	2	t
563	150	Habitación matrimonial	disponible	170000.00	https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80	Habitación matrimonial	1 cama doble	2	t
564	151	Suite familiar	disponible	150000.00	https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80	Suite familiar	2 camas dobles	4	t
565	151	Habitación con balcón	disponible	190000.00	https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80	Habitación con balcón	1 cama doble	2	t
566	151	Habitación matrimonial	disponible	170000.00	https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80	Habitación matrimonial	1 cama doble	2	t
567	151	Suite con vista	disponible	130000.00	https://images.unsplash.com/photo-1611892441198-45b1a0a3b7f4?w=800&q=80	Suite con vista	1 cama doble	2	t
568	152	Habitación con balcón	disponible	170000.00	https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80	Habitación con balcón	1 cama doble	2	t
569	152	Habitación matrimonial	disponible	90000.00	https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80	Habitación matrimonial	1 cama doble	2	t
570	152	Suite con vista	disponible	170000.00	https://images.unsplash.com/photo-1611892441198-45b1a0a3b7f4?w=800&q=80	Suite con vista	1 cama doble	2	t
571	152	Habitación sencilla	disponible	110000.00	https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80	Habitación sencilla	1 cama sencilla	1	t
572	153	Habitación matrimonial	disponible	110000.00	https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80	Habitación matrimonial	1 cama doble	2	t
573	153	Suite con vista	disponible	130000.00	https://images.unsplash.com/photo-1611892441198-45b1a0a3b7f4?w=800&q=80	Suite con vista	1 cama doble	2	t
574	153	Habitación sencilla	disponible	170000.00	https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80	Habitación sencilla	1 cama sencilla	1	t
544	146	Habitación con balcón	ocupada	150000.00	https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80	Habitación con balcón	1 cama doble	2	t
542	145	Habitación matrimonial	ocupada	110000.00	https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80	Habitación matrimonial	1 cama doble	2	t
538	144	Habitación con balcón	ocupada	190000.00	https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80	Habitación con balcón	1 cama doble	2	t
548	147	Habitación matrimonial	ocupada	110000.00	https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80	Habitación matrimonial	1 cama doble	2	t
547	146	Habitación sencilla	ocupada	150000.00	https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80	Habitación sencilla	1 cama sencilla	1	t
575	153	Habitación doble estándar	disponible	170000.00	https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=800&q=80	Habitación doble estándar	1 cama doble	2	t
576	154	Suite con vista	disponible	150000.00	https://images.unsplash.com/photo-1611892441198-45b1a0a3b7f4?w=800&q=80	Suite con vista	1 cama doble	2	t
577	154	Habitación sencilla	disponible	170000.00	https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80	Habitación sencilla	1 cama sencilla	1	t
578	154	Habitación doble estándar	disponible	260000.00	https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=800&q=80	Habitación doble estándar	1 cama doble	2	t
579	154	Suite familiar	disponible	170000.00	https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80	Suite familiar	2 camas dobles	4	t
580	155	Habitación sencilla	disponible	220000.00	https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80	Habitación sencilla	1 cama sencilla	1	t
581	155	Habitación doble estándar	disponible	170000.00	https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=800&q=80	Habitación doble estándar	1 cama doble	2	t
582	155	Suite familiar	disponible	90000.00	https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80	Suite familiar	2 camas dobles	4	t
615	165	Suite con vista	disponible	220000.00	https://images.unsplash.com/photo-1611892441198-45b1a0a3b7f4?w=800&q=80	Suite con vista	1 cama doble	2	t
616	165	Habitación sencilla	disponible	130000.00	https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80	Habitación sencilla	1 cama sencilla	1	t
617	165	Habitación doble estándar	disponible	150000.00	https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=800&q=80	Habitación doble estándar	1 cama doble	2	t
618	165	Suite familiar	disponible	130000.00	https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80	Suite familiar	2 camas dobles	4	t
619	166	Habitación sencilla	disponible	220000.00	https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80	Habitación sencilla	1 cama sencilla	1	t
620	166	Habitación doble estándar	disponible	90000.00	https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=800&q=80	Habitación doble estándar	1 cama doble	2	t
621	166	Suite familiar	disponible	130000.00	https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80	Suite familiar	2 camas dobles	4	t
622	166	Habitación con balcón	disponible	190000.00	https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80	Habitación con balcón	1 cama doble	2	t
623	167	Habitación doble estándar	disponible	150000.00	https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=800&q=80	Habitación doble estándar	1 cama doble	2	t
624	167	Suite familiar	disponible	170000.00	https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80	Suite familiar	2 camas dobles	4	t
625	167	Habitación con balcón	disponible	130000.00	https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80	Habitación con balcón	1 cama doble	2	t
626	167	Habitación matrimonial	disponible	110000.00	https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80	Habitación matrimonial	1 cama doble	2	t
627	168	Suite familiar	disponible	260000.00	https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80	Suite familiar	2 camas dobles	4	t
628	168	Habitación con balcón	disponible	150000.00	https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80	Habitación con balcón	1 cama doble	2	t
629	168	Habitación matrimonial	disponible	150000.00	https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80	Habitación matrimonial	1 cama doble	2	t
630	168	Suite con vista	disponible	260000.00	https://images.unsplash.com/photo-1611892441198-45b1a0a3b7f4?w=800&q=80	Suite con vista	1 cama doble	2	t
631	169	Habitación con balcón	disponible	150000.00	https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80	Habitación con balcón	1 cama doble	2	t
632	169	Habitación matrimonial	disponible	90000.00	https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80	Habitación matrimonial	1 cama doble	2	t
633	169	Suite con vista	disponible	150000.00	https://images.unsplash.com/photo-1611892441198-45b1a0a3b7f4?w=800&q=80	Suite con vista	1 cama doble	2	t
634	169	Habitación sencilla	disponible	220000.00	https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80	Habitación sencilla	1 cama sencilla	1	t
635	170	Habitación matrimonial	disponible	170000.00	https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80	Habitación matrimonial	1 cama doble	2	t
636	170	Suite con vista	disponible	190000.00	https://images.unsplash.com/photo-1611892441198-45b1a0a3b7f4?w=800&q=80	Suite con vista	1 cama doble	2	t
637	170	Habitación sencilla	disponible	220000.00	https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80	Habitación sencilla	1 cama sencilla	1	t
638	170	Habitación doble estándar	disponible	190000.00	https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=800&q=80	Habitación doble estándar	1 cama doble	2	t
639	171	Suite con vista	disponible	130000.00	https://images.unsplash.com/photo-1611892441198-45b1a0a3b7f4?w=800&q=80	Suite con vista	1 cama doble	2	t
640	171	Habitación sencilla	disponible	170000.00	https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80	Habitación sencilla	1 cama sencilla	1	t
641	171	Habitación doble estándar	disponible	90000.00	https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=800&q=80	Habitación doble estándar	1 cama doble	2	t
642	171	Suite familiar	disponible	110000.00	https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80	Suite familiar	2 camas dobles	4	t
643	172	Habitación sencilla	disponible	190000.00	https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80	Habitación sencilla	1 cama sencilla	1	t
644	172	Habitación doble estándar	disponible	220000.00	https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=800&q=80	Habitación doble estándar	1 cama doble	2	t
645	172	Suite familiar	disponible	110000.00	https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80	Suite familiar	2 camas dobles	4	t
646	172	Habitación con balcón	disponible	220000.00	https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80	Habitación con balcón	1 cama doble	2	t
647	173	Habitación doble estándar	disponible	90000.00	https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=800&q=80	Habitación doble estándar	1 cama doble	2	t
648	173	Suite familiar	disponible	220000.00	https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80	Suite familiar	2 camas dobles	4	t
649	173	Habitación con balcón	disponible	90000.00	https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80	Habitación con balcón	1 cama doble	2	t
650	173	Habitación matrimonial	disponible	150000.00	https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80	Habitación matrimonial	1 cama doble	2	t
651	174	Suite familiar	disponible	190000.00	https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80	Suite familiar	2 camas dobles	4	t
652	174	Habitación con balcón	disponible	190000.00	https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80	Habitación con balcón	1 cama doble	2	t
653	174	Habitación matrimonial	disponible	110000.00	https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80	Habitación matrimonial	1 cama doble	2	t
654	174	Suite con vista	disponible	170000.00	https://images.unsplash.com/photo-1611892441198-45b1a0a3b7f4?w=800&q=80	Suite con vista	1 cama doble	2	t
655	175	Habitación con balcón	disponible	220000.00	https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80	Habitación con balcón	1 cama doble	2	t
656	175	Habitación matrimonial	disponible	190000.00	https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80	Habitación matrimonial	1 cama doble	2	t
657	175	Suite con vista	disponible	220000.00	https://images.unsplash.com/photo-1611892441198-45b1a0a3b7f4?w=800&q=80	Suite con vista	1 cama doble	2	t
658	175	Habitación sencilla	disponible	170000.00	https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80	Habitación sencilla	1 cama sencilla	1	t
659	176	Habitación matrimonial	disponible	220000.00	https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80	Habitación matrimonial	1 cama doble	2	t
660	176	Suite con vista	disponible	220000.00	https://images.unsplash.com/photo-1611892441198-45b1a0a3b7f4?w=800&q=80	Suite con vista	1 cama doble	2	t
661	176	Habitación sencilla	disponible	130000.00	https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80	Habitación sencilla	1 cama sencilla	1	t
662	176	Habitación doble estándar	disponible	170000.00	https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=800&q=80	Habitación doble estándar	1 cama doble	2	t
663	177	Suite con vista	disponible	170000.00	https://images.unsplash.com/photo-1611892441198-45b1a0a3b7f4?w=800&q=80	Suite con vista	1 cama doble	2	t
664	177	Habitación sencilla	disponible	170000.00	https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80	Habitación sencilla	1 cama sencilla	1	t
665	177	Habitación doble estándar	disponible	150000.00	https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=800&q=80	Habitación doble estándar	1 cama doble	2	t
666	177	Suite familiar	disponible	220000.00	https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80	Suite familiar	2 camas dobles	4	t
667	178	Habitación sencilla	disponible	190000.00	https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80	Habitación sencilla	1 cama sencilla	1	t
668	178	Habitación doble estándar	disponible	260000.00	https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=800&q=80	Habitación doble estándar	1 cama doble	2	t
669	178	Suite familiar	disponible	260000.00	https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80	Suite familiar	2 camas dobles	4	t
670	178	Habitación con balcón	disponible	260000.00	https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80	Habitación con balcón	1 cama doble	2	t
671	179	Habitación doble estándar	disponible	260000.00	https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=800&q=80	Habitación doble estándar	1 cama doble	2	t
672	179	Suite familiar	disponible	130000.00	https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80	Suite familiar	2 camas dobles	4	t
673	179	Habitación con balcón	disponible	110000.00	https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80	Habitación con balcón	1 cama doble	2	t
674	179	Habitación matrimonial	disponible	170000.00	https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80	Habitación matrimonial	1 cama doble	2	t
675	180	Suite familiar	disponible	190000.00	https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80	Suite familiar	2 camas dobles	4	t
676	180	Habitación con balcón	disponible	110000.00	https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80	Habitación con balcón	1 cama doble	2	t
677	180	Habitación matrimonial	disponible	150000.00	https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80	Habitación matrimonial	1 cama doble	2	t
678	180	Suite con vista	disponible	170000.00	https://images.unsplash.com/photo-1611892441198-45b1a0a3b7f4?w=800&q=80	Suite con vista	1 cama doble	2	t
679	181	Habitación con balcón	disponible	130000.00	https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80	Habitación con balcón	1 cama doble	2	t
680	181	Habitación matrimonial	disponible	90000.00	https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80	Habitación matrimonial	1 cama doble	2	t
681	181	Suite con vista	disponible	90000.00	https://images.unsplash.com/photo-1611892441198-45b1a0a3b7f4?w=800&q=80	Suite con vista	1 cama doble	2	t
682	181	Habitación sencilla	disponible	150000.00	https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80	Habitación sencilla	1 cama sencilla	1	t
683	182	Habitación matrimonial	disponible	260000.00	https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80	Habitación matrimonial	1 cama doble	2	t
684	182	Suite con vista	disponible	220000.00	https://images.unsplash.com/photo-1611892441198-45b1a0a3b7f4?w=800&q=80	Suite con vista	1 cama doble	2	t
685	182	Habitación sencilla	disponible	150000.00	https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80	Habitación sencilla	1 cama sencilla	1	t
686	182	Habitación doble estándar	disponible	220000.00	https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=800&q=80	Habitación doble estándar	1 cama doble	2	t
687	183	Suite con vista	disponible	130000.00	https://images.unsplash.com/photo-1611892441198-45b1a0a3b7f4?w=800&q=80	Suite con vista	1 cama doble	2	t
688	183	Habitación sencilla	disponible	90000.00	https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80	Habitación sencilla	1 cama sencilla	1	t
689	183	Habitación doble estándar	disponible	110000.00	https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=800&q=80	Habitación doble estándar	1 cama doble	2	t
690	183	Suite familiar	disponible	220000.00	https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80	Suite familiar	2 camas dobles	4	t
691	184	Habitación sencilla	disponible	260000.00	https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80	Habitación sencilla	1 cama sencilla	1	t
692	184	Habitación doble estándar	disponible	90000.00	https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=800&q=80	Habitación doble estándar	1 cama doble	2	t
693	184	Suite familiar	disponible	150000.00	https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80	Suite familiar	2 camas dobles	4	t
694	184	Habitación con balcón	disponible	110000.00	https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80	Habitación con balcón	1 cama doble	2	t
695	185	Habitación con balcón	disponible	220000.00	https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80	Habitación con balcón	1 cama doble	2	t
696	185	Habitación matrimonial	disponible	150000.00	https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80	Habitación matrimonial	1 cama doble	2	t
698	185	Habitación sencilla	disponible	130000.00	https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80	Habitación sencilla	1 cama sencilla	1	t
699	186	Habitación sencilla	disponible	170000.00	https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80	Habitación sencilla	1 cama sencilla	1	t
700	186	Habitación doble estándar	disponible	190000.00	https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=800&q=80	Habitación doble estándar	1 cama doble	2	t
701	186	Suite familiar	disponible	260000.00	https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80	Suite familiar	2 camas dobles	4	t
702	186	Habitación con balcón	disponible	220000.00	https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80	Habitación con balcón	1 cama doble	2	t
703	187	Habitación doble estándar	disponible	150000.00	https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=800&q=80	Habitación doble estándar	1 cama doble	2	t
704	187	Suite familiar	disponible	220000.00	https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80	Suite familiar	2 camas dobles	4	t
705	187	Habitación con balcón	disponible	190000.00	https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80	Habitación con balcón	1 cama doble	2	t
706	187	Habitación matrimonial	disponible	170000.00	https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80	Habitación matrimonial	1 cama doble	2	t
707	188	Suite familiar	disponible	260000.00	https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80	Suite familiar	2 camas dobles	4	t
708	188	Habitación con balcón	disponible	220000.00	https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80	Habitación con balcón	1 cama doble	2	t
709	188	Habitación matrimonial	disponible	190000.00	https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80	Habitación matrimonial	1 cama doble	2	t
710	188	Suite con vista	disponible	260000.00	https://images.unsplash.com/photo-1611892441198-45b1a0a3b7f4?w=800&q=80	Suite con vista	1 cama doble	2	t
18	1	Suite de prueba	ocupada	900000.00	\N	Suite de prueba	1 cama doble	2	f
19	1	Suite de prueba	ocupada	900000.00	\N	Suite de prueba	1 cama doble	2	f
17	1	Suite de prueba	ocupada	900000.00	\N	Suite de prueba	1 cama doble	2	f
\.


--
-- Data for Name: hotel; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.hotel (id_hotel, id_destino, nombre, foto_referencia, direccion, descripcion, id_contacto, precio_promedio, porcentaje_ocupacion, fecha_registro, id_propietario, contacto, categoria, politicas, activo, id_solicitud) FROM stdin;
138	10	Posada Lago Calima	https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80	Calle Principal #8-20, Lago Calima	Vistas privilegiadas y ambiente tranquilo, a pocos minutos de las principales atracciones.	\N	177500.00	0.00	2026-09-13 11:20:37.063987	\N	\N	\N	\N	t	\N
2	2	Posada Cafetera Jardín	hotel2.jpg	Cra 3 #8-10, Jardín	Posada rústica dentro de una finca cafetera a las afueras del pueblo.	U002	220000.00	0.00	2026-08-20 21:21:04.432456	\N	\N	\N	\N	t	\N
84	2	Posada Jardín	https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80	Calle Principal #8-20, Jardín	Vistas privilegiadas y ambiente tranquilo, a pocos minutos de las principales atracciones.	\N	150000.00	0.00	2026-09-04 06:55:41.151311	\N	\N	\N	\N	t	\N
1	1	Hostal Vista Peñol	hotel1.jpg	Cl Principal #12-30, Guatapé	Hostal familiar con vista al embalse y zócalos típicos.	U002	614000.00	100.00	2026-08-20 21:21:04.432456	\N	\N	\N	\N	t	\N
4	4	Casa Colina Filandia	hotel4.jpg	Cl 7 #5-22, Filandia	Casa colonial restaurada con balcón sobre la plaza principal.	U003	205000.00	0.00	2026-08-20 21:21:04.432456	\N	\N	\N	\N	t	\N
139	10	Hostal Central Lago Calima	https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&q=80	Vía rural km 2, Lago Calima	Construcción tradicional con toques modernos, atención personalizada.	\N	172500.00	0.00	2026-09-13 11:20:37.063987	\N	\N	\N	\N	t	\N
85	2	Hostal Central Jardín	https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&q=80	Vía rural km 2, Jardín	Construcción tradicional con toques modernos, atención personalizada.	\N	127500.00	0.00	2026-09-04 06:55:41.151311	\N	\N	\N	\N	t	\N
189	9	Hotel Guadalajara de Buga	https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80	Calle 1 # 13-33, Buga	Hotel icónico con arquitectura colonial, amplias zonas verdes y piscina.	\N	240000.00	0.00	2026-09-13 12:00:33.725263	\N	\N	\N	\N	t	\N
165	32	Refugio El Cocuy	https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80	Cra 6 #10-15, centro de El Cocuy	Rodeado de naturaleza, perfecto para desconectarse.	\N	157500.00	0.00	2026-09-13 11:32:00.628519	\N	\N	\N	\N	t	\N
191	15	Chalet Suizo Sindamanoy	https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80	Vereda El Encano, Laguna La Cocha	Refugio de montaña estilo suizo frente a las frías aguas de la laguna.	\N	280000.00	0.00	2026-09-13 12:00:33.725263	\N	\N	\N	\N	t	\N
140	11	Refugio Buenaventura	https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80	Cra 6 #10-15, centro de Buenaventura	Rodeado de naturaleza, perfecto para desconectarse.	\N	100000.00	0.00	2026-09-13 11:20:37.063987	\N	\N	\N	\N	t	\N
190	9	Hotel San Fernando Buga	https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80	Carrera 13 # 4-50, Buga	Hospedaje acogedor ubicado a pocos pasos del centro histórico y la basílica.	\N	150000.00	0.00	2026-09-13 12:00:33.725263	\N	\N	\N	\N	t	\N
8	8	Finca Hostal San Agustín	hotel8.jpg	Vía Parque Arqueológico Km 3	Finca hostal rodeada de naturaleza, cerca a las estatuas precolombinas.	U004	185000.00	0.00	2026-08-20 21:21:04.432456	\N	\N	\N	\N	t	\N
3	3	Hostal Valle de Cocora	hotel3.jpg	Vía Salento - Cocora Km 2	Cabañas de madera cerca al valle, ideal para caminantes.	U003	220000.00	50.00	2026-08-20 21:21:04.432456	\N	\N	\N	\N	t	\N
5	5	Hotel Casona Barichara	hotel5.jpg	Cl 6 #6-30, Barichara	Casona de tapia pisada con patio interior y piscina.	U004	290000.00	50.00	2026-08-20 21:21:04.432456	\N	\N	\N	\N	t	\N
6	6	Hostal Colonial Leyva	hotel6.jpg	Cra 9 #12-18, Villa de Leyva	A dos cuadras de la plaza mayor, decoración típica boyacense.	U005	235000.00	50.00	2026-08-20 21:21:04.432456	\N	\N	\N	\N	t	\N
166	32	Casa Colonial El Cocuy	https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80	Calle 5 #3-40, El Cocuy	Ubicación céntrica, cerca de restaurantes y sitios turísticos.	\N	157500.00	0.00	2026-09-13 11:32:00.628519	\N	\N	\N	\N	t	\N
7	7	Hotel Portal de Mompox	hotel7.jpg	Cl del Medio #4-15, Mompox	Hotel colonial junto al río Magdalena, patio con aljibe.	U006	265000.00	50.00	2026-08-20 21:21:04.432456	\N	\N	\N	\N	t	\N
86	2	Refugio Jardín	https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80	Cra 6 #10-15, centro de Jardín	Rodeado de naturaleza, perfecto para desconectarse.	\N	152500.00	0.00	2026-09-04 06:55:41.151311	\N	\N	\N	\N	t	\N
87	2	Casa Colonial Jardín	https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800&q=80	Calle 5 #3-40, Jardín	Ubicación céntrica, cerca de restaurantes y sitios turísticos.	\N	157500.00	0.00	2026-09-04 06:55:41.151311	\N	\N	\N	\N	t	\N
192	15	Hostal Campestre La Cocha	https://images.unsplash.com/photo-1587061949409-02df41d5e562?w=800&q=80	Sector Embarcadero, El Encano	Alojamiento rústico ideal para conectar con la naturaleza de la región.	\N	160000.00	0.00	2026-09-13 12:00:33.725263	\N	\N	\N	\N	t	\N
141	11	Casa Colonial Buenaventura	https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800&q=80	Calle 5 #3-40, Buenaventura	Ubicación céntrica, cerca de restaurantes y sitios turísticos.	\N	217500.00	0.00	2026-09-13 11:20:37.063987	\N	\N	\N	\N	t	\N
167	32	Finca Hotel El Cocuy	https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80	Cra 3 #4-12, El Cocuy	Alojamiento acogedor cerca del centro, ideal para descansar.	\N	140000.00	0.00	2026-09-13 11:32:00.628519	\N	\N	\N	\N	t	\N
88	3	Finca Hotel Salento	https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80	Cra 3 #4-12, Salento	Alojamiento acogedor cerca del centro, ideal para descansar.	\N	157500.00	0.00	2026-09-04 06:55:41.151311	\N	\N	\N	\N	t	\N
193	16	Hotel Loft Las Lajas	https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80	Carrera 6 # 14-25, Ipiales	Hotel moderno y cómodo a poca distancia del famoso Santuario.	\N	180000.00	0.00	2026-09-13 12:00:33.725263	\N	\N	\N	\N	t	\N
142	11	Finca Hotel Buenaventura	https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80	Cra 3 #4-12, Buenaventura	Alojamiento acogedor cerca del centro, ideal para descansar.	\N	132500.00	0.00	2026-09-13 11:20:37.063987	\N	\N	\N	\N	t	\N
89	3	Mirador de Salento	https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80	Calle Principal #8-20, Salento	Vistas privilegiadas y ambiente tranquilo, a pocos minutos de las principales atracciones.	\N	157500.00	0.00	2026-09-04 06:55:41.151311	\N	\N	\N	\N	t	\N
168	32	Mirador de El Cocuy	https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&q=80	Calle Principal #8-20, El Cocuy	Vistas privilegiadas y ambiente tranquilo, a pocos minutos de las principales atracciones.	\N	205000.00	0.00	2026-09-13 11:32:00.628519	\N	\N	\N	\N	t	\N
194	16	Hotel Mayasquer	https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80	Avenida Panamericana, Ipiales	Hospedaje tradicional de fácil acceso para turistas y peregrinos.	\N	130000.00	0.00	2026-09-13 12:00:33.725263	\N	\N	\N	\N	t	\N
195	17	Hotel Resort Isla del Morro	https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&q=80	Playa El Morro, Tumaco	Resort frente al Mar Pacífico con acceso directo a la playa.	\N	310000.00	0.00	2026-09-13 12:00:33.725263	\N	\N	\N	\N	t	\N
196	17	Hotel Portete Tumaco	https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&q=80	Calle Comercio # 8-12, Tumaco	Ubicado en el centro comercial y gastronómico de Tumaco.	\N	190000.00	0.00	2026-09-13 12:00:33.725263	\N	\N	\N	\N	t	\N
143	11	Mirador de Buenaventura	https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80	Calle Principal #8-20, Buenaventura	Vistas privilegiadas y ambiente tranquilo, a pocos minutos de las principales atracciones.	\N	195000.00	0.00	2026-09-13 11:20:37.063987	\N	\N	\N	\N	t	\N
90	3	Hostal del Viajero Salento	https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80	Vía rural km 2, Salento	Construcción tradicional con toques modernos, atención personalizada.	\N	155000.00	0.00	2026-09-04 06:55:41.151311	\N	\N	\N	\N	t	\N
103	7	Hotel Mompox	https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&q=80	Cra 3 #4-12, Mompox	Alojamiento acogedor cerca del centro, ideal para descansar.	\N	157500.00	0.00	2026-09-04 06:55:41.151311	\N	\N	\N	\N	t	\N
169	33	Hostal del Viajero Desierto de Tatacoa	https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80	Vía rural km 2, Desierto de Tatacoa	Construcción tradicional con toques modernos, atención personalizada.	\N	152500.00	0.00	2026-09-13 11:32:00.628519	\N	\N	\N	\N	t	\N
91	3	Villa Salento	https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&q=80	Cra 6 #10-15, centro de Salento	Rodeado de naturaleza, perfecto para desconectarse.	\N	135000.00	0.00	2026-09-04 06:55:41.151311	\N	\N	\N	\N	t	\N
92	4	Cabañas Filandia	https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80	Calle 5 #3-40, Filandia	Ubicación céntrica, cerca de restaurantes y sitios turísticos.	\N	175000.00	0.00	2026-09-04 06:55:41.151311	\N	\N	\N	\N	t	\N
170	33	Villa Desierto de Tatacoa	https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800&q=80	Cra 6 #10-15, centro de Desierto de Tatacoa	Rodeado de naturaleza, perfecto para desconectarse.	\N	192500.00	0.00	2026-09-13 11:32:00.628519	\N	\N	\N	\N	t	\N
198	31	Cabañas Termales Sochagota	https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80	Calle 25 # 5-10, Paipa	Cabañas privadas con piscinas termales naturales para relajación total.	\N	260000.00	0.00	2026-09-13 12:00:33.725263	\N	\N	\N	\N	t	\N
93	4	Hotel Filandia	https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800&q=80	Cra 3 #4-12, Filandia	Alojamiento acogedor cerca del centro, ideal para descansar.	\N	130000.00	0.00	2026-09-04 06:55:41.151311	\N	\N	\N	\N	t	\N
145	28	Villa Santa Fe de Antioquia	https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&q=80	Cra 6 #10-15, centro de Santa Fe de Antioquia	Rodeado de naturaleza, perfecto para desconectarse.	\N	115000.00	25.00	2026-09-13 11:20:37.063987	\N	\N	\N	\N	t	\N
144	28	Hostal del Viajero Santa Fe de Antioquia	https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80	Vía rural km 2, Santa Fe de Antioquia	Construcción tradicional con toques modernos, atención personalizada.	\N	115000.00	50.00	2026-09-13 11:20:37.063987	\N	\N	\N	\N	t	\N
197	31	Hotel Estelar Paipa Hotel & Spa	https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80	Kilómetro 4 Vía Pantano de Vargas, Paipa	Hotel de lujo con circuito termal, spa y vista al lago Sochagota.	\N	420000.00	50.00	2026-09-13 12:00:33.725263	\N	\N	\N	\N	t	\N
171	33	Cabañas Desierto de Tatacoa	https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80	Calle 5 #3-40, Desierto de Tatacoa	Ubicación céntrica, cerca de restaurantes y sitios turísticos.	\N	125000.00	0.00	2026-09-13 11:32:00.628519	\N	\N	\N	\N	t	\N
94	4	Posada Filandia	https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80	Calle Principal #8-20, Filandia	Vistas privilegiadas y ambiente tranquilo, a pocos minutos de las principales atracciones.	\N	145000.00	0.00	2026-09-04 06:55:41.151311	\N	\N	\N	\N	t	\N
136	10	Cabañas Lago Calima	https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80	Calle 5 #3-40, Lago Calima	Ubicación céntrica, cerca de restaurantes y sitios turísticos.	\N	212500.00	0.00	2026-09-13 11:20:37.063987	\N	\N	\N	\N	t	\N
95	4	Hostal Central Filandia	https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80	Vía rural km 2, Filandia	Construcción tradicional con toques modernos, atención personalizada.	\N	162500.00	0.00	2026-09-04 06:55:41.151311	\N	\N	\N	\N	t	\N
172	33	Hotel Desierto de Tatacoa	https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80	Cra 3 #4-12, Desierto de Tatacoa	Alojamiento acogedor cerca del centro, ideal para descansar.	\N	185000.00	0.00	2026-09-13 11:32:00.628519	\N	\N	\N	\N	t	\N
96	5	Refugio Barichara	https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80	Cra 6 #10-15, centro de Barichara	Rodeado de naturaleza, perfecto para desconectarse.	\N	222500.00	0.00	2026-09-04 06:55:41.151311	\N	\N	\N	\N	t	\N
137	10	Hotel Lago Calima	https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80	Cra 3 #4-12, Lago Calima	Alojamiento acogedor cerca del centro, ideal para descansar.	\N	152500.00	0.00	2026-09-13 11:20:37.063987	\N	\N	\N	\N	t	\N
173	34	Posada Rivera	https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80	Calle Principal #8-20, Rivera	Vistas privilegiadas y ambiente tranquilo, a pocos minutos de las principales atracciones.	\N	137500.00	0.00	2026-09-13 11:32:00.628519	\N	\N	\N	\N	t	\N
97	5	Casa Colonial Barichara	https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&q=80	Calle 5 #3-40, Barichara	Ubicación céntrica, cerca de restaurantes y sitios turísticos.	\N	190000.00	0.00	2026-09-04 06:55:41.151311	\N	\N	\N	\N	t	\N
147	28	Hotel Santa Fe de Antioquia	https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800&q=80	Cra 3 #4-12, Santa Fe de Antioquia	Alojamiento acogedor cerca del centro, ideal para descansar.	\N	172500.00	25.00	2026-09-13 11:20:37.063987	\N	\N	\N	\N	t	\N
146	28	Cabañas Santa Fe de Antioquia	https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80	Calle 5 #3-40, Santa Fe de Antioquia	Ubicación céntrica, cerca de restaurantes y sitios turísticos.	\N	157500.00	50.00	2026-09-13 11:20:37.063987	\N	\N	\N	\N	t	\N
98	5	Finca Hotel Barichara	https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80	Cra 3 #4-12, Barichara	Alojamiento acogedor cerca del centro, ideal para descansar.	\N	142500.00	0.00	2026-09-04 06:55:41.151311	\N	\N	\N	\N	t	\N
174	34	Hostal Central Rivera	https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&q=80	Vía rural km 2, Rivera	Construcción tradicional con toques modernos, atención personalizada.	\N	165000.00	0.00	2026-09-13 11:32:00.628519	\N	\N	\N	\N	t	\N
99	6	Mirador de Villa de Leyva	https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800&q=80	Calle Principal #8-20, Villa de Leyva	Vistas privilegiadas y ambiente tranquilo, a pocos minutos de las principales atracciones.	\N	192500.00	0.00	2026-09-04 06:55:41.151311	\N	\N	\N	\N	t	\N
175	34	Refugio Rivera	https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80	Cra 6 #10-15, centro de Rivera	Rodeado de naturaleza, perfecto para desconectarse.	\N	200000.00	0.00	2026-09-13 11:32:00.628519	\N	\N	\N	\N	t	\N
148	29	Posada Cartagena de Indias	https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80	Calle Principal #8-20, Cartagena de Indias	Vistas privilegiadas y ambiente tranquilo, a pocos minutos de las principales atracciones.	\N	167500.00	0.00	2026-09-13 11:20:37.063987	\N	\N	\N	\N	t	\N
100	6	Hostal del Viajero Villa de Leyva	https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80	Vía rural km 2, Villa de Leyva	Construcción tradicional con toques modernos, atención personalizada.	\N	135000.00	0.00	2026-09-04 06:55:41.151311	\N	\N	\N	\N	t	\N
176	34	Casa Colonial Rivera	https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800&q=80	Calle 5 #3-40, Rivera	Ubicación céntrica, cerca de restaurantes y sitios turísticos.	\N	185000.00	0.00	2026-09-13 11:32:00.628519	\N	\N	\N	\N	t	\N
101	6	Villa Villa de Leyva	https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80	Cra 6 #10-15, centro de Villa de Leyva	Rodeado de naturaleza, perfecto para desconectarse.	\N	157500.00	0.00	2026-09-04 06:55:41.151311	\N	\N	\N	\N	t	\N
149	29	Hostal Central Cartagena de Indias	https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80	Vía rural km 2, Cartagena de Indias	Construcción tradicional con toques modernos, atención personalizada.	\N	162500.00	0.00	2026-09-13 11:20:37.063987	\N	\N	\N	\N	t	\N
102	7	Cabañas Mompox	https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80	Calle 5 #3-40, Mompox	Ubicación céntrica, cerca de restaurantes y sitios turísticos.	\N	140000.00	0.00	2026-09-04 06:55:41.151311	\N	\N	\N	\N	t	\N
177	35	Finca Hotel Parque de Café	https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80	Cra 3 #4-12, Parque de Café	Alojamiento acogedor cerca del centro, ideal para descansar.	\N	177500.00	0.00	2026-09-13 11:32:00.628519	\N	\N	\N	\N	t	\N
150	29	Refugio Cartagena de Indias	https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80	Cra 6 #10-15, centro de Cartagena de Indias	Rodeado de naturaleza, perfecto para desconectarse.	\N	135000.00	0.00	2026-09-13 11:20:37.063987	\N	\N	\N	\N	t	\N
178	35	Mirador de Parque de Café	https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80	Calle Principal #8-20, Parque de Café	Vistas privilegiadas y ambiente tranquilo, a pocos minutos de las principales atracciones.	\N	242500.00	0.00	2026-09-13 11:32:00.628519	\N	\N	\N	\N	t	\N
104	7	Posada Mompox	https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80	Calle Principal #8-20, Mompox	Vistas privilegiadas y ambiente tranquilo, a pocos minutos de las principales atracciones.	\N	120000.00	0.00	2026-09-04 06:55:41.151311	\N	\N	\N	\N	t	\N
151	29	Casa Colonial Cartagena de Indias	https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&q=80	Calle 5 #3-40, Cartagena de Indias	Ubicación céntrica, cerca de restaurantes y sitios turísticos.	\N	160000.00	0.00	2026-09-13 11:20:37.063987	\N	\N	\N	\N	t	\N
179	35	Hostal del Viajero Parque de Café	https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80	Vía rural km 2, Parque de Café	Construcción tradicional con toques modernos, atención personalizada.	\N	167500.00	0.00	2026-09-13 11:32:00.628519	\N	\N	\N	\N	t	\N
152	30	Finca Hotel San Basilio de Palenque	https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80	Cra 3 #4-12, San Basilio de Palenque	Alojamiento acogedor cerca del centro, ideal para descansar.	\N	135000.00	0.00	2026-09-13 11:20:37.063987	\N	\N	\N	\N	t	\N
153	30	Mirador de San Basilio de Palenque	https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800&q=80	Calle Principal #8-20, San Basilio de Palenque	Vistas privilegiadas y ambiente tranquilo, a pocos minutos de las principales atracciones.	\N	145000.00	0.00	2026-09-13 11:20:37.063987	\N	\N	\N	\N	t	\N
180	35	Villa Parque de Café	https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&q=80	Cra 6 #10-15, centro de Parque de Café	Rodeado de naturaleza, perfecto para desconectarse.	\N	155000.00	0.00	2026-09-13 11:32:00.628519	\N	\N	\N	\N	t	\N
181	36	Cabañas San Gil	https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80	Calle 5 #3-40, San Gil	Ubicación céntrica, cerca de restaurantes y sitios turísticos.	\N	115000.00	0.00	2026-09-13 11:32:00.628519	\N	\N	\N	\N	t	\N
154	30	Hostal del Viajero San Basilio de Palenque	https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80	Vía rural km 2, San Basilio de Palenque	Construcción tradicional con toques modernos, atención personalizada.	\N	187500.00	0.00	2026-09-13 11:20:37.063987	\N	\N	\N	\N	t	\N
155	30	Villa San Basilio de Palenque	https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80	Cra 6 #10-15, centro de San Basilio de Palenque	Rodeado de naturaleza, perfecto para desconectarse.	\N	160000.00	0.00	2026-09-13 11:20:37.063987	\N	\N	\N	\N	t	\N
182	36	Hotel San Gil	https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800&q=80	Cra 3 #4-12, San Gil	Alojamiento acogedor cerca del centro, ideal para descansar.	\N	212500.00	0.00	2026-09-13 11:32:00.628519	\N	\N	\N	\N	t	\N
183	36	Posada San Gil	https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80	Calle Principal #8-20, San Gil	Vistas privilegiadas y ambiente tranquilo, a pocos minutos de las principales atracciones.	\N	137500.00	0.00	2026-09-13 11:32:00.628519	\N	\N	\N	\N	t	\N
184	36	Hostal Central San Gil	https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80	Vía rural km 2, San Gil	Construcción tradicional con toques modernos, atención personalizada.	\N	152500.00	0.00	2026-09-13 11:32:00.628519	\N	\N	\N	\N	t	\N
185	37	Refugio Chicamocha	https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80	Cra 6 #10-15, centro de Chicamocha	Rodeado de naturaleza, perfecto para desconectarse.	\N	190000.00	0.00	2026-09-13 11:32:00.628519	\N	\N	\N	\N	t	\N
186	37	Casa Colonial Chicamocha	https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&q=80	Calle 5 #3-40, Chicamocha	Ubicación céntrica, cerca de restaurantes y sitios turísticos.	\N	210000.00	0.00	2026-09-13 11:32:00.628519	\N	\N	\N	\N	t	\N
187	37	Finca Hotel Chicamocha	https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80	Cra 3 #4-12, Chicamocha	Alojamiento acogedor cerca del centro, ideal para descansar.	\N	182500.00	0.00	2026-09-13 11:32:00.628519	\N	\N	\N	\N	t	\N
188	37	Mirador de Chicamocha	https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800&q=80	Calle Principal #8-20, Chicamocha	Vistas privilegiadas y ambiente tranquilo, a pocos minutos de las principales atracciones.	\N	232500.00	0.00	2026-09-13 11:32:00.628519	\N	\N	\N	\N	t	\N
\.


--
-- Data for Name: solicitud_admin; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.solicitud_admin (id_solicitud, nombre, apellidos, documento, cargo, correo, telefono, password_hash, nombre_hotel, direccion_hotel, contacto_hotel, categoria, descripcion, politicas, id_destino, estado, resuelta_por, motivo_rechazo, fecha_registro, fecha_resolucion) FROM stdin;
\.


--
-- Data for Name: transporte; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.transporte (id_transporte, id_destino, descripcion, contacto, foto_referencia) FROM stdin;
1	1	Buses desde el Terminal del Norte de Medellín, 1h15 aprox.	3001112233	\N
2	2	Buses desde Medellín (Terminal Sur) o Andes, 3h30 aprox.	3002223344	\N
3	3	Buses desde Armenia o Pereira, 45 min. Jeeps Willys al Valle de Cocora.	3003334455	\N
4	4	Buses desde Armenia, 30 min aprox.	3004445566	\N
5	5	Buses desde San Gil o Bucaramanga, 1h aprox.	3005556677	\N
6	6	Buses desde Tunja o Bogotá, 3h aprox.	3006667788	\N
7	7	Buses desde Cartagena vía Magangué, 4h con cruce en ferry.	3007778899	\N
8	8	Buses desde Neiva o Pitalito, 3h aprox.	3008889900	\N
9	9	Buses directos desde el Terminal de Cali o Palmira, 1h aprox.	3009990011	\N
10	10	Buses o chivas desde Buga o Darién, 1h30 aprox.	3001010101	\N
11	11	Buses desde Cali por la vía al Mar, 2h30 aprox.	3001111111	\N
12	15	Lanchas desde el embarcadero de El Encano o buses desde Pasto, 40 min.	3001515151	\N
13	16	Taxis colectivos o buses desde el Terminal de Ipiales, 20 min.	3001616161	\N
14	17	Buses desde Pasto o vuelos directos al Aeropuerto La Florida.	3001717171	\N
15	28	Buses desde el Terminal del Norte de Medellín por el Túnel de Occidente, 1h.	3002828282	\N
16	29	Vuelos directos al Aeropuerto Rafael Núñez o buses intermunicipales.	3002929292	\N
17	30	Buses o chivas intermunicipales desde el Terminal de Cartagena, 1h30.	3003030303	\N
18	31	Buses desde Tunja o Duitama, 45 min aprox.	3003131313	\N
19	32	Buses desde Tunja hasta la cabecera municipal de El Cocuy, 8h aprox.	3003232323	\N
20	33	Camionetas 4x4 o mototaxis desde Villavieja o Neiva, 45 min.	3003333333	\N
21	34	Buses urbanos o taxis intermunicipales desde el Terminal de Neiva, 20 min.	3003434343	\N
22	35	Buses urbanos desde el Terminal de Armenia o Montenegro, 30 min.	3003535353	\N
23	36	Buses directos desde Bucaramanga o Bogotá (Terminal Salitre), 2h30 desde Bucaramanga.	3003636363	\N
24	37	Buses desde Bucaramanga vía San Gil o teleférico desde la Estación Mesa de los Santos.	3003737373	\N
\.


--
-- Data for Name: usuario; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.usuario (id_usuario, nombre, apellidos, ciudad, direccion, correo, telefono, rol, contrasena, fecha_registro, aprobado, documento, activo) FROM stdin;
1013	sofia	gaviria	bogota	calle 77	sofi@example.com	393202	usuario	$2b$12$c/ptRcTbBgnvxtPhcu0K5u01czuKaVV/vgwuKARlGSyM6eLBWbHo2	2026-09-13 19:53:11.344	f	\N	t
U2610	Angela	Gaviria	Bogota	Calle 77	angela.gaviria.sena@gmail.com	30112929111	usuario	$2b$12$LKO92tosKg7Eoi4ip426leioAmt5pL1WmCWkVMscFfaSFvayzUBBe	2026-09-13 21:19:45.174283	f	\N	t
U6948	taliana	lozada	bogota	calle 45	taliana@gmail.com	24435667	usuario	$2b$12$PlRmuCNdyWbG5Clr/7KEpesRqstlcD/Om5GdUNmLKV8xyJivvDE92	2026-09-13 21:46:30.230625	f	\N	t
U7428	Johan	Falla	Boyaca	Calle 22 sur	johanf@gmail.com	304457000000	usuario	$2b$12$jZeI9o0.MJfBJcMIwBJq4udcu2NaZLUmRY7jJTrnAP7YtXzeKSZYi	2026-09-14 17:13:13.549681	f	\N	t
string	string	string	string	string	user@example.com	string	usuario	$2b$12$j16KU8UrspRfC0qo.94rEO09OvRUj.3WRlSsEPdjC92CQGaKxZ5Gy	2026-09-17 20:19:50.252456	f	\N	t
U5686	laura	bolaños	bogota	cll 87	laura@gmail.com	3241025698	usuario	$2b$12$RTM0bQJi74uqsfgU.dv0v.ysk/QPhgqF2jTRb3FXUpudUJHRwlZG.	2026-09-17 20:21:18.393514	f	\N	t
253678	laura	gutierrez	bogota	cll 89	lau3ra@gmail.com	3241025695	usuario	$2b$12$UCtvEk1lDasFf8ZaWEUXaOyjYCVF3cFtht12Q9ouwv6gQwrSOS/Y.	2026-09-23 22:27:11.355374	f	\N	t
U002	Andrés	Gómez Torres	Medellín	Cl 33 #70-20	andres.gomez@correo.com	3122345678	usuario	$2b$12$hashuser002	2026-08-20 21:21:04.432456	f	\N	f
U003	Laura	Martínez Ruiz	Armenia	Av 6N #23-45	laura.martinez@correo.com	3153456789	usuario	$2b$12$hashuser003	2026-08-20 21:21:04.432456	f	\N	f
U004	Santiago	Vargas León	Bucaramanga	Cl 10 #5-30	santiago.vargas@correo.com	3184567890	usuario	$2b$12$hashuser004	2026-08-20 21:21:04.432456	f	\N	f
U005	Valentina	Herrera Castro	Tunja	Cra 7 #12-15	valentina.h@correo.com	3167890123	usuario	$2b$12$hashuser005	2026-08-20 21:21:04.432456	f	\N	f
U006	Mateo	Sánchez Ortiz	Cartagena	Cl 22 #18-40	mateo.sanchez@correo.com	3196789012	usuario	$2b$12$hashuser006	2026-08-20 21:21:04.432456	f	\N	f
invitado	Usuario	Invitado	No especificada	No especificada	invitado@tuapp.com	0	usuario	sin-login	2026-09-13 11:01:03.097648	f	\N	f
U001	Camila	Rojas Pérez	Bogotá	Cra 15 #45-12	camila.rojas@correo.com	3011234567	super_admin	$2b$12$hashadmin001	2026-08-20 21:21:04.432456	f	\N	f
\.


--
-- Data for Name: viaje_habitacion; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.viaje_habitacion (id_vh, id_vp, id_habitacion, personas_asignadas, precio_noche, fechas, activa) FROM stdin;
1	20	548	1	110000.00	[2026-09-02,2026-09-20)	f
2	27	1	1	150000.00	[2026-10-10,2026-10-12)	f
3	17	544	1	150000.00	[2026-09-03,2026-09-19)	f
4	12	18	1	900000.00	[2026-09-10,2026-09-23)	f
5	18	542	1	110000.00	[2026-09-19,2026-09-24)	f
6	2	6	1	300000.00	[2026-10-01,2026-10-04)	f
7	15	19	1	900000.00	[2026-09-11,2026-09-17)	f
8	13	17	1	900000.00	[2026-09-12,2026-09-17)	f
9	21	547	1	150000.00	[2026-09-03,2026-09-19)	f
10	5	14	1	320000.00	[2026-09-20,2026-09-22)	f
11	19	538	1	190000.00	[2026-09-30,2026-10-16)	f
12	8	1	1	150000.00	[2026-09-01,2026-09-06)	f
13	28	722	1	110000.00	[2026-10-09,2026-10-23)	f
14	6	15	1	130000.00	[2026-08-01,2026-08-03)	f
15	16	536	1	90000.00	[2026-09-29,2026-09-30)	f
16	4	12	1	280000.00	[2026-12-05,2026-12-08)	t
17	1	1	1	150000.00	[2026-09-10,2026-09-13)	f
18	22	728	1	380000.00	[2026-09-22,2026-10-01)	f
19	3	9	1	200000.00	[2026-11-15,2026-11-17)	t
20	14	2	1	220000.00	[2026-09-11,2026-09-19)	f
21	7	1	1	150000.00	[2026-09-01,2026-09-06)	f
\.


--
-- Data for Name: viaje_personalizado; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.viaje_personalizado (id_vp, id_usuario, id_habitacion, id_destino, fecha_inicial, fecha_final, precio, estado, fecha_registro, id_hotel, num_personas) FROM stdin;
3	U004	9	5	2026-11-15	2026-11-17	400000.00	reservado	2026-08-20 21:21:04.432456	5	1
4	U005	12	6	2026-12-05	2026-12-08	840000.00	reservado	2026-08-20 21:21:04.432456	6	1
6	U001	15	8	2026-08-01	2026-08-03	260000.00	finalizado	2026-08-20 21:21:04.432456	8	1
7	U002	1	1	2026-09-01	2026-09-06	750000.00	cancelado	2026-08-20 21:48:00.214949	1	1
1	U002	1	1	2026-09-10	2026-09-13	450000.00	finalizado	2026-08-20 21:21:04.432456	1	1
2	U003	6	3	2026-10-01	2026-10-04	900000.00	finalizado	2026-08-20 21:21:04.432456	3	1
5	U006	14	7	2026-09-20	2026-09-22	640000.00	finalizado	2026-08-20 21:21:04.432456	7	1
8	U002	1	1	2026-09-01	2026-09-06	750000.00	finalizado	2026-08-27 08:31:36.108163	1	1
12	invitado	18	1	2026-09-10	2026-09-23	11700000.00	finalizado	2026-09-13 20:50:33.235667	1	1
13	U2610	17	1	2026-09-12	2026-09-17	4500000.00	finalizado	2026-09-13 21:19:45.533618	1	1
14	U2610	2	1	2026-09-11	2026-09-19	1760000.00	finalizado	2026-09-13 21:20:48.521202	1	1
15	U2610	19	1	2026-09-11	2026-09-17	5400000.00	finalizado	2026-09-13 21:21:10.144422	1	1
16	U2610	536	28	2026-09-29	2026-09-30	90000.00	finalizado	2026-09-13 21:22:14.334924	144	1
17	U2610	544	28	2026-09-03	2026-09-19	2400000.00	finalizado	2026-09-13 21:28:03.824219	146	1
18	U2610	542	28	2026-09-19	2026-09-24	550000.00	finalizado	2026-09-13 21:32:58.113278	145	1
19	U2610	538	28	2026-09-30	2026-10-16	3040000.00	finalizado	2026-09-13 21:42:13.364703	144	1
20	U2610	548	28	2026-09-02	2026-09-20	1980000.00	finalizado	2026-09-13 21:42:34.241656	147	1
21	U6948	547	28	2026-09-03	2026-09-19	2400000.00	finalizado	2026-09-13 21:46:59.327698	146	1
22	U7428	728	31	2026-09-22	2026-10-01	3420000.00	finalizado	2026-09-14 17:13:21.422076	197	1
27	U002	1	1	2026-10-10	2026-10-12	300000.00	finalizado	2026-09-25 15:10:56.912235	1	1
28	U5686	722	16	2026-10-09	2026-10-23	1540000.00	finalizado	2026-10-01 14:42:37.986143	194	1
\.


--
-- Name: ferias_id_feria_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.ferias_id_feria_seq', 21, true);


--
-- Name: solicitud_admin_id_solicitud_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.solicitud_admin_id_solicitud_seq', 1, false);


--
-- Name: viaje_habitacion_id_vh_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.viaje_habitacion_id_vh_seq', 21, true);


--
-- Name: viaje_personalizado_id_vp_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.viaje_personalizado_id_vp_seq', 28, true);


--
-- Name: viaje_personalizado chk_vp_estado; Type: CHECK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE public.viaje_personalizado
    ADD CONSTRAINT chk_vp_estado CHECK (((estado)::text = ANY ((ARRAY['reservado'::character varying, 'cancelado'::character varying, 'finalizado'::character varying])::text[]))) NOT VALID;


--
-- Name: viaje_personalizado chk_vp_fechas; Type: CHECK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE public.viaje_personalizado
    ADD CONSTRAINT chk_vp_fechas CHECK ((fecha_final > fecha_inicial)) NOT VALID;


--
-- Name: actividades pk_actividades; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.actividades
    ADD CONSTRAINT pk_actividades PRIMARY KEY (id_actividades);


--
-- Name: deptos pk_deptos; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.deptos
    ADD CONSTRAINT pk_deptos PRIMARY KEY (id_depto);


--
-- Name: destinos pk_destinos; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.destinos
    ADD CONSTRAINT pk_destinos PRIMARY KEY (id_destino);


--
-- Name: ferias pk_ferias; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ferias
    ADD CONSTRAINT pk_ferias PRIMARY KEY (id_feria);


--
-- Name: gastronomia pk_gastronomia; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gastronomia
    ADD CONSTRAINT pk_gastronomia PRIMARY KEY (id_gastronomia);


--
-- Name: habitacion pk_habitacion; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.habitacion
    ADD CONSTRAINT pk_habitacion PRIMARY KEY (id_habitacion);


--
-- Name: hotel pk_hotel; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hotel
    ADD CONSTRAINT pk_hotel PRIMARY KEY (id_hotel);


--
-- Name: transporte pk_transporte; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transporte
    ADD CONSTRAINT pk_transporte PRIMARY KEY (id_transporte);


--
-- Name: usuario pk_usuario; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuario
    ADD CONSTRAINT pk_usuario PRIMARY KEY (id_usuario);


--
-- Name: viaje_personalizado pk_viaje_personalizado; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.viaje_personalizado
    ADD CONSTRAINT pk_viaje_personalizado PRIMARY KEY (id_vp);


--
-- Name: viaje_habitacion sin_cruce_fechas; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.viaje_habitacion
    ADD CONSTRAINT sin_cruce_fechas EXCLUDE USING gist (id_habitacion WITH =, fechas WITH &&) WHERE (activa);


--
-- Name: solicitud_admin solicitud_admin_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.solicitud_admin
    ADD CONSTRAINT solicitud_admin_pkey PRIMARY KEY (id_solicitud);


--
-- Name: viaje_habitacion viaje_habitacion_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.viaje_habitacion
    ADD CONSTRAINT viaje_habitacion_pkey PRIMARY KEY (id_vh);


--
-- Name: idx_vh_vp; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_vh_vp ON public.viaje_habitacion USING btree (id_vp);


--
-- Name: ux_solicitud_pendiente; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX ux_solicitud_pendiente ON public.solicitud_admin USING btree (lower((correo)::text)) WHERE ((estado)::text = 'pendiente'::text);


--
-- Name: v_hotel _RETURN; Type: RULE; Schema: public; Owner: -
--

CREATE OR REPLACE VIEW public.v_hotel AS
 SELECT h.id_hotel,
    h.id_destino,
    h.id_propietario,
    h.nombre,
    h.foto_referencia,
    h.direccion,
    h.descripcion,
    h.contacto,
    h.categoria,
    h.politicas,
    h.activo,
    h.fecha_registro,
    count(v.id_habitacion) AS total_habitaciones,
    COALESCE(round(avg(v.precio), 0), (0)::numeric) AS precio_promedio,
    count(*) FILTER (WHERE v.ocupada) AS habitaciones_ocupadas,
        CASE
            WHEN (count(v.id_habitacion) = 0) THEN (0)::numeric
            ELSE round(((100.0 * (count(*) FILTER (WHERE v.ocupada))::numeric) / (count(v.id_habitacion))::numeric), 2)
        END AS porcentaje_ocupacion
   FROM (public.hotel h
     LEFT JOIN public.v_habitacion v ON ((v.id_hotel = h.id_hotel)))
  WHERE h.activo
  GROUP BY h.id_hotel;


--
-- Name: viaje_personalizado trg_sync_habitaciones; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_sync_habitaciones AFTER UPDATE OF estado ON public.viaje_personalizado FOR EACH ROW EXECUTE FUNCTION public.sincronizar_habitaciones_viaje();


--
-- Name: viaje_habitacion trg_validar_capacidad; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_validar_capacidad BEFORE INSERT OR UPDATE ON public.viaje_habitacion FOR EACH ROW EXECUTE FUNCTION public.validar_capacidad_habitacion();


--
-- Name: actividades fk_actividades_destino; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.actividades
    ADD CONSTRAINT fk_actividades_destino FOREIGN KEY (id_destino) REFERENCES public.destinos(id_destino);


--
-- Name: destinos fk_destinos_depto; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.destinos
    ADD CONSTRAINT fk_destinos_depto FOREIGN KEY (id_depto) REFERENCES public.deptos(id_depto);


--
-- Name: ferias fk_ferias_depto; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ferias
    ADD CONSTRAINT fk_ferias_depto FOREIGN KEY (id_depto) REFERENCES public.deptos(id_depto);


--
-- Name: ferias fk_ferias_destino; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ferias
    ADD CONSTRAINT fk_ferias_destino FOREIGN KEY (id_destino) REFERENCES public.destinos(id_destino);


--
-- Name: gastronomia fk_gastronomia_destino; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gastronomia
    ADD CONSTRAINT fk_gastronomia_destino FOREIGN KEY (id_destino) REFERENCES public.destinos(id_destino);


--
-- Name: habitacion fk_habitacion_hotel; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.habitacion
    ADD CONSTRAINT fk_habitacion_hotel FOREIGN KEY (id_hotel) REFERENCES public.hotel(id_hotel);


--
-- Name: hotel fk_hotel_destino; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hotel
    ADD CONSTRAINT fk_hotel_destino FOREIGN KEY (id_destino) REFERENCES public.destinos(id_destino);


--
-- Name: transporte fk_transporte_destino; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transporte
    ADD CONSTRAINT fk_transporte_destino FOREIGN KEY (id_destino) REFERENCES public.destinos(id_destino);


--
-- Name: viaje_personalizado fk_vp_destino; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.viaje_personalizado
    ADD CONSTRAINT fk_vp_destino FOREIGN KEY (id_destino) REFERENCES public.destinos(id_destino);


--
-- Name: viaje_personalizado fk_vp_habitacion; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.viaje_personalizado
    ADD CONSTRAINT fk_vp_habitacion FOREIGN KEY (id_habitacion) REFERENCES public.habitacion(id_habitacion);


--
-- Name: viaje_personalizado fk_vp_usuario; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.viaje_personalizado
    ADD CONSTRAINT fk_vp_usuario FOREIGN KEY (id_usuario) REFERENCES public.usuario(id_usuario);


--
-- Name: hotel hotel_id_propietario_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hotel
    ADD CONSTRAINT hotel_id_propietario_fkey FOREIGN KEY (id_propietario) REFERENCES public.usuario(id_usuario) ON DELETE SET NULL;


--
-- Name: hotel hotel_id_solicitud_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hotel
    ADD CONSTRAINT hotel_id_solicitud_fkey FOREIGN KEY (id_solicitud) REFERENCES public.solicitud_admin(id_solicitud) ON DELETE SET NULL;


--
-- Name: solicitud_admin solicitud_admin_id_destino_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.solicitud_admin
    ADD CONSTRAINT solicitud_admin_id_destino_fkey FOREIGN KEY (id_destino) REFERENCES public.destinos(id_destino);


--
-- Name: solicitud_admin solicitud_admin_resuelta_por_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.solicitud_admin
    ADD CONSTRAINT solicitud_admin_resuelta_por_fkey FOREIGN KEY (resuelta_por) REFERENCES public.usuario(id_usuario) ON DELETE SET NULL;


--
-- Name: viaje_habitacion viaje_habitacion_id_habitacion_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.viaje_habitacion
    ADD CONSTRAINT viaje_habitacion_id_habitacion_fkey FOREIGN KEY (id_habitacion) REFERENCES public.habitacion(id_habitacion);


--
-- Name: viaje_habitacion viaje_habitacion_id_vp_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.viaje_habitacion
    ADD CONSTRAINT viaje_habitacion_id_vp_fkey FOREIGN KEY (id_vp) REFERENCES public.viaje_personalizado(id_vp) ON DELETE CASCADE;


--
-- Name: viaje_personalizado viaje_personalizado_id_hotel_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.viaje_personalizado
    ADD CONSTRAINT viaje_personalizado_id_hotel_fkey FOREIGN KEY (id_hotel) REFERENCES public.hotel(id_hotel);


--
-- PostgreSQL database dump complete
--

\unrestrict 0tmadc4b3FAbxiUbVtojliVtGbM1ZwsmCrVBgCKngJW4pfNSzWeA752DpvieKnO

