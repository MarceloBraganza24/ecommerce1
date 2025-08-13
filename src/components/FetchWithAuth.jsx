import { toast } from "react-toastify";

export const fetchWithAuth = async (endpoint, options = {}) => {
    const apiUrl = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem("token");

    const headers = {
        ...(options.headers || {}),
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
    };

    try {
        const response = await fetch(`${apiUrl}${endpoint}`, {
            ...options,
            headers,
        });

        if (response.status === 401 || response.status === 403) {
            localStorage.removeItem("token");
            setTimeout(() => {
                window.location.href = "/";
            }, 1500);
            return null;
        }

        const data = await response.json();
        return data;

    } catch (err) {
        toast.error("Error de conexión con el servidor", { theme: "dark" });
        console.error(err);
        return null;
    } 
};
