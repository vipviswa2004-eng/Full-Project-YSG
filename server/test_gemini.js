const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function listModels() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  // There's no direct listModels in the client usually, but we can try to hit a known good one.
  // Or check the documentation version.
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  try {
    const result = await model.generateContent("hi");
    console.log("Success with gemini-1.5-flash");
  } catch (err) {
    console.log("Failed with gemini-1.5-flash:", err.message);
    
    try {
      const model2 = genAI.getGenerativeModel({ model: "gemini-pro" });
      const result2 = await model2.generateContent("hi");
      console.log("Success with gemini-pro");
    } catch (err2) {
      console.log("Failed with gemini-pro:", err2.message);
    }
  }
}
listModels();
