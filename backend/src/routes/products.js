const express = require("express");
const router = express.Router();

const pool = require("../config/database");


// =====================================================
// GET - All Products
// =====================================================
router.get("/", async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                p.id,
                p.name,
                p.description,
                p.price,
                p.stock,
                p.image_url,
                p.category_id,
                c.name AS category_name,
                p.created_at
            FROM products p
            LEFT JOIN categories c
                ON p.category_id = c.id
            ORDER BY p.id DESC
        `);

        res.json({
            success: true,
            count: result.rows.length,
            products: result.rows
        });

    } catch (error) {
        console.error("Error fetching products:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch products"
        });
    }
});


// =====================================================
// GET - Single Product by ID
// =====================================================
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `
            SELECT
                p.id,
                p.name,
                p.description,
                p.price,
                p.stock,
                p.image_url,
                p.category_id,
                c.name AS category_name,
                p.created_at
            FROM products p
            LEFT JOIN categories c
                ON p.category_id = c.id
            WHERE p.id = $1
            `,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        res.json({
            success: true,
            product: result.rows[0]
        });

    } catch (error) {
        console.error("Error fetching product:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch product"
        });
    }
});


// =====================================================
// POST - Create New Product
// =====================================================
router.post("/", async (req, res) => {
    try {
        const {
            category_id,
            name,
            description,
            price,
            stock,
            image_url
        } = req.body;

        // Basic validation
        if (!category_id || !name || price === undefined || stock === undefined) {
            return res.status(400).json({
                success: false,
                message: "category_id, name, price and stock are required"
            });
        }

        const result = await pool.query(
            `
            INSERT INTO products
            (
                category_id,
                name,
                description,
                price,
                stock,
                image_url
            )
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
            `,
            [
                category_id,
                name,
                description || null,
                price,
                stock,
                image_url || null
            ]
        );

        res.status(201).json({
            success: true,
            message: "Product created successfully",
            product: result.rows[0]
        });

    } catch (error) {
        console.error("Error creating product:", error);

        res.status(500).json({
            success: false,
            message: "Failed to create product"
        });
    }
});


// =====================================================
// PUT - Update Product
// =====================================================
router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const {
            category_id,
            name,
            description,
            price,
            stock,
            image_url
        } = req.body;

        const result = await pool.query(
            `
            UPDATE products
            SET
                category_id = $1,
                name = $2,
                description = $3,
                price = $4,
                stock = $5,
                image_url = $6,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $7
            RETURNING *
            `,
            [
                category_id,
                name,
                description,
                price,
                stock,
                image_url,
                id
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        res.json({
            success: true,
            message: "Product updated successfully",
            product: result.rows[0]
        });

    } catch (error) {
        console.error("Error updating product:", error);

        res.status(500).json({
            success: false,
            message: "Failed to update product"
        });
    }
});


// =====================================================
// DELETE - Delete Product
// =====================================================
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `
            DELETE FROM products
            WHERE id = $1
            RETURNING *
            `,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        res.json({
            success: true,
            message: "Product deleted successfully",
            product: result.rows[0]
        });

    } catch (error) {
        console.error("Error deleting product:", error);

        res.status(500).json({
            success: false,
            message: "Failed to delete product"
        });
    }
});


module.exports = router;