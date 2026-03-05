import React from "react";

import EditAdmin from "@/components/admin/edit-member";
import DefaultLayout from "@/layouts/default";

const EditAdminPage = () => {
  return (
    <DefaultLayout showSidebar={false}>
      <EditAdmin />
    </DefaultLayout>
  );
};

export default EditAdminPage;
