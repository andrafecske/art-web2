import React, {useEffect} from 'react'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'; // outline
import FavoriteIcon from '@mui/icons-material/Favorite'; // filled
import '../styles/Paintings.css';
import { Link } from "react-router-dom";
import {IconButton} from "@mui/material";

function PaintingItem({id, image, name, dimension, price}) {

    const [isFavorited, setIsFavorited] = React.useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token");

        fetch(`${process.env.REACT_APP_WEB_URL}/api/favorites`, {
            credentials: 'include',
            headers: {
                'Authorization': 'Bearer ' + token,
            },
        })
            .then(res => {
                if (!res.ok) {
                    throw new Error('Unauthorized or other error');
                }
                return res.json();
            })
            .then(favorites => {
                if (Array.isArray(favorites)) {
                    const found = favorites.find(p => p.id === id);
                    setIsFavorited(!!found);
                } else {
                    setIsFavorited(false);
                }
            })
            .catch(err => {
                console.error('Error fetching favorites:', err);
                setIsFavorited(false);
            });
    }, [id]);


    async function toggleFavorite(paintingId) {
        if (!paintingId) {
            alert("Error: paintingId is missing!");
            return;
        }
        try {
            console.log("Toggling favorite for:", paintingId);
            const yourToken = localStorage.getItem("token");
            const response = await fetch(`${process.env.REACT_APP_WEB_URL}/api/favorites`, {
                method: 'POST', // or DELETE for removing favorite
                headers: {
                    'Content-Type': 'application/json',
                    // include auth token if you use one
                    'Authorization': 'Bearer ' + yourToken,
                },
                body: JSON.stringify({ paintingId }),
                credentials: 'include', // if backend uses cookies/session
            });

            if (!response.ok) {
                const text = await response.text();
                console.error('Server error response:', text);
                throw new Error(`Failed with status ${response.status}`);
            }

            const data = await response.json();
            console.log('Favorite toggled successfully:', data);
            setIsFavorited(prev => !prev);
            // update UI state as needed

        } catch (error) {
            console.error('Failed to toggle favorite:', error);
            alert('Could not toggle favorite. Check console for details.');
        }
    }

    return (

        <div className="painting-item">
            <Link to={`/paintings/${id}`} className="painting-link">
                <img src = {image} alt = {name}/>
            </Link>
                <h1> {name}</h1>
                <h2>{dimension}</h2>
                <p>{price}</p>


            <div className = "favorite-icon">
                <IconButton onClick={() => toggleFavorite(id)}>
                    {isFavorited ? (
                        <FavoriteIcon style={{ color: '#3e084a' }} />
                    ) : (
                        <FavoriteBorderIcon />
                    )}
                </IconButton>

            </div>
        </div>

    );
}

export default PaintingItem
