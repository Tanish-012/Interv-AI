import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { PDFParse } from "pdf-parse";
import { db } from "@/lib/db";

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

    // Helper function to invoke pdf-parse with local error wrapping
    async function pdfServerParse(pdfBuffer: Buffer): Promise<string> {
      try {
        const parser = new PDFParse({ data: pdfBuffer });
        const pdfData = await parser.getText();
        await parser.destroy();
        return pdfData.text || "";
      } catch (parseError: any) {
        throw new Error(parseError.message || "Failed to decode PDF binary contents");
      }
    }

    // 4. Extract text using modern pdf-parse with 10s Promise.race timeout
    let extractedText = "";
    try {
      extractedText = await Promise.race([
        pdfServerParse(buffer),
        new Promise<string>((_, reject) =>
          setTimeout(() => reject(new Error("Parsing timeout")), 10000)
        ),
      ]);
    } catch (parseError: any) {
      console.error("Internal PDF parsing/decoding error:", parseError);
      return NextResponse.json(
        { success: false, error: parseError.message || "Parsing timeout" },
        { status: 422 }
      );
    }

    if (!extractedText.trim()) {
      return NextResponse.json({ success: false, error: "Failed to extract text from PDF (it might be empty or scanned)" }, { status: 422 });
    }

    // 5. Save/Update in PostgreSQL using Prisma upsert
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
