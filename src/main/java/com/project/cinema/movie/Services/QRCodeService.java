package com.project.cinema.movie.Services;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.google.zxing.qrcode.decoder.ErrorCorrectionLevel;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@Service
public class QRCodeService {

    @Autowired
    private CloudinaryService cloudinaryService;

    /**
     * Generate QR code and upload to Cloudinary
     * @param data The data to encode in QR code
     * @return Cloudinary URL of the QR code image
     */
    public String generateQRCodeUrl(String data) {
        try {
            // Generate QR code
            byte[] qrCodeBytes = generateQRCodeBytes(data);
            
            // Upload to Cloudinary
            String qrCodeUrl = cloudinaryService.uploadQRCode(qrCodeBytes, "qr_" + System.currentTimeMillis());
            
            return qrCodeUrl;
            
        } catch (Exception e) {
            System.err.println("[QRCodeService] Error generating QR code: " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }

    /**
     * Generate QR code as byte array
     * @param data The data to encode
     * @return QR code as byte array
     */
    private byte[] generateQRCodeBytes(String data) throws WriterException, IOException {
        QRCodeWriter qrCodeWriter = new QRCodeWriter();
        
        // QR code configuration
        Map<EncodeHintType, Object> hints = new HashMap<>();
        hints.put(EncodeHintType.ERROR_CORRECTION, ErrorCorrectionLevel.L);
        hints.put(EncodeHintType.MARGIN, 0);
        hints.put(EncodeHintType.CHARACTER_SET, "UTF-8");
        
        // Generate QR code matrix
        BitMatrix bitMatrix = qrCodeWriter.encode(data, BarcodeFormat.QR_CODE, 200, 200, hints);
        
        // Convert to byte array
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        MatrixToImageWriter.writeToStream(bitMatrix, "PNG", outputStream);
        
        return outputStream.toByteArray();
    }

    /**
     * Generate QR code for ticket
     * @param ticketId Ticket ID
     * @param token Ticket token
     * @return Cloudinary URL of the QR code
     */
    public String generateTicketQRCode(Long ticketId, String token) {
        String qrData = "TICKET_" + token;
        return generateQRCodeUrl(qrData);
    }
}