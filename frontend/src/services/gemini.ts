// import { GoogleGenAI } from "@google/genai";
// import { products } from '../data/products'; // Corrected relative path
// import { Shape } from '../types';

// const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY || 'YOUR_API_KEY_HERE' });

// // Create a rich string representation of the catalog for the AI
// const productCatalogContext = products.map(p => {
//     // Calculate approximate starting price for context
//     const shapeCost = [Shape.RECTANGLE, Shape.SQUARE, Shape.ROUND].includes(p.shape) ? 400 : 1000;
//     const baseTotal = p.pdfPrice + (p.shape === Shape.CUSTOM ? (p.customShapeCost || 0) : shapeCost);
//     const approxPrice = Math.round(baseTotal * 2 * 0.65); // Apply formula: (Base + Shape) * 2 * 0.65

//     let details = `ID: ${p.id}, Category: ${p.category}, Shape: ${p.shape}, Size: ${p.size || 'Standard'}, Price: ₹${approxPrice}, Image: ${p.image}`;

//     if (p.allowsExtraHeads) {
//         details += ` **NOTE: Extra persons cost ₹100/head.**`;
//     }

//     return `- ${p.name} (${details})`;
// }).join('\n');

// export const getGiftAdvice = async (userMessage: string, chatHistory: {role: string, text: string}[]) => {
//   try {
//     const model = 'gemini-2.5-flash';

//     // Construct the conversation history for the API
//     const historyContext = chatHistory.slice(-20).map(msg => 
//         `${msg.role === 'user' ? 'User' : 'Genie'}: ${msg.text}`
//     ).join('\n');

//     const systemInstruction = `You are the "Gift Genie" 🧞‍♂️ for Yathes Sign Galaxy.

//     **YOUR MISSION:**
//     Play a "Deep Discovery Game" to find the *perfect* personalized gift. Act like a best friend helping them shop.

//     **GAME RULES (Follow Strictly):**
//     1. **Ask ONE question at a time.** Do not overwhelm the user.
//     2. **Ask 5 to 12 questions** in total to build a detailed profile before making a recommendation.
//        - Q1: Who is it for? (Relationship)
//        - Q2: What is the specific occasion? (Event)
//        - Q3: What is their vibe/personality? (Sentimental, Funny, Classy?)
//        - Q4: Do you have a photo to use? (Yes/No)
//        - Q5: Do you want to add text/names? (Yes/No)
//        - Q6: Any specific colors they love?
//        - Q7: Do they prefer modern or traditional styles?
//        - Q8: What is your budget range?
//        - ... and so on until you are sure.
//     3. **Mandatory Options**: At the end of EVERY question, provide 3-4 clickable options.
//        Format: ||REPLIES||Option 1|Option 2|Option 3
//     4. **Recommendation Phase**: Only after gathering enough info (5+ turns), recommend 2-3 specific products.

//     **OUTPUT FORMAT FOR RECOMMENDATIONS:**
//     You MUST use this exact format for products so they appear as clickable cards:
//     [Product Name](/product/ID|Price|ImageURL)

//     *Example*:
//     "Based on that, I found the perfect match! 🎉
//     [3D Crystal Portrait](/product/1001|1430|https://picsum.photos/...)
//     [Wood Engraving Gift](/product/1074|1820|https://picsum.photos/...)"

//     **CATALOG:**
//     ${productCatalogContext}

//     **Current Chat:**
//     ${historyContext}

//     User: ${userMessage}
//     Genie:`;

//     const response = await ai.models.generateContent({
//       model: model,
//       contents: userMessage,
//       config: {
//         systemInstruction: systemInstruction,
//         temperature: 0.7, 
//         maxOutputTokens: 450,
//       }
//     });

//     return response.text;
//   } catch (error) {
//     console.error("Gemini Advisor Error:", error);
//     return "I'm having a little trouble connecting to the galaxy 🌌. Can you tell me that again? ||REPLIES||Retry|Check Shop|Contact Support";
//   }
// };

