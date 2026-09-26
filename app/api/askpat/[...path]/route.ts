import { handleAskPat } from "@/lib/askpat/server/api";

export const runtime = "nodejs";

type Context = { params: Promise<{ path: string[] }> };
const run = async (request: Request, context: Context) => handleAskPat(request, (await context.params).path);

export async function GET(request: Request, context: Context) { return run(request, context); }
export async function POST(request: Request, context: Context) { return run(request, context); }
export async function DELETE(request: Request, context: Context) { return run(request, context); }
