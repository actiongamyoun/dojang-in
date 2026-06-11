import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET() {
  const p = path.join(process.cwd(), "data", "tools.json");
  if (!fs.existsSync(p)) return NextResponse.json({ tools: [] });
  return NextResponse.json({ tools: JSON.parse(fs.readFileSync(p, "utf-8")) });
}