// export const generateProductDescription = async (name: string, category: string) => {
//   try {
//     const model = 'gemini-2.5-flash';
//     const prompt = `You are an expert copywriter for a premium personalized gift store called "Yathes Sign Galaxy".
//     Write a compelling, engaging, and detailed product description for:

//     Product Name: "${name}"
//     Category: "${category}"

//     Guidelines:
//     1. **Hook**: Start with an emotional hook about memories or gifting.
//     2. **Details**: Highlight that it is custom-made, high-quality, and unique. Mention the material quality if relevant (e.g., crystal clarity, premium wood).
//     3. **Occasion**: Suggest perfect occasions for this gift (Weddings, Birthdays, Anniversaries).
//     4. **Tone**: Warm, exciting, and professional. Use emojis to make it lively 🎁✨.
//     5. **Length**: Write a solid paragraph (approx 4-6 sentences).

//     Do not use quotation marks in the output.`;

//     const response = await ai.models.generateContent({
//       model: model,
//       contents: prompt,
//     });

//     return response.text;
//   } catch (error) {
//     console.error("Description Gen Error:", error);
//     return null;
//   }
// };

// export const generateProductImage = async (prompt: string, model: string = 'imagen-3.0-generate-001') => {
//   try {
//     // Logic to distinguish between Imagen (generateImages) and Gemini (generateContent)
//     if (model.includes('imagen')) {
//         const response = await ai.models.generateImages({
//             model: model,
//             prompt: prompt,
//             config: {
//                 numberOfImages: 1,
//                 aspectRatio: '1:1'
//             }
//         });

//         const b64 = response.generatedImages?.[0]?.image?.imageBytes;
//         if (b64) {
//             return `data:image/png;base64,${b64}`;
//         }
//     } else {
//         // Gemini Models (Nano/Pro for Image Gen)
//         const response = await ai.models.generateContent({
//             model: model,
//             contents: { parts: [{ text: prompt }] },
//             // Note: Gemini models output image in parts, standard responseSchema not used here for images
//         });

//         for (const part of response.candidates?.[0]?.content?.parts || []) {
//             if (part.inlineData) {
//                 return `data:image/png;base64,${part.inlineData.data}`;
//             }
//         }
//     }

//     throw new Error("No image generated");

//   } catch (error) {
//     console.error("Image Gen Error:", error);
//     return null; 
//   }
// };

// export const enhanceImageText = async (base64Image: string, prompt: string) => {
//     try {
//         const response = await ai.models.generateContent({
//             model: 'gemini-2.5-flash',
//             contents: {
//                 parts: [
//                     { inlineData: { mimeType: 'image/jpeg', data: base64Image.split(',')[1] } },
//                     { text: `Analyze this image and ${prompt}. Return a description of changes needed.` }
//                 ]
//             }
//         });
//         return response.text;
//     } catch (error) {
//         console.error("Enhancement Error", error);
//         return "Could not analyze image.";
//     }
// }

// // Helper to convert URL or Base64 to API compatible object
// const getImageInput = async (imageSrc: string) => {
//     let base64Data = '';
//     let mimeType = 'image/jpeg';

//     if (imageSrc.startsWith('data:')) {
//         const parts = imageSrc.split(',');
//         mimeType = parts[0].split(':')[1].split(';')[0];
//         base64Data = parts[1];
//     } else if (imageSrc.startsWith('http')) {
//         try {
//              // Use a proxy or assume CORS is handled for this demo, or fallback
//              const resp = await fetch(imageSrc);
//              const blob = await resp.blob();
//              mimeType = blob.type;
//              base64Data = await new Promise<string>((resolve) => {
//                  const reader = new FileReader();
//                  reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
//                  reader.readAsDataURL(blob);
//              });
//         } catch (e) {
//             console.warn("Could not fetch image:", e);
//             return null;
//         }
//     } else {
//         return null;
//     }
//     return { inlineData: { mimeType, data: base64Data } };
// };

// export const enhanceProductImage = async (imageSrc: string, model: string = 'gemini-2.5-flash-image') => {
//   try {
//     const imageData = await getImageInput(imageSrc);
//     if (!imageData) return null;

