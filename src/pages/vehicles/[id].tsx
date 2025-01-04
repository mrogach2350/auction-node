import { useRouter } from "next/router";
import { getVehicleById } from "@/db";

export default function VehicleShow({ vehicle }: { vehicle: any }) {
  const router = useRouter();
  return (
    <div>
      <button onClick={() => router.push("/")} className="button is-info mb-3">
        Back to Vehicles
      </button>
      <h1 className="title"> {vehicle?.title}</h1>
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
        <span>{vehicle?.mileage.toLocaleString()}</span>
      </p>
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
