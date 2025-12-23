import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/router";
import { format } from "date-fns";

import Loader from "../elements/Loader";

import AdminForm from "./members-form";

import {
  createMember,
  getMembersByMemberID,
  updateMember,
} from "@/api/members";

const EditAdmin = () => {
  const router = useRouter();
  const query = router.query;
  const [loading, setLoading] = useState(true);
  const [installments] = useState([]);
  const [status, setStatus] = useState("draft");
  const [memberId, setMemberId] = useState<string>("");
  const [formData, setFormData] = useState({
    firstName: "",
    midName: "",
    lastname: "",
    email: "",
    phone: "",
    gender: "",
    McbNo: "",
    installments: "",
    address: "",
    typeName: "",
    type: null,
    associatedMember: "",
    proposalCode: "",
    secondarCode: "",
    pinCode: "",
    country: "",
    date: "", // Format: YYYY-MM-DD
    memberShipId: "",
    subTypeName: "",
    nationality: "",
    subType: null,
    received_date: "",
    // installments: '',
    dateOfInstallment: "",
    installmentDetails: [],
    image: "",
    amount: 0,
    status: "draft",
    // nationality: '',

    // agreeTerms: false
  });
  const [id, setId] = useState("");
  const access = Cookies.get("user")
    ? JSON.parse(Cookies.get("user")).accessToken
    : "";

  const fetchMemberByID = async () => {
    setLoading(true);
    // const filter=`search=${memberId}`
    const res = await getMembersByMemberID(access, memberId);

    if (res.status == 200) {
      // console.log('res amount', res?.data?.items?.membership_Amount);
      if (res?.data?.items?.id) {
        setId(res?.data?.items?.id);
      }
      setFormData({
        firstName: res.data.items?.First_Name,
        midName: res.data.items?.Middle_Name,
        lastname: res.data.items?.Last_Name,
        email: res.data.items?.email,
        phone: res.data.items?.Phone,
        gender: res.data.items?.Gender,
        McbNo: res.data.items?.mcb_no,
        // installments: res.data.items.Installments,
        address: res.data.items?.address,
        typeName: res.data.items?.category,
        type: res.data.items?.CategoryID,
        associatedMember: res.data.items?.primary_membership_ID,
        proposalCode: res.data.items?.proposal_code,
        secondarCode: res.data.items?.secondary_code,
        pinCode: res.data.items?.pin_code,
        image: res.data.items?.image_name,
        country: res.data.items?.country,
        date: res.data?.items?.date_of_birth
          ? format(`${new Date(res.data?.items?.date_of_birth)}`, "yyyy-MM-dd")
          : "",
        memberShipId: res.data.items?.secondry_membership_ID,
        nationality: res.data.items?.nationality,
        // secondarCode: res.data.items?.secondary_code,
        subTypeName: res.data.items?.membership_Type,
        subType: res.data.items?.membershipType_ID,

        installments: res.data.items?.Number_of_installment,
        // type:
        amount: res.data.items?.membership_Amount,
        dateOfInstallment: res.data?.items?.first_installment_data
          ? format(
              `${new Date(res.data?.items?.first_installment_data)}`,
              "yyyy-MM-dd",
            )
          : "",

        installmentDetails: installments,
        status: res.data.items?.member_status,
        received_date: res.data.items?.form_received_date
          ? format(
              `${new Date(res.data?.items?.form_received_date)}`,
              "yyyy-MM-dd",
            )
          : "",
        // nationality: res.data.items.Nationality
      });
      setStatus(res.data.items?.member_status);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (memberId) {
      fetchMemberByID();
    }
  }, [memberId]);
  useEffect(() => {
    let _memberID = query.id;

    if (_memberID) {
      setMemberId(_memberID.toString());
    }
  }, [query]);
  const handleSubmit = async (formData) => {
    // e.preventDefault();
    const data = {
      First_name: formData.firstName,
      Last_Name: formData.lastname,
      Middle_Name: formData.midName,
      email: formData.email,
      Phone: formData.phone,
      Gender: formData.gender,
      date_of_birth: formData.date,
      nationality: formData.nationality,
      secondary_code: formData.secondarCode.toString(),
      proposal_code: formData.proposalCode.toString(),
      mcb_no: formData.McbNo,
      primary_membership_ID: formData.associatedMember.toString(),
      secondry_membership_ID: formData.memberShipId.toString(),
      category: formData.type.value,
      membership_Type: formData.subType.value,
      address: formData.address,
      pin_code: formData.pinCode,
      country: formData.country,
      Number_of_installment: formData.installments,
      image_name: formData.image,
      CategoryID: formData.type.id || formData.type,
      membership_TypeId: formData.subType.id || formData.subType,

      first_installment_data: formData.dateOfInstallment,
      membership_Amount: formData.amount,
      // ...(formData.status=='draft'&&{

      installment: formData.installmentDetails.map(
        (item: any, index: number) => ({
          Installment_no: index + 1,
          Installment_amount: item.amount,
          Installment_date: item.date,
        }),
      ),
      // }),

      member_status: formData.status,
    };
    let res: any;

    if (status == "draft") {
      res = await createMember(data)
        .then((res) => res)
        .catch((err) => err);
    } else {
      res = await updateMember(id, data)
        .then((res) => res)
        .catch((err) => err);
    }

    return res;
  };

  return (
    <div>
      {loading ? (
        <>
          <Loader />
        </>
      ) : (
        <>
          <AdminForm
            description="Update member details"
            formData={formData}
            handleSubmit={handleSubmit}
            memberId={memberId ? memberId.toString() : null}
            setFormData={setFormData}
            title={`${memberId}`}
            type="edit"
          />
        </>
      )}
    </div>
  );
};

export default EditAdmin;
