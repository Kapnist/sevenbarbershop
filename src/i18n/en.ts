import type { Dictionary } from "./fr";

export const en: Dictionary = {
  nav: {
    home: "Home",
    services: "Services",
    salon: "The barbershop",
    salons: "Our locations",
    about: "About",
    careers: "Careers",
    contact: "Contact",

    book: "Book",
    label: "Main navigation",
    homeLabel: "Seven Barbershop, home",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    footerLabel: "Useful links",
    language: "Language",
  },
  booking: {
    eyebrow: "Online booking",
    title: "Book your appointment.",
    description: "Choose your salon, your service and your barber: only truly available time slots are shown.",
    cta: "Book online",
    seeSlots: "See available slots",
    steps: {
      salon: "Salon",
      service: "Service",
      staff: "Barber",
      date: "Day",
      time: "Time",
      details: "Your details",
    },
    summary: "Your appointment",
    change: "Change",
    anyStaff: "No preference",
    anyStaffHint: "The first available barber",
    loading: "Loading…",
    noSlots: "No more free slots that day: please choose another day.",
    noDays: "No free slots in the coming days for this choice. Try “No preference” or another salon.",
    planityOnly: (salon: string) => `The ${salon} salon takes bookings on Planity for now.`,
    unavailable: "Online booking is temporarily unavailable. You can book on Planity.",
    name: "Your name",
    phone: "Your phone number",
    phoneHint: "A French number, for example 06 12 34 56 78",
    email: "Your email (optional, to receive the confirmation)",
    note: "Anything your barber should know? (optional)",
    consent: "I agree that Seven Barbershop may contact me by email or text message to remind me to book again and tell me about its offers. I can unsubscribe at any time.",
    privacy: "Your details are used to manage your appointment. Payment at the salon.",
    submit: "Confirm the appointment",
    submitting: "Booking…",
    confirmedTitle: "You're booked!",
    confirmedText: "Your appointment is confirmed. See you soon at the salon.",
    reference: "Reference",
    withStaff: "With",
    cancelNote: "A cancellation link is shown below and in your confirmation e-mail. To move your appointment, cancel it and book a new slot, or contact the salon.",
    cancelLink: "Cancel this appointment",
    addToCalendar: "Add to my calendar",
    cancelEyebrow: "Cancellation",
    cancelTitle: "Cancel your appointment?",
    cancelText: "The slot will be released immediately for another client.",
    cancelConfirm: "Yes, cancel the appointment",
    cancelKeep: "Keep my appointment",
    cancelling: "Cancelling…",
    cancelledTitle: "Appointment cancelled.",
    cancelledText: "Your appointment has been cancelled. See you soon at Seven Barbershop.",
    cancelTooLate: "It is too late to cancel online. Please call the salon.",
    cancelInvalid: "This cancellation link is no longer valid: the appointment cannot be found or is already cancelled.",
    another: "Book another appointment",
    error: "The booking didn't go through. Check your details and try again.",
    slotTaken: "This slot has just been taken. Please choose another one.",
    minutes: (minutes: number) => `${minutes} min`,
  },
  notFound: {
    eyebrow: "Error 404",
    title: "This page doesn't exist.",
    back: "Back to home",
  },
  format: {
    barberIn: (city: string) => `Barber in ${city}`,
    duration: (minutes: number) => {
      const hours = Math.floor(minutes / 60);
      const rest = minutes % 60;
      if (!hours) return `${rest} min`;
      return rest ? `${hours} hr ${rest}` : `${hours} hr`;
    },
    range: (from: string, to: string) => `${from} to ${to}`,
    time: (hours: number, minutes: number) => {
      const suffix = hours >= 12 ? "pm" : "am";
      const hour12 = hours % 12 || 12;
      return `${hour12}${minutes ? `:${String(minutes).padStart(2, "0")}` : ""} ${suffix}`;
    },
    from: (price: string) => `From ${price}`,
    onQuote: "On quote",
  },
  hours: {
    days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    open: (first: string, last: string, opens: string, closes: string) =>
      first === last
        ? `${first}, ${opens} – ${closes}`
        : `${first} to ${last}, ${opens} – ${closes}`,
    closed: (days: string[]) => `Closed on ${days.join(" and ")}`,
  },
  lightbox: {
    enlarge: (title: string) => `Enlarge photo: ${title}`,
    close: "Close viewer",
    previous: "Previous photo",
    next: "Next photo",
  },
  home: {
    eyebrow: "Barbershop in Saint-Étienne & Nice",
    heroCopy:
      "Haircuts, beard trims and traditional shaves in barbershops with the spirit of an English gentlemen's club. True barbering skill, genuine care and an experience designed around you.",
    ctaBook: "Book my appointment",
    ctaServices: "See our services",
    highlights: {
      salons: "locations",
      cities: "cities",
      reviews: "Planity reviews",
      booking: "online booking",
      bookingValue: "24/7",
    },
    servicesEyebrow: "The Seven craft",
    servicesTitle: "An eye for detail, at every appointment.",
    servicesIntro:
      "Classics done right, tailored to your style. Prices vary by location.",
    servicesLink: "See the full service menu",
    spiritAlt:
      "Tufted barber chairs, emerald green walls and a leather bench in a Seven Barbershop",
    spiritEyebrow: "The Seven spirit",
    spiritTitle: "One address, one atmosphere, one craft.",
    spiritText:
      "A warm, carefully kept setting designed for you: an elegant atmosphere, carried by the energy of the city. Here, there's no rush. Settle in and take your time: at Seven, you'll feel right at home.",
    spiritLink: "Meet the team",
    lookbookEyebrow: "Our work",
    lookbookTitle: "Signed Seven.",
    lookbookIntro:
      "Burst fades, low tapers, fades and sculpted beards: our barbers' craft, one cut at a time.",
    lookbookLink: "See the full lookbook",
    lookbookLabel: "Work by Seven Barbershop barbers",
    locationsEyebrow: "Close to you",
    locationsTitle: (count: number) => `${count} locations, two cities.`,
    locationsIntro:
      "Three barbershops in Saint-Étienne, two in Nice. Choose yours and book in seconds on Planity.",
    cardAlt: (name: string, city: string) =>
      `Seven Barbershop ${name} barbershop in ${city}`,
    discover: "Discover",
    bookingTitle: "Your next appointment awaits.",
    bookingButton: "Book now",
  },
  services: {
    eyebrow: "Our craft",
    title: "The classics, done your way.",
    description:
      "Every appointment starts by listening closely and ends with every detail in place.",
    items: {
      "01": {
        name: "Haircut",
        description:
          "Scissors or clippers, with precise finishing. Adult, student and child prices, plus a makeover cut for a whole new style.",
      },
      "02": {
        name: "Beard",
        description:
          "Express clipper trim or classic trim with care: sharp lines and a well-shaped beard.",
      },
      "03": {
        name: "Traditional shave",
        description:
          "The barber's ritual: a traditional hot-towel shave with a meticulous finish.",
      },
      "04": {
        name: "Haircut & beard",
        description:
          "The complete package to leave looking sharp, with a special price for students under 25.",
      },
      "05": {
        name: "Deluxe package",
        description:
          "Haircut and beard, extended with a hot-towel treatment. A real moment for yourself.",
      },
      "06": {
        name: "Twists, colour & straightening",
        description:
          "Twists and colour, plus relaxing and Brazilian straightening at Nice Meyerbeer. By appointment only.",
      },
    },
    appointmentOnly: "By appointment only",
    ctaText:
      "Prices vary by location: you'll find the full menu on each barbershop's page.",
    ctaButton: "Choose my barbershop",
  },
  salonPage: {
    eyebrow: "The Seven spirit",
    title: "A real moment, beyond the haircut.",
    description:
      "A carefully kept atmosphere, precise technique and a love of work well done.",
    storyTitle: "Classic, with character.",
    storyText:
      "Leather, wood, a pool table and easy conversation: our barbershops cultivate the barber's spirit in a warm setting. We take the time to listen and find the style that suits you.",
    storyAlt:
      "Pool table and leather barber chairs in a Seven Barbershop",
    teamEyebrow: "The team",
    teamTitle: "Barbers, not machines.",
    teamIntro:
      "Embroidered polos in the house colours, confident hands and real conversation: meet the people who make Seven every day.",
    teamLabel: "Photos of the Seven Barbershop team",
    lookbookEyebrow: "Our work",
    lookbookTitle: "The Seven lookbook.",
    lookbookIntro:
      "Burst fades, low tapers, fades and sculpted beards: a few cuts signed by our barbers. Select a photo to enlarge it.",
    ctaText: "Inspired by a cut? Show it to your barber.",
    ctaButton: "Book at my barbershop",
    detailsEyebrow: "In pictures",
    detailsTitle: "The details make the experience.",
    detailsLabel: "Details from Seven Barbershop locations",
  },
  locations: {
    eyebrow: "Our addresses",
    title: "Seven, close to you.",
    description:
      "Find our barbershops in Saint-Étienne and Nice. Choose the address that suits you.",
    count: (count: number) =>
      `${String(count).padStart(2, "0")} location${count > 1 ? "s" : ""}`,
    discover: "Discover",
    book: "Book",
    bookLabel: (name: string, city: string) =>
      `Book at the ${name} barbershop in ${city} on Planity`,
    contact: "Contact",
    contactLabel: (name: string, city: string) =>
      `Contact the ${name} barbershop in ${city}`,
  },
  about: {
    eyebrow: "About",
    title: "Seven Barbershop, your barber in Saint-Étienne and Nice.",
    description:
      "Five barbershops, one standard: traditional barbering skill at the service of your style.",
    storyEyebrow: "Our story",
    storyText:
      "Seven Barbershop brings together three barbershops in Saint-Étienne — rue du 11 Novembre, place Jean Jaurès and place Chavanelle — and two in Nice, on the harbour and on rue Meyerbeer.",
    mottoBefore: "Everywhere, the same motto: ",
    mottoAfter:
      ". Our barbers carry on the traditions of French barbering, from tailored cuts to hot-towel shaves, in barbershops with the feel of an English gentlemen's club.",
    valuesEyebrow: "Our values",
    valuesTitle: "What makes the Seven experience.",
    values: [
      {
        name: "Craftsmanship",
        description:
          "Scissor or clipper cuts, beard trims, traditional hot-towel shaves: the barber's skills, applied with precision.",
        label: "The Old French School",
      },
      {
        name: "Listening",
        description:
          "Every appointment begins with a conversation to understand your style, your hair texture and what you expect from your barber.",
        label: "Trust your barber",
      },
      {
        name: "The setting",
        description:
          "Tufted leather chairs, wood panelling and emerald green walls: barbershops designed for taking your time, like an English club.",
        label: "A real moment for you",
      },
    ],
    citiesEyebrow: "Our barbers in",
    discoverLabel: (name: string, city: string) =>
      `Discover the ${name} barbershop in ${city}`,
    faqEyebrow: "Frequently asked questions",
    faqTitle: "Everything about Seven.",
    faq: [
      {
        question: "Where are the Seven Barbershop locations?",
        answer:
          "Seven Barbershop has five locations. In Saint-Étienne: 12 rue du 11 Novembre (Anatole France), 1 place Jean Jaurès and 17 place Chavanelle. In Nice: 1 boulevard Carnot, on the harbour, and 4 rue Meyerbeer.",
      },
      {
        question: "What services does Seven Barbershop offer?",
        answer:
          "Adult, student and children's haircuts, makeover cuts, beard trims, traditional hot-towel shaves, haircut and beard packages with or without treatments, plus twists and colour, by appointment only.",
      },
      {
        question: "How much does it cost?",
        answer:
          "Haircuts start at €14, beard trims at €10 and the haircut and beard package at €25. Prices vary by location: the full menu is shown on each barbershop's page.",
      },
      {
        question: "What are the opening hours?",
        answer:
          "Anatole France and place Chavanelle: Monday to Saturday, 9 am to 7 pm. Jean Jaurès: Tuesday to Saturday, 10 am to 8 pm. Le Port: Tuesday to Saturday, 9:30 am to 7 pm. Rue Meyerbeer: Monday to Saturday, 9:30 am to 7 pm. All locations are closed on Sundays.",
      },
      {
        question: "How do I book an appointment?",
        answer:
          "Each barbershop has its own Planity booking page, available 24/7. Choose your service and time slot, and get instant confirmation. Payment is made in person, at the barbershop.",
      },
    ],
    ctaText: "Ready to take a seat?",
    ctaButton: "Choose my barbershop",
  },
  contact: {
    eyebrow: "Contact",
    title: "See you at the barbershop?",
    description:
      "A question, an idea, a suggestion? Write to us: every message is read by the Seven team.",
    citiesEyebrow: "Our cities",
    citiesTitle: "Two cities, five addresses.",
    formEyebrow: "Any suggestions?",
    formTitle: "Write to us.",
    disclaimer:
      "Your feedback helps us do better. To book an appointment, reserve online directly with the barbershop of your choice.",
    name: "Your name",
    email: "Your email",
    phone: "Your phone number",
    phoneHint: "A phone number, e.g. 06 12 34 56 78 or +33 6 12 34 56 78",
    salon: "Barbershop concerned (optional)",
    allSalons: "All locations",
    message: "Your message",
    send: "Send my message",
    sendingButton: "Sending…",
    status: {
      idle: "",
      sending: "Sending…",
      sent: "Thank you! Your message has been sent to the Seven team.",
      error:
        "Your message could not be sent. Check your connection and try again.",
    },
  },
  careers: {
    eyebrow: "Careers",
    title: "Join the Seven team.",
    description:
      "Five barbershops, two cities, one shared passion: turning barbering into an art, and passing it on.",
    heroCta: "Apply",
    heroAlt:
      "The Seven Barbershop barber team in embroidered green polos, together in the barbershop",
    whyEyebrow: "Why Seven",
    whyTitle: "One craft, one house, one team.",
    perks: [
      {
        title: "Exceptional barbershops",
        text: "Work in warm, carefully kept barbershops in Saint-Étienne and Nice, designed for the client and the barber alike.",
      },
      {
        title: "Passing on the craft",
        text: "At Seven, the passion for the craft is passed on: techniques, gestures, an eye for detail. We grow together, alongside experienced barbers.",
      },
      {
        title: "Loyal clients",
        text: "More than 2,700 client reviews on Planity: clients who come back and trust our barbers.",
      },
      {
        title: "Team spirit",
        text: "Embroidered polos, shared skills, genuine friendliness: a close-knit team in the house colours.",
      },
    ],
    lifeEyebrow: "Life at Seven",
    lifeTitle: "A day in the life of a Seven barber.",
    lifeLabel: "Photos of the Seven Barbershop team at work",
    profileEyebrow: "Your profile",
    profileTitle: "What matters to us.",
    profile: [
      "A passion for the craft and an eye for detail",
      "Enjoying people and knowing how to listen",
      "Mastery of fades and beard trims, or the will to learn them",
      "A sharp appearance, punctuality and team spirit",
    ],
    quote: "A good barber doesn't just cut hair: they build trust.",
    formEyebrow: "Application",
    formTitle: "Introduce yourself.",
    formIntro:
      "Experienced or up-and-coming barber, send us your application. Each one is reviewed carefully.",
    city: "Preferred city",
    anyCity: "Saint-Étienne or Nice",
    experience: "Your experience",
    experienceLevels: [
      "Apprentice or in training",
      "Less than 2 years",
      "2 to 5 years",
      "More than 5 years",
    ],
    portfolio: "Your work (Instagram or portfolio link, optional)",
    cv: "Your CV (optional)",
    cvButton: "Attach my CV",
    cvHint: "PDF, Word or image · 5 MB max",
    cvWrongType: "Format not accepted. Please attach a PDF, a Word document or an image.",
    cvTooLarge: "The file is larger than 5 MB. Please attach a smaller CV.",
    message: "Tell us about yourself",
    send: "Send my application",
    sent: "Thank you! Your application has been sent to the Seven team.",
  },
  salon: {
    bookOnPlanity: "Book on Planity",
    ratingLabel: (rating: string) => `Rated ${rating} out of 5`,
    reviews: (rating: string, count: string) =>
      `${rating} · ${count} reviews on Planity`,
    choose: "Choose a service",
    bookingNote: "Planity booking 24/7 · Pay in store · Instant confirmation.",
    servicesEyebrow: "Services",
    servicesTitle: "The barbershop menu.",
    servicesIntro:
      "Prices and durations as listed on Planity. Booking is done on the barbershop's page.",
    seeAvailability: "See availability on Planity",
    galleryEyebrow: "The barbershop in pictures",
    galleryIntro: "A few views of the barbershop, from its Planity gallery.",
    seeYouSoon: "See you soon at the barbershop.",
    makeAppointment: "Book an appointment",
    allSalons: "All our locations",
    categories: {
      cut: "Haircut",
      cutBeard: "Haircut & beard",
      beard: "Beard",
      colour: "Colour & straightening",
    },
  },
  salonPages: {
    anatole: {
      heroAlt:
        "Storefront of the Seven Barbershop Anatole France, 12 rue du 11 Novembre in Saint-Étienne",
      aboutTitle: "The Seven craft, on rue du 11 Novembre.",
      aboutText:
        "Find our team at 12 rue du 11 Novembre in Saint-Étienne. Haircuts, beards and traditional shaves: choose your service and book online directly.",
      galleryTitle: "Welcome to Seven.",
      galleryIntro:
        "The storefront and a few photos of the barbershop published on Planity.",
      photos: [
        {
          label: "The barbershop",
          alt: "Barber chairs and styling stations at the Seven Barbershop Anatole France in Saint-Étienne",
        },
        {
          label: "The team",
          alt: "Seven Barbershop barbers at work in the Anatole France barbershop, Saint-Étienne",
        },
        {
          label: "The barber area",
          alt: "Barber area of the Seven Barbershop Anatole France, rue du 11 Novembre in Saint-Étienne",
        },
        {
          label: "The details",
          alt: "Interior decor detail at the Seven Barbershop Anatole France",
        },
        {
          label: "The lounge",
          alt: "Leather sofa and barber chair at the Anatole France barbershop in Saint-Étienne",
        },
      ],
      services: [
        "Adult haircut",
        "Student haircut",
        "Child haircut (under 10)",
        "Makeover cut",
        "Adult (25+)",
        "Student (under 25)",
        "With treatment",
        "Express beard trim",
        "Beard trim with treatment",
        "Traditional hot-towel shave",
      ],
    },
    jeanJaures: {
      heroAlt:
        "Styling stations and barber chairs at the Seven Barbershop, 1 place Jean Jaurès in Saint-Étienne",
      aboutTitle: "The Seven craft, on place Jean Jaurès.",
      aboutText:
        "Find the Seven Barbershop team at 1 place Jean Jaurès, in the heart of Saint-Étienne. Haircuts, beards and treatments: choose your service and book online directly.",
      galleryTitle: "Welcome to Jean Jaurès.",
      galleryIntro: "Discover the spaces and details of the barbershop.",
      photos: [
        {
          label: "The barber chair",
          alt: "Barber chair and wash basin at the Seven Barbershop Jean Jaurès in Saint-Étienne",
        },
        {
          label: "The services",
          alt: "Service menu and prices displayed at the Seven Barbershop Jean Jaurès",
        },
        {
          label: "The barber area",
          alt: "Wash basin and leather chair at the Seven Barbershop on place Jean Jaurès",
        },
        {
          label: "The atmosphere",
          alt: "Barber chair seen from the mezzanine of the Seven Barbershop Jean Jaurès",
        },
      ],
      services: [
        "Adult (25+)",
        "Student (under 25)",
        "With treatment (hot towel)",
        "Student (under 25)",
        "Adult (25+)",
        "Makeover cut",
        "Clipper trim",
        "Beard trim & shave",
        "Beard trim & treatment",
      ],
    },
    meyerbeer: {
      heroAlt:
        "Styling stations and barber chairs at the Seven Barbershop, 4 rue Meyerbeer in Nice",
      aboutTitle: "The Seven craft, on rue Meyerbeer.",
      aboutText:
        "Find the Seven Barbershop team at 4 rue Meyerbeer, in the heart of Nice. Haircuts, beards and treatments: choose your service and book online directly.",
      bookingNote:
        "Monday to Saturday, 9:30 am – 7 pm · Planity booking 24/7 · Pay in store.",
      servicesIntro:
        "Prices and durations as listed on Planity. Colour and straightening services are booked directly at the barbershop.",
      galleryTitle: "Welcome to Nice.",
      photos: [
        {
          label: "The barbershop",
          alt: "Tufted barber chairs and leather bench at the Seven Barbershop on rue Meyerbeer in Nice",
        },
        {
          label: "The storefront",
          alt: "Storefront of the Seven Barbershop, 4 rue Meyerbeer in Nice, with its Trust your barber sign",
        },
        {
          label: "The barber area",
          alt: "Wash basin and barber chair in front of the Seven Barber Shop mural, Meyerbeer barbershop in Nice",
        },
        {
          label: "The chairs",
          alt: "Row of tufted black leather barber chairs at the Seven Barbershop Meyerbeer",
        },
        {
          label: "The atmosphere",
          alt: "The Old French School mural and illuminated barber pole at the Seven Barbershop in Nice",
        },
      ],
      services: [
        "Adult (25+)",
        "Student (under 25)",
        "With treatment (VIP)",
        "Adult (25+), shampoo included",
        "Student, shampoo included",
        "Child (under 15), shampoo included",
        "Makeover cut",
        "Classic beard trim",
        "Beard trim and treatment",
        "Relaxing, short hair",
        "Brazilian straightening, short hair",
        "Polar white / grey colour",
      ],
    },
    lePort: {
      heroAlt:
        "Inside the Seven Barbershop Le Port, 1 boulevard Carnot in Nice",
      aboutTitle: "The Seven craft, facing the harbour.",
      aboutText:
        "Find the Seven Barbershop team at 1 boulevard Carnot, on the harbour in Nice. Haircuts, beards and treatments: choose your service and book online directly.",
      bookingNote:
        "Tuesday to Saturday, 9:30 am – 7 pm · Planity booking 24/7 · Pay in store.",
      galleryTitle: "Welcome to Le Port.",
      photos: [
        {
          label: "Harbour view",
          alt: "Barber chairs and styling stations at the Seven Barbershop Le Port, with a window onto Nice harbour",
        },
        {
          label: "The care area",
          alt: "Wash basins, barber chairs and styling products at the Seven Barbershop Le Port in Nice",
        },
      ],
      services: [
        "Adult",
        "Student",
        "With treatment",
        "Adult haircut",
        "Student haircut",
        "Makeover cut",
        "Classic beard trim",
        "Beard trim and treatment",
      ],
    },
    chavanelle: {
      heroAlt:
        "Inside the Seven Barbershop, 17 place Chavanelle in Saint-Étienne",
      aboutEyebrow: "The Seven experience",
      aboutText:
        "Find the Seven Barbershop team in the heart of Saint-Étienne, on place Chavanelle. A carefully kept atmosphere, precise technique and a real moment for you.",
      chooseAndBook: "Choose a service and book",
      galleryTitle: "Welcome to Chavanelle.",
      bookingTitle: "Your next appointment.",
      bookingText: "Online booking 24/7 on Planity.",
      bookNow: "Book now",
      photos: [
        {
          label: "Reception",
          alt: "Reception and counter at the Seven Barbershop on place Chavanelle in Saint-Étienne",
        },
        {
          label: "The barber area",
          alt: "Inside the Seven Barbershop on place Chavanelle in Saint-Étienne",
        },
        {
          label: "The details",
          alt: "Interior detail at the Seven Barbershop Chavanelle",
        },
        {
          label: "The atmosphere",
          alt: "Barber chairs and decor at the Seven Barbershop Chavanelle in Saint-Étienne",
        },
        {
          label: "The barbershop",
          alt: "Overview of the cutting area at the Seven Barbershop on place Chavanelle",
        },
      ],
    },
  },
  photos: {
    burstFade: {
      alt: "Burst fade on curly hair with a trimmed beard, men's haircut at Seven Barbershop",
      title: "Burst fade",
      caption: "Rounded fade around the ear, free-flowing curls and a trimmed beard.",
    },
    lowFadeBeard: {
      alt: "Low fade, slicked-back hair and a long beard with sharp lines, men's haircut at Seven Barbershop",
      title: "Low fade & beard",
      caption: "Low fade, slicked-back length and a beard with sharp lines.",
    },
    lowTaper: {
      alt: "Low taper on wavy hair, side view, cut by a Seven Barbershop barber",
      title: "Low taper",
      caption: "A gradual taper at the neckline, with wavy volume kept on top.",
    },
    classicTaper: {
      alt: "Classic taper with a faded neckline and slicked-back hair, rear view, Seven Barbershop",
      title: "Classic taper",
      caption: "Faded neckline and slicked-back length: a timeless cut.",
    },
    curlyLowFade: {
      alt: "Low fade on curly hair with a sharp hairline, men's haircut at Seven Barbershop",
      title: "Curly low fade",
      caption: "Low fade, sharp hairline and defined curls.",
    },
    taperMullet: {
      alt: "Taper mullet on curly hair with faded temples, cut at Seven Barbershop",
      title: "Taper mullet",
      caption: "Faded temples with curly length kept at the back.",
    },
    barber: {
      alt: "Smiling Seven Barbershop barber in an embroidered green Trust your barber polo, in front of a razor mural",
      title: "Trust your barber",
      caption: "An attentive barber, a precise hand, a real conversation.",
    },
    shave: {
      alt: "Beard lining with a straight razor by a Seven Barbershop barber",
      title: "The shave",
      caption: "Beard lines done with a razor, the traditional way.",
    },
    finish: {
      alt: "Brushing off a short faded haircut in a Seven Barbershop",
      title: "The finish",
      caption: "Every cut ends with every detail in place.",
    },
    workshop: {
      alt: "Seven Barbershop barbers cutting hair behind the barbershop's pool table",
      title: "The workshop",
      caption:
        "Because every client is unique, our team gives you all the attention you deserve.",
    },
    team: {
      alt: "The Seven Barbershop barber team in embroidered green polos, together in the barbershop",
      title: "The team",
      caption: "At Seven Barbershop, the passion for the craft is passed on too.",
    },
    interior: {
      alt: "Inside a Seven Barbershop: pool table, leather barber chairs and wood panelling on emerald green walls",
      title: "A place to take your time",
      caption: "Pool table, wood panelling and leather chairs: the English club spirit.",
    },
    sign: {
      alt: "Gold Seven Barber Shop, Trust your barber sign and illuminated barber pole on the storefront",
      title: "The Seven identity",
      caption: "Gold lettering and a barber pole: the house signature.",
    },
    polo: {
      alt: "Seven Barbershop barber from behind, wearing an embroidered green Seven Barber Shop Trust your barber polo",
      title: "The team",
      caption: "The embroidered polo, worn with pride in every one of our barbershops.",
    },
    products: {
      alt: "Quality beard care products selected by Seven Barbershop",
      title: "Quality products",
      caption: "Quality products, selected for you.",
    },
  },
};
