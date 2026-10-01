const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const productsRouter = require("./routes/products");
const cartRouter = require("./routes/cart");
const authRouter = require("./routes/auth");
const wishlistRouter = require("./routes/wishlist");
const addressesRouter = require("./routes/addresses");
const ordersRouter = require("./routes/orders");
const adminRouter = require("./routes/admin");


// =====================================================
// LOAD ENVIRONMENT VARIABLES
// =====================================================

dotenv.config();


// =====================================================
// CREATE EXPRESS APP
// =====================================================

const app = express();

const PORT = process.env.PORT || 5000;


// =====================================================
// MIDDLEWARE
// =====================================================

app.use(cors());

app.use(express.json());


// =====================================================
// ROOT API
// =====================================================

app.get("/", (req, res) => {

    res.json({
        success: true,
        message: "Welcome to JewelKart API"
    });

});


// =====================================================
// HEALTH CHECK
// =====================================================

app.get("/api/health", (req, res) => {

    res.json({
        success: true,
        message: "JewelKart API is running",
        environment: "development"
    });

});


// =====================================================
// DATABASE TEST
// =====================================================

const pool = require("./config/database");

app.get("/api/db-test", async (req, res) => {

    try {

        const result = await pool.query(
            "SELECT NOW() AS time"
        );


        res.json({

            success: true,

            message: "Database connection successful",

            databaseTime: result.rows[0].time

        });


    } catch (error) {

        console.error(
            "Database test error:",
            error
        );


        res.status(500).json({

            success: false,

            message: "Database connection failed"

        });

    }

});


// =====================================================
// API ROUTES
// =====================================================


// =====================================================
// PRODUCTS
// =====================================================

app.use(
    "/api/products",
    productsRouter
);


// =====================================================
// CART
// =====================================================

app.use(
    "/api/cart",
    cartRouter
);


// =====================================================
// AUTHENTICATION
// =====================================================

app.use(
    "/api/auth",
    authRouter
);


// =====================================================
// WISHLIST
// =====================================================

app.use(
    "/api/wishlist",
    wishlistRouter
);


// =====================================================
// ADDRESSES
// =====================================================

app.use(
    "/api/addresses",
    addressesRouter
);


// =====================================================
// ORDERS
// =====================================================

app.use(
    "/api/orders",
    ordersRouter
);


// =====================================================
// ADMIN
// =====================================================

app.use(
    "/api/admin",
    adminRouter
);


// =====================================================
// 404 HANDLER
// =====================================================

app.use((req, res) => {

    res.status(404).json({

        success: false,

        message: "API endpoint not found"

    });

});


// =====================================================
// GLOBAL ERROR HANDLER
// =====================================================

app.use((error, req, res, next) => {

    console.error(
        "Global server error:",
        error
    );


    res.status(500).json({

        success: false,

        message: "Internal server error"

    });

});


// =====================================================
// START SERVER
// =====================================================

app.listen(PORT, () => {

    console.log(
        `JewelKart API running on http://localhost:${PORT}`
    );

});