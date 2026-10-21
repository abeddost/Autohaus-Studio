import { connection } from "next/server";
import { issueFormToken } from "@/lib/security/formToken";

/** Issues a signed render timestamp for the enquiry form (spam protection). */
export async function GET() {
  await connection();
  const token = issueFormToken();
  if (!token) return Response.json({ ok: false }, { status: 503, headers: { "Cache-Control": "no-store" } });
  return Response.json({ ok: true, token }, { headers: { "Cache-Control": "no-store" } });
}
