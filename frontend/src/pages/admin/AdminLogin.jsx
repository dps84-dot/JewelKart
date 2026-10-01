import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function AdminLogin() {

    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async (e) => {

        e.preventDefault();

        setError("");
        setLoading(true);

        try {

            const response = await axios.post(
                "http://localhost:5000/api/auth/login",
                {
                    email,
                    password
                }
            );

            const data = response.data;

            if (!data.success) {

                setError(
                    data.message || "Login failed"
                );

                return;
            }


            // -----------------------------------------
            // CHECK ADMIN ROLE
            // -----------------------------------------

            if (data.user.role !== "admin") {

                setError(
                    "Access denied. Admin account required."
                );

                return;
            }


            // -----------------------------------------
            // SAVE ADMIN SESSION
            // -----------------------------------------

            localStorage.setItem(
                "jewelkart_token",
                data.token
            );

            localStorage.setItem(
                "jewelkart_user",
                JSON.stringify(data.user)
            );


            // -----------------------------------------
            // REDIRECT
            // -----------------------------------------

            navigate("/admin/dashboard");

        } catch (error) {

            console.error(
                "Admin login error:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Unable to login"
            );

        } finally {

            setLoading(false);

        }

    };


    return (

        <div className="admin-login-page">

            <div className="admin-login-card">

                <h1>
                    JewelKart Admin
                </h1>

                <p>
                    Administrator Login
                </p>


                {error && (

                    <div className="admin-login-error">
                        {error}
                    </div>

                )}


                <form onSubmit={handleLogin}>

                    <div className="admin-form-group">

                        <label>
                            Email
                        </label>

                        <input
                            type="email"
                            value={email}
                            onChange={(e) =>
                                setEmail(e.target.value)
                            }
                            placeholder="Admin email"
                            required
                        />

                    </div>


                    <div className="admin-form-group">

                        <label>
                            Password
                        </label>

                        <input
                            type="password"
                            value={password}
                            onChange={(e) =>
                                setPassword(e.target.value)
                            }
                            placeholder="Admin password"
                            required
                        />

                    </div>


                    <button
                        type="submit"
                        disabled={loading}
                    >

                        {loading
                            ? "Logging in..."
                            : "Admin Login"
                        }

                    </button>

                </form>

            </div>

        </div>

    );

}

export default AdminLogin;