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
                'llama3.2:1b',  // Ultra fast (1.3GB)
                'gemma2:2b',    // Fast (1.6GB)
                'qwen2.5:3b',   // Good Balance (1.9GB)
                'llama3.2:3b'   // Original default
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
      Eres un experto en música cristiana y alabanza profesional.
      Analiza el siguiente texto (que puede ser letra, acordes o información de una canción) y extrae los detalles técnicos para completar un formulario.

      TEXTO DE ENTRADA:
      "${textContext.substring(0, 8000).replace(/"/g, "'")}"
      REGLAS CRUCIALES:
      1. Devuelve ESTRICTAMENTE JSON válido.
      2. Extrae la LETRA COMPLETA (FULL LYRICS). No resumas, no cortes. Captura cada estrofa y coro.
      3. Extrae todos los ACORDES (FULL CHORDS) si están presentes, preservando el cifrado.
      4. Si hay acordes sobre la letra en el texto original, intenta separarlos: pon la letra limpia en "lyrics" y una versión funcional de los acordes en "chords".
      5. "type" debe ser uno de: "Alabanza", "Adoración", "Ministración", "Congregacional".
      6. "tempo" debe ser uno de: "Rápido", "Moderado", "Lento".
      7. No inventes información, pero deduce Tono y Tempo si el texto lo permite.

      FORMATO JSON DE SALIDA:
      {
        "name": "Título de la canción",
        "type": "Alabanza | Adoración | Ministración | Congregacional",
        "key": "Tono (ej: E, G, Am)",
        "tempo": "Rápido | Moderado | Lento",
        "duration_minutes": 5,
        "youtube_url": "https://www.youtube.com/watch?v=...",
        "lyrics": "LA LETRA COMPLETA AQUÍ (SIN RECLORTES)",
        "chords": "LITERALMENTE TODOS LOS ACORDES O CIFRADO AQUÍ"
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
                    temperature: 0.3,       // Higher temp to avoid 1-word loops
                    repeat_penalty: 1.2,    // Strong penalty for repetition (fixes "Tranquilo, tranquilo...")
                    num_ctx: 4096           // Ensure enough context window
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
