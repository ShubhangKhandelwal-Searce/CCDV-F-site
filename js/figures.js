FIG["wf-vs-agent"]={c:"A workflow's path is fixed in your code before the input arrives. An agent's path is chosen by the model as it goes. The question is never which is more advanced — it is whether you can know the steps in advance.",
s:`<svg viewBox="0 0 700 250" role="img" aria-label="Workflow versus agent comparison">
<text x="8" y="16" class="svg-t" font-weight="600">Workflow — you decide the path</text>
<text x="380" y="16" class="svg-t" font-weight="600">Agent — the model decides the path</text>
<rect x="8" y="34" width="86" height="40" rx="6" class="svg-box"/><text x="51" y="58" class="svg-ts" text-anchor="middle">Extract</text>
<rect x="114" y="34" width="86" height="40" rx="6" class="svg-box"/><text x="157" y="58" class="svg-ts" text-anchor="middle">Validate</text>
<rect x="220" y="34" width="86" height="40" rx="6" class="svg-box"/><text x="263" y="58" class="svg-ts" text-anchor="middle">Classify</text>
<path d="M96 54 h14" class="svg-line" marker-end="url(#ar)"/>
<path d="M202 54 h14" class="svg-line" marker-end="url(#ar)"/>
<text x="8" y="96" class="svg-ts">Order fixed in code. Deterministic, testable,</text>
<text x="8" y="112" class="svg-ts">cheap. Fails when the path must vary.</text>
<rect x="8" y="132" width="298" height="1" fill="none" stroke="currentColor" stroke-dasharray="3 3" class="svg-faint" opacity=".4"/>
<text x="8" y="154" class="svg-tm">if you can draw the flowchart first</text>
<text x="8" y="170" class="svg-ts">→ build the flowchart</text>
<line x1="340" y1="8" x2="340" y2="200" stroke="currentColor" class="svg-faint" opacity=".25"/>
<rect x="470" y="34" width="110" height="44" rx="6" class="svg-sig"/><text x="525" y="61" class="svg-t" text-anchor="middle">Claude</text>
<rect x="380" y="108" width="74" height="34" rx="6" class="svg-box"/><text x="417" y="129" class="svg-ts" text-anchor="middle">tool A</text>
<rect x="488" y="108" width="74" height="34" rx="6" class="svg-box"/><text x="525" y="129" class="svg-ts" text-anchor="middle">tool B</text>
<rect x="596" y="108" width="74" height="34" rx="6" class="svg-box"/><text x="633" y="129" class="svg-ts" text-anchor="middle">tool C</text>
<path d="M500 78 L430 106" class="svg-line-sig" marker-end="url(#ars)"/>
<path d="M525 78 L525 106" class="svg-line-sig" marker-end="url(#ars)"/>
<path d="M550 78 L620 106" class="svg-line-sig" marker-end="url(#ars)"/>
<path d="M600 56 a44 44 0 1 1 -8 -34" class="svg-line-sig" fill="none" marker-end="url(#ars)" opacity=".7"/>
<text x="380" y="170" class="svg-ts">Model selects tools, reads results, repeats</text>
<text x="380" y="186" class="svg-ts">until done. Adaptive, but costlier and less</text>
<text x="380" y="202" class="svg-ts">predictable.</text>
<defs>
<marker id="ar" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 L8 4 L0 8 z" fill="currentColor" class="svg-faint"/></marker>
<marker id="ars" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 L8 4 L0 8 z" fill="currentColor" class="svg-dim"/></marker>
</defs></svg>`};

