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
            <div class="chat-messages" ref="chatMessagesRef">
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
                            <!-- AI正在思考中【修改：使用msg.isStreaming，不再用全局isAiTying】 -->
                            <div
                                class="typing-indicator"
                                v-if="msg.senderType === 2 && msg.isStreaming && !msg.content"
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
                        <!-- 时间显示：本条消息自己的isStreaming状态，历史消息不受影响 -->
                        <div class="message-time">
                            {{
                                msg.senderType === 2 && msg.isStreaming
                                    ? '正在输入中...'
                                    : msg.createdAt
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
import { onMounted, ref, watch, nextTick } from 'vue'
import { startSession, getSessionList, deleteSession, getSessionDetail } from '@/api/frontend'
import { ElMessage } from 'element-plus'
import MarkdownRenderer from '@/components/MarkdownRenderer.vue'
import { fetchEventSource } from '@microsoft/fetch-event-source'

// 机器人头像图片地址，使用vite的import.meta.url获取静态资源
const imgUrl = new URL('@/assets/images/robot-fill.png', import.meta.url).href
// 用户消息右侧头像
const imgUrlRight = new URL('@/assets/images/like.png', import.meta.url).href
// 备用头像资源
const imgUrl3 = new URL('@/assets/images/users.png', import.meta.url).href

// 组件挂载完成之后执行
onMounted(() => {
    // 请求后端获取会话侧边栏列表
    getSessionPage()
    // 创建临时全新对话会话
    createNewFrontConsultation()
})

// ========== 响应式状态定义 ==========
// 核心消息数组：全部聊天历史都存在这里，用户消息+AI消息
const message = ref([])
// 输入框双向绑定变量：保存用户输入框实时文本
const userMessage = ref('')
// AI全局锁：true=AI正在流式输出；控制发送按钮/输入框禁用；不直接控制UI显示“正在输入”
const isAiTying = ref(false)
// 保存SSE中断控制器实例，用于切换会话、新建对话时终止正在进行的AI流
let globalAbortCtrl = null
// 标记流是否是正常收到done事件结束；区分是正常结束还是异常中断
let isNormalEnd = false

// 当前激活会话对象，保存sessionId、会话状态、会话标题
const currentSession = ref(null)
// 侧边栏会话列表数组，渲染历史对话列表
const sessionList = ref([])

// ========== 事件处理函数 ==========
/**
 * 输入框键盘监听事件
 * Enter发送消息，Shift+Enter换行
 * @param e 键盘事件对象
 */
const handleKeydownEnter = e => {
    // 判断按下Enter并且没有按住Shift键
    if (e.key === 'Enter' && !e.shiftKey) {
        // 阻止浏览器默认换行行为
        e.preventDefault()
        // 调用发送消息主函数
        sendMessage()
    }
}

/**
 * 【发送消息主入口函数】
 * ✅【用户输入内容添加到对话数组的位置就在这个函数内部】
 */
const sendMessage = () => {
    // 去除首尾空格，空文本直接返回，不发送
    if (!userMessage.value.trim()) return
    // 判断AI还在输出中，禁止重复发送
    if (isAiTying.value) {
        ElMessage.warning('AI助手正在输入中，请稍后')
        return
    }
    // 获取清理空格之后用户输入文本
    const userText = userMessage.value.trim()
    // 清空输入框
    userMessage.value = ''

    // ======================
    // ✨【关键点：把用户输入push进message对话数组】
    // senderType:1代表用户消息；senderType:2代表AI消息
    // createdAt 直接存当前本地时间字符串，用于模板渲染消息时间
    // ======================
    message.value.push({
        id: `user_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
        senderType: 1,
        content: userText,
        createdAt: new Date().toLocaleString(),
    })

    // 判断当前会话是临时会话TEMP：需要调用后端创建真实会话
    if (currentSession.value.status === 'TEMP') {
        // 创建会话，把用户第一条消息传给后端
        startNewSession(userText)
    } else {
        // 已有真实会话，直接开启SSE AI流式回复
        startAIResponse(currentSession.value.sessionId, userText)
    }
}

/**
 * 创建新会话接口调用（TEMP临时会话转正式会话）
 * @param userInput 用户第一条提问文本
 */
const startNewSession = async userInput => {
    // 组装创建会话请求参数
    const sessionParams = {
        initialMessage: userInput,
    }
    // 如果标题是默认“新对话”，自动生成带时间的标题；否则保留原有标题
    if (currentSession.value.sessionTitle === '新对话') {
        sessionParams.sessionTitle = `AI助手 = ${new Date().toLocaleString()}`
    } else {
        sessionParams.sessionTitle = currentSession.value.sessionTitle
    }
    try {
        // 请求后端startSession接口创建会话
        const data = await startSession(sessionParams)
        console.log('data', data)
        // 后端返回sessionId、status，组装会话对象
        const sessionData = {
            sessionId: data.sessionId,
            status: data.status,
            sessionTitle: sessionParams.sessionTitle,
        }
        // 如果原来是临时会话，原地覆盖对象属性；否则直接赋值
        if (currentSession.value && currentSession.value.status === 'TEMP') {
            Object.assign(currentSession.value, sessionData)
        } else {
            currentSession.value = sessionData
        }
        // 创建完会话刷新侧边栏会话列表
        getSessionPage()

        // 创建完会话，立刻发起AI流式请求拿到回答
        startAIResponse(currentSession.value.sessionId, userInput)
    } catch (error) {
        // 创建会话异常捕获
        console.error('创建会话失败:', error)
        ElMessage.error('创建会话失败')
    }
}

/**
 * 开启SSE流式获取AI回复核心函数
 * @param sessionId 当前会话id
 * @param userMessage 用户提问文本
 */
const startAIResponse = (sessionId, userMessage) => {
    // 二次校验锁，防止重复触发
    if (isAiTying.value) {
        ElMessage.warning('AI助手正在输入中，请稍后')
        return
    }
    // 打开全局AI输出锁，禁用发送按钮
    isAiTying.value = true
    // 重置流正常结束标记
    isNormalEnd = false

    // ✨【重点：预先push一条空内容AI消息到message数组】
    // isStreaming: true 这条标记交给template模板：用来渲染“正在输入”UI、打字光标动画
    const aiMessage = {
        id: `ai_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
        senderType: 2,
        content: '',
        createdAt: new Date().toLocaleString(),
        isStreaming: true,
    }
    message.value.push(aiMessage)

    // 创建AbortController控制器，提供手动中断SSE请求能力
    const ctrl = new AbortController()
    // 将控制器挂载全局变量，外部函数可以随时中断流
    globalAbortCtrl = ctrl

    // 调用fetchEventSource建立SSE长连接
    fetchEventSource('/api/psychological-chat/stream', {
        method: 'POST',
        // 请求头：指定json格式、token鉴权、接受SSE事件流
        headers: {
            'Content-Type': 'application/json',
            Token: localStorage.getItem('token') || '',
            Accept: 'text/event-stream',
        },
        // 请求body，传给后端会话id与用户提问
        body: JSON.stringify({
            sessionId,
            userMessage,
        }),
        // 绑定中断信号
        signal: ctrl.signal,
        // SSE连接成功打开回调
        onopen: response => {
            // 校验响应类型，非SSE流报错
            if (response.headers.get('content-type') !== 'text/event-stream') {
                ElMessage.error('服务器返回非流式数据')
            }
        },
        // 收到后端推送每一块消息片段触发，循环执行
        onmessage: event => {
            // 获取原始data数据，去除前后空格
            const raw = event.data.trim()
            // 空数据直接跳过
            if (!raw) return
            // 获取SSE事件名称
            const eventName = event.event
            // 拿到数组最后一条，也就是刚刚push进去那条AI空消息对象
            const aiMsgItem = message.value[message.value.length - 1]

            // 后端推送 done事件：代表AI全部输出完成
            if (eventName === 'done') {
                // 设置标记：流正常结束
                isNormalEnd = true
                // 关闭全局AI锁，恢复发送按钮
                isAiTying.value = false
                // ✨关闭本条消息的流式状态，模板就不再渲染“正在输入”动画
                aiMsgItem.isStreaming = false
                // 手动中断SSE连接
                ctrl.abort()
                return
            }

            // json解析后端返回的chunk片段数据
            const payload = JSON.parse(raw)
            // 判断后端返回code=200代表业务成功
            const ok = String(payload.code) === '200'
            if (ok && payload.data && payload.data.content) {
                // ✨流式核心逻辑：增量拼接文本，content不断追加片段，页面实时渲染打字效果
                aiMsgItem.content += payload.data.content
            } else if (!ok) {
                // 业务返回错误码，进入错误处理
                handleError(payload.message || 'AI回复失败')
            }
        },
        // SSE发生异常、网络断开触发
        onerror: error => {
            // 如果是正常done结束触发的error，直接忽略
            if (isNormalEnd) {
                isNormalEnd = false
                return
            }
            // 业务错误处理
            handleError(error || 'AI回复失败')
            // fetch‑event‑source要求onerror必须抛出错误，防止自动重连
            throw error
        },
        // SSE连接关闭回调
        onclose: () => {
            // 清空全局中断控制器
            globalAbortCtrl = null
        },
    })
}

/**
 * AI回复错误统一处理函数
 * @param error 错误信息文本
 */
const handleError = error => {
    // 获取最后一条AI消息对象
    const aiMessage = message.value[message.value.length - 1]
    if (aiMessage) {
        // 把消息内容改为错误提示文本
        aiMessage.content = 'AI回复失败'
        // 出错必须关闭isStreaming，模板停止渲染正在输入UI
        aiMessage.isStreaming = false
    }
    // 释放全局锁，恢复发送按钮
    isAiTying.value = false
    // elementplus弹出错误提示
    ElMessage.error(error || 'AI回复失败')
}

/**
 * 创建全新咨询对话：新建临时会话TEMP
 */
const createNewFrontConsultation = () => {
    // 如果当前有正在跑的SSE流，直接中断
    if (globalAbortCtrl) globalAbortCtrl.abort()
    // 关闭AI输出锁
    isAiTying.value = false
    // 组装临时会话对象，sessionId用时间戳随机生成，status标记TEMP临时
    const newSession = {
        sessionId: `temp_${Date.now()}`,
        status: 'TEMP',
        sessionTitle: '新对话',
    }
    // 赋值为当前激活会话
    currentSession.value = newSession
    // 清空整个消息数组，聊天窗口全部清空
    message.value = []
}

/**
 * 获取会话列表接口，侧边栏渲染历史会话
 */
const getSessionPage = async () => {
    try {
        // 请求后端分页拿会话列表，固定取第1页10条
        const data = await getSessionList({
            pageNum: 1,
            pageSize: 10,
        })
        // 把返回的会话记录赋值响应式变量，侧边栏v-for渲染
        sessionList.value = data.records
    } catch (error) {
        console.error('获取会话列表失败:', error)
    }
}

/**
 * 用户点击侧边栏历史会话，切换聊天
 * @param session 点击选中会话对象
 */
const handleSessionClick = async session => {
    // 如果当前AI还在输出，立刻中断SSE流
    if (globalAbortCtrl) globalAbortCtrl.abort()
    // 释放AI锁
    isAiTying.value = false
    try {
        // 根据会话id向后端请求会话完整历史消息记录
        const data = await getSessionDetail(session.id)
        // ✨后端返回的历史对话直接赋值给message数组，页面渲染全部历史消息
        // 后端返回每条消息自带 createdAt，模板直接渲染历史时间
        message.value = data
        // 组装当前会话对象
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

/**
 * 删除会话
 * @param sessionId 需要删除会话id
 */
const handleDeleteSession = async sessionId => {
    try {
        // 调用删除会话接口
        await deleteSession(sessionId)
        ElMessage.success('删除成功')
        // 删除之后刷新会话列表
        getSessionPage()
    } catch (error) {
        console.error('删除会话失败', error)
    }
}

/**
 * 简单内容替换工具，把换行符转html换行标签
 * @param content 原始消息文本
 * @returns 替换后字符串
 */
const formatMessageContent = content => {
    // 空值或者非字符串返回空
    if (!content || typeof content !== 'string') return ''
    // 将\n换行替换成<br>html换行
    return content.replace(/\n/g, '<br>')
}

// 获取聊天消息容器DOM引用，用于滚动到底部
const chatMessagesRef = ref(null)

/**
 * 滚动聊天面板滚动条到最底部
 * nextTick等待DOM更新完毕之后操作DOM滚动
 */
const scrollChatToBottom = async () => {
    await nextTick()
    if (chatMessagesRef.value) {
        // 设置滚动高度等于内容总高度，实现滚动到底部
        chatMessagesRef.value.scrollTop = chatMessagesRef.value.scrollHeight
    }
}

// 深度监听message数组，只要数组内部对象/内容发生改变，执行滚动到底部
// deep:true：数组内部对象属性变更（AI流式content不断追加、isStreaming变更）也会触发watch
watch(
    message,
    () => {
        scrollChatToBottom()
    },
    { deep: true }
)
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

/* 动画 */
@keyframes breathing {
    0% {
        transform: scale(1);
        box-shadow: 0 6px 24px rgba(251, 146, 60, 0.25);
    }
    50% {
        transform: scale(1.08);
        box-shadow: 0 8px 30px rgba(251, 146, 60, 0.4);
    }
    100% {
        transform: scale(1);
        box-shadow: 0 6px 24px rgba(251, 146, 60, 0.25);
    }
}
@keyframes pulse {
    0% {
        opacity: 1;
    }
    50% {
        opacity: 0.4;
    }
    100% {
        opacity: 1;
    }
}
@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
@keyframes typing {
    0%,
    100% {
        transform: translateY(0);
    }
    50% {
        transform: translateY(-6px);
    }
}
</style>
