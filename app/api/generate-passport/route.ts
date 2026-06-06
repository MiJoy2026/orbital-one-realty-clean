import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { NextResponse } from "next/server";
import { sampleProperties } from "../../../lib/moon-data";

function centerText(
  page: any,
  text: string,
  y: number,
  size: number,
  font: any,
  color = rgb(1, 1, 1)
) {
  const width = font.widthOfTextAtSize(text, size);
  page.drawText(text, {
    x: (612 - width) / 2,
    y,
    size,
    font,
    color,
  });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const propertyId = searchParams.get("propertyId");
  const deedName = searchParams.get("deedName") || "Orbital One Explorer";
  const certificateNumber =
  searchParams.get("certificateNumber") || `OOR-2026-${propertyId || "UNKNOWN"}`;
  const property = sampleProperties.find((item) => item.id === propertyId);

  if (!property) {
    return NextResponse.json({ error: "Property not found" }, { status: 404 });
  }

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([612, 792]);

  const titleFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const bodyFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const italicFont = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  const navy = rgb(0.02, 0.05, 0.15);
  const gold = rgb(0.82, 0.62, 0.18);
  const white = rgb(1, 1, 1);
  const gray = rgb(0.85, 0.85, 0.85);

  page.drawRectangle({
    x: 72,
    y: 72,
    width: 468,
    height: 648,
    color: navy,
  });

  page.drawRectangle({
    x: 92,
    y: 92,
    width: 428,
    height: 608,
    borderColor: gold,
    borderWidth: 3,
  });

  page.drawRectangle({
    x: 112,
    y: 112,
    width: 388,
    height: 568,
    borderColor: gold,
    borderWidth: 1,
  });

  centerText(page, "ORBITAL ONE REALTY", 640, 20, titleFont, gold);
  centerText(page, "NOVELTY LUNAR PASSPORT", 600, 26, titleFont, white);
  centerText(page, "OUT OF THIS WORLD EDITION", 570, 11, bodyFont, gold);

  page.drawEllipse({
    x: 306,
    y: 480,
    xScale: 72,
    yScale: 72,
    borderColor: gold,
    borderWidth: 3,
  });

  page.drawEllipse({
    x: 306,
    y: 480,
    xScale: 46,
    yScale: 46,
    borderColor: gold,
    borderWidth: 1.5,
  });

  centerText(page, "LUNAR", 500, 16, titleFont, gold);
  centerText(page, "PASSPORT", 475, 13, titleFont, gold);
  centerText(page, "2026", 450, 12, bodyFont, gold);

  page.drawLine({
    start: { x: 130, y: 390 },
    end: { x: 482, y: 390 },
    thickness: 1,
    color: gold,
  });

  page.drawText("Passport Holder:", {
    x: 140,
    y: 350,
    size: 12,
    font: bodyFont,
    color: gray,
  });

  page.drawText(deedName, {
    x: 260,
    y: 346,
    size: 18,
    font: titleFont,
    color: gold,
  });

  page.drawText("Linked Property:", {
    x: 140,
    y: 310,
    size: 12,
    font: bodyFont,
    color: gray,
  });

  page.drawText(property.id, {
    x: 260,
    y: 310,
    size: 13,
    font: titleFont,
    color: white,
  });

  page.drawText("Lunar State:", {
    x: 140,
    y: 280,
    size: 12,
    font: bodyFont,
    color: gray,
  });

  page.drawText(property.state, {
    x: 260,
    y: 280,
    size: 13,
    font: titleFont,
    color: white,
  });

  page.drawText("Issue Date:", {
    x: 140,
    y: 250,
    size: 12,
    font: bodyFont,
    color: gray,
  });

  page.drawText(new Date().toLocaleDateString(), {
    x: 260,
    y: 250,
    size: 13,
    font: titleFont,
    color: white,
  });

  page.drawText("Passport No:", {
    x: 140,
    y: 220,
    size: 12,
    font: bodyFont,
    color: gray,
  });

  page.drawText(certificateNumber, {
    x: 260,
    y: 220,
    size: 13,
    font: titleFont,
    color: white,
  });

  centerText(
    page,
    "This novelty passport is a commemorative keepsake only.",
    165,
    10,
    italicFont,
    gray
  );

  centerText(
    page,
    "Not valid for travel, identification, citizenship, or legal purposes.",
    145,
    10,
    italicFont,
    gray
  );

  centerText(page, "It's fun. It's unique. It's out of this world!", 118, 11, italicFont, gold);

  const pdfBytes = await pdfDoc.save();

  return new NextResponse(Buffer.from(pdfBytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${property.id}-lunar-passport.pdf"`,
    },
  });
}