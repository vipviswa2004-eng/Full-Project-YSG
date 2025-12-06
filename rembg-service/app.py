from flask import Flask, request, send_file
from flask_cors import CORS
from rembg import remove
from PIL import Image
import io
import base64

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route('/remove-bg', methods=['POST'])
def remove_background():
    try:
        # Get image from request
        if 'image' not in request.files:
            return {'error': 'No image provided'}, 400
        
        file = request.files['image']
        
        # Read image
        input_image = Image.open(file.stream)
        
        # Remove background
        output_image = remove(input_image)
        
        # Convert to bytes
        img_io = io.BytesIO()
        output_image.save(img_io, 'PNG')
        img_io.seek(0)
        
        # Return as base64 or file
        if request.args.get('format') == 'base64':
            img_base64 = base64.b64encode(img_io.getvalue()).decode()
            return {'image': f'data:image/png;base64,{img_base64}'}
        else:
            return send_file(img_io, mimetype='image/png')
            
    except Exception as e:
        return {'error': str(e)}, 500

@app.route('/health', methods=['GET'])
def health():
    return {'status': 'ok', 'service': 'rembg-api'}

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
