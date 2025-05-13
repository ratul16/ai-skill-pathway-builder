<template>
  <ClientOnly>
    <div class="h-[700px] relative">
      <VueFlow
        v-if="flowNodes.length"
        :nodes="flowNodes"
        :edges="flowEdges"
        :fit-view="true"
        :default-edge-options="{ animated: true }"
      >
        <Background :gap="16" pattern-color="#aaa" />
        <MiniMap />
        <Controls position="top-right" />
      </VueFlow>

      <button
        class="absolute bottom-4 right-4 px-4 py-2 bg-blue-600 text-white rounded"
        @click="applyDagreLayout"
      >
        Re-layout
      </button>
    </div>
  </ClientOnly>
</template>

<script setup>
import { ref, watch, onMounted } from "vue";
import { ClientOnly } from "#components";
import { useSkillGraph } from "@/stores/skillGraph";
import { storeToRefs } from "pinia";

import { VueFlow } from "@vue-flow/core";
import { Background } from "@vue-flow/background";
import { MiniMap } from "@vue-flow/minimap";
import { Controls } from "@vue-flow/controls";
import dagre from "@dagrejs/dagre";

// Pull in your graph data
const store = useSkillGraph();
const { nodes, links } = storeToRefs(store);

// Reactive arrays for Vue Flow
const flowNodes = ref([]);
const flowEdges = ref([]);

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
    flowNodes.value = nodes.value.map((n) => {
      const { status } = n.data;
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

    flowEdges.value = links.value.map((e, i) => ({
      id: e.id || `e${i}`,
      source: e.source,
      target: e.target,
      type: "bezier",
      animated: true,
      style: { stroke: "#666", strokeWidth: 2 },
    }));

    // Run layout
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
