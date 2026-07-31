<template>
    <el-dialog title="文章详情" v-model="visible" width="50%" @close="handleClose" v-bind="$attrs">
        <el-form :model="formData" :rules="rules" ref="formRef" label-width="120px">
            <el-form-item label="文章标题" prop="title">
                <el-input
                    v-model="formData.title"
                    placeholder="请输入文章标题"
                    maxlength="200"
                    show-word-limit
                    clearable
                ></el-input>
            </el-form-item>
            <el-form-item label="所属分类" prop="categoryId">
                <el-select v-model="formData.categoryId" placeholder="请选择分类">
                    <el-option
                        v-for="item in categories"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                    ></el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="文章摘要" prop="summary">
                <el-input
                    type="textarea"
                    v-model="formData.summary"
                    placeholder="请输入文章摘要"
                    maxlength="1200"
                    show-word-limit
                    :row="4"
                ></el-input>
            </el-form-item>
            <el-form-item label="标签" prop="tags">
                <el-select
                    v-model="formData.tagArray"
                    placeholder="请选择标签"
                    multiple
                    filterable
                    allow-create
                    class="w-full"
                >
                    <el-option
                        v-for="tag in commonTags"
                        :key="tag"
                        :label="tag"
                        :value="tag"
                    ></el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="封面图片">
                <div class="cover-upload">
                    <el-upload
                        class="avatar-uploader"
                        action="#"
                        :show-file-list="false"
                        :before-upload="beforeUpload"
                        :http-request="handleRequest"
                        accept="image/*"
                        :disabled="!!imgUrl"
                    >
                        <div
                            class="cover-placeholder w-[200px] h-[120px] flex flex-col items-center justify-center text-[#8b949e] bg-[#f6f8fa]"
                            v-if="!imgUrl"
                        >
                            <p>点击上传封面</p>
                        </div>
                        <img
                            v-else
                            :src="imgUrl"
                            alt="封面图片"
                            class="cover-image w-[200px] h-[120px] block"
                        />
                    </el-upload>
                    <div class="cover-remove" v-if="imgUrl">
                        <el-button type="danger" size="mini" @click="removeImage"
                            >移除封面</el-button
                        >
                    </div>
                </div>
            </el-form-item>
        </el-form>
    </el-dialog>
</template>
<script setup>
import { computed, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { uploadFile } from '@/api/admin'
import { fileBaseUrl } from '@/config'

// 关键：关闭Vue自动属性继承，消除警告
defineOptions({
    inheritAttrs: false,
})

const commonTags = [
    '情绪管理',
    '焦虑',
    '抑郁',
    '压力',
    '睡眠',
    '冥想',
    '正念',
    '放松',
    '心理健康',
    '自我成长',
    '人际关系',
    '工作压力',
    '学习方法',
    '生活技巧',
]

const props = defineProps({
    modelValue: {
        type: Boolean,
        default: false,
    },
    categories: {
        type: Array,
        default: () => [],
    },
})

const emit = defineEmits(['update:modelValue'])

const formData = ref({
    title: '',
    content: '',
    coverImage: '',
    categoryId: 1,
    summary: '',
    tags: '',
    id: '',
})

const rules = reactive({
    title: [
        {
            required: true,
            message: '请输入文字标题',
            trigger: 'blur',
        },
        {
            max: 200,
            message: '文章标题最多输入200字符',
            trigger: 'blur',
        },
    ],
    categoryId: [
        {
            required: true,
            message: '请选择分类',
            trigger: 'change',
        },
    ],
})

// 计算属性中转，禁止直接修改props，标准Vue3双向绑定方案
const visible = computed({
    get() {
        return props.modelValue
    },
    set(val) {
        emit('update:modelValue', val)
    },
})

const handleClose = () => {
    // 后续弹窗关闭回调逻辑写此处
}

// 上传校验
const imgUrl = ref('')
const beforeUpload = file => {
    // 校验上传文件
    const isImage = file.type.startsWith('image/')
    const isLt5M = file.size / 1024 / 1024 < 5 // 限制文件大小为2MB
    if (!isImage) {
        ElMessage.error('只能上传图片文件')
        return false
    }

    if (!isLt5M) {
        ElMessage.error('上传图片大小不能超过 5MB!')
        return false
    }
    return isImage
}

// 上传
const handleRequest = async ({ file }) => {
    try {
        const businessId = crypto.randomUUID()
        const fileRes = await uploadFile(file, {
            businessId: businessId,
        })
        console.log('fileRes', fileRes)

        if (fileRes?.filePath) {
            imgUrl.value = `${fileBaseUrl}${fileRes.filePath}`
            formData.value.coverImage = fileRes.filePath
            ElMessage.success('图片上传成功')
        } else {
            ElMessage.error('上传失败，请重试')
        }
    } catch (err) {
        console.error('上传异常：', err)
        ElMessage.error('上传请求异常')
    }
}

// 移除图片
const removeImage = () => {
    imgUrl.value = ''
    formData.value.coverImage = ''
}
</script>
