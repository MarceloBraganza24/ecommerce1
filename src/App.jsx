import { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';

import 'react-toastify/dist/ReactToastify.css';

import Home from './components/Home.jsx';
import Login from './components/Login.jsx';
import SignIn from './components/SignIn.jsx';
import Bin from './components/Bin.jsx';
import CPanel from './components/CPanel.jsx';
import SendMailPass from './components/SendMailPass.jsx';
import ResetPass from './components/ResetPass.jsx';
import About from './components/About.jsx';
import Contact from './components/Contact.jsx';
import Cart from './components/Cart.jsx';
import ItemDetailContainer from './components/ItemDetailContainer.jsx';
import CategoryContainer from './components/CategoryContainer.jsx';
import Shipping from './components/Shipping.jsx';
import DeliveryForm from './components/DeliveryForm.jsx';
import CPanelProducts from './components/CPanelProducts.jsx';
import Tickets from './components/Tickets.jsx';
import MyPurchases from './components/MyPurchases.jsx';
import Favorites from './components/Favorites.jsx';

import { useAuth, AuthProvider } from './context/AuthContext.jsx';
import { ThemeProvider } from './context/ThemeProviderContext.jsx';
import { FavoritesProvider } from './context/FavoritesContext.jsx';
import { CPanelProductsContext } from './context/CPanelProductsContext.jsx';
import { CPanelSalesContext } from './context/CPanelSalesContext.jsx';
import { ShoppingCartContext } from './context/ShoppingCartContext.jsx';

function AppContent() {
  const { setToken, fetchCurrentUser,logout } = useAuth();
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [logoutCountdown, setLogoutCountdown] = useState(30);
  const countdownIntervalRef = useRef(null);
  const logoutTimeoutRef = useRef(null);
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL;
  const [storeSettings, setStoreSettings] = useState({});
  const [isLoadingStoreSettings, setIsLoadingStoreSettings] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState(false);

  useEffect(() => {
    if(storeSettings && storeSettings?.phoneNumbers) {
      const phoneNumber = storeSettings.phoneNumbers.find(phoneNumber => phoneNumber.selected == true);
      setPhoneNumber(phoneNumber.number)
    }
  }, [storeSettings]);

  const fetchStoreSettings = async () => {
    try {
        setIsLoadingStoreSettings(true);
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
    } finally {
        setIsLoadingStoreSettings(false)
    }
  };

  useEffect(() => {
    fetchStoreSettings();
  }, []);

  const parseJwt = (token) => {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch {
      return null;
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const token = localStorage.getItem("token");
      if (!token) return;

      const decoded = parseJwt(token);
      if (!decoded?.exp) return;

      const now = Date.now();
      const expirationTime = decoded.exp * 1000;
      const timeUntilExpire = expirationTime - now;

      if (timeUntilExpire <= 0) {
        handleLogout();
      } else if (timeUntilExpire <= 30000 && !showSessionModal) {
        setShowSessionModal(true);
        startLogoutCountdown();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [showSessionModal]);

  const startLogoutCountdown = () => {
    let seconds = 30;
    setLogoutCountdown(seconds);

    countdownIntervalRef.current = setInterval(() => {
      seconds -= 1;
      setLogoutCountdown(seconds);
      if (seconds <= 0) clearInterval(countdownIntervalRef.current);
    }, 1000);

    logoutTimeoutRef.current = setTimeout(() => {
      setShowSessionModal(false);
      window.location.reload();
    }, 30000);
  };

  const cancelCountdown = () => {
    clearTimeout(logoutTimeoutRef.current);
    clearInterval(countdownIntervalRef.current);
    setLogoutCountdown(30);
  };

  const handleExtendSession = async () => {
    cancelCountdown();

    const res = await fetch(`${apiUrl}/api/sessions/refresh`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    const data = await res.json();

    if (res.ok && data.data?.token) {
      localStorage.setItem("token", data.data.token);
      setToken(data.data.token);
      await fetchCurrentUser();
      setShowSessionModal(false);
    } else {
      handleLogout();
    }
  };

  const handleLogout = async () => {
    cancelCountdown();
    const success = await logout();
    if (success) {
        setShowSessionModal(false);
        navigate("/");
        toast('Gracias por visitar nuestra página', {
            position: "top-right",
            autoClose: 1500,
            theme: "dark",
            className: "custom-toast",
        });
    }
  };

  const handleBtnWhatsAppIcon = () => {
    window.open(`https://wa.me/${phoneNumber}`, "_blank");
  }

  return (
    <>
      {showSessionModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Tu sesión está por expirar</h2>
            <p>¿Querés continuar con la sesión?</p>
            <p><strong>Se cerrará automáticamente en {logoutCountdown} segundos</strong></p>
            <div className='btn-expired-modal'>
              <button className='btn-expired-modal__btn' onClick={handleExtendSession}>Continuar sesión</button>
              <button className='btn-expired-modal__btn' onClick={handleLogout}>Cerrar sesión</button>
            </div>
          </div>
        </div>
      )}

      <a class="networksContainer">
          <img onClick={handleBtnWhatsAppIcon} class="networksContainer__network" src="/src/assets/WhatsApp_icon.png" alt="WhatsApp"/>
      </a>

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
        <Route exact path="/favorites" element={<Favorites/>}/>
        <Route exact path="/sendMail" element={<SendMailPass/>}/>
        <Route exact path="/resetPass" element={<ResetPass/>}/>
        
      </Routes>

      <ToastContainer />
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <FavoritesProvider>
          <CPanelProductsContext>
              <CPanelSalesContext>
                  <ShoppingCartContext>
                    <BrowserRouter>
                        <AppContent />
                    </BrowserRouter>
                  </ShoppingCartContext>
              </CPanelSalesContext>
          </CPanelProductsContext>
        </FavoritesProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
