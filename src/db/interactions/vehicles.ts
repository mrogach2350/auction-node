import { eq } from "drizzle-orm";
import { vehicles } from "@/db/schema";
import { db } from "@/db";

export const getAllVehicles = async () => {
  const vehicles = await db.query.vehicles.findMany({
    with: {
      offers: true,
    },
    where: (vehicles, { isNull }) => isNull(vehicles.deletedAt),
  });

  return vehicles.map((vehicle) => ({
    ...vehicle,
    offers: vehicle?.offers.map((o) => ({
      ...o,
      retrivedAt: o.retrivedAt?.toDateString(),
      validUntil: o.validUntil?.toDateString(),
    })),
  }));
};

export const getVehicleById = async (id: number) => {
  const vehicle = await db.query.vehicles.findFirst({
    with: {
      offers: true,
    },
    where: eq(vehicles.id, id),
  });

  return {
    ...vehicle,
    offers: vehicle?.offers.map((o) => ({
      ...o,
      retrivedAt: o.retrivedAt?.toDateString(),
      validUntil: o.validUntil?.toDateString(),
    })),
  };
};

export const createVehicle = async (vehicle: any) => {
  await db
    .insert(vehicles)
    .values(vehicle)
    .onConflictDoUpdate({
      target: vehicles.id,
      set: { ...vehicle, deletedAt: null },
    });
};

export const updateVehicle = async (vehicle: any) => {
  const { id, ...vehicleData } = vehicle;
  console.log("updateVehicle", { id, vehicleData });

  await db
    .update(vehicles)
    .set({ ...vehicleData })
    .where(eq(vehicles.id, id));
};

export const bulkCreateVehicle = async (
  newVehicles: any[],
  auctionRecordId = 0
) => {
  newVehicles
    .filter((v: any) => v.vin !== "" && v.url !== "")
    .map((v: any) => ({
      auctionId: auctionRecordId,
      ...v,
    }))
    .forEach(async (v: any) => {
      try {
        await db
          .insert(vehicles)
          .values(v)
          .onConflictDoUpdate({
            target: vehicles.vin,
            set: { ...v, deletedAt: null },
          });
      } catch (e) {
        console.log("error creating vehicle record:", {
          e,
          v,
        });
      }
    });
};

export const deleteVehicleById = async (vehicleId: number) => {
  try {
    await db
      .update(vehicles)
      .set({ deletedAt: new Date() })
      .where(eq(vehicles.id, vehicleId));
  } catch (e) {
    console.log("error deleting vehicle record:", {
      e,
      vehicleId,
    });
  }
};
