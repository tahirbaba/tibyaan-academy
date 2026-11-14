"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Users2 } from "lucide-react";
import { isValidDate, isValidTime } from "@/lib/cohorts/schedule";

interface Cohort {
  id: string;
  slug: string;
  teacherId: string;
  teacherName: string;
  titleEn: string;
  titleUr: string | null;
  titleAr: string | null;
  titleFr: string | null;
  titleId: string | null;
  descriptionEn: string | null;
  descriptionUr: string | null;
  descriptionAr: string | null;
  descriptionFr: string | null;
  descriptionId: string | null;
  weekdaysUtc: number[];
  startTimeUtc: string;
  sessionMinutes: number;
  startDate: string;
  durationWeeks: number;
  monthlyFee: string;
  currency: string;
  maxSeats: number;
  enrollmentOpen: boolean;
  trialEnabled: boolean;
  isPublished: boolean;
  meetingLink: string | null;
  seatsTaken: number;
  waitlistCount: number;
}

interface RosterRow {
  id: string;
  studentName: string;
  studentEmail: string;
  status: string;
  seatHeldUntil: string | null;
  trialClassAt: string | null;
  monthlyFee: string | null;
  currency: string | null;
  waitlistedAt: string | null;
}

/**
 * The form holds the schedule in the ADMIN'S OWN time zone, because that is
 * how a person thinks about "Tuesdays at 7pm". It is converted to UTC when
 * saved and back when loaded, and the UTC result is shown under the fields so
 * what is stored is never a surprise.
 */
interface Form {
  teacherId: string;
  titleEn: string;
  titleUr: string;
  titleAr: string;
  titleFr: string;
  titleId: string;
  descriptionEn: string;
  descriptionUr: string;
  descriptionAr: string;
  descriptionFr: string;
  descriptionId: string;
  localDays: number[];
  localTime: string;
  localStartDate: string;
  sessionMinutes: string;
  durationWeeks: string;
  monthlyFee: string;
  currency: string;
  maxSeats: string;
  enrollmentOpen: boolean;
  trialEnabled: boolean;
  isPublished: boolean;
  meetingLink: string;
}

const EMPTY: Form = {
  teacherId: "",
  titleEn: "",
  titleUr: "",
  titleAr: "",
  titleFr: "",
  titleId: "",
  descriptionEn: "",
  descriptionUr: "",
  descriptionAr: "",
  descriptionFr: "",
  descriptionId: "",
  localDays: [],
  localTime: "19:00",
  localStartDate: "",
  sessionMinutes: "60",
  durationWeeks: "12",
  monthlyFee: "",
  currency: "USD",
  maxSeats: "30",
  enrollmentOpen: true,
  trialEnabled: true,
  isPublished: false,
  meetingLink: "",
};

const pad = (n: number) => String(n).padStart(2, "0");

/** Local days + time + start date -> the UTC values that are stored. */
function toUtc(form: Pick<Form, "localDays" | "localTime" | "localStartDate">) {
  if (!isValidTime(form.localTime) || !isValidDate(form.localStartDate)) return null;
  const local = new Date(`${form.localStartDate}T${form.localTime}:00`);
  if (Number.isNaN(local.getTime())) return null;
  // How many weekdays the class moves when expressed in UTC (-1, 0 or +1).
  const shift = (local.getUTCDay() - local.getDay() + 7) % 7;
  return {
    weekdaysUtc: [...new Set(form.localDays.map((d) => (d + shift) % 7))].sort(
      (a, b) => a - b
    ),
    startTimeUtc: `${pad(local.getUTCHours())}:${pad(local.getUTCMinutes())}`,
    startDate: local.toISOString().slice(0, 10),
  };
}

/** Stored UTC values -> what the admin sees in their own zone. */
function toLocal(c: Pick<Cohort, "weekdaysUtc" | "startTimeUtc" | "startDate">) {
  const utc = new Date(`${c.startDate}T${c.startTimeUtc}:00Z`);
  const shift = (utc.getDay() - utc.getUTCDay() + 7) % 7;
  return {
    localDays: c.weekdaysUtc.map((d) => (d + shift) % 7).sort((a, b) => a - b),
    localTime: `${pad(utc.getHours())}:${pad(utc.getMinutes())}`,
    localStartDate: `${utc.getFullYear()}-${pad(utc.getMonth() + 1)}-${pad(utc.getDate())}`,
  };
}

