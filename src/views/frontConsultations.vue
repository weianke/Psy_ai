<template>
    <div class="consultation-container">
        <!-- 左侧边栏区域 -->
        <div class="sidebar">
            <!-- AI助手基础信息卡片 -->
            <div class="ai-assistant-info">
                <div class="breathing-circle">
                    <el-image :src="imgUrl" alt="AI助手" class="w-[25px] h-[25px]" />
                </div>
                <div class="assistant-name">AI助手</div>
                <div class="online-status"><span class="status-dot"></span>在线服务中</div>
            </div>
            <!-- 会话列表 -->
            <div class="session-history">
                <h4 class="session-title">会话列表</h4>
                <div class="session-list">
                    <div
                        v-for="session in sessionList"
                        :key="session.id"
                        @click="handleSessionClick(session)"
                        class="session-item"
                    >
                        <div class="session-info">
                            <div class="session-title">
                                <span>{{ session.sessionTitle }}</span>
                                <div class="session-meta">
                                    <span class="session-time">{{ session.startedAt }}</span>
                                </div>
                                <div class="session-preview">
                                    {{ session.lastMessageContent || '暂无消息' }}
                                </div>
                                <div class="session-stats">
                                    <span class="message-count">
                                        <el-icon>
                                            <ChatRound />
                                        </el-icon>
                                        {{ session.messageCount || 0 }}
                                    </span>

                                    <span class="message-count">
                                        <el-icon>
                                            <Clock />
                                        </el-icon>
                                        {{ session.durationMinutes || 0 }}分钟
                                    </span>
                                </div>
                            </div>
                            <div class="session-actions">
                                <el-button
                                    text
                                    size="small"
                                    type="danger"
                                    @click.stop="handleDeleteSession(session.id)"
                                    ><el-icon> <Delete /> </el-icon
                                ></el-button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 右侧聊天主容器 -->
        <div class="chat-main">
            <!-- 聊天头部：标题、新建会话按钮 -->
            <div class="chat-header">
                <div class="header-left">
                    <div class="chat-avatar">
                        <el-image :src="imgUrlRight" alt="AI助手" class="w-[30px] h-[30px]" />
                    </div>
                    <div class="chat-info">
                        <h2>AI助手</h2>
                        <p>您的贴心AI心理健康助手</p>
                    </div>
                </div>
                <!-- 点击加号：创建全新会话 -->
                <el-button circle @click="createNewFrontConsultation">
                    <el-icon><Plus /></el-icon>
                </el-button>
            </div>

            <!-- 聊天消息列表区域 -->
            <div class="chat-messages">
                <!-- 当消息数组为空，展示AI欢迎开场白 -->
                <div class="message-item ai-message" v-if="message.length === 0">
                    <div class="message-avatar">
                        <el-image :src="imgUrl" alt="AI助手" class="w-[25px] h-[25px]" />
                    </div>
                    <div class="message-content">
                        <div class="message-bubble">
                            <p>
                                您好，我是小暖，您的AI心理健康助手。很高兴陪伴您，为您提供温暖的心理支持。请告诉我，今天您感觉怎么样？有什么想要分享的吗？
                            </p>
                        </div>
                        <div class="message-time">刚刚</div>
                    </div>
                </div>
                <!-- 遍历消息数组，渲染用户和AI的消息 -->
                <div
                    class="message-item"
                    v-for="msg in message"
                    :key="msg.id"
                    :class="msg.senderType === 1 ? 'user-message' : 'ai-message'"
                >
                    <div class="message-avatar">
                        <el-image
                            :src="imgUrl3"
                            v-if="msg.senderType === 1"
                            class="w-[18px] h-[18px]"
                        ></el-image>
                        <el-image
                            :src="imgUrl"
                            v-if="msg.senderType === 2"
                            class="w-[18px] h-[18px]"
                        ></el-image>
                    </div>
                    <div class="message-content">
                        <div class="message-bubble">
                            <!-- AI正在思考中 -->
                            <div
                                class="typing-indicator"
                                v-if="msg.senderType === 2 && isAiTying && !msg.content"
                            >
                                <div class="typing-dot"></div>
                                <div class="typing-dot"></div>
                                <div class="typing-dot"></div>
                            </div>

                            <!-- AI错误提示 -->
                            <div v-else-if="msg.isError" class="error-indicator">
                                <p>{{ msg.content }}</p>
                            </div>

                            <!-- AI正常返回消息 -->
                            <MarkdownRenderer
                                v-else-if="msg.senderType === 2 && !msg.isError"
                                :content="msg.content"
                                :is-ai-message="true"
                            />

                            <!-- 用户消息 -->
                            <p
                                v-else-if="msg.content"
                                v-html="formatMessageContent(msg.content)"
                            ></p>
                        </div>
                        <div class="message-time">
                            {{
                                msg.senderType === 2 && isAiTying ? '正在输入中...' : msg.createdAt
                            }}
                        </div>
                    </div>
                </div>
            </div>

            <!-- 底部输入区域：文本框 + 发送按钮 -->
            <div class="chat-input">
                <div class="input-container">
                    <el-input
                        type="textarea"
                        v-model="userMessage"
                        placeholder="请输入您想要分享的内容..."
                        clearable
                        :autosize="{ minRows: 3, maxRows: 5 }"
                        :disabled="isAiTying"
                        @keydown.enter.prevent="handleKeydownEnter"
                        class="message-input"
                    ></el-input>
                    <div class="input-footer">
                        <span>按Enter发送，Shift+Enter换行</span>
                        <span>{{ userMessage.length }}/500</span>
                    </div>
                </div>
                <!-- 发送按钮，AI回复中按钮禁用不可点击 -->
                <el-button
                    class="send-btn"
                    type="primary"
                    @click="sendMessage"
                    :disabled="isAiTying || !userMessage.trim() || userMessage.length > 500"
                >
                    <el-icon><Promotion /></el-icon>
                </el-button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { startSession, getSessionList, deleteSession, getSessionDetail } from '@/api/frontend'
