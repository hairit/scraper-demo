"use client";
import "./style.scss";
import moment from "moment";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { FaPlay, FaStop, FaEdit, FaPause, FaTrashAlt } from "react-icons/fa";
import {
  CRON_JOB_STATUS_RUNNING,
  CRON_JOB_STATUS_SCHEDULED,
  CRON_JOB_STATUS_STOPPED,
  CRON_JOB_TYPE_DAILY,
} from "../../../utilities/constants";

export default function Page() {
  const route = useRouter();
  const [items, setItems] = useState([]);

  useEffect(() => reload(), []);

  const reload = () => {
    fetch(`/api/task/get`)
      .then((response) => response.json())
      .then((responseData) => setItems(responseData.items))
      .catch((e) => console.log(e));
  };

  const getNextTimeRun = (setting) => {
    let time = 60 * 60 * 1000;
    if (setting.typeCronJob === CRON_JOB_TYPE_DAILY) {
      time = time * 24;
    }
    let from = new Date(setting.startDateTime);
    let to = new Date(
      from.setTime(from.getTime() + time * setting.stepSize * setting.timeRun)
    );
    return to;
  };

  const updateJobStatus = async (id, status) => {
    fetch(`/api/task/block?id=${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    })
      .then((response) => response.json())
      .then((responseData) => {
        if (responseData.result === "OK") {
          reload();
        } else {
          alert("Failed");
        }
      })
      .catch((e) => console.log(e));
  };

  const runJob = async (id) => {
    fetch(`/api/task/run?id=${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((responseData) => {
        if (responseData.result === "OK") {
          reload();
        } else {
          alert("Failed");
        }
      })
      .catch((e) => console.log(e));
  };

  const columns = [
    {
      id: "name",
      name: "Name",
      cell: (row) => (
        <Link
          href={`/tasks/edit/${row._id}`}
          className="task-name-link job-columns"
        >
          {row.taskName}
        </Link>
      ),
    },
    {
      id: "description",
      name: "Description",
      selector: (row) => row.description,
    },
    {
      id: "type",
      name: "Repeat Type",
      width: "100px",
      cell: (row) => <div className="job-columns">{row.typeCronJob}</div>,
    },
    {
      id: "nextTimeRun",
      name: "Next Run At",
      cell: (row, index) =>
        row.status !== CRON_JOB_STATUS_STOPPED ? (
          <div key={index} className="job-columns">
            {moment(getNextTimeRun(row)).format("YYYY-MM-DD hh:mm A")}
          </div>
        ) : (
          <div className={`stopped-status-label job-status-label`}>
            {row.status}
          </div>
        ),
    },
    // {
    //   id: "stepSize",
    //   name: "Step Size",
    //   cell: (row) => <div className="job-columns">{row.stepSize}</div>,
    // },
    {
      id: "status",
      name: "Status",
      width: "200px",
      cell: (row) => {
        let className = "";
        if (row.status === CRON_JOB_STATUS_STOPPED) {
          className = "stopped-status-label";
        }
        if (row.status === CRON_JOB_STATUS_SCHEDULED) {
          className = "scheduled-status-label";
        }
        if (row.status === CRON_JOB_STATUS_RUNNING) {
          className = "running-status-label";
        }
        return (
          <div className={`${className} job-status-label`}>{row.status}</div>
        );
      },
    },
    {
      id: "action",
      name: "",
      right: "true",
      cell: (row) => (
        <div style={{ display: "flex" }}>
          {row.status !== CRON_JOB_STATUS_STOPPED ? (
            <FaPause
              title="Stop job"
              className="job-update-icons"
              onClick={() => updateJobStatus(row._id, CRON_JOB_STATUS_STOPPED)}
            ></FaPause>
          ) : (
            <FaStop
              title="Schedule job"
              className="job-update-icons"
              onClick={() =>
                updateJobStatus(row._id, CRON_JOB_STATUS_SCHEDULED)
              }
            ></FaStop>
          )}
          {row.status !== CRON_JOB_STATUS_STOPPED && (
            <FaPlay
              title="Run immediately"
              className="job-update-icons"
              onClick={() => runJob(row._id)}
            ></FaPlay>
          )}
          <FaEdit
            title="Detail job"
            className="job-update-icons"
            onClick={() => route.push(`/tasks/edit/${row._id}`)}
          ></FaEdit>
          <FaTrashAlt
            title="Delete job"
            className="job-update-icons"
            onClick={() => alert("Not supported")}
          ></FaTrashAlt>
        </div>
      ),
    },
  ];

  return (
    <div className="container-fluid">
      <h2 className="page-title">Tasks</h2>

      <DataTable columns={columns} data={items} />
    </div>
  );
}
