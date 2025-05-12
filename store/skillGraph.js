import { defineStore } from 'pinia'

export const useSkillGraph = defineStore('skillGraph', {
  state: () => ({
    nodes: [],
    links: [],
    loading: false,
    error: null
  }),
  actions: {
    async generate(currentSkills, targetRole = '', targetDomain = '') {
      this.loading = true
      this.error = null
      try {
        const { nodes, links } = await $fetch('/api/skill-pathway', {
          method: 'POST',
          body: { currentSkills, targetRole, targetDomain }
        })
        this.nodes = nodes
        this.links = links
      } catch (err) {
        this.error = err.statusMessage || err.message || 'Error generating pathway'
      } finally {
        this.loading = false
      }
    }
  }
})
