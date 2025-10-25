import { useEffect,useState,useContext,useRef } from "react";
import { useNavigate } from "react-router-dom";

import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/grid";
import { Navigation, Pagination,Autoplay,Grid  } from "swiper/modules";
import ItemProduct from "./ItemProduct";
import { useAuth } from "../context/AuthContext";

const BrandsSection = () => {
    const navigate = useNavigate();
    const scrollRefBrands = useRef(null);
    const [brands, setBrands] = useState([]);
    const [activeBrand, setActiveBrand] = useState("");
    const [brandProducts, setBrandProducts] = useState([]);
    const SERVER_URL = import.meta.env.VITE_API_URL;
    const { user, loadingUser: isLoadingAuth,fetchCurrentUser } = useAuth();
    const [userCart, setUserCart] = useState({});

    const fetchCartByUserId = async (user_id) => {
        try {
            const response = await fetch(`${SERVER_URL}api/carts/byUserId/${user_id}`);
            const data = await response.json();
            if (!response.ok) {
                console.error("Error al obtener el carrito:", data);
                toast('Error al cargar el carrito del usuario actual', {
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
                setUserCart({ user_id, products: [] }); // 👈 cambio clave
                return [];
            }
    
            if (!data.data || !Array.isArray(data.data.products)) {
                console.warn("Carrito vacío o no válido, asignando array vacío.");
                setUserCart({ user_id, products: [] }); // 👈 cambio clave
                return [];
            }
    
            setUserCart(data.data);
            return data.data;
    
        } catch (error) {
            console.error("Error al obtener el carrito:", error);
            toast('Error en la conexión', {
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
            setUserCart({ user_id, products: [] }); // 👈 cambio clave
            return [];
        }
    };

    const fetchProductsByBrand = async (brand) => {
        const res = await fetch(`${SERVER_URL}api/products/by-brand/${encodeURIComponent(brand)}`);
        const data = await res.json();
        if (res.ok) setBrandProducts(data.payload || []);
    };

    const fetchBrands = async () => {
        const res = await fetch(`${SERVER_URL}api/products/brands`);
        const data = await res.json();
        if (res.ok) {
            setBrands(data.payload || []);
            setActiveBrand(data.payload[0] || ""); // primera marca activa
        }
    };

    useEffect(() => {
        fetchBrands();
    }, []);

    useEffect(() => {
        if (activeBrand) fetchProductsByBrand(activeBrand);
    }, [activeBrand]);

    const handleRedirectToBrand = (brand) => {
        navigate("/products", { state: { brand } });
    }

    return (

        <>
        
            <div className="brandsExplored">

                    <div className="brandsExplored__title">
                        <div className="brandsExplored__title__prop">Descubrí las <strong>mejores marcas</strong></div>
                    </div>

                    <div className="brandsExplored__titleMobile">
                        <div className="brandsExplored__titleMobile__prop">Descubrí las <br /> <strong>mejores marcas</strong></div>
                    </div>

                    <div className="tabsContainer">

                        <div className="tabsContainer__tabs">

                            <button
                                style={{paddingRight:'1.5vh'}}
                                className="tabsContainer__tabs__scrollButton left"
                                onClick={() => {
                                scrollRefBrands.current.scrollBy({ left: -200, behavior: "smooth" });
                                }}
                            >
                                ◀
                            </button>

                            <div className="tabsContainer__tabs__buttonContainer" ref={scrollRefBrands}>
                                {brands.map((brand) => (
                                <button
                                    key={brand}
                                    className={activeBrand === brand ? "active" : ""}
                                    onClick={() => setActiveBrand(brand)}
                                >
                                    {brand}
                                </button>
                                ))}
                            </div>

                            <button
                                style={{paddingLeft:'1.5vh'}}
                                className="tabsContainer__tabs__scrollButton right"
                                onClick={() => {
                                scrollRefBrands.current.scrollBy({ left: 200, behavior: "smooth" });
                                }}
                            >
                                ▶
                            </button>
                            
                        </div>

                    </div>

                    <div className="brandsExplored__grid">

                        <div className="brandsExplored__grid__left">
                            <div className="brandsExplored__grid__left__categoryImg">
                                <img className="brandsExplored__grid__left__categoryImg__prop" onClick={() => handleRedirectToBrand(activeBrand)} src={`${brandProducts[0]?.images?.[0]}`} alt={brandProducts[0]?.title || "producto"} />
                            </div>
                        </div>

                        <div className="brandsExplored__grid__right">
                            {brandProducts.length > 0 && (
                                <Swiper
                                modules={[Navigation, Pagination, Autoplay]}
                                navigation
                                autoplay={{ delay: 3000, disableOnInteraction: true }}
                                pagination={{ clickable: true }}
                                spaceBetween={60}
                                slidesPerView="auto"  
                                slidesPerGroup={1}   // avanza de a 1
                                className="brandsExplored__grid__right__swipper"
                                >
                                {brandProducts.map((product) => (
                                    <SwiperSlide key={product._id} style={{width: "200px",padding: "2vh 0vh"}}>
                                        <ItemProduct
                                        user={user} 
                                        fetchCartByUserId={fetchCartByUserId}
                                        id={product._id}
                                        stock={product.stock}
                                        images={product.images}
                                        title={product.title}
                                        description={product.description}
                                        price={product.price}
                                        variantes={product.variantes}
                                        userCart={userCart}
                                        />
                                    </SwiperSlide>
                                ))}
                                </Swiper>
                            )}
                        </div>


                    </div>

                    <div className="brandsExplored__gridMobile">

                        <div className="brandsExplored__gridMobile__left">
                            <div className="brandsExplored__gridMobile__left__categoryImg">
                                <img className="brandsExplored__gridMobile__left__categoryImg__prop" onClick={() => handleRedirectToBrand(activeBrand)} src={`${brandProducts[0]?.images?.[0]}`} alt={brandProducts[0]?.title || "producto"} />
                            </div>
                        </div>

                        <div className="brandsExplored__gridMobile__right">
                            {brandProducts.length > 0 && (
                                <Swiper
                                modules={[Navigation, Pagination, Autoplay]}
                                navigation
                                autoplay={{ delay: 3000, disableOnInteraction: true }}
                                pagination={{ clickable: true }}
                                spaceBetween={100}
                                slidesPerView={1}  
                                slidesPerGroup={1}   // avanza de a 1
                                //style={{padding: "2vh 10vh 2vh 4vh"}}
                                className="brandsExplored__gridMobile__right__swipper"
                                >
                                {brandProducts.map((product) => (
                                    <SwiperSlide key={product._id} style={{width: "200px",padding: "2vh 0vh"}}>
                                        <ItemProduct
                                        user={user} 
                                        fetchCartByUserId={fetchCartByUserId}
                                        id={product._id}
                                        stock={product.stock}
                                        images={product.images}
                                        title={product.title}
                                        description={product.description}
                                        price={product.price}
                                        variantes={product.variantes}
                                        userCart={userCart}
                                        />
                                    </SwiperSlide>
                                ))}
                                </Swiper>
                            )}
                        </div>


                    </div>
                
                </div>
        
        </>

    )

}

export default BrandsSection