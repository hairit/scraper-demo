"use client";
import moment from "moment";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Spinner, Button, Form } from "react-bootstrap";
import {
  CRON_JOB_TYPE_DAILY,
  CRON_JOB_TYPE_HOURLY,
} from "../../../../../utilities/constants";

export default function Page() {
  const { id } = useParams();
  const [formData, setFormData] = useState(undefined);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/task/getById?id=${id}`)
      .then((response) => response.json())
      .then((responseData) => {
        const formData = JSON.parse(JSON.stringify(responseData.data));
        formData.startTime = moment(formData.startDateTime).format("HH:mm");
        setFormData(formData);
      })
      .catch((error) => console.log(error.message));
  }, []);

  useEffect(() => {
    if (formData) {
      setStartDateTime(formData.typeCronJob, formData.startTime);
    }
  }, [formData?.typeCronJob, formData?.startTime]);

  const setStartDateTime = (type, startAt) => {
    let datetime = new Date(
      `${moment(new Date()).format("YYYY-MM-DD").toString()} ${startAt}:00`
    );
    const now = new Date();
    if (datetime < now && type === CRON_JOB_TYPE_HOURLY) {
      datetime = new Date(datetime.getTime() + 86400000);
    } else if (type === CRON_JOB_TYPE_DAILY) {
      datetime = new Date(datetime.getTime() + 86400000);
    }
    setFormData((formData) => ({
      ...formData,
      startDateTime: datetime,
    }));
  };

  const onSubmit = (e) => {
    // e.preventDefault();
    // setLoading(true);
    // fetch(`/api/task/edit?id=${id}`, {
    //   method: "PATCH",
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify(formData),
    // })
    //   .then((response) => response.json())
    //   .then((responseData) => {
    //     if (responseData.result === "OK") {
    //       alert("Saved successfully");
    //     } else {
    //       alert("Failed");
    //     }
    //   })
    //   .catch((e) => console.log(e.message))
    //   .finally(() => setLoading(false));
  };

  const onChange = (e) => {
    if (e.target.name === "startTime" && !e.target.value) {
      return;
    }
    if (
      e.target.name === "stepSize" &&
      (parseInt(e.target.value) < 1 || parseInt(e.target.value) > 100)
    ) {
      return;
    }
    setFormData((d) => ({
      ...d,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="form-background">
      <Form className="scrape-form" onSubmit={onSubmit}>
        <h2 className="fs-title mb-4 hide-mobile-down">{formData?.taskName}</h2>

        <Form.Group className="mb-3" controlId="formBasicEmail">
          <Form.Label>Repeat Type</Form.Label>
          <Form.Select
            name="typeCronJob"
            value={formData?.typeCronJob ?? CRON_JOB_TYPE_HOURLY}
            onChange={onChange}
          >
            <option value={CRON_JOB_TYPE_HOURLY}>{CRON_JOB_TYPE_HOURLY}</option>
            <option value={CRON_JOB_TYPE_DAILY}>{CRON_JOB_TYPE_DAILY}</option>
          </Form.Select>
        </Form.Group>

        {/* <Form.Group className="mb-3" controlId="formBasicPassword">
          <Form.Label>Step Size</Form.Label>
          <Form.Control
            min={1}
            max={100}
            name="stepSize"
            type="number"
            required
            value={formData?.stepSize ?? 1}
            onChange={onChange}
          ></Form.Control>
        </Form.Group> */}

        <Form.Group>
          <Form.Label>{`Start Time ( ${moment(formData?.startDateTime).format(
            "MM/DD/YYYY hh:mm A"
          )} )`}</Form.Label>
          <Form.Control
            name="startTime"
            type="time"
            required
            value={formData?.startTime ?? "00:00"}
            onChange={onChange}
          ></Form.Control>
        </Form.Group>

        <div className="d-flex flex-wrap justify-content-between align-items-center">
          <Button
            className="mt-3"
            variant="primary"
            type="submit"
            disabled={loading}
          >
            {loading && (
              <Spinner animation="border" role="status" size="sm">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            )}{" "}
            Save
          </Button>
        </div>
      </Form>
    </div>
  );
}
