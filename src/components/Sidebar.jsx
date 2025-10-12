import { Link } from "react-router-dom";
import { Menu, ChevronDown, ChevronUp, MapPin } from "lucide-react";
import {
  LayoutDashboard,
  Monitor,
  Users,
  CreditCard,
  Ticket,
  Package,
  Database,
  LifeBuoy,
  Settings,
  Mail,
  Puzzle,
  BookOpen,
  ShoppingCart,
  TrendingUp,
  Handshake,
  Wallet,
  Scale,
  UserRound,
  FileText,
  Factory,
  SlidersHorizontal,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import logo from "@/assets/logo.png";


const menuItems = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/" },
  {
    name: "Product",
    icon: Package,
    children: [
      { name: "Products", path: "/product" },
      { name: "Category", path: "/category" },
      { name: "Brand", path: "/brand" },
      { name: "Attribute", path: "/attribute" },
      {name:"Barcode", path:"/barcode" },
      
    ],
  },
  {
    name: "Purchase",
    icon: ShoppingCart,
    children: [
      { name: "List", path: "/purchase/list" },
      { name: "Add", path: "/purchase/add" },
    ],
  },
    {
    name: "Locations",
    icon: MapPin, // 👈 هنضيف الأيقونة تحت
    children: [
      { name: "City", path: "/city" },
      { name: "Country", path: "/country" },
    ],
  },
  {
    name: "Sale",
    icon: TrendingUp,
    children: [
      { name: "List", path: "/sale/list" },
      { name: "Add", path: "/sale/add" },
    ],
  },
  {
    name: "Expense",
    icon: Wallet,
    children: [
      { name: "List", path: "/expense/list" },
      { name: "Add", path: "/expense/add" },
    ],
  },
  {
    name: "Income",
    icon: Handshake,
    children: [
      { name: "List", path: "/income/list" },
      { name: "Add", path: "/income/add" },
    ],
  },
  {
    name: "Quotation",
    icon: FileText,
    children: [
      { name: "List", path: "/quotation/list" },
      { name: "Add", path: "/quotation/add" },
    ],
  },
  { name: "Transfer", icon: Puzzle, path: "/transfer" },
  { name: "Return", icon: Scale, path: "/return" },
  {
    name: "Accounting",
    icon: BookOpen,
    children: [
      { name: "List", path: "/accounting/" },
    ],
  },
  {
    name: "HRM",
    icon: UserRound,
    children: [
      { name: "List", path: "/hrm/list" },
      { name: "Add", path: "/hrm/add" },
    ],
  },
  {
    name: "People",
    icon: Users,
    children: [
      { name: "Admin", path: "/admin" },
      { name: "Add", path: "/people/add" },
    ],
  },
  {
    name: "Reports",
    icon: FileText,
    children: [
      { name: "List", path: "/reports/list" },
      { name: "Add", path: "/reports/add" },
    ],
  },
  { name: "Addons", icon: Puzzle, path: "/addons" },
  {
    name: "Manufacturing",
    icon: Factory,
    children: [
      { name: "List", path: "/manufacturing/list" },
      { name: "WareHouse", path: "/warehouse" },

    ],
  },
  {
    name: "Settings",
    icon: SlidersHorizontal,
    children: [
      { name: "List", path: "/settings/list" },
      { name: "Add", path: "/settings/add" },
    ],
  },
];

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);

  const toggleDropdown = (name) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  const renderMenuItems = (items) => {
    return items.map((item, index) => {
      if (item.children) {
        return (
          <li key={index}>
            <div
              onClick={() => toggleDropdown(item.name)}
              className="flex items-center justify-between p-3 mx-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!desktopCollapsed && (
                  <span className="truncate">{item.name}</span>
                )}
              </div>
              {!desktopCollapsed &&
                (openDropdown === item.name ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                ))}
            </div>
            {!desktopCollapsed && openDropdown === item.name && (
              <ul className="pl-8">
                {item.children.map((child, childIndex) => (
                  <li key={childIndex}>
                    <Link
                      to={child.path}
                      className="flex items-center p-2 rounded-lg hover:bg-gray-100 transition-colors text-sm"
                      onClick={() => setMobileOpen(false)}
                    >
                      {child.name}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </li>
        );
      } else {
        return (
          <li key={index}>
            <Link
              to={item.path}
              className={`flex items-center gap-3 p-3 mx-2 rounded-lg hover:bg-gray-100 transition-colors ${
                desktopCollapsed ? "justify-center" : ""
              }`}
              title={desktopCollapsed ? item.name : ""}
              onClick={() => setMobileOpen(false)}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!desktopCollapsed && (
                <span className="truncate">{item.name}</span>
              )}
            </Link>
          </li>
        );
      }
    });
  };

  return (
    <>
      {/* ✅ Mobile toggle */}
      <div className="md:hidden p-2 border-b">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <button className="p-2">
              <Menu className="w-6 h-6" />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            <nav className="h-full bg-white border-r">
              <img src={logo} alt="logo" className="p-10" />
              <ul>{renderMenuItems(menuItems)}</ul>
            </nav>
          </SheetContent>
        </Sheet>
      </div>

      {/* ✅ Desktop sidebar with toggle */}
      <aside
        className={`hidden md:block h-screen bg-white border-r transition-all duration-300 ${
          desktopCollapsed ? "w-16" : "w-64"
        }`}
      >
        <div
          className={`flex items-center p-6 border-b ${
            desktopCollapsed ? "justify-center" : "justify-start"
          }`}
        >
          {desktopCollapsed ? (
            <button
              onClick={() => setDesktopCollapsed(!desktopCollapsed)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
          ) : (
            <img
              src={logo}
              alt="logo"
              className="h-8 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => setDesktopCollapsed(!desktopCollapsed)}
            />
          )}
        </div>
        <ul className="pt-4">{renderMenuItems(menuItems)}</ul>
      </aside>
    </>
  );
}
