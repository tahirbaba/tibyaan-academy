"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2 } from "lucide-react";
import { LocalDateTime } from "./local-time";

export interface EnrollPanelProps {
  cohortId: string;
  feeLabel: string;
  seatsLeft: number;
  ended: boolean;
  enrollmentOpen: boolean;
  trialEnabled: boolean;
  signedIn: boolean;
  /** The visitor's own enrollment state, if any. */
  mine: {
    status: string;
    seatLive: boolean;
    trialUsed: boolean;
    trialClassAt: string | null;
    waitlistPosition: number | null;
  } | null;
}

type Action = "enroll" | "trial" | "waitlist" | "leave";

export function EnrollPanel(props: EnrollPanelProps) {
  const t = useTranslations("cohorts");
  const locale = useLocale();
  const router = useRouter();
  const [busy, setBusy] = useState<Action | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { mine, seatsLeft, signedIn } = props;
  const paying = mine?.status === "active" || mine?.status === "past_due";
  const trialLive = mine?.status === "trial" && mine.seatLive;
  const waitlisted = mine?.status === "waitlisted";
  const full = seatsLeft <= 0 && !mine?.seatLive;

  // Every server error code has its own sentence. An unknown code is shown as
  // a failure — it is never swallowed into a success state.
  const errorText: Record<string, string> = {
    full: t("errFull"),
    closed: t("errClosed"),
    ended: t("errEnded"),
    already_enrolled: t("errAlreadyEnrolled"),
    trial_used: t("errTrialUsed"),
    trial_disabled: t("errTrialDisabled"),
    seats_available: t("errSeatsAvailable"),
    not_found: t("errNotFound"),
  };

  async function run(action: Action) {
    setBusy(action);
    setError(null);
    // True once the browser has been sent to Stripe: the button then stays
    // busy until the page unloads, so it cannot be pressed twice.
    let leaving = false;
    try {
      const path =
        action === "enroll" ? "enroll" : action === "trial" ? "trial" : "waitlist";
      const res = await fetch(`/api/cohorts/${props.cohortId}/${path}`, {
        method: action === "leave" ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: action === "leave" ? undefined : JSON.stringify({ locale }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        url?: string;
        error?: string;
      };
      if (!res.ok) {
        setError(errorText[data.error ?? ""] ?? t("errGeneric"));
        // The seat count on screen may be stale (e.g. the last seat just went).
        router.refresh();
        return;
      }
      if (action === "enroll") {
        if (!data.url) {
          setError(t("errGeneric"));
          return;
        }
        leaving = true;
        window.location.assign(data.url);
        return;
      }
      router.refresh();
    } catch {
      setError(t("errGeneric"));
    } finally {
      if (!leaving) setBusy(null);
    }
  }

  if (props.ended) {
    return <p className="text-sm text-muted-foreground">{t("ended")}</p>;
  }

  if (paying) {
    return (
      <div className="space-y-3">
        <p className="flex items-center gap-2 font-medium text-primary">
          <CheckCircle2 className="h-5 w-5" aria-hidden />
          {t("youAreEnrolled")}
        </p>
        <Link href="/student/group-classes">
          <Button className="w-full" size="lg">
            {t("goToMyClasses")}
          </Button>
        </Link>
      </div>
    );
  }

  if (!props.enrollmentOpen) {
    return <p className="text-sm text-muted-foreground">{t("enrollmentClosed")}</p>;
  }

  const spinner = <Loader2 className="h-4 w-4 animate-spin" aria-hidden />;

  return (
    <div className="space-y-3">
      {trialLive && mine?.trialClassAt && (
        <p className="rounded-xl border border-primary/30 bg-primary/5 p-3 text-sm text-foreground">
          {t("trialBooked")}{" "}
          <strong>
            <LocalDateTime iso={mine.trialClassAt} />
          </strong>
          {" · "}
          <Link href="/student/group-classes" className="text-primary underline">
            {t("goToMyClasses")}
          </Link>
        </p>
      )}

      {!signedIn ? (
        <>
          <Link href="/login">
            <Button className="w-full" size="lg">
              {full ? t("loginToJoinWaitlist") : t("loginToEnroll")}
            </Button>
          </Link>
          <p className="text-xs text-muted-foreground">
            {t("noAccount")}{" "}
            <Link href="/signup" className="text-primary underline">
              {t("createAccount")}
            </Link>
          </p>
        </>
      ) : full ? (
        waitlisted ? (
          <>
            <p className="text-sm font-medium text-foreground">
              {t("onWaitlist", { position: mine?.waitlistPosition ?? 0 })}
            </p>
            <Button
              variant="outline"
              className="w-full"
              disabled={busy !== null}
              onClick={() => run("leave")}
            >
              {busy === "leave" && spinner}
              {t("leaveWaitlist")}
            </Button>
          </>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">{t("fullExplain")}</p>
            <Button
              className="w-full"
              size="lg"
              disabled={busy !== null}
              onClick={() => run("waitlist")}
            >
              {busy === "waitlist" && spinner}
              {t("joinWaitlist")}
            </Button>
          </>
        )
      ) : (
        <>
          <Button
            className="w-full bg-accent text-white hover:bg-accent/90"
            size="lg"
            disabled={busy !== null}
            onClick={() => run("enroll")}
          >
            {busy === "enroll" && spinner}
            {t("enrollFor", { fee: props.feeLabel })}
          </Button>
          {props.trialEnabled && !mine?.trialUsed && (
            <Button
              variant="outline"
              className="w-full"
              size="lg"
              disabled={busy !== null}
              onClick={() => run("trial")}
            >
              {busy === "trial" && spinner}
              {t("tryFreeClass")}
            </Button>
          )}
          <p className="text-xs text-muted-foreground">{t("billingNote")}</p>
        </>
      )}

      {error && (
        <p role="alert" className="text-sm font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
