import { useEffect, useState } from "react";
import axios from "axios";

import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminCustomers from "./pages/admin/AdminCustomers";

import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useParams,
  useNavigate
} from "react-router-dom";

import "./App.css";

const API_URL = "http://localhost:5000/api";


// =====================================================
// AUTH HELPERS
// =====================================================

const getStoredUser = () => {
  try {
    const user = localStorage.getItem("jewelkart_user");

    return user ? JSON.parse(user) : null;

  } catch (error) {

    return null;

  }
};


const getStoredToken = () => {

  return localStorage.getItem(
    "jewelkart_token"
  );

};


// =====================================================
// NAVBAR
// =====================================================

function Navbar() {

  const navigate = useNavigate();

  const [user, setUser] =
    useState(getStoredUser());


  useEffect(() => {

    const handleStorageChange = () => {

      setUser(getStoredUser());

    };

    window.addEventListener(
      "storage",
      handleStorageChange
    );

    return () => {

      window.removeEventListener(
        "storage",
        handleStorageChange
      );

    };

  }, []);


  const handleLogout = () => {

    localStorage.removeItem(
      "jewelkart_token"
    );

    localStorage.removeItem(
      "jewelkart_user"
    );

    setUser(null);

    navigate("/login");

  };


  return (

    <nav className="navbar">

      <div className="logo">

        <Link to="/">
          JewelKart
        </Link>

      </div>


      <div className="nav-links">

        <Link to="/">
          Home
        </Link>


        <a href="/#products">
          Products
        </a>


        <a href="/#about">
          About
        </a>


        <Link
          to="/cart"
          className="cart-btn"
        >
          🛒 Cart
        </Link>


        <Link
          to="/wishlist"
          className="wishlist-btn"
        >
          ♡ Wishlist
        </Link>


        {user ? (

          <>

            <span className="user-name">
              Hi, {user.name}
            </span>


            <button
              type="button"
              className="logout-btn"
              onClick={handleLogout}
            >
              Logout
            </button>

          </>

        ) : (

          <Link
            to="/login"
            className="login-nav-btn"
          >
            Login
          </Link>

        )}

      </div>

    </nav>

  );

}



// =====================================================
// HOME PAGE
// =====================================================

function Home() {

  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");

  const [selectedCategory, setSelectedCategory] =
    useState("All");


  // =========================================
  // FETCH PRODUCTS
  // =========================================

  useEffect(() => {

    fetchProducts();

  }, []);


  const fetchProducts = async () => {

    try {

      const response = await axios.get(
        `${API_URL}/products`
      );

      setProducts(
        response.data.products
      );

    } catch (error) {

      console.error(
        "Error fetching products:",
        error
      );

    } finally {

      setLoading(false);

    }

  };


  // =========================================
  // FILTER PRODUCTS
  // =========================================

  const filteredProducts = products.filter(
    (product) => {

      const searchText =
        searchTerm.trim().toLowerCase();


      const matchesSearch =
        product.name
          .toLowerCase()
          .includes(searchText) ||

        (product.description || "")
          .toLowerCase()
          .includes(searchText) ||

        (product.category_name || "")
          .toLowerCase()
          .includes(searchText);


      const matchesCategory =
        selectedCategory === "All" ||
        product.category_name === selectedCategory;


      return (
        matchesSearch &&
        matchesCategory
      );

    }
  );


  // =========================================
  // CATEGORY LIST
  // =========================================

  const categories = [
    "All",
    "Rings",
    "Necklaces",
    "Earrings",
    "Bracelets",
    "Chains"
  ];


  // =========================================
  // CLEAR FILTERS
  // =========================================

  const clearFilters = () => {

    setSearchTerm("");

    setSelectedCategory("All");

  };


  return (

    <div className="app">

      <Navbar />


      {/* =====================================
          HERO
      ====================================== */}

      <section className="hero">

        <div className="hero-content">

          <p className="hero-small">
            TIMELESS ELEGANCE
          </p>


          <h1>

            Find Jewelry
            <br />
            That Defines You

          </h1>


          <p className="hero-description">

            Discover beautifully crafted jewelry designed
            for every special moment.

          </p>


          <a
            href="#products"
            className="shop-btn"
          >
            Explore Collection
          </a>

        </div>

      </section>



      {/* =====================================
          PRODUCTS
      ====================================== */}

      <section
        className="products-section"
        id="products"
      >


        <div className="section-heading">

          <p>
            OUR COLLECTION
          </p>


          <h2>
            Featured Jewelry
          </h2>

        </div>



        {/* =================================
            SEARCH + CATEGORY FILTER
        ================================== */}

        <div className="product-filters">


          <div className="search-box">

            <span className="search-icon">
              🔍
            </span>


            <input
              type="text"
              placeholder="Search jewelry..."
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(e.target.value)
              }
            />


            {searchTerm && (

              <button
                type="button"
                className="clear-search"
                onClick={() =>
                  setSearchTerm("")
                }
              >
                ×
              </button>

            )}

          </div>



          <div className="category-filters">

            {categories.map((category) => (

              <button
                type="button"
                key={category}
                className={
                  selectedCategory === category
                    ? "category-filter active"
                    : "category-filter"
                }
                onClick={() =>
                  setSelectedCategory(category)
                }
              >

                {category}

              </button>

            ))}

          </div>

        </div>



        <div className="filter-result-row">

          <p>

            Showing{" "}

            <strong>
              {filteredProducts.length}
            </strong>{" "}

            {filteredProducts.length === 1
              ? "product"
              : "products"}

          </p>


          {(searchTerm ||
            selectedCategory !== "All") && (

            <button
              type="button"
              className="clear-filters"
              onClick={clearFilters}
            >

              Clear Filters

            </button>

          )}

        </div>



        {loading ? (

          <div className="loading">

            Loading products...

          </div>

        ) : filteredProducts.length === 0 ? (

          <div className="no-products">

            <div className="no-products-icon">
              🔍
            </div>


            <h3>
              No products found
            </h3>


            <p>

              Try another search term or
              choose a different category.

            </p>


            <button
              type="button"
              className="shop-btn"
              onClick={clearFilters}
            >

              View All Products

            </button>

          </div>

        ) : (

          <div className="products-grid">

            {filteredProducts.map((product) => (

              <Link
                to={`/product/${product.id}`}
                className="product-card"
                key={product.id}
              >


                <div className="product-image">

                  <img
                    src={product.image_url}
                    alt={product.name}
                  />

                </div>


                <div className="product-info">

                  <p className="category">

                    {product.category_name}

                  </p>


                  <h3>

                    {product.name}

                  </h3>


                  <p className="description">

                    {product.description}

                  </p>


                  <div className="product-bottom">

                    <span className="price">

                      ₹
                      {Number(
                        product.price
                      ).toLocaleString("en-IN")}

                    </span>


                    <span className="add-cart">

                      View Product

                    </span>

                  </div>


                </div>


              </Link>

            ))}

          </div>

        )}

      </section>



      {/* =====================================
          ABOUT
      ====================================== */}

      <section
        className="about"
        id="about"
      >

        <p>
          WHY JEWELKART
        </p>


        <h2>

          Jewelry made for
          <br />
          your special moments.

        </h2>


        <p>

          From timeless classics to modern designs,
          JewelKart brings beautiful jewelry closer to you.

        </p>

      </section>



      {/* =====================================
          FOOTER
      ====================================== */}

      <footer>

        <div className="footer-logo">
          JewelKart
        </div>


        <p>

          © 2026 JewelKart.
          All rights reserved.

        </p>

      </footer>


    </div>

  );

}



