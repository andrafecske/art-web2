import React, { useState } from 'react';
import {Link, useNavigate} from 'react-router-dom';
import '../styles/Login.css';
import image from "../assets/home-bckg.png";

function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [isSuccessful, setIsSuccessful] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setMessage('Passwords do not match');
            setIsSuccessful(false);
            return;
        }

        const userData = { email, password };
        try {
            const response = await fetch(`${process.env.REACT_APP_WEB_URL}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            const data = await response.json();

            if (response.status === 201) {
                // Successful registration
                setMessage('Registration successful!');
                setIsSuccessful(true);

                // Clear the form fields
                setEmail('');
                setPassword('');
                setConfirmPassword('');
            } else {
                setMessage(data.error || 'Failed to register');
                setIsSuccessful(false);
            }
        } catch (error) {
            console.log(error);
            setMessage('An error occurred while registering');
            setIsSuccessful(false);
        }
    };

    return (
        <div style={{
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
            <h2>Create Account</h2>
            <form onSubmit={handleRegister}>

                <label>Email:</label>
                <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                />

                <label>Password:</label>
                <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                />

                <label>Confirm Password:</label>
                <input
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                />

                <button type="submit">Register</button>
            </form>

            {message && (
                <p style={{ color: isSuccessful ? 'green' : 'red' }}>
                    {message}
                </p>
            )}

            <p>
                Already have an account? <Link to="/login">Login here</Link>
            </p>

        </div>
        </div>
    );
}

export default Register;
