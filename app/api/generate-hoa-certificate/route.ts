import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { NextResponse } from "next/server";
import { getOrderDocumentData, OrderDocumentError } from "../../../lib/order-document-data";

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
  let documentData;

  try {
    documentData = await getOrderDocumentData(request);
  } catch (error) {
    if (error instanceof OrderDocumentError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }

    throw error;
  }

  const {
    property,
    member,
    certificateNumber,
    deedName,
    issueDate,
    locationLabel,
  } = documentData;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const verificationUrl = `${appUrl}/verify/${encodeURIComponent(
    certificateNumber
  )}`;

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([612, 792]);

  const titleFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
  const bodyFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const italicFont = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);

  const gold = rgb(0.82, 0.62, 0.18);
  const dark = rgb(0.08, 0.08, 0.08);
  const green = rgb(0.04, 0.34, 0.22);

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
    borderColor: green,
    borderWidth: 1.5,
  });

  centerText(page, "ORBITAL ONE REALTY", 705, 25, titleFont, gold);
  centerText(page, "LUNAR HOMEOWNERS ASSOCIATION", 665, 22, titleFont, dark);
  centerText(page, "2026 Founding Member Certificate", 635, 16, italicFont, green);

  page.drawLine({
    start: { x: 90, y: 610 },
    end: { x: 522, y: 610 },
    thickness: 1,
    color: gold,
  });

  centerText(page, "This certifies that", 565, 14, bodyFont, dark);

  centerText(page, deedName, 525, 28, titleFont, gold);

  centerText(page, "is recognized as a", 485, 14, bodyFont, dark);
  centerText(page, "Founding Member of the Orbital One Lunar HOA", 455, 20, titleFont, green);

  page.drawText("Membership No:", {
    x: 115,
    y: 390,
    size: 13,
    font: titleFont,
    color: dark,
  });

  page.drawText(member?.hoaNumber || certificateNumber, {
    x: 260,
    y: 390,
    size: 13,
    font: bodyFont,
    color: dark,
  });

  page.drawText("Linked Property:", {
    x: 115,
    y: 360,
    size: 13,
    font: titleFont,
    color: dark,
  });

  page.drawText(`${property.id} • ${locationLabel}`, {
    x: 260,
    y: 360,
    size: 13,
    font: bodyFont,
    color: dark,
  });

  page.drawText("Member Since:", {
    x: 115,
    y: 330,
    size: 13,
    font: titleFont,
    color: dark,
  });

  page.drawText(issueDate, {
    x: 260,
    y: 330,
    size: 13,
    font: bodyFont,
    color: dark,
  });

  page.drawText("Included Member Benefits:", {
    x: 115,
    y: 285,
    size: 14,
    font: titleFont,
    color: green,
  });

  const benefits = [
    "Emailed lunar newsletters",
    "Future Orbital One updates",
    "Priority access to future virtual property enhancements",
    "Access to future add-ons such as virtual home building",
    "Member recognition and special promotional opportunities",
  ];

  let y = 255;

  for (const benefit of benefits) {
    page.drawText(`• ${benefit}`, {
      x: 135,
      y,
      size: 11,
      font: bodyFont,
      color: dark,
    });
    y -= 22;
  }
  centerText(page, "Verify this membership certificate online:", 145, 9, bodyFont, dark);
  centerText(page, verificationUrl, 132, 9, bodyFont, gold);
  centerText(page, "Membership included free with paid property purchase.", 105, 11, italicFont, green);
  centerText(page, "Future features and benefits may be released over time.", 85, 9, bodyFont, dark);

  const pdfBytes = await pdfDoc.save();

  return new NextResponse(Buffer.from(pdfBytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${property.id}-hoa-certificate.pdf"`,
    },
  });
}