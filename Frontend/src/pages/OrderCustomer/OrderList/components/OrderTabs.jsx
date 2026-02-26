import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faClock,
    faCircleCheck,
    faTruck,
    faBox,
    faXmark,
} from "@fortawesome/free-solid-svg-icons";

const TABS = [
    { label: "Chờ xác nhận", value: "created", icon: faClock },
    { label: "Đã xác nhận", value: "confirmed", icon: faCircleCheck },
    { label: "Đang vận chuyển", value: "shipped", icon: faTruck },
    { label: "Đã giao hàng", value: "delivered", icon: faBox },
    { label: "Đã hủy", value: "cancelled", icon: faXmark },
];

export default function OrderTabs({ value, onChange }) {
    return (
        <div className="flex flex-wrap gap-2">
            { TABS.map((t) => {
                const active = value === t.value;

                return (
                    <button
                        key={ t.value }
                        onClick={ () => onChange(t.value) }
                        className={ [
                            "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition",
                            active
                                ? "bg-slate-900 text-white"
                                : "bg-slate-100 text-slate-700 hover:bg-slate-200",
                        ].join(" ") }
                    >
                        <FontAwesomeIcon
                            icon={ t.icon }
                            className={ `text-[14px] ${active ? "text-white" : "text-slate-500"
                                }` }
                        />
                        <span>{ t.label }</span>
                    </button>

                );
            }) }
        </div>
    );
}
