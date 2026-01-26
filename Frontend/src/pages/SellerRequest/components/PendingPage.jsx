
function PendingPage({ status }) {
    return (
        <div className="mx-auto max-w-xl">
            <div
                className={ `
                    rounded-2xl border p-6 shadow-sm
                    ${status === "pending"
                        ? "border-sky-200 bg-sky-50"
                        : "border-emerald-200 bg-emerald-50"
                    }
                `}
            >
                <div className="flex items-start gap-4">
                    {/* ICON */ }
                    <div
                        className={ `
                            flex h-12 w-12 items-center justify-center rounded-full
                            ${status === "pending"
                                ? "bg-sky-100 text-sky-600"
                                : "bg-emerald-100 text-emerald-600"
                            }
                        `}
                    >
                        { status === "pending" ? (
                            <svg
                                className="h-6 w-6 animate-spin"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                />
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                />
                            </svg>
                        ) : (
                            <svg
                                className="h-6 w-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={ 2 }
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M5 13l4 4L19 7"
                                />
                            </svg>
                        ) }
                    </div>

                    {/* CONTENT */ }
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-slate-900">
                            { status === "pending"
                                ? "Yêu cầu đăng ký Seller đang được xét duyệt"
                                : "Bạn đã được phê duyệt trở thành Seller" }
                        </h3>

                        <p className="mt-1 text-sm text-slate-600">
                            { status === "pending"
                                ? "Hệ thống đang kiểm tra thông tin shop của bạn. Vui lòng chờ trong thời gian sớm nhất."
                                : "Chúc mừng bạn! Bạn có thể bắt đầu quản lý shop và đăng sản phẩm ngay bây giờ." }
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PendingPage