import Cookies from "js-cookie";

import api from "@/utils/axios";

export const getMemberType = async (
  { query }: { query?: string },
  access: string,
) => {
  let url = query != "" ? `/MembershipType` + `?${query}` : `/MembershipType`;
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

export const createMemberType = async (data: any) => {
  const access = JSON.parse(Cookies.get("user")).accessToken;
  const res = await api
    .post("/MembershipType", data, {
      headers: { Authorization: `Bearer ${access}` },
    })
    .then((res) => res)
    .catch((err) => err);

  return res;
};

export const updateMemberType = async (id: string, data: any) => {
  const access = JSON.parse(Cookies.get("user")).accessToken;
  const res = await api
    .put(`/MembershipType/${id}`, data, {
      headers: { Authorization: `Bearer ${access}` },
    })
    .then((res) => res)
    .catch((err) => err);

  return res;
};

export const deleteMemberType = async (id: string) => {
  const access = JSON.parse(Cookies.get("user")).accessToken;
  const res = await api
    .delete(`/MembershipType/${id}`, {
      headers: { Authorization: `Bearer ${access}` },
    })
    .then((res) => res)
    .catch((err) => err);

  return res;
};
