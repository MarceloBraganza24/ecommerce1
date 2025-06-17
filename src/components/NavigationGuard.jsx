// components/NavigationGuard.js
import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useRef } from 'react';

const NavigationGuard = ({ when, message }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const currentPath = useRef(location.pathname);

    useEffect(() => {
        const handleClick = (e) => {
            const target = e.target.closest('a');
            if (!target) return;

            const href = target.getAttribute('href');
            if (!href || href === '#' || href.startsWith('mailto:') || href.startsWith('tel:')) return;

            if (when && href !== location.pathname) {
                e.preventDefault();
                const confirmLeave = window.confirm(message || "Tienes cambios sin guardar. ¿Seguro que quieres salir?");
                if (confirmLeave) {
                    window.removeEventListener('click', handleClick, true);
                    navigate(href);
                }
            }
        };

        if (when) {
            window.addEventListener('click', handleClick, true);
        }

        return () => {
            window.removeEventListener('click', handleClick, true);
        };
    }, [when, message, navigate, location.pathname]);

    return null;
};

export default NavigationGuard;
