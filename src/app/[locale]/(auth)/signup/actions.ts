"use server";

import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { notifyAdminNewSignup } from "@/lib/utils/notify-admin";

async function uploadAvatar(userId: string, file: File): Promise<string | null> {
  try {
    const admin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${userId}.${ext}`;
    const bytes = await file.arrayBuffer();

    const { error } = await admin.storage
      .from("avatars")
      .upload(path, bytes, { contentType: file.type, upsert: true });

    if (error) return null;

    const { data } = admin.storage.from("avatars").getPublicUrl(path);
    return data.publicUrl ?? null;
  } catch {
    return null;
  }
}

export async function signupWithEmail(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("fullName") as string;
  const role = formData.get("role") as string;
  const language = formData.get("language") as string;
  const locale = formData.get("locale") as string;
  const parentWhatsapp = (formData.get("parentWhatsapp") as string) || null;
  const avatarFile = formData.get("avatar") as File | null;

  const { error, data } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role: role || "student",
        preferred_language: language || "ur",
        needs_onboarding: true,
        parent_whatsapp: parentWhatsapp || null,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  // Upload avatar if provided
  if (avatarFile && avatarFile.size > 0 && data.user) {
    const avatarUrl = await uploadAvatar(data.user.id, avatarFile);
    if (avatarUrl) {
      // Update user metadata with avatar URL
      const admin = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );
      await admin.auth.admin.updateUserById(data.user.id, {
        user_metadata: {
          full_name: fullName,
          role: role || "student",
          preferred_language: language || "ur",
          needs_onboarding: true,
          parent_whatsapp: parentWhatsapp || null,
          avatar_url: avatarUrl,
        },
      }).catch(() => {});

      // Also update users table directly
      try {
        await admin
          .from("users")
          .update({ avatar_url: avatarUrl })
          .eq("id", data.user.id);
      } catch {
        // non-critical, ignore
      }
    }
  }

  // Notify admin about new signup (fire-and-forget)
  notifyAdminNewSignup({
    email,
    fullName,
    role: role || "student",
  }).catch(() => {});

  // If email confirmation is required, user won't have a session yet
  // Check if we got a session (auto-confirm enabled)
  if (data.session) {
    // User is logged in — go to onboarding. Discard the pre-signup cached
    // layout first so the redirect carries the new session (the two-press bug;
    // see docs/phase-12-environment.md Task 4). The no-session branch below
    // needs no revalidation — the user is not logged in there.
    revalidatePath("/", "layout");
    redirect(`/${locale}/onboarding`);
  } else {
    // Email confirmation required — redirect to login with a message
    redirect(`/${locale}/login?confirmed=pending`);
  }
}
