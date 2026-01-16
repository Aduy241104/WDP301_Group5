import React from "react";
import Navbar from "../../components/Navbar";
import SidebarLeft from "../../components/SidebarLeft";
import SidebarRight from "../../components/SidebarRight";
import { Outlet } from "react-router-dom";

const NewFeedLayout = () => {
    return (
        <div className="bg-gray-100 min-h-screen w-full">
            {/* Navbar */ }
            <Navbar />

            {/* Content area */ }
            <div className="flex justify-center w-full mt-2 px-2 lg:px-8 gap-10">
                {/* Left Sidebar */ }
                <div className="hidden lg:block w-64 sticky top-[72px] h-[calc(100vh-72px)]">
                    <SidebarLeft />
                </div>

                {/* Main Feed */ }
                <div className="flex-1 w-full max-w-3xl space-y-4 h-[calc(100vh-72px)] overflow-y-auto hide-scrollbar">
                    <Outlet />
                </div>

                {/* Right Sidebar */ }
                <div className="hidden xl:block w-80 sticky top-[72px] h-[calc(100vh-72px)]">
                    <SidebarRight />
                </div>
            </div>
        </div>
    );
};

export default NewFeedLayout;
