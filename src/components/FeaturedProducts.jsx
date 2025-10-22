import { useEffect,useState,useRef } from "react";

import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/grid";
import { Navigation, Pagination,Autoplay,Grid  } from "swiper/modules";

const FeaturedProducts = () => {

    const scrollRef = useRef(null);
    const [featured, setFeatured] = useState({});
    const [activeTab, setActiveTab] = useState("");
    const [isLoadingFeatured, setIsLoadingFeatured] = useState(false);
    const SERVER_URL = import.meta.env.VITE_API_URL;


    const fetchFeatured = async () => {
        try {
            setIsLoadingFeatured(true);
            const response = await fetch(`${SERVER_URL}api/products/featured`)
            const productsAll = await response.json();
            if(response.ok) {
                setFeatured(productsAll.payload)
                setActiveTab(Object.keys(productsAll.payload)[0] || "");
            }
        } catch (error) {
            console.error('Error al obtener datos:', error);
        } finally {
            setIsLoadingFeatured(false);
        }
    };

    useEffect(() => {
        fetchFeatured();
    }, []);

    function ProductCard({ product }) {
        //console.log(product.images)
        const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);

        const handleRedirectToItemDetailProduct = () => {
            window.location.href = `/item/${product._id}`
        }

        // Obtener precio y stock según variante o producto simple
        const price =
            product.variantes && product.variantes.length > 0
            ? product.variantes[selectedVariantIndex].price
            : product.price;

        const stock =
            product.variantes && product.variantes.length > 0
            ? product.variantes[selectedVariantIndex].stock
            : product.stock;

        return (
            <div className="product-card">

                <div className="product-card__img">
                    <img
                    src={`${product.images[0]?.trim()}`}
                    alt={product.title}
                    className="product-card__img__prop"
                    onClick={handleRedirectToItemDetailProduct}
                    />
                </div>

                <div className="product-card__props">

                    <div className="product-card__props__title" onClick={handleRedirectToItemDetailProduct}>
                        <div className="product-card__props__title__prop">{product.title}</div>
                    </div>

                    <div className="product-card__props__select">
                        {product.variantes && product.variantes.length > 0 && (
                            <select
                            className="product-card__props__select__prop"
                            value={selectedVariantIndex}
                            onChange={(e) => setSelectedVariantIndex(Number(e.target.value))}
                            >
                            {product.variantes.map((v, idx) => {
                                const label = Object.entries(v.campos || {})
                                .map(([key, val]) => `${key}: ${val}`)
                                .join(" | ");
                                return (
                                    <option key={idx} value={idx}>
                                    {label || "Sin variante"}
                                </option>
                                );
                            })}
                            </select>
                        )}
                    </div>

                    <div className="product-card__props__labels" onClick={handleRedirectToItemDetailProduct}>Precio: ${price}</div>
                    <div className="product-card__props__labels" onClick={handleRedirectToItemDetailProduct}>
                        Stock disponible: {stock}
                    </div>

                </div>

            </div>

        );
    }

    const chunkArray = (arr, chunkSize) => {
        const result = [];
        for (let i = 0; i < arr.length; i += chunkSize) {
        result.push(arr.slice(i, i + chunkSize));
        }
        return result;
    };

    return (

        <>

            <div className="featured-products">
                <div className="featured-products__title">
                    <div className="featured-products__title__prop">Conocé nuestros <strong>productos destacados</strong></div>
                </div>
                <div className="featured-products__titleMobile">
                    <div className="featured-products__titleMobile__prop">Conocé nuestros <br /> <strong>productos destacados</strong></div>
                </div>
                <div className="tabsContainer">

                    <div className="tabsContainer__tabs">

                        <button
                            style={{paddingRight:'1.5vh'}}
                            className="tabsContainer__tabs__scrollButton left"
                            onClick={() => {
                            scrollRef.current.scrollBy({ left: -200, behavior: "smooth" });
                            }}
                        >
                            ◀
                        </button>

                        <div className="tabsContainer__tabs__buttonContainer" ref={scrollRef}>
                            {Object.keys(featured).map((category) => (
                            <button
                                key={category}
                                className={activeTab === category ? "active" : ""}
                                onClick={() => setActiveTab(category)}
                            >
                                {category}
                            </button>
                            ))}
                        </div>

                        <button
                            style={{paddingLeft:'1.5vh'}}
                            className="tabsContainer__tabs__scrollButton right"
                            onClick={() => {
                            scrollRef.current.scrollBy({ left: 200, behavior: "smooth" });
                            }}
                        >
                            ▶
                        </button>
                        
                    </div>

                </div>

                <div className="product-grid-container">
                    <div className="product-grid-container__product-grid">
                        {activeTab && featured[activeTab] && (
                            <Swiper
                            modules={[Navigation, Pagination, Grid, Autoplay]}
                            navigation
                            autoplay={{ delay: 3000, disableOnInteraction: true }}
                            pagination={{ clickable: true }}
                            spaceBetween={12}
                            slidesPerView={3}        // 🔹 mostramos 9 categorías a la vez
                            slidesPerGroup={1}       // 🔹 que avance de a 1
                            grid={{ rows: 2, fill: "row" }} // 🔹 grid de 3 filas
                            style={{padding: "1vh 1vh"}}
                            >
                            {chunkArray(featured[activeTab], 1).map((page, idx) => (
                                <SwiperSlide key={idx}>
                                    <div>
                                        {page.map((product) => (
                                            <ProductCard key={product._id} product={product} />
                                        ))}
                                    </div>
                                </SwiperSlide>
                            ))}
                            </Swiper>
                        )}
                    </div>
                </div>

                <div className="product-grid-containerTablet">
                    <div className="product-grid-containerTablet__product-grid">
                        {activeTab && featured[activeTab] && (
                            <Swiper
                            modules={[Navigation, Pagination, Grid, Autoplay]}
                            navigation
                            autoplay={{ delay: 3000, disableOnInteraction: true }}
                            pagination={{ clickable: true }}
                            spaceBetween={12}
                            slidesPerView={2}        // 🔹 mostramos 9 categorías a la vez
                            slidesPerGroup={1}       // 🔹 que avance de a 1
                            grid={{ rows: 2, fill: "row" }} // 🔹 grid de 3 filas
                            style={{padding: "1vh 1vh"}}
                            >
                            {chunkArray(featured[activeTab], 1).map((page, idx) => (
                                <SwiperSlide key={idx}>
                                    <div>
                                        {page.map((product) => (
                                            <ProductCard key={product._id} product={product} />
                                        ))}
                                    </div>
                                </SwiperSlide>
                            ))}
                            </Swiper>
                        )}
                    </div>
                </div>

                <div className="product-grid-containerMobile">
                    <div className="product-grid-containerMobile__product-grid">
                        {activeTab && featured[activeTab] && (
                            <Swiper
                            modules={[Navigation, Pagination, Grid, Autoplay]}
                            navigation
                            autoplay={{ delay: 3000, disableOnInteraction: true }}
                            pagination={{ clickable: true }}
                            spaceBetween={12}
                            slidesPerView={1}        // 🔹 mostramos 9 categorías a la vez
                            slidesPerGroup={1}       // 🔹 que avance de a 1
                            grid={{ rows: 2, fill: "row" }} // 🔹 grid de 3 filas
                            style={{padding: "1vh 1vh"}}
                            >
                            {chunkArray(featured[activeTab], 1).map((page, idx) => (
                                <SwiperSlide key={idx}>
                                    <div>
                                        {page.map((product) => (
                                            <ProductCard key={product._id} product={product} />
                                        ))}
                                    </div>
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

export default FeaturedProducts