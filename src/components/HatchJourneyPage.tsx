import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, CheckCircle2, Circle, Egg, Flag, HeartPulse, NotebookPen, Sprout, Timer, Wheat, ChevronDown } from 'lucide-react';

type Incubator = { id: string; name: string; deviceId: string; species: string; eggCount: number; startDate: string; notes: string };
type EggStatus = 'unchecked' | 'developing' | 'watch' | 'not-viable';
type EggNotes = Record<string, Record<number, EggStatus>>;
const REGISTRY_KEY = 'hatchsmart-incubator-registry-v1';
const EGG_KEY = 'hatchsmart-egg-monitor-v1';
const JOURNEY_TABS = [
  { id: 'journey', label: 'Hatch journey', icon: Sprout },
  { id: 'eggs', label: 'Monitor eggs', icon: Egg },
  { id: 'notes', label: 'Batch notes', icon: NotebookPen },
] as const;
const speciesDays: Record<string, number> = { chicken: 21, duck: 28, quail: 17, turkey: 28, goose: 30 };
const speciesLabels: Record<string, string> = { chicken: 'Chicken', duck: 'Duck', quail: 'Quail', turkey: 'Turkey', goose: 'Goose' };
const statusOptions: { value: EggStatus; label: string; short: string; style: string }[] = [
  { value: 'unchecked', label: 'Not checked', short: 'Unchecked', style: 'border-white/10 bg-white/[.035] text-slate-300' },
  { value: 'developing', label: 'Developing / looks viable', short: 'Developing', style: 'border-emerald-300/20 bg-emerald-300/10 text-emerald-100' },
  { value: 'watch', label: 'Needs observation', short: 'Watch', style: 'border-amber-300/20 bg-amber-300/10 text-amber-100' },
  { value: 'not-viable', label: 'Not viable (confirmed)', short: 'Not viable', style: 'border-rose-300/20 bg-rose-300/10 text-rose-100' },
];

function loadBatches(): Incubator[] {
  try {
    const saved = localStorage.getItem(REGISTRY_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length) return parsed;
    }
  } catch { /* handled by the empty state */ }
  return [];
}
function loadEggNotes(): EggNotes {
  try { return JSON.parse(localStorage.getItem(EGG_KEY) || '{}'); } catch { return {}; }
}

