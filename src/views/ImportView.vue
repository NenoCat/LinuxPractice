<template>
  <div class="import-view">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2 class="page-title">自定义导入</h2>
      <p class="page-subtitle">导入自定义题目，丰富题库</p>
    </div>

    <!-- 数据库统计 -->
    <div class="stats-card">
      <div class="stats-title">当前题库统计</div>
      <div class="stats-row">
        <div class="stats-item">
          <span class="stats-number">{{ commandCount }}</span>
          <span class="stats-label">命令总数</span>
        </div>
        <div class="stats-divider"></div>
        <div class="stats-item">
          <span class="stats-number">{{ questionCount }}</span>
          <span class="stats-label">题目总数</span>
        </div>
      </div>
    </div>

    <!-- 导入区域 -->
    <div class="import-card">
      <div class="card-title">导入题目</div>
      <el-input
        v-model="jsonInput"
        type="textarea"
        :rows="10"
        placeholder="在此粘贴 JSON 格式的题目数据..."
        class="json-input"
      />
      <div class="import-actions">
        <el-button type="primary" @click="handleImport" :disabled="!jsonInput.trim()">
          导入题目
        </el-button>
        <el-button @click="fillSample">查看示例</el-button>
        <el-button @click="clearInput" :disabled="!jsonInput.trim()">清空</el-button>
      </div>

      <!-- 导入结果 -->
      <el-alert
        v-if="importResult"
        :title="importResult.title"
        :type="importResult.type"
        :description="importResult.description"
        show-icon
        closable
        @close="importResult = null"
        class="import-result"
      />
    </div>

    <!-- JSON 格式说明 -->
    <div class="format-card">
      <div class="card-title">JSON 格式说明</div>
      <p class="format-desc">
        请按以下格式提供数据，<code>commands</code> 和 <code>questions</code> 字段均可选，
        但至少需要提供一个。题目中的 <code>command</code> 字段需要与 <code>commands</code> 中的命令对应，
        若命令不存在则会自动创建。
      </p>
      <div class="code-block">
        <pre><code>{{ formatExample }}</code></pre>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { initDatabase, importQuestions, getAllCommands, getQuestionsCount } from '../utils/db.js'

const jsonInput = ref('')
const importResult = ref(null)
const commandCount = ref(0)
const questionCount = ref(0)

const formatExample = `{
  "commands": [
    {
      "command": "docker",
      "description": "容器管理工具",
      "usage": "docker [选项] 命令",
      "category": "容器"
    }
  ],
  "questions": [
    {
      "type": "choice",
      "command": "docker",
      "question_text": "要列出所有运行中的容器，应该使用哪个命令？",
      "options": ["docker ps", "docker list", "docker run", "docker images"],
      "correct_answer": "docker ps",
      "explanation": "docker ps 可以列出当前运行中的容器",
      "difficulty": "初级"
    }
  ]
}`

const sampleJSON = JSON.stringify({
  commands: [
    {
      command: 'docker',
      description: '容器管理工具',
      usage: 'docker [选项] 命令',
      category: '容器'
    },
    {
      command: 'docker-compose',
      description: '多容器编排工具',
      usage: 'docker-compose [选项] 命令',
      category: '容器'
    }
  ],
  questions: [
    {
      type: 'choice',
      command: 'docker',
      question_text: '要列出所有运行中的容器，应该使用哪个命令？',
      options: ['docker ps', 'docker list', 'docker run', 'docker images'],
      correct_answer: 'docker ps',
      explanation: 'docker ps 可以列出当前运行中的容器',
      difficulty: '初级'
    },
    {
      type: 'choice',
      command: 'docker-compose',
      question_text: '要在后台启动 docker-compose 定义的服务，应该使用哪个命令？',
      options: ['docker-compose up -d', 'docker-compose start', 'docker-compose run', 'docker-compose build'],
      correct_answer: 'docker-compose up -d',
      explanation: 'docker-compose up -d 会在后台启动并运行所有服务',
      difficulty: '初级'
    },
    {
      type: 'fill',
      command: 'docker',
      question_text: '删除所有已停止的容器的命令是？',
      options: [],
      correct_answer: 'docker container prune',
      explanation: 'docker container prune 会删除所有已停止的容器',
      difficulty: '中级'
    },
    {
      type: 'fill',
      command: 'docker-compose',
      question_text: '查看 docker-compose 服务日志的命令是？',
      options: [],
      correct_answer: 'docker-compose logs',
      explanation: 'docker-compose logs 可以查看服务的日志输出',
      difficulty: '中级'
    }
  ]
}, null, 2)

const loadStats = async () => {
  try {
    await initDatabase()
    const commands = getAllCommands()
    commandCount.value = commands.length
    questionCount.value = getQuestionsCount()
  } catch (e) {
    console.error('加载统计失败:', e)
  }
}

