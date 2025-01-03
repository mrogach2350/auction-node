import "dotenv/config";
import * as schema from "./schema";
import { drizzle } from "drizzle-orm/node-postgres";
const db = drizzle(process.env.DATABASE_URL!);

export const createVehicle = async (vehicle: any) => {
  await db
    .insert(schema.vehicles)
    .values(vehicle)
    .onConflictDoUpdate({
      target: schema.vehicles.id,
      set: { ...vehicle },
    });
};

export const bulkCreateVehicle = async (vehicles: any[]) => {
  await db.insert(schema.vehicles).values(vehicles).onConflictDoNothing();
};

export const upsertAuction = async (auction: any) => {
  await db
    .insert(schema.auctions)
    .values(auction)
    .onConflictDoUpdate({
      target: schema.auctions.id,
      set: { ...auction },
    });
};
