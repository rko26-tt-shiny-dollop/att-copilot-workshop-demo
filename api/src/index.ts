import { createApp } from "./app.js";

const port = Number(process.env.PORT ?? 3000);

createApp().listen(port, () => {
  console.log(`Wireless activation API listening on http://localhost:${port}`);
  console.log(`API docs at http://localhost:${port}/api-docs`);
});
