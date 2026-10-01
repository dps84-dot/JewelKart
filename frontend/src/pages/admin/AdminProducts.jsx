import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function AdminProducts() {

    const navigate = useNavigate();

    const [products, setProducts] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");

    const [showForm, setShowForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    const [form, setForm] = useState({
        name: "",
        description: "",
        price: "",
        stock: "",
        image_url: "",
        category_id: ""
    });

    const token = localStorage.getItem("jewelkart_token");


    // =====================================================
    // LOAD PRODUCTS
    // =====================================================

    const loadProducts = async () => {

        try {

            setLoading(true);
            setError("");

            if (!token) {
                navigate("/admin/login");
                return;
            }

            const response = await axios.get(
                "http://localhost:5000/api/admin/products",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (response.data.success) {

                setProducts(
                    response.data.products
                );

            }

        } catch (error) {

            console.error(
                "Admin products error:",
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
                "Failed to load products"
            );

        } finally {

            setLoading(false);

        }

    };


    useEffect(() => {

        loadProducts();

    }, []);


    // =====================================================
    // FORM CHANGE
    // =====================================================

    const handleChange = (e) => {

        const {
            name,
            value
        } = e.target;

        setForm((previous) => ({
            ...previous,
            [name]: value
        }));

    };


    // =====================================================
    // OPEN ADD FORM
    // =====================================================

    const openAddForm = () => {

        setEditingProduct(null);

        setForm({
            name: "",
            description: "",
            price: "",
            stock: "",
            image_url: "",
            category_id: ""
        });

        setShowForm(true);

    };


    // =====================================================
    // OPEN EDIT FORM
    // =====================================================

    const openEditForm = (product) => {

        setEditingProduct(product);

        setForm({
            name: product.name || "",
            description: product.description || "",
            price: product.price || "",
            stock: product.stock || "",
            image_url: product.image_url || "",
            category_id: product.category_id || ""
        });

        setShowForm(true);

    };


    // =====================================================
    // CLOSE FORM
    // =====================================================

    const closeForm = () => {

        setShowForm(false);
        setEditingProduct(null);

    };


    // =====================================================
    // SAVE PRODUCT
    // =====================================================

    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            const productData = {

                name: form.name.trim(),

                description:
                    form.description.trim(),

                price:
                    Number(form.price),

                stock:
                    Number(form.stock),

                image_url:
                    form.image_url.trim(),

                category_id:
                    Number(form.category_id)

            };


            let response;


            if (editingProduct) {

                response = await axios.put(

                    `http://localhost:5000/api/admin/products/${editingProduct.id}`,

                    productData,

                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }

                );

            } else {

                response = await axios.post(

                    "http://localhost:5000/api/admin/products",

                    productData,

                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }

                );

            }


            if (response.data.success) {

                alert(
                    editingProduct
                        ? "Product updated successfully"
                        : "Product created successfully"
                );

                closeForm();

                loadProducts();

            }

        } catch (error) {

            console.error(
                "Save product error:",
                error
            );

            alert(
                error.response?.data?.message ||
                "Failed to save product"
            );

        }

    };


    // =====================================================
    // UPDATE STOCK
    // =====================================================

    const updateStock = async (product) => {

        const newStock = window.prompt(
            `Enter new stock for "${product.name}"`,
            product.stock
        );

        if (
            newStock === null ||
            newStock.trim() === ""
        ) {
            return;
        }


        const stockNumber = Number(newStock);


        if (
            Number.isNaN(stockNumber) ||
            stockNumber < 0
        ) {

            alert(
                "Please enter a valid stock number"
            );

            return;

        }


        try {

            const response = await axios.patch(

                `http://localhost:5000/api/admin/products/${product.id}/stock`,

                {
                    stock: stockNumber
                },

                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }

            );


            if (response.data.success) {

                loadProducts();

            }

        } catch (error) {

            console.error(
                "Update stock error:",
                error
            );

            alert(
                error.response?.data?.message ||
                "Failed to update stock"
            );

        }

    };


    // =====================================================
    // DELETE PRODUCT
    // =====================================================

    const deleteProduct = async (product) => {

        const confirmed = window.confirm(
            `Are you sure you want to delete "${product.name}"?`
        );

        if (!confirmed) {
            return;
        }


        try {

            const response = await axios.delete(

                `http://localhost:5000/api/admin/products/${product.id}`,

                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }

            );


            if (response.data.success) {

                alert(
                    "Product deleted successfully"
                );

                loadProducts();

            }

        } catch (error) {

            console.error(
                "Delete product error:",
                error
            );

            alert(
                error.response?.data?.message ||
                "Failed to delete product"
            );

        }

    };


    // =====================================================
    // SEARCH
    // =====================================================

    const filteredProducts =
        products.filter((product) => {

            const searchText =
                search.toLowerCase();

            return (

                product.name
                    ?.toLowerCase()
                    .includes(searchText)

                ||

                product.category_name
                    ?.toLowerCase()
                    .includes(searchText)

            );

        });


    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {

        return (

            <div className="admin-loading">

                Loading Products...

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
                        className="admin-nav-item active"
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
                    onClick={() => {

                        localStorage.removeItem(
                            "jewelkart_token"
                        );

                        localStorage.removeItem(
                            "jewelkart_user"
                        );

                        navigate("/admin/login");

                    }}
                >
                    Logout
                </button>

            </aside>


            {/* =================================================
                MAIN
            ================================================= */}

            <main className="admin-main">


                {/* HEADER */}

                <header className="admin-header">

                    <div>

                        <h1>
                            Products
                        </h1>

                        <p>
                            Manage JewelKart products and inventory
                        </p>

                    </div>


                    <button
                        className="admin-add-button"
                        onClick={openAddForm}
                    >
                        + Add Product
                    </button>

                </header>


                {/* =================================================
                    SEARCH
                ================================================= */}

                <div className="admin-product-toolbar">

                    <input
                        type="text"
                        placeholder="Search products..."
                        value={search}
                        onChange={(e) =>
                            setSearch(e.target.value)
                        }
                    />

                    <span>
                        {filteredProducts.length} products
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
                    PRODUCT TABLE
                ================================================= */}

                <section className="admin-section">

                    <div className="admin-table-wrapper">

                        <table className="admin-table admin-products-table">

                            <thead>

                                <tr>

                                    <th>
                                        ID
                                    </th>

                                    <th>
                                        Product
                                    </th>

                                    <th>
                                        Category
                                    </th>

                                    <th>
                                        Price
                                    </th>

                                    <th>
                                        Stock
                                    </th>

                                    <th>
                                        Actions
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {filteredProducts.length === 0 ? (

                                    <tr>

                                        <td
                                            colSpan="6"
                                            className="admin-empty"
                                        >
                                            No products found.
                                        </td>

                                    </tr>

                                ) : (

                                    filteredProducts.map(
                                        (product) => (

                                            <tr
                                                key={product.id}
                                            >

                                                <td>
                                                    #{product.id}
                                                </td>


                                                <td>

                                                    <div className="admin-product-name">

                                                        {product.image_url && (

                                                            <img
                                                                src={
                                                                    product.image_url
                                                                }
                                                                alt={
                                                                    product.name
                                                                }
                                                            />

                                                        )}

                                                        <span>
                                                            {product.name}
                                                        </span>

                                                    </div>

                                                </td>


                                                <td>
                                                    {product.category_name || "-"}
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

                                                    <span
                                                        className={
                                                            product.stock <= 5
                                                                ? "low-stock-badge"
                                                                : "stock-badge"
                                                        }
                                                    >
                                                        {product.stock}
                                                    </span>

                                                </td>


                                                <td>

                                                    <div className="admin-product-actions">

                                                        <button
                                                            className="admin-edit-button"
                                                            onClick={() =>
                                                                openEditForm(
                                                                    product
                                                                )
                                                            }
                                                        >
                                                            Edit
                                                        </button>


                                                        <button
                                                            className="admin-stock-button"
                                                            onClick={() =>
                                                                updateStock(
                                                                    product
                                                                )
                                                            }
                                                        >
                                                            Stock
                                                        </button>


                                                        <button
                                                            className="admin-delete-button"
                                                            onClick={() =>
                                                                deleteProduct(
                                                                    product
                                                                )
                                                            }
                                                        >
                                                            Delete
                                                        </button>

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
                    ADD / EDIT MODAL
                ================================================= */}

                {showForm && (

                    <div className="admin-modal-overlay">

                        <div className="admin-modal">

                            <div className="admin-modal-header">

                                <h2>
                                    {editingProduct
                                        ? "Edit Product"
                                        : "Add Product"
                                    }
                                </h2>

                                <button
                                    className="admin-modal-close"
                                    onClick={closeForm}
                                >
                                    ×
                                </button>

                            </div>


                            <form
                                className="admin-product-form"
                                onSubmit={handleSubmit}
                            >

                                <div className="admin-form-grid">


                                    <div className="admin-form-group">

                                        <label>
                                            Product Name
                                        </label>

                                        <input
                                            name="name"
                                            value={form.name}
                                            onChange={handleChange}
                                            required
                                        />

                                    </div>


                                    <div className="admin-form-group">

                                        <label>
                                            Category ID
                                        </label>

                                        <input
                                            type="number"
                                            name="category_id"
                                            value={
                                                form.category_id
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            min="1"
                                            required
                                        />

                                    </div>


                                    <div className="admin-form-group">

                                        <label>
                                            Price
                                        </label>

                                        <input
                                            type="number"
                                            name="price"
                                            value={form.price}
                                            onChange={handleChange}
                                            min="0"
                                            step="0.01"
                                            required
                                        />

                                    </div>


                                    <div className="admin-form-group">

                                        <label>
                                            Stock
                                        </label>

                                        <input
                                            type="number"
                                            name="stock"
                                            value={form.stock}
                                            onChange={handleChange}
                                            min="0"
                                            required
                                        />

                                    </div>

                                </div>


                                <div className="admin-form-group">

                                    <label>
                                        Image URL
                                    </label>

                                    <input
                                        name="image_url"
                                        value={form.image_url}
                                        onChange={handleChange}
                                        placeholder="https://..."
                                    />

                                </div>


                                <div className="admin-form-group">

                                    <label>
                                        Description
                                    </label>

                                    <textarea
                                        name="description"
                                        value={
                                            form.description
                                        }
                                        onChange={handleChange}
                                        rows="4"
                                    />

                                </div>


                                <div className="admin-modal-actions">

                                    <button
                                        type="button"
                                        className="admin-cancel-button"
                                        onClick={closeForm}
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        className="admin-save-button"
                                    >
                                        {editingProduct
                                            ? "Update Product"
                                            : "Create Product"
                                        }
                                    </button>

                                </div>

                            </form>

                        </div>

                    </div>

                )}

            </main>

        </div>

    );

}

export default AdminProducts;