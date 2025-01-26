import React from "react";

const PaginationComponent = ({ currentPage, totalPages, onPageChange }) => {
  if (!onPageChange) {
    console.error(
      "onPageChange function is not provided to PaginationComponent."
    );
    return null;
  }

  return (
    <div className="pagination">
      {/* Previous Button */}
      <button
        className="page-button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        &lt;
      </button>

      {/* First Page */}
      {currentPage > 2 && (
        <>
          <button
            className={`page-button ${currentPage === 1 ? "active" : ""}`}
            onClick={() => onPageChange(1)}
          >
            1
          </button>
          {currentPage > 3 && <span className="ellipsis">...</span>}
        </>
      )}

      {/* Pages Around Current Page */}
      {Array.from({ length: totalPages }, (_, i) => i + 1)
        .filter(
          (page) =>
            page === currentPage ||
            page === currentPage - 1 ||
            page === currentPage + 1
        )
        .map((page) => (
          <button
            key={page}
            className={`page-button ${currentPage === page ? "active" : ""}`}
            onClick={() => onPageChange(page)}
          >
            {page}
          </button>
        ))}

      {/* Last Page */}
      {currentPage < totalPages - 1 && (
        <>
          {currentPage < totalPages - 2 && (
            <span className="ellipsis">...</span>
          )}
          <button
            className={`page-button ${
              currentPage === totalPages ? "active" : ""
            }`}
            onClick={() => onPageChange(totalPages)}
          >
            {totalPages}
          </button>
        </>
      )}

      {/* Next Button */}
      <button
        className="page-button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        &gt;
      </button>
    </div>
  );
};

export default PaginationComponent;
