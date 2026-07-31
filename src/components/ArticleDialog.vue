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
            <el-form-item label="文章内容" prop="content">
                <RichTextEditor
                    ref="editorRef"
                    v-model="formData.content"
                    placeholder="请输入文字内容，支持富文本格式。"
                    :maxCharCount="5000"
                    @change="handleContentChange"
                    @created="handleEditorCreated"
                    min-height="400px"
                />
            </el-form-item>
        </el-form>
        <div v-if="btnPreview">
            <h3>内容预览</h3>
            <div v-html="formData.content"></div>
        </div>
        <template #footer>
            <el-button type="primary" @click="btnPreview = !btnPreview">{{
                btnPreview ? '隐藏预览' : '预览效果'
            }}</el-button>
            <el-button @click="handleClose"> 取消 </el-button>
            <el-button type="primary" @click="handleSubmit" :loading="loading">
                创建文章
            </el-button>
        </template>
    </el-dialog>
</template>
<script setup>
import { computed, reactive, ref, nextTick, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { uploadFile, addArticle } from '@/api/admin'
import { fileBaseUrl } from '@/config'
import RichTextEditor from '@/components/RichTextEditor.vue'

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

const emit = defineEmits(['update:modelValue', 'success'])

const formRef = ref(null)
const editorRef = ref(null)

// 初始化表单数据的函数
const initFormData = () => ({
    title: '',
    content: '',
    coverImage: '',
    categoryId: 1,
    summary: '',
    tags: '',
    id: '',
    tagArray: [],
})

const formData = ref(initFormData())

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
    content: [
        {
            required: true,
            message: '请输入文章内容',
            trigger: 'blur',
        },
        {
            max: 5000,
            message: '文章内容最多输入5000字符',
            trigger: 'blur',
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

// 重置表单数据
const resetForm = () => {
    formData.value = initFormData()
    imgUrl.value = ''

    // 重置表单验证
    nextTick(() => {
        if (formRef.value) {
            formRef.value.resetFields()
        }
    })
}

// 监听弹窗打开/关闭
watch(visible, newVal => {
    if (!newVal) {
        // 弹窗关闭时重置
        resetForm()
    }
})

const handleClose = () => {
    // 关闭弹窗
    visible.value = false
}

// 上传校验
const imgUrl = ref('')
const beforeUpload = file => {
    // 校验上传文件
    const isImage = file.type.startsWith('image/')
    const isLt5M = file.size / 1024 / 1024 < 5
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

// 富文本事件处理
const handleContentChange = data => {
    console.log('data', data)
    formData.value.content = data.html || ''
}

const editorInstance = ref(null)
const handleEditorCreated = editor => {
    editorInstance.value = editor
    console.log('富文本编辑器已创建')
    // 编辑器创建后，设置初始内容
    if (formData.value.content && editor) {
        nextTick(() => {
            editor.setHtml(formData.value.content)
        })
    }
}

const btnPreview = ref(false)
const loading = ref(false)

const handleSubmit = async () => {
    formRef.value.validate(async valid => {
        if (valid) {
            try {
                loading.value = true
                // 处理标签数组为字符串
                const submitData = {
                    ...formData.value,
                    tags: formData.value.tagArray.join(','),
                }
                delete submitData.tagArray // 删除临时属性
                console.log('提交数据：', submitData)
                // 提交表单数据
                const res = await addArticle(submitData)
                console.log('提交结果：', res)
                ElMessage.success('文章创建成功')
                // ✅ 触发成功事件
                emit('success')
                handleClose()
            } catch (err) {
                console.error('提交异常：', err)
                ElMessage.error('文章创建失败，请重试')
            } finally {
                loading.value = false
            }
        } else {
            console.log('表单验证失败')
        }
    })
}
</script>
