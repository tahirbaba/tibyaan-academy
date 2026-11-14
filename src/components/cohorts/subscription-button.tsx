"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

/**
 * Cancel a group class subscription at the end of the paid month, or undo
 * that. The button reflects what Stripe answered, and shows a failure as a
 * failure — it never flips its own label on an unconfirmed request.
 */
export function CohortSubscriptionButton({
  cohortId,
  cancelAtPeriodEnd,
}: {
  cohortId: string;
  cancelAtPeriodEnd: boolean;
}) {
  const t = useTranslations("cohorts");
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  async function submit(undo: boolean) {
    setBusy(true);
    setFailed(false);
    try {
      const res = await fetch(`/api/cohorts/${cohortId}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ undo }),
      });
      if (!res.ok) {
        setFailed(true);
        return;
      }
      setConfirming(false);
      router.refresh();
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  }

  const spinner = busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null;

  return (
    <div className="space-y-2">
      {cancelAtPeriodEnd ? (
        <Button variant="outline" size="sm" disabled={busy} onClick={() => submit(true)}>
          {spinner}
          {t("keepSubscription")}
        </Button>
      ) : confirming ? (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">{t("cancelConfirm")}</span>
          <Button variant="destructive" size="sm" disabled={busy} onClick={() => submit(false)}>
            {spinner}
            {t("cancelYes")}
          </Button>
          <Button variant="outline" size="sm" disabled={busy} onClick={() => setConfirming(false)}>
            {t("cancelNo")}
          </Button>
        </div>
      ) : (
        <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => setConfirming(true)}>
          {t("cancelSubscription")}
        </Button>
      )}
      {failed && (
        <p role="alert" className="text-sm font-medium text-red-600">
          {t("errGeneric")}
        </p>
      )}
    </div>
  );
}
