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
        slug: "Optimus_Price",
        name: "Optimus Price pra Inetum",
        description: "Es un proyecto orientado a la optimización de precios mediante análisis y modelado de datos para mejorar la rentabilidad. Participé en el tratamiento, estructuración y explotación de datos para apoyar la toma de decisiones basada en análisis cuantitativo.",
        tech: ["Python",  "SQL","PowerBi"],
        url: "",
      },
       {
        slug: "Marketin Mix",
        name: "Marketing Mix pra Inetum",
        description: "Marketing Mix es una plataforma de Marketing Mix Modeling (MMM) que analiza el impacto de cada canal en las ventas y optimiza la asignación presupuestaria mediante modelos estadísticos.",
        tech: ["Python",  "FastAPI","Docker / Cloud Run"],
        url: "",
      }
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
