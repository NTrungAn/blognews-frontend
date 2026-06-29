interface PaginationProps {
  currentPage: number;  // 0-indexed (match backend)
  totalPages: number;
  onPageChange: (page: number) => void;
}

function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i);
  // Hiển thị tối đa 7 trang
  const getVisiblePages = () => {
    if (totalPages <= 7) return pages;
    if (currentPage < 4) return [...pages.slice(0, 5), -1, totalPages - 1];
    if (currentPage > totalPages - 5) return [0, -1, ...pages.slice(totalPages - 5)];
    return [0, -1, currentPage - 1, currentPage, currentPage + 1, -2, totalPages - 1];
  };

  const visiblePages = getVisiblePages();

  return (
    <nav aria-label="Phân trang" className="flex items-center justify-center gap-1.5 py-8">
      {/* Prev */}
      <button
        disabled={currentPage === 0}
        onClick={() => onPageChange(currentPage - 1)}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#c2c6d6] bg-white text-[#424754] transition-all hover:border-[#0058be] hover:text-[#0058be] disabled:cursor-not-allowed disabled:opacity-40"
      >
        <span className="material-symbols-outlined text-lg">chevron_left</span>
      </button>

      {/* Pages */}
      {visiblePages.map((page, idx) =>
        page < 0 ? (
          <span key={`ellipsis-${idx}`} className="flex h-9 w-9 items-center justify-center text-[#727785]">
            …
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`flex h-9 w-9 items-center justify-center rounded-lg border text-sm font-medium transition-all ${
              page === currentPage
                ? 'border-[#0058be] bg-[#0058be] text-white shadow-sm'
                : 'border-[#c2c6d6] bg-white text-[#424754] hover:border-[#0058be] hover:text-[#0058be]'
            }`}
          >
            {page + 1}
          </button>
        )
      )}

      {/* Next */}
      <button
        disabled={currentPage === totalPages - 1}
        onClick={() => onPageChange(currentPage + 1)}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#c2c6d6] bg-white text-[#424754] transition-all hover:border-[#0058be] hover:text-[#0058be] disabled:cursor-not-allowed disabled:opacity-40"
      >
        <span className="material-symbols-outlined text-lg">chevron_right</span>
      </button>
    </nav>
  );
}

export default Pagination;
