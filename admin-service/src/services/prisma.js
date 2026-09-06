// Keep a single Prisma client for the entire service. This avoids opening
// separate pools when database helpers and application services are both used.
export { default } from "../config/db.js";
