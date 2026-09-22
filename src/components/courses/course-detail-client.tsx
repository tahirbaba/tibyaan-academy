"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { PRICING } from "@/lib/pricing";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { motion } from "framer-motion";
import {
  BookOpen,
  Sparkles,
  Languages,
  GraduationCap,
  Check,
  Bot,
  MessageCircle,
  Clock,
  Globe,
  UserCheck,
  Video,
  Star,
  ChevronDown,
} from "lucide-react";
import { getSyllabusItems } from "@/lib/data/course-syllabus";

type CourseKey = "nazra" | "hifz" | "arabic" | "aalim";

const courseData: Record<
  string,
  {
    key: CourseKey;
    icon: typeof BookOpen;
    color: string;
    iconColor: string;
    heroGradient: string;
    plan1Price: string;
    plan2Price: string;
    duration: string;
  }
> = {
  "nazra-quran": {
    key: "nazra",
    icon: BookOpen,
    color: "emerald",
    iconColor: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300",
    heroGradient: "from-emerald-600/10 via-background to-emerald-600/5",
    plan1Price: `$${PRICING.nazra.human_ai}`,
    plan2Price: `$${PRICING.nazra.ai_only}`,
    duration: "3-6 months",
  },
  "hifz-quran": {
    key: "hifz",
    icon: Sparkles,
    color: "amber",
    iconColor: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
    heroGradient: "from-amber-600/10 via-background to-amber-600/5",
    plan1Price: `$${PRICING.hifz.human_ai}`,
    plan2Price: `$${PRICING.hifz.ai_only}`,
    duration: "2-4 years",
  },
  "arabic-language": {
    key: "arabic",
    icon: Languages,
    color: "blue",
    iconColor: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    heroGradient: "from-blue-600/10 via-background to-blue-600/5",
    plan1Price: `$${PRICING.arabic.human_ai}`,
    plan2Price: `$${PRICING.arabic.ai_only}`,
    duration: "6-12 months",
  },
  "aalim-course": {
    key: "aalim",
    icon: GraduationCap,
    color: "purple",
    iconColor: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
    heroGradient: "from-purple-600/10 via-background to-purple-600/5",
    plan1Price: `$${PRICING.aalim.human_ai}`,
    plan2Price: `$${PRICING.aalim.ai_only}`,
    duration: "2-8 years",
  },
};

const courseTeachers: Record<string, { name: string; role: string; image: string; bio: string; whatsapp: string }> = {
  nazra: {
    name: "Qari Muhammad Musheer",
    role: "Head of Nazrat-ul-Quran",
    image: "/Our Team/Qari Muhammad Musheer.jpg",
    bio: "Qari Muhammad Musheer heads the Nazrat and Tajweed department at Tibyaan Academy. His specialty lies in the precise articulation of Arabic letters (Makhaarij) and the rules of Tajweed. Thousands of students have learned to recite the Quran correctly under his guidance.",
    whatsapp: "923269244960",
  },
  hifz: {
    name: "Maulana Ali Haider",
    role: "Head of Hifz-ul-Quran",
    image: "/Our Team/Maulana Ali Haider.jpeg",
    bio: "Maulana Ali Haider has dedicated his entire life to the service of the Holy Quran. He specializes in teaching Hifz to students of all ages. His proven methodology instills consistency and strength in memorization.",
    whatsapp: "923476676147",
  },
  arabic: {
    name: "Sheikh Abdul Jabbar",
    role: "Head of Arabic Language",
    image: "/Our Team/Sheikh Abdul Jabbar.jpeg",
    bio: "Sheikh Abdul Jabbar is a specialist in the Arabic language with deep expertise in Sarf, Nahw, Balaghat, and Classical Arabic Literature. His structured teaching method has helped hundreds of students achieve fluency in Quranic Arabic.",
    whatsapp: "923152363498",
  },
  aalim: {
    name: "Mufti Muhammad Rafeeq Golarwi",
    role: "Director of Tibyaan Academy",
    image: "/Our Team/Mufti_Muhammad_Rafeeq_Golarwi.jpeg",
    bio: "Mufti Muhammad Rafeeq Golarwi oversees the Aalim Course at Tibyaan Academy. His core expertise lies in Islamic Jurisprudence (Fiqh) and Usool-ul-Fiqh. Under his leadership, the Aalim Course serves students from around the world.",
    whatsapp: "923212485198",
  },
};

