import Cookies from "js-cookie";

import api from "@/utils/axios";

export const getCategory = async (
  { query }: { query?: string },
  access: string,
) => {
  let url = query != "" ? `/Category` + `?${query}` : `/Category`;
  const res = await api
    .get(url, {
      headers: {
        Authorization: `Bearer ${access}`,
      },
    })
    .then((res) => res)
    .catch((err) => err);

  return res;
};

export const createCategory = async (data: any) => {
  const access = JSON.parse(Cookies.get("user")).accessToken;
  const res = await api
    .post(`/Category`, data, {
      headers: {
        Authorization: `Bearer ${access}`,
      },
    })
    .then((res) => res)
    .catch((err) => err);

  return res;
};

export const updateCategory = async (id: string, data: any) => {
  const access = JSON.parse(Cookies.get("user")).accessToken;
  const res = await api
    .put(`/Category/${id}`, data, {
      headers: {
        Authorization: `Bearer ${access}`,
      },
    })
    .then((res) => res)
    .catch((err) => err);

  return res;
};

export const getCategoryByID = async (id: string) => {
  const res = await api
    .get(`/Category/${id}`)
    .then((res) => res)
    .catch((err) => err);

  return res;
};

export const deleteCategory = async (id: string) => {
  const access = JSON.parse(Cookies.get("user")).accessToken;
  const res = await api
    .delete(`/Category/${id}`, {
      headers: {
        Authorization: `Bearer ${access}`,
      },
    })
    .then((res) => res)
    .catch((err) => err);

  return res;
};

export const getCategoryByMemberID = async (id: string, search?: string) => {
  console.log("category id", id);
  const access = JSON.parse(Cookies.get("user")).accessToken;
  const res = await api
    .get(`/Category/membershipId/${id}?search=${search}`, {
      headers: {
        Authorization: `Bearer ${access}`,
      },
    })
    .then((res) => res)
    .catch((err) => err);

  return res;
};
