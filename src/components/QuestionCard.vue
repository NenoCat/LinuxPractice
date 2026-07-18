<template>
  <el-card class="question-card" shadow="hover">
    <template #header>
      <div class="card-header">
        <span class="question-type">
          {{ questionType === 'choice' ? '选择题' : '填空题' }}
        </span>
        <span class="question-category" v-if="category">
          {{ category }}
        </span>
      </div>
    </template>
    
    <div class="question-content">
      <h3 class="question-text">{{ questionText }}</h3>
      
      <template v-if="questionType === 'choice'">
        <ChoiceQuestion
          v-if="options.length > 0"
          :options="options"
          v-model="userAnswer"
          :disabled="disabled"
        />
        
        <div v-else class="no-options">
          <el-alert type="warning" :closable="false">
            选项数据加载失败，请刷新页面重试
          </el-alert>
        </div>
      </template>
      
      <FillQuestion
        v-else-if="questionType === 'fill'"
        v-model="userAnswer"
        :disabled="disabled"
        @submit="$emit('submit')"
      />
    </div>
  </el-card>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import ChoiceQuestion from './ChoiceQuestion.vue'
import FillQuestion from './FillQuestion.vue'

const props = defineProps({
  question: {
    type: Object,
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

const emit = defineEmits(['update:modelValue', 'submit'])

// 使用 computed 确保响应式更新
const questionType = computed(() => props.question?.type || '')
const questionText = computed(() => props.question?.question_text || '')
const options = computed(() => {
  const opts = props.question?.options
  return Array.isArray(opts) ? opts : []
})
const category = computed(() => props.question?.category || '')
const userAnswer = ref(props.modelValue)

watch(() => props.modelValue, (newVal) => {
  userAnswer.value = newVal
})

watch(() => props.question, () => {
  // 当题目变化时，重置答案
  userAnswer.value = ''
}, { deep: true })

watch(userAnswer, (newVal) => {
  emit('update:modelValue', newVal)
})
</script>

<style scoped>
.question-card {
  max-width: 800px;
  margin: 0 auto;
  border-radius: 12px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.question-type {
  font-weight: 600;
  color: #409eff;
  font-size: 14px;
}

.question-category {
  font-size: 12px;
  color: #909399;
  background: #f0f2f5;
  padding: 4px 12px;
  border-radius: 12px;
}

.question-content {
  padding: 10px 0;
}

.question-text {
  font-size: 18px;
  line-height: 1.6;
  color: #303133;
  margin-bottom: 20px;
  font-weight: 500;
}

.no-options {
  margin: 20px 0;
}
</style>

