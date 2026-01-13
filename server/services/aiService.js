import axios from 'axios';

class AiService {
    get baseUrl() {
        return process.env.OLLAMA_URL;
    }

    get defaultModel() {
        return process.env.OLLAMA_MODEL || 'llama3.2:3b';
    }

    async getBestAvailableModel() {
        if (!this.baseUrl) return this.defaultModel;

        try {
            console.log('🔎 Checking available Ollama models...');
            const { data } = await axios.get(`${this.baseUrl}/api/tags`);
            const availableModels = data.models.map(m => m.name); // e.g. ["llama3.2:3b", "gemma2:2b"]

            console.log('📋 Available models:', availableModels);

            // Priority List based on User's available models (Fastest first)
            const preferredModels = [
                'qwen2.5:3b',   // Best instruction following / Fast (1.9GB)
                'gemma2:2b',    // Good balance (1.6GB)
                'llama3.2:3b',  // Stable (2.0GB)
                'llama3.2:1b'   // Ultra fast but "too smart" with formatting (1.3GB)
            ];

            console.log('📋 Available models on server:', availableModels);

            // Find the first matching model from our preference list
            for (const preferred of preferredModels) {
                const match = availableModels.find(m => m.includes(preferred));
                if (match) {
                    console.log(`✅ Selected optimal model: ${match}`);
                    return match;
                }
            }

            // Fallback: Use the first available model if none of the preferred ones match
            if (availableModels.length > 0) {
                const firstModel = availableModels[0];
                console.log(`⚠️ No preferred models found. Fail-safe to: ${firstModel}`);
                return firstModel;
            }

        } catch (error) {
            console.warn('⚠️ Could not check available models (might be offline or auth issue). Using default configuration.');
            console.warn(error.message);
        }

        return this.defaultModel; // Fallback to config default if check fails
    }

    async extractSongData(textContext) {
        if (!this.baseUrl) {
            throw new Error('OLLAMA_URL environment variable is not set');
        }

        // Dynamically select model
        const selectedModel = await this.getBestAvailableModel();

        const prompt = `
      Eres un experto en música cristiana contemporánea (Worship). Tu trabajo es extraer y organizar información de canciones.

      TEXTO DE ENTRADA (puede contener letras, acordes, o ambos):
      "${textContext.substring(0, 15000).replace(/"/g, "'")}"

      INSTRUCCIONES CRÍTICAS:

      1. **LETRA (lyrics)**: 
         - Debe contener SOLO el texto cantado, SIN acordes intercalados
         - Estructura completa: Intro, Verso 1, Verso 2, Coro, Puente, Final, etc.
         - Formato limpio con saltos de línea entre secciones
         - NO incluyas símbolos como [Am], {C}, (Dm) - esos van en "chords"
         - Si la letra está incompleta en el contexto, COMPLÉTALA con tu conocimiento
         - NO uses "..." ni cortes - letra COMPLETA

      2. **ACORDES (chords)**:
         - Estructura de acordes separada del texto
         - Formato: "Intro: G C Em D\\nVerso: G D Em C\\n..."
         - Solo la progresión, sin letras intercaladas

      3. **YOUTUBE**: 
         - Si encuentras "[REFERENCIA VIDEO YOUTUBE]: URL", úsala exactamente
         - Si no hay URL en el contexto, genera la más popular de YouTube

      4. **TONALIDAD (key)**: Detecta la tonalidad principal (ej: "G", "Am", "D#")

      5. **TIPO**: Solo estas opciones: "Alabanza", "Adoración", "Ministración", "Congregacional"

      FORMATO JSON (OBLIGATORIO):
      {
        "name": "Título de la Canción",
        "type": "Adoración",
        "key": "G",
        "youtube_url": "https://www.youtube.com/watch?v=...",
        "lyrics": "Intro\\n\\nVerso 1:\\nAquí estás te veo moverse...\\n\\nCoro:\\nMilagroso abres caminos...",
        "chords": "Intro: G C Em D\\nVerso: G D Em C\\nCoro: C G D Em"
      }
    `;

        try {
            console.log(`🤖 Sending request to Ollama (${selectedModel})...`);

            const response = await axios.post(`${this.baseUrl}/api/generate`, {
                model: selectedModel,
                prompt: prompt,
                stream: false,
                format: "json",
                options: {
                    temperature: 0.2,       // Low for consistency
                    num_ctx: 12288,         // Large context for full content
                    num_predict: 5120,      // Enough tokens for complete lyrics
                    top_k: 40,
                    repeat_penalty: 1.1,
                    stop: ["</s>"]
                }
            });

            const jsonResponse = response.data.response;

            try {
                return JSON.parse(jsonResponse);
            } catch (parseError) {
                console.error('Failed to parse AI JSON:', jsonResponse);
                // Attempt to clean markdown if present (e.g. ```json ... ```)
                const cleanJson = jsonResponse.replace(/```json/g, '').replace(/```/g, '').trim();
                return JSON.parse(cleanJson);
            }

        } catch (error) {
            console.error('❌ AI Service Error:', error.message);
            if (error.response) {
                console.error('Response Data:', error.response.data);
            }
            throw new Error('Failed to process song data with AI');
        }
    }
}

export const aiService = new AiService();
