import { integer, pgTable, timestamp, text } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const vehicles = pgTable("vehicles", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  title: text(),
  listNumber: text(),
  engine: text(),
  transmission: text(),
  make: text(),
  model: text(),
  mileage: integer(),
  vin: text().notNull().unique(),
  year: integer(),
  url: text().notNull(),
  auctionId: integer(),
  note: text().default(""),
  currentBidAmount: text(),
  secondsLeftToBid: integer(),
  deletedAt: timestamp(),
});

export const vehiclesRelations = relations(vehicles, ({ one, many }) => ({
  offers: many(offers),
  auction: one(auctions, {
    fields: [vehicles.auctionId],
    references: [auctions.id],
  }),
}));

export const offers = pgTable("offers", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  amount: integer(),
  retrivedAt: timestamp().defaultNow(),
  code: text(),
  offeringCompany: text().default("carmax"),
  validUntil: timestamp(),
  vehicleId: integer().references(() => vehicles.id, { onDelete: "cascade" }),
});

export const offersRelations = relations(offers, ({ one }) => ({
  vehicle: one(vehicles, {
    fields: [offers.vehicleId],
    references: [vehicles.id],
  }),
}));

export const auctions = pgTable("auctions", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  company: text(),
  url: text(),
});

export const auctionsRelations = relations(auctions, ({ many }) => ({
  vehicles: many(vehicles),
}));
