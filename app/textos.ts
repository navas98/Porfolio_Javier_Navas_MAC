// ─── Calendario ──────────────────────────────────────────────────────────────

export type CalCompany = "everis" | "inetum" | "nfq";
export type CalCategory = CalCompany | "personal";

export interface CalEvent {
  id: string;
  title: string;
  category: CalCategory;
  problema: string;
  solucion: string;
  aprendizaje: string;
  start: Date;
  end?: Date;
  color: string;
}

export const calendarEvents: CalEvent[] = [
  {
    id: "everis",
    title: "Prácticas — Everis",
    category: "everis",
    problema: "Gestión manual de bajas de líneas móviles de Orange, proceso lento y propenso a errores.",
    solucion: "Desarrollé un proceso automatizado que detectaba las bajas y ejecutaba las acciones necesarias sin intervención manual.",
    aprendizaje: "Primera toma de contacto con entornos empresariales reales y automatización de procesos de negocio.",
    start: new Date(2018, 2, 1),
    end: new Date(2018, 5, 30),
    color: "#07f1b7",
  },
  {
    id: "optimus",
    title: "Optimus Price — Inetum",
    category: "inetum",
    problema: "Los precios se fijaban sin un modelo cuantitativo claro, lo que generaba pérdidas de margen.",
    solucion: "Construí pipelines de análisis y modelado de datos para identificar patrones de precio óptimos.",
    aprendizaje: "Aprendí a estructurar proyectos de datos orientados a negocio y a comunicar insights a stakeholders no técnicos.",
    start: new Date(2024, 9, 1),
    end: new Date(2025, 6, 31),
    color: "#818cf8",
  },
  
  {
    id: "Incorporacion_NFQ",
    title: "Incorporación a NFQ - New Joiner",
    category: "nfq",
    problema: "Inicio de una nueva etapa profesional con el reto de adaptarme a una nueva empresa, conocer la cultura organizacional, los procesos internos y establecer relaciones con el equipo.",
    solucion: "La empresa organizó un onboarding en una casa rural con otros compañeros para facilitar la interacción y el conocimiento del equipo.",
    aprendizaje: "La experiencia permitió entender la importancia de la comunicación y la confianza para colaborar eficazmente en proyectos técnicos.",
    start: new Date(2025, 9, 27),
    end: new Date(2025, 10, 31),
    color: "#c084fc",
  },
  
  
];

export const calendarCompanies: { key: CalCompany; label: string; color: string }[] = [
  { key: "everis", label: "Everis", color: "#07f1b7" },
  { key: "inetum", label: "Inetum", color: "#818cf8" },
  { key: "nfq",    label: "NFQ",    color: "#c084fc" },
];

// ─────────────────────────────────────────────────────────────────────────────

