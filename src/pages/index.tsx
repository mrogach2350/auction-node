import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/router";
import { getAllVehicles, deleteVehicleById } from "@/db/interactions/vehicles";
import { AgGridReact } from "ag-grid-react"; // React Data Grid Component
import {
  ColDef,
  themeQuartz,
  colorSchemeDarkBlue,
  RowSelectionOptions,
  SelectionChangedEvent,
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
  const rowSelection = useMemo<RowSelectionOptions>(() => {
    return {
      mode: "multiRow",
    };
  }, []);
  const [scraperUrl, setScrapeUrl] = useState<string>("");
  const [isScraping, setIsScraping] = useState<boolean>(false);
  const [selectedNodeIds, setSelectedNodeIds] = useState<number[]>([]);

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

  const onSelectionChanged = useCallback((event: SelectionChangedEvent) => {
    const selectedNodes = event.api.getSelectedNodes();
    const selectedIds = selectedNodes.map((n) => n?.data?.id);
    setSelectedNodeIds(selectedIds);
  }, []);

  const handleDeleteListings = async () => {
    await fetch("/api/vehicles/delete-vehicles", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        vehicleIds: selectedNodeIds,
      }),
    });
    await router.replace(router.asPath);
  };

  return (
    <div className="section h-full">
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
        <div className="h-5/6">
          <button
            className="button is-danger mb-2"
            disabled={!selectedNodeIds.length}
            onClick={handleDeleteListings}>
            Delete Selected Rows
          </button>
          <AgGridReact
            className="h-full"
            rowSelection={rowSelection}
            theme={myTheme}
            columnDefs={colDefs}
            rowData={vehicles}
            onSelectionChanged={onSelectionChanged}
            autoSizeStrategy={{
              type: "fitGridWidth",
            }}
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
