import axios from 'axios';

class AiService {
    constructor() {
        this.availableModelsCache = null;
        this.lastCheckTime = 0;
        this.CACHE_DURATION = 1000 * 60 * 60; // 1 hour
    }

    get baseUrl() {
        return process.env.OLLAMA_URL;
    }

    get defaultModel() {
        return process.env.OLLAMA_MODEL || 'llama3.2:3b';
    }

    async getBestAvailableModel() {
        if (!this.baseUrl) return this.defaultModel;

        const now = Date.now();
        if (this.availableModelsCache && (now - this.lastCheckTime < this.CACHE_DURATION)) {
            return this.availableModelsCache;
        }

        try {
            // First check if a specific model is forced via env
            if (process.env.OLLAMA_MODEL) {
                console.log(`🎯 Using forced model from ENV: ${process.env.OLLAMA_MODEL}`);
                this.availableModelsCache = process.env.OLLAMA_MODEL;
                this.lastCheckTime = now;
                return process.env.OLLAMA_MODEL;
            }

            console.log('🔎 Checking available Ollama models (Remote Easypanel)...');
            const { data } = await axios.get(`${this.baseUrl}/api/tags`, { timeout: 3000 });
            const availableModels = data.models.map(m => m.name);

            const preferredModels = [
                'qwen2.5:3b',
                'gemma2:2b',
                'llama3.2:3b',
                'llama3.2:1b'
            ];

            for (const preferred of preferredModels) {
                const match = availableModels.find(m => m.includes(preferred));
                if (match) {
                    this.availableModelsCache = match;
                    this.lastCheckTime = now;
                    return match;
                }
            }

            if (availableModels.length > 0) {
                this.availableModelsCache = availableModels[0];
                this.lastCheckTime = now;
                return availableModels[0];
            }
        } catch (error) {
            console.warn('⚠️ Could not check available models remotely. Using default.');
        }

        return this.defaultModel;
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
         - Debe contener la letra COMPLETA de la canción, sin cortes.
         - NO USES "..." ni resúmenes. Si el texto de entrada está incompleto, USA TU CONOCIMIENTO para completarla.
         - SOLO el texto cantado, SIN acordes intercalados (Ej: NO pongas "Do Mi corazón", pon solo "Mi corazón").
         - Estructura limpia: [INTRO], [VERSO 1], [CORO], [VERSO 2], [PUENTE], [FINAL], etc.
         - Formato con saltos de línea entre secciones.

      2. **ACORDES (chords)**:
         - Estructura de acordes separada del texto.
         - USA NOTACIÓN AMERICANA (A, B, C, D, E, F, G) SIEMPRE.
         - Formato: "Intro: G C Em D\\nVerso: G D Em C\\nCoro: C G D Em"
         - Solo la progresión, sin letras intercaladas.

      3. **COMPLETITUD**: 
         - Si el texto de entrada solo tiene una estrofa, DEBES BUSCAR en tu base de datos la letra completa.
         - Asegúrate de incluir todos los puentes y repeticiones de coros.
         - El usuario espera una canción lista para imprimir/proyectar.

      4. **TONALIDAD (key)**: Detecta la tonalidad principal (ej: "G", "Am", "D#").

      5. **TIPO**: Solo estas opciones: "Alabanza", "Adoración", "Ministración", "Congregacional".

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
            console.log(`🤖 Sending request to Ollama (${selectedModel}) on Easypanel...`);

            const response = await axios.post(`${this.baseUrl}/api/generate`, {
                model: selectedModel,
                prompt: prompt,
                stream: false,
                format: "json",
                options: {
                    temperature: 0.2,       // Low for consistency
                    num_ctx: 4096,          // Reduced to speed up processing (lyrics fit easily)
                    num_predict: 2048,      // Enough tokens for complete lyrics
                    top_k: 40,
                    repeat_penalty: 1.1,
                    stop: ["</s>"]
                }
            }, {
                timeout: 120000 // 2 minutes timeout for remote AI on Easypanel
            });

            const jsonResponse = response.data.response;
            console.log('🤖 Raw AI Response Received (first 100 chars):', jsonResponse.substring(0, 100));

            try {
                // Try direct parse first
                return JSON.parse(jsonResponse);
            } catch (parseError) {
                console.warn('⚠️ Direct JSON parse failed, attempting cleaning...');

                // Detailed cleaning for common LLM artifacts
                let cleanJson = jsonResponse.trim();

                // Remove markdown blocks
                if (cleanJson.includes('```')) {
                    const match = cleanJson.match(/```(?:json)?([\s\S]*?)```/);
                    if (match && match[1]) {
                        cleanJson = match[1].trim();
                    } else {
                        cleanJson = cleanJson.replace(/```json/g, '').replace(/```/g, '').trim();
                    }
                }

                // Remove any text before the first '{' or after the last '}'
                const startIdx = cleanJson.indexOf('{');
                const endIdx = cleanJson.lastIndexOf('}');
                if (startIdx !== -1 && endIdx !== -1) {
                    cleanJson = cleanJson.substring(startIdx, endIdx + 1);
                }

                try {
                    const parsed = JSON.parse(cleanJson);
                    console.log('✅ AI JSON cleaned and parsed successfully');
                    return parsed;
                } catch (secondError) {
                    console.error('❌ Failed to parse AI JSON even after cleaning.');
                    console.error('Raw content around error:', cleanJson.substring(0, 500));
                    throw new Error(`AI JSON Parsing failed: ${secondError.message}`);
                }
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
