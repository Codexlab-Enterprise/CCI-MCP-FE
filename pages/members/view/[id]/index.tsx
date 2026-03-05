import React from "react";

import ViewMembers from "@/components/admin/view-members";
import DefaultLayout from "@/layouts/default";

const ViewPage = () => {
  return (
    <DefaultLayout showSidebar={false}>
      <ViewMembers />
    </DefaultLayout>
  );
};

export default ViewPage;
