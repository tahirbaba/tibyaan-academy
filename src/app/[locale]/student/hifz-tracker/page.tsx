"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
  BookOpen, Flame, ChevronLeft, ChevronRight,
  Save, Calendar, BarChart3, TrendingUp, Loader2,
} from "lucide-react";

const SURAHS = [
  "Al-Fatiha","Al-Baqarah","Aal-e-Imran","An-Nisa","Al-Ma'idah","Al-An'am",
  "Al-A'raf","Al-Anfal","At-Tawbah","Yunus","Hud","Yusuf","Ar-Ra'd","Ibrahim",
  "Al-Hijr","An-Nahl","Al-Isra","Al-Kahf","Maryam","Ta-Ha","Al-Anbiya",
  "Al-Hajj","Al-Mu'minun","An-Nur","Al-Furqan","Ash-Shu'ara","An-Naml",
  "Al-Qasas","Al-Ankabut","Ar-Rum","Luqman","As-Sajdah","Al-Ahzab","Saba",
  "Fatir","Ya-Sin","As-Saffat","Sad","Az-Zumar","Ghafir","Fussilat",
  "Ash-Shura","Az-Zukhruf","Ad-Dukhan","Al-Jathiyah","Al-Ahqaf","Muhammad",
  "Al-Fath","Al-Hujurat","Qaf","Adh-Dhariyat","At-Tur","An-Najm","Al-Qamar",
  "Ar-Rahman","Al-Waqi'ah","Al-Hadid","Al-Mujadila","Al-Hashr","Al-Mumtahanah",
  "As-Saf","Al-Jumu'ah","Al-Munafiqun","At-Taghabun","At-Talaq","At-Tahrim",
  "Al-Mulk","Al-Qalam","Al-Haqqah","Al-Ma'arij","Nuh","Al-Jinn","Al-Muzzammil",
  "Al-Muddaththir","Al-Qiyamah","Al-Insan","Al-Mursalat","An-Naba","An-Nazi'at",
  "Abasa","At-Takwir","Al-Infitar","Al-Mutaffifin","Al-Inshiqaq","Al-Buruj",
  "At-Tariq","Al-A'la","Al-Ghashiyah","Al-Fajr","Al-Balad","Ash-Shams",
  "Al-Layl","Ad-Duha","Ash-Sharh","At-Tin","Al-Alaq","Al-Qadr","Al-Bayyinah",
  "Az-Zalzalah","Al-Adiyat","Al-Qari'ah","At-Takathur","Al-Asr","Al-Humazah",
  "Al-Fil","Quraysh","Al-Ma'un","Al-Kawthar","Al-Kafirun","An-Nasr",
  "Al-Masad","Al-Ikhlas","Al-Falaq","An-Nas",
];

type HifzRecord = {
  id: string;
  surahNumber: number;
  ayahFrom: number;
  ayahTo: number;
  type: string;
  score: number | null;
  createdAt: string;
};

type Stats = {
  totalAyaatMemorized: number;
  uniqueSurahs: number;
  avgScore: number;
  streak: number;
};

const calendarColors: Record<string, string> = {
  sabaq: "bg-emerald-500",
  sabqi: "bg-blue-500",
  manzil: "bg-amber-500",
};

const today = new Date();

function getDaysInMonth(m: number, y: number) { return new Date(y, m + 1, 0).getDate(); }
function getFirstDayOfMonth(m: number, y: number) { return new Date(y, m, 1).getDay(); }