// =====================================================
// PRODUCT DETAILS
// =====================================================

function ProductDetails() {

  const { id } = useParams();


  const [product, setProduct] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [quantity, setQuantity] =
    useState(1);

  const [addingToCart, setAddingToCart] =
    useState(false);

  const [cartMessage, setCartMessage] =
    useState("");

  const [cartError, setCartError] =
    useState("");

  const [wishlistLoading, setWishlistLoading] =
    useState(false);

  const [wishlistMessage, setWishlistMessage] =
    useState("");

  const [wishlistError, setWishlistError] =
    useState("");

  const [isWishlisted, setIsWishlisted] =
    useState(false);


  useEffect(() => {

    fetchProduct();

  }, [id]);


  useEffect(() => {

    checkWishlist();

  }, [id]);


  const fetchProduct = async () => {

    try {

      const response = await axios.get(
        `${API_URL}/products/${id}`
      );

      setProduct(
        response.data.product
      );

    } catch (error) {

      console.error(
        "Error fetching product:",
        error
      );

    } finally {

      setLoading(false);

    }

  };


  const checkWishlist = async () => {

    const user = getStoredUser();

    if (!user) {
      setIsWishlisted(false);
      return;
    }

    try {

      const response = await axios.get(
        `${API_URL}/wishlist/${user.id}`
      );

      const wishlistItems =
        response.data.wishlist || [];

      const exists = wishlistItems.some(
        (item) =>
          Number(item.product_id) === Number(id)
      );

      setIsWishlisted(exists);

    } catch (error) {

      console.error(
        "Error checking wishlist:",
        error
      );

    }

  };


  const handleWishlist = async () => {

    const user = getStoredUser();

    if (!user) {

      navigate("/login");

      return;

    }

    if (!product) {
      return;
    }

    setWishlistLoading(true);

    setWishlistMessage("");
    setWishlistError("");

    try {

      if (isWishlisted) {

        const response = await axios.get(
          `${API_URL}/wishlist/${user.id}`
        );

        const wishlistItems =
          response.data.wishlist || [];

        const wishlistItem =
          wishlistItems.find(
            (item) =>
              Number(item.product_id) ===
              Number(product.id)
          );

        if (wishlistItem) {

          await axios.delete(
            `${API_URL}/wishlist/${wishlistItem.id}`
          );

        }

        setIsWishlisted(false);

        setWishlistMessage(
          `${product.name} removed from wishlist.`
        );

      } else {

        await axios.post(
          `${API_URL}/wishlist`,
          {
            user_id: user.id,
            product_id: product.id
          }
        );

        setIsWishlisted(true);

        setWishlistMessage(
          `${product.name} added to wishlist.`
        );

      }

    } catch (error) {

      console.error(
        "Wishlist error:",
        error
      );

      setWishlistError(
        error.response?.data?.message ||
        "Failed to update wishlist."
      );

    } finally {

      setWishlistLoading(false);

    }

  };


  const handleAddToCart = async () => {

    const user = getStoredUser();


    if (!user) {

      setCartError(
        "Please login before adding products to cart."
      );

      return;

    }


    if (!product || product.stock <= 0) {
      return;
    }


    setAddingToCart(true);

    setCartMessage("");

    setCartError("");


    try {

      const response = await axios.post(
        `${API_URL}/cart`,
        {
          user_id: user.id,
          product_id: product.id,
          quantity: quantity
        }
      );


      if (response.data.success) {

        setCartMessage(
          `${quantity} × ${product.name} added to cart successfully!`
        );

      }

    } catch (error) {

      console.error(
        "Error adding product to cart:",
        error
      );


      setCartError(
        error.response?.data?.message ||
        "Failed to add product to cart"
      );

    } finally {

      setAddingToCart(false);

    }

  };


  if (loading) {

    return (

      <div className="product-details-page">

        <div className="details-loading">
          Loading product...
        </div>

      </div>

    );

  }


  if (!product) {

    return (

      <div className="product-details-page">

        <div className="details-loading">

          <div>

            <h2>
              Product not found
            </h2>

            <br />

            <Link to="/">
              ← Back to Collection
            </Link>

          </div>

        </div>

      </div>

    );

  }


  return (

    <div className="product-details-page">

      <Navbar />


      <main className="product-details-container">


        <div className="details-image">

          <img
            src={product.image_url}
            alt={product.name}
          />

        </div>


        <div className="details-content">

          <p className="details-category">
            {product.category_name}
          </p>


          <h1>
            {product.name}
          </h1>


          <p className="details-price">

            ₹
            {Number(
              product.price
            ).toLocaleString("en-IN")}

          </p>


          <div className="details-line"></div>


          <p className="details-description">
            {product.description}
          </p>


          <div className="stock-info">

            {product.stock > 0 ? (

              <span>
                ✓ In Stock ({product.stock} available)
              </span>

            ) : (

              <span>
                ✕ Out of Stock
              </span>

            )}

          </div>


          {product.stock > 0 && (

            <div className="quantity-section">

              <span>
                Quantity
              </span>


              <div className="quantity-control">

                <button
                  type="button"
                  onClick={() => {

                    setQuantity(
                      Math.max(
                        1,
                        quantity - 1
                      )
                    );

                    setCartMessage("");
                    setCartError("");

                  }}
                >
                  −
                </button>


                <span>
                  {quantity}
                </span>


                <button
                  type="button"
                  onClick={() => {

                    setQuantity(
                      Math.min(
                        product.stock,
                        quantity + 1
                      )
                    );

                    setCartMessage("");
                    setCartError("");

                  }}
                >
                  +
                </button>

              </div>

            </div>

          )}


          <div className="details-buttons">

            <button
              type="button"
              className="details-cart-btn"
              disabled={
                product.stock === 0 ||
                addingToCart
              }
              onClick={handleAddToCart}
            >

              {addingToCart
                ? "Adding..."
                : "🛒 Add to Cart"}

            </button>


            <Link
              to="/cart"
              className="buy-now-btn"
            >
              Buy Now
            </Link>

          </div>


          <button
            type="button"
            className={
              isWishlisted
                ? "wishlist-detail-btn active"
                : "wishlist-detail-btn"
            }
            disabled={wishlistLoading}
            onClick={handleWishlist}
          >

            {wishlistLoading
              ? "Updating..."
              : isWishlisted
              ? "♥ Remove from Wishlist"
              : "♡ Add to Wishlist"}

          </button>


          {wishlistMessage && (

            <div className="wishlist-success">
              ✓ {wishlistMessage}
            </div>

          )}


          {wishlistError && (

            <div className="wishlist-error">
              ✕ {wishlistError}
            </div>

          )}


          {cartMessage && (

            <div className="cart-success">
              ✓ {cartMessage}
            </div>

          )}


          {cartError && (

            <div className="cart-error">
              ✕ {cartError}
            </div>

          )}


          <Link
            to="/"
            className="back-link"
          >
            ← Back to Collection
          </Link>

        </div>

      </main>

    </div>

  );

}



