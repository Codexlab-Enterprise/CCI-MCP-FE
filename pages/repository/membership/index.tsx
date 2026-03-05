import React from "react";

import Membership from "@/components/repository/membership/membership";
import DefaultLayout from "@/layouts/default";

const MembershipPage = () => {
  return (
    <DefaultLayout showSidebar={true}>
      <Membership />
    </DefaultLayout>
  );
};

export default MembershipPage;
