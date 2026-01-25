const AvatarBox = ({ avatar, setEditData }) => {
    const handleSelectAvatar = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // tạm thời preview local
        const preview = URL.createObjectURL(file);

        setEditData((prev) => ({
            ...prev,
            avatar: preview,
        }));
    };

    return (
        <div className="flex flex-col items-center w-1/3">
            <label className="cursor-pointer">
                <img
                    src={avatar || "/default-avatar.png"}
                    className="w-32 h-32 rounded-full border object-cover"
                />
                <input type="file" hidden accept="image/*" onChange={handleSelectAvatar} />
            </label>
            <p className="mt-3 text-sm text-gray-500">Đổi ảnh đại diện</p>
        </div>
    );
};

export default AvatarBox;
