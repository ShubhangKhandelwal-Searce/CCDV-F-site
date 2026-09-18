L["5.1"]={t:"LLM Fundamentals",d:5,
lede:"The exam wants the working engineer's model of how these systems behave: tokens as the unit of cost and limit, next-token generation as the reason output is non-deterministic, and the prompting techniques named by their proper terms.",
body:`
<h2>Tokens</h2>
<ul>
<li>A token is a fragment of text — roughly four characters or 0.75 words in English, but highly variable across languages, code, and structured data.</li>
<li>Both input and output are billed per token, and <strong>output costs several times more than input</strong> on every tier. Long generations dominate the bill.</li>
<li>Tokenisers change between model generations. Claude 4.7 and later — which includes every current top-tier model — use a newer tokeniser that produces roughly <strong>30% more tokens</strong> for the same text than the one Sonnet 4.6 and earlier used. A cheaper or unchanged headline rate does not guarantee a cheaper bill after a migration. Measure on your own traffic.</li>
<li>Use the token counting endpoint to estimate before sending.</li>
</ul>
<h2>Context windows</h2>
<p>The context window is the total budget for system prompt, tools, conversation history, documents, tool results, thinking, and the response. Current Fable 5.1, Opus 5 and Sonnet 5 offer 1M tokens; Haiku 4.5 offers 200K. Max output is 128K on the larger models and 64K on Haiku 4.5.</p>
<div class="note"><div class="nt">Key concept</div><p>A large window is a budget, not a strategy. Filling it degrades attention and raises cost and latency on every subsequent turn. The discipline of context engineering is putting the <em>smallest high-signal set of tokens</em> in the window, not the largest set that fits.</p></div>
<h2>Next-token generation and non-determinism</h2>
<p>The model produces a probability distribution over the next token, samples from it, appends, and repeats. Two consequences you are expected to reason about:</p>
<ul>
<li><strong>Output is not deterministic</strong> — and on current models you no longer get a dial to push it toward determinism (see below). Design for validation, not for equality assertions, regardless.</li>
<li><strong>Errors compound.</strong> A wrong token early conditions everything after it. This is why verification steps in an agent loop matter so much more than a better final-answer prompt.</li>
</ul>
<h3>Sampling parameters — mostly retired on current models</h3>
<p>The classic sampling controls still exist in the API surface, but the exam blueprint's own generation has moved past them. On <strong>every model this guide covers</strong> — Fable 5.1, Opus 5, Sonnet 5, and Haiku 4.5, all released after Claude Opus 4.6 — <code>temperature</code>, <code>top_p</code>, and <code>top_k</code> are deprecated: each accepts only its default value and rejects anything else with a <strong>400</strong>, not a silent clamp or ignore.</p>
<div class="tw"><table><thead><tr><th>Parameter</th><th>Classic effect</th><th>Status on this generation</th></tr></thead><tbody>
<tr><td><code>temperature</code></td><td>Flattened or sharpened the distribution</td><td>Fixed at <code>1.0</code>. Any other value is a 400</td></tr>
<tr><td><code>top_p</code></td><td>Sampled from the smallest set of tokens above a cumulative probability</td><td>Deprecated the same way, on the same models</td></tr>
<tr><td><code>top_k</code></td><td>Sampled only from the k most likely tokens</td><td>Deprecated the same way, on the same models</td></tr>
<tr><td><code>stop_sequences</code></td><td>Ends generation when a string appears</td><td>Unaffected. Still a live, useful control</td></tr>
<tr><td><code>max_tokens</code></td><td>Hard ceiling on output length</td><td>Unaffected. Required on every request</td></tr>
</tbody></table></div>
<div class="note v"><div class="nt">Why the controls disappeared instead of just changing defaults</div><p>This was not an oversight — it is where the model of control moved. What temperature, top_p, and a fixed thinking budget used to trade off (how much the model explores versus commits) is now governed by <strong>adaptive thinking and effort</strong>: more effort spends more reasoning before answering, rather than sampling more or less sharply after. If you want more consistent formatting, that is a schema or a forced tool call (6.3), not a sampling parameter — sampling was never actually the reliable lever for format consistency anyway.</p></div>
<p>Sampling parameters were never a security control, and the deprecation does not change that: raising "unpredictability" to resist a jailbreak or prompt injection was always a distractor answer, and now it is also a request that simply fails.</p>
<h2>Thinking, effort, and speed</h2>
<div class="tw"><table><thead><tr><th>Option</th><th>What it does</th></tr></thead><tbody>
<tr><td><strong>Extended thinking</strong></td><td>The model reasons in <code>thinking</code> blocks before answering. Billed as output tokens</td></tr>
<tr><td><strong>Adaptive thinking</strong></td><td>The model decides how much to think per request. On current top models, controlled by <code>effort</code> rather than a fixed budget. Always on for Fable 5.1</td></tr>
<tr><td><strong>Effort levels</strong></td><td><code>low</code> through <code>high</code>, with <code>xhigh</code> and <code>max</code> on some models. Higher effort trades latency and tokens for quality. Haiku 4.5 does not support the effort parameter</td></tr>
<tr><td><strong>Fast mode</strong></td><td>Research preview. Faster output on <strong>Opus 5 and Opus 4.8 only</strong> — not Opus 4.7, not Sonnet, not Haiku, not Fable — at $10 / $50 per MTok, applied across the full context window. API-only (not on Bedrock or partner clouds); not available with the Batch API</td></tr>
</tbody></table></div>
<h2>Prompting techniques, by name</h2>
<div class="tw"><table><thead><tr><th>Term</th><th>Meaning</th><th>Best for</th></tr></thead><tbody>
<tr><td><strong>Zero-shot</strong></td><td>Instruction only, no examples</td><td>Common tasks the model already does well; lowest token cost</td></tr>
<tr><td><strong>Single-shot (one-shot)</strong></td><td>Exactly one worked example</td><td>Pinning an output format cheaply</td></tr>
<tr><td><strong>Multi-shot (few-shot)</strong></td><td>Several diverse examples</td><td>Idiosyncratic formats, edge cases, and classification boundaries. The single most reliable way to raise consistency</td></tr>
<tr><td><strong>Chain of thought</strong></td><td>Asking for reasoning before the answer</td><td>Multi-step reasoning. Largely superseded by extended thinking on current models</td></tr>
</tbody></table></div>
<div class="note v"><div class="nt">Why multi-shot wins on consistency</div><p>Examples demonstrate the boundary cases that prose instructions describe badly. Three examples that include an edge case are worth more than three paragraphs of rules — and they are how you fix "it mostly gets the format right".</p></div>
`,
traps:[
["Setting <code>temperature</code>, <code>top_p</code>, or <code>top_k</code> on Fable 5.1, Opus 5, Sonnet 5, or Haiku 4.5 to get more consistent output","All three are deprecated on every model this generation. Passing anything but each parameter's default returns a 400 — there is no dial left to turn. Consistency now comes from a schema or a forced tool call."],
["Believing temperature 0 ever made output byte-identical, on any generation","Even where it was supported, temperature 0 made sampling greedy — it never guaranteed identical output across calls, and certainly not across model versions."],
["Raising temperature as a security measure","It was never a security control, and on current models the request fails outright. It has no bearing on prompt injection or jailbreak resistance either way."],
["Assuming a 1M context window means you should use it","Filling the window costs money, adds latency, and degrades attention. Curate, do not dump."],
["Estimating tokens with a fixed characters-per-token rule across languages and code","The ratio varies widely, and the tokeniser itself changed with the 4.7 generation — about 30% more tokens for the same text than the previous tokeniser. Use the token counting endpoint rather than a rule of thumb."],
["Adding chain-of-thought instructions on top of extended thinking","On current models, thinking is the mechanism. Piling on 'think step by step' mostly adds tokens."]
],
src:[["Messages API","https://platform.claude.com/docs/en/api/messages"],["Context windows","https://platform.claude.com/docs/en/build-with-claude/context-windows"],["Extended thinking","https://platform.claude.com/docs/en/build-with-claude/thinking"],["Prompt engineering overview","https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/overview"]]};

