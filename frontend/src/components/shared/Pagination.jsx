import PropTypes from "prop-types";
import { Button } from "../ui/button";

export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-slate-500">Page {page} of {totalPages}</p>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" disabled={page === 1} onClick={() => onPageChange(page - 1)}>
          Prev
        </Button>
        <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => onPageChange(page + 1)}>
          Next
        </Button>
      </div>
    </div>
  );
}

Pagination.propTypes = {
  page: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
};