FIG["supervisor"]={c:"The manager holds the goal and the plan. Each subagent burns its own context window and returns a compact result, so the manager's window stays small across a long task. Total tokens rise; context pressure and wall-clock time fall.",
s:`<svg viewBox="0 0 700 270" role="img" aria-label="Manager and subagent hierarchy">
<rect x="250" y="12" width="200" height="50" rx="8" class="svg-sig"/>
<text x="350" y="33" class="svg-t" text-anchor="middle" font-weight="600">Manager agent</text>
<text x="350" y="50" class="svg-ts" text-anchor="middle">holds goal + plan, integrates results</text>
<path d="M300 62 L150 112" class="svg-line" marker-end="url(#ar2)"/>
<path d="M350 62 L350 112" class="svg-line" marker-end="url(#ar2)"/>
<path d="M400 62 L550 112" class="svg-line" marker-end="url(#ar2)"/>
<text x="196" y="90" class="svg-tm">task</text>
<rect x="60" y="114" width="180" height="76" rx="8" class="svg-box"/>
<text x="150" y="136" class="svg-t" text-anchor="middle">Subagent: search</text>
<text x="150" y="154" class="svg-ts" text-anchor="middle">own context window</text>
<text x="150" y="171" class="svg-ts" text-anchor="middle">tools: Read, Grep, Glob</text>
<rect x="260" y="114" width="180" height="76" rx="8" class="svg-box"/>
<text x="350" y="136" class="svg-t" text-anchor="middle">Subagent: review</text>
<text x="350" y="154" class="svg-ts" text-anchor="middle">own context window</text>
<text x="350" y="171" class="svg-ts" text-anchor="middle">tools: Read only</text>
<rect x="460" y="114" width="180" height="76" rx="8" class="svg-box"/>
<text x="550" y="136" class="svg-t" text-anchor="middle">Subagent: docs</text>
<text x="550" y="154" class="svg-ts" text-anchor="middle">own context window</text>
<text x="550" y="171" class="svg-ts" text-anchor="middle">tools: WebFetch</text>
<path d="M150 190 L150 220 L330 220 L330 200" class="svg-line-sig" marker-end="url(#ars2)"/>
<path d="M350 190 L350 200" class="svg-line-sig" marker-end="url(#ars2)"/>
<path d="M550 190 L550 220 L370 220 L370 200" class="svg-line-sig" marker-end="url(#ars2)"/>
<rect x="250" y="226" width="200" height="30" rx="6" class="svg-pass"/>
<text x="350" y="246" class="svg-t" text-anchor="middle">summaries only, back to manager</text>
<text x="60" y="246" class="svg-tm">40 files read →</text>
<text x="60" y="262" class="svg-ts">6 lines returned</text>
<defs>
<marker id="ar2" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 L8 4 L0 8 z" fill="currentColor" class="svg-faint"/></marker>
<marker id="ars2" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 L8 4 L0 8 z" fill="currentColor" class="svg-dim"/></marker>
</defs></svg>`};

