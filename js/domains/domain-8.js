L["8.1"]={t:"Tool Implementation",d:8,
lede:"A tool is a prompt as much as it is a function. The description and schema are read by the model on every request, and most 'the model calls the wrong tool' problems are description problems, not model problems.",
body:`
<h2>Anatomy of a good tool</h2>
<pre><code>{
  "name": "get_order_status",
  "description": "Retrieve the current status and delivery estimate for one order. Use this whenever the customer asks where an order is, whether it shipped, or when it will arrive. Requires the order ID; if the customer has not given one, call search_orders first.",
  "input_schema": {
    "type": "object",
    "properties": {
      "order_id": {
        "type": "string",
        "description": "Order ID in the form ORD-12345, as shown on the confirmation email"
      }
    },
    "required": ["order_id"],
    "additionalProperties": false
  }
}</code></pre>
<p>The description does four jobs: what it does, <strong>when to use it</strong>, what it needs, and how it relates to neighbouring tools. The "when" clause is the one people omit and the one that decides whether the tool is ever selected.</p>
<div class="note"><div class="nt">Key concept</div><p>Anthropic's guidance is to write tool descriptions as if for a new engineer who has never seen your system. Ambiguity that a colleague would resolve by asking is ambiguity the model resolves by guessing.</p></div>
<h2>Designing the tool set</h2>
<ul>
<li><strong>Few, distinct tools</strong> beat many overlapping ones. Overlap is where wrong selection comes from — if two tools could plausibly answer the same request, say in each description when to prefer the other.</li>
<li><strong>Right granularity.</strong> Not one <code>do_everything(action, payload)</code> tool, and not forty micro-tools that need six calls to accomplish anything. Aim for the units a competent human would ask for.</li>
<li><strong>Every definition is billed input, every request.</strong> Tool schemas plus a tool-use system prompt of a few hundred tokens are in the window whenever tools are present. Scope the set to the task; where it is genuinely large, use tool search to load definitions on demand.</li>
<li><strong>Constrain in the schema, not in prose.</strong> An <code>enum</code> is worth a paragraph of "valid values are...".</li>
<li><strong>Return what is useful, not what is available.</strong> A tool that returns a 200 KB payload when six fields matter is a context problem you created.</li>
</ul>
<h2>Tool errors</h2>
<pre><code>{
  "type": "tool_result",
  "tool_use_id": "toolu_01ABC",
  "is_error": true,
  "content": "Order ORD-99999 not found. Order IDs look like ORD-12345. Try search_orders with the customer's email."
}</code></pre>
<ul>
<li>Return errors <strong>to the model</strong> as a tool result, rather than raising and killing the loop. An informative error lets Claude recover on the next turn.</li>
<li>Make the message actionable: what went wrong, and what to try instead.</li>
<li>Never leak a stack trace, a connection string, or internal identifiers into the error text — it goes into the context and can reach the user.</li>
<li>Distinguish "not found" from "not permitted" from "service unavailable". Each deserves different agent behaviour.</li>
</ul>
<h2>Client-side, server-side, and approval</h2>
<div class="tw"><table><thead><tr><th>Kind</th><th>Executes</th><th>Notes</th></tr></thead><tbody>
<tr><td><strong>Client-side (custom)</strong></td><td>Your code, between turns</td><td>You control execution, authorisation, and logging. Priced as ordinary tokens</td></tr>
<tr><td><strong>Server-side (built-in)</strong></td><td>Anthropic's infrastructure, inside the turn</td><td>Web search, web fetch, code execution. Reported in <code>usage.server_tool_use</code>; some carry their own charges</td></tr>
<tr><td><strong>MCP tools</strong></td><td>An MCP server, local or remote</td><td>Appear as <code>mcp__&lt;server&gt;__&lt;tool&gt;</code>. Results are untrusted content</td></tr>
</tbody></table></div>
<p>Approval patterns, from most to least permissive: run automatically; ask the user per call; ask once and remember for the session; deny outright. Deny rules are checked first and win everywhere, including in permissive modes. Mutating and irreversible tools should require approval or a deterministic gate; read-only tools usually should not, because prompting on everything trains people to click through.</p>
<h2>Dispatch in an agentic harness</h2>
<p>The harness maps tool names to implementations and executes them between model turns. What a robust dispatcher does:</p>
<ol>
<li>Look up the handler by name; return a clear tool error for an unknown name rather than crashing.</li>
<li>Validate the input against the schema before executing. The model's output is untrusted input.</li>
<li>Check authorisation against the session identity, not against anything in the tool input.</li>
<li>Apply a timeout, and return a timeout as a tool error.</li>
<li>Run independent tool calls from the same turn in parallel where safe; return all results in one user message.</li>
<li>Log the call, its arguments, its outcome, and its duration.</li>
</ol>
<h2>Testing tools</h2>
<ul>
<li>Unit-test the implementation like any function.</li>
<li>Separately test <strong>selection</strong>: given realistic prompts, does Claude pick the right tool with the right arguments? That tests the description and schema, which is where the defects are.</li>
<li>Test the error paths — the model's recovery behaviour is part of the contract.</li>
</ul>
`,
traps:[
["Writing a description that says what the tool does but not when to use it","The 'when' clause is what drives selection. Without it the tool is invisible to the model."],
["Raising an exception when a tool fails","Return <code>is_error: true</code> with a helpful message so Claude can adapt."],
["Adding tools without counting the token cost","Every definition is input on every request, plus a tool-use system prompt whenever any tool is present."],
["Two tools with overlapping descriptions","The model will pick inconsistently. Differentiate them and cross-reference in the descriptions."],
["Trusting tool arguments because the model generated them","Model output is untrusted input. Validate against the schema and authorise server-side."],
["Returning the full API payload as the tool result","It floods the context. Return the fields that matter."]
],
src:[["Tool use overview","https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview"],["How to implement tool use","https://platform.claude.com/docs/en/agents-and-tools/tool-use/implement-tool-use"]]};

