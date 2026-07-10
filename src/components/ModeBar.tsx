import { NavLink } from 'react-router-dom'

const modes = [
  { to: '/', label: 'WATCH', active: 'bg-signal text-white' },
  { to: '/creator', label: 'VR STUDIO', active: 'bg-blue-500 text-white' },
  { to: '/pro/operator', label: 'OPERATOR', active: 'bg-amber-400 text-black' },
]

export default function ModeBar() {
  return (
    <nav aria-label="서비스 모드" className="scroll-row relative z-40 flex min-h-9 items-center justify-center gap-1 overflow-x-auto border-b border-white/5 bg-black px-3 py-1.5 text-[10px] font-extrabold tracking-[0.16em] text-mist-500">
      {modes.map((mode) => (
        <NavLink key={mode.to} to={mode.to} end={mode.to === '/'} className={({ isActive }) => `shrink-0 rounded-full px-3 py-1.5 transition-colors ${isActive ? mode.active : 'hover:bg-white/10 hover:text-white'}`}>
          {mode.label}
        </NavLink>
      ))}
    </nav>
  )
}
