const express = require("express");
const router = express.Router();

const pool = require("../config/database");


// =========================================
// GET CART
// =========================================

router.get("/:user_id", async (req, res) => {
    try {
        const { user_id } = req.params;

        const result = await pool.query(
            `
            SELECT
                ci.id,
                ci.user_id,
                ci.product_id,
                ci.quantity,
                p.name,
                p.description,
                p.price,
                p.image_url,
                (p.price * ci.quantity) AS subtotal
            FROM cart_items ci
            JOIN products p
                ON ci.product_id = p.id
            WHERE ci.user_id = $1
            ORDER BY ci.id DESC
            `,
            [user_id]
        );

        const total = result.rows.reduce(
            (sum, item) => sum + Number(item.subtotal),
            0
        );

        res.json({
            success: true,
            count: result.rows.length,
            total,
            cart: result.rows
        });

    } catch (error) {
        console.error("Error fetching cart:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch cart"
        });
    }
});


// =========================================
// ADD PRODUCT TO CART
// =========================================

router.post("/", async (req, res) => {
    try {
        const {
            user_id,
            product_id,
            quantity
        } = req.body;

        if (!user_id || !product_id || !quantity) {
            return res.status(400).json({
                success: false,
                message: "user_id, product_id and quantity are required"
            });
        }

        // Check product
        const productResult = await pool.query(
            `
            SELECT id, name, price, stock
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

        const product = productResult.rows[0];

        // Check stock
        if (product.stock < quantity) {
            return res.status(400).json({
                success: false,
                message: `Only ${product.stock} items available in stock`
            });
        }

        // Check if product already exists in cart
        const existingCart = await pool.query(
            `
            SELECT id, quantity
            FROM cart_items
            WHERE user_id = $1
            AND product_id = $2
            `,
            [user_id, product_id]
        );

        if (existingCart.rows.length > 0) {

            const newQuantity =
                existingCart.rows[0].quantity + Number(quantity);

            if (newQuantity > product.stock) {
                return res.status(400).json({
                    success: false,
                    message: `Only ${product.stock} items available in stock`
                });
            }

            const updatedCart = await pool.query(
                `
                UPDATE cart_items
                SET quantity = $1
                WHERE id = $2
                RETURNING *
                `,
                [
                    newQuantity,
                    existingCart.rows[0].id
                ]
            );

            return res.json({
                success: true,
                message: "Cart quantity updated",
                cartItem: updatedCart.rows[0]
            });
        }


        // Add new cart item

        const result = await pool.query(
            `
            INSERT INTO cart_items
            (
                user_id,
                product_id,
                quantity
            )
            VALUES ($1, $2, $3)
            RETURNING *
            `,
            [
                user_id,
                product_id,
                quantity
            ]
        );

        res.status(201).json({
            success: true,
            message: "Product added to cart",
            cartItem: result.rows[0]
        });

    } catch (error) {
        console.error("Error adding product to cart:", error);

        res.status(500).json({
            success: false,
            message: "Failed to add product to cart"
        });
    }
});


// =========================================
// UPDATE CART QUANTITY
// =========================================

router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { quantity } = req.body;

        if (!quantity || quantity < 1) {
            return res.status(400).json({
                success: false,
                message: "Quantity must be at least 1"
            });
        }

        const result = await pool.query(
            `
            UPDATE cart_items
            SET quantity = $1
            WHERE id = $2
            RETURNING *
            `,
            [quantity, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Cart item not found"
            });
        }

        res.json({
            success: true,
            message: "Cart quantity updated",
            cartItem: result.rows[0]
        });

    } catch (error) {
        console.error("Error updating cart:", error);

        res.status(500).json({
            success: false,
            message: "Failed to update cart"
        });
    }
});


// =========================================
// REMOVE PRODUCT FROM CART
// =========================================

router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `
            DELETE FROM cart_items
            WHERE id = $1
            RETURNING *
            `,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Cart item not found"
            });
        }

        res.json({
            success: true,
            message: "Product removed from cart",
            cartItem: result.rows[0]
        });

    } catch (error) {
        console.error("Error removing cart item:", error);

        res.status(500).json({
            success: false,
            message: "Failed to remove cart item"
        });
    }
});


module.exports = router;