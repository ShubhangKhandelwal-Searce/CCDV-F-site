L["1.1"]={t:"Agent Architecture",d:1,
lede:"The first architectural question on every exam item in this domain is the same one: does this problem need an agent at all? Choosing an agent when a workflow would do is the most expensive mistake in the domain, and choosing a workflow when the path cannot be known in advance is the most brittle.",
body:`
<h2>Workflow versus agent</h2>
<p>Both are systems where a model does work over several steps. The difference is <strong>who decides the next step</strong>.</p>
<ul>
<li>In a <strong>workflow</strong>, you decide. The sequence of calls is written in your code. The model fills in each step, but it never chooses what happens next. Control flow is deterministic and auditable.</li>
<li>In an <strong>agent</strong>, the model decides. You give it a goal and a set of tools, and it selects tools, reads results, and keeps going until it judges the task done. Control flow is dynamic.</li>
</ul>
<p>Agents buy you adaptability and cost you predictability, latency, and tokens. The exam rewards the cheapest architecture that meets the requirement, so do not reach for an agent by default.</p>
<div class="note"><div class="nt">Decision rule</div><p>If you can enumerate the steps in advance and they do not change with the input, build a workflow. If the number and order of steps depend on what is discovered along the way, build an agent. If the task is one model call, do not build either.</p></div>
[[FIG:wf-vs-agent]]
<h3>The named workflow patterns</h3>
<p>Items often describe a shape and ask you to name it, or name it and ask you to apply it.</p>
<div class="tw"><table><thead><tr><th>Pattern</th><th>Shape</th><th>Use when</th></tr></thead><tbody>
<tr><td><strong>Prompt chaining</strong></td><td>Output of call 1 becomes the input of call 2, in a fixed order</td><td>The task decomposes into stable sequential stages, such as outline then draft then edit</td></tr>
<tr><td><strong>Routing</strong></td><td>A classifier call picks one of several specialised downstream paths</td><td>Inputs fall into distinct categories that deserve different prompts or different models</td></tr>
<tr><td><strong>Parallelisation</strong></td><td>Several independent calls run at once; results are joined. Two variants: <em>sectioning</em> splits the work, <em>voting</em> runs the same work several times</td><td>Subtasks are independent, or you want several perspectives on the same input</td></tr>
<tr><td><strong>Orchestrator&ndash;workers</strong></td><td>A lead model decomposes the task at run time and dispatches to worker calls</td><td>The subtasks cannot be listed in advance. This is the boundary where a workflow becomes agentic</td></tr>
<tr><td><strong>Evaluator&ndash;optimiser</strong></td><td>One call produces, a second call critiques, loop until the critique passes</td><td>There are clear evaluation criteria and iteration measurably improves the result</td></tr>
</tbody></table></div>
<h2>Manager and supervisor hierarchies</h2>
<p>A <strong>manager</strong> (or supervisor, or orchestrator) agent owns the goal and holds the plan. It does not do the domain work itself; it delegates to subagents and integrates what they return. The exam expects you to know why this shape exists:</p>
<ol>
<li><strong>Context isolation.</strong> Each subagent gets its own context window. A subagent can read forty files and return six lines. Only those six lines land in the manager context, so the manager stays clean across a long task.</li>
<li><strong>Specialisation.</strong> Each subagent gets a narrow system prompt and a narrow tool set, which raises reliability and reduces the chance of the wrong tool being chosen.</li>
<li><strong>Parallelism.</strong> Independent subtasks run concurrently, so wall-clock time falls even though total tokens rise.</li>
<li><strong>Least privilege.</strong> A subagent that only reads does not need write tools.</li>
</ol>
[[FIG:supervisor]]
<div class="note v"><div class="nt">The cost side of the ledger</div><p>Multi-agent architectures spend substantially more tokens than a single agent on the same task, because the manager prompt, the subagent prompts, and the returned summaries are all paid for. Anthropic's own published numbers for its multi-agent research system put the multiplier at roughly <strong>4&times; the tokens of a single agent, and about 15&times; a plain chat exchange</strong>, for a task where the extra tokens bought a large accuracy gain. Use hierarchy when the task genuinely parallelises or when context would otherwise overflow, not because it sounds more capable — and expect the economics to work out only for tasks valuable enough to absorb that multiplier.</p></div>
<h3>Where subagents help and where they hurt</h3>
<ul>
<li><strong>Good fit:</strong> breadth-first search over a codebase, reviewing one change from several angles, gathering evidence from many sources, any task where results compress well.</li>
<li><strong>Poor fit:</strong> tightly coupled sequential work where each step depends on the full detail of the last. Subagents communicate through summaries, so detail is lost at every handoff.</li>
</ul>
<h3>Sizing the hierarchy</h3>
<p>More subagents is not automatically better. Coordination overhead — assigning work, avoiding two subagents touching the same file, synthesising findings that disagree — grows with headcount, and returns diminish well before you reach double digits. A manager dispatching three to five focused subagents typically outperforms one dispatching fifteen scattered ones. Size each subagent's brief so it produces one clear deliverable: a finding, a file, a verdict. Too small and the dispatch overhead swamps the work; too large and the subagent runs long with no checkpoint, so a bad turn wastes the whole budget it was given.</p>
<h2>Reliability structures around the loop</h2>
<p>Architecture is not only topology. An item may describe an agent that misbehaves and ask what structural change fixes it.</p>
<div class="tw"><table><thead><tr><th>Symptom</th><th>Structural fix</th></tr></thead><tbody>
<tr><td>Agent takes a destructive action that must never happen</td><td>A deterministic gate outside the model: a hook or permission rule that blocks it, not a prompt instruction</td></tr>
<tr><td>Agent wanders and never converges</td><td>A clearer goal, a smaller tool set, and an iteration ceiling as a safety net</td></tr>
<tr><td>Agent runs out of context on long tasks</td><td>Subagents for context isolation, plus compaction and tool-result pruning</td></tr>
<tr><td>A regulated step must happen in a fixed order every time</td><td>Lift that step out of the agent and into code. Programmatic enforcement beats instruction</td></tr>
</tbody></table></div>
<div class="note"><div class="nt">Key concept</div><p>Flexibility is the default virtue in agent design, and determinism is the exception you invoke deliberately. When business logic demands compliance — money movement, access control, regulatory sequence — programmatic enforcement overrides model judgement every time.</p></div>
`,
traps:[
["Choosing a multi-agent architecture because the task is 'complex'","Complexity alone does not justify hierarchy. The test is whether subtasks are independent or whether context isolation is needed. A complex but strictly sequential task runs better as a single agent or a chained workflow."],
["Treating orchestrator&ndash;workers and parallelisation as the same pattern","Parallelisation splits work you defined in advance. Orchestrator&ndash;workers has the lead model decide the split at run time. That run-time decision is what makes it agentic."],
["Enforcing a mandatory business rule by adding a line to the system prompt","Prompts are guidance, not enforcement. A rule that must hold every time belongs in code, a permission rule, or a hook."],
["Assuming subagents reduce cost","They usually raise total token spend. They reduce <em>context pressure</em> on the main agent and reduce wall-clock time. Those are the benefits to cite."],
["Picking an agent for a task with a fixed, known sequence of steps","If you can draw the flowchart before seeing the input, write the flowchart. A workflow is cheaper, faster, testable, and easier to debug."]
],
src:[["Building effective agents","https://www.anthropic.com/engineering/building-effective-agents"],["How we built our multi-agent research system","https://www.anthropic.com/engineering/multi-agent-research-system"],["Agent SDK overview","https://code.claude.com/docs/en/agent-sdk/overview"]]};

