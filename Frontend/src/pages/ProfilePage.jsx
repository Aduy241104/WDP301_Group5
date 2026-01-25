import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getProfileAPI } from "../services/profileServices";

import ProfileSidebar from "../components/profile/ProfileSidebar";
import ProfileForm from "../components/profile/ProfileForm";
import AvatarBox from "../components/profile/AvatarBox";
import ChangePasswordForm from "../components/profile/ChangePasswordForm";


export default function ProfilePage() {
  const { auth, setAuth } = useAuth();
  const user = auth?.user;
  const navigate = useNavigate();

  const [activeView, setActiveView] = useState("profile");
  const [editData, setEditData] = useState(null);
  const [message, setMessage] = useState({ text: "", type: "" });

  const reloadProfile = async () => {
    try {
      const userData = await getProfileAPI();
      setAuth((prev) => ({
        ...prev,
        user: userData,
      }));
    } catch (err) {
      console.error("Reload profile failed", err);
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      const userData = await getProfileAPI();
      setAuth((prev) => ({ ...prev, user: userData }));
    };
    fetchProfile();
  }, [setAuth]);

  useEffect(() => {
    if (user) {
      setEditData({
        fullName: user.fullName || "",
        email: user.email || "",
        phone: user.phone || "",
        avatar: user.avatar || "",
      });

    }
  }, [user]);

  if (!editData) return null;

  return (
    <div className="flex gap-12">

      {/* Sidebar bên trái */}
      <ProfileSidebar
        activeView={activeView}
        setActiveView={setActiveView}
      />

      {/* Content bên phải */}
      <div className="flex w-full max-w-6xl gap-12">
        {/* MESSAGE */}
        {message.text && (
          <div
            className={`absolute top-6 right-6 z-50 p-4 rounded shadow ${message.type === "success"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
              }`}
          >
            {message.text}
          </div>
        )}


        {activeView === "profile" && (
          <>
            <ProfileForm
              editData={editData}
              setEditData={setEditData}
              setMessage={setMessage}
              reloadProfile={reloadProfile}
            />

            <AvatarBox
              avatar={editData.avatar}
              setEditData={setEditData}
            />
          </>
        )}

        {activeView === "password" && (
          <ChangePasswordForm setMessage={setMessage} />
        )}

      </div>
    </div>

  );
}
