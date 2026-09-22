import type { CountryPageData } from "@/components/country/country-page-template";
import { formatStat } from "@/lib/site-stats";

export const UK_PAGE: CountryPageData = {
  flag: "🇬🇧",
  countryName: {
    en: "United Kingdom",
    ur: "برطانیہ",
    ar: "المملكة المتحدة",
    fr: "Royaume-Uni",
    id: "Inggris",
  },
  testimonials: [
    {
      name: "Abdullah Asad",
      country: "United Kingdom",
      flag: "🇬🇧",
      course: "Nazra Quran",
      review:
        "Finding a good Qari in the UK was difficult. Tibyaan solved that problem. The live class feels just like face-to-face. My child is very happy!",
    },
    {
      name: "Kaniz Fatima",
      country: "United Kingdom",
      flag: "🇬🇧",
      course: "Nazra Quran",
      review:
        "I'm a busy mum in the UK. Tibyaan connected my daughter to the Quran — she now sits and reads on her own every day.",
    },
    {
      name: "Shaheer Nawaz",
      country: "United Kingdom",
      flag: "🇬🇧",
      course: "Hifz Quran",
      review:
        "Living in the UK, I was worried about my son's religious education. Tibyaan removed that worry. Live classes, AI tracker, and weekly tests — all together are giving the best results!",
    },
    {
      name: "Shahzaib Jahan",
      country: "Canada",
      flag: "🇨🇦",
      course: "Nazra Quran",
      review:
        "Islamic education was a challenge. Tibyaan made it possible to learn Quran from home. My son now recites with great confidence.",
    },
  ],
  translations: {
    en: {
      badge: "Serving Muslim Families Across the UK",
      hero_heading: "Best Online Quran Classes in the UK",
      hero_desc:
        "Join hundreds of Muslim families across London, Birmingham, Manchester, Leeds, and the rest of the UK learning Quran with Tibyaan Academy. Expert teachers, flexible schedules, and AI-powered learning — all from home.",
      cta_trial: "Start 5-Day Free Trial",
      cta_courses: "View Courses",
      why_heading: "Why UK Muslims Choose Tibyaan Academy",
      features: [
        "Live 1-on-1 classes with certified teachers",
        "AI Ustaz available 24/7 for practice",
        "Flexible scheduling across all UK time zones (GMT/BST)",
        "Courses for children and adults",
        "Hifz, Nazra, Arabic, and full Aalim program",
        "5-day free trial — no credit card needed",
      ],
      courses_heading: "Courses Available for UK Students",
      courses_desc:
        "All courses are available online. Classes are scheduled at times convenient for UK time zones (GMT/BST).",
      testimonials_heading: "Trusted by UK Muslim Families",
      stats: [
        { value: formatStat("students"), label: "Students" },
        { value: "4.9★", label: "Average Rating" },
        { value: "5-day", label: "Free Trial" },
      ],
      cta_final_heading: "Join Muslim Families in the UK Learning Quran",
      cta_final_desc:
        "5 days free — no credit card required. Experience live Quran teaching and AI-powered learning from the comfort of your home anywhere in the UK.",
      cta_final_btn: "Get Started Free",
      timezone_msg: "Classes available in UK time zones: GMT and BST",
      courses: [
        {
          slug: "nazra-quran",
          title: "Nazra Quran",
          desc: "Learn to read Quran with proper Tajweed. Perfect for beginners.",
          price_label: "From $25/month",
        },
        {
          slug: "hifz-quran",
          title: "Hifz Quran",
          desc: "Memorise the Holy Quran with structured daily Sabaq & revision tracking.",
          price_label: "From $37/month",
        },
        {
          slug: "arabic-language",
          title: "Arabic Language",
          desc: "Learn Arabic grammar and conversation with a focus on Quranic Arabic.",
          price_label: "From $35/month",
        },
        {
          slug: "aalim-course",
          title: "Aalim Course",
          desc: "Complete Dars-e-Nizami / Aalim program — Fiqh, Hadith, Tafseer & more.",
          price_label: "From $40/month",
        },
      ],
    },
    ur: {
      badge: "برطانیہ میں مسلم خاندانوں کی خدمت میں",
      hero_heading: "برطانیہ میں بہترین آن لائن قرآن کلاسز",
      hero_desc:
        "لندن، برمنگھم، مانچسٹر اور پورے برطانیہ میں سینکڑوں مسلم خاندانوں کے ساتھ شامل ہوں جو تبیان اکیڈمی سے قرآن سیکھ رہے ہیں۔ ماہر اساتذہ، لچکدار نظام الاوقات اور AI سے چلنے والی تعلیم — سب گھر بیٹھے۔",
      cta_trial: "5 دن مفت ٹرائل شروع کریں",
      cta_courses: "کورسز دیکھیں",
      why_heading: "برطانیہ کے مسلمان تبیان اکیڈمی کیوں چنتے ہیں",
      features: [
        "سرٹیفائیڈ اساتذہ کے ساتھ لائیو 1-on-1 کلاسز",
        "AI استاذ 24/7 مشق کے لیے دستیاب",
        "برطانیہ کے تمام ٹائم زونز (GMT/BST) میں لچکدار شیڈول",
        "بچوں اور بالغوں کے لیے کورسز",
        "حفظ، ناظرہ، عربی اور مکمل عالم کورس",
        "5 دن مفت ٹرائل — کوئی کریڈٹ کارڈ ضروری نہیں",
      ],
      courses_heading: "برطانیہ کے طلبا کے لیے دستیاب کورسز",
      courses_desc:
        "تمام کورسز آن لائن دستیاب ہیں۔ کلاسز برطانیہ کے ٹائم زونز (GMT/BST) کے مطابق شیڈول کی جاتی ہیں۔",
      testimonials_heading: "برطانوی مسلم خاندانوں کا اعتماد",
      stats: [
        { value: formatStat("students"), label: "طلبا" },
        { value: "4.9★", label: "اوسط ریٹنگ" },
        { value: "5 دن", label: "مفت ٹرائل" },
      ],
      cta_final_heading: "برطانیہ کے مسلم خاندانوں کے ساتھ قرآن سیکھیں",
      cta_final_desc:
        "5 دن مفت — کوئی کریڈٹ کارڈ ضروری نہیں۔ برطانیہ میں اپنے گھر کے آرام سے لائیو قرآن تعلیم اور AI سے چلنے والی تعلیم کا تجربہ کریں۔",
      cta_final_btn: "مفت شروع کریں",
      timezone_msg: "برطانوی ٹائم زونز میں کلاسز دستیاب: GMT اور BST",
      courses: [
        {
          slug: "nazra-quran",
          title: "ناظرہ قرآن",
          desc: "صحیح تجوید کے ساتھ قرآن پڑھنا سیکھیں۔ مبتدیوں کے لیے بہترین۔",
          price_label: "صرف $25 ماہانہ سے",
        },
        {
          slug: "hifz-quran",
          title: "حفظ قرآن",
          desc: "روزانہ کے سبق اور نظرثانی کے منظم نظام کے ساتھ قرآن حفظ کریں۔",
          price_label: "صرف $37 ماہانہ سے",
        },
        {
          slug: "arabic-language",
          title: "عربی زبان",
          desc: "قرآنی عربی پر توجہ کے ساتھ عربی گرامر اور گفتگو سیکھیں۔",
          price_label: "صرف $35 ماہانہ سے",
        },
        {
          slug: "aalim-course",
          title: "عالم کورس",
          desc: "مکمل درس نظامی / عالم کورس — فقہ، حدیث، تفسیر اور مزید۔",
          price_label: "صرف $40 ماہانہ سے",
        },
      ],
    },
    ar: {
      badge: "نخدم العائلات المسلمة في المملكة المتحدة",
      hero_heading: "أفضل دروس القرآن الكريم عبر الإنترنت في المملكة المتحدة",
      hero_desc:
        "انضم إلى مئات العائلات المسلمة في لندن وبرمنغهام ومانشستر وسائر أنحاء المملكة المتحدة الذين يتعلمون القرآن مع أكاديمية تبيان. معلمون متخصصون، جداول زمنية مرنة، وتعلم بالذكاء الاصطناعي — كل ذلك من راحة منزلك.",
      cta_trial: "ابدأ تجربة مجانية لمدة 5 أيام",
      cta_courses: "استعرض الدورات",
      why_heading: "لماذا يختار مسلمو المملكة المتحدة أكاديمية تبيان",
      features: [
        "دروس فردية مباشرة مع معلمين معتمدين",
        "الأستاذ الذكي متاح 24/7 للممارسة",
        "جدول زمني مرن عبر جميع المناطق الزمنية في المملكة المتحدة",
        "دورات للأطفال والبالغين",
        "برامج الحفظ والناظرة والعربية ودورة العالم الكاملة",
        "تجربة مجانية لمدة 5 أيام — لا حاجة لبطاقة ائتمان",
      ],
      courses_heading: "الدورات المتاحة لطلاب المملكة المتحدة",
      courses_desc:
        "جميع الدورات متاحة عبر الإنترنت. يتم جدولة الدروس في أوقات مناسبة للمناطق الزمنية في المملكة المتحدة.",
      testimonials_heading: "موثوق به من قِبَل العائلات المسلمة في المملكة المتحدة",
      stats: [
        { value: formatStat("students"), label: "طلاب" },
        { value: "4.9★", label: "متوسط التقييم" },
        { value: "5 أيام", label: "تجربة مجانية" },
      ],
      cta_final_heading: "انضم إلى العائلات المسلمة في المملكة المتحدة لتعلم القرآن",
      cta_final_desc:
        "5 أيام مجاناً — لا حاجة لبطاقة ائتمان. استمتع بتعليم القرآن المباشر والتعلم بالذكاء الاصطناعي من راحة منزلك.",
      cta_final_btn: "ابدأ مجاناً",
      timezone_msg: "الدروس متاحة في المناطق الزمنية للمملكة المتحدة: GMT و BST",
      courses: [
        {
          slug: "nazra-quran",
          title: "ناظرة القرآن",
          desc: "تعلم قراءة القرآن بتجويد صحيح. مثالي للمبتدئين.",
          price_label: "من 25 دولار/شهر",
        },
        {
          slug: "hifz-quran",
          title: "حفظ القرآن",
          desc: "احفظ القرآن الكريم مع نظام يومي منظم لتتبع السبق والمراجعة.",
          price_label: "من 37 دولار/شهر",
        },
        {
          slug: "arabic-language",
          title: "اللغة العربية",
          desc: "تعلم قواعد اللغة العربية والمحادثة مع التركيز على عربية القرآن.",
          price_label: "من 35 دولار/شهر",
        },
        {
          slug: "aalim-course",
          title: "دورة العالم",
          desc: "برنامج درس النظامي الكامل — الفقه والحديث والتفسير وأكثر.",
          price_label: "من 40 دولار/شهر",
        },
      ],
    },
    fr: {
      badge: "Au service des familles musulmanes au Royaume-Uni",
      hero_heading: "Meilleurs cours de Coran en ligne au Royaume-Uni",
      hero_desc:
        "Rejoignez des centaines de familles musulmanes à travers Londres, Birmingham, Manchester et tout le Royaume-Uni qui apprennent le Coran avec l'Académie Tibyaan. Enseignants experts, horaires flexibles et apprentissage assisté par IA — tout depuis chez vous.",
      cta_trial: "Commencer l'essai gratuit de 5 jours",
      cta_courses: "Voir les cours",
      why_heading: "Pourquoi les musulmans du Royaume-Uni choisissent Tibyaan Academy",
      features: [
        "Cours individuels en direct avec des enseignants certifiés",
        "AI Ustaz disponible 24h/24 pour la pratique",
        "Planification flexible dans tous les fuseaux horaires du Royaume-Uni",
        "Cours pour enfants et adultes",
        "Programmes Hifz, Nazra, Arabe et Aalim complet",
        "Essai gratuit de 5 jours — aucune carte de crédit requise",
      ],
      courses_heading: "Cours disponibles pour les étudiants au Royaume-Uni",
      courses_desc:
        "Tous les cours sont disponibles en ligne. Les cours sont planifiés aux heures pratiques pour les fuseaux horaires du Royaume-Uni (GMT/BST).",
      testimonials_heading: "Approuvé par les familles musulmanes du Royaume-Uni",
      stats: [
        { value: formatStat("students"), label: "Étudiants" },
        { value: "4.9★", label: "Note moyenne" },
        { value: "5 jours", label: "Essai gratuit" },
      ],
      cta_final_heading: "Rejoignez les familles musulmanes du Royaume-Uni pour apprendre le Coran",
      cta_final_desc:
        "5 jours gratuits — aucune carte de crédit requise. Découvrez l'enseignement du Coran en direct et l'apprentissage IA depuis chez vous.",
      cta_final_btn: "Commencer gratuitement",
      timezone_msg: "Cours disponibles dans les fuseaux horaires britanniques : GMT et BST",
      courses: [
        {
          slug: "nazra-quran",
          title: "Nazra Quran",
          desc: "Apprenez à lire le Coran avec un Tajweed correct. Parfait pour les débutants.",
          price_label: "À partir de 25$/mois",
        },
        {
          slug: "hifz-quran",
          title: "Hifz Quran",
          desc: "Mémorisez le Saint Coran avec un suivi quotidien structuré.",
          price_label: "À partir de 37$/mois",
        },
        {
          slug: "arabic-language",
          title: "Langue Arabe",
          desc: "Apprenez la grammaire et la conversation arabes axées sur l'arabe coranique.",
          price_label: "À partir de 35$/mois",
        },
        {
          slug: "aalim-course",
          title: "Cours Aalim",
          desc: "Programme complet Dars-e-Nizami — Fiqh, Hadith, Tafseer et plus.",
          price_label: "À partir de 40$/mois",
        },
      ],
    },
    id: {
      badge: "Melayani Keluarga Muslim di Inggris",
      hero_heading: "Kelas Quran Online Terbaik di Inggris",
      hero_desc:
        "Bergabunglah dengan ratusan keluarga Muslim di London, Birmingham, Manchester, dan seluruh Inggris yang belajar Quran bersama Tibyaan Academy. Guru ahli, jadwal fleksibel, dan pembelajaran bertenaga AI — semua dari kenyamanan rumah Anda.",
      cta_trial: "Mulai Uji Coba Gratis 5 Hari",
      cta_courses: "Lihat Kursus",
      why_heading: "Mengapa Muslim Inggris Memilih Tibyaan Academy",
      features: [
        "Kelas tatap muka 1-on-1 langsung dengan guru bersertifikat",
        "AI Ustaz tersedia 24/7 untuk latihan",
        "Penjadwalan fleksibel di semua zona waktu Inggris",
        "Kursus untuk anak-anak dan orang dewasa",
        "Program Hifz, Nazra, Arab, dan Aalim lengkap",
        "Uji coba gratis 5 hari — tidak perlu kartu kredit",
      ],
      courses_heading: "Kursus Tersedia untuk Siswa di Inggris",
      courses_desc:
        "Semua kursus tersedia secara online. Kelas dijadwalkan pada waktu yang nyaman untuk zona waktu Inggris (GMT/BST).",
      testimonials_heading: "Dipercaya oleh Keluarga Muslim di Inggris",
      stats: [
        { value: formatStat("students"), label: "Siswa" },
        { value: "4.9★", label: "Rating Rata-rata" },
        { value: "5 Hari", label: "Uji Coba Gratis" },
      ],
      cta_final_heading: "Bergabunglah dengan Keluarga Muslim di Inggris untuk Belajar Quran",
      cta_final_desc:
        "5 hari gratis — tidak perlu kartu kredit. Rasakan pengajaran Quran langsung dan pembelajaran bertenaga AI dari kenyamanan rumah Anda di Inggris.",
      cta_final_btn: "Mulai Gratis",
      timezone_msg: "Kelas tersedia di zona waktu Inggris: GMT dan BST",
      courses: [
        {
          slug: "nazra-quran",
          title: "Nazra Quran",
          desc: "Belajar membaca Quran dengan Tajweed yang benar. Cocok untuk pemula.",
          price_label: "Mulai dari $25/bulan",
        },
        {
          slug: "hifz-quran",
          title: "Hifz Quran",
          desc: "Hafalkan Al-Quran dengan sistem pelacakan harian yang terstruktur.",
          price_label: "Mulai dari $37/bulan",
        },
        {
          slug: "arabic-language",
          title: "Bahasa Arab",
          desc: "Pelajari tata bahasa Arab dan percakapan dengan fokus pada bahasa Arab Qurani.",
          price_label: "Mulai dari $35/bulan",
        },
        {
          slug: "aalim-course",
          title: "Kursus Aalim",
          desc: "Program Dars-e-Nizami lengkap — Fikih, Hadis, Tafseer dan lainnya.",
          price_label: "Mulai dari $40/bulan",
        },
      ],
    },
  },
};

