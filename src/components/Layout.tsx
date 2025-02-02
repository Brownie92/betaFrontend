import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-blue-600 text-white p-4">
        <h1 className="text-xl font-bold">ThemeRace</h1>
      </header>
      <main className="flex-grow p-4">
        <Navbar />
        <Outlet /> {/* Hier worden de pagina's geladen */}
      </main>
      <footer className="bg-gray-800 text-white text-center p-2">
        © 2025 ThemeRace
      </footer>
    </div>
  );
};

export default Layout;