L["1.2"]={t:"Agent Construction with Claude",d:1,
lede:"Anthropic gives you three places to stand when building an agent: write the loop yourself against the Messages API, let the Agent SDK run the loop for you, or hand the whole session to managed infrastructure. Knowing which one an item is describing is usually half the answer.",
body:`
<h2>The four surfaces</h2>
<div class="tw"><table><thead><tr><th>Surface</th><th>Who runs the loop</th><th>Choose it when</th></tr></thead><tbody>
<tr><td><strong>Client SDK</strong> (<code>anthropic</code> Python / TypeScript)</td><td>You</td><td>You need full control of every turn, a custom harness, or an unusual execution environment. Direct access to the Messages API.</td></tr>
<tr><td><strong>Claude Agent SDK</strong> (<code>claude-agent-sdk</code>)</td><td>The SDK</td><td>You want Claude Code's loop, built-in tools, context management, hooks, subagents, permissions and sessions as a library in Python or TypeScript.</td></tr>
<tr><td><strong>Claude Code CLI</strong></td><td>The CLI</td><td>Interactive terminal work, or one-off headless runs driven from a shell script with <code>-p</code>.</td></tr>
<tr><td><strong>Managed Agents</strong></td><td>Anthropic</td><td>Long-running or asynchronous agents in stateful sessions, where you do not want to operate the sandbox or persist session state yourself. A hosted REST product, billed on tokens plus session runtime.</td></tr>
</tbody></table></div>
<div class="note"><div class="nt">Naming history</div><p>The Claude Code SDK was renamed the <strong>Claude Agent SDK</strong>. An item that mentions the old name is describing the same product. The Agent SDK ships for Python and TypeScript only; to drive the same loop from another language, run the CLI as a subprocess with <code>-p</code> and <code>--output-format json</code>.</p></div>
<h2>The custom agent loop</h2>
<p>If you build the loop yourself, this is the shape. Every element here is examinable.</p>
<pre><code>messages = [{"role": "user", "content": task}]

while True:
    resp = client.messages.create(
        model="claude-sonnet-5",
        max_tokens=4096,
        system=SYSTEM,
        tools=TOOLS,
        messages=messages,
    )

    if resp.stop_reason != "tool_use":
        break                      # end_turn, max_tokens, stop_sequence, refusal...

    messages.append({"role": "assistant", "content": resp.content})

    results = []
    for block in resp.content:
        if block.type == "tool_use":
            results.append({
                "type": "tool_result",
                "tool_use_id": block.id,          # must echo the id back
                "content": run_tool(block.name, block.input),
            })

    messages.append({"role": "user", "content": results})   # role is "user"</code></pre>
[[FIG:loop]]
<h3>The four things people get wrong</h3>
<ol>
<li><strong>Branch on <code>stop_reason</code>, not on content.</strong> Claude routinely emits an explanatory text block <em>and</em> a <code>tool_use</code> block in the same response. Inspecting <code>content[0].type</code> will terminate the loop early on exactly the requests that needed tools most.</li>
<li><strong>Append the full assistant turn before the results.</strong> The assistant message containing the <code>tool_use</code> blocks must be in history, followed by a <code>user</code> message containing the matching <code>tool_result</code> blocks. Drop either and the API rejects the request or the model loses the thread.</li>
<li><strong>Return every result, in one message.</strong> When Claude requests several tools in one turn, all of their results go in a single user message. A missing <code>tool_use_id</code> is an error.</li>
<li><strong>An iteration cap is a safety net, never the stopping mechanism.</strong> The model signals completion; the cap only stops a runaway.</li>
</ol>
<h2>Agent SDK construction</h2>
<p>The SDK collapses that loop into one call and gives you the Claude Code feature set around it.</p>
<pre><code>from claude_agent_sdk import query, ClaudeAgentOptions

async for msg in query(
    prompt="Find and fix the failing test in this repo",
    options=ClaudeAgentOptions(
        system_prompt="You are a careful Python maintainer.",
        allowed_tools=["Read", "Grep", "Glob", "Edit", "Bash"],
        permission_mode="acceptEdits",
        setting_sources=["project"],      # narrows loading to project scope only
    ),
):
    ...</code></pre>
<div class="note"><div class="nt">Exam-relevant default</div><p>Omitting <code>setting_sources</code> / <code>settingSources</code> is <strong>not</strong> the locked-down option — it is equivalent to passing <code>["user","project","local"]</code>, so a default query already reads <code>CLAUDE.md</code>, rules, <code>settings.json</code>, skills, commands, and subagents from disk, the same as the CLI would. To run on nothing but the options you pass programmatically, set <code>setting_sources: []</code> explicitly. An item where "the agent ignores our project instructions" usually has a different cause: the wrong <code>cwd</code>, a <code>CLAUDE.md</code> outside the loaded scope, or an explicit empty array left over from a stricter deployment.</p></div>
<div class="note v"><div class="nt">Why the default is dangerous, not just permissive</div><p>Managed policy settings and the global <code>~/.claude.json</code> load <strong>regardless</strong> of <code>setting_sources</code>, and auto-generated per-project memory under <code>~/.claude/projects/&lt;project&gt;/memory/</code> loads into the system prompt too. In a multi-tenant service — one process or container handling requests for several customers — a default <code>query()</code> call can pull host-level configuration and another tenant's saved memory into the session. Anthropic's own guidance for that deployment shape is <code>setting_sources: []</code> plus disabling auto memory, not the default.</p></div>
<h3>What the SDK gives you</h3>
<ul>
<li><strong>Built-in tools</strong> — file read/write/edit, shell, search, web access.</li>
<li><strong>Hooks</strong> — deterministic code at lifecycle points such as <code>PreToolUse</code>, <code>PostToolUse</code>, <code>Stop</code>, <code>SessionStart</code>.</li>
<li><strong>Subagents</strong> — spawn specialised agents with isolated context, defined in <code>.claude/agents/</code> or inline.</li>
<li><strong>MCP</strong> — connect external servers, including an in-process server for your own Python or TypeScript functions.</li>
<li><strong>Permissions</strong> — <code>allowed_tools</code>, <code>disallowed_tools</code>, permission modes, and a <code>canUseTool</code> callback for runtime approval.</li>
<li><strong>Sessions</strong> — continue, resume, or fork a prior conversation.</li>
<li><strong>Skills, commands, plugins</strong> — loaded from <code>.claude/</code> and <code>~/.claude/</code>.</li>
</ul>
<h3>Permission modes</h3>
<p>The SDK evaluates a tool request in a fixed order: hooks, then deny rules, then ask rules, then the permission mode, then allow rules, then your <code>canUseTool</code> callback. The mode only matters for requests that survive the first three steps — hooks and deny rules can already have blocked the call, and an ask rule can already have forced a callback, before the mode is even consulted.</p>
<div class="tw"><table><thead><tr><th>Mode</th><th>Behaviour</th></tr></thead><tbody>
<tr><td><code>default</code></td><td>No mode-level auto-approval. A call needing approval that matches no allow rule falls through to <code>canUseTool</code></td></tr>
<tr><td><code>plan</code></td><td>Claude explores and plans without editing files. File edits and file-modifying shell commands are never auto-approved here, even by an allow rule — they always prompt</td></tr>
<tr><td><code>acceptEdits</code></td><td>File edits and filesystem operations (<code>mkdir</code>, <code>rm</code>, <code>mv</code>, &hellip;) inside the working directory are auto-approved; everything else still follows <code>default</code> behaviour</td></tr>
<tr><td><code>auto</code></td><td>A model classifier approves or denies prompts on Claude's behalf instead of asking a human</td></tr>
<tr><td><code>dontAsk</code></td><td>Any call that would otherwise prompt is <strong>denied</strong> instead — <code>canUseTool</code> is never invoked. Built for headless agents where no one is present to answer a prompt</td></tr>
<tr><td><code>bypassPermissions</code></td><td>Every call that reaches this step is approved with no prompt. Full autonomous system access — only inside a sandbox you control</td></tr>
</tbody></table></div>
<div class="note"><div class="nt">Key concept</div><p>Deny rules win. The SDK checks deny rules before the permission mode is even reached, and a matching deny blocks the tool <strong>even in <code>bypassPermissions</code> mode</strong>. Allow-listing is not a substitute for deny-listing the things that must never run.</p></div>
<div class="note v"><div class="nt">A narrower gotcha in the same family</div><p><code>allowed_tools</code> does not narrow <code>bypassPermissions</code> down to the tools you listed. It only pre-approves those tools at the allow-rule step; every <em>other</em> tool, unmatched by any rule, still falls through to the permission-mode step — where <code>bypassPermissions</code> approves it too. Setting <code>allowed_tools=["Read"]</code> alongside <code>permission_mode="bypassPermissions"</code> still lets Claude call <code>Bash</code>, <code>Write</code>, and everything else. To keep specific tools out of a <code>bypassPermissions</code> session, put them in <code>disallowed_tools</code>, not just off the allow list.</p></div>
<div class="note"><div class="nt">Subagents and permission mode</div><p>A subagent runs in the parent session's permission mode by default. You can give a subagent's definition its own <code>permissionMode</code>, but it only takes effect when the parent session is in <code>default</code>, <code>dontAsk</code>, or <code>plan</code> mode — a parent already running <code>bypassPermissions</code> passes that mode down regardless of what the subagent asks for, and a subagent is never independently escalated <em>into</em> <code>bypassPermissions</code> by its own definition. Least privilege at the subagent level is a tool-list decision (1.3), not a permission-mode override.</p></div>
<h2>Hooks for deterministic actions</h2>
<p>Hooks are the mechanism the blueprint names for "deterministic actions" inside an agent. They run your code, not the model's judgement, at a fixed point in the lifecycle. A <code>PreToolUse</code> hook can inspect a pending tool call and deny it; a <code>PostToolUse</code> hook can lint, format, or append context after a tool runs. Domain 7 covers the mechanics.</p>
<h2>Self-hosted versus Anthropic-hosted</h2>
<div class="tw"><table><thead><tr><th></th><th>Self-hosted (Agent SDK / CLI)</th><th>Anthropic-hosted (Managed Agents)</th></tr></thead><tbody>
<tr><td>Sandbox</td><td>You provide and secure it</td><td>Anthropic runs it</td></tr>
<tr><td>Session state</td><td>You persist transcripts</td><td>Persistent event history included</td></tr>
<tr><td>Billing</td><td>Tokens only</td><td>Tokens plus session runtime per hour</td></tr>
<tr><td>Batch API discount</td><td>Applies to your own Messages API calls</td><td>Does not apply — sessions are stateful and interactive</td></tr>
<tr><td>Fit</td><td>Custom environments, your own infrastructure and controls</td><td>Long-running asynchronous agents without ops overhead</td></tr>
</tbody></table></div>
`,
traps:[
["Using <code>response.content[0].type == 'text'</code> to decide the agent is finished","Claude can return text alongside a <code>tool_use</code> block. The authoritative signal is <code>stop_reason</code>."],
["Appending only the tool results and not the assistant message that requested them","Both turns are required: the assistant message with the <code>tool_use</code> blocks, then a user message with matching <code>tool_result</code> blocks."],
["Sending tool results with <code>role: \"assistant\"</code>","Tool results are sent back in a message with <code>role: \"user\"</code>, as <code>tool_result</code> content blocks."],
["Assuming a default <code>query()</code> call is isolated from the host filesystem","The opposite is true: omitting <code>setting_sources</code> loads user, project, and local settings, exactly like the CLI. A multi-tenant service that needs isolation must pass <code>setting_sources: []</code> deliberately — it is not the default."],
["Believing <code>allowed_tools</code> narrows what <code>bypassPermissions</code> can do","It does not. Unlisted tools simply fall through to the permission mode, and <code>bypassPermissions</code> approves everything that reaches that step. Use <code>disallowed_tools</code> to actually exclude a tool."],
["Reaching for <code>bypassPermissions</code> to stop approval prompts in production","It removes every prompt and grants full system access. For a headless agent with no human to prompt, <code>dontAsk</code> denies instead of asking — use explicit allow rules, deny rules, or a <code>canUseTool</code> callback instead of dropping all checks."],
["Assuming the Batch API discount applies to a Managed Agents session","It does not. Sessions are stateful and interactive; there is no batch mode."]
],
src:[["Agent SDK overview","https://code.claude.com/docs/en/agent-sdk/overview"],["Use Claude Code features in the SDK","https://code.claude.com/docs/en/agent-sdk/claude-code-features"],["Configure permissions","https://code.claude.com/docs/en/agent-sdk/permissions"],["Claude Managed Agents","https://platform.claude.com/docs/en/managed-agents/overview"]]};

