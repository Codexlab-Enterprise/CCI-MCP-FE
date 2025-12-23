// import Category from '@/components/repository/category/Category'
import React from "react";
import dynamic from "next/dynamic";

import DefaultLayout from "@/layouts/default";

const Category = dynamic(
  () => import("@/components/repository/category/category"),
  { ssr: false },
);

const CategoryPage = () => {
  return (
    <DefaultLayout showSidebar={true}>
      <Category />
    </DefaultLayout>
  );
};

export default CategoryPage;
