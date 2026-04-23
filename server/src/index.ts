import "dotenv/config";
import { createApp } from "./app";

const port = Number(process.env.SERVER_PORT ?? 3001);
const app = createApp();

app.listen(port, () => {
  console.log(`CineHarbor server listening on ${port}`);
});
