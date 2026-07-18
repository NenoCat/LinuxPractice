<template>
  <div class="wrong-book-view">
    <!-- 列表模式 -->
    <template v-if="!retryMode">
      <!-- 页面标题栏 -->
      <div class="page-header">
        <div class="header-left">
          <el-icon :size="24" class="header-icon"><Notebook /></el-icon>
          <span class="header-title">错题本</span>
          <el-tag type="info" size="small" class="count-tag" v-if="!loading">
            共 {{ wrongQuestions.length }} 题
          </el-tag>
        </div>
        <div class="header-right" v-if="wrongQuestions.length > 0 && !loading">
          <el-button type="danger" plain size="default" @click="handleClear">
            <el-icon><Delete /></el-icon>
            清空错题本
          </el-button>
          <el-button type="primary" size="default" @click="startRetry">
            <el-icon><RefreshRight /></el-icon>
            重新练习错题
          </el-button>
        </div>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="loading-container">
        <el-skeleton :rows="5" animated />
      </div>

      <!-- 空状态 -->
      <el-empty
        v-else-if="wrongQuestions.length === 0"
        description="还没有错题，继续保持！"
        :image-size="160"
      />

      <!-- 错题列表 -->
      <div v-else class="wrong-list">
        <el-card
          v-for="question in wrongQuestions"
          :key="question.id"
          class="wrong-card"
          shadow="hover"
        >
          <!-- 卡片头部：类型 + 难度 -->
          <template #header>
            <div class="card-header">
              <div class="card-badges">
                <el-tag
                  :type="question.type === 'choice' ? 'primary' : 'success'"
                  size="small"
                  effect="plain"
                >
                  {{ question.type === 'choice' ? '选择题' : '填空题' }}
                </el-tag>
                <el-tag
                  :type="difficultyType(question.difficulty)"
                  size="small"
                  effect="plain"
                >
                  {{ question.difficulty }}
                </el-tag>
                <el-tag
                  v-if="question.category"
                  type="info"
                  size="small"
                  effect="plain"
                >
                  {{ question.category }}
                </el-tag>
              </div>
              <el-button
                type="danger"
                text
                size="small"
                @click="handleRemove(question.id)"
              >
                移除
              </el-button>
            </div>
          </template>

          <!-- 题目内容 -->
          <div class="card-body">
            <h3 class="question-text">{{ question.question_text }}</h3>

            <!-- 错误答案 -->
            <div class="answer-row wrong-answer">
              <span class="answer-label">你的答案：</span>
              <code class="answer-code wrong">{{ question.userAnswer || '未作答' }}</code>
            </div>

            <!-- 正确答案 -->
            <div class="answer-row correct-answer">
              <span class="answer-label">正确答案：</span>
              <code class="answer-code correct">{{ question.correct_answer }}</code>
              <el-button
                :icon="DocumentCopy"
                size="small"
                text
                type="primary"
                @click="copyText(question.correct_answer)"
                class="copy-btn"
              >
                复制
              </el-button>
            </div>

            <!-- 解析 -->
            <div class="explanation-section" v-if="question.explanation">
              <h4>解析：</h4>
              <p>{{ question.explanation }}</p>
            </div>

            <!-- 命令信息 -->
            <div class="command-section" v-if="question.command">
              <h4>命令说明：</h4>
              <p><strong>命令：</strong>{{ question.command }}</p>
              <p v-if="question.description"><strong>描述：</strong>{{ question.description }}</p>
              <p v-if="question.usage"><strong>用法：</strong><code class="usage-code">{{ question.usage }}</code></p>
            </div>

            <!-- 时间戳 -->
            <div class="timestamp">
              <el-icon><Clock /></el-icon>
              <span>{{ formatTime(question.wrongTimestamp) }}</span>
            </div>
          </div>
        </el-card>
      </div>
    </template>

    <!-- 重新练习模式 -->
    <template v-else>
      <div class="retry-mode">
        <!-- 进度条 -->
        <div class="retry-progress-bar">
          <div class="progress-info">
            <span class="progress-text">{{ retryIndex + 1 }} / {{ retryQuestions.length }}</span>
            <el-button type="default" size="small" @click="exitRetry">
              退出练习
            </el-button>
          </div>
          <el-progress
            :percentage="retryProgress"
            :stroke-width="10"
            :color="'#409eff'"
            :show-text="false"
          />
        </div>

        <!-- 当前题目 -->
        <div v-if="currentRetryQuestion" class="retry-question">
          <QuestionCard
            :question="currentRetryQuestion"
            v-model="retryAnswer"
            :disabled="retrySubmitted"
            @submit="submitRetryAnswer"
          />

          <div class="retry-actions">
            <el-button
              v-if="!retrySubmitted"
              type="primary"
              size="large"
              @click="submitRetryAnswer"
              :disabled="!retryAnswer.trim()"
            >
              提交答案
            </el-button>

            <template v-else>
              <ResultPanel
                :is-correct="retryIsCorrect"
                :user-answer="retryAnswer"
                :correct-answer="currentRetryQuestion.correct_answer"
                :explanation="currentRetryQuestion.explanation"
                :command-info="currentRetryCommandInfo"
              />

              <div class="retry-result-actions">
                <el-button
                  v-if="retryIsCorrect"
                  type="success"
                  size="large"
                  @click="removeCurrentAndNext"
                >
                  移除并继续
                </el-button>
                <el-button
                  type="warning"
                  size="large"
                  @click="nextRetryQuestion"
                  v-if="retryIndex < retryQuestions.length - 1"
                >
                  下一题
                </el-button>
                <el-button
                  type="info"
                  size="large"
                  @click="exitRetry"
                  v-if="retryIndex >= retryQuestions.length - 1 && !retryIsCorrect"
                >
                  返回错题本
                </el-button>
                <el-button
                  type="success"
                  size="large"
                  @click="exitRetry"
                  v-if="retryIndex >= retryQuestions.length - 1 && retryIsCorrect"
                >
                  完成练习
                </el-button>
              </div>
            </template>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Notebook, Delete, RefreshRight, DocumentCopy, Clock } from '@element-plus/icons-vue'
