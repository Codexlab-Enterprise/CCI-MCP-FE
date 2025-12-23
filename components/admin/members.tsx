import { Button } from "@heroui/button";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Import,
  Loader2,
  Plus,
  XCircle,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import React, {
  ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { FaFileExport } from "react-icons/fa6";
import Cookies from "js-cookie";
import { cn } from "@heroui/theme";

import { toast } from "sonner";
import Actions from "@/components/Actions";
import DeleteModal from "@/components/DeleteModal";
import SmartTable from "@/components/SmartTable";

import Section from "@/components/elements/Section";
import { deleteMember, getMembers, importData } from "@/api/members";

import Link from "next/link";

import FilterBadge from "@/components/admin/filter-badge";
import { getCategory } from "@/api/category";
import SearchableDropdown from "@/components/elements/SearchNSelect";
import { getMemberType } from "@/api/member-type";
import { installmentStatus } from "@/data";

import SelectField from "../SelectField";

import { format } from "date-fns";

import api from "@/utils/axios";

import axios from "axios";

const Members = () => {
  const router = useRouter();
  // const searchParams = useSearchParams();
  const pathname = usePathname();
  const _window = typeof window !== "undefined" ? window : null;
  const params = new URLSearchParams(_window?.location?.search);
  // State for filters
  const [filters, setFilters] = useState<any>({
    page: 1,
    pageSize: 5,
    category: "",
    membership: "",
    status: "",
  });

  const [filterModal, setFilterModal] = useState(false);
  const [categories, setCategories] = useState([]);
  const [membership, setMembership] = useState([]);
  const [memberSearch, setMemberSearch] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const inputRef = useRef(null);
  const [data, setData] = useState([]);
  const access = Cookies.get("user")
    ? JSON.parse(Cookies.get("user") || "")?.accessToken
    : null;
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedId, setSelectedId] = useState<any>(null);
  const [categorySearch, setCategorySearch] = useState("");

  // Initialize filters from URL on component mount
  // useEffect(() => {
  //     // const params = new URLSearchParams(searchParams.toString());
  //     setFilters({
  //         page: parseInt(params.get('page') || '1'),
  //         pageSize: parseInt(params.get('pageSize') || '5'),
  //         category: params.get('category') || '',
  //         membership: params.get('membership') || '',
  //         status: params.get('status') || ''
  //     });
  // }, [Params]);

  // Update URL when filters change
 const updateURL = useCallback(
    (newFilters: typeof filters) => {
      const params = new URLSearchParams();

      // Always include pagination
      params.set("page", newFilters.page?.toString());
      params.set("pageSize", newFilters.pageSize.toString());

      // Only include filter params if they have values
      if (newFilters.category) params.set("category", newFilters.category);
      if (newFilters.membership)
        params.set("membership", newFilters.membership);
      if (newFilters.status) params.set("status", newFilters.status);

      if (newFilters.search && newFilters.search.trim() !== "") {
        params.set("search", newFilters.search.trim());
      }

      // Update the URL without page refresh
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname],
  );

  const fetchMembers = async (filtersArg: any) => {
    if (loading) return;
    console.log("inside", filtersArg);

    const queryParams = new URLSearchParams();

    // pagination
    queryParams.set("page", String(filtersArg.page));
    queryParams.set("pagesize", String(filtersArg.pageSize));


    if (filtersArg.search && filtersArg.search.trim() !== "") {
      queryParams.set("search", filtersArg.search.trim());
    }

    const queryString = queryParams.toString();

    const queryBody = {
      CategoryID: filtersArg.category,
      installment_status: filtersArg.status,
      membership_Type: filtersArg.membership,
    };

    setLoading(true);

    const res = await getMembers(access, queryString, queryBody)
      .then((res) => res)
      .catch((err) => err);

    if (res.status == 200) {
      setData(res?.data?.items);
    }

    setLoading(false);
  };

  const updateFilter = useCallback(
    (key: keyof typeof filters, value: any) => {
      const newFilters = { ...filters, [key]: value };

      console.log("newFilters", newFilters);
      fetchMembers(newFilters);
      setFilters(newFilters);
      updateURL(newFilters);
    },
    [filters, updateURL],
  );

  useEffect(() => {
    // Avoid firing before filters are initialized
    if (!filters.page || !filters.pageSize) return;

    // Reset to page 1 on a new search
    const newFilters = {
      ...filters,
      search,
      page: 1,
    };

    setFilters(newFilters);
    fetchMembers(newFilters);
    updateURL(newFilters);
  }, [search]);


  useEffect(() => {
    const payload = {
      search: params.get("search") || "",
      page: params.get("page") || 1,
      pageSize: params.get("pageSize") || 5,
      category: params.get("category"),
      status: params.get("status"),
      membership: params.get("membership"),
    };

    setFilters(payload);
    setSearch(payload.search);
    fetchMembers(payload);
  }, [
    params.get("page"),
    params.get("pageSize"),
    params.get("category"),
    params.get("status"),
    params.get("membership"),
    params.get("search"),
  ]);
  const handleView = (id: string) => {
    router.push(`/members/view/${id}`);
  };

  const handleEdit = (id: string) => {
    router.push(`/members/edit/${id}`);
  };

  const handleDelete = (id: string) => {
    setSelectedId(id);
    setDeleteModal(true);
  };

  const fetchCategory = async () => {
    const res = await getCategory({ query: `search=${categorySearch}` }, access)
      .then((res) => res)
      .catch((err) => err);

    if (res.status == 200) {
      setCategories(
        res?.data?.items.map((item: any) => {
          return {
            id: item.C_ID,
            label: item.CategoryName,
          };
        }),
      );
    }
  };

  const fetchMemberType = async () => {
    const res = await getMemberType({ query: `search=${memberSearch}` }, access)
      .then((res) => res)
      .catch((err) => err);

    if (res.status == 200) {
      setMembership(
        res?.data?.items.map((item: any) => {
          return {
            id: item.ID,
            label: item.Name,
          };
        }),
      );
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "due":
        return <XCircle className="text-white h-4 w-4" />;
      case "paid":
        return <Check className="text-white h-4 w-4" />;
      case "pending":
        return <Loader2 className="text-white animate-spin h-4 w-4" />;
      default:
        return "bg-gray-300";
    }
  };

  const columns = React.useMemo(
    () => [
      {
        Header: "Member ID",
        accessor: "secondry_membership_ID",
        Cell: ({ row }: { row: any }) =>
          row.original.member_status == "complete" ? (
            <Link
              className="hover:underline hover:text-blue-400"
              href={`/members/view/${row.original.secondry_membership_ID}`}
            >
              {`${row.original.secondry_membership_ID}`}
            </Link>
          ) : (
            <h1 className="text-black">{`${row.original.secondry_membership_ID}`}</h1>
          ),
      },
      {
        Header: "MemberShip No.", accessor: "primary_membership_ID",
        Cell: ({ row }: { row: any }) => (
          <div className="flex space-x-2 text-nowrap">
            {row.original.primary_membership_ID ?? "--"}
          </div>
        ),
      },
      {
        Header: "MCP No.",
        accessor: "mcb_no",
        Cell: ({ row }: { row: any }) => (
          <div className="flex space-x-2 text-nowrap">
            {row.original.mcb_no && row.original.mcb_no !== "" && row.original.mcb_no !== "null" && row.original.mcb_no !== "undefined"
              ? row.original.mcb_no
              : "--"
            }
          </div>
        ),
      },
      {
        Header: "Name",
        accessor: "First_Name",
        Cell: ({ row }: { row: any }) => (
          <span className="text-nowrap">{`${row.original.First_Name} ${row.original.Middle_Name} ${row.original.Last_Name}`}</span>
        ),
      },
      { Header: "Phone", accessor: "Phone" },
      { Header: "Email", accessor: "email" },
      { Header: "Membership", accessor: "membership_Type" },
      {
        Header: "Category",
        accessor: "category",
        Cell: ({ row }: { row: any }) => (
          <div className="flex space-x-2 text-nowrap">
            {row.original.category ?? ""}
          </div>
        ),
      },
      { Header: "Nationality", accessor: "nationality" },
      {
        Header: "Installment Status",
        accessor: "installment_status",
        Cell: ({ row }: { row: any }) => (
          <div
            className={cn(
              "px-2 py-1 w-fit flex items-center gap-1 rounded-md text-xs uppercase font-bold text-center",
              row.original.installment_status == "Paid"
                ? "bg-green-500 text-white"
                : "bg-gray-500 text-white",
            )}
          >
            {row.original.installment_status}
          </div>
        ),
      },
      {
        Header: "Upcoming Installment",
        accessor: "upcoming_installment",
        Cell: ({ row }: { row: any }) =>
          row.original.upcoming_installment
            ? format(row.original.upcoming_installment, "dd-MM-yyyy")
            : "--",
      },
      {
        Header: "Status",
        accessor: "membership_status",
        Cell: ({ row }: { row: any }) => (
          <div
            className={cn(
              "px-2 py-1 w-fit flex items-center gap-1 rounded-md text-xs uppercase font-bold text-center",
              row.original.member_status == "complete"
                ? "bg-green-500 text-white"
                : "bg-gray-500 text-white",
            )}
          >
            {row.original.member_status ?? "Complete"}
          </div>
        ),
      },
      {
        Header: "Created by",
        accessor: "CreatedBy",
        Cell: ({ row }: { row: any }) => (
          <div className="flex space-x-2 text-nowrap">
            {row.original.CreatedBy ?? "--"}
          </div>
        ),
      },
      {
        Header: "Updated by",
        accessor: "UpdatedBy",
        Cell: ({ row }: { row: any }) => (
          <div className="flex space-x-2 text-nowrap">
            {row.original.UpdatedBy ?? "--"}
          </div>
        ),
      },
      {
        Header: "Actions",
        accessor: "actions",
        Cell: ({ row }: { row: any }) => (
          <div className="flex space-x-2">
            <Actions
              handleDelete={() => handleDelete(row.original.id)}
              handleEdit={() => handleEdit(row.original.secondry_membership_ID)}
              handleView={() => handleView(row.original.secondry_membership_ID)}
              isDelete={true}
              isEdit={true}
              isView={row.original.member_status == "complete"}
            />
          </div>
        ),
      },
    ],
    [],
  );

  const onConfirmDelete = async () => {
    setIsDeleting(true);
    const toastId = toast.loading("Deleting...");

    const res = await deleteMember(selectedId);

    if (res.status == 200) {
      fetchMembers(filters);
      toast.success(res?.data?.message, { id: toastId });
      setDeleteModal(false);
      setSelectedId(null);
    } else {
      toast.error(res?.data?.message, { id: toastId });
    }
    setIsDeleting(false);
  };

  useEffect(() => {
    fetchMemberType();
  }, [memberSearch]);

  useEffect(() => {
    fetchCategory();
  }, [categorySearch]);

  //  import axios from 'axios';

  const handleExport = async () => {
    const toastId = toast.loading("Exporting...");
    const payload = {
      CategoryID: filters.category,
      membership_Type: filters.membership,
      installment_status: filters.status,
    };

    try {
      // 1. Make the API request with proper headers and response type
      const response = await api({
        method: "post",
        url: `/uploadfile/secondary/data`, // Your export endpoint
        responseType: "blob", // Important for file downloads
        headers: {
          Authorization: `Bearer ${access}`,
          Accept:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        },
        data: payload,
      });

      // 2. Create a download link for the blob data
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");

      link.href = url;
      link.setAttribute(
        "download",
        `members_export_${new Date().toISOString().split("T")[0]}.xlsx`,
      );

      // 3. Trigger the download
      document.body.appendChild(link);
      link.click();

      // 4. Clean up
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Export completed successfully", { id: toastId });
    } catch (error) {
      console.error("Export error:", error);

      // Handle specific error cases
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          toast.error("Unauthorized - Please login again", { id: toastId });
        } else {
          toast.error(error.response?.data?.message || "Export failed", {
            id: toastId,
          });
        }
      } else {
        toast.error("Failed to export members", { id: toastId });
      }
    }
  };

  const handleImport = async () => {
    inputRef.current.click();
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const fileObj = event.target.files && event.target.files[0];

    if (!fileObj) return;

    const formData = new FormData();

    formData.append("file", fileObj);

    toast.promise(importData(access, formData), {
      loading: "Importing...",
      success: (data: any) => data?.data?.message,
      error: (err: any) => err?.response?.data?.error,
    });
  };

  const selectedCategory = useMemo(() => {
    return categories.find(
      (category: any) => category.id == Number(filters.category),
    );
  }, [filters.category, categories]);

  const selectedMembership = useMemo(() => {
    return membership.find(
      (category: any) => category.id == Number(filters.membership),
    );
  }, [filters.membership, membership]);

  const selectedInstallmentStatus = useMemo(() => {
    return installmentStatus.find(
      (category) => category.label === filters.status,
    );
  }, [filters.status]);

  return (
    <Section className="">
      <div className="w-full ">
        <SmartTable
          ExtraButtonCode={
            <div className="flex items-center gap-2">
              <Button
                className="bg-blue-500 py-7 text-white hover:bg-blue-600"
                onPress={() => {
                  window.location.href = "/members/add";
                }}
              >
                <Plus className="w-5 block h-5" />
                <span className="hidden lg:block">Add Member</span>
              </Button>
              <input
                ref={inputRef}
                accept=".csv, .xlsx"
                style={{ display: "none" }}
                type="file"
                onChange={handleFileChange}
              />
              <Button
                className="bg-black py-7 text-white hover:bg-black/80"
                onPress={handleImport}
              >
                <Import className="w-5 block h-5" />
                <span className="hidden lg:block">Import CSV</span>
              </Button>
              <Button
                className="py-7 bg-green-600 text-white hover:bg-green-700"
                onPress={handleExport}
              >
                <FaFileExport className="w-5 h-5 block" />
                <span className="hidden lg:block">Export</span>
              </Button>
            </div>
          }
          ExtraCode={
            <>
              <div className="mb-5 grid grid-cols-1 md:grid-cols-3 gap-2 lg:gap-10">
                <SearchableDropdown
                  handleChange={(option) =>
                    updateFilter("membership", String(option.id))
                  }
                  id="id"
                  label="label"
                  options={membership}
                  placeholder="Search membership"
                  query={memberSearch}
                  selectedVal={selectedMembership}
                  setQuery={setMemberSearch}
                  title="Membership"
                />
                <SearchableDropdown
                  handleChange={(option) =>
                    updateFilter("category", String(option.id))
                  }
                  id="id"
                  label="label"
                  options={categories}
                  placeholder="Search category"
                  query={categorySearch}
                  selectedVal={selectedCategory}
                  setQuery={setCategorySearch}
                  title="Category"
                />

                <SearchableDropdown
                  handleChange={(option) =>
                    updateFilter("status", option.label)
                  }
                  id="id"
                  label="label"
                  options={installmentStatus}
                  placeholder="Search status"
                  selectedVal={selectedInstallmentStatus}
                  title="Installment Status"
                />
              </div>
              <div>
                {filters.category && (
                  <FilterBadge
                    filters={filters}
                    setFilters={(newFilters) => {
                      setFilters(newFilters);
                      updateURL(newFilters);
                    }}
                    type="category"
                    value={selectedCategory?.label || ""}
                  />
                )}
                {filters.membership && (
                  <FilterBadge
                    filters={filters}
                    setFilters={(newFilters) => {
                      setFilters(newFilters);
                      updateURL(newFilters);
                    }}
                    type="membership"
                    value={selectedMembership?.label || ""}
                  />
                )}
                {filters.status && (
                  <FilterBadge
                    filters={filters}
                    setFilters={(newFilters) => {
                      setFilters(newFilters);
                      updateURL(newFilters);
                    }}
                    type="status"
                    value={filters.status}
                  />
                )}
              </div>
            </>
          }
          _setSortBy={undefined}
          bottomContent={
            <div className="flex items-center gap-2 justify-end w-full">
              <SelectField
                className={"min-w-20"}
                options={["5", "10", "25", "50"]}
                outsideLabel={"Rows per page"}
                value={new Set([filters?.pageSize?.toString()])}
                onChange={(selected: Set<string>) => {
                  updateFilter("pageSize", Number(Array.from(selected)[0]));
                }}
              />
              <div className="flex items-center gap-2">
                <button
                  disabled={filters.page === 1}
                  onClick={() => {
                    // Always allow going to previous page if not on first page
                    if (filters.page > 1) {
                      updateFilter("page", parseInt(filters.page) - 1);
                    }
                  }}
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>

                <input
                  className="w-10 text-center border py-2 rounded border-gray-400"
                  min={1}
                  type="number"
                  value={
                    filters.page === undefined || filters.page === null
                      ? ""
                      : String(filters.page)
                  }
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "") {
                      updateFilter("page", undefined);
                      return;
                    }

                    const pageNum = Number(val);

                    if (!Number.isNaN(pageNum) && pageNum > 0) {
                      updateFilter("page", pageNum);
                    }
                  }}
                  onKeyDown={(e) => {
                    const allowedKeys = [
                      "Backspace",
                      "Delete",
                      "ArrowLeft",
                      "ArrowRight",
                      "Tab",
                    ];

                    if (!/[0-9]/.test(e.key) && !allowedKeys.includes(e.key)) {
                      e.preventDefault();
                    }
                  }}
                />

                <button
                  onClick={() => {
                    // Remove the filters.page > 1 condition - this was the main issue
                    // Always allow going to next page
                    updateFilter("page", parseInt(filters.page) + 1);
                  }}
                // If you have totalPages data, add: disabled={filters.page >= totalPages}
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          }
          buttonLink={"/members"}
          columns={columns}
          data={data}
          isLoading={loading}
          pagePreTitle={""}
          pageTitle={"Members"}
          searchLabel={"Search Members"}
          searchQuery={search}
          setsearchQuery={setSearch}
        />
      </div>
      <DeleteModal
        handleDelete={onConfirmDelete}
        isDeleting={isDeleting}
        open={deleteModal}
        setOpen={setDeleteModal}
      />
    </Section>
  );
};

export default Members;
