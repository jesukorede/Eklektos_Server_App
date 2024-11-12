const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();

// Allow CORS from your frontend URL (replace with actual URL for production)
app.use(cors({
    origin: 'https://jesukorede.github.io/Meeting_Frontend/' // Replace with your frontend URL
}));

app.use(express.json());

const userData = new Map(); // Maps uniqueCode to { name, email }

// Endpoint to generate a unique code for a new user
app.post('/generate-code', (req, res) => {
    const { name, email } = req.body;

    // Validate inputs
    if (!name || !email) {
        return res.status(400).json({ message: "Name and email are required." });
    }

    // Check if the email already exists in our stored user data
    const emailAlreadyExists = [...userData.values()].some(user => user.email === email);
    if (emailAlreadyExists) {
        return res.status(400).json({ message: "A code has already been generated for this email." });
    }

    // Generate a unique code for the user
    const uniqueCode = uuidv4();

    // Store the user's data with the generated code
    userData.set(uniqueCode, { name, email, created: Date.now() });

    // Send back the unique code
    res.json({ uniqueCode });
});

// Endpoint to verify a code
app.get('/verify-code', (req, res) => {
    const { code } = req.query;

    if (userData.has(code)) {
        const { name, email } = userData.get(code);
        res.json({ valid: true, name, email, message: "Code is valid. Welcome!" });
    } else {
        res.status(403).json({ valid: false, message: "Invalid or expired code." });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
