<template>
  <div class="container mx-auto px-4">
    <div class="block gap-4 items-start justify-between mt-4 sm:flex">
      <div class="flex-1 card mb-4 sm:mb-0">
        <a href="#">
          <h2 class="mb-2 text-2xl font-bold tracking-tight text-gray-900">
            Skill Pathway Builder
          </h2>
        </a>
        <p class="mb-3 text-sm text-gray-400">
          Added your skills and target job roles to the Skill Pathway Builder. The Skill Pathway
          Builder will help you to build a pathway to your
        </p>

        <div class="skill-form flex flex-col gap-4">
          <div>
            <label for="current_skills" class="">Current Skills</label>
            <input
              id="current_skills"
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
              type="text"
              class=""
              placeholder="Enter your desired role"
              required
            />
          </div>
          <button>
            Generate Pathway
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
        </div>
      </div>
      <div class="flex-2 card">
        <a href="#">
          <h2 class="mb-2 text-2xl font-bold tracking-tight text-gray-900">Skill Pathway</h2>
        </a>
      </div>
    </div>
  </div>
</template>

<script setup></script>

<style lang="scss" scoped></style>
