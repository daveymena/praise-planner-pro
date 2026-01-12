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
      Analiza el siguiente texto y extrae los detalles técnicos para completar un formulario de música.

      TEXTO DE ENTRADA:
      "${textContext.substring(0, 8000).replace(/"/g, "'")}"

      REGLAS ESTRICTAS DE EXTRACCIÓN:
      1. Devuelve ESTRICTAMENTE JSON válido.
      2. LETRA (lyrics): Debe ser un STRING (texto) con la letra limpia y completa. ELIMINA cualquier acorde (ej: G, Am7, D...) que esté mezclado con el texto.
      3. ACORDES (chords): Debe ser un STRING (texto) con el cifrado musical. NO incluyas la letra en este campo, solo la estructura de los acordes.
      4. TIPO (type): Elige EXACTAMENTE UNO: "Alabanza", "Adoración", "Ministración", "Congregacional".
      5. TEMPO (tempo): Elige EXACTAMENTE UNO: "Rápido", "Moderado", "Lento".
      6. TONALIDAD (key): Una sola nota musical principal (ej: "G").
      7. DURACIÓN (duration_minutes): Solo número entero.
      8. Siempre prioriza la información del [TEXTO DE ENTRADA] sobre tu conocimiento interno.

      FORMATO JSON:
      {
        "name": "Título exacto",
        "type": "Selección única",
        "key": "Nota única",
        "tempo": "Selección única",
        "duration_minutes": 5,
        "youtube_url": "URL",
        "lyrics": "LA LETRA COMPLETA COMO TEXTO",
        "chords": "EL CIFRADO COMPLETO COMO TEXTO"
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
                    temperature: 0.1,       // Lower temperature for more consistency
                    repeat_penalty: 1.1,
                    num_ctx: 4096,          // Stable context window
                    num_predict: 2048       // Avoid truncated lyrics
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
