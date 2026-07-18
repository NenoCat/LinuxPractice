<template>
  <div class="fill-question">
    <el-input
      v-model="answer"
      placeholder="请输入命令（按 Enter 提交）"
      size="large"
      @input="handleInput"
      @keyup.enter="handleEnter"
      class="fill-input"
      :disabled="disabled"
    />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'submit'])

const answer = ref(props.modelValue)

watch(() => props.modelValue, (newVal) => {
  answer.value = newVal
})

const handleInput = (value) => {
  emit('update:modelValue', value)
}

const handleEnter = () => {
  if (!props.disabled && answer.value.trim()) {
    emit('submit')
  }
}
</script>

<style scoped>
.fill-question {
  margin: 20px 0;
}

.fill-input {
  font-family: 'Courier New', monospace;
  font-size: 16px;
}

:deep(.el-input__inner) {
  font-family: 'Courier New', monospace;
}
</style>

