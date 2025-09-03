const express = require('express');
const dotenv = require('dotenv');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const multer = require('multer');
const fs = require('fs');

dotenv.config();
const app = express();
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'models/gemini-2.5-flash' });

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

// === TEXT ENDPOINT ===
app.post('/generate-text', async (req, res) => {
    const { prompt = "Write something creative" } = req.body;
    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        res.json({ output: response.text() });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// === IMAGE ENDPOINT ===
const upload = multer({ dest: 'uploads/' });

function imageToGenerativePart(imagePath, mimeType) {
    return {
        inlineData: {
            data: Buffer.from(fs.readFileSync(imagePath)).toString('base64'),
            mimeType,
        },
    };
}

app.post('/generate-from-image', upload.single('image'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No image uploaded' });
    }

    const prompt = req.body.prompt || 'Describe the image';
    const image = imageToGenerativePart(req.file.path, req.file.mimetype);

    try {
        const result = await model.generateContent([prompt, image]);
        const response = await result.response;
        res.json({ output: response.text() });
    } catch (error) {
        res.status(500).json({ error: error.message });
    } finally {
        try {
            fs.unlinkSync(req.file.path);
        } catch (err) {
            console.error("Failed to delete uploaded file:", err);
        }
    }
});
