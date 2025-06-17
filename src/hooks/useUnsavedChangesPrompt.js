// hooks/useUnsavedChangesPrompt.js
import { useEffect } from 'react';

export const useUnsavedChangesPrompt = (hasUnsavedChanges) => {
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (hasUnsavedChanges) {
                e.preventDefault();
                e.returnValue = ''; // Muestra el prompt nativo
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [hasUnsavedChanges]);
};
