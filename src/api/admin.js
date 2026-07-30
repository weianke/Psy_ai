import service from '@/utils/request'

export const login = data => {
    return service.post('/user/login', data)
}
