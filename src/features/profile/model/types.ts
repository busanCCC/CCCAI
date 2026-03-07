export const PROFILE_ROLES = ["간사", "순장", "순원", "기타"] as const;

export type ProfileRole = (typeof PROFILE_ROLES)[number];

export type ProfileSnapshot = {
  isBusanDistrict: boolean | null;
  role: ProfileRole | null;
  school: string | null;
};

export type ProfileDbRow = {
  is_busan_district: boolean | null;
  role: string | null;
  school: string | null;
} | null;

export function isProfileRole(value: unknown): value is ProfileRole {
  return typeof value === "string" && PROFILE_ROLES.includes(value as ProfileRole);
}

export function toProfileSnapshot(row: ProfileDbRow): ProfileSnapshot {
  const roleValue = row?.role;
  return {
    isBusanDistrict: row?.is_busan_district ?? null,
    role: isProfileRole(roleValue) ? roleValue : null,
    school: typeof row?.school === "string" ? row.school : null,
  };
}