//     const response = await ai.models.generateContent({
//       model: model,
//       contents: {
//         parts: [
//           imageData,
//           { text: "Enhance this product image to make it look more professional, clearer, better lighting, and vibrant for an e-commerce listing. Return the enhanced image." }
//         ]
//       }
//     });

//     for (const part of response.candidates?.[0]?.content?.parts || []) {
//       if (part.inlineData) {
//         return `data:image/png;base64,${part.inlineData.data}`;
//       }
//     }
//     return null;
//   } catch (error) {
//     console.error("Enhancement Error:", error);
//     return null;
//   }
// };

// export const generateSwapPreview = async (productImageSrc: string, userFaceImageSrc: string) => {
//   try {
//       const productImg = await getImageInput(productImageSrc);
//       const userImg = await getImageInput(userFaceImageSrc);

//       if (!productImg || !userImg) return null;

//       const response = await ai.models.generateContent({
//         model: 'gemini-2.5-flash-image', // Use flash image for editing/merging
//         contents: {
//           parts: [
//             productImg, // First Image: Product Template
//             userImg,    // Second Image: User Photo
//             { text: `TASK: Generate a realistic product preview by inserting the USER PHOTO (second image) into the PRODUCT TEMPLATE (first image).

// RULES FOR REPLACEMENT:
// 1. **IDENTIFY THE CONTENT AREA**: Find where the portrait/person is currently located in the product template.
// 2. **REPLACE CONTENT**: Swap that specific person/face with the person from the USER PHOTO.
// 3. **PRESERVE PRODUCT STRUCTURE**: 
//    - DO NOT change the shape of the crystal, frame, or object.
//    - DO NOT change the background behind the product.
//    - DO NOT remove any product features (bevels, stands, lights).

// MATERIAL SIMULATION (Crucial):
// - **IF 3D CRYSTAL**: The user photo must look like a white, semi-transparent LASER ENGRAVING inside the glass. It should be monochrome (grayscale) and have a "ghostly" 3D effect. It must NOT look like a flat color photo pasted on top. Preserve the crystal's reflections and refractions *over* the face.
// - **IF WOOD ENGRAVING**: The user photo must look BURNED into the wood. Sepia/Dark Brown tones. Wood grain texture should be visible through the image.
// - **IF PRINTED MUG/PILLOW**: Apply the photo as a print, warping it to match the curvature of the object.

// Output ONLY the final composite image.` }
//           ]
//         }
//       });

//       for (const part of response.candidates?.[0]?.content?.parts || []) {
//         if (part.inlineData) {
//           return `data:image/png;base64,${part.inlineData.data}`;
//         }
//       }
//       return null;
//   } catch (error) {
//       console.error("Swap Preview Error:", error);
//       return null;
//   }
// };












import { GoogleGenAI } from "@google/genai";
import { products } from '../data/products';
import { Shape } from '../types';

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

// Create a rich string representation of the catalog for the AI
const productCatalogContext = products.map(p => {
  // Calculate approximate starting price for context
  const shapeCost = [Shape.RECTANGLE, Shape.SQUARE, Shape.ROUND].includes(p.shape) ? 400 : 1000;
  const baseTotal = p.pdfPrice + (p.shape === Shape.CUSTOM ? (p.customShapeCost || 0) : shapeCost);
  const approxPrice = Math.round(baseTotal * 2 * 0.65); // Apply formula: (Base + Shape) * 2 * 0.65

  let details = `ID: ${p.id}, Category: ${p.category}, Shape: ${p.shape}, Size: ${p.size || 'Standard'}, Price: ₹${approxPrice}, Image: ${p.image}`;

  if (p.allowsExtraHeads) {
    details += ` **NOTE: Extra persons cost ₹100/head.**`;
  }

  return `- ${p.name} (${details})`;
}).join('\n');

