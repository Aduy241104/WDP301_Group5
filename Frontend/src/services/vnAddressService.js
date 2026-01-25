import axios from "axios";

const vnAddressClient = axios.create({
    baseURL: "https://provinces.open-api.vn/api",
    timeout: 15000,
});

// Provinces list: GET /?depth=1
export const getProvincesAPI = async () => {
    const res = await vnAddressClient.get("/?depth=1");
    return res.data; // [{ code, name, ... }]
};

// Districts of a province: GET /p/{code}?depth=2  => data.districts
export const getDistrictsByProvinceAPI = async (provinceCode) => {
    const res = await vnAddressClient.get(`/p/${provinceCode}?depth=2`);
    return res.data?.districts ?? []; // [{ code, name, ... }]
};

// Wards of a district: GET /d/{code}?depth=2 => data.wards
export const getWardsByDistrictAPI = async (districtCode) => {
    const res = await vnAddressClient.get(`/d/${districtCode}?depth=2`);
    return res.data?.wards ?? []; // [{ code, name, ... }]
};
