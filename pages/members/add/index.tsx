import React from "react";
import dynamic from "next/dynamic";

import DefaultLayout from "@/layouts/default";

const AddAdmin = dynamic(() => import("@/components/admin/add-members"), {
  ssr: false,
});

const AddAdminPage = () => {
  return (
    <DefaultLayout showSidebar={false}>
      <AddAdmin />
    </DefaultLayout>
  );
};

export default AddAdminPage;
