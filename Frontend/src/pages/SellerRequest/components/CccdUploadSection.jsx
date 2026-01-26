import FieldError from "./FieldError";

export default function CccdUploadSection({
    cccdFront,
    cccdBack,
    frontPreview,
    backPreview,
    onPickFront,
    onPickBack,
    errors,
}) {
    return (
        <div>
            <h2 className="text-sm font-semibold text-slate-800 mb-2">Ảnh CCCD</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-xl border border-slate-200 p-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        CCCD mặt trước *
                    </label>
                    <input type="file" accept="image/*" onChange={ onPickFront } className="block w-full text-sm" />
                    <FieldError errors={ errors } name="cccdFront" />
                    { frontPreview ? (
                        <img
                            src={ frontPreview }
                            alt="cccd-front"
                            className="mt-3 w-full h-40 object-cover rounded-xl border border-slate-100"
                        />
                    ) : (
                        <p className="mt-3 text-xs text-slate-500">{ cccdFront ? "Đã chọn" : "Chưa chọn ảnh" }</p>
                    ) }
                </div>

                <div className="rounded-xl border border-slate-200 p-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        CCCD mặt sau *
                    </label>
                    <input type="file" accept="image/*" onChange={ onPickBack } className="block w-full text-sm" />
                    <FieldError errors={ errors } name="cccdBack" />
                    { backPreview ? (
                        <img
                            src={ backPreview }
                            alt="cccd-back"
                            className="mt-3 w-full h-40 object-cover rounded-xl border border-slate-100"
                        />
                    ) : (
                        <p className="mt-3 text-xs text-slate-500">{ cccdBack ? "Đã chọn" : "Chưa chọn ảnh" }</p>
                    ) }
                </div>
            </div>
        </div>
    );
}