L["5.2"]={t:"Technical Fundamentals",d:5,
lede:"A 6.1% skill about the layer beneath your application code: what the SDK is actually doing over HTTP, when a websocket is the right transport and when it is not, and the operational basics of running an API-backed service.",
body:`
<h2>SDKs are wrappers over a REST API</h2>
<p>The Python and TypeScript client SDKs are convenience layers over HTTPS calls to <code>api.anthropic.com</code>. Knowing what they do for you tells you what breaks when they cannot.</p>
<div class="tw"><table><thead><tr><th>The SDK does</th><th>Which means</th></tr></thead><tbody>
<tr><td>Sets <code>x-api-key</code>, <code>anthropic-version</code>, <code>content-type</code></td><td>A raw HTTP integration must set them itself; a missing version header is a common 400</td></tr>
<tr><td>Serialises and deserialises typed request and response objects</td><td>Type errors surface at your boundary rather than as API 400s</td></tr>
<tr><td>Retries transient failures with backoff</td><td>Your own retry loop on top can multiply attempts; check the SDK default before adding one</td></tr>
<tr><td>Parses the SSE stream into events</td><td>A hand-rolled client must handle event framing, <code>ping</code>, and mid-stream <code>error</code> events</td></tr>
<tr><td>Exposes <code>request_id</code> on responses and errors</td><td>Log it — it is the identifier support asks for</td></tr>
</tbody></table></div>
<p>When you access Claude through Amazon Bedrock, Google Cloud, or Microsoft Foundry, authentication is handled by that platform's IAM instead of an Anthropic key, model IDs differ, and billing runs through the provider. The Messages shape stays the same.</p>
<h2>Streaming transports</h2>
<div class="tw"><table><thead><tr><th>Transport</th><th>Direction</th><th>Right for</th></tr></thead><tbody>
<tr><td><strong>HTTP request/response</strong></td><td>One-shot</td><td>Short completions, batch submission, anything a caller can wait for</td></tr>
<tr><td><strong>Server-sent events (SSE)</strong></td><td>Server &rarr; client, one way</td><td>How the Claude API streams. Simple, HTTP-native, auto-reconnecting</td></tr>
<tr><td><strong>WebSocket</strong></td><td>Bidirectional</td><td>Your own application's connection to its browser client, where the user can interrupt or send input mid-stream</td></tr>
</tbody></table></div>
<div class="note"><div class="nt">Key concept</div><p>The common production shape is <strong>SSE from Anthropic to your server, WebSocket or SSE from your server to the browser</strong>. Your server stays in the middle because that is where the API key lives, where you enforce authorisation, and where you log. A browser must never call the Claude API directly with your key.</p></div>
<h2>Operating an API-backed service</h2>
<ul>
<li><strong>Rate limits</strong> apply per organisation and vary by usage tier (Start, Build, Scale). Read the rate-limit response headers and shape traffic before you hit the ceiling. Sharp ramps can trip acceleration limits even under your nominal cap — ramp gradually.</li>
<li><strong>Timeouts:</strong> long non-streaming requests can return 504. Stream long generations.</li>
<li><strong>Request size:</strong> exceeding the byte limit returns 413. Partner platforms have their own limits.</li>
<li><strong>Concurrency:</strong> bound it deliberately with a semaphore or a queue. Unbounded fan-out converts a throughput problem into an outage.</li>
<li><strong>Idempotency:</strong> make retries safe, especially where a tool call has side effects. A retried agent turn must not charge the card twice.</li>
<li><strong>Observability:</strong> the Agent SDK and Claude Code can export traces, metrics, and events over OpenTelemetry to your existing backend.</li>
</ul>
<h2>Where the work should run</h2>
<div class="tw"><table><thead><tr><th>Concern</th><th>Placement</th></tr></thead><tbody>
<tr><td>API key</td><td>Server-side only, from a secret manager</td></tr>
<tr><td>Tool execution with side effects</td><td>Server-side, behind authorisation checks</td></tr>
<tr><td>Rendering and token-by-token display</td><td>Client</td></tr>
<tr><td>Rate limiting and quotas per end user</td><td>Server, in front of the Claude call</td></tr>
<tr><td>Agent execution with shell or filesystem access</td><td>An isolated sandbox with controlled network egress</td></tr>
</tbody></table></div>
`,
traps:[
["Calling the Claude API directly from browser or mobile code","That ships your API key to every user. Proxy through your own server."],
["Adding a retry loop on top of the SDK's own retries","You multiply the attempts and the backoff. Check what the SDK already does before wrapping it."],
["Using a websocket to talk to the Claude API","The Claude API streams over SSE. Websockets belong between your server and your own client."],
["Ignoring rate-limit response headers until a 429 arrives","The headers tell you your remaining budget and reset time. Shape traffic before the limit, not after."],
["Ramping traffic sharply after a quota increase","A sudden spike can trip acceleration limits and produce 429s under your nominal cap. Ramp gradually."]
],
src:[["API overview","https://platform.claude.com/docs/en/api/overview"],["Streaming messages","https://platform.claude.com/docs/en/build-with-claude/streaming"],["Rate limits","https://platform.claude.com/docs/en/api/rate-limits"]]};

