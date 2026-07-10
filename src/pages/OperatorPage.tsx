import { useState } from 'react'
import {
  Activity,
  AlertTriangle,
  Battery,
  Box,
  Command,
  MapPin,
  Moon,
  Power,
  RefreshCw,
  RotateCcw,
  Wifi,
  WifiOff,
  Zap,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { mockDevices } from '../data/mockData'
import { useDisplayData } from '../hooks/useDisplayData'
import { runDeviceAction, syncDevices } from '../lib/api'

const bulkActions = [
  { action: 'wake', label: 'WAKE', icon: Power },
  { action: 'sleep', label: 'SLEEP', icon: Moon },
  { action: 'reboot', label: 'REBOOT', icon: RotateCcw },
  { action: 'update', label: 'UPDATE', icon: RefreshCw },
]

export default function OperatorPage() {
  const { data: devices, isMock } = useDisplayData('operator/devices', mockDevices)
  const [pending, setPending] = useState('')
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const deviceIds = devices.map((device) => device.id)

  const mutate = async (key: string, operation: () => Promise<unknown>) => {
    setPending(key)
    setError('')
    setNotice('')
    try {
      await operation()
      setNotice('명령이 정상적으로 접수되었습니다.')
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : '명령 처리에 실패했습니다.')
    } finally {
      setPending('')
    }
  }

  const online = devices.filter((device) => device.status === 'online').length

  return <div className="min-h-screen bg-[#100d07] text-amber-50">
    <header className="border-b border-amber-300/15 bg-[#151006]/95 px-4 py-4">
      <div className="mx-auto flex max-w-[1500px] items-center">
        <Link to="/pro/operator" className="flex items-center gap-3 font-black"><span className="flex h-9 w-9 items-center justify-center rounded-lg border border-amber-300/30 bg-amber-400 text-black"><Command size={19} /></span>HOMINSU <span className="text-amber-400">PRO STUDIO</span></Link>
        <span className="ml-auto flex items-center gap-2 text-[10px] font-black tracking-[0.16em] text-emerald-400"><span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" /> CONTROL ONLINE</span>
      </div>
    </header>
    <main className="mx-auto max-w-[1500px] px-4 py-7 sm:px-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="text-xs font-black tracking-[0.2em] text-amber-400">FLEET CONTROL / SEOUL</p><h1 className="mt-2 text-3xl font-black sm:text-4xl">오퍼레이터 콘솔</h1><p className="mt-2 text-sm text-amber-100/45">공간별 VR 디바이스 상태와 배포를 제어합니다.{isMock && ' · 오프라인 프리뷰'}</p></div>
        <button disabled={Boolean(pending) || !deviceIds.length} onClick={() => mutate('sync', () => syncDevices(deviceIds))} className="flex items-center justify-center gap-2 rounded-xl bg-amber-400 px-5 py-3 text-xs font-black text-black disabled:opacity-50"><RefreshCw size={16} className={pending === 'sync' ? 'animate-spin' : ''} /> SYNC PLAY</button>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {bulkActions.map(({ action, label, icon: Icon }) => <button key={action} disabled={Boolean(pending) || !deviceIds.length} onClick={() => mutate(`bulk-${action}`, () => runDeviceAction(deviceIds, action))} className="flex items-center gap-2 rounded-lg border border-amber-300/15 bg-[#1a1409] px-4 py-2.5 text-[11px] font-black text-amber-200 hover:border-amber-400/50 disabled:opacity-50"><Icon size={14} className={pending === `bulk-${action}` ? 'animate-spin' : ''} />{label}</button>)}
      </div>

      {(error || notice) && <div role={error ? 'alert' : 'status'} className={`mt-5 rounded-xl border p-3 text-sm ${error ? 'border-red-400/25 bg-red-400/10 text-red-300' : 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300'}`}>{error || notice}</div>}

      <section className="mt-7 grid gap-3 sm:grid-cols-3">
        <Metric icon={Activity} value={`${online} / ${devices.length}`} label="온라인 디바이스" tone="text-emerald-400" />
        <Metric icon={Zap} value="98.4%" label="콘텐츠 동기화율" tone="text-amber-400" />
        <Metric icon={AlertTriangle} value={String(devices.length - online)} label="확인 필요" tone="text-orange-400" />
      </section>

      <section className="mt-8 overflow-hidden rounded-2xl border border-amber-300/10 bg-[#171108]">
        <div className="flex items-center border-b border-amber-300/10 px-5 py-4"><Box size={17} className="text-amber-400" /><h2 className="ml-2 text-sm font-black">DEVICE FLEET</h2><span className="ml-auto text-xs text-amber-100/35">{devices.length} units</span></div>
        <div className="grid gap-3 p-3 md:grid-cols-2 xl:grid-cols-3">
          {devices.map((device) => <article key={device.id} className="rounded-xl border border-amber-300/10 bg-[#1d160b] p-4">
            <div className="flex items-center gap-3"><span className={`flex h-10 w-10 items-center justify-center rounded-xl ${device.status === 'online' ? 'bg-emerald-400/10 text-emerald-400' : 'bg-red-400/10 text-red-400'}`}>{device.status === 'offline' ? <WifiOff size={18} /> : <Wifi size={18} />}</span><div><p className="text-sm font-black">{device.name}</p><p className="text-[10px] text-amber-100/35">{device.model || `ID ${device.id}`}</p></div><span className="ml-auto rounded-full bg-amber-400/10 px-2 py-1 text-[10px] font-black uppercase text-amber-400">{device.status}</span></div>
            <div className="mt-4 grid grid-cols-2 gap-2 text-[11px] text-amber-100/50"><p className="flex items-center gap-2"><Battery size={13} />{device.battery == null ? '--' : `${device.battery}%`}</p><p>FW {device.firmware || '--'}</p><p className="flex items-center gap-2"><MapPin size={13} />{device.location}</p><p>{device.ipAddress || 'IP --'}</p></div>
            <p className="mt-3 text-[10px] text-amber-100/25">마지막 접속 {device.lastSync}</p>
            <button disabled={Boolean(pending)} onClick={() => mutate(device.id, () => runDeviceAction([device.id], 'reboot'))} className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-amber-300/15 px-3 py-2 text-xs font-bold text-amber-200 hover:bg-amber-400 hover:text-black disabled:opacity-50"><RotateCcw size={14} className={pending === device.id ? 'animate-spin' : ''} /> 재시작</button>
          </article>)}
        </div>
      </section>
    </main>
  </div>
}

function Metric({ icon: Icon, value, label, tone }: { icon: typeof Activity; value: string; label: string; tone: string }) {
  return <div className="rounded-2xl border border-amber-300/10 bg-[#1a1409] p-5"><Icon className={tone} /><p className="mt-5 text-3xl font-black">{value}</p><p className="mt-1 text-xs font-bold text-amber-100/45">{label}</p></div>
}
