
import './App.css';
import{BrowserRouter as Router, Route, Routes} from "react-router-dom"
import Navbar from './components/Navbar'
import Home from "./pages/Home";
import Login from "./pages/Login";
import Paintings from "./pages/Paintings";
import Contact from "./pages/Contact";
import Register from "./pages/Register";
import Favorites from "./pages/Favorites";
import PaintingDetails from "./pages/PaintingDetails";

function App() {
  return (
    <div className="App">
      <Router>
        <Navbar/>
        <Routes>
            <Route path ="/" element={<Home/>}/>
            <Route path = "/paintings" element={<Paintings/>}/>
            <Route path = "/contact" element={<Contact/>}/>
            <Route path = "/login" element={<Login/>}/>
            <Route path="/register" element={<Register />} />
            <Route path="/favorites" element={<Favorites/>}/>
            <Route path="/paintings/:id" element={<PaintingDetails />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
