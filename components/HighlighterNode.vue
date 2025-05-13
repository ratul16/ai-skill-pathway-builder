<!-- components/CustomNode.vue -->
<template>
  <div
    class="custom-node p-2 rounded text-white text-sm text-center"
    :class="{
      'bg-green-300': data.status === 'owned',
      'bg-amber-300': data.status === 'next',
      'bg-sky-300': data.status === 'future',
    }"
  >
    {{ data.label }}
  </div>
</template>

<script setup>
defineProps({
  data: { type: Object, required: true },
});
</script>

<style scoped>
.custom-node {
  border: 2px solid white;
  min-width: 80px;
}
</style>
