import { AxiosRequestConfig, AxiosResponse } from "axios";
import Cookies from "js-cookie";

import api from "@/utils/axios";
import { BulkInstallmentPayload, BulkInstallmentResponse } from "@/types/installment";
// import { headers } from "next/headers";

export const getMembers = async (
  access: string,
  filters: any,
  payload?: any,
) => {
  const url =
    filters != "" ? `/SecondaryMember/` + `?${filters}` : `/SecondaryMember/`;
  const res = await api
    .post(url, payload, {
      headers: {
        Authorization: `Bearer ${access}`,
      },
    })
    .then((res) => res)
    .catch((err) => err);

  return res;
};

export const getPrimaryMembers = async (
  access: string,
  search: string,
  config?: AxiosRequestConfig,
): Promise<AxiosResponse<any>> => {
  return api.get("/PrimaryMember", {
    ...config, // <- includes signal if provided
    params: { search }, // <- clean query building
    headers: {
      Authorization: `Bearer ${access}`,
      ...(config?.headers || {}), // <- allow header extension/override
    },
  });
};

export const createMember = async (data: any) => {
  const access = JSON.parse(Cookies.get("user")).accessToken;
  const res = await api
    .post("/SecondaryMember/add", data, {
      headers: { Authorization: `Bearer ${access}` },
    })
    .then((res) => res)
    .catch((err) => err);

  return res;
};

export const generateID = async () => {
  const res = await api
    .get("/SecondaryMember/generateID")
    .then((res) => res)
    .catch((err) => err);

  return res;
};

export const updateMember = async (id: string, data: any) => {
  const access = JSON.parse(Cookies.get("user")).accessToken;
  const res = await api
    .put(`/SecondaryMember/${id}`, data, {
      headers: { Authorization: `Bearer ${access}` },
    })
    .then((res) => res)
    .catch((err) => err);

  return res;
};

export const getInstallments = async (access: string, id: any) => {
  const res = await api
    .get(`/v1/installments/members/${id}/installments`, {
      headers: { Authorization: `Bearer ${access}` },
    })
    .then((res) => res)
    .catch((err) => err);

  return res;
};

export const deleteMember = async (id: string) => {
  const access = JSON.parse(Cookies.get("user")).accessToken;
  const res = await api
    .delete(`/SecondaryMember/${id}`, {
      headers: { Authorization: `Bearer ${access}` },
    })
    .then((res) => res)
    .catch((err) => err);

  return res;
};

export const addtransaction = async (payload: any) => {
  const access = JSON.parse(Cookies.get("user")).accessToken;
  const res = await api
    .post("/v1/installments/transactions", payload, {
      headers: { Authorization: `Bearer ${access}` },
    })
    .then((res) => res)
    .catch((err) => err);

  return res;
};

export const update_transaction = async (transactionId: any, payload: any) => {
  const access = JSON.parse(Cookies.get("user")).accessToken;
  const res = await api
    .put(`/v1/installments/transactions/${transactionId}`, payload, {
      headers: { Authorization: `Bearer ${access}` },
    })
    .then((res) => res)
    .catch((err) => err);

  return res;
};

export const delete_transaction = async (transactionId: any) => {
  const access = JSON.parse(Cookies.get("user")).accessToken;
  const res = await api
    .delete(`Transaction/${transactionId}`, {
      headers: { Authorization: `Bearer ${access}` },
    })
    .then((res) => res)
    .catch((err) => err);

  return res;
};

export const gettrnsactions = async (access: string, memberID: any) => {
  const res = await api
    .get(`/v1/installments/members/${memberID}/transactions`, {
      headers: { Authorization: `Bearer ${access}` },
    })
    .then((res) => res)
    .catch((err) => err);

  return res;
};

// export const get
export const deleteTransaction = async (id: string) => {
  const access = JSON.parse(Cookies.get("user")).accessToken;
  const res = await api
    .delete(`/Transaction/${id}`, {
      headers: { Authorization: `Bearer ${access}` },
    })
    .then((res) => res)
    .catch((err) => err);

  return res;
};

// export const updateInstallments = async (payload: any, p0: { dueDate: string; }) => {
//   const access = JSON.parse(Cookies.get("user")).accessToken;
//   const res = await api
//     .put(`/Installment`, payload, {
//       headers: { Authorization: `Bearer ${access}` },
//     })
//     .then((res) => res)
//     .catch((err) => err);

//   return res;
// };

export const getMembersByMemberID = async (access: string, id: any) => {
  const res = await api
    .get(`/SecondaryMember/${id}`, {
      headers: { Authorization: `Bearer ${access}` },
    })
    .then((res) => res)
    .catch((err) => err);

  return res;
};

