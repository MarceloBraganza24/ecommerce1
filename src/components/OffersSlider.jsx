import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const OffersSlider = () => {
  const [offers, setOffers] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();
  const [isPaused, setIsPaused] = useState(false);
  const SERVER_URL = import.meta.env.VITE_API_URL;

  // autoplay que respeta isPaused
  useEffect(() => {
    if (isPaused || offers.length === 0) return; // si está pausado o no hay ofertas, no arranca

    const interval = setInterval(() => {
      setCurrentIndex((prev) =>
        prev === offers.length - 1 ? 0 : prev + 1
      );
    }, 3000); // cada 5s cambia de oferta

    return () => clearInterval(interval);
  }, [isPaused, offers.length]);

  // Traer configuración con ofertas
  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const res = await fetch(`${SERVER_URL}api/settings`);
        const data = await res.json();
        setOffers(data?.offersSlider || []);
      } catch (err) {
        console.error("Error cargando ofertas:", err);
      }
    };
    fetchOffers();
  }, []);

  // Click en oferta → navegar a /products con filtros
  const handleOfferClick = (filters) => {
    const appliedFilters = {};

    // categoría
    if (filters.category) {
      appliedFilters.category = filters.category._id; // guardamos solo el _id
    }

    // otras propiedades dinámicas
    for (const key in filters) {
      if (key !== 'category') {
        appliedFilters[key] = Array.isArray(filters[key]) ? filters[key] : [filters[key]];
      }
    }

    //navigate("/products", { state: { filters: appliedFilters } });
    navigate("/products", {
      state: {
        categoryId: appliedFilters.category || null,
        filters: (() => {
          const { category, ...rest } = appliedFilters;
          return rest;
        })(),
      },
    });
  };

  if (offers.length === 0) return null;

  const currentOffer = offers[currentIndex];

  // función para pausar y reanudar
  const handlePause = () => {
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 15000); // reanuda después de 10s
  };

  return (

    <>

      <div className="offersContainer">
        <div className="offersContainer__offersSlider">
          <div
            className="offersContainer__offersSlider__track"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {offers.map((offer) => (
              <>
              {/* {console.log(offer.filters)} */}
              <img
                key={offer._id}
                src={`${offer.image}`}
                alt="Oferta"
                onClick={() => handleOfferClick(offer.filters)}
                className="offersContainer__offersSlider__img"
                />
              </>
            ))}
          </div>

          <button
            onClick={() => {
              handlePause();
              setCurrentIndex((prev) =>
                prev === 0 ? offers.length - 1 : prev - 1
              );
            }}
            className="offersContainer__offersSlider__btnAnt"
          >
            ‹
          </button>

          <button
            onClick={() => {
              handlePause();
              setCurrentIndex((prev) =>
                prev === offers.length - 1 ? 0 : prev + 1
              );
            }}
            className="offersContainer__offersSlider__btnSig"
          >
            ›
          </button>

          <div className="offersContainer__offersSlider__indicators">
            {offers.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`offersContainer__offersSlider__indicators__indicator ${
                  idx === currentIndex ? "active" : ""
                }`}
              />
            ))}
          </div>
        </div>
      </div>


    </>

  );
};

export default OffersSlider;
