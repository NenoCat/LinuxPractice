<template>
  <div class="reference-view">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2 class="page-title">命令速查手册</h2>
      <p class="page-subtitle">Linux 常用命令快速查阅，点击「去练习」即可针对性训练</p>
    </div>

    <!-- 搜索栏 -->
    <div class="search-bar">
      <el-input
        v-model="searchQuery"
        placeholder="搜索命令名称或描述..."
        :prefix-icon="Search"
        clearable
        size="large"
      />
    </div>

    <!-- 分类标签 -->
    <el-tabs v-model="activeCategory" class="category-tabs">
      <el-tab-pane label="全部" name="全部" />
      <el-tab-pane
        v-for="cat in categories"
        :key="cat"
        :label="cat"
        :name="cat"
      />
    </el-tabs>

    <!-- 命令卡片网格 -->
    <div v-if="filteredCommands.length > 0" class="command-grid">
      <el-card
        v-for="cmd in filteredCommands"
        :key="cmd.id"
        class="command-card"
        shadow="hover"
      >
        <div class="card-body">
          <div class="card-top">
            <span class="command-name">
              <span class="prompt">$</span> {{ cmd.command }}
            </span>
            <el-tag size="small" :type="categoryTagType(cmd.category)" effect="plain">
              {{ cmd.category }}
            </el-tag>
          </div>
          <p class="command-desc">{{ cmd.description }}</p>
          <div class="command-usage">
            <code>{{ cmd.usage }}</code>
          </div>
          <el-collapse class="card-collapse">
            <el-collapse-item>
              <template #title>
                <span class="collapse-title">共 {{ getQuestionCount(cmd.category, cmd.command) }} 道练习题</span>
              </template>
              <div class="collapse-action">
                <el-button
                  type="info"
                  size="small"
                  plain
                  @click="goView(cmd.command)"
                >
                  去查看
                </el-button>
                <el-button
                  type="primary"
                  size="small"
                  @click="goPractice(cmd.category)"
                >
                  去练习
                </el-button>
              </div>
            </el-collapse-item>
          </el-collapse>
        </div>
      </el-card>
    </div>

    <!-- 空状态 -->
    <div v-else class="empty-state">
      <el-empty description="没有找到匹配的命令" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Search } from '@element-plus/icons-vue'
import { initDatabase, getAllCommands, getCategories, getQuestionsCount } from '../utils/db.js'

const router = useRouter()

const commands = ref([])
const categories = ref([])
const searchQuery = ref('')
const activeCategory = ref('全部')
const questionCounts = ref({})

const filteredCommands = computed(() => {
  let result = commands.value

  if (activeCategory.value !== '全部') {
    result = result.filter(cmd => cmd.category === activeCategory.value)
  }

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.trim().toLowerCase()
    result = result.filter(cmd =>
      cmd.command.toLowerCase().includes(q) ||
      cmd.description.toLowerCase().includes(q)
    )
  }

  return result
})

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

const getQuestionCount = (category, command) => {
  const key = `${category}:${command}`
  return questionCounts.value[key] || 0
}

const goPractice = (category) => {
  router.push({ path: '/', query: { category } })
}

const goView = (command) => {
  router.push({ path: `/command/${command}` })
}

const loadData = async () => {
  try {
    await initDatabase()
    commands.value = getAllCommands()
    categories.value = getCategories()

    const counts = {}
    for (const cmd of commands.value) {
      const key = `${cmd.category}:${cmd.command}`
      if (!counts[key]) {
        const catCount = getQuestionsCount(cmd.category)
        commands.value
          .filter(c => c.category === cmd.category)
          .forEach(c => {
            counts[`${c.category}:${c.command}`] = catCount
          })
      }
    }
    questionCounts.value = counts
  } catch (error) {
    console.error('加载数据失败:', error)
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.reference-view {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  margin-bottom: 20px;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: #303133;
  margin: 0 0 6px;
}

.page-subtitle {
  font-size: 14px;
  color: #606266;
  margin: 0;
}

.search-bar {
  margin-bottom: 12px;
}

.search-bar :deep(.el-input__wrapper) {
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

html.dark .search-bar :deep(.el-input__wrapper) {
  background: rgba(40, 40, 50, 0.9);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.search-bar :deep(.el-input__inner) {
  color: #303133;
}

html.dark .search-bar :deep(.el-input__inner) {
  color: #e0e0e0;
}

.search-bar :deep(.el-input__inner::placeholder) {
  color: #a8abb2;
}

html.dark .search-bar :deep(.el-input__inner::placeholder) {
  color: #6c6e72;
}

.category-tabs {
  margin-bottom: 16px;
}

.category-tabs :deep(.el-tabs__header) {
  margin: 0;
}

.category-tabs :deep(.el-tabs__nav-wrap::after) {
  display: none;
}

.category-tabs :deep(.el-tabs__item) {
  color: #606266;
  font-weight: 500;
  padding: 0 16px;
  height: 40px;
  line-height: 40px;
}

.category-tabs :deep(.el-tabs__item:hover) {
  color: #303133;
}

.category-tabs :deep(.el-tabs__item.is-active) {
  color: #303133;
  font-weight: 600;
}

.category-tabs :deep(.el-tabs__active-bar) {
  background-color: #409eff;
  border-radius: 2px;
  height: 3px;
}

.command-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.command-card {
  border-radius: 12px;
  transition: transform 0.2s, box-shadow 0.2s;
  overflow: hidden;
}

.command-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
}

html.dark .command-card:hover {
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
}

html.dark .command-card {
  background: rgba(40, 40, 50, 0.95);
  border-color: rgba(255, 255, 255, 0.08);
}

.command-card :deep(.el-card__body) {
  padding: 16px 20px;
}

.card-body {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.command-name {
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 18px;
  font-weight: 700;
  color: #7c3aed;
  letter-spacing: 0.5px;
}

html.dark .command-name {
  color: #a78bfa;
}

.prompt {
  color: #22c55e;
  margin-right: 4px;
  font-weight: 400;
}

html.dark .prompt {
  color: #4ade80;
}

.command-desc {
  font-size: 14px;
  color: #606266;
  margin: 0;
  line-height: 1.5;
}

html.dark .command-desc {
  color: #b0b0b0;
}

.command-usage {
  background: #f4f4f5;
  border-radius: 6px;
  padding: 8px 12px;
}

html.dark .command-usage {
  background: rgba(255, 255, 255, 0.06);
}

.command-usage code {
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 13px;
  color: #303133;
}

html.dark .command-usage code {
  color: #d4d4d4;
}

.card-collapse {
  border: none;
  margin-top: 2px;
}

.card-collapse :deep(.el-collapse-item__header) {
  background: transparent;
  border: none;
  height: 32px;
  line-height: 32px;
  padding: 0;
}

.card-collapse :deep(.el-collapse-item__wrap) {
  background: transparent;
  border: none;
}

.card-collapse :deep(.el-collapse-item__content) {
  padding: 0 0 4px;
}

.collapse-title {
  font-size: 13px;
  color: #909399;
}

html.dark .collapse-title {
  color: #8a8a8a;
}

.collapse-action {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.empty-state {
  padding: 60px 0;
}

.empty-state :deep(.el-empty__description p) {
  color: #909399;
}

@media (max-width: 1024px) {
  .command-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .page-title {
    font-size: 22px;
  }

  .command-grid {
    grid-template-columns: 1fr;
  }

  .category-tabs :deep(.el-tabs__item) {
    padding: 0 10px;
    font-size: 13px;
  }
}
</style>
