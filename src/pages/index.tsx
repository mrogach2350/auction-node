import { useState } from "react";
import { useRouter } from "next/router";
import { getAllVehicles } from "@/db";
import { AgGridReact } from "ag-grid-react"; // React Data Grid Component
import { ColDef, themeQuartz, colorSchemeDarkBlue } from "ag-grid-community";

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
  const [isScraping, setIsScraping] = useState<boolean>(false);

  const triggerScraper = async () => {
    setIsScraping(true);
    await fetch("/api/receive-auctions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        auctionUrl: scraperUrl,
      }),
    });
    await router.replace(router.asPath);
    setScrapeUrl("");
    setIsScraping(false);
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
        {isScraping ? (
          <button className="button is-info" disabled>
            Loading...
          </button>
        ) : (
          <button
            onClick={triggerScraper}
            className="button is-primary"
            disabled={!scraperUrl.trim()}>
            Submit
          </button>
        )}
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
