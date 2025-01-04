import { NextApiRequest, NextApiResponse } from "next";
import { bulkCreateVehicle, upsertAuction } from "@/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  let response;
  const { auctionUrl = "" } = req.body;
  try {
    response = await fetch(`${process.env.BASE_SCRAPER_URL}/get-auctions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        auctionUrl,
      }),
    });
  } catch (e) {
    console.log("error getting auctions: ", e);
  }
  const data = await response?.json();
  const { allListings = [], auction = {} } = data;
  try {
    const returnedRecords = await upsertAuction(auction);
    const returnedRecord = returnedRecords[0];
    await bulkCreateVehicle(allListings, returnedRecord.auctionRecordId);
    return res.json({
      success: true,
      auctionsReceived: allListings.legnth,
    });
  } catch (error: any) {
    return res.json({
      success: false,
      error: error.message,
    });
  }
}
