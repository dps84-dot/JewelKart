const express = require("express");
const router = express.Router();

const pool = require("../config/database");


// ========================================
// GET ALL ADDRESSES FOR USER
// GET /api/addresses/:user_id
// ========================================

router.get("/:user_id", async (req, res) => {
    try {
        const { user_id } = req.params;

        const result = await pool.query(
            `
            SELECT
                id,
                user_id,
                full_name,
                mobile,
                address_line,
                city,
                state,
                pincode,
                created_at,
                updated_at
            FROM addresses
            WHERE user_id = $1
            ORDER BY created_at DESC
            `,
            [user_id]
        );

        res.json({
            success: true,
            count: result.rows.length,
            addresses: result.rows
        });

    } catch (error) {

        console.error("Error fetching addresses:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch addresses"
        });
    }
});


// ========================================
// ADD NEW ADDRESS
// POST /api/addresses
// ========================================

router.post("/", async (req, res) => {
    try {

        const {
            user_id,
            full_name,
            mobile,
            address_line,
            city,
            state,
            pincode
        } = req.body;


        // Validation
        if (
            !user_id ||
            !full_name ||
            !mobile ||
            !address_line ||
            !city ||
            !state ||
            !pincode
        ) {
            return res.status(400).json({
                success: false,
                message: "All address fields are required"
            });
        }


        const result = await pool.query(
            `
            INSERT INTO addresses
            (
                user_id,
                full_name,
                mobile,
                address_line,
                city,
                state,
                pincode
            )
            VALUES
            (
                $1,
                $2,
                $3,
                $4,
                $5,
                $6,
                $7
            )
            RETURNING *
            `,
            [
                user_id,
                full_name,
                mobile,
                address_line,
                city,
                state,
                pincode
            ]
        );


        res.status(201).json({
            success: true,
            message: "Address added successfully",
            address: result.rows[0]
        });

    } catch (error) {

        console.error("Error adding address:", error);

        res.status(500).json({
            success: false,
            message: "Failed to add address"
        });
    }
});


// ========================================
// UPDATE ADDRESS
// PUT /api/addresses/:id
// ========================================

router.put("/:id", async (req, res) => {
    try {

        const { id } = req.params;

        const {
            full_name,
            mobile,
            address_line,
            city,
            state,
            pincode
        } = req.body;


        if (
            !full_name ||
            !mobile ||
            !address_line ||
            !city ||
            !state ||
            !pincode
        ) {
            return res.status(400).json({
                success: false,
                message: "All address fields are required"
            });
        }


        const result = await pool.query(
            `
            UPDATE addresses
            SET
                full_name = $1,
                mobile = $2,
                address_line = $3,
                city = $4,
                state = $5,
                pincode = $6,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $7
            RETURNING *
            `,
            [
                full_name,
                mobile,
                address_line,
                city,
                state,
                pincode,
                id
            ]
        );


        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Address not found"
            });
        }


        res.json({
            success: true,
            message: "Address updated successfully",
            address: result.rows[0]
        });

    } catch (error) {

        console.error("Error updating address:", error);

        res.status(500).json({
            success: false,
            message: "Failed to update address"
        });
    }
});


// ========================================
// DELETE ADDRESS
// DELETE /api/addresses/:id
// ========================================

router.delete("/:id", async (req, res) => {
    try {

        const { id } = req.params;


        const result = await pool.query(
            `
            DELETE FROM addresses
            WHERE id = $1
            RETURNING *
            `,
            [id]
        );


        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Address not found"
            });
        }


        res.json({
            success: true,
            message: "Address deleted successfully",
            address: result.rows[0]
        });

    } catch (error) {

        console.error("Error deleting address:", error);

        res.status(500).json({
            success: false,
            message: "Failed to delete address"
        });
    }
});


module.exports = router;