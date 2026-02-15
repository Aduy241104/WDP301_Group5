import ReactPaginate from "react-paginate";

export default function PaginationBar({ page, totalPages, onPageChange }) {
    if (!totalPages || totalPages <= 1) return null;

    return (
        <div className="flex items-center justify-center">
            <ReactPaginate
                previousLabel="‹"
                nextLabel="›"
                breakLabel="…"
                pageCount={ totalPages }
                forcePage={ Math.max(0, (page || 1) - 1) }
                onPageChange={ (e) => onPageChange?.(e.selected) }
                marginPagesDisplayed={ 1 }
                pageRangeDisplayed={ 2 }
                containerClassName="flex items-center gap-2"
                pageClassName="rounded-xl border border-slate-200 bg-white"
                pageLinkClassName="block px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-xl"
                activeClassName="!border-slate-900"
                activeLinkClassName="!bg-slate-900 !text-white hover:!bg-slate-900"
                previousClassName="rounded-xl border border-slate-200 bg-white"
                previousLinkClassName="block px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-xl"
                nextClassName="rounded-xl border border-slate-200 bg-white"
                nextLinkClassName="block px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-xl"
                disabledClassName="opacity-40"
            />
        </div>
    );
}