import { ElMessage } from 'element-plus'
import MarkdownRenderer from '@/components/MarkdownRenderer.vue'
import { fetchEventSource } from '@microsoft/fetch-event-source'

// 导入静态图片：vite处理assets内图片，转为浏览器可访问http地址
const imgUrl = new URL('@/assets/images/robot-fill.png', import.meta.url).href
const imgUrlRight = new URL('@/assets/images/like.png', import.meta.url).href

const imgUrl3 = new URL('@/assets/images/users.png', import.meta.url).href

// 组件挂载完成后执行：页面一打开自动执行新建会话，生成临时会话
onMounted(() => {
    // 获取会话列表
    getSessionPage()
    // 初始化创建一个新对话
    createNewFrontConsultation()
})

// ========== 响应式状态定义 ==========
/**
 * message：聊天消息数组
 * 用来存放整条对话记录，每一项是 {role:'user'|'ai', content:'消息文本'}
 */
const message = ref([])

/**
 * userMessage：输入框双向绑定变量，用户正在输入的文字
 */
const userMessage = ref('')

/**
 * isAiTying：AI正在回复标记
 * true=AI正在思考/输出，此时输入框、发送按钮禁用，防止重复发消息
 */
const isAiTying = ref(false)

/**
 * currentSession：当前会话对象 ref
 * 会话分为两种状态：
 * 1、TEMP临时会话：刚打开页面，还没有发送第一条消息，sessionId=temp_时间戳，没有和后端交互
 * 2、真实会话：用户发送第一条消息后，调用后端接口创建会话，拿到后端返回真实sessionId
 * {
 *    sessionId: 会话id，temp_xxx / 后端真实id
 *    status: 'TEMP' | ''
 *    sessionTitle: 会话标题
 * }
 */
const currentSession = ref(null)
const sessionList = ref([]) // 会话列表，暂时未渲染dom

// ========== 事件处理函数 ==========
/**
 * 输入框回车键盘事件
 * @desc enter发送消息，shift+enter允许换行
 * @param {KeyboardEvent} e 键盘事件对象
 */
const handleKeydownEnter = e => {
    // 判断按下Enter，并且没有按住shift键
    if (e.key === 'Enter' && !e.shiftKey) {
        console.log('发送消息:', userMessage.value)
        // prevent：阻止textarea回车默认换行行为
        e.preventDefault()
        // ✨这里你只打印日志，**没有调用sendMessage()！这是一个BUG！回车不会真正发消息**
        sendMessage()
    }
}

