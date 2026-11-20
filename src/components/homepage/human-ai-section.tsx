"use client";

import { Reveal, SectionHeading } from "./primitives";
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
    <section className="bg-muted/40 px-4 py-20 md:py-28" dir="ltr">
      <div className="max-w-5xl mx-auto">
        <SectionHeading title={HEADING} />

        <Reveal delay={0.1} className="mx-auto mt-8 max-w-3xl space-y-5 text-center">
          {PARAGRAPHS.map((text) => (
            <p key={text} className="text-base leading-relaxed text-muted-foreground md:text-lg">
              {text}
            </p>
          ))}
        </Reveal>

        <div className="mt-14 grid gap-6 sm:grid-cols-3">
          {COLUMNS.map((col, i) => {
            const Icon = col.icon;
            return (
              <Reveal key={col.title} delay={0.1 + i * 0.08}>
                <div className="premium-card h-full p-7 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/15">
                    <Icon className="h-6 w-6 text-primary" aria-hidden />
                  </div>
                  <h3 className="mt-4 font-display text-lg font-semibold text-foreground">{col.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{col.body}</p>
                </div>
              </Reveal>
            );
          })}
        </div>

        <div className="mt-14 text-center">
          <Link
            href="/signup"
            className="inline-flex items-center justify-center rounded-full bg-primary px-9 py-4 font-semibold text-primary-foreground shadow-lg transition-transform hover:-translate-y-0.5"
          >
            {CTA}
          </Link>
        </div>
      </div>
    </section>
  );
}
