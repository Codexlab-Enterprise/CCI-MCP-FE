import React from "react";
import dynamic from "next/dynamic";

import DefaultLayout from "@/layouts/default";

const Membership = dynamic(
  () => import("@/components/repository/membership/membership"),
  { ssr: false },
);

const MembershipPage = () => {
  return (
    <DefaultLayout showSidebar={true}>
      <Membership />
    </DefaultLayout>
  );
};

export default MembershipPage;