/**
 * sendMessage 点击发送按钮执行的发送消息主逻辑
 */
const sendMessage = () => {
    // 去除首尾空格，如果输入是空文本直接return，不允许发送空白消息
    if (!userMessage.value.trim()) return

    // 如果AI正在回复，弹窗警告，直接返回，禁止发送
    if (isAiTying.value) {
        ElMessage.warning('AI助手正在输入中，请稍后')
        return
    }

    // 拿到修剪后的纯文本消息
    const message = userMessage.value.trim()

    // 清空输入框
    userMessage.value = ''

    // 判断：如果当前会话是【临时会话TEMP】，代表是本次对话第一条消息，需要请求后端创建真实会话
    if (currentSession.value.status === 'TEMP') {
        startNewSession(message)
    }
    // ⚠缺失逻辑：如果不是TEMP（历史旧会话），直接发送聊天消息给AI接口，你目前代码没有写这部分！
}

/**
 * startNewSession 创建会话接口
 * 场景：页面刚打开，用户发送第一条消息，把临时会话转为后端持久化真实会话
 * @param {string} message 用户第一条发送的消息文本
 */
const startNewSession = async message => {
    // 组装传给后端的会话参数
    const sessionParams = {
        initialMessage: message, // 用户第一条消息
    }

    // 如果标题是默认"新对话"，用时间作为会话标题；否则沿用旧会话标题
    if (currentSession.value.sessionTitle === '新对话') {
        sessionParams.sessionTitle = `AI助手 = ${new Date().toLocaleString()}`
    } else {
        // 如果是历史对话记录
        sessionParams.sessionTitle = currentSession.value.sessionTitle
    }

    try {
        // 调用api发起创建会话请求
        const data = await startSession(sessionParams)
        console.log('data', data)

        // 后端返回的数据，组装成本地前端会话对象格式
        const sessionData = {
            sessionId: data.sessionId,
            status: data.status,
            sessionTitle: sessionParams.sessionTitle,
        }

        // 判断：如果现在还是临时会话，原地修改currentSession，把临时会话更新成后端返回真实会话
        // Object.assign：原地合并属性，不替换ref引用，保留原有对象，覆盖新增字段
        if (currentSession.value && currentSession.value.status === 'TEMP') {
            Object.assign(currentSession.value, sessionData)
        } else {
            // 否则直接整体赋值，覆盖整个会话对象
            currentSession.value = sessionData
        }
        // 更新会话列表
        getSessionPage()
        // 开始流式对话
        startAIResponse(currentSession.value.sessionId, message)
    } catch (error) {
        // 请求异常，这里为空，建议加上错误提示
        console.error('创建会话失败:', error)
    }
}

