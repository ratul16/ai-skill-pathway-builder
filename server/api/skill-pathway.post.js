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

  // Build the 'fenced‐JSON' prompt
  const prompt = `
  I have these current skills: ${currentSkills.join(', ')}.
  My goal is to become a ${role}.

  Please generate:
  1. All current skills as "owned".
  2. The very next skill as "next".
  3. All further relevant skills as "future".

  **IMPORTANT:**  
  - Return only valid JSON in a \`\`\`json\`\`\` fence.  
  - The JSON must have exactly two keys: "nodes" and "links".  
  - **Every** node in "nodes" **must** appear in at least one link in "links".  
  - If necessary, connect foundational skills to a dummy node called "Start".

  Return **only** valid JSON wrapped in a Markdown code fence labeled \`json\`, with exactly two top‐level keys:

  \`\`\`json
  {
    "nodes": [
      { "id": "Skill A", "status": "owned"|"next"|"future" }, …
    ],
    "links": [
      { "source": "Skill A", "target": "Skill B" }, …
    ]
  }
  \`\`\`

  Make sure you include skills specific to the target role ("${role}") that I don't yet have.
  `.trim()

  // 3️⃣ Call the LM endpoint
  const LM_URL = 'http://127.0.0.1:1234/v1/chat/completions'
  const res = await fetch(LM_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'deepseek-r1-distill-llama-8b',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7
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
