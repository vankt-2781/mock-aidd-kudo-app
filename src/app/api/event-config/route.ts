import { connection, NextResponse } from "next/server";

import { readEventStart } from "@/lib/event-config/read-event-start";

// cacheComponents: connection() opts out of build-time prerendering so env is read per request.
export async function GET() {
  await connection();
  return NextResponse.json(
    { startAt: readEventStart()?.iso ?? null },
    { headers: { "Cache-Control": "no-store" } },
  );
}
