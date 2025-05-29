import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/Favorites.css";

export default function Favorites() {
    const [favorites, setFavorites] = useState([]);

    const fetchFavorites = async () => {
        try {
            const token = localStorage.getItem("token");
            let url = `${process.env.REACT_APP_WEB_URL}/api/favorites`
            console.log(url);
            const res = await fetch( url, {
                headers: {
                    'Authorization': 'Bearer ' + token,
                },
            });
            const data = await res.json();
            console.log("Favorites data:", data);
            setFavorites(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Failed to fetch favorites", error);
        }
    };

    useEffect(() => {
        fetchFavorites();
    }, []);

    return (
        <div className="favorites-page">
            <h2 className="favorites-title">Your Favorite Paintings!</h2>
            {favorites.length === 0 ? (
                <p>No favorite paintings yet.</p>
            ) : (
                <div className="paintings-grid">
                    {favorites.map((p) => (
                        <Link
                            to={`/paintings/${p.id}`}
                            key={p.id}
                            className="painting-box"
                            style={{ textDecoration: "none" }}
                        >
                            <img
                                src={`${process.env.REACT_APP_WEB_URL}${p.image_url}`}
                                alt={p.name}
                            />
                            <h3>{p.name}</h3>
                            <p>{p.dimension}</p>
                            <p>{p.price}</p>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
