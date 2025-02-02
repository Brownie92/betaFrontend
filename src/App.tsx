import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import NotFound from "./pages/NotFound";
import "./index.css";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route
          index
          element={<h2 className="text-xl font-bold text-blue-500">Home</h2>}
        />
        <Route
          path="race"
          element={
            <h2 className="text-xl font-bold text-red-500">Race pagina</h2>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

export default App;
