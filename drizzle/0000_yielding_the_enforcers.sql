CREATE TABLE "vehicles" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "vehicles_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"make" varchar(255),
	"model" varchar(255),
	"mileage" integer,
	"vin" varchar(255) NOT NULL,
	"year" integer,
	"url" varchar(255) NOT NULL
);
