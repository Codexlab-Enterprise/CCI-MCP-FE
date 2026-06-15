import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Loader2 } from "lucide-react";

import {
  useTable,
  useGlobalFilter,
  useSortBy,
  usePagination,
} from "react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

export const SearchIcon = (props) => {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      focusable="false"
      height="1em"
      role="presentation"
      viewBox="0 0 24 24"
      width="1em"
      {...props}
    >
      <path
        d="M11.5 21C16.7467 21 21 16.7467 21 11.5C21 6.25329 16.7467 2 11.5 2C6.25329 2 2 6.25329 2 11.5C2 16.7467 6.25329 21 11.5 21Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
      <path
        d="M22 22L20 20"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
};

const SmartTables = ({
  columns,
  data = [],
  isLoading,
  pageTitle,
  bottomContent = null,
  pagePreTitle,
  buttonName = "",
  searchLabel,
  buttonLink,
  ExtraCode,
  ExtraButtonCode,
  searchQuery = "",
  setsearchQuery = null,
  secondarySearchQuery = "",
  setSecondarySearchQuery = null,
  secondarySearchLabel = undefined,
  isHeaderVisible = true,
  isSearchable = true,
  selectedPageSize = 10,
  _setSortBy,
}) => {
  const [selectedSize, setSelectedPageSize] = useState(100);
  const router = useRouter();

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
    gotoPage,
    state: { globalFilter },
    setGlobalFilter,
  } = useTable(
    {
      columns,
      data,
      initialState: { pageIndex: 0, pageSize: selectedSize },
    },
    useGlobalFilter,
    useSortBy,
    usePagination,
  );

  useEffect(() => {
    setSelectedPageSize(selectedPageSize);
    gotoPage(0);
  }, [selectedPageSize]);

  return (
    <>
      {isHeaderVisible ? (
        <section className="flex sm:block flex-col items-center justify-between gap-2 py-5 md:py-5">
          <div className="container">
            <div className="flex flex-col gap-4 px-2 lg:flex-row lg:items-center lg:justify-between">
              <div className="shrink-0">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 lg:text-4xl">
                  {pageTitle}
                </h1>
                {pagePreTitle ? (
                  <h3 className="mt-1 text-sm text-gray-500">{pagePreTitle}</h3>
                ) : null}
              </div>
              <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
                {isSearchable ? (
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <div className="relative">
                      <SearchIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        className="h-11 w-full pl-9 sm:w-56 lg:w-60"
                        placeholder={
                          searchLabel != undefined ? searchLabel : "Search"
                        }
                        value={
                          setsearchQuery != null
                            ? searchQuery
                            : globalFilter || ""
                        }
                        onChange={(e) =>
                          setsearchQuery != null
                            ? setsearchQuery(e.target.value)
                            : setGlobalFilter(e.target.value)
                        }
                      />
                    </div>
                    {setSecondarySearchQuery != null ? (
                      <div className="relative">
                        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          className="h-11 w-full pl-9 sm:w-56 lg:w-60"
                          placeholder={
                            secondarySearchLabel != undefined
                              ? secondarySearchLabel
                              : "Search"
                          }
                          value={secondarySearchQuery}
                          onChange={(e) =>
                            setSecondarySearchQuery(e.target.value)
                          }
                        />
                      </div>
                    ) : null}
                  </div>
                ) : null}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  {ExtraButtonCode ? ExtraButtonCode : null}
                  {buttonName != "" ? (
                    <Button
                      className="mx-3 px-10 py-7 rounded-xl"
                      onClick={() => {
                        router.push(
                          buttonLink.includes("/add") ||
                            buttonLink.includes("/form")
                            ? buttonLink
                            : buttonLink + "/add",
                        );
                      }}
                    >
                      <span>{buttonName}</span>
                    </Button>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <section className="container">
        {ExtraCode !== undefined ? ExtraCode : <></>}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <ScrollArea className="lg:max-w-[80vw]">
            <Table {...getTableProps()}>
              {headerGroups.map((headerGroup, idx) => (
                <TableHeader
                  className="relative z-10 bg-gray-50/80"
                  {...headerGroup.getHeaderGroupProps()}
                  key={idx}
                >
                  <TableRow className="border-b border-gray-200 hover:bg-transparent">
                    {headerGroup.headers
                      .filter((column) => column.show !== false)
                      .map((column) => (
                        <TableHead
                          {...column.getHeaderProps(
                            column.getSortByToggleProps
                              ? column.getSortByToggleProps()
                              : undefined,
                          )}
                          key={column.id}
                          className="relative z-20 h-11 whitespace-nowrap px-4 text-xs font-semibold uppercase tracking-wide text-gray-500"
                        >
                          {column.render("Header")}
                          {column.isSorted
                            ? column.isSortedDesc
                              ? " ▼"
                              : " ▲"
                            : ""}
                        </TableHead>
                      ))}
                  </TableRow>
                </TableHeader>
              ))}
              <TableBody {...getTableBodyProps()}>
                {isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="text-center py-12"
                    >
                      <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
                    </TableCell>
                  </TableRow>
                ) : page.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="text-center py-12 text-muted-foreground"
                    >
                      No rows to display.
                    </TableCell>
                  </TableRow>
                ) : (
                  page.map((row, key) => {
                    prepareRow(row);

                    return (
                      <TableRow
                        {...row.getRowProps()}
                        key={key}
                        className="border-b border-gray-100 transition-colors last:border-0 hover:bg-blue-50/40"
                      >
                        {row.cells
                          .filter((cell) => cell.column.show !== false)
                          .map((cell, cellKey) => (
                            <TableCell
                              {...cell.getCellProps()}
                              key={cellKey}
                              className="px-4 py-3.5 text-sm text-gray-700"
                            >
                              {cell.render("Cell")}
                            </TableCell>
                          ))}
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
        {bottomContent ? (
          <div className="flex justify-end mt-4">{bottomContent}</div>
        ) : null}
      </section>
    </>
  );
};

export default React.memo(SmartTables);
