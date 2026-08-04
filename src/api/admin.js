import service from '@/utils/request'

export const login = data => {
    return service.post('/user/login', data)
}

export const logout = token => {
    return service.post('/user/logout', { token })
}

// 获取分类下拉数据
export const categoryTree = () => {
    return service.get('/knowledge/category/tree')
}

// 获取分类列表
export const getCategoryList = params => {
    return service.get('/knowledge/article/page', { params })
}

// 上传图片
export const uploadFile = (file, businessInfo) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('businessType', 'ARTICLE')
    formData.append('businessId', businessInfo.businessId)
    formData.append('businessField', 'cover')

    return service.post('/file/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    })
}

// 新增文章
export const addArticle = data => {
    return service.post('/knowledge/article', data)
}

// 获取文章详情
export const getArticleDetail = id => {
    return service.get(`/knowledge/article/${id}`)
}

// 更新文章
export const updateArticle = (id, data) => {
    return service.put(`/knowledge/article/${id}`, data)
}

// 更新文章状态 status: 1 发布  2 下线
export const updateArticleStatus = (id, status) => {
    return service.put(`/knowledge/article/${id}/status`, { status })
}

// 删除文字
export const deleteArticle = id => {
    return service.delete(`/knowledge/article/${id}`)
}

// 咨询记录列表
export const getConsultationList = params => {
    return service.get('/psychological-chat/sessions', { params })
}

// 获取会话记录
export const getConsultationDetail = sessionId => {
    return service.get(`/psychological-chat/sessions/${sessionId}/messages`)
}

// 获取情绪日志列表
export const getEmotionLogList = params => {
    return service.get('/emotion-diary/admin/page', { params })
}

// 删除情绪日志
export const deleteEmotionLog = id => {
    return service.delete(`/emotion-diary/admin/${id}`)
}

// 获取综合数据分析
export const getDataAnalysis = () => {
    return service.get('/data-analytics/overview')
}

// 用户端注册
export const registerUser = data => {
    return service.post('/user/add', data)
}