const courseReviews: Record<string, { name: string; country: string; text: string; stars: number; avatarSeed: string }[]> = {
  nazra: [
    { name: "Umm Khalid", country: "UK", text: "Meri beti ne 3 mahine mein poora qaida mukammal kar liya. AI ustaz ne ghar par har waqt madad ki.", stars: 5, avatarSeed: "UmmKhalid" },
    { name: "Hassan Mahmood", country: "Canada", text: "Adult learner hoon, 4 mahine mein Quran parhna shuru ho gaya alhamdulillah.", stars: 5, avatarSeed: "HassanMahmood" },
    { name: "Ruqayyah Ali", country: "Australia", text: "Curriculum bohot structured hai. Mere teen bachon ne saath saath shuru kiya, family discount bhi mila.", stars: 5, avatarSeed: "RuqayyahAli" },
  ],
  hifz: [
    { name: "Abdul Raheem", country: "Saudi Arabia", text: "Hifz tracker ne sab kuch automatic schedule kiya. 6 mahine mein 5 paare yaad ho gaye.", stars: 5, avatarSeed: "AbdulRaheem" },
    { name: "Maryam Yusuf", country: "USA", text: "Mera beta 11 saal ka hai — 2 saal mein poora Quran yaad kar liya MashAllah.", stars: 5, avatarSeed: "MaryamYusuf" },
    { name: "Ibrahim Siddiqui", country: "Pakistan", text: "Teacher bohot dedicated hain aur progress report parents ko bhi milti hai.", stars: 5, avatarSeed: "IbrahimSiddiqui" },
  ],
  arabic: [
    { name: "Dr. Fatima Zahra", country: "France", text: "6 mahine mein Quran ki Arabic samajhna shuru ho gayi. Bohot effective course hai.", stars: 5, avatarSeed: "FatimaZahra" },
    { name: "Yusuf Rahman", country: "Indonesia", text: "AI ke saath grammar practice 24/7 available rehta hai, ghaltiyan turant batata hai.", stars: 5, avatarSeed: "YusufRahman" },
    { name: "Aisha Karimi", country: "Germany", text: "Conversation practice feature ne bohot madad ki. Highly recommend.", stars: 5, avatarSeed: "AishaKarimi" },
  ],
  aalim: [
    { name: "Maulana Tariq", country: "UK", text: "Asaatiza bohot qualified hain aur syllabus mukammal hai.", stars: 5, avatarSeed: "MaulanaTariq" },
    { name: "Hafiza Noor", country: "Canada", text: "2 saal complete hue — quality se bohot mutmain hoon. Ijaaza tak ka full roadmap clear hai.", stars: 5, avatarSeed: "HafizaNoor" },
    { name: "Sheikh Bilal", country: "South Africa", text: "Traditional ulama ke saath milke yeh course design hua hai — authenticity par koi compromise nahi.", stars: 5, avatarSeed: "SheikhBilal" },
  ],
};

