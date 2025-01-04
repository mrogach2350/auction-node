import "dotenv/config";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import * as schema from "./schema";
const db = drizzle(process.env.DATABASE_URL!);

if (process.env.MIGRATE === "true") {
  void migrate(db, { migrationsFolder: "./drizzle" });
}

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

export const createOffer = async (offer: any) => {
  await db.insert(schema.offers).values(offer);
};

export const getAllVehicles = async () => {
  return await db.select().from(schema.vehicles);
};

export const getVehicleById = async (id: number) => {
  const found = await db
    .select()
    .from(schema.vehicles)
    .where(eq(schema.vehicles.id, id));
  return found[0];
};

export const getAllOffers = async () => {
  return await db.select().from(schema.offers);
};

export const getAllAuctions = async () => {
  return await db.select().from(schema.auctions);
};
