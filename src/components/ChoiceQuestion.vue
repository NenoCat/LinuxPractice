<template>
  <div class="choice-question">
    <el-radio-group v-model="selectedAnswer" @change="handleChange" :disabled="disabled">
      <el-radio
        v-for="(option, index) in options"
        :key="index"
        :label="option"
        class="choice-option"
        :disabled="disabled"
      >
        {{ String.fromCharCode(65 + index) }}. {{ option }}
      </el-radio>
    </el-radio-group>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  options: {
    type: Array,
    required: true
  },
  modelValue: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])

const selectedAnswer = ref(props.modelValue)

watch(() => props.modelValue, (newVal) => {
  selectedAnswer.value = newVal
})

const handleChange = (value) => {
  emit('update:modelValue', value)
}
</script>

<style scoped>
.choice-question {
  margin: 20px 0;
}

.choice-option {
  display: block;
  margin: 15px 0;
  padding: 12px;
  border-radius: 8px;
  transition: all 0.3s;
  cursor: pointer;
}

.choice-option:hover {
  background-color: #f5f7fa;
}

:deep(.el-radio__input.is-checked + .el-radio__label) {
  color: #409eff;
  font-weight: 500;
}
</style>

