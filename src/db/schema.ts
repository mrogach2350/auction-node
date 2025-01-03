import { integer, pgTable, varchar, timestamp } from "drizzle-orm/pg-core";

// "title": "2020 Ford Transit-250 Cargo Van Runs & Moves) (Jump To Start, Body Damage, Low Fuel Light On",
// "listNumber": "Lot # KM001",
// "make": "Ford",
// "year": "2020",
// "vin": "1FTBR1Y86LKB79586",
// "mileage": "74,584",
// "engine": "6-cyl gas,",
// "transmission": "Automatic",
// "item location - city": "Kansas City",
// "item location - state/province": "Missouri"

export const vehicles = pgTable("vehicles", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  title: varchar({ length: 255 }),
  listNumber: varchar({ length: 255 }),
  engine: varchar({ length: 255 }),
  transmission: varchar({ length: 255 }),
  make: varchar({ length: 255 }),
  model: varchar({ length: 255 }),
  mileage: integer(),
  vin: varchar({ length: 255 }).notNull(),
  year: integer(),
  url: varchar({ length: 255 }).notNull(),
});

export const offers = pgTable("offers", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  amount: integer(),
  retrivedAt: timestamp(),
  offer_code: varchar({ length: 255 }),
  offering_company: varchar({ length: 255 }).default("carmax"),
  valid_until: timestamp(),
});

export const auctions = pgTable("auctions", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  company: varchar({ length: 255 }),
  url: varchar({ length: 255 }),
});
