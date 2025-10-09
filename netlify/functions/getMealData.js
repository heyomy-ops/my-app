// Use require for node-fetch in a CommonJS environment
const fetch = require('node-fetch');

exports.handler = async (event, context) => {
    // Netlify functions only run on POST requests from the client by default
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const { base64ImageData } = JSON.parse(event.body);

        if (!base64ImageData) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'No image data provided.' }),
            };
        }
        
        // Securely access the API key from Netlify's environment variables
        const apiKey = process.env.GEMINI_API_KEY;
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

        const userPrompt = `Analyze the food in this image. Identify the primary food item. Return a JSON object with the item's name (as "mealName"), its estimated total calories (as "totalCalories"), its estimated total protein in grams (as "totalProtein"), and its estimated weight in grams (as "estimatedWeight"). Meal name should be a short, descriptive title. For example: "Bowl of Oatmeal with Berries".`;
        
        const payload = {
            contents: [{ parts: [{ text: userPrompt }, { inlineData: { mimeType: "image/jpeg", data: base64ImageData } }] }],
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: { type: "OBJECT", properties: { mealName: { type: "STRING" }, totalCalories: { type: "NUMBER" }, totalProtein: { type: "NUMBER" }, estimatedWeight: { type: "NUMBER"} }, required: ["mealName", "totalCalories", "totalProtein", "estimatedWeight"] }
            }
        };

        const apiResponse = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!apiResponse.ok) {
            const errorBody = await apiResponse.json();
            return {
                statusCode: apiResponse.status,
                body: JSON.stringify({ error: `API Error: ${errorBody.error?.message}` })
            };
        }

        const data = await apiResponse.json();

        return {
            statusCode: 200,
            body: JSON.stringify(data),
        };

    } catch (error) {
        console.error('Error in Netlify function:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Failed to analyze the meal." }),
        };
    }
};
