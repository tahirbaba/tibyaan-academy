import { getPricing } from "@/lib/pricing-server";
import { feeSentence } from "@/lib/pricing";
import type { Metadata } from "next";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { Link } from "@/i18n/navigation";
import { SITE_URL, localeMetadataAlternates, absoluteUrl } from "@/lib/site-config";

const metaByLocale: Record<string, { title: string; description: string }> = {
  en: { title: "FAQ — Frequently Asked Questions | Tibyaan Academy", description: "Get answers to common questions about enrollment, pricing, teachers, schedule, free trial, and more at Tibyaan Academy." },
  ur: { title: "عام سوالات — تبیان اکیڈمی", description: "داخلہ، قیمتوں، اساتذہ، شیڈول اور مفت ٹرائل کے بارے میں اکثر پوچھے جانے والے سوالات کے جوابات۔" },
  ar: { title: "الأسئلة الشائعة — أكاديمية تبيان", description: "احصل على إجابات للأسئلة الشائعة حول التسجيل والأسعار والمعلمين والجدول الزمني." },
  fr: { title: "FAQ — Questions Fréquentes | Tibyaan Academy", description: "Obtenez des réponses aux questions fréquentes sur l'inscription, les prix, les enseignants et l'essai gratuit." },
  id: { title: "FAQ — Pertanyaan yang Sering Diajukan | Tibyaan Academy", description: "Dapatkan jawaban atas pertanyaan umum tentang pendaftaran, harga, guru, jadwal, dan uji coba gratis." },
};

