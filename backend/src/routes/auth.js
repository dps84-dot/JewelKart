const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const router = express.Router();

const pool = require("../config/database");


// =====================================================
// REGISTER
// =====================================================

router.post("/register", async (req, res) => {

    try {

        const {
            name,
            email,
            password
        } = req.body;


        // Validate input

        if (!name || !email || !password) {

            return res.status(400).json({
                success: false,
                message: "Name, email and password are required"
            });

        }


        // Validate password length

        if (password.length < 6) {

            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters"
            });

        }


        const normalizedEmail =
            email.trim().toLowerCase();


        // Check existing user

        const existingUser = await pool.query(
            `
            SELECT id
            FROM users
            WHERE email = $1
            `,
            [normalizedEmail]
        );


        if (existingUser.rows.length > 0) {

            return res.status(409).json({
                success: false,
                message: "Email already registered"
            });

        }


        // Hash password

        const hashedPassword =
            await bcrypt.hash(password, 10);


        // Insert user

        const result = await pool.query(
            `
            INSERT INTO users
            (
                name,
                email,
                password,
                role
            )
            VALUES
            ($1, $2, $3, $4)
            RETURNING
                id,
                name,
                email,
                role,
                created_at
            `,
            [
                name.trim(),
                normalizedEmail,
                hashedPassword,
                "customer"
            ]
        );


        const user = result.rows[0];


        res.status(201).json({

            success: true,

            message: "Registration successful",

            user: user

        });


    } catch (error) {

        console.error(
            "Registration error:",
            error
        );


        res.status(500).json({

            success: false,

            message: "Registration failed"

        });

    }

});


// =====================================================
// LOGIN
// =====================================================

router.post("/login", async (req, res) => {

    try {

        const {
            email,
            password
        } = req.body;


        // Validate input

        if (!email || !password) {

            return res.status(400).json({

                success: false,

                message: "Email and password are required"

            });

        }


        const normalizedEmail =
            email.trim().toLowerCase();


        // Find user

        const result = await pool.query(
            `
            SELECT
                id,
                name,
                email,
                password,
                role
            FROM users
            WHERE email = $1
            `,
            [normalizedEmail]
        );


        if (result.rows.length === 0) {

            return res.status(401).json({

                success: false,

                message: "Invalid email or password"

            });

        }


        const user = result.rows[0];


        // Compare password

        const passwordMatch =
            await bcrypt.compare(
                password,
                user.password
            );


        if (!passwordMatch) {

            return res.status(401).json({

                success: false,

                message: "Invalid email or password"

            });

        }


        // Check JWT secret

        if (!process.env.JWT_SECRET) {

            return res.status(500).json({

                success: false,

                message: "JWT_SECRET is not configured"

            });

        }


        // Generate JWT token

        const token = jwt.sign(

            {
                userId: user.id,
                email: user.email,
                role: user.role
            },

            process.env.JWT_SECRET,

            {
                expiresIn: "1d"
            }

        );


        // Send response

        res.json({

            success: true,

            message: "Login successful",

            token: token,

            user: {

                id: user.id,

                name: user.name,

                email: user.email,

                role: user.role

            }

        });


    } catch (error) {

        console.error(
            "Login error:",
            error
        );


        res.status(500).json({

            success: false,

            message: "Login failed"

        });

    }

});


// =====================================================
// EXPORT ROUTER
// =====================================================

module.exports = router;