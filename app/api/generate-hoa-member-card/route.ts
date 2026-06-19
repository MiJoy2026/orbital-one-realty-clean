import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const memberName = searchParams.get("memberName") || "Orbital One Member";
  const membershipNumber =
    searchParams.get("membershipNumber") || "HOA-OOR-2026-000000";
  const joinDate = searchParams.get("joinDate") || new Date().toLocaleDateString();
  const propertiesOwned = searchParams.get("propertiesOwned") || "1";

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([500, 300]);

  const titleFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const bodyFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const gold = rgb(0.82, 0.62, 0.18);
  const black = rgb(0.02, 0.02, 0.02);
  const white = rgb(1, 1, 1);

  page.drawRectangle({
    x: 0,
    y: 0,
    width: 500,
    height: 300,
    color: black,
  });

  page.drawRectangle({
    x: 18,
    y: 18,
    width: 464,
    height: 264,
    borderColor: gold,
    borderWidth: 3,
  });

  page.drawText("ORBITAL ONE REALTY", {
    x: 42,
    y: 245,
    size: 22,
    font: titleFont,
    color: gold,
  });

  page.drawText("2026 FOUNDING HOA MEMBER", {
    x: 42,
    y: 220,
    size: 12,
    font: titleFont,
    color: white,
  });

  page.drawText(memberName, {
    x: 42,
    y: 165,
    size: 24,
    font: titleFont,
    color: white,
  });

  page.drawText(`Membership No: ${membershipNumber}`, {
    x: 42,
    y: 130,
    size: 11,
    font: bodyFont,
    color: gold,
  });

  page.drawText(`Member Since: ${joinDate}`, {
    x: 42,
    y: 108,
    size: 11,
    font: bodyFont,
    color: white,
  });

  page.drawText(`Properties Owned: ${propertiesOwned}`, {
    x: 42,
    y: 86,
    size: 11,
    font: bodyFont,
    color: white,
  });

  page.drawText("Free HOA Membership • Lunar Newsletters • Future Member Benefits", {
    x: 42,
    y: 42,
    size: 9,
    font: bodyFont,
    color: gold,
  });

  const pdfBytes = await pdfDoc.save();

  return new NextResponse(Buffer.from(pdfBytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="orbital-one-hoa-member-card.pdf"`,
    },
  });
}