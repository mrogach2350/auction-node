import { useState } from "react";
import { useRouter } from "next/router";
import { getVehicleById } from "@/db/interactions/vehicles";
import { AgGridReact } from "ag-grid-react"; // React Data Grid Component
import { ColDef, themeQuartz, colorSchemeDarkBlue } from "ag-grid-community";

const myTheme = themeQuartz.withPart(colorSchemeDarkBlue);
export default function VehicleShow({ vehicle }: { vehicle: any }) {
  const router = useRouter();
  const { offers = [] } = vehicle;
  const [isScraping, setIsScraping] = useState<boolean>(false);
  const [scrapingError, setScrapingError] = useState<string>("");
  const colDefs: ColDef[] = [
    { field: "amount", sortable: true },
    { field: "code" },
    { field: "offeringCompany" },
    { field: "validUntil" },
    { field: "retrivedAt" },
  ];
  const getOffer = async () => {
    const { vin, mileage, id } = vehicle;
    setIsScraping(true);
    const result = await fetch("/api/receive-offers", {
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
    const { success, message = "" } = await result.json();
    if (!success) {
      setScrapingError(message);
    } else {
      setScrapingError("");
      await router.replace({ pathname: router.pathname });
    }
    setIsScraping(false);
  };

  const handleDeleteListing = async () => {
    await fetch("/api/vehicles/delete-vehicles", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        vehicleIds: [vehicle.id],
      }),
    });
    await router.push("/");
  };
  return (
    <div className="section">
      <div>
        <button
          onClick={() => router.push("/")}
          className="button is-info mb-3">
          Back to Vehicles
        </button>
        <a
          className="button is-primary ml-3"
          target="_blank"
          href={`https://${vehicle?.url}`}
          rel="noopener noreferrer">
          Link to Vehicle Listing Page
        </a>
        <a className="button is-danger ml-3" onClick={handleDeleteListing}>
          Delete Listing
        </a>
        <h1 className="title">{vehicle?.title}</h1>
        <p>
          <strong>Make</strong>: <span>{vehicle?.make}</span>
        </p>
        <p>
          <strong>Model</strong>: <span>{vehicle?.model}</span>
        </p>
        <p>
          <strong>Year</strong>: <span>{vehicle?.year}</span>
        </p>
        <p>
          <strong>VIN</strong>: <span>{vehicle?.vin}</span>
        </p>
        <p>
          <strong>Mileage</strong>:{" "}
          <span>{vehicle?.mileage?.toLocaleString()}</span>
        </p>
      </div>
      <div className="mt-5">
        <div className="flex items-baseline space-x-2">
          <h3 className="subtitle">Offers</h3>
          {isScraping ? (
            <button className="button is-info is-small">Loading...</button>
          ) : (
            <button className="button is-info is-small" onClick={getOffer}>
              Get Offer
            </button>
          )}
          {scrapingError && <p>{scrapingError}</p>}
        </div>
        <div className="flex flex-col space-y-3">
          {offers?.length ? (
            <div className="h-96">
              <AgGridReact
                theme={myTheme}
                columnDefs={colDefs}
                rowData={offers}
              />
            </div>
          ) : (
            <div>No Offers</div>
          )}
        </div>
      </div>
    </div>
  );
}

export const getServerSideProps = async (context: any) => {
  const id = context.params.id as number;
  const vehicle = await getVehicleById(id);
  return {
    props: {
      vehicle,
    },
  };
};
