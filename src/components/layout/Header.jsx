/**
 * Header — Top bar with title and theme toggle.
 */
import { BoxIcon, SunIcon, MoonIcon, MonitorIcon } from '../icons/Icons';
import { motion } from 'framer-motion';
import { btnIconHover, btnIconTap } from '../../animations';

/* ── Theme Toggle sub-component ── */
const ThemeToggle = ({ mode, setTheme }) => {
  const options = [
    { key: 'light', icon: <SunIcon />, label: 'Light' },
    { key: 'system', icon: <MonitorIcon />, label: 'System' },
    { key: 'dark', icon: <MoonIcon />, label: 'Dark' },
  ];

  return (
    <div
      id="theme-toggle"
      className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1 gap-0.5 border border-slate-200 dark:border-slate-700"
      role="group"
      aria-label="Theme selection"
    >
      {options.map((o) => (
        <motion.button
          key={o.key}
          id={`theme-${o.key}`}
          onClick={() => setTheme(o.key)}
          title={o.label}
          aria-pressed={mode === o.key}
          whileHover={btnIconHover}
          whileTap={btnIconTap}
          className={`relative flex items-center justify-center w-8 h-7 rounded-lg text-xs font-medium transition-all duration-300 ease-out
            ${
              mode === o.key
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
        >
          {o.icon}
        </motion.button>
      ))}
    </div>
  );
};

/* ── Header component ── */
const Header = ({ mode, setTheme }) => (
  <motion.header
    className="mb-6 sm:mb-8"
    initial={{ opacity: 0, y: -32 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ type: 'spring', stiffness: 260, damping: 24, delay: 0.02 }}
  >
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <motion.div
          className="p-2 bg-indigo-100 dark:bg-indigo-900/60 rounded-xl border border-indigo-200 dark:border-indigo-700 flex-shrink-0"
          whileHover={{ rotate: 8, scale: 1.1 }}
          whileTap={{ scale: 0.92 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        >
          <BoxIcon />
        </motion.div>
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold shimmer-text tracking-tight truncate">
            CBM ALS
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-0.5 hidden sm:block">
            Shipping volume &amp; weight management dashboard
          </p>
        </div>
      </div>
      <ThemeToggle mode={mode} setTheme={setTheme} />
    </div>
  </motion.header>
);

export default Header;
