const QRCode = require("qrcode");

class QRCodeService {
  async generateQRCode(content) {
    try {
      const qrCode = await QRCode.toDataURL(content);
      return qrCode.split(",")[1];
    } catch (error) {
      console.error("Error generating QR code:", error);
      throw new Error("Error generating QR code");
    }
  }
}

module.exports = new QRCodeService();
