import axios from 'axios';

class AiService {
    constructor() {
        this.baseUrl = process.env.OLLAMA_URL; // e.g. https://davey-ollama2.mapf5v.easypanel.host
        // Default model fallback
        this.model = process.env.OLLAMA_MODEL || 'llama3.2:3b';
        this.fastModel = process.env.OLLAMA_MODEL_FAST || 'gemma2:2b';
    }

    async getBestAvailableModel() {
        if (!this.baseUrl) return this.model;

        try {
            console.log('🔎 Checking available Ollama models...');
            const { data } = await axios.get(`${this.baseUrl}/api/tags`);
            const availableModels = data.models.map(m => m.name); // e.g. ["llama3.2:3b", "gemma2:2b"]

            console.log('📋 Available models:', availableModels);

            // 1. Try Primary Model
            if (availableModels.some(m => m.includes(this.model))) {
                console.log(`✅ Using primary model: ${this.model}`);
                return this.model;
            }

            // 2. Try Fast/Fallback Model
            if (availableModels.some(m => m.includes(this.fastModel))) {
                console.log(`⚠️ Primary model not found. Using fallback: ${this.fastModel}`);
                return this.fastModel;
            }

            // 3. Last Resort: Use the first available model
            if (availableModels.length > 0) {
                const firstModel = availableModels[0];
                console.log(`⚠️ No preferred models found. Using available: ${firstModel}`);
                return firstModel;
            }

        } catch (error) {
            console.warn('⚠️ Could not check available models (might be offline or auth issue). Using default configuration.');
            console.warn(error.message);
        }

        return this.model; // Fallback to config default if check fails
    }

    async extractSongData(textContext) {
        if (!this.baseUrl) {
            throw new Error('OLLAMA_URL environment variable is not set');
        }

        // Dynamically select model
        const selectedModel = await this.getBestAvailableModel();

        const prompt = `
      You are a specialized assistant for a Worship Ministry.
      Extract the following song details from the provided text (Title, Description, and Transcript/Lyrics).
      
      Return ONLY valid JSON (no markdown, no explanations) with this exact structure:
      {
        "name": "Song Title",
        "key": "Musical Key (e.g. C, D, Em) - infer if possible, otherwise leave empty",
        "tempo": "Rápido" | "Moderado" | "Lento",
        "lyrics": "Full lyrics formatted with line breaks",
        "chords": "Chords/Chart in text format if found, otherwise empty"
      }

      Input Text:
      ${textContext.substring(0, 6000)} -- Truncated to avoid context limit
    `;

        try {
            // Try with the "Fast" model first? Or just the standard one?
            // The user suggested using the "fast" model availability check, 
            // but for extraction quality, Llama 3.2 is likely better than Gemma 2b.
            // Let's us the standard MODEL variable as primary.

            console.log(`🤖 Sending request to Ollama (${selectedModel})...`);

            const response = await axios.post(`${this.baseUrl}/api/generate`, {
                model: selectedModel,
                prompt: prompt,
                stream: false,
                format: "json", // Force JSON mode if supported by the model/version
                options: {
                    temperature: 0.1 // Low temperature for deterministic extraction
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
