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
      Eres un experto en música cristiana contemporánea (Worship). Analiza el texto y extrae la información técnica.

      TEXTO DE ENTRADA:
      "${textContext.substring(0, 8000).replace(/"/g, "'")}"

      REGLAS DE ORO (SÍGUELAS ESTRICTAMENTE):
      1. Devuelve SOLO JSON puro.
      2. NOMBRE (name): Título oficial (ej: "Reckless Love"). No agregues prefijos como "The overwhelmed...".
      3. TIPO (type): Clasificación obligatoria (Alabanza, Adoración, Ministración o Congregacional).
      4. TONALIDAD (key): Detecta la tonalidad exacta (ej: "G", "A#m", "Eb"). USA FORMATO AMERICANO. Esta es la parte más importante.
      5. LETRA (lyrics): Sin acordes, bien formateada por versos y coros.
      6. ACORDES (chords): Estructura pura de acordes por secciones.
      7. Si no encuentras una URL de YouTube en el texto, usa tu conocimiento para poner la del video oficial más popular.

      FORMATO DE RESPUESTA:
      {
        "name": "Título Corto Oficial",
        "type": "Clasificación",
        "key": "Nota (ej: D#m)",
        "youtube_url": "https://youtube.com/watch?v=...",
        "lyrics": "Letra limpia...",
        "chords": "Acordes puros..."
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
                    temperature: 0.2,       // Low temperature for consistency
                    top_p: 0.9,            // Nucleus sampling for quality
                    top_k: 40,             // Limit token selection
                    repeat_penalty: 1.2,   // Avoid repetition
                    num_ctx: 8192,         // Large context for full lyrics
                    num_predict: 3072,     // Allow longer responses for complete lyrics
                    stop: ["</s>", "USER:", "ASSISTANT:"] // Stop tokens
                },
                timeout: 300000 // 5 minutes timeout
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
