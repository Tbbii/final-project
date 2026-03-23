import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import MapPage from "./pages/MapPage";
import DashboardPage from "./pages/DashboardPage";

const NAV_STYLE = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  width: 48,
  height: 48,
  borderRadius: 10,
  color: "rgba(255,255,255,0.6)",
  textDecoration: "none",
  fontSize: 11,
  gap: 3,
  transition: "all 0.15s",
};

const NAV_ACTIVE = {
  ...NAV_STYLE,
  background: "rgba(255,255,255,0.15)",
  color: "#fff",
};

export default function App() {
  return (
    <BrowserRouter>
      <div
        style={{
          display: "flex",
          height: "100vh",
          fontFamily: "Noto Sans Thai, sans-serif",
        }}
      >
        {/* Sidebar navigation */}
        <div
          style={{
            width: 60,
            background: "#1158e5",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "12px 0",
            gap: 8,
            flexShrink: 0,
            zIndex: 50,
          }}
        >
          <div style={{ color: "#fff", fontSize: 18, marginBottom: 8 }}>🌤</div>

          <NavLink
            to="/"
            end
            style={({ isActive }) => (isActive ? NAV_ACTIVE : NAV_STYLE)}
          >
            <span style={{ fontSize: 18 }}>🗺️</span>
            <span>แผนที่</span>
          </NavLink>

          <NavLink
            to="/dashboard"
            style={({ isActive }) => (isActive ? NAV_ACTIVE : NAV_STYLE)}
          >
            <span style={{ fontSize: 18 }}>📊</span>
            <span>สถิติ</span>
          </NavLink>
        </div>

        {/* Pages */}
        <div style={{ flex: 1, overflow: "hidden" }}>
          <Routes>
            <Route path="/" element={<MapPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}
