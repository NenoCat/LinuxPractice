<template>
  <div id="app" :class="{ 'mobile-menu-open': mobileMenuOpen }">
    <header class="app-header">
      <div class="header-left">
        <h1 class="app-title" @click="$router.push('/')">Linux命令学习系统</h1>
        <button class="hamburger-btn" @click="mobileMenuOpen = !mobileMenuOpen">
          <el-icon :size="20"><Fold v-if="mobileMenuOpen" /><Expand v-else /></el-icon>
        </button>
      </div>
      <nav class="nav-menu" :class="{ 'nav-open': mobileMenuOpen }">
        <el-menu
          :default-active="activeIndex"
          mode="horizontal"
          :ellipsis="false"
          @select="handleSelect"
          class="main-menu"
        >
          <el-menu-item index="/">
            <el-icon><EditPen /></el-icon>
            <span>练习</span>
          </el-menu-item>
          <el-menu-item index="/reference">
            <el-icon><Reading /></el-icon>
            <span>命令手册</span>
          </el-menu-item>
          <el-menu-item index="/wrong">
            <el-icon><Notebook /></el-icon>
            <span>错题本</span>
          </el-menu-item>
          <el-menu-item index="/import">
            <el-icon><Upload /></el-icon>
            <span>自定义导入</span>
          </el-menu-item>
        </el-menu>
      </nav>
      <div class="header-right">
        <el-button
          class="dark-toggle"
          :icon="isDark ? Sunny : Moon"
          circle
          @click="toggleDark"
        />
      </div>
    </header>
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { EditPen, Reading, Notebook, Upload, Sunny, Moon, Fold, Expand } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()

const isDark = ref(false)
const mobileMenuOpen = ref(false)

const activeIndex = computed(() => route.path)

const handleSelect = (index) => {
  router.push(index)
  mobileMenuOpen.value = false
}

const toggleDark = () => {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle('dark', isDark.value)
  localStorage.setItem('darkMode', isDark.value ? 'true' : 'false')
}

// 初始化暗色模式
onMounted(() => {
  const savedDark = localStorage.getItem('darkMode')
  if (savedDark === 'true') {
    isDark.value = true
    document.documentElement.classList.add('dark')
  }

  // 监听窗口大小变化，自动关闭移动菜单
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

const handleResize = () => {
  if (window.innerWidth > 768) {
    mobileMenuOpen.value = false
  }
}

// 路由变化时关闭移动菜单
watch(route, () => {
  mobileMenuOpen.value = false
})
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

#app {
  min-height: 100vh;
  background: #f5f7fa;
  transition: background 0.3s;
}

html.dark #app {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
}

.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  height: 60px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
  transition: background 0.3s, box-shadow 0.3s;
}

html.dark .app-header {
  background: rgba(30, 30, 40, 0.95);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.app-title {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  cursor: pointer;
  white-space: nowrap;
  transition: color 0.3s;
}

html.dark .app-title {
  color: #e0e0e0;
}

.hamburger-btn {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  color: #606266;
  padding: 4px;
}

html.dark .hamburger-btn {
  color: #c0c4cc;
}

.nav-menu {
  flex: 1;
  display: flex;
  justify-content: center;
}

.main-menu {
  background: transparent !important;
  border-bottom: none !important;
}

.main-menu .el-menu-item {
  font-size: 15px;
  font-weight: 500;
  border-bottom: none !important;
}

html.dark .main-menu .el-menu-item {
  color: #c0c4cc !important;
}

html.dark .main-menu .el-menu-item.is-active {
  color: #409eff !important;
  border-bottom-color: #409eff !important;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.dark-toggle {
  transition: all 0.3s;
}

html.dark .dark-toggle {
  --el-button-bg-color: rgba(255, 255, 255, 0.1);
  --el-button-border-color: rgba(255, 255, 255, 0.2);
  --el-button-text-color: #e0e0e0;
  --el-button-hover-bg-color: rgba(255, 255, 255, 0.2);
  --el-button-hover-border-color: rgba(255, 255, 255, 0.3);
  --el-button-hover-text-color: #fff;
}

.main-content {
  padding: 20px;
  min-height: calc(100vh - 60px);
}

/* 移动端响应式 */
@media (max-width: 768px) {
  .app-header {
    padding: 0 16px;
    flex-wrap: wrap;
    height: auto;
    min-height: 60px;
  }

  .hamburger-btn {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .nav-menu {
    display: none;
    width: 100%;
    order: 3;
    padding: 8px 0;
  }

  .nav-menu.nav-open {
    display: block;
    border-top: 1px solid rgba(0, 0, 0, 0.06);
  }

  html.dark .nav-menu.nav-open {
    border-top-color: rgba(255, 255, 255, 0.1);
  }

  .main-menu {
    display: flex;
    flex-direction: column;
  }

  .main-menu .el-menu-item {
    justify-content: flex-start;
    padding: 12px 20px !important;
  }

  .app-title {
    font-size: 16px;
  }

  .main-content {
    padding: 12px;
  }
}
</style>
