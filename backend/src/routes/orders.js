const express = require("express");
const router = express.Router();

const pool = require("../config/database");


// =====================================================
// PLACE ORDER
// POST /api/orders
// =====================================================

router.post("/", async (req, res) => {

    const client = await pool.connect();

    try {

        const {
            user_id,
            address_id
        } = req.body;


        // =================================================
        // VALIDATION
        // =================================================

        if (!user_id || !address_id) {

            return res.status(400).json({

                success: false,

                message: "user_id and address_id are required"

            });

        }


        // =================================================
        // START DATABASE TRANSACTION
        // =================================================

        await client.query("BEGIN");


        // =================================================
        // GET ADDRESS
        // =================================================

        const addressResult = await client.query(
            `
            SELECT
                id,
                user_id,
                full_name,
                mobile,
                address_line,
                city,
                state,
                pincode
            FROM addresses
            WHERE id = $1
            AND user_id = $2
            `,
            [
                address_id,
                user_id
            ]
        );


        if (addressResult.rows.length === 0) {

            await client.query("ROLLBACK");

            return res.status(404).json({

                success: false,

                message: "Delivery address not found"

            });

        }


        const address = addressResult.rows[0];


        // =================================================
        // GET CART ITEMS
        // Lock products during order creation
        // =================================================

        const cartResult = await client.query(
            `
            SELECT
                ci.id AS cart_id,
                ci.product_id,
                ci.quantity,

                p.name,
                p.price,
                p.stock

            FROM cart_items ci

            JOIN products p
                ON ci.product_id = p.id

            WHERE ci.user_id = $1

            FOR UPDATE OF p
            `,
            [user_id]
        );


        // =================================================
        // CART EMPTY CHECK
        // =================================================

        if (cartResult.rows.length === 0) {

            await client.query("ROLLBACK");

            return res.status(400).json({

                success: false,

                message: "Your cart is empty"

            });

        }


        // =================================================
        // CHECK STOCK
        // =================================================

        for (const item of cartResult.rows) {

            if (item.quantity > item.stock) {

                await client.query("ROLLBACK");

                return res.status(400).json({

                    success: false,

                    message:
                        `${item.name} has only ${item.stock} item(s) available in stock`

                });

            }

        }


        // =================================================
        // CALCULATE TOTAL
        // =================================================

        let totalAmount = 0;

        for (const item of cartResult.rows) {

            totalAmount +=
                Number(item.price) *
                Number(item.quantity);

        }


        // =================================================
        // CREATE SHIPPING ADDRESS TEXT
        // =================================================

        const shippingAddress = [
            address.full_name,
            `Mobile: ${address.mobile}`,
            address.address_line,
            `${address.city}, ${address.state} - ${address.pincode}`
        ].join(", ");


        // =================================================
        // CREATE ORDER
        // =================================================

        const orderResult = await client.query(
            `
            INSERT INTO orders
            (
                user_id,
                total_amount,
                status,
                shipping_address
            )
            VALUES
            (
                $1,
                $2,
                'pending',
                $3
            )
            RETURNING *
            `,
            [
                user_id,
                totalAmount.toFixed(2),
                shippingAddress
            ]
        );


        const order = orderResult.rows[0];


        // =================================================
        // CREATE ORDER ITEMS
        // =================================================

        for (const item of cartResult.rows) {

            await client.query(
                `
                INSERT INTO order_items
                (
                    order_id,
                    product_id,
                    quantity,
                    price
                )
                VALUES
                (
                    $1,
                    $2,
                    $3,
                    $4
                )
                `,
                [
                    order.id,
                    item.product_id,
                    item.quantity,
                    item.price
                ]
            );


            // =================================================
            // REDUCE PRODUCT STOCK
            // =================================================

            await client.query(
                `
                UPDATE products
                SET
                    stock = stock - $1,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = $2
                `,
                [
                    item.quantity,
                    item.product_id
                ]
            );

        }


        // =================================================
        // CLEAR USER CART
        // =================================================

        await client.query(
            `
            DELETE FROM cart_items
            WHERE user_id = $1
            `,
            [user_id]
        );


        // =================================================
        // COMMIT TRANSACTION
        // =================================================

        await client.query("COMMIT");


        // =================================================
        // SUCCESS RESPONSE
        // =================================================

        res.status(201).json({

            success: true,

            message: "Order placed successfully",

            order: {

                id: order.id,

                user_id: order.user_id,

                total_amount: order.total_amount,

                status: order.status,

                shipping_address:
                    order.shipping_address,

                created_at: order.created_at

            }

        });


    } catch (error) {


        // =================================================
        // ROLLBACK ON ERROR
        // =================================================

        await client.query("ROLLBACK");


        console.error(
            "Error placing order:",
            error
        );


        res.status(500).json({

            success: false,

            message: "Failed to place order"

        });


    } finally {

        client.release();

    }

});


// =====================================================
// GET USER ORDERS
// GET /api/orders/:user_id
// =====================================================

router.get("/:user_id", async (req, res) => {

    try {

        const {
            user_id
        } = req.params;


        const result = await pool.query(
            `
            SELECT
                id,
                user_id,
                total_amount,
                status,
                shipping_address,
                created_at

            FROM orders

            WHERE user_id = $1

            ORDER BY created_at DESC
            `,
            [user_id]
        );


        res.json({

            success: true,

            count: result.rows.length,

            orders: result.rows

        });


    } catch (error) {

        console.error(
            "Error fetching orders:",
            error
        );


        res.status(500).json({

            success: false,

            message: "Failed to fetch orders"

        });

    }

});


// =====================================================
// GET ORDER DETAILS
// GET /api/orders/details/:id
// =====================================================

router.get("/details/:id", async (req, res) => {

    try {

        const {
            id
        } = req.params;


        // =================================================
        // GET ORDER
        // =================================================

        const orderResult = await pool.query(
            `
            SELECT
                id,
                user_id,
                total_amount,
                status,
                shipping_address,
                created_at

            FROM orders

            WHERE id = $1
            `,
            [id]
        );


        if (orderResult.rows.length === 0) {

            return res.status(404).json({

                success: false,

                message: "Order not found"

            });

        }


        // =================================================
        // GET ORDER ITEMS
        // =================================================

        const itemsResult = await pool.query(
            `
            SELECT
                oi.id,
                oi.order_id,
                oi.product_id,
                oi.quantity,
                oi.price,

                p.name,
                p.image_url

            FROM order_items oi

            JOIN products p
                ON oi.product_id = p.id

            WHERE oi.order_id = $1

            ORDER BY oi.id ASC
            `,
            [id]
        );


        res.json({

            success: true,

            order: orderResult.rows[0],

            items: itemsResult.rows

        });


    } catch (error) {

        console.error(
            "Error fetching order details:",
            error
        );


        res.status(500).json({

            success: false,

            message: "Failed to fetch order details"

        });

    }

});


module.exports = router;