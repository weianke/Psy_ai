import service from '@/utils/request'

export const login = data => {
    return service.post('/user/login', data)
}

export const logout = token => {
    return service.post('/user/logout', { token })
}

// 获取分类
export const categoryTree = () => {
    return service.get('/knowledge/category/tree')
}
