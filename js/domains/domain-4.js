L["4.1"]={t:"Debugging and Error Handling",d:4,
lede:"The smallest domain, and the most mechanical. Learn the HTTP error table, learn which errors are retryable, and learn the one diagnostic question that separates integration bugs from model bugs.",
body:`
<h2>The error table</h2>
<div class="tw"><table><thead><tr><th>Status</th><th>Type</th><th>Cause</th><th>Retry?</th></tr></thead><tbody>
<tr><td>400</td><td><code>invalid_request_error</code></td><td>Malformed body, missing <code>max_tokens</code>, bad message sequence</td><td>No — fix the request</td></tr>
<tr><td>401</td><td><code>authentication_error</code></td><td>Missing or invalid API key</td><td>No</td></tr>
<tr><td>402</td><td><code>billing_error</code></td><td>Billing or payment problem</td><td>No</td></tr>
<tr><td>403</td><td><code>permission_error</code></td><td>Key lacks access to that resource or model</td><td>No</td></tr>
<tr><td>404</td><td><code>not_found_error</code></td><td>Wrong endpoint or unknown resource</td><td>No</td></tr>
<tr><td>409</td><td><code>conflict_error</code></td><td>The request conflicts with the resource's current state — concurrent modification, or a value that must be unique already in use</td><td>No — resolve the conflict, then retry</td></tr>
<tr><td>413</td><td><code>request_too_large</code></td><td>Request exceeds the byte limit — 32 MB for the Messages and Token Counting APIs, 256 MB for Batch, 500 MB for the Files API</td><td>No — shrink it</td></tr>
<tr><td>429</td><td><code>rate_limit_error</code></td><td>Your org hit a rate limit, a usage-tier spend cap, or a Claude Code workspace spend limit</td><td>Yes — back off, respect retry headers</td></tr>
<tr><td>500</td><td><code>api_error</code></td><td>Internal error at Anthropic</td><td>Yes — backoff</td></tr>
<tr><td>504</td><td><code>timeout_error</code></td><td>Request timed out while processing</td><td>Yes — and switch to streaming for long generations</td></tr>
<tr><td>529</td><td><code>overloaded_error</code></td><td>The API is temporarily at capacity across users</td><td>Yes — backoff</td></tr>
</tbody></table></div>
<div class="note"><div class="nt">429 versus 529</div><p>They look alike and the fixes are opposite. <strong>429</strong> is your usage against your limit: slow down, queue, raise the tier. <strong>529</strong> is Anthropic's capacity, unrelated to your usage: retry with exponential backoff, consider a fallback model. Reducing your own concurrency helps in both cases, but only 429 means you did anything. One 429 shape defeats naive backoff entirely: a usage-tier or workspace spend-cap 429 carries no <code>retry-after</code> header and keeps failing on every retry until the cap resets or you raise it — a backoff loop against that cause just burns time.</p></div>
<p>Error bodies are JSON with <code>type</code> and <code>message</code>, plus a top-level <code>request_id</code> — capture that ID in your logs, it is what makes a problem reportable. In streaming, an error can arrive as an <code>error</code> event after a 200, so error handling belongs inside the stream too.</p>
<div class="note v"><div class="nt">The SDKs already retry for you</div><p>The official client SDKs automatically retry connection errors, 429s, and 5xx responses with exponential backoff — <strong>twice by default</strong> — and honour the <code>retry-after</code> header when the server sends one. Wrapping every call in your own retry loop on top of that double-retries transient failures; the more useful move is configuring the SDK's own max-retries option, and reserving custom retry logic for the cases it does not cover, such as a validated-but-wrong structured output.</p></div>
<h2>Errors that are not HTTP errors</h2>
<p>A 200 response can still be a failure. These are the cases items test:</p>
<ul>
<li><code>stop_reason: "max_tokens"</code> — truncated output. Parsing it as complete produces corrupt data downstream.</li>
<li><code>stop_reason: "refusal"</code> — Claude declined. Not retryable as-is.</li>
<li><code>stop_reason: "model_context_window_exceeded"</code> — the window filled during generation.</li>
<li>A tool result with <code>is_error: true</code> — your tool failed. Return the error text to Claude so it can adapt, rather than raising and killing the loop.</li>
<li>Well-formed output that is factually wrong. Only an eval or a verification step catches this.</li>
</ul>
<h2>Isolating integration from model</h2>
<p>The blueprint calls this "problem origin isolation", and it is the core diagnostic skill of the domain. One question settles it:</p>
<div class="note"><div class="nt">The isolating question</div><p><strong>Did the model receive what you think it received?</strong> Log the exact outbound request body and replay it in isolation. If the same body reproduces the behaviour, the problem is the prompt, the tools, or the model. If it does not, the problem is your integration.</p></div>
<div class="tw"><table><thead><tr><th>Symptom</th><th>Integration layer</th><th>Model / prompt layer</th></tr></thead><tbody>
<tr><td>Agent stops mid-task</td><td>Loop branches on content instead of <code>stop_reason</code></td><td>Task is genuinely ambiguous and the model concluded early</td></tr>
<tr><td>Tool is never called</td><td>Tool not registered, or <code>tool_choice: "none"</code></td><td>Tool description does not say when to use it</td></tr>
<tr><td>Tool called with wrong arguments</td><td>Schema does not constrain the field</td><td>Description is ambiguous; add an <code>enum</code> or an example</td></tr>
<tr><td>Output fails to parse</td><td>No validation, no retry path</td><td>Prompt does not pin the format; prose wrapped around the JSON</td></tr>
<tr><td>Same input, different answers</td><td>Non-deterministic sampling is expected behaviour</td><td>Constrain with a schema or a forced tool call rather than chasing determinism through sampling parameters — <code>temperature</code> is fixed at 1.0 and unavailable to tune on current-generation models anyway</td></tr>
<tr><td>Behaviour changed overnight</td><td>Model alias moved, config drift, dependency bump</td><td>Same — check the pinned model ID first</td></tr>
</tbody></table></div>
<h2>Trace analysis</h2>
<p>A useful trace records, for each turn: request ID, model, system prompt version, the full messages array, every <code>tool_use</code> with its input, every <code>tool_result</code> with success or error, <code>stop_reason</code>, token usage including cache reads and writes, and latency.</p>
<p>Reading a trace, work backwards from the failure to the <strong>first</strong> turn where the state diverged from expectation. Agents fail long before they visibly fail: a bad tool result at turn three produces a wrong answer at turn nine. Common signatures:</p>
<ul>
<li>The same tool called repeatedly with the same input &rarr; the result is not being appended to history, or the result is unhelpful.</li>
<li>Tokens climbing every turn with no progress &rarr; context bloat; the agent is re-reading rather than remembering.</li>
<li>A tool error swallowed and ignored &rarr; the error was not returned to Claude as a <code>tool_result</code>.</li>
<li>Cache read tokens near zero on a stable prompt &rarr; something before the breakpoint is changing per request.</li>
</ul>
<h2>Recovery strategies</h2>
<div class="tw"><table><thead><tr><th>Failure</th><th>Strategy</th></tr></thead><tbody>
<tr><td>Transient server error (429, 500, 504, 529)</td><td>Exponential backoff with jitter, bounded attempts</td></tr>
<tr><td>Tool execution failure</td><td>Return <code>is_error: true</code> with a useful message so Claude can try another route</td></tr>
<tr><td>Malformed structured output</td><td>Validate, then one corrective retry that includes the parser error; then fail closed</td></tr>
<tr><td>Context exhaustion</td><td>Compact, prune tool results, or move the work into a subagent</td></tr>
<tr><td>Model unavailable or overloaded</td><td>Fallback model chain, with the quality difference acknowledged</td></tr>
<tr><td>Repeated failure on the same step</td><td>Stop and escalate to a human. Infinite retry is not a recovery strategy</td></tr>
</tbody></table></div>
`,
traps:[
["Retrying a 400, 401, or 409 with backoff","400 and 401 will never succeed on retry — fix the request or the key. 409 needs the conflict resolved first; blind retry just collides again. Only 429, 500, 504 and 529 are retryable as-is."],
["Backing off against a spend-cap 429 as if it were ordinary rate limiting","A usage-tier or workspace spend-cap 429 has no retry-after header and fails on every attempt until the cap resets or is raised. Exponential backoff against it just wastes time; the fix is raising the cap or waiting it out, not retrying harder."],
["Treating 529 as a rate limit and applying for a quota increase","529 is server-side capacity, not your usage. Back off and consider a fallback model."],
["Adding a custom retry loop around an SDK call without checking what the SDK already does","The official SDKs already retry connection errors, 429s, and 5xx twice by default with backoff. An uncoordinated retry loop on top double- or triple-retries the same transient failure."],
["Raising an exception when a tool fails inside an agent loop","Return the failure to Claude as a <code>tool_result</code> with <code>is_error: true</code>. Killing the loop loses all progress."],
["Parsing a <code>max_tokens</code> response as a finished answer","It is truncated. Detect it and handle it explicitly."],
["Assuming non-determinism is a bug","Same prompt, different output is normal sampling behaviour. Constrain the output shape rather than chasing determinism."],
["Debugging by changing the prompt first","Log and replay the exact request body first. Half the time the model never received what you assumed."]
],
src:[["Errors","https://platform.claude.com/docs/en/api/errors"],["Troubleshooting","https://code.claude.com/docs/en/troubleshooting"]]};


