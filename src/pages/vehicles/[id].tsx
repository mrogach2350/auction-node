import { getVehicleById } from "@/db";

export default function VehicleShow({ vehicle }: { vehicle: any }) {
  return (
    <div>
      <h1 className="title"> Vehicle Info!</h1>
      <p>
        <strong>Title</strong>: <span>{vehicle?.title}</span>
      </p>
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
        <strong>Mileage</strong>: <span>{vehicle?.mileage}</span>
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
