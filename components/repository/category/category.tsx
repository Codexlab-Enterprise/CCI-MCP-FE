import { Button } from "@heroui/button";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import Cookies from "js-cookie";
import { toast } from "sonner";
import { parseAsInteger, useQueryState } from "nuqs";

import Section from "../../elements/Section";

import CategoryForm from "./categoryForm";

import {
  createCategory,
  deleteCategory,
  getCategory,
  updateCategory,
} from "@/api/category";
import ModalComponent from "@/components/Modal";
import SmartTable from "@/components/SmartTable";
import SelectField from "@/components/SelectField";
import DeleteModal from "@/components/DeleteModal";
import Actions from "@/components/Actions";
type FormData = {
  name: string;
  membership_type: {
    id: string;
    label: string;
  };

  price: string;
};
const Category = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addMode, setAddMode] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  // const [selected]
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [pageSize, setPageSize] = useQueryState(
    "pageSize",
    parseAsInteger.withDefault(5),
  );
  const access = Cookies.get("user")
    ? JSON.parse(Cookies.get("user"))?.accessToken
    : null;
  const router = useRouter();

  const fetchCategory = async () => {
    const res = await getCategory(
      { query: `page=${page}&pagesize=${pageSize}&search=${searchQuery}` },
      access,
    )
      .then((res) => res)
      .catch((err) => err);

    if (res.status == 200) {
      console.log(res?.data?.items);
      setData(res?.data?.items);
    }
    setLoading(false);
  };

  // console.log('category', category)
  // let categoryData=category?.data?.items
  const handleView = (id: string) => {
    console.log(id);
    setSelectedId(id);
  };

  const handleEdit = (id: string) => {
    setSelectedId(id);
    setIsEditModalOpen(true);
    // router.push(`/members/edit`)
  };

  const handleDelete = (id: string) => {
    setSelectedId(id);
    setDeleteModal(true);
  };

  const { trigger } = useForm();

  const handleSubmit: SubmitHandler<FormData> = async (data: FormData) => {
    if (!data.name) {
      trigger("name");

      return;
    } else if (!data.membership_type) {
      trigger("membership_type");

      return;
    } else if (!data.price) {
      trigger("price");
    }
    const payload = {
      name: data.name,
      membership_type: data.membership_type.toString(),
      price: data.price,
    };

    console.log(payload);
    const toastId = toast.loading("Adding...");
    let res = await createCategory(payload)
      .then((res) => res)
      .catch((err) => err);

    // res

    if (res.status == 200) {
      setIsAddModalOpen(false);
      // setIsEditModalOpen(false);
      setSelectedId(null);
      fetchCategory();
      toast.success(res?.data?.message, { id: toastId });
    } else {
      toast.error(res?.response.data.message, { id: toastId });
    }

    // }
  };

  const handleEditForm: SubmitHandler<FormData> = async (data: FormData) => {
    if (!data.name) {
      trigger("name");

      return;
    } else if (!data.membership_type) {
      trigger("membership_type");

      return;
    } else if (!data.price) {
      trigger("price");
    }

    const toastId = toast.loading("Updating...");
    const payload = {
      name: data.name,
      membership_type: data.membership_type.toString(),
      price: data.price,
    };
    let res = await updateCategory(selectedId, payload)
      .then((res) => res)
      .catch((err) => err);

    if (res.status == 200) {
      // setIsAddModalOpen(false);
      setIsEditModalOpen(false);
      setSelectedId(null);
      fetchCategory();
      toast.success(res?.data?.message, { id: toastId });
    } else {
      toast.error(res?.response.data?.error, { id: toastId });
    }
  };

  const columns = React.useMemo(
    () => [
      { Header: "Name", accessor: "CategoryName" },
      // { Header: "Name", accessor: "firstName", Cell: ({ row }) => `${row.original.firstName} ${row.original.lastname}` },
      { Header: "Membership Type", accessor: "MembershipType" },
      { Header: "Price", accessor: "Price" },
      { Header: "Created By", accessor: "CreatedBy" },
      { Header: "Updated By", accessor: "UpdatedBy" },

      // { Header: "Category", accessor: "subType" },
      {
        Header: "Actions",
        accessor: "actions",
        Cell: ({ row }) => (
          <div className="flex space-x-2">
            <Actions
              handleDelete={() => handleDelete(row.original.C_ID)}
              handleEdit={() => handleEdit(row.original.C_ID)}
              handleView={() => handleView(row.original.C_ID)}
              isDelete={true}
              isEdit={true}
              isView={false}
            />
          </div>
        ),
      },
    ],
    [],
  );

  //   const {data:admin, loading:isAdminLoading}=useFetch(()=>{
  //     fetch
  //   })
  const onConfirmDelete = async () => {
    setIsDeleting(true);
    const toastId = toast.loading("Deleting...");
    const res = await deleteCategory(selectedId)
      .then((res) => res)
      .catch((err) => err);

    if (res.status == 200) {
      fetchCategory();
      setDeleteModal(false);

      setSelectedId(null);
      toast.success(res?.data?.message, { id: toastId });
    } else {
      toast.error(res?.response.data?.error, { id: toastId });
    }
    setIsDeleting(false);
  };

  useEffect(() => {
    fetchCategory();
  }, [page, pageSize, searchQuery]);

  return (
    <>
      {/* <DefaultLayout showSidebar={true}> */}
      <Section className="">
        <SmartTable
          ExtraButtonCode={
            <div className="flex items-center gap-2">
              <Button
                onPress={() => setIsAddModalOpen(true)}
                className="bg-blue-500 py-7 text-white hover:bg-blue-600"
              >
                <Plus className="w-5 hidden lg:block h-5" />
                Add Category
              </Button>
            </div>
          }
          ExtraCode={undefined}
          _setSortBy={undefined}
          bottomContent={
            <div className="flex items-center gap-2 justify-end w-full">
              <SelectField
                outsideLabel={"Rows per page"}
                value={new Set([pageSize.toString()])}
                className={"min-w-20"}
                onChange={(selected: Set<string>) => {
                  setPageSize(Number(Array.from(selected)[0]));
                }}
                options={["5", "10", "25", "50"]}
              />

              {/* <SelectField
                    outsideLabel={'Rows per page'}
                    value={pageSize}
                    defaultValue={new Set(['5'])}
                    className={'min-w-20'}
                    onChange={setPageSize}
                    options={['5', '10', '25', '50']}
                  /> */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    // if()
                    setPage(page - 1);
                  }}
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <input
                  className="w-10 text-center border py-2 rounded border-gray-400"
                  type="numeric"
                  min={1}
                  max={10}
                  value={page}
                  onChange={(e) => {
                    if (Number(e.target.value) > 1) {
                      setPage(Number(e.target.value));
                    }
                  }}
                />
                <button onClick={() => setPage(page + 1)}>
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          }
          columns={columns}
          data={data ?? []}
          pagePreTitle={undefined}
          pageTitle={"Category"}
          searchLabel={undefined}
          isLoading={loading}
          //  buttonName={"Add"}
          buttonLink={"/category"}
        />
        <ModalComponent
          content={<CategoryForm onSubmit={handleSubmit} />}
          footerContent={null}
          isOpen={isAddModalOpen}
          setIsOpen={setIsAddModalOpen}
          title={`Add Membership`}
        />
        <ModalComponent
          content={
            <CategoryForm
              data={data}
              id={selectedId}
              isEdit={true}
              setSelectedId={setSelectedId}
              onSubmit={handleEditForm}
            />
          }
          footerContent={null}
          isOpen={isEditModalOpen}
          setIsOpen={setIsEditModalOpen}
          title={`Edit Membership`}
        />
        <DeleteModal
          handleDelete={onConfirmDelete}
          isDeleting={isDeleting}
          open={deleteModal}
          setOpen={setDeleteModal}
        />
      </Section>
      {/* </DefaultLayout> */}
    </>
  );
};

export default Category;