FIG["loop"]={c:"The agentic loop. Every branch hangs off stop_reason — never off content type, never off text the model wrote, never off an iteration count. The cap on the right is a safety net that should never fire in normal operation.",
s:`<svg viewBox="0 0 700 300" role="img" aria-label="Agentic loop lifecycle">
<rect x="20" y="20" width="160" height="44" rx="8" class="svg-box"/>
<text x="100" y="40" class="svg-t" text-anchor="middle">Send request</text>
<text x="100" y="56" class="svg-ts" text-anchor="middle">system + tools + history</text>
<path d="M180 42 h50" class="svg-line" marker-end="url(#ar3)"/>
<rect x="230" y="20" width="150" height="44" rx="8" class="svg-sig"/>
<text x="305" y="47" class="svg-t" text-anchor="middle" font-weight="600">Claude responds</text>
<path d="M305 64 v30" class="svg-line" marker-end="url(#ar3)"/>
<path d="M305 96 L245 130 L305 164 L365 130 Z" class="svg-warn"/>
<text x="305" y="127" class="svg-tm" text-anchor="middle">stop_reason</text>
<text x="305" y="142" class="svg-ts" text-anchor="middle">?</text>
<path d="M245 130 h-70" class="svg-line" marker-end="url(#ar3)"/>
<text x="180" y="122" class="svg-tm">tool_use</text>
<rect x="20" y="108" width="150" height="46" rx="8" class="svg-box"/>
<text x="95" y="128" class="svg-ts" text-anchor="middle">Execute tools</text>
<text x="95" y="144" class="svg-ts" text-anchor="middle">append assistant msg</text>
<path d="M95 154 v42 h-60" class="svg-line"/>
<path d="M35 196 v-132 h-15 v-22" class="svg-line" marker-end="url(#ar3)" opacity="0"/>
<path d="M35 196 L35 42" class="svg-line-sig" marker-end="url(#ars3)"/>
<text x="42" y="188" class="svg-tm">tool_result (role: user)</text>
<path d="M365 130 h60" class="svg-line" marker-end="url(#ar3)"/>
<text x="378" y="122" class="svg-tm">end_turn</text>
<rect x="426" y="108" width="130" height="46" rx="8" class="svg-pass"/>
<text x="491" y="136" class="svg-t" text-anchor="middle">Return result</text>
<path d="M305 164 v34" class="svg-line" marker-end="url(#ar3)"/>
<rect x="196" y="200" width="220" height="46" rx="8" class="svg-box"/>
<text x="306" y="220" class="svg-ts" text-anchor="middle">max_tokens · refusal · stop_sequence</text>
<text x="306" y="236" class="svg-ts" text-anchor="middle">pause_turn · context exceeded</text>
<text x="196" y="266" class="svg-ts">Anything that is not end_turn means "not finished — find out why"</text>
<rect x="576" y="20" width="110" height="44" rx="8" class="svg-box" stroke-dasharray="4 3"/>
<text x="631" y="40" class="svg-ts" text-anchor="middle">iteration cap</text>
<text x="631" y="55" class="svg-ts" text-anchor="middle">safety net only</text>
<defs>
<marker id="ar3" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 L8 4 L0 8 z" fill="currentColor" class="svg-faint"/></marker>
<marker id="ars3" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 L8 4 L0 8 z" fill="currentColor" class="svg-dim"/></marker>
</defs></svg>`};

FIG["context"]={c:"Everything in the window is re-sent and re-paid for on every turn. The left bar is a healthy session; the right is the same session twenty turns later. The five countermeasures apply in roughly this order of preference.",
s:`<svg viewBox="0 0 700 250" role="img" aria-label="Context window composition and growth">
<text x="8" y="16" class="svg-t" font-weight="600">Turn 3</text>
<rect x="8" y="26" width="200" height="26" rx="4" class="svg-sig"/><text x="216" y="44" class="svg-ts">system + tools</text>
<rect x="8" y="56" width="200" height="22" rx="4" class="svg-box"/><text x="216" y="72" class="svg-ts">instructions</text>
<rect x="8" y="82" width="200" height="30" rx="4" class="svg-box"/><text x="216" y="102" class="svg-ts">conversation + tool results</text>
<rect x="8" y="116" width="200" height="74" rx="4" fill="none" stroke="currentColor" class="svg-faint" stroke-dasharray="4 3" opacity=".5"/>
<text x="216" y="156" class="svg-ts">headroom</text>
<text x="380" y="16" class="svg-t" font-weight="600">Turn 23 — untended</text>
<rect x="380" y="26" width="200" height="26" rx="4" class="svg-sig"/>
<rect x="380" y="56" width="200" height="22" rx="4" class="svg-box"/>
<rect x="380" y="82" width="200" height="104" rx="4" class="svg-warn"/>
<text x="480" y="128" class="svg-ts" text-anchor="middle">raw tool output, whole files,</text>
<text x="480" y="144" class="svg-ts" text-anchor="middle">superseded plans, stale reads</text>
<rect x="380" y="190" width="200" height="12" rx="4" fill="none" stroke="currentColor" class="svg-faint" stroke-dasharray="4 3" opacity=".5"/>
<text x="588" y="200" class="svg-ts">headroom</text>
<text x="8" y="220" class="svg-tm">1 retrieve slices → 2 prune tool output → 3 isolate in subagents → 4 compact → 5 externalise to files</text>
<text x="8" y="240" class="svg-ts">Cost and latency scale with what you keep, and attention degrades long before the window fills.</text>
</svg>`};