// =====================================================
// CART PAGE
// =====================================================

function Cart() {

  const navigate = useNavigate();

  const [cart, setCart] =
    useState([]);

  const [total, setTotal] =
    useState(0);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  const user = getStoredUser();


  const fetchCart = async () => {

    if (!user) {

      setLoading(false);
      return;

    }


    try {

      setLoading(true);

      setError("");


      const response = await axios.get(
        `${API_URL}/cart/${user.id}`
      );


      setCart(
        response.data.cart
      );


      setTotal(
        response.data.total
      );


    } catch (error) {

      console.error(
        "Error fetching cart:",
        error
      );


      setError(
        "Unable to load cart."
      );

    } finally {

      setLoading(false);

    }

  };


  useEffect(() => {

    if (!user) {

      navigate("/login");
      return;

    }


    fetchCart();

  }, []);


  const updateQuantity = async (
    cartId,
    newQuantity
  ) => {

    if (newQuantity < 1) {
      return;
    }


    try {

      await axios.put(
        `${API_URL}/cart/${cartId}`,
        {
          quantity: newQuantity
        }
      );


      await fetchCart();

    } catch (error) {

      console.error(
        "Error updating quantity:",
        error
      );

    }

  };


  const removeItem = async (
    cartId
  ) => {

    try {

      await axios.delete(
        `${API_URL}/cart/${cartId}`
      );


      await fetchCart();

    } catch (error) {

      console.error(
        "Error removing cart item:",
        error
      );

    }

  };


  if (!user) {

    return null;

  }


  if (loading) {

    return (

      <div className="cart-page">

        <Navbar />

        <div className="details-loading">
          Loading cart...
        </div>

      </div>

    );

  }


  return (

    <div className="cart-page">

      <Navbar />


      <main className="cart-container">


        <div className="section-heading">

          <p>
            YOUR SHOPPING BAG
          </p>


          <h1>
            Shopping Cart
          </h1>

        </div>


        {error && (

          <div className="cart-error">
            {error}
          </div>

        )}


        {cart.length === 0 ? (

          <div className="empty-cart">

            <div className="empty-cart-icon">
              🛒
            </div>


            <h2>
              Your cart is empty
            </h2>


            <p>

              Discover our beautiful jewellery
              collection and add something special.

            </p>


            <Link
              to="/"
              className="shop-btn"
            >
              Continue Shopping
            </Link>

          </div>

        ) : (

          <div className="cart-layout">


            <div className="cart-items">

              {cart.map((item) => (

                <div
                  className="cart-item"
                  key={item.id}
                >


                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="cart-item-image"
                  />


                  <div className="cart-item-info">


                    <p className="category">
                      Jewellery
                    </p>


                    <h3>
                      {item.name}
                    </h3>


                    <p>

                      ₹
                      {Number(
                        item.price
                      ).toLocaleString("en-IN")}

                    </p>


                    <div className="cart-item-actions">


                      <div className="quantity-control">

                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(
                              item.id,
                              item.quantity - 1
                            )
                          }
                        >
                          −
                        </button>


                        <span>
                          {item.quantity}
                        </span>


                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(
                              item.id,
                              item.quantity + 1
                            )
                          }
                        >
                          +
                        </button>

                      </div>


                      <button
                        type="button"
                        className="remove-button"
                        onClick={() =>
                          removeItem(item.id)
                        }
                      >
                        Remove
                      </button>

                    </div>

                  </div>


                  <div className="cart-item-subtotal">

                    ₹
                    {Number(
                      item.subtotal
                    ).toLocaleString("en-IN")}

                  </div>

                </div>

              ))}

            </div>


            <aside className="cart-summary">


              <h2>
                Order Summary
              </h2>


              <div className="summary-row">

                <span>
                  Subtotal
                </span>


                <strong>

                  ₹
                  {Number(
                    total
                  ).toLocaleString("en-IN")}

                </strong>

              </div>


              <div className="summary-row">

                <span>
                  Shipping
                </span>


                <span>
                  FREE
                </span>

              </div>


              <hr />


              <div className="summary-total">

                <span>
                  Total
                </span>


                <strong>

                  ₹
                  {Number(
                    total
                  ).toLocaleString("en-IN")}

                </strong>

              </div>


              <button
                type="button"
                className="checkout-button"
                onClick={() => navigate("/checkout")}
              >
                Proceed to Checkout
              </button>


              <Link
                to="/"
                className="continue-shopping"
              >
                ← Continue Shopping
              </Link>


            </aside>

          </div>

        )}

      </main>

    </div>

  );

}




// =====================================================
// CHECKOUT PAGE
// =====================================================