export const USA_PAGE: CountryPageData = {
  flag: "🇺🇸",
  countryName: {
    en: "United States",
    ur: "ریاستہائے متحدہ امریکہ",
    ar: "الولايات المتحدة الأمريكية",
    fr: "États-Unis",
    id: "Amerika Serikat",
  },
  testimonials: [
    {
      name: "Mikhail Nilov",
      country: "Russia",
      flag: "🇷🇺",
      course: "Nazra Quran",
      review:
        "I'm from Russia and after accepting Islam, I wanted to learn the Quran. Tibyaan gave complete support in English.",
    },
  ],
  translations: {
    en: {
      badge: "Serving Muslim Families Across the USA",
      hero_heading: "Learn Quran Online in the USA",
      hero_desc:
        "Join thousands of Muslim families across New York, Chicago, Houston, Los Angeles, and the rest of the USA learning Quran with Tibyaan Academy. Expert teachers, flexible US time zone scheduling, and AI-powered learning.",
      cta_trial: "Start 5-Day Free Trial",
      cta_courses: "View Courses",
      why_heading: "Why USA Muslims Choose Tibyaan Academy",
      features: [
        "Live 1-on-1 classes with certified teachers",
        "AI Ustaz available 24/7 for practice",
        "Classes available across all US time zones (EST, CST, MST, PST)",
        "Courses for children and adults",
        "Hifz, Nazra, Arabic, and full Aalim program",
        "5-day free trial — no credit card needed",
      ],
      courses_heading: "Courses Available for USA Students",
      courses_desc:
        "All courses are available online. Classes are scheduled at times convenient for all US time zones.",
      testimonials_heading: "Trusted by Muslim Families Across the USA",
      stats: [
        { value: formatStat("students"), label: "Students" },
        { value: "4.9★", label: "Average Rating" },
        { value: "5-day", label: "Free Trial" },
      ],
      cta_final_heading: "Join Muslim Families in the USA Learning Quran",
      cta_final_desc:
        "5 days free — no credit card required. Experience live Quran teaching and AI-powered learning from the comfort of your home.",
      cta_final_btn: "Get Started Free",
      timezone_msg: "Classes available in all US time zones: EST, CST, MST, PST",
      courses: [
        { slug: "nazra-quran", title: "Nazra Quran", desc: "Learn to read Quran with proper Tajweed.", price_label: "From $25/month" },
        { slug: "hifz-quran", title: "Hifz Quran", desc: "Memorise the Holy Quran with structured daily tracking.", price_label: "From $37/month" },
        { slug: "arabic-language", title: "Arabic Language", desc: "Learn Arabic grammar and conversation.", price_label: "From $35/month" },
        { slug: "aalim-course", title: "Aalim Course", desc: "Complete Dars-e-Nizami / Aalim program.", price_label: "From $40/month" },
      ],
    },
    ur: {
      badge: "امریکہ میں مسلم خاندانوں کی خدمت میں",
      hero_heading: "امریکہ میں آن لائن قرآن سیکھیں",
      hero_desc: "نیویارک، شکاگو، ہیوسٹن اور پورے امریکہ میں ہزاروں مسلم خاندانوں کے ساتھ شامل ہوں جو تبیان اکیڈمی سے قرآن سیکھ رہے ہیں۔",
      cta_trial: "5 دن مفت ٹرائل شروع کریں",
      cta_courses: "کورسز دیکھیں",
      why_heading: "امریکہ کے مسلمان تبیان اکیڈمی کیوں چنتے ہیں",
      features: [
        "سرٹیفائیڈ اساتذہ کے ساتھ لائیو 1-on-1 کلاسز",
        "AI استاذ 24/7 مشق کے لیے دستیاب",
        "تمام امریکی ٹائم زونز میں لچکدار شیڈول",
        "بچوں اور بالغوں کے لیے کورسز",
        "حفظ، ناظرہ، عربی اور مکمل عالم کورس",
        "5 دن مفت ٹرائل — کوئی کریڈٹ کارڈ ضروری نہیں",
      ],
      courses_heading: "امریکہ کے طلبا کے لیے دستیاب کورسز",
      courses_desc: "تمام کورسز آن لائن دستیاب ہیں۔ تمام امریکی ٹائم زونز میں کلاسز دستیاب ہیں۔",
      testimonials_heading: "امریکی مسلم خاندانوں کا اعتماد",
      stats: [
        { value: formatStat("students"), label: "طلبا" },
        { value: "4.9★", label: "اوسط ریٹنگ" },
        { value: "5 دن", label: "مفت ٹرائل" },
      ],
      cta_final_heading: "امریکہ کے مسلم خاندانوں کے ساتھ قرآن سیکھیں",
      cta_final_desc: "5 دن مفت — کوئی کریڈٹ کارڈ ضروری نہیں۔",
      cta_final_btn: "مفت شروع کریں",
      timezone_msg: "تمام امریکی ٹائم زونز میں کلاسز دستیاب: EST, CST, MST, PST",
      courses: [
        { slug: "nazra-quran", title: "ناظرہ قرآن", desc: "صحیح تجوید کے ساتھ قرآن پڑھنا سیکھیں۔", price_label: "صرف $25 ماہانہ سے" },
        { slug: "hifz-quran", title: "حفظ قرآن", desc: "منظم روزانہ سبق کے ساتھ قرآن حفظ کریں۔", price_label: "صرف $37 ماہانہ سے" },
        { slug: "arabic-language", title: "عربی زبان", desc: "عربی گرامر اور گفتگو سیکھیں۔", price_label: "صرف $35 ماہانہ سے" },
        { slug: "aalim-course", title: "عالم کورس", desc: "مکمل درس نظامی کورس۔", price_label: "صرف $40 ماہانہ سے" },
      ],
    },
    ar: {
      badge: "نخدم العائلات المسلمة في الولايات المتحدة",
      hero_heading: "تعلم القرآن عبر الإنترنت في الولايات المتحدة",
      hero_desc: "انضم إلى آلاف العائلات المسلمة في نيويورك وشيكاغو وهيوستن وسائر أنحاء الولايات المتحدة.",
      cta_trial: "ابدأ تجربة مجانية لمدة 5 أيام",
      cta_courses: "استعرض الدورات",
      why_heading: "لماذا يختار مسلمو الولايات المتحدة أكاديمية تبيان",
      features: [
        "دروس فردية مباشرة مع معلمين معتمدين",
        "الأستاذ الذكي متاح 24/7",
        "جداول مرنة عبر جميع المناطق الزمنية الأمريكية",
        "دورات للأطفال والبالغين",
        "برامج الحفظ والناظرة والعربية ودورة العالم",
        "تجربة مجانية لمدة 5 أيام",
      ],
      courses_heading: "الدورات المتاحة لطلاب الولايات المتحدة",
      courses_desc: "جميع الدورات متاحة عبر الإنترنت في جميع المناطق الزمنية الأمريكية.",
      testimonials_heading: "موثوق به من قِبَل العائلات المسلمة في الولايات المتحدة",
      stats: [
        { value: formatStat("students"), label: "طلاب" },
        { value: "4.9★", label: "متوسط التقييم" },
        { value: "5 أيام", label: "تجربة مجانية" },
      ],
      cta_final_heading: "انضم إلى العائلات المسلمة في الولايات المتحدة",
      cta_final_desc: "5 أيام مجاناً — لا حاجة لبطاقة ائتمان.",
      cta_final_btn: "ابدأ مجاناً",
      timezone_msg: "الدروس متاحة في جميع المناطق الزمنية: EST, CST, MST, PST",
      courses: [
        { slug: "nazra-quran", title: "ناظرة القرآن", desc: "تعلم قراءة القرآن بتجويد صحيح.", price_label: "من 25 دولار/شهر" },
        { slug: "hifz-quran", title: "حفظ القرآن", desc: "احفظ القرآن مع نظام يومي منظم.", price_label: "من 37 دولار/شهر" },
        { slug: "arabic-language", title: "اللغة العربية", desc: "تعلم قواعد اللغة العربية.", price_label: "من 35 دولار/شهر" },
        { slug: "aalim-course", title: "دورة العالم", desc: "برنامج درس النظامي الكامل.", price_label: "من 40 دولار/شهر" },
      ],
    },
    fr: {
      badge: "Au service des familles musulmanes aux États-Unis",
      hero_heading: "Apprendre le Coran en ligne aux États-Unis",
      hero_desc: "Rejoignez des milliers de familles musulmanes à New York, Chicago, Houston et partout aux États-Unis.",
      cta_trial: "Commencer l'essai gratuit de 5 jours",
      cta_courses: "Voir les cours",
      why_heading: "Pourquoi les musulmans des États-Unis choisissent Tibyaan Academy",
      features: [
        "Cours individuels en direct avec enseignants certifiés",
        "AI Ustaz disponible 24h/24",
        "Horaires flexibles dans tous les fuseaux horaires américains",
        "Cours pour enfants et adultes",
        "Programmes Hifz, Nazra, Arabe et Aalim",
        "Essai gratuit de 5 jours",
      ],
      courses_heading: "Cours disponibles pour les étudiants américains",
      courses_desc: "Tous les cours sont disponibles en ligne dans tous les fuseaux horaires américains.",
      testimonials_heading: "Approuvé par les familles musulmanes aux États-Unis",
      stats: [
        { value: formatStat("students"), label: "Étudiants" },
        { value: "4.9★", label: "Note moyenne" },
        { value: "5 jours", label: "Essai gratuit" },
      ],
      cta_final_heading: "Rejoignez les familles musulmanes aux États-Unis",
      cta_final_desc: "5 jours gratuits — aucune carte de crédit requise.",
      cta_final_btn: "Commencer gratuitement",
      timezone_msg: "Cours disponibles dans tous les fuseaux horaires américains: EST, CST, MST, PST",
      courses: [
        { slug: "nazra-quran", title: "Nazra Quran", desc: "Apprenez à lire le Coran avec un Tajweed correct.", price_label: "À partir de 25$/mois" },
        { slug: "hifz-quran", title: "Hifz Quran", desc: "Mémorisez le Saint Coran avec un suivi quotidien.", price_label: "À partir de 37$/mois" },
        { slug: "arabic-language", title: "Langue Arabe", desc: "Apprenez l'arabe et la conversation.", price_label: "À partir de 35$/mois" },
        { slug: "aalim-course", title: "Cours Aalim", desc: "Programme Dars-e-Nizami complet.", price_label: "À partir de 40$/mois" },
      ],
    },
    id: {
      badge: "Melayani Keluarga Muslim di Amerika Serikat",
      hero_heading: "Belajar Quran Online di Amerika Serikat",
      hero_desc: "Bergabunglah dengan ribuan keluarga Muslim di New York, Chicago, Houston, dan seluruh Amerika Serikat.",
      cta_trial: "Mulai Uji Coba Gratis 5 Hari",
      cta_courses: "Lihat Kursus",
      why_heading: "Mengapa Muslim Amerika Memilih Tibyaan Academy",
      features: [
        "Kelas tatap muka 1-on-1 langsung dengan guru bersertifikat",
        "AI Ustaz tersedia 24/7",
        "Penjadwalan fleksibel di semua zona waktu AS",
        "Kursus untuk anak-anak dan orang dewasa",
        "Program Hifz, Nazra, Arab, dan Aalim",
        "Uji coba gratis 5 hari",
      ],
      courses_heading: "Kursus Tersedia untuk Siswa AS",
      courses_desc: "Semua kursus tersedia online di semua zona waktu AS.",
      testimonials_heading: "Dipercaya oleh Keluarga Muslim di Amerika Serikat",
      stats: [
        { value: formatStat("students"), label: "Siswa" },
        { value: "4.9★", label: "Rating Rata-rata" },
        { value: "5 Hari", label: "Uji Coba Gratis" },
      ],
      cta_final_heading: "Bergabunglah dengan Keluarga Muslim di AS",
      cta_final_desc: "5 hari gratis — tidak perlu kartu kredit.",
      cta_final_btn: "Mulai Gratis",
      timezone_msg: "Kelas tersedia di semua zona waktu AS: EST, CST, MST, PST",
      courses: [
        { slug: "nazra-quran", title: "Nazra Quran", desc: "Belajar membaca Quran dengan Tajweed yang benar.", price_label: "Mulai dari $25/bulan" },
        { slug: "hifz-quran", title: "Hifz Quran", desc: "Hafalkan Al-Quran dengan sistem pelacakan harian.", price_label: "Mulai dari $37/bulan" },
        { slug: "arabic-language", title: "Bahasa Arab", desc: "Pelajari tata bahasa Arab dan percakapan.", price_label: "Mulai dari $35/bulan" },
        { slug: "aalim-course", title: "Kursus Aalim", desc: "Program Dars-e-Nizami lengkap.", price_label: "Mulai dari $40/bulan" },
      ],
    },
  },
};