const handleImport = async () => {
  const input = jsonInput.value.trim()
  if (!input) {
    ElMessage.warning('请先输入 JSON 数据')
    return
  }

  let parsed
  try {
    parsed = JSON.parse(input)
  } catch (e) {
    importResult.value = {
      title: 'JSON 格式错误',
      type: 'error',
      description: `无法解析 JSON：${e.message}，请检查格式是否正确`
    }
    return
  }

  // 验证结构
  if (typeof parsed !== 'object' || parsed === null) {
    importResult.value = {
      title: '格式错误',
      type: 'error',
      description: 'JSON 根元素必须是对象，包含 commands 和/或 questions 字段'
    }
    return
  }

  if (!parsed.commands && !parsed.questions) {
    importResult.value = {
      title: '格式错误',
      type: 'error',
      description: 'JSON 至少需要包含 commands 或 questions 字段之一'
    }
    return
  }

  if (parsed.commands && !Array.isArray(parsed.commands)) {
    importResult.value = {
      title: '格式错误',
      type: 'error',
      description: 'commands 字段必须是数组'
    }
    return
  }

  if (parsed.questions && !Array.isArray(parsed.questions)) {
    importResult.value = {
      title: '格式错误',
      type: 'error',
      description: 'questions 字段必须是数组'
    }
    return
  }

  // 验证题目字段
  const questions = parsed.questions || []
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i]
    if (!q.type || !q.command || !q.question_text || !q.correct_answer || !q.difficulty) {
      importResult.value = {
        title: '题目字段不完整',
        type: 'error',
        description: `第 ${i + 1} 道题缺少必要字段（type, command, question_text, correct_answer, difficulty）`
      }
      return
    }
    if (q.type === 'choice' && (!Array.isArray(q.options) || q.options.length < 2)) {
      importResult.value = {
        title: '选项格式错误',
        type: 'error',
        description: `第 ${i + 1} 道题是选择题，options 必须是包含至少2个选项的数组`
      }
      return
    }
  }

  try {
    await initDatabase()
    importQuestions(parsed)

    const cmdCount = (parsed.commands || []).length
    const qCount = (parsed.questions || []).length
    const parts = []
    if (cmdCount > 0) parts.push(`${cmdCount} 个命令`)
    if (qCount > 0) parts.push(`${qCount} 道题目`)

    importResult.value = {
      title: '导入成功',
      type: 'success',
      description: `成功导入${parts.join(' 和 ')}！`
    }

    loadStats()
  } catch (e) {
    importResult.value = {
      title: '导入失败',
      type: 'error',
      description: `导入过程中出错：${e.message}`
    }
  }
}

const fillSample = () => {
  jsonInput.value = sampleJSON
  importResult.value = null
}

const clearInput = () => {
  jsonInput.value = ''
  importResult.value = null
}

onMounted(() => {
  loadStats()
})
</script>

<style scoped>
.import-view {
  max-width: 900px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  margin-bottom: 24px;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: #303133;
  margin-bottom: 6px;
}

html.dark .page-title {
  color: #e0e0e0;
}

.page-subtitle {
  font-size: 15px;
  color: #606266;
}

html.dark .page-subtitle {
  color: rgba(255, 255, 255, 0.6);
}

/* 统计卡片 */
.stats-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 20px 28px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

html.dark .stats-card {
  background: rgba(40, 40, 50, 0.9);
}

.stats-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 16px;
}

html.dark .stats-title {
  color: #e0e0e0;
}

.stats-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 40px;
}

.stats-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stats-number {
  font-size: 32px;
  font-weight: 700;
  color: #409eff;
}

html.dark .stats-number {
  color: #79bbff;
}

.stats-label {
  font-size: 13px;
  color: #909399;
}

.stats-divider {
  width: 1px;
  height: 40px;
  background: #e4e7ed;
}

html.dark .stats-divider {
  background: #4c4d4f;
}

/* 导入卡片 */
.import-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

html.dark .import-card {
  background: rgba(40, 40, 50, 0.9);
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 16px;
}

html.dark .card-title {
  color: #e0e0e0;
}

.json-input :deep(.el-textarea__inner) {
  font-family: 'Cascadia Code', 'Fira Code', 'Consolas', monospace;
  font-size: 13px;
  line-height: 1.6;
  border-radius: 8px;
}

.import-actions {
  display: flex;
  gap: 12px;
  margin-top: 16px;
  flex-wrap: wrap;
}

.import-result {
  margin-top: 16px;
}

/* 格式说明卡片 */
.format-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

html.dark .format-card {
  background: rgba(40, 40, 50, 0.9);
}

.format-desc {
  font-size: 14px;
  color: #606266;
  line-height: 1.8;
  margin-bottom: 16px;
}

html.dark .format-desc {
  color: #a0a4a8;
}

.format-desc code {
  background: #f0f2f5;
  color: #409eff;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 13px;
}

html.dark .format-desc code {
  background: rgba(255, 255, 255, 0.1);
  color: #79bbff;
}

.code-block {
  background: #1e1e2e;
  border-radius: 8px;
  padding: 16px;
  overflow-x: auto;
}

.code-block pre {
  margin: 0;
}

.code-block code {
  font-family: 'Cascadia Code', 'Fira Code', 'Consolas', monospace;
  font-size: 13px;
  line-height: 1.6;
  color: #cdd6f4;
  white-space: pre;
}

/* 移动端响应式 */
@media (max-width: 768px) {
  .page-title {
    font-size: 22px;
  }

  .page-subtitle {
    font-size: 13px;
  }

  .stats-card,
  .import-card,
  .format-card {
    padding: 16px;
    border-radius: 10px;
  }

  .stats-row {
    gap: 24px;
  }

  .stats-number {
    font-size: 26px;
  }

  .import-actions {
    flex-direction: column;
  }

  .import-actions .el-button {
    width: 100%;
  }

  .code-block {
    padding: 12px;
    font-size: 12px;
  }

  .code-block code {
    font-size: 11px;
  }
}
</style>