const faqsByLocale: Record<string, { q: string; a: string }[]> = {
  en: [
    { q: "How do I enroll at Tibyaan Academy?", a: "Simply click 'Start Free Trial' on our website, create an account, select your course and plan, and start your 5-day free trial immediately — no credit card required." },
    { q: "Do I need a credit card for the free trial?", a: "No! Our 5-day free trial requires no credit card. You only pay when you decide to continue after the trial." },
    { q: "What courses are available?", a: "We offer 4 courses: Nazra Quran (Tajweed), Hifz Quran (Memorization), Arabic Language, and the Aalim Course (Dars-e-Nizami)." },
    { q: "What are the pricing plans?", a: "We have two plans: Plan 1 (Human Teacher + AI Ustaz) and Plan 2 (AI Only). {fees} Visit our Pricing page for full details." },
    { q: "Are the teachers qualified?", a: "All our teachers are certified scholars with ijazah chains. They hold degrees from renowned Islamic institutions like Darul Uloom, Al-Azhar, and others." },
    { q: "What time zones do you support?", a: "We support all global time zones. Students from UK, USA, UAE, Canada, Australia, and worldwide can book classes at their preferred times." },
    { q: "Can children join Tibyaan Academy?", a: "Yes! We have programs for all ages — from young children (5+) learning their first Arabic letters to adults pursuing the Aalim course." },
    { q: "What is the AI Ustaz?", a: "The AI Ustaz is our Claude-powered AI that answers Islamic questions 24/7 in 5 languages. It supplements live teacher classes for practice and Q&A." },
    { q: "Is there a family discount?", a: "Yes! We offer family discounts: 20% off for the 2nd family member and 30% off for the 3rd family member." },
    { q: "How do live classes work?", a: "Live classes are conducted via Zoom. Admin sets up the Zoom link, and both the teacher and student connect at the scheduled time for a 1-on-1 session." },
    { q: "How can I cancel my subscription?", a: "You can cancel anytime from your account dashboard. There are no cancellation fees. Your access continues until the end of the billing period." },
    { q: "In how many languages is the platform available?", a: "The platform is fully available in 5 languages: Urdu, Arabic, English, French, and Indonesian." },
    { q: "What is the Hifz Tracker?", a: "The Hifz Tracker is our smart tool that automatically schedules your daily Sabaq (new lesson), Sabqi (recent revision), and Manzil (long-term revision) using AI." },
    { q: "Do I get a certificate after completing a course?", a: "Yes! Upon completing a course or level, you receive a digital certificate. The Aalim Course also includes a prestigious Ijazah upon completion." },
    { q: "What is the refund policy?", a: "We offer a full refund within 7 days of subscribing — no questions asked. For technical issues, we handle cases individually. See our Refund Policy for details." },
    { q: "Can I switch plans?", a: "Yes, you can upgrade or change your plan at any time from your account settings." },
    { q: "What if I miss a class?", a: "If you miss a class, you can reschedule with your teacher's agreement. Class recordings are also available for enrolled students." },
    { q: "How do I contact support?", a: "Contact us via WhatsApp: +92-312-9114002 or email: academytibyaan@gmail.com. We respond within 24 hours." },
    { q: "Is there a mobile app?", a: "Tibyaan Academy is a Progressive Web App (PWA) that can be installed on your phone. Open our website and tap 'Add to Home Screen' for an app-like experience." },
    { q: "What is the Aalim Course?", a: "The Aalim Course is a complete Dars-e-Nizami program covering Fiqh, Hadith, Tafseer, Arabic, and more — available in 2, 4, 6, and 8-year formats with Ijazah." },
  ],
  ur: [
    { q: "تبیان اکیڈمی میں داخلہ کیسے لیں؟", a: "ہماری ویب سائٹ پر 'مفت ٹرائل شروع کریں' پر کلک کریں، اکاؤنٹ بنائیں، اپنا کورس اور پلان منتخب کریں، اور فوری طور پر 5 دن کا مفت ٹرائل شروع کریں — کوئی کریڈٹ کارڈ ضروری نہیں۔" },
    { q: "کیا مفت ٹرائل کے لیے کریڈٹ کارڈ چاہیے؟", a: "نہیں! ہمارے 5 دن کے مفت ٹرائل کے لیے کوئی کریڈٹ کارڈ ضروری نہیں۔ آپ صرف اس وقت ادائیگی کریں گے جب آپ ٹرائل کے بعد جاری رکھنے کا فیصلہ کریں۔" },
    { q: "کون کون سے کورسز دستیاب ہیں؟", a: "ہم 4 کورسز پیش کرتے ہیں: ناظرہ قرآن، حفظ قرآن، عربی زبان، اور عالم کورس (درس نظامی)۔" },
    { q: "قیمتیں کیا ہیں؟", a: "ہمارے دو پلان ہیں: پلان 1 (انسانی استاد + AI استاذ) اور پلان 2 (صرف AI)۔ {fees}" },
    { q: "کیا اساتذہ اہل ہیں؟", a: "ہمارے تمام اساتذہ سرٹیفائیڈ علماء ہیں جن کے اجازہ کی سند ہے۔ وہ دارالعلوم اور الازہر جیسے معروف اداروں کے فارغین ہیں۔" },
    { q: "کن ٹائم زونز میں کلاسز دستیاب ہیں؟", a: "ہم دنیا کے تمام ٹائم زونز سپورٹ کرتے ہیں۔ طلبا اپنی پسند کے وقت کلاس بک کر سکتے ہیں۔" },
    { q: "کیا بچے شامل ہو سکتے ہیں؟", a: "ہاں! ہمارے پاس تمام عمروں کے لیے پروگرام ہیں — 5 سال کے بچوں سے لے کر بالغوں تک۔" },
    { q: "AI استاذ کیا ہے؟", a: "AI استاذ ہمارا Claude-powered AI ہے جو 24/7 5 زبانوں میں اسلامی سوالوں کے جواب دیتا ہے۔" },
    { q: "فیملی ڈسکاؤنٹ ہے؟", a: "ہاں! دوسرے خاندانی رکن کے لیے 20% اور تیسرے کے لیے 30% ڈسکاؤنٹ۔" },
    { q: "واپسی کی پالیسی کیا ہے؟", a: "سبسکرپشن کے 7 دنوں کے اندر مکمل واپسی — کوئی سوال نہیں۔ تفصیل کے لیے واپسی پالیسی دیکھیں۔" },
  ],
  ar: [
    { q: "كيف أسجل في أكاديمية تبيان؟", a: "انقر على 'ابدأ تجربة مجانية' في موقعنا، أنشئ حسابًا، اختر الدورة والخطة، وابدأ التجربة المجانية لمدة 5 أيام فورًا — دون بطاقة ائتمان." },
    { q: "هل أحتاج بطاقة ائتمان للتجربة المجانية؟", a: "لا! لا تحتاج إلى بطاقة ائتمان للتجربة المجانية لمدة 5 أيام." },
    { q: "ما الدورات المتاحة؟", a: "نقدم 4 دورات: ناظرة القرآن، حفظ القرآن، اللغة العربية، ودورة العالم (درس النظامي)." },
    { q: "ما سياسة الاسترداد؟", a: "نقدم استردادًا كاملًا خلال 7 أيام من الاشتراك — دون أسئلة." },
    { q: "كيف تعمل الدروس المباشرة؟", a: "تُعقد الدروس المباشرة عبر Zoom. يضع المسؤول رابط Zoom، ويتصل المعلم والطالب في الوقت المحدد." },
  ],
  fr: [
    { q: "Comment s'inscrire à Tibyaan Academy ?", a: "Cliquez simplement sur 'Commencer l'essai gratuit', créez un compte, choisissez votre cours et démarrez immédiatement — sans carte de crédit." },
    { q: "Ai-je besoin d'une carte de crédit pour l'essai gratuit ?", a: "Non ! L'essai gratuit de 5 jours ne nécessite aucune carte de crédit." },
    { q: "Quels cours sont disponibles ?", a: "Nous proposons 4 cours : Nazra Quran, Hifz Quran, Langue Arabe et le Cours Aalim." },
    { q: "Quelle est la politique de remboursement ?", a: "Remboursement complet dans les 7 jours suivant l'abonnement — sans questions." },
    { q: "Comment fonctionnent les cours en direct ?", a: "Les cours en direct se déroulent via Zoom. L'administrateur configure le lien Zoom et l'enseignant et l'étudiant se connectent à l'heure prévue." },
  ],
  id: [
    { q: "Bagaimana cara mendaftar di Tibyaan Academy?", a: "Klik 'Mulai Uji Coba Gratis' di website kami, buat akun, pilih kursus dan paket Anda, dan mulai uji coba gratis 5 hari — tanpa kartu kredit." },
    { q: "Apakah perlu kartu kredit untuk uji coba gratis?", a: "Tidak! Uji coba gratis 5 hari kami tidak memerlukan kartu kredit." },
    { q: "Kursus apa saja yang tersedia?", a: "Kami menawarkan 4 kursus: Nazra Quran, Hifz Quran, Bahasa Arab, dan Kursus Aalim." },
    { q: "Apa kebijakan pengembalian dana?", a: "Pengembalian dana penuh dalam 7 hari setelah berlangganan — tanpa pertanyaan." },
    { q: "Bagaimana cara kerja kelas langsung?", a: "Kelas langsung dilakukan melalui Zoom. Admin menyiapkan link Zoom, dan guru serta siswa terhubung pada waktu yang dijadwalkan." },
  ],
};

