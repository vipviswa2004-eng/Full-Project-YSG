import React, { useEffect, useRef, useState } from 'react';
import { Upload, Type, Image as ImageIcon, Trash2, Download, Loader2, Palette } from 'lucide-react';

// Fabric.js is loaded via CDN in index.html
declare const fabric: any;

interface CustomDesignerProps {
    productImage: string;
    productName: string;
    onSaveDesign: (designData: any) => void;
}

export const CustomDesigner: React.FC<CustomDesignerProps> = ({ productImage, productName, onSaveDesign }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
    const [selectedObject, setSelectedObject] = useState<fabric.Object | null>(null);
    const [isRemovingBg, setIsRemovingBg] = useState(false);
    const [bgColor, setBgColor] = useState('#ffffff');
    const [textValue, setTextValue] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    // Initialize canvas
    useEffect(() => {
        if (!canvasRef.current) return;

        const fabricCanvas = new fabric.Canvas(canvasRef.current, {
            width: 600,
            height: 600,
            backgroundColor: '#f5f5f5',
        });

        // Load product template image
        fabric.Image.fromURL(productImage, (img: any) => {
            img.scaleToWidth(400);  // Reduced from 600 to 400
            img.scaleToHeight(400); // Reduced from 600 to 400
            img.set({
                left: 100,  // Center it with some offset
                top: 100,
            });
            img.selectable = false;
            img.evented = false;
            fabricCanvas.add(img);
            fabricCanvas.sendToBack(img);
        }, { crossOrigin: 'anonymous' });

        // Add watermark
        const watermark = new fabric.Text('PREVIEW - NOT FOR PRINT', {
            fontSize: 40,
            fill: 'rgba(255, 255, 255, 0.3)',
            fontWeight: 'bold',
            angle: -45,
            left: 200,
            top: 400,
            selectable: false,
            evented: false,
        });
        fabricCanvas.add(watermark);
        fabricCanvas.bringToFront(watermark);

        // Selection event
        fabricCanvas.on('selection:created', (e: any) => {
            setSelectedObject(e.selected?.[0] || null);
        });

        fabricCanvas.on('selection:updated', (e: any) => {
            setSelectedObject(e.selected?.[0] || null);
        });

        fabricCanvas.on('selection:cleared', () => {
            setSelectedObject(null);
        });

        setCanvas(fabricCanvas);

        return () => {
            fabricCanvas.dispose();
        };
    }, [productImage]);

    // Upload custom image (manual background removal only)
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !canvas) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            fabric.Image.fromURL(event.target?.result as string, (img: any) => {
                img.scaleToWidth(300);
                img.set({
                    left: 250,
                    top: 250,
                });
                canvas.add(img);
                canvas.setActiveObject(img);
                canvas.renderAll();
            }, { crossOrigin: 'anonymous' });
        };
        reader.readAsDataURL(file);
    };

    // Remove background
    const handleRemoveBackground = async () => {
        if (!selectedObject || selectedObject.type !== 'image' || !canvas) return;

        setIsRemovingBg(true);
        try {
            const imgElement = (selectedObject as fabric.Image).getElement() as HTMLImageElement;

            // Convert to blob
            const response = await fetch(imgElement.src);
            const blob = await response.blob();

            // Send to rembg service
            const formData = new FormData();
            formData.append('image', blob);

            const rembgResponse = await fetch('http://localhost:5001/remove-bg?format=base64', {
                method: 'POST',
                body: formData,
            });

            const data = await rembgResponse.json();

            // Replace image
            fabric.Image.fromURL(data.image, (newImg: any) => {
                newImg.set({
                    left: selectedObject.left,
                    top: selectedObject.top,
                    scaleX: selectedObject.scaleX,
                    scaleY: selectedObject.scaleY,
                    angle: selectedObject.angle,
                });
                canvas.remove(selectedObject);
                canvas.add(newImg);
                canvas.setActiveObject(newImg);
                canvas.renderAll();
            }, { crossOrigin: 'anonymous' });
        } catch (error) {
            console.error('Background removal failed:', error);
            alert('Background removal failed. Make sure rembg service is running on port 5001.');
        } finally {
            setIsRemovingBg(false);
        }
    };

    // Change background color
    const handleChangeBgColor = () => {
        if (!selectedObject || !canvas) return;

        const rect = new fabric.Rect({
            left: selectedObject.left,
            top: selectedObject.top,
            width: selectedObject.width! * selectedObject.scaleX!,
            height: selectedObject.height! * selectedObject.scaleY!,
            fill: bgColor,
        });

        const index = canvas.getObjects().indexOf(selectedObject);
        canvas.insertAt(rect, index, false);
        canvas.renderAll();
    };

    // Add text
    const handleAddText = () => {
        if (!canvas || !textValue) return;

        const text = new fabric.IText(textValue, {
            left: 100,
            top: 100,
            fontSize: 40,
            fill: '#000000',
            fontFamily: 'Arial',
        });

        canvas.add(text);
        canvas.setActiveObject(text);
        canvas.renderAll();
        setTextValue('');
    };

    // Delete selected object
    const handleDelete = () => {
        if (!selectedObject || !canvas) return;
        canvas.remove(selectedObject);
        canvas.renderAll();
    };

    // Generate preview (JSON ONLY - skip image generation to avoid hang)
    const handleGeneratePreview = () => {
        if (!canvas) return;

        setIsGenerating(true);

        try {
            // Export design JSON only (instant)
            const designJSON = canvas.toJSON();

            // Generate TINY preview for Cart thumbnail (100x100 @ 10% quality)
            // This is small enough to be instant and safe for cart display
            const previewDataURL = canvas.toDataURL({
                format: 'jpeg',
                quality: 0.1,
                multiplier: 0.17, // ~100x100 pixels
            });

            const designData = {
                json: designJSON,
                preview: previewDataURL, // Use tiny preview for cart
                productName,
            };

            console.log('Design saved (JSON only):', designData);
            onSaveDesign(designData);
            setIsGenerating(false);
        } catch (error) {
            console.error('Generation failed:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            alert(`Generation failed: ${errorMessage}`);
            setIsGenerating(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden">
            {/* Canvas */}
            <div className="lg:col-span-2 overflow-hidden">
                <div className="bg-white rounded-lg shadow-lg p-4 overflow-auto">
                    <div className="max-w-full overflow-auto">
                        <canvas ref={canvasRef} className="border border-gray-300 max-w-full h-auto" />
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="space-y-4">
                {/* Upload Image */}
                <div className="bg-white rounded-lg shadow p-4">
                    <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                        <ImageIcon className="w-5 h-5" />
                        Custom Image
                    </h3>
                    <label className="block">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                        />
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-primary hover:bg-purple-50 transition">
                            <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                            <p className="text-sm text-gray-600">Click to upload image</p>
                        </div>
                    </label>

                    {selectedObject?.type === 'image' && (
                        <div className="mt-4 space-y-2">
                            <button
                                onClick={handleRemoveBackground}
                                disabled={isRemovingBg}
                                className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isRemovingBg ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Removing...
                                    </>
                                ) : (
                                    'Remove Background'
                                )}
                            </button>

                            <div className="flex gap-2 items-center">
                                <input
                                    type="color"
                                    value={bgColor}
                                    onChange={(e) => setBgColor(e.target.value)}
                                    className="w-12 h-10 rounded cursor-pointer"
                                />
                                <button
                                    onClick={handleChangeBgColor}
                                    className="flex-1 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 flex items-center justify-center gap-2"
                                >
                                    <Palette className="w-4 h-4" />
                                    Add Background
                                </button>
                            </div>

                        </div>
                    )}
                </div>

                {/* Add Text */}
                <div className="bg-white rounded-lg shadow p-4">
                    <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                        <Type className="w-5 h-5" />
                        Custom Text
                    </h3>
                    <input
                        type="text"
                        value={textValue}
                        onChange={(e) => setTextValue(e.target.value)}
                        placeholder="Enter text..."
                        className="w-full border border-gray-300 rounded px-3 py-2 mb-2"
                    />
                    <button
                        onClick={handleAddText}
                        disabled={!textValue}
                        className="w-full bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 disabled:opacity-50"
                    >
                        Add Text
                    </button>
                </div>

                {/* Actions */}
                <div className="bg-white rounded-lg shadow p-4 space-y-2">
                    <button
                        onClick={handleDelete}
                        disabled={!selectedObject}
                        className="w-full bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        <Trash2 className="w-4 h-4" />
                        Delete Selected
                    </button>

                    <button
                        onClick={handleGeneratePreview}
                        disabled={isGenerating}
                        className="w-full bg-primary text-white px-4 py-2 rounded hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Download className="w-4 h-4" />
                                Save Design
                            </>
                        )}
                    </button>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-xs text-blue-800">
                        <strong>⚡ Instant Save:</strong> Your design is saved instantly.
                        Admin will generate the final HD image from your design.
                    </p>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-xs text-yellow-800">
                        <strong>Note:</strong> This is a low-quality preview with watermark.
                        Admin will receive HD quality without watermark for printing.
                    </p>
                </div>
            </div>
        </div>
    );
};
