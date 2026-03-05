// import Category from '@/components/repository/category/Category'
import React from "react";

import Category from "@/components/repository/category/category";
import DefaultLayout from "@/layouts/default";

const CategoryPage = () => {
  return (
    <DefaultLayout showSidebar={true}>
      <Category />
    </DefaultLayout>
  );
};

export default CategoryPage;