function Checkout() {

  const navigate = useNavigate();

  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [addressLoading, setAddressLoading] = useState(true);

  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [savingAddress, setSavingAddress] = useState(false);

  const [error, setError] = useState("");
  const [addressMessage, setAddressMessage] = useState("");
  const [addressError, setAddressError] = useState("");

  const [form, setForm] = useState({
    full_name: "",
    mobile: "",
    address_line: "",
    city: "",
    state: "",
    pincode: ""
  });

  const user = getStoredUser();

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    fetchCheckoutData();
  }, []);

  const fetchCheckoutData = async () => {
    try {
      setLoading(true);
      setAddressLoading(true);
      setError("");

      const [cartResponse, addressResponse] = await Promise.all([
        axios.get(`${API_URL}/cart/${user.id}`),
        axios.get(`${API_URL}/addresses/${user.id}`)
      ]);

      const cartItems = cartResponse.data.cart || [];
      const savedAddresses = addressResponse.data.addresses || [];

      setCart(cartItems);
      setTotal(Number(cartResponse.data.total || 0));
      setAddresses(savedAddresses);

      if (savedAddresses.length > 0) {
        setSelectedAddressId(savedAddresses[0].id);
      }
    } catch (error) {
      console.error("Error loading checkout:", error);
      setError(
        error.response?.data?.message ||
        "Unable to load checkout details."
      );
    } finally {
      setLoading(false);
      setAddressLoading(false);
    }
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  const resetAddressForm = () => {
    setForm({
      full_name: "",
      mobile: "",
      address_line: "",
      city: "",
      state: "",
      pincode: ""
    });

    setEditingAddressId(null);
    setShowAddressForm(false);
    setAddressError("");
  };

  const openAddAddressForm = () => {
    setForm({
      full_name: user?.name || "",
      mobile: "",
      address_line: "",
      city: "",
      state: "",
      pincode: ""
    });

    setEditingAddressId(null);
    setAddressError("");
    setAddressMessage("");
    setShowAddressForm(true);
  };

  const openEditAddressForm = (address) => {
    setForm({
      full_name: address.full_name || "",
      mobile: address.mobile || "",
      address_line: address.address_line || "",
      city: address.city || "",
      state: address.state || "",
      pincode: address.pincode || ""
    });

    setEditingAddressId(address.id);
    setAddressError("");
    setAddressMessage("");
    setShowAddressForm(true);
  };

  const saveAddress = async (event) => {
    event.preventDefault();

    setSavingAddress(true);
    setAddressError("");
    setAddressMessage("");

    try {
      if (editingAddressId) {
        const response = await axios.put(
          `${API_URL}/addresses/${editingAddressId}`,
          form
        );

        const updatedAddress = response.data.address;

        setAddresses((previous) =>
          previous.map((address) =>
            address.id === updatedAddress.id
              ? updatedAddress
              : address
          )
        );

        setSelectedAddressId(updatedAddress.id);
        setAddressMessage("Address updated successfully.");
      } else {
        const response = await axios.post(
          `${API_URL}/addresses`,
          {
            user_id: user.id,
            ...form
          }
        );

        const newAddress = response.data.address;

        setAddresses((previous) => [
          newAddress,
          ...previous
        ]);

        setSelectedAddressId(newAddress.id);
        setAddressMessage("Address added successfully.");
      }

      setShowAddressForm(false);
      setEditingAddressId(null);

      setForm({
        full_name: "",
        mobile: "",
        address_line: "",
        city: "",
        state: "",
        pincode: ""
      });
    } catch (error) {
      console.error("Error saving address:", error);

      setAddressError(
        error.response?.data?.message ||
        "Failed to save address."
      );
    } finally {
      setSavingAddress(false);
    }
  };

  const deleteAddress = async (addressId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this address?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await axios.delete(
        `${API_URL}/addresses/${addressId}`
      );

      const remainingAddresses = addresses.filter(
        (address) => address.id !== addressId
      );

      setAddresses(remainingAddresses);

      if (selectedAddressId === addressId) {
        setSelectedAddressId(
          remainingAddresses.length > 0
            ? remainingAddresses[0].id
            : null
        );
      }

      setAddressMessage("Address deleted successfully.");
    } catch (error) {
      console.error("Error deleting address:", error);

      setAddressError(
        error.response?.data?.message ||
        "Failed to delete address."
      );
    }
  };

  const selectedAddress = addresses.find(
    (address) =>
      Number(address.id) === Number(selectedAddressId)
  );

  // =========================================
  // PLACE ORDER
  // =========================================

  const placeOrder = async () => {

    if (!selectedAddressId) {
      setAddressError("Please select a delivery address.");
      return;
    }

    try {

      setSavingAddress(true);
      setAddressError("");
      setAddressMessage("");

      const response = await axios.post(
        `${API_URL}/orders`,
        {
          user_id: user.id,
          address_id: selectedAddressId
        }
      );

      if (response.data.success) {

        const orderId = response.data.order.id;

        navigate(`/order-success/${orderId}`, {
          state: {
            order: response.data.order
          }
        });

      }

    } catch (error) {

      console.error(
        "Error placing order:",
        error
      );

      setAddressError(
        error.response?.data?.message ||
        "Failed to place order. Please try again."
      );

    } finally {

      setSavingAddress(false);

    }
  };

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="checkout-page">
        <Navbar />
        <div className="details-loading">
          Loading checkout...
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="checkout-page">
        <Navbar />

        <main className="checkout-container">
          <div className="empty-checkout">
            <div className="empty-checkout-icon">
              🛒
            </div>

            <h2>Your cart is empty</h2>

            <p>
              Add some jewellery to your cart before checkout.
            </p>

            <Link
              to="/"
              className="shop-btn"
            >
              Continue Shopping
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="checkout-page">

      <Navbar />

      <main className="checkout-container">

        <div className="section-heading">
          <p>SECURE CHECKOUT</p>
          <h1>Checkout</h1>
        </div>

        {error && (
          <div className="checkout-error">
            ✕ {error}
          </div>
        )}

        {addressMessage && (
          <div className="checkout-success">
            ✓ {addressMessage}
          </div>
        )}

        {addressError && (
          <div className="checkout-error">
            ✕ {addressError}
          </div>
        )}

        <div className="checkout-layout">

          <div className="checkout-main">

            <section className="checkout-card">

              <div className="checkout-card-header">

                <div>
                  <p className="checkout-step">STEP 1</p>
                  <h2>Delivery Address</h2>
                </div>

                {!showAddressForm && (
                  <button
                    type="button"
                    className="add-address-button"
                    onClick={openAddAddressForm}
                  >
                    + Add New Address
                  </button>
                )}

              </div>

              {addressLoading ? (
                <div className="checkout-loading">
                  Loading addresses...
                </div>
              ) : showAddressForm ? (

                <form
                  className="address-form"
                  onSubmit={saveAddress}
                >

                  <h3>
                    {editingAddressId
                      ? "Edit Address"
                      : "Add New Address"}
                  </h3>

                  <div className="address-form-grid">

                    <div className="form-group">
                      <label>Full Name</label>

                      <input
                        type="text"
                        name="full_name"
                        value={form.full_name}
                        onChange={handleFormChange}
                        placeholder="Enter full name"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Mobile Number</label>

                      <input
                        type="tel"
                        name="mobile"
                        value={form.mobile}
                        onChange={handleFormChange}
                        placeholder="Enter mobile number"
                        maxLength="15"
                        required
                      />
                    </div>

                    <div className="form-group address-full-width">
                      <label>Address</label>

                      <textarea
                        name="address_line"
                        value={form.address_line}
                        onChange={handleFormChange}
                        placeholder="House / Flat / Street / Area"
                        rows="3"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>City</label>

                      <input
                        type="text"
                        name="city"
                        value={form.city}
                        onChange={handleFormChange}
                        placeholder="Enter city"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>State</label>

                      <input
                        type="text"
                        name="state"
                        value={form.state}
                        onChange={handleFormChange}
                        placeholder="Enter state"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Pincode</label>

                      <input
                        type="text"
                        name="pincode"
                        value={form.pincode}
                        onChange={handleFormChange}
                        placeholder="Enter pincode"
                        maxLength="10"
                        required
                      />
                    </div>

                  </div>

                  <div className="address-form-actions">

                    <button
                      type="submit"
                      className="save-address-button"
                      disabled={savingAddress}
                    >
                      {savingAddress
                        ? "Saving..."
                        : editingAddressId
                        ? "Update Address"
                        : "Save Address"}
                    </button>

                    <button
                      type="button"
                      className="cancel-address-button"
                      onClick={resetAddressForm}
                      disabled={savingAddress}
                    >
                      Cancel
                    </button>

                  </div>

                </form>

              ) : addresses.length === 0 ? (

                <div className="no-addresses">

                  <div className="no-address-icon">
                    📍
                  </div>

                  <h3>No saved address</h3>

                  <p>
                    Add a delivery address to continue.
                  </p>

                  <button
                    type="button"
                    className="add-address-button"
                    onClick={openAddAddressForm}
                  >
                    + Add Delivery Address
                  </button>

                </div>

              ) : (

                <div className="address-list">

                  {addresses.map((address) => (

                    <div
                      key={address.id}
                      className={
                        Number(selectedAddressId) === Number(address.id)
                          ? "address-card selected"
                          : "address-card"
                      }
                    >

                      <label className="address-select">

                        <input
                          type="radio"
                          name="selectedAddress"
                          checked={
                            Number(selectedAddressId) ===
                            Number(address.id)
                          }
                          onChange={() =>
                            setSelectedAddressId(address.id)
                          }
                        />

                        <span className="address-radio"></span>

                      </label>

                      <div className="address-details">

                        <div className="address-name-row">

                          <h3>
                            {address.full_name}
                          </h3>

                          {Number(selectedAddressId) ===
                            Number(address.id) && (
                            <span className="selected-badge">
                              Selected
                            </span>
                          )}

                        </div>

                        <p className="address-mobile">
                          📞 {address.mobile}
                        </p>

                        <p>
                          {address.address_line}
                        </p>

                        <p>
                          {address.city}, {address.state} - {address.pincode}
                        </p>

                        <div className="address-actions">

                          <button
                            type="button"
                            onClick={() =>
                              openEditAddressForm(address)
                            }
                          >
                            ✏️ Edit
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              deleteAddress(address.id)
                            }
                          >
                            🗑️ Delete
                          </button>

                        </div>

                      </div>

                    </div>

                  ))}

                </div>

              )}

            </section>

            <section className="checkout-card">

              <div className="checkout-card-header">

                <div>
                  <p className="checkout-step">STEP 2</p>
                  <h2>Review Your Items</h2>
                </div>

              </div>

              <div className="checkout-items">

                {cart.map((item) => (

                  <div
                    className="checkout-item"
                    key={item.id}
                  >

                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="checkout-item-image"
                    />

                    <div className="checkout-item-info">

                      <h3>{item.name}</h3>

                      <p>
                        Quantity: {item.quantity}
                      </p>

                      <span>
                        ₹{Number(item.price).toLocaleString("en-IN")} each
                      </span>

                    </div>

                    <strong className="checkout-item-total">
                      ₹{Number(item.subtotal).toLocaleString("en-IN")}
                    </strong>

                  </div>

                ))}

              </div>

            </section>

            <section className="checkout-card">

              <div className="checkout-card-header">

                <div>
                  <p className="checkout-step">STEP 3</p>
                  <h2>Payment Method</h2>
                </div>

              </div>

              <div className="payment-placeholder">

                <div className="payment-icon">
                  💳
                </div>

                <div>
                  <h3>Cash on Delivery</h3>
                  <p>
                    Payment integration will be added in the next stage.
                  </p>
                </div>

              </div>

            </section>

          </div>

          <aside className="checkout-summary">

            <h2>Order Summary</h2>

            <div className="summary-row">

              <span>Items</span>

              <strong>
                {cart.reduce(
                  (sum, item) =>
                    sum + Number(item.quantity),
                  0
                )}
              </strong>

            </div>

            <div className="summary-row">

              <span>Subtotal</span>

              <strong>
                ₹{Number(total).toLocaleString("en-IN")}
              </strong>

            </div>

            <div className="summary-row">

              <span>Shipping</span>

              <span>FREE</span>

            </div>

            <hr />

            <div className="summary-total">

              <span>Total</span>

              <strong>
                ₹{Number(total).toLocaleString("en-IN")}
              </strong>

            </div>

            {selectedAddress && (

              <div className="selected-address-summary">

                <p>DELIVERY TO</p>

                <strong>
                  {selectedAddress.full_name}
                </strong>

                <span>
                  {selectedAddress.address_line}
                </span>

                <span>
                  {selectedAddress.city}, {selectedAddress.state}
                  {" - "}
                  {selectedAddress.pincode}
                </span>

                <span>
                  📞 {selectedAddress.mobile}
                </span>

              </div>

            )}

            <button
              type="button"
              className="place-order-button"
              disabled={!selectedAddressId || savingAddress}
              onClick={placeOrder}
            >
              {savingAddress
                ? "Placing Order..."
                : selectedAddressId
                ? "Place Order"
                : "Select Delivery Address"}
            </button>

            <button
              type="button"
              className="checkout-back-button"
              onClick={() => navigate("/cart")}
            >
              ← Back to Cart
            </button>

          </aside>

        </div>

      </main>

    </div>
  );
}



