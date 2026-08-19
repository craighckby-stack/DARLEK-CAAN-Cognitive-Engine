import fs from 'fs';
const file = 'src/App.tsx';
let data = fs.readFileSync(file, 'utf8');

data = data.replace(/font-scifi/g, 'font-display');
data = data.replace(/bg-zinc-900\/50/g, 'bg-white/[0.04] backdrop-blur-3xl shadow-xl');
data = data.replace(/bg-zinc-900\/80/g, 'bg-white/[0.06] backdrop-blur-3xl shadow-xl');
data = data.replace(/border-zinc-800\/80/g, 'border-white/[0.06]');
data = data.replace(/border-zinc-800\/40/g, 'border-white/[0.04]');
data = data.replace(/bg-black\/60/g, 'bg-black/[0.4] backdrop-blur-xl border border-white/[0.05] shadow-2xl');
data = data.replace(/bg-zinc-900/g, 'bg-white/[0.06]');
data = data.replace(/border-zinc-800/g, 'border-white/[0.06]');
data = data.replace(/bg-zinc-800/g, 'bg-white/[0.09]');
data = data.replace(/text-zinc-500/g, 'text-white/40');
data = data.replace(/text-zinc-400/g, 'text-white/60');
data = data.replace(/text-zinc-300/g, 'text-white/80');
data = data.replace(/text-zinc-200/g, 'text-white');
data = data.replace(/bg-zinc-950/g, 'bg-black/50');
data = data.replace(/text-green-500/g, 'text-emerald-400');
data = data.replace(/from-rose-500/g, 'from-rose-500/60');
data = data.replace(/to-orange-500/g, 'to-orange-500/60');

fs.writeFileSync(file, data);





































