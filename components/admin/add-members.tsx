import React, { useState } from "react";
import { toast } from "sonner";
import { parseDate } from "@internationalized/date";

import AdminForm from "./members-form";

import { createMember } from "@/api/members";

// import { form } from '@heroui/react';

const AddAdmin = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastname: "",
    email: "",
    midName: "",
    gender: "",
    phone: "",
    date: parseDate("2015-01-01").toString(),
    memberShipId: "",
    McbNo: "",
    address: "",
    installments: "1",
    image: "",
    associatedMember: "",
    proposalCode: "",
    secondarCode: "",
    type: null,
    pinCode: "",
    country: "India",
    subType: null,
    dateOfInstallment: parseDate("2023-01-01").toString(),
    installmentDetails: [],
    nationality: "India",
    amount: 0,
    status: "draft",
    received_date: new Date().toISOString().split("T")[0],
    // agreeTerms: false
  });

  const handleSubmit = async (data: any) => {
    if (
      !data.firstName.trim() ||
      !data.lastname.trim() ||
      !formData.email.trim() ||
      !formData.phone.trim()
    ) {
      toast.warning("Please fill in all required fields.");
    }
    let payload = {
      First_name: data.firstName,
      Last_Name: data.lastname,
      Middle_Name: data.midName,
      email: data.email,
      Phone: data.phone,
      Gender: data.gender,
      date_of_birth: data.date,
      nationality: data.nationality,
      secondary_code: data.secondarCode.toString(),
      proposal_code: data.proposalCode.toString(),
      mcb_no: data.McbNo,
      primary_membership_ID: data.associatedMember.toString(),
      secondry_membership_ID: data.memberShipId.toString(),
      category: data.type?.label || "",
      membership_Type: data.subType?.label || "",
      address: data.address,
      pin_code: data.pinCode,
      country: data.country,
      image_name: data.image,
      first_installment_data: data.dateOfInstallment,
      membership_Amount: data.amount,
      Number_of_installment: data.installmentDetails.length,
      installment: data.installmentDetails.map((item: any, index: number) => ({
        amountDue: item.amount,
        dueDate: item.date,
        // label : item.label,
      })),
      member_status: data.status,
      form_received_date: data.received_date,
      CategoryID: data.type?.value || "",
      membership_TypeId: data.subType?.value || "",
      // membership_Type:formData.subType.value
    };

    console.log(payload);
    const res = await createMember(payload);

    return res;

    // e.preventDefault();
  };

  return (
    <div>
      <AdminForm
        description="Add a new member to the club"
        formData={formData}
        handleSubmit={handleSubmit}
        setFormData={setFormData}
        title="Add Members"
        type="add"
      />
    </div>
  );
};

export default AddAdmin;
