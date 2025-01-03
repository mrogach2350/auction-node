CREATE TABLE "auctions" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "auctions_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"company" varchar(255),
	"url" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "offers" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "offers_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"amount" integer,
	"retrivedAt" timestamp,
	"offer_code" varchar(255),
	"offering_company" varchar(255) DEFAULT 'carmax',
	"valid_until" timestamp
);