import QuestionCard from '../components/QuestionCard.vue'
import ResultPanel from '../components/ResultPanel.vue'
import {
  initDatabase,
  getWrongQuestions,
  removeFromWrongBook,
  clearWrongBook,
  addToWrongBook,
  checkAnswer,
  getCommandInfo
} from '../utils/db.js'

// 列表模式
const loading = ref(true)
const wrongQuestions = ref([])

// 重新练习模式
const retryMode = ref(false)
const retryQuestions = ref([])
const retryIndex = ref(0)
const retryAnswer = ref('')
const retrySubmitted = ref(false)
const retryIsCorrect = ref(false)
const retryCommandInfo = ref(null)

const currentRetryQuestion = computed(() => {
  if (retryIndex.value >= retryQuestions.value.length) return null
  return retryQuestions.value[retryIndex.value]
})

const currentRetryCommandInfo = computed(() => {
  return retryCommandInfo.value
})

const retryProgress = computed(() => {
  if (retryQuestions.value.length === 0) return 0
  return Math.round(((retryIndex.value + 1) / retryQuestions.value.length) * 100)
})

// 难度标签颜色
const difficultyType = (difficulty) => {
  switch (difficulty) {
    case '初级': return 'success'
    case '中级': return 'warning'
    case '高级': return 'danger'
    default: return 'info'
  }
}

// 格式化时间
const formatTime = (timestamp) => {
  if (!timestamp) return '未知时间'
  const date = new Date(timestamp)
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  const h = String(date.getHours()).padStart(2, '0')
  const min = String(date.getMinutes()).padStart(2, '0')
  return `${y}-${m}-${d} ${h}:${min}`
}

// 复制文本
const copyText = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    ElMessage.success('已复制到剪贴板')
  } catch {
    const textArea = document.createElement('textarea')
    textArea.value = text
    textArea.style.position = 'fixed'
    textArea.style.opacity = '0'
    document.body.appendChild(textArea)
    textArea.select()
    try {
      document.execCommand('copy')
      ElMessage.success('已复制到剪贴板')
    } catch {
      ElMessage.error('复制失败，请手动复制')
    }
    document.body.removeChild(textArea)
  }
}

