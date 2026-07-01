import "server-only";
import { supabase } from "@/lib/supabase";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(request) {
  const body = await request.json();
  const { orgName, email, password } = body;

  if (!orgName || !email || !password) {
    return Response.json(
      { error: "orgName, email, and password are required" },
      { status: 400 },
    );
  }

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError) {
    return Response.json({ error: authError.message }, { status: 400 });
  }

  if (!authData.user) {
    return Response.json(
      {
        error:
          "Account created but email confirmation is required. Please disable email confirmation in Supabase for development.",
      },
      { status: 400 },
    );
  }

  const userId = authData.user.id;

  const slug = orgName.toLowerCase().trim().replace(/\s+/g, "-");

  const { data: org, error: orgError } = await supabaseAdmin
    .from("organizations")
    .insert({ name: orgName, slug })
    .select()
    .single();

  if (orgError) {
    return Response.json({ error: orgError.message }, { status: 400 });
  }

  const { error: staffError } = await supabaseAdmin
    .from("org_staff")
    .insert({ org_id: org.id, email, auth_user_id: userId, role: "admin" });

  if (staffError) {
    return Response.json({ error: staffError.message }, { status: 400 });
  }

  return Response.json({ success: true, org }, { status: 200 });
}
