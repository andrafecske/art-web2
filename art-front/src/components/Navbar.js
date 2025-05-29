import React, { useEffect, useState } from 'react';
import logo from '../assets/file.svg';
import { Link, useLocation, useNavigate } from "react-router-dom";
import ReorderIcon from '@mui/icons-material/Reorder';
import '../styles/Navbar.css';

const Navbar = () => {
    const [openLinks, setOpenLinks] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const token = localStorage.getItem('token');
        setIsLoggedIn(!!token);
        setOpenLinks(false); // Close dropdown when route changes
    }, [location]);

    const toggleNavbar = () => {
        setOpenLinks(prev => !prev);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        setIsLoggedIn(false);
        navigate('/login');
    };

    // Close dropdown when any link is clicked
    const handleLinkClick = () => {
        setOpenLinks(false);
    };

    return (
        <div className="navbar">
            <div className="leftSide">
                <img src={logo} alt="logo" className="logo" />
            </div>
            <div className="rightSide">
                <div className="desktopLinks">
                    <Link to="/">Home</Link>
                    <Link to="/paintings">Paintings</Link>
                    <Link to="/contact">Contact</Link>
                    {isLoggedIn ? (
                        <>
                            <button onClick={handleLogout}>Sign Out</button>
                            <Link to="/favorites">Favorites</Link>
                        </>
                    ) : (
                        <Link to="/login">Login</Link>
                    )}
                </div>

                <button className="menuToggle" onClick={toggleNavbar}>
                    <ReorderIcon />
                </button>
            </div>

            {openLinks && (
                <div className="mobileDropdown">
                    <Link to="/" onClick={handleLinkClick}>Home</Link>
                    <Link to="/paintings" onClick={handleLinkClick}>Paintings</Link>
                    <Link to="/contact" onClick={handleLinkClick}>Contact</Link>
                    {isLoggedIn ? (
                        <>
                            <button onClick={() => { handleLogout(); setOpenLinks(false); }}>
                                Sign Out
                            </button>
                            <Link to="/favorites" onClick={handleLinkClick}>Favorites</Link>
                        </>
                    ) : (
                        <Link to="/login" onClick={handleLinkClick}>Login</Link>
                    )}
                </div>
            )}
        </div>
    );
};

export default Navbar;
