<template>
  <div class="container mx-auto px-4">
    <div class="block gap-4 items-start justify-between mt-4 sm:flex">
      <div class="flex-1 card mb-4 sm:mb-0">
        <a href="#">
          <h2 class="mb-2 text-2xl font-bold tracking-tight text-blue-700">
            Skill Pathway Builder
          </h2>
        </a>
        <p class="mb-3 text-sm text-gray-400">
          The Skill Pathway Builder will help you to build a learning pathway for your career
          development.
        </p>

        <hr class="border-gray-300 my-4 border-dashed" />

        <div class="skill-form flex flex-col gap-4">
          <div>
            <label for="current_skills" class="">Current Skills</label>
            <input
              id="current_skills"
              v-model="rawSkills"
              type="text"
              class=""
              placeholder="Enter your current skills"
              required
            />
          </div>
          <div>
            <label for="target_role" class="">Target Role</label>
            <input
              id="target_role"
              v-model="targetRole"
              type="text"
              class=""
              placeholder="Enter your desired role"
              required
            />
          </div>
          <div>
            <button @click="submit">
              {{ store.loading ? "Generating…" : "Generate Pathway" }}
              <svg
                class="rtl:rotate-180 w-3.5 h-3.5 ms-2"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 14 10"
              >
                <path
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M1 5h12m0 0L9 1m4 4L9 9"
                />
              </svg>
            </button>
            <p v-if="store.error" class="text-red-500">{{ store.error }}</p>
          </div>
        </div>
      </div>
      <div class="flex-2 card">
        <h2 class="mb-2 text-2xl font-bold tracking-tight text-gray-900">Skill Pathway</h2>
        <GraphViewer />
        <div>
          {{ nodes }}
          <hr />
          {{ links }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { storeToRefs } from "pinia";
import { useSkillGraph } from "@/store/skillGraph.js";

const store = useSkillGraph();
const rawSkills = ref("");
const targetRole = ref("");
const targetDomain = ref("");
const { nodes, links } = storeToRefs(store);

function submit() {
  const skills = rawSkills.value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  store.generate(skills, targetRole.value, targetDomain.value);
  console.log("Skills:", skills);
}
</script>

<style lang="scss" scoped></style>
