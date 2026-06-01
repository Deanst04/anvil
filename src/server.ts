import app from "./app";
import "dotenv/config";
import startEventWorker from "./workers/event.worker";

const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  startEventWorker();
});
