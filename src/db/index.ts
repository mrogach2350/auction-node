import "dotenv/config";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { vehicles, offers, auctions } from "./schema";
const db = drizzle({
  connection: process.env.DATABASE_URL!,
});

if (process.env.MIGRATE === "true") {
  void migrate(db, { migrationsFolder: "./drizzle" });
}

export const createVehicle = async (vehicle: any) => {
  await db
    .insert(vehicles)
    .values(vehicle)
    .onConflictDoUpdate({
      target: vehicles.id,
      set: { ...vehicle },
    });
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
        await db.insert(vehicles).values(v);
      } catch (e) {
        console.log("error creating vehicle record:", {
          e,
          v,
        });
      }
    });
};

export const upsertAuction = async (auction: any) => {
  return await db
    .insert(auctions)
    .values(auction)
    .onConflictDoUpdate({
      target: auctions.id,
      set: { ...auction },
    })
    .returning({ auctionRecordId: auctions.id });
};

export const createOffer = async (offer: any) => {
  await db.insert(offers).values(offer);
};

export const getAllVehicles = async () => {
  return await db.select().from(vehicles);
};

export const getVehicleById = async (id: number) => {
  const found = await db
    .select()
    .from(vehicles)
    .leftJoin(offers, eq(offers.vehicleId, vehicles.id))
    .where(eq(vehicles.id, id));
  return found[0];
};

export const getAllOffers = async () => {
  return await db.select().from(offers);
};

export const getAllAuctions = async () => {
  return await db.select().from(auctions);
};
