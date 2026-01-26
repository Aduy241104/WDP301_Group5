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
      const res = await getProfileAPI();
      const userData = res.data ?? res;

      const normalizedUser = {
        ...userData,

        //  CHUẨN HÓA GENDER
        gender: userData.gender
          ? userData.gender.toLowerCase()
          : "",

        // CHUẨN HÓA DATE (YYYY-MM-DD)
        dateOfBirth: userData.dateOfBirth
          ? userData.dateOfBirth.slice(0, 10)
          : "",
      };

      setAuth((prev) => ({
        ...prev,
        user: normalizedUser,
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
        gender: user.gender || "",
        dateOfBirth: user.dateOfBirth
          ? user.dateOfBirth.slice(0, 10)
          : "",

      });

    }
  }, [user]);

  if (!editData) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex gap-12 px-6 py-8">

        {/* Sidebar bên trái */ }
        <ProfileSidebar
          activeView={ activeView }
          setActiveView={ setActiveView }
        />

        {/* Content bên phải */ }
        <div className="relative flex w-full max-w-6xl gap-12">

          {/* MESSAGE */ }
          { message.text && (
            <div
              className={ `absolute top-6 right-6 z-50 rounded-xl px-4 py-3 shadow-lg
                    ${message.type === "success"
                  ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                  : "bg-rose-100 text-rose-700 border border-rose-200"
                }` }
            >
              { message.text }
            </div>
          ) }

          { activeView === "profile" && (
            <>
              <ProfileForm
                editData={ editData }
                setEditData={ setEditData }
                setMessage={ setMessage }
                reloadProfile={ reloadProfile }
              />

              <AvatarBox
                avatar={ editData.avatar }
                setEditData={ setEditData }
              />
            </>
          ) }

          { activeView === "password" && (
            <ChangePasswordForm setMessage={ setMessage } />
          ) }
        </div>
      </div>
    </div>
  );
}
