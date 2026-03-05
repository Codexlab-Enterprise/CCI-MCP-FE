// import axios from "axios";

// export const login = async (email: string, password: string) => {
//   const res = axios
//     .post(`/user/user/login`, { email, password })
//     .then((res) => res)
//     .catch((err) => err);

//   return res;
// };

// auth.ts
import axios from "axios";

export const login = (email: string, password: string) => {
  return axios.post(
    `/user/user/login`,
    {
      email,
      password,
    },
    {
      withCredentials: true,
    },
  );
};

export const logoutAPI = () => {
  return axios.delete(`/user/user/logout`, {
    withCredentials: true,
  });
};