L["8.2"]={t:"MCP Server Development",d:8,
lede:"MCP is the open protocol that lets one server expose capabilities to many clients. Its value on the exam is almost always the same: reuse across applications, maintained independently of any one of them.",
body:`
<h2>The model</h2>
<p>A <strong>host</strong> application (Claude Code, Claude Desktop, your Agent SDK app) runs one <strong>client</strong> per connected <strong>server</strong>. The server exposes capabilities; the client surfaces them to the model.</p>
[[FIG:mcp]]
<div class="tw"><table><thead><tr><th>Primitive</th><th>Controlled by</th><th>Is</th></tr></thead><tbody>
<tr><td><strong>Tools</strong></td><td>The model</td><td>Functions Claude can call. The primitive you will use most</td></tr>
<tr><td><strong>Resources</strong></td><td>The application</td><td>Readable data identified by URI — files, records, documents</td></tr>
<tr><td><strong>Prompts</strong></td><td>The user</td><td>Reusable templates the user invokes, typically as slash commands</td></tr>
</tbody></table></div>
<h2>Transports</h2>
<div class="tw"><table><thead><tr><th>Transport</th><th>Shape</th><th>Use for</th></tr></thead><tbody>
<tr><td><strong>stdio</strong></td><td>The client launches the server as a subprocess and speaks JSON-RPC over stdin/stdout</td><td>Local servers: filesystem, local database, developer tooling. No network exposure</td></tr>
<tr><td><strong>HTTP</strong> (Streamable HTTP)</td><td>A remote server over HTTP, streaming responses back to the client</td><td>The recommended, current transport for shared, centrally hosted servers. Needs authentication and transport security</td></tr>
<tr><td><strong>SSE</strong></td><td>The older remote transport, server-sent events only</td><td><strong>Deprecated.</strong> Some servers still only expose it; a client tries HTTP first and falls back to SSE</td></tr>
<tr><td><strong>In-process (SDK)</strong></td><td>An MCP server running inside your own application process</td><td>Exposing your own Python or TypeScript functions to the Agent SDK without a separate process</td></tr>
</tbody></table></div>
<p>A stdio server inherits the environment of the process that launched it, which is how it receives credentials. A remote server needs real authentication — OAuth where supported, with automatic discovery of the authorization server, so users grant access instead of sharing a static token.</p>
<div class="note"><div class="nt">Naming to recognise</div><p>An item may say "HTTP with SSE" describing the old combined transport, or "streamable-http" naming the current one precisely — both point at the same "HTTP" row above. Plain "SSE" on its own is the deprecated, HTTP-less predecessor, not a synonym for either. A fifth option, WebSocket, exists for the narrow case of a remote server that must push events to the client unprompted rather than only respond to requests — rare enough that stdio versus HTTP is the distinction that actually gets tested.</p></div>
<h2>When MCP is the right answer</h2>
<div class="note"><div class="nt">The exam signal</div><p>Look for the words <strong>reusable across several applications</strong> and <strong>maintained independently</strong>. That is an MCP server. A capability needed by exactly one application is a custom tool — building a server for it adds a process, a protocol, and a deployment for no gain.</p></div>
<div class="tw"><table><thead><tr><th>Situation</th><th>Answer</th></tr></thead><tbody>
<tr><td>Several Claude applications need the same internal API</td><td>MCP server</td></tr>
<tr><td>One application needs one internal function</td><td>Custom tool</td></tr>
<tr><td>A vendor already publishes a server for their product</td><td>Connect to it; do not rebuild it</td></tr>
<tr><td>You need the model to browse the live web</td><td>Built-in server-side tool, not a custom server</td></tr>
<tr><td>You need a documented procedure, not a new capability</td><td>A Skill</td></tr>
</tbody></table></div>
<h2>Authoring guidance</h2>
<ul>
<li><strong>Tool descriptions are prompts.</strong> Everything from 8.1 applies unchanged.</li>
<li><strong>Namespace cleanly.</strong> Tools surface as <code>mcp__&lt;server&gt;__&lt;tool&gt;</code>; a plugin-bundled server expands that to <code>mcp__plugin_&lt;plugin&gt;_&lt;server&gt;__&lt;tool&gt;</code>. Matchers and permission rules are written against that full name.</li>
<li><strong>Keep the surface small.</strong> A server exposing sixty tools floods the context of every client that connects. Group by task, and rely on tool search where the set must be large.</li>
<li><strong>Return compact results</strong> with a field to request more detail, rather than everything by default.</li>
<li><strong>Handle errors in-protocol</strong> so the client can pass an informative failure back to the model.</li>
<li><strong>Version and document</strong> the server. Several applications depend on it now; a breaking change breaks all of them at once.</li>
</ul>
<h2>Security considerations</h2>
<ul>
<li>A server's output is <strong>untrusted content</strong> to the model, even when you wrote the server, because the data it returns may come from elsewhere.</li>
<li>Authorise inside the server against the caller, not against arguments the model supplied.</li>
<li>Scope credentials to the minimum the server needs.</li>
<li>Third-party servers are a supply-chain risk: they run code and see your data. Review them, and prefer an organisation-approved list. Administrators can restrict which servers may be added or connected with managed configuration and allow or deny lists.</li>
</ul>
`,
traps:[
["Building an MCP server for a capability only one application will ever use","That is a custom tool. MCP earns its cost through reuse."],
["Assuming a built-in tool can reach an arbitrary internal REST API","Built-in tools are a fixed set. Internal systems need a custom tool or an MCP server."],
["Exposing an entire API surface as one tool per endpoint","Sixty tool definitions in every client's context. Design task-level tools."],
["Trusting MCP results because the server is yours","The data inside may be attacker-controlled. Treat results as untrusted content."],
["Writing a permission rule against the bare server name","Tools are namespaced <code>mcp__&lt;server&gt;__&lt;tool&gt;</code>. Match with <code>mcp__server__.*</code>."],
["Building a new remote server on the plain SSE transport","SSE on its own is deprecated. Build on HTTP (Streamable HTTP); keep SSE only as a fallback for servers you don't control that haven't migrated yet."]
],
src:[["Connect Claude Code to tools via MCP","https://code.claude.com/docs/en/mcp"],["MCP in the Agent SDK","https://code.claude.com/docs/en/agent-sdk/mcp"],["MCP specification","https://modelcontextprotocol.io"]]};