L["1.3"]={t:"Agent Patterns and Frameworks",d:1,
lede:"Four patterns account for almost every agent you will build: the tool-use loop, subagents, memory, and context-window management. Frameworks such as LangGraph, PydanticAI, and Strands are abstractions over the same ideas, and the exam cares about the tradeoff, not the API surface.",
body:`
<h2>Pattern 1 — the tool-use loop</h2>
<p>Covered in 1.2. The pattern in the abstract: <em>gather context, take action, verify the result, repeat</em>. The verify step is what separates a reliable agent from a hopeful one. Give the agent a way to check its own work — run the tests, re-read the file, query the record it just wrote — and failure rates drop sharply.</p>
<h2>Pattern 2 — subagents</h2>
<p>A subagent is a nested agent with its own context window, system prompt, and tool set. The parent sends a task description and receives a result; the subagent's intermediate reasoning never enters the parent context.</p>
<pre><code># .claude/agents/db-reviewer.md
---
name: db-reviewer
description: Reviews SQL migrations for lock risk. Use before any schema change.
tools: Read, Grep, Glob
model: sonnet
---
You review migrations for production lock risk. Report findings only.
Never edit files.</code></pre>
<p>Three things to notice, because items test all three:</p>
<ul>
<li>The <code>description</code> is how the parent decides to delegate. A vague description means the subagent is never invoked.</li>
<li>The <code>tools</code> list is a privilege boundary, not a convenience. Omitting <code>Edit</code> is how you make a reviewer that cannot write.</li>
<li>Communication is one-way and lossy. The parent sees only the final result, so a subagent that returns "done" is useless.</li>
</ul>
<h3>Hierarchy versus peer-to-peer: agent teams</h3>
<p>Subagents are hierarchical — a worker reports back to the one caller that spawned it, and that is the only channel it has. Claude Code also ships an experimental peer-to-peer shape, <strong>agent teams</strong>: a team lead spawns several teammates that each keep a full, independent session, work through a shared task list, and message each other directly, without funnelling every exchange back through the lead. The distinction items may probe:</p>
<div class="tw"><table><thead><tr><th></th><th>Subagents</th><th>Agent teams</th></tr></thead><tbody>
<tr><td>Context</td><td>Own window; a summary returns to the caller</td><td>Own window; fully independent, nothing returns automatically</td></tr>
<tr><td>Communication</td><td>Reports a result to the parent only</td><td>Teammates message each other directly and share a task list</td></tr>
<tr><td>Coordination</td><td>The parent manages all delegation</td><td>Teammates can self-claim tasks; the lead assigns and synthesises</td></tr>
<tr><td>Best for</td><td>A focused task where only the final result matters</td><td>Work that benefits from discussion — competing hypotheses, adversarial review</td></tr>
</tbody></table></div>
<p>Agent teams are disabled by default, interactive-only, and cost more than a subagent hierarchy for the same headcount, since every teammate is a full separate session rather than a summary-returning worker. Treat them as the answer when an item specifically describes agents debating, challenging each other's findings, or claiming work from a shared list — not as a general replacement for subagents.</p>
<h2>Pattern 3 — memory</h2>
<p>Agents are stateless between requests; every call carries its own context. Memory is anything that survives that boundary.</p>
<div class="tw"><table><thead><tr><th>Kind</th><th>Lives in</th><th>Good for</th></tr></thead><tbody>
<tr><td>Conversation history</td><td>The <code>messages</code> array you resend</td><td>Short-horizon coherence within a session</td></tr>
<tr><td>File-based memory</td><td>Files the agent reads and writes, such as a scratchpad or notes directory</td><td>Long tasks, plans, and findings that must outlive compaction</td></tr>
<tr><td>Static instructions</td><td><code>CLAUDE.md</code> and rules files</td><td>Conventions that apply to every session</td></tr>
<tr><td>External store</td><td>A database or vector store reached through a tool</td><td>Facts too large or too many to hold in context</td></tr>
</tbody></table></div>
<div class="note"><div class="nt">Key concept</div><p>Writing a plan to a file at the start of a long task is a memory pattern, not bookkeeping. When context is compacted, the file survives and the agent can re-read it. Anything held only in the conversation is at risk.</p></div>
<h2>Pattern 4 — context-window management</h2>
<p>Every tool result, file read, and subagent report consumes context. Left alone, a long-running agent degrades: it starts repeating work, forgetting constraints, or hitting the window ceiling. The countermeasures, in the order you should reach for them:</p>
<ol>
<li><strong>Do not load it.</strong> Search and read the relevant slice instead of the whole file.</li>
<li><strong>Prune tool output.</strong> Truncate or summarise large results before they enter history. Old results in particular can be cleared once acted on.</li>
<li><strong>Isolate.</strong> Push the token-heavy exploration into a subagent and keep the summary.</li>
<li><strong>Compact.</strong> Summarise the conversation so far and continue from the summary.</li>
<li><strong>Externalise.</strong> Move state to files the agent can re-read on demand.</li>
</ol>
[[FIG:context]]
<h2>Frameworks</h2>
<p>The blueprint names Strands, LangGraph, and PydanticAI as examples of agentic abstraction frameworks. You are not expected to write code in them; you are expected to reason about when a framework helps.</p>
<div class="tw"><table><thead><tr><th>Framework</th><th>Organising idea</th><th>Leans toward</th></tr></thead><tbody>
<tr><td><strong>LangGraph</strong></td><td>The agent is a graph of nodes and edges with explicit state</td><td>Auditable, resumable, cyclic workflows where you want to see and control the transitions</td></tr>
<tr><td><strong>PydanticAI</strong></td><td>Typed Python: tools and outputs are validated against Pydantic models</td><td>Type safety and validated structured output in Python services</td></tr>
<tr><td><strong>Strands</strong></td><td>Model-driven loop with a light SDK, AWS-aligned</td><td>Getting a model-driven agent running quickly with minimal scaffolding</td></tr>
<tr><td><strong>Claude Agent SDK</strong></td><td>Claude Code's harness as a library</td><td>Claude-native agents that want built-in tools, hooks, subagents, and permissions out of the box</td></tr>
</tbody></table></div>
<div class="note v"><div class="nt">The tradeoff to state in an answer</div><p>A framework buys you state management, retries, observability, and a shared vocabulary. It costs you a layer of abstraction between your code and the Messages API, which makes unusual requirements harder and debugging indirect. Anthropic's own guidance is to start with direct API calls and add a framework only when the abstraction is earning its keep.</p></div>
<h2>Choosing a decomposition</h2>
<p>Task decomposition questions usually resolve to one of three shapes:</p>
<ul>
<li><strong>Sequential</strong> — each step needs the previous result. Chain them; do not parallelise.</li>
<li><strong>Independent</strong> — steps share no data. Fan out in parallel, then join.</li>
<li><strong>Unknown</strong> — the shape depends on what the first step finds. Let the model decompose at run time (orchestrator&ndash;workers).</li>
</ul>
`,
traps:[
["Splitting a sequential task across parallel subagents","If step two needs step one's output, parallelising produces subagents working from stale or absent information. Parallelism requires independence."],
["Expecting a subagent to inherit the parent's full context","It does not. Subagents exist precisely to avoid that. Pass what the subagent needs in its task description."],
["Reaching for agent teams whenever more than one subagent is involved","Agent teams add peer-to-peer messaging and a shared task list at a real token cost — every teammate is a full session, not a summary-returning worker. If subagents reporting back to one manager already solve the task, that hierarchy is cheaper."],
["Treating compaction as free","Compaction is lossy. Details not carried into the summary are gone. Durable facts belong in files, not in the hope that the summary keeps them."],
["Adopting a framework to 'make the agent more reliable'","Frameworks manage plumbing. Reliability comes from a clear goal, a small tool set, verification steps, and deterministic guardrails."],
["Assuming more memory is always better","Stale or contradictory memory actively harms behaviour. Memory needs curation and expiry as much as it needs writes."]
],
src:[["Building effective agents","https://www.anthropic.com/engineering/building-effective-agents"],["Subagents in the SDK","https://code.claude.com/docs/en/agent-sdk/subagents"],["Orchestrate teams of Claude Code sessions","https://code.claude.com/docs/en/agent-teams"],["Effective context engineering","https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents"]]};

