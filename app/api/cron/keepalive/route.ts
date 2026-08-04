import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const auth = request.headers.get("authorization");

  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!
  );

  const { error } = await supabase
    .from("donors")
    .select("id")
    .limit(1);

  if (error) {
    console.error(error);

    return NextResponse.json(
      {
        ok: false,
        error: error.message,
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    timestamp: new Date().toISOString(),
  });
}