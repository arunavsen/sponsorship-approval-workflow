import { NavLink } from 'react-router-dom';
import { navItemsFor } from '../../utils';

export default function Sidebar() {
  const navItems = navItemsFor();

  return (
    <aside className="sticky top-0 flex h-screen flex-col border-r border-surface-line bg-surface-low">
      <div className="px-6 pb-[22px] pt-7">
        <h1 className="mb-0.5 mt-3.5 text-[28px] font-extrabold tracking-normal text-primary">
          SponsorFlow
        </h1>
        <span className="text-sm text-muted">Enterprise Portal</span>
      </div>

      <nav className="grid gap-1 px-3">
        {navItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-md px-[14px] py-3 text-sm font-semibold no-underline ${
                isActive
                  ? 'bg-secondary-soft text-primary shadow-inset-accent'
                  : 'text-muted'
              }`
            }
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