export default function CourseDetailClient() {
  const params = useParams();
  const slug = params.slug as string;
  const t = useTranslations("courseDetail");
  const tc = useTranslations("coursesSection");
  const tp = useTranslations("coursesPage");

  const course = courseData[slug];
  const [showAllSyllabus, setShowAllSyllabus] = useState(false);

  if (!course) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground">
              Course not found
            </h1>
            <Link href="/courses">
              <Button className="mt-4" variant="outline">
                Back to Courses
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const Icon = course.icon;
  const k = course.key;
  const syllabus = getSyllabusItems(k);
  const isHifz = k === "hifz";
  const visibleSyllabus = isHifz && !showAllSyllabus ? syllabus.slice(0, 8) : syllabus;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <section
          className={`relative overflow-hidden bg-gradient-to-br ${course.heroGradient} py-16 md:py-24`}
        >
          <div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNDAgMEw0MCA4ME0wIDQwTDgwIDQwTTAgMEw4MCA4ME04MCAwTDAgODBNMjAgMEwyMCA4ME02MCAwTDYwIDgwTTAgMjBMODAgMjBNMCA2MEw4MCA2MCIgc3Ryb2tlPSIjMUI0MzMyIiBzdHJva2Utd2lkdGg9IjAuNSIgZmlsbD0ibm9uZSIvPjwvc3ZnPg==')] pointer-events-none" />
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center text-center"
            >
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${course.iconColor}`}>
                <Icon className="w-8 h-8" />
              </div>
              <h1 className="mt-6 text-3xl md:text-5xl font-bold text-primary">
                {tc(`${k}Title`)}
              </h1>
              <p className="mt-3 text-lg text-muted-foreground max-w-xl">
                {t(`${k}Tagline`)}
              </p>
              <Badge variant="secondary" className="mt-4 text-sm px-4 py-1">
                {course.duration}
              </Badge>
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Link href="/signup">
                  <Button
                    size="lg"
                    className="h-12 px-8 bg-accent hover:bg-accent/90 text-white font-semibold shadow-lg"
                  >
                    {t("enrollNow")}
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-12 px-8 border-primary text-primary hover:bg-primary hover:text-primary-foreground font-semibold"
                  >
                    {t("startTrial")}
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* What You Will Learn */}
        <section className="py-16">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-2xl md:text-3xl font-bold text-primary"
            >
              {t("overview")}
            </motion.h2>
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((n, i) => (
                <motion.div
                  key={n}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className="flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/10"
                >
                  <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground">
                    {t(`${k}Overview${n}`)}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Syllabus */}
        <section className="py-16 bg-muted/30">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-2xl md:text-3xl font-bold text-primary"
            >
              {t("syllabus")}
            </motion.h2>
            <div className="mt-8 grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {visibleSyllabus.map((item, i) => (
                <motion.div
                  key={item.key}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: (i % 4) * 0.05 }}
                  className="flex flex-col p-4 rounded-xl bg-card border shadow-sm"
                >
                  {/* Fixed-shape frame. object-contain so a cover is scaled to
                      fit rather than cropped or stretched, and every frame is
                      the same size whatever the source image's proportions. */}
                  {item.image && (
                    <div className="relative w-full aspect-[3/4] rounded-lg bg-muted/30 border border-muted overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.titleText ?? t(item.titleKey!)}
                        loading="lazy"
                        className="absolute inset-0 w-full h-full object-contain p-2"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                      />
                    </div>
                  )}

                  <p className="mt-3 text-sm font-semibold text-foreground leading-snug line-clamp-2">
                    {item.titleText ?? t(item.titleKey!)}
                  </p>

                  {item.subKey && (
                    <p className="mt-1 text-xs text-muted-foreground leading-relaxed line-clamp-3">
                      {t(item.subKey)}
                    </p>
                  )}

                  {item.pdfUrl && (
                    <a
                      href={item.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-auto pt-3 self-start inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 transition-colors"
                    >
                      PDF
                    </a>
                  )}
                </motion.div>
              ))}
            </div>
            {isHifz && (
              <button
                onClick={() => setShowAllSyllabus(!showAllSyllabus)}
                className="flex items-center gap-2 mx-auto mt-8 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
              >
                {showAllSyllabus ? t("showLess") : t("showAllParas")}
                <ChevronDown className={`w-4 h-4 transition-transform ${showAllSyllabus ? "rotate-180" : ""}`} />
              </button>
            )}
          </div>
        </section>

        {/* Who Is This For */}
        <section className="py-16">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-2xl md:text-3xl font-bold text-primary"
            >
              {t("whoIsItFor")}
            </motion.h2>
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[1, 2, 3].map((n, i) => (
                <motion.div
                  key={n}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className="p-5 rounded-xl bg-accent/5 border border-accent/20 text-center"
                >
                  <UserCheck className="w-6 h-6 text-accent mx-auto" />
                  <p className="mt-3 text-sm text-foreground">
                    {t(`${k}Who${n}`)}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Your Teacher */}
        <section className="py-16 bg-muted/30">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-2xl md:text-3xl font-bold text-primary mb-6"
            >
              {t("teacherIntro")}
            </motion.h2>
            {courseTeachers[k] && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="flex flex-col sm:flex-row items-start gap-6 p-6 rounded-2xl bg-card border shadow-sm"
              >
                <div className="relative w-20 h-20 rounded-full overflow-hidden shrink-0 bg-primary/10">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={courseTeachers[k].image}
                    alt={courseTeachers[k].name}
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/placeholder-teacher.svg"; }}
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-foreground">{courseTeachers[k].name}</h3>
                  <p className="text-sm font-semibold text-primary mt-0.5">{courseTeachers[k].role}</p>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{courseTeachers[k].bio}</p>
                  <a
                    href={`https://wa.me/${courseTeachers[k].whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    WhatsApp
                  </a>
                </div>
              </motion.div>
            )}
          </div>
        </section>

        {/* AI Ustaz Features */}
        <section className="py-16">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-2xl md:text-3xl font-bold text-primary"
            >
              {t("aiFeatures")}
            </motion.h2>
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { icon: MessageCircle, key: "aiF1" },
                { icon: BookOpen, key: "aiF2" },
                { icon: Clock, key: "aiF3" },
                { icon: Globe, key: "aiF4" },
              ].map((item, i) => {
                const AIIcon = item.icon;
                return (
                  <motion.div
                    key={item.key}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.1 }}
                    className="flex items-center gap-3 p-4 rounded-xl bg-accent/5 border border-accent/20"
                  >
                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                      <AIIcon className="w-5 h-5 text-accent" />
                    </div>
                    <span className="text-sm font-medium text-foreground">
                      {t(item.key)}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="py-16 bg-muted/30">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-2xl md:text-3xl font-bold text-primary text-center"
            >
              {t("pricing")}
            </motion.h2>
            <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              {/* Plan 1 */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="relative rounded-2xl border-2 border-primary bg-card p-6 shadow-lg"
              >
                <Badge className="absolute -top-3 start-4 bg-primary text-primary-foreground">
                  {tp("plan1Label")}
                </Badge>
                <div className="mt-2">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-primary">
                      {course.plan1Price}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {tp("perMonth")}
                    </span>
                  </div>
                  <ul className="mt-6 space-y-3">
                    <li className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-600" />
                      <span>{tp("liveClasses")}</span>
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-600" />
                      <span>{tp("aiUstaz")}</span>
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-600" />
                      <span>{tp("weeklyTests")}</span>
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-600" />
                      <span>{tp("certificates")}</span>
                    </li>
                  </ul>
                  <Link href="/signup" className="block mt-6">
                    <Button className="w-full bg-primary hover:bg-primary/90">
                      {t("enrollNow")}
                    </Button>
                  </Link>
                </div>
              </motion.div>

              {/* Plan 2 */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="rounded-2xl border bg-card p-6"
              >
                <Badge
                  variant="secondary"
                  className="bg-accent/10 text-accent"
                >
                  {tp("plan2Label")}
                </Badge>
                <div className="mt-2">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-accent">
                      {course.plan2Price}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {tp("perMonth")}
                    </span>
                  </div>
                  <ul className="mt-6 space-y-3">
                    <li className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-600" />
                      <span>{tp("aiUstaz")}</span>
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-600" />
                      <span>{tp("hifzTracker")}</span>
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-600" />
                      <span>{tp("kidsActivities")}</span>
                    </li>
                  </ul>
                  <Link href="/signup" className="block mt-6">
                    <Button
                      variant="outline"
                      className="w-full border-accent text-accent hover:bg-accent hover:text-white"
                    >
                      {t("startTrial")}
                    </Button>
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Student Reviews */}
        <section className="py-16">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-2xl md:text-3xl font-bold text-primary"
            >
              {t("reviews")}
            </motion.h2>
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {(courseReviews[k] ?? []).map((review, i) => (
                <motion.div
                  key={review.name}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className="p-5 rounded-xl bg-card border shadow-sm"
                >
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, s) => (
                      <Star
                        key={s}
                        className={`w-4 h-4 ${
                          s < review.stars
                            ? "text-amber-400 fill-amber-400"
                            : "text-muted-foreground/30"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                    &ldquo;{review.text}&rdquo;
                  </p>
                  <div className="mt-3 flex items-center gap-2 pt-3 border-t">
                    <img
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${review.avatarSeed}`}
                      alt={review.name}
                      className="w-8 h-8 rounded-full bg-muted"
                    />
                    <div>
                      <p className="text-xs font-semibold text-foreground">{review.name}</p>
                      <p className="text-xs text-muted-foreground">{review.country}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 bg-muted/30">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-2xl md:text-3xl font-bold text-primary text-center"
            >
              {t("faq")}
            </motion.h2>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mt-8"
            >
              <Accordion>
                {[1, 2, 3, 4].map((n) => (
                  <AccordionItem key={n} className="border-b">
                    <AccordionTrigger className="py-4 text-sm font-medium">
                      {t(`faq${n}Q`)}
                    </AccordionTrigger>
                    <AccordionContent>
                      <p className="text-sm text-muted-foreground pb-2">
                        {t(`faq${n}A`)}
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </motion.div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="py-16 bg-primary text-primary-foreground">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-2xl md:text-3xl font-bold"
            >
              {t("enrollCta")}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mt-3 text-primary-foreground/80"
            >
              {t("enrollCtaDesc")}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-8 flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link href="/signup">
                <Button
                  size="lg"
                  className="h-12 px-8 bg-accent hover:bg-accent/90 text-white font-semibold shadow-lg"
                >
                  {t("enrollNow")}
                </Button>
              </Link>
              <Link href="/signup">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 px-8 border-white/30 text-white hover:bg-white/10 font-semibold"
                >
                  {t("startTrial")}
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
