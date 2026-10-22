import { createSupabaseServerClient } from "@/lib/supabase/supabase-server-client";
import type { SpotlightData } from "./kudos-board-types";
import {
  mapSpotlightRows,
  type SpotlightLatestRow,
  type SpotlightReceiverRow,
} from "./kudos-row-mappers";

const ACTIVITY_LIMIT = 6;

/** Unfiltered by design: total, every receiver (node size = kudos count), latest 6 activity lines. */
export async function getSpotlightData(activityTemplate: string): Promise<SpotlightData> {
  try {
    const client = await createSupabaseServerClient();
    const [total, receivers, latest] = await Promise.all([
      client.from("kudos").select("id", { count: "exact", head: true }),
      client
        .from("kudos_spotlight_receivers")
        .select("receiver_id,display_name,kudos_count,latest_kudos_id,latest_received_at")
        .order("kudos_count", { ascending: false })
        .order("receiver_id"),
      client
        .from("kudos_feed")
        .select("id,created_at,receiver_display_name")
        .order("created_at", { ascending: false })
        .order("id", { ascending: false })
        .limit(ACTIVITY_LIMIT),
    ]);
    const failure = total.error ?? receivers.error ?? latest.error;
    if (failure) throw failure;
    return mapSpotlightRows(
      total.count ?? 0,
      (receivers.data ?? []) as SpotlightReceiverRow[],
      (latest.data ?? []) as SpotlightLatestRow[],
      activityTemplate,
    );
  } catch (error) {
    console.error("[kudos] getSpotlightData failed", error);
    return { total: 0, nodes: [], activity: [] };
  }
}
