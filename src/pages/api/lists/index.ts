import { NextApiRequest, NextApiResponse } from "next";
import { getAllLists } from "@/db/interactions/lists";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const lists = await getAllLists();
    res.json({
      success: true,
      lists,
    });
  } catch (e) {
    res.json({
      success: false,
      error: e,
    });
  }
}
