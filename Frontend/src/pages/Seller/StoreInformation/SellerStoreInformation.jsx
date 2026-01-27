import React, { useState, useEffect } from 'react';
import {
  getStoreInformationAPI,
  updateStoreInformationAPI,
} from '../../../services/sellerStoreInformation.service';

// Helper: Map API data to form data
const mapDataToForm = (data) => ({
  name: data?.name || '',
  description: data?.description || '',
  avatar: data?.avatar || '',
  shopAddress: {
    province: data?.shopAddress?.province || '',
    district: data?.shopAddress?.district || '',
    ward: data?.shopAddress?.ward || '',
    streetAddress: data?.shopAddress?.streetAddress || '',
    fullAddress: data?.shopAddress?.fullAddress || '',
  },
});

// Helper: Status badge component
const StatusBadge = ({ status }) => {
  const config = {
    pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Đang chờ duyệt' },
    approved: { bg: 'bg-green-100', text: 'text-green-800', label: 'Đã duyệt' },
    blocked: { bg: 'bg-red-100', text: 'text-red-800', label: 'Bị khóa' },
  }[status] || { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Không xác định' };
  
  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
};

// Helper: Info field component
const InfoField = ({ label, value, children }) => (
  <div className="py-3 border-b border-gray-100 last:border-0">
    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
      {label}
    </label>
    {children || <p className="text-gray-900 font-medium">{value || '—'}</p>}
  </div>
);

// Helper: Form input component
const FormInput = ({ label, name, value, onChange, required, type = 'text', placeholder, className = '' }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      placeholder={placeholder}
      className={`w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition ${className}`}
    />
  </div>
);

export default function SellerStoreInformation() {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [originalData, setOriginalData] = useState(null);
  const [formData, setFormData] = useState(mapDataToForm(null));

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
      setFormData(mapDataToForm(data));
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Không thể tải thông tin cửa hàng';
      setError(errorMessage);
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
      shopAddress: { ...prev.shopAddress, [name]: value },
    }));
  };

  useEffect(() => {
    const { streetAddress, ward, district, province } = formData.shopAddress;
    const parts = [streetAddress, ward, district, province].filter(Boolean);
    const fullAddress = parts.join(', ');
    if (fullAddress && fullAddress !== formData.shopAddress.fullAddress) {
      setFormData((prev) => ({
        ...prev,
        shopAddress: { ...prev.shopAddress, fullAddress },
      }));
    }
  }, [formData.shopAddress.streetAddress, formData.shopAddress.ward, formData.shopAddress.district, formData.shopAddress.province]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      setSuccessMessage('');
      await updateStoreInformationAPI(formData);
      setSuccessMessage('Cập nhật thông tin cửa hàng thành công!');
      setIsEditing(false);
      await fetchStoreInfo();
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể cập nhật thông tin cửa hàng');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (originalData) setFormData(mapDataToForm(originalData));
    setIsEditing(false);
    setError(null);
  };

  const addressFields = [
    { name: 'province', label: 'Tỉnh/Thành phố' },
    { name: 'district', label: 'Quận/Huyện' },
    { name: 'ward', label: 'Phường/Xã' },
    { name: 'streetAddress', label: 'Số nhà, đường', placeholder: 'Số 123, Đường ABC' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  if (error && (error.includes('chờ duyệt') || error.includes('pending'))) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-4">
            <h2 className="text-2xl font-bold text-white">Thông tin cửa hàng</h2>
          </div>
          <div className="p-8">
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-r-lg">
              <div className="flex items-start gap-4">
                <svg className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <h3 className="text-lg font-semibold text-yellow-800 mb-2">Cửa hàng đang chờ duyệt</h3>
                  <p className="text-yellow-700 mb-3">{error}</p>
                  <p className="text-sm text-yellow-600">
                    Vui lòng đợi quản trị viên phê duyệt cửa hàng của bạn. Sau khi được duyệt, bạn sẽ có thể xem và chỉnh sửa thông tin cửa hàng.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-5 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Thông tin cửa hàng</h2>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Chỉnh sửa
            </button>
          )}
        </div>

        <div className="p-6">
          {/* Alert Messages */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 text-red-700 rounded-r-lg">
              {error}
            </div>
          )}
          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-400 text-green-700 rounded-r-lg">
              {successMessage}
            </div>
          )}

          {/* View Mode */}
          {!isEditing ? (
            <div className="space-y-1">
              {originalData?.avatar && (
                <div className="mb-6 pb-6 border-b border-gray-200">
                  <img
                    src={originalData.avatar}
                    alt="Store avatar"
                    className="w-32 h-32 rounded-xl object-cover border-2 border-gray-200 shadow-sm"
                    onError={(e) => (e.target.style.display = 'none')}
                  />
                </div>
              )}
              <InfoField label="Tên cửa hàng" value={originalData?.name} />
              {originalData?.description && (
                <InfoField label="Mô tả">
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{originalData.description}</p>
                </InfoField>
              )}
              {originalData?.shopAddress?.fullAddress && (
                <InfoField label="Địa chỉ cửa hàng" value={originalData.shopAddress.fullAddress} />
              )}
              {originalData?.status && (
                <InfoField label="Trạng thái">
                  <StatusBadge status={originalData.status} />
                </InfoField>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <FormInput
                label="URL Ảnh đại diện"
                name="avatar"
                type="url"
                value={formData.avatar}
                onChange={handleChange}
                placeholder="https://example.com/avatar.jpg"
              />
              {formData.avatar && (
                <img
                  src={formData.avatar}
                  alt="Preview"
                  className="w-24 h-24 rounded-lg object-cover border-2 border-gray-200 shadow-sm"
                  onError={(e) => (e.target.style.display = 'none')}
                />
              )}

              <FormInput
                label="Tên cửa hàng"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả cửa hàng</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Giới thiệu về cửa hàng của bạn..."
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                />
              </div>

              <div className="border-t pt-6 space-y-4">
                <h4 className="text-lg font-semibold text-gray-800">Địa chỉ cửa hàng</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {addressFields.map((field) => (
                    <FormInput
                      key={field.name}
                      label={field.label}
                      name={field.name}
                      value={formData.shopAddress[field.name]}
                      onChange={handleAddressChange}
                      required
                      placeholder={field.placeholder}
                    />
                  ))}
                </div>
                <div className="mt-4 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                  <span className="text-sm font-medium text-indigo-700">Địa chỉ đầy đủ: </span>
                  <span className="text-sm text-indigo-900 font-medium">
                    {formData.shopAddress.fullAddress || 'Chưa có địa chỉ'}
                  </span>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 px-4 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
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
      </div>
    </div>
  );
}
