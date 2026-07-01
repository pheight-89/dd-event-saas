import "server-only";
import { supabase } from "@/lib/supabase";

export async function POST(request) {
  const { error } = await supabase.auth.signOut();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ success: true }, { status: 200 });
}
