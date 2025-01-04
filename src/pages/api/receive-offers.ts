import { NextApiRequest, NextApiResponse } from "next";
import { createOffer } from "@/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { vin = "", mileage = 0 } = req.body;
  const response = await fetch(`${process.env.BASE_SCRAPER_URL}/get-offer`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      vin,
      mileage,
    }),
  });

  const { offerData = {} } = await response.json();
  try {
    await createOffer(offerData);
    return res.json({
      success: true,
      offerData,
    });
  } catch (error: any) {
    return res.json({
      success: false,
      error: error.message,
    });
  }
}
