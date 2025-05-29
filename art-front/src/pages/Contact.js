import React, {useState} from 'react'
import image from '../assets/contact-bckg.jpg'
import '../styles/Contact.css'

function Contact() {
    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = {
            fullName: e.target.fullName.value,
            email: e.target.email.value,
            message: e.target.message.value,
        };

        try {
            const response = await fetch(`${process.env.REACT_APP_WEB_URL}/contact`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await response.json();
            if (data.success) {
                alert("Message sent successfully!");
            } else {
                alert("Error: " + data.error);
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Failed to send message.");
        }
    };

    return (
        <div className="contact">
            <div className="leftSide" style={{backgroundImage:`url(${image})`}}>
            </div>
            <div className="rightSide">
                <h1> Contact us </h1>
                <form id="contact-form" method="POST" onSubmit={handleSubmit}>
                    <label htmlFor="fullName"> Full Name </label>
                    <input name="fullName" placeholder="Full name" type="text" required />

                    <label htmlFor="email">Email</label>
                    <input name="email" placeholder="Email" type="email" required />

                    <label htmlFor="message">Message</label>
                    <textarea rows="6" placeholder="Enter message" name="message" required></textarea>

                    <button type="submit">Send message</button>
                </form>

            </div>
        </div>

    )
}

export default Contact
