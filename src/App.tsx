import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import NotFound from "./pages/NotFound";
import RaceOverview from "./pages/RaceOverview"; // ✅ Import toegevoegd
import "./index.css";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* ✅ Race overzicht */}
        <Route index element={<RaceOverview />} />

        {/* ✅ Placeholder voor race detailpagina */}
        <Route
          path="race/:raceId"
          element={
            <h2 className="text-xl font-bold text-red-500">
              Race Detailpagina
            </h2>
          }
        />

        {/* ✅ Fallback voor niet-bestaande routes */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

export default App;
