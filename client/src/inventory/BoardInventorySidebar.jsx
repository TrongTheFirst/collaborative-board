import { NavLink } from "react-router-dom";

const NAV_ITEMS = [
    { label: "Draw", to: "/" },
    { label: "My Boards", to: "/boards"},
    { label: "Trash", to: "/boards/trash"},
];

function navLinkClasses({ isActive }) {
    return [
        "flex items-center rounded-lg px-4 py-3 whitespace-nowrap transition-colors duration-200 border-l-4",
        isActive
            ? "bg-gray-100 text-gray-900 border-gray-400"
            : "text-gray-500 hover:bg-gray-50 hover:text-gray-900 border-transparent"
    ].join(" ");
}

function BoardInventorySidebar() {
    return (
        <aside className="w-full shrink-0 border-b border-gray-200 bg-white md:h-full md:w-48 md:border-b-0 md:border-r">
            <nav className="flex flex-row gap-1 overflow-x-auto p-3 md:flex-col md:overflow-visible md:p-4">
                {NAV_ITEMS.map((item) => (
                    <NavLink key={item.to} to={item.to} end className={navLinkClasses}>
                        {item.label}
                    </NavLink>
                ))}
            </nav>
        </aside>
    );
}
export default BoardInventorySidebar;