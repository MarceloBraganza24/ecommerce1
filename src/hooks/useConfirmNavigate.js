// hooks/useConfirmNavigate.js
import { useNavigate } from 'react-router-dom';

export const useConfirmNavigate = (hasUnsavedChanges, message = 'Tenés cambios sin guardar. ¿Querés salir igual?') => {
    const navigate = useNavigate();

    const confirmNavigate = (to, options = {}) => {
        if (!hasUnsavedChanges || window.confirm(message)) {
            navigate(to, options);
        }
    };

    return confirmNavigate;
};
