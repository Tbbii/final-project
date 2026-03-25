const jsonServer = require("json-server");
const cron = require("node-cron");

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

    const now = new Date();
    now.setMinutes(0, 0, 0);
    const hour = now.toISOString();

    stations
      .filter((s) => Number(s.AQILast?.AQI?.aqi) > 0)
      .forEach((s) => {
        const stationId = s.stationID;
        const pm25 = Number(s.AQILast.PM25.value);
        const aqi = Number(s.AQILast.AQI.aqi);

        const existing = router.db
          .get("snapshots")
          .find({ station_id: stationId, hour })
          .value();

        if (existing) {
          router.db
            .get("snapshots")
            .find({ station_id: stationId, hour })
            .assign({ pm25, aqi })
            .write();
        } else {
          router.db
            .get("snapshots")
            .push({ station_id: stationId, hour, pm25, aqi })
            .write();
        }
      });

    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    router.db
      .get("snapshots")
      .remove((r) => r.hour < cutoff)
      .write();

    console.log(
      `[${new Date().toLocaleTimeString()}] ✅ saved ${stations.length} stations`,
    );
  } catch (err) {
    console.error("❌ fetch failed:", err.message);
  }
};

fetchAndSave();
cron.schedule("0 * * * *", fetchAndSave);