L["5.3"]={t:"Model Selection and Tradeoffs",d:5,
lede:"Three axes — quality, latency, cost — and a family designed so you can trade between them per call. The exam wants the reasoning, not memorised prices, but knowing the shape of the lineup makes the reasoning fast.",
body:`
<h2>The current lineup</h2>
<div class="tw"><table><thead><tr><th>Model</th><th>Positioning</th><th>Context / max output</th><th>Thinking</th><th>$ per MTok in / out</th></tr></thead><tbody>
<tr><td><strong>Claude Fable 5.1</strong></td><td>Demanding reasoning and long-horizon agentic work</td><td>1M / 128K</td><td>Adaptive, always on</td><td>10 / 50</td></tr>
<tr><td><strong>Claude Opus 5</strong></td><td>Complex agentic coding and enterprise work. The sensible default for most workloads</td><td>1M / 128K</td><td>Adaptive</td><td>5 / 25</td></tr>
<tr><td><strong>Claude Sonnet 5</strong></td><td>Best balance of speed and intelligence</td><td>1M / 128K</td><td>Adaptive</td><td>2 / 10</td></tr>
<tr><td><strong>Claude Haiku 4.5</strong></td><td>Fastest, near-frontier for its class</td><td>200K / 64K</td><td>Extended; no effort parameter</td><td>1 / 5</td></tr>
</tbody></table></div>
<p>Above Opus sits the Mythos tier, of which Claude Mythos 5.1 is limited-availability. Fable is the publicly available model built on that generation with additional safety measures.</p>
<div class="note"><div class="nt">Key concept</div><p>Roughly a <strong>10x spread</strong> separates Haiku from the top tier on both input and output. Routing high-volume classification and extraction to Haiku while reserving the top tier for genuinely hard reasoning is the single largest cost decision in most applications.</p></div>
<div class="note v"><div class="nt">The whole 1M window is one flat rate</div><p>On this generation, a 900,000-token request is billed at the <strong>same per-token rate</strong> as a 9,000-token request — there is no separate long-context pricing tier to budget for. The only cost consequence of a long context is the token count itself, which is exactly why curating what occupies the window (6.1) is the lever, not a pricing cliff you need to watch for.</p></div>
<h2>Choosing</h2>
<ol>
<li><strong>Start cheap and measure.</strong> Build an eval set, run the cheapest plausible tier, and escalate only where it fails. Selecting a model by reputation instead of by eval is the anti-pattern the domain targets.</li>
<li><strong>Route, do not standardise.</strong> Most applications are a mix: Haiku for triage and extraction, Sonnet for the main path, Opus or Fable for the hard minority.</li>
<li><strong>Weigh latency separately from cost.</strong> A user-facing turn may justify a faster model even where a slower one is cheaper.</li>
<li><strong>Check the constraints before the benchmark.</strong> Haiku's 200K context rules it out for very long documents regardless of quality.</li>
</ol>
<div class="tw"><table><thead><tr><th>Workload</th><th>Reach for</th></tr></thead><tbody>
<tr><td>Classification, routing, extraction, tagging at volume</td><td>Haiku 4.5</td></tr>
<tr><td>Customer-facing chat, summarisation, most production paths</td><td>Sonnet 5</td></tr>
<tr><td>Complex agentic coding, multi-step enterprise work</td><td>Opus 5</td></tr>
<tr><td>Long-horizon agents and the hardest reasoning, where evals on Opus at high effort still fall short</td><td>Fable 5.1</td></tr>
<tr><td>Documents beyond 200K tokens</td><td>Anything except Haiku</td></tr>
</tbody></table></div>
<h2>Breaking behaviour changes across releases</h2>
<p>The blueprint names this explicitly. When a new generation lands, expect:</p>
<ul>
<li><strong>Tokeniser changes</strong> — the same text maps to a different token count, changing both cost and how close you sit to the window. The jump from Sonnet 4.6-and-earlier to the 4.7-and-later tokeniser is roughly 30% more tokens for the same text — a real number to reach for when an item asks why cost rose despite a flat or lower rate.</li>
<li><strong>Thinking model changes</strong> — fixed thinking budgets gave way to adaptive thinking and effort levels on current tiers. Code that sets a thinking budget may need rewriting.</li>
<li><strong>Prompt sensitivity</strong> — prompts heavily tuned to an older model often need trimming. Over-specified prompts age badly.</li>
<li><strong>Feature and parameter support</strong> — fast mode, effort, and residency parameters are not uniform across models; an unsupported parameter can return a 400.</li>
<li><strong>Deprecation</strong> — retired models may remain only on partner clouds. Watch the deprecation page.</li>
</ul>
<p>The safe migration is the one in 2.2: run your eval suite on the new model first, read the migration guide, adjust prompts, then roll out gradually.</p>
`,
traps:[
["Defaulting every call to the most capable model","Cost and latency multiply across the whole workload for a quality gain most requests do not need. Route by task."],
["Picking a model from a benchmark rather than your own evals","Benchmarks do not measure your prompts, your tools, or your data."],
["Overlooking the context ceiling when choosing Haiku","Haiku 4.5 tops out at 200K. Long-document work needs a 1M-context model."],
["Assuming a migration is cost-neutral because the rate is the same or lower","Tokenisers differ between generations. Re-measure on real traffic."],
["Setting a fixed thinking budget on a model that uses adaptive thinking","Current top tiers use effort levels. Check parameter support before migrating."],
["Assuming fast mode is a general Opus-tier speed boost","It is scoped to two specific model IDs — Opus 5 and Opus 4.8 — in research preview, on the first-party API only. Opus 4.7, Sonnet, Haiku, and Fable do not have it, and it is unavailable with the Batch API."],
["Budgeting extra per-token cost for a 900K-token request over a 9K-token one on the same model","There is no long-context pricing tier on this generation. The full 1M window bills at one flat rate; the only cost driver is the token count itself."]
],
src:[["Models overview","https://platform.claude.com/docs/en/models/overview"],["Choosing a model","https://platform.claude.com/docs/en/about-claude/models/choosing-a-model"],["Model deprecations","https://platform.claude.com/docs/en/about-claude/model-deprecations"],["Pricing","https://platform.claude.com/docs/en/about-claude/pricing"]]};

