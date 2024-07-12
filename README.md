### modal
```js
// src/components/my-dialog.vue
<template>
  <el-dialog
    :model-value="props.visible"
    @update:model-value="emits('update:visible', false)"
    title="Tips"
    width="500">
    <span>This is a message</span>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="onCancel">取消</el-button>
        <el-button type="primary" @click="onOk">确认</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { type AsyncModalInjectedProps } from '@/use'

type IProps = AsyncModalInjectedProps<{ code: number; msg: string }> & {
  visible: boolean
  name: string
  age: number
}
const props = defineProps<IProps>()
const emits = defineEmits<{
  (e: 'update:visible', visible: boolean): void
}>()

function onCancel() {
  props.callback('cancel')
  props.close()
}

function onOk() {
  props.callback('confirm', { code: 200, msg: 'ok' })
  props.close()
}
</script>
```

### 使用
```js
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
```