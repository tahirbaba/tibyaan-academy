import type { Metadata } from "next";
import { STAT_VALUES, STAT_COUNTS } from "@/lib/site-stats";
import { getTranslations } from "next-intl/server";
import { AvatarImage } from "@/components/shared/avatar-image";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import {
  BookOpen, Users, GraduationCap, Heart, Globe, Star, Award,
  Video, Bot, Shield, Check, Clock, Layers, Percent
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { localeMetadataAlternates, absoluteUrl } from "@/lib/site-config";

const aboutMeta: Record<string, { title: string; description: string }> = {
  ur: { title: "ہمارے بارے میں — تبیان اکیڈمی", description: "تبیان اکیڈمی ایک جدید ڈیجیٹل مدرسہ ہے جو آن لائن قرآن، حفظ، عربی اور اسلامی تعلیم فراہم کرتا ہے۔" },
  ar: { title: "عن أكاديمية تبيان", description: "أكاديمية تبيان هي مدرسة رقمية حديثة توفر تعليم القرآن والحفظ والعربية والعلوم الإسلامية عبر الإنترنت." },
  en: { title: "About Us — Tibyaan Academy", description: "Tibyaan Academy is a modern digital madrasah offering online Quran, Hifz, Arabic & Islamic education with live teachers and AI support." },
  fr: { title: "À propos — Tibyaan Academy", description: "Tibyaan Academy est une madrasah numérique moderne offrant l'enseignement du Coran, du Hifz, de l'arabe et des sciences islamiques en ligne." },
  id: { title: "Tentang Kami — Tibyaan Academy", description: "Tibyaan Academy adalah madrasah digital modern yang menawarkan pendidikan Quran, Hifz, Bahasa Arab & Islam online." },
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const meta = aboutMeta[locale] || aboutMeta.en;
  return {
    title: meta.title,
    description: meta.description,
    alternates: localeMetadataAlternates(locale, "/about"),
    openGraph: { title: meta.title, description: meta.description, url: absoluteUrl(locale, "/about") },
  };
}

const teamMembers = [
  {
    id: 1,
    name: "Professor Muhammad Tahir Hasni",
    image: "/Our Team/Muhammad_Tahir_Hasni.jpg",
    whatsapp: "923478599839",
    translationIndex: 0,
  },
  {
    id: 2,
    name: "Mufti Muhammad Rafeeq Golarwi",
    image: "/Our Team/Mufti_Muhammad_Rafeeq_Golarwi.jpeg",
    whatsapp: "923212485198",
    translationIndex: 1,
  },
  {
    id: 3,
    name: "Mufti Owais Ahmed",
    image: "/Our Team/Mufti_Owais_Ahmed.png",
    whatsapp: "923218035236",
    translationIndex: 2,
  },
  {
    id: 4,
    name: "Sheikh Abdul Jabbar",
    image: "/Our Team/Sheikh Abdul Jabbar.jpeg",
    whatsapp: "923152363498",
    translationIndex: 3,
  },
  {
    id: 5,
    name: "Maulana Ali Haider",
    image: "/Our Team/Maulana Ali Haider.jpeg",
    whatsapp: "923476676147",
    translationIndex: 4,
  },
  {
    id: 6,
    name: "Qari Muhammad Musheer",
    image: "/Our Team/Qari Muhammad Musheer.jpg",
    whatsapp: "923269244960",
    translationIndex: 5,
  },
  {
    id: 7,
    name: "Qari Muhammad Ismail Hasni",
    image: "/Our Team/Qari Muhammad Ismail Hasni.jpeg",
    whatsapp: "923453184434",
    translationIndex: 6,
  },
  {
    id: 8,
    name: "Ustaza Fatima Al-Zahra",
    image: "/Our Team/Ustaza Fatima Al-Zahra.jpg",
    whatsapp: "923042043314",
    translationIndex: 7,
  },
];

const featureIcons = [BookOpen, Bot, Video, GraduationCap, Globe, Shield];

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations("aboutPage");
  const isRTL = locale === "ur" || locale === "ar";

  const team = t.raw("team") as Array<{ role: string; description: string }>;
  const whyPoints = t.raw("whyChoosePoints") as string[];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1" dir={isRTL ? "rtl" : "ltr"}>

        {/* ===== HERO BANNER ===== */}
        <section className="relative overflow-hidden bg-[#1B4332] py-24 md:py-36">
          <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNDAgMEw0MCA4ME0wIDQwTDgwIDQwTTAgMEw4MCA4ME04MCAwTDAgODBNMjAgMEwyMCA4ME02MCAwTDYwIDgwTTAgMjBMODAgMjBNMCA2MEw4MCA2MCIgc3Ryb2tlPSIjZmZmZmZmIiBzdHJva2Utd2lkdGg9IjAuNSIgZmlsbD0ibm9uZSIvPjwvc3ZnPg==')] pointer-events-none" />
          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
            <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 text-sm font-semibold mb-6">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              {locale === "ur" ? `دنیا بھر میں ${STAT_VALUES.students} طلبا کا اعتماد` :
               locale === "ar" ? `يثق بنا أكثر من ${STAT_COUNTS.studentsCount} طالب حول العالم` :
               locale === "fr" ? `Approuvé par ${STAT_VALUES.students} étudiants dans le monde` :
               locale === "id" ? `Dipercaya oleh ${STAT_VALUES.students} siswa di seluruh dunia` :
               `Trusted by ${STAT_VALUES.students} Students Worldwide`}
            </div>
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">{t("title")}</h1>
            <p className="mt-6 text-xl text-white/80 max-w-3xl mx-auto leading-relaxed">{t("subtitle")}</p>
            <div className="mt-8 flex flex-wrap gap-4 justify-center">
              <Link href="/signup" className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-500 text-[#1B4332] font-bold px-8 py-3 rounded-xl transition-colors">
                {locale === "ur" ? "5 دن مفت ٹرائل شروع کریں" :
                 locale === "ar" ? "ابدأ تجربة مجانية 5 أيام" :
                 locale === "fr" ? "Commencer l'essai gratuit" :
                 locale === "id" ? "Mulai Uji Coba Gratis 5 Hari" :
                 "Start 5-Day Free Trial"}
              </Link>
              <Link href="/courses" className="inline-flex items-center gap-2 border border-white/30 text-white hover:bg-white/10 font-semibold px-8 py-3 rounded-xl transition-colors">
                {locale === "ur" ? "کورسز دیکھیں" :
                 locale === "ar" ? "استعرض الدورات" :
                 locale === "fr" ? "Voir les cours" :
                 locale === "id" ? "Lihat Kursus" :
                 "View Courses"}
              </Link>
            </div>
          </div>
        </section>

        {/* ===== STATS ===== */}
        <section className="py-16 bg-primary text-primary-foreground">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { value: t("statStudents", STAT_VALUES), label: "" },
                { value: t("statCountries", STAT_VALUES), label: "" },
                { value: t("statTeachers"), label: "" },
                { value: t("statYears"), label: "" },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-3xl font-bold">{stat.value}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== OUR STORY ===== */}
        <section className="py-16 md:py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 rounded-full px-4 py-2 text-sm font-semibold mb-4">
                <Heart className="w-4 h-4" />
                {t("ourStoryTitle")}
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-primary">{t("ourStoryHeading")}</h2>
            </div>
            <div className="space-y-6 text-muted-foreground text-lg leading-relaxed">
              <p>{t("ourStoryP1")}</p>
              <p>{t("ourStoryP2")}</p>
              <p>{t("ourStoryP3", { ...STAT_VALUES, ...STAT_COUNTS })}</p>
            </div>
          </div>
        </section>

        {/* ===== MISSION & VISION ===== */}
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Mission */}
              <div className="bg-background rounded-2xl border border-primary/10 p-8">
                <div className="inline-flex items-center gap-2 bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 rounded-full px-4 py-2 text-sm font-semibold mb-4">
                  <BookOpen className="w-4 h-4" />
                  {t("missionTitleV2")}
                </div>
                <p className="text-muted-foreground text-lg leading-relaxed">{t("missionDescV2")}</p>
              </div>
              {/* Vision */}
              <div className="bg-primary rounded-2xl p-8 text-primary-foreground">
                <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 text-sm font-semibold mb-4">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  {t("visionTitle")}
                </div>
                <p className="text-primary-foreground/90 text-lg leading-relaxed">{t("visionDesc")}</p>
              </div>
            </div>
          </div>
        </section>

        {/* ===== VIDEO INTRO ===== */}
        <section className="py-8 md:py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-foreground">
              {locale === "ur" ? "تبیان کو عمل میں دیکھیں" :
               locale === "ar" ? "شاهد تبيان في العمل" :
               locale === "fr" ? "Voir Tibyaan en Action" :
               locale === "id" ? "Lihat Tibyaan dalam Aksi" :
               "See Tibyaan in Action"}
            </h2>
            <div className="mt-8 rounded-2xl border bg-gradient-to-br from-primary/5 to-accent/5 p-12 flex flex-col items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-red-600 flex items-center justify-center shadow-lg">
                <svg viewBox="0 0 24 24" fill="white" className="w-10 h-10 ml-1"><path d="M8 5v14l11-7z" /></svg>
              </div>
              <a
                href="https://www.youtube.com/channel/UCBU7Fc9ZjYU42SHfSQM9_rg"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold px-8 py-3 rounded-xl transition-colors"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                {locale === "ur" ? "ہمارا یوٹیوب چینل دیکھیں" :
                 locale === "ar" ? "زيارة قناتنا على يوتيوب" :
                 locale === "fr" ? "Visiter notre chaîne YouTube" :
                 locale === "id" ? "Kunjungi Saluran YouTube Kami" :
                 "Visit Our YouTube Channel"}
              </a>
            </div>
          </div>
        </section>

        {/* ===== WHY CHOOSE TIBYAAN ===== */}
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-primary">{t("whyChooseTitle")}</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {whyPoints.map((point, i) => {
                const icons = [Check, Bot, Layers, Clock, Star, Percent];
                const Icon = icons[i] || Check;
                return (
                  <div key={i} className="bg-background rounded-2xl border p-6 hover:shadow-lg transition-shadow">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <p className="text-foreground font-medium">{point}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ===== OUR VALUES ===== */}
        <section className="py-16 md:py-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-primary">{t("valuesTitle")}</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { icon: Award, titleKey: "value1Title", descKey: "value1Desc", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" },
                { icon: Users, titleKey: "value2Title", descKey: "value2Desc", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" },
                { icon: Bot, titleKey: "value3Title", descKey: "value3Desc", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300" },
                { icon: Heart, titleKey: "value4Title", descKey: "value4Desc", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300" },
              ].map((v) => (
                <div key={v.titleKey} className="bg-background rounded-2xl border p-6 hover:shadow-lg transition-shadow flex gap-5">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${v.color}`}>
                    <v.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">{t(v.titleKey)}</h3>
                    <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{t(v.descKey)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== EXPERT TEAM ===== */}
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-primary">{t("teamSectionTitle")}</h2>
              <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">{t("teamSectionSubtitle")}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {teamMembers.map((member) => {
                const trans = team[member.translationIndex];
                return (
                  <div
                    key={member.id}
                    className="bg-background rounded-2xl border overflow-hidden hover:shadow-lg transition-shadow flex flex-col"
                  >
                    <div className="relative w-full h-[280px]">
                      <AvatarImage
                        src={member.image}
                        alt={member.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover"
                      />
                    </div>
                    <div className="p-5 flex flex-col flex-1">
                      <h3 className="font-bold text-foreground text-sm leading-snug">{member.name}</h3>
                      <p className="mt-1 text-xs font-semibold text-primary italic">{trans?.role}</p>
                      <p className="mt-3 text-xs text-muted-foreground leading-relaxed flex-1">
                        {trans?.description}
                      </p>
                      <a
                        href={`https://wa.me/${member.whatsapp}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors w-full"
                      >
                        <WhatsAppIcon className="w-4 h-4" />
                        {t("whatsappBtn")}
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ===== CTA BANNER ===== */}
        <section className="py-16 bg-gradient-to-br from-[#1B4332] to-[#2D6A4F] text-white">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="text-5xl mb-4">🕌</div>
            <h2 className="text-3xl md:text-4xl font-bold">
              {locale === "ur" ? "آج اپنا اسلامی سفر شروع کریں" :
               locale === "ar" ? "ابدأ رحلتك الإسلامية اليوم" :
               locale === "fr" ? "Commencez votre voyage islamique aujourd'hui" :
               locale === "id" ? "Mulailah Perjalanan Islam Anda Hari Ini" :
               "Begin Your Islamic Journey Today"}
            </h2>
            <p className="mt-4 text-white/80 text-lg max-w-xl mx-auto">
              {locale === "ur" ? "ہزاروں طلبا کے ساتھ شامل ہوں جو قرآن اور اسلامی علوم آن لائن سیکھ رہے ہیں۔ آپ کے پہلے 5 دن بالکل مفت ہیں۔" :
               locale === "ar" ? "انضم لآلاف الطلاب الذين يتعلمون القرآن والعلوم الإسلامية عبر الإنترنت. أول 5 أيام مجانية تماماً." :
               locale === "fr" ? "Rejoignez des milliers d'étudiants qui apprennent le Coran en ligne. Vos 5 premiers jours sont entièrement gratuits." :
               locale === "id" ? "Bergabunglah dengan ribuan siswa yang belajar Quran secara online. 5 hari pertama Anda sepenuhnya gratis." :
               "Join thousands of students learning Quran and Islamic sciences online. Your first 5 days are completely free."}
            </p>
            <div className="mt-8 flex flex-wrap gap-4 justify-center">
              <Link href="/signup" className="bg-white text-[#1B4332] hover:bg-white/90 font-bold px-10 py-4 rounded-xl transition-colors text-lg">
                {locale === "ur" ? "مفت ٹرائل شروع کریں" :
                 locale === "ar" ? "ابدأ التجربة المجانية" :
                 locale === "fr" ? "Commencer l'essai gratuit" :
                 locale === "id" ? "Mulai Uji Coba Gratis" :
                 "Start Free Trial"}
              </Link>
              <Link href="/contact" className="border border-white/30 text-white hover:bg-white/10 font-semibold px-10 py-4 rounded-xl transition-colors text-lg">
                {locale === "ur" ? "ہم سے رابطہ کریں" :
                 locale === "ar" ? "اتصل بنا" :
                 locale === "fr" ? "Nous contacter" :
                 locale === "id" ? "Hubungi Kami" :
                 "Contact Us"}
              </Link>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