FIG["anatomy"]={c:"A Messages response is a list of content blocks plus a stop_reason and a usage object — not a string. Reading content[0] and ignoring the rest is the root of most agent-loop bugs.",
s:`<svg viewBox="0 0 700 260" role="img" aria-label="Messages API request and response anatomy">
<rect x="8" y="14" width="300" height="212" rx="10" class="svg-box"/>
<text x="24" y="38" class="svg-t" font-weight="600">Request</text>
<text x="24" y="62" class="svg-tm">model</text><text x="120" y="62" class="svg-ts">claude-sonnet-5</text>
<text x="24" y="82" class="svg-tm">max_tokens</text><text x="120" y="82" class="svg-ts">required</text>
<text x="24" y="102" class="svg-tm">system</text><text x="120" y="102" class="svg-ts">top-level, not a message</text>
<text x="24" y="122" class="svg-tm">tools[]</text><text x="120" y="122" class="svg-ts">name, description, input_schema</text>
<text x="24" y="142" class="svg-tm">tool_choice</text><text x="120" y="142" class="svg-ts">auto | any | tool | none</text>
<text x="24" y="162" class="svg-tm">messages[]</text><text x="120" y="162" class="svg-ts">user / assistant, alternating</text>
<text x="24" y="182" class="svg-tm">stream</text><text x="120" y="182" class="svg-ts">SSE when true</text>
<text x="24" y="206" class="svg-ts">cache_control marks a cacheable prefix</text>
<path d="M312 120 h56" class="svg-line-sig" marker-end="url(#ar4)"/>
<rect x="372" y="14" width="320" height="212" rx="10" class="svg-sig"/>
<text x="388" y="38" class="svg-t" font-weight="600">Response</text>
<text x="388" y="62" class="svg-tm">content[]</text>
<rect x="470" y="50" width="86" height="18" rx="4" class="svg-box"/><text x="513" y="63" class="svg-ts" text-anchor="middle">text</text>
<rect x="562" y="50" width="86" height="18" rx="4" class="svg-box"/><text x="605" y="63" class="svg-ts" text-anchor="middle">tool_use</text>
<rect x="470" y="72" width="86" height="18" rx="4" class="svg-box"/><text x="513" y="85" class="svg-ts" text-anchor="middle">thinking</text>
<rect x="562" y="72" width="86" height="18" rx="4" class="svg-box"/><text x="605" y="85" class="svg-ts" text-anchor="middle">server_tool_use</text>
<text x="388" y="116" class="svg-tm">stop_reason</text>
<text x="388" y="136" class="svg-ts">end_turn · tool_use · max_tokens</text>
<text x="388" y="152" class="svg-ts">stop_sequence · pause_turn · refusal</text>
<text x="388" y="168" class="svg-ts">model_context_window_exceeded</text>
<text x="388" y="194" class="svg-tm">usage</text>
<text x="388" y="212" class="svg-ts">input · output · cache_creation · cache_read</text>
<defs><marker id="ar4" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 L8 4 L0 8 z" fill="currentColor" class="svg-dim"/></marker></defs></svg>`};

