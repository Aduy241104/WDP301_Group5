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
      setError(e?.response?.data?.message || "Failed to load pickup addresses");
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

