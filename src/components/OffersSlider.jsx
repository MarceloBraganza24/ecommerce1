import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const OffersSlider = () => {
  const [offers, setOffers] = useState([]);
  //console.log(offers)
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();

  // Traer configuración con ofertas
  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const res = await fetch("http://localhost:8081/api/settings");
        const data = await res.json();
        setOffers(data.offersSlider || []);
      } catch (err) {
        console.error("Error cargando ofertas:", err);
      }
    };
    fetchOffers();
  }, []);

  // Cambio automático cada 5s
  useEffect(() => {
    if (offers.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % offers.length);
    }, 3000); 
    return () => clearInterval(interval);
  }, [offers]);

  // Click en oferta → navegar a /products con filtros
  const handleOfferClick = (filters) => {
    navigate("/products", { state: { filters } });
  };

  if (offers.length === 0) return null;

  const currentOffer = offers[currentIndex];

  return (

    <>

      {/* <div className="offersContainer">
        <div className="offersContainer__offersSlider">
          <img
            src={`http://localhost:8081/${currentOffer.image}`}
            alt="Oferta"
            onClick={() => handleOfferClick(currentOffer.filters)}
            className="offersContainer__offersSlider__img"
          />

          <button
            onClick={() =>
              setCurrentIndex((prev) => (prev === 0 ? offers.length - 1 : prev - 1))
            }
            className="offersContainer__offersSlider__btnAnt"
          >
            ‹
          </button>

          <button
            onClick={() =>
              setCurrentIndex((prev) => (prev === offers.length - 1 ? 0 : prev + 1))
            }
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
      </div> */}
      <div className="offersContainer">
        <div className="offersContainer__offersSlider">
          <div
            className="offersContainer__offersSlider__track"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {offers.map((offer) => (
              <img
                key={offer._id}
                src={`http://localhost:8081/${offer.image}`}
                alt="Oferta"
                onClick={() => handleOfferClick(offer.filters)}
                className="offersContainer__offersSlider__img"
              />
            ))}
          </div>

          <button
            onClick={() =>
              setCurrentIndex((prev) => (prev === 0 ? offers.length - 1 : prev - 1))
            }
            className="offersContainer__offersSlider__btnAnt"
          >
            ‹
          </button>

          <button
            onClick={() =>
              setCurrentIndex((prev) => (prev === offers.length - 1 ? 0 : prev + 1))
            }
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
