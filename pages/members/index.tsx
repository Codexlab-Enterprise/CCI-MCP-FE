import React from "react";
import dynamic from "next/dynamic";

import DefaultLayout from "@/layouts/default";

const Members = dynamic(() => import("@/components/admin/members"), {
  ssr: false,
});

const MembersPage = () => {
  return (
    <DefaultLayout showSidebar={true}>
      <Members />
    </DefaultLayout>
  );
};

export default MembersPage;