// 加载错题列表
const loadWrongQuestions = async () => {
  try {
    loading.value = true
    await initDatabase()
    wrongQuestions.value = getWrongQuestions()
  } catch (error) {
    console.error('加载错题失败:', error)
    ElMessage.error('加载错题失败')
  } finally {
    loading.value = false
  }
}

// 清空错题本
const handleClear = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要清空所有错题吗？此操作不可恢复。',
      '清空错题本',
      {
        confirmButtonText: '确定清空',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    clearWrongBook()
    wrongQuestions.value = []
    ElMessage.success('错题本已清空')
  } catch {
    // 用户取消
  }
}

// 移除单条错题
const handleRemove = (questionId) => {
  removeFromWrongBook(questionId)
  wrongQuestions.value = wrongQuestions.value.filter(q => q.id !== questionId)
  ElMessage.success('已从错题本移除')
}

// 开始重新练习
const startRetry = () => {
  if (wrongQuestions.value.length === 0) {
    ElMessage.info('没有错题可以练习')
    return
  }
  retryQuestions.value = [...wrongQuestions.value]
  retryIndex.value = 0
  retryAnswer.value = ''
  retrySubmitted.value = false
  retryIsCorrect.value = false
  retryCommandInfo.value = null
  retryMode.value = true

  loadRetryCommandInfo()
}

// 加载当前重试题目的命令信息
const loadRetryCommandInfo = () => {
  const q = currentRetryQuestion.value
  if (q && q.command_id) {
    const info = getCommandInfo(q.command_id)
    retryCommandInfo.value = info
  } else if (q && q.command) {
    retryCommandInfo.value = {
      command: q.command,
      description: q.description || '',
      usage: q.usage || ''
    }
  } else {
    retryCommandInfo.value = null
  }
}

// 提交重试答案
const submitRetryAnswer = () => {
  if (!retryAnswer.value.trim()) {
    ElMessage.warning('请先输入答案')
    return
  }

  const q = currentRetryQuestion.value
  if (!q) return

  const correct = checkAnswer(q.id, retryAnswer.value)
  retryIsCorrect.value = correct
  retrySubmitted.value = true

  if (correct) {
    ElMessage.success('回答正确！')
  } else {
    ElMessage.error('回答错误，请查看正确答案')
    // 更新错题记录
    addToWrongBook(q.id, retryAnswer.value)
  }
}

// 移除当前题目并继续
const removeCurrentAndNext = () => {
  const q = currentRetryQuestion.value
  if (q) {
    removeFromWrongBook(q.id)
  }
  nextRetryQuestion()
}

// 下一题
const nextRetryQuestion = () => {
  retryAnswer.value = ''
  retrySubmitted.value = false
  retryIsCorrect.value = false
  retryCommandInfo.value = null

  if (retryIndex.value < retryQuestions.value.length - 1) {
    retryIndex.value++
    loadRetryCommandInfo()
  } else {
    exitRetry()
  }
}

// 退出练习模式
const exitRetry = () => {
  retryMode.value = false
  loadWrongQuestions()
}

onMounted(() => {
  loadWrongQuestions()
})
</script>

<style scoped>
.wrong-book-view {
  max-width: 1000px;
  margin: 0 auto;
}

/* 页面头部 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  margin-bottom: 16px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

html.dark .page-header {
  background: rgba(40, 40, 50, 0.9);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.header-icon {
  color: #e6a23c;
}

html.dark .header-icon {
  color: #f5d891;
}

.header-title {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
}

html.dark .header-title {
  color: #e5eaf3;
}

.count-tag {
  font-size: 12px;
}

.header-right {
  display: flex;
  gap: 10px;
}

/* 加载状态 */
.loading-container {
  padding: 40px;
}

/* 错题列表 */
.wrong-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.wrong-card {
  border-radius: 12px;
  transition: all 0.3s;
}

.wrong-card:hover {
  transform: translateY(-2px);
}

/* 卡片头部 */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-badges {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}

/* 卡片内容 */
.card-body {
  padding: 4px 0;
}