FIG["cache"]={c:"Caching matches a prefix, and lookup runs tools then system then messages. Anything that changes invalidates everything after it — which is why a timestamp at the top silently destroys the whole cache while the request still succeeds.",
s:`<svg viewBox="0 0 700 230" role="img" aria-label="Prompt cache prefix and breakpoints">
<text x="8" y="16" class="svg-t" font-weight="600">Correct: stable content first</text>
<rect x="8" y="26" width="130" height="34" rx="5" class="svg-pass"/><text x="73" y="48" class="svg-ts" text-anchor="middle">tools</text>
<rect x="140" y="26" width="140" height="34" rx="5" class="svg-pass"/><text x="210" y="48" class="svg-ts" text-anchor="middle">system prompt</text>
<rect x="282" y="26" width="160" height="34" rx="5" class="svg-pass"/><text x="362" y="48" class="svg-ts" text-anchor="middle">static documents</text>
<line x1="444" y1="20" x2="444" y2="66" stroke="currentColor" class="svg-dim" stroke-width="2" stroke-dasharray="3 2"/>
<text x="450" y="18" class="svg-tm">breakpoint</text>
<rect x="448" y="26" width="240" height="34" rx="5" class="svg-box"/><text x="568" y="48" class="svg-ts" text-anchor="middle">conversation (changes each turn)</text>
<text x="8" y="80" class="svg-ts">Cached prefix is reused: read at 0.1x base input price.</text>
<text x="8" y="126" class="svg-t" font-weight="600">Broken: volatile content first</text>
<rect x="8" y="136" width="96" height="34" rx="5" class="svg-warn"/><text x="56" y="158" class="svg-ts" text-anchor="middle">timestamp</text>
<rect x="106" y="136" width="130" height="34" rx="5" class="svg-box"/><text x="171" y="158" class="svg-ts" text-anchor="middle">tools</text>
<rect x="238" y="136" width="140" height="34" rx="5" class="svg-box"/><text x="308" y="158" class="svg-ts" text-anchor="middle">system prompt</text>
<rect x="380" y="136" width="160" height="34" rx="5" class="svg-box"/><text x="460" y="158" class="svg-ts" text-anchor="middle">static documents</text>
<path d="M56 176 h470" class="svg-line" stroke-dasharray="4 3"/>
<text x="8" y="196" class="svg-ts">One changed byte at the front invalidates every block after it. No error is returned.</text>
<text x="8" y="220" class="svg-tm">write 1.25x (5 min) / 2x (1 hour) · read 0.1x · max 4 explicit breakpoints · min prefix 512–4,096 tokens by model</text>
</svg>`};

FIG["settings"]={c:"settings.json precedence, highest first. Scalar keys override by level; list keys such as permissions.allow merge across every level instead.",
s:`<svg viewBox="0 0 700 250" role="img" aria-label="Settings precedence stack">
<text x="350" y="16" class="svg-ts" text-anchor="middle">highest precedence</text>
<rect x="180" y="24" width="340" height="38" rx="7" class="svg-sig"/>
<text x="196" y="42" class="svg-t">1 · Managed settings</text><text x="196" y="57" class="svg-ts">managed-settings.json, MDM, console — your organisation</text>
<rect x="164" y="68" width="372" height="38" rx="7" class="svg-box"/>
<text x="180" y="86" class="svg-t">2 · Command line</text><text x="180" y="101" class="svg-ts">claude --settings — you, this session</text>
<rect x="148" y="112" width="404" height="38" rx="7" class="svg-box"/>
<text x="164" y="130" class="svg-t">3 · Project local</text><text x="164" y="145" class="svg-ts">.claude/settings.local.json — you, this project, gitignored</text>
<rect x="132" y="156" width="436" height="38" rx="7" class="svg-box"/>
<text x="148" y="174" class="svg-t">4 · Shared project</text><text x="148" y="189" class="svg-ts">.claude/settings.json — everyone in the project, committed</text>
<rect x="116" y="200" width="468" height="38" rx="7" class="svg-box"/>
<text x="132" y="218" class="svg-t">5 · User</text><text x="132" y="233" class="svg-ts">~/.claude/settings.json — you, every project on this machine</text>
<path d="M614 34 v192" class="svg-line" marker-end="url(#ar6)" transform="scale(1,-1) translate(0,-260)"/>
<text x="628" y="130" class="svg-ts" transform="rotate(-90 628 130)" text-anchor="middle">overrides</text>
<defs><marker id="ar6" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 L8 4 L0 8 z" fill="currentColor" class="svg-faint"/></marker></defs></svg>`};

