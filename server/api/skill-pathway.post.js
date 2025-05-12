// server/api/skill-pathway.post.js
import { defineEventHandler, readBody, createError } from 'h3'

export default defineEventHandler(async (event) => {
  // 1️⃣ Parse & validate input
  const body = await readBody(event)
  const currentSkills = Array.isArray(body.currentSkills)
    ? body.currentSkills.filter(s => typeof s === 'string')
    : []
  if (!currentSkills.length) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Provide currentSkills as a non-empty string array'
    })
  }
  const role = typeof body.targetRole === 'string' ? body.targetRole : null
  const domain = typeof body.targetDomain === 'string' ? body.targetDomain : null

  // 2️⃣ Build a 'status-aware' prompt
  let prompt = `I have these current skills: ${currentSkills.join(', ')}.`
  if (role) prompt += ` My goal is the role of ${role}.`
  else if (domain) prompt += ` I want to focus on the domain ${domain}.`
  else prompt += ` Generate a broad skill graph clustered by domain.`

  prompt += `
For each skill node, assign a "status" field as:
  - "owned" if it's in my current skills,
  - "next" for the single next skill I should learn,
  - "future" for all others.

Return **only** valid JSON, exactly in this format:

{
  "nodes": [
    { "id": "Skill A", "status": "owned"|"next"|"future" }, …
  ],
  "links": [
    { "source": "Skill A", "target": "Skill B" }, …
  ]
}`

  // 3️⃣ Call LM Studio's chat-completions endpoint
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

  // 4️⃣ Extract JSON payload
  const { choices } = await res.json()
  const text = choices?.[0]?.message?.content
  if (typeof text !== 'string') {
    throw createError({ statusCode: 500, statusMessage: 'No content from LLM' })
  }
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start < 0 || end < 0) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Could not find JSON object in LLM response'
    })
  }
  let raw
  try {
    raw = JSON.parse(text.slice(start, end + 1))
  } catch {
    throw createError({
      statusCode: 500,
      statusMessage: 'Invalid JSON from LLM after extraction'
    })
  }

  // 5️⃣ Transform into Vue Flow format
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
  const links = raw.links.map((l, i) => ({
    id: `e${i}`,
    source: l.source,
    target: l.target
  }))

  // 6️⃣ Return the graph
  return { nodes, links }
})