Q.push(
{i:"q401",d:4,s:"4.1",q:"Your service begins receiving HTTP 529 responses during a traffic spike that is well within your rate limit. What is the correct response?",
o:["Request a rate limit increase from Anthropic","Retry with exponential backoff, since 529 means the API is temporarily overloaded across users","Fix the request body, since 529 indicates a malformed request","Switch to a larger model to reduce the number of calls"],a:1,
r:"529 is overloaded_error: server-side capacity, unrelated to your quota. Back off and retry, and consider a fallback model. A quota increase addresses 429, which is your usage against your own limit."},
{i:"q402",d:4,s:"4.1",q:"A tool inside an agent loop throws an exception, and the harness lets it propagate, ending the run. What should it do instead?",
o:["Retry the same tool call indefinitely until it succeeds","Return a tool_result with is_error true and an actionable message so Claude can adapt","Silently skip the tool and continue with an empty result","Restart the session from the beginning"],a:1,
r:"Returning the failure as a tool result keeps the loop alive and lets Claude choose another route, which is the whole point of the pattern. Silent empty results cause the model to reason from false information, infinite retry is not a strategy, and restarting discards all progress."},
{i:"q403",d:4,s:"4.1",q:"An agent produces a wrong final answer after nine turns. What is the most effective first step in trace analysis?",
o:["Rewrite the system prompt and re-run","Work backwards to the first turn where the state diverged from expectation","Increase the iteration cap","Switch to a more capable model"],a:1,
r:"Agents fail long before they visibly fail. A bad tool result at turn three produces a wrong answer at turn nine, so the fix belongs at the divergence point. Changing the prompt or model before locating the divergence is guesswork."},
{i:"q404",d:4,s:"4.1",q:"A structured-output integration works in testing but intermittently fails to parse in production. Which check best isolates whether the problem is your integration or the model?",
o:["Raise the temperature to see if output changes","Log the exact outbound request body for failing cases and replay it in isolation","Add a second model call to check the first","Increase max_tokens and redeploy"],a:1,
r:"Replaying the exact request settles the question: if the behaviour reproduces, it is the prompt, tools, or model; if it does not, the integration is sending something other than what you assumed."},
{i:"q405",d:4,s:"4.1",q:"Which of these is a failure that returns HTTP 200?",
o:["413 request_too_large","A response with stop_reason max_tokens","401 authentication_error","529 overloaded_error"],a:1,
r:"Truncation at the max_tokens ceiling arrives on a successful response. So do refusals and model_context_window_exceeded. These are the failures that silently corrupt downstream data if you only check the HTTP status."},
);
