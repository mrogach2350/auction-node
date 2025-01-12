import { eq } from "drizzle-orm";
import { lists, vehiclesToLists } from "@/db/schema";
import { db } from "@/db";

export const getAllLists = async () => {
  const lists = await db.query.lists.findMany({});
  return lists;
};

export const getAllListsWithVehicles = async () => {
  const lists = await db.query.lists.findMany({
    with: {
      vehiclesToLists: {
        with: {
          vehicle: true,
        },
      },
    },
  });

  return lists;
};

export const getListById = async (id: number) => {
  const list = await db.query.lists.findFirst({
    with: {
      vehiclesToLists: {
        with: {
          vehicle: true,
        },
      },
    },
    where: eq(lists.id, id),
  });

  return list;
};

export const createList = async (list: any) => {
  try {
    return await db.insert(lists).values(list).returning({ id: lists.id });
  } catch (e) {
    console.log(e);
  }
};

export const addVehicleToList = async (listId: number, vehicleId: number) => {
  await db.insert(vehiclesToLists).values({ listId, vehicleId });
};