L["5.4"]={t:"Cost and Token Management",d:5,
lede:"Four levers control almost all of your bill: which model, how much you cache, whether you batch, and how many output tokens you generate. Know the multipliers and you can answer any cost item by arithmetic.",
body:`
<h2>The four levers, in order of impact</h2>
<ol>
<li><strong>Model routing</strong> — up to a 10x swing on both input and output.</li>
<li><strong>Prompt caching</strong> — cache reads cost 0.1x base input (0.025x on Fable 5.1 and Mythos 5.1).</li>
<li><strong>Batch API</strong> — a flat 50% off input and output for latency-tolerant work.</li>
<li><strong>Output length</strong> — output is 5x input on every tier, so brevity is the cheapest optimisation you own.</li>
</ol>
<p>Two smaller multipliers stack on top of all four: <strong>data residency</strong> adds 1.1x across every token category — input, output, and both cache operations — when a request pins <code>inference_geo</code> to a single country instead of the global default, and only on Claude 4.6-and-later models; and <strong>fast mode</strong>, where available, applies its own flat per-token rate rather than a multiplier on the base price.</p>
<h2>Caching economics</h2>
<div class="tw"><table><thead><tr><th>Operation</th><th>Multiplier on base input</th><th>Breaks even after</th></tr></thead><tbody>
<tr><td>5-minute cache write</td><td>1.25x</td><td>1 read</td></tr>
<tr><td>1-hour cache write</td><td>2x</td><td>2 reads</td></tr>
<tr><td>Cache read / refresh</td><td>0.1x (0.025x on Fable 5.1 / Mythos 5.1)</td><td>&mdash;</td></tr>
</tbody></table></div>
<p>Structure the prompt so the stable part comes first and never moves: tool definitions, then system prompt, then long static documents, then the volatile conversation. Cache lookup runs tools &rarr; system &rarr; messages, and any change invalidates everything after it.</p>
[[FIG:cache]]
<div class="note"><div class="nt">The silent failure</div><p>Caching breaks quietly. Insert a timestamp, a request ID, or a shuffled tool list into the prefix and every "cached" token bills at full price with no error. Watch <code>cache_read_input_tokens</code> as a production metric, not as a one-time check.</p></div>
<h2>Cache check-pointing in long conversations</h2>
<p>In a growing conversation you want the stable head cached and the new turns appended. Place a breakpoint after the last stable turn and move it forward periodically; with automatic caching, a single top-level <code>cache_control</code> lets the system manage breakpoints as the conversation grows. You get up to four explicit breakpoints per request, and breakpoints themselves are free.</p>
<h2>Batch economics</h2>
<p>50% off both directions, for work that can wait up to 24 hours. It stacks with prompt caching and with the residency multiplier. It does not apply to Managed Agents sessions, and fast mode is not available with it.</p>
<h2>Worked example</h2>
<p>A support assistant on Sonnet 5 ($2 in / $10 out per MTok) with a 20,000-token stable system prompt and knowledge base, a 500-token user turn, and a 300-token reply, at 50,000 requests a month.</p>
<div class="tw"><table><thead><tr><th>Setup</th><th>Input cost</th><th>Output cost</th><th>Monthly</th></tr></thead><tbody>
<tr><td>No caching</td><td>20,500 x $2/M = $0.041</td><td>300 x $10/M = $0.003</td><td>~$2,200</td></tr>
<tr><td>Cached prefix (read)</td><td>(20,000 x 0.1 + 500) x $2/M = $0.005</td><td>$0.003</td><td>~$400</td></tr>
<tr><td>Cached + batched</td><td>~$0.0025</td><td>~$0.0015</td><td>~$200</td></tr>
</tbody></table></div>
<p>The shape matters more than the arithmetic: caching a large stable prefix is usually the biggest single win, and it compounds with batching.</p>
<h2>Tracking usage</h2>
<p>Every response carries a <code>usage</code> object. Log all of it:</p>
<pre><code>"usage": {
  "input_tokens": 500,
  "cache_creation_input_tokens": 0,
  "cache_read_input_tokens": 20000,
  "output_tokens": 300,
  "server_tool_use": {"web_search_requests": 1}
}</code></pre>
<ul>
<li>Cost model per feature, not just per request: web search is <strong>$10 per 1,000 searches</strong> on top of tokens, charged once per search regardless of result count. Code execution is billed by container time — a 5-minute minimum, <strong>1,550 free hours per organisation per month</strong>, then $0.05 per container-hour beyond that — and is free of the time-based charge entirely when a request also includes web search or web fetch. Web fetch itself carries no charge beyond the tokens of the content it retrieves.</li>
<li>Tools add input tokens beyond your own content — the <code>tools</code> parameter plus a tool-use system prompt whenever any tool is present. The exact size is model- and <code>tool_choice</code>-dependent (roughly 300&ndash;500 tokens on the current lineup, more when <code>tool_choice</code> forces a specific tool rather than leaving it on <code>auto</code>), so treat "a few hundred tokens per request" as the number to reason with, not a constant to hard-code.</li>
<li>Thinking tokens are output tokens.</li>
<li>Track cost per user and per feature so an expensive path is visible before the invoice.</li>
</ul>
<h2>Cheap wins that items reward</h2>
<ul>
<li>Cap <code>max_tokens</code> to what the task actually needs.</li>
<li>Ask for the answer, not the explanation, when the explanation is not consumed.</li>
<li>Retrieve the relevant slice instead of pasting whole documents.</li>
<li>Prune old tool results out of history.</li>
<li>Use a smaller model for the routing or classification step in front of an expensive path.</li>
</ul>
`,
traps:[
["Lowering <code>max_tokens</code> to reduce input cost","<code>max_tokens</code> only caps output. It does nothing to input token spend."],
["Putting a timestamp or session ID at the top of a cached system prompt","It invalidates the whole prefix on every request. Volatile content goes last."],
["Assuming caching is on because you added <code>cache_control</code>","Below the model's minimum cacheable length nothing caches, silently. Verify with the usage fields."],
["Running large parallel synchronous jobs to cut cost","Parallelism buys time, not price. Batch buys price."],
["Forgetting that tool definitions are billed input on every request","Tool schemas and the tool-use system prompt are input tokens. Trim unused tools; cache the ones you keep."],
["Treating data residency as free","Pinning inference_geo to a single country adds a 1.1x multiplier across input, output, and both cache operations, on Claude 4.6-and-later models. It stacks with every other lever here rather than replacing any of them."],
["Assuming code execution always carries a per-hour charge","It is free of the time-based charge whenever the same request also uses web search or web fetch, and each organisation gets 1,550 free container-hours a month regardless. The $0.05-per-hour charge only applies to usage beyond both of those."]
],
src:[["Pricing","https://platform.claude.com/docs/en/about-claude/pricing"],["Prompt caching","https://platform.claude.com/docs/en/build-with-claude/prompt-caching"],["Token counting","https://platform.claude.com/docs/en/build-with-claude/token-counting"]]};

