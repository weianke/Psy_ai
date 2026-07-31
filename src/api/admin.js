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

// 删除文字
export const deleteArticle = id => {
    return service.delete(`/knowledge/article/${id}`)
}