const startAIResponse = (sessionId, userMessage) => {
    if (isAiTying.value) {
        ElMessage.warning('AI助手正在输入中，请稍后')
        return
    }
    isAiTying.value = true

    const aiMessage = {
        id: `ai_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
        senderType: 2,
        content: '',
        createdAt: new Date().toLocaleString(),
    }

    message.value.push(aiMessage)

    const ctrl = new AbortController()
    // 需要调用流式接口
    fetchEventSource('/api/psychological-chat/stream', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Token: localStorage.getItem('token') || '',
            Accept: 'text/event-stream',
        },
        body: JSON.stringify({
            sessionId,
            userMessage,
        }),
        signal: ctrl.signal,
        onopen: response => {
            console.log(response)
            if (response.headers.get('content-type') !== 'text/event-stream') {
                ElMessage.error('服务器返回非流式数据')
            }
        },
        onmessage: event => {
            const raw = event.data.trim()
            if (!raw) return
            const eventName = event.event
            // 当前会话的AI消息
            const aiMessage = message.value[message.value.length - 1]
            if (eventName === 'done') {
                isAiTying.value = false
                ctrl.abort()
                return
            }
            const payload = JSON.parse(raw)
            const ok = String(payload.code) === '200'

            if (ok && payload.data && payload.data.content) {
                aiMessage.content += payload.data.content
            } else if (!ok) {
                // 错误处理
                handleError(payload.message || 'AI回复失败')
            }
        },
        onerror: error => {
            // 错误处理
            handleError(error || 'AI回复失败')
            throw error
        },
        onclose: () => {
            // 开始情绪分析
        },
    })
}

// 错误处理函数
const handleError = error => {
    const aiMessage = message.value[message.value.length - 1]

    if (aiMessage) {
        aiMessage.content = 'AI回复失败'
    }

    isAiTying.value = false
    ElMessage.error(error || 'AI回复失败')
}

/**
 * createNewFrontConsultation 新建会话
 * 场景：页面onMounted初始化；点击右上角加号按钮
 * 作用：生成本地临时会话，不请求后端，用户发送第一条消息才真正创建后端会话
 */
const createNewFrontConsultation = () => {
    // temp_时间戳，前端临时会话id，还没存数据库
    const newSession = {
        sessionId: `temp_${Date.now()}`,
        status: 'TEMP',
        sessionTitle: '新对话',
    }
    // 赋值给当前会话
    currentSession.value = newSession
    // ⚠缺失：清空message消息数组，新建对话旧消息还会残留！
    message.value = [] // 需要清空消息
}

// 获取会话列表，暂时未渲染dom
const getSessionPage = async () => {
    try {
        const data = await getSessionList({
            pageNum: 1,
            pageSize: 10,
        })
        sessionList.value = data.records
    } catch (error) {
        console.error('获取会话列表失败:', error)
    }
}

// 获取历史会话数据
const handleSessionClick = async session => {
    try {
        const data = await getSessionDetail(session.id)
        message.value = data

        // 更新当前会话对象数据
        const sessionData = {
            sessionId: 'session_' + session.id,
            status: 'ACTIVE',
            sessionTitle: session.sessionTitle,
        }

        currentSession.value = sessionData
    } catch (error) {
        console.error('获取历史会话详情失败:', error)
    }
}

// 删除历史会话
const handleDeleteSession = sessionId => {
    try {
        deleteSession(sessionId)
        ElMessage.success('删除成功')
        getSessionPage()
    } catch (error) {}
}

const formatMessageContent = content => {
    // 这里可以添加对用户消息的格式化逻辑，比如转义HTML、处理换行等
    return content.replace(/\n/g, '<br>')
}
</script>

<style lang="scss" scoped>
/* 外层大容器，整体布局：左侧sidebar + 右侧chat-main flex横向布局 */
.consultation-container {
    margin: 0 auto;
    width: 1200px;
    display: flex;
    gap: 20px;
    padding: 20px;
    min-height: calc(100vh - 121px);
    .sidebar {
        width: 320px;
        .ai-assistant-info {
            margin-bottom: 20px;
            background: linear-gradient(
                135deg,
                rgba(255, 255, 255, 0.9) 0%,
                rgba(255, 252, 248, 0.95) 100%
            );
            border-radius: 16px;
            padding: 16px;
            box-shadow:
                0 8px 32px rgba(251, 146, 60, 0.06),
                0 2px 8px rgba(0, 0, 0, 0.04);
            border: 1px solid rgba(251, 146, 60, 0.08);
            backdrop-filter: blur(10px);
            transition: all 0.3s ease;
            .breathing-circle {
                width: 60px;
                height: 60px;
                background: linear-gradient(135deg, #fb923c 0%, #f59e0b 100%);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto 12px;
                animation: breathing 4s ease-in-out infinite; /* 呼吸动画 */
                box-shadow: 0 6px 24px rgba(251, 146, 60, 0.25);
                position: relative;
            }
            .assistant-name {
                font-size: 16px;
                font-weight: 700;
                background: linear-gradient(135deg, #fb923c, #f59e0b);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                text-align: center;
                background-clip: text;
                margin: 0 0 12px;
            }
            .online-status {
                display: flex;
                align-items: center;
                justify-content: center;
                color: #059669;
                font-size: 12px;
                font-weight: 600;
                .status-dot {
                    width: 8px;
                    height: 8px;
                    background: #059669;
                    border-radius: 50%;
                    margin-right: 8px;
                    animation: pulse 2s infinite; /* 在线圆点脉冲闪烁 */
                    box-shadow: 0 0 8px rgba(5, 150, 105, 0.4);
                }
            }
        }
        /* --------以下侧边栏剩余样式（会话历史、情绪花园，模板中未渲染dom，样式保留--------- */
        .session-history {
            background: white;
            border-radius: 16px;
            padding: 16px;
            box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
            margin-bottom: 20px;
            min-height: 250px;
            display: flex;
            flex-direction: column;
            .section-title {
                font-size: 16px;
                font-weight: 600;
                color: #333;
                margin: 0 0 16px;
                display: flex;
                align-items: center;
                justify-content: space-between;
            }
            .session-list {
                margin-top: 10px;
                overflow-y: auto;
                max-height: 200px;
                scrollbar-width: thin;
                scrollbar-color: rgba(64, 150, 255, 0.3) transparent;
                .session-item {
                    position: relative;
                    display: flex;
                    align-items: flex-start;
                    gap: 12px;
                    padding: 12px;
                    margin-bottom: 8px;
                    border-radius: 12px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    border: 2px solid transparent;
                    &:hover {
                        background: #f8f9ff;
                        border-color: #e6f0ff;
                    }
                    &.active {
                        background: #e6f0ff;
                        border-color: #4096ff;
                    }
                    .session-info {
                        flex: 1;
                        .session-title {
                            font-weight: 500;
                            font-size: 14px;
                            color: #333;
                            margin-bottom: 4px;
                            white-space: nowrap;
                            overflow: hidden;
                            text-overflow: ellipsis;
                            .session-meta {
                                display: flex;
                                align-items: center;
                                gap: 8px;
                                margin-bottom: 6px;
                                .session-time {
                                    font-size: 12px;
                                    color: #999;
                                }
                            }
                            .session-preview {
                                width: 200px;
                                font-size: 12px;
                                color: #666;
                                margin-bottom: 6px;
                                white-space: nowrap;
                                overflow: hidden;
                                text-overflow: ellipsis;
                            }
                            .session-stats {
                                display: flex;
                                align-items: center;
                                gap: 12px;
                                span {
                                    font-size: 12px;
                                    color: #999;
                                    display: flex;
                                    align-items: center;
                                    gap: 4px;
                                }
                            }
                        }
                        .session-actions {
                            position: absolute;
                            top: 10px;
                            right: 12px;
                        }
                    }
                }
                .no-sessions-text {
                    text-align: center;
                    font-size: 14px;
                    color: #999;
                }
            }
        }
        .emotion-garden {
            background: linear-gradient(135deg, #fef9e7 0%, #fcf4e6 50%, #f6f0e8 100%);
            border-radius: 20px;
            padding: 16px;
            margin-bottom: 20px;
            box-shadow: 0 8px 32px rgba(252, 244, 230, 0.8);
            border: 1px solid rgba(255, 255, 255, 0.2);
            position: relative;
            overflow: hidden;
            min-height: 300px;

            .garden-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: 20px;
                position: relative;
                z-index: 2;
                .garden-title {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 16px;
                    font-weight: 600;
                    color: #8b4513;
                }
            }
            .emotion-info {
                margin: 0 auto;
                width: 80px;
                height: 80px;
                border-radius: 50%;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                z-index: 10;
                box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
                border: 2px solid rgba(255, 255, 255, 0.8);
                background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%);
                color: #fff;
                .emotion-name {
                    font-size: 15px;
                    font-weight: 600;
                    line-height: 1;
                    margin-bottom: 2px;
                }
                .emotion-score {
                    font-size: 14px;
                    font-weight: 700;
                    opacity: 0.9;
                }
            }
            .warm-tips {
                text-align: center;
                margin-bottom: 16px;
                .emotion-status-text {
                    margin-bottom: 12px;
                    .status-label {
                        font-size: 14px;
                        color: #8b7355;
                        margin-right: 8px;
                    }
                    .status-emotion {
                        font-size: 16px;
                        font-weight: 600;
                        padding: 4px 12px;
                        border-radius: 16px;
                        display: inline-block;
                    }
                }
                .emotion-intensity {
                    margin-bottom: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    .intensity-dots {
                        display: flex;
                        gap: 4px;
                        .dot {
                            width: 8px;
                            height: 8px;
                            border-radius: 50%;
                            background: #e0e0e0;
                            transition: all 0.3s ease;
                            &.active {
                                background: linear-gradient(135deg, #ff9a9e, #fecfef);
                                transform: scale(1.2);
                                box-shadow: 0 2px 8px rgba(255, 154, 158, 0.4);
                            }
                        }
                    }
                    .intensity-text {
                        font-size: 12px;
                        color: #8b7355;
                        font-weight: 500;
                    }
                }
                .warm-suggestion {
                    background: linear-gradient(
                        135deg,
                        rgba(255, 255, 255, 0.95),
                        rgba(255, 255, 255, 0.8)
                    );
                    border-radius: 16px;
                    padding: 12px;
                    margin-bottom: 16px;
                    display: flex;
                    align-items: flex-start;
                    gap: 10px;
                    border: 1px solid rgba(255, 255, 255, 0.6);
                    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
                    .suggestion-icon {
                        font-size: 20px;
                        flex-shrink: 0;
                        margin-top: 2px;
                    }
                    .suggestion-content {
                        text-align: left;
                        flex: 1;
                        .suggestion-title {
                            font-size: 14px;
                            font-weight: 600;
                            color: #8b7355;
                            margin-bottom: 6px;
                        }
                        .suggestion-text {
                            font-size: 13px;
                            color: #6b5b47;
                            line-height: 1.5;
                        }
                    }
                }
                .healing-actions {
                    margin-bottom: 16px;
                    .actions-title {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: 8px;
                        font-size: 14px;
                        font-weight: 600;
                        color: #8b7355;
                        margin-bottom: 16px;
                    }
                    .actions-list {
                        display: flex;
                        flex-direction: column;
                        gap: 10px;
                        .action-item {
                            background: linear-gradient(
                                135deg,
                                rgba(255, 255, 255, 0.9),
                                rgba(255, 255, 255, 0.7)
                            );
                            border-radius: 12px;
                            padding: 12px;
                            display: flex;
                            align-items: center;
                            gap: 10px;
                            border: 1px solid rgba(255, 255, 255, 0.5);
                            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
                            text-align: left;
                            .action-icon {
                                font-size: 14px;
                                color: #ffd700;
                                flex-shrink: 0;
                            }
                            .action-text {
                                font-size: 12px;
                                color: #6b5b47;
                                line-height: 1.4;
                                flex: 1;
                            }
                        }
                    }
                }
                .risk-notice {
                    background: linear-gradient(135deg, #fff9e6, #ffeaa7);
                    border-radius: 16px;
                    padding: 16px;
                    display: flex;
                    align-items: flex-start;
                    gap: 12px;
                    border: 1px solid rgba(255, 234, 167, 0.6);
                    box-shadow: 0 6px 20px rgba(255, 234, 167, 0.3);
                    .notice-icon {
                        font-size: 20px;
                        flex-shrink: 0;
                        margin-top: 2px;
                    }
                    .notice-content {
                        flex: 1;
                        .notice-title {
                            font-size: 14px;
                            font-weight: 600;
                            color: #d4840f;
                            margin-bottom: 6px;
                        }
                        .notice-text {
                            font-size: 13px;
                            color: #b8740c;
                            line-height: 1.5;
                        }
                    }
                }
            }
        }
    }

    /* =========聊天主面板样式========= */
    .chat-main {
        background: linear-gradient(
            135deg,
            rgba(255, 255, 255, 0.95) 0%,
            rgba(255, 252, 250, 0.98) 100%
        );
        border-radius: 20px;
        box-shadow:
            0 12px 40px rgba(251, 146, 60, 0.08),
            0 4px 16px rgba(0, 0, 0, 0.04);
        border: 1px solid rgba(251, 146, 60, 0.1);
        backdrop-filter: blur(10px);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        flex: 1; /* flex布局自动占满剩余宽度 */
        .chat-header {
            background: linear-gradient(135deg, #fb923c 0%, #f59e0b 100%);
            color: white;
            padding: 20px 24px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            position: relative;
            flex-shrink: 0; /* 头部禁止压缩 */
            .header-left {
                display: flex;
                align-items: center;
                .chat-avatar {
                    width: 48px;
                    height: 48px;
                    background: rgba(255, 255, 255, 0.25);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-right: 16px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                    position: relative;
                    z-index: 1;
                }
                .chat-info {
                    h2 {
                        font-size: 20px;
                        font-weight: 700;
                        margin-bottom: 4px;
                    }
                    p {
                        font-size: 14px;
                    }
                }
            }
        }
        .chat-messages {
            flex: 1; /* 消息区域占满垂直剩余高度，实现滚动 */
            overflow-y: auto; /* 内容超出出现滚动条 */
            padding: 24px;
            display: flex;
            flex-direction: column;
            gap: 16px;
            background: linear-gradient(
                135deg,
                rgba(255, 255, 255, 0.02) 0%,
                rgba(255, 252, 248, 0.05) 100%
            );
            min-height: 0; /* flex垂直滚动必备修复 */
            max-height: calc(100vh - 200px);
            scrollbar-width: thin;
            scrollbar-color: rgba(251, 146, 60, 0.3) transparent;
            .message-item {
                display: flex;
                align-items: flex-start;
                gap: 12px;
                .message-avatar {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 14px;
                    color: white;
                    flex-shrink: 0;
                }
                &.ai-message {
                    .message-avatar {
                        background: linear-gradient(135deg, #fb923c, #f59e0b);
                        box-shadow: 0 4px 12px rgba(251, 146, 60, 0.3);
                    }
                }
                &.user-message {
                    .message-avatar {
                        background: linear-gradient(135deg, #6b7280, #4b5563);
                        box-shadow: 0 4px 12px rgba(107, 114, 128, 0.3);
                    }
                }
                .message-content {
                    max-width: 70%; /* 气泡最大宽度，防止消息拉太宽 */
                    .message-bubble {
                        background: linear-gradient(
                            135deg,
                            rgba(255, 255, 255, 0.9) 0%,
                            rgba(255, 252, 248, 0.95) 100%
                        );
                        border-radius: 16px;
                        padding: 12px 16px;
                        position: relative;
                        animation: fadeInUp 0.4s ease-out;
                        border: 1px solid rgba(251, 146, 60, 0.1);
                        box-shadow: 0 4px 16px rgba(251, 146, 60, 0.05);
                        .typing-indicator {
                            display: flex;
                            gap: 4px;
                            padding: 8px 0;
                            .typing-dot {
                                width: 8px;
                                height: 8px;
                                background: #ccc;
                                border-radius: 50%;
                                animation: typing 1.5s ease-in-out infinite;
                                &:nth-child(2) {
                                    animation-delay: 0.2s;
                                }
                                &:nth-child(3) {
                                    animation-delay: 0.4s;
                                }
                            }
                        }
                        /* 错误消息样式 */
                        .error-message {
                            background: linear-gradient(135deg, #fef2f2 0%, #fecaca 100%);
                            border: 1px solid #f87171;
                            border-radius: 12px;
                            padding: 12px 16px;
                            color: #991b1b;
                            font-weight: 500;
                            display: flex;
                            align-items: center;
                            gap: 8px;
                        }
                    }
                    .message-time {
                        font-size: 12px;
                        color: #999;
                        margin-top: 4px;
                    }
                }
            }
        }
        /* 底部输入栏 */
        .chat-input {
            border-top: 1px solid rgba(251, 146, 60, 0.1);
            padding: 20px 24px;
            display: flex;
            gap: 12px;
            align-items: flex-end;
            background: linear-gradient(
                135deg,
                rgba(255, 255, 255, 0.5) 0%,
                rgba(255, 252, 248, 0.7) 100%
            );
            backdrop-filter: blur(10px);
            flex-shrink: 0; /* 输入区域禁止压缩 */
            .input-container {
                flex: 1;
            }
            .input-footer {
                display: flex;
                justify-content: space-between;
                align-items: center;
                font-size: 12px;
                color: #78716c;
                font-weight: 500;
            }
            .send-btn {
                height: 60px;
                width: 60px;
                border-radius: 16px;
                background: linear-gradient(135deg, #fb923c 0%, #f59e0b 100%) !important;
                border: none !important;
                box-shadow: 0 6px 20px rgba(251, 146, 60, 0.25);
                transition: all 0.3s ease;
            }
        }
    }
}
</style>
