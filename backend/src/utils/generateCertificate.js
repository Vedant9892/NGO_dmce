import PDFDocument from 'pdfkit';

/**
 * Generates a certificate PDF buffer for a volunteer
 * @param {Object} opts
 * @param {string} opts.volunteerName
 * @param {string} opts.eventName
 * @param {string} opts.eventDate  - ISO string or Date
 * @param {string} opts.ngoName
 * @returns {Promise<Buffer>}
 */
export function generateCertificate({ volunteerName, eventName, eventDate, ngoName }) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 60 });
      const chunks = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const pageWidth = doc.page.width;   // 841.89
      const pageHeight = doc.page.height; // 595.28

      // ── Background ──────────────────────────────────────────────────────
      doc.rect(0, 0, pageWidth, pageHeight).fill('#f0fdf4');

      // Outer decorative border
      doc
        .rect(20, 20, pageWidth - 40, pageHeight - 40)
        .lineWidth(3)
        .stroke('#16a34a');

      // Inner thin border
      doc
        .rect(30, 30, pageWidth - 60, pageHeight - 60)
        .lineWidth(1)
        .stroke('#86efac');

      // ── Header strip ────────────────────────────────────────────────────
      doc.rect(20, 20, pageWidth - 40, 80).fill('#16a34a');

      doc
        .fillColor('#ffffff')
        .fontSize(28)
        .font('Helvetica-Bold')
        .text('CERTIFICATE OF PARTICIPATION', 20, 40, {
          align: 'center',
          width: pageWidth - 40,
        });

      // ── "This is to certify that" ────────────────────────────────────────
      doc
        .fillColor('#166534')
        .fontSize(14)
        .font('Helvetica')
        .text('This is to certify that', 0, 130, { align: 'center', width: pageWidth });

      // ── Volunteer name ───────────────────────────────────────────────────
      doc
        .fillColor('#14532d')
        .fontSize(38)
        .font('Helvetica-Bold')
        .text(volunteerName, 0, 158, { align: 'center', width: pageWidth });

      // Underline
      const nameWidth = doc.widthOfString(volunteerName, { fontSize: 38 });
      const nameX = (pageWidth - nameWidth) / 2;
      doc
        .moveTo(nameX, 202)
        .lineTo(nameX + nameWidth, 202)
        .lineWidth(1.5)
        .stroke('#16a34a');

      // ── Body text ────────────────────────────────────────────────────────
      doc
        .fillColor('#166534')
        .fontSize(14)
        .font('Helvetica')
        .text('has successfully participated as a volunteer in', 0, 218, {
          align: 'center',
          width: pageWidth,
        });

      // ── Event name ───────────────────────────────────────────────────────
      doc
        .fillColor('#15803d')
        .fontSize(24)
        .font('Helvetica-Bold')
        .text(`"${eventName}"`, 0, 244, { align: 'center', width: pageWidth });

      // ── Date ─────────────────────────────────────────────────────────────
      const formattedDate = eventDate
        ? new Date(eventDate).toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })
        : 'N/A';

      doc
        .fillColor('#166534')
        .fontSize(13)
        .font('Helvetica')
        .text(`held on ${formattedDate}`, 0, 280, { align: 'center', width: pageWidth });

      // ── Divider ──────────────────────────────────────────────────────────
      doc
        .moveTo(pageWidth * 0.2, 310)
        .lineTo(pageWidth * 0.8, 310)
        .lineWidth(1)
        .stroke('#86efac');

      // ── Issued by ────────────────────────────────────────────────────────
      doc
        .fillColor('#166534')
        .fontSize(12)
        .font('Helvetica')
        .text('Issued by', 0, 325, { align: 'center', width: pageWidth });

      doc
        .fillColor('#14532d')
        .fontSize(18)
        .font('Helvetica-Bold')
        .text(ngoName, 0, 344, { align: 'center', width: pageWidth });

      // ── Footer ────────────────────────────────────────────────────────────
      doc.rect(20, pageHeight - 100, pageWidth - 40, 2).fill('#16a34a');

      doc
        .fillColor('#166534')
        .fontSize(10)
        .font('Helvetica')
        .text(
          `Generated on ${new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}`,
          0,
          pageHeight - 85,
          { align: 'center', width: pageWidth }
        );

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
