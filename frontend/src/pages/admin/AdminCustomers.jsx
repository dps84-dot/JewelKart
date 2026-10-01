import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function AdminCustomers() {

    const navigate = useNavigate();

    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");

    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [customerDetails, setCustomerDetails] = useState(null);
    const [detailsLoading, setDetailsLoading] = useState(false);

    const token = localStorage.getItem("jewelkart_token");


    // =====================================================
    // LOAD CUSTOMERS
    // =====================================================

    const loadCustomers = async () => {

        try {

            setLoading(true);
            setError("");

            if (!token) {

                navigate("/admin/login");

                return;

            }


            const response = await axios.get(
                "http://localhost:5000/api/admin/customers",
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );


            if (response.data.success) {

                setCustomers(
                    response.data.customers
                );

            }

        } catch (error) {

            console.error(
                "Admin customers error:",
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
                "Failed to load customers"
            );

        } finally {

            setLoading(false);

        }

    };


    useEffect(() => {

        loadCustomers();

    }, []);


    // =====================================================
    // VIEW CUSTOMER DETAILS
    // =====================================================

    const viewCustomerDetails = async (
        customerId
    ) => {

        try {

            setDetailsLoading(true);

            setSelectedCustomer(
                customerId
            );

            setCustomerDetails(null);


            const response = await axios.get(

                `http://localhost:5000/api/admin/customers/${customerId}`,

                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }

            );


            if (response.data.success) {

                setCustomerDetails(
                    response.data
                );

            }

        } catch (error) {

            console.error(
                "Customer details error:",
                error
            );


            alert(
                error.response?.data?.message ||
                "Failed to load customer details"
            );


        } finally {

            setDetailsLoading(false);

        }

    };


    // =====================================================
    // CLOSE DETAILS
    // =====================================================

    const closeDetails = () => {

        setSelectedCustomer(null);

        setCustomerDetails(null);

    };


    // =====================================================
    // SEARCH
    // =====================================================

    const filteredCustomers =
        customers.filter((customer) => {

            const searchText =
                search.toLowerCase().trim();


            if (!searchText) {

                return true;

            }


            return (

                customer.name
                    ?.toLowerCase()
                    .includes(searchText)

                ||

                customer.email
                    ?.toLowerCase()
                    .includes(searchText)

                ||

                String(customer.id)
                    .includes(searchText)

            );

        });


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

                Loading Customers...

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
                        className="admin-nav-item"
                        onClick={() =>
                            navigate("/admin/orders")
                        }
                    >
                        Orders
                    </button>


                    <button
                        className="admin-nav-item active"
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
                            Customers
                        </h1>

                        <p>
                            Manage JewelKart customers
                        </p>

                    </div>


                    <div className="admin-user">
                        Admin
                    </div>

                </header>


                {/* =================================================
                    SEARCH
                ================================================= */}

                <div className="admin-product-toolbar">

                    <input
                        type="text"
                        placeholder="Search customers..."
                        value={search}
                        onChange={(e) =>
                            setSearch(e.target.value)
                        }
                    />

                    <span>
                        {filteredCustomers.length} customers
                    </span>

                </div>


                {/* =================================================
                    ERROR
                ================================================= */}

                {error && (

                    <div className="admin-error-message">

                        {error}

                    </div>

                )}


                {/* =================================================
                    CUSTOMER TABLE
                ================================================= */}

                <section className="admin-section">

                    <div className="admin-table-wrapper">

                        <table className="admin-table">

                            <thead>

                                <tr>

                                    <th>
                                        ID
                                    </th>

                                    <th>
                                        Customer
                                    </th>

                                    <th>
                                        Email
                                    </th>

                                    <th>
                                        Joined
                                    </th>

                                    <th>
                                        Orders
                                    </th>

                                    <th>
                                        Total Spent
                                    </th>

                                    <th>
                                        Action
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {filteredCustomers.length === 0 ? (

                                    <tr>

                                        <td
                                            colSpan="7"
                                            className="admin-empty"
                                        >
                                            No customers found.
                                        </td>

                                    </tr>

                                ) : (

                                    filteredCustomers.map(
                                        (customer) => (

                                            <tr
                                                key={customer.id}
                                            >

                                                <td>

                                                    #{customer.id}

                                                </td>


                                                <td>

                                                    <strong>
                                                        {
                                                            customer.name
                                                        }
                                                    </strong>

                                                </td>


                                                <td>

                                                    {
                                                        customer.email
                                                    }

                                                </td>


                                                <td>

                                                    {
                                                        formatDate(
                                                            customer.created_at
                                                        )
                                                    }

                                                </td>


                                                <td>

                                                    {
                                                        customer.total_orders
                                                    }

                                                </td>


                                                <td>

                                                    ₹
                                                    {Number(
                                                        customer.total_spent
                                                    ).toLocaleString(
                                                        "en-IN"
                                                    )}

                                                </td>


                                                <td>

                                                    <button
                                                        className="admin-view-button"
                                                        onClick={() =>
                                                            viewCustomerDetails(
                                                                customer.id
                                                            )
                                                        }
                                                    >
                                                        View Details
                                                    </button>

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
                    CUSTOMER DETAILS MODAL
                ================================================= */}

                {selectedCustomer && (

                    <div className="admin-modal-overlay">

                        <div className="admin-modal admin-customer-modal">


                            <div className="admin-modal-header">

                                <h2>
                                    Customer Details
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

                                    Loading customer details...

                                </div>

                            ) : customerDetails ? (

                                <div className="admin-order-details">


                                    {/* CUSTOMER INFORMATION */}

                                    <div className="admin-detail-section">

                                        <h3>
                                            Customer Information
                                        </h3>


                                        <p>

                                            <strong>
                                                Name:
                                            </strong>{" "}

                                            {
                                                customerDetails
                                                    .customer
                                                    .name
                                            }

                                        </p>


                                        <p>

                                            <strong>
                                                Email:
                                            </strong>{" "}

                                            {
                                                customerDetails
                                                    .customer
                                                    .email
                                            }

                                        </p>


                                        <p>

                                            <strong>
                                                Joined:
                                            </strong>{" "}

                                            {
                                                formatDate(
                                                    customerDetails
                                                        .customer
                                                        .created_at
                                                )
                                            }

                                        </p>

                                    </div>


                                    {/* STATISTICS */}

                                    <div className="admin-detail-section">

                                        <h3>
                                            Customer Statistics
                                        </h3>


                                        <p>

                                            <strong>
                                                Total Orders:
                                            </strong>{" "}

                                            {
                                                customerDetails
                                                    .statistics
                                                    .totalOrders
                                            }

                                        </p>


                                        <p>

                                            <strong>
                                                Total Spent:
                                            </strong>{" "}

                                            ₹
                                            {Number(
                                                customerDetails
                                                    .statistics
                                                    .totalSpent
                                            ).toLocaleString(
                                                "en-IN"
                                            )}

                                        </p>

                                    </div>


                                    {/* ORDER HISTORY */}

                                    <div className="admin-detail-section">

                                        <h3>
                                            Order History
                                        </h3>


                                        {customerDetails.orders
                                            .length === 0 ? (

                                            <div className="admin-empty">

                                                No orders found.

                                            </div>

                                        ) : (

                                            <div className="admin-customer-orders">

                                                {customerDetails.orders.map(
                                                    (order) => (

                                                        <div
                                                            className="admin-customer-order"
                                                            key={order.id}
                                                        >

                                                            <div>

                                                                <strong>
                                                                    Order #
                                                                    {
                                                                        order.id
                                                                    }
                                                                </strong>

                                                                <span>
                                                                    {
                                                                        formatDate(
                                                                            order.created_at
                                                                        )
                                                                    }
                                                                </span>

                                                            </div>


                                                            <div>

                                                                <span
                                                                    className={
                                                                        `order-status ${order.status}`
                                                                    }
                                                                >
                                                                    {
                                                                        order.status
                                                                    }
                                                                </span>

                                                                <strong>
                                                                    ₹
                                                                    {Number(
                                                                        order.total_amount
                                                                    ).toLocaleString(
                                                                        "en-IN"
                                                                    )}
                                                                </strong>

                                                            </div>

                                                        </div>

                                                    )
                                                )}

                                            </div>

                                        )}

                                    </div>

                                </div>

                            ) : (

                                <div className="admin-empty">

                                    Unable to load customer.

                                </div>

                            )}

                        </div>

                    </div>

                )}

            </main>

        </div>

    );

}

export default AdminCustomers;