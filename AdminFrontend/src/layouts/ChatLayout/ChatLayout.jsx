import Sidebar from "./Sidebar";
import ChatHeader from "./ChatHeader";
import { Outlet, useOutlet } from "react-router-dom";
import EmptyChat from "../../pages/EmptyChat";
import { useState } from "react";
import FriendModal from "../../components/friends/FriendModal";


export default function ChatLayout() {
    const outlet = useOutlet();
    const [isOpenFriendModal, setOpenFriendModal] = useState(false);
    return (
        <div className="flex h-screen bg-purple-50">
            <Sidebar className="w-80 md:w-96 border-r border-gray-200" handleOpenFriendModal={ () => setOpenFriendModal(true) } />

            <div className="flex-1 flex flex-col bg-white">
                <ChatHeader />
                <div className="flex-1 overflow-y-auto">
                    { outlet ? <Outlet /> : <EmptyChat /> }
                </div>
            </div>


            <FriendModal isOpen={ isOpenFriendModal } onClose={ () => setOpenFriendModal(false) } />
        </div>
    );
}
