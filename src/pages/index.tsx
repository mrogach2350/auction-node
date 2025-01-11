import { useState, useCallback } from "react";
import { useRouter } from "next/router";
import { getSelectorsByUserAgent } from "react-device-detect";
import {
  useQuery,
  useQueryClient,
  useMutation,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";
import { AgGridReact } from "ag-grid-react";
import {
  ColDef,
  themeQuartz,
  colorSchemeDarkBlue,
  SelectionChangedEvent,
} from "ag-grid-community";
import NoteModal from "@/components/NoteModal";
import { getColDefs } from "@/helpers";
import { getAllVehiclesQuery } from "@/queries";

const myTheme = themeQuartz.withPart(colorSchemeDarkBlue);

export default function Home({ isMobile }: { isMobile: boolean }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [scraperUrl, setScrapeUrl] = useState<string>("");
  const [selectedNodes, setSelectedNodes] = useState<any[]>([]);
  const [showNoteModal, setShowNoteModal] = useState<boolean>(false);
  const [selectedVehicle, setSelectedVehicle] = useState<any>({});
  const [gettingOfferId, setGettingOfferId] = useState<any>(null);
  const { data, isLoading: areVehiclesLoading } = useQuery({
    queryKey: ["vehicles"],
    queryFn: getAllVehiclesQuery,
  });

  const getOfferMutation = useMutation({
    mutationFn: async ({ vin, mileage, id }: any) => {
      setGettingOfferId(id);
      return await fetch("/api/receive-offers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          vin,
          mileage,
          id,
        }),
      });
    },
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      // const { success, message = "" } = await data.json();
      // if (!success) {
      //   setScrapingError(message);
      // } else {
      //   setScrapingError("");
      //   queryClient.invalidateQueries({ queryKey: ["vehicle"] });
      // }
    },
    onSettled: () => setGettingOfferId(null),
  });

  const auctionScraperMutation = useMutation({
    mutationFn: async () => {
      await fetch("/api/receive-auctions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          auctionUrl: scraperUrl,
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      setScrapeUrl("");
    },
  });

  const deleteVehiclesMutation = useMutation({
    mutationFn: async () => {
      await fetch("/api/vehicles/delete-vehicles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          vehicleIds: selectedNodes.map((n) => n?.data?.id),
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      setSelectedNodes([]);
    },
  });

  const getAuctionBidsMutation = useMutation({
    mutationFn: async () => {
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
      return await Promise.all(httpCalls);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      setSelectedNodes([]);
    },
  });

  const colDefs: ColDef[] = getColDefs(({ node }: { node: any }) => {
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
        <button
          onClick={() => {
            const { vin, mileage, id } = node.data;
            getOfferMutation.mutate({ vin, mileage, id });
          }}
          className="button is-info is-small">
          {getOfferMutation.isPending && gettingOfferId === node.data.id
            ? "Loading..."
            : "Get Offer"}
        </button>
      </div>
    );
  });

  const onSelectionChanged = useCallback((event: SelectionChangedEvent) => {
    const selectedNodes = event.api.getSelectedNodes();
    setSelectedNodes(selectedNodes);
  }, []);

  const handleClose = () => {
    setSelectedVehicle({});
    setShowNoteModal(false);
  };

  const showLoadingBar =
    areVehiclesLoading ||
    auctionScraperMutation.isPending ||
    deleteVehiclesMutation.isPending ||
    getOfferMutation.isPending;

  return (
    <div className="section h-full">
      {showLoadingBar && (
        <progress
          className="progress is-small is-primary w-screen fixed top-0 left-0"
          max="100"
        />
      )}
      <h1 className="title">Vehicles</h1>
      {isMobile ? (
        <div className="flex items-end mb-2 space-x-2">
          <div>
            <label htmlFor="scraperUrl" className="subtitle flex-none">
              Scrape Url
            </label>
            <input
              name="scraperUrl"
              className="input"
              value={scraperUrl}
              onChange={(e) => setScrapeUrl(e.target.value)}
            />
          </div>
          <button
            onClick={() => auctionScraperMutation.mutate()}
            className="button is-primary"
            disabled={!scraperUrl.trim() || auctionScraperMutation.isPending}>
            {auctionScraperMutation.isPending ? "Loading..." : "Submit"}
          </button>
        </div>
      ) : (
        <div className="flex space-x-2 w-1/2 items-baseline">
          <label htmlFor="scraperUrl" className="subtitle flex-none">
            Scrape Url
          </label>
          <input
            name="scraperUrl"
            className="input"
            value={scraperUrl}
            onChange={(e) => setScrapeUrl(e.target.value)}
          />
          <button
            onClick={() => auctionScraperMutation.mutate()}
            className="button is-primary"
            disabled={!scraperUrl.trim() || auctionScraperMutation.isPending}>
            {auctionScraperMutation.isPending ? "Loading..." : "Submit"}
          </button>
        </div>
      )}
      <div className="h-5/6">
        <div className="flex justify-end space-x-2 mb-2">
          <button
            className="button is-primary"
            disabled={!selectedNodes.length || getAuctionBidsMutation.isPending}
            onClick={() => getAuctionBidsMutation.mutate()}>
            {getAuctionBidsMutation.isPending
              ? "Loading..."
              : "Get Bids for Selected Rows"}
          </button>
          <button
            className="button is-danger"
            disabled={!selectedNodes.length || deleteVehiclesMutation.isPending}
            onClick={() => deleteVehiclesMutation.mutate()}>
            {deleteVehiclesMutation.isPending ? "Loading..." : "Delete"}
          </button>
        </div>
        <AgGridReact
          pagination
          className="h-full pb-5"
          rowSelection={{
            mode: "multiRow",
            selectAll: "filtered",
          }}
          theme={myTheme}
          columnDefs={colDefs}
          rowData={data?.vehicles}
          onSelectionChanged={onSelectionChanged}
          autoSizeStrategy={{
            type: "fitCellContents",
          }}
          noRowsOverlayComponent={() => <div>No Vehicles</div>}
        />
      </div>
      <NoteModal
        isActive={showNoteModal}
        handleClose={handleClose}
        selectedVehicle={selectedVehicle}
      />
    </div>
  );
}

export async function getServerSideProps(context: any) {
  const userAgent = context.req.headers["user-agent"];

  const { isMobile } = getSelectorsByUserAgent(userAgent);
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["vehicles"],
    queryFn: getAllVehiclesQuery,
  });

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
      isMobile,
    },
  };
}
