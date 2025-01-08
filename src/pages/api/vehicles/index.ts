import { NextApiRequest, NextApiResponse } from "next";
import { getAllVehicles } from "@/db/interactions/vehicles";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const vehicles = await getAllVehicles();
  return res.json({
    vehicles,
  });
}
