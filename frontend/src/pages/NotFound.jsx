import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";

/**
 * Not Found page.
 */
export default function NotFound({ title = "Page not found" }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 p-6 text-center">
      <h1 className="text-3xl font-semibold text-slate-900">{title}</h1>
      <p className="text-sm text-slate-500">The page you are looking for does not exist.</p>
      <Button asChild>
        <Link to="/">Back to Dashboard</Link>
      </Button>
    </div>
  );
}

NotFound.propTypes = {
  title: PropTypes.string,
};
