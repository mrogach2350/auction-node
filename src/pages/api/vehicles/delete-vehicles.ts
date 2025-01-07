import { NextApiRequest, NextApiResponse } from "next";
import { deleteVehicleById } from "@/db/interactions/vehicles";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { vehicleIds = [] } = req.body;
  for (const id of vehicleIds) {
    try {
      await deleteVehicleById(parseInt(id));
    } catch (error: any) {
      return res.json({
        success: false,
        error: error.message,
      });
    }
  }
  res.json({
    success: true,
    deleted: vehicleIds.length,
  });
}
