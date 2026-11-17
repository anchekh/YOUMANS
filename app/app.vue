<template>
  <div>
    <NuxtPage />
    <ScrollToTop v-if="$route.path.startsWith('/store')" />
  </div>
</template>