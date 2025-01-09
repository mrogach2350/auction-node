import { useState, useCallback } from "react";
import { useRouter } from "next/router";
import { isMobile } from "react-device-detect";
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

export default function Home() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [scraperUrl, setScrapeUrl] = useState<string>("");
  const [selectedNodes, setSelectedNodes] = useState<any[]>([]);
  const [showNoteModal, setShowNoteModal] = useState<boolean>(false);
  const [selectedVehicle, setSelectedVehicle] = useState<any>({});
  const { data, isLoading: areVehiclesLoading } = useQuery({
    queryKey: ["vehicles"],
    queryFn: getAllVehiclesQuery,
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
    deleteVehiclesMutation.isPending;

  return (
    <div className="section h-full">
      {showLoadingBar && (
        <progress
          className="progress is-small is-primary w-screen fixed top-0 left-0"
          max="100"
        />
      )}
      <h1 className="title">Vehicles</h1>
      <div className="flex space-x-2 w-1/2 items-baseline">
        <h3 className="subtitle flex-none">Scrape Url</h3>
        <input
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
          className="h-full pb-5"
          rowSelection={{
            mode: "multiRow",
          }}
          theme={myTheme}
          columnDefs={colDefs}
          rowData={data?.vehicles}
          onSelectionChanged={onSelectionChanged}
          autoSizeStrategy={{
            type: isMobile ? "fitCellContents" : "fitGridWidth",
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

export async function getServerSideProps() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["vehicles"],
    queryFn: getAllVehiclesQuery,
  });

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
  };
}
