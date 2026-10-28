import { NavLink } from "react-router-dom";
import { useCart } from "../cart/CartContext";

const links = [
  { to: "/", label: "Home", end: true },
  { to: "/catalog", label: "Devices" },
  { to: "/plans", label: "Rate Plans" },
  { to: "/subscribers", label: "Subscribers" },
  { to: "/orders", label: "Activation Orders" },
  { to: "/provisioning", label: "Provisioning" },
];

export default function Navigation() {
  const { cart } = useCart();
  const cartCount = cart?.lineCount ?? 0;

  return (
    <header className="bg-carrier-700 text-white">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <NavLink to="/" className="text-lg font-semibold">
          Wireless Activation Console
        </NavLink>
        <ul className="flex items-center gap-4 text-sm">
          {links.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  isActive ? "font-semibold underline" : "opacity-90 hover:opacity-100"
                }
              >
                {link.label}
              </NavLink>
            </li>
          ))}
          <li>
            <NavLink
              to="/add-a-line"
              aria-label="service cart"
              data-testid="cart-badge"
              className="relative inline-flex items-center rounded-full bg-carrier-500 px-3 py-1 hover:bg-carrier-600"
            >
              Cart
              <span className="ml-2 rounded-full bg-white px-2 text-carrier-700">
                {cartCount}
              </span>
            </NavLink>
          </li>
        </ul>
      </nav>
    </header>
  );
}