export const getGiftAdvice = async (userMessage: string, chatHistory: { role: string, text: string }[]) => {
  try {
    const model = 'gemini-2.5-flash';

    // Construct the conversation history for the API
    const historyContext = chatHistory.slice(-20).map(msg =>
      `${msg.role === 'user' ? 'User' : 'Genie'}: ${msg.text}`
    ).join('\n');

    const systemInstruction = `You are the "Gift Genie" 🧞‍♂️ for Sign Galaxy.
    
    **YOUR MISSION:**
    Help the user find the perfect personalized gift from our catalog based on their answers.
    
    **CATALOG:**
    ${productCatalogContext}
    
    **LOGIC:**
    1. **Discovery**: If you don't know the recipient/occasion/budget, ask 1 question at a time.
    2. **Recommendation**: When you have enough info, recommend 2-3 specific products from the CATALOG that match their needs.
    
    **CRITICAL - PRODUCT CARD FORMAT:**
    When suggesting a product, you **MUST** use this exact markdown format so it displays as a card:
    
    [Product Name](/product/ID|Price|ImageURL)
    
    *Example*:
    "I recommend the 3D Crystal!
    [3D Crystal Portrait](/product/1001|1430|https://picsum.photos/...)"
    
    **REPLY OPTIONS:**
    End every message with 2-4 options:
    Format: ||REPLIES||Option 1|Option 2|Option 3
    
    **TONE:**
    Helpful, enthusiastic, and concise. Use emojis 🎁.

    **Current Chat:**
    ${historyContext}
    
    User: ${userMessage}
    Genie:`;

    const response = await ai.models.generateContent({
      model: model,
      contents: userMessage,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
        maxOutputTokens: 600,
      }
    });

    return response.text;
  } catch (error) {
    console.error("Gemini Advisor Error:", error);
    return "I'm having a little trouble connecting to the galaxy 🌌. Can you tell me that again? ||REPLIES||Retry|Check Shop|Contact Support";
  }
};

export const generateProductDescription = async (name: string, category: string) => {
  try {
    const model = 'gemini-2.5-flash';
    const prompt = `You are an expert copywriter for a premium personalized gift store called "Sign Galaxy".
    Write a compelling, engaging, and detailed product description for:
    
    Product Name: "${name}"
    Category: "${category}"

    Guidelines:
    1. **Hook**: Start with an emotional hook about memories or gifting.
    2. **Details**: Highlight that it is custom-made, high-quality, and unique. Mention the material quality if relevant (e.g., crystal clarity, premium wood).
    3. **Occasion**: Suggest perfect occasions for this gift (Weddings, Birthdays, Anniversaries).
    4. **Tone**: Warm, exciting, and professional. Use emojis to make it lively 🎁✨.
    5. **Length**: Write a solid paragraph (approx 4-6 sentences).
    
    Do not use quotation marks in the output.`;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });

    return response.text;
  } catch (error) {
    console.error("Description Gen Error:", error);
    return null;
  }
};

export const generateProductImage = async (prompt: string, model: string = 'imagen-3.0-generate-001') => {
  try {
    // Logic to distinguish between Imagen (generateImages) and Gemini (generateContent)
    if (model.includes('imagen')) {
      const response = await ai.models.generateImages({
        model: model,
        prompt: prompt,
        config: {
          numberOfImages: 1,
          aspectRatio: '1:1'
        }
      });

      const b64 = response.generatedImages?.[0]?.image?.imageBytes;
      if (b64) {
        return `data:image/png;base64,${b64}`;
      }
    } else {
      // Gemini Models (Nano/Pro for Image Gen)
      const response = await ai.models.generateContent({
        model: model,
        contents: { parts: [{ text: prompt }] },
        // Note: Gemini models output image in parts, standard responseSchema not used here for images
      });

      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }

    throw new Error("No image generated");

  } catch (error) {
    console.error("Image Gen Error:", error);
    return null;
  }
};

export const enhanceImageText = async (base64Image: string, prompt: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: base64Image.split(',')[1] } },
          { text: `Analyze this image and ${prompt}. Return a description of changes needed.` }
        ]
      }
    });
    return response.text;
  } catch (error) {
    console.error("Enhancement Error", error);
    return "Could not analyze image.";
  }
}

