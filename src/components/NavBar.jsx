import { NavLink } from "react-router-dom";
 
const links = [
  { label: "Home", href: "/" },
  { label: "Schedule", href: "/schedule" },
  { label: "Player Search", href: "/playersearch" },
];
 
export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur border-b border-slate-700/60">
      <div className="max-w-7xl mx-auto px-4 flex items-center gap-6 h-12">
        <span className="font-display text-xl tracking-widest text-amber-400 mr-2">LP's Stats</span>
        {links.map(({ label, href }) => (
          <NavLink
            key={href}
            to={href}
            className={({ isActive }) =>
              `font-mono text-xs tracking-widest uppercase transition-colors
              ${isActive ? "text-amber-400 border-b border-amber-400 pb-0.5" : "text-slate-400 hover:text-slate-100"}`
            }
          >
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
