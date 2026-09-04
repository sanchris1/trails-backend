import "dotenv/config";
import { createApplication } from "./routes/app.js";
import { env } from "./config/env.js";
import { logger } from "./lib/logger.js";
import { startExpeditionStatusJob } from "./jobs/expeditionStatus.job.js";

const app = createApplication();

startExpeditionStatusJob();

app.listen(env.port, () => {
  logger.info(`Server in running on port http://localhost:${env.port}`);
});
