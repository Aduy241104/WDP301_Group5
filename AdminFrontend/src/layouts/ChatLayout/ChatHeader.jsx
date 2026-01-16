export default function ChatHeader() {
    return (
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
            <h2 className="text-lg font-semibold text-purple-700">Chat Room</h2>
            <span className="text-sm text-gray-500">Online</span>
        </div>
    );
}