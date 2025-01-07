import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/router";
import { getAllVehicles } from "@/db/interactions/vehicles";
import { AgGridReact } from "ag-grid-react";
import {
  ColDef,
  themeQuartz,
  colorSchemeDarkBlue,
  RowSelectionOptions,
  SelectionChangedEvent,
} from "ag-grid-community";
import NoteModal from "@/components/NoteModal";
import { secondsToHms } from "@/helpers";

const myTheme = themeQuartz.withPart(colorSchemeDarkBlue);

export default function Home({ vehicles = [] }) {
  const router = useRouter();
  const [scraperUrl, setScrapeUrl] = useState<string>("");
  const [isScraping, setIsScraping] = useState<boolean>(false);
  const [isScrapingBids, setIsScrapingBids] = useState<boolean>(false);
  const [selectedNodes, setSelectedNodes] = useState<any[]>([]);
  const [showNoteModal, setShowNoteModal] = useState<boolean>(false);
  const [selectedVehicle, setSelectedVehicle] = useState<any>({});
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
    { field: "currentBidAmount", sortable: true },
    {
      field: "secondsLeftToBid",
      sortable: true,
      headerName: "Time Left To Bid",
      valueFormatter: (params) => secondsToHms(params.value),
    },
    {
      field: "action",
      cellRenderer: ({ node }: { node: any }) => {
        return (
          <div className="flex space-x-3 items-center h-full">
            <button
              onClick={() => router.push(`/vehicles/${node.data.id}`)}
              className="button is-info is-small">
              View
            </button>
            <button
              onClick={() => {
                setSelectedVehicle({ id: node.data.id, note: node.data.note });
                setShowNoteModal(true);
              }}
              className="button is-info is-small">
              Note
            </button>
          </div>
        );
      },
    },
  ];
  const rowSelection = useMemo<RowSelectionOptions>(() => {
    return {
      mode: "multiRow",
    };
  }, []);

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
    setSelectedNodes(selectedNodes);
  }, []);

  const handleDeleteListings = async () => {
    await fetch("/api/vehicles/delete-vehicles", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        vehicleIds: selectedNodes.map((n) => n?.data?.id),
      }),
    });
    setSelectedNodes([]);
    await router.replace(router.asPath);
  };

  const handleClose = () => {
    setSelectedVehicle({});
    setShowNoteModal(false);
  };

  const handleGetVehicleBids = async () => {
    setIsScrapingBids(true);
    const httpCalls = selectedNodes.map((node) => {
      return fetch("/api/vehicles/get-bids", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          vehicleId: node?.data?.id,
          auctionUrl: node?.data?.url,
        }),
      });
    });
    await Promise.all(httpCalls);
    setSelectedNodes([]);
    setIsScrapingBids(false);
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
          <div className="flex justify-end space-x-2 mb-2">
            {isScrapingBids ? (
              <button className="button is-info" disabled>
                Loading...
              </button>
            ) : (
              <button
                className="button is-primary"
                disabled={!selectedNodes.length}
                onClick={handleGetVehicleBids}>
                Get Bids for Selected Rows
              </button>
            )}
            <button
              className="button is-danger"
              disabled={!selectedNodes.length}
              onClick={handleDeleteListings}>
              Delete Selected Rows
            </button>
          </div>
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
      <NoteModal
        isActive={showNoteModal}
        handleClose={handleClose}
        selectedVehicle={selectedVehicle}
      />
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
