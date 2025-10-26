<template>
  <ClientOnly>
    <div class="flex flex-col h-[700px] w-full gap-4">
      <div class="flex justify-between items-center">
        <div class="flex items-center gap-2">
          <span
            v-for="type in Object.keys(stylesMap)"
            :key="type"
            :style="{
              backgroundColor: stylesMap[type].bg,
              color: stylesMap[type].color,
            }"
            class="text-sm py-1 px-4 rounded-md capitalize"
          >
            {{ type }} skills
          </span>
        </div>
        <button class="px-4 py-2 bg-blue-600 text-white rounded" @click="applyDagreLayout">
          Re-order
        </button>
      </div>
      <div class="flex-1">
        <VueFlow
          class="h-full w-full"
          :class="loading ? 'opacity-25' : ''"
          :nodes="flowNodes"
          :edges="flowEdges"
          :edge-types="edgeTypes"
          :fit-view="true"
          :default-edge-options="{ animated: true, style: { strokeWidth: 2 } }"
        >
          <Background :gap="16" pattern-color="#333" />
          <Controls position="bottom-left" />
        </VueFlow>
      </div>
    </div>
  </ClientOnly>
</template>

<script setup>
import { ref, watch, onMounted } from "vue";
import { ClientOnly } from "#components";
import { useSkillGraph } from "@/stores/skillGraph";
import { storeToRefs } from "pinia";

import { VueFlow, BezierEdge } from "@vue-flow/core";
import { Background } from "@vue-flow/background";
import { MiniMap } from "@vue-flow/minimap";
import { Controls } from "@vue-flow/controls";
import dagre from "@dagrejs/dagre";

// Pull in your graph data
const store = useSkillGraph();
const { nodes, links, loading } = storeToRefs(store);
const dummyGraph = {
  nodes: [
    { id: "Start", position: { x: 0, y: 0 }, data: { label: "Start", status: "owned" } },
    { id: "HTML5", position: { x: 0, y: 100 }, data: { label: "HTML5", status: "owned" } },
    { id: "CSS3", position: { x: 0, y: 200 }, data: { label: "CSS3", status: "owned" } },
    { id: "JavaScript", position: { x: 0, y: 300 }, data: { label: "JavaScript", status: "next" } },
    { id: "Vue.js", position: { x: 0, y: 400 }, data: { label: "Vue.js", status: "future" } },
    { id: "Nuxt 3", position: { x: 0, y: 500 }, data: { label: "Nuxt 3", status: "future" } },
  ],
  links: [
    { source: "Start", target: "HTML5" },
    { source: "HTML5", target: "CSS3" },
    { source: "CSS3", target: "JavaScript" },
    { source: "JavaScript", target: "Vue.js" },
    { source: "Vue.js", target: "Nuxt 3" },
  ],
};

// Reactive arrays for Vue Flow
const flowNodes = ref([]);
const flowEdges = ref([]);
const edgeTypes = markRaw({
  bezier: BezierEdge,
});

// Define a map of style sets
const stylesMap = {
  owned: { bg: "#d1fae5", border: "#10b981", color: "#065f46" },
  next: { bg: "#fef3c7", border: "#f59e0b", color: "#92400e" },
  future: { bg: "#e0f2fe", border: "#38bdf8", color: "#0369a1" },
};

// Sync store → flow data
watch(
  [nodes, links],
  () => {
    // 1️⃣ Map nodes into flowNodes with inline styling
    flowNodes.value = nodes.value.map((n) => {
      if (n.id === "Start") {
        return {
          ...n,
          style: {
            backgroundColor: "#333",
            border: "2px solid #000",
            color: "#fff",
            padding: "8px",
            borderRadius: "4px",
          },
        };
      }
      const status = n.data.status;
      const s = stylesMap[status] || stylesMap.future;
      return {
        ...n,
        style: {
          backgroundColor: s.bg,
          border: `2px solid ${s.border}`,
          color: s.color,
          padding: "8px",
          borderRadius: "4px",
        },
      };
    });

    // 2️⃣ Create a set of valid node IDs
    const validIds = new Set(flowNodes.value.map((n) => n.id));

    // 3️⃣ Filter & map edges only if both endpoints exist
    flowEdges.value = links.value
      .filter((e) => validIds.has(e.source) && validIds.has(e.target))
      .map((e, i) => ({
        id: e.id ?? `e${i}`,
        source: e.source,
        target: e.target,
        animated: true,
        style: { stroke: "#444", strokeWidth: 2 },
      }));

    // 4️⃣ Finally, run the Dagre layout to position everything
    applyDagreLayout();
  },
  { immediate: true }
);

// Dagre layout (TB)
function applyDagreLayout() {
  if (!flowNodes.value.length) return;

  const g = new dagre.graphlib.Graph();
  g.setGraph({ rankdir: "TB", marginx: 20, marginy: 20 });
  g.setDefaultEdgeLabel(() => ({}));

  flowNodes.value.forEach((n) => g.setNode(n.id, { width: 150, height: 50 }));
  flowEdges.value.forEach((e) => g.setEdge(e.source, e.target));

  dagre.layout(g);

  flowNodes.value = flowNodes.value.map((n) => {
    const { x, y } = g.node(n.id);
    return {
      ...n,
      position: { x: x - 75, y: y - 25 },
    };
  });
}

// Warn if store.generate wasn’t called
onMounted(() => {
  if (!nodes.value.length) {
    console.warn("No skills loaded – call store.generate(currentSkills, targetRole) first.");
  }
});
</script>

<style>
.vue-flow__node {
  transition: transform 0.5s ease;
}
.vue-flow__edge path {
  transition: stroke-dashoffset 0.5s ease, stroke 0.5s ease;
}
</style>
