// import client from "prom-client";
// import { NextRequest, NextResponse } from "next/server";
// import { customRegister } from "@/lib/metrics"; // Adjust path as needed

// // Use Node.js runtime
// export const runtime = "nodejs";

// // Create a registry for default metrics
// const defaultRegister = new client.Registry();
// // Collect default metrics (Node.js-specific)
// // client.collectDefaultMetrics({ register: defaultRegister });

// // Merge custom and default registries for the /metrics endpoint
// const mergedRegister = client.Registry.merge([defaultRegister, customRegister]);

// // GET handler for /api/metrics
// // eslint-disable-next-line @typescript-eslint/no-unused-vars
// export async function GET(_req: NextRequest) {
//   const metrics = await mergedRegister.metrics();
//   return new NextResponse(metrics, {
//     status: 200,
//     headers: { "Content-Type": mergedRegister.contentType },
//   });
// }
