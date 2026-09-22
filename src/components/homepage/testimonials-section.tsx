"use client";

import Image from "next/image";
import { formatStat } from "@/lib/site-stats";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import InitialsAvatar from "@/components/shared/initials-avatar";

const reviews = [
  {
    id: 1,
    name: "Aaliya Mahmood",
    image: "/Reviewer/Aaliya%20Mahmood.jpg",
    country: "Pakistan",
    flag: "🇵🇰",
    course: "Nazra Quran",
    rating: 5,
    review:
      "I started Nazra Quran with Tibyaan. The AI Ustaz is available 24/7 — ask anything, get an instant answer. In just 4 months, I can now read the Quran fluently. Alhamdulillah!",
    role: "Student",
  },
  {
    id: 2,
    name: "Aamir Nazir",
    image: "/Reviewer/Aamir%20Nazir.jpg",
    country: "Pakistan",
    flag: "🇵🇰",
    course: "Hifz Quran",
    rating: 5,
    review:
      "The Hifz Tracker has changed my life. The AI-scheduled sabaq, sabqi, and manzil is so organized I never forget my lessons. Combined with a human teacher, this app is truly amazing.",
    role: "Student",
  },
  {
    id: 3,
    name: "Abdullah Asad",
    image: "/Reviewer/Abdullah%20Asad.jpg",
    country: "United Kingdom",
    flag: "🇬🇧",
    course: "Nazra Quran",
    rating: 5,
    review:
      "Finding a good Qari in the UK was difficult. Tibyaan solved that problem. The live class feels just like face-to-face. My child is very happy!",
    role: "Parent",
  },
  {
    id: 4,
    name: "Abdullah",
    image: "/Reviewer/Abdullah.jpg",
    country: "Nigeria",
    flag: "🇳🇬",
    course: "Hifz Quran",
    rating: 5,
    review:
      "Joining from Nigeria, I started the Hifz journey with my son. The AI Ustaz explains in English and the human teacher corrects tajweed. Best combination!",
    role: "Parent",
  },
  {
    id: 5,
    name: "Ahmet Kurt",
    image: "/Reviewer/Ahmet%20kurt.jpg",
    country: "Germany",
    flag: "🇩🇪",
    course: "Arabic Language",
    rating: 5,
    review:
      "Living in Germany, I wanted to learn Arabic. The sarf and nahw classes are so clear that what seemed difficult became easy. Support in multiple languages is truly outstanding.",
    role: "Student",
  },
  {
    id: 6,
    name: "Al Hoque",
    image: "/Reviewer/Al%20Hoque.jpg",
    country: "Bangladesh",
    flag: "🇧🇩",
    course: "Hifz Quran",
    rating: 5,
    review:
      "I'm from Bangladesh. Tibyaan's Hifz Tracker has been a game changer for me. Daily AI reminders and seeing my progress chart boosts my motivation. Masha'Allah!",
    role: "Student",
  },
  {
    id: 7,
    name: "Aliyan Ali",
    image: "/Reviewer/Aliyan%20Ali.jpg",
    country: "Indonesia",
    flag: "🇮🇩",
    course: "Nazra Quran",
    rating: 5,
    review:
      "I'm from Indonesia. Having support in the Indonesian language is a huge convenience. You can ask the AI Ustaz questions in your own language. Tibyaan is truly a world-class academy!",
    role: "Student",
  },
  {
    id: 8,
    name: "Amet Kurt Albani",
    image: "/Reviewer/Amet%20kurt%20Albani.jpg",
    country: "Turkey",
    flag: "🇹🇷",
    course: "Aalim Course",
    rating: 5,
    review:
      "Joined the Aalim Course from Turkey. Finding the complete Dars-e-Nizami curriculum online is amazing. The scholarly level of teachers and course with ijazah — only possible at Tibyaan!",
    role: "Student",
  },
  {
    id: 9,
    name: "Bakarii",
    image: "/Reviewer/Bakarii.jpg",
    country: "West Africa",
    flag: "🌍",
    course: "Nazra Quran",
    rating: 5,
    review:
      "I'm from West Africa. I took the 5-day free trial and loved it from the very first class, so I subscribed immediately. The teacher teaches with great patience.",
    role: "Student",
  },
  {
    id: 10,
    name: "Daruth Tahjeeb",
    image: "/Reviewer/Daruth%20Tahjeeb.jpg",
    country: "Bangladesh",
    flag: "🇧🇩",
    course: "Hifz Quran",
    rating: 5,
    review:
      "My daughter is doing hifz and eagerly waits for Tibyaan classes. The interactive kids' games make learning letters feel like play now!",
    role: "Parent",
  },
  {
    id: 11,
    name: "Febryarya",
    image: "/Reviewer/Febryarya.jpg",
    country: "Indonesia",
    flag: "🇮🇩",
    course: "Arabic Language",
    rating: 5,
    review:
      "Took the Arabic language course from Indonesia. Special focus on spoken Arabic which you don't find elsewhere. Practice with AI Ustaz anytime — no embarrassment!",
    role: "Student",
  },
  {
    id: 12,
    name: "Halid Elosman",
    image: "/Reviewer/Halid%20Elosman.jpg",
    country: "Saudi Arabia",
    flag: "🇸🇦",
    course: "Aalim Course",
    rating: 5,
    review:
      "I'm from Saudi Arabia and joined the Aalim Course. Seeing the teachers' credentials and scholarly background gave me peace of mind. Despite being online, the environment feels just like a madrasa.",
    role: "Student",
  },
  {
    id: 13,
    name: "Imran Ejaz",
    image: "/Reviewer/Imran%20Ejaz.jpg",
    country: "Pakistan",
    flag: "🇵🇰",
    course: "Hifz Quran",
    rating: 5,
    review:
      "My son memorized 10 paras in 8 months! The Hifz Tracker and teacher's combined effort made it possible. The weekly tests show clear progress.",
    role: "Parent",
  },
  {
    id: 14,
    name: "Irfan Shahzad",
    image: "/Reviewer/Irfan%20Shahzad.jpg",
    country: "Pakistan",
    flag: "🇵🇰",
    course: "Hifz Quran",
    rating: 5,
    review:
      "Tibyaan's AI Ustaz is amazing. Ask a question at 2am — instant reply! Combined with a human teacher, this combination is unbelievable.",
    role: "Student",
  },
  {
    id: 15,
    name: "Jalal Ahmed",
    image: "/Reviewer/Jalal%20Ahmed.jpg",
    country: "UAE",
    flag: "🇦🇪",
    course: "Nazra Quran",
    rating: 5,
    review:
      "I'm from the UAE. Flexible timings were essential in my busy life. Tibyaan's option to set your own schedule made everything easy. My child's pronunciation has improved tremendously!",
    role: "Parent",
  },
  {
    id: 16,
    name: "Javaistan",
    image: "/Reviewer/Javaistan.jpg",
    country: "Indonesia",
    flag: "🇮🇩",
    course: "Aalim Course",
    rating: 5,
    review:
      "I'm doing the Aalim Course from Indonesia. What I've learned in 2 years was not possible at any local institution. I really appreciate the teachers' personal attention to their students.",
    role: "Student",
  },
  {
    id: 17,
    name: "Jibar",
    image: "/Reviewer/Jibar.jpg",
    country: "Canada",
    flag: "🇨🇦",
    course: "Nazra Quran",
    rating: 5,
    review:
      "The problem of Islamic education for Muslim children in Canada is now solved. With Tibyaan, religious education is possible right from home. My son's connection with the Quran keeps growing.",
    role: "Parent",
  },
  {
    id: 18,
    name: "Kalamata",
    image: "/Reviewer/kalamata.jpg",
    country: "Indonesia",
    flag: "🇮🇩",
    course: "Aalim Course",
    rating: 5,
    review:
      "Completed the online Aalim Course and also received ijazah. This is the greatest academic achievement of my life. Tibyaan's teachers are outstanding in both knowledge and character.",
    role: "Student",
  },
  {
    id: 19,
    name: "Kaniz Fatima",
    image: "/Reviewer/Kaniz%20Fatima.jpg",
    country: "United Kingdom",
    flag: "🇬🇧",
    course: "Nazra Quran",
    rating: 5,
    review:
      "I'm a busy mum in the UK. Tibyaan connected my daughter to the Quran — she now sits and reads on her own every day. She loves doing repetition with the AI Ustaz!",
    role: "Parent",
  },
  {
    id: 20,
    name: "Kanwal Shaheen",
    image: "/Reviewer/Kanwal%20Shaheen.jpg",
    country: "Australia",
    flag: "🇦🇺",
    course: "Arabic Language",
    rating: 5,
    review:
      "Took the Arabic language course from Australia. I had no Arabic before, now I'm starting to understand Quranic translation. Tibyaan truly brought the Quran closer. Thank you Tibyaan!",
    role: "Student",
  },
  {
    id: 21,
    name: "Krar",
    image: "/Reviewer/krar.jpg",
    country: "Iraq",
    flag: "🇮🇶",
    course: "Nazra Quran",
    rating: 5,
    review:
      "I'm from Iraq. Tibyaan's classes brought the Quran closer to me. The AI Ustaz answers questions anytime day or night — I haven't found this convenience anywhere else. Thank you!",
    role: "Student",
  },
  {
    id: 22,
    name: "M. Zass",
    image: "/Reviewer/M%20Zass.jpg",
    country: "Nigeria",
    flag: "🇳🇬",
    course: "Hifz Quran",
    rating: 5,
    review:
      "Started the Hifz journey with my daughter from Nigeria. Tibyaan's environment is just like a madrasa. My daughter is happy, I am happy — Alhamdulillah, this academy proved to be the best choice!",
    role: "Parent",
  },
  {
    id: 23,
    name: "Mikhail Nilov",
    image: "/Reviewer/Mikhail%20Nilov.jpg",
    country: "Russia",
    flag: "🇷🇺",
    course: "Nazra Quran",
    rating: 5,
    review:
      "I'm from Russia and after accepting Islam, I wanted to learn the Quran. Tibyaan gave complete support in English. The teacher's patience and AI assistance — both made learning easy.",
    role: "Student",
  },
  {
    id: 24,
    name: "Mohameden Beinbe",
    image: "/Reviewer/Mohameden%20Beinbe.jpg",
    country: "Mauritania",
    flag: "🇲🇷",
    course: "Hifz Quran",
    rating: 5,
    review:
      "I'm from Mauritania. Tibyaan's Hifz Tracker is very useful for me — there's a complete system for sabaq, sabqi, and manzil. Teachers are very experienced and give special attention to tajweed.",
    role: "Student",
  },
  {
    id: 25,
    name: "Mohammad Asbad",
    image: "/Reviewer/Mohammad%20Asbad.jpg",
    country: "Pakistan",
    flag: "🇵🇰",
    course: "Hifz Quran",
    rating: 5,
    review:
      "I'm from Pakistan. Started Hifz with Tibyaan and completed 7 paras in 5 months. Daily AI reminders and human teacher's guidance — both together work wonders!",
    role: "Student",
  },
  {
    id: 26,
    name: "Monir-ul-Islam",
    image: "/Reviewer/Monir-ul-Islam.jpg",
    country: "Bangladesh",
    flag: "🇧🇩",
    course: "Aalim Course",
    rating: 5,
    review:
      "Enrolled in the Aalim Course from Bangladesh. Getting the complete Dars-e-Nizami curriculum online is unbelievable. Teachers' scholarly competence and live classes — everything is just like a real madrasa!",
    role: "Student",
  },
  {
    id: 27,
    name: "Mujeeb Zain",
    image: "/Reviewer/Mujeeb%20Zain.jpg",
    country: "Bangladesh",
    flag: "🇧🇩",
    course: "Nazra Quran",
    rating: 5,
    review:
      "I got my young son started on Nazra at Tibyaan. He loved learning letters through the interactive kids' games. Now he asks for class on his own — Masha'Allah!",
    role: "Parent",
  },
  {
    id: 28,
    name: "Murtaza Wahhab",
    image: "/Reviewer/Murtaza%20Wahhab.jpg",
    country: "Pakistan",
    flag: "🇵🇰",
    course: "Hifz Quran",
    rating: 5,
    review:
      "Seeing the weekly tests and AI progress chart keeps me motivated. The way the human teacher and AI work together at Tibyaan — this is truly a madrasa for the modern age!",
    role: "Student",
  },
  {
    id: 29,
    name: "Panditwiguna",
    image: "/Reviewer/Panditwiguna.jpg",
    country: "Indonesia",
    flag: "🇮🇩",
    course: "Arabic Language",
    rating: 5,
    review:
      "I'm from Indonesia. Took the Arabic language course and the journey from basics to conversation was very organized. Having support in Indonesian is truly a big advantage. Thank you Tibyaan!",
    role: "Student",
  },
  {
    id: 30,
    name: "Qamar Rehman",
    image: "/Reviewer/Qamar%20Rehman.jpg",
    country: "Pakistan",
    flag: "🇵🇰",
    course: "Hifz Quran",
    rating: 5,
    review:
      "My heart was overjoyed seeing my son's connection with the Quran. The way Tibyaan's teacher taught with such love — it is unforgettable. Started with the 5-day free trial then subscribed immediately.",
    role: "Parent",
  },
  {
    id: 31,
    name: "Quang Nguyen Vinh",
    image: "/Reviewer/Quang%20Nguyen%20Vinh.jpg",
    country: "Vietnam",
    flag: "🇻🇳",
    course: "Nazra Quran",
    rating: 5,
    review:
      "I'm from Vietnam. Support in English made it possible to learn the Quran. Practice with the AI Ustaz whenever you want — no time restriction. Tibyaan is truly for Muslims all over the world!",
    role: "Student",
  },
  {
    id: 32,
    name: "Riki Risnandar",
    image: "/Reviewer/Riki%20Risnandar.jpg",
    country: "Indonesia",
    flag: "🇮🇩",
    course: "Hifz Quran",
    rating: 5,
    review:
      "I'm doing the Hifz course from Indonesia. Tibyaan's Hifz Tracker creates a daily schedule — lessons stay memorized, progress is visible. Teacher and AI together — it gives peace of mind!",
    role: "Student",
  },
  {
    id: 33,
    name: "Sabrian Syah",
    image: "/Reviewer/Sabrian%20Syah.jpg",
    country: "Indonesia",
    flag: "🇮🇩",
    course: "Arabic Language",
    rating: 5,
    review:
      "I'm learning Arabic from Indonesia. Sarf and nahw classes are taught in a very easy manner. Talk in Arabic with the AI Ustaz whenever you want — all fear and shyness is gone!",
    role: "Student",
  },
  {
    id: 34,
    name: "Seyh Muskino",
    image: "/Reviewer/Seyh%20muskino.jpg",
    country: "Egypt",
    flag: "🇪🇬",
    course: "Aalim Course",
    rating: 5,
    review:
      "Joined the Aalim Course from Egypt. Tibyaan's teachers have a very high scholarly standard. Completing the course with ijazah was the dream of my life — Tibyaan fulfilled it!",
    role: "Student",
  },
  {
    id: 35,
    name: "Shaheer Nawaz",
    image: "/Reviewer/Shaheer%20Nawaz.jpg",
    country: "United Kingdom",
    flag: "🇬🇧",
    course: "Hifz Quran",
    rating: 5,
    review:
      "Living in the UK, I was worried about my son's religious education. Tibyaan removed that worry. Live classes, AI tracker, and weekly tests — all together are giving the best results!",
    role: "Parent",
  },
  {
    id: 36,
    name: "Shahzaib Jahan",
    image: "/Reviewer/Shahzaib%20Jahan.jpg",
    country: "Canada",
    flag: "🇨🇦",
    course: "Nazra Quran",
    rating: 5,
    review:
      "Islamic education in Canada was a challenge. Tibyaan made it possible to learn the Quran from home. My son now recites with great confidence — Masha'Allah!",
    role: "Parent",
  },
  {
    id: 37,
    name: "Shaista Touseef",
    image: "/Reviewer/Shaista%20Touseef.jpg",
    country: "Pakistan",
    flag: "🇵🇰",
    course: "Hifz Quran",
    rating: 5,
    review:
      "I'm from Pakistan. Tibyaan has brought me very close to the Quran. Tajweed practice with the AI Ustaz and lessons with the human teacher — both together make Hifz so much easier!",
    role: "Student",
  },
  {
    id: 38,
    name: "Sheikh Toulouse",
    image: "/Reviewer/Sheikh%20Toulouse.jpg",
    country: "France",
    flag: "🇫🇷",
    course: "Arabic Language",
    rating: 5,
    review:
      "I'm from France. Getting support in French proved to be the greatest blessing for me. After the Arabic language course, I started understanding Quranic translation — heartfelt thanks to Tibyaan!",
    role: "Student",
  },
  {
    id: 39,
    name: "Sheikh Yousuf",
    image: "/Reviewer/Sheikh%20Yousuf.jpg",
    country: "Saudi Arabia",
    flag: "🇸🇦",
    course: "Nazra Quran",
    rating: 5,
    review:
      "Enrolled my sons in Tibyaan from Saudi Arabia. The tajweed standard is very high. Tibyaan's teachers teach with love and sincerity — may Allah reward them greatly!",
    role: "Parent",
  },
  {
    id: 40,
    name: "Sheza Shehzad",
    image: "/Reviewer/Sheza%20Shehzad.jpg",
    country: "Indonesia",
    flag: "🇮🇩",
    course: "Arabic Language",
    rating: 5,
    review:
      "I'm from Indonesia. When I started learning Arabic with Tibyaan, it felt like a new world opened up. Reading the Quran with understanding is now possible — this is Tibyaan's greatest gift!",
    role: "Student",
  },
  {
    id: 41,
    name: "Sirmudi",
    image: "/Reviewer/Sirmudi.jpg",
    country: "Tanzania",
    flag: "🇹🇿",
    course: "Nazra Quran",
    rating: 5,
    review:
      "I'm from Tanzania. My son started reading Quran with Tibyaan — now he sits and recites on his own every day. The AI Ustaz helped a lot in correcting his tajweed. Jazakumullah Khairan!",
    role: "Parent",
  },
  {
    id: 42,
    name: "Sonyfeo",
    image: "/Reviewer/Sonyfeo.jpg",
    country: "Indonesia",
    flag: "🇮🇩",
    course: "Arabic Language",
    rating: 5,
    review:
      "I'm from Indonesia and took the Arabic language course. I knew nothing before — now I can speak basic sentences. Practicing conversation with the AI Ustaz boosted my confidence. I'm so happy!",
    role: "Student",
  },
  {
    id: 43,
    name: "Talha Shafique",
    image: "/Reviewer/Talha%20Shafique.jpg",
    country: "Bangladesh",
    flag: "🇧🇩",
    course: "Hifz Quran",
    rating: 5,
    review:
      "I'm doing Hifz from Bangladesh. Tibyaan's Hifz Tracker reminds me of my daily lesson, and seeing the progress chart fills me with more motivation to work harder. Teacher's loving guidance — everything together is wonderful!",
    role: "Student",
  },
  {
    id: 44,
    name: "Timur Weber",
    image: "/Reviewer/Timur%20Weber.jpg",
    country: "UAE",
    flag: "🇦🇪",
    course: "Hifz Quran",
    rating: 5,
    review:
      "I'm from the UAE. Tibyaan fulfilled my dream of learning Quran with my son. Teacher's attention in live class, AI's sabqi review — both together are giving the best results! May Allah reward Tibyaan.",
    role: "Parent",
  },
  {
    id: 45,
    name: "Ubaid-ul-llah",
    image: "/Reviewer/Ubaid-ul-llah.jpg",
    country: "Pakistan",
    flag: "🇵🇰",
    course: "Aalim Course",
    rating: 5,
    review:
      "I'm from Pakistan. Enrolled in the Aalim Course and from the very beginning, the quality of classes overwhelmed me. Teachers' knowledge, character, and love — all three are unmatched. Tibyaan is truly a madrasa for the modern age!",
    role: "Student",
  },
  {
    id: 46,
    name: "Zohair Ashraf",
    image: "/Reviewer/Zohair%20Ashraf.jpg",
    country: "Bangladesh",
    flag: "🇧🇩",
    course: "Nazra Quran",
    rating: 5,
    review:
      "I'm from Bangladesh. Enrolled my son in Tibyaan — the difference was visible from the very first week. Learning letters through kids' games has now become fun. The teacher's teaching method is outstanding!",
    role: "Parent",
  },
  {
    id: 47,
    name: "Zuhaib Junaid",
    image: "/Reviewer/Zuhaib%20Junaid.jpg",
    country: "Pakistan",
    flag: "🇵🇰",
    course: "Aalim Course",
    rating: 5,
    review:
      "I'm doing the Aalim Course from Pakistan. This online Dars-e-Nizami experience is amazing. Receiving a certificate with ijazah will be a great honor for me. Tibyaan's teachers teach from the heart — may Allah reward them!",
    role: "Student",
  },
  {
    id: 48,
    name: "Zulekha Jawed",
    image: "/Reviewer/Zulekha%20Jawed.jpg",
    country: "Turkey",
    flag: "🇹🇷",
    course: "Nazra Quran",
    rating: 5,
    review:
      "I'm from Turkey. Took the 5-day free trial and loved the teacher's style from the very first class — subscribed immediately. Now I read the Quran fluently — this is Tibyaan's blessing!",
    role: "Student",
  },
];

