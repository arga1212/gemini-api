const express = require('express');
const dotenv = require('dotenv');
const { GoogleGenerativeAI } = require('@google/generative-ai');

dotenv.config();
const app = express();
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'models/gemini-2.5-flash' });

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

app.post('/generate-text', async (req, res) => {
    const { prompt } = req.body;
    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        res.json({ output: response.text() });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
