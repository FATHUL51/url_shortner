import React from "react";
import "./Pagination.css";

const PaginationComponent = ({ currentPage, totalPages, onPageChange }) => {
  const getPageNumbers = () => {
    if (totalPages <= 2) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages = [1];

    if (currentPage !== 1 && currentPage !== totalPages) {
      pages.push("...", currentPage, "...");
    } else {
      pages.push("...");
    }

    pages.push(totalPages);
    return pages;
  };

  return (
    <div className="pagination-container">
      <button
        className="pagination-button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
      >
        ＜
      </button>

      {getPageNumbers().map((page, index) => (
        <button
          key={index}
          onClick={() => (typeof page === "number" ? onPageChange(page) : null)}
          className={`page-number ${page === currentPage ? "active" : ""} ${
            page === "..." ? "dots" : ""
          }`}
          disabled={page === "..."}
        >
          {page}
        </button>
      ))}

      <button
        className="pagination-button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
      >
        ＞
      </button>
    </div>
  );
};

export default PaginationComponent;