function makeCountryPage(
  flag: string,
  countryName: Record<"ur" | "ar" | "en" | "fr" | "id", string>,
  enData: {
    badge: string; hero_heading: string; hero_desc: string;
    why_heading: string; features_en: string[];
    courses_heading: string; courses_desc: string;
    cta_final_heading: string; timezone_msg: string;
  },
  testimonials?: CountryPageData["testimonials"]
): CountryPageData {
  const courses_en = [
    { slug: "nazra-quran", title: "Nazra Quran", desc: "Learn to read Quran with proper Tajweed.", price_label: "From $25/month" },
    { slug: "hifz-quran", title: "Hifz Quran", desc: "Memorise the Holy Quran with structured daily tracking.", price_label: "From $37/month" },
    { slug: "arabic-language", title: "Arabic Language", desc: "Learn Arabic grammar and conversation.", price_label: "From $35/month" },
    { slug: "aalim-course", title: "Aalim Course", desc: "Complete Dars-e-Nizami / Aalim program.", price_label: "From $40/month" },
  ];
  return {
    flag,
    countryName,
    testimonials,
    translations: {
      en: {
        badge: enData.badge,
        hero_heading: enData.hero_heading,
        hero_desc: enData.hero_desc,
        cta_trial: "Start 5-Day Free Trial",
        cta_courses: "View Courses",
        why_heading: enData.why_heading,
        features: enData.features_en,
        courses_heading: enData.courses_heading,
        courses_desc: enData.courses_desc,
        testimonials_heading: "Trusted by Muslim Families",
        stats: [{ value: formatStat("students"), label: "Students" }, { value: "4.9★", label: "Rating" }, { value: "5-day", label: "Free Trial" }],
        cta_final_heading: enData.cta_final_heading,
        cta_final_desc: "5 days free — no credit card required.",
        cta_final_btn: "Get Started Free",
        timezone_msg: enData.timezone_msg,
        courses: courses_en,
      },
      ur: {
        badge: `${countryName.ur} میں مسلم خاندانوں کی خدمت`,
        hero_heading: `${countryName.ur} میں آن لائن قرآن کلاسز`,
        hero_desc: `${countryName.ur} میں مسلم خاندانوں کے ساتھ تبیان اکیڈمی سے قرآن سیکھیں۔ ماہر اساتذہ، لچکدار شیڈول اور AI تعلیم — گھر بیٹھے۔`,
        cta_trial: "5 دن مفت ٹرائل شروع کریں",
        cta_courses: "کورسز دیکھیں",
        why_heading: `${countryName.ur} کے مسلمان تبیان اکیڈمی کیوں چنتے ہیں`,
        features: ["سرٹیفائیڈ اساتذہ کے ساتھ لائیو 1-on-1 کلاسز", "AI استاذ 24/7 دستیاب", "لچکدار شیڈول", "بچوں اور بالغوں کے لیے کورسز", "5 دن مفت ٹرائل"],
        courses_heading: "دستیاب کورسز",
        courses_desc: "تمام کورسز آن لائن — اپنے ٹائم زون کے مطابق۔",
        testimonials_heading: "مسلم خاندانوں کا اعتماد",
        stats: [{ value: formatStat("students"), label: "طلبا" }, { value: "4.9★", label: "ریٹنگ" }, { value: "5 دن", label: "مفت ٹرائل" }],
        cta_final_heading: `${countryName.ur} کے مسلم خاندانوں کے ساتھ قرآن سیکھیں`,
        cta_final_desc: "5 دن مفت — کوئی کریڈٹ کارڈ ضروری نہیں۔",
        cta_final_btn: "مفت شروع کریں",
        timezone_msg: "آپ کے ٹائم زون کے مطابق کلاسز دستیاب",
        courses: [
          { slug: "nazra-quran", title: "ناظرہ قرآن", desc: "صحیح تجوید کے ساتھ قرآن پڑھنا سیکھیں۔", price_label: "صرف $25 ماہانہ سے" },
          { slug: "hifz-quran", title: "حفظ قرآن", desc: "قرآن حفظ کریں۔", price_label: "صرف $37 ماہانہ سے" },
          { slug: "arabic-language", title: "عربی زبان", desc: "عربی گرامر اور گفتگو سیکھیں۔", price_label: "صرف $35 ماہانہ سے" },
          { slug: "aalim-course", title: "عالم کورس", desc: "مکمل درس نظامی کورس۔", price_label: "صرف $40 ماہانہ سے" },
        ],
      },
      ar: {
        badge: `نخدم العائلات المسلمة في ${countryName.ar}`,
        hero_heading: `تعلم القرآن عبر الإنترنت في ${countryName.ar}`,
        hero_desc: `انضم إلى العائلات المسلمة في ${countryName.ar} لتعلم القرآن مع أكاديمية تبيان.`,
        cta_trial: "ابدأ تجربة مجانية 5 أيام",
        cta_courses: "استعرض الدورات",
        why_heading: `لماذا يختار مسلمو ${countryName.ar} أكاديمية تبيان`,
        features: ["دروس فردية مباشرة", "الأستاذ الذكي 24/7", "جداول مرنة", "للأطفال والبالغين", "تجربة مجانية 5 أيام"],
        courses_heading: "الدورات المتاحة",
        courses_desc: "جميع الدورات متاحة عبر الإنترنت.",
        testimonials_heading: "موثوق به من العائلات المسلمة",
        stats: [{ value: formatStat("students"), label: "طلاب" }, { value: "4.9★", label: "التقييم" }, { value: "5 أيام", label: "تجربة مجانية" }],
        cta_final_heading: `انضم إلى العائلات المسلمة في ${countryName.ar}`,
        cta_final_desc: "5 أيام مجاناً — لا حاجة لبطاقة ائتمان.",
        cta_final_btn: "ابدأ مجاناً",
        timezone_msg: "الدروس متاحة وفق منطقتك الزمنية",
        courses: [
          { slug: "nazra-quran", title: "ناظرة القرآن", desc: "تعلم القراءة بتجويد صحيح.", price_label: "من 25 دولار/شهر" },
          { slug: "hifz-quran", title: "حفظ القرآن", desc: "احفظ القرآن الكريم.", price_label: "من 37 دولار/شهر" },
          { slug: "arabic-language", title: "اللغة العربية", desc: "تعلم القواعد والمحادثة.", price_label: "من 35 دولار/شهر" },
          { slug: "aalim-course", title: "دورة العالم", desc: "برنامج درس النظامي الكامل.", price_label: "من 40 دولار/شهر" },
        ],
      },
      fr: {
        badge: `Au service des familles musulmanes en ${countryName.fr}`,
        hero_heading: `Cours de Coran en ligne en ${countryName.fr}`,
        hero_desc: `Rejoignez des familles musulmanes en ${countryName.fr} pour apprendre le Coran avec Tibyaan Academy.`,
        cta_trial: "Essai gratuit 5 jours",
        cta_courses: "Voir les cours",
        why_heading: `Pourquoi les musulmans de ${countryName.fr} choisissent Tibyaan Academy`,
        features: ["Cours individuels en direct", "AI Ustaz 24h/24", "Horaires flexibles", "Cours pour enfants et adultes", "Essai gratuit 5 jours"],
        courses_heading: "Cours disponibles",
        courses_desc: "Tous les cours sont disponibles en ligne.",
        testimonials_heading: "Approuvé par les familles musulmanes",
        stats: [{ value: formatStat("students"), label: "Étudiants" }, { value: "4.9★", label: "Note" }, { value: "5 jours", label: "Essai" }],
        cta_final_heading: `Rejoignez les familles musulmanes de ${countryName.fr}`,
        cta_final_desc: "5 jours gratuits — aucune carte de crédit requise.",
        cta_final_btn: "Commencer gratuitement",
        timezone_msg: "Cours disponibles selon votre fuseau horaire",
        courses: [
          { slug: "nazra-quran", title: "Nazra Quran", desc: "Apprenez à lire le Coran.", price_label: "À partir de 25$/mois" },
          { slug: "hifz-quran", title: "Hifz Quran", desc: "Mémorisez le Saint Coran.", price_label: "À partir de 37$/mois" },
          { slug: "arabic-language", title: "Langue Arabe", desc: "Apprenez l'arabe.", price_label: "À partir de 35$/mois" },
          { slug: "aalim-course", title: "Cours Aalim", desc: "Programme Dars-e-Nizami complet.", price_label: "À partir de 40$/mois" },
        ],
      },
      id: {
        badge: `Melayani Keluarga Muslim di ${countryName.id}`,
        hero_heading: `Kelas Quran Online di ${countryName.id}`,
        hero_desc: `Bergabunglah dengan keluarga Muslim di ${countryName.id} belajar Quran bersama Tibyaan Academy.`,
        cta_trial: "Mulai Uji Coba Gratis 5 Hari",
        cta_courses: "Lihat Kursus",
        why_heading: `Mengapa Muslim ${countryName.id} Memilih Tibyaan Academy`,
        features: ["Kelas tatap muka 1-on-1 langsung", "AI Ustaz 24/7", "Jadwal fleksibel", "Kursus untuk anak-anak dan dewasa", "Uji coba gratis 5 hari"],
        courses_heading: "Kursus Tersedia",
        courses_desc: "Semua kursus tersedia secara online.",
        testimonials_heading: "Dipercaya oleh Keluarga Muslim",
        stats: [{ value: formatStat("students"), label: "Siswa" }, { value: "4.9★", label: "Rating" }, { value: "5 Hari", label: "Uji Coba" }],
        cta_final_heading: `Bergabunglah dengan Keluarga Muslim di ${countryName.id}`,
        cta_final_desc: "5 hari gratis — tidak perlu kartu kredit.",
        cta_final_btn: "Mulai Gratis",
        timezone_msg: "Kelas tersedia sesuai zona waktu Anda",
        courses: [
          { slug: "nazra-quran", title: "Nazra Quran", desc: "Belajar membaca Quran.", price_label: "Mulai dari $25/bulan" },
          { slug: "hifz-quran", title: "Hifz Quran", desc: "Hafalkan Al-Quran.", price_label: "Mulai dari $37/bulan" },
          { slug: "arabic-language", title: "Bahasa Arab", desc: "Pelajari bahasa Arab.", price_label: "Mulai dari $35/bulan" },
          { slug: "aalim-course", title: "Kursus Aalim", desc: "Program Dars-e-Nizami lengkap.", price_label: "Mulai dari $40/bulan" },
        ],
      },
    },
  };
}

