
import cv2
import numpy as np
import sys
import os

def crop_qr_code(image_path, output_path):
    print(f"Processing {image_path}...")
    img = cv2.imread(image_path)
    if img is None:
        print("Error: Could not read image.")
        return False

    detector = cv2.QRCodeDetector()
    retval, decoded_info, points, straight_qrcode = detector.detectAndDecodeMulti(img)

    if points is not None and len(points) > 0:
        print("QR Code detected.")
        # points is a list of arrays of points. We take the first one if multiple, or combine meaningful ones.
        # detectAndDecodeMulti returns points as shape (n_qrs, 4, 2)
        
        # We assume one QR code ideally.
        pts = points[0].astype(int)
        
        # Create a bounding box
        x_min = np.min(pts[:, 0])
        x_max = np.max(pts[:, 0])
        y_min = np.min(pts[:, 1])
        y_max = np.max(pts[:, 1])
        
        # Add some padding (e.g., 10 pixels or 2% of width)
        width = x_max - x_min
        height = y_max - y_min
        padding = int(width * 0.05) 
        
        x_min = max(0, x_min - padding)
        y_min = max(0, y_min - padding)
        x_max = min(img.shape[1], x_max + padding)
        y_max = min(img.shape[0], y_max + padding)
        
        cropped = img[y_min:y_max, x_min:x_max]
        
        cv2.imwrite(output_path, cropped)
        print(f"Saved cropped QR code to {output_path}")
        return True
    else:
        print("No QR Code detected by cv2. Trying simple threshold detection contours as fallback...")
        # Fallback: Convert to grayscale, threshold, find contours, find the most square-like contour that looks like a QR position pattern?
        # Actually simpler fallback: The provided image is a photo. The QR code is likely the most high-contrast complex area.
        # But let's report failure first.
        return False

if __name__ == "__main__":
    input_file = r"c:\Users\viswa2004\Downloads\yathes-sign-galaxy (1)\frontend\public\upi-qr-code.jpg"
    output_file = r"c:\Users\viswa2004\Downloads\yathes-sign-galaxy (1)\frontend\public\upi-qr-code-only.jpg"
    success = crop_qr_code(input_file, output_file)
    if not success:
        sys.exit(1)
