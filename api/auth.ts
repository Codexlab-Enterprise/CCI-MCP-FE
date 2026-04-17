import axios from "axios";
// Configure axios globally
axios.defaults.withCredentials = true;

export const login = (email: string, password: string) => {
  return axios.post(`/user/user/login`, { 
    email, 
    password 
  });
};

export const logoutAPI = () => {
  return axios.delete(`/user/user/logout`, { 
  });
};