function formFrom(c: Cohort): Form {
  return {
    teacherId: c.teacherId,
    titleEn: c.titleEn,
    titleUr: c.titleUr ?? "",
    titleAr: c.titleAr ?? "",
    titleFr: c.titleFr ?? "",
    titleId: c.titleId ?? "",
    descriptionEn: c.descriptionEn ?? "",
    descriptionUr: c.descriptionUr ?? "",
    descriptionAr: c.descriptionAr ?? "",
    descriptionFr: c.descriptionFr ?? "",
    descriptionId: c.descriptionId ?? "",
    ...toLocal(c),
    sessionMinutes: String(c.sessionMinutes),
    durationWeeks: String(c.durationWeeks),
    monthlyFee: String(Number(c.monthlyFee)),
    currency: c.currency,
    maxSeats: String(c.maxSeats),
    enrollmentOpen: c.enrollmentOpen,
    trialEnabled: c.trialEnabled,
    isPublished: c.isPublished,
    meetingLink: c.meetingLink ?? "",
  };
}

const inputClass =
  "mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary";

export function CohortsAdminClient() {
  const t = useTranslations("adminCohorts");
  const [cohorts, setCohorts] = useState<Cohort[] | null>(null);
  const [teachers, setTeachers] = useState<{ id: string; fullName: string }[]>([]);
  const [loadFailed, setLoadFailed] = useState(false);
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const [form, setForm] = useState<Form>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [rosterFor, setRosterFor] = useState<string | null>(null);
  const [roster, setRoster] = useState<RosterRow[] | "loading" | "failed">("loading");

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/cohorts");
      if (!res.ok) throw new Error(String(res.status));
      const data = await res.json();
      setCohorts(data.cohorts);
      setTeachers(data.teachers);
      setLoadFailed(false);
    } catch {
      // A failed load is shown as a failure — never as "no cohorts yet".
      setLoadFailed(true);
    }
  }, []);

  useEffect(() => {
    // Loading server data on mount; state is set only after the await.
    void load();
  }, [load]);

  const weekdayName = (d: number) =>
    new Intl.DateTimeFormat(undefined, { weekday: "short", timeZone: "UTC" }).format(
      new Date(Date.UTC(2023, 0, 1 + d)) // 1 Jan 2023 was a Sunday
    );

  async function openRoster(id: string) {
    if (rosterFor === id) {
      setRosterFor(null);
      return;
    }
    setRosterFor(id);
    setRoster("loading");
    try {
      const res = await fetch(`/api/admin/cohorts/${id}`);
      if (!res.ok) throw new Error(String(res.status));
      setRoster((await res.json()).roster);
    } catch {
      setRoster("failed");
    }
  }

  const utc = toUtc(form);

  async function save() {
    setFormError(null);
    if (!utc || form.localDays.length === 0) {
      setFormError(t("errSchedule"));
      return;
    }
    const payload = {
      teacherId: form.teacherId,
      titleEn: form.titleEn,
      titleUr: form.titleUr,
      titleAr: form.titleAr,
      titleFr: form.titleFr,
      titleId: form.titleId,
      descriptionEn: form.descriptionEn,
      descriptionUr: form.descriptionUr,
      descriptionAr: form.descriptionAr,
      descriptionFr: form.descriptionFr,
      descriptionId: form.descriptionId,
      ...utc,
      sessionMinutes: Number(form.sessionMinutes),
      durationWeeks: Number(form.durationWeeks),
      monthlyFee: Number(form.monthlyFee),
      currency: form.currency,
      maxSeats: Number(form.maxSeats),
      enrollmentOpen: form.enrollmentOpen,
      trialEnabled: form.trialEnabled,
      isPublished: form.isPublished,
      meetingLink: form.meetingLink,
    };

    setSaving(true);
    try {
      const res = await fetch(
        editing === "new" ? "/api/admin/cohorts" : `/api/admin/cohorts/${editing}`,
        {
          method: editing === "new" ? "POST" : "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
          issues?: { path: (string | number)[]; message: string }[];
        };
        const detail = data.issues
          ?.map((i) => `${i.path.join(".")}: ${i.message}`)
          .join("; ");
        setFormError(`${t("saveFailed")} ${detail ?? data.error ?? ""}`.trim());
        return;
      }
      setEditing(null);
      await load();
    } catch {
      setFormError(t("saveFailed"));
    } finally {
      setSaving(false);
    }
  }

  const text = (key: keyof Form, label: string, extra?: { dir?: "rtl"; type?: string; placeholder?: string }) => (
    <label className="block">
      <span className="text-sm font-medium text-foreground">{label}</span>
      <input
        type={extra?.type ?? "text"}
        dir={extra?.dir}
        placeholder={extra?.placeholder}
        value={form[key] as string}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        className={inputClass}
      />
    </label>
  );
  const area = (key: keyof Form, label: string, dir?: "rtl") => (
    <label className="block">
      <span className="text-sm font-medium text-foreground">{label}</span>
      <textarea
        rows={3}
        dir={dir}
        value={form[key] as string}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        className={inputClass}
      />
    </label>
  );
  const toggle = (key: "enrollmentOpen" | "trialEnabled" | "isPublished", label: string) => (
    <label className="flex items-center gap-2 text-sm text-foreground">
      <input
        type="checkbox"
        checked={form[key]}
        onChange={(e) => setForm({ ...form, [key]: e.target.checked })}
        className="h-4 w-4 accent-[#1B4332]"
      />
      {label}
    </label>
  );

  const statusLabel: Record<string, string> = {
    active: t("stActive"),
    past_due: t("stPastDue"),
    trial: t("stTrial"),
    pending: t("stPending"),
    waitlisted: t("stWaitlisted"),
    cancelled: t("stCancelled"),
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Users2 className="h-5 w-5 text-primary" aria-hidden />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{t("title")}</h1>
            <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
          </div>
        </div>
        <Button
          onClick={() => {
            setForm(EMPTY);
            setFormError(null);
            setEditing("new");
          }}
          className="gap-2"
        >
          <Plus className="h-4 w-4" aria-hidden />
          {t("newCohort")}
        </Button>
      </div>

      {editing && (
        <section className="space-y-5 rounded-xl border bg-card p-6">
          <h2 className="text-lg font-semibold text-foreground">
            {editing === "new" ? t("newCohort") : t("editCohort")}
          </h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {text("titleEn", t("titleEn"), { placeholder: "Quranic Arabic Grammar (Nahw-Sarf)" })}
            <label className="block">
              <span className="text-sm font-medium text-foreground">{t("teacher")}</span>
              <select
                value={form.teacherId}
                onChange={(e) => setForm({ ...form, teacherId: e.target.value })}
                className={inputClass}
              >
                <option value="">{t("chooseTeacher")}</option>
                {teachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.fullName}
                  </option>
                ))}
              </select>
            </label>
            {text("titleUr", t("titleUr"), { dir: "rtl" })}
            {text("titleAr", t("titleAr"), { dir: "rtl" })}
            {text("titleFr", t("titleFr"))}
            {text("titleId", t("titleId"))}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {area("descriptionEn", t("descEn"))}
            {area("descriptionUr", t("descUr"), "rtl")}
            {area("descriptionAr", t("descAr"), "rtl")}
            {area("descriptionFr", t("descFr"))}
            {area("descriptionId", t("descId"))}
          </div>

          <fieldset className="rounded-lg border p-4">
            <legend className="px-2 text-sm font-semibold text-foreground">{t("schedule")}</legend>
            <p className="text-xs text-muted-foreground">
              {t("scheduleHelp", { zone: Intl.DateTimeFormat().resolvedOptions().timeZone })}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {[0, 1, 2, 3, 4, 5, 6].map((d) => {
                const on = form.localDays.includes(d);
                return (
                  <button
                    key={d}
                    type="button"
                    aria-pressed={on}
                    onClick={() =>
                      setForm({
                        ...form,
                        localDays: on
                          ? form.localDays.filter((x) => x !== d)
                          : [...form.localDays, d].sort((a, b) => a - b),
                      })
                    }
                    className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                      on
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border text-muted-foreground hover:border-primary"
                    }`}
                  >
                    {weekdayName(d)}
                  </button>
                );
              })}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
              {text("localTime", t("startTime"), { type: "time" })}
              {text("localStartDate", t("startDate"), { type: "date" })}
              {text("sessionMinutes", t("sessionMinutes"), { type: "number" })}
              {text("durationWeeks", t("durationWeeks"), { type: "number" })}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              {utc && form.localDays.length > 0
                ? t("storedAs", {
                    days: utc.weekdaysUtc.map(weekdayName).join(", "),
                    time: utc.startTimeUtc,
                    date: utc.startDate,
                  })
                : t("storedAsPending")}
            </p>
          </fieldset>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {text("monthlyFee", t("monthlyFee"), { type: "number" })}
            <label className="block">
              <span className="text-sm font-medium text-foreground">{t("currency")}</span>
              <select
                value={form.currency}
                onChange={(e) => setForm({ ...form, currency: e.target.value })}
                className={inputClass}
              >
                {["USD", "GBP", "EUR", "CAD", "AUD"].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
            {text("maxSeats", t("maxSeats"), { type: "number" })}
          </div>
          {text("meetingLink", t("meetingLink"), { type: "url", placeholder: "https://zoom.us/j/…" })}

          <div className="flex flex-wrap gap-6">
            {toggle("isPublished", t("isPublished"))}
            {toggle("enrollmentOpen", t("enrollmentOpen"))}
            {toggle("trialEnabled", t("trialEnabled"))}
          </div>
          {editing !== "new" && (
            <p className="text-xs text-muted-foreground">{t("feeChangeNote")}</p>
          )}

          {formError && (
            <p role="alert" className="text-sm font-medium text-red-600">
              {formError}
            </p>
          )}
          <div className="flex gap-3">
            <Button onClick={save} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
              {t("save")}
            </Button>
            <Button variant="outline" onClick={() => setEditing(null)} disabled={saving}>
              {t("cancel")}
            </Button>
          </div>
        </section>
      )}

      {loadFailed ? (
        <p role="alert" className="rounded-xl border border-red-300 bg-red-50 p-6 text-red-700 dark:bg-red-950/30 dark:text-red-300">
          {t("loadFailed")}
        </p>
      ) : cohorts === null ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : cohorts.length === 0 ? (
        <p className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">
          {t("none")}
        </p>
      ) : (
        <ul className="space-y-4">
          {cohorts.map((c) => {
            const local = toLocal(c);
            return (
              <li key={c.id} className="rounded-xl border bg-card p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="font-semibold text-foreground">{c.titleEn}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {c.teacherName} · {local.localDays.map(weekdayName).join(", ")}{" "}
                      {local.localTime} · {Number(c.monthlyFee)} {c.currency}
                      {t("perMonth")}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {t("seats", { taken: c.seatsTaken, total: c.maxSeats })} ·{" "}
                      {t("waitlist", { count: c.waitlistCount })} ·{" "}
                      {c.isPublished ? t("published") : t("draft")} ·{" "}
                      {c.enrollmentOpen ? t("open") : t("closed")}
                      {!c.meetingLink && ` · ${t("noLink")}`}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => openRoster(c.id)}>
                      {t("roster")}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setForm(formFrom(c));
                        setFormError(null);
                        setEditing(c.id);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                    >
                      {t("edit")}
                    </Button>
                  </div>
                </div>

                {rosterFor === c.id && (
                  <div className="mt-4 border-t pt-4">
                    {roster === "loading" ? (
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    ) : roster === "failed" ? (
                      <p role="alert" className="text-sm font-medium text-red-600">
                        {t("rosterFailed")}
                      </p>
                    ) : roster.length === 0 ? (
                      <p className="text-sm text-muted-foreground">{t("rosterEmpty")}</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b text-xs uppercase text-muted-foreground">
                              <th className="py-2 pe-4 text-start font-medium">{t("colStudent")}</th>
                              <th className="py-2 pe-4 text-start font-medium">{t("colEmail")}</th>
                              <th className="py-2 pe-4 text-start font-medium">{t("colStatus")}</th>
                              <th className="py-2 pe-4 text-start font-medium">{t("colFee")}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {roster.map((r) => {
                              const holdExpired =
                                (r.status === "pending" || r.status === "trial") &&
                                (!r.seatHeldUntil || new Date(r.seatHeldUntil) < new Date());
                              return (
                                <tr key={r.id} className="border-b last:border-0">
                                  <td className="py-2 pe-4 font-medium text-foreground">{r.studentName}</td>
                                  <td className="py-2 pe-4 text-muted-foreground">{r.studentEmail}</td>
                                  <td className="py-2 pe-4">
                                    {statusLabel[r.status] ?? r.status}
                                    {holdExpired && ` (${t("holdExpired")})`}
                                  </td>
                                  <td className="py-2 pe-4 tabular-nums text-muted-foreground">
                                    {r.monthlyFee ? `${Number(r.monthlyFee)} ${r.currency ?? ""}` : "—"}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
