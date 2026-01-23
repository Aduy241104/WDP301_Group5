import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
    const { pathname, search, hash } = useLocation();

    useEffect(() => {
        // nếu bạn muốn luôn về top khi đổi route:
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }, [pathname]); // hoặc [pathname, search] nếu đổi query cũng muốn về top

    return null;
}
