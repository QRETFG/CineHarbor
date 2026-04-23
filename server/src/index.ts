import "dotenv/config";
import { createApp } from "./app";
import { bootstrapApp } from "./db/bootstrap";

const { config } = bootstrapApp();
const port = config.port;
const app = createApp();

app.listen(port, () => {
  console.log(`CineHarbor server listening on ${port}`);
});