export const UAE_PAGE = makeCountryPage(
  "🇦🇪",
  { en: "UAE", ur: "متحدہ عرب امارات", ar: "الإمارات العربية المتحدة", fr: "Émirats arabes unis", id: "Uni Emirat Arab" },
  {
    badge: "Serving Muslim Families in UAE & Dubai",
    hero_heading: "Online Islamic Education in UAE & Dubai",
    hero_desc: "Join Muslim families across Dubai, Abu Dhabi, Sharjah, and the rest of the UAE learning Quran and Islamic sciences with Tibyaan Academy.",
    why_heading: "Why UAE Muslims Choose Tibyaan Academy",
    features_en: ["Live 1-on-1 classes at UAE-friendly times (GST)", "AI Ustaz available 24/7", "Courses in Arabic, Urdu, English", "For children and adults", "Hifz, Nazra, Arabic, Aalim programs", "5-day free trial"],
    courses_heading: "Courses for UAE Students",
    courses_desc: "All courses scheduled at UAE time (GST — Gulf Standard Time).",
    cta_final_heading: "Join Muslim Families in UAE Learning Quran",
    timezone_msg: "Classes available in UAE time zone: GST (Gulf Standard Time, UTC+4)",
  }
);

export const CANADA_PAGE = makeCountryPage(
  "🇨🇦",
  { en: "Canada", ur: "کینیڈا", ar: "كندا", fr: "Canada", id: "Kanada" },
  {
    badge: "Serving Muslim Families Across Canada",
    hero_heading: "Online Quran Classes Canada",
    hero_desc: "Join Muslim families in Toronto, Vancouver, Calgary, Montreal, and across Canada learning Quran with Tibyaan Academy.",
    why_heading: "Why Canadian Muslims Choose Tibyaan Academy",
    features_en: ["Live 1-on-1 classes with certified teachers", "AI Ustaz 24/7", "Flexible scheduling across Canadian time zones (EST, CST, MST, PST)", "Courses for children and adults", "Arabic, Hifz, Nazra, Aalim programs", "5-day free trial"],
    courses_heading: "Courses Available for Canadian Students",
    courses_desc: "All courses online, classes scheduled for Canadian time zones.",
    cta_final_heading: "Join Muslim Families in Canada Learning Quran",
    timezone_msg: "Classes available in all Canadian time zones: EST, CST, MST, PST",
  }
);

