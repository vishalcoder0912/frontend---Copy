import PropTypes from "prop-types";
import { Skeleton } from "../ui/skeleton";

/**
 * Loading placeholder.
 */
export default function LoadingSkeleton({ rows = 5 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, index) => (
        <Skeleton key={index} className="h-10 w-full" />
      ))}
    </div>
  );
}

LoadingSkeleton.propTypes = {
  rows: PropTypes.number,
};
