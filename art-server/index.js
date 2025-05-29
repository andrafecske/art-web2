const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const nodemailer = require("nodemailer");
require('dotenv').config();

const { MenuList } = require('./data');

const JWT_SECRET = process.env.JWT_SECRET || "your_super_secret_key";

const app = express();
app.use(cors({
    origin:['http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:3002',
        'http://localhost:3003',
        'http://localhost:3004',
    ], // frontend origin
    credentials: true,
}));
app.use(bodyParser.json());
app.use('/paintings', express.static('assets/paintings'));

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Expecting "Bearer <token>"

    if (!token) {
        return res.status(401).json({ error: "Access token required" });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: "Invalid token" });
        }

        req.user = {
            id: user.userId, // <-- correctly use the field name in your JWT payload
            email: user.email
        };
        next();
    });
};


app.get('/paintings', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM paintings');
        const paintings = result.rows.map(painting => ({
            ...painting,
            image: painting.image_url // Match frontend expectation
        }));
        res.json(paintings);
    } catch (error) {
        console.error("Error fetching paintings:", error);
        res.status(500).json({ error: "Failed to fetch paintings" });
    }
});


const pool = new Pool({
    user: process.env.DB_USER,

    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 5432,
});


app.post("/register", async (req, res) => {
    const {email, password} = req.body;
    if (!email || !password) {
        return res.status(400).json({error: "Email and password are required"});
    }

    try {
        // Check if the user already exists
        const checkUserQuery = "SELECT * FROM users WHERE email = $1";
        const checkUserResult = await pool.query(checkUserQuery, [email]);

        if (checkUserResult.rows.length > 0) {
            return res.status(400).json({error: "User already exists"});
        }

        // Insert user into the database
        const insertUserQuery = "INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *";
        const insertUserResult = await pool.query(insertUserQuery, [email, password]);

        const newUser = insertUserResult.rows[0];

        return res.status(201).json({message: "User registered successfully", user: newUser});
    } catch (error) {
        console.error("Error registering user:", error);
        return res.status(500).json({error: "Internal server error"});
    }
});

app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    console.log("Received login request:", { email, password });

    if (!email || !password) {
        console.log("Missing email or password");
        return res.status(400).json({ error: "Email and password are required" });
    }

    try {
        const query = "SELECT * FROM users WHERE email = $1";
        const result = await pool.query(query, [email]);

        console.log("DB query result:", result.rows);

        if (result.rows.length === 0) {
            console.log("User not found");
            return res.status(400).json({ error: "User not found" });
        }

        const user = result.rows[0];
        if (user.password !== password) {
            console.log("Incorrect password");
            return res.status(400).json({ error: "Incorrect password" });
        }

        const token = jwt.sign({
            userId: result.rows[0].id,
            email: result.rows[0].email,
        },
        JWT_SECRET,);

        console.log("Login successful!");
        return res.json({
            message: "Login successful",
            token,
            email: user.email
        });
    } catch (error) {
        console.error("Error logging in user:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});




pool.connect((err, client, release) => {
    if (err) {
        console.error('Error connecting to PostgreSQL:', err);
    } else {
        console.log('Connected to PostgreSQL!');
    }
});

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

app.post("/contact", (req, res) => {
    const { fullName, email, message } = req.body;

    if (!fullName || !email || !message) {
        return res.status(400).json({ error: "All fields are required" });
    }

    const mailOptions = {
        from: email, // Sender's email
        to: "andrafecske@gmail.com", // Your email (where the message will be sent)
        subject: `New message from ${fullName}`,
        text: `You have received a new message from ${fullName} (${email}).\n\nMessage:\n${message}`,
    };


    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log("Error sending email:", error);
            return res.status(500).json({ error: "Failed to send email." });
        } else {
            console.log("Email sent: " + info.response);
            return res.json({ success: true, message: "Message sent successfully!" });
        }
    });
});

const insertPainting = async (painting) => {
    const { name, image, dimension, price } = painting;

    // Form the image URL
    const image_url = `/paintings/${image}`;

    // Check if the painting already exists in the database
    const checkPaintingQuery = "SELECT * FROM paintings WHERE name = $1 OR image_url = $2";

    try {
        const result = await pool.query(checkPaintingQuery, [name, image_url]);

        // If the painting already exists, we don't insert it again
        if (result.rows.length > 0) {
            console.log(`Painting ${name} already exists in the database.`);
            return;
        }

        // If it doesn't exist, insert it
        const insertPaintingQuery = `INSERT INTO paintings (name, image_url, dimension, price) 
                                     VALUES ($1, $2, $3, $4)`;
        await pool.query(insertPaintingQuery, [name, image_url, dimension, price]);
        console.log("Painting inserted successfully!");
    } catch (error) {
        console.error("Error inserting painting:", error);
    }
};