// =====================================================
// MY ORDERS PAGE
// =====================================================

function Orders() {

  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const user = getStoredUser();


  // =========================================
  // FETCH USER ORDERS
  // =========================================

  useEffect(() => {

    if (!user) {
      navigate("/login");
      return;
    }

    fetchOrders();

  }, []);


  const fetchOrders = async () => {

    try {

      setLoading(true);
      setError("");

      const response = await axios.get(
        `${API_URL}/orders/${user.id}`
      );

      setOrders(
        response.data.orders || []
      );

    } catch (error) {

      console.error(
        "Error fetching orders:",
        error
      );

      setError(
        error.response?.data?.message ||
        "Failed to load your orders."
      );

    } finally {

      setLoading(false);

    }

  };


  if (!user) {
    return null;
  }


  // =========================================
  // LOADING
  // =========================================

  if (loading) {

    return (

      <div className="orders-page">

        <Navbar />

        <div className="details-loading">
          Loading your orders...
        </div>

      </div>

    );

  }


  // =========================================
  // ORDERS PAGE
  // =========================================

  return (

    <div className="orders-page">

      <Navbar />

      <main className="orders-container">


        <div className="section-heading">

          <p>
            YOUR PURCHASES
          </p>

          <h1>
            My Orders
          </h1>

        </div>


        {error && (

          <div className="orders-error">
            ✕ {error}
          </div>

        )}


        {orders.length === 0 ? (

          <div className="empty-orders">

            <div className="empty-orders-icon">
              📦
            </div>

            <h2>
              No Orders Yet
            </h2>

            <p>
              You haven't placed any orders yet.
            </p>

            <Link
              to="/products"
              className="shop-btn"
            >
              Start Shopping
            </Link>

          </div>

        ) : (

          <div className="orders-list">

            {orders.map((order) => (

              <article
                className="order-card"
                key={order.id}
              >

                <div className="order-card-header">

                  <div>

                    <p className="order-label">
                      ORDER
                    </p>

                    <h2>
                      #{order.id}
                    </h2>

                  </div>


                  <span
                    className={`order-status ${String(
                      order.status || ""
                    ).toLowerCase()}`}
                  >
                    {order.status}
                  </span>

                </div>


                <div className="order-card-info">

                  <div>

                    <span>
                      Order Date
                    </span>

                    <strong>
                      {new Date(
                        order.created_at
                      ).toLocaleDateString(
                        "en-IN",
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric"
                        }
                      )}
                    </strong>

                  </div>


                  <div>

                    <span>
                      Total Amount
                    </span>

                    <strong>
                      ₹{Number(
                        order.total_amount
                      ).toLocaleString("en-IN")}
                    </strong>

                  </div>


                  <div>

                    <span>
                      Delivery
                    </span>

                    <strong>
                      {order.status === "pending"
                        ? "Order received"
                        : order.status}
                    </strong>

                  </div>

                </div>


                <div className="order-address">

                  <p>
                    DELIVERY ADDRESS
                  </p>

                  <span>
                    {order.shipping_address}
                  </span>

                </div>


                <div className="order-card-actions">

                  <button
                    type="button"
                    className="view-order-button"
                    onClick={() =>
                      navigate(
                        `/orders/${order.id}`
                      )
                    }
                  >
                    View Details
                  </button>

                </div>

              </article>

            ))}

          </div>

        )}

      </main>

    </div>

  );

}