L["8.3"]={t:"Agentic Customization",d:8,
lede:"Four ways to extend Claude — built-in tools, custom tools, Skills, and MCP — and one decision tree that items keep asking you to walk. The distinction that matters most: a Skill teaches a procedure, a tool grants a capability.",
body:`
<h2>The four options</h2>
<div class="tw"><table><thead><tr><th>Option</th><th>Gives Claude</th><th>Lives</th><th>Cost in context</th></tr></thead><tbody>
<tr><td><strong>Built-in tool</strong></td><td>A capability Anthropic maintains: web search, web fetch, code execution, bash, text editor, computer use, browser use</td><td>Anthropic's infrastructure or the harness</td><td>Definition tokens; some carry usage charges</td></tr>
<tr><td><strong>Custom tool</strong></td><td>A capability you implement, for this application</td><td>Your code</td><td>Definition tokens on every request</td></tr>
<tr><td><strong>Skill</strong></td><td>Knowledge and procedure — how <em>you</em> want a task done</td><td>A folder with <code>SKILL.md</code> and supporting files</td><td>Near zero until invoked, then only what it loads</td></tr>
<tr><td><strong>MCP server</strong></td><td>A capability shared across applications, over a standard protocol</td><td>A separate process or service</td><td>Definition tokens per connected tool</td></tr>
</tbody></table></div>
[[FIG:choose]]
<div class="note"><div class="nt">Two similarly named built-ins</div><p><strong>Computer use</strong> and <strong>browser use</strong> are separate built-in tools, not two names for the same thing. Computer use drives a full desktop — mouse, keyboard, arbitrary applications. Browser use is scoped to a browser: navigation, page state, and page content, which is a narrower and usually safer surface when the task is really "operate a web app" rather than "operate a computer".</p></div>
<h2>The decision tree</h2>
<ol>
<li><strong>Does Claude already have the capability?</strong> Use the built-in tool. Do not rebuild web search.</li>
<li><strong>Is it knowledge or procedure rather than a new capability?</strong> Skill. If Claude already <em>can</em> do it but does it wrong, the gap is instruction, not tooling.</li>
<li><strong>Is it a new capability needed by several applications, or maintained by a separate team?</strong> MCP server.</li>
<li><strong>Is it a new capability for this one application?</strong> Custom tool.</li>
<li><strong>Must it happen deterministically, every time?</strong> None of the above — a hook or a permission rule.</li>
</ol>
<div class="note"><div class="nt">Key concept</div><p>A <strong>Skill teaches a procedure; a tool grants a capability.</strong> "Claude does not know our report format" is a Skill. "Claude cannot query our warehouse" is a tool or an MCP server. "Claude must never drop a table" is a hook.</p></div>
<h2>Skills in more depth</h2>
<p>A Skill is a folder containing <code>SKILL.md</code> with <code>name</code> and <code>description</code> frontmatter, plus any scripts, templates, and reference files. The model reads only the name and description until the task matches, then loads the body, then loads supporting files as needed. That progressive disclosure is why skills scale where CLAUDE.md does not: a hundred skills cost almost nothing until one is relevant.</p>
<ul>
<li>Skills can bundle executable scripts, so they are not limited to prose.</li>
<li>Skills can declare hooks in frontmatter, which stay registered for the session after invocation.</li>
<li>Plugin-provided skills are namespaced by plugin.</li>
<li>Skills are portable across Claude surfaces in a way that a bespoke tool implementation is not.</li>
</ul>
<h2>Comparing on the axes items use</h2>
<div class="tw"><table><thead><tr><th>Axis</th><th>Built-in</th><th>Custom tool</th><th>Skill</th><th>MCP</th></tr></thead><tbody>
<tr><td>Reuse across apps</td><td>Universal</td><td>One app</td><td>Portable files</td><td>Designed for it</td></tr>
<tr><td>Maintenance owner</td><td>Anthropic</td><td>Your app team</td><td>Whoever owns the folder</td><td>A separate team or vendor</td></tr>
<tr><td>Grants new capability</td><td>Yes</td><td>Yes</td><td>No</td><td>Yes</td></tr>
<tr><td>Always in context</td><td>Yes, when registered</td><td>Yes, when registered</td><td>No — on demand</td><td>Yes, when connected</td></tr>
<tr><td>Deployment overhead</td><td>None</td><td>Low</td><td>None</td><td>A service to run and secure</td></tr>
</tbody></table></div>
<h2>Combining them</h2>
<p>Real systems use all four, and items sometimes ask for the combination. A code-review agent might use built-in file tools to read, an MCP server to reach the issue tracker, a Skill encoding the team's review checklist, a custom tool to post the verdict to an internal service, and a <code>PreToolUse</code> hook that blocks any write outside the working directory. Each layer does the job it is shaped for.</p>
<h2>Plugins as the packaging</h2>
<p>A plugin bundles commands, skills, subagents, hooks, and MCP servers into one installable unit distributed through a marketplace. When an item asks how to give a whole team the same extensions consistently, the answer is a plugin from an organisation marketplace, with versions pinned — not a README telling everyone which files to copy.</p>
`,
traps:[
["Building a custom tool for something a built-in tool already does","Rebuilding web search or code execution adds cost and maintenance for no capability."],
["Using a Skill to grant a capability Claude does not have","Skills carry instructions and files. They cannot reach your database on their own."],
["Putting a rarely used procedure in CLAUDE.md instead of a Skill","CLAUDE.md is loaded every session. Skills load on demand — that is the whole point."],
["Choosing MCP for a single-application capability","The protocol, process, and deployment only pay off across multiple consumers."],
["Solving a 'must always happen' requirement with any of the four","None of them is deterministic. That is a hook or a permission rule."]
],
src:[["Extend Claude Code","https://code.claude.com/docs/en/features-overview"],["Agent Skills overview","https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview"],["Create plugins","https://code.claude.com/docs/en/plugins"]]};