Q.push(
{i:"q101",d:1,s:"1.1",q:"An invoice-processing pipeline runs the same four steps on every document: extract fields, validate against the PO, classify the exception type, and write to the ledger. The steps never change order. Which architecture fits best?",
o:["An agent with all four operations exposed as tools, letting it decide the order","A deterministic workflow that chains four model calls in a fixed sequence","A manager agent that spawns four subagents in parallel","A single prompt asking Claude to do all four steps at once"],a:1,
r:"The sequence is known in advance and never varies, so control flow belongs in your code. A workflow is cheaper, faster, testable, and auditable. An agent adds non-determinism for no benefit, parallel subagents break the dependency chain, and one prompt for four distinct stages degrades quality on each."},
{i:"q102",d:1,s:"1.1",q:"A team wants an agent that audits a large monorepo. Early runs exhaust the context window before finishing. Which structural change addresses the cause?",
o:["Raise max_tokens so responses are not truncated","Use subagents so each area is explored in an isolated context and only findings return to the manager","Increase the iteration cap so the agent has more turns to finish","Switch to a model with a higher temperature for more varied exploration"],a:1,
r:"Context exhaustion is a context-isolation problem. Subagents burn their own windows and return compact findings, so the manager context stays small. max_tokens governs output length only, more iterations make the problem worse, and temperature is unrelated."},
{i:"q103",d:1,s:"1.1",q:"A payments agent must obtain a fraud check before any transfer above a threshold. Compliance requires that this can never be skipped. What is the correct implementation?",
o:["Add a strongly worded rule to the system prompt describing the requirement","Enforce the check programmatically in the transfer path, outside the model's control","Use multi-shot examples that always show the fraud check being performed first","Set tool_choice to any so the agent must always call a tool"],a:1,
r:"Absolute compliance requirements are enforcement problems, not prompting problems. Prompts and examples influence behaviour but do not guarantee it. Programmatic enforcement — code, a permission rule, or a hook — is the only answer that cannot be talked out of."},
{i:"q104",d:1,s:"1.1",q:"Which description matches the orchestrator–workers pattern rather than parallelisation?",
o:["Three predefined subtasks always run concurrently and their results are merged","The same prompt runs five times and the majority answer is taken","A lead model reads the task, decides at run time how to split it, and dispatches to workers","A classifier routes each input to one of several specialised prompts"],a:2,
r:"The distinguishing feature of orchestrator–workers is that the decomposition happens at run time, decided by the model. Predefined concurrent subtasks are parallelisation by sectioning, repeated runs are parallelisation by voting, and the classifier case is routing."},
{i:"q105",d:1,s:"1.2",q:"A developer's agent loop terminates early on complex requests. The loop checks whether response.content[0].type equals 'text' to decide the task is done. What is the fix?",
o:["Add an iteration cap of 15 so the loop runs long enough","Branch on response.stop_reason: continue while it is tool_use, stop at end_turn","Set tool_choice to any so Claude never returns plain text","Parse the assistant text for a completion phrase before exiting"],a:1,
r:"Claude routinely returns explanatory text alongside a tool_use block, so a content-type check reports completion while work remains. stop_reason is the deterministic signal. Iteration caps address runaway loops, not premature exit; forcing tool_choice prevents the agent from ever finishing; and parsing natural language reintroduces ambiguity."},
{i:"q106",d:1,s:"1.2",q:"After Claude returns tool_use blocks and your code executes the tools, how must the results be sent back?",
o:["As a message with role assistant containing tool_result blocks","As a new system prompt containing the tool output","As a message with role user containing tool_result blocks that echo each tool_use_id","As a plain text user message describing what the tools returned"],a:2,
r:"Tool results are returned in a user-role message as tool_result blocks, each carrying the matching tool_use_id. The assistant message containing the tool_use blocks must also be appended to history first. Plain text loses the linkage, and there is no system-prompt mechanism for results."},
{i:"q107",d:1,s:"1.2",q:"A single process built with the Claude Agent SDK handles requests for several different customers, calling query() with default options each time. What is the risk in this design?",
o:["There is no risk — the SDK never touches the filesystem unless a tool call requests it","Omitting setting_sources loads user, project, and local settings from the host, so one tenant's CLAUDE.md or saved memory can leak into another tenant's session","The SDK refuses to run without an explicit setting_sources value, so the service will not start","Each query() call requires a separate API key, so tenants are isolated automatically"],a:1,
r:"Leaving setting_sources unset is equivalent to [\"user\",\"project\",\"local\"] — the same filesystem scopes the CLI reads, including CLAUDE.md, settings.json, skills, and auto memory. In a shared process that is a cross-tenant leak, not a safe default. Multi-tenant deployments should pass setting_sources: [] and disable auto memory explicitly."},
{i:"q108",d:1,s:"1.2",q:"Which statement about Agent SDK permission handling is correct?",
o:["bypassPermissions is the recommended production setting because it avoids interruptions","A deny rule blocks a tool even when the session runs in bypassPermissions mode","allowed_tools overrides any deny rule that names the same tool","Permission modes apply only to built-in tools, not to MCP tools"],a:1,
r:"Deny rules are checked first and win, including in bypassPermissions mode. bypassPermissions grants full autonomous system access and belongs only in a controlled sandbox. Allow rules do not override deny rules, and permission handling covers MCP tools too."},
{i:"q109",d:1,s:"1.3",q:"An agent repeatedly calls the same search tool with identical arguments and makes no progress. Which cause should you investigate first?",
o:["The model temperature is set too low","Tool results are not being appended to the conversation history","The system prompt is too short","max_tokens is set too high"],a:1,
r:"Repeating an identical call is the classic signature of the model never seeing the result. If the tool_result never reaches history, the model has no new information and re-requests the same thing. Temperature, prompt length, and max_tokens do not produce this pattern."},
{i:"q110",d:1,s:"1.3",q:"A long-running agent must remember a plan across a context compaction. What is the most reliable approach?",
o:["Repeat the plan in every user message","Write the plan to a file the agent can re-read after compaction","Increase the context window by switching models","Rely on the compaction summary to retain the plan"],a:1,
r:"Compaction is lossy by design, so anything held only in the conversation is at risk. Writing the plan to a file makes it durable and selectively re-readable. Repeating it every turn wastes tokens, and a bigger window delays the problem without solving it."},
{i:"q111",d:1,s:"1.3",q:"Which task is the poorest fit for splitting across parallel subagents?",
o:["Searching six services for references to a deprecated field","Reviewing one pull request for security, performance, and style","A refactor where each file's change depends on the type signature produced by the previous file","Gathering documentation from four independent vendor sites"],a:2,
r:"Parallelism requires independence. When each step consumes the previous step's output, parallel subagents work from absent or stale information. The other three are genuinely independent and compress well into summaries."},
{i:"q112",d:1,s:"1.3",q:"What is the primary tradeoff a team accepts when adopting an agentic framework such as LangGraph or PydanticAI instead of calling the Messages API directly?",
o:["Frameworks make the model more accurate but cost more per token","Frameworks provide state management and observability but add an abstraction layer that complicates unusual requirements and debugging","Frameworks eliminate the need for evals","Frameworks remove the need to handle rate limits"],a:1,
r:"A framework buys state handling, retries, and observability at the cost of indirection between your code and the API. It does not change model accuracy, remove the need for evals, or handle rate limits for you. Anthropic's guidance is to start direct and add abstraction when it earns its place."},
);
