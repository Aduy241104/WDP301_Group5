import { useEffect, useState } from "react";
import SidebarHeader from "../../components/sidebar/SidebarHeader";
import SidebarList from "../../components/sidebar/SidebarList";
import SidebarSearch from "../../components/sidebar/SidebarSearch";
import { getMessageListAPI } from "../../services/conversationService";

export default function Sidebar({ handleOpenFriendModal }) {
    const [showSearch, setShowSearch] = useState(false);
    const [listMessage, setListMessage] = useState([]);

    useEffect(() => {
        const loadData = async () => {
            try {
                const result = await getMessageListAPI();
                setListMessage(result.data.listMessage);
            } catch (error) {
                console.log(error);
            }
        }

        loadData();
    }, [])

    return (
        <div className="h-full bg-[#FAF9FF] p-5 flex flex-col w-80 md:w-96 
                        border-r border-gray-200 shadow-sm backdrop-blur-xl">

            {/* Header */ }
            <SidebarHeader
                chatCount={ listMessage.length }
                onOpenSearch={ () => setShowSearch(true) }
                onBack={ () => setShowSearch(false) }
                isSearchOpen={ showSearch }
                handleOpenFriendModal={ handleOpenFriendModal }
            />

            {/* Toggle giữa list và Search page */ }
            { showSearch ? (
                <SidebarSearch />
            ) : (
                <SidebarList friends={ listMessage } />
            ) }
        </div>
    );
}
