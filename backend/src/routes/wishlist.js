const express = require("express");

const router = express.Router();

const pool = require("../config/database");


// =====================================================
// GET WISHLIST
// =====================================================

router.get("/:user_id", async (req, res) => {

    try {

        const { user_id } = req.params;

        const result = await pool.query(
            `
            SELECT
                wi.id,
                wi.user_id,
                wi.product_id,
                wi.created_at,

                p.name,
                p.description,
                p.price,
                p.stock,
                p.image_url,

                c.name AS category_name

            FROM wishlist_items wi

            JOIN products p
                ON wi.product_id = p.id

            LEFT JOIN categories c
                ON p.category_id = c.id

            WHERE wi.user_id = $1

            ORDER BY wi.created_at DESC
            `,
            [user_id]
        );


        res.json({

            success: true,

            count: result.rows.length,

            wishlist: result.rows

        });


    } catch (error) {

        console.error(
            "Error fetching wishlist:",
            error
        );


        res.status(500).json({

            success: false,

            message: "Failed to fetch wishlist"

        });

    }

});


// =====================================================
// ADD TO WISHLIST
// =====================================================

router.post("/", async (req, res) => {

    try {

        const {
            user_id,
            product_id
        } = req.body;


        if (!user_id || !product_id) {

            return res.status(400).json({

                success: false,

                message:
                    "user_id and product_id are required"

            });

        }


        // Check product exists

        const productResult = await pool.query(
            `
            SELECT
                id,
                name
            FROM products
            WHERE id = $1
            `,
            [product_id]
        );


        if (productResult.rows.length === 0) {

            return res.status(404).json({

                success: false,

                message: "Product not found"

            });

        }


        // Check duplicate

        const existingItem = await pool.query(
            `
            SELECT id
            FROM wishlist_items
            WHERE user_id = $1
            AND product_id = $2
            `,
            [
                user_id,
                product_id
            ]
        );


        if (existingItem.rows.length > 0) {

            return res.status(409).json({

                success: false,

                message:
                    "Product already exists in wishlist"

            });

        }


        // Insert wishlist item

        const result = await pool.query(
            `
            INSERT INTO wishlist_items
            (
                user_id,
                product_id
            )
            VALUES ($1, $2)

            RETURNING *
            `,
            [
                user_id,
                product_id
            ]
        );


        res.status(201).json({

            success: true,

            message:
                "Product added to wishlist",

            wishlistItem:
                result.rows[0]

        });


    } catch (error) {

        console.error(
            "Error adding to wishlist:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Failed to add product to wishlist"

        });

    }

});


// =====================================================
// REMOVE FROM WISHLIST
// =====================================================

router.delete("/:id", async (req, res) => {

    try {

        const { id } = req.params;


        const result = await pool.query(
            `
            DELETE FROM wishlist_items
            WHERE id = $1

            RETURNING *
            `,
            [id]
        );


        if (result.rows.length === 0) {

            return res.status(404).json({

                success: false,

                message:
                    "Wishlist item not found"

            });

        }


        res.json({

            success: true,

            message:
                "Product removed from wishlist",

            wishlistItem:
                result.rows[0]

        });


    } catch (error) {

        console.error(
            "Error removing wishlist item:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Failed to remove wishlist item"

        });

    }

});


module.exports = router;