export const exportData = async (access: string) => {
  const res = await api
    .get(`/uploadfile/secondary/`, {
      headers: { Authorization: `Bearer ${access}` },
    })
    .then((res) => res)
    .catch((err) => err);

  return res;
};

export const exportInstallmentData = async (memberShipId: string) => {
  const access = JSON.parse(Cookies.get("user")).accessToken;
  const res = await api
    .get(`/v1/installments/members/${memberShipId}/statement`, {
      headers: { Authorization: `Bearer ${access}` },
      responseType: 'blob' 
    })
    .then((res) => res)
    .catch((err) => err);
  return res;
};

export const ismemberexists = async (payload: any) => {
  const access = JSON.parse(Cookies.get("user")).accessToken;
  const res = await api
    .post(`/SecondaryMember/exists`, payload, {
      headers: { Authorization: `Bearer ${access}` },
    })
    .then((res) => res)
    .catch((err) => err);

  return res;
};

export const assignballet = async (payload: any) => {
  const access = JSON.parse(Cookies.get("user")).accessToken;
  const res = await api
    .post(`/SecondaryMember/assign-ballet`, payload, {
      headers: { Authorization: `Bearer ${access}` },
    })
    .then((res) => res)
    .catch((err) => err);

  return res;
};

export const getSelectInstallment = async (
  access: string,
  membershipId: string,
) => {
  try {
    const res = await api.get(
      `/Installment/pending-installments?id=${membershipId}`,
      {
        headers: { Authorization: `Bearer ${access}` },
      },
    );

    return res;
  } catch (err) {
    console.error("API Error:", err);

    return err;
  }
};

export const addbelletInfo = async (payload: any) => {
  const access = JSON.parse(Cookies.get("user")).accessToken;
  const res = await api
    .post("/bellet", payload, {
      headers: { Authorization: `Bearer ${access}` },
    })
    .then((res) => res)
    .catch((err) => err);

  return res;
};

export const importData = async (access: string, payload: any) => {
  const res = await api
    .post(
      `/uploadfile/primary
`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${access}`,
          "Content-Type": "multipart/form-data",
        },
      },
    )
    .then((res) => res)
    .catch((err) => err);

  return res;
};

export const addBulkInstallments = async (
  memberId: number, 
  payload: BulkInstallmentPayload
): Promise<BulkInstallmentResponse> => {
  const user = Cookies.get("user");
  if (!user) {
    throw new Error('User not authenticated');
  }

  const access = JSON.parse(user).accessToken;

  const res = await fetch(`/v1/members/${memberId}/installments/bulk`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${access}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  const data: BulkInstallmentResponse = await res.json();
  return data;
};

export const splitInstallment = async (installmentID: String ,payload: any) => {
  const access = JSON.parse(Cookies.get("user")).accessToken;
  const res = await api
    .post(`/v1/installments/installments/${installmentID}/split`, payload, {
      headers: { Authorization: `Bearer ${access}` },
    })
    .then((res) => res)
    .catch((err) => err);

  return res; 
};

export const installmentAmount = async (installmentID: String ,payload: any) => {
  const access = JSON.parse(Cookies.get("user")).accessToken;
  const res = await api
    .post(`/v1/installments/installments/${installmentID}/amount`, payload, {
      headers: { Authorization: `Bearer ${access}` },
    })
    .then((res) => res)
    .catch((err) => err);

  return res; 
};



export const interestCalculate = async (installmentID: Number ,payload: any) => {
  const access = JSON.parse(Cookies.get("user")).accessToken;
  const res = await api
    .get(`/v1/installments/installments/${installmentID}/interest?asOf=${payload}&upsert=1`,  {
      headers: { Authorization: `Bearer ${access}` },
    })
    .then((res) => res)
    .catch((err) => err);

  return res; 
};

export const refreshCalculateInterest = async (memberShipID: String) => {
  const access = JSON.parse(Cookies.get("user")).accessToken;
  const res = await api
    .get(`/v1/installments/members/${memberShipID}/interest/refresh`,  {
      headers: { Authorization: `Bearer ${access}` },
    })
    .then((res) => res)
    .catch((err) => err);

  return res; 
};

// Add this to your API service file
export const updateInstallments = async (installmentId: number, updateData: { amount?: number; dueDate?: string }) => {
  try {
     const access = JSON.parse(Cookies.get("user")).accessToken;
    const response = await api.put(`/v1/installments/installments/${installmentId}`, updateData, {
      
      headers: {
        Authorization: `Bearer ${access}`,
        'Content-Type': 'application/json',
      },
    });
    return response;
  } catch (error) {
    console.error('API Error updating installment:', error);
    throw error;
  }
};