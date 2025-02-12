import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-blue-600 text-white p-4 shadow-md">
        <h1 className="text-2xl font-bold tracking-wide text-center md:text-left">
          🏁 ThemeRace
        </h1>
      </header>

      {/* Main Content */}
      <main className="flex-grow p-4 container mx-auto">
        <Navbar />
        <Outlet /> {/* Render child routes here */}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-300 text-center py-2 text-sm">
        © {new Date().getFullYear()} ThemeRace. All rights reserved.
      </footer>
    </div>
  );
};

export default Layout;
