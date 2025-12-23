"use client";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/router";
import { format } from "date-fns";

import Loader from "../elements/Loader";

import AdminForm from "./members-form";

// APIs
import {
  getInstallments,
  getMembersByMemberID,
  // updateMember, getMembers  // keep these imports only when you actually use them
} from "@/api/members";

/** -------------------------------
 * Utilities
 * -------------------------------- */

// Safely parse cookie JSON
export const dynamic = "force-dynamic";
function readAccessTokenFromCookie(cookieKey = "user") {
  try {
    const raw = Cookies.get(cookieKey);

    if (!raw) return "";
    const parsed = JSON.parse(raw);

    return parsed?.accessToken || "";
  } catch {
    return "";
  }
}

// Format date to yyyy-MM-dd only if valid
function fmt(dateLike) {
  if (!dateLike) return "";
  const d = new Date(dateLike);

  return Number.isNaN(d.getTime()) ? "" : format(d, "yyyy-MM-dd");
}

// Map backend payload → UI form shape
function memberToForm(m: any = {}, installmentsList = []) {
  const items = m?.items || {};

  return {
    firstName: items?.First_Name || "",
    midName: items?.Middle_Name || "",
    lastname: items?.Last_Name || "",
    email: items?.email || "",
    phone: items?.Phone || "",
    gender: items?.Gender || "",
    McbNo: items?.mcb_no || "",
    address: items?.address || "",
    type: items?.category || { id: "", label: "" },
    associatedMember: items?.primary_membership_ID || "",
    secondaryPermaentID: items?.secondary_permanent_id || "",
    balletDate: items?.ballet_date || "",
    proposalCode: items?.proposal_code || "",
    secondarCode: items?.secondary_code || "",
    pinCode: items?.pin_code || "",
    image: items?.image_name || "",
    country: items?.country || "",
    date: fmt(items?.date_of_birth),
    memberShipId: items?.secondry_membership_ID || "",
    nationality: items?.nationality || "",
    subType: items?.membership_Type || { id: "", label: "" },
    installments: items?.Number_of_installment ?? "",
    amount: items?.membership_Amount ?? 0,
    dateOfInstallment: fmt(items?.first_installment_data),
    installmentDetails: installmentsList,
    status: items?.member_status || "",
    received_date: items?.form_received_date,
  };
}

/** -------------------------------
 * Initial Form State
 * -------------------------------- */
const INITIAL_FORM = {
  firstName: "",
  status: "",
  midName: "",
  lastname: "",
  email: "",
  phone: "",
  gender: "",
  McbNo: "",
  installments: "",
  address: "",
  type: { id: "", label: "" },
  associatedMember: "",
  proposalCode: "",
  secondarCode: "",
  pinCode: "",
  country: "",
  date: "",
  memberShipId: "",
  nationality: "",
  subType: { id: "", label: "" },
  dateOfInstallment: "",
  installmentDetails: [],
  image: "",
  amount: 0,
  received_date: "",
};

/** -------------------------------
 * Component
 * -------------------------------- */
const ViewMembers = () => {
  const router = useRouter();
  // const { isReady, query } = router;
  const query = router.query;
  const isReady = router.isReady;

  const accessToken = useMemo(() => readAccessTokenFromCookie("user"), []);
  // const memberId = useMemo(() => query?.id ?? '', [query?.id]);

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [memberRecordId, setMemberRecordId] = useState("");
  const [error, setError] = useState("");
  const [memberId, setMemberId] = useState<string>("");
  // keep track of ongoing async to avoid state update after unmount
  const abortRef = useRef(null);

  const fetchInstallmentsSafe = useCallback(async (token: any, mId: any) => {
    // If you do not have installments API hooked up yet, you can return []
    if (!getInstallments || !mId) return [];
    try {
      const res = await getInstallments(token, mId);

      if (res?.status === 200) {
        // normalize as needed
        return res?.data?.items ?? [];
      }

      return [];
    } catch {
      return [];
    }
  }, []);

  const fetchMemberByID = useCallback(async () => {
    if (!isReady || !memberId || !accessToken) return;

    setLoading(true);
    setError("");

    // setup abort controller (only if your API layer supports passing signal)
    const ctrl = new AbortController();

    abortRef.current = ctrl;

    try {
      const [memberRes, installments] = await Promise.all([
        getMembersByMemberID(
          accessToken,
          memberId /*, { signal: ctrl.signal } */,
        ),
        fetchInstallmentsSafe(accessToken, memberId),
      ]);

      if (memberRes?.status !== 200) {
        throw new Error(memberRes?.data?.message || "Failed to fetch member");
      }

      const items = memberRes?.data?.items || {};

      if (items?.id) setMemberRecordId(items.id);

      setFormData(memberToForm(memberRes?.data, installments));
    } catch (e) {
      // If aborted, ignore
      if (e?.name === "AbortError") return;
      setError(e?.message || "Something went wrong while loading member.");
      setFormData(INITIAL_FORM);
      setMemberRecordId("");
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  }, [isReady, memberId, accessToken, fetchInstallmentsSafe]);

  useEffect(() => {
    fetchMemberByID();

    return () => {
      // cancel any pending requests
      if (abortRef.current) {
        abortRef.current.abort();
      }
    };
  }, [fetchMemberByID]);

  useEffect(() => {
    let _memberID = query.id;

    if (_memberID) {
      setMemberId(_memberID.toString());
    }
  }, [query]);

  return (
    <div className="no-scrollbar">
      {loading ? (
        <Loader />
      ) : error ? (
        <div className="text-red-600 text-sm p-3 rounded border border-red-200 bg-red-50">
          {error}
        </div>
      ) : (
        <AdminForm
          description="View member details"
          formData={formData}
          title="View member"
          type="view"
          setFormData={setFormData}
          // You can pass memberRecordId if your form needs it:
          // memberId={memberRecordId}
          // handleSubmit={handleSubmit}
        />
      )}
    </div>
  );
};

export default ViewMembers;
