import { useState } from "react";
import { useRouter } from "next/router";
import { getAllVehicles } from "@/db";
import { AgGridReact } from "ag-grid-react"; // React Data Grid Component
import {
  // ClientSideRowModelModule,
  ColDef,
  themeQuartz,
  colorSchemeDarkBlue,
  // ColGroupDef,
  // GridApi,
  // GridOptions,
  // GridReadyEvent,
  // ModuleRegistry,
  // ValidationModule,
  // createGrid,
} from "ag-grid-community";

const myTheme = themeQuartz.withPart(colorSchemeDarkBlue);

export default function Home({ vehicles = [] }) {
  const router = useRouter();
  const colDefs: ColDef[] = [
    { field: "vin" },
    { field: "title", filter: true },
    { field: "make", sortable: true },
    { field: "model" },
    {
      field: "mileage",
      sortable: true,
      valueFormatter: (m) => m.value && m.value.toLocaleString(),
    },
    { field: "year", sortable: true },
    {
      field: "action",
      cellRenderer: ({ node }: { node: any }) => {
        return (
          <button
            onClick={() => router.push(`/vehicles/${node.data.id}`)}
            className="button is-info is-small align-baseline">
            View
          </button>
        );
      },
    },
  ];
  const [scraperUrl, setScrapeUrl] = useState<string>("");

  const triggerScraper = async () => {
    await fetch("/api/receive-auctions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        auctionUrl: scraperUrl,
      }),
    });
    setScrapeUrl("");
  };

  return (
    <div className="overflow-y-scroll">
      <h1 className="title">Vehicles</h1>
      <div className="flex space-x-2 w-1/2 items-baseline">
        <h3 className="subtitle flex-none">Scrape Url</h3>
        <input
          className="input"
          value={scraperUrl}
          onChange={(e) => setScrapeUrl(e.target.value)}
        />
        <button
          onClick={triggerScraper}
          className="button is-primary"
          disabled={!scraperUrl.trim()}>
          Submit
        </button>
      </div>
      {vehicles.length > 0 && (
        <div className="h-96">
          <AgGridReact
            theme={myTheme}
            columnDefs={colDefs}
            rowData={vehicles}
          />
        </div>
      )}
      {/* {vehicles.length > 0 && (
        <div className="tabel-container">
          <table className="table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Make</th>
                <th>Model</th>
                <th>Mileage</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((v: any) => (
                <tr key={v.id}>
                  <td>{v.title}</td>
                  <td>{v.make}</td>
                  <td>{v.model}</td>
                  <td>{v.mileage}</td>
                  <td>
                    <button
                      onClick={() => router.push(`/vehicles/${v.id}`)}
                      className="button is-info">
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )} */}
    </div>
  );
}

export async function getServerSideProps() {
  const vehicles = await getAllVehicles();
  return {
    props: {
      vehicles,
    },
  };
}
