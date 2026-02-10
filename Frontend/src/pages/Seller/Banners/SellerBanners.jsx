import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Image as ImageIcon, Upload } from "lucide-react";
import {
  getShopBannersAPI,
  addShopBannerAPI,
  updateShopBannerAPI,
  deleteShopBannerAPI,
} from "../../../services/sellerShopBanner.service";
import { uploadSingleImageAPI } from "../../../services/uploadService";

export default function SellerBanners() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    imageUrl: "",
    linkUrl: "",
    position: "top",
    order: 0,
    startAt: "",
    endAt: "",
    isActive: true,
  });

  useEffect(() => {
    loadBanners();
  }, []);

  const loadBanners = async () => {
    try {
      setLoading(true);
      const response = await getShopBannersAPI();
      setBanners(response.banners || []);
    } catch (error) {
      console.error("Error loading banners:", error);
      alert("Không thể tải danh sách banner");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingBanner) {
        await updateShopBannerAPI(editingBanner._id, formData);
        alert("Cập nhật banner thành công");
      } else {
        await addShopBannerAPI(formData);
        alert("Thêm banner thành công");
      }
      setShowForm(false);
      setEditingBanner(null);
      resetForm();
      loadBanners();
    } catch (error) {
      console.error("Error saving banner:", error);
      alert(error.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  const handleDelete = async (bannerId) => {
    if (!confirm("Bạn có chắc chắn muốn xóa banner này?")) return;

    try {
      await deleteShopBannerAPI(bannerId);
      alert("Xóa banner thành công");
      loadBanners();
    } catch (error) {
      console.error("Error deleting banner:", error);
      alert(error.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const result = await uploadSingleImageAPI({ file, folder: "banners" });
      setFormData({ ...formData, imageUrl: result.url });
    } catch (error) {
      console.error("Error uploading image:", error);
      alert(error.response?.data?.message || "Không thể tải ảnh lên");
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title || "",
      imageUrl: banner.imageUrl || "",
      linkUrl: banner.linkUrl || "",
      position: banner.position || "top",
      order: banner.order || 0,
      startAt: banner.startAt ? new Date(banner.startAt).toISOString().slice(0, 16) : "",
      endAt: banner.endAt ? new Date(banner.endAt).toISOString().slice(0, 16) : "",
      isActive: banner.isActive !== undefined ? banner.isActive : true,
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      imageUrl: "",
      linkUrl: "",
      position: "top",
      order: 0,
      startAt: "",
      endAt: "",
      isActive: true,
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý Banner Shop</h1>
        <button
          onClick={() => {
            resetForm();
            setEditingBanner(null);
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          <Plus size={18} />
          Thêm Banner
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingBanner ? "Chỉnh sửa Banner" : "Thêm Banner Mới"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tiêu đề
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Nhập tiêu đề banner"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hình ảnh <span className="text-red-500">*</span>
              </label>
              <div className="space-y-3">
                {formData.imageUrl && (
                  <div>
                    <img
                      src={formData.imageUrl}
                      alt="Preview"
                      className="w-full max-w-md h-48 object-cover rounded-lg border border-gray-300"
                    />
                  </div>
                )}
                <div className="flex gap-2">
                  <label className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition">
                    <Upload size={18} />
                    <span className="text-sm font-medium text-gray-700">
                      {uploading ? "Đang tải lên..." : "Chọn file từ máy"}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploading}
                      className="hidden"
                    />
                  </label>
                </div>
                <div className="text-sm text-gray-500">
                  Hoặc nhập URL trực tiếp:
                </div>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL Liên kết
              </label>
              <input
                type="url"
                value={formData.linkUrl}
                onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="https://example.com"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vị trí
                </label>
                <select
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="top">Top</option>
                  <option value="slider">Slider</option>
                  <option value="popup">Popup</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Thứ tự
                </label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ngày bắt đầu
                </label>
                <input
                  type="datetime-local"
                  value={formData.startAt}
                  onChange={(e) => setFormData({ ...formData, startAt: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ngày kết thúc
                </label>
                <input
                  type="datetime-local"
                  value={formData.endAt}
                  onChange={(e) => setFormData({ ...formData, endAt: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                Kích hoạt
              </label>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                {editingBanner ? "Cập nhật" : "Thêm"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingBanner(null);
                  resetForm();
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Danh sách Banner</h2>
          {banners.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <ImageIcon size={48} className="mx-auto mb-2 opacity-50" />
              <p>Chưa có banner nào</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {banners.map((banner) => (
                <div
                  key={banner._id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                >
                  <div className="mb-3">
                    <img
                      src={banner.imageUrl}
                      alt={banner.title || "Banner"}
                      className="w-full h-32 object-cover rounded"
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/300x150?text=No+Image";
                      }}
                    />
                  </div>
                  <div className="space-y-1 mb-3">
                    <h3 className="font-medium text-gray-900">
                      {banner.title || "Không có tiêu đề"}
                    </h3>
                    <p className="text-sm text-gray-500">Vị trí: {banner.position}</p>
                    <p className="text-sm text-gray-500">Thứ tự: {banner.order}</p>
                    <p className="text-sm">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          banner.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {banner.isActive ? "Đang hoạt động" : "Tạm dừng"}
                      </span>
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(banner)}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                    >
                      <Edit size={16} />
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(banner._id)}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-red-50 text-red-600 rounded hover:bg-red-100"
                    >
                      <Trash2 size={16} />
                      Xóa
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