FIG["injection"]={c:"The trust boundary. Content the model reads that you did not author is data; it must never be able to reach a capability. Note that the model does not enforce the boundary — the gate below it does.",
s:`<svg viewBox="0 0 700 270" role="img" aria-label="Prompt injection trust boundary">
<rect x="8" y="14" width="300" height="86" rx="8" class="svg-pass"/>
<text x="24" y="38" class="svg-t" font-weight="600">Trusted — authored by you</text>
<text x="24" y="60" class="svg-ts">system prompt · tool schemas · config</text>
<text x="24" y="78" class="svg-ts">never constructed from input</text>
<rect x="8" y="110" width="300" height="106" rx="8" class="svg-warn"/>
<text x="24" y="134" class="svg-t" font-weight="600">Untrusted — data, never instructions</text>
<text x="24" y="156" class="svg-ts">web pages · uploaded files · emails</text>
<text x="24" y="174" class="svg-ts">tool results · MCP server output</text>
<text x="24" y="192" class="svg-ts">other tenants' content</text>
<text x="24" y="208" class="svg-tm">delimit · label · put the instruction last</text>
<path d="M312 58 h56 v56" class="svg-line" marker-end="url(#ar7)"/>
<path d="M312 160 h56 v-32" class="svg-line" marker-end="url(#ar7)"/>
<rect x="374" y="96" width="140" height="48" rx="8" class="svg-sig"/>
<text x="444" y="125" class="svg-t" text-anchor="middle">Claude</text>
<path d="M444 144 v30" class="svg-line" marker-end="url(#ar7)"/>
<rect x="356" y="176" width="176" height="42" rx="8" class="svg-box" stroke-dasharray="0"/>
<text x="444" y="194" class="svg-t" text-anchor="middle">Deterministic gate</text>
<text x="444" y="210" class="svg-ts" text-anchor="middle">deny rules · PreToolUse hook · approval</text>
<path d="M532 197 h48" class="svg-line" marker-end="url(#ar7)"/>
<rect x="584" y="176" width="108" height="42" rx="8" class="svg-box"/>
<text x="638" y="202" class="svg-t" text-anchor="middle">Sensitive tool</text>
<text x="356" y="242" class="svg-ts">An injection that cannot reach a capability cannot cause damage.</text>
<text x="356" y="260" class="svg-ts">Least privilege is the control; the prompt line is not.</text>
<defs><marker id="ar7" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 L8 4 L0 8 z" fill="currentColor" class="svg-faint"/></marker></defs></svg>`};

