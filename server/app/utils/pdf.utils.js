import PDFDocument from 'pdfkit';
import { uploadFileAndGetPublicUrl } from './file.utils.js';
import { PDF, STREAM_EVENTS } from './global.constants.js';

/**
 * @param {*} responseBody
 * @returns {Promise<string>}
 * @description Get the PDF download URL from the response body
 */
export const getPDFUrl = async (responseBody) => {
  const { header, body, filename } = responseBody;
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument();
      const buffers = [];

      doc.on(STREAM_EVENTS.DATA, buffers.push.bind(buffers));
      doc.on(STREAM_EVENTS.END, async () => {
        const pdfBuffer = Buffer.concat(buffers);

        try {
          const downloadUrl = await uploadFileAndGetPublicUrl({
            originalname: `${filename}.pdf`,
            buffer: pdfBuffer,
            mimetype: PDF.MIME_TYPE,
          });

          resolve(downloadUrl);
        } catch (uploadErr) {
          reject(uploadErr);
        }
      });

      doc.fontSize(PDF.FONT_SIZE.HEADER).text(header, {
        align: PDF.ALIGN.CENTER,
        underline: true,
      });

      doc.moveDown();
      doc.fontSize(PDF.FONT_SIZE.BODY).text(body, { align: PDF.ALIGN.LEFT });
      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};