function buildFaqSchema(faqs: { q: string; a: string }[], siteUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: { "@type": "Answer", text: faq.a },
    })),
  };
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const meta = metaByLocale[locale] || metaByLocale.en;
  return {
    title: meta.title,
    description: meta.description,
    alternates: localeMetadataAlternates(locale, "/faq"),
    openGraph: { title: meta.title, description: meta.description, url: absoluteUrl(locale, "/faq") },
  };
}

export default async function FAQPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const pricing = await getPricing();
  const fees = feeSentence(locale, pricing);
  const faqs = (faqsByLocale[locale] || faqsByLocale.en).map((faq) => ({
    q: faq.q,
    a: faq.a.replace("{fees}", fees),
  }));
  const isRTL = locale === "ur" || locale === "ar";

  const headings: Record<string, string> = {
    en: "Frequently Asked Questions",
    ur: "عام سوالات",
    ar: "الأسئلة الشائعة",
    fr: "Questions Fréquentes",
    id: "Pertanyaan yang Sering Diajukan",
  };

  const ctaTexts: Record<string, string> = {
    en: "Still have questions? Chat with us",
    ur: "کیا اب بھی سوالات ہیں؟ ہم سے بات کریں",
    ar: "لا تزال لديك أسئلة؟ تحدث معنا",
    fr: "Encore des questions ? Discutez avec nous",
    id: "Masih punya pertanyaan? Chat dengan kami",
  };

  const faqSchema = buildFaqSchema(faqs, SITE_URL);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1" dir={isRTL ? "rtl" : "ltr"}>
          <section className="bg-gradient-to-b from-emerald-50 to-white dark:from-emerald-950/20 dark:to-background py-16 px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl font-bold text-primary mb-4">
                {headings[locale] || headings.en}
              </h1>
              <p className="text-muted-foreground">
                {locale === "ur" ? "تبیان اکیڈمی کے بارے میں سب سے زیادہ پوچھے جانے والے سوالات" :
                 locale === "ar" ? "الأسئلة الأكثر شيوعًا حول أكاديمية تبيان" :
                 locale === "fr" ? "Les questions les plus posées sur Tibyaan Academy" :
                 locale === "id" ? "Pertanyaan paling umum tentang Tibyaan Academy" :
                 "The most commonly asked questions about Tibyaan Academy"}
              </p>
            </div>
          </section>

          <section className="py-12 px-4">
            <div className="max-w-3xl mx-auto space-y-4">
              {faqs.map((faq, i) => (
                <details
                  key={i}
                  className="group bg-background border rounded-xl overflow-hidden"
                >
                  <summary className="flex items-center justify-between p-5 cursor-pointer font-medium text-foreground hover:bg-muted/30 transition-colors list-none">
                    <span>{faq.q}</span>
                    <svg
                      className="w-5 h-5 text-muted-foreground shrink-0 transition-transform group-open:rotate-180"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="px-5 pb-5 text-muted-foreground leading-relaxed border-t border-border/50 pt-4">
                    {faq.a}
                  </div>
                </details>
              ))}
            </div>

            {/* CTA */}
            <div className="max-w-3xl mx-auto mt-12 p-8 rounded-2xl bg-[#1B4332] text-white text-center">
              <p className="text-lg font-semibold">{ctaTexts[locale] || ctaTexts.en}</p>
              <div className="mt-4 flex flex-col sm:flex-row gap-3 justify-center">
                <a
                  href="https://wa.me/923129114002"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white font-semibold px-6 py-3 rounded-xl transition-colors"
                >
                  WhatsApp
                </a>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center gap-2 border border-white/30 text-white hover:bg-white/10 font-semibold px-6 py-3 rounded-xl transition-colors"
                >
                  {locale === "ur" ? "رابطہ فارم" :
                   locale === "ar" ? "نموذج الاتصال" :
                   locale === "fr" ? "Formulaire de contact" :
                   locale === "id" ? "Formulir Kontak" :
                   "Contact Form"}
                </Link>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
}
