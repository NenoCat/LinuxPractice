<template>
  <div class="command-detail-view">
    <!-- 返回栏 -->
    <div class="back-bar">
      <el-button :icon="Back" @click="$router.push('/reference')">
        返回命令手册
      </el-button>
    </div>

    <!-- 命令信息卡片 -->
    <el-card class="command-info-card" shadow="hover" v-loading="loading">
      <div v-if="command" class="command-header">
        <div class="command-title-row">
          <span class="command-name">
            <span class="prompt">$</span> {{ command.command }}
          </span>
          <el-tag size="small" :type="categoryTagType(command.category)" effect="plain">
            {{ command.category }}
          </el-tag>
        </div>
        <p class="command-desc">{{ command.description }}</p>
        <div class="command-usage">
          <code>{{ command.usage }}</code>
        </div>
      </div>
      <el-empty v-else description="未找到该命令" />
    </el-card>

    <!-- 相关题目 -->
    <div class="questions-section" v-if="questions.length > 0">
      <h3 class="section-title">
        <el-icon><Document /></el-icon>
        相关练习题（{{ questions.length }} 道）
      </h3>
      <div class="question-list">
        <el-card
          v-for="(q, index) in questions"
          :key="q.id"
          class="question-card"
          shadow="hover"
        >
          <div class="question-header">
            <span class="question-index">第 {{ index + 1 }} 题</span>
            <div class="question-tags">
              <el-tag size="small" :type="q.type === 'choice' ? 'primary' : 'success'" effect="plain">
                {{ q.type === 'choice' ? '选择题' : '填空题' }}
              </el-tag>
              <el-tag size="small" :type="difficultyType(q.difficulty)" effect="plain">
                {{ q.difficulty }}
              </el-tag>
            </div>
          </div>
          <p class="question-text">{{ q.question_text }}</p>
          <div class="answer-row">
            <span class="answer-label">正确答案：</span>
            <code class="answer-code">{{ q.correct_answer }}</code>
          </div>
          <div class="explanation-row" v-if="q.explanation">
            <span class="answer-label">解析：</span>
            <p class="explanation-text">{{ q.explanation }}</p>
          </div>
        </el-card>
      </div>
    </div>

    <el-empty
      v-else-if="!loading && command"
      description="暂无相关练习题"
      :image-size="120"
      class="empty-questions"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Back, Document } from '@element-plus/icons-vue'
import { initDatabase, getCommandByName, getQuestionsByCommand } from '../utils/db.js'

const route = useRoute()
const router = useRouter()

const command = ref(null)
const questions = ref([])
const loading = ref(true)

const categoryTagType = (category) => {
  const map = {
    '文件操作': '',
    '系统管理': 'success',
    '网络操作': 'warning',
    '文本处理': 'danger',
    '压缩归档': 'info',
    '用户与权限': 'success',
    '管道与重定向': 'warning',
    '进程与服务': 'danger'
  }
  return map[category] || ''
}

const difficultyType = (difficulty) => {
  switch (difficulty) {
    case '初级': return 'success'
    case '中级': return 'warning'
    case '高级': return 'danger'
    default: return 'info'
  }
}

const loadData = async () => {
  const cmdName = route.params.command
  if (!cmdName) {
    router.push('/reference')
    return
  }

  try {
    await initDatabase()
    command.value = getCommandByName(cmdName)
    if (command.value) {
      questions.value = getQuestionsByCommand(cmdName)
    }
  } catch (error) {
    console.error('加载命令详情失败:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.command-detail-view {
  max-width: 1000px;
  margin: 0 auto;
}

.back-bar {
  margin-bottom: 16px;
}

.command-info-card {
  border-radius: 12px;
  margin-bottom: 20px;
}

.command-header {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.command-title-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.command-name {
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 28px;
  font-weight: 700;
  color: #7c3aed;
  letter-spacing: 0.5px;
}

html.dark .command-name {
  color: #a78bfa;
}

.prompt {
  color: #22c55e;
  font-weight: 400;
}

html.dark .prompt {
  color: #4ade80;
}

.command-desc {
  font-size: 15px;
  color: #606266;
  margin: 0;
  line-height: 1.6;
}

html.dark .command-desc {
  color: #b0b0b0;
}

.command-usage {
  background: #f4f4f5;
  border-radius: 8px;
  padding: 12px 16px;
}

html.dark .command-usage {
  background: rgba(255, 255, 255, 0.06);
}

.command-usage code {
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 14px;
  color: #303133;
}

html.dark .command-usage code {
  color: #d4d4d4;
}

.questions-section {
  margin-top: 8px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 16px;
}

html.dark .section-title {
  color: #e0e0e0;
}

.question-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.question-card {
  border-radius: 12px;
}

.question-card :deep(.el-card__body) {
  padding: 16px 20px;
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  flex-wrap: wrap;
  gap: 8px;
}

.question-index {
  font-size: 14px;
  font-weight: 600;
  color: #909399;
}

.question-tags {
  display: flex;
  gap: 8px;
}

.question-text {
  font-size: 16px;
  line-height: 1.7;
  color: #303133;
  margin: 0 0 12px;
  font-weight: 500;
}

html.dark .question-text {
  color: #e0e0e0;
}

.answer-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 8px;
}

.answer-label {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
  white-space: nowrap;
}

html.dark .answer-label {
  color: #a0a4a8;
}

.answer-code {
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 14px;
  color: #67c23a;
  background: #f0f9eb;
  padding: 4px 10px;
  border-radius: 6px;
  font-weight: 600;
}

html.dark .answer-code {
  background: rgba(103, 194, 58, 0.15);
}

.explanation-row {
  display: flex;
  gap: 8px;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px dashed #e4e7ed;
}

html.dark .explanation-row {
  border-top-color: rgba(255, 255, 255, 0.1);
}

.explanation-text {
  font-size: 14px;
  color: #606266;
  line-height: 1.7;
  margin: 0;
  flex: 1;
}

html.dark .explanation-text {
  color: #a0a4a8;
}

.empty-questions {
  padding: 40px 0;
}

@media (max-width: 768px) {
  .command-name {
    font-size: 22px;
  }

  .question-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .answer-row {
    align-items: flex-start;
  }

  .explanation-row {
    flex-direction: column;
  }
}
</style>
