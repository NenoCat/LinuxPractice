<template>
  <el-card class="result-panel" :class="resultClass" shadow="hover">
    <div class="result-content">
      <el-icon :size="40" class="result-icon">
        <Check v-if="isCorrect" />
        <Close v-else />
      </el-icon>
      
      <div class="answer-section">
        <div class="answer-item" v-if="!isCorrect">
          <span class="answer-label">你的答案：</span>
          <code class="answer-code">{{ userAnswer || '未作答' }}</code>
        </div>
        
        <div class="answer-item">
          <span class="answer-label">正确答案：</span>
          <code class="answer-code correct">{{ correctAnswer }}</code>
          <el-button
            :icon="DocumentCopy"
            size="small"
            text
            type="primary"
            @click="copyAnswer"
            class="copy-btn"
          >
            复制
          </el-button>
        </div>
      </div>
      
      <div class="explanation-section" v-if="explanation">
        <h4>解析：</h4>
        <p>{{ explanation }}</p>
      </div>
      
      <div class="command-info" v-if="commandInfo">
        <h4>命令说明：</h4>
        <p><strong>命令：</strong>{{ commandInfo.command }}</p>
        <p><strong>描述：</strong>{{ commandInfo.description }}</p>
        <p v-if="commandInfo.usage"><strong>用法：</strong><code>{{ commandInfo.usage }}</code></p>
      </div>
    </div>
  </el-card>
</template>

<script setup>
import { computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Check, Close, DocumentCopy } from '@element-plus/icons-vue'

const props = defineProps({
  isCorrect: {
    type: Boolean,
    required: true
  },
  userAnswer: {
    type: String,
    default: ''
  },
  correctAnswer: {
    type: String,
    required: true
  },
  explanation: {
    type: String,
    default: ''
  },
  commandInfo: {
    type: Object,
    default: null
  }
})

const resultClass = computed(() => {
  return props.isCorrect ? 'result-correct' : 'result-incorrect'
})

const copyAnswer = async () => {
  try {
    await navigator.clipboard.writeText(props.correctAnswer)
    ElMessage.success('已复制到剪贴板')
  } catch (err) {
    // 降级方案：使用传统方法
    const textArea = document.createElement('textarea')
    textArea.value = props.correctAnswer
    textArea.style.position = 'fixed'
    textArea.style.opacity = '0'
    document.body.appendChild(textArea)
    textArea.select()
    try {
      document.execCommand('copy')
      ElMessage.success('已复制到剪贴板')
    } catch (e) {
      ElMessage.error('复制失败，请手动复制')
    }
    document.body.removeChild(textArea)
  }
}
</script>

<style scoped>
.result-panel {
  max-width: 800px;
  margin: 20px auto;
  border-radius: 12px;
  transition: all 0.3s;
}

.result-correct {
  border-left: 4px solid #67c23a;
  background: linear-gradient(to right, #f0f9ff, #ffffff);
}

.result-incorrect {
  border-left: 4px solid #f56c6c;
  background: linear-gradient(to right, #fef0f0, #ffffff);
}

.result-content {
  text-align: center;
  padding: 10px;
}

.result-icon {
  margin-bottom: 1px;
}

.result-correct .result-icon {
  color: #67c23a;
}

.result-incorrect .result-icon {
  color: #f56c6c;
}

.answer-section {
  margin: 1px 0;
  text-align: left;
}

.answer-item {
  margin: 10px 0;
  padding: 10px;
  background: #f5f7fa;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.answer-label {
  font-weight: 600;
  color: #606266;
  margin-right: 10px;
}

.answer-code {
  font-family: 'Courier New', monospace;
  font-size: 16px;
  padding: 4px 8px;
  background: #ffffff;
  border-radius: 4px;
  border: 1px solid #dcdfe6;
}

.answer-code.correct {
  color: #67c23a;
  border-color: #67c23a;
  font-weight: 600;
  flex: 1;
  min-width: 0;
}

.copy-btn {
  margin-left: auto;
  flex-shrink: 0;
}

.explanation-section,
.command-info {
  margin-top: 20px;
  padding: 15px;
  background: #f9fafc;
  border-radius: 8px;
  text-align: left;
}

.explanation-section h4,
.command-info h4 {
  color: #409eff;
  margin-bottom: 10px;
  font-size: 16px;
}

.explanation-section p,
.command-info p {
  line-height: 1.8;
  color: #606266;
  margin: 8px 0;
}

.command-info code {
  font-family: 'Courier New', monospace;
  background: #ffffff;
  padding: 2px 6px;
  border-radius: 3px;
  color: #e6a23c;
}
</style>