// =====================================================
// ORDER DETAILS PAGE
// =====================================================

function OrderDetails() {

  const { orderId } = useParams();

  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const user = getStoredUser();


  useEffect(() => {

    if (!user) {
      navigate("/login");
      return;
    }

    fetchOrderDetails();

  }, [orderId]);


  const fetchOrderDetails = async () => {

    try {

      setLoading(true);
      setError("");

      const response = await axios.get(
        `${API_URL}/orders/details/${orderId}`
      );

      const fetchedOrder =
        response.data.order;

      // Prevent a logged-in customer from viewing
      // another user's order through the URL.
      if (
        Number(fetchedOrder.user_id) !==
        Number(user.id)
      ) {

        setError(
          "You are not authorized to view this order."
        );

        return;

      }

      setOrder(fetchedOrder);
      setItems(
        response.data.items || []
      );

    } catch (error) {

      console.error(
        "Error fetching order details:",
        error
      );

      setError(
        error.response?.data?.message ||
        "Failed to load order details."
      );

    } finally {

      setLoading(false);

    }

  };


  if (!user) {
    return null;
  }


  if (loading) {

    return (

      <div className="order-details-page">

        <Navbar />

        <div className="details-loading">
          Loading order details...
        </div>

      </div>

    );

  }


  if (error || !order) {

    return (

      <div className="order-details-page">

        <Navbar />

        <main className="order-details-container">

          <div className="order-details-error">

            <div className="empty-orders-icon">
              ⚠️
            </div>

            <h2>
              Unable to Load Order
            </h2>

            <p>
              {error || "Order not found."}
            </p>

            <button
              type="button"
              className="view-order-button"
              onClick={() =>
                navigate("/orders")
              }
            >
              ← Back to My Orders
            </button>

          </div>

        </main>

      </div>

    );

  }


  return (

    <div className="order-details-page">

      <Navbar />

      <main className="order-details-container">


        <button
          type="button"
          className="back-orders-button"
          onClick={() =>
            navigate("/orders")
          }
        >
          ← Back to My Orders
        </button>


        <div className="order-details-header">

          <div>

            <p className="order-label">
              ORDER
            </p>

            <h1>
              #{order.id}
            </h1>

          </div>


          <span
            className={`order-status ${String(
              order.status || ""
            ).toLowerCase()}`}
          >
            {order.status}
          </span>

        </div>


        <div className="order-details-grid">


          {/* =====================================
              ITEMS
          ====================================== */}

          <section className="order-details-card">

            <div className="order-details-card-header">

              <div>

                <p className="order-label">
                  ORDER ITEMS
                </p>

                <h2>
                  {items.length}{" "}
                  {items.length === 1
                    ? "Product"
                    : "Products"}
                </h2>

              </div>

            </div>


            <div className="order-items-list">

              {items.map((item) => (

                <div
                  className="order-item"
                  key={item.id}
                >

                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="order-item-image"
                  />


                  <div className="order-item-info">

                    <h3>
                      {item.name}
                    </h3>

                    <p>
                      Quantity: {item.quantity}
                    </p>

                    <span>
                      ₹{Number(
                        item.price
                      ).toLocaleString("en-IN")}
                      {" "}each
                    </span>

                  </div>


                  <strong>
                    ₹{Number(
                      item.price
                    * Number(item.quantity)
                    ).toLocaleString("en-IN")}
                  </strong>

                </div>

              ))}

            </div>

          </section>


          {/* =====================================
              ORDER SUMMARY
          ====================================== */}

          <aside className="order-details-summary">

            <h2>
              Order Summary
            </h2>


            <div className="order-summary-row">

              <span>
                Order ID
              </span>

              <strong>
                #{order.id}
              </strong>

            </div>


            <div className="order-summary-row">

              <span>
                Date
              </span>

              <strong>
                {new Date(
                  order.created_at
                ).toLocaleDateString(
                  "en-IN",
                  {
                    day: "2-digit",
                    month: "short",
                    year: "numeric"
                  }
                )}
              </strong>

            </div>


            <div className="order-summary-row">

              <span>
                Status
              </span>

              <strong>
                {order.status}
              </strong>

            </div>


            <hr />


            <div className="order-summary-total">

              <span>
                Total
              </span>

              <strong>
                ₹{Number(
                  order.total_amount
                ).toLocaleString("en-IN")}
              </strong>

            </div>


            <div className="order-details-address">

              <p>
                DELIVERY ADDRESS
              </p>

              <span>
                {order.shipping_address}
              </span>

            </div>


            <button
              type="button"
              className="continue-shopping"
              onClick={() =>
                navigate("/products")
              }
            >
              Continue Shopping
            </button>

          </aside>


        </div>

      </main>

    </div>

  );

}


