import React, { useState, useEffect } from 'react';
import {
  getStoreInformationAPI,
  updateStoreInformationAPI,
} from '../../../services/sellerStoreInformation.service';

export default function SellerStoreInformation() {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Original data from API
  const [originalData, setOriginalData] = useState(null);

  // Form data for editing
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    avatar: '',
    shopAddress: {
      province: '',
      district: '',
      ward: '',
      streetAddress: '',
      fullAddress: '',
    },
  });

  // Fetch store information on mount
  useEffect(() => {
    fetchStoreInfo();
  }, []);

  const fetchStoreInfo = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getStoreInformationAPI();
      const data = response.data;
      setOriginalData(data);
      setFormData({
        name: data.name || '',
        description: data.description || '',
        avatar: data.avatar || '',
        shopAddress: {
          province: data.shopAddress?.province || '',
          district: data.shopAddress?.district || '',
          ward: data.shopAddress?.ward || '',
          streetAddress: data.shopAddress?.streetAddress || '',
          fullAddress: data.shopAddress?.fullAddress || '',
        },
      });
    } catch (err) {
      console.error('Error fetching store info:', err);
      setError(err.response?.data?.message || 'Không thể tải thông tin cửa hàng');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      shopAddress: {
        ...prev.shopAddress,
        [name]: value,
      },
    }));
  };

  // Auto generate full address when address fields change
  useEffect(() => {
    const { streetAddress, ward, district, province } = formData.shopAddress;
    const parts = [streetAddress, ward, district, province].filter(Boolean);
    const fullAddress = parts.join(', ');
    if (fullAddress !== formData.shopAddress.fullAddress) {
      setFormData((prev) => ({
        ...prev,
        shopAddress: {
          ...prev.shopAddress,
          fullAddress,
        },
      }));
    }
  }, [
    formData.shopAddress.streetAddress,
    formData.shopAddress.ward,
    formData.shopAddress.district,
    formData.shopAddress.province,
  ]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      setSuccessMessage('');

      const payload = {
        name: formData.name,
        description: formData.description,
        avatar: formData.avatar,
        shopAddress: formData.shopAddress,
      };

      await updateStoreInformationAPI(payload);
      setSuccessMessage('Cập nhật thông tin cửa hàng thành công!');
      setIsEditing(false);
      // Refresh data
      await fetchStoreInfo();
    } catch (err) {
      console.error('Error updating store info:', err);
      setError(err.response?.data?.message || 'Không thể cập nhật thông tin cửa hàng');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset form to original data
    if (originalData) {
      setFormData({
        name: originalData.name || '',
        description: originalData.description || '',
        avatar: originalData.avatar || '',
        shopAddress: {
          province: originalData.shopAddress?.province || '',
          district: originalData.shopAddress?.district || '',
          ward: originalData.shopAddress?.ward || '',
          streetAddress: originalData.shopAddress?.streetAddress || '',
          fullAddress: originalData.shopAddress?.fullAddress || '',
        },
      });
    }
    setIsEditing(false);
    setError(null);
  };

  const getStatusBadge = (status) => {
    // Status từ Backend: pending, approved, blocked
    const statusConfig = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Đang chờ duyệt' },
      approved: { bg: 'bg-green-100', text: 'text-green-800', label: 'Đã duyệt' },
      blocked: { bg: 'bg-red-100', text: 'text-red-800', label: 'Bị khóa' },
    };
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
          <span className="ml-3 text-gray-600">Đang tải thông tin...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Thông tin cửa hàng</h2>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
            Chỉnh sửa
          </button>
        )}
      </div>

      {/* Alert Messages */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}
      {successMessage && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
          {successMessage}
        </div>
      )}

      {/* View Mode */}
      {!isEditing ? (
        <div className="space-y-6">
          {/* Avatar & Basic Info */}
          <div className="flex items-start gap-6 pb-6 border-b">
            <div className="flex-shrink-0">
              {originalData?.avatar ? (
                <img
                  src={originalData.avatar}
                  alt="Store Avatar"
                  className="w-24 h-24 rounded-lg object-cover border"
                />
              ) : (
                <div className="w-24 h-24 rounded-lg bg-gray-100 flex items-center justify-center border">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-xl font-semibold text-gray-900">
                  {originalData?.name || 'Chưa có tên cửa hàng'}
                </h3>
                {getStatusBadge(originalData?.status)}
              </div>
              <p className="text-gray-600">
                {originalData?.description || 'Chưa có mô tả cửa hàng'}
              </p>
            </div>
          </div>

          {/* Address */}
          <div className="pb-6 border-b">
            <h4 className="text-lg font-medium text-gray-800 mb-3">Địa chỉ cửa hàng</h4>
            {originalData?.shopAddress?.fullAddress ? (
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">{originalData.shopAddress.fullAddress}</p>
                <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-500">
                  <div>
                    <span className="font-medium">Tỉnh/Thành:</span> {originalData.shopAddress.province}
                  </div>
                  <div>
                    <span className="font-medium">Quận/Huyện:</span> {originalData.shopAddress.district}
                  </div>
                  <div>
                    <span className="font-medium">Phường/Xã:</span> {originalData.shopAddress.ward}
                  </div>
                  <div>
                    <span className="font-medium">Địa chỉ:</span> {originalData.shopAddress.streetAddress}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 italic">Chưa có địa chỉ</p>
            )}
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
            <div>
              <span className="font-medium">Ngày tạo:</span>{' '}
              {originalData?.createdAt
                ? new Date(originalData.createdAt).toLocaleDateString('vi-VN')
                : 'N/A'}
            </div>
            <div>
              <span className="font-medium">Cập nhật lần cuối:</span>{' '}
              {originalData?.updatedAt
                ? new Date(originalData.updatedAt).toLocaleDateString('vi-VN')
                : 'N/A'}
            </div>
          </div>
        </div>
      ) : (
        /* Edit Mode */
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL Ảnh đại diện
            </label>
            <input
              type="url"
              name="avatar"
              value={formData.avatar}
              onChange={handleChange}
              placeholder="https://example.com/avatar.jpg"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            {formData.avatar && (
              <img
                src={formData.avatar}
                alt="Preview"
                className="mt-2 w-20 h-20 rounded-lg object-cover border"
                onError={(e) => (e.target.style.display = 'none')}
              />
            )}
          </div>

          {/* Store Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tên cửa hàng <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mô tả cửa hàng
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              placeholder="Giới thiệu về cửa hàng của bạn..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Address Section */}
          <div className="border-t pt-6">
            <h4 className="text-lg font-medium text-gray-800 mb-4">Địa chỉ cửa hàng</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tỉnh/Thành phố <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="province"
                  value={formData.shopAddress.province}
                  onChange={handleAddressChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quận/Huyện <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="district"
                  value={formData.shopAddress.district}
                  onChange={handleAddressChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phường/Xã <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="ward"
                  value={formData.shopAddress.ward}
                  onChange={handleAddressChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số nhà, đường <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="streetAddress"
                  value={formData.shopAddress.streetAddress}
                  onChange={handleAddressChange}
                  required
                  placeholder="Số 123, Đường ABC"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
            {/* Full Address Preview */}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-600">Địa chỉ đầy đủ: </span>
              <span className="text-sm text-gray-800">
                {formData.shopAddress.fullAddress || 'Chưa có địa chỉ'}
              </span>
            </div>
          </div>

          {/* Note about status */}
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-700">
              <strong>Lưu ý:</strong> Sau khi cập nhật thông tin, trạng thái cửa hàng sẽ chuyển sang "Đang chờ duyệt" để quản trị viên xem xét.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Đang lưu...
                </span>
              ) : (
                'Lưu thay đổi'
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
