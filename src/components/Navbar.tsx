import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="bg-blue-600 text-white p-4 shadow-lg">
      <ul className="flex justify-between items-center max-w-4xl mx-auto">
        <li>
          <Link to="/" className="hover:text-gray-300 transition duration-200">
            🏠 Home
          </Link>
        </li>
        <li>
          <Link
            to="/race"
            className="hover:text-gray-300 transition duration-200"
          >
            🏁 Race
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
