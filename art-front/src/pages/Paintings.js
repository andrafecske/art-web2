import React, { useEffect, useState } from 'react';
import PaintingItem from "../components/PaintingItem";
import '../styles/Paintings.css';

function Paintings() {
    const [paintings, setPaintings] = useState([]);
    const [showOnlyAvailable, setShowOnlyAvailable] = useState(false);
    const [sortOrder, setSortOrder] = useState("none");


    useEffect(() => {
        fetch(`${process.env.REACT_APP_WEB_URL}/paintings`)
            .then((res) => res.json())
            .then((data) => setPaintings(data))
            .catch((err) => console.error("Failed to load paintings:", err));
    }, []);

    const filteredPaintings = paintings
        .filter((p) => {
            if (sortOrder !== "none" && p.price === "not available") return false;
            return !showOnlyAvailable || p.price !== "not available";
        })
        .sort((a, b) => {
            if (sortOrder === "asc") {
                return parseFloat(a.price) - parseFloat(b.price);
            } else if (sortOrder === "desc") {
                return parseFloat(b.price) - parseFloat(a.price);
            }
            return 0;
        });


    return (
        <div className="paintings">
            <h1 className="paintings-title">Artworks</h1>

            <div className="paintings-controls">
                <div className="paintings-filter">
                    <label>
                        <input
                            type="checkbox"
                            checked={showOnlyAvailable}
                            onChange={() => setShowOnlyAvailable(!showOnlyAvailable)}
                        />
                        Show only available paintings
                    </label>
                </div>

                <div className="paintings-sort">
                    <label>
                        Sort by price:&nbsp;
                        <select
                            value={sortOrder}
                            onChange={(e) => setSortOrder(e.target.value)}
                        >
                            <option value="none">None</option>
                            <option value="asc">Cheapest first</option>
                            <option value="desc">Most expensive first</option>
                        </select>
                    </label>
                </div>
            </div>

            <div className="paintings-list">
                {filteredPaintings.map((paintingItem, key) => {
                    console.log("Painting item:", paintingItem);
                    return (
                        <PaintingItem
                            key={key}
                            id={paintingItem.id}
                            image={`${process.env.REACT_APP_WEB_URL}${paintingItem.image}`}
                            name={paintingItem.name}
                            dimension={paintingItem.dimension}
                            price={paintingItem.price}
                        />
                    );
                })}
            </div>
        </div>
    );
}

export default Paintings;
