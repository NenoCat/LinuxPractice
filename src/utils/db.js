import initSqlJs from 'sql.js'
import { getInitSQL } from '../database/init.js'

let db = null
let SQL = null

// 初始化数据库
export async function initDatabase() {
  if (db) return db

  SQL = await initSqlJs({
    locateFile: file => `/${file}`
  })

  db = new SQL.Database()
  const initSQL = getInitSQL()
  db.run(initSQL)

  return db
}

// 获取随机题目（支持分类和难度筛选）
export function getRandomQuestion(category, difficulty) {
  if (!db) {
    throw new Error('数据库未初始化')
  }

  let whereClause = ''
  const conditions = []
  if (category) {
    conditions.push(`c.category = '${category}'`)
  }
  if (difficulty) {
    conditions.push(`q.difficulty = '${difficulty}'`)
  }
  if (conditions.length > 0) {
    whereClause = 'WHERE ' + conditions.join(' AND ')
  }

  const result = db.exec(`
    SELECT
      q.id,
      q.type,
      q.question_text,
      q.options,
      q.correct_answer,
      q.explanation,
      q.difficulty,
      c.command,
      c.description,
      c.usage,
      c.category
    FROM questions q
    LEFT JOIN commands c ON q.command_id = c.id
    ${whereClause}
    ORDER BY RANDOM()
    LIMIT 1
  `)

  if (result.length === 0) {
    return null
  }

  const row = result[0].values[0]
  const columns = result[0].columns

  const question = {}
  columns.forEach((col, index) => {
    question[col] = row[index]
  })

  // 解析options JSON
  if (question.options) {
    try {
      if (typeof question.options === 'string') {
        question.options = JSON.parse(question.options)
      }
      if (!Array.isArray(question.options)) {
        question.options = []
      }
    } catch (e) {
      console.warn('解析选项失败:', e, question.options)
      question.options = []
    }
  } else {
    question.options = []
  }

  return question
}

// 验证答案
export function checkAnswer(questionId, userAnswer) {
  if (!db) {
    throw new Error('数据库未初始化')
  }

  const result = db.exec(`
    SELECT correct_answer
    FROM questions
    WHERE id = ${questionId}
  `)

  if (result.length === 0) {
    return false
  }

  const correctAnswer = result[0].values[0][0]

  // 答案验证：支持大小写不敏感、空格容错、参数顺序容错
  return normalizeAnswer(userAnswer) === normalizeAnswer(correctAnswer)
}

// 规范化答案用于比较
function normalizeAnswer(answer) {
  if (!answer) return ''

  // 转换为小写
  let normalized = answer.toLowerCase().trim()

  // 移除多余空格（多个空格变为单个空格）
  normalized = normalized.replace(/\s+/g, ' ')

  // 对于命令参数，排序参数顺序（如 -rn 和 -r -n 视为相同）
  // 提取所有参数
  const parts = normalized.split(/\s+/)
  const command = parts[0]
  const args = parts.slice(1)

  // 分离选项参数和值参数
  const flags = []
  const values = []

  args.forEach(arg => {
    if (arg.startsWith('-')) {
      // 处理组合参数如 -rn 拆分为 -r -n
      if (arg.startsWith('--')) {
        flags.push(arg)
      } else if (arg.length > 2) {
        // 组合参数如 -rn
        for (let i = 1; i < arg.length; i++) {
          flags.push('-' + arg[i])
        }
      } else {
        flags.push(arg)
      }
    } else {
      values.push(arg)
    }
  })

  // 排序参数（使 -r -n 和 -rn 等效）
  flags.sort()

  // 重新组合
  const normalizedArgs = [...flags, ...values].join(' ')
  return (command + ' ' + normalizedArgs).trim()
}

// 根据命令名获取命令详情
export function getCommandByName(command) {
  if (!db) {
    throw new Error('数据库未初始化')
  }

  const result = db.exec(`
    SELECT *
    FROM commands
    WHERE command = '${command}'
    LIMIT 1
  `)

  if (result.length === 0) {
    return null
  }

  const row = result[0].values[0]
  const columns = result[0].columns

  const cmd = {}
  columns.forEach((col, index) => {
    cmd[col] = row[index]
  })

  return cmd
}

// 获取命令详情
export function getCommandInfo(commandId) {
  if (!db) {
    throw new Error('数据库未初始化')
  }

  const result = db.exec(`
    SELECT *
    FROM commands
    WHERE id = ${commandId}
  `)

  if (result.length === 0) {
    return null
  }

  const row = result[0].values[0]
  const columns = result[0].columns

  const command = {}
  columns.forEach((col, index) => {
    command[col] = row[index]
  })

  return command
}

