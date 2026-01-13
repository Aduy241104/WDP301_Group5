import { Outlet, NavLink } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faHouse,
    faUserPlus,
    faUsers,
    faUserGroup,
    faCakeCandles,
    faGear
} from "@fortawesome/free-solid-svg-icons";

const menu = [
    { to: "/friends", icon: faHouse, label: "Trang chủ" },
    { to: "/friends/requests", icon: faUserPlus, label: "Lời mời kết bạn" },
    { to: "/friends/suggestions", icon: faUsers, label: "Gợi ý" },
    { to: "/friends/all", icon: faUserGroup, label: "Tất cả bạn bè" },
    { to: "/friends/birthdays", icon: faCakeCandles, label: "Sinh nhật" },
];

export default function FriendsLayout() {
    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */ }
            <aside className="w-72 bg-white border-r shadow-sm px-4 py-5">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold tracking-wide">Bạn bè</h2>
                    <FontAwesomeIcon
                        icon={ faGear }
                        className="text-gray-400 hover:text-gray-600 cursor-pointer transition"
                    />
                </div>

                <nav className="space-y-1">
                    { menu.map((item, i) => (
                        <NavLink
                            key={ i }
                            to={ item.to }
                            end
                            className={ ({ isActive }) =>
                                `group relative flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200
                                ${isActive
                                    ? "bg-blue-50 text-blue-600 font-semibold shadow-sm"
                                    : "text-gray-600 hover:bg-gray-100"
                                }`
                            }
                        >
                            <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r bg-blue-500 opacity-0 group-[.active]:opacity-100" />

                            <div className="flex items-center justify-center w-9 h-9 rounded-full transition bg-gray-100 group-hover:bg-white text-blue-500">
                                <FontAwesomeIcon icon={ item.icon } />
                            </div>

                            <span className="text-lg font-bold">{ item.label }</span>
                        </NavLink>
                    )) }
                </nav>
            </aside>

            {/* Content */ }
            <main className="flex-1 overflow-hidden">
                <div className="h-full overflow-y-auto p-6">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
