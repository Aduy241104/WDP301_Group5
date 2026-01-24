import { useEffect, useMemo, useState } from "react";
import FieldError from "./FieldError";
import {
    getProvincesAPI,
    getDistrictsByProvinceAPI,
    getWardsByDistrictAPI,
} from "../../../services/vnAddressService";

export default function ShopAddressSection({ form, setField, errors }) {
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);

    const [provinceCode, setProvinceCode] = useState("");
    const [districtCode, setDistrictCode] = useState("");
    const [wardCode, setWardCode] = useState("");

    const [loadingProvince, setLoadingProvince] = useState(false);
    const [loadingDistrict, setLoadingDistrict] = useState(false);
    const [loadingWard, setLoadingWard] = useState(false);

    const provinceOptions = useMemo(
        () => provinces.map((p) => ({ code: String(p.code), name: p.name })),
        [provinces]
    );
    const districtOptions = useMemo(
        () => districts.map((d) => ({ code: String(d.code), name: d.name })),
        [districts]
    );
    const wardOptions = useMemo(
        () => wards.map((w) => ({ code: String(w.code), name: w.name })),
        [wards]
    );

    // 1) Load provinces once
    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                setLoadingProvince(true);
                const data = await getProvincesAPI();
                if (!mounted) return;
                setProvinces(Array.isArray(data) ? data : []);
            } catch {
                if (!mounted) return;
                setProvinces([]);
            } finally {
                if (mounted) setLoadingProvince(false);
            }
        })();
        return () => {
            mounted = false;
        };
    }, []);

    // 2) When province changes -> load districts
    useEffect(() => {
        let mounted = true;

        // reset dependent
        setDistricts([]);
        setWards([]);
        setDistrictCode("");
        setWardCode("");
        setField("district", "");
        setField("ward", "");

        if (!provinceCode) return;

        (async () => {
            try {
                setLoadingDistrict(true);
                const data = await getDistrictsByProvinceAPI(provinceCode);
                if (!mounted) return;
                setDistricts(Array.isArray(data) ? data : []);
            } catch {
                if (!mounted) return;
                setDistricts([]);
            } finally {
                if (mounted) setLoadingDistrict(false);
            }
        })();

        return () => {
            mounted = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [provinceCode]);

    // 3) When district changes -> load wards
    useEffect(() => {
        let mounted = true;

        // reset dependent
        setWards([]);
        setWardCode("");
        setField("ward", "");

        if (!districtCode) return;

        (async () => {
            try {
                setLoadingWard(true);
                const data = await getWardsByDistrictAPI(districtCode);
                if (!mounted) return;
                setWards(Array.isArray(data) ? data : []);
            } catch {
                if (!mounted) return;
                setWards([]);
            } finally {
                if (mounted) setLoadingWard(false);
            }
        })();

        return () => {
            mounted = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [districtCode]);

    const onSelectProvince = (e) => {
        const code = e.target.value;
        setProvinceCode(code);

        const found = provinceOptions.find((x) => x.code === code);
        setField("province", found?.name || "");
    };

    const onSelectDistrict = (e) => {
        const code = e.target.value;
        setDistrictCode(code);

        const found = districtOptions.find((x) => x.code === code);
        setField("district", found?.name || "");
    };

    const onSelectWard = (e) => {
        const code = e.target.value;
        setWardCode(code);

        const found = wardOptions.find((x) => x.code === code);
        setField("ward", found?.name || "");
    };

    return (
        <div>
            <h2 className="text-sm font-semibold text-slate-800 mb-2">Địa chỉ shop</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Province */ }
                <div>
                    <label className="text-sm font-medium text-slate-700">Tỉnh/Thành *</label>
                    <select
                        value={ provinceCode }
                        onChange={ onSelectProvince }
                        className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-200 bg-white"
                        disabled={ loadingProvince }
                    >
                        <option value="">{ loadingProvince ? "Đang tải..." : "Chọn Tỉnh/Thành" }</option>
                        { provinceOptions.map((p) => (
                            <option key={ p.code } value={ p.code }>
                                { p.name }
                            </option>
                        )) }
                    </select>
                    <FieldError errors={ errors } name="shopAddress.province" />
                </div>

                {/* District */ }
                <div>
                    <label className="text-sm font-medium text-slate-700">Quận/Huyện *</label>
                    <select
                        value={ districtCode }
                        onChange={ onSelectDistrict }
                        className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-200 bg-white"
                        disabled={ !provinceCode || loadingDistrict }
                    >
                        <option value="">
                            { !provinceCode ? "Chọn Tỉnh/Thành trước" : loadingDistrict ? "Đang tải..." : "Chọn Quận/Huyện" }
                        </option>
                        { districtOptions.map((d) => (
                            <option key={ d.code } value={ d.code }>
                                { d.name }
                            </option>
                        )) }
                    </select>
                    <FieldError errors={ errors } name="shopAddress.district" />
                </div>

                {/* Ward */ }
                <div>
                    <label className="text-sm font-medium text-slate-700">Phường/Xã *</label>
                    <select
                        value={ wardCode }
                        onChange={ onSelectWard }
                        className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-200 bg-white"
                        disabled={ !districtCode || loadingWard }
                    >
                        <option value="">
                            { !districtCode ? "Chọn Quận/Huyện trước" : loadingWard ? "Đang tải..." : "Chọn Phường/Xã" }
                        </option>
                        { wardOptions.map((w) => (
                            <option key={ w.code } value={ w.code }>
                                { w.name }
                            </option>
                        )) }
                    </select>
                    <FieldError errors={ errors } name="shopAddress.ward" />
                </div>

                {/* Street */ }
                <div>
                    <label className="text-sm font-medium text-slate-700">Số nhà/Đường *</label>
                    <input
                        value={ form.streetAddress }
                        onChange={ (e) => setField("streetAddress", e.target.value) }
                        className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-200"
                        placeholder="VD: 12 Nguyễn Huệ"
                    />
                    <FieldError errors={ errors } name="shopAddress.streetAddress" />
                </div>

                {/* Full address manual */ }
                <div className="sm:col-span-2">
                    <label className="text-sm font-medium text-slate-700">Địa chỉ đầy đủ *</label>
                    <input
                        value={ form.fullAddress }
                        onChange={ (e) => setField("fullAddress", e.target.value) }
                        className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-200"
                        placeholder="VD: 12 Nguyễn Huệ, Bến Nghé, Quận 1, TP.HCM"
                    />
                    <FieldError errors={ errors } name="shopAddress.fullAddress" />
                </div>
            </div>
        </div>
    );
}
