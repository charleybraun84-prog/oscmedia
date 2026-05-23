import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables from .env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS and JSON parsing middlewares
app.use(cors());
app.use(express.json());

// Category-based high-quality Unsplash fallbacks
function getFallbackData(subject, lighting, angle, customNuances, message = 'API unavailable') {
  const sub = (subject || '').toLowerCase();
  let imageUrl = 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&q=80&w=800'; // Default camera lens
  
  if (sub.includes('worship') || sub.includes('sing') || sub.includes('music') || sub.includes('guitar')) {
    imageUrl = 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&q=80&w=800'; // Worship stage light
  } else if (sub.includes('baptis') || sub.includes('water') || sub.includes('immersion')) {
    imageUrl = 'https://images.unsplash.com/photo-1544427920-c49ccfb85579?auto=format&fit=crop&q=80&w=800'; // Stream/Water/Light
  } else if (sub.includes('lobby') || sub.includes('greet') || sub.includes('welcom') || sub.includes('coffee') || sub.includes('people') || sub.includes('family')) {
    imageUrl = 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&q=80&w=800'; // Smiling people gathering
  } else if (sub.includes('preach') || sub.includes('pastor') || sub.includes('teach') || sub.includes('speaker') || sub.includes('note') || sub.includes('app')) {
    imageUrl = 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&q=80&w=800'; // Stage speaker / podium
  }

  const generatedPrompt = `[DEMO FALLBACK - ${message}] A professional cinematography capture of ${subject || 'a church event'}. Styled with ${lighting || 'cinematic stage lighting'} and framed as a ${angle || 'medium shot portrait'}. Shot on a Nikon Z6 II with a Nikkor Z 24-70mm f/2.8 S lens, focal length at 50mm, f/2.8 aperture for shallow depth-of-field, creamy background bokeh, natural Nikon color science rendering, stage haze. ${customNuances ? 'Creative Nuances: ' + customNuances : ''}`;

  return {
    success: true,
    optimized_prompt: generatedPrompt,
    image_data: imageUrl,
    isFallback: true
  };
}

// Visual Composition Sandbox Generator Endpoint
app.post('/api/sandbox/generate', async (req, res) => {
  const { subject, lighting, angle, custom_nuances } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  // Perform basic input validation
  if (!subject || !lighting || !angle) {
    return res.status(400).json({
      success: false,
      error: 'Missing required parameters: subject, lighting, and angle are required.'
    });
  }

  // If API Key is missing, run in Demo/Fallback mode immediately
  if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY') {
    console.log('Gemini API key is not configured. Running endpoint in fallback demo mode.');
    return res.json(getFallbackData(subject, lighting, angle, custom_nuances, 'GEMINI_API_KEY not set'));
  }

  let optimizedPrompt = '';

  try {
    // 1. Ask Gemini to optimize the camera configuration prompt
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const systemPrompt = `You are an expert director of photography and cinematic prompt engineer for image generation models.
Your task is to take a camera composition configuration and optimize it into a highly detailed, professional cinematography prompt for Google Imagen.
The input configuration consists of:
- Subject: ${subject}
- Lighting: ${lighting}
- Angle & Framing: ${angle}
- Custom Creative Nuances: ${custom_nuances || 'None'}

Format the output prompt to describe a realistic, high-quality photograph or cinematic still. Include specific professional cinematography details matching these gear specifications:
- Camera Body: Nikon Z6 II (refer to this camera for sensor characteristics and details)
- Camera Lens: Nikkor Z 24-70mm f/2.8 S lens
- Focal Length & Aperture advice: Suggest specific focal lengths strictly between 24mm and 70mm, and apertures starting at f/2.8 (e.g. 70mm at f/2.8 for portraits, 24mm at f/5.6 for wide room shots)
- Depth-of-field descriptions (e.g., shallow depth of field, creamy background bokeh)
- Lighting details (e.g., volumetric lighting, soft rim light, stage haze, warm color temperatures)
- Composition rules (e.g., golden ratio, rule of thirds, clean framing)
- Quality and Color indicators (e.g., Nikon color science, sharp autofocus tracking, photorealistic, 8k resolution, raw photo format)

Ensure the output is ONLY the final optimized prompt text, ready to be sent to Imagen. Do not include any intro, outro, or markdown formatting.`;

    const geminiResponse = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: systemPrompt }]
        }]
      })
    });

    if (!geminiResponse.ok) {
      throw new Error(`Gemini prompt optimizer API failed with status ${geminiResponse.status}`);
    }

    const geminiData = await geminiResponse.json();
    if (geminiData.candidates && geminiData.candidates[0] && geminiData.candidates[0].content && geminiData.candidates[0].content.parts[0]) {
      optimizedPrompt = geminiData.candidates[0].content.parts[0].text.trim();
    } else {
      throw new Error('Invalid response structure returned by Gemini prompt optimizer');
    }

    console.log('Optimized Prompt:', optimizedPrompt);

    // 2. Call Google Imagen to generate the composition preview image
    // Try imagen-4.0-generate-001 first, and fall back to imagen-3.0-generate-002 if needed.
    const modelsToTry = [
      'imagen-4.0-generate-001',
      'imagen-3.0-generate-002'
    ];

    let base64Image = '';
    let lastError = null;

    for (const model of modelsToTry) {
      try {
        console.log(`Attempting reference image generation with model: ${model}`);
        const imagenUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateImages?key=${apiKey}`;
        const imagenResponse = await fetch(imagenUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: optimizedPrompt,
            numberOfImages: 1,
            outputMimeType: "image/jpeg",
            aspectRatio: "1:1"
          })
        });

        if (!imagenResponse.ok) {
          const errMsg = await imagenResponse.text();
          throw new Error(`Imagen model ${model} failed with status ${imagenResponse.status}: ${errMsg}`);
        }

        const imagenData = await imagenResponse.json();
        if (imagenData.generatedImages && imagenData.generatedImages[0] && imagenData.generatedImages[0].image && imagenData.generatedImages[0].image.imageBytes) {
          base64Image = imagenData.generatedImages[0].image.imageBytes;
          break; // Successfully generated, exit loop
        } else {
          throw new Error(`Invalid response structure returned by Imagen model ${model}`);
        }
      } catch (err) {
        console.warn(`Model ${model} failed: ${err.message}`);
        lastError = err;
      }
    }

    if (!base64Image) {
      throw lastError || new Error('Imagen generation failed for all models');
    }

    // Return the successful generation response
    return res.json({
      success: true,
      optimized_prompt: optimizedPrompt,
      image_data: `data:image/jpeg;base64,${base64Image}`,
      isFallback: false
    });

  } catch (err) {
    console.error('API Error during image generation:', err.message);
    // If Gemini succeeded but Imagen failed, we still want to output the optimized prompt with fallback image
    const promptToUse = optimizedPrompt || `A cinematic, high-quality preview of ${subject} using ${lighting} and shot at ${angle}.`;
    const fallbackResponse = getFallbackData(subject, lighting, angle, custom_nuances, `API Error: ${err.message}`);
    
    return res.json({
      ...fallbackResponse,
      optimized_prompt: `[FALLBACK MODE - API ERROR] ${promptToUse}`
    });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server is running on port ${PORT}`);
});
