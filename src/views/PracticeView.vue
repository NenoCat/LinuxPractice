<template>
  <div class="practice-view">
    <!-- 筛选栏 -->
    <div class="filter-bar">
      <div class="filter-left">
        <el-select
          v-model="selectedCategory"
          placeholder="选择分类"
          size="default"
          class="filter-select"
          @change="onFilterChange"
        >
          <el-option
            v-for="cat in categories"
            :key="cat.value"
            :label="cat.label"
            :value="cat.value"
          />
        </el-select>
        <el-select
          v-model="selectedDifficulty"
          placeholder="选择难度"
          size="default"
          class="filter-select"
          @change="onFilterChange"
        >
          <el-option
            v-for="diff in difficulties"
            :key="diff.value"
            :label="diff.label"
            :value="diff.value"
          />
        </el-select>
      </div>
      <div class="filter-right" v-if="currentQuestion">
        <span class="question-counter">第 {{ questionNumber }} 题</span>
      </div>
    </div>

    <!-- 统计栏 -->
    <div class="stats-bar">
      <div class="stats-item">
        <span class="stats-label">总题数</span>
        <span class="stats-value">{{ totalAnswered }}</span>
      </div>
      <div class="stats-item">
        <span class="stats-label">正确数</span>
        <span class="stats-value">{{ correctCount }}</span>
      </div>
      <div class="stats-item stats-rate">
        <span class="stats-label">正确率</span>
        <span class="stats-value">{{ accuracyRate }}%</span>
      </div>
      <div class="stats-progress">
        <el-progress
          :percentage="accuracyRate"
          :stroke-width="8"
          :color="progressColor"
          :show-text="false"
        />
      </div>
    </div>

    <!-- 题目内容 -->
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="5" animated />
    </div>

    <div v-else-if="currentQuestion">
      <QuestionCard
        :question="currentQuestion"
        v-model="userAnswer"
        :disabled="showResult"
        @submit="handleSubmit"
      />

      <div class="action-buttons">
        <el-button
          type="primary"
          size="large"
          @click="submitAnswer"
          :disabled="!userAnswer"
          v-if="!showResult"
        >
          提交答案
        </el-button>
        <div class="shortcut-hint" v-if="!showResult && userAnswer">Enter 提交</div>

        <el-button
          type="warning"
          size="large"
          @click="retryQuestion"
          v-if="showResult"
        >
          重新答题
        </el-button>

        <el-button
          type="success"
          size="large"
          @click="nextQuestion"
          v-if="showResult"
        >
          下一题
        </el-button>
      </div>

      <ResultPanel
        v-if="showResult"
        :is-correct="isCorrect"
        :user-answer="userAnswer"
        :correct-answer="currentQuestion.correct_answer"
        :explanation="currentQuestion.explanation"
        :command-info="commandInfo"
      />
    </div>

    <div v-else class="error-container">
      <el-alert
        title="加载题目失败"
        type="error"
        :description="errorMessage"
        show-icon
      />
      <el-button type="primary" @click="loadQuestion" style="margin-top: 20px">
        重试
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import QuestionCard from '../components/QuestionCard.vue'
import ResultPanel from '../components/ResultPanel.vue'
import { initDatabase, getRandomQuestion, checkAnswer, getCommandInfo } from '../utils/db.js'

const loading = ref(true)
const currentQuestion = ref(null)
const userAnswer = ref('')
const showResult = ref(false)
const isCorrect = ref(false)
const errorMessage = ref('')
const commandInfo = ref(null)
const hasSubmitted = ref(false)

const totalAnswered = ref(0)
const correctCount = ref(0)
const questionNumber = ref(1)

const selectedCategory = ref('')
const selectedDifficulty = ref('')

const categories = [
  { label: '全部分类', value: '' },
  { label: '文件操作', value: '文件操作' },
  { label: '系统管理', value: '系统管理' },
  { label: '网络操作', value: '网络操作' },
  { label: '文本处理', value: '文本处理' },
  { label: '压缩归档', value: '压缩归档' },
  { label: '用户与权限', value: '用户与权限' },
  { label: '管道与重定向', value: '管道与重定向' },
  { label: '进程与服务', value: '进程与服务' }
]

const difficulties = [
  { label: '全部难度', value: '' },
  { label: '初级', value: '初级' },
  { label: '中级', value: '中级' },
  { label: '高级', value: '高级' }
]

