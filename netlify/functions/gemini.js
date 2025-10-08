export async function handler(event) {
  try {
    const { base64ImageData, prompt } = JSON.parse(event.body);

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${process.env.GEMINI_API_KEY}`;
    
    const payload = {
      contents: [
        { parts: [{ text: prompt }, ...(base64ImageData ? [{ inlineData: { mimeType: "image/jpeg", data: base64ImageData } }] : [])] }
      ]
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify(result),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
}
