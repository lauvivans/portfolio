<script setup lang="ts">
import { LinkMention, type PageInfo } from "@lauvivans/kami";
import { onBeforeMount, ref, watch } from "vue";
import loadGhData from "@/loadGhData";
import { useRouter } from "vue-router";

const router = useRouter();

const repos = ref<PageInfo[]>();

watch(
  () => router.currentRoute.value.path,
  async (newPath: string) => {
    if (newPath.includes("github")) {
      repos.value = await loadGhData();
    }
  },
);

onBeforeMount(async () => {
  repos.value = await loadGhData();
});
</script>

<template>
  <template v-if="repos && repos.length > 0"
    ><LinkMention
      v-for="repo in repos"
      :key="repo.title"
      :page="repo"
      emoji="🐙"
  /></template>
</template>
