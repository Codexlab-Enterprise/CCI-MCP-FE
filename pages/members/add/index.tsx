import React from "react";

import AddAdmin from "@/components/admin/add-members";
import DefaultLayout from "@/layouts/default";

const AddAdminPage = () => {
  return (
    <DefaultLayout showSidebar={false}>
      <AddAdmin />
    </DefaultLayout>
  );
};

export default AddAdminPage;
