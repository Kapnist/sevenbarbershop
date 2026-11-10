import type { Dictionary } from "./fr";

export const it: Dictionary = {
  nav: {
    home: "Home",
    services: "Servizi",
    salon: "Il salone",
    salons: "I nostri saloni",
    about: "Chi siamo",
    careers: "Lavora con noi",
    contact: "Contatti",
    label: "Navigazione principale",
    homeLabel: "Seven Barbershop, home",
    openMenu: "Apri il menu",
    closeMenu: "Chiudi il menu",
    footerLabel: "Link utili",
    language: "Lingua",
  },
  booking: {
    eyebrow: "Prenotazione online",
    title: "Prenota il tuo appuntamento.",
    description: "Scegli il salone, il servizio e il barbiere: vengono proposti solo gli orari davvero liberi.",
    cta: "Prenota online",
    seeSlots: "Vedi gli orari liberi",
    steps: {
      salon: "Salone",
      service: "Servizio",
      staff: "Barbiere",
      date: "Giorno",
      time: "Ora",
      details: "I tuoi dati",
    },
    summary: "Il tuo appuntamento",
    change: "Modifica",
    anyStaff: "Nessuna preferenza",
    anyStaffHint: "Il primo barbiere disponibile",
    loading: "Caricamento…",
    noSlots: "Nessun orario libero quel giorno: scegli un altro giorno.",
    noDays: "Nessun orario libero nei prossimi giorni per questa scelta. Prova «Nessuna preferenza» o un altro salone.",
    planityOnly: (salon: string) => `Il salone ${salon} prende per ora le prenotazioni su Planity.`,
    unavailable: "La prenotazione online è momentaneamente non disponibile. Puoi prenotare su Planity.",
    name: "Il tuo nome",
    phone: "Il tuo telefono",
    phoneHint: "Un numero francese, per esempio 06 12 34 56 78",
    email: "La tua e-mail (facoltativa, per ricevere la conferma)",
    note: "Una precisazione per il tuo barbiere? (facoltativo)",
    consent: "Accetto che Seven Barbershop mi contatti via e-mail o SMS per ricordarmi di prenotare di nuovo e informarmi sulle sue offerte. Posso annullare l'iscrizione in qualsiasi momento.",
    privacy: "I tuoi dati servono a gestire l'appuntamento. Pagamento in salone.",
    submit: "Conferma l'appuntamento",
    submitting: "Prenotazione…",
    confirmedTitle: "Prenotato!",
    confirmedText: "Il tuo appuntamento è confermato. A presto in salone.",
    reference: "Riferimento",
    withStaff: "Con",
    cancelNote: "Per annullare o spostare l'appuntamento, contatta il salone indicando il riferimento.",
    another: "Prendi un altro appuntamento",
    error: "La prenotazione non è andata a buon fine. Controlla i dati e riprova.",
    slotTaken: "Questo orario è appena stato preso. Scegline un altro.",
    minutes: (minutes: number) => `${minutes} min`,
  },
  notFound: {
    eyebrow: "Errore 404",
    title: "Questa pagina non esiste.",
    back: "Torna alla home",
  },
  format: {
    barberIn: (city: string) => `Barbiere a ${city}`,
    duration: (minutes: number) => {
      const hours = Math.floor(minutes / 60);
      const rest = minutes % 60;
      if (!hours) return `${rest} min`;
      return rest ? `${hours} h ${rest}` : `${hours} h`;
    },
    range: (from: string, to: string) => `da ${from} a ${to}`,
    time: (hours: number, minutes: number) =>
      `${hours}:${String(minutes).padStart(2, "0")}`,
    from: (price: string) => `Da ${price}`,
    onQuote: "Su preventivo",
  },
  hours: {
    days: ["lunedì", "martedì", "mercoledì", "giovedì", "venerdì", "sabato", "domenica"],
    open: (first: string, last: string, opens: string, closes: string) =>
      first === last
        ? `${first[0].toUpperCase()}${first.slice(1)}, ${opens} – ${closes}`
        : `Dal ${first} al ${last}, ${opens} – ${closes}`,
    closed: (days: string[]) =>
      `Chiuso ${days.map((day) => `il ${day}`).join(" e ")}`,
  },
  lightbox: {
    enlarge: (title: string) => `Ingrandisci la foto: ${title}`,
    close: "Chiudi la galleria",
    previous: "Foto precedente",
    next: "Foto successiva",
  },
  home: {
    eyebrow: "Barbiere a Saint-Étienne e Nizza",
    heroCopy:
      "Taglio, barba e rasatura tradizionale in saloni dallo spirito da club inglese. L'arte del barbiere, un'attenzione autentica e un'esperienza pensata intorno a te.",
    ctaBook: "Prenota il mio appuntamento",
    ctaServices: "Scopri i servizi",
    highlights: {
      salons: "saloni",
      cities: "città",
      reviews: "recensioni Planity",
      booking: "prenotazione online",
      bookingValue: "24/7",
    },
    servicesEyebrow: "L'arte Seven",
    servicesTitle: "La cura del dettaglio, a ogni appuntamento.",
    servicesIntro:
      "Grandi classici eseguiti con maestria, adattati al tuo stile. I prezzi variano a seconda del salone.",
    servicesLink: "Tutti i servizi",
    spiritAlt:
      "Poltrone da barbiere capitonné, pareti verde smeraldo e panca in pelle in un salone Seven Barbershop",
    spiritEyebrow: "Lo spirito Seven",
    spiritTitle: "Un indirizzo, un'atmosfera, un'arte.",
    spiritText:
      "Un ambiente caldo e curato, pensato per te: un'atmosfera elegante, animata dall'energia della città. Qui non c'è fretta. Accomodati, prenditi il tuo tempo: da Seven ti senti a casa.",
    spiritLink: "Scopri il team",
    lookbookEyebrow: "I nostri lavori",
    lookbookTitle: "Firmato Seven.",
    lookbookIntro:
      "Burst fade, low taper, sfumature e barbe scolpite: l'arte dei nostri barbieri, taglio dopo taglio.",
    lookbookLink: "Vedi tutto il lookbook",
    lookbookLabel: "Lavori dei barbieri Seven Barbershop",
    locationsEyebrow: "Vicino a te",
    locationsTitle: (count: number) => `${count} indirizzi, due città.`,
    locationsIntro:
      "Tre saloni a Saint-Étienne, due a Nizza. Scegli il tuo e prenota in pochi secondi su Planity.",
    cardAlt: (name: string, city: string) =>
      `Barberia Seven Barbershop ${name} a ${city}`,
    discover: "Scopri",
    bookingTitle: "Il tuo prossimo appuntamento ti aspetta.",
    bookingButton: "Prenota ora",
  },
  services: {
    eyebrow: "La nostra arte",
    title: "I classici, fatti a modo tuo.",
    description:
      "Ogni appuntamento inizia con un ascolto attento e si conclude curato nei minimi dettagli.",
    items: {
      "01": {
        name: "Taglio",
        description:
          "Con forbici o macchinetta, con rifiniture precise. Prezzi per adulti, studenti e bambini, e taglio trasformazione per cambiare stile.",
      },
      "02": {
        name: "Barba",
        description:
          "Regolazione express con macchinetta o classica con trattamento: contorni netti e barba ben definita.",
      },
      "03": {
        name: "Rasatura tradizionale",
        description:
          "Il rituale del barbiere: rasatura tradizionale con panno caldo e rifiniture curate.",
      },
      "04": {
        name: "Taglio & barba",
        description:
          "La formula completa per uscire impeccabile, con una tariffa dedicata agli studenti under 25.",
      },
      "05": {
        name: "Formula con trattamento",
        description:
          "Taglio e barba arricchiti da un trattamento con panno caldo. Un vero momento per te.",
      },
      "06": {
        name: "Twist, colore & lisciatura",
        description:
          "Twist e colore, oltre a stiratura e lisciatura brasiliana a Nizza Meyerbeer. Solo su appuntamento.",
      },
    },
    appointmentOnly: "Solo su appuntamento",
    ctaText:
      "I prezzi variano a seconda del salone: trovi il listino completo sulla pagina di ogni salone.",
    ctaButton: "Scegli il mio salone",
  },
  salonPage: {
    eyebrow: "Lo spirito Seven",
    title: "Un vero momento, oltre il taglio.",
    description:
      "Un'atmosfera curata, gesti precisi e il gusto del lavoro ben fatto.",
    storyTitle: "Il classico, con carattere.",
    storyText:
      "Pelle, legno, biliardo e chiacchiere spontanee: i nostri saloni coltivano lo spirito del barbiere in un ambiente accogliente. Ci prendiamo il tempo di ascoltarti e di trovare lo stile che ti somiglia.",
    storyAlt:
      "Biliardo e poltrone da barbiere in pelle in un salone Seven Barbershop",
    teamEyebrow: "Il team",
    teamTitle: "Barbieri, non macchine.",
    teamIntro:
      "Polo ricamate con i colori della casa, gesti sicuri e vera conversazione: conosci chi fa Seven ogni giorno.",
    teamLabel: "Foto del team Seven Barbershop",
    lookbookEyebrow: "I nostri lavori",
    lookbookTitle: "Il lookbook Seven.",
    lookbookIntro:
      "Burst fade, low taper, sfumature e barbe scolpite: alcuni tagli firmati dai nostri barbieri. Seleziona una foto per ingrandirla.",
    ctaText: "Un taglio ti ispira? Mostralo al tuo barbiere.",
    ctaButton: "Prenota nel mio salone",
    detailsEyebrow: "In immagini",
    detailsTitle: "I dettagli fanno l'esperienza.",
    detailsLabel: "I dettagli dei saloni Seven Barbershop",
  },
  locations: {
    eyebrow: "I nostri indirizzi",
    title: "Seven, vicino a te.",
    description:
      "Trova i nostri saloni a Saint-Étienne e a Nizza. Scegli l'indirizzo che fa per te.",
    count: (count: number) =>
      `${String(count).padStart(2, "0")} salon${count > 1 ? "i" : "e"}`,
    discover: "Scopri",
    book: "Prenota",
    bookLabel: (name: string, city: string) =>
      `Prenota al salone ${name} a ${city} su Planity`,
    contact: "Contatta",
    contactLabel: (name: string, city: string) =>
      `Contatta il salone ${name} a ${city}`,
  },
  about: {
    eyebrow: "Chi siamo",
    title: "Seven Barbershop, il tuo barbiere a Saint-Étienne e Nizza.",
    description:
      "Cinque saloni, un'unica esigenza: l'arte del barbiere tradizionale al servizio del tuo stile.",
    storyEyebrow: "La nostra storia",
    storyText:
      "Seven Barbershop riunisce tre saloni a Saint-Étienne — rue du 11 Novembre, place Jean Jaurès e place Chavanelle — e due saloni a Nizza, sul porto e in rue Meyerbeer.",
    mottoBefore: "Ovunque, lo stesso motto: ",
    mottoAfter:
      ". I nostri barbieri portano avanti i gesti della tradizione francese del barbiere, dal taglio su misura alla rasatura con panno caldo, in saloni dall'atmosfera da club inglese.",
    valuesEyebrow: "I nostri valori",
    valuesTitle: "Ciò che rende unica l'esperienza Seven.",
    values: [
      {
        name: "L'arte",
        description:
          "Taglio con forbici o macchinetta, regolazione della barba, rasatura tradizionale con panno caldo: i gesti del barbiere, eseguiti con precisione.",
        label: "The Old French School",
      },
      {
        name: "L'ascolto",
        description:
          "Ogni appuntamento inizia con un confronto per capire il tuo stile, la tua tipologia di capelli e ciò che ti aspetti dal tuo barbiere.",
        label: "Trust your barber",
      },
      {
        name: "L'ambiente",
        description:
          "Poltrone in pelle capitonné, boiserie e pareti verde smeraldo: saloni pensati per prendersi il proprio tempo, come in un club inglese.",
        label: "Un vero momento per te",
      },
    ],
    citiesEyebrow: "I nostri barbieri a",
    discoverLabel: (name: string, city: string) =>
      `Scopri il salone ${name} a ${city}`,
    faqEyebrow: "Domande frequenti",
    faqTitle: "Tutto su Seven.",
    faq: [
      {
        question: "Dove si trovano i saloni Seven Barbershop?",
        answer:
          "Seven Barbershop conta cinque saloni. A Saint-Étienne: 12 rue du 11 Novembre (Anatole France), 1 place Jean Jaurès e 17 place Chavanelle. A Nizza: 1 boulevard Carnot, sul porto, e 4 rue Meyerbeer.",
      },
      {
        question: "Quali servizi offre Seven Barbershop?",
        answer:
          "Taglio per adulti, studenti e bambini, taglio trasformazione, regolazione della barba, rasatura tradizionale con panno caldo, formule taglio e barba con o senza trattamento, oltre a twist e colore, solo su appuntamento.",
      },
      {
        question: "Quali sono i prezzi?",
        answer:
          "Il taglio parte da 14 €, la regolazione della barba da 10 € e la formula taglio e barba da 25 €. I prezzi variano a seconda del salone: il listino completo è sulla pagina di ogni salone.",
      },
      {
        question: "Quali sono gli orari di apertura?",
        answer:
          "Anatole France e place Chavanelle: dal lunedì al sabato, dalle 9:00 alle 19:00. Jean Jaurès: dal martedì al sabato, dalle 10:00 alle 20:00. Le Port: dal martedì al sabato, dalle 9:30 alle 19:00. Rue Meyerbeer: dal lunedì al sabato, dalle 9:30 alle 19:00. Tutti i saloni sono chiusi la domenica.",
      },
      {
        question: "Come prenotare un appuntamento?",
        answer:
          "Ogni salone ha la propria pagina di prenotazione Planity, disponibile 24 ore su 24. Scegli il servizio e l'orario e ricevi una conferma immediata. Il pagamento avviene in salone.",
      },
    ],
    ctaText: "Pronto ad accomodarti in poltrona?",
    ctaButton: "Scegli il mio salone",
  },
  contact: {
    eyebrow: "Contatti",
    title: "Ci vediamo in salone?",
    description:
      "Una domanda, un'idea, un suggerimento? Scrivici: ogni messaggio viene letto dal team Seven.",
    citiesEyebrow: "Le nostre città",
    citiesTitle: "Due città, cinque indirizzi.",
    formEyebrow: "Suggerimenti?",
    formTitle: "Scrivici.",
    disclaimer:
      "Il tuo parere ci aiuta a migliorare. Per prenotare, fallo direttamente online nel salone che preferisci.",
    name: "Il tuo nome",
    email: "La tua email",
    phone: "Il tuo telefono",
    phoneHint:
      "Un numero di telefono, ad esempio 06 12 34 56 78 o +33 6 12 34 56 78",
    salon: "Salone interessato (facoltativo)",
    allSalons: "Tutti i saloni",
    message: "Il tuo messaggio",
    send: "Invia il messaggio",
    sendingButton: "Invio…",
    status: {
      idle: "",
      sending: "Invio in corso…",
      sent: "Grazie! Il tuo messaggio è stato inviato al team Seven.",
      error:
        "Impossibile inviare il messaggio. Controlla la connessione e riprova.",
    },
  },
  careers: {
    eyebrow: "Lavora con noi",
    title: "Entra nel team Seven.",
    description:
      "Cinque saloni, due città, un'unica passione: fare del mestiere di barbiere un'arte, e trasmetterla.",
    heroCta: "Candidati",
    heroAlt:
      "Il team di barbieri Seven Barbershop con polo verdi ricamate, riunito in salone",
    whyEyebrow: "Perché Seven",
    whyTitle: "Un mestiere, una casa, una squadra.",
    perks: [
      {
        title: "Saloni d'eccezione",
        text: "Lavora in saloni accoglienti e curati a Saint-Étienne e a Nizza, pensati per il cliente come per il barbiere.",
      },
      {
        title: "La trasmissione",
        text: "Da Seven la passione per il mestiere si trasmette: tecniche, gesti, sguardo. Si cresce insieme, al fianco di barbieri esperti.",
      },
      {
        title: "Una clientela fedele",
        text: "Oltre 2.700 recensioni su Planity: una clientela che torna e si fida dei nostri barbieri.",
      },
      {
        title: "Spirito di squadra",
        text: "Polo ricamate, gesti condivisi, vera convivialità: una squadra unita, con i colori della casa.",
      },
    ],
    lifeEyebrow: "La vita da Seven",
    lifeTitle: "La giornata di un barbiere Seven.",
    lifeLabel: "Foto del team Seven Barbershop al lavoro",
    profileEyebrow: "Il tuo profilo",
    profileTitle: "Ciò che conta per noi.",
    profile: [
      "La passione per il mestiere e la cura del dettaglio",
      "Il piacere del contatto e la capacità di ascolto",
      "La padronanza di sfumature e barba, o la voglia di imparare",
      "Una presenza curata, puntualità e spirito di squadra",
    ],
    quote: "Un buon barbiere non taglia solo i capelli: crea un legame di fiducia.",
    formEyebrow: "Candidatura",
    formTitle: "Presentati.",
    formIntro:
      "Barbiere esperto o in formazione, inviaci la tua candidatura. Ognuna viene esaminata con attenzione.",
    city: "Città preferita",
    anyCity: "Saint-Étienne o Nizza",
    experience: "La tua esperienza",
    experienceLevels: [
      "Apprendista o in formazione",
      "Meno di 2 anni",
      "Da 2 a 5 anni",
      "Più di 5 anni",
    ],
    portfolio: "I tuoi lavori (link Instagram o portfolio, facoltativo)",
    cv: "Il tuo CV (facoltativo)",
    cvButton: "Allega il mio CV",
    cvHint: "PDF, Word o immagine · max 5 MB",
    cvWrongType: "Formato non accettato. Allega un PDF, un documento Word o un'immagine.",
    cvTooLarge: "Il file supera i 5 MB. Allega un CV più leggero.",
    message: "Raccontaci di te",
    send: "Invia la candidatura",
    sent: "Grazie! La tua candidatura è stata inviata al team Seven.",
  },
  salon: {
    bookOnPlanity: "Prenota su Planity",
    ratingLabel: (rating: string) => `Valutazione ${rating} su 5`,
    reviews: (rating: string, count: string) =>
      `${rating} · ${count} recensioni su Planity`,
    choose: "Scegli un servizio",
    bookingNote:
      "Prenotazione Planity 24/7 · Pagamento in salone · Conferma immediata.",
    servicesEyebrow: "I servizi",
    servicesTitle: "Il listino del salone.",
    servicesIntro:
      "Prezzi e durate come indicati su Planity. La prenotazione si effettua sulla pagina del salone.",
    seeAvailability: "Vedi le disponibilità su Planity",
    galleryEyebrow: "Il salone in immagini",
    galleryIntro: "Alcune immagini del salone, dalla sua galleria Planity.",
    seeYouSoon: "A presto in salone.",
    makeAppointment: "Prendi appuntamento",
    allSalons: "Tutti i nostri saloni",
    categories: {
      cut: "Taglio",
      cutBeard: "Taglio & barba",
      beard: "Barba",
      colour: "Colore & lisciatura",
    },
  },
  salonPages: {
    anatole: {
      heroAlt:
        "Facciata della barberia Seven Barbershop Anatole France, 12 rue du 11 Novembre a Saint-Étienne",
      aboutTitle: "L'arte Seven, in rue du 11 Novembre.",
      aboutText:
        "Trova il nostro team al 12 rue du 11 Novembre a Saint-Étienne. Taglio, barba e rasatura tradizionale: scegli il servizio e prenota direttamente online.",
      galleryTitle: "Benvenuto da Seven.",
      galleryIntro:
        "La facciata e alcune foto del salone pubblicate su Planity.",
      photos: [
        {
          label: "Il salone",
          alt: "Poltrone da barbiere e postazioni del Seven Barbershop Anatole France a Saint-Étienne",
        },
        {
          label: "Il team",
          alt: "Barbieri Seven Barbershop al lavoro nel salone Anatole France, a Saint-Étienne",
        },
        {
          label: "Lo spazio barbiere",
          alt: "Spazio barbiere del Seven Barbershop Anatole France, rue du 11 Novembre a Saint-Étienne",
        },
        {
          label: "I dettagli",
          alt: "Dettaglio dell'arredamento interno della barberia Seven Barbershop Anatole France",
        },
        {
          label: "L'area relax",
          alt: "Divano in pelle e poltrona da barbiere del salone Anatole France a Saint-Étienne",
        },
      ],
      services: [
        "Taglio adulto",
        "Taglio studente",
        "Taglio bambino (under 10)",
        "Taglio trasformazione",
        "Adulto (over 25)",
        "Studente (under 25)",
        "Con trattamento",
        "Regolazione barba express",
        "Regolazione barba con trattamento",
        "Rasatura tradizionale, panno caldo",
      ],
    },
    jeanJaures: {
      heroAlt:
        "Postazioni e poltrone da barbiere del Seven Barbershop, 1 place Jean Jaurès a Saint-Étienne",
      aboutTitle: "L'arte Seven, in place Jean Jaurès.",
      aboutText:
        "Trova il team Seven Barbershop al 1 place Jean Jaurès, nel cuore di Saint-Étienne. Taglio, barba e trattamenti: scegli il servizio e prenota direttamente online.",
      galleryTitle: "Benvenuto da Jean Jaurès.",
      galleryIntro: "Scopri gli spazi e i dettagli del salone.",
      photos: [
        {
          label: "La poltrona",
          alt: "Poltrona da barbiere e lavatesta del Seven Barbershop Jean Jaurès a Saint-Étienne",
        },
        {
          label: "I servizi",
          alt: "Listino dei servizi e prezzi esposto al Seven Barbershop Jean Jaurès",
        },
        {
          label: "Lo spazio barbiere",
          alt: "Lavatesta e poltrona in pelle della barberia Seven Barbershop in place Jean Jaurès",
        },
        {
          label: "L'atmosfera",
          alt: "Poltrona da barbiere vista dal soppalco del Seven Barbershop Jean Jaurès",
        },
      ],
      services: [
        "Adulto (over 25)",
        "Studente (under 25)",
        "Con trattamento (panno caldo)",
        "Studente (under 25)",
        "Adulto (over 25)",
        "Taglio trasformazione",
        "Regolazione con macchinetta",
        "Regolazione barba & rasatura",
        "Regolazione barba & trattamento",
      ],
    },
    meyerbeer: {
      heroAlt:
        "Postazioni e poltrone da barbiere del Seven Barbershop, 4 rue Meyerbeer a Nizza",
      aboutTitle: "L'arte Seven, in rue Meyerbeer.",
      aboutText:
        "Trova il team Seven Barbershop al 4 rue Meyerbeer, nel cuore di Nizza. Taglio, barba e trattamenti: scegli il servizio e prenota direttamente online.",
      bookingNote:
        "Dal lunedì al sabato, 9:30 – 19:00 · Prenotazione Planity 24/7 · Pagamento in salone.",
      servicesIntro:
        "Prezzi e durate come indicati su Planity. I servizi di colore e lisciatura si prenotano direttamente in salone.",
      galleryTitle: "Benvenuto a Nizza.",
      photos: [
        {
          label: "Il salone",
          alt: "Poltrone da barbiere capitonné e panca in pelle del Seven Barbershop in rue Meyerbeer a Nizza",
        },
        {
          label: "La facciata",
          alt: "Facciata della barberia Seven Barbershop, 4 rue Meyerbeer a Nizza, insegna Trust your barber",
        },
        {
          label: "Lo spazio barbiere",
          alt: "Lavatesta e poltrona da barbiere davanti all'affresco Seven Barber Shop, salone Meyerbeer a Nizza",
        },
        {
          label: "Le poltrone",
          alt: "Fila di poltrone da barbiere in pelle nera capitonné del Seven Barbershop Meyerbeer",
        },
        {
          label: "L'atmosfera",
          alt: "Affresco The Old French School e insegna luminosa da barbiere del Seven Barbershop a Nizza",
        },
      ],
      services: [
        "Adulto (over 25)",
        "Studente (under 25)",
        "Con trattamento (VIP)",
        "Adulto (over 25), shampoo incluso",
        "Studente, shampoo incluso",
        "Bambino (under 15), shampoo incluso",
        "Taglio trasformazione",
        "Regolazione barba classica",
        "Regolazione barba e trattamento",
        "Stiratura capelli corti",
        "Lisciatura brasiliana capelli corti",
        "Colore bianco polare / grigio",
      ],
    },
    lePort: {
      heroAlt:
        "Interno della barberia Seven Barbershop Le Port, 1 boulevard Carnot a Nizza",
      aboutTitle: "L'arte Seven, di fronte al porto.",
      aboutText:
        "Trova il team Seven Barbershop al 1 boulevard Carnot, sul porto di Nizza. Taglio, barba e trattamenti: scegli il servizio e prenota direttamente online.",
      bookingNote:
        "Dal martedì al sabato, 9:30 – 19:00 · Prenotazione Planity 24/7 · Pagamento in salone.",
      galleryTitle: "Benvenuto a Le Port.",
      photos: [
        {
          label: "Vista sul porto",
          alt: "Poltrone da barbiere e postazioni del Seven Barbershop Le Port, vetrina sul porto di Nizza",
        },
        {
          label: "L'area trattamenti",
          alt: "Lavatesta, poltrone da barbiere e prodotti per capelli della barberia Seven Barbershop Le Port a Nizza",
        },
      ],
      services: [
        "Adulto",
        "Studente",
        "Con trattamento",
        "Taglio adulto",
        "Taglio studente",
        "Taglio trasformazione",
        "Regolazione barba classica",
        "Regolazione barba e trattamento",
      ],
    },
    chavanelle: {
      heroAlt:
        "Interno della barberia Seven Barbershop, 17 place Chavanelle a Saint-Étienne",
      aboutEyebrow: "L'esperienza Seven",
      aboutText:
        "Trova il team Seven Barbershop nel cuore di Saint-Étienne, in place Chavanelle. Un'atmosfera curata, gesti precisi e un vero momento per te.",
      chooseAndBook: "Scegli un servizio e prenota",
      galleryTitle: "Benvenuto a Chavanelle.",
      bookingTitle: "Il tuo prossimo appuntamento.",
      bookingText: "Prenotazione online 24/7 su Planity.",
      bookNow: "Prenota ora",
      photos: [
        {
          label: "L'accoglienza",
          alt: "Accoglienza e bancone della barberia Seven Barbershop in place Chavanelle a Saint-Étienne",
        },
        {
          label: "Lo spazio barbiere",
          alt: "Interno della barberia Seven Barbershop in place Chavanelle a Saint-Étienne",
        },
        {
          label: "I dettagli",
          alt: "Dettaglio dell'arredamento del Seven Barbershop Chavanelle",
        },
        {
          label: "L'atmosfera",
          alt: "Poltrone da barbiere e arredamento del Seven Barbershop Chavanelle a Saint-Étienne",
        },
        {
          label: "Il salone",
          alt: "Panoramica dell'area taglio del Seven Barbershop in place Chavanelle",
        },
      ],
    },
  },
  photos: {
    burstFade: {
      alt: "Burst fade su capelli ricci con barba regolata, taglio uomo realizzato da Seven Barbershop",
      title: "Burst fade",
      caption: "Sfumatura arrotondata intorno all'orecchio, ricci liberi e barba regolata.",
    },
    lowFadeBeard: {
      alt: "Sfumatura bassa, capelli pettinati all'indietro e barba lunga dai contorni netti, taglio uomo Seven Barbershop",
      title: "Low fade & barba",
      caption: "Sfumatura bassa, lunghezze all'indietro e barba dai contorni netti.",
    },
    lowTaper: {
      alt: "Low taper su capelli mossi visto di profilo, taglio di un barbiere Seven Barbershop",
      title: "Low taper",
      caption: "Sfumatura graduale sulla nuca, volume mosso mantenuto sopra.",
    },
    classicTaper: {
      alt: "Taper classico con nuca sfumata e capelli pettinati all'indietro, vista posteriore, Seven Barbershop",
      title: "Taper classico",
      caption: "Nuca sfumata e lunghezze all'indietro: un taglio senza tempo.",
    },
    curlyLowFade: {
      alt: "Low fade su capelli ricci con contorno della fronte netto, taglio uomo da Seven Barbershop",
      title: "Low fade riccio",
      caption: "Sfumatura bassa, contorno netto della fronte e ricci definiti.",
    },
    taperMullet: {
      alt: "Taglio taper mullet su capelli ricci con tempie sfumate, realizzato da Seven Barbershop",
      title: "Taper mullet",
      caption: "Tempie sfumate e lunghezza riccia mantenuta sulla nuca.",
    },
    barber: {
      alt: "Barbiere Seven Barbershop sorridente, con polo verde ricamata Trust your barber, davanti a un affresco di rasoi",
      title: "Trust your barber",
      caption: "Un barbiere attento, un gesto preciso, una vera conversazione.",
    },
    shave: {
      alt: "Contorno della barba con rasoio a mano libera di un barbiere Seven Barbershop",
      title: "La rasatura",
      caption: "Contorni della barba al rasoio, come una volta.",
    },
    finish: {
      alt: "Rifinitura con spazzola di un taglio corto sfumato in un salone Seven Barbershop",
      title: "La rifinitura",
      caption: "Ogni taglio si conclude curato nei minimi dettagli.",
    },
    workshop: {
      alt: "Barbieri Seven Barbershop al lavoro dietro il tavolo da biliardo del salone",
      title: "L'atelier",
      caption:
        "Perché ogni cliente è unico, il nostro team ti dedica tutta l'attenzione che merita.",
    },
    team: {
      alt: "Il team di barbieri Seven Barbershop con polo verdi ricamate, riunito in salone",
      title: "Il team",
      caption: "Da Seven Barbershop, anche la passione per il mestiere si tramanda.",
    },
    interior: {
      alt: "Interno di un salone Seven Barbershop: biliardo, poltrone da barbiere in pelle e boiserie su pareti verde smeraldo",
      title: "Un luogo dove prendersi il tempo",
      caption: "Biliardo, boiserie e poltrone in pelle: lo spirito da club inglese.",
    },
    sign: {
      alt: "Insegna dorata Seven Barber Shop, Trust your barber, e insegna luminosa da barbiere sulla facciata",
      title: "L'identità Seven",
      caption: "Lettere dorate e insegna da barbiere: la firma della casa.",
    },
    polo: {
      alt: "Barbiere Seven Barbershop di spalle, con polo verde ricamata Seven Barber Shop Trust your barber",
      title: "Il team",
      caption: "La polo ricamata, indossata con orgoglio in ognuno dei nostri saloni.",
    },
    products: {
      alt: "Prodotti di qualità per la cura della barba, selezionati da Seven Barbershop",
      title: "Prodotti di qualità",
      caption: "Prodotti di qualità, selezionati per te.",
    },
  },
};