// 获取所有命令
export function getAllCommands() {
  if (!db) {
    throw new Error('数据库未初始化')
  }

  const result = db.exec(`
    SELECT * FROM commands ORDER BY category, command
  `)

  if (result.length === 0) {
    return []
  }

  const columns = result[0].columns
  return result[0].values.map(row => {
    const command = {}
    columns.forEach((col, index) => {
      command[col] = row[index]
    })
    return command
  })
}

// 按分类获取题目
export function getQuestionsByCategory(category) {
  if (!db) {
    throw new Error('数据库未初始化')
  }

  const result = db.exec(`
    SELECT
      q.id,
      q.type,
      q.question_text,
      q.options,
      q.correct_answer,
      q.explanation,
      q.difficulty,
      c.command,
      c.description,
      c.usage,
      c.category
    FROM questions q
    LEFT JOIN commands c ON q.command_id = c.id
    WHERE c.category = '${category}'
  `)

  if (result.length === 0) {
    return []
  }

  const columns = result[0].columns
  return result[0].values.map(row => {
    const question = {}
    columns.forEach((col, index) => {
      question[col] = row[index]
    })
    if (question.options) {
      try {
        if (typeof question.options === 'string') {
          question.options = JSON.parse(question.options)
        }
        if (!Array.isArray(question.options)) {
          question.options = []
        }
      } catch (e) {
        question.options = []
      }
    } else {
      question.options = []
    }
    return question
  })
}

// 根据ID获取题目
export function getQuestionById(id) {
  if (!db) {
    throw new Error('数据库未初始化')
  }

  const result = db.exec(`
    SELECT
      q.id,
      q.type,
      q.question_text,
      q.options,
      q.correct_answer,
      q.explanation,
      q.difficulty,
      c.command,
      c.description,
      c.usage,
      c.category
    FROM questions q
    LEFT JOIN commands c ON q.command_id = c.id
    WHERE q.id = ${id}
  `)

  if (result.length === 0) {
    return null
  }

  const row = result[0].values[0]
  const columns = result[0].columns

  const question = {}
  columns.forEach((col, index) => {
    question[col] = row[index]
  })

  if (question.options) {
    try {
      if (typeof question.options === 'string') {
        question.options = JSON.parse(question.options)
      }
      if (!Array.isArray(question.options)) {
        question.options = []
      }
    } catch (e) {
      question.options = []
    }
  } else {
    question.options = []
  }

  return question
}

// 按命令名获取题目
export function getQuestionsByCommand(command) {
  if (!db) {
    throw new Error('数据库未初始化')
  }

  const result = db.exec(`
    SELECT
      q.id,
      q.type,
      q.question_text,
      q.options,
      q.correct_answer,
      q.explanation,
      q.difficulty,
      c.command,
      c.description,
      c.usage,
      c.category
    FROM questions q
    LEFT JOIN commands c ON q.command_id = c.id
    WHERE c.command = '${command}'
  `)

  if (result.length === 0) {
    return []
  }

  const columns = result[0].columns
  return result[0].values.map(row => {
    const question = {}
    columns.forEach((col, index) => {
      question[col] = row[index]
    })
    if (question.options) {
      try {
        if (typeof question.options === 'string') {
          question.options = JSON.parse(question.options)
        }
        if (!Array.isArray(question.options)) {
          question.options = []
        }
      } catch (e) {
        question.options = []
      }
    } else {
      question.options = []
    }
    return question
  })
}

// 获取题目数量
export function getQuestionsCount(category, difficulty) {
  if (!db) {
    throw new Error('数据库未初始化')
  }

  let whereClause = ''
  const conditions = []
  if (category) {
    conditions.push(`c.category = '${category}'`)
  }
  if (difficulty) {
    conditions.push(`q.difficulty = '${difficulty}'`)
  }
  if (conditions.length > 0) {
    whereClause = 'WHERE ' + conditions.join(' AND ')
  }

  const result = db.exec(`
    SELECT COUNT(*) as count
    FROM questions q
    LEFT JOIN commands c ON q.command_id = c.id
    ${whereClause}
  `)

  if (result.length === 0) {
    return 0
  }

  return result[0].values[0][0]
}

// 获取所有分类
export function getCategories() {
  if (!db) {
    throw new Error('数据库未初始化')
  }

  const result = db.exec(`
    SELECT DISTINCT category FROM commands ORDER BY category
  `)

  if (result.length === 0) {
    return []
  }

  return result[0].values.map(row => row[0])
}