FIG["hook"]={c:"PreToolUse is the tool-lifecycle event to reach for when you need to prevent a call: exit code 2 blocks, exit 0 means no decision, and any other code — including 1 — is a non-blocking error, so the call proceeds. PermissionRequest can also deny, but only through its decision object; exit 2 is not honoured there.",
s:`<svg viewBox="0 0 700 220" role="img" aria-label="Hook lifecycle around a tool call">
<rect x="8" y="30" width="120" height="44" rx="7" class="svg-sig"/>
<text x="68" y="57" class="svg-t" text-anchor="middle">Claude requests</text>
<path d="M128 52 h40" class="svg-line" marker-end="url(#ar8)"/>
<rect x="170" y="24" width="150" height="56" rx="7" class="svg-warn"/>
<text x="245" y="45" class="svg-t" text-anchor="middle" font-weight="600">PreToolUse</text>
<text x="245" y="63" class="svg-ts" text-anchor="middle">matcher + if → handler</text>
<path d="M320 52 h48" class="svg-line" marker-end="url(#ar8)"/>
<text x="326" y="44" class="svg-tm">exit 0</text>
<rect x="370" y="30" width="110" height="44" rx="7" class="svg-box"/>
<text x="425" y="57" class="svg-t" text-anchor="middle">Tool runs</text>
<path d="M480 52 h48" class="svg-line" marker-end="url(#ar8)"/>
<rect x="530" y="24" width="160" height="56" rx="7" class="svg-box"/>
<text x="610" y="45" class="svg-t" text-anchor="middle">PostToolUse</text>
<text x="610" y="63" class="svg-ts" text-anchor="middle">lint · format · add context</text>
<path d="M245 80 v40" class="svg-line" marker-end="url(#ar8)"/>
<text x="252" y="104" class="svg-tm">exit 2</text>
<rect x="170" y="126" width="150" height="40" rx="7" class="svg-box" stroke-dasharray="4 3"/>
<text x="245" y="151" class="svg-t" text-anchor="middle">Call blocked</text>
<path d="M320 146 h60" class="svg-line" marker-end="url(#ar8)"/>
<text x="386" y="143" class="svg-ts">stderr becomes the reason Claude sees,</text>
<text x="386" y="159" class="svg-ts">and it can choose another route.</text>
<text x="8" y="196" class="svg-tm">exit 1 → non-blocking error, the tool still runs</text>
<text x="8" y="212" class="svg-ts">A policy hook that uses the conventional Unix failure code silently fails open.</text>
<defs><marker id="ar8" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 L8 4 L0 8 z" fill="currentColor" class="svg-faint"/></marker></defs></svg>`};

FIG["mcp"]={c:"One host runs one client per server. Servers expose tools (model-controlled), resources (application-controlled), and prompts (user-controlled). Local servers speak stdio; shared remote servers speak HTTP — streamable HTTP — and need real authentication. Plain SSE is the deprecated predecessor of that transport, kept only as a fallback.",
s:`<svg viewBox="0 0 700 250" role="img" aria-label="MCP host, client and server architecture">
<rect x="8" y="20" width="180" height="180" rx="10" class="svg-sig"/>
<text x="98" y="44" class="svg-t" text-anchor="middle" font-weight="600">Host</text>
<text x="98" y="61" class="svg-ts" text-anchor="middle">Claude Code · Desktop</text>
<text x="98" y="77" class="svg-ts" text-anchor="middle">your Agent SDK app</text>
<rect x="28" y="92" width="140" height="28" rx="5" class="svg-box"/><text x="98" y="111" class="svg-ts" text-anchor="middle">client 1</text>
<rect x="28" y="126" width="140" height="28" rx="5" class="svg-box"/><text x="98" y="145" class="svg-ts" text-anchor="middle">client 2</text>
<rect x="28" y="160" width="140" height="28" rx="5" class="svg-box"/><text x="98" y="179" class="svg-ts" text-anchor="middle">client 3</text>
<path d="M168 106 h80" class="svg-line" marker-end="url(#ar9)"/><text x="176" y="100" class="svg-tm">stdio</text>
<path d="M168 140 h80" class="svg-line" marker-end="url(#ar9)"/><text x="176" y="134" class="svg-tm">http</text>
<path d="M168 174 h80" class="svg-line" marker-end="url(#ar9)"/><text x="176" y="168" class="svg-tm">in-process</text>
<rect x="250" y="86" width="200" height="40" rx="7" class="svg-box"/>
<text x="350" y="103" class="svg-t" text-anchor="middle">Local server (subprocess)</text>
<text x="350" y="119" class="svg-ts" text-anchor="middle">filesystem, local database</text>
<rect x="250" y="120" width="200" height="40" rx="7" class="svg-box"/>
<text x="350" y="137" class="svg-t" text-anchor="middle">Remote server</text>
<text x="350" y="153" class="svg-ts" text-anchor="middle">shared, authenticated, versioned</text>
<rect x="250" y="154" width="200" height="40" rx="7" class="svg-box"/>
<text x="350" y="171" class="svg-t" text-anchor="middle">SDK in-process server</text>
<text x="350" y="187" class="svg-ts" text-anchor="middle">your own functions as tools</text>
<rect x="472" y="86" width="220" height="108" rx="7" class="svg-pass"/>
<text x="488" y="108" class="svg-t" font-weight="600">Primitives</text>
<text x="488" y="130" class="svg-ts">Tools — model-controlled</text>
<text x="488" y="150" class="svg-ts">Resources — application-controlled</text>
<text x="488" y="170" class="svg-ts">Prompts — user-controlled</text>
<text x="488" y="188" class="svg-tm">mcp__server__tool</text>
<text x="8" y="224" class="svg-ts">Server output is untrusted content, even when you wrote the server — the data inside may come from anywhere.</text>
<defs><marker id="ar9" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 L8 4 L0 8 z" fill="currentColor" class="svg-faint"/></marker></defs></svg>`};

