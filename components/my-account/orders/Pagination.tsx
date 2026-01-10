import { ChevronRight, ChevronLeft, ChevronsRight, ChevronsLeft } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  containerRef?: React.RefObject<HTMLDivElement>;
}

const Pagination = ({ currentPage, totalPages, onPageChange, containerRef }: PaginationProps) => {
  const handlePageChange = (newPage: number) => {
    onPageChange(newPage);
    setTimeout(() => {
      if (containerRef?.current) {
        containerRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center items-center gap-2 mt-6">
      <button
        onClick={() => handlePageChange(1)}
        disabled={currentPage === 1}
        className={`w-7 h-7 rounded-full flex items-center justify-center border border-blue-400 hover:border-blue-800 ${
          currentPage === 1 ? "text-blue-300 cursor-not-allowed" : "text-blue-600 hover:text-blue-800 cursor-pointer"
        }`}
        title="Trang Đầu"
      >
        <ChevronsLeft className="!h-4 !w-4" />
      </button>
      <button
        onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
        disabled={currentPage === 1}
        className={`w-6 h-6 rounded-full flex items-center justify-center border border-blue-400 hover:border-blue-800 ${
          currentPage === 1 ? "text-blue-300 cursor-not-allowed" : "text-blue-600 hover:text-blue-800 cursor-pointer"
        }`}
        title="Trang Trước"
      >
        <ChevronLeft className="!h-4 !w-4" />
      </button>
      {(() => {
        const pages = [];
        const maxVisible = 4;
        if (totalPages <= maxVisible) {
          for (let i = 1; i <= totalPages; i++) {
            pages.push(
              <button
                key={i}
                onClick={() => handlePageChange(i)}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition ${
                  currentPage === i ? "bg-blue-600 text-white font-semibold" : "text-gray-600 hover:bg-blue-100 cursor-pointer"
                }`}
              >
                {i}
              </button>
            );
          }
        } else {
          pages.push(
            <button
              key={1}
              onClick={() => handlePageChange(1)}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition ${
                currentPage === 1 ? "bg-blue-600 text-white font-semibold" : "text-gray-600 hover:bg-blue-100 cursor-pointer"
              }`}
            >
              1
            </button>
          );
          if (currentPage > 1 && currentPage < totalPages) {
            if (currentPage > 2) pages.push(<span key="ellipsis-start" className="text-gray-400 px-1">...</span>);
            pages.push(
              <button key={currentPage} className="w-9 h-9 rounded-full flex items-center justify-center bg-blue-600 text-white font-semibold transition">
                {currentPage}
              </button>
            );
            if (currentPage < totalPages - 1) pages.push(<span key="ellipsis-end" className="text-gray-400 px-1">...</span>);
          } else if (currentPage === 1) {
            if (totalPages > 2)
              pages.push(
                <button key={2} onClick={() => handlePageChange(2)} className="w-9 h-9 rounded-full flex items-center justify-center text-gray-600 hover:bg-blue-100 cursor-pointer transition">
                  2
                </button>
              );
            if (totalPages > 3) pages.push(<span key="ellipsis" className="text-gray-400 px-1">...</span>);
          } else if (currentPage === totalPages) {
            if (totalPages > 3) pages.push(<span key="ellipsis" className="text-gray-400 px-1">...</span>);
            if (totalPages > 2)
              pages.push(
                <button key={totalPages - 1} onClick={() => handlePageChange(totalPages - 1)} className="w-9 h-9 rounded-full flex items-center justify-center text-gray-600 hover:bg-blue-100 cursor-pointer transition">
                  {totalPages - 1}
                </button>
              );
          }
          if (totalPages > 1) {
            pages.push(
              <button
                key={totalPages}
                onClick={() => handlePageChange(totalPages)}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition ${
                  currentPage === totalPages ? "bg-blue-600 text-white font-semibold" : "text-gray-600 hover:bg-blue-100 cursor-pointer"
                }`}
              >
                {totalPages}
              </button>
            );
          }
        }
        return pages;
      })()}
      <button
        onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
        disabled={currentPage === totalPages}
        className={`w-6 h-6 rounded-full flex items-center justify-center border border-blue-400 hover:border-blue-800 ${
          currentPage === totalPages ? "text-blue-300 cursor-not-allowed" : "text-blue-600 hover:text-blue-800 cursor-pointer"
        }`}
        title="Trang Tiếp Theo"
      >
        <ChevronRight className="!h-4 !w-4" />
      </button>
      <button
        onClick={() => handlePageChange(totalPages)}
        disabled={currentPage === totalPages}
        className={`w-7 h-7 rounded-full flex items-center justify-center border border-blue-400 hover:border-blue-800 ${
          currentPage === totalPages ? "text-blue-300 cursor-not-allowed" : "text-blue-600 hover:text-blue-800 cursor-pointer"
        }`}
        title="Trang Cuối"
      >
        <ChevronsRight className="!h-4 !w-4" />
      </button>
    </div>
  );
};

export default Pagination;