export function HatchJourneyPage() {
  const [incubators, setIncubators] = useState<Incubator[]>(loadBatches);
  const [selectedId, setSelectedId] = useState(() => {
    try { return localStorage.getItem('hatchsmart-selected-incubator') || ''; } catch { return ''; }
  });
  const [activeTab, setActiveTab] = useState<'journey' | 'eggs' | 'notes'>('journey');
  const [eggNotes, setEggNotes] = useState<EggNotes>(loadEggNotes);
  const [noteDraft, setNoteDraft] = useState('');
  const [batchNotes, setBatchNotes] = useState<Record<string, string[]>>({});
  const [noteLoaded, setNoteLoaded] = useState(false);

  useEffect(() => {
    const refresh = () => setIncubators(loadBatches());
    window.addEventListener('focus', refresh);
    window.addEventListener('storage', refresh);
    return () => { window.removeEventListener('focus', refresh); window.removeEventListener('storage', refresh); };
  }, []);
  useEffect(() => {
    if (!incubators.some(item => item.id === selectedId)) {
      const next = incubators[0]?.id || '';
      setSelectedId(next);
      try { localStorage.setItem('hatchsmart-selected-incubator', next); } catch { /* optional */ }
    }
  }, [incubators, selectedId]);
  useEffect(() => {
    try { localStorage.setItem(EGG_KEY, JSON.stringify(eggNotes)); } catch { /* optional */ }
  }, [eggNotes]);
  useEffect(() => {
    try { setBatchNotes(JSON.parse(localStorage.getItem('hatchsmart-batch-notes-v1') || '{}')); } catch { setBatchNotes({}); }
    setNoteLoaded(true);
  }, []);
  useEffect(() => {
    if (noteLoaded) try { localStorage.setItem('hatchsmart-batch-notes-v1', JSON.stringify(batchNotes)); } catch { /* optional */ }
  }, [batchNotes, noteLoaded]);

  const selected = incubators.find(item => item.id === selectedId);
  const totalDays = selected ? speciesDays[selected.species] || 21 : 21;
  const elapsed = selected ? Math.floor((Date.now() - new Date(selected.startDate + 'T00:00:00').getTime()) / 86400000) : 0;
  const currentDay = selected ? Math.max(1, Math.min(totalDays, elapsed + 1)) : 1;
  const progress = selected ? Math.max(0, Math.min(100, ((elapsed + 1) / totalDays) * 100)) : 0;
  const stages = useMemo(() => {
    const chicken = selected?.species === 'chicken' || !selected;
    if (chicken) return [
      { range: 'Days 1–7', title: 'Early development', detail: 'Embryonic development begins. Keep temperature stable and minimize unnecessary handling.', icon: Sprout, start: 1, end: 7 },
      { range: 'Days 8–18', title: 'Growth & formation', detail: 'The embryo grows and develops. Follow your candling and egg-turning protocol.', icon: Wheat, start: 8, end: 18 },
      { range: 'Days 19–21', title: 'Hatching window', detail: 'Prepare for hatching and avoid unnecessary handling during lockdown.', icon: Egg, start: 19, end: 21 },
    ];
    return [
      { range: 'Early phase', title: 'Early development', detail: 'Follow species-specific temperature, humidity and turning guidance.', icon: Sprout, start: 1, end: Math.ceil(totalDays * .33) },
      { range: 'Middle phase', title: 'Growth & formation', detail: 'Track development using your approved candling and handling protocol.', icon: Wheat, start: Math.ceil(totalDays * .33) + 1, end: Math.ceil(totalDays * .85) },
      { range: 'Final phase', title: 'Hatching window', detail: 'Prepare for hatching and follow species-specific lockdown guidance.', icon: Egg, start: Math.ceil(totalDays * .85) + 1, end: totalDays },
    ];
  }, [selected?.species, totalDays]);
  const counts = useMemo(() => {
    const statuses = eggNotes[selectedId] || {};
    return statusOptions.reduce((acc, item) => ({ ...acc, [item.value]: Object.values(statuses).filter(value => value === item.value).length }), {} as Record<EggStatus, number>);
  }, [eggNotes, selectedId]);

  const updateEgg = (index: number, value: EggStatus) => setEggNotes(previous => ({
    ...previous,
    [selectedId]: { ...(previous[selectedId] || {}), [index]: value },
  }));
  const addNote = (event: React.FormEvent) => {
    event.preventDefault();
    const clean = noteDraft.trim();
    if (!selected || !clean) return;
    setBatchNotes(previous => ({ ...previous, [selectedId]: [{ id: String(Date.now()), text: clean, at: new Date().toISOString() } as any, ...(previous[selectedId] || [])] }));
    setNoteDraft('');
  };

  return (
    <div className="space-y-6">
      <motion.header initial={{ opacity: 0, y: 20, filter: 'blur(7px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} transition={{ duration: .7, ease: 'easeOut' }} className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div><div className="mb-2 inline-flex items-center gap-2 rounded-full border border-cyan-200/10 bg-cyan-200/[.05] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[.16em] text-cyan-100"><Egg size={13} /> Incubation tracker</div><h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">Hatch journey</h1><p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-slate-400">Follow each batch from incubation day one to hatch, and keep individual egg observations organized by incubator.</p></div>
        {incubators.length > 0 && <label className="block w-full text-xs text-slate-400 lg:max-w-xs">Choose an incubator<select value={selectedId} onChange={e => { setSelectedId(e.target.value); try { localStorage.setItem('hatchsmart-selected-incubator', e.target.value); } catch { /* optional */ } }} className="mt-1.5 w-full rounded-xl border border-white/10 px-4 py-3 text-sm text-white"><option value="" disabled>Select batch</option>{incubators.map(item => <option key={item.id} value={item.id}>{item.name} · {item.eggCount} eggs</option>)}</select></label>}
      </motion.header>

      {!selected ? <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-dashed border-white/15 bg-white/[.025] p-8 text-center sm:p-12"><Egg size={34} className="mx-auto text-emerald-200" /><h2 className="mt-4 text-lg font-semibold text-white">Add your first incubator</h2><p className="mx-auto mt-2 max-w-md text-sm text-slate-400">Create a batch in the Incubators tab first. Your journey timeline and egg observations will then be tracked separately for that batch.</p></motion.div> : <>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .5, delay: .08 }} className="relative overflow-hidden rounded-3xl border border-emerald-200/10 bg-gradient-to-br from-[#173e31] via-[#12332d] to-[#102b3a] p-5 shadow-[0_20px_65px_rgba(0,0,0,.16)] sm:p-7">
          <div aria-hidden="true" className="pointer-events-none absolute -right-14 -top-16 h-56 w-56 rounded-full bg-emerald-300/10 blur-3xl animate-pulse" />
          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div><p className="text-xs font-medium uppercase tracking-[.14em] text-emerald-100/65">{selected.deviceId}</p><h2 className="mt-2 text-xl font-semibold text-white">{selected.name}</h2><p className="mt-1 text-sm text-slate-300">{speciesLabels[selected.species] || selected.species} · {selected.eggCount} eggs in this batch</p></div>
            <div className="w-fit rounded-2xl border border-white/10 bg-black/10 px-4 py-3"><p className="text-xs text-slate-400">Incubation day</p><p className="mt-1 text-3xl font-semibold text-white">{currentDay}<span className="ml-1 text-sm font-normal text-slate-400">/ {totalDays}</span></p></div>
          </div>
          <div className="relative mt-6"><div className="mb-2 flex justify-between text-xs"><span className="text-slate-400">Batch progress</span><span className="font-semibold text-emerald-100">{Math.round(progress)}%</span></div><div className="h-3 overflow-hidden rounded-full bg-black/25"><motion.div initial={{ width: 0 }} animate={{ width: progress + '%' }} transition={{ duration: 1.1, delay: .25, ease: 'easeOut' }} className="relative h-full rounded-full bg-gradient-to-r from-emerald-300 via-teal-300 to-cyan-300"><span className="absolute inset-0 bg-gradient-to-b from-white/25 to-transparent" /></motion.div></div><div className="mt-3 flex flex-wrap justify-between gap-2 text-[11px] text-slate-500"><span>Started {new Date(selected.startDate + 'T00:00:00').toLocaleDateString()}</span><span>Estimated hatch {new Date(new Date(selected.startDate + 'T00:00:00').getTime() + totalDays * 86400000).toLocaleDateString()}</span></div></div>
        </motion.div>

        <div className="flex gap-1 overflow-x-auto rounded-2xl border border-white/[.08] bg-[#0c211b]/80 p-1.5" role="tablist" aria-label="Incubation monitoring sections">
          {JOURNEY_TABS.map((tab, index) => { const Icon = tab.icon; return <motion.button key={tab.id} role="tab" aria-selected={activeTab === tab.id} onClick={() => setActiveTab(tab.id)} whileTap={{ scale: .97 }} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * .06 }} className={'inline-flex shrink-0 items-center justify-center gap-2 rounded-xl px-4 py-3 text-xs font-semibold transition-colors sm:flex-1 sm:text-sm ' + (activeTab === tab.id ? 'bg-emerald-200 text-emerald-950 shadow-lg shadow-emerald-950/20' : 'text-slate-400 hover:bg-white/[.05] hover:text-white')}><Icon size={16} />{tab.label}</motion.button>; })}
        </div>

        {activeTab === 'journey' && <motion.section key="journey" initial={{ opacity: 0, y: 18, filter: 'blur(5px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} transition={{ duration: .5 }} className="space-y-4">
          <div><h2 className="text-lg font-semibold text-white">Development stages</h2><p className="mt-1 text-xs text-slate-400">The current stage is highlighted for the selected batch.</p></div>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {stages.map((stage, index) => { const Icon = stage.icon; const active = currentDay >= stage.start && currentDay <= stage.end; const complete = currentDay > stage.end; return <motion.article key={stage.title} initial={{ opacity: 0, y: 24, scale: .97 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: .55, delay: .08 + index * .12 }} whileHover={{ y: -5 }} className={'relative overflow-hidden rounded-3xl border p-5 transition-colors ' + (active ? 'border-emerald-200/30 bg-gradient-to-br from-emerald-200/[.12] to-cyan-200/[.035] shadow-[0_0_35px_rgba(52,211,153,.06)]' : 'border-white/[.08] bg-[#15342b]/75')}>
              {active && <motion.div initial={{ x: '-120%' }} animate={{ x: '180%' }} transition={{ duration: 1.2, delay: .5, ease: 'easeInOut' }} className="pointer-events-none absolute inset-y-0 w-1/2 skew-x-12 bg-gradient-to-r from-transparent via-white/[.045] to-transparent" />}
              <div className="relative flex items-center justify-between"><div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-black/10 text-emerald-100"><Icon size={23} /></div><span className={'rounded-full px-2.5 py-1 text-[10px] font-semibold ' + (active ? 'bg-emerald-200/15 text-emerald-100' : complete ? 'bg-white/[.06] text-slate-400' : 'bg-white/[.04] text-slate-500')}>{active ? 'Current stage' : complete ? 'Completed' : 'Upcoming'}</span></div>
              <p className="relative mt-5 text-[11px] font-semibold uppercase tracking-[.15em] text-cyan-100/60">{stage.range}</p><h3 className="relative mt-1.5 text-base font-semibold text-white">{stage.title}</h3><p className="relative mt-2 min-h-12 text-sm leading-relaxed text-slate-400">{stage.detail}</p>
              <div className="relative mt-5 h-1.5 overflow-hidden rounded-full bg-black/25"><motion.div initial={{ width: 0 }} animate={{ width: complete ? '100%' : active ? Math.max(4, ((currentDay - stage.start + 1) / (stage.end - stage.start + 1)) * 100) + '%' : '0%' }} transition={{ duration: .9, delay: .25 + index * .1 }} className={'h-full rounded-full ' + (active ? 'bg-gradient-to-r from-emerald-300 to-cyan-300' : 'bg-white/20')} /></div>
            </motion.article>; })}
          </div>
          <p className="rounded-2xl border border-amber-200/10 bg-amber-300/[.04] p-4 text-xs leading-relaxed text-amber-100/70">The timeline is calculated from the batch start date and species duration. It is a planning aid, not a measure of embryo viability or a prediction of hatch success. Follow a validated species-specific incubation protocol.</p>
        </motion.section>}

        {activeTab === 'eggs' && <motion.section key="eggs" initial={{ opacity: 0, y: 18, filter: 'blur(5px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} transition={{ duration: .5 }} className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><h2 className="text-lg font-semibold text-white">Individual egg monitoring</h2><p className="mt-1 text-xs text-slate-400">Tap an egg card to cycle through its observation status.</p></div><div className="grid grid-cols-2 gap-2 sm:flex">{statusOptions.map(item => <span key={item.value} className={'rounded-xl border px-3 py-2 text-[11px] ' + item.style}>{item.short}: {counts[item.value]}</span>)}</div></div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6">
            {Array.from({ length: Math.min(selected.eggCount, 120) }, (_, index) => { const status = eggNotes[selectedId]?.[index + 1] || 'unchecked'; const option = statusOptions.find(item => item.value === status)!; const next = statusOptions[(statusOptions.findIndex(item => item.value === status) + 1) % statusOptions.length].value; return <motion.button key={index + 1} initial={{ opacity: 0, y: 14, scale: .95 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: Math.min(index * .018, .4), duration: .35 }} whileTap={{ scale: .96 }} onClick={() => updateEgg(index + 1, next)} aria-label={'Egg ' + (index + 1) + ', status ' + option.label + '. Tap to change.'} className={'rounded-2xl border p-4 text-left transition-colors ' + option.style}><div className="flex items-center justify-between"><Egg size={22} /><span className="text-[10px] opacity-70">#{String(index + 1).padStart(2, '0')}</span></div><p className="mt-3 text-sm font-semibold">Egg {index + 1}</p><p className="mt-1 text-[11px] opacity-75">{option.short}</p><div className="mt-3 flex items-center gap-1 text-[10px] opacity-60"><Circle size={10} /> Tap to update</div></motion.button>; })}
          </div>
          {selected.eggCount > 120 && <p className="text-xs text-slate-500">Showing the first 120 eggs. This display limit keeps large batches responsive.</p>}
          <p className="rounded-2xl border border-white/[.08] bg-white/[.025] p-4 text-xs leading-relaxed text-slate-400">Egg observations are manual notes stored in this browser, not automated candling or AI viability detection. Mark “Not viable” only when confirmed using your research protocol. If you reduce a batch's egg count, prior records are retained locally.</p>
        </motion.section>}

        {activeTab === 'notes' && <motion.section key="notes" initial={{ opacity: 0, y: 18, filter: 'blur(5px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} transition={{ duration: .5 }} className="space-y-4">
          <div><h2 className="text-lg font-semibold text-white">Batch research notes</h2><p className="mt-1 text-xs text-slate-400">Record candling observations, turning events, or environmental issues for {selected.name}.</p></div>
          <form onSubmit={addNote} className="rounded-3xl border border-white/[.08] bg-[#15342b]/80 p-4 sm:p-5"><label className="text-xs text-slate-400">New observation<textarea value={noteDraft} onChange={e => setNoteDraft(e.target.value)} required maxLength={1200} rows={4} placeholder="Example: Day 7 candling observation, egg numbers checked, unusual conditions…" className="mt-2 w-full resize-y rounded-xl border border-white/10 bg-black/15 px-4 py-3 text-sm text-white placeholder:text-slate-500" /></label><div className="mt-3 flex justify-end"><button type="submit" className="rounded-xl bg-emerald-200 px-4 py-2.5 text-sm font-semibold text-emerald-950">Save observation</button></div></form>
          <div className="space-y-3">{(batchNotes[selectedId] || []).map((note: any, index: number) => <motion.article key={note.id || index} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(index * .05, .3) }} className="rounded-2xl border border-white/[.08] bg-white/[.025] p-4"><div className="flex items-center justify-between gap-3"><span className="text-xs font-semibold text-emerald-100">Observation</span><time className="text-[11px] text-slate-500">{note.at ? new Date(note.at).toLocaleString() : ''}</time></div><p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-300">{note.text || String(note)}</p></motion.article>)}</div>
          {(batchNotes[selectedId] || []).length === 0 && <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-sm text-slate-500">No notes recorded for this batch yet.</div>}
        </motion.section>}
      </>}
    </div>
  );
}
