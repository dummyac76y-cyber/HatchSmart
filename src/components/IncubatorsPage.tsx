import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Activity, CalendarDays, Check, CirclePlus, Egg, Pencil, Thermometer, Trash2, Wifi, WifiOff, X } from 'lucide-react';

type Incubator = {
  id: string;
  name: string;
  deviceId: string;
  species: string;
  eggCount: number;
  startDate: string;
  notes: string;
};

const STORAGE_KEY = 'hatchsmart-incubator-registry-v1';
const speciesOptions = [
  { value: 'chicken', label: 'Chicken', days: 21 },
  { value: 'duck', label: 'Duck', days: 28 },
  { value: 'quail', label: 'Quail', days: 17 },
  { value: 'turkey', label: 'Turkey', days: 28 },
  { value: 'goose', label: 'Goose', days: 30 },
];

function loadIncubators(): Incubator[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch { /* Use a clean local registry if browser storage is unavailable. */ }
  return [
    { id: 'incubator-01', name: 'Incubator 01', deviceId: 'ESP32-INCUBATOR-001', species: 'chicken', eggCount: 24, startDate: new Date(Date.now() - 12 * 86400000).toISOString().slice(0, 10), notes: 'Main test batch' },
    { id: 'incubator-02', name: 'Incubator 02', deviceId: 'ESP32-INCUBATOR-002', species: 'chicken', eggCount: 12, startDate: new Date().toISOString().slice(0, 10), notes: 'Second batch' },
  ];
}

const blankForm = (): Omit<Incubator, 'id'> => ({
  name: '', deviceId: '', species: 'chicken', eggCount: 12,
  startDate: new Date().toISOString().slice(0, 10), notes: '',
});

