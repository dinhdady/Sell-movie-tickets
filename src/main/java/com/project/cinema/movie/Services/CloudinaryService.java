package com.project.cinema.movie.Services;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

 @Service
public class CloudinaryService {
    @Autowired
    private Cloudinary cloudinary;
    private static final Logger logger = LoggerFactory.getLogger(CloudinaryService.class);
    public static boolean isImageFile(MultipartFile file) {
        List<String> IMAGE_EXTENSIONS = Arrays.asList("jpg", "jpeg", "png", "gif", "bmp", "ico", "tiff", "webp");
        if (file == null || file.isEmpty()) {
            return false; // Not a valid file
        }

        String fileName = file.getOriginalFilename();
        if (fileName == null) {
            return false;
        }
        
        int lastDotIndex = fileName.lastIndexOf('.');

        if (lastDotIndex == -1 || lastDotIndex == fileName.length() - 1) {
            return false; // No file extension
        }

        String fileExtension = fileName.substring(lastDotIndex + 1).toLowerCase();
        return IMAGE_EXTENSIONS.contains(fileExtension);
    }
    public String storedFile(MultipartFile file){
        Map<String, Object> options = ObjectUtils.asMap(
                "folder", "Cinema", // Thư mục (collection) trên Cloudinary
                "public_id", UUID.randomUUID().toString().substring(0, 10),
                "overwrite", true // Ghi đè nếu file đã tồn tại
        );

            if (file.isEmpty()) {
                return "";
            }
            if (!isImageFile(file)) {
                throw new RuntimeException("You can only upload image file!");
            }
            float fileSizeCheck = file.getSize() / 1_000_000_0f;
            if (fileSizeCheck > 5.0f) {
                throw new RuntimeException("File size uploads must be <= 5mb");
            }
        Map uploadResult = null;
        try {
            uploadResult = cloudinary.uploader().upload(file.getBytes(), options);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
        return (String) uploadResult.get("url");
    }
    public static String extractPublicIdFromUrl(String imageUrl) {
        // Regular expression to match Cloudinary URLs with optional folder paths
        // (https?://res\.cloudinary\.com/[\w-]+/[\w-]+/[\w-]+/[\w-]+)?
        Pattern pattern = Pattern.compile("https?://res\\.cloudinary\\.com/([\\w-]+)/([\\w-]+/)*([^/]+)\\.(.*)");
        Matcher matcher = pattern.matcher(imageUrl);

        if (matcher.find()) {
            return matcher.group(3); // Group 3 captures the public ID
        }

        return null; // Not a valid Cloudinary URL
    }
    public void deleteImage(String imageUrl) throws IOException {
        String publicId = extractPublicIdFromUrl(imageUrl);
        if (publicId != null) {
            cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
        } else {
            // Handle invalid URL case
        }
    }

    /**
     * Upload QR code byte array to Cloudinary
     * @param qrCodeBytes QR code as byte array
     * @param publicId Public ID for the QR code
     * @return Cloudinary URL of the uploaded QR code
     */
    public String uploadQRCode(byte[] qrCodeBytes, String publicId) {
        try {
            Map<String, Object> options = ObjectUtils.asMap(
                "folder", "Cinema/QR Codes", // Thư mục riêng cho QR codes
                "public_id", publicId,
                "overwrite", true,
                "resource_type", "image",
                "format", "png"
            );

            Map uploadResult = cloudinary.uploader().upload(qrCodeBytes, options);
            String qrCodeUrl = (String) uploadResult.get("url");
            
            return qrCodeUrl;
            
        } catch (IOException e) {
            logger.error("[CloudinaryService] Error uploading QR code: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to upload QR code to Cloudinary", e);
        }
    }
}
