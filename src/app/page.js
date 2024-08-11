"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { DatePicker } from "antd";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";

export default function Home() {
  const [error, setError] = useState("");
  const [username, setUsername] = useState("scraperdemo@gmail.com");
  const [password, setPassword] = useState("Scraperdemo124");
  const [dateRange, setDateRange] = useState({});
  const [scraping, setScraping] = useState(false);
  const [scrapedURL, setScrapedURL] = useState("");

  useEffect(() => {
    setScrapedURL(`${window.location.href}candidates`);
  }, []);

  useEffect(() => {
    setError("");
  }, [username, password, dateRange]);

  const onChange = (e) => {
    const value = e.target.value;
    if (e.target.name === "username") {
      setUsername(value);
    } else {
      setPassword(value);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    // if (username !== "scraperdemo@gmail.com" || password !== "Scraperdemo124") {
    //   setError("Incorrect username or password, please try again.");
    //   return;
    // }
    if (!dateRange.from || !dateRange.to) {
      setError("Interview date range is required before scraping");
      return;
    }
    setScraping(true);
    await fetch(
      `/api/scrape/run?url=${encodeURIComponent(
        scrapedURL
      )}&from=${dateRange.from.toISOString()}&to=${dateRange.to.toISOString()}&sendTo=${username}`
    )
      .then((response) => response.text())
      .then((text) => {
        const blob = new Blob([text], { type: "text/csv" });
        const urlObject = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = urlObject;
        a.download = `scraped-data.csv`;

        document.body.appendChild(a);
        a.click();

        document.body.removeChild(a);
        URL.revokeObjectURL(urlObject);
      });
    setScraping(false);
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

  return (
    <div className="form-background">
      <Form className="scrape-form" onSubmit={onSubmit}>
        <h1 className="mb-4">Scraping Configuration</h1>
        <Form.Group className="mb-3" controlId="formBasicEmail">
          <Form.Label>Username</Form.Label>
          <Form.Control
            type="email"
            name="username"
            placeholder="Enter username"
            required
            value={username}
            onChange={onChange}
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="formBasicPassword">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            name="password"
            placeholder="Enter password"
            required
            value={password}
            onChange={onChange}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Export/Scrape by interview date range</Form.Label>
          <DatePicker.RangePicker
            onChange={onChangeDateRange}
            inputReadOnly
          ></DatePicker.RangePicker>
        </Form.Group>

        <Form.Group>
          <Form.Label>
            URL to be scraped (
            <Link href={scrapedURL} className="candidate-list">
              See the list of candidates
            </Link>
            )
          </Form.Label>
          <Form.Control readOnly value={scrapedURL}></Form.Control>
        </Form.Group>

        <div className="d-flex flex-wrap justify-content-between align-items-center">
          <Button
            className="mt-3"
            variant="primary"
            type="submit"
            disabled={scraping}
          >
            {scraping && (
              <Spinner animation="border" role="status" size="sm">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            )}{" "}
            {scraping ? `Scraping` : `Start`}
          </Button>
          {error && <label className="error mt-3">{error}</label>}
        </div>
      </Form>
    </div>
  );
}