Q.push(
{i:"q501",d:5,s:"5.1",q:"A developer migrating a service to Claude Sonnet 5 sets temperature: 0.3, as they did on the previous model generation, hoping for more consistent output. What happens?",
o:["The request succeeds and output becomes noticeably more consistent","The request is rejected with a 400 — Sonnet 5 accepts only the default value of 1.0 for temperature","The value is silently clamped to the nearest supported setting","temperature is ignored with a warning, and the request otherwise succeeds normally"],a:1,
r:"temperature, top_p, and top_k are all deprecated on every model released after Claude Opus 4.6, which includes Sonnet 5. They accept only their default value and reject anything else with a hard 400 — not a silent clamp or a warning. Consistency now comes from a schema or a forced tool call, not from a sampling parameter."},
{i:"q502",d:5,s:"5.1",q:"A classification prompt produces the right answer most of the time but formats it inconsistently. Which technique gives the largest improvement for the least effort?",
o:["Raising the effort level","Adding several diverse few-shot examples that all follow the exact target format","Increasing max_tokens","Switching to a larger model"],a:1,
r:"Multi-shot examples are the most reliable lever for output consistency, because they demonstrate the boundary cases prose describes badly. Effort and model size address reasoning difficulty, not formatting drift."},
{i:"q503",d:5,s:"5.2",q:"A mobile application streams Claude responses. Where should the Anthropic API key live?",
o:["Embedded in the mobile app so the client can stream directly","On your server, which proxies requests and streams to the client","In the app's local storage, encrypted","Split between the client and the server"],a:1,
r:"A key shipped to a client is a key given to every user, regardless of encryption. The server holds the key, enforces authorisation, applies per-user rate limits, and logs — then streams to the client over SSE or a websocket."},
{i:"q504",d:5,s:"5.2",q:"The Claude API streams responses using which transport?",
o:["WebSocket","Server-sent events over HTTP","gRPC bidirectional streaming","Long polling"],a:1,
r:"The Messages API streams over SSE. Websockets are the right choice between your own server and your own browser client, where bidirectional traffic such as user interruption matters."},
{i:"q505",d:5,s:"5.3",q:"A high-volume pipeline tags 2 million short support messages by topic. Quality requirements are modest. Which model is the sensible starting point?",
o:["Claude Fable 5.1","Claude Opus 5","Claude Haiku 4.5","Claude Sonnet 5"],a:2,
r:"High-volume, low-difficulty classification is exactly what Haiku is for, and the spread between Haiku and the top tier is roughly 10x on both input and output. Start there, measure with evals, and escalate only the subset that fails."},
{i:"q506",d:5,s:"5.3",q:"A team must summarise 400,000-token legal documents. Which constraint rules out Claude Haiku 4.5?",
o:["Haiku does not support streaming","Haiku's context window is 200K tokens","Haiku cannot use tools","Haiku does not support the Batch API"],a:1,
r:"Haiku 4.5 has a 200K context window, while Fable 5.1, Opus 5, and Sonnet 5 offer 1M. The document exceeds Haiku's ceiling regardless of quality considerations."},
{i:"q507",d:5,s:"5.3",q:"After migrating from an older model to a newer generation at the same or lower per-token rate, the monthly bill rises. What is the most likely explanation?",
o:["The new model ignores prompt caching","The newer tokeniser produces more tokens for the same text","Batch discounts do not apply to newer models","The new model always uses maximum effort"],a:1,
r:"Tokenisers change between model generations, and a newer one can map the same text to noticeably more tokens. A lower headline rate is not automatically a lower bill, which is why you re-measure on real traffic after a migration."},
{i:"q508",d:5,s:"5.4",q:"Which cache configuration pays for itself after a single subsequent read?",
o:["The 1-hour cache write at 2x base input","The 5-minute cache write at 1.25x base input","Any cache write, since reads are free","Neither; caching always requires at least three reads"],a:1,
r:"A 5-minute write costs 1.25x and a read costs 0.1x, so one read already beats paying full input price twice. The 1-hour write at 2x needs two reads to break even. Reads are cheap but not free."},
{i:"q509",d:5,s:"5.4",q:"Which change reduces input token cost on a chat application with a large stable system prompt?",
o:["Lowering max_tokens","Placing the stable system prompt and tool definitions first and caching that prefix","Raising the temperature","Removing the stop_sequences parameter"],a:1,
r:"Caching a large stable prefix is usually the single biggest input-side saving, at 0.1x base input per read. max_tokens affects only output, and temperature and stop sequences have no cost effect of this kind."},
{i:"q510",d:5,s:"5.4",q:"Which item is billed as output tokens?",
o:["Tool definitions in the tools parameter","Extended thinking blocks","Cache read tokens","The system prompt"],a:1,
r:"Thinking is generated, so it is billed as output — which is why high effort raises cost noticeably. Tool definitions, the system prompt, and cache reads are all input-side."},
{i:"q511",d:5,s:"5.1",q:"What does the effort setting control on models that support it?",
o:["The maximum number of tool calls per turn","How much the model reasons before answering, trading latency and tokens for quality","The number of cache breakpoints allowed","The retry behaviour of the SDK"],a:1,
r:"Effort governs adaptive thinking depth on models that support it. Haiku 4.5 uses extended thinking and does not support the effort parameter — a detail worth remembering when migrating code across tiers."},
{i:"q512",d:5,s:"5.4",q:"Which is true about tool definitions and cost?",
o:["Tool definitions are free because they are not user content","Tool definitions are billed as input tokens on every request, plus a tool-use system prompt whenever any tool is present","Tool definitions are billed once per session","Tool definitions are billed as output tokens"],a:1,
r:"Every tool schema is in the request and billed as input on every call, and the API adds a tool-use system prompt of a few hundred tokens whenever tools are present. Trimming unused tools is a real saving, and caching the remaining ones is another."},
);
