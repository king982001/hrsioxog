const { PDFDocument, rgb, degrees, StandardFonts } = require('pdf-lib');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: 'Method Not Allowed',
    };
  }

  try {
    const buffer = Buffer.from(event.body, 'base64'); // Netlify sends body as base64

    const pdfDoc = await PDFDocument.load(buffer);
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const pages = pdfDoc.getPages();

    pages.forEach(page => {
      const { width, height } = page.getSize();
      page.drawText('LOCKED COPY – INTERNAL HR USE ONLY', {
        x: width / 4,
        y: height / 2,
        size: 30,
        font,
        color: rgb(1, 0, 0),
        rotate: degrees(-30),
        opacity: 0.4,
      });
    });

    const lockedPdfBytes = await pdfDoc.save();

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename=locked.pdf',
      },
      body: Buffer.from(lockedPdfBytes).toString('base64'),
      isBase64Encoded: true,
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: 'PDF locking failed',
    };
  }
};
