"use client";

import { motion } from "framer-motion";
import { Link } from "@/i18n/navigation";
import { GraduationCap, Bot, Sparkles } from "lucide-react";

/**
 * Copy supplied by the academy, to be used exactly as given. Do not add a
 * figure, testimonial or claim to this section, and do not rewrite the
 * wording. English on every locale for now — deliberately not translated.
 */
const HEADING = "Human Wisdom. AI Discipline.";

const PARAGRAPHS = [
  "Reading the Quran correctly is only the beginning. The real journey — tajweed refined by a caring ustaz, questions answered with wisdom, a bond that shapes character — can only come from a living teacher.",
  "That's where AI steps in, quietly, in the background: reminding you daily, tracking your sabaq and manzil, answering at 2 AM when no human can. Not to replace your teacher, but to free their every minute for what actually matters: you.",
  "No cold app. No rigid classroom. Just a modern madrasa, built the right way.",
];

const COLUMNS = [
  { title: "Living Teacher", body: "tajweed correction, personal guidance, barakah.", icon: GraduationCap },
  { title: "AI Ustaz", body: "24/7 practice, instant answers, smart tracking.", icon: Bot },
  { title: "Together", body: "one learning experience.", icon: Sparkles },
];

const CTA = "Start Your 5-Day Free Trial — No Card Required";

export function HumanAiSection() {
  return (
    // English copy, so this section reads left-to-right even on the RTL locales.
    <section className="py-20 px-4 bg-muted/30" dir="ltr">
      <div className="max-w-5xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-3xl md:text-4xl font-bold text-center text-primary"
        >
          {HEADING}
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-8 max-w-3xl mx-auto space-y-5 text-center"
        >
          {PARAGRAPHS.map((text) => (
            <p key={text} className="text-base md:text-lg text-muted-foreground leading-relaxed">
              {text}
            </p>
          ))}
        </motion.div>

        <div className="mt-12 grid gap-5 sm:grid-cols-3">
          {COLUMNS.map((col, i) => {
            const Icon = col.icon;
            return (
              <motion.div
                key={col.title}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.15 + i * 0.08 }}
                className="h-full p-6 rounded-2xl bg-card border shadow-sm text-center"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="mt-4 font-bold text-foreground">{col.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{col.body}</p>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/signup"
            className="inline-flex items-center justify-center px-8 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold shadow-md hover:opacity-90 transition-opacity"
          >
            {CTA}
          </Link>
        </div>
      </div>
    </section>
  );
}