export function IncubatorsPage() {
  const [incubators, setIncubators] = useState<Incubator[]>(loadIncubators);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Incubator, 'id'>>(blankForm);
  const [formOpen, setFormOpen] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(incubators)); } catch { /* Browser storage is optional. */ }
  }, [incubators]);

  const visibleIncubators = useMemo(() => incubators.filter((item) =>
    (item.name + ' ' + item.deviceId + ' ' + item.species).toLowerCase().includes(search.toLowerCase())
  ), [incubators, search]);

  const openNew = () => { setEditingId(null); setForm(blankForm()); setFormOpen(true); };
  const openEdit = (item: Incubator) => {
    setEditingId(item.id);
    const { id: _id, ...values } = item;
    setForm(values);
    setFormOpen(true);
  };
  const save = (event: React.FormEvent) => {
    event.preventDefault();
    const cleaned = { ...form, name: form.name.trim(), deviceId: form.deviceId.trim(), eggCount: Math.max(1, Math.floor(Number(form.eggCount) || 1)) };
    if (!cleaned.name || !cleaned.deviceId) return;
    if (editingId) setIncubators(previous => previous.map(item => item.id === editingId ? { ...cleaned, id: editingId } : item));
    else setIncubators(previous => [...previous, { ...cleaned, id: crypto.randomUUID() }]);
    setFormOpen(false);
  };
  const remove = (item: Incubator) => {
    if (window.confirm('Remove ' + item.name + ' from this browser registry? This does not delete device data from any hardware or cloud service.')) {
      setIncubators(previous => previous.filter(candidate => candidate.id !== item.id));
    }
  };

  const totals = useMemo(() => ({
    eggs: incubators.reduce((sum, item) => sum + item.eggCount, 0),
    active: incubators.filter(item => {
      const start = new Date(item.startDate + 'T00:00:00').getTime();
      const age = Math.floor((Date.now() - start) / 86400000);
      const species = speciesOptions.find(option => option.value === item.species);
      return age >= 0 && age < (species?.days ?? 21);
    }).length,
  }), [incubators]);

  return (
    <div className="space-y-6">
      <motion.header initial={{ opacity: 0, y: 18, filter: 'blur(6px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} transition={{ duration: .65, ease: 'easeOut' }} className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-emerald-200/10 bg-emerald-200/[.05] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[.16em] text-emerald-200"><Thermometer size={13} /> Incubator fleet</div>
          <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">All incubators</h1>
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-slate-400">Manage separate batches, device IDs, species, egg counts, and start dates in one place.</p>
        </div>
        <motion.button whileHover={{ y: -2, scale: 1.02 }} whileTap={{ scale: .97 }} onClick={openNew} className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-200 px-4 py-3 text-sm font-semibold text-emerald-950"><CirclePlus size={17} /> Add incubator</motion.button>
      </motion.header>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .5, delay: .08 }} className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          { label: 'Registered incubators', value: incubators.length, icon: Activity },
          { label: 'Eggs in tracked batches', value: totals.eggs, icon: Egg },
          { label: 'Batches in progress', value: totals.active, icon: CalendarDays },
        ].map((metric, index) => <motion.div key={metric.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .12 + index * .09 }} className="rounded-2xl border border-white/[.08] bg-gradient-to-br from-[#193a31] to-[#112a23] p-5">
          <div className="flex items-center justify-between"><p className="text-xs text-slate-400">{metric.label}</p><metric.icon size={17} className="text-emerald-200" /></div>
          <p className="mt-3 text-3xl font-semibold text-white">{metric.value}</p>
        </motion.div>)}
      </motion.div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div><h2 className="font-semibold text-white">Your batches</h2><p className="mt-1 text-xs text-slate-400">Saved locally in this browser</p></div>
        <input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search incubators…" className="w-full rounded-xl border border-white/10 bg-[#102a23]/80 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 sm:max-w-xs" />
      </div>

      {visibleIncubators.length ? <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {visibleIncubators.map((item, index) => {
          const species = speciesOptions.find(option => option.value === item.species) ?? speciesOptions[0];
          const elapsed = Math.max(0, Math.floor((Date.now() - new Date(item.startDate + 'T00:00:00').getTime()) / 86400000));
          const day = Math.min(species.days, elapsed + 1);
          const progress = Math.min(100, (day / species.days) * 100);
          const finished = elapsed >= species.days;
          return <motion.article key={item.id} initial={{ opacity: 0, y: 24, scale: .98, filter: 'blur(5px)' }} animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }} transition={{ duration: .55, delay: index * .08, ease: 'easeOut' }} whileHover={{ y: -3 }} className="group rounded-3xl border border-white/[.09] bg-gradient-to-br from-[#193a31]/95 to-[#102720]/95 p-5 shadow-[0_18px_50px_rgba(0,0,0,.12)] sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-emerald-200/10 bg-emerald-200/[.07] text-emerald-100"><Egg size={22} /></div>
                <div className="min-w-0"><h3 className="truncate font-semibold text-white">{item.name}</h3><p className="mt-1 truncate font-mono text-[11px] text-slate-500">{item.deviceId}</p></div>
              </div>
              <div className="flex shrink-0 gap-1.5">
                <button onClick={() => openEdit(item)} aria-label={'Edit ' + item.name} className="rounded-lg border border-white/10 p-2 text-slate-400 hover:text-white"><Pencil size={15} /></button>
                <button onClick={() => remove(item)} aria-label={'Remove ' + item.name} className="rounded-lg border border-white/10 p-2 text-slate-400 hover:border-rose-300/20 hover:text-rose-200"><Trash2 size={15} /></button>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-white/[.06] bg-black/10 p-3"><p className="text-[11px] text-slate-500">Species</p><p className="mt-1 text-sm font-medium capitalize text-slate-200">{species.label}</p></div>
              <div className="rounded-xl border border-white/[.06] bg-black/10 p-3"><p className="text-[11px] text-slate-500">Egg count</p><p className="mt-1 text-sm font-medium text-slate-200">{item.eggCount} eggs</p></div>
            </div>
            <div className="mt-4 flex items-center justify-between text-xs"><span className="text-slate-400">Batch progress</span><span className="text-emerald-100">{finished ? 'Cycle complete' : 'Day ' + day + ' of ' + species.days}</span></div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-black/25"><motion.div initial={{ width: 0 }} animate={{ width: progress + '%' }} transition={{ duration: .9, delay: .18 + index * .06, ease: 'easeOut' }} className="h-full rounded-full bg-gradient-to-r from-emerald-300 via-teal-300 to-cyan-300" /></div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-white/[.07] pt-4">
              <span className="inline-flex items-center gap-1.5 text-[11px] text-amber-200"><WifiOff size={13} /> Hardware not linked</span>
              <span className="text-[11px] text-slate-500">Start {new Date(item.startDate + 'T00:00:00').toLocaleDateString()}</span>
            </div>
            {item.notes && <p className="mt-3 text-xs leading-relaxed text-slate-400">{item.notes}</p>}
          </motion.article>;
        })}
      </div> : <div className="rounded-3xl border border-dashed border-white/15 bg-white/[.02] px-6 py-14 text-center"><Egg size={30} className="mx-auto text-slate-500" /><p className="mt-3 font-medium text-white">No incubators found</p><p className="mt-1 text-sm text-slate-400">Add an incubator or try a different search.</p></div>}

      <p className="rounded-2xl border border-amber-200/10 bg-amber-300/[.045] p-4 text-xs leading-relaxed text-amber-100/75">Demo / configuration mode: this registry saves incubator details in this browser. “Hardware not linked” is intentional—live, per-device sensor readings require each ESP32 or sensor feed to be connected. Do not treat preview data as real incubation measurements.</p>

      <AnimatePresence>
        {formOpen && <motion.div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/65 p-0 backdrop-blur-sm sm:items-center sm:p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={event => { if (event.target === event.currentTarget) setFormOpen(false); }}>
          <motion.form onSubmit={save} initial={{ opacity: 0, y: 24, scale: .98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 18, scale: .98 }} className="max-h-[92dvh] w-full max-w-xl space-y-4 overflow-y-auto rounded-t-3xl border border-white/10 bg-[#102820] p-5 shadow-2xl sm:rounded-3xl sm:p-6">
            <div className="flex items-center justify-between"><div><h2 className="text-lg font-semibold text-white">{editingId ? 'Edit incubator' : 'Add an incubator'}</h2><p className="mt-1 text-xs text-slate-400">Each incubator represents a separate batch and device.</p></div><button type="button" onClick={() => setFormOpen(false)} className="rounded-xl border border-white/10 p-2 text-slate-400"><X size={17} /></button></div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="text-xs text-slate-400">Incubator name<input required maxLength={60} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Incubator 03" className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/[.04] px-3 py-2.5 text-sm text-white" /></label>
              <label className="text-xs text-slate-400">Device ID<input required maxLength={100} value={form.deviceId} onChange={e => setForm({ ...form, deviceId: e.target.value })} placeholder="ESP32-INCUBATOR-003" className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/[.04] px-3 py-2.5 font-mono text-sm text-white" /></label>
              <label className="text-xs text-slate-400">Species<select value={form.species} onChange={e => setForm({ ...form, species: e.target.value })} className="mt-1.5 w-full rounded-xl border border-white/10 px-3 py-2.5 text-sm">{speciesOptions.map(option => <option key={option.value} value={option.value}>{option.label} · {option.days} days</option>)}</select></label>
              <label className="text-xs text-slate-400">Egg count<input type="number" min="1" max="10000" required value={form.eggCount} onChange={e => setForm({ ...form, eggCount: Number(e.target.value) })} className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/[.04] px-3 py-2.5 text-sm text-white" /></label>
              <label className="text-xs text-slate-400">Incubation start date<input type="date" required value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/[.04] px-3 py-2.5 text-sm text-white" /></label>
              <label className="text-xs text-slate-400">Batch notes<input maxLength="180" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Optional notes" className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/[.04] px-3 py-2.5 text-sm text-white" /></label>
            </div>
            <div className="flex flex-col-reverse gap-2 border-t border-white/[.08] pt-4 sm:flex-row sm:justify-end"><button type="button" onClick={() => setFormOpen(false)} className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-slate-300">Cancel</button><button type="submit" className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-200 px-4 py-2.5 text-sm font-semibold text-emerald-950"><Check size={16} /> {editingId ? 'Save changes' : 'Add incubator'}</button></div>
          </motion.form>
        </motion.div>}
      </AnimatePresence>
    </div>
  );
}
