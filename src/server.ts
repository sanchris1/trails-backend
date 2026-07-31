import "dotenv/config";
import { createApplication } from "./routes/app.js";
import { env } from "./config/env.js";
import { logger } from "./lib/logger.js";

const app = createApplication();

app.listen(env.port, () => {
  logger.info(`Server in running on port http://localhost:${env.port}`);
});
