const express = require("express");

const router = express.Router();

const {
    authenticateToken,
    requireAdmin
} = require("../middleware/authMiddleware");

const pool = require("../config/database");


// =====================================================
// ADMIN AUTHORIZATION TEST
// =====================================================

router.get(
    "/test",
    authenticateToken,
    requireAdmin,
    (req, res) => {

        res.json({
            success: true,
            message: "Admin authorization successful",
            user: req.user
        });

    }
);


// =====================================================
// ADMIN DASHBOARD
// =====================================================

router.get(
    "/dashboard",
    authenticateToken,
    requireAdmin,
    async (req, res) => {

        try {

            const customersResult = await pool.query(`
                SELECT COUNT(*) AS total
                FROM users
                WHERE role = 'customer'
            `);

            const productsResult = await pool.query(`
                SELECT COUNT(*) AS total
                FROM products
            `);

            const ordersResult = await pool.query(`
                SELECT COUNT(*) AS total
                FROM orders
            `);

            const revenueResult = await pool.query(`
                SELECT COALESCE(SUM(total_amount), 0) AS total
                FROM orders
                WHERE status != 'cancelled'
            `);

            const pendingOrdersResult = await pool.query(`
                SELECT COUNT(*) AS total
                FROM orders
                WHERE status = 'pending'
            `);

            const lowStockResult = await pool.query(`
                SELECT
                    id,
                    name,
                    stock,
                    price,
                    image_url
                FROM products
                WHERE stock <= 5
                ORDER BY stock ASC
            `);

            res.json({

                success: true,

                message: "Admin dashboard data fetched successfully",

                dashboard: {

                    totalCustomers:
                        Number(customersResult.rows[0].total),

                    totalProducts:
                        Number(productsResult.rows[0].total),

                    totalOrders:
                        Number(ordersResult.rows[0].total),

                    totalRevenue:
                        Number(revenueResult.rows[0].total),

                    pendingOrders:
                        Number(pendingOrdersResult.rows[0].total),

                    lowStockProducts:
                        lowStockResult.rows

                }

            });

        } catch (error) {

            console.error(
                "Admin dashboard error:",
                error
            );

            res.status(500).json({

                success: false,

                message: "Failed to fetch admin dashboard data"

            });

        }

    }
);


// =====================================================
// ADMIN - GET ALL PRODUCTS
// =====================================================

