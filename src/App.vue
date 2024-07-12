<template>
  <div>
    <el-button @click="onOpen">打开弹窗</el-button>
  </div>
</template>

<script setup lang="ts">
async function onOpen() {
  const res = await openModal(() => import('@/components/my-dialog.vue'), { name: 'xxx', age: 18})
  console.log(res)
}

</script>

<style scoped></style>
