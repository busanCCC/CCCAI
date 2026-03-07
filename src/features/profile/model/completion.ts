import type { ProfileSnapshot } from "@/features/profile/model/types";

function hasText(value: string | null): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

export function isProfileComplete(profile: ProfileSnapshot | null | undefined): boolean {
  if (!profile) {
    return false;
  }
  return typeof profile.isBusanDistrict === "boolean" && !!profile.role && hasText(profile.school);
}
