import { NextApiRequest, NextApiResponse } from "next";
import { bulkCreateVehicle } from "@/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { auctionUrl = "" } = req.body;
  const response = await fetch(`${process.env.BASE_SCRAPER_URL}/get-auctions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      auctionUrl,
    }),
  });

  const { auctions = [] } = await response.json();
  try {
    await bulkCreateVehicle(auctions);
    return res.json({
      success: true,
      auctionsReceived: auctions.legnth,
    });
  } catch (error: any) {
    return res.json({
      success: false,
      error: error.message,
    });
  }
}
