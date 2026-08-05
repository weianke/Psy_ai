import service from '@/utils/request'

// 创建新的会话
export const startSession = data => {
    return service.post('/psychological-chat/session/start', data)
}

// 查询咨询会话
export const getSessionList = params => {
    return service.get('/psychological-chat/sessions', { params })
}
