import axios from "axios";
import Cookies from "js-cookie";
// import { header } from 'framer-motion/client';

// Create Axios instance
const api = axios.create({
  baseURL: "/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;
let failedRequests: any[] = [];
let _window = typeof window !== "undefined" ? window : null;

// Request interceptor for adding token
api.interceptors.request.use(
  (config) => {
    const token = JSON.parse(
      _window?.sessionStorage.getItem("user"),
    )?.refreshToken;

    console.log("token", token);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor for token refresh
// api.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const originalRequest = error.config;

//     console.log("error", error);
//     // If error is 401 and we haven't already tried refreshing
//     if (error.response?.status === 403 && !originalRequest._retry) {
//       if (isRefreshing) {
//         // If already refreshing, wait for the new token
//         return new Promise((resolve, reject) => {
//           failedRequests.push({ resolve, reject });
//         })
//           .then(() => {
//             return api(originalRequest);
//           })
//           .catch((err) => {
//             return Promise.reject(err);
//           });
//       }

//       originalRequest._retry = true;
//       isRefreshing = true;

//       try {
//         // Call refresh token endpoint
//         const refreshToken = JSON.parse(Cookies.get("user")).refreshToken;
//         const accessToken = JSON.parse(Cookies.get("user")).accessToken;

//         if (!refreshToken) {
//           throw new Error("No refresh token available");
//         }

//         const response = await axios.post(
//           "/api/user/user/generateToken",
//           { refreshToken: refreshToken },
//           {
//             headers: {
//               Authorization: `Bearer ${accessToken}`,
//             },
//             //   refreshToken
//           },
//         );

//         // Update tokens
//         const { accessToken: newaccessToken } = response.data;

//         // _window?.sessionStorage.setItem('access', accessToken);
//         if (newaccessToken) {
//           // Cookies.set('access', newaccessToken);
//           Cookies.set(
//             "user",
//             JSON.stringify({
//               ...JSON.parse(Cookies.get("user")),
//               accessToken: newaccessToken,
//             }),
//           );
//         }

//         // Retry all failed requests
//         failedRequests.forEach((prom) => prom.resolve());
//         failedRequests = [];

//         // Retry the original request
//         return api(originalRequest);
//       } catch (refreshError) {
//         // If refresh fails, clear tokens and redirect to login
//         Cookies.remove("access");
//         Cookies.remove("refresh");
//         failedRequests.forEach((prom) => prom.reject(refreshError));
//         failedRequests = [];

//         // Redirect to login page
//         window.location.href = "/login";

//         return Promise.reject(refreshError);
//       } finally {
//         isRefreshing = false;
//       }
//     }

//     return Promise.reject(error);
//   },
// );

export default api;
