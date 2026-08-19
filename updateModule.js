import fs from 'fs';

const targetFile = 'src/App.tsx';
let data = fs.readFileSync(targetFile, 'utf8');

const targetContent = `            {/* Dalek insentient Speech bubble area */}
            <div className="relative bg-black/80 rounded-xl border border-white/[0.06] p-4 font-mono text-xs flex flex-col gap-3 min-h-[140px] text-justify">
              <AnimatePresence mode="wait">
                {loadingDialogue ? (
                  <motion.div
                    key="loader"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center py-6 gap-2 text-white/40"
                  >
                    <RefreshCw className="w-5 h-5 animate-spin text-rose-500" />
                    <span className="text-[10px] tracking-widest text-center animate-pulse">
                      EXTRAPOLATING PARADOX PATHS...
                    </span>
                  </motion.div>
                ) : (
                  <motion.div
                    key="speech"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col gap-3 h-full justify-between"
                  >
                    {/* The spoken word */}
                    <p className="text-emerald-400 font-bold leading-relaxed relative z-10 [text-shadow:0_0_1px_rgba(52,211,153,0.3)]">
                      "{dialogue.text}"
                    </p>

                    {/* Timeline Prophecy progression bar */}
                    <div className="border-t border-white/[0.06] pt-2.5 mt-2 flex flex-col gap-1 text-[10px]">
                      <div className="flex justify-between items-center text-white/60">
                        <span>TEMPORAL FORTUNE:</span>
                        <span className="font-bold flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-yellow-500 animate-spin" />
                          White is {dialogue.prophecyLevel}% safe
                        </span>
                      </div>
                      <div className="w-full bg-white/[0.06] rounded-full h-1.5 overflow-hidden">
                        <div
                          className={\`h-full transition-all duration-500 \${uiAccent.barColor}\`}
                          style={{ width: \`\${dialogue.prophecyLevel}%\` }}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>`;

const replacementContent = `            {/* Dynamic AI Speech Module */}
            <div className="relative bg-black/80 rounded-xl border border-white/[0.06] p-4 font-mono text-xs flex flex-col gap-3 min-h-[140px] text-justify overflow-hidden">
              <AnimatePresence mode="wait">
                {isDebating || loadingDialogue ? (
                  <motion.div
                    key="loader"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center py-6 gap-2 text-white/40"
                  >
                    <RefreshCw className="w-5 h-5 animate-spin text-rose-500" />
                    <span className="text-[10px] tracking-widest text-center animate-pulse">
                      SYNTHESIZING COGNITIVE DIALOGUE...
                    </span>
                  </motion.div>
                ) : settings.mode === GameMode.AVA && debate ? (
                  <motion.div
                    key="debate"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col gap-3 h-full justify-between"
                  >
                    <p className="text-rose-400 font-bold leading-relaxed relative z-10 [text-shadow:0_0_1px_rgba(244,63,94,0.3)]">
                      <span className="text-zinc-500 mr-2 uppercase">Quantum Node Caan:</span>
                      "{debate.caanText}"
                    </p>
                    <p className="text-amber-300 font-bold leading-relaxed relative z-10 [text-shadow:0_0_1px_rgba(252,211,77,0.3)] border-t border-white/5 pt-2">
                       <span className="text-zinc-500 mr-2 uppercase">Neural Node Jesus:</span>
                      "{debate.jesusText}"
                    </p>
                     {/* Timeline Prophecy progression bar */}
                     <div className="border-t border-white/[0.06] pt-2.5 mt-2 flex flex-col gap-1 text-[10px]">
                      <div className="flex justify-between items-center text-white/60">
                        <span>TEMPORAL FORTUNE:</span>
                        <span className="font-bold flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-yellow-500 animate-spin" />
                          Equilibrium {debate.prophecyLevel}%
                        </span>
                      </div>
                      <div className="w-full bg-white/[0.06] rounded-full h-1.5 overflow-hidden">
                        <div
                          className="h-full transition-all duration-500 bg-gradient-to-r from-rose-500 to-amber-500"
                          style={{ width: \`\${debate.prophecyLevel}%\` }}
                        />
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="speech"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col gap-3 h-full justify-between"
                  >
                    {/* The spoken word */}
                    <p className="text-emerald-400 font-bold leading-relaxed relative z-10 [text-shadow:0_0_1px_rgba(52,211,153,0.3)]">
                      "{dialogue.text}"
                    </p>

                    {/* Timeline Prophecy progression bar */}
                    <div className="border-t border-white/[0.06] pt-2.5 mt-2 flex flex-col gap-1 text-[10px]">
                      <div className="flex justify-between items-center text-white/60">
                        <span>TEMPORAL FORTUNE:</span>
                        <span className="font-bold flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-yellow-500 animate-spin" />
                          White is {dialogue.prophecyLevel}% safe
                        </span>
                      </div>
                      <div className="w-full bg-white/[0.06] rounded-full h-1.5 overflow-hidden">
                        <div
                          className={\`h-full transition-all duration-500 \${uiAccent.barColor}\`}
                          style={{ width: \`\${dialogue.prophecyLevel}%\` }}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>`;

if (!data.includes(targetContent.substring(0, 100))) {
// fallback for minor diffs due to escapes
} else {
  data = data.replace(targetContent, replacementContent);
  fs.writeFileSync(targetFile, data);
}






