// =====================================================
// ORDER SUCCESS PAGE
// =====================================================

function OrderSuccess() {

  const { orderId } = useParams();

  const [order, setOrder] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {

    fetchOrder();

  }, [orderId]);


  const fetchOrder = async () => {

    try {

      const response = await axios.get(
        `${API_URL}/orders/details/${orderId}`
      );

      setOrder(response.data.order);

    } catch (error) {

      console.error(
        "Error fetching order:",
        error
      );

      setError(
        "Unable to load order details."
      );

    } finally {

      setLoading(false);

    }

  };


  if (loading) {

    return (

      <div className="order-success-page">

        <Navbar />

        <div className="details-loading">
          Loading order...
        </div>

      </div>

    );

  }


  if (error || !order) {

    return (

      <div className="order-success-page">

        <Navbar />

        <main className="order-success-container">

          <div className="order-success-card">

            <div className="order-success-icon">
              ⚠️
            </div>

            <h1>
              Order Not Found
            </h1>

            <p>
              {error || "We could not find this order."}
            </p>

            <Link
              to="/"
              className="shop-btn"
            >
              Continue Shopping
            </Link>

          </div>

        </main>

      </div>

    );

  }


  return (

    <div className="order-success-page">

      <Navbar />

      <main className="order-success-container">

        <div className="order-success-card">

          <div className="order-success-icon">
            ✓
          </div>

          <p className="checkout-step">
            ORDER CONFIRMED
          </p>

          <h1>
            Thank You for Your Order!
          </h1>

          <p>
            Your order has been placed successfully.
          </p>

          <div className="order-number">
            Order #{order.id}
          </div>


          <div className="success-order-details">

            <div>
              <span>Status</span>
              <strong>{order.status}</strong>
            </div>

            <div>
              <span>Total Amount</span>
              <strong>
                ₹{Number(
                  order.total_amount
                ).toLocaleString("en-IN")}
              </strong>
            </div>

          </div>


          <div className="success-address">

            <p>
              DELIVERY ADDRESS
            </p>

            <span>
              {order.shipping_address}
            </span>

          </div>


          <div className="success-actions">

            <Link
              to="/orders"
              className="shop-btn"
            >
              View My Orders
            </Link>

            <Link
              to="/"
              className="continue-shopping"
            >
              Continue Shopping
            </Link>

          </div>

        </div>

      </main>

    </div>

  );

}


// =====================================================
// WISHLIST PAGE
// =====================================================

function Wishlist() {

  const navigate = useNavigate();

  const [wishlist, setWishlist] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const user = getStoredUser();


  useEffect(() => {

    if (!user) {

      navigate("/login");

      return;

    }

    fetchWishlist();

  }, []);


  const fetchWishlist = async () => {

    if (!user) {
      return;
    }

    try {

      setLoading(true);

      setError("");

      const response = await axios.get(
        `${API_URL}/wishlist/${user.id}`
      );

      setWishlist(
        response.data.wishlist || []
      );

    } catch (error) {

      console.error(
        "Error fetching wishlist:",
        error
      );

      setError(
        "Unable to load wishlist."
      );

    } finally {

      setLoading(false);

    }

  };


  const removeFromWishlist = async (
    wishlistId
  ) => {

    try {

      await axios.delete(
        `${API_URL}/wishlist/${wishlistId}`
      );

      await fetchWishlist();

    } catch (error) {

      console.error(
        "Error removing wishlist item:",
        error
      );

      setError(
        error.response?.data?.message ||
        "Failed to remove item from wishlist."
      );

    }

  };


  const addToCart = async (item) => {

    if (!user) {

      navigate("/login");

      return;

    }

    try {

      await axios.post(
        `${API_URL}/cart`,
        {
          user_id: user.id,
          product_id: item.product_id,
          quantity: 1
        }
      );

      alert(
        `${item.name} added to cart successfully!`
      );

    } catch (error) {

      console.error(
        "Error adding wishlist item to cart:",
        error
      );

      alert(
        error.response?.data?.message ||
        "Failed to add product to cart."
      );

    }

  };


  if (!user) {
    return null;
  }


  if (loading) {

    return (

      <div className="wishlist-page">

        <Navbar />

        <div className="details-loading">
          Loading wishlist...
        </div>

      </div>

    );

  }


  return (

    <div className="wishlist-page">

      <Navbar />


      <main className="wishlist-container">


        <div className="section-heading">

          <p>
            YOUR SAVED ITEMS
          </p>

          <h1>
            My Wishlist
          </h1>

        </div>


        {error && (

          <div className="wishlist-error">
            {error}
          </div>

        )}


        {wishlist.length === 0 ? (

          <div className="empty-wishlist">

            <div className="empty-wishlist-icon">
              ♡
            </div>

            <h2>
              Your wishlist is empty
            </h2>

            <p>
              Save your favourite jewellery here
              and come back to it anytime.
            </p>

            <Link
              to="/"
              className="shop-btn"
            >
              Explore Collection
            </Link>

          </div>

        ) : (

          <div className="wishlist-grid">

            {wishlist.map((item) => (

              <div
                className="wishlist-card"
                key={item.id}
              >

                <Link
                  to={`/product/${item.product_id}`}
                  className="wishlist-image-link"
                >

                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="wishlist-image"
                  />

                </Link>


                <div className="wishlist-card-content">

                  <p className="category">
                    {item.category_name}
                  </p>


                  <Link
                    to={`/product/${item.product_id}`}
                    className="wishlist-product-name"
                  >
                    {item.name}
                  </Link>


                  <p className="wishlist-description">
                    {item.description}
                  </p>


                  <p className="wishlist-price">

                    ₹
                    {Number(
                      item.price
                    ).toLocaleString("en-IN")}

                  </p>


                  <div className="wishlist-actions">

                    <button
                      type="button"
                      className="wishlist-cart-button"
                      onClick={() =>
                        addToCart(item)
                      }
                    >
                      🛒 Add to Cart
                    </button>


                    <button
                      type="button"
                      className="wishlist-remove-button"
                      onClick={() =>
                        removeFromWishlist(item.id)
                      }
                    >
                      ♥ Remove
                    </button>

                  </div>

                </div>

              </div>

            ))}

          </div>

        )}

      </main>

    </div>

  );

}



