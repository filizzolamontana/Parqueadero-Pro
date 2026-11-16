import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api",
  headers: {
    "Content-Type": "application/json"
  },
  timeout: 10000
});

// Enviar automaticamente el token JWT.
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("parqueadero_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
