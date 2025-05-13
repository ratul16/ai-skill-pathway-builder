import { defineStore } from 'pinia'

export const useSkillGraph = defineStore('skillGraph', () => {
  // state
  const nodes = ref([])
  const links = ref([])
  const loading = ref(false)
  const error = ref(null)

  async function generate(currentSkills, targetRole = '', targetDomain = '') {
    loading.value = true
    error.value = null

    try {
      const payload = await $fetch('/api/skill-pathway', {
        method: 'POST',
        body: { currentSkills, targetRole, targetDomain }
      })

      nodes.value = payload.nodes.map(n => {
        const { type, ...rest } = n
        return rest
      })

      links.value = payload.links.map((l, i) => {
        const { type, style, animated, ...keep } = l
        return {
          id: keep.id ?? `e${i}`,
          source: keep.source,
          target: keep.target
        }
      })
    }
    catch (err) {
      error.value = err.statusMessage || err.message || 'Error generating pathway'
    }
    finally {
      loading.value = false
    }
  }

  // expose state and actions
  return {
    nodes,
    links,
    loading,
    error,
    generate
  }
})
