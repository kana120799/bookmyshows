// import client from "prom-client";

// // registry for custom metrics
// const register = new client.Registry();

// const httpRequestDuration = new client.Histogram({
//   name: "http_request_duration_seconds",
//   help: "Duration of HTTP requests in seconds",
//   labelNames: ["method", "route", "status"],
//   buckets: [0.1, 0.3, 0.5, 1, 2, 5, 10, 20, 50, 100],
//   registers: [register],
// });

// const userSeatLock = new client.Counter({
//   name: "redis_seatlocking_total",
//   help: "Number of times seats are locked",
//   registers: [register],
// });

// const dbQueryDuration = new client.Histogram({
//   name: "db_query_duration_seconds",
//   help: "Duration of database queries in seconds",
//   labelNames: ["model", "operation", "status"],
//   buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 2, 5, 10, 20],
//   registers: [register],
// });

// const dbQueryErrors = new client.Counter({
//   name: "db_query_errors_total",
//   help: "Total number of database query errors",
//   labelNames: ["model", "error_type"],
//   registers: [register],
// });

// export {
//   httpRequestDuration,
//   dbQueryDuration,
//   dbQueryErrors,
//   userSeatLock,
//   register as customRegister,
// };