Q.push(
{i:"q801",d:8,s:"8.1",q:"A team needs Claude to call an internal inventory service exposed as a REST API. The capability must be reusable across several Claude applications and maintained independently of any one app. Which approach fits best?",
o:["Hard-code the inventory logic into each application's system prompt","Build an MCP server that exposes the inventory operations as tools so multiple Claude applications can connect to it","Paste the current inventory data into the context window on every request","Rely on a built-in tool, since built-in tools can reach any internal REST API"],a:1,
r:"An MCP server exposes reusable tools that multiple applications share and that can be maintained independently. Prompt hard-coding is neither reusable nor maintainable, pasted data gives no live access and wastes context, and built-in tools do not automatically reach arbitrary internal APIs."},
{i:"q802",d:8,s:"8.1",q:"Claude has a suitable tool registered but never calls it. Which is the most likely cause?",
o:["The tool's input_schema uses enum values","The description explains what the tool does but not when to use it","The tool name is too short","tool_choice is set to auto"],a:1,
r:"Selection is driven by the description, and the 'when to use this' clause is the part people omit. Enums help rather than hinder, and auto is the normal default that permits tool use."},
{i:"q803",d:8,s:"8.3",q:"Claude can already access a team's data through existing tools but formats the weekly report incorrectly every time. What is the right extension mechanism?",
o:["A new custom tool for report generation","A Skill that encodes the team's report procedure and format","An MCP server for the reporting system","A PreToolUse hook that rewrites the output"],a:1,
r:"The capability exists; the knowledge does not. A Skill teaches a procedure and loads on demand. A tool or MCP server would add capability that is not missing, and hooks are for deterministic enforcement rather than formatting knowledge."},
{i:"q804",d:8,s:"8.3",q:"Which statement correctly distinguishes Skills from tools?",
o:["Skills are faster versions of tools","A Skill teaches a procedure and loads on demand; a tool grants a capability and its definition is in context whenever it is registered","Skills can only be used in Claude Code, tools only through the API","Tools are written in Markdown, Skills in JSON"],a:1,
r:"The capability-versus-procedure distinction is the core one, and the context-cost difference follows from it: skills cost almost nothing until invoked, while every registered tool definition is billed input on every request."},
{i:"q805",d:8,s:"8.2",q:"Which MCP transport is appropriate for a server that runs locally alongside the client and needs no network exposure?",
o:["HTTP with server-sent events","stdio, with the client launching the server as a subprocess","WebSocket","gRPC"],a:1,
r:"stdio has the client launch the server as a subprocess and speak JSON-RPC over stdin and stdout, which suits local servers such as filesystem or local database access. Remote shared servers use the HTTP (streamable HTTP) transport and need real authentication; plain SSE is its deprecated predecessor, and WebSocket covers the narrow push-style case."},
{i:"q806",d:8,s:"8.2",q:"Which MCP primitive is model-controlled?",
o:["Resources","Prompts","Tools","Transports"],a:2,
r:"Tools are model-controlled: Claude decides to call them. Resources are application-controlled readable data, and prompts are user-controlled templates typically surfaced as slash commands."},
{i:"q807",d:8,s:"8.1",q:"A tool returns a 200 KB JSON payload when only six fields matter to the task. What is the consequence?",
o:["No consequence; extra fields are ignored","The payload floods the context window, raising cost on every subsequent turn and crowding out signal","The API rejects tool results over 100 KB","The model automatically summarises it"],a:1,
r:"Tool results enter the conversation and are re-sent on every following turn. Returning what is useful rather than what is available is a core tool-design rule and one of the largest sources of avoidable context bloat."},
{i:"q808",d:8,s:"8.3",q:"An organisation wants every engineer to have the same Claude Code commands, skills, subagents, hooks, and MCP servers, with versions pinned. What is the right mechanism?",
o:["A README describing which files to copy","A plugin distributed through an organisation marketplace with dependency versions constrained","A single large CLAUDE.md committed to every repository","Managed settings alone"],a:1,
r:"Plugins package commands, skills, subagents, hooks, and MCP servers as one installable unit, distributed through a marketplace with version constraints. Managed settings enforce policy but do not distribute components, and copied files drift immediately."},
{i:"q809",d:8,s:"8.2",q:"Why should MCP tool results be treated as untrusted content even when you wrote the server?",
o:["Because MCP servers cannot be authenticated","Because the data the server returns may originate elsewhere and can carry injected instructions","Because MCP results bypass the context window","Because the protocol does not support error handling"],a:1,
r:"Trust in the server author says nothing about the data the server relays. A server returning email bodies, web content, or third-party records is delivering attacker-influenceable content into your context."}
);
