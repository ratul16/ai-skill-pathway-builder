// server/api/skill-pathway.post.js
import { defineEventHandler, readBody, createError } from 'h3'

export default defineEventHandler(async (event) => {
  // Read & validate input
  const body = await readBody(event)
  const currentSkills = Array.isArray(body.currentSkills)
    ? body.currentSkills.filter(s => typeof s === 'string')
    : []
  if (!currentSkills.length) {
    throw createError({ statusCode: 400, statusMessage: 'Provide currentSkills as a non-empty array of strings' })
  }
  const role = typeof body.targetRole === 'string' ? body.targetRole : null

  const systemPrompt = `
  You are an expert Skill-Pathway Graph Builder. Given a user's current skills and a target role, identify and sequence the exact skills they need to progress—immediate and long-term.
  Rules:
  1. Always output **only** valid JSON—no extra text.
  2. JSON must have exactly two top-level keys: "nodes" and "links".
  3. Each node has "status":
    - "owned" for current skills (and "Start")
    - "next" for one or more skills the user should learn immediately
    - "future" for all other relevant skills
  4. There can be multiple "next" nodes.
  5. Every node must appear in at least one link.
  6. **Links** describe logical prerequisites:
    - Connect any foundational “owned” skills (including “Start”) → appropriate “next” skills.
    - Connect “next” → “future” skills where each future skill depends on one or more next skills.
    - Feel free to interlink “future” → “future” to show deeper progression.
  7. For "future" nodes, include a broad, role-specific set of technologies, frameworks, methodologies, and certifications.
    `.trim();

  const userPrompt = `
  Current skills: ${currentSkills.join(', ')}.
  Target role: ${role}.
  Construct and return **only** this JSON in a \`\`\`json\`\`\` fence:
  {
    "nodes": [
      { "id": "Start",      "status": "owned" },
      /* each current skill → "owned" */
      /* one or more skills → "next" */
      /* all other role-relevant skills → "future" */
    ],
    "links": [
      /* every node appears at least once */
      /* owned → next */
      /* next → future */
      /* future → future (optional) for multi-stage progression */
    ]
  }
  `.trim();

  // Call the LM endpoint
  const LM_URL = 'http://127.0.0.1:1234/v1/chat/completions'
  const res = await fetch(LM_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'openai/gpt-oss-20b',
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 1
    })
  })
  if (!res.ok) {
    throw createError({ statusCode: 500, statusMessage: `LLM error ${res.status}` })
  }
  const payload = await res.json()
  const text = payload.choices?.[0]?.message?.content
  if (typeof text !== 'string') {
    throw createError({ statusCode: 500, statusMessage: 'No content in LLM response' })
  }

  // 4️⃣ Extract the fenced JSON block
  const fenceRe = /```json\s*([\s\S]*?)```/i
  const match = text.match(fenceRe)
  if (!match) {
    throw createError({ statusCode: 500, statusMessage: 'Could not find ```json``` block in LLM response' })
  }
  let jsonStr = match[1]

  // 5️⃣ Clean up comments and trailing commas
  // Remove JavaScript-style // comments
  jsonStr = jsonStr.replace(/\/\/.*$/gm, '')
  // Remove trailing commas before } or ]
  jsonStr = jsonStr.replace(/,(\s*[}\]])/g, '$1').trim()

  // 6️⃣ Parse the cleaned JSON
  let raw
  try {
    raw = JSON.parse(jsonStr)
  } catch (err) {
    throw createError({ statusCode: 500, statusMessage: 'Invalid JSON after cleanup' })
  }

  // 7️⃣ Transform into Vue Flow format
  const spacing = 200
  const gridSize = Math.ceil(Math.sqrt(raw.nodes.length))
  const nodes = raw.nodes.map((n, i) => {
    const row = Math.floor(i / gridSize)
    const col = i % gridSize
    return {
      id: n.id,
      type: 'custom',
      position: { x: col * spacing + 50, y: row * spacing + 50 },
      data: { label: n.id, status: n.status }
    }
  })
  const links = (Array.isArray(raw.links) ? raw.links : []).map((l, i) => ({
    id: `e${i}`,
    source: l.source,
    target: l.target
  }))

  // 8️⃣ Return the graph
  return { nodes, links }
})
