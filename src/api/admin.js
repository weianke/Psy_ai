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
