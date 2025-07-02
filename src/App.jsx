import Home from './components/Home.jsx';
import About from './components/About.jsx';
import Contact from './components/Contact.jsx';
import Login from './components/Login.jsx';
import Cart from './components/Cart.jsx';
import ItemDetailContainer from './components/ItemDetailContainer.jsx';
import CategoryContainer from './components/CategoryContainer.jsx';
import SignIn from './components/SignIn.jsx';
import Shipping from './components/Shipping.jsx';
import DeliveryForm from './components/DeliveryForm.jsx';
import CPanelProducts from './components/CPanelProducts.jsx';
import { IsLoggedInContext } from './context/IsLoggedContext.jsx';
import CPanel from './components/CPanel.jsx';
import Tickets from './components/Tickets.jsx';
import MyPurchases from './components/MyPurchases.jsx';
import Bin from './components/Bin.jsx';

import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import { ShoppingCartContext } from './context/ShoppingCartContext'

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ThemeProvider } from './context/ThemeProviderContext.jsx';
import ScrollToTop from './components/ScrollToTop.jsx';
import { CPanelProductsContext } from './context/CPanelProductsContext';
import { CPanelSalesContext } from './context/CPanelSalesContext';
import GlobalContexts from './context/GlobalContexts.jsx';


function App() {
    const [storeSettings, setStoreSettings] = useState({});
    const [whatsappPhone, setWhatsappPhone] = useState('');
    
    useEffect(() => {
        if(storeSettings) {
            const whapPhone = storeSettings?.phoneNumbers?.find(phone => phone.selected == true)
            setWhatsappPhone(whapPhone)
        }
    },[storeSettings])

    const fetchStoreSettings = async () => {
        try {
            const response = await fetch('http://localhost:8081/api/settings');
            const data = await response.json();
            if (response.ok) {
                setStoreSettings(data); 
            } else {
                toast('Error al cargar configuraciones', {
                    position: "top-right",
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "dark",
                    className: "custom-toast",
                });
            }

        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchStoreSettings()
    },[])

    const handleBtnWhatsAppIcon = () => {
        window.open(`https://wa.me/${whatsappPhone.number}`, "_blank");
    }

    return (

        <>

        <a class="networksContainer">
            <img onClick={handleBtnWhatsAppIcon} class="networksContainer__network" src="/src/assets/WhatsApp_icon.png" alt="WhatsApp"/>
        </a>
        
        <GlobalContexts>

            <BrowserRouter>

                <ScrollToTop />

                    <Routes>

                        <Route exact path="/" element={<Home/>}/>
                        <Route exact path="/about" element={<About/>}/>
                        <Route exact path="/contact" element={<Contact/>}/>
                        <Route exact path="/logIn" element={<Login/>}/>
                        <Route exact path="/signIn" element={<SignIn/>}/>
                        <Route exact path="/cart" element={<Cart/>}/>
                        <Route exact path="/item/:id" element={<ItemDetailContainer/>}/>
                        <Route exact path="/category/:category" element={<CategoryContainer/>}/>
                        <Route exact path="/shipping" element={<Shipping/>}/>
                        <Route exact path="/deliveryForm" element={<DeliveryForm/>}/>
                        <Route exact path="/cpanel/products" element={<CPanelProducts/>}/>
                        <Route exact path="/cpanel" element={<CPanel/>}/>
                        <Route exact path="/tickets" element={<Tickets/>}/>
                        <Route exact path="/myPurchases" element={<MyPurchases/>}/>
                        <Route exact path="/bin" element={<Bin/>}/>

                    </Routes>

                    <ToastContainer />

            </BrowserRouter>

        </GlobalContexts>
        
        </>
    )
}

export default App
