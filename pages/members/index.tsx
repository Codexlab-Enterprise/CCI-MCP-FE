import React from "react";

import Members from "@/components/admin/members";
// import Admin from '@/components/admin/admin'
import DefaultLayout from "@/layouts/default";

const MembersPage = () => {
  return (
    <DefaultLayout showSidebar={true}>
      <Members />
    </DefaultLayout>
  );
};

export default MembersPage;
