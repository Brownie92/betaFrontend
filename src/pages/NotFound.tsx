import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="text-center">
      <h1 className="text-3xl font-bold">404 - Pagina niet gevonden</h1>
      <p>
        Terug naar{" "}
        <Link to="/" className="text-blue-500">
          Home
        </Link>
      </p>
    </div>
  );
};

export default NotFound;
