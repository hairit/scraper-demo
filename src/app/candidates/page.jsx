"use client";
import { DatePicker } from "antd";
import moment from "moment";
import { useEffect, useState } from "react";
import DataTable from "react-data-table-component";

export default function page() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [dateRange, setDateRange] = useState({});

  useEffect(() => {
    getItems();
  }, [page, perPage, dateRange]);

  const getItems = () => {
    const from = dateRange.from?.toISOString() ?? ``;
    const to = dateRange.to?.toISOString() ?? ``;
    const url = `/api/candidate/get?page=${page}&perPage=${perPage}&from=${from}&to=${to}`;
    fetch(url)
      .then((response) => response.json())
      .then((responseDate) => {
        setItems(responseDate.items);
        setTotalCount(responseDate.totalCount);
      })
      .catch((e) => {
        console.log(e);
      });
  };

  const onChangePage = async (page) => {
    setPage(page);
  };

  const onChangeRowsPerPage = async (rowPerPage, page) => {
    setPerPage(rowPerPage);
    setPage(page);
  };

  const onChangeDateRange = async (a) => {
    let from = a ? a[0]?.$d : undefined;
    let to = a ? a[1]?.$d : undefined;
    if (to) {
      to.setHours(23);
      to.setMinutes(59);
      to.setSeconds(59);
      to.setMilliseconds(999);
    }
    setDateRange({
      from,
      to,
    });
  };

  const columns = [
    {
      name: "Name",
      selector: (row) => row.name,
    },
    {
      name: "Position",
      selector: (row) => row.positionApply,
    },
    {
      name: "Salary (USD)",
      selector: (row) => row.salary,
    },
    {
      name: "Schedule Interview Date",
      selector: (row) => moment(row.interviewDate).format("YYYY-MM-DD"),
    },
    {
      name: "Status",
      selector: (row) => row.status,
    },
    {
      name: "Note(s)",
      selector: (row) => row.description,
    },
  ];

  return (
    <div className="container-fluid">
      <h1 className="page-title">Candidates</h1>
      <div className="row">
        <div className="col-lg-4">
          <DatePicker.RangePicker
            onChange={onChangeDateRange}
            inputReadOnly
          ></DatePicker.RangePicker>
        </div>
      </div>
      <DataTable
        columns={columns}
        data={items}
        pagination
        paginationServer
        paginationTotalRows={totalCount}
        paginationPerPage={perPage}
        paginationRowsPerPageOptions={[10, 20, 40, 80, 100]}
        onChangePage={onChangePage}
        onChangeRowsPerPage={onChangeRowsPerPage}
      ></DataTable>
    </div>
  );
}