const accuracyRate = computed(() => {
  if (totalAnswered.value === 0) return 0
  return Math.round((correctCount.value / totalAnswered.value) * 100)
})

const progressColor = computed(() => {
  if (accuracyRate.value >= 80) return '#67c23a'
  if (accuracyRate.value >= 60) return '#e6a23c'
  return '#f56c6c'
})

const onFilterChange = () => {
  loadQuestion()
}

const loadQuestion = async () => {
  try {
    loading.value = true
    showResult.value = false
    userAnswer.value = ''
    commandInfo.value = null
    hasSubmitted.value = false

    await initDatabase()
    const question = getRandomQuestion(selectedCategory.value, selectedDifficulty.value)

    if (!question) {
      errorMessage.value = '没有可用的题目，请尝试调整筛选条件'
      currentQuestion.value = null
      return
    }

    currentQuestion.value = question

    if (question.command_id) {
      const info = getCommandInfo(question.command_id)
      if (info) {
        commandInfo.value = info
      }
    }

    errorMessage.value = ''
  } catch (error) {
    console.error('加载题目失败:', error)
    errorMessage.value = error.message || '加载题目失败，请刷新页面重试'
    ElMessage.error('加载题目失败')
  } finally {
    loading.value = false
  }
}

const submitAnswer = () => {
  if (!userAnswer.value.trim()) {
    ElMessage.warning('请先输入答案')
    return
  }

  if (!currentQuestion.value) {
    return
  }

  const correct = checkAnswer(currentQuestion.value.id, userAnswer.value)
  isCorrect.value = correct
  showResult.value = true

  if (!hasSubmitted.value) {
    hasSubmitted.value = true
    totalAnswered.value++
    if (correct) {
      correctCount.value++
    }
  }

  if (correct) {
    ElMessage.success('回答正确！')
  } else {
    ElMessage.error('回答错误，请查看正确答案')
  }
}

const handleSubmit = () => {
  submitAnswer()
}

const handleKeyPress = (event) => {
  if (event.key === 'Enter' && !showResult.value && userAnswer.value.trim() && currentQuestion.value) {
    event.preventDefault()
    submitAnswer()
  }
}

const retryQuestion = () => {
  showResult.value = false
  userAnswer.value = ''
  isCorrect.value = false
}

const nextQuestion = () => {
  questionNumber.value++
  loadQuestion()
}

onMounted(() => {
  loadQuestion()
  window.addEventListener('keydown', handleKeyPress)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyPress)
})
</script>

<style scoped>
.practice-view {
  max-width: 1000px;
  margin: 0 auto;
}

.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding: 12px 20px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

html.dark .filter-bar {
  background: rgba(40, 40, 50, 0.9);
}

.filter-left {
  display: flex;
  gap: 12px;
  align-items: center;
}

.filter-select {
  width: 140px;
}

.question-counter {
  font-size: 16px;
  font-weight: 600;
  color: #409eff;
  white-space: nowrap;
}

html.dark .question-counter {
  color: #79bbff;
}

.stats-bar {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 10px 20px;
  margin-bottom: 16px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

html.dark .stats-bar {
  background: rgba(40, 40, 50, 0.9);
}

.stats-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.stats-label {
  font-size: 12px;
  color: #909399;
}

.stats-value {
  font-size: 20px;
  font-weight: 600;
  color: #409eff;
}

.stats-rate {
  min-width: 60px;
}

.stats-progress {
  flex: 1;
  min-width: 80px;
}

.loading-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px;
}

.action-buttons {
  text-align: center;
  margin: 10px 0;
}

.action-buttons .el-button {
  margin: 0 10px;
  min-width: 120px;
}

.shortcut-hint {
  font-size: 12px;
  color: #909399;
  margin-top: 6px;
}

.error-container {
  max-width: 600px;
  margin: 100px auto;
  text-align: center;
}

@media (max-width: 768px) {
  .filter-bar {
    flex-direction: column;
    gap: 10px;
    align-items: stretch;
  }

  .filter-left {
    justify-content: space-between;
  }

  .filter-right {
    text-align: center;
  }

  .filter-select {
    width: 48%;
  }

  .stats-bar {
    gap: 16px;
    flex-wrap: wrap;
    justify-content: center;
  }

  .stats-progress {
    width: 100%;
    min-width: 0;
  }
}
</style>