export default function HifzTrackerPage() {
  const t = useTranslations("hifzTracker");
  const [records, setRecords] = useState<HifzRecord[]>([]);
  const [stats, setStats] = useState<Stats>({ totalAyaatMemorized: 0, uniqueSurahs: 0, avgScore: 0, streak: 0 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");

  const [selectedSurah, setSelectedSurah] = useState("");
  const [fromAyah, setFromAyah] = useState("");
  const [toAyah, setToAyah] = useState("");
  const [type, setType] = useState<"sabaq" | "sabqi" | "manzil">("sabaq");
  const [assessment, setAssessment] = useState<"good" | "okay" | "difficult" | "">("");
  const [notes, setNotes] = useState("");
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [calYear, setCalYear] = useState(today.getFullYear());

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/hifz");
      if (!res.ok) return;
      const data = await res.json();
      setRecords(data.records ?? []);
      setStats(data.stats ?? { totalAyaatMemorized: 0, uniqueSurahs: 0, avgScore: 0, streak: 0 });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSave = async () => {
    if (!selectedSurah || !fromAyah || !toAyah) {
      setSavedMsg("Please fill Surah, From Ayah, and To Ayah.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/hifz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          surahNumber: SURAHS.indexOf(selectedSurah) + 1,
          ayahFrom: parseInt(fromAyah),
          ayahTo: parseInt(toAyah),
          type,
          assessment,
          notes,
        }),
      });
      if (res.ok) {
        setSavedMsg("Saved successfully!");
        setSelectedSurah(""); setFromAyah(""); setToAyah("");
        setAssessment(""); setNotes("");
        fetchData();
      } else {
        setSavedMsg("Failed to save. Please try again.");
      }
    } finally {
      setSaving(false);
      setTimeout(() => setSavedMsg(""), 3000);
    }
  };

  // Build calendar entry map from records
  const calendarEntries: Record<string, string> = {};
  records.forEach((r) => {
    const dateStr = new Date(r.createdAt).toISOString().slice(0, 10);
    if (!calendarEntries[dateStr]) calendarEntries[dateStr] = r.type;
  });

  const daysInMonth = getDaysInMonth(calMonth, calYear);
  const firstDay = getFirstDayOfMonth(calMonth, calYear);
  const monthName = new Date(calYear, calMonth).toLocaleDateString("en", { month: "long", year: "numeric" });

  const totalAyaat = 6236;
  const memorizedPct = Math.min(100, Math.round((stats.totalAyaatMemorized / totalAyaat) * 100));

  // Per-juz progress is not derived here. The previous version poured the total
  // memorised ayah count into equal 1/30 blocks starting at Juz 1, so a student
  // with ~156 ayaat showed 75% on Juz 1 while the overall figure read 0%. The two
  // numbers measured different things and the map did not reflect which juz the
  // entries were actually for.
  //
  // Showing a real percentage needs a verified surah-to-juz ayah mapping, which is
  // Phase 6 and is not invented here. Until that dataset is chosen, a juz shows a
  // percentage only where real entries exist for it - which is currently none, as
  // hifz_tracker records carry surah and ayah but no juz.
  const juzData = Array.from({ length: 30 }, (_, i) => ({
    juz: i + 1,
    memorized: null as number | null,
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">{t("overallProgress")}</p>
        </div>
        <div className="flex items-center gap-3 bg-card border rounded-xl px-4 py-3">
          <Flame className="w-6 h-6 text-amber-500" />
          <div>
            <p className="text-lg font-bold text-foreground">{stats.streak}</p>
            <p className="text-xs text-muted-foreground">{t("streak")}</p>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: t("ayaatMemorized"), value: `${stats.totalAyaatMemorized}/${totalAyaat}`, extra: `${memorizedPct}%` },
          { label: t("surahsComplete"), value: String(stats.uniqueSurahs), extra: "/114" },
          { label: t("averageScore"), value: stats.avgScore > 0 ? `${stats.avgScore}%` : "—", extra: "" },
          { label: t("streak"), value: String(stats.streak), extra: "days" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            className="rounded-xl border bg-card p-4 text-center"
          >
            <p className="text-2xl font-bold text-primary">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Progress Circle + Today's Log */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="rounded-xl border bg-card p-6 flex flex-col items-center"
        >
          <h3 className="text-lg font-semibold text-foreground mb-4">{t("overallProgress")}</h3>
          <div className="relative w-40 h-40">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="52" fill="none" stroke="currentColor" strokeWidth="10" className="text-muted/50" />
              <circle cx="60" cy="60" r="52" fill="none" stroke="currentColor" strokeWidth="10"
                strokeDasharray={`${memorizedPct * 3.27} ${327 - memorizedPct * 3.27}`}
                strokeLinecap="round" className="text-primary transition-all duration-1000" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-primary">{memorizedPct}%</span>
              <span className="text-xs text-muted-foreground">{t("memorized")}</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="lg:col-span-2 rounded-xl border bg-card p-6"
        >
          <h3 className="text-lg font-semibold text-foreground mb-4">{t("todaysTasks")}</h3>
          <div className="space-y-3">
            {(["sabaq", "sabqi", "manzil"] as const).map((taskType) => {
              const colors = { sabaq: "emerald", sabqi: "blue", manzil: "amber" } as const;
              const icons = { sabaq: BookOpen, sabqi: BarChart3, manzil: Calendar };
              const c = colors[taskType];
              const Icon = icons[taskType];
              const todayRecords = records.filter(
                (r) => r.type === taskType && new Date(r.createdAt).toISOString().slice(0, 10) === today.toISOString().slice(0, 10)
              );
              return (
                <div key={taskType} className={`flex items-center gap-4 p-4 rounded-xl bg-${c}-50 dark:bg-${c}-950/30 border border-${c}-200 dark:border-${c}-800`}>
                  <div className={`w-10 h-10 rounded-lg bg-${c}-100 dark:bg-${c}-900 flex items-center justify-center shrink-0`}>
                    <Icon className={`w-5 h-5 text-${c}-600`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-foreground capitalize">{taskType}</p>
                      {todayRecords.length > 0 && (
                        <Badge className={`bg-${c}-600 text-white text-xs`}>{todayRecords.length} done</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {todayRecords.length > 0
                        ? todayRecords.map((r) => `Surah ${r.surahNumber}: ${r.ayahFrom}–${r.ayahTo}`).join(", ")
                        : t(`${taskType}Desc` as never)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Log Form + Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Log Sabaq Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="rounded-xl border bg-card p-6"
        >
          <h3 className="text-lg font-semibold text-foreground mb-4">{t("logSabaq")}</h3>
          <div className="space-y-4">
            {/* Type selector */}
            <div className="flex gap-2">
              {(["sabaq", "sabqi", "manzil"] as const).map((tp) => (
                <button
                  key={tp}
                  onClick={() => setType(tp)}
                  className={`flex-1 py-2 rounded-lg border text-xs font-medium transition-colors ${
                    type === tp ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:bg-muted"
                  }`}
                >
                  {tp.charAt(0).toUpperCase() + tp.slice(1)}
                </button>
              ))}
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">{t("selectSurah")}</label>
              <select
                value={selectedSurah}
                onChange={(e) => setSelectedSurah(e.target.value)}
                className="mt-1 w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">{t("selectSurah")}...</option>
                {SURAHS.map((s, i) => (
                  <option key={s} value={s}>{i + 1}. {s}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-foreground">{t("fromAyah")}</label>
                <input type="number" min={1} value={fromAyah} onChange={(e) => setFromAyah(e.target.value)}
                  className="mt-1 w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20" placeholder="1" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">{t("toAyah")}</label>
                <input type="number" min={1} value={toAyah} onChange={(e) => setToAyah(e.target.value)}
                  className="mt-1 w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20" placeholder="10" />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">{t("selfAssessment")}</label>
              <div className="mt-2 flex gap-2">
                {(["good", "okay", "difficult"] as const).map((a) => (
                  <button key={a} onClick={() => setAssessment(a)}
                    className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors ${
                      assessment === a
                        ? a === "good" ? "bg-emerald-500 text-white border-emerald-500"
                          : a === "okay" ? "bg-amber-500 text-white border-amber-500"
                          : "bg-red-500 text-white border-red-500"
                        : "bg-background hover:bg-muted"
                    }`}
                  >
                    {t(a === "good" ? "assessGood" : a === "okay" ? "assessOkay" : "assessDifficult")}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">{t("notes")}</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
                placeholder={t("notesPlaceholder")} rows={2}
                className="mt-1 w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 resize-none" />
            </div>

            {savedMsg && (
              <p className={`text-sm font-medium ${savedMsg.includes("success") ? "text-emerald-600" : "text-red-600"}`}>
                {savedMsg}
              </p>
            )}

            <Button onClick={handleSave} disabled={saving} className="w-full bg-primary hover:bg-primary/90 gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? "Saving…" : t("saveSabaq")}
            </Button>
          </div>
        </motion.div>

        {/* Revision Calendar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="rounded-xl border bg-card p-6"
        >
          <h3 className="text-lg font-semibold text-foreground mb-4">{t("revisionCalendar")}</h3>
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => { if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); } else setCalMonth(m => m - 1); }}
              className="p-1 rounded hover:bg-muted"><ChevronLeft className="w-5 h-5" /></button>
            <span className="text-sm font-semibold text-foreground">{monthName}</span>
            <button onClick={() => { if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); } else setCalMonth(m => m + 1); }}
              className="p-1 rounded hover:bg-muted"><ChevronRight className="w-5 h-5" /></button>
          </div>
          <div className="grid grid-cols-7 gap-1 mb-1">
            {["Su","Mo","Tu","We","Th","Fr","Sa"].map((d) => (
              <div key={d} className="text-center text-xs font-medium text-muted-foreground py-1">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1;
              const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const entry = calendarEntries[dateStr];
              const isToday = day === today.getDate() && calMonth === today.getMonth() && calYear === today.getFullYear();
              return (
                <div key={day} className={`relative aspect-square flex items-center justify-center rounded-lg text-xs ${isToday ? "ring-2 ring-primary font-bold" : ""}`}>
                  <span className="text-foreground">{day}</span>
                  {entry && <span className={`absolute bottom-0.5 w-1.5 h-1.5 rounded-full ${calendarColors[entry] ?? "bg-gray-400"}`} />}
                </div>
              );
            })}
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            {[
              { key: "sabaqColor", color: "bg-emerald-500", label: "Sabaq" },
              { key: "sabqiColor", color: "bg-blue-500", label: "Sabqi" },
              { key: "manzilColor", color: "bg-amber-500", label: "Manzil" },
            ].map((item) => (
              <div key={item.key} className="flex items-center gap-1.5">
                <span className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                <span className="text-xs text-muted-foreground">{item.label}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Juz Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.35 }}
        className="rounded-xl border bg-card p-6"
      >
        <h3 className="text-lg font-semibold text-foreground mb-4">{t("surahProgress")}</h3>
        <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-10 gap-2">
          {juzData.map((juz) => (
            <div key={juz.juz} className="flex flex-col items-center gap-1 group cursor-pointer">
              <div className={`w-full aspect-square rounded-lg border flex items-center justify-center text-xs font-bold transition-all group-hover:scale-105 ${
                juz.memorized === null ? "bg-muted text-muted-foreground border-muted-foreground/20"
                  : juz.memorized === 100 ? "bg-primary text-primary-foreground border-primary"
                  : juz.memorized > 0 ? "bg-primary/20 text-primary border-primary/30"
                  : "bg-muted text-muted-foreground border-muted-foreground/20"
              }`}>
                {juz.memorized !== null && juz.memorized > 0 ? `${juz.memorized}%` : ""}
              </div>
              <span className="text-[10px] text-muted-foreground">{t("juz")} {juz.juz}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Recent Records */}
      {records.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="rounded-xl border bg-card p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Recent Entries</h3>
          </div>
          <div className="space-y-2">
            {records.slice(0, 8).map((r) => (
              <div key={r.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 text-sm">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="text-xs capitalize">{r.type}</Badge>
                  <span className="text-foreground">
                    {SURAHS[r.surahNumber - 1] ?? `Surah ${r.surahNumber}`} · {r.ayahFrom}–{r.ayahTo}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground text-xs">
                  {r.score != null && <span className="text-emerald-600 font-medium">{r.score}%</span>}
                  <span>{new Date(r.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
