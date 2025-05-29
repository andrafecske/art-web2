import React, { useState } from 'react';
import {Link, useLocation, useNavigate} from 'react-router-dom';
import '../styles/Login.css';
import image from "../assets/home-bckg.png";

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const[isSuccessful, setIsSuccessful] = useState(false);
    let navigate = useNavigate();


    const handleLogin = async (e) => {
        e.preventDefault();

        try {

            const response = await fetch(`${process.env.REACT_APP_WEB_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({email, password}),
            });

            const data = await response.json();
            console.log("Login response data:", data);
            if(response.ok){
                setIsSuccessful(true);
                setMessage(data.message);
                setEmail('');
                setPassword('');

                localStorage.setItem('token', data.token);
                localStorage.setItem('userEmail', data.email);
                navigate('/');

            }
            else {
                setIsSuccessful(false);
                setMessage("Something went wrong");
            }
        }catch(error){
            setIsSuccessful(false);
            console.error("Error registering user:", error);
            setMessage( "Something went wrong");
        }

    };

    return (
        <div className="auth-page" style={{
            backgroundImage: `url(${image})`,
            backgroundSize: 'cover',       // ensures the whole image fits in the div
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center', height: '100vh',               // full height of the screen
            width: '100vw',                // full width of the screen
            display: 'flex',               // center the form
            justifyContent: 'center',
            alignItems: 'center',
        }}>
            <div className="auth-container" >
                <h2>Login</h2>
                <form onSubmit={handleLogin}>
                    <label>Email:</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />

                    <label>Password:</label>
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />

                    <button type="submit">Login</button>
                </form>

                {message && (
                    <p style={{ color: isSuccessful ? 'green' : 'red', marginTop: '1rem' }}>
                        {message}
                    </p>
                )}


                <p>
                    Don’t have an account? <Link to="/register">Register here</Link>
                </p>
            </div>
        </div>
    );
}

export default Login;