export const textos = {
  meta: {
    title: "Portfolio · Javier Navas",
    description: "Portfolio personal de Javier Navas, Ingeniero Informático y Desarrollador Full Stack.",
  },

  nav: {
    logo: "JN",
    githubUrl: "https://github.com/navas98",
    links: [
      { label: "Sobre mí", href: "#sobre-mi" },
      { label: "Proyectos", href: "#proyectos" },
      { label: "Contacto", href: "#contacto" },
    ],
  },

  hero: {
    greeting: "Hola, soy",
    name: "Javier Navas",
    roles: [
      "Ingeniero Informático",
      "Desarrollador Full Stack",
      "Desarrollador Frontend",
    ],
    ctas: {
      proyectos: "Ver proyectos",
      cv: "Descargar CV",
      cvUrl: "/cv.pdf",
      contacto: "Contactar",
    },
    scroll: "scroll",
  },

  // ─── TERMINAL ────────────────────────────────────────────────────────────────
  terminal: {
    prompt: "visitor@javier.dev",

    about: [
      "Hola, soy Javier Navas.",
      "Ingeniero Informático apasionado por construir productos digitales con buen código y mejor diseño.",
      "Me especializo en desarrollo Full Stack, con foco en el frontend y experiencia de usuario.",
      "Siempre buscando nuevos retos que combinen tecnología y creatividad.",
    ],


    // ── Proyectos ────────────────────────────────────────────────────────────
    proyectos: [
      {
        slug: "Arcadiax",
        name: "Arcadiax",
        description: "ArcadiaX es un ecosistema tecnológico personal que integra sistemas distribuidos, inteligencia artificial y hardware conectado para crear una infraestructura doméstica unificada orientada al control, la automatización y la experiencia multimedia",
        tech: ["React", "TypeScript", "Node.js"],
        url: "https://proyecto1.com",
      },
      {
        slug: "Automatizacion_Francia",
        name: "Automatizacion Fichero Francia para NFQ",
        description: "Desarrollo de un sistema para automatizar cálculos de NAV, control de FX y validaciones financieras mediante Excel + scripts de validación.",
        tech: ["Python",  "PostgreSQL","Excel"],
        url: "",
      },
       {
        slug: "Pipeline_PositionHoldings",
        name: "Pipeline PositionHoldings para NFQ",
        description: "Diseño y optimización del proceso de migración, validación y carga de datos de posiciones financieras entre AWS y BigQuery, incluyendo checks automáticos e integridad de esquemas.",
        tech: ["Python",  "PostgreSQL","BigQuery"],
        url: "",
      },
      {
        slug: "Incorporacion a NFQ - New Joiner",
        name: "Optimus Price pra Inetum",
        description: "Es un proyecto orientado a la optimización de precios mediante análisis y modelado de datos para mejorar la rentabilidad. Participé en el tratamiento, estructuración y explotación de datos para apoyar la toma de decisiones basada en análisis cuantitativo.",
        tech: ["Python",  "SQL","PowerBi"],
        url: "",
      },
       
    ],

    // ── Estudios ─────────────────────────────────────────────────────────────
    estudios: [
      {
        slug: "grado-informatica",
        titulo: "Grado en Ingeniería Informática",
        centro: "En la universidad he adquirido una base sólida en arquitectura de computadores, sistemas operativos, redes y estructuras de datos, comprendiendo cómo funcionan los sistemas desde el hardware hasta el software. Además, he desarrollado capacidad para diseñar, implementar y analizar sistemas fiables y eficientes, aplicando principios de ingeniería en proyectos reales.",
        periodo: "2018 – 2026",
      },
      {
        slug: "DAM",
        titulo: "Desarrollo de aplicaciones multiplataforma",
        centro: "En el ciclo de Desarrollo de Aplicaciones Multiplataforma (DAM) adquirí experiencia en programación orientada a objetos, desarrollo de aplicaciones móviles y de escritorio, y diseño de bases de datos relacionales. Además, aprendí a estructurar proyectos completos siguiendo buenas prácticas, trabajando con APIs, entornos cliente-servidor y despliegues básicos en entornos reales.",
        periodo: "2016 – 2018",
      },
    ],

    // ── Trabajos ─────────────────────────────────────────────────────────────
    trabajos: [
      {
        slug: "Everis",
        empresa: "Everis",
        rol: "En practicas",
        periodo: "Marzo 2018 - Junio 2018 ",
        descripcion: "Mi responsabilidad consistía en desarrollar un proceso automatizado para gestionar la baja de las líneas móviles de Orange.",
        },
        {
        slug: "Inetum",
        empresa: "Inetum",
        rol: "Desarrollador de Sistemas de Inteligencia Artificial",
        periodo: "Octubre 2024 - Julio 2025 ",
        descripcion: "En Inetum desarrollé soluciones de inteligencia artificial y backend, integrando modelos de visión artificial en aplicaciones móviles y construyendo APIs y sistemas de análisis de datos orientados a producción.",
        proyectos:"Proyectos: {Optimus price, Marketing Mix} "
        },
        {
        slug: "NFQ",
        empresa: "NFQ",
        rol: "Consultor en banca",
        periodo: "Octubre 2025 - Actual ",
        descripcion: "En NFQ Advisory Solutions trabajo en ingeniería de datos financiera, desarrollando y optimizando pipelines entre AWS y BigQuery. Automatizo procesos críticos, validaciones y migraciones de datos en entornos cloud.",
        proyectos:"Proyectos: {Automatización Francia, Pipeline PositionHoldings} "
        },
    ],
  },
};