// Helper to convert URL or Base64 to API compatible object
const getImageInput = async (imageSrc: string) => {
  let base64Data = '';
  let mimeType = 'image/jpeg';

  if (imageSrc.startsWith('data:')) {
    const parts = imageSrc.split(',');
    mimeType = parts[0].split(':')[1].split(';')[0];
    base64Data = parts[1];
  } else if (imageSrc.startsWith('http')) {
    try {
      // Use a proxy or assume CORS is handled for this demo, or fallback
      const resp = await fetch(imageSrc);
      const blob = await resp.blob();
      mimeType = blob.type;
      base64Data = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
        reader.readAsDataURL(blob);
      });
    } catch (e) {
      console.warn("Could not fetch image:", e);
      return null;
    }
  } else {
    return null;
  }
  return { inlineData: { mimeType, data: base64Data } };
};

export const enhanceProductImage = async (imageSrc: string, model: string = 'gemini-2.5-flash-image') => {
  try {
    const imageData = await getImageInput(imageSrc);
    if (!imageData) return null;

    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          imageData,
          { text: "Enhance this product image to make it look more professional, clearer, better lighting, and vibrant for an e-commerce listing. Return the enhanced image." }
        ]
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Enhancement Error:", error);
    return null;
  }
};

export const generateSwapPreview = async (productImageSrc: string, userFaceImageSrc: string) => {
  try {
    const productImg = await getImageInput(productImageSrc);
    const userImg = await getImageInput(userFaceImageSrc);

    if (!productImg || !userImg) return null;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image', // Use flash image for editing/merging
      contents: {
        parts: [
          productImg, // First Image: Product Template
          userImg,    // Second Image: User Photo
          {
            text: `TASK: Generate a realistic product preview by inserting the USER PHOTO (second image) into the PRODUCT TEMPLATE (first image).

RULES FOR REPLACEMENT:
1. **IDENTIFY THE CONTENT AREA**: Find where the portrait/person is currently located in the product template.
2. **REPLACE CONTENT**: Swap that specific person/face with the person from the USER PHOTO.
3. **PRESERVE PRODUCT STRUCTURE**: 
   - DO NOT change the shape of the crystal, frame, or object.
   - DO NOT change the background behind the product.
   - DO NOT remove any product features (bevels, stands, lights).

MATERIAL SIMULATION (Crucial):
- **IF 3D CRYSTAL**: The user photo must look like a white, semi-transparent LASER ENGRAVING inside the glass. It should be monochrome (grayscale) and have a "ghostly" 3D effect. It must NOT look like a flat color photo pasted on top. Preserve the crystal's reflections and refractions *over* the face.
- **IF WOOD ENGRAVING**: The user photo must look BURNED into the wood. Sepia/Dark Brown tones. Wood grain texture should be visible through the image.
- **IF PRINTED MUG/PILLOW**: Apply the photo as a print, warping it to match the curvature of the object.

Output ONLY the final composite image.` }
        ]
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
  } catch (error) {
    console.error("Swap Preview Error:", error);
    return null;
  }
};

export const verifyPaymentAmount = async (imageSrc: string, expectedAmount: number) => {
  try {
    const imageData = await getImageInput(imageSrc);
    if (!imageData) return { verified: false, extractedAmount: 0, message: "Could not read image" };

    const prompt = `Review this payment screenshot. 
    1. Identify the total amount paid/transferred. Look for valid currency formats (e.g., ₹1,499, 1499.00). 
    2. Compare it with the expected amount: ${expectedAmount}.
    3. CHECK PAYEE NAME: Look for the recipient name "YATHES SIGN GALAXY".
    
    4. JSON Output strictly: { "verified": boolean, "extractedAmount": number, "extractedPayee": string, "message": "reasoning" }
    
    Rule: verified is true ONLY if:
    a) The extracted amount exactly matches ${expectedAmount} (allow minor formatting differences like .00).
    AND
    b) The payee name explicitly contains "YATHES SIGN GALAXY" (case-insensitive is okay, but partial matches like "Sign Galaxy" are NOT allowed).`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          imageData,
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: 'application/json'
      }
    });

    // Access text property directly as it is a getter
    const responseText = response.text;
    const result = JSON.parse(responseText || '{}');
    return result;

  } catch (error) {
    console.error("Payment Verification Error:", error);
    return { verified: false, extractedAmount: 0, message: "AI Analysis failed" };
  }
};