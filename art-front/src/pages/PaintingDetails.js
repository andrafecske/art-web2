import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import '../styles/PaintingDetails.css'

function PaintingDetails() {
    const { id } = useParams();
    const [painting, setPainting] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const token = localStorage.getItem("token");
    const userEmail = localStorage.getItem("userEmail"); // or userId if you store that

    useEffect(() => {

        setIsLoggedIn(!!token);

    }, [token]);

    useEffect(() => {
        fetch(`${process.env.REACT_APP_WEB_URL}/paintings/${id}`)
            .then((res) => res.json())
            .then((data) => setPainting(data))
            .catch((err) => console.error("Failed to fetch painting:", err));
    }, [id]);

    useEffect(() => {
        // Fetch comments for the painting
        fetch(`${process.env.REACT_APP_WEB_URL}/comments/${id}`)
            .then((res) => res.json())
            .then((data) => {
                console.log("Fetched comments:", data);
                setComments(data);
            })
            .catch((err) => console.error("Failed to fetch comments:", err));
    }, [id]);

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        try {
            const res = await fetch(`${process.env.REACT_APP_WEB_URL}/comments`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    paintingId: parseInt(id),
                    comment: newComment.trim(),
                }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                alert("Failed to add comment: " + errorData.error);
                return;
            }

            setNewComment("");

            fetch(`${process.env.REACT_APP_WEB_URL}/comments/${id}`)
                .then((res) => res.json())
                .then((data) => {
                    console.log("Updated comments after posting:", data);
                    setComments(data);
                });
        } catch (err) {
            console.error("Error posting comment:", err);
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (!token) return alert("You must be logged in to delete comments.");

        try {
            const response = await fetch(`${process.env.REACT_APP_WEB_URL}/comments/${commentId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Failed to delete comment");
            }

            setComments(prev => prev.filter(comment => comment.id !== commentId));
            console.log(`Deleted comment with id ${commentId}`);
        } catch (error) {
            console.error(error);
            alert("Failed to delete comment.");
        }
    };


    if (!painting) return <div>Loading...</div>;

    return (
        <div className="painting-details-container">
            {/* Left side: Painting */}
            <div className="painting-section">
                <h1>{painting.name}</h1>
                <img
                    src={`${process.env.REACT_APP_WEB_URL}${painting.image}`}
                    alt={painting.name}
                />
                <p>Dimensions: {painting.dimension}</p>
                <p>Price: {painting.price}</p>
            </div>

            {/* Right side: Comments */}
            <div className="comments-section">
                <h2>Comments</h2>

                {isLoggedIn ? (
                    <form onSubmit={handleCommentSubmit} className="comment-form">
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            rows={4}
                            placeholder="Write your comment here..."
                        />
                        <button type="submit">Add Comment</button>
                    </form>
                ) : (
                    <p>Please log in to leave a comment.</p>
                )}

                <div className="comments-list">
                    {comments.map(comment => {
                        const author = comment.author_email?.toLowerCase().trim();
                        const current = userEmail?.toLowerCase().trim();
                        const canDelete = author === current;

                        console.log(`Comment ID: ${comment.id} | Author: ${author} | Current User: ${current} | Show delete: ${canDelete}`);

                        return (
                            <div key={comment.id} className="comment">
                                <p><strong>{comment.author_email}:</strong> {comment.comment}</p>
                                {canDelete && (
                                    <button  className="comment-delete-button"
                                             onClick={() => handleDeleteComment(comment.id)}>Delete</button>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export default PaintingDetails;
