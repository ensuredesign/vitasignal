import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const resultsPath = path.join(process.cwd(), "docs", "evaluation-results.json");
    if (!fs.existsSync(resultsPath)) {
      return NextResponse.json({
        status: "not_measured",
        message: "Evaluation suite has not been executed yet. Run `npm run evaluate` to generate genuine benchmark results.",
        results: null,
      });
    }

    const raw = fs.readFileSync(resultsPath, "utf-8");
    const parsed = JSON.parse(raw);

    return NextResponse.json({
      status: "measured",
      results: parsed,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: { message: err.message } },
      { status: 500 }
    );
  }
}
