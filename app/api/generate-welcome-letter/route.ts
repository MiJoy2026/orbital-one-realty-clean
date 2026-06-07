import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { NextResponse } from "next/server";
import { sampleProperties } from "../../../lib/moon-data";

function centerText(
  page: any,
  text: string,
  y: number,
  size: number,
  font: any,
  color = rgb(0, 0, 0)
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
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const verificationUrl =
  `${appUrl}/verify/${certificateNumber}`;
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

  page.drawRectangle({
    x: 28,
    y: 28,
    width: 556,
    height: 736,
    borderColor: gold,
    borderWidth: 3,
  });

  centerText(page, "ORBITAL ONE REALTY", 705, 26, titleFont, gold);
  centerText(page, "Welcome to Your Lunar Property Package", 665, 20, titleFont, dark);

  page.drawLine({
    start: { x: 90, y: 640 },
    end: { x: 522, y: 640 },
    thickness: 1,
    color: gold,
  });

  page.drawText(`Dear ${deedName},`, {
    x: 80,
    y: 590,
    size: 14,
    font: bodyFont,
    color: dark,
  });
  page.drawText(`Certificate Number: ${certificateNumber}`, {
  x: 80,
  y: 565,
  size: 12,
  font: titleFont,
  color: gold,
});
  const paragraphs = [
    "Congratulations and welcome to Orbital One Realty. Your novelty lunar property package has been prepared as a fun, memorable, and out-of-this-world keepsake.",
    `Your selected property is ${property.id}, a ${property.size} ${property.type} located in the lunar state of ${property.state}.`,
    "Inside your Orbital One welcome package, you will find your novelty deed, property information, nearby lunar attractions, HOA membership materials, and optional add-ons such as novelty lunar passports.",
    "Please remember that Orbital One Realty products are novelty and commemorative items only. They do not convey legal ownership, mineral rights, territorial rights, or any enforceable property interest in lunar real estate.",
    "Thank you for joining the Orbital One community. It's fun. It's unique. It's out of this world!",
  ];

  let y = 525;

  for (const paragraph of paragraphs) {
    page.drawText(paragraph, {
      x: 80,
      y,
      size: 12,
      font: bodyFont,
      color: dark,
      maxWidth: 455,
      lineHeight: 16,
    });

    y -= 75;
  }

  page.drawText("Sincerely,", {
    x: 80,
    y: 170,
    size: 13,
    font: italicFont,
    color: dark,
  });

  page.drawText("Orbital One Realty", {
    x: 80,
    y: 145,
    size: 16,
    font: titleFont,
    color: gold,
  });
page.drawText("Verify your certificate online:", {
  x: 80,
  y: 115,
  size: 11,
  font: bodyFont,
  color: dark,
});

page.drawText(verificationUrl, {
  x: 80,
  y: 98,
  size: 10,
  font: bodyFont,
  color: gold,
});
  centerText(page, "It's fun. It's unique. It's out of this world!", 70, 12, italicFont, gold);

  const pdfBytes = await pdfDoc.save();

  return new NextResponse(Buffer.from(pdfBytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${property.id}-welcome-letter.pdf"`,
    },
  });
}