import { Button } from "@heroui/button";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import Cookies from "js-cookie";
import { toast } from "sonner";
import { parseAsInteger, useQueryState } from "nuqs";

import Section from "../../elements/Section";

import MembershipForm from "./membership-form";

import {
  createMemberType,
  deleteMemberType,
  getMemberType,
  updateMemberType,
} from "@/api/member-type";
import ModalComponent from "@/components/Modal";
import SmartTable from "@/components/SmartTable";
import SelectField from "@/components/SelectField";
import DeleteModal from "@/components/DeleteModal";
import Actions from "@/components/Actions";
type FormData = {
  name: string;
};
const Membership = () => {
  const [data, setData] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [addMode, setAddMode] = useState(true);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  // const [selectedMemberType, setSelectedMemberType] = useState(null);
  const access = Cookies.get("user")
    ? JSON.parse(Cookies.get("user"))?.accessToken
    : null;
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [pageSize, setPageSize] = useQueryState(
    "pageSize",
    parseAsInteger.withDefault(5),
  );
  // const {data:membershipType}=useFetch(() => getMemberType({
  //   query: `page=${page}&pageSize=${Array.from(pageSize)[0]}`
  // }, access))
  const router = useRouter();

  const fetchMemberType = async () => {
    const res = await getMemberType(
      { query: `page=${page}&pageSize=${pageSize}&search=${searchQuery}` },
      access,
    )
      .then((res) => res)
      .catch((err) => err);

    if (res.status == 200) {
      setData(res?.data?.items);
    }
    setLoading(false);
  };

  const handleView = (id: string) => {
    console.log(id);
    setSelectedId(id);
  };

  const { setValue } = useForm();
  const handleEdit = (id: string) => {
    console.log(id);
    setSelectedId(id);
    // console.log(data)
    // router.push(`/members/edit`)
    // let item=data.find((item:any)=>item.ID==id);
    // console.log(item);
    // setValue('name', item?.Name);
    // setSelectedMemberType(item);

    setAddMode(false);
    setIsEditModalOpen(true);
  };

  const handleDelete = (id: string) => {
    console.log(id);
    setSelectedId(id);
    setDeleteModal(true);
  };

  const columns = React.useMemo(
    () => [
      { Header: "Name", accessor: "Name" },
      // { Header: "Created At", accessor: "created_at" },
      // { Header: "Updated At", accessor: "updated_at" },
      {
        Header: "Actions",
        accessor: "actions",
        Cell: ({ row }) => (
          <div className="flex space-x-2">
            <Actions
              handleDelete={() => handleDelete(row.original.ID)}
              handleEdit={() => handleEdit(row.original.ID)}
              handleView={() => handleView(row.original.id)}
              isDelete={true}
              isEdit={true}
              isView={false}
            />
          </div>
        ),
      },
    ],
    [data, page, pageSize],
  );

  //   const {data:admin, loading:isAdminLoading}=useFetch(()=>{
  //     fetch
  //   })
  const onConfirmDelete = async () => {
    let toastId = toast.loading("Please wait....");
    const res = await deleteMemberType(selectedId);

    if (res.status == 200) {
      toast.success(res?.data?.message, {
        id: toastId,
      });
      fetchMemberType();
    } else {
      toast.error(res?.response.data?.message, {
        id: toastId,
      });
    }
    setDeleteModal(false);
    setSelectedId(null);
  };

  // useEffect(() => {
  //   setTimeout(() => {
  //     setLoading(false);
  //   }, 3000);
  // }, []);

  const { trigger } = useForm();

  const handleSubmit: SubmitHandler<FormData> = async (data: FormData) => {
    let toastId = toast.loading("Please wait....");

    if (!data.name) {
      trigger("name");

      return;
    }
    let res;

    if (addMode) {
      res = await createMemberType(data);
    } else {
      res = await updateMemberType(selectedId, data);
    }
    if (res.status == 200) {
      toast.success(res?.data?.message, {
        id: toastId,
      });
      fetchMemberType();

      setIsAddModalOpen(false);
      setIsEditModalOpen(false);
    } else {
      toast.error(res?.response.data?.error, {
        id: toastId,
      });
    }
    console.log(data);
  };

  useEffect(() => {
    fetchMemberType();
  }, [page, pageSize]);

  // console.log(membershipType?.data?.items);
  // let memberShipData=membershipType?.data?.items
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
                Add Membership
              </Button>
              {/* <Button
                 onPress={() => router.push('/members/add')}
                 className="bg-black py-7 text-white hover:bg-black/80"
               >
                <Import className='w-5 hidden lg:block h-5' />
                 Import CSV
                </Button>
                <Button
                 onPress={() => router.push('/members/add')}
                 className=" py-7 bg-green-600 text-white  hover:bg-green-700"
               >
                <FaFileExport className='w-5 h-5 hidden lg:block' />
                 Export
                </Button> */}
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
          data={data || []}
          pagePreTitle={undefined}
          pageTitle={"Membership"}
          searchLabel={undefined}
          searchQuery={searchQuery}
          setsearchQuery={setSearchQuery}
          isLoading={loading}
          //  buttonName={"Add"}
          buttonLink={"/membership"}
        />
        <ModalComponent
          content={<MembershipForm onSubmit={handleSubmit} />}
          footerContent={null}
          isOpen={isAddModalOpen}
          setIsOpen={setIsAddModalOpen}
          title={`Add Membership`}
        />
        <ModalComponent
          content={
            <MembershipForm
              data={data}
              id={selectedId}
              isEdit={true}
              onSubmit={handleSubmit}
            />
          }
          footerContent={null}
          isOpen={isEditModalOpen}
          setIsOpen={setIsEditModalOpen}
          title={`Edit Membership`}
        />

        <DeleteModal
          handleDelete={onConfirmDelete}
          isDeleting={loading}
          open={deleteModal}
          setOpen={setDeleteModal}
        />
      </Section>
      {/* </DefaultLayout> */}
    </>
  );
};

export default Membership;
