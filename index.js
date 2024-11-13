const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();

// Configure Helmet with basic settings
app.use(helmet({
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Allow CORS only from your frontend base URL
app.use(cors({
    origin: 'https://jesukorede.github.io', // Update this to your frontend domain
    methods: ['GET', 'POST'], // Specify allowed HTTP methods
    credentials: true // If you need to allow cookies or authorization headers
}));

app.use(express.json());

const userData = new Map(); // Stores uniqueCode with { name, email }

// Endpoint to generate a unique code for a new user
app.post('/generate-code', (req, res) => {
    const { name, email } = req.body;

    // Validate inputs
    if (!name || !email) {
        return res.status(400).json({ message: "Name and email are required." });
    }

    // Check if email already exists in stored data
    const emailAlreadyExists = [...userData.values()].some(user => user.email === email);
    if (emailAlreadyExists) {
        return res.status(400).json({ message: "A code has already been generated for this email." });
    }

    // Generate a unique code for the user
    const uniqueCode = uuidv4();

    // Store the user data with the generated code
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

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