router.get(
    "/products",
    authenticateToken,
    requireAdmin,
    async (req, res) => {

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
                    p.created_at,
                    p.updated_at
                FROM products p
                LEFT JOIN categories c
                    ON p.category_id = c.id
                ORDER BY p.id DESC
            `);

            res.json({

                success: true,

                message: "Admin products fetched successfully",

                products: result.rows

            });

        } catch (error) {

            console.error(
                "Admin get products error:",
                error
            );

            res.status(500).json({

                success: false,

                message: "Failed to fetch products"

            });

        }

    }
);


// =====================================================
// ADMIN - ADD PRODUCT
// =====================================================

router.post(
    "/products",
    authenticateToken,
    requireAdmin,
    async (req, res) => {

        try {

            const {
                name,
                description,
                price,
                stock,
                image_url,
                category_id
            } = req.body;


            if (
                !name ||
                price === undefined ||
                stock === undefined ||
                !category_id
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Name, price, stock and category_id are required"

                });

            }


            if (Number(price) < 0) {

                return res.status(400).json({

                    success: false,

                    message: "Price cannot be negative"

                });

            }


            if (Number(stock) < 0) {

                return res.status(400).json({

                    success: false,

                    message: "Stock cannot be negative"

                });

            }


            const result = await pool.query(
                `
                INSERT INTO products
                (
                    name,
                    description,
                    price,
                    stock,
                    image_url,
                    category_id
                )
                VALUES
                ($1, $2, $3, $4, $5, $6)
                RETURNING
                    id,
                    name,
                    description,
                    price,
                    stock,
                    image_url,
                    category_id,
                    created_at,
                    updated_at
                `,
                [
                    name.trim(),
                    description || null,
                    Number(price),
                    Number(stock),
                    image_url || null,
                    Number(category_id)
                ]
            );


            res.status(201).json({

                success: true,

                message: "Product created successfully",

                product: result.rows[0]

            });

        } catch (error) {

            console.error(
                "Admin add product error:",
                error
            );

            res.status(500).json({

                success: false,

                message: "Failed to create product"

            });

        }

    }
);


// =====================================================
// ADMIN - UPDATE PRODUCT
// =====================================================

router.put(
    "/products/:id",
    authenticateToken,
    requireAdmin,
    async (req, res) => {

        try {

            const { id } = req.params;

            const {
                name,
                description,
                price,
                stock,
                image_url,
                category_id
            } = req.body;


            if (
                !name ||
                price === undefined ||
                stock === undefined ||
                !category_id
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Name, price, stock and category_id are required"

                });

            }


            if (Number(price) < 0) {

                return res.status(400).json({

                    success: false,

                    message: "Price cannot be negative"

                });

            }


            if (Number(stock) < 0) {

                return res.status(400).json({

                    success: false,

                    message: "Stock cannot be negative"

                });

            }


            const result = await pool.query(
                `
                UPDATE products
                SET
                    name = $1,
                    description = $2,
                    price = $3,
                    stock = $4,
                    image_url = $5,
                    category_id = $6,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = $7
                RETURNING
                    id,
                    name,
                    description,
                    price,
                    stock,
                    image_url,
                    category_id,
                    created_at,
                    updated_at
                `,
                [
                    name.trim(),
                    description || null,
                    Number(price),
                    Number(stock),
                    image_url || null,
                    Number(category_id),
                    Number(id)
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

            console.error(
                "Admin update product error:",
                error
            );

            res.status(500).json({

                success: false,

                message: "Failed to update product"

            });

        }

    }
);


// =====================================================
// ADMIN - DELETE PRODUCT
// =====================================================

router.delete(
    "/products/:id",
    authenticateToken,
    requireAdmin,
    async (req, res) => {

        try {

            const { id } = req.params;


            const result = await pool.query(
                `
                DELETE FROM products
                WHERE id = $1
                RETURNING id, name
                `,
                [Number(id)]
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

            console.error(
                "Admin delete product error:",
                error
            );

            res.status(500).json({

                success: false,

                message: "Failed to delete product"

            });

        }

    }
);


// =====================================================
// ADMIN - UPDATE PRODUCT STOCK
// =====================================================

router.patch(
    "/products/:id/stock",
    authenticateToken,
    requireAdmin,
    async (req, res) => {

        try {

            const { id } = req.params;

            const { stock } = req.body;


            if (stock === undefined) {

                return res.status(400).json({

                    success: false,

                    message: "Stock is required"

                });

            }


            if (Number(stock) < 0) {

                return res.status(400).json({

                    success: false,

                    message: "Stock cannot be negative"

                });

            }


            const result = await pool.query(
                `
                UPDATE products
                SET
                    stock = $1,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = $2
                RETURNING
                    id,
                    name,
                    stock,
                    updated_at
                `,
                [
                    Number(stock),
                    Number(id)
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

                message: "Product stock updated successfully",

                product: result.rows[0]

            });

        } catch (error) {

            console.error(
                "Admin stock update error:",
                error
            );

            res.status(500).json({

                success: false,

                message: "Failed to update product stock"

            });

        }

    }
);


// =====================================================
// ADMIN - GET ALL ORDERS
// =====================================================

router.get(
    "/orders",
    authenticateToken,
    requireAdmin,
    async (req, res) => {

        try {

            const result = await pool.query(`
                SELECT
                    o.id,
                    o.user_id,
                    u.name AS customer_name,
                    u.email AS customer_email,
                    o.total_amount,
                    o.status,
                    o.shipping_address,
                    o.created_at
                FROM orders o
                LEFT JOIN users u
                    ON o.user_id = u.id
                ORDER BY o.created_at DESC
            `);


            res.json({

                success: true,

                message: "Admin orders fetched successfully",

                orders: result.rows

            });

        } catch (error) {

            console.error(
                "Admin get orders error:",
                error
            );

            res.status(500).json({

                success: false,

                message: "Failed to fetch orders"

            });

        }

    }
);


// =====================================================
// ADMIN - GET ORDER DETAILS
// =====================================================

router.get(
    "/orders/:id",
    authenticateToken,
    requireAdmin,
    async (req, res) => {

        try {

            const { id } = req.params;


            // ---------------------------------------------
            // GET ORDER + CUSTOMER
            // ---------------------------------------------

            const orderResult = await pool.query(
                `
                SELECT
                    o.id,
                    o.user_id,
                    u.name AS customer_name,
                    u.email AS customer_email,
                    o.total_amount,
                    o.status,
                    o.shipping_address,
                    o.created_at
                FROM orders o
                LEFT JOIN users u
                    ON o.user_id = u.id
                WHERE o.id = $1
                `,
                [Number(id)]
            );


            if (orderResult.rows.length === 0) {

                return res.status(404).json({

                    success: false,

                    message: "Order not found"

                });

            }


            // ---------------------------------------------
            // GET ORDER ITEMS
            // ---------------------------------------------

            const itemsResult = await pool.query(
                `
                SELECT
                    oi.id,
                    oi.product_id,
                    p.name AS product_name,
                    p.image_url,
                    oi.quantity,
                    oi.price,
                    (oi.quantity * oi.price) AS item_total
                FROM order_items oi
                LEFT JOIN products p
                    ON oi.product_id = p.id
                WHERE oi.order_id = $1
                ORDER BY oi.id
                `,
                [Number(id)]
            );


            // ---------------------------------------------
            // RESPONSE
            // ---------------------------------------------

            res.json({

                success: true,

                message: "Admin order details fetched successfully",

                order: orderResult.rows[0],

                items: itemsResult.rows

            });


        } catch (error) {

            console.error(
                "Admin order details error:",
                error
            );


            res.status(500).json({

                success: false,

                message: "Failed to fetch order details"

            });

        }

    }
);


// =====================================================
// ADMIN - UPDATE ORDER STATUS
// =====================================================

router.patch(
    "/orders/:id/status",
    authenticateToken,
    requireAdmin,
    async (req, res) => {

        try {

            const { id } = req.params;

            const { status } = req.body;


            const validStatuses = [
                "pending",
                "confirmed",
                "shipped",
                "delivered",
                "cancelled"
            ];


            if (!status) {

                return res.status(400).json({

                    success: false,

                    message: "Order status is required"

                });

            }


            if (!validStatuses.includes(status)) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid order status. Allowed values: pending, confirmed, shipped, delivered, cancelled"

                });

            }


            const result = await pool.query(
                `
                UPDATE orders
                SET status = $1
                WHERE id = $2
                RETURNING
                    id,
                    user_id,
                    total_amount,
                    status,
                    shipping_address,
                    created_at
                `,
                [
                    status,
                    Number(id)
                ]
            );


            if (result.rows.length === 0) {

                return res.status(404).json({

                    success: false,

                    message: "Order not found"

                });

            }


            res.json({

                success: true,

                message: "Order status updated successfully",

                order: result.rows[0]

            });


        } catch (error) {

            console.error(
                "Admin update order status error:",
                error
            );


            res.status(500).json({

                success: false,

                message: "Failed to update order status"

            });

        }

    }
);


// =====================================================
// ADMIN - GET ALL CUSTOMERS
// =====================================================

router.get(
    "/customers",
    authenticateToken,
    requireAdmin,
    async (req, res) => {

        try {

            const result = await pool.query(`
                SELECT
                    u.id,
                    u.name,
                    u.email,
                    u.created_at,

                    COUNT(o.id) AS total_orders,

                    COALESCE(
                        SUM(
                            CASE
                                WHEN o.status != 'cancelled'
                                THEN o.total_amount
                                ELSE 0
                            END
                        ),
                        0
                    ) AS total_spent

                FROM users u

                LEFT JOIN orders o
                    ON u.id = o.user_id

                WHERE u.role = 'customer'

                GROUP BY
                    u.id,
                    u.name,
                    u.email,
                    u.created_at

                ORDER BY u.created_at DESC
            `);


            res.json({

                success: true,

                message: "Admin customers fetched successfully",

                customers: result.rows

            });

        } catch (error) {

            console.error(
                "Admin get customers error:",
                error
            );

            res.status(500).json({

                success: false,

                message: "Failed to fetch customers"

            });

        }

    }
);

// =====================================================
// ADMIN - GET CUSTOMER DETAILS
// =====================================================

router.get(
    "/customers/:id",
    authenticateToken,
    requireAdmin,
    async (req, res) => {

        try {

            const { id } = req.params;


            // ---------------------------------------------
            // GET CUSTOMER BASIC DETAILS
            // ---------------------------------------------

            const customerResult = await pool.query(
                `
                SELECT
                    u.id,
                    u.name,
                    u.email,
                    u.created_at
                FROM users u
                WHERE u.id = $1
                  AND u.role = 'customer'
                `,
                [Number(id)]
            );


            if (customerResult.rows.length === 0) {

                return res.status(404).json({

                    success: false,

                    message: "Customer not found"

                });

            }


            // ---------------------------------------------
            // GET CUSTOMER ORDERS
            // ---------------------------------------------

            const ordersResult = await pool.query(
                `
                SELECT
                    o.id,
                    o.total_amount,
                    o.status,
                    o.shipping_address,
                    o.created_at
                FROM orders o
                WHERE o.user_id = $1
                ORDER BY o.created_at DESC
                `,
                [Number(id)]
            );


            // ---------------------------------------------
            // GET CUSTOMER ORDER STATISTICS
            // ---------------------------------------------

            const statsResult = await pool.query(
                `
                SELECT
                    COUNT(*) AS total_orders,

                    COALESCE(
                        SUM(
                            CASE
                                WHEN status != 'cancelled'
                                THEN total_amount
                                ELSE 0
                            END
                        ),
                        0
                    ) AS total_spent

                FROM orders

                WHERE user_id = $1
                `,
                [Number(id)]
            );


            // ---------------------------------------------
            // RESPONSE
            // ---------------------------------------------

            res.json({

                success: true,

                message: "Admin customer details fetched successfully",

                customer: customerResult.rows[0],

                statistics: {

                    totalOrders:
                        Number(statsResult.rows[0].total_orders),

                    totalSpent:
                        Number(statsResult.rows[0].total_spent)

                },

                orders: ordersResult.rows

            });


        } catch (error) {

            console.error(
                "Admin customer details error:",
                error
            );


            res.status(500).json({

                success: false,

                message: "Failed to fetch customer details"

            });

        }

    }
);
// =====================================================
// EXPORT ROUTER
// =====================================================

module.exports = router;