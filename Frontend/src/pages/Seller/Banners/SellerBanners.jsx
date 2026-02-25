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
    linkType: "external",
    position: "top",
    priority: 0,
    startAt: "",
    endAt: "",
  });

  useEffect(() => {
    loadBanners();
  }, []);

  const loadBanners = async () => {
    try {
      setLoading(true);
      const response = await getShopBannersAPI(formData.position);
      setBanners(response || []);
    } catch (error) {
      console.error(error);
      alert("Không thể tải danh sách banner");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.title ||
      !formData.imageUrl ||
      !formData.startAt ||
      !formData.endAt
    ) {
      return alert("Vui lòng nhập đầy đủ thông tin bắt buộc");
    }

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
      console.error(error);
      alert(error.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  const handleDelete = async (bannerId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa banner này?")) return;

    try {
      await deleteShopBannerAPI(bannerId);
      alert("Xóa banner thành công");
      loadBanners();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const result = await uploadSingleImageAPI({
        file,
        folder: "banners",
      });

      setFormData({ ...formData, imageUrl: result.url });
    } catch (error) {
      console.error(error);
      alert("Không thể tải ảnh lên");
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
      linkType: banner.linkType || "external",
      position: banner.position || "top",
      priority: banner.priority || 0,
      startAt: banner.startAt
        ? new Date(banner.startAt).toISOString().slice(0, 16)
        : "",
      endAt: banner.endAt
        ? new Date(banner.endAt).toISOString().slice(0, 16)
        : "",
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      imageUrl: "",
      linkUrl: "",
      linkType: "external",
      position: "top",
      priority: 0,
      startAt: "",
      endAt: "",
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
        <h1 className="text-2xl font-bold text-gray-900">
          Quản lý Banner Shop
        </h1>

        <button
          onClick={() => {
            resetForm();
            setEditingBanner(null);
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg"
        >
          <Plus size={18} />
          Thêm Banner
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingBanner ? "Chỉnh sửa Banner" : "Thêm Banner"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">

            <input
              type="text"
              placeholder="Tiêu đề"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-md"
            />

            <input
              type="url"
              placeholder="Link URL"
              value={formData.linkUrl}
              onChange={(e) =>
                setFormData({ ...formData, linkUrl: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-md"
            />

            <select
              value={formData.linkType}
              onChange={(e) =>
                setFormData({ ...formData, linkType: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="external">External</option>
              <option value="product">Product</option>
              <option value="shop">Shop</option>
              <option value="category">Category</option>
              <option value="search">Search</option>
            </select>

            <select
              value={formData.position}
              onChange={(e) =>
                setFormData({ ...formData, position: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="top">Top</option>
              <option value="slider">Slider</option>
              <option value="popup">Popup</option>
            </select>

            <input
              type="number"
              placeholder="Priority"
              value={formData.priority}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  priority: parseInt(e.target.value) || 0,
                })
              }
              className="w-full px-3 py-2 border rounded-md"
            />

            <input
              type="datetime-local"
              value={formData.startAt}
              onChange={(e) =>
                setFormData({ ...formData, startAt: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-md"
            />

            <input
              type="datetime-local"
              value={formData.endAt}
              onChange={(e) =>
                setFormData({ ...formData, endAt: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-md"
            />

            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <Upload size={18} />
                {uploading ? "Đang tải..." : "Upload ảnh"}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  hidden
                />
              </label>
            </div>

            {formData.imageUrl && (
              <img
                src={formData.imageUrl}
                alt="Preview"
                className="w-full h-40 object-cover rounded"
              />
            )}

            <div className="flex gap-2">
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg">
                {editingBanner ? "Cập nhật" : "Thêm"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                  setEditingBanner(null);
                }}
                className="px-4 py-2 bg-gray-200 rounded-lg"
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6">
        {banners.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <ImageIcon size={48} className="mx-auto mb-2 opacity-50" />
            <p>Chưa có banner nào</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {banners.map((banner) => (
              <div key={banner._id} className="border p-4 rounded-lg">
                <img
                  src={banner.imageUrl}
                  alt=""
                  className="w-full h-32 object-cover rounded"
                />

                <h3 className="font-medium mt-2">
                  {banner.title}
                </h3>

                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => handleEdit(banner)}
                    className="flex-1 bg-blue-100 text-blue-600 py-1 rounded"
                  >
                    <Edit size={16} />
                  </button>

                  <button
                    onClick={() => handleDelete(banner._id)}
                    className="flex-1 bg-red-100 text-red-600 py-1 rounded"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}