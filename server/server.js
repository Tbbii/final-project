const jsonServer = require("json-server");
const cron = require("node-cron");
const fs = require("fs");

const server = jsonServer.create();
const router = jsonServer.router("db.json");
const middlewares = jsonServer.defaults();

server.use(middlewares);
server.use(router);
server.listen(3001, () =>
  console.log("✅ json-server running on http://localhost:3001"),
);

const fetchAndSave = async () => {
  try {
    const res = await fetch(
      "http://air4thai.pcd.go.th/services/getNewAQI_JSON.php",
    );
    const { stations } = await res.json();

    const db = JSON.parse(fs.readFileSync("db.json", "utf-8"));

    const now = new Date();
    now.setMinutes(0, 0, 0);
    const hour = now.toISOString();

    stations
      .filter((s) => Number(s.AQILast?.AQI?.aqi) > 0)
      .forEach((s) => {
        const stationId = s.stationID;
        const pm25 = Number(s.AQILast.PM25.value);
        const aqi = Number(s.AQILast.AQI.aqi);

        const idx = db.snapshots.findIndex(
          (r) => r.station_id === stationId && r.hour === hour,
        );
        if (idx >= 0) {
          db.snapshots[idx] = { ...db.snapshots[idx], pm25, aqi };
        } else {
          db.snapshots.push({ station_id: stationId, hour, pm25, aqi });
        }
      });

    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    db.snapshots = db.snapshots.filter((r) => r.hour >= cutoff);

    fs.writeFileSync("db.json", JSON.stringify(db, null, 2));
    router.db.read();

    console.log(
      `[${new Date().toLocaleTimeString()}] ✅ saved ${stations.length} stations`,
    );
  } catch (err) {
    console.error("❌ fetch failed:", err.message);
  }
};

fetchAndSave();
cron.schedule("0 * * * *", fetchAndSave);
