import { useEffect, useMemo, useState } from "react";
import {
  addPickupAddressAPI,
  deletePickupAddressAPI,
  getPickupAddressDetailAPI,
  getPickupAddressListAPI,
  setDefaultPickupAddressAPI,
  updatePickupAddressAPI,
} from "../../../services/sellerManageShop.service";
import AddressDetailModal from "./AddressDetailModal";
import AddressFormModal from "./AddressFormModal";
import AddressList from "./AddressList";

const emptyForm = {
  province: "",
  district: "",
  ward: "",
  streetAddress: "",
  fullAddress: "",
  isDefault: false,
};

function normalizeListPayload(data) {
  // BE returns: { message, pickupAddresses }
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.pickupAddresses)) return data.pickupAddresses;
  return [];
}

export default function SellerManageStore() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [addresses, setAddresses] = useState([]);

  const [openForm, setOpenForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [detailData, setDetailData] = useState(null);

  const defaultId = useMemo(
    () => addresses.find((a) => a.isDefault)?._id,
    [addresses]
  );

  const fetchAddresses = async () => {
    setError("");
    setLoading(true);
    try {
      const data = await getPickupAddressListAPI();
      setAddresses(normalizeListPayload(data));
    } catch (e) {
      console.error(e);
      const errorMessage = e?.response?.data?.message || "Failed to load pickup addresses";
      const shopStatus = e?.response?.data?.shopStatus;
      
      // Nếu shop đang ở trạng thái pending, hiển thị thông báo đặc biệt
      if (shopStatus === 'pending' || e?.response?.status === 403) {
        setError(errorMessage);
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const startCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormError("");
    setError("");
    setOpenForm(true);
  };

  const startEdit = (addr) => {
    setEditingId(addr._id);
    setForm({
      province: addr.province || "",
      district: addr.district || "",
      ward: addr.ward || "",
      streetAddress: addr.streetAddress || "",
      fullAddress: addr.fullAddress || "",
      isDefault: !!addr.isDefault,
    });
    setFormError("");
    setError("");
    setOpenForm(true);
  };

  const handleFormChange = (updates) => {
    setForm((prev) => ({ ...prev, ...updates }));
  };

  const closeForm = () => {
    if (submitting) return;
    setOpenForm(false);
    setEditingId(null);
    setForm(emptyForm);
    setFormError("");
  };

  const openDetail = async (addrId) => {
    setDetailOpen(true);
    setDetailLoading(true);
    setDetailError("");
    setDetailData(null);
    try {
      const res = await getPickupAddressDetailAPI(addrId);
      // BE: { message, pickupAddress }
      setDetailData(res?.pickupAddress || res || null);
    } catch (e) {
      console.error(e);
      setDetailError(
        e?.response?.data?.message || "Không lấy được thông tin chi tiết address"
      );
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetail = () => {
    if (detailLoading) return;
    setDetailOpen(false);
    setDetailData(null);
    setDetailError("");
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError("");
    try {
      const payload = {
        province: form.province?.trim(),
        district: form.district?.trim(),
        ward: form.ward?.trim(),
        streetAddress: form.streetAddress?.trim(),
        fullAddress: form.fullAddress?.trim(),
        isDefault: !!form.isDefault,
      };

      if (
        !payload.province ||
        !payload.district ||
        !payload.ward ||
        !payload.streetAddress ||
        !payload.fullAddress
      ) {
        setFormError(
          "Vui lòng nhập đầy đủ: province, district, ward, streetAddress, fullAddress"
        );
        return;
      }

      if (editingId) {
        await updatePickupAddressAPI(editingId, payload);
      } else {
        await addPickupAddressAPI(payload);
      }

      await fetchAddresses();
      closeForm();
    } catch (e2) {
      console.error(e2);
      setFormError(e2?.response?.data?.message || "Save failed");
    } finally {
      setSubmitting(false);
    }
  };

  const onDelete = async (addr) => {
    if (submitting) return;
    if (addr.isDefault) return;

    const ok = window.confirm("Xoá pickup address này?");
    if (!ok) return;

    setSubmitting(true);
    setError("");
    try {
      await deletePickupAddressAPI(addr._id);
      await fetchAddresses();
    } catch (e) {
      console.error(e);
      setError(e?.response?.data?.message || "Delete failed");
    } finally {
      setSubmitting(false);
    }
  };

  const onSetDefault = async (addr) => {
    if (submitting) return;
    if (addr.isDefault) return;

    setSubmitting(true);
    setError("");
    try {
      await setDefaultPickupAddressAPI(addr._id);
      await fetchAddresses();
    } catch (e) {
      console.error(e);
      setError(e?.response?.data?.message || "Set default failed");
    } finally {
      setSubmitting(false);
    }
  };

  // Nếu có lỗi và shop đang ở trạng thái pending, hiển thị thông báo đặc biệt
  if (error && (error.includes('chờ duyệt') || error.includes('pending')) && !loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold">Manage Store</h2>
          <p className="text-sm text-slate-500">
            Quản lý pickup address (lấy hàng) của shop
          </p>
        </div>
        <div className="p-6 bg-yellow-50 border-2 border-yellow-300 rounded-lg">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                Cửa hàng đang chờ duyệt
              </h3>
              <p className="text-yellow-700 mb-2">
                {error}
              </p>
              <p className="text-sm text-yellow-600">
                Vui lòng đợi quản trị viên phê duyệt cửa hàng của bạn. Sau khi được duyệt, bạn sẽ có thể quản lý pickup address.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold">Manage Store</h2>
          <p className="text-sm text-slate-500">
            Quản lý pickup address (lấy hàng) của shop
          </p>
        </div>

        <button
          onClick={startCreate}
          className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition"
        >
          + Add pickup address
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4">
          {error}
        </div>
      )}

      <AddressList
        addresses={addresses}
        loading={loading}
        submitting={submitting}
        defaultId={defaultId}
        onViewDetail={openDetail}
        onEdit={startEdit}
        onSetDefault={onSetDefault}
        onDelete={onDelete}
      />

      <AddressFormModal
        open={openForm}
        editingId={editingId}
        form={form}
        submitting={submitting}
        error={formError}
        onClose={closeForm}
        onSubmit={onSubmit}
        onFormChange={handleFormChange}
      />

      <AddressDetailModal
        open={detailOpen}
        loading={detailLoading}
        error={detailError}
        data={detailData}
        onClose={closeDetail}
      />
    </div>
  );
}

