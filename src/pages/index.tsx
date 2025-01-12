import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { getSelectorsByUserAgent } from "react-device-detect";
import {
  useQuery,
  useQueryClient,
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
import { Button } from "react-bulma-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRotateLeft } from "@fortawesome/free-solid-svg-icons";
import NoteModal from "@/components/NoteModal";
import { getColDefs } from "@/helpers";
import { getAllVehiclesQuery } from "@/queries";
import {
  useDeleteVehiclesMutation,
  useGetOfferMutation,
  useAuctionScraperMutation,
  useUndoDeleteVehiclesMutation,
  useGetAuctionBidsMutation,
} from "@/mutations";
import ListDropdown from "@/components/ListsDropdown";
import AddToListDropDown from "@/components/AddToListDropdown";

const myTheme = themeQuartz.withPart(colorSchemeDarkBlue);

export default function Home({ isMobile }: { isMobile: boolean }) {
  const gridRef = useRef<AgGridReact<any>>(null);
  const router = useRouter();
  const queryClient = useQueryClient();
  const getOfferMutation = useGetOfferMutation();
  const deleteVehiclesMutation = useDeleteVehiclesMutation();
  const auctionScraperMutation = useAuctionScraperMutation();
  const getAuctionBidsMutation = useGetAuctionBidsMutation();
  const undoDeleteVehiclesMutation = useUndoDeleteVehiclesMutation();
  const [scraperUrl, setScrapeUrl] = useState<string>("");
  const [selectedNodes, setSelectedNodes] = useState<any[]>([]);
  const [showNoteModal, setShowNoteModal] = useState<boolean>(false);
  const [selectedVehicle, setSelectedVehicle] = useState<any>({});
  const [gettingOfferId, setGettingOfferId] = useState<any>(null);
  const [selectedListId, setSelectedListId] = useState<number>(0);
  const [lastDeletedVehicleIds, setLastDeletedVehicleIds] = useState<number[]>(
    []
  );

  const onGetOffer = (node: any) => {
    const { vin, mileage, id } = node.data;
    setGettingOfferId(id);
    getOfferMutation.mutate(
      { vin, mileage, id },
      {
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
      }
    );
  };

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
          onClick={() => onGetOffer(node)}
          className="button is-info is-small">
          {getOfferMutation.isPending && gettingOfferId === node.data.id
            ? "Loading..."
            : "Get Offer"}
        </button>
      </div>
    );
  });

  const { data: allVehiclesData, isLoading: areVehiclesLoading } = useQuery({
    queryKey: ["vehicles"],
    queryFn: getAllVehiclesQuery,
  });

  const { data: vehiclesByListData, isLoading: areVehiclesByListLoading } =
    useQuery({
      queryKey: ["vehiclesByList", selectedListId],
      queryFn: async () => {
        const res = await fetch(`/api/lists/${selectedListId}/vehicles`);
        return await res.json();
      },
    });

  useEffect(() => {
    if (selectedListId !== 0) {
      queryClient.invalidateQueries({
        queryKey: ["vehiclesByList", selectedListId],
      });
    }
  }, [selectedListId]);

  const onSelectionChanged = useCallback((event: SelectionChangedEvent) => {
    const selectedNodes = event.api.getSelectedNodes();
    setSelectedNodes(selectedNodes);
  }, []);

  const handleClose = () => {
    setSelectedVehicle({});
    setShowNoteModal(false);
  };

  const handleListChange = (id: any) => {
    setSelectedListId(id);
  };

  const onAddVehicleToList = (listId: number) => {
    gridRef?.current?.api.setFilterModel(null);
    gridRef?.current?.api.deselectAll();
    setSelectedListId(listId);
  };

  const handleDeleteVehicles = async () => {
    const vehicleIds: number[] = selectedNodes.map((n) => n?.data?.id);
    deleteVehiclesMutation.mutate(
      { vehicleIds },
      {
        onSuccess: ({ deleteVehicleIds = [] }) => {
          setLastDeletedVehicleIds(deleteVehicleIds);
          queryClient.invalidateQueries({ queryKey: ["vehicles"] });
          setSelectedNodes([]);
        },
      }
    );
  };

  const handleUndoDelete = async () => {
    undoDeleteVehiclesMutation.mutate(
      { vehicleIds: lastDeletedVehicleIds },
      {
        onSuccess: () => {
          setLastDeletedVehicleIds([]);
          queryClient.invalidateQueries({ queryKey: ["vehicles"] });
        },
      }
    );
  };

  const showLoadingBar =
    areVehiclesByListLoading ||
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
        <div className="space-y-1">
          <div className="flex items-end space-x-2">
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
              onClick={() =>
                auctionScraperMutation.mutate(
                  { scraperUrl },
                  {
                    onSuccess: () => {
                      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
                      setScrapeUrl("");
                    },
                  }
                )
              }
              className="button is-primary"
              disabled={!scraperUrl.trim() || auctionScraperMutation.isPending}>
              {auctionScraperMutation.isPending ? "Loading..." : "Submit"}
            </button>
          </div>
          <button
            className="button is-primary"
            disabled={!selectedNodes.length || getAuctionBidsMutation.isPending}
            onClick={() =>
              getAuctionBidsMutation.mutate(
                { selectedNodes },
                {
                  onSuccess: () => {
                    queryClient.invalidateQueries({ queryKey: ["vehicles"] });
                    setSelectedNodes([]);
                  },
                }
              )
            }>
            {getAuctionBidsMutation.isPending
              ? "Loading..."
              : "Get Bids for Selected Rows"}
          </button>
          <div className="flex space-x-1 mb-1">
            <ListDropdown
              selectedListId={selectedListId}
              onChange={handleListChange}
            />
            <AddToListDropDown
              selectedVehicleNodes={selectedNodes}
              onSave={onAddVehicleToList}
            />
            <button
              className="button is-danger is-small"
              disabled={
                !selectedNodes.length || deleteVehiclesMutation.isPending
              }
              onClick={handleDeleteVehicles}>
              {deleteVehiclesMutation.isPending ? "Loading..." : "Delete"}
            </button>
            <Button
              disabled={lastDeletedVehicleIds.length === 0}
              onClick={handleUndoDelete}
              color="warning">
              <span>
                <FontAwesomeIcon icon={faArrowRotateLeft} />
              </span>
            </Button>
          </div>
        </div>
      ) : (
        <div>
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
              onClick={() =>
                auctionScraperMutation.mutate(
                  { scraperUrl },
                  {
                    onSuccess: () => {
                      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
                      setScrapeUrl("");
                    },
                  }
                )
              }
              className="button is-primary"
              disabled={!scraperUrl.trim() || auctionScraperMutation.isPending}>
              {auctionScraperMutation.isPending ? "Loading..." : "Submit"}
            </button>
          </div>
          <div className="flex justify-between">
            <ListDropdown
              selectedListId={selectedListId}
              onChange={handleListChange}
            />
            <div className="flex justify-end space-x-2 mb-2">
              <AddToListDropDown
                selectedVehicleNodes={selectedNodes}
                onSave={onAddVehicleToList}
              />
              <button
                className="button is-primary"
                disabled={
                  !selectedNodes.length || getAuctionBidsMutation.isPending
                }
                onClick={() =>
                  getAuctionBidsMutation.mutate(
                    { selectedNodes },
                    {
                      onSuccess: () => {
                        queryClient.invalidateQueries({
                          queryKey: ["vehicles"],
                        });
                        setSelectedNodes([]);
                      },
                    }
                  )
                }>
                {getAuctionBidsMutation.isPending
                  ? "Loading..."
                  : "Get Bids for Selected Rows"}
              </button>
              <button
                className="button is-danger"
                disabled={
                  !selectedNodes.length || deleteVehiclesMutation.isPending
                }
                onClick={handleDeleteVehicles}>
                {deleteVehiclesMutation.isPending ? "Loading..." : "Delete"}
              </button>
              <Button
                disabled={lastDeletedVehicleIds.length === 0}
                onClick={handleUndoDelete}
                color="warning">
                <span>
                  <FontAwesomeIcon icon={faArrowRotateLeft} />
                </span>
              </Button>
            </div>
          </div>
        </div>
      )}
      <div className="h-5/6">
        <AgGridReact
          ref={gridRef}
          pagination
          className="h-full pb-5"
          rowSelection={{
            mode: "multiRow",
            selectAll: "currentPage",
          }}
          theme={myTheme}
          columnDefs={colDefs}
          rowData={
            selectedListId === 0
              ? allVehiclesData?.vehicles
              : vehiclesByListData?.vehicles
          }
          onSelectionChanged={onSelectionChanged}
          autoSizeStrategy={{
            type: "fitCellContents",
          }}
          noRowsOverlayComponent={() => <div>No Vehicles</div>}
        />
      </div>
      {showNoteModal && (
        <NoteModal
          onClose={handleClose}
          selectedVehicle={selectedVehicle}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["vehicles"] });
            setShowNoteModal(false);
          }}
        />
      )}
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