//adding painting to favorites
app.post("/api/favorites", authenticateToken, async (req, res) => {
    const userId = req.user.id;
    const { paintingId } = req.body;

    if (!paintingId) {
        return res.status(400).json({ error: "Missing paintingId" });
    }

    try {
        // OPTIONAL: check if it already exists
        const existing = await pool.query(
            `SELECT * FROM favorites WHERE user_id = $1 AND painting_id = $2`,
            [userId, paintingId]
        );

        if (existing.rows.length > 0) {
            // Already favorited, remove it (toggle logic)
            await pool.query(
                `DELETE FROM favorites WHERE user_id = $1 AND painting_id = $2`,
                [userId, paintingId]
            );
            return res.json({ message: "Removed from favorites" });
        } else {
            // Not yet favorited, insert it
            await pool.query(
                `INSERT INTO favorites (user_id, painting_id) VALUES ($1, $2)`,
                [userId, paintingId]
            );
            return res.json({ message: "Added to favorites" });
        }
    } catch (error) {
        console.error("Error toggling favorite:", error);
        res.status(500).json({ error: "Failed to toggle favorite" });
    }
});



//removing from favorites
app.delete("/api/favorites", authenticateToken,async (req, res) => {
    const userId = req.user.id;
    const { paintingId } = req.body;

    try {
        await pool.query(
            "DELETE FROM favorites WHERE user_id = $1 AND painting_id = $2",
            [userId, paintingId]
        );
        res.status(200).json({ message: "Removed from favorites" });
    } catch (error) {
        console.error("Error removing favorite:", error);
        res.status(500).json({ error: "Failed to remove favorite" });
    }
});

//getting all the paintings for a person

// Example in Express (Node.js)
app.get('/api/favorites', authenticateToken, async (req, res) => {
    const userId = req.user.id;

    const favorites = await pool.query(
        'SELECT p.* FROM favorites f JOIN paintings p ON f.painting_id = p.id WHERE f.user_id = $1',
        [userId]
    );

    res.json(favorites.rows);
});


//geting each painting individually
app.get('/paintings/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    try {
        const result = await pool.query('SELECT * FROM paintings WHERE id = $1', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Painting not found" });
        }

        const painting = result.rows[0];
        painting.image = painting.image_url; // Match frontend expectations
        res.json(painting);
    } catch (error) {
        console.error("Error fetching painting by ID:", error);
        res.status(500).json({ error: "Failed to fetch painting" });
    }
});


//user posting comment

app.post('/comments', authenticateToken, async (req, res) => {
    const userId = req.user.id;
    const { paintingId, comment } = req.body;

    if (!paintingId || !comment) {
        return res.status(400).json({ error: "paintingId and comment are required" });
    }

    try {
        const insertQuery = `
      INSERT INTO comments (painting_id, user_id, comment)
      VALUES ($1, $2, $3) RETURNING *;
    `;
        const result = await pool.query(insertQuery, [paintingId, userId, comment]);
        res.status(201).json({ message: "Comment added", comment: result.rows[0] });
    } catch (error) {
        console.error("Error adding comment:", error);
        res.status(500).json({ error: "Failed to add comment" });
    }
});


//getting the user comments

app.get('/comments/:paintingId', async (req, res) => {
    const paintingId = parseInt(req.params.paintingId);

    try {
        const query = `
      SELECT c.id, c.comment, c.created_at, u.email AS author_email
      FROM comments c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.painting_id = $1
      ORDER BY c.created_at DESC;
    `;
        const result = await pool.query(query, [paintingId]);
        res.json(result.rows);
    } catch (error) {
        console.error("Error fetching comments:", error);
        res.status(500).json({ error: "Failed to fetch comments" });
    }
});

app.delete('/comments/:commentId', authenticateToken, async (req, res) => {
    const commentId = parseInt(req.params.commentId);
    const userId = req.user.id;

    try {
        // Check if the comment exists and was created by the current user
        const checkQuery = `SELECT * FROM comments WHERE id = $1 AND user_id = $2`;
        const checkResult = await pool.query(checkQuery, [commentId, userId]);

        if (checkResult.rows.length === 0) {
            return res.status(403).json({ error: "Not authorized to delete this comment" });
        }

        // Delete the comment
        const deleteQuery = `DELETE FROM comments WHERE id = $1`;
        await pool.query(deleteQuery, [commentId]);

        res.json({ message: "Comment deleted successfully" });
    } catch (error) {
        console.error("Error deleting comment:", error);
        res.status(500).json({ error: "Failed to delete comment" });
    }
});


MenuList.forEach(insertPainting);




app.listen(5000, () => console.log("Server running on port 5000"));
