import type { Dictionary } from "./fr";

export const es: Dictionary = {
  nav: {
    home: "Inicio",
    services: "Servicios",
    salon: "La barbería",
    salons: "Nuestras barberías",
    about: "Quiénes somos",
    careers: "Empleo",
    contact: "Contacto",
    label: "Navegación principal",
    homeLabel: "Seven Barbershop, inicio",
    openMenu: "Abrir el menú",
    closeMenu: "Cerrar el menú",
    footerLabel: "Enlaces útiles",
    language: "Idioma",
  },
  notFound: {
    eyebrow: "Error 404",
    title: "Esta página no existe.",
    back: "Volver al inicio",
  },
  format: {
    duration: (minutes: number) => {
      const hours = Math.floor(minutes / 60);
      const rest = minutes % 60;
      if (!hours) return `${rest} min`;
      return rest ? `${hours} h ${rest}` : `${hours} h`;
    },
    range: (from: string, to: string) => `de ${from} a ${to}`,
    time: (hours: number, minutes: number) =>
      `${hours}:${String(minutes).padStart(2, "0")}`,
    from: (price: string) => `Desde ${price}`,
    onQuote: "Bajo presupuesto",
  },
  hours: {
    days: ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"],
    open: (first: string, last: string, opens: string, closes: string) =>
      first === last
        ? `${first[0].toUpperCase()}${first.slice(1)}, ${opens} – ${closes}`
        : `De ${first} a ${last}, ${opens} – ${closes}`,
    closed: (days: string[]) =>
      `Cerrado ${days.map((day) => `el ${day}`).join(" y ")}`,
  },
  lightbox: {
    enlarge: (title: string) => `Ampliar la foto: ${title}`,
    close: "Cerrar el visor",
    previous: "Foto anterior",
    next: "Foto siguiente",
  },
  home: {
    eyebrow: "Barbería en Saint-Étienne y Niza",
    heroCopy:
      "Corte, barba y afeitado tradicional en barberías con espíritu de club inglés. El oficio del barbero, una atención auténtica y una experiencia pensada para ti.",
    ctaBook: "Reservar mi cita",
    ctaServices: "Ver los servicios",
    highlights: {
      salons: "barberías",
      cities: "ciudades",
      reviews: "reseñas en Planity",
      booking: "reserva en línea",
      bookingValue: "24/7",
    },
    servicesEyebrow: "El oficio Seven",
    servicesTitle: "El detalle, en cada cita.",
    servicesIntro:
      "Clásicos dominados a la perfección, adaptados a tu estilo. Los precios varían según la barbería.",
    servicesLink: "Ver todos los servicios",
    spiritAlt:
      "Sillones de barbero capitoné, paredes verde esmeralda y banco de cuero en una barbería Seven Barbershop",
    spiritEyebrow: "El espíritu Seven",
    spiritTitle: "Una dirección, un ambiente, un oficio.",
    spiritText:
      "Un espacio cálido y cuidado, pensado para ti: un ambiente elegante, impulsado por la energía de la ciudad. Aquí no hay prisa. Ponte cómodo, tómate tu tiempo: en Seven, estás como en casa.",
    spiritLink: "Conocer al equipo",
    lookbookEyebrow: "Nuestros trabajos",
    lookbookTitle: "Firmado Seven.",
    lookbookIntro:
      "Burst fade, low taper, degradados y barbas perfiladas: el oficio de nuestros barberos, corte tras corte.",
    lookbookLink: "Ver todo el lookbook",
    lookbookLabel: "Trabajos de los barberos de Seven Barbershop",
    locationsEyebrow: "Cerca de ti",
    locationsTitle: (count: number) => `${count} direcciones, dos ciudades.`,
    locationsIntro:
      "Tres barberías en Saint-Étienne y dos en Niza. Elige la tuya y reserva en segundos en Planity.",
    cardAlt: (name: string, city: string) =>
      `Barbería Seven Barbershop ${name} en ${city}`,
    discover: "Descubrir",
    bookingTitle: "Tu próxima cita te espera.",
    bookingButton: "Reservar ahora",
  },
  services: {
    eyebrow: "Nuestro oficio",
    title: "Los clásicos, a tu manera.",
    description:
      "Cada cita empieza escuchándote con atención y termina cuidando hasta el último detalle.",
    items: {
      "01": {
        name: "Corte",
        description:
          "Con tijera o máquina, con acabados precisos. Tarifas para adultos, estudiantes y niños, y corte de cambio de look.",
      },
      "02": {
        name: "Barba",
        description:
          "Arreglo exprés con máquina o arreglo clásico con cuidados: contornos limpios y barba bien definida.",
      },
      "03": {
        name: "Afeitado tradicional",
        description:
          "El ritual del barbero: afeitado tradicional con toalla caliente y acabados cuidados.",
      },
      "04": {
        name: "Corte y barba",
        description:
          "La fórmula completa para salir impecable, con una tarifa especial para estudiantes menores de 25 años.",
      },
      "05": {
        name: "Fórmula con cuidados",
        description:
          "Corte y barba completados con un tratamiento con toalla caliente. Un verdadero momento para ti.",
      },
      "06": {
        name: "Twists, color y alisado",
        description:
          "Twists y color, además de desrizado y alisado brasileño en Niza Meyerbeer. Solo con cita previa.",
      },
    },
    appointmentOnly: "Solo con cita previa",
    ctaText:
      "Los precios varían según la barbería: encontrarás la carta completa en la página de cada una.",
    ctaButton: "Elegir mi barbería",
  },
  salonPage: {
    eyebrow: "El espíritu Seven",
    title: "Un verdadero momento, más allá del corte.",
    description:
      "Un ambiente cuidado, gestos precisos y el gusto por el trabajo bien hecho.",
    storyTitle: "Lo clásico, con carácter.",
    storyText:
      "Cuero, madera, billar y conversaciones sin protocolo: nuestras barberías cultivan el espíritu del barbero en un ambiente acogedor. Nos tomamos el tiempo de escucharte y de encontrar el estilo que va contigo.",
    storyAlt:
      "Billar y sillones de barbero de cuero en una barbería Seven Barbershop",
    teamEyebrow: "El equipo",
    teamTitle: "Barberos, no máquinas.",
    teamIntro:
      "Polos bordados con los colores de la casa, manos seguras y conversación de verdad: conoce a quienes hacen Seven cada día.",
    teamLabel: "Fotos del equipo de Seven Barbershop",
    lookbookEyebrow: "Nuestros trabajos",
    lookbookTitle: "El lookbook Seven.",
    lookbookIntro:
      "Burst fade, low taper, degradados y barbas perfiladas: algunos cortes firmados por nuestros barberos. Selecciona una foto para ampliarla.",
    ctaText: "¿Te inspira un corte? Enséñaselo a tu barbero.",
    ctaButton: "Reservar en mi barbería",
    detailsEyebrow: "En imágenes",
    detailsTitle: "Los detalles marcan la experiencia.",
    detailsLabel: "Detalles de las barberías Seven Barbershop",
  },
  locations: {
    eyebrow: "Nuestras direcciones",
    title: "Seven, cerca de ti.",
    description:
      "Encuentra nuestras barberías en Saint-Étienne y en Niza. Elige la dirección que más te convenga.",
    count: (count: number) =>
      `${String(count).padStart(2, "0")} barbería${count > 1 ? "s" : ""}`,
    discover: "Descubrir",
    book: "Reservar",
    bookLabel: (name: string, city: string) =>
      `Reservar en la barbería ${name} de ${city} en Planity`,
    contact: "Contactar",
    contactLabel: (name: string, city: string) =>
      `Contactar con la barbería ${name} de ${city}`,
  },
  about: {
    eyebrow: "Quiénes somos",
    title: "Seven Barbershop, tu barbero en Saint-Étienne y Niza.",
    description:
      "Cinco barberías, una misma exigencia: el oficio del barbero tradicional al servicio de tu estilo.",
    storyEyebrow: "Nuestra historia",
    storyText:
      "Seven Barbershop reúne tres barberías en Saint-Étienne —rue du 11 Novembre, place Jean Jaurès y place Chavanelle— y dos en Niza, en el puerto y en la rue Meyerbeer.",
    mottoBefore: "En todas partes, el mismo lema: ",
    mottoAfter:
      ". Nuestros barberos mantienen vivos los gestos de la tradición francesa del barbero, del corte a medida al afeitado con toalla caliente, en barberías con ambiente de club inglés.",
    valuesEyebrow: "Nuestros valores",
    valuesTitle: "Lo que hace única la experiencia Seven.",
    values: [
      {
        name: "El oficio",
        description:
          "Corte con tijera o máquina, arreglo de barba, afeitado tradicional con toalla caliente: los gestos del barbero, ejecutados con precisión.",
        label: "The Old French School",
      },
      {
        name: "La escucha",
        description:
          "Cada cita empieza con una conversación para entender tu estilo, tu tipo de cabello y lo que esperas de tu barbero.",
        label: "Trust your barber",
      },
      {
        name: "El espacio",
        description:
          "Sillones de cuero capitoné, madera y paredes verde esmeralda: barberías pensadas para tomarse su tiempo, como en un club inglés.",
        label: "Un verdadero momento para ti",
      },
    ],
    citiesEyebrow: "Nuestros barberos en",
    discoverLabel: (name: string, city: string) =>
      `Descubrir la barbería ${name} de ${city}`,
    faqEyebrow: "Preguntas frecuentes",
    faqTitle: "Todo sobre Seven.",
    faq: [
      {
        question: "¿Dónde están las barberías Seven Barbershop?",
        answer:
          "Seven Barbershop tiene cinco barberías. En Saint-Étienne: 12 rue du 11 Novembre (Anatole France), 1 place Jean Jaurès y 17 place Chavanelle. En Niza: 1 boulevard Carnot, en el puerto, y 4 rue Meyerbeer.",
      },
      {
        question: "¿Qué servicios ofrece Seven Barbershop?",
        answer:
          "Corte para adultos, estudiantes y niños, corte de cambio de look, arreglo de barba, afeitado tradicional con toalla caliente, fórmulas de corte y barba con o sin cuidados, además de twists y color, solo con cita previa.",
      },
      {
        question: "¿Cuáles son los precios?",
        answer:
          "El corte está disponible desde 14 €, el arreglo de barba desde 10 € y la fórmula de corte y barba desde 25 €. Los precios varían según la barbería: la carta completa aparece en la página de cada una.",
      },
      {
        question: "¿Cuál es el horario de apertura?",
        answer:
          "Anatole France y place Chavanelle: de lunes a sábado, de 9:00 a 19:00. Jean Jaurès: de martes a sábado, de 10:00 a 20:00. Le Port: de martes a sábado, de 9:30 a 19:00. Rue Meyerbeer: de lunes a sábado, de 9:30 a 19:00. Todas las barberías cierran los domingos.",
      },
      {
        question: "¿Cómo reservo una cita?",
        answer:
          "Cada barbería tiene su página de reserva en Planity, disponible 24 horas. Elige tu servicio y tu horario, y recibe una confirmación inmediata. El pago se realiza en la barbería.",
      },
    ],
    ctaText: "¿Listo para sentarte en el sillón?",
    ctaButton: "Elegir mi barbería",
  },
  contact: {
    eyebrow: "Contacto",
    title: "¿Nos vemos en la barbería?",
    description:
      "¿Una pregunta, una idea, una sugerencia? Escríbenos: el equipo de Seven lee cada mensaje.",
    citiesEyebrow: "Nuestras ciudades",
    citiesTitle: "Dos ciudades, cinco direcciones.",
    formEyebrow: "¿Alguna sugerencia?",
    formTitle: "Escríbenos.",
    disclaimer:
      "Tu opinión nos ayuda a mejorar. Para pedir cita, reserva directamente en línea en la barbería que prefieras.",
    name: "Tu nombre",
    email: "Tu correo electrónico",
    phone: "Tu teléfono",
    phoneHint:
      "Un número de teléfono, por ejemplo 06 12 34 56 78 o +33 6 12 34 56 78",
    salon: "Barbería (opcional)",
    allSalons: "Todas las barberías",
    message: "Tu mensaje",
    send: "Enviar mi mensaje",
    sendingButton: "Enviando…",
    status: {
      idle: "",
      sending: "Enviando…",
      sent: "¡Gracias! Tu mensaje se ha enviado al equipo de Seven.",
      error:
        "No se ha podido enviar el mensaje. Comprueba tu conexión e inténtalo de nuevo.",
    },
  },
  careers: {
    eyebrow: "Empleo",
    title: "Únete al equipo Seven.",
    description:
      "Cinco barberías, dos ciudades, una misma pasión: convertir el oficio de barbero en un arte, y transmitirlo.",
    heroCta: "Postularme",
    heroAlt:
      "El equipo de barberos de Seven Barbershop con polos verdes bordados, reunido en la barbería",
    whyEyebrow: "Por qué Seven",
    whyTitle: "Un oficio, una casa, un equipo.",
    perks: [
      {
        title: "Barberías excepcionales",
        text: "Trabaja en barberías cálidas y cuidadas en Saint-Étienne y en Niza, pensadas tanto para el cliente como para el barbero.",
      },
      {
        title: "La transmisión",
        text: "En Seven, la pasión por el oficio se transmite: técnicas, gestos, mirada. Crecemos juntos, junto a barberos experimentados.",
      },
      {
        title: "Una clientela fiel",
        text: "Más de 2.700 reseñas en Planity: una clientela que vuelve y que confía en nuestros barberos.",
      },
      {
        title: "Espíritu de equipo",
        text: "Polos bordados, gestos compartidos y buen ambiente: un equipo unido con los colores de la casa.",
      },
    ],
    lifeEyebrow: "La vida en Seven",
    lifeTitle: "El día a día de un barbero Seven.",
    lifeLabel: "Fotos del equipo de Seven Barbershop trabajando",
    profileEyebrow: "Tu perfil",
    profileTitle: "Lo que nos importa.",
    profile: [
      "Pasión por el oficio y cuidado del detalle",
      "Gusto por el trato con la gente y capacidad de escucha",
      "Dominio de los degradados y del arreglo de barba, o ganas de aprenderlo",
      "Buena presencia, puntualidad y espíritu de equipo",
    ],
    quote: "Un buen barbero no solo corta el pelo: crea un vínculo de confianza.",
    formEyebrow: "Candidatura",
    formTitle: "Preséntate.",
    formIntro:
      "Seas barbero con experiencia o estés empezando, envíanos tu candidatura. Las estudiamos todas con atención.",
    city: "Ciudad preferida",
    anyCity: "Saint-Étienne o Niza",
    experience: "Tu experiencia",
    experienceLevels: [
      "Aprendiz o en formación",
      "Menos de 2 años",
      "De 2 a 5 años",
      "Más de 5 años",
    ],
    portfolio: "Tus trabajos (enlace de Instagram o portfolio, opcional)",
    cv: "Tu CV (opcional)",
    cvButton: "Adjuntar mi CV",
    cvHint: "PDF, Word o imagen · 5 MB máximo",
    cvWrongType: "Formato no admitido. Adjunta un PDF, un documento Word o una imagen.",
    cvTooLarge: "El archivo supera los 5 MB. Adjunta un CV más ligero.",
    message: "Háblanos de ti",
    send: "Enviar mi candidatura",
    sent: "¡Gracias! Tu candidatura se ha enviado al equipo de Seven.",
  },
  salon: {
    bookOnPlanity: "Reservar en Planity",
    ratingLabel: (rating: string) => `Valoración de ${rating} sobre 5`,
    reviews: (rating: string, count: string) =>
      `${rating} · ${count} reseñas en Planity`,
    choose: "Elegir un servicio",
    bookingNote:
      "Reserva en Planity 24/7 · Pago en la barbería · Confirmación inmediata.",
    servicesEyebrow: "Los servicios",
    servicesTitle: "La carta de la barbería.",
    servicesIntro:
      "Precios y duraciones según Planity. La reserva se realiza en la página de la barbería.",
    seeAvailability: "Ver disponibilidad en Planity",
    galleryEyebrow: "La barbería en imágenes",
    galleryIntro: "Algunas imágenes de la barbería, de su galería en Planity.",
    seeYouSoon: "Hasta pronto en la barbería.",
    makeAppointment: "Pedir cita",
    allSalons: "Todas nuestras barberías",
    categories: {
      cut: "Corte",
      cutBeard: "Corte y barba",
      beard: "Barba",
      colour: "Color y alisado",
    },
  },
  salonPages: {
    anatole: {
      heroAlt:
        "Fachada de la barbería Seven Barbershop Anatole France, 12 rue du 11 Novembre en Saint-Étienne",
      aboutTitle: "El oficio Seven, en la rue du 11 Novembre.",
      aboutText:
        "Encuentra a nuestro equipo en el 12 rue du 11 Novembre de Saint-Étienne. Corte, barba y afeitado tradicional: elige tu servicio y reserva directamente en línea.",
      galleryTitle: "Bienvenido a Seven.",
      galleryIntro:
        "La fachada y algunas fotos de la barbería publicadas en Planity.",
      photos: [
        {
          label: "La barbería",
          alt: "Sillones de barbero y tocadores del Seven Barbershop Anatole France en Saint-Étienne",
        },
        {
          label: "El equipo",
          alt: "Barberos de Seven Barbershop trabajando en la barbería Anatole France, en Saint-Étienne",
        },
        {
          label: "El espacio del barbero",
          alt: "Espacio de barbería del Seven Barbershop Anatole France, rue du 11 Novembre en Saint-Étienne",
        },
        {
          label: "Los detalles",
          alt: "Detalle de la decoración interior de la barbería Seven Barbershop Anatole France",
        },
        {
          label: "La zona de descanso",
          alt: "Sofá de cuero y sillón de barbero de la barbería Anatole France en Saint-Étienne",
        },
      ],
      services: [
        "Corte adulto",
        "Corte estudiante",
        "Corte infantil (menores de 10)",
        "Corte de cambio de look",
        "Adulto (+25 años)",
        "Estudiante (-25 años)",
        "Con cuidados",
        "Arreglo de barba exprés",
        "Arreglo de barba con cuidados",
        "Afeitado tradicional con toalla caliente",
      ],
    },
    jeanJaures: {
      heroAlt:
        "Tocadores y sillones de barbero del Seven Barbershop, 1 place Jean Jaurès en Saint-Étienne",
      aboutTitle: "El oficio Seven, en la place Jean Jaurès.",
      aboutText:
        "Encuentra al equipo de Seven Barbershop en el 1 place Jean Jaurès, en el corazón de Saint-Étienne. Corte, barba y cuidados: elige tu servicio y reserva directamente en línea.",
      galleryTitle: "Bienvenido a Jean Jaurès.",
      galleryIntro: "Descubre los espacios y los detalles de la barbería.",
      photos: [
        {
          label: "El sillón",
          alt: "Sillón de barbero y lavacabezas del Seven Barbershop Jean Jaurès en Saint-Étienne",
        },
        {
          label: "Los servicios",
          alt: "Carta de servicios y precios expuesta en el Seven Barbershop Jean Jaurès",
        },
        {
          label: "El espacio del barbero",
          alt: "Lavacabezas y sillón de cuero de la barbería Seven Barbershop en la place Jean Jaurès",
        },
        {
          label: "El ambiente",
          alt: "Sillón de barbero visto desde el altillo del Seven Barbershop Jean Jaurès",
        },
      ],
      services: [
        "Adulto (+25 años)",
        "Estudiante (-25 años)",
        "Con cuidados (toalla caliente)",
        "Estudiante (-25 años)",
        "Adulto (+25 años)",
        "Corte de cambio de look",
        "Arreglo con máquina",
        "Arreglo de barba y afeitado",
        "Arreglo de barba y cuidados",
      ],
    },
    meyerbeer: {
      heroAlt:
        "Tocadores y sillones de barbero del Seven Barbershop, 4 rue Meyerbeer en Niza",
      aboutTitle: "El oficio Seven, en la rue Meyerbeer.",
      aboutText:
        "Encuentra al equipo de Seven Barbershop en el 4 rue Meyerbeer, en el corazón de Niza. Corte, barba y cuidados: elige tu servicio y reserva directamente en línea.",
      bookingNote:
        "De lunes a sábado, 9:30 – 19:00 · Reserva en Planity 24/7 · Pago en la barbería.",
      servicesIntro:
        "Precios y duraciones según Planity. Los servicios de color y alisado se reservan directamente en la barbería.",
      galleryTitle: "Bienvenido a Niza.",
      photos: [
        {
          label: "La barbería",
          alt: "Sillones de barbero capitoné y banco de cuero del Seven Barbershop en la rue Meyerbeer de Niza",
        },
        {
          label: "La fachada",
          alt: "Fachada de la barbería Seven Barbershop, 4 rue Meyerbeer en Niza, con el rótulo Trust your barber",
        },
        {
          label: "El espacio del barbero",
          alt: "Lavacabezas y sillón de barbero ante el mural Seven Barber Shop, barbería Meyerbeer en Niza",
        },
        {
          label: "Los sillones",
          alt: "Fila de sillones de barbero de cuero negro capitoné del Seven Barbershop Meyerbeer",
        },
        {
          label: "El ambiente",
          alt: "Mural The Old French School y poste luminoso de barbero del Seven Barbershop en Niza",
        },
      ],
      services: [
        "Adulto (+25 años)",
        "Estudiante (-25 años)",
        "Con cuidados (VIP)",
        "Adulto (+25 años), lavado incluido",
        "Estudiante, lavado incluido",
        "Niño (-15 años), lavado incluido",
        "Corte de cambio de look",
        "Arreglo de barba clásico",
        "Arreglo de barba y cuidados",
        "Desrizado, cabello corto",
        "Alisado brasileño, cabello corto",
        "Color blanco polar / gris",
      ],
    },
    lePort: {
      heroAlt:
        "Interior de la barbería Seven Barbershop Le Port, 1 boulevard Carnot en Niza",
      aboutTitle: "El oficio Seven, frente al puerto.",
      aboutText:
        "Encuentra al equipo de Seven Barbershop en el 1 boulevard Carnot, en el puerto de Niza. Corte, barba y cuidados: elige tu servicio y reserva directamente en línea.",
      bookingNote:
        "De martes a sábado, 9:30 – 19:00 · Reserva en Planity 24/7 · Pago en la barbería.",
      galleryTitle: "Bienvenido a Le Port.",
      photos: [
        {
          label: "Vistas al puerto",
          alt: "Sillones de barbero y tocadores del Seven Barbershop Le Port, con escaparate al puerto de Niza",
        },
        {
          label: "La zona de cuidados",
          alt: "Lavacabezas, sillones de barbero y productos de peluquería de la barbería Seven Barbershop Le Port en Niza",
        },
      ],
      services: [
        "Adulto",
        "Estudiante",
        "Con cuidados",
        "Corte adulto",
        "Corte estudiante",
        "Corte de cambio de look",
        "Arreglo de barba clásico",
        "Arreglo de barba y cuidados",
      ],
    },
    chavanelle: {
      heroAlt:
        "Interior de la barbería Seven Barbershop, 17 place Chavanelle en Saint-Étienne",
      aboutEyebrow: "La experiencia Seven",
      aboutText:
        "Encuentra al equipo de Seven Barbershop en el corazón de Saint-Étienne, en la place Chavanelle. Un ambiente cuidado, gestos precisos y un verdadero momento para ti.",
      chooseAndBook: "Elegir un servicio y reservar",
      galleryTitle: "Bienvenido a Chavanelle.",
      bookingTitle: "Tu próxima cita.",
      bookingText: "Reserva en línea 24/7 en Planity.",
      bookNow: "Reservar ahora",
      photos: [
        {
          label: "La recepción",
          alt: "Recepción y mostrador de la barbería Seven Barbershop en la place Chavanelle de Saint-Étienne",
        },
        {
          label: "El espacio del barbero",
          alt: "Interior de la barbería Seven Barbershop en la place Chavanelle de Saint-Étienne",
        },
        {
          label: "Los detalles",
          alt: "Detalle de la decoración del Seven Barbershop Chavanelle",
        },
        {
          label: "El ambiente",
          alt: "Sillones de barbero y decoración del Seven Barbershop Chavanelle en Saint-Étienne",
        },
        {
          label: "La barbería",
          alt: "Vista de la zona de corte del Seven Barbershop en la place Chavanelle",
        },
      ],
    },
  },
  photos: {
    burstFade: {
      alt: "Burst fade en cabello rizado con barba perfilada, corte de hombre realizado en Seven Barbershop",
      title: "Burst fade",
      caption: "Degradado redondeado alrededor de la oreja, rizos libres y barba perfilada.",
    },
    lowFadeBeard: {
      alt: "Degradado bajo, pelo peinado hacia atrás y barba larga con contornos limpios, corte de hombre Seven Barbershop",
      title: "Low fade y barba",
      caption: "Degradado bajo, largo peinado hacia atrás y barba con contornos limpios.",
    },
    lowTaper: {
      alt: "Low taper en cabello ondulado visto de perfil, corte de un barbero de Seven Barbershop",
      title: "Low taper",
      caption: "Degradado progresivo en la nuca, con el volumen ondulado arriba.",
    },
    classicTaper: {
      alt: "Taper clásico con nuca degradada y pelo peinado hacia atrás, vista trasera, Seven Barbershop",
      title: "Taper clásico",
      caption: "Nuca degradada y largo peinado hacia atrás: un corte atemporal.",
    },
    curlyLowFade: {
      alt: "Low fade en cabello rizado con contorno de la frente marcado, corte de hombre en Seven Barbershop",
      title: "Low fade rizado",
      caption: "Degradado bajo, contorno de la frente marcado y rizos definidos.",
    },
    taperMullet: {
      alt: "Corte taper mullet en cabello rizado con sienes degradadas, realizado en Seven Barbershop",
      title: "Taper mullet",
      caption: "Sienes degradadas y largo rizado en la nuca.",
    },
    barber: {
      alt: "Barbero de Seven Barbershop sonriendo, con polo verde bordado Trust your barber, ante un mural de navajas",
      title: "Trust your barber",
      caption: "Un barbero atento, un gesto preciso, una conversación de verdad.",
    },
    shave: {
      alt: "Perfilado de barba con navaja por un barbero de Seven Barbershop",
      title: "El afeitado",
      caption: "Contornos de barba a navaja, a la antigua.",
    },
    finish: {
      alt: "Acabado con cepillo de un corte corto degradado en una barbería Seven Barbershop",
      title: "El acabado",
      caption: "Cada corte termina cuidando hasta el último detalle.",
    },
    workshop: {
      alt: "Barberos de Seven Barbershop cortando el pelo detrás de la mesa de billar de la barbería",
      title: "El taller",
      caption:
        "Porque cada cliente es único, nuestro equipo te dedica toda la atención que mereces.",
    },
    team: {
      alt: "El equipo de barberos de Seven Barbershop con polos verdes bordados, reunido en la barbería",
      title: "El equipo",
      caption: "En Seven Barbershop, la pasión por el oficio también se transmite.",
    },
    interior: {
      alt: "Interior de una barbería Seven Barbershop: mesa de billar, sillones de barbero de cuero y madera sobre paredes verde esmeralda",
      title: "Un lugar para tomarse su tiempo",
      caption: "Billar, madera y sillones de cuero: el espíritu de club inglés.",
    },
    sign: {
      alt: "Rótulo dorado Seven Barber Shop, Trust your barber, y poste luminoso de barbero en la fachada",
      title: "La identidad Seven",
      caption: "Letras doradas y poste de barbero: la firma de la casa.",
    },
    polo: {
      alt: "Barbero de Seven Barbershop de espaldas, con polo verde bordado Seven Barber Shop Trust your barber",
      title: "El equipo",
      caption: "El polo bordado, llevado con orgullo en cada una de nuestras barberías.",
    },
    products: {
      alt: "Productos de calidad para el cuidado de la barba, seleccionados por Seven Barbershop",
      title: "Productos de calidad",
      caption: "Productos de calidad, seleccionados para ti.",
    },
  },
};
