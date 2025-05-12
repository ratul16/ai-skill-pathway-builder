<!-- components/CustomNode.vue -->
<template>
  <div
    class="custom-node p-2 rounded text-white text-sm text-center"
    :class="{
      'bg-blue-600': data.status === 'owned',
      'bg-green-500': data.status === 'next',
      'bg-gray-400': data.status === 'future',
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
