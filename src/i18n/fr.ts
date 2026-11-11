// Dictionnaire de référence : toutes les autres langues suivent cette structure.
export const fr = {
  nav: {
    home: "Accueil",
    services: "Prestations",
    salon: "Le salon",
    salons: "Nos salons",
    about: "À propos",
    careers: "Carrières",
    contact: "Contact",

    book: "Réserver",
    label: "Navigation principale",
    homeLabel: "Seven Barbershop, accueil",
    openMenu: "Ouvrir le menu",
    closeMenu: "Fermer le menu",
    footerLabel: "Liens utiles",
    language: "Langue",
  },
  booking: {
    eyebrow: "Réservation en ligne",
    title: "Réservez votre rendez-vous.",
    description: "Choisissez votre salon, votre prestation et votre barbier : seuls les créneaux réellement libres sont proposés.",
    cta: "Réserver en ligne",
    seeSlots: "Voir les créneaux libres",
    steps: {
      salon: "Salon",
      service: "Prestation",
      staff: "Barbier",
      date: "Jour",
      time: "Heure",
      details: "Vos coordonnées",
    },
    summary: "Votre rendez-vous",
    change: "Modifier",
    anyStaff: "Sans préférence",
    anyStaffHint: "Le premier barbier disponible",
    loading: "Chargement…",
    noSlots: "Plus de créneau libre ce jour-là : choisissez un autre jour.",
    noDays: "Aucun créneau libre dans les prochains jours pour ce choix. Essayez « Sans préférence » ou un autre salon.",
    planityOnly: (salon: string) => `Le salon ${salon} prend ses rendez-vous sur Planity pour le moment.`,
    unavailable: "La réservation en ligne est momentanément indisponible. Vous pouvez réserver sur Planity.",
    name: "Votre nom",
    phone: "Votre téléphone",
    phoneHint: "Un numéro français, par exemple 06 12 34 56 78",
    email: "Votre e-mail (facultatif, pour recevoir la confirmation)",
    note: "Une précision pour votre barbier ? (facultatif)",
    consent: "J'accepte que Seven Barbershop me contacte par e-mail ou SMS pour me rappeler de reprendre rendez-vous et m'informer de ses offres. Je peux me désinscrire à tout moment.",
    privacy: "Vos coordonnées servent à gérer votre rendez-vous. Paiement sur place, au salon.",
    submit: "Confirmer le rendez-vous",
    submitting: "Réservation…",
    confirmedTitle: "C'est réservé !",
    confirmedText: "Votre rendez-vous est confirmé. À très vite au salon.",
    reference: "Référence",
    withStaff: "Avec",
    cancelNote: "Un lien pour annuler figure ci-dessous et dans l'e-mail de confirmation. Pour déplacer votre rendez-vous, annulez-le puis reprenez un créneau, ou contactez le salon.",
    cancelLink: "Annuler ce rendez-vous",
    addToCalendar: "Ajouter à mon agenda",
    cancelEyebrow: "Annulation",
    cancelTitle: "Annuler votre rendez-vous ?",
    cancelText: "Le créneau sera aussitôt libéré pour un autre client.",
    cancelConfirm: "Oui, annuler le rendez-vous",
    cancelKeep: "Garder mon rendez-vous",
    cancelling: "Annulation…",
    cancelledTitle: "Rendez-vous annulé.",
    cancelledText: "Votre rendez-vous est annulé. À bientôt chez Seven Barbershop.",
    cancelTooLate: "Il est trop tard pour annuler en ligne. Merci d'appeler le salon.",
    cancelInvalid: "Ce lien d'annulation n'est plus valable : le rendez-vous est introuvable ou déjà annulé.",
    another: "Prendre un autre rendez-vous",
    error: "La réservation n'a pas abouti. Vérifiez vos informations et réessayez.",
    slotTaken: "Ce créneau vient d'être pris. Choisissez-en un autre.",
    minutes: (minutes: number) => `${minutes} min`,
  },
  notFound: {
    eyebrow: "Erreur 404",
    title: "Cette page n'existe pas.",
    back: "Retour à l'accueil",
  },
  format: {
    barberIn: (city: string) => `Barbier à ${city}`,
    duration: (minutes: number) => {
      const hours = Math.floor(minutes / 60);
      const rest = minutes % 60;
      if (!hours) return `${rest} min`;
      return rest ? `${hours} h ${rest}` : `${hours} h`;
    },
    range: (from: string, to: string) => `${from} à ${to}`,
    time: (hours: number, minutes: number) =>
      `${hours}h${minutes ? String(minutes).padStart(2, "0") : ""}`,
    from: (price: string) => `Dès ${price}`,
    onQuote: "Sur devis",
  },
  hours: {
    days: ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"],
    open: (first: string, last: string, opens: string, closes: string) =>
      first === last
        ? `Le ${first}, ${opens} – ${closes}`
        : `Du ${first} au ${last}, ${opens} – ${closes}`,
    closed: (days: string[]) =>
      `Fermé ${days.map((day) => `le ${day}`).join(" et ")}`,
  },
  lightbox: {
    enlarge: (title: string) => `Agrandir la photo : ${title}`,
    close: "Fermer la visionneuse",
    previous: "Photo précédente",
    next: "Photo suivante",
  },
  home: {
    eyebrow: "Barbier à Saint-Étienne & Nice",
    heroCopy:
      "Coupe, barbe et rasage à l'ancienne dans des salons à l'esprit club anglais. Le savoir-faire du barbier, une attention authentique et une expérience pensée autour de vous.",
    ctaBook: "Réserver mon rendez-vous",
    ctaServices: "Voir les prestations",
    highlights: {
      salons: "salons",
      cities: "villes",
      reviews: "avis Planity",
      booking: "réservation en ligne",
      bookingValue: "24h/24",
    },
    servicesEyebrow: "Le savoir-faire Seven",
    servicesTitle: "Le sens du détail, à chaque rendez-vous.",
    servicesIntro:
      "Des classiques maîtrisés, adaptés à votre style. Les tarifs varient selon le salon.",
    servicesLink: "Toute la carte des prestations",
    spiritAlt:
      "Fauteuils de barbier capitonnés, murs vert émeraude et banquette en cuir d'un salon Seven Barbershop",
    spiritEyebrow: "L'esprit Seven",
    spiritTitle: "Une adresse, une atmosphère, un savoir-faire.",
    spiritText:
      "Un cadre chaleureux et soigné, pensé pour vous : une ambiance élégante, portée par l'énergie de la ville. Ici, rien ne presse. Installez-vous, prenez votre temps : chez Seven, vous êtes comme chez vous.",
    spiritLink: "Découvrir l'équipe",
    lookbookEyebrow: "Nos réalisations",
    lookbookTitle: "Signé Seven.",
    lookbookIntro:
      "Burst fade, low taper, dégradés et barbes taillées : le savoir-faire de nos barbiers, coupe après coupe.",
    lookbookLink: "Voir tout le lookbook",
    lookbookLabel: "Réalisations des barbiers Seven Barbershop",
    locationsEyebrow: "Proche de vous",
    locationsTitle: (count: number) => `${count} adresses, deux villes.`,
    locationsIntro:
      "Trois salons à Saint-Étienne, deux à Nice. Choisissez le vôtre et réservez en quelques secondes sur Planity.",
    cardAlt: (name: string, city: string) =>
      `Salon de barbier Seven Barbershop ${name} à ${city}`,
    discover: "Découvrir",
    bookingTitle: "Votre prochain rendez-vous vous attend.",
    bookingButton: "Réserver maintenant",
  },
  services: {
    eyebrow: "Prestations et tarifs barbier",
    title: "Les classiques, faits à votre façon.",
    description:
      "Chaque rendez-vous commence par une écoute attentive et se termine au détail près.",
    items: {
      "01": {
        name: "Coupe",
        description:
          "Aux ciseaux ou à la tondeuse, avec des finitions précises. Tarifs adulte, étudiant et enfant, et coupe transformation pour changer de style.",
      },
      "02": {
        name: "Barbe",
        description:
          "Taille express à la tondeuse ou taille classique avec soins : contours nets et barbe mise en forme.",
      },
      "03": {
        name: "Rasage à l'ancienne",
        description:
          "Le rituel du barbier : rasage traditionnel à la serviette chaude et finitions soignées.",
      },
      "04": {
        name: "Coupe & barbe",
        description:
          "La formule complète pour repartir impeccable, avec un tarif dédié aux étudiants de moins de 25 ans.",
      },
      "05": {
        name: "Formule avec soins",
        description:
          "Coupe et barbe prolongées d'un soin à la serviette chaude. Un vrai moment pour vous.",
      },
      "06": {
        name: "Vanilles, coloration & lissage",
        description:
          "Vanilles et coloration, ainsi que défrisage et lissage brésilien à Nice Meyerbeer. Prestations réalisées uniquement sur rendez-vous.",
      },
    },
    appointmentOnly: "Uniquement sur rendez-vous",
    ctaText:
      "Les tarifs varient selon le salon : retrouvez la carte complète sur chaque page salon.",
    ctaButton: "Choisir mon salon",
  },
  salonPage: {
    eyebrow: "L'esprit Seven",
    title: "Un vrai moment, au-delà de la coupe.",
    description:
      "Une atmosphère soignée, des gestes précis et le goût du travail bien fait.",
    storyTitle: "Le classique, avec caractère.",
    storyText:
      "Cuir, bois, billard et conversations sans façon : nos salons cultivent l'esprit du barbier dans un cadre chaleureux. On prend le temps de vous écouter et de trouver le style qui vous ressemble.",
    storyAlt:
      "Espace billard et fauteuils de barbier en cuir d'un salon Seven Barbershop",
    teamEyebrow: "L'équipe",
    teamTitle: "Des barbiers, pas des machines.",
    teamIntro:
      "Polos brodés aux couleurs de la maison, gestes sûrs et vraie conversation : rencontrez ceux qui font Seven au quotidien.",
    teamLabel: "Photos de l'équipe Seven Barbershop",
    lookbookEyebrow: "Nos réalisations",
    lookbookTitle: "Le lookbook Seven.",
    lookbookIntro:
      "Burst fade, low taper, dégradés et barbes taillées : quelques coupes signées par nos barbiers. Sélectionnez une photo pour l'agrandir.",
    ctaText: "Une coupe vous inspire ? Montrez-la à votre barbier.",
    ctaButton: "Réserver dans mon salon",
    detailsEyebrow: "En images",
    detailsTitle: "Les détails font l'expérience.",
    detailsLabel: "Les détails des salons Seven Barbershop",
  },
  locations: {
    eyebrow: "Nos barbiers à Saint-Étienne et Nice",
    title: "Seven, près de chez vous.",
    description:
      "Retrouvez nos salons à Saint-Étienne et à Nice. Choisissez l'adresse qui vous convient.",
    count: (count: number) => `${String(count).padStart(2, "0")} salons`,
    discover: "Découvrir",
    book: "Réserver",
    bookLabel: (name: string, city: string) =>
      `Réserver au salon ${name} à ${city} sur Planity`,
    contact: "Contacter",
    contactLabel: (name: string, city: string) =>
      `Contacter le salon ${name} à ${city}`,
  },
  about: {
    eyebrow: "À propos",
    title: "Seven Barbershop, votre barbier à Saint-Étienne et Nice.",
    description:
      "Cinq salons, une même exigence : le savoir-faire du barbier traditionnel au service de votre style.",
    storyEyebrow: "Notre histoire",
    storyText:
      "Seven Barbershop réunit trois salons à Saint-Étienne, rue du 11 Novembre, place Jean Jaurès et place Chavanelle, et deux salons à Nice, sur le port et rue Meyerbeer.",
    mottoBefore: "Partout, la même devise : ",
    mottoAfter:
      ". Nos barbiers perpétuent les gestes de la tradition française du barbier, de la coupe sur mesure au rasage à la serviette chaude, dans des salons à l'atmosphère de club anglais.",
    valuesEyebrow: "Nos valeurs",
    valuesTitle: "Ce qui fait l'expérience Seven.",
    values: [
      {
        name: "Le savoir-faire",
        description:
          "Coupe aux ciseaux ou à la tondeuse, taille de barbe, rasage à l'ancienne à la serviette chaude : les gestes du barbier, appliqués avec précision.",
        label: "The Old French School",
      },
      {
        name: "L'écoute",
        description:
          "Chaque rendez-vous commence par un échange pour comprendre votre style, votre texture de cheveux et ce que vous attendez de votre barbier.",
        label: "Trust your barber",
      },
      {
        name: "Le cadre",
        description:
          "Fauteuils en cuir capitonné, boiseries et murs vert émeraude : des salons pensés pour prendre le temps, comme dans un club à l'anglaise.",
        label: "Un vrai moment pour vous",
      },
    ],
    citiesEyebrow: "Nos barbiers à",
    discoverLabel: (name: string, city: string) =>
      `Découvrir le salon ${name} à ${city}`,
    faqEyebrow: "Questions fréquentes",
    faqTitle: "Tout savoir sur Seven.",
    faq: [
      {
        question: "Où se trouvent les salons Seven Barbershop ?",
        answer:
          "Seven Barbershop compte cinq salons. À Saint-Étienne : 12 rue du 11 Novembre (Anatole France), 1 place Jean Jaurès et 17 place Chavanelle. À Nice : 1 boulevard Carnot, sur le port, et 4 rue Meyerbeer.",
      },
      {
        question: "Quelles prestations propose Seven Barbershop ?",
        answer:
          "Coupe adulte, étudiant et enfant, coupe transformation, taille de barbe, rasage à l'ancienne à la serviette chaude, formules coupe et barbe avec ou sans soins, ainsi que vanilles et coloration, uniquement sur rendez-vous.",
      },
      {
        question: "Quels sont les tarifs ?",
        answer:
          "La coupe est proposée dès 14 €, la taille de barbe dès 10 € et la formule coupe et barbe dès 25 €. Les tarifs varient selon le salon : la carte complète est affichée sur la page de chaque salon.",
      },
      {
        question: "Quels sont les horaires d'ouverture ?",
        answer:
          "Anatole France et place Chavanelle : du lundi au samedi, de 9h à 19h. Jean Jaurès : du mardi au samedi, de 10h à 20h. Le Port : du mardi au samedi, de 9h30 à 19h. Rue Meyerbeer : du lundi au samedi, de 9h30 à 19h. Tous les salons sont fermés le dimanche.",
      },
      {
        question: "Comment prendre rendez-vous ?",
        answer:
          "Chaque salon dispose de sa page de réservation Planity, accessible 24h/24. Choisissez votre prestation, votre créneau, et recevez une confirmation immédiate. Le paiement s'effectue sur place, au salon.",
      },
    ],
    ctaText: "Prêt à vous installer dans le fauteuil ?",
    ctaButton: "Choisir mon salon",
  },
  contact: {
    eyebrow: "Contact",
    title: "On se retrouve au salon ?",
    description:
      "Une question, une idée, une suggestion ? Écrivez-nous : chaque message est lu par l'équipe Seven.",
    citiesEyebrow: "Nos villes",
    citiesTitle: "Deux villes, cinq adresses.",
    formEyebrow: "Des suggestions ?",
    formTitle: "Écrivez-nous.",
    disclaimer:
      "Votre avis nous aide à faire mieux. Pour prendre rendez-vous, réservez directement en ligne dans le salon de votre choix.",
    name: "Votre nom",
    email: "Votre courriel",
    phone: "Votre téléphone",
    phoneHint:
      "Un numéro de téléphone, par exemple 06 12 34 56 78 ou +33 6 12 34 56 78",
    salon: "Salon concerné (facultatif)",
    allSalons: "Tous les salons",
    message: "Votre message",
    send: "Envoyer mon message",
    sendingButton: "Envoi…",
    status: {
      idle: "",
      sending: "Envoi en cours…",
      sent: "Merci ! Votre message a bien été envoyé à l'équipe Seven.",
      error:
        "Le message n'a pas pu être envoyé. Vérifiez votre connexion et réessayez.",
    },
  },
  careers: {
    eyebrow: "Recrutement barbier",
    title: "Rejoignez l'équipe Seven.",
    description:
      "Cinq salons, deux villes, une même passion : faire du métier de barbier un art, et le transmettre.",
    heroCta: "Postuler",
    heroAlt:
      "L'équipe de barbiers Seven Barbershop en polos verts brodés, réunie dans le salon",
    whyEyebrow: "Pourquoi Seven",
    whyTitle: "Un métier, une maison, une équipe.",
    perks: [
      {
        title: "Des salons d'exception",
        text: "Exercez dans des salons au cadre chaleureux et soigné, à Saint-Étienne et à Nice, pensés pour le client comme pour le barbier.",
      },
      {
        title: "La transmission",
        text: "Chez Seven, la passion du métier se transmet : techniques, gestes, regard. On progresse ensemble, aux côtés de barbiers expérimentés.",
      },
      {
        title: "Une clientèle fidèle",
        text: "Plus de 2 700 avis clients sur Planity : une clientèle qui revient et qui fait confiance à nos barbiers.",
      },
      {
        title: "L'esprit d'équipe",
        text: "Polos brodés, gestes partagés, vraie convivialité : une équipe soudée, aux couleurs de la maison.",
      },
    ],
    lifeEyebrow: "La vie chez Seven",
    lifeTitle: "Le quotidien d'un barbier Seven.",
    lifeLabel: "Photos de l'équipe Seven Barbershop au travail",
    profileEyebrow: "Votre profil",
    profileTitle: "Ce qui compte pour nous.",
    profile: [
      "La passion du métier et le souci du détail",
      "Le goût du contact et le sens de l'écoute",
      "La maîtrise des dégradés et de la taille de barbe, ou l'envie de l'apprendre",
      "Une présentation soignée, de la ponctualité et l'esprit d'équipe",
    ],
    quote: "Un bon barbier ne coupe pas seulement des cheveux : il crée un lien de confiance.",
    formEyebrow: "Candidature",
    formTitle: "Présentez-vous.",
    formIntro:
      "Barbier confirmé ou en devenir, envoyez-nous votre candidature. Chacune est étudiée avec attention.",
    city: "Ville souhaitée",
    anyCity: "Saint-Étienne ou Nice",
    experience: "Votre expérience",
    experienceLevels: [
      "Apprenti ou en formation",
      "Moins de 2 ans",
      "De 2 à 5 ans",
      "Plus de 5 ans",
    ],
    portfolio: "Vos réalisations (lien Instagram ou portfolio, facultatif)",
    cv: "Votre CV (facultatif)",
    cvButton: "Joindre mon CV",
    cvHint: "PDF, Word ou image · 5 Mo maximum",
    cvWrongType: "Format non accepté. Joignez un PDF, un document Word ou une image.",
    cvTooLarge: "Le fichier dépasse 5 Mo. Merci de joindre un CV plus léger.",
    message: "Parlez-nous de vous",
    send: "Envoyer ma candidature",
    sent: "Merci ! Votre candidature a bien été envoyée à l'équipe Seven.",
  },
  salon: {
    bookOnPlanity: "Réserver sur Planity",
    ratingLabel: (rating: string) => `Note de ${rating} sur 5`,
    reviews: (rating: string, count: string) =>
      `${rating} · ${count} avis sur Planity`,
    choose: "Choisir une prestation",
    bookingNote:
      "Réservation Planity 24h/24 · Paiement sur place · Confirmation immédiate.",
    servicesEyebrow: "Les prestations",
    servicesTitle: "La carte du salon.",
    servicesIntro:
      "Tarifs et durées tels qu'indiqués sur Planity. La réservation se fait sur la page du salon.",
    seeAvailability: "Voir les disponibilités sur Planity",
    galleryEyebrow: "Le salon en images",
    galleryIntro: "Quelques vues du salon, issues de sa galerie Planity.",
    seeYouSoon: "À bientôt au salon.",
    makeAppointment: "Prendre rendez-vous",
    allSalons: "Tous nos salons",
    categories: {
      cut: "Coupe",
      cutBeard: "Coupe & barbe",
      beard: "Barbe",
      colour: "Couleur & lissage",
    },
  },
  salonPages: {
    anatole: {
      heroAlt:
        "Devanture du barbier Seven Barbershop Anatole France, 12 rue du 11 Novembre à Saint-Étienne",
      aboutTitle: "Le savoir-faire Seven, rue du 11 Novembre.",
      aboutText:
        "Retrouvez notre équipe au 12 rue du 11 Novembre à Saint-Étienne. Coupe, barbe et rasage à l'ancienne : choisissez votre prestation et réservez directement en ligne.",
      galleryTitle: "Bienvenue chez Seven.",
      galleryIntro:
        "La devanture partagée et quelques photos du salon publiées sur Planity.",
      photos: [
        {
          label: "Le salon",
          alt: "Fauteuils de barbier et postes de coiffure du Seven Barbershop Anatole France à Saint-Étienne",
        },
        {
          label: "L'équipe",
          alt: "Barbiers Seven Barbershop au travail dans le salon Anatole France, à Saint-Étienne",
        },
        {
          label: "L'espace barbier",
          alt: "Espace barbier du Seven Barbershop Anatole France, rue du 11 Novembre à Saint-Étienne",
        },
        {
          label: "Les détails",
          alt: "Détail de la décoration intérieure du barbier Seven Barbershop Anatole France",
        },
        {
          label: "L'espace détente",
          alt: "Canapé en cuir et fauteuil de barbier du salon Anatole France à Saint-Étienne",
        },
      ],
      services: [
        "Coupe adulte",
        "Coupe étudiant",
        "Coupe enfant (-10 ans)",
        "Coupe transformation",
        "Adulte (+25 ans)",
        "Étudiant (-25 ans)",
        "Avec soins",
        "Taille de barbe express",
        "Taille de barbe avec soins",
        "Rasage à l'ancienne, serviette chaude",
      ],
    },
    jeanJaures: {
      heroAlt:
        "Postes de coiffure et fauteuils de barbier du Seven Barbershop, 1 place Jean Jaurès à Saint-Étienne",
      aboutTitle: "Le savoir-faire Seven, place Jean Jaurès.",
      aboutText:
        "Retrouvez l'équipe Seven Barbershop au 1 place Jean Jaurès, au cœur de Saint-Étienne. Coupe, barbe et soins : choisissez votre prestation et réservez directement en ligne.",
      galleryTitle: "Bienvenue chez Jean Jaurès.",
      galleryIntro: "Découvrez les espaces et les détails du salon.",
      photos: [
        {
          label: "Le fauteuil barbier",
          alt: "Fauteuil de barbier et bac de lavage du Seven Barbershop Jean Jaurès à Saint-Étienne",
        },
        {
          label: "Les prestations",
          alt: "Carte des prestations et tarifs affichée au Seven Barbershop Jean Jaurès",
        },
        {
          label: "L'espace barbier",
          alt: "Bac de lavage et fauteuil en cuir du barbier Seven Barbershop place Jean Jaurès",
        },
        {
          label: "L'atmosphère",
          alt: "Fauteuil de barbier vu depuis la mezzanine du Seven Barbershop Jean Jaurès",
        },
      ],
      services: [
        "Adulte (+25 ans)",
        "Étudiant (-25 ans)",
        "Avec soins (serviette chaude)",
        "Étudiant (-25 ans)",
        "Adulte (+25 ans)",
        "Coupe transformation",
        "Taille à la tondeuse",
        "Taille de barbe & rasage",
        "Taille de barbe & soins",
      ],
    },
    meyerbeer: {
      heroAlt:
        "Postes de coiffure et fauteuils de barbier du Seven Barbershop, 4 rue Meyerbeer à Nice",
      aboutTitle: "Le savoir-faire Seven, rue Meyerbeer.",
      aboutText:
        "Retrouvez l'équipe Seven Barbershop au 4 rue Meyerbeer, au cœur de Nice. Coupe, barbe et soins : choisissez votre prestation et réservez directement en ligne.",
      bookingNote:
        "Du lundi au samedi, 9h30 – 19h · Réservation Planity 24h/24 · Paiement sur place.",
      servicesIntro:
        "Tarifs et durées tels qu'indiqués sur Planity. Les prestations couleur et lissage se réservent directement au salon.",
      galleryTitle: "Bienvenue à Nice.",
      photos: [
        {
          label: "Le salon",
          alt: "Fauteuils de barbier capitonnés et banquette en cuir du Seven Barbershop rue Meyerbeer à Nice",
        },
        {
          label: "La devanture",
          alt: "Devanture du barbier Seven Barbershop, 4 rue Meyerbeer à Nice, enseigne Trust your barber",
        },
        {
          label: "L'espace barbier",
          alt: "Bac de lavage et fauteuil de barbier devant la fresque Seven Barber Shop, salon Meyerbeer à Nice",
        },
        {
          label: "Les fauteuils",
          alt: "Rangée de fauteuils de barbier en cuir noir capitonné du Seven Barbershop Meyerbeer",
        },
        {
          label: "L'atmosphère",
          alt: "Fresque The Old French School et enseigne lumineuse du barbier Seven Barbershop à Nice",
        },
      ],
      services: [
        "Adulte (+25 ans)",
        "Étudiant (-25 ans)",
        "Avec soins (VIP)",
        "Adulte (+25 ans), shampoing inclus",
        "Étudiant, shampoing inclus",
        "Enfant (-15 ans), shampoing inclus",
        "Coupe transformation",
        "Taille de barbe classique",
        "Taille de barbe et soins",
        "Défrisage cheveux courts",
        "Lissage brésilien cheveux courts",
        "Couleur blanc polaire / gris",
      ],
    },
    lePort: {
      heroAlt:
        "Intérieur du barbier Seven Barbershop Le Port, 1 boulevard Carnot à Nice",
      aboutTitle: "Le savoir-faire Seven, face au port.",
      aboutText:
        "Retrouvez l'équipe Seven Barbershop au 1 boulevard Carnot, sur le port de Nice. Coupe, barbe et soins : choisissez votre prestation et réservez directement en ligne.",
      bookingNote:
        "Du mardi au samedi, 9h30 – 19h · Réservation Planity 24h/24 · Paiement sur place.",
      galleryTitle: "Bienvenue au Port.",
      photos: [
        {
          label: "Vue sur le port",
          alt: "Fauteuils de barbier et postes de coiffure du Seven Barbershop Le Port, vitrine sur le port de Nice",
        },
        {
          label: "L'espace soins",
          alt: "Bacs de lavage, fauteuils de barbier et produits de coiffage du barbier Seven Barbershop Le Port à Nice",
        },
      ],
      services: [
        "Adulte",
        "Étudiant",
        "Avec soins",
        "Coupe adulte",
        "Coupe étudiant",
        "Coupe transformation",
        "Taille de barbe classique",
        "Taille de barbe et soins",
      ],
    },
    chavanelle: {
      heroAlt:
        "Intérieur du barbier Seven Barbershop, 17 place Chavanelle à Saint-Étienne",
      aboutEyebrow: "L'expérience Seven",
      aboutText:
        "Retrouvez l'équipe Seven Barbershop au cœur de Saint-Étienne, place Chavanelle. Une ambiance soignée, des gestes précis et un vrai moment pour vous.",
      chooseAndBook: "Choisir une prestation et réserver",
      galleryTitle: "Bienvenue à Chavanelle.",
      bookingTitle: "Votre prochain rendez-vous.",
      bookingText: "Réservation en ligne 24h/24 sur Planity.",
      bookNow: "Réserver maintenant",
      photos: [
        {
          label: "L'accueil",
          alt: "Accueil et comptoir du barbier Seven Barbershop place Chavanelle à Saint-Étienne",
        },
        {
          label: "L'espace barbier",
          alt: "Vue intérieure du salon de barbier Seven Barbershop, place Chavanelle à Saint-Étienne",
        },
        {
          label: "Les détails",
          alt: "Détail de l'aménagement du Seven Barbershop Chavanelle",
        },
        {
          label: "L'atmosphère",
          alt: "Fauteuils de barbier et décoration du Seven Barbershop Chavanelle à Saint-Étienne",
        },
        {
          label: "Le salon",
          alt: "Aperçu de l'espace coupe du Seven Barbershop place Chavanelle",
        },
      ],
    },
  },
  photos: {
    burstFade: {
      alt: "Burst fade sur cheveux bouclés avec barbe taillée, coupe homme réalisée chez Seven Barbershop",
      title: "Burst fade",
      caption: "Dégradé arrondi autour de l'oreille, boucles libres et barbe taillée.",
    },
    lowFadeBeard: {
      alt: "Dégradé bas, cheveux coiffés en arrière et barbe longue aux contours nets, coupe homme Seven Barbershop",
      title: "Low fade & barbe",
      caption: "Dégradé bas, longueurs plaquées en arrière et barbe aux contours nets.",
    },
    lowTaper: {
      alt: "Low taper sur cheveux ondulés vu de profil, coupe réalisée par un barbier Seven Barbershop",
      title: "Low taper",
      caption: "Contour progressif sur la nuque, volume ondulé conservé sur le dessus.",
    },
    classicTaper: {
      alt: "Taper classique avec nuque dégradée et cheveux coiffés en arrière, vue de dos, Seven Barbershop",
      title: "Taper classique",
      caption: "Nuque dégradée et longueurs coiffées en arrière : une coupe intemporelle.",
    },
    curlyLowFade: {
      alt: "Low fade sur cheveux bouclés avec contour du front net, coupe homme chez Seven Barbershop",
      title: "Low fade bouclé",
      caption: "Dégradé bas, contour net du front et boucles travaillées.",
    },
    taperMullet: {
      alt: "Coupe taper mullet sur cheveux bouclés avec tempes dégradées, réalisée chez Seven Barbershop",
      title: "Taper mullet",
      caption: "Tempes dégradées et longueur bouclée conservée sur la nuque.",
    },
    barber: {
      alt: "Barbier Seven Barbershop souriant, en polo vert brodé Trust your barber, devant une fresque de rasoirs",
      title: "Trust your barber",
      caption: "Un barbier attentif, un geste précis, une vraie conversation.",
    },
    shave: {
      alt: "Contour de barbe au rasoir coupe-chou par un barbier Seven Barbershop",
      title: "Le rasage",
      caption: "Contours de barbe au rasoir, à l'ancienne.",
    },
    finish: {
      alt: "Finition à la brosse d'une coupe courte dégradée dans un salon Seven Barbershop",
      title: "La finition",
      caption: "Chaque coupe se termine au détail près.",
    },
    workshop: {
      alt: "Barbiers Seven Barbershop en pleine coupe derrière la table de billard du salon",
      title: "L'atelier",
      caption:
        "Parce que chaque client est unique, notre équipe vous accorde toute l'attention qu'il mérite.",
    },
    team: {
      alt: "L'équipe de barbiers Seven Barbershop en polos verts brodés, réunie dans le salon",
      title: "L'équipe",
      caption: "Chez Seven Barbershop, la passion du métier se transmet aussi.",
    },
    interior: {
      alt: "Intérieur d'un salon Seven Barbershop : table de billard, fauteuils de barbier en cuir et boiseries sur murs vert émeraude",
      title: "Un lieu pour prendre le temps",
      caption: "Billard, boiseries et fauteuils en cuir : l'esprit club anglais.",
    },
    sign: {
      alt: "Enseigne dorée Seven Barber Shop, Trust your barber, et enseigne lumineuse de barbier sur la devanture",
      title: "L'identité Seven",
      caption: "Lettres dorées et enseigne de barbier : la signature de la maison.",
    },
    polo: {
      alt: "Barbier Seven Barbershop de dos, polo vert brodé Seven Barber Shop Trust your barber",
      title: "L'équipe",
      caption: "Le polo brodé, porté avec fierté dans chacun de nos salons.",
    },
    products: {
      alt: "Produits de soin pour la barbe de qualité, sélectionnés par Seven Barbershop",
      title: "Des produits de qualité",
      caption: "Des produits de qualité, sélectionnés pour vous.",
    },
  },
};

export type Dictionary = typeof fr;