export const AUSTRALIA_PAGE = makeCountryPage(
  "🇦🇺",
  { en: "Australia", ur: "آسٹریلیا", ar: "أستراليا", fr: "Australie", id: "Australia" },
  {
    badge: "Serving Muslim Families Across Australia",
    hero_heading: "Quran Classes Online Australia",
    hero_desc: "Join Muslim families in Sydney, Melbourne, Brisbane, Perth, and across Australia learning Quran with Tibyaan Academy.",
    why_heading: "Why Australian Muslims Choose Tibyaan Academy",
    features_en: ["Live 1-on-1 classes at Australian-friendly times", "AI Ustaz available 24/7", "Flexible scheduling for AEDT/ACST/AWST time zones", "Courses for children and adults", "Hifz, Nazra, Arabic, Aalim programs", "5-day free trial"],
    courses_heading: "Courses Available for Australian Students",
    courses_desc: "All courses online, scheduled at Australian time zones (AEDT, ACST, AWST).",
    cta_final_heading: "Join Muslim Families in Australia Learning Quran",
    timezone_msg: "Classes available in Australian time zones: AEDT, ACST, AWST",
  }
);

export const INDONESIA_PAGE = makeCountryPage(
  "🇮🇩",
  { en: "Indonesia", ur: "انڈونیشیا", ar: "إندونيسيا", fr: "Indonésie", id: "Indonesia" },
  {
    badge: "Melayani Keluarga Muslim di Indonesia",
    hero_heading: "Kelas Quran Online Indonesia",
    hero_desc: "Bergabunglah dengan keluarga Muslim di Jakarta, Surabaya, Bandung, dan seluruh Indonesia belajar Quran bersama Tibyaan Academy dengan dukungan bahasa Indonesia.",
    why_heading: "Mengapa Muslim Indonesia Memilih Tibyaan Academy",
    features_en: ["Live 1-on-1 classes with certified teachers", "AI Ustaz available in Indonesian language 24/7", "Flexible scheduling for Indonesian time zones (WIB, WITA, WIT)", "Courses for children and adults", "Hifz, Nazra, Arabic, Aalim programs", "5-day free trial"],
    courses_heading: "Kursus Tersedia untuk Siswa Indonesia",
    courses_desc: "Semua kursus online, dijadwalkan untuk zona waktu Indonesia (WIB, WITA, WIT).",
    cta_final_heading: "Bergabunglah dengan Keluarga Muslim Indonesia",
    timezone_msg: "Kelas tersedia di zona waktu Indonesia: WIB, WITA, WIT",
  }
);

