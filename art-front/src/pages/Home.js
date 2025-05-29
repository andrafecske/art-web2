import React from 'react'
import image from '../assets/home-bckg.png'
import {Link} from "react-router-dom";
import '../styles/Home.css'
import me from '../assets/me.png'

function Home() {
    return (
        <div className="home" style = {{backgroundImage: `url(${image})`}}>
            <div className="headerContainer">
                <h1>
                    Andra's Amazing Paintings!
                </h1>

                <p> Acrylic paintings with various themes, such as portraits, sceneries, surrealist and even abstract art</p>
                <Link to='/paintings'>
                    <button>View paintings</button>
                </Link>
            </div>

            <div className="about">
                <div className = "about-text">
                    <h1> About me </h1>
                    <p> My name is Andra Fecske and I'm a 20 year old artist from Cluj, Romania. Being an artist is my part time job, as I'm also a computer science student. I take my inspiration from nature, folklore, fantasy books and stories, the Romanian culture and pretty much anything that speaks to me.</p>
                    <div className = "about-text-commissions">
                        <p> I am open for commissions!</p>
                    </div>
                </div>
                <div className="about-image">
                    <img src={me} alt="Andra's portrait" />
                </div>

            </div>
        </div>


    )
}

export default Home
