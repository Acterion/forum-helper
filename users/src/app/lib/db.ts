// import { neonConfig } from "@neondatabase/serverless";

// if (process.env.VERCEL_ENV === "development") {
//   console.log("Configuring neon");
//   neonConfig.wsProxy = (host) => {
//     console.log("Host:", host);
//     return `${host}:54330/v1`;
//   };
//   neonConfig.useSecureWebSocket = false;
//   neonConfig.pipelineTLS = false;
//   neonConfig.pipelineConnect = false;
// }

export * from "@vercel/postgres";
