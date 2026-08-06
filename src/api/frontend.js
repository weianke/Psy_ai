import service from '@/utils/request'

// 创建新的会话
export const startSession = data => {
    return service.post('/psychological-chat/session/start', data)
}

// 查询咨询会话
export const getSessionList = params => {
    return service.get('/psychological-chat/sessions', { params })
}

// 删除历史会话
export const deleteSession = sessionId => {
    return service.delete(`/psychological-chat/sessions/${sessionId}`)
}

// 获取会话列表
export const getSessionDetail = sessionId => {
    return service.get(`/psychological-chat/sessions/${sessionId}/messages`)
}

// 获取情绪分析结果
export const getSessionEmotion = sessionId => {
    return service.post(`/psychological-chat/session/${sessionId}/emotion`)
}

// 创建情绪日记
export const addEmotionDiary = data => {
    return service.post('/emotion-diary', data)
}
