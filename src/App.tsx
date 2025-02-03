import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import NotFound from "./pages/NotFound";
import RaceOverview from "./pages/RaceOverview";
import RaceDetails from "./pages/RaceDetails"; // ✅ Zorg dat dit correct is geïmporteerd
import "./index.css";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* ✅ Race overzicht */}
        <Route index element={<RaceOverview />} />
        {/* ✅ Race detailpagina */}
        <Route path="race/:raceId" element={<RaceDetails />} />{" "}
        {/* ✅ Hier aangepast */}
        {/* ✅ Fallback voor niet-bestaande routes */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

export default App;
