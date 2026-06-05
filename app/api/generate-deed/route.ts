import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { NextResponse } from "next/server";
import { sampleProperties } from "../../../lib/moon-data";

function centerText(page: any, text: string, y: number, size: number, font: any, color = rgb(0, 0, 0)) {
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

  const property = sampleProperties.find((item) => item.id === propertyId);

  if (!property) {
    return NextResponse.json({ error: "Property not found" }, { status: 404 });
  }

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([612, 792]);

  const titleFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
  const bodyFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const italicFont = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);

  const gold = rgb(0.82, 0.62, 0.18);
  const dark = rgb(0.08, 0.08, 0.08);
  const red = rgb(0.55, 0, 0);

  page.drawRectangle({
    x: 28,
    y: 28,
    width: 556,
    height: 736,
    borderColor: gold,
    borderWidth: 4,
  });

  page.drawRectangle({
    x: 44,
    y: 44,
    width: 524,
    height: 704,
    borderColor: dark,
    borderWidth: 1,
  });

  centerText(page, "ORBITAL ONE REALTY", 700, 26, titleFont, gold);
  centerText(page, "ESTABLISHED 2026", 675, 11, bodyFont, dark);
  centerText(page, "LUNAR PROPERTY DEED", 625, 24, titleFont, dark);
  centerText(page, "Certificate of Commemorative Lunar Property", 595, 16, italicFont, dark);

  page.drawLine({
    start: { x: 90, y: 570 },
    end: { x: 522, y: 570 },
    thickness: 1,
    color: gold,
  });

  centerText(page, "This certifies that the following lunar property", 535, 14, bodyFont);
  centerText(page, "has been recorded in the Orbital One Realty catalog:", 515, 14, bodyFont);

  const detailX = 150;
  const valueX = 300;

  page.drawText("Property ID:", { x: detailX, y: 465, size: 14, font: titleFont });
  page.drawText(property.id, { x: valueX, y: 465, size: 14, font: bodyFont });

  page.drawText("Property Type:", { x: detailX, y: 435, size: 14, font: titleFont });
  page.drawText(property.type, { x: valueX, y: 435, size: 14, font: bodyFont });

  page.drawText("Lunar State:", { x: detailX, y: 405, size: 14, font: titleFont });
  page.drawText(property.state, { x: valueX, y: 405, size: 14, font: bodyFont });

  page.drawText("Property Size:", { x: detailX, y: 375, size: 14, font: titleFont });
  page.drawText(property.size, { x: valueX, y: 375, size: 14, font: bodyFont });

  page.drawText("Issue Date:", { x: detailX, y: 345, size: 14, font: titleFont });
  page.drawText(new Date().toLocaleDateString(), { x: valueX, y: 345, size: 14, font: bodyFont });

page.drawEllipse({
  x: 306,
  y: 265,
  xScale: 70,
  yScale: 70,
  borderColor: gold,
  borderWidth: 4,
});

page.drawEllipse({
  x: 306,
  y: 265,
  xScale: 58,
  yScale: 58,
  borderColor: gold,
  borderWidth: 1.5,
});

page.drawEllipse({
  x: 306,
  y: 265,
  xScale: 38,
  yScale: 38,
  borderColor: gold,
  borderWidth: 1,
});

page.drawEllipse({
  x: 306,
  y: 307,
  xScale: 10,
  yScale: 10,
  color: gold,
});
centerText(page, "ORBITAL ONE", 278, 11, titleFont, gold);
centerText(page, "REALTY", 262, 10, titleFont, gold);
centerText(page, "OFFICIAL", 246, 8, bodyFont, gold);
centerText(page, "NOVELTY SEAL", 235, 8, bodyFont, gold);

  page.drawLine({
    start: { x: 95, y: 205 },
    end: { x: 260, y: 205 },
    thickness: 1,
    color: dark,
  });

  page.drawLine({
    start: { x: 352, y: 205 },
    end: { x: 517, y: 205 },
    thickness: 1,
    color: dark,
  });

  centerText(page, "Authorized Signature", 185, 10, bodyFont, dark);
  page.drawText("Certificate Holder", { x: 395, y: 185, size: 10, font: bodyFont });

  centerText(page, "It's fun. It's unique. It's out of this world!", 145, 13, italicFont, gold);

  centerText(page, "NOVELTY ITEM ONLY", 95, 12, titleFont, red);
  centerText(
    page,
    "This deed is commemorative only and does not convey legal ownership of lunar real estate.",
    72,
    9,
    bodyFont,
    dark
  );

  const pdfBytes = await pdfDoc.save();

  return new NextResponse(Buffer.from(pdfBytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${property.id}-novelty-deed.pdf"`,
    },
  });
}