export const GERMANY_PAGE = makeCountryPage(
  "🇩🇪",
  { en: "Germany", ur: "جرمنی", ar: "ألمانيا", fr: "Allemagne", id: "Jerman" },
  {
    badge: "Serving Muslim Families Across Germany",
    hero_heading: "Online Quran Lernen Deutschland",
    hero_desc: "Join Muslim families in Berlin, Hamburg, Munich, and across Germany learning Quran with Tibyaan Academy. Support available in German, Arabic, Urdu, and English.",
    why_heading: "Why German Muslims Choose Tibyaan Academy",
    features_en: ["Live 1-on-1 classes at Germany-friendly times (CET/CEST)", "AI Ustaz 24/7 in multiple languages", "Flexible scheduling for Central European Time", "Courses for children and adults", "Hifz, Nazra, Arabic, Aalim programs", "5-day free trial"],
    courses_heading: "Courses Available for Germany Students",
    courses_desc: "All courses online, scheduled for Central European time zones (CET/CEST).",
    cta_final_heading: "Join Muslim Families in Germany Learning Quran",
    timezone_msg: "Classes available in German time zones: CET (UTC+1) and CEST (UTC+2)",
  }
);

export const SAUDI_PAGE = makeCountryPage(
  "🇸🇦",
  { en: "Saudi Arabia", ur: "سعودی عرب", ar: "المملكة العربية السعودية", fr: "Arabie Saoudite", id: "Arab Saudi" },
  {
    badge: "نخدم العائلات المسلمة في المملكة العربية السعودية",
    hero_heading: "تعلم القرآن أونلاين — المملكة العربية السعودية",
    hero_desc: "انضم إلى العائلات المسلمة في الرياض، جدة، مكة المكرمة، والمدينة المنورة لتعلم القرآن والعلوم الإسلامية مع أكاديمية تبيان.",
    why_heading: "لماذا يختار مسلمو المملكة أكاديمية تبيان",
    features_en: ["Live 1-on-1 Quran classes with certified teachers", "AI Ustaz available 24/7 in Arabic", "Flexible scheduling for AST time zone", "Complete programs: Hifz, Nazra, Arabic, Aalim", "Authentic curriculum from qualified scholars", "5-day free trial"],
    courses_heading: "الدورات المتاحة لطلاب المملكة",
    courses_desc: "جميع الدورات متاحة عبر الإنترنت وفق توقيت المملكة العربية السعودية.",
    cta_final_heading: "انضم إلى العائلات المسلمة في المملكة لتعلم القرآن",
    timezone_msg: "الدروس متاحة وفق توقيت المملكة العربية السعودية (AST — UTC+3)",
  }
);
