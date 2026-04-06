import "dotenv/config";
import { createServer } from "node:http";
import createExpressServer from "./module/app";

const port = process.env.PORT!;

(function main() {
  try {
    const server = createServer(createExpressServer());

    server.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error(error);
  }
})();
