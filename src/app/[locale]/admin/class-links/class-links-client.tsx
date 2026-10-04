"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link2, Check, AlertCircle } from "lucide-react";

interface Teacher {
  id: string;
  fullName: string;
  email: string;
}

type SaveState = "idle" | "saving" | "saved" | "error";

export function ClassLinksClient({
  teachers,
  todayByTeacher,
  yesterdayByTeacher,
  todayLabel,
  yesterdayLabel,
}: {
  teachers: Teacher[];
  todayByTeacher: Record<string, string>;
  yesterdayByTeacher: Record<string, string>;
  todayLabel: string;
  yesterdayLabel: string;
}) {
  const t = useTranslations("classLinks");
  const [values, setValues] = useState<Record<string, string>>(todayByTeacher);
  const [state, setState] = useState<Record<string, SaveState>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function save(teacherId: string) {
    setState((s) => ({ ...s, [teacherId]: "saving" }));
    setErrors((e) => ({ ...e, [teacherId]: "" }));
    try {
      const res = await fetch("/api/admin/class-links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teacherId, meetingUrl: values[teacherId] ?? "" }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setState((s) => ({ ...s, [teacherId]: "error" }));
        setErrors((e) => ({ ...e, [teacherId]: data.error || t("saveFailed") }));
        return;
      }
      setState((s) => ({ ...s, [teacherId]: "saved" }));
    } catch {
      setState((s) => ({ ...s, [teacherId]: "error" }));
      setErrors((e) => ({ ...e, [teacherId]: t("saveFailed") }));
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Link2 className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("adminTitle")}</h1>
          <p className="text-sm text-muted-foreground">
            {t("todayIs", { day: todayLabel })}
          </p>
        </div>
      </div>

      {teachers.length === 0 ? (
        <p className="text-muted-foreground py-10 text-center">{t("noTeachers")}</p>
      ) : (
        <div className="space-y-3">
          {teachers.map((teacher) => {
            const st = state[teacher.id] ?? "idle";
            const yesterdayLink = yesterdayByTeacher[teacher.id];
            return (
              <div key={teacher.id} className="rounded-xl border bg-card p-4 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold text-foreground">{teacher.fullName}</p>
                    <p className="text-xs text-muted-foreground">{teacher.email}</p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="url"
                    inputMode="url"
                    placeholder={t("linkPlaceholder")}
                    value={values[teacher.id] ?? ""}
                    onChange={(e) => {
                      setValues((v) => ({ ...v, [teacher.id]: e.target.value }));
                      setState((s) => ({ ...s, [teacher.id]: "idle" }));
                    }}
                    className="h-11 flex-1 rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <button
                    type="button"
                    onClick={() => save(teacher.id)}
                    disabled={st === "saving"}
                    className="h-11 px-5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-60 shrink-0"
                  >
                    {st === "saving" ? t("saving") : t("save")}
                  </button>
                </div>
                {st === "saved" && (
                  <p className="text-xs text-emerald-600 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> {t("savedFor", { day: todayLabel })}
                  </p>
                )}
                {st === "error" && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {errors[teacher.id]}
                  </p>
                )}
                {yesterdayLink && (
                  <p className="text-xs text-muted-foreground truncate">
                    {t("yesterdayWas", { day: yesterdayLabel })}:{" "}
                    <span className="font-mono">{yesterdayLink}</span>
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
