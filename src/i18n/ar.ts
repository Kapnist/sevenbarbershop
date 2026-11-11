import type { Dictionary } from "./fr";

export const ar: Dictionary = {
  nav: {
    home: "الرئيسية",
    services: "الخدمات",
    salon: "الصالون",
    salons: "صالوناتنا",
    about: "من نحن",
    careers: "الوظائف",
    contact: "اتصل بنا",

    book: "احجز",
    label: "القائمة الرئيسية",
    homeLabel: "Seven Barbershop، الصفحة الرئيسية",
    openMenu: "فتح القائمة",
    closeMenu: "إغلاق القائمة",
    footerLabel: "روابط مفيدة",
    language: "اللغة",
  },
  booking: {
    eyebrow: "الحجز عبر الإنترنت",
    title: "احجز موعدك.",
    description: "اختر الصالون والخدمة والحلاق: نعرض فقط المواعيد المتاحة فعلًا.",
    cta: "احجز عبر الإنترنت",
    seeSlots: "عرض المواعيد المتاحة",
    steps: {
      salon: "الصالون",
      service: "الخدمة",
      staff: "الحلاق",
      date: "اليوم",
      time: "الساعة",
      details: "بياناتك",
    },
    summary: "موعدك",
    change: "تعديل",
    anyStaff: "بدون تفضيل",
    anyStaffHint: "أول حلاق متاح",
    loading: "جارٍ التحميل…",
    noSlots: "لا توجد مواعيد متاحة في هذا اليوم: اختر يومًا آخر.",
    noDays: "لا توجد مواعيد متاحة في الأيام القادمة لهذا الاختيار. جرّب «بدون تفضيل» أو صالونًا آخر.",
    planityOnly: (salon: string) => `يستقبل صالون ${salon} الحجوزات حاليًا عبر Planity.`,
    unavailable: "الحجز عبر الإنترنت غير متاح مؤقتًا. يمكنك الحجز عبر Planity.",
    name: "اسمك",
    phone: "رقم هاتفك",
    phoneHint: "رقم فرنسي، مثل 06 12 34 56 78",
    email: "بريدك الإلكتروني (اختياري، لتلقي التأكيد)",
    note: "هل هناك ما يجب أن يعرفه الحلاق؟ (اختياري)",
    consent: "أوافق على أن تتواصل معي Seven Barbershop عبر البريد الإلكتروني أو الرسائل القصيرة لتذكيري بحجز موعد جديد وإعلامي بعروضها. يمكنني إلغاء الاشتراك في أي وقت.",
    privacy: "تُستخدم بياناتك لإدارة موعدك. الدفع في الصالون.",
    submit: "تأكيد الموعد",
    submitting: "جارٍ الحجز…",
    confirmedTitle: "تم الحجز!",
    confirmedText: "تم تأكيد موعدك. نراك قريبًا في الصالون.",
    reference: "المرجع",
    withStaff: "مع",
    cancelNote: "ستجد رابط الإلغاء أدناه وفي رسالة التأكيد. لتغيير موعدك، ألغِه ثم احجز موعداً جديداً، أو اتصل بالصالون.",
    cancelLink: "إلغاء هذا الموعد",
    addToCalendar: "أضف إلى تقويمي",
    cancelEyebrow: "الإلغاء",
    cancelTitle: "هل تريد إلغاء موعدك؟",
    cancelText: "سيصبح الموعد متاحاً فوراً لزبون آخر.",
    cancelConfirm: "نعم، ألغِ الموعد",
    cancelKeep: "الاحتفاظ بموعدي",
    cancelling: "جارٍ الإلغاء…",
    cancelledTitle: "تم إلغاء الموعد.",
    cancelledText: "تم إلغاء موعدك. نراك قريباً في Seven Barbershop.",
    cancelTooLate: "فات أوان الإلغاء عبر الإنترنت. يرجى الاتصال بالصالون.",
    cancelInvalid: "رابط الإلغاء هذا لم يعد صالحاً: الموعد غير موجود أو أُلغي مسبقاً.",
    another: "حجز موعد آخر",
    error: "لم يتم الحجز. تحقق من بياناتك وحاول مرة أخرى.",
    slotTaken: "تم حجز هذا الموعد للتو. اختر موعدًا آخر.",
    minutes: (minutes: number) => `${minutes} د`,
  },
  notFound: {
    eyebrow: "خطأ 404",
    title: "هذه الصفحة غير موجودة.",
    back: "العودة إلى الصفحة الرئيسية",
  },
  format: {
    barberIn: (city: string) => `حلاق في ${city}`,
    duration: (minutes: number) => {
      const hours = Math.floor(minutes / 60);
      const rest = minutes % 60;
      if (!hours) return `${rest} دقيقة`;
      const hourLabel = hours === 1 ? "ساعة" : `${hours} ساعات`;
      return rest ? `${hourLabel} و${rest} دقيقة` : hourLabel;
    },
    range: (from: string, to: string) => `من ${from} إلى ${to}`,
    time: (hours: number, minutes: number) =>
      `${hours}:${String(minutes).padStart(2, "0")}`,
    from: (price: string) => `ابتداءً من ${price}`,
    onQuote: "حسب العرض",
  },
  hours: {
    days: ["الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت", "الأحد"],
    open: (first: string, last: string, opens: string, closes: string) =>
      first === last
        ? `يوم ${first}، ${opens} – ${closes}`
        : `من ${first} إلى ${last}، ${opens} – ${closes}`,
    closed: (days: string[]) =>
      days.length > 1
        ? `مغلق يومي ${days.join(" و")}`
        : `مغلق يوم ${days[0]}`,
  },
  lightbox: {
    enlarge: (title: string) => `تكبير الصورة: ${title}`,
    close: "إغلاق العارض",
    previous: "الصورة السابقة",
    next: "الصورة التالية",
  },
  home: {
    eyebrow: "حلاق في سانت إتيان ونيس",
    heroCopy:
      "قص الشعر وتهذيب اللحية والحلاقة التقليدية في صالونات بروح النادي الإنجليزي. حِرفة الحلاق، واهتمام صادق، وتجربة مصمَّمة من أجلك.",
    ctaBook: "احجز موعدي",
    ctaServices: "اكتشف الخدمات",
    highlights: {
      salons: "صالونات",
      cities: "مدينتان",
      reviews: "تقييم على Planity",
      booking: "حجز عبر الإنترنت",
      bookingValue: "24/7",
    },
    servicesEyebrow: "حِرفة Seven",
    servicesTitle: "الاهتمام بالتفاصيل في كل موعد.",
    servicesIntro:
      "أساسيات متقنة تتكيّف مع أسلوبك. تختلف الأسعار من صالون إلى آخر.",
    servicesLink: "قائمة الخدمات كاملة",
    spiritAlt:
      "كراسي حلاقة مبطّنة وجدران بلون الزمرد وأريكة جلدية في أحد صالونات Seven Barbershop",
    spiritEyebrow: "روح Seven",
    spiritTitle: "عنوان، أجواء، حِرفة.",
    spiritText:
      "مكان دافئ ومُعتنى به، صُمّم من أجلك: أجواء أنيقة تنبض بطاقة المدينة. هنا لا شيء يستعجلك. استرخِ وخذ وقتك: في Seven، أنت في بيتك.",
    spiritLink: "تعرّف على الفريق",
    lookbookEyebrow: "أعمالنا",
    lookbookTitle: "بتوقيع Seven.",
    lookbookIntro:
      "Burst fade وLow taper والتدرّجات واللحى المهذّبة: حِرفة حلاقينا، قَصّة بعد قَصّة.",
    lookbookLink: "شاهد جميع الأعمال",
    lookbookLabel: "أعمال حلاقي Seven Barbershop",
    locationsEyebrow: "بالقرب منك",
    locationsTitle: (count: number) => `${count} عناوين في مدينتين.`,
    locationsIntro:
      "ثلاثة صالونات في سانت إتيان واثنان في نيس. اختر صالونك واحجز في ثوانٍ عبر Planity.",
    cardAlt: (name: string, city: string) =>
      `صالون الحلاقة Seven Barbershop ${name} في ${city}`,
    discover: "اكتشف",
    bookingTitle: "موعدك القادم بانتظارك.",
    bookingButton: "احجز الآن",
  },
  services: {
    eyebrow: "حِرفتنا",
    title: "الكلاسيكيات، على طريقتك.",
    description: "كل موعد يبدأ بالإصغاء إليك وينتهي بأدق التفاصيل.",
    items: {
      "01": {
        name: "قص الشعر",
        description:
          "بالمقص أو بالماكينة مع لمسات نهائية دقيقة. أسعار للبالغين والطلاب والأطفال، وقصّة تغيير الإطلالة لأسلوب جديد.",
      },
      "02": {
        name: "اللحية",
        description:
          "تهذيب سريع بالماكينة أو تهذيب كلاسيكي مع العناية: حدود واضحة ولحية متناسقة.",
      },
      "03": {
        name: "الحلاقة التقليدية",
        description:
          "طقس الحلاق: حلاقة تقليدية بالمنشفة الساخنة ولمسات نهائية متقنة.",
      },
      "04": {
        name: "شعر ولحية",
        description:
          "الباقة الكاملة لإطلالة لا تشوبها شائبة، مع سعر خاص للطلاب دون 25 عامًا.",
      },
      "05": {
        name: "باقة العناية",
        description:
          "قص الشعر واللحية مع عناية بالمنشفة الساخنة. لحظة حقيقية من أجلك.",
      },
      "06": {
        name: "ضفائر وصبغة وتمليس",
        description:
          "ضفائر (vanilles) وصبغة، بالإضافة إلى فرد الشعر والتمليس البرازيلي في صالون نيس Meyerbeer. بموعد مسبق فقط.",
      },
    },
    appointmentOnly: "بموعد مسبق فقط",
    ctaText:
      "تختلف الأسعار من صالون إلى آخر: ستجد القائمة الكاملة في صفحة كل صالون.",
    ctaButton: "اختر صالوني",
  },
  salonPage: {
    eyebrow: "روح Seven",
    title: "لحظة حقيقية، أبعد من مجرد قَصّة.",
    description: "أجواء مُعتنى بها، وحركات دقيقة، وشغف بالعمل المتقن.",
    storyTitle: "الكلاسيكي، بشخصية مميّزة.",
    storyText:
      "جلد وخشب وطاولة بلياردو وأحاديث عفوية: صالوناتنا تحافظ على روح الحلاق في أجواء دافئة. نأخذ وقتنا للإصغاء إليك وإيجاد الأسلوب الذي يشبهك.",
    storyAlt: "طاولة بلياردو وكراسي حلاقة جلدية في أحد صالونات Seven Barbershop",
    teamEyebrow: "الفريق",
    teamTitle: "حلاقون، لا آلات.",
    teamIntro:
      "قمصان مطرّزة بألوان الدار، وأيادٍ واثقة، وحديث صادق: تعرّف على من يصنعون Seven كل يوم.",
    teamLabel: "صور فريق Seven Barbershop",
    lookbookEyebrow: "أعمالنا",
    lookbookTitle: "معرض أعمال Seven.",
    lookbookIntro:
      "Burst fade وLow taper والتدرّجات واللحى المهذّبة: بعض القَصّات بتوقيع حلاقينا. اختر صورة لتكبيرها.",
    ctaText: "أعجبتك قَصّة؟ أرِها لحلاقك.",
    ctaButton: "احجز في صالوني",
    detailsEyebrow: "بالصور",
    detailsTitle: "التفاصيل تصنع التجربة.",
    detailsLabel: "تفاصيل صالونات Seven Barbershop",
  },
  locations: {
    eyebrow: "عناويننا",
    title: "Seven، بالقرب منك.",
    description:
      "اعثر على صالوناتنا في سانت إتيان ونيس. اختر العنوان الذي يناسبك.",
    count: (count: number) => (count === 2 ? "صالونان" : `${count} صالونات`),
    discover: "اكتشف",
    book: "احجز",
    bookLabel: (name: string, city: string) =>
      `احجز في صالون ${name} في ${city} عبر Planity`,
    contact: "تواصل",
    contactLabel: (name: string, city: string) =>
      `تواصل مع صالون ${name} في ${city}`,
  },
  about: {
    eyebrow: "من نحن",
    title: "Seven Barbershop، حلاقك في سانت إتيان ونيس.",
    description:
      "خمسة صالونات ومعيار واحد: حِرفة الحلاق التقليدي في خدمة أسلوبك.",
    storyEyebrow: "قصتنا",
    storyText:
      "تضم Seven Barbershop ثلاثة صالونات في سانت إتيان (rue du 11 Novembre وplace Jean Jaurès وplace Chavanelle) وصالونين في نيس، على الميناء وفي rue Meyerbeer.",
    mottoBefore: "في كل مكان، الشعار نفسه: ",
    mottoAfter:
      ". يواصل حلاقونا تقاليد الحلاقة الفرنسية، من القَصّة المفصّلة إلى الحلاقة بالمنشفة الساخنة، في صالونات بأجواء النادي الإنجليزي.",
    valuesEyebrow: "قيمنا",
    valuesTitle: "ما يصنع تجربة Seven.",
    values: [
      {
        name: "الحِرفة",
        description:
          "قص بالمقص أو بالماكينة، وتهذيب اللحية، والحلاقة التقليدية بالمنشفة الساخنة: حركات الحلاق، تُنفَّذ بدقة.",
        label: "The Old French School",
      },
      {
        name: "الإصغاء",
        description:
          "يبدأ كل موعد بحوار لفهم أسلوبك وطبيعة شعرك وما تنتظره من حلاقك.",
        label: "Trust your barber",
      },
      {
        name: "المكان",
        description:
          "كراسي جلدية مبطّنة وألواح خشبية وجدران بلون الزمرد: صالونات صُمّمت لتأخذ وقتك، كما في نادٍ إنجليزي.",
        label: "لحظة حقيقية من أجلك",
      },
    ],
    citiesEyebrow: "حلاقونا في",
    discoverLabel: (name: string, city: string) =>
      `اكتشف صالون ${name} في ${city}`,
    faqEyebrow: "الأسئلة الشائعة",
    faqTitle: "كل ما تريد معرفته عن Seven.",
    faq: [
      {
        question: "أين تقع صالونات Seven Barbershop؟",
        answer:
          "تضم Seven Barbershop خمسة صالونات. في سانت إتيان: ⁨12 rue du 11 Novembre⁩ (Anatole France) و⁨1 place Jean Jaurès⁩ و⁨17 place Chavanelle⁩. في نيس: ⁨1 boulevard Carnot⁩ على الميناء، و⁨4 rue Meyerbeer⁩.",
      },
      {
        question: "ما الخدمات التي تقدّمها Seven Barbershop؟",
        answer:
          "قص الشعر للبالغين والطلاب والأطفال، وقصّة تغيير الإطلالة، وتهذيب اللحية، والحلاقة التقليدية بالمنشفة الساخنة، وباقات الشعر واللحية مع العناية أو بدونها، إضافة إلى الضفائر والصبغة بموعد مسبق فقط.",
      },
      {
        question: "ما هي الأسعار؟",
        answer:
          "يبدأ سعر قص الشعر من 14 €، وتهذيب اللحية من 10 €، وباقة الشعر واللحية من 25 €. تختلف الأسعار من صالون إلى آخر: القائمة الكاملة معروضة في صفحة كل صالون.",
      },
      {
        question: "ما هي مواعيد العمل؟",
        answer:
          "Anatole France وplace Chavanelle: من الاثنين إلى السبت، من 9:00 إلى 19:00. Jean Jaurès: من الثلاثاء إلى السبت، من 10:00 إلى 20:00. Le Port: من الثلاثاء إلى السبت، من 9:30 إلى 19:00. Rue Meyerbeer: من الاثنين إلى السبت، من 9:30 إلى 19:00. جميع الصالونات مغلقة يوم الأحد.",
      },
      {
        question: "كيف أحجز موعدًا؟",
        answer:
          "لكل صالون صفحة حجز على Planity متاحة على مدار الساعة. اختر خدمتك وموعدك واحصل على تأكيد فوري. يتم الدفع في الصالون.",
      },
    ],
    ctaText: "هل أنت مستعد للجلوس على الكرسي؟",
    ctaButton: "اختر صالوني",
  },
  contact: {
    eyebrow: "اتصل بنا",
    title: "نلتقي في الصالون؟",
    description:
      "سؤال، فكرة، اقتراح؟ اكتب لنا: فريق Seven يقرأ كل رسالة.",
    citiesEyebrow: "مدننا",
    citiesTitle: "مدينتان، خمسة عناوين.",
    formEyebrow: "هل لديك اقتراحات؟",
    formTitle: "اكتب لنا.",
    disclaimer:
      "رأيك يساعدنا على التحسّن. لحجز موعد، احجز مباشرة عبر الإنترنت في الصالون الذي تختاره.",
    name: "اسمك",
    email: "بريدك الإلكتروني",
    phone: "رقم هاتفك",
    phoneHint: "رقم هاتف، مثل 06 12 34 56 78 أو ‎+33 6 12 34 56 78",
    salon: "الصالون المعني (اختياري)",
    allSalons: "جميع الصالونات",
    message: "رسالتك",
    send: "إرسال رسالتي",
    sendingButton: "جارٍ الإرسال…",
    status: {
      idle: "",
      sending: "جارٍ الإرسال…",
      sent: "شكرًا! تم إرسال رسالتك إلى فريق Seven.",
      error: "تعذّر إرسال الرسالة. تحقّق من اتصالك وحاول مرة أخرى.",
    },
  },
  careers: {
    eyebrow: "الوظائف",
    title: "انضم إلى فريق Seven.",
    description:
      "خمسة صالونات ومدينتان وشغف واحد: أن نجعل من مهنة الحلاقة فنًّا، وأن ننقله.",
    heroCta: "قدّم طلبك",
    heroAlt:
      "فريق حلاقي Seven Barbershop بقمصان خضراء مطرّزة، مجتمعين في الصالون",
    whyEyebrow: "لماذا Seven",
    whyTitle: "مهنة، ودار، وفريق.",
    perks: [
      {
        title: "صالونات استثنائية",
        text: "اعمل في صالونات دافئة ومُعتنى بها في سانت إتيان ونيس، صُمّمت للعميل وللحلاق على حدّ سواء.",
      },
      {
        title: "نقل الخبرة",
        text: "في Seven، يُنقل شغف المهنة: التقنيات والحركات والنظرة. نتطوّر معًا إلى جانب حلاقين ذوي خبرة.",
      },
      {
        title: "عملاء أوفياء",
        text: "أكثر من 2700 تقييم على Planity: عملاء يعودون ويثقون بحلاقينا.",
      },
      {
        title: "روح الفريق",
        text: "قمصان مطرّزة وحركات مشتركة وأجواء ودّية: فريق متماسك بألوان الدار.",
      },
    ],
    lifeEyebrow: "الحياة في Seven",
    lifeTitle: "يوم في حياة حلاق Seven.",
    lifeLabel: "صور فريق Seven Barbershop أثناء العمل",
    profileEyebrow: "ملفك",
    profileTitle: "ما يهمّنا.",
    profile: [
      "الشغف بالمهنة والاهتمام بالتفاصيل",
      "حب التواصل وحسن الإصغاء",
      "إتقان التدرّجات وتهذيب اللحية، أو الرغبة في تعلّمها",
      "مظهر أنيق، والالتزام بالمواعيد، وروح الفريق",
    ],
    quote: "الحلاق الجيد لا يقص الشعر فحسب: بل يبني رابطة ثقة.",
    formEyebrow: "طلب التوظيف",
    formTitle: "عرّفنا بنفسك.",
    formIntro:
      "سواء كنت حلاقًا متمرّسًا أو في بداية الطريق، أرسل إلينا طلبك. ندرس كل طلب باهتمام.",
    city: "المدينة المفضّلة",
    anyCity: "سانت إتيان أو نيس",
    experience: "خبرتك",
    experienceLevels: [
      "متدرّب أو قيد التكوين",
      "أقل من سنتين",
      "من سنتين إلى 5 سنوات",
      "أكثر من 5 سنوات",
    ],
    portfolio: "أعمالك (رابط Instagram أو معرض أعمال، اختياري)",
    cv: "سيرتك الذاتية (اختياري)",
    cvButton: "إرفاق سيرتي الذاتية",
    cvHint: "PDF أو Word أو صورة · 5 ميغابايت كحد أقصى",
    cvWrongType: "صيغة غير مقبولة. يُرجى إرفاق ملف PDF أو مستند Word أو صورة.",
    cvTooLarge: "حجم الملف يتجاوز 5 ميغابايت. يُرجى إرفاق سيرة ذاتية أصغر حجمًا.",
    message: "حدّثنا عن نفسك",
    send: "إرسال طلبي",
    sent: "شكرًا! تم إرسال طلبك إلى فريق Seven.",
  },
  salon: {
    bookOnPlanity: "احجز عبر Planity",
    ratingLabel: (rating: string) => `التقييم ${rating} من 5`,
    reviews: (rating: string, count: string) =>
      `${rating} · ${count} تقييم على Planity`,
    choose: "اختر خدمة",
    bookingNote: "حجز عبر Planity على مدار الساعة · الدفع في الصالون · تأكيد فوري.",
    servicesEyebrow: "الخدمات",
    servicesTitle: "قائمة الصالون.",
    servicesIntro:
      "الأسعار والمدد كما هي معروضة على Planity. يتم الحجز من صفحة الصالون.",
    seeAvailability: "شاهد المواعيد المتاحة على Planity",
    galleryEyebrow: "الصالون بالصور",
    galleryIntro: "بعض الصور من الصالون، من معرضه على Planity.",
    seeYouSoon: "نراك قريبًا في الصالون.",
    makeAppointment: "احجز موعدًا",
    allSalons: "جميع صالوناتنا",
    categories: {
      cut: "قص الشعر",
      cutBeard: "شعر ولحية",
      beard: "اللحية",
      colour: "صبغة وتمليس",
    },
  },
  salonPages: {
    anatole: {
      heroAlt:
        "واجهة صالون Seven Barbershop Anatole France، ⁨12 rue du 11 Novembre⁩ في سانت إتيان",
      aboutTitle: "حِرفة Seven، في rue du 11 Novembre.",
      aboutText:
        "تجد فريقنا في ⁨12 rue du 11 Novembre⁩ في سانت إتيان. قص الشعر واللحية والحلاقة التقليدية: اختر خدمتك واحجز مباشرة عبر الإنترنت.",
      galleryTitle: "أهلًا بك في Seven.",
      galleryIntro: "الواجهة وبعض صور الصالون المنشورة على Planity.",
      photos: [
        {
          label: "الصالون",
          alt: "كراسي الحلاقة ومحطات التصفيف في Seven Barbershop Anatole France في سانت إتيان",
        },
        {
          label: "الفريق",
          alt: "حلاقو Seven Barbershop أثناء العمل في صالون Anatole France في سانت إتيان",
        },
        {
          label: "ركن الحلاقة",
          alt: "ركن الحلاقة في Seven Barbershop Anatole France، rue du 11 Novembre في سانت إتيان",
        },
        {
          label: "التفاصيل",
          alt: "تفصيل من الديكور الداخلي لصالون Seven Barbershop Anatole France",
        },
        {
          label: "ركن الاسترخاء",
          alt: "أريكة جلدية وكرسي حلاقة في صالون Anatole France في سانت إتيان",
        },
      ],
      services: [
        "قص شعر للبالغين",
        "قص شعر للطلاب",
        "قص شعر للأطفال (دون 10 سنوات)",
        "قصّة تغيير الإطلالة",
        "بالغ (فوق 25 عامًا)",
        "طالب (دون 25 عامًا)",
        "مع العناية",
        "تهذيب لحية سريع",
        "تهذيب لحية مع العناية",
        "حلاقة تقليدية بالمنشفة الساخنة",
      ],
    },
    jeanJaures: {
      heroAlt:
        "محطات التصفيف وكراسي الحلاقة في Seven Barbershop، ⁨1 place Jean Jaurès⁩ في سانت إتيان",
      aboutTitle: "حِرفة Seven، في place Jean Jaurès.",
      aboutText:
        "تجد فريق Seven Barbershop في ⁨1 place Jean Jaurès⁩، في قلب سانت إتيان. قص الشعر واللحية والعناية: اختر خدمتك واحجز مباشرة عبر الإنترنت.",
      galleryTitle: "أهلًا بك في Jean Jaurès.",
      galleryIntro: "اكتشف أركان الصالون وتفاصيله.",
      photos: [
        {
          label: "كرسي الحلاقة",
          alt: "كرسي حلاقة ومغسلة في Seven Barbershop Jean Jaurès في سانت إتيان",
        },
        {
          label: "الخدمات",
          alt: "قائمة الخدمات والأسعار المعروضة في Seven Barbershop Jean Jaurès",
        },
        {
          label: "ركن الحلاقة",
          alt: "مغسلة وكرسي جلدي في صالون Seven Barbershop في place Jean Jaurès",
        },
        {
          label: "الأجواء",
          alt: "كرسي حلاقة من الطابق العلوي في Seven Barbershop Jean Jaurès",
        },
      ],
      services: [
        "بالغ (فوق 25 عامًا)",
        "طالب (دون 25 عامًا)",
        "مع العناية (منشفة ساخنة)",
        "طالب (دون 25 عامًا)",
        "بالغ (فوق 25 عامًا)",
        "قصّة تغيير الإطلالة",
        "تهذيب بالماكينة",
        "تهذيب اللحية والحلاقة",
        "تهذيب اللحية والعناية",
      ],
    },
    meyerbeer: {
      heroAlt:
        "محطات التصفيف وكراسي الحلاقة في Seven Barbershop، ⁨4 rue Meyerbeer⁩ في نيس",
      aboutTitle: "حِرفة Seven، في rue Meyerbeer.",
      aboutText:
        "تجد فريق Seven Barbershop في ⁨4 rue Meyerbeer⁩، في قلب نيس. قص الشعر واللحية والعناية: اختر خدمتك واحجز مباشرة عبر الإنترنت.",
      bookingNote:
        "من الاثنين إلى السبت، 9:30 – 19:00 · حجز عبر Planity على مدار الساعة · الدفع في الصالون.",
      servicesIntro:
        "الأسعار والمدد كما هي معروضة على Planity. تُحجز خدمات الصبغة والتمليس مباشرة في الصالون.",
      galleryTitle: "أهلًا بك في نيس.",
      photos: [
        {
          label: "الصالون",
          alt: "كراسي حلاقة مبطّنة وأريكة جلدية في Seven Barbershop في rue Meyerbeer بنيس",
        },
        {
          label: "الواجهة",
          alt: "واجهة صالون Seven Barbershop، ⁨4 rue Meyerbeer⁩ في نيس، بلافتة Trust your barber",
        },
        {
          label: "ركن الحلاقة",
          alt: "مغسلة وكرسي حلاقة أمام جدارية Seven Barber Shop، صالون Meyerbeer في نيس",
        },
        {
          label: "الكراسي",
          alt: "صف من كراسي الحلاقة الجلدية السوداء المبطّنة في Seven Barbershop Meyerbeer",
        },
        {
          label: "الأجواء",
          alt: "جدارية The Old French School وعمود الحلاق المضيء في Seven Barbershop في نيس",
        },
      ],
      services: [
        "بالغ (فوق 25 عامًا)",
        "طالب (دون 25 عامًا)",
        "مع العناية (VIP)",
        "بالغ (فوق 25 عامًا)، مع غسل الشعر",
        "طالب، مع غسل الشعر",
        "طفل (دون 15 عامًا)، مع غسل الشعر",
        "قصّة تغيير الإطلالة",
        "تهذيب لحية كلاسيكي",
        "تهذيب اللحية والعناية",
        "فرد الشعر القصير",
        "تمليس برازيلي للشعر القصير",
        "صبغة أبيض قطبي / رمادي",
      ],
    },
    lePort: {
      heroAlt: "داخل صالون Seven Barbershop Le Port، ⁨1 boulevard Carnot⁩ في نيس",
      aboutTitle: "حِرفة Seven، قبالة الميناء.",
      aboutText:
        "تجد فريق Seven Barbershop في ⁨1 boulevard Carnot⁩، على ميناء نيس. قص الشعر واللحية والعناية: اختر خدمتك واحجز مباشرة عبر الإنترنت.",
      bookingNote:
        "من الثلاثاء إلى السبت، 9:30 – 19:00 · حجز عبر Planity على مدار الساعة · الدفع في الصالون.",
      galleryTitle: "أهلًا بك في Le Port.",
      photos: [
        {
          label: "إطلالة على الميناء",
          alt: "كراسي الحلاقة ومحطات التصفيف في Seven Barbershop Le Port، بواجهة زجاجية على ميناء نيس",
        },
        {
          label: "ركن العناية",
          alt: "مغاسل وكراسي حلاقة ومنتجات تصفيف في صالون Seven Barbershop Le Port في نيس",
        },
      ],
      services: [
        "بالغ",
        "طالب",
        "مع العناية",
        "قص شعر للبالغين",
        "قص شعر للطلاب",
        "قصّة تغيير الإطلالة",
        "تهذيب لحية كلاسيكي",
        "تهذيب اللحية والعناية",
      ],
    },
    chavanelle: {
      heroAlt: "داخل صالون Seven Barbershop، ⁨17 place Chavanelle⁩ في سانت إتيان",
      aboutEyebrow: "تجربة Seven",
      aboutText:
        "تجد فريق Seven Barbershop في قلب سانت إتيان، في place Chavanelle. أجواء مُعتنى بها، وحركات دقيقة، ولحظة حقيقية من أجلك.",
      chooseAndBook: "اختر خدمة واحجز",
      galleryTitle: "أهلًا بك في Chavanelle.",
      bookingTitle: "موعدك القادم.",
      bookingText: "حجز عبر الإنترنت على مدار الساعة عبر Planity.",
      bookNow: "احجز الآن",
      photos: [
        {
          label: "الاستقبال",
          alt: "الاستقبال والمكتب في صالون Seven Barbershop في place Chavanelle بسانت إتيان",
        },
        {
          label: "ركن الحلاقة",
          alt: "داخل صالون Seven Barbershop في place Chavanelle بسانت إتيان",
        },
        {
          label: "التفاصيل",
          alt: "تفصيل من ديكور Seven Barbershop Chavanelle",
        },
        {
          label: "الأجواء",
          alt: "كراسي الحلاقة والديكور في Seven Barbershop Chavanelle في سانت إتيان",
        },
        {
          label: "الصالون",
          alt: "لمحة عن ركن القص في Seven Barbershop في place Chavanelle",
        },
      ],
    },
  },
  photos: {
    burstFade: {
      alt: "قصّة Burst fade على شعر مجعّد مع لحية مهذّبة، في Seven Barbershop",
      title: "Burst fade",
      caption: "تدرّج دائري حول الأذن، وتجاعيد حرّة، ولحية مهذّبة.",
    },
    lowFadeBeard: {
      alt: "تدرّج منخفض وشعر مسرّح إلى الخلف ولحية طويلة بحدود واضحة، قصّة رجالية في Seven Barbershop",
      title: "Low fade ولحية",
      caption: "تدرّج منخفض، وشعر مسرّح إلى الخلف، ولحية بحدود واضحة.",
    },
    lowTaper: {
      alt: "قصّة Low taper على شعر مموّج من الجانب، من تنفيذ حلاق Seven Barbershop",
      title: "Low taper",
      caption: "تدرّج تدريجي عند مؤخرة العنق، مع الحفاظ على الحجم المموّج في الأعلى.",
    },
    classicTaper: {
      alt: "قصّة Taper كلاسيكية بمؤخرة متدرّجة وشعر مسرّح إلى الخلف، من الخلف، Seven Barbershop",
      title: "Taper كلاسيكي",
      caption: "مؤخرة متدرّجة وشعر مسرّح إلى الخلف: قصّة خالدة.",
    },
    curlyLowFade: {
      alt: "قصّة Low fade على شعر مجعّد بحدود جبهة واضحة، في Seven Barbershop",
      title: "Low fade مجعّد",
      caption: "تدرّج منخفض، وحدود جبهة واضحة، وتجاعيد محدّدة.",
    },
    taperMullet: {
      alt: "قصّة Taper mullet على شعر مجعّد مع صدغين متدرّجين، في Seven Barbershop",
      title: "Taper mullet",
      caption: "صدغان متدرّجان مع الحفاظ على الطول المجعّد عند مؤخرة العنق.",
    },
    barber: {
      alt: "حلاق Seven Barbershop مبتسم بقميص أخضر مطرّز Trust your barber، أمام جدارية أمواس",
      title: "Trust your barber",
      caption: "حلاق منتبه، وحركة دقيقة، وحديث صادق.",
    },
    shave: {
      alt: "تحديد اللحية بالموس من قِبل حلاق Seven Barbershop",
      title: "الحلاقة",
      caption: "تحديد اللحية بالموس، على الطريقة التقليدية.",
    },
    finish: {
      alt: "لمسة نهائية بالفرشاة لقصّة قصيرة متدرّجة في أحد صالونات Seven Barbershop",
      title: "اللمسة الأخيرة",
      caption: "كل قصّة تنتهي بأدق التفاصيل.",
    },
    workshop: {
      alt: "حلاقو Seven Barbershop أثناء العمل خلف طاولة البلياردو في الصالون",
      title: "الورشة",
      caption: "لأن كل عميل فريد، يمنحك فريقنا كل الاهتمام الذي تستحقه.",
    },
    team: {
      alt: "فريق حلاقي Seven Barbershop بقمصان خضراء مطرّزة، مجتمعين في الصالون",
      title: "الفريق",
      caption: "في Seven Barbershop، يُنقل شغف المهنة أيضًا.",
    },
    interior: {
      alt: "داخل أحد صالونات Seven Barbershop: طاولة بلياردو وكراسي حلاقة جلدية وألواح خشبية على جدران بلون الزمرد",
      title: "مكان لتأخذ وقتك",
      caption: "بلياردو وألواح خشبية وكراسٍ جلدية: روح النادي الإنجليزي.",
    },
    sign: {
      alt: "لافتة Seven Barber Shop الذهبية Trust your barber وعمود الحلاق المضيء على الواجهة",
      title: "هوية Seven",
      caption: "حروف ذهبية وعمود الحلاق: توقيع الدار.",
    },
    polo: {
      alt: "حلاق Seven Barbershop من الخلف بقميص أخضر مطرّز Seven Barber Shop Trust your barber",
      title: "الفريق",
      caption: "القميص المطرّز، يُرتدى بفخر في كل صالون من صالوناتنا.",
    },
    products: {
      alt: "منتجات عناية باللحية عالية الجودة، اختارتها Seven Barbershop",
      title: "منتجات عالية الجودة",
      caption: "منتجات عالية الجودة، اخترناها من أجلك.",
    },
  },
};
