// Use require for node-fetch in a CommonJS environment
const fetch = require('node-fetch');

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const { mealSummary, dailyGoal, dailyProteinGoal } = JSON.parse(event.body);

        if (!mealSummary) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'No meal data provided.' }),
            };
        }
        
        const apiKey = process.env.GEMINI_API_KEY; // Securely access the same key
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

        const userPrompt = `Based on the following list of meals I ate today, provide a brief, one-paragraph nutritional analysis focusing on both calories and protein. Offer one positive insight and one simple, actionable suggestion for a healthier choice tomorrow. Keep the tone encouraging and friendly, like a helpful nutrition coach. Do not use markdown.\n\nHere are my meals:\n${mealSummary}\n\nMy daily goals are ${dailyGoal} kcal and ${dailyProteinGoal}g of protein.`;
        
        const payload = {
            contents: [{ parts: [{ text: userPrompt }] }]
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
            body: JSON.stringify({ error: "Failed to generate insight." }),
        };
    }
};
