import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

// Pin to the Node.js runtime — pdf-parse v1 relies on Node-only APIs (Buffer, fs)
// that are not available in the Edge runtime.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    // 1. Authenticate with Clerk
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse the incoming Form Data
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ success: false, error: "No file provided or invalid file format" }, { status: 400 });
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json({ success: false, error: "Only PDF files are supported" }, { status: 400 });
    }

    // 3. Convert File to Node Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Helper: dynamically import the internal CJS entrypoint of pdf-parse v1.
    // Importing the sub-path directly bypasses Turbopack's ESM wrapper so we
    // always get the raw callable function, not a wrapped module object.
    async function pdfServerParse(pdfBuffer: Buffer): Promise<string> {
      const pdfParseModule = await import("pdf-parse/lib/pdf-parse.js");

      const pdfParse =
        (pdfParseModule as any).default ??
        (pdfParseModule as any);

      if (typeof pdfParse !== "function") {
        console.error("pdf-parse module shape:", pdfParseModule);
        throw new Error("PDF parser failed to load correctly");
      }

      const pdfData = await pdfParse(pdfBuffer);

      if (!pdfData?.text) {
        throw new Error("No text could be extracted from this PDF");
      }

      return pdfData.text;
    }

    // 4. Extract text with a 10s timeout guard
    let extractedText = "";
    try {
      extractedText = await Promise.race([
        pdfServerParse(buffer),
        new Promise<string>((_, reject) =>
          setTimeout(() => reject(new Error("Parsing timeout after 10 seconds")), 10000)
        ),
      ]);
    } catch (parseError: any) {
      console.error("Internal PDF parsing/decoding error:", parseError);
      return NextResponse.json(
        { success: false, error: parseError.message || "PDF parsing failed" },
        { status: 422 }
      );
    }

    if (!extractedText.trim()) {
      return NextResponse.json(
        { success: false, error: "Failed to extract text from PDF (it might be empty or scanned)" },
        { status: 422 }
      );
    }

    // 5. Save/Update in PostgreSQL via Prisma upsert
    const userResume = await db.userResume.upsert({
      where: { userId },
      update: {
        fileName: file.name,
        extractedText: extractedText,
      },
      create: {
        userId,
        fileName: file.name,
        extractedText: extractedText,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Resume processed and stored successfully",
      data: {
        id: userResume.id,
        fileName: userResume.fileName,
        preview: extractedText.slice(0, 500) + (extractedText.length > 500 ? "..." : ""),
      },
    });
  } catch (error: any) {
    console.error("PDF upload/parsing error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "An internal error occurred while processing the PDF" },
      { status: 500 }
    );
  }
}