// =====================================================
// AUTH PAGE
// =====================================================

function AuthPage() {

  const navigate = useNavigate();


  const [mode, setMode] =
    useState("login");


  const [name, setName] =
    useState("");


  const [email, setEmail] =
    useState("");


  const [password, setPassword] =
    useState("");


  const [confirmPassword, setConfirmPassword] =
    useState("");


  const [loading, setLoading] =
    useState(false);


  const [error, setError] =
    useState("");


  const [success, setSuccess] =
    useState("");


  const handleSubmit = async (event) => {

    event.preventDefault();


    setError("");
    setSuccess("");


    // REGISTER

    if (mode === "register") {


      if (password !== confirmPassword) {

        setError(
          "Passwords do not match."
        );

        return;

      }


      if (password.length < 6) {

        setError(
          "Password must be at least 6 characters."
        );

        return;

      }

    }


    setLoading(true);


    try {


      if (mode === "register") {


        const response = await axios.post(
          `${API_URL}/auth/register`,
          {
            name,
            email,
            password
          }
        );


        if (response.data.success) {

          setSuccess(
            "Registration successful! Please login."
          );


          setMode("login");

          setName("");

          setPassword("");

          setConfirmPassword("");

        }

      } else {


        const response = await axios.post(
          `${API_URL}/auth/login`,
          {
            email,
            password
          }
        );


        if (response.data.success) {


          localStorage.setItem(
            "jewelkart_token",
            response.data.token
          );


          localStorage.setItem(
            "jewelkart_user",
            JSON.stringify(
              response.data.user
            )
          );


          setSuccess(
            "Login successful!"
          );


          navigate("/");

          window.location.reload();

        }

      }


    } catch (error) {

      console.error(
        "Authentication error:",
        error
      );


      setError(
        error.response?.data?.message ||
        "Something went wrong."
      );

    } finally {

      setLoading(false);

    }

  };


  return (

    <div className="auth-page">

      <Navbar />


      <div className="auth-container">


        <div className="auth-card">


          <div className="auth-header">

            <p>
              JEWELKART ACCOUNT
            </p>


            <h1>

              {mode === "login"
                ? "Welcome Back"
                : "Create Account"}

            </h1>


            <span>

              {mode === "login"
                ? "Login to continue shopping"
                : "Join JewelKart and start shopping"}

            </span>

          </div>


          {/* MODE BUTTONS */}

          <div className="auth-tabs">

            <button
              type="button"
              className={
                mode === "login"
                  ? "active"
                  : ""
              }
              onClick={() => {

                setMode("login");

                setError("");

                setSuccess("");

              }}
            >
              Login
            </button>


            <button
              type="button"
              className={
                mode === "register"
                  ? "active"
                  : ""
              }
              onClick={() => {

                setMode("register");

                setError("");

                setSuccess("");

              }}
            >
              Register
            </button>

          </div>


          <form
            className="auth-form"
            onSubmit={handleSubmit}
          >


            {mode === "register" && (

              <div className="form-group">

                <label>
                  Full Name
                </label>


                <input
                  type="text"
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                  placeholder="Enter your name"
                  required
                />

              </div>

            )}


            <div className="form-group">

              <label>
                Email
              </label>


              <input
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                placeholder="Enter your email"
                required
              />

            </div>


            <div className="form-group">

              <label>
                Password
              </label>


              <input
                type="password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                placeholder="Enter your password"
                required
              />

            </div>


            {mode === "register" && (

              <div className="form-group">

                <label>
                  Confirm Password
                </label>


                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(
                      e.target.value
                    )
                  }
                  placeholder="Confirm your password"
                  required
                />

              </div>

            )}


            {error && (

              <div className="auth-error">

                ✕ {error}

              </div>

            )}


            {success && (

              <div className="auth-success">

                ✓ {success}

              </div>

            )}


            <button
              type="submit"
              className="auth-submit"
              disabled={loading}
            >

              {loading
                ? "Please wait..."
                : mode === "login"
                ? "Login"
                : "Create Account"}

            </button>


          </form>


          <p className="auth-footer">

            {mode === "login"
              ? "Don't have an account?"
              : "Already have an account?"}


            <button
              type="button"
              onClick={() => {

                setMode(
                  mode === "login"
                    ? "register"
                    : "login"
                );

                setError("");
                setSuccess("");

              }}
            >

              {mode === "login"
                ? " Register"
                : " Login"}

            </button>

          </p>


        </div>

      </div>

    </div>

  );

}



// =====================================================
// MAIN APP
// =====================================================

function App() {

  return (

    <BrowserRouter>

      <Routes>


        <Route
          path="/"
          element={<Home />}
        />


        <Route
          path="/product/:id"
          element={<ProductDetails />}
        />


        <Route
          path="/cart"
          element={<Cart />}
        />


        <Route
          path="/checkout"
          element={<Checkout />}
        />


        <Route
          path="/order-success/:orderId"
          element={<OrderSuccess />}
        />


        <Route
          path="/orders"
          element={<Orders />}
        />


        <Route
          path="/orders/:orderId"
          element={<OrderDetails />}
        />


        <Route
          path="/wishlist"
          element={<Wishlist />}
        />


        <Route
          path="/login"
          element={<AuthPage />}
        />


        <Route
          path="/register"
          element={<AuthPage />}
        />

        <Route
          path="/admin/login"
          element={<AdminLogin />}
        />


        <Route
          path="/admin/dashboard"
          element={<AdminDashboard />}
        />

        <Route
          path="/admin/products"
          element={<AdminProducts />}
        />

        <Route
          path="/admin/orders"
          element={<AdminOrders />}
        />

        <Route
          path="/admin/customers"
          element={<AdminCustomers />}
        />


      </Routes>

    </BrowserRouter>

  );

}


export default App;