function ReviewCard({ review }: { review: (typeof reviews)[0] }) {
  return (
    <div className="w-[300px] shrink-0 p-5 rounded-xl border bg-card shadow-sm flex flex-col gap-3">
      <div className="flex gap-0.5">
        {Array.from({ length: review.rating }, (_, j) => (
          <Star key={j} className="w-3.5 h-3.5 fill-accent text-accent" />
        ))}
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-4">
        &ldquo;{review.review}&rdquo;
      </p>
      <div className="flex items-center gap-2.5 mt-auto pt-3 border-t">
        <div className="relative w-10 h-10 shrink-0">
          <Image
            src={review.image}
            alt={review.name}
            width={80}
            height={80}
            className="w-10 h-10 rounded-full object-cover"
          />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">{review.name}</p>
          <p className="text-xs text-muted-foreground truncate">
            {review.flag} {review.country} &middot; {review.course}
          </p>
        </div>
      </div>
    </div>
  );
}

const row1 = reviews.slice(0, 24);
const row2 = reviews.slice(24);

export function TestimonialsSection() {
  return (
    <section className="py-20 bg-muted/30 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-3xl md:text-4xl font-bold text-center text-primary"
        >
          What Parents &amp; Students Say
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-3 text-center text-muted-foreground"
        >
          Real stories from our global community of {formatStat("students")} students
        </motion.p>
      </div>

      {/* Row 1 — scroll left */}
      <div className="mt-10 overflow-hidden">
        <motion.div
          className="flex gap-4 w-max"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 60, ease: "linear", repeat: Infinity }}
        >
          {[...row1, ...row1].map((review, i) => (
            <ReviewCard key={`r1-${review.id}-${i}`} review={review} />
          ))}
        </motion.div>
      </div>

      {/* Row 2 — scroll right */}
      <div className="mt-4 overflow-hidden">
        <motion.div
          className="flex gap-4 w-max"
          animate={{ x: ["-50%", "0%"] }}
          transition={{ duration: 60, ease: "linear", repeat: Infinity }}
        >
          {[...row2, ...row2].map((review, i) => (
            <ReviewCard key={`r2-${review.id}-${i}`} review={review} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
