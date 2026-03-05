import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
    followShopAPI,
    unfollowShopAPI,
    getShopFollowersCountAPI,
    checkFollowShopAPI,
} from "../../services/shopFollowService"; // đổi path theo dự án bạn

function formatNumber(n) {
    return Number(n || 0).toLocaleString("vi-VN");
}

export default function ShopFollowButton({ shopId, className = "", size = "md" }) {
    const nav = useNavigate();
    const { isAuthenticated } = useAuth();

    const [isFollowed, setIsFollowed] = useState(false);
    const [followersCount, setFollowersCount] = useState(0);

    const [loadingInit, setLoadingInit] = useState(true);
    const [loadingAction, setLoadingAction] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const btnSizeCls = useMemo(() => {
        if (size === "sm") return "px-3 py-1.5 text-sm";
        return "px-4 py-2 text-sm";
    }, [size]);

    // Fetch count (public)
    const fetchFollowersCount = async () => {
        try {
            const countRes = await getShopFollowersCountAPI(shopId);
            setFollowersCount(Number(countRes?.data?.followersCount || 0));
        } catch {
            // count fail thì thôi, không chặn UI
        }
    };

    // Fetch follow status (only when logged in)
    const fetchFollowStatus = async () => {
        const res = await checkFollowShopAPI(shopId);
        setIsFollowed(Boolean(res?.isFollowed));
    };

    useEffect(() => {
        if (!shopId) return;

        let cancelled = false;

        const run = async () => {
            setErrorMsg("");
            setLoadingInit(true);
            console.log("HHEHEHEH");

            try {
                // luôn lấy count trước (không cần auth)
                await fetchFollowersCount();

                // nếu chưa login => mặc định chưa follow, KHÔNG gọi api check
                if (!isAuthenticated) {
                    if (!cancelled) setIsFollowed(false);
                    return;
                }

                // nếu login => gọi api check
                await fetchFollowStatus();
            } catch (err) {
                // nếu login mà check fail (401/...) thì fallback an toàn
                if (!cancelled) {
                    setIsFollowed(false);
                    const msg = err?.response?.data?.message || "Something went wrong.";
                    setErrorMsg(msg);
                }
            } finally {
                if (!cancelled) setLoadingInit(false);
            }
        };

        run();

        return () => {
            cancelled = true;
        };
    }, [shopId, isAuthenticated]);

    const handleClick = async () => {
        if (!shopId || loadingInit || loadingAction) return;

        // chưa login => bấm follow thì về /login
        if (!isAuthenticated) {
            nav("/login");
            return;
        }

        setErrorMsg("");
        setLoadingAction(true);

        // optimistic
        const prevFollowed = isFollowed;
        const prevCount = followersCount;

        try {
            if (!prevFollowed) {
                setIsFollowed(true);
                setFollowersCount((c) => c + 1);

                await followShopAPI(shopId);
            } else {
                setIsFollowed(false);
                setFollowersCount((c) => Math.max(0, c - 1));

                await unfollowShopAPI(shopId);
            }

            // optional: sync lại count cho chuẩn tuyệt đối
            // await fetchFollowersCount();
        } catch (err) {
            // rollback
            setIsFollowed(prevFollowed);
            setFollowersCount(prevCount);

            const status = err?.response?.status;
            const msg = err?.response?.data?.message || "Action failed.";

            // nếu token hết hạn mà bị 401 => đá về login
            if (status === 401) {
                nav("/login");
                return;
            }

            setErrorMsg(msg);
        } finally {
            setLoadingAction(false);
        }
    };

    const isDisabled = loadingInit || loadingAction;

    return (
        <div className={ `flex items-center gap-4 ${className}` }>
            <button
                type="button"
                onClick={ handleClick }
                disabled={ isDisabled }
                className={ [
                    "inline-flex items-center justify-center gap-2 rounded-xl border transition-all duration-200 select-none active:scale-95",
                    btnSizeCls,
                    isFollowed
                        ? "border-slate-200 bg-white text-slate-800 hover:bg-slate-50"
                        : "border-cyan-300 bg-cyan-300/25 text-slate-800 hover:bg-cyan-300/40",
                    isDisabled ? "cursor-not-allowed opacity-60" : "",
                ].join(" ") }
            >
                { loadingInit || loadingAction ? (
                    <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700" />
                        <span>{ loadingInit ? "Đang tải" : "Đang xử lý" }</span>
                    </>
                ) : isFollowed ? (
                    <>
                        <span className="text-base leading-none">✓</span>
                        <span>Đã theo dõi</span>
                    </>
                ) : (
                    <>
                        <span className="text-base leading-none">＋</span>
                        <span>Theo dõi</span>
                    </>
                ) }
            </button>

            <div className="text-sm text-slate-500">
                <span className="font-semibold text-slate-900">
                    { formatNumber(followersCount) }
                </span>{ " " }
                followers
            </div>

            { errorMsg && (
                <div className="text-sm text-red-600">{ errorMsg }</div>
            ) }
        </div>
    );
}