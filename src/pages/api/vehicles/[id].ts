import { NextApiRequest, NextApiResponse } from "next";
import { getVehicleById } from "@/db/interactions/vehicles";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id = "" } = req.query;
  const vehicle = await getVehicleById(parseInt(id as string));
  return res.json({
    vehicle,
  });
}
