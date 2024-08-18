import fs from "node:fs/promises";
import { NextResponse as res } from "next/server";
import { revalidatePath } from "next/cache";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("csv");

    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);
    await fs.writeFile(`./assets/uploads/${file.name}`, buffer);
    revalidatePath("/");

    return res.json({ result: "OK" });
  } catch (error) {
    return res.json({ result: "ERROR", error: error });
  }
}
