import FieldError from "./FieldError";

export default function ShopInfoSection({ form, setField, errors }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
                <label className="text-sm font-medium text-slate-700">Tên shop *</label>
                <input
                    value={ form.shopName }
                    onChange={ (e) => setField("shopName", e.target.value) }
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-200"
                />
                <FieldError errors={ errors } name="shopName" />
            </div>

            <div>
                <label className="text-sm font-medium text-slate-700">SĐT liên hệ *</label>
                <input
                    value={ form.contactPhone }
                    onChange={ (e) => setField("contactPhone", e.target.value) }
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-200"
                />
                <FieldError errors={ errors } name="contactPhone" />
            </div>

            <div className="sm:col-span-2">
                <label className="text-sm font-medium text-slate-700">Mô tả</label>
                <textarea
                    value={ form.description }
                    onChange={ (e) => setField("description", e.target.value) }
                    rows={ 3 }
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-200"
                />
            </div>

            <div>
                <label className="text-sm font-medium text-slate-700">Mã số thuế (nếu có)</label>
                <input
                    value={ form.taxCode }
                    onChange={ (e) => setField("taxCode", e.target.value) }
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-200"
                />
            </div>
        </div>
    );
}
