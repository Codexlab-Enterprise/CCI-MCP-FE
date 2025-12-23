import React from "react";
import dynamic from "next/dynamic";

import DefaultLayout from "@/layouts/default";

const ViewMembers = dynamic(() => import("@/components/admin/view-members"), {
  ssr: false,
});

const ViewPage = () => {
  return (
    <DefaultLayout showSidebar={false}>
      <ViewMembers />
    </DefaultLayout>
  );
};

export default ViewPage;
