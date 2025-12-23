import React from "react";
import dynamic from "next/dynamic";

import DefaultLayout from "@/layouts/default";

const EditAdmin = dynamic(() => import("@/components/admin/edit-member"), {
  ssr: false,
});

const EditAdminPage = () => {
  return (
    <DefaultLayout showSidebar={false}>
      <EditAdmin />
    </DefaultLayout>
  );
};

export default EditAdminPage;
