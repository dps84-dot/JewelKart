import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function AdminDashboard() {

    const navigate = useNavigate();

    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const token = localStorage.getItem("jewelkart_token");

    useEffect(() => {

        const loadDashboard = async () => {

            try {

                if (!token) {
                    navigate("/admin/login");
                    return;
                }

                const response = await axios.get(
                    "http://localhost:5000/api/admin/dashboard",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                if (response.data.success) {

                    setDashboard(
                        response.data.dashboard
                    );

                } else {

                    setError(
                        response.data.message ||
                        "Failed to load dashboard"
                    );

                }

            } catch (error) {

                console.error(
                    "Dashboard error:",
                    error
                );

                if (
                    error.response?.status === 401 ||
                    error.response?.status === 403
                ) {

                    localStorage.removeItem(
                        "jewelkart_token"
                    );

                    localStorage.removeItem(
                        "jewelkart_user"
                    );

                    navigate("/admin/login");

                    return;
                }

                setError(
                    error.response?.data?.message ||
                    "Unable to load dashboard"
                );

            } finally {

                setLoading(false);

            }

        };

        loadDashboard();

    }, [navigate, token]);


    const handleLogout = () => {

        localStorage.removeItem(
            "jewelkart_token"
        );

        localStorage.removeItem(
            "jewelkart_user"
        );

        navigate("/admin/login");

    };


    if (loading) {

        return (
            <div className="admin-loading">
                Loading Admin Dashboard...
            </div>
        );

    }


    if (error) {

        return (
            <div className="admin-error-page">

                <h2>
                    Dashboard Error
                </h2>

                <p>
                    {error}
                </p>

                <button
                    onClick={() =>
                        navigate("/admin/login")
                    }
                >
                    Back to Login
                </button>

            </div>
        );

    }


    return (

        <div className="admin-dashboard">

            {/* =========================================
                SIDEBAR
            ========================================= */}

            <aside className="admin-sidebar">

                <div className="admin-logo">
                    JewelKart
                </div>

                <div className="admin-panel-title">
                    Admin Panel
                </div>


                <nav className="admin-nav">

                    <button
                        className="admin-nav-item active"
                    >
                        Dashboard
                    </button>

                    <button
                        className="admin-nav-item"
                        onClick={() =>
                            navigate("/admin/products")
                        }
                    >
                        Products
                    </button>

                    <button
                        className="admin-nav-item"
                        onClick={() =>
                            navigate("/admin/orders")
                        }
                    >
                        Orders
                    </button>

                    <button
                        className="admin-nav-item"
                        onClick={() =>
                            navigate("/admin/customers")
                        }
                    >
                        Customers
                    </button>

                </nav>


                <button
                    className="admin-logout"
                    onClick={handleLogout}
                >
                    Logout
                </button>

            </aside>


            {/* =========================================
                MAIN CONTENT
            ========================================= */}

            <main className="admin-main">

                <header className="admin-header">

                    <div>

                        <h1>
                            Dashboard
                        </h1>

                        <p>
                            Welcome to JewelKart Admin Panel
                        </p>

                    </div>

                    <div className="admin-user">

                        Admin

                    </div>

                </header>


                {/* =====================================
                    STATISTICS
                ===================================== */}

                <section className="admin-stats">

                    <div className="admin-stat-card">

                        <div className="admin-stat-label">
                            Total Customers
                        </div>

                        <div className="admin-stat-value">
                            {dashboard?.totalCustomers ?? 0}
                        </div>

                    </div>


                    <div className="admin-stat-card">

                        <div className="admin-stat-label">
                            Total Products
                        </div>

                        <div className="admin-stat-value">
                            {dashboard?.totalProducts ?? 0}
                        </div>

                    </div>


                    <div className="admin-stat-card">

                        <div className="admin-stat-label">
                            Total Orders
                        </div>

                        <div className="admin-stat-value">
                            {dashboard?.totalOrders ?? 0}
                        </div>

                    </div>


                    <div className="admin-stat-card">

                        <div className="admin-stat-label">
                            Total Revenue
                        </div>

                        <div className="admin-stat-value">
                            ₹
                            {Number(
                                dashboard?.totalRevenue || 0
                            ).toLocaleString("en-IN")}
                        </div>

                    </div>


                    <div className="admin-stat-card">

                        <div className="admin-stat-label">
                            Pending Orders
                        </div>

                        <div className="admin-stat-value">
                            {dashboard?.pendingOrders ?? 0}
                        </div>

                    </div>

                </section>


                {/* =====================================
                    LOW STOCK PRODUCTS
                ===================================== */}

                <section className="admin-section">

                    <div className="admin-section-header">

                        <h2>
                            Low Stock Products
                        </h2>

                        <span>
                            Stock ≤ 5
                        </span>

                    </div>


                    {dashboard?.lowStockProducts?.length === 0 ? (

                        <div className="admin-empty">

                            No low stock products.

                        </div>

                    ) : (

                        <div className="admin-table-wrapper">

                            <table className="admin-table">

                                <thead>

                                    <tr>

                                        <th>
                                            ID
                                        </th>

                                        <th>
                                            Product
                                        </th>

                                        <th>
                                            Price
                                        </th>

                                        <th>
                                            Stock
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {dashboard.lowStockProducts.map(
                                        (product) => (

                                            <tr
                                                key={product.id}
                                            >

                                                <td>
                                                    #{product.id}
                                                </td>

                                                <td>
                                                    {product.name}
                                                </td>

                                                <td>
                                                    ₹
                                                    {Number(
                                                        product.price
                                                    ).toLocaleString(
                                                        "en-IN"
                                                    )}
                                                </td>

                                                <td>

                                                    <span className="low-stock-badge">

                                                        {product.stock}

                                                    </span>

                                                </td>

                                            </tr>

                                        )
                                    )}

                                </tbody>

                            </table>

                        </div>

                    )}

                </section>

            </main>

        </div>

    );

}

export default AdminDashboard;