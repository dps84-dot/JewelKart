import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function AdminOrders() {

    const navigate = useNavigate();

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [selectedOrder, setSelectedOrder] = useState(null);
    const [orderDetails, setOrderDetails] = useState(null);
    const [detailsLoading, setDetailsLoading] = useState(false);

    const token = localStorage.getItem("jewelkart_token");


    // =====================================================
    // LOAD ALL ORDERS
    // =====================================================

    const loadOrders = async () => {

        try {

            setLoading(true);
            setError("");

            if (!token) {
                navigate("/admin/login");
                return;
            }

            const response = await axios.get(
                "http://localhost:5000/api/admin/orders",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (response.data.success) {

                setOrders(
                    response.data.orders
                );

            }

        } catch (error) {

            console.error(
                "Admin orders error:",
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
                "Failed to load orders"
            );

        } finally {

            setLoading(false);

        }

    };


    useEffect(() => {

        loadOrders();

    }, []);


    // =====================================================
    // VIEW ORDER DETAILS
    // =====================================================

    const viewOrderDetails = async (orderId) => {

        try {

            setDetailsLoading(true);
            setSelectedOrder(orderId);
            setOrderDetails(null);

            const response = await axios.get(
                `http://localhost:5000/api/admin/orders/${orderId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (response.data.success) {

                setOrderDetails(response.data);

            }

        } catch (error) {

            console.error(
                "Order details error:",
                error
            );

            alert(
                error.response?.data?.message ||
                "Failed to load order details"
            );

        } finally {

            setDetailsLoading(false);

        }

    };


    // =====================================================
    // CLOSE DETAILS
    // =====================================================

    const closeDetails = () => {

        setSelectedOrder(null);
        setOrderDetails(null);

    };


    // =====================================================
    // UPDATE ORDER STATUS
    // =====================================================

    const updateStatus = async (
        orderId,
        status
    ) => {

        try {

            const response = await axios.patch(

                `http://localhost:5000/api/admin/orders/${orderId}/status`,

                {
                    status
                },

                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }

            );


            if (response.data.success) {

                alert(
                    "Order status updated successfully"
                );

                loadOrders();


                // Refresh open order details
                if (selectedOrder === orderId) {

                    viewOrderDetails(orderId);

                }

            }

        } catch (error) {

            console.error(
                "Update order status error:",
                error
            );

            alert(
                error.response?.data?.message ||
                "Failed to update order status"
            );

        }

    };


    // =====================================================
    // STATUS CLASS
    // =====================================================

    const getStatusClass = (status) => {

        switch (status) {

            case "pending":
                return "order-status pending";

            case "confirmed":
                return "order-status confirmed";

            case "shipped":
                return "order-status shipped";

            case "delivered":
                return "order-status delivered";

            case "cancelled":
                return "order-status cancelled";

            default:
                return "order-status";

        }

    };


    // =====================================================
    // FORMAT DATE
    // =====================================================

    const formatDate = (date) => {

        return new Date(date).toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );

    };


    // =====================================================
    // LOGOUT
    // =====================================================

    const logout = () => {

        localStorage.removeItem(
            "jewelkart_token"
        );

        localStorage.removeItem(
            "jewelkart_user"
        );

        navigate("/admin/login");

    };


    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {

        return (

            <div className="admin-loading">

                Loading Orders...

            </div>

        );

    }


    return (

        <div className="admin-dashboard">


            {/* =================================================
                SIDEBAR
            ================================================= */}

            <aside className="admin-sidebar">

                <div className="admin-logo">
                    JewelKart
                </div>

                <div className="admin-panel-title">
                    Admin Panel
                </div>


                <nav className="admin-nav">

                    <button
                        className="admin-nav-item"
                        onClick={() =>
                            navigate("/admin/dashboard")
                        }
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
                        className="admin-nav-item active"
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
                    onClick={logout}
                >
                    Logout
                </button>

            </aside>


            {/* =================================================
                MAIN
            ================================================= */}

            <main className="admin-main">


                <header className="admin-header">

                    <div>

                        <h1>
                            Orders
                        </h1>

                        <p>
                            Manage customer orders and order status
                        </p>

                    </div>


                    <div className="admin-user">
                        Admin
                    </div>

                </header>


                {/* =================================================
                    ERROR
                ================================================= */}

                {error && (

                    <div className="admin-error-message">
                        {error}
                    </div>

                )}


                {/* =================================================
                    ORDERS TABLE
                ================================================= */}

                <section className="admin-section">

                    <div className="admin-section-header">

                        <h2>
                            All Orders
                        </h2>

                        <span>
                            {orders.length} orders
                        </span>

                    </div>


                    <div className="admin-table-wrapper">

                        <table className="admin-table admin-orders-table">

                            <thead>

                                <tr>

                                    <th>
                                        Order
                                    </th>

                                    <th>
                                        Customer
                                    </th>

                                    <th>
                                        Amount
                                    </th>

                                    <th>
                                        Status
                                    </th>

                                    <th>
                                        Date
                                    </th>

                                    <th>
                                        Actions
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {orders.length === 0 ? (

                                    <tr>

                                        <td
                                            colSpan="6"
                                            className="admin-empty"
                                        >
                                            No orders found.
                                        </td>

                                    </tr>

                                ) : (

                                    orders.map(
                                        (order) => (

                                            <tr
                                                key={order.id}
                                            >

                                                <td>

                                                    <strong>
                                                        #{order.id}
                                                    </strong>

                                                </td>


                                                <td>

                                                    <div>

                                                        <strong>
                                                            {
                                                                order.customer_name
                                                            }
                                                        </strong>

                                                        <br />

                                                        <small>
                                                            {
                                                                order.customer_email
                                                            }
                                                        </small>

                                                    </div>

                                                </td>


                                                <td>

                                                    ₹
                                                    {Number(
                                                        order.total_amount
                                                    ).toLocaleString(
                                                        "en-IN"
                                                    )}

                                                </td>


                                                <td>

                                                    <span
                                                        className={
                                                            getStatusClass(
                                                                order.status
                                                            )
                                                        }
                                                    >
                                                        {order.status}
                                                    </span>

                                                </td>


                                                <td>

                                                    {formatDate(
                                                        order.created_at
                                                    )}

                                                </td>


                                                <td>

                                                    <div className="admin-order-actions">

                                                        <button
                                                            className="admin-view-button"
                                                            onClick={() =>
                                                                viewOrderDetails(
                                                                    order.id
                                                                )
                                                            }
                                                        >
                                                            View
                                                        </button>


                                                        <select
                                                            value={
                                                                order.status
                                                            }
                                                            onChange={(e) =>
                                                                updateStatus(
                                                                    order.id,
                                                                    e.target.value
                                                                )
                                                            }
                                                            className="admin-status-select"
                                                        >

                                                            <option value="pending">
                                                                Pending
                                                            </option>

                                                            <option value="confirmed">
                                                                Confirmed
                                                            </option>

                                                            <option value="shipped">
                                                                Shipped
                                                            </option>

                                                            <option value="delivered">
                                                                Delivered
                                                            </option>

                                                            <option value="cancelled">
                                                                Cancelled
                                                            </option>

                                                        </select>

                                                    </div>

                                                </td>

                                            </tr>

                                        )
                                    )

                                )}

                            </tbody>

                        </table>

                    </div>

                </section>


                {/* =================================================
                    ORDER DETAILS MODAL
                ================================================= */}

                {selectedOrder && (

                    <div className="admin-modal-overlay">

                        <div className="admin-modal admin-order-modal">


                            <div className="admin-modal-header">

                                <h2>
                                    Order #
                                    {selectedOrder}
                                </h2>

                                <button
                                    className="admin-modal-close"
                                    onClick={closeDetails}
                                >
                                    ×
                                </button>

                            </div>


                            {detailsLoading ? (

                                <div className="admin-modal-loading">

                                    Loading order details...

                                </div>

                            ) : orderDetails ? (

                                <div className="admin-order-details">


                                    {/* CUSTOMER */}

                                    <div className="admin-detail-section">

                                        <h3>
                                            Customer
                                        </h3>

                                        <p>
                                            <strong>
                                                Name:
                                            </strong>{" "}
                                            {
                                                orderDetails.order.customer_name
                                            }
                                        </p>

                                        <p>
                                            <strong>
                                                Email:
                                            </strong>{" "}
                                            {
                                                orderDetails.order.customer_email
                                            }
                                        </p>

                                    </div>


                                    {/* ORDER */}

                                    <div className="admin-detail-section">

                                        <h3>
                                            Order Information
                                        </h3>

                                        <p>
                                            <strong>
                                                Status:
                                            </strong>{" "}

                                            <span
                                                className={
                                                    getStatusClass(
                                                        orderDetails.order.status
                                                    )
                                                }
                                            >
                                                {
                                                    orderDetails.order.status
                                                }
                                            </span>

                                        </p>

                                        <p>
                                            <strong>
                                                Date:
                                            </strong>{" "}

                                            {
                                                formatDate(
                                                    orderDetails.order.created_at
                                                )
                                            }

                                        </p>

                                        <p>
                                            <strong>
                                                Total:
                                            </strong>{" "}

                                            ₹
                                            {Number(
                                                orderDetails.order.total_amount
                                            ).toLocaleString(
                                                "en-IN"
                                            )}

                                        </p>

                                    </div>


                                    {/* SHIPPING ADDRESS */}

                                    <div className="admin-detail-section">

                                        <h3>
                                            Shipping Address
                                        </h3>

                                        <p>
                                            {
                                                orderDetails.order
                                                    .shipping_address
                                            }
                                        </p>

                                    </div>


                                    {/* ITEMS */}

                                    <div className="admin-detail-section">

                                        <h3>
                                            Order Items
                                        </h3>


                                        <div className="admin-order-items">

                                            {orderDetails.items.map(
                                                (item) => (

                                                    <div
                                                        className="admin-order-item"
                                                        key={item.id}
                                                    >

                                                        {item.image_url && (

                                                            <img
                                                                src={
                                                                    item.image_url
                                                                }
                                                                alt={
                                                                    item.product_name
                                                                }
                                                            />

                                                        )}


                                                        <div className="admin-order-item-info">

                                                            <strong>
                                                                {
                                                                    item.product_name
                                                                }
                                                            </strong>

                                                            <span>
                                                                Qty:{" "}
                                                                {
                                                                    item.quantity
                                                                }
                                                            </span>

                                                        </div>


                                                        <div className="admin-order-item-price">

                                                            ₹
                                                            {Number(
                                                                item.item_total
                                                            ).toLocaleString(
                                                                "en-IN"
                                                            )}

                                                        </div>

                                                    </div>

                                                )
                                            )}

                                        </div>

                                    </div>


                                    {/* STATUS */}

                                    <div className="admin-detail-section">

                                        <h3>
                                            Update Status
                                        </h3>


                                        <div className="admin-status-buttons">

                                            <button
                                                onClick={() =>
                                                    updateStatus(
                                                        selectedOrder,
                                                        "pending"
                                                    )
                                                }
                                            >
                                                Pending
                                            </button>

                                            <button
                                                onClick={() =>
                                                    updateStatus(
                                                        selectedOrder,
                                                        "confirmed"
                                                    )
                                                }
                                            >
                                                Confirmed
                                            </button>

                                            <button
                                                onClick={() =>
                                                    updateStatus(
                                                        selectedOrder,
                                                        "shipped"
                                                    )
                                                }
                                            >
                                                Shipped
                                            </button>

                                            <button
                                                onClick={() =>
                                                    updateStatus(
                                                        selectedOrder,
                                                        "delivered"
                                                    )
                                                }
                                            >
                                                Delivered
                                            </button>

                                            <button
                                                onClick={() =>
                                                    updateStatus(
                                                        selectedOrder,
                                                        "cancelled"
                                                    )
                                                }
                                            >
                                                Cancelled
                                            </button>

                                        </div>

                                    </div>


                                </div>

                            ) : (

                                <div className="admin-empty">

                                    Unable to load order.

                                </div>

                            )}

                        </div>

                    </div>

                )}

            </main>

        </div>

    );

}

export default AdminOrders;