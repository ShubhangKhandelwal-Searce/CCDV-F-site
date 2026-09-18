L["3.1"]={t:"Claude Code Operation",d:3,
lede:"Only 3.1% of the exam, but it is concrete and easy to bank. Know the five extension mechanisms and when each one is the right answer, the session commands, and how headless mode works.",
body:`
<h2>The five extension mechanisms</h2>
<p>This table is the heart of the skill. Items describe a need and ask which mechanism fits.</p>
<div class="tw"><table><thead><tr><th>Mechanism</th><th>Lives in</th><th>Loads</th><th>Use for</th></tr></thead><tbody>
<tr><td><strong>CLAUDE.md / rules</strong></td><td><code>CLAUDE.md</code>, <code>.claude/rules/*.md</code></td><td>Every session (rules with <code>paths:</code> load on match)</td><td>Standing conventions Claude should always know</td></tr>
<tr><td><strong>Skills</strong></td><td><code>.claude/skills/&lt;name&gt;/SKILL.md</code></td><td>On demand, when the description matches the task</td><td>Repeatable procedures with steps, scripts, and references</td></tr>
<tr><td><strong>Slash commands</strong></td><td><code>.claude/commands/&lt;name&gt;.md</code></td><td>When you type the command</td><td>Prompts you run often and want to invoke by name</td></tr>
<tr><td><strong>Subagents</strong></td><td><code>.claude/agents/&lt;name&gt;.md</code></td><td>When delegated to</td><td>Specialised work in an isolated context with its own tools</td></tr>
<tr><td><strong>Hooks</strong></td><td><code>settings.json</code>, <code>hooks/hooks.json</code>, skill/agent frontmatter</td><td>At lifecycle events, always</td><td>Deterministic enforcement and automation</td></tr>
</tbody></table></div>
<div class="note"><div class="nt">Key concept</div><p>The axis is <strong>when it loads and whether it is advisory</strong>. CLAUDE.md is always in context and advisory. Skills are on-demand and advisory. Hooks are always, and binding. If an item says "must always happen", the answer is a hook, not a CLAUDE.md line.</p></div>
<h2>Authoring a Skill</h2>
<p>A Skill is a folder with a <code>SKILL.md</code>. The frontmatter is what makes it discoverable.</p>
<pre><code>---
name: release-notes
description: Generate release notes from merged PRs. Use when the user asks
  for release notes, a changelog, or a summary of what shipped.
---

# Release notes

1. Run: git log --merges main..HEAD
2. Group by the labels in .github/labels.yml
3. Write to CHANGELOG.md using the format in reference/format.md</code></pre>
<ul>
<li>The <code>description</code> is the trigger. Write it in terms of what the user will ask for, not what the skill contains.</li>
<li>Keep <code>SKILL.md</code> short and put detail in supporting files the skill points to — that is progressive disclosure, and it is why skills cost less context than CLAUDE.md.</li>
<li>Skills can bundle scripts and can define hooks in frontmatter; a skill hook stays registered for the rest of the session once the skill is invoked — including on later turns, not just the skill's own turn. Mark one <code>once: true</code> to remove it after its first successful run, for one-time setup or validation. That flag only does anything on a skill-declared hook; the same key in a settings-file or subagent hook is ignored.</li>
<li>Subagent-declared hooks behave differently again: they run only while that subagent is active and are removed the moment it finishes, unlike a skill's hooks, which outlive the skill's own turn.</li>
</ul>
<h2>Sessions</h2>
<div class="tw"><table><thead><tr><th>Action</th><th>How</th></tr></thead><tbody>
<tr><td>Continue the most recent session</td><td><code>claude --continue</code></td></tr>
<tr><td>Pick a session to resume</td><td><code>claude --resume</code>, or <code>/resume</code> in-session</td></tr>
<tr><td>Wipe context and start clean</td><td><code>/clear</code></td></tr>
<tr><td>Summarise and continue</td><td><code>/compact</code></td></tr>
<tr><td>Undo Claude's edits or conversation</td><td><code>/rewind</code> (checkpointing)</td></tr>
<tr><td>Bootstrap a CLAUDE.md from the repo</td><td><code>/init</code></td></tr>
</tbody></table></div>
<p>Auto memory is separate from <code>CLAUDE.md</code>: Claude writes it, it is per repository and machine-local, and the index <code>MEMORY.md</code> is loaded at the start of every session up to 200 lines or 25 KB. Topic files are read on demand.</p>
<div class="note v"><div class="nt">What survives compaction</div><p>The project-root <code>CLAUDE.md</code> is re-read from disk and re-injected after <code>/compact</code>. Instructions given only in conversation are not. If something must survive, write it to a file.</p></div>
<h2>Headless and streaming modes</h2>
<pre><code># one-shot, non-interactive
claude -p "Summarise the open TODOs in src/" --output-format json

# stream structured events for a wrapper application
claude -p "$PROMPT" --output-format stream-json

# constrain the tool surface for automation
claude -p "$PROMPT" --allowedTools "Read,Grep,Glob"</code></pre>
<ul>
<li><code>-p</code> (print) is the headless entry point: run a prompt, get output, exit. This is how you drive Claude Code from CI or a script.</li>
<li><code>--output-format json</code> gives one structured result; <code>stream-json</code> emits events as they happen.</li>
<li>A <code>-p</code> run shows no dialogs, so a broken settings file is skipped silently — run <code>claude doctor</code> afterwards to see what was dropped.</li>
<li>Running the CLI as a subprocess with <code>-p</code> is the documented way to use the agent loop from a language the Agent SDK does not ship for.</li>
</ul>
<h2>Auto mode and permission modes</h2>
<p>Permission modes control how much Claude Code asks: manual (reported as <code>default</code>), <code>plan</code>, <code>acceptEdits</code>, <code>auto</code>, <code>dontAsk</code>, and <code>bypassPermissions</code>. Auto mode routes each action to a second model, the classifier, instead of to you; it decides which actions are safe in context, and an organisation can constrain it with allow and hard-deny rules of its own. <code>auto</code> and <code>bypassPermissions</code> cannot be set as a session's <em>starting</em> mode from project or local settings — only from user or managed settings, or a flag or in-session switch, though a running session can still be switched into either at any time.</p>
<div class="note"><div class="nt">Exam-relevant default</div><p>On Pro, Max, and Team plans, <strong>auto is now the built-in starting permission mode</strong> — not manual. An item describing a session that acts without prompting, on a paid consumer plan, with no configuration mentioned, is describing the current default, not an unusual setup.</p></div>
<h2>Repository initialisation checklist</h2>
<ol>
<li><code>/init</code> to generate a starting <code>CLAUDE.md</code>, then trim it to what Claude cannot derive from the code.</li>
<li>Create <code>.claude/settings.json</code> with the team's permission rules, hooks, and plugins, and commit it.</li>
<li>Add <code>.claude/rules/</code> topic files with <code>paths:</code> scoping for area-specific conventions.</li>
<li>Add skills for repeatable procedures and subagents for specialised review.</li>
<li>Add a <code>PreToolUse</code> deny hook for anything destructive that must never run.</li>
<li>Confirm with <code>/status</code>, <code>/context</code>, and <code>/hooks</code>.</li>
</ol>
`,
traps:[
["Writing a procedure into CLAUDE.md instead of a skill","CLAUDE.md is loaded every session and costs context always. A multi-step procedure that applies sometimes belongs in a skill, which loads on demand."],
["Giving a skill a description that describes its contents","The description is the trigger. Write it as the user's request, not as a table of contents, or the skill never fires."],
["Using <code>/clear</code> when you meant <code>/compact</code>","<code>/clear</code> discards the conversation. <code>/compact</code> summarises it and continues."],
["Expecting conversation-only instructions to survive <code>/compact</code>","Only files survive reliably. Project-root CLAUDE.md is re-injected; a mid-conversation instruction is not."],
["Assuming a <code>-p</code> run will warn about a broken config","It shows no dialog. Run <code>claude doctor</code> to see skipped files and entries."],
["Assuming Claude Code starts every session in manual mode by default","On Pro, Max, and Team plans, auto mode — a classifier reviewing actions instead of a human — is the built-in starting mode. Manual is a choice you opt into, not the universal default."],
["Setting <code>once: true</code> on a hook in settings.json and expecting it to fire only once","That flag is honoured only on a hook declared in skill frontmatter. In a settings file or a subagent's frontmatter it is ignored, and the hook keeps firing on every matching event."]
],
src:[["Extend Claude Code","https://code.claude.com/docs/en/features-overview"],["Extend Claude with skills","https://code.claude.com/docs/en/skills"],["Run Claude Code programmatically","https://code.claude.com/docs/en/headless"],["Choose a permission mode","https://code.claude.com/docs/en/permission-modes"],["Hooks reference","https://code.claude.com/docs/en/hooks"]]};