// 获取错题本中的题目
export function getWrongQuestions() {
  const raw = localStorage.getItem('linux_wrong_book')
  if (!raw) return []

  let wrongBook
  try {
    wrongBook = JSON.parse(raw)
  } catch (e) {
    return []
  }

  if (!Array.isArray(wrongBook)) return []

  return wrongBook
    .map(entry => {
      const question = getQuestionById(entry.questionId)
      if (question) {
        question.userAnswer = entry.userAnswer
        question.wrongTimestamp = entry.timestamp
      }
      return question
    })
    .filter(q => q !== null)
}

// 添加到错题本
export function addToWrongBook(questionId, userAnswer) {
  const raw = localStorage.getItem('linux_wrong_book')
  let wrongBook = []
  try {
    wrongBook = raw ? JSON.parse(raw) : []
  } catch (e) {
    wrongBook = []
  }

  if (!Array.isArray(wrongBook)) wrongBook = []

  const existingIndex = wrongBook.findIndex(entry => entry.questionId === questionId)
  const newEntry = { questionId, userAnswer, timestamp: Date.now() }

  if (existingIndex !== -1) {
    wrongBook[existingIndex] = newEntry
  } else {
    wrongBook.push(newEntry)
  }

  localStorage.setItem('linux_wrong_book', JSON.stringify(wrongBook))
}

// 从错题本移除
export function removeFromWrongBook(questionId) {
  const raw = localStorage.getItem('linux_wrong_book')
  let wrongBook = []
  try {
    wrongBook = raw ? JSON.parse(raw) : []
  } catch (e) {
    wrongBook = []
  }

  if (!Array.isArray(wrongBook)) return

  wrongBook = wrongBook.filter(entry => entry.questionId !== questionId)
  localStorage.setItem('linux_wrong_book', JSON.stringify(wrongBook))
}

// 清空错题本
export function clearWrongBook() {
  localStorage.removeItem('linux_wrong_book')
}

// 获取练习统计
export function getStats() {
  const raw = localStorage.getItem('linux_practice_stats')
  if (!raw) {
    return { totalAnswered: 0, correctCount: 0, history: [] }
  }

  try {
    const stats = JSON.parse(raw)
    return {
      totalAnswered: stats.totalAnswered || 0,
      correctCount: stats.correctCount || 0,
      history: stats.history || []
    }
  } catch (e) {
    return { totalAnswered: 0, correctCount: 0, history: [] }
  }
}

// 保存练习统计
export function saveStats(totalAnswered, correctCount) {
  const stats = getStats()
  stats.totalAnswered = totalAnswered
  stats.correctCount = correctCount

  const today = new Date().toISOString().slice(0, 10)
  const todayEntry = stats.history.find(h => h.date === today)
  if (todayEntry) {
    todayEntry.total = totalAnswered
    todayEntry.correct = correctCount
  } else {
    stats.history.push({ date: today, total: totalAnswered, correct: correctCount })
  }

  localStorage.setItem('linux_practice_stats', JSON.stringify(stats))
}

// 导入题目
export function importQuestions(jsonData) {
  if (!db) {
    throw new Error('数据库未初始化')
  }

  const { commands = [], questions = [] } = jsonData

  // 先处理命令
  for (const cmd of commands) {
    const existing = db.exec(`SELECT id FROM commands WHERE command = '${cmd.command}'`)
    if (existing.length === 0) {
      db.run(
        `INSERT INTO commands (command, description, usage, category) VALUES (?, ?, ?, ?)`,
        [cmd.command, cmd.description, cmd.usage, cmd.category]
      )
    }
  }

  // 再处理题目
  for (const q of questions) {
    // 查找命令ID
    const cmdResult = db.exec(`SELECT id FROM commands WHERE command = '${q.command}'`)
    let commandId = null

    if (cmdResult.length > 0) {
      commandId = cmdResult[0].values[0][0]
    } else {
      // 命令不存在，先插入
      db.run(
        `INSERT INTO commands (command, description, usage, category) VALUES (?, ?, ?, ?)`,
        [q.command, q.description || '', q.usage || '', '未分类']
      )
      const newCmd = db.exec(`SELECT id FROM commands WHERE command = '${q.command}'`)
      if (newCmd.length > 0) {
        commandId = newCmd[0].values[0][0]
      }
    }

    if (commandId !== null) {
      const optionsStr = Array.isArray(q.options) ? JSON.stringify(q.options) : q.options
      db.run(
        `INSERT INTO questions (type, command_id, question_text, options, correct_answer, explanation, difficulty) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [q.type, commandId, q.question_text, optionsStr, q.correct_answer, q.explanation, q.difficulty]
      )
    }
  }
}