.question-text {
  font-size: 17px;
  line-height: 1.7;
  color: #303133;
  margin-bottom: 16px;
  font-weight: 500;
}

html.dark .question-text {
  color: #e5eaf3;
}

/* 答案行 */
.answer-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  margin-bottom: 10px;
  border-radius: 8px;
  flex-wrap: wrap;
}

.wrong-answer {
  background: #fef0f0;
}

html.dark .wrong-answer {
  background: rgba(245, 108, 108, 0.1);
}

.correct-answer {
  background: #f0f9eb;
}

html.dark .correct-answer {
  background: rgba(103, 194, 58, 0.1);
}

.answer-label {
  font-weight: 600;
  color: #606266;
  white-space: nowrap;
}

html.dark .answer-label {
  color: #a3a6ad;
}

.answer-code {
  font-family: 'Courier New', monospace;
  font-size: 15px;
  padding: 4px 10px;
  border-radius: 4px;
}

.answer-code.wrong {
  color: #f56c6c;
  background: #ffffff;
  border: 1px solid #fab6b6;
  text-decoration: line-through;
}

html.dark .answer-code.wrong {
  background: rgba(0, 0, 0, 0.2);
  border-color: rgba(245, 108, 108, 0.4);
}

.answer-code.correct {
  color: #67c23a;
  background: #ffffff;
  border: 1px solid #b3e19d;
  font-weight: 600;
  flex: 1;
  min-width: 0;
}

html.dark .answer-code.correct {
  background: rgba(0, 0, 0, 0.2);
  border-color: rgba(103, 194, 58, 0.4);
}

.copy-btn {
  margin-left: auto;
  flex-shrink: 0;
}

/* 解析 */
.explanation-section,
.command-section {
  margin-top: 14px;
  padding: 14px;
  background: #f9fafc;
  border-radius: 8px;
}

html.dark .explanation-section,
html.dark .command-section {
  background: rgba(255, 255, 255, 0.05);
}

.explanation-section h4,
.command-section h4 {
  color: #409eff;
  margin-bottom: 8px;
  font-size: 15px;
}

html.dark .explanation-section h4,
html.dark .command-section h4 {
  color: #79bbff;
}

.explanation-section p,
.command-section p {
  line-height: 1.8;
  color: #606266;
  margin: 6px 0;
}

html.dark .explanation-section p,
html.dark .command-section p {
  color: #a3a6ad;
}

.usage-code {
  font-family: 'Courier New', monospace;
  background: #ffffff;
  padding: 2px 6px;
  border-radius: 3px;
  color: #e6a23c;
}

html.dark .usage-code {
  background: rgba(0, 0, 0, 0.2);
}

/* 时间戳 */
.timestamp {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 12px;
  font-size: 12px;
  color: #c0c4cc;
}

html.dark .timestamp {
  color: #636466;
}

/* ====== 重新练习模式 ====== */
.retry-mode {
  padding: 0;
}

.retry-progress-bar {
  padding: 16px 20px;
  margin-bottom: 16px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

html.dark .retry-progress-bar {
  background: rgba(40, 40, 50, 0.9);
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.progress-text {
  font-size: 16px;
  font-weight: 600;
  color: #409eff;
}

html.dark .progress-text {
  color: #79bbff;
}

.retry-question {
  margin-top: 8px;
}

.retry-actions {
  text-align: center;
  margin: 16px 0;
}

.retry-actions .el-button {
  min-width: 120px;
}

.retry-result-actions {
  margin-top: 12px;
  display: flex;
  justify-content: center;
  gap: 12px;
}

/* ====== 移动端响应式 ====== */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .header-right {
    width: 100%;
    flex-direction: column;
  }

  .header-right .el-button {
    width: 100%;
  }

  .card-badges {
    gap: 6px;
  }

  .answer-row {
    padding: 8px 10px;
  }

  .answer-code {
    font-size: 14px;
  }

  .question-text {
    font-size: 15px;
  }

  .retry-result-actions {
    flex-direction: column;
    align-items: center;
  }

  .retry-result-actions .el-button {
    width: 100%;
    max-width: 280px;
  }
}
</style>
