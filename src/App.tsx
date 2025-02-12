import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import NotFound from "./pages/NotFound";
import RaceOverview from "./pages/RaceOverview";
import RaceDetails from "./pages/RaceDetails";
import "./index.css";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* ✅ Race Overview */}
        <Route index element={<RaceOverview />} />
        {/* ✅ Race Details Page */}
        <Route path="race/:raceId" element={<RaceDetails />} />
        {/* ✅ 404 Page for Unknown Routes */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

export default App;
