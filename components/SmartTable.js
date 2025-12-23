import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAsyncList } from "@react-stately/data";

import {
  useTable,
  useGlobalFilter,
  useSortBy,
  usePagination,
} from "react-table";
import {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
} from "@heroui/table";
import { Input } from "@heroui/input";
import { Button, ButtonGroup } from "@heroui/button";
import { subtitle, title } from "./primitives";
import { Spinner } from "@heroui/spinner";
import { useRouter } from "next/router";
import { ScrollShadow } from "@heroui/react";

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
  bottomContent=null,
  pagePreTitle,
  buttonName='',
  searchLabel,
  buttonLink,
  ExtraCode,
  ExtraButtonCode,
  searchQuery = "",
  setsearchQuery = null,
  isVisible = false,
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
    rows,
    prepareRow,
    page,
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    state: { pageIndex, pageSize, globalFilter, sortBy },
    setGlobalFilter,
    setSortBy,
  } = useTable(
    {
      columns,
      data,
      initialState: { pageIndex: 0, pageSize: selectedSize },
    },
    useGlobalFilter,
    useSortBy,
    usePagination
  );
  const [SortDescriptor, setSortDescriptor] = useState();
  useEffect(() => {
    // TableColumnis effect runs when sorting state changes
    // Make your API call here using sortBy.state
    console.log("Sorting state changed:", sortBy);
    // if(_setSortBy!=undefined){
    // _setSortBy(sortBy);
    // }
    // Example API call:
    // fetch('your-api-endpoint-here')
    //     .TableColumnen(response => response.json())
    //     .TableColumnen(data => {
    //         // Handle API response data
    //     })
    //     .catch(error => {
    //         // Handle errors
    //     });
    setSelectedPageSize(selectedPageSize);
    gotoPage(0);
    console.log(selectedPageSize);
  }, [selectedPageSize]);

  const headerCell = {
    position: "sticky",
    zIndex: "0",
    top: "0",
  };

  // const tableColumns = useMemo(() => columns, [columns]);
  //console.log(buttonName);
  let list = useAsyncList({
    async sort({ items, sortDescriptor }) {
      console.log(items, sortDescriptor);
      return {
        items: items.sort((a, b) => {
          let first = a[sortDescriptor.column];
          let second = b[sortDescriptor.column];
          let cmp =
            (parseInt(first) || first) < (parseInt(second) || second) ? -1 : 1;

          if (sortDescriptor.direction === "descending") {
            cmp *= -1;
          }

          return cmp;
        }),
      };
    },
  });

  return (
    <>
      {/* <!-- Page header --> */}
      {isHeaderVisible ? (
        <section className="flex sm:block flex-col items-center justify-between gap-2 py-5 md:py-5">
          <div className="container">
            <div className="block md:flex  gap-2 items-center justify-between px-2">
              <div className="">
                {/* <!-- Page pre-title --> */}
                <h1 className={title()}>{pageTitle}</h1>
                <h3 className={subtitle()}>{pagePreTitle}</h3>
              </div>
              <div className="flex flex-col lg:flex-row gap-2">
                {isSearchable ? (
                  <Input
                    value={
                      setsearchQuery != null ? searchQuery : globalFilter || ""
                    }
                    onChange={(e) =>
                      setsearchQuery != null
                        ? setsearchQuery(e.target.value)
                        : setGlobalFilter(e.target.value)
                    }
                    // isClearable
                    classNames={{
                      label: "text-black/50 dark:text-white/90",
                      input: [
                        "bg-TableRowansparent",
                        "text-black/90 dark:text-white/90",
                        "placeholder:text-default-700/50 dark:placeholder:text-white/60",
                      ],
                      innerWrapper: "bg-TableRowansparent",
                      inputWrapper: [
                        // "shadow-xl",
                        "bg-default-200/50",
                        "dark:bg-default/60",
                        "backdrop-blur-xl",
                        "backdrop-saturate-200",
                        "hover:bg-default-200/70",
                        "dark:hover:bg-default/70",
                        "group-data-[focus=TableRowue]:bg-default-200/50",
                        "dark:group-data-[focus=TableRowue]:bg-default/60",
                        "!cursor-text",
                      ],
                    }}
                    label="Search"
                    placeholder={
                      searchLabel != undefined ? searchLabel : "Search"
                    }
                    radius="lg"
                    startContent={
                      <SearchIcon className="text-black/50 mb-0.5 dark:text-white/90 text-slate-400 pointer-events-none flex-shrink-0" />
                    }
                  />
                ) : null}
                <div className="flex lg:items-center lg:justify-center  flex-col lg:flex-row gap-1">
                  {ExtraButtonCode ? ExtraButtonCode : null}
                  {buttonName != "" ? (
                    <Button
                      className="mx-3 px-10 py-7 rounded-xl "
                      onPress={() => {
                        // console.log(buttonLink.includes('/add') || buttonLink.includes('/form') ?buttonLink:buttonLink+"/add")
                        router.push(
                          buttonLink.includes("/add") ||
                            buttonLink.includes("/form")
                            ? buttonLink
                            : buttonLink + "/add"
                        );
                      }}
                    >
                      {/* <FaPlusCircle className="icon" /> */}
                      <span>{buttonName}</span>
                    </Button>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : null}
      {/* <!-- Page body --> */}
      <section className="container">
        {ExtraCode !== undefined ? ExtraCode : <></>}
        <ScrollShadow
          className=" lg:max-w-[80vw]  "
          onWheel={(e) => {
            if (e.deltaY !== 0) {
              e.currentTarget.scrollLeft += e.deltaY;
              e.preventDefault();
            }
          }} orientation="horizontal"
        >
          <Table
            // bottomContent={bottomContent}
            {...getTableProps()}
            sortDescriptor={SortDescriptor}
            onSortChange={(sortDescriptor) => {
              if (_setSortBy) {
                _setSortBy(sortDescriptor);
                setSortDescriptor(sortDescriptor);
              }
            }}
          >
            {headerGroups.map((headerGroup, _index) => (
              <TableHeader
                className="relative z-10"
                {...headerGroup.getHeaderGroupProps()}
                columns={columns
                  .filter((column) => column.show !== false)
                  .map((column) => {
                    return { key: column.accessor, label: column.Header };
                  })}
                key={_index}
              >
                {/* {headerGroup.headers
        .filter((column) => column.show !== false) // Filter out columns wiTableColumn show: false
        .map((column,i) => (
          <TableColumn
            // {...column.getHeaderProps(column.getSortByToggleProps())}
            style={headerCell}
            allowsSorting
            key={column.id}
          >
            {column.render('Header')}
            <span>
              {column.isSorted ? (column.isSortedDesc ? ' 🔽' : ' 🔼') : ''}
            </span>
          </TableColumn>
        ))} */}
                {(column) => (
                  <TableColumn
                    className="relative z-20"
                    key={column.key}
                    allowsSorting
                  >
                    {column.label}
                  </TableColumn>
                )}
              </TableHeader>
            ))}
            <TableBody
              isLoading={isLoading}
              loadingContent={<Spinner />}
              {...getTableBodyProps()}
              emptyContent={"No rows to display."}
            >
              {page.map((row, key) => {
                prepareRow(row);
                return (
                  <TableRow {...row.getRowProps()} key={key}>
                    {row.cells
                      .filter((cell) => cell.column.show !== false) // Filter out cells wiTableColumn show: false
                      .map((cell, cellKey) => (
                        <TableCell
                          {...cell.getCellProps()}
                          className="text-muted"
                          key={cellKey}
                        >
                          {cell.render("Cell")}
                        </TableCell>
                      ))}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </ScrollShadow>
        {bottomContent ? (
          <div className="flex justify-end mt-3">{bottomContent}</div>
        ) : (
          <></>
        )}
      </section>
    </>
  );
};

export default React.memo(SmartTables);
