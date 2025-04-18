import React from 'react'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css'
import Footer from './components/Footer';
import SignUp from './pages/SignUp';
import Login from './pages/LogIn';
import PartenerRegistration from './pages/PartenerRegistration';
import PropertyRegistration from './pages/PropertyRegistration';
import PropertyHome from './pages/PropertyHome';
import ProprietarPage from './pages/Proprietar';
import PropertyEdit from './pages/PropertyEdit';
import PropertyPage from './pages/PropertyPage';
import User from './pages/User';
import SearchPage from './pages/SearchPage';
import BookingDetails from './pages/BookingDetails';
import BookingConfirmation from './pages/BookingConfirmation';
import CalendarProprietate from './pages/CalendarProprietate';
import RezervariProprietate from './pages/RezervariProprietate';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<SignUp/>}/>
        <Route path="/login" element={<Login />} />
        <Route path="/property-registration" element={<PropertyRegistration/>} />
        <Route path="/inregistrare-cazari" element={<PartenerRegistration/>}/>
        <Route path="/proprietati/rezervare/:id" element={<PropertyHome />} />
        <Route path="/proprietar/:id" element={<ProprietarPage />} />
        <Route path="/proprietati/:id" element={<PropertyPage />} />
        <Route path="/editare-proprietate/:id" element={<PropertyEdit />} />
        <Route path="/user/:id" element={<User />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/booking/details" element={<BookingDetails />} />
        <Route path="/booking/confirmation/:id" element={<BookingConfirmation />} />
        <Route path="/calendar-proprietate/:id" element={<CalendarProprietate />} />
        <Route path="/rezervari-proprietate/:id" element={<RezervariProprietate />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Routes>
      <Footer/>
    </Router>
  
  );
}

export default App
