<script setup>
// Core graph component
import { VueFlow } from "@vue-flow/core";

// Auxiliary packages
import { Background } from "@vue-flow/background";
import { Controls } from "@vue-flow/controls";
import { MiniMap } from "@vue-flow/minimap";
import { storeToRefs } from "pinia";
import { useSkillGraph } from "@/store/skillGraph.js";
import HighlighterNode from "@/components/HighlighterNode.vue";
import { markRaw } from "vue";

const store = useSkillGraph();
const { nodes, links } = storeToRefs(store);
const nodeTypes = markRaw({
  custom: HighlighterNode,
});

const sampleGraph = {
  nodes: [
    { id: "html5", type: "custom", position: { x: 50, y: 50 }, data: { label: "HTML5" } },
    { id: "css3", type: "custom", position: { x: 200, y: 50 }, data: { label: "CSS3" } },
    { id: "js", type: "custom", position: { x: 350, y: 50 }, data: { label: "JavaScript" } },
    { id: "vue", type: "custom", position: { x: 125, y: 150 }, data: { label: "Vue.js" } },
    { id: "nuxt", type: "custom", position: { x: 275, y: 150 }, data: { label: "Nuxt 3" } },
  ],
  links: [
    { id: "e1", source: "html5", target: "css3" },
    { id: "e2", source: "css3", target: "js" },
    { id: "e3", source: "js", target: "vue" },
    { id: "e4", source: "vue", target: "nuxt" },
    { id: "e5", source: "html5", target: "vue" },
  ],
};

function onClick(node) {
  alert(`Skill: ${node.id}`);
}
</script>

<template>
  <ClientOnly>
    <div v-if="nodes.length > 0" class="h-[600px]">
      <VueFlow
        :nodes="nodes"
        :edges="links"
        :fit-view="true"
        :node-types="nodeTypes"
        @node-click="onClick"
      >
        <Background :gap="16" pattern-color="#aaa" />
        <MiniMap />
        <Controls position="top-right" />
        <template #node="{ id, data, xPos, yPos }">
          <div
            class="bg-white border rounded px-2 py-1 text-sm text-center"
            :style="{ position: 'absolute', transform: `translate(${xPos}px, ${yPos}px)` }"
          >
            {{ data.label }} - {{ id }}
          </div>
        </template>
      </VueFlow>
    </div>
    <div v-else class="flex flex-col gap-2 mt-4">
      <h4>No Graph available</h4>
    </div>
  </ClientOnly>
</template>