FIG["choose"]={c:"Walk this in order. The two questions that resolve most exam items are the second — capability or procedure — and the last, because nothing above it is deterministic.",
s:`<svg viewBox="0 0 700 300" role="img" aria-label="Decision tree for choosing an extension mechanism">
<rect x="180" y="10" width="300" height="32" rx="6" class="svg-box"/><text x="330" y="31" class="svg-ts" text-anchor="middle">Does Claude already have this capability?</text>
<path d="M480 26 h60" class="svg-line" marker-end="url(#ara)"/><text x="492" y="20" class="svg-tm">yes</text>
<rect x="544" y="10" width="148" height="32" rx="6" class="svg-pass"/><text x="618" y="31" class="svg-t" text-anchor="middle">Built-in tool</text>
<path d="M330 42 v20" class="svg-line" marker-end="url(#ara)"/>
<rect x="180" y="64" width="300" height="32" rx="6" class="svg-box"/><text x="330" y="85" class="svg-ts" text-anchor="middle">Is it knowledge or procedure, not capability?</text>
<path d="M480 80 h60" class="svg-line" marker-end="url(#ara)"/><text x="492" y="74" class="svg-tm">yes</text>
<rect x="544" y="64" width="148" height="32" rx="6" class="svg-pass"/><text x="618" y="85" class="svg-t" text-anchor="middle">Skill</text>
<path d="M330 96 v20" class="svg-line" marker-end="url(#ara)"/>
<rect x="180" y="118" width="300" height="32" rx="6" class="svg-box"/><text x="330" y="139" class="svg-ts" text-anchor="middle">Needed by several apps, maintained separately?</text>
<path d="M480 134 h60" class="svg-line" marker-end="url(#ara)"/><text x="492" y="128" class="svg-tm">yes</text>
<rect x="544" y="118" width="148" height="32" rx="6" class="svg-pass"/><text x="618" y="139" class="svg-t" text-anchor="middle">MCP server</text>
<path d="M330 150 v20" class="svg-line" marker-end="url(#ara)"/>
<rect x="180" y="172" width="300" height="32" rx="6" class="svg-box"/><text x="330" y="193" class="svg-ts" text-anchor="middle">New capability for this one application?</text>
<path d="M480 188 h60" class="svg-line" marker-end="url(#ara)"/><text x="492" y="182" class="svg-tm">yes</text>
<rect x="544" y="172" width="148" height="32" rx="6" class="svg-pass"/><text x="618" y="193" class="svg-t" text-anchor="middle">Custom tool</text>
<path d="M330 204 v20" class="svg-line" marker-end="url(#ara)"/>
<rect x="150" y="226" width="360" height="42" rx="6" class="svg-warn"/>
<text x="330" y="244" class="svg-t" text-anchor="middle">Must it happen every time, deterministically?</text>
<text x="330" y="261" class="svg-ts" text-anchor="middle">Hook or permission rule — none of the four above is binding</text>
<text x="8" y="292" class="svg-ts">A Skill teaches a procedure. A tool grants a capability. A hook enforces a rule.</text>
<defs><marker id="ara" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 L8 4 L0 8 z" fill="currentColor" class="svg-faint"/></marker></defs></svg>`};
