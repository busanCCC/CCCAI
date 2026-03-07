import { NextResponse } from "next/server";

import { isProfileComplete } from "@/features/profile/model/completion";
import { isProfileRole, toProfileSnapshot } from "@/features/profile/model/types";
import { getSupabaseEnvOrNull } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function asNonEmptyText(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

export async function GET() {
  if (!getSupabaseEnvOrNull()) {
    return NextResponse.json({ error: "Supabase가 설정되지 않았습니다." }, { status: 503 });
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("is_busan_district, role, school")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: "프로필 정보를 조회하지 못했습니다." }, { status: 500 });
  }

  const snapshot = toProfileSnapshot(profile);
  return NextResponse.json({
    profile: snapshot,
    isComplete: isProfileComplete(snapshot),
  });
}

export async function PUT(request: Request) {
  if (!getSupabaseEnvOrNull()) {
    return NextResponse.json({ error: "Supabase가 설정되지 않았습니다." }, { status: 503 });
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청 형식입니다." }, { status: 400 });
  }

  const body = payload as {
    isBusanDistrict?: unknown;
    role?: unknown;
    school?: unknown;
  };

  if (typeof body.isBusanDistrict !== "boolean") {
    return NextResponse.json({ error: "부산지구 여부를 선택해주세요." }, { status: 400 });
  }
  if (!isProfileRole(body.role)) {
    return NextResponse.json({ error: "역할을 선택해주세요." }, { status: 400 });
  }

  const school = asNonEmptyText(body.school);
  if (!school) {
    return NextResponse.json({ error: "학교(또는 소속)를 입력해주세요." }, { status: 400 });
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .upsert(
      {
        user_id: user.id,
        email: user.email ?? null,
        is_busan_district: body.isBusanDistrict,
        role: body.role,
        school,
      },
      { onConflict: "user_id" },
    )
    .select("is_busan_district, role, school")
    .single();

  if (error) {
    const isSchemaError = error.code === "42703" || error.message.includes("column");
    return NextResponse.json(
      {
        error: isSchemaError
          ? "프로필 스키마가 최신이 아닙니다. 최신 migration을 먼저 적용해주세요."
          : "프로필 정보를 저장하지 못했습니다.",
      },
      { status: 500 },
    );
  }

  const snapshot = toProfileSnapshot(profile);
  return NextResponse.json({
    profile: snapshot,
    isComplete: isProfileComplete(snapshot),
  });
}
