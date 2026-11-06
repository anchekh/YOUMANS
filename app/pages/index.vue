<template>
  <div>
    <h1>Производственная практика в ООО «Юманс-ВЦ»</h1>
    <div>
      <div v-for="student in students" :key="student.id">
        <span>{{ student.name }}</span>
      </div>
    </div>
    <NuxtLink to="/store">Перейти в магазин</NuxtLink>
  </div>
</template>

<script setup>
const students = [
  { id: 1, name: 'Венидиктова Вероника Евгеньевна'},
  { id: 2, name: 'Дубровин Антон Андреевич'},
  { id: 3, name: 'Елесин Никита Константинович'},
  { id: 4, name: 'Караванова Дарья Вадимовна'},
  { id: 5, name: 'Кочетов Роман Владимирович'},
]
</script>