Q.push(
{i:"q301",d:3,s:"3.1",q:"A team wants a multi-step release procedure available to Claude Code only when someone is actually preparing a release. Where should it go?",
o:["In CLAUDE.md so it is always available","In a Skill, whose description names the tasks that should trigger it","In settings.json as a permission rule","In a PreToolUse hook"],a:1,
r:"Skills load on demand when the description matches the task, so occasional procedures cost almost no context until needed. CLAUDE.md is loaded every session, permission rules govern tool access, and hooks are for deterministic enforcement."},
{i:"q302",d:3,s:"3.1",q:"Which command runs Claude Code headlessly for a single prompt and returns structured output?",
o:["claude --resume","claude -p \"prompt\" --output-format json","claude /init","claude --continue"],a:1,
r:"The -p (print) flag is the headless entry point, and --output-format json returns one structured result. --continue and --resume return to prior sessions, and /init generates a starting CLAUDE.md."},
{i:"q303",d:3,s:"3.1",q:"After running /compact, which instruction is most likely to still be in effect?",
o:["A constraint the user typed mid-conversation three turns ago","A rule written in the project-root CLAUDE.md","A tool result from earlier in the session","A one-off correction Claude acknowledged but did not write down"],a:1,
r:"The project-root CLAUDE.md is re-read from disk and re-injected after compaction. Conversation-only instructions and old tool results are subject to lossy summarisation, which is why durable rules belong in files."},
{i:"q304",d:3,s:"3.1",q:"Which Claude Code command tells you which instruction files actually loaded into the current session?",
o:["/status","/context","/hooks","/mcp"],a:1,
r:"/context lists memory files actually in context. /status shows which settings sources loaded, /hooks browses configured hooks, and /mcp shows server connections."},
);
