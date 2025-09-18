package com.project.cinema.movie.Services;

import com.google.zxing.*;
import com.google.zxing.client.j2se.BufferedImageLuminanceSource;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.common.HybridBinarizer;
import com.google.zxing.qrcode.QRCodeWriter;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Base64;

@Service
public class QRCodeService {

    public String generateQRCodeImage(String token, int width, int height) throws WriterException, IOException {
        QRCodeWriter qrCodeWriter = new QRCodeWriter();
        BitMatrix bitMatrix = qrCodeWriter.encode(token, BarcodeFormat.QR_CODE, width, height);

        ByteArrayOutputStream pngOutputStream = new ByteArrayOutputStream();
        MatrixToImageWriter.writeToStream(bitMatrix, "PNG", pngOutputStream);
        byte[] pngData = pngOutputStream.toByteArray();

        return Base64.getEncoder().encodeToString(pngData);
    }
    public byte[] generateQRCodeBytes(String text) throws WriterException {
        if (text == null || text.trim().isEmpty()) {
            throw new IllegalArgumentException("QR code text cannot be empty");
        }
        
        try {
            System.out.println("🔧 [QR-BYTES] Generating QR code bytes for: " + text);
            
            QRCodeWriter qrCodeWriter = new QRCodeWriter();
            BitMatrix bitMatrix = qrCodeWriter.encode(text, BarcodeFormat.QR_CODE, 200, 200);
            
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            MatrixToImageWriter.writeToStream(bitMatrix, "PNG", out);
            
            byte[] qrBytes = out.toByteArray();
            
            // Validate result
            if (qrBytes == null || qrBytes.length == 0) {
                throw new RuntimeException("Generated QR code bytes are empty");
            }
            
            System.out.println("✅ [QR-BYTES] Generated QR code bytes successfully (size: " + qrBytes.length + ")");
            return qrBytes;
            
        } catch (IOException e) {
            System.err.println("❌ [QR-BYTES] IOException generating QR code: " + e.getMessage());
            throw new RuntimeException("Failed to generate QR code bytes", e);
        } catch (WriterException e) {
            System.err.println("❌ [QR-BYTES] WriterException generating QR code: " + e.getMessage());
            throw e;
        } catch (Exception e) {
            System.err.println("❌ [QR-BYTES] Unexpected error generating QR code: " + e.getMessage());
            throw new RuntimeException("Unexpected error generating QR code", e);
        }
    }
    public String generateQRCodeBase64(String data) throws WriterException, IOException {
        if (data == null || data.isEmpty()) {
            throw new IllegalArgumentException("QR code text cannot be empty");
        }
        
        try {
            System.out.println("🔧 [QR] Generating QR code for: " + data);
            
            QRCodeWriter qrCodeWriter = new QRCodeWriter();
            BitMatrix bitMatrix = qrCodeWriter.encode(data, BarcodeFormat.QR_CODE, 200, 200);
            
            BufferedImage qrImage = MatrixToImageWriter.toBufferedImage(bitMatrix);
            ByteArrayOutputStream pngOutputStream = new ByteArrayOutputStream();
            ImageIO.write(qrImage, "PNG", pngOutputStream);
            byte[] pngData = pngOutputStream.toByteArray();
            
            String base64String = Base64.getEncoder().encodeToString(pngData);
            
            // Validate result
            if (base64String == null || base64String.length() < 100) {
                throw new RuntimeException("Generated base64 string is too short or null");
            }
            
            System.out.println("🔧 [QR] Generated base64 string length: " + base64String.length());
            System.out.println("🔧 [QR] First 50 chars: " + base64String.substring(0, Math.min(50, base64String.length())));
            
            return base64String;
        } catch (Exception e) {
            System.err.println("❌ [QR] Error generating QR code for text: " + data + " - " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
    
    public String generateQRCodeBase64(String data, int width, int height) throws WriterException, IOException {
        QRCodeWriter qrCodeWriter = new QRCodeWriter();
        BitMatrix bitMatrix = qrCodeWriter.encode(data, BarcodeFormat.QR_CODE, width, height);

        ByteArrayOutputStream pngOutputStream = new ByteArrayOutputStream();
        MatrixToImageWriter.writeToStream(bitMatrix, "PNG", pngOutputStream);
        byte[] pngData = pngOutputStream.toByteArray();

        return "data:image/png;base64," + Base64.getEncoder().encodeToString(pngData);
    }
    
    public String decodeQRCode(MultipartFile qrCodeImage) throws Exception {
        BufferedImage bufferedImage = ImageIO.read(qrCodeImage.getInputStream());
        BufferedImageLuminanceSource source = new BufferedImageLuminanceSource(bufferedImage);
        BinaryBitmap bitmap = new BinaryBitmap(new HybridBinarizer(source));

        Result result = new MultiFormatReader().decode(bitmap);
        return result.getText(); // Trả về token từ mã QR
    }
    
    /**
     * Test method để kiểm tra QR code generation hoạt động đúng
     */
    public boolean testQRCodeGeneration() {
        try {
            String testData = "TICKET_TEST_123";
            String base64Result = generateQRCodeBase64(testData);
            
            boolean isValid = base64Result != null && 
                            base64Result.length() > 100 && 
                            base64Result.matches("^[A-Za-z0-9+/]*={0,2}$");
            
            System.out.println("🧪 [QR TEST] QR code generation test: " + (isValid ? "✅ PASSED" : "❌ FAILED"));
            return isValid;
        } catch (Exception e) {
            System.err.println("🧪 [QR TEST] QR code generation test FAILED: " + e.getMessage());
            return false;
        }
    }
}
