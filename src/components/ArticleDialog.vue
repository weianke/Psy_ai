<template>
    <el-dialog
        :title="isEdit ? '编辑文章' : '新增文章'"
        v-model="visible"
        width="50%"
        @close="handleClose"
        v-bind="$attrs"
    >
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
                        <el-button type="danger" size="small" @click="removeImage"
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
            <el-button type="primary" @click="btnPreview = !btnPreview">
                {{ btnPreview ? '隐藏预览' : '预览效果' }}
            </el-button>
            <el-button @click="handleClose">取消</el-button>
            <el-button type="primary" @click="handleSubmit" :loading="loading">
                {{ isEdit ? '更新文章' : '创建文章' }}
            </el-button>
        </template>
    </el-dialog>
</template>

<script setup>
import { computed, reactive, ref, nextTick, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { uploadFile, addArticle, updateArticle } from '@/api/admin'
import { fileBaseUrl } from '@/config'
import RichTextEditor from '@/components/RichTextEditor.vue'

// 关闭Vue自动属性继承，消除警告
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
    article: {
        type: Object,
        default: null,
    },
})

const emit = defineEmits(['update:modelValue', 'success'])

const formRef = ref(null)
const editorRef = ref(null)
const editorInstance = ref(null)

// 判断是否为编辑模式
const isEdit = computed(() => !!props.article?.id)

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
    businessId.value = null

    // 重置富文本编辑器
    if (editorInstance.value) {
        editorInstance.value.setHtml('')
    }

    // 重置表单验证
    nextTick(() => {
        if (formRef.value) {
            formRef.value.resetFields()
        }
    })
}

// 填充编辑数据
const fillFormData = article => {
    if (!article) return

    formData.value = {
        id: article.id || '',
        title: article.title || '',
        content: article.content || '',
        coverImage: article.coverImage || '',
        categoryId: article.categoryId || 1,
        summary: article.summary || '',
        tags: article.tags || '',
        tagArray: article.tags ? article.tags.split(',') : [],
    }

    imgUrl.value = article.coverImage ? `${fileBaseUrl}${article.coverImage}` : ''
    businessId.value = article.id || null

    // 设置富文本内容
    nextTick(() => {
        if (editorInstance.value && article.content) {
            editorInstance.value.setHtml(article.content)
        }
    })
}

// 监听弹窗打开/关闭
watch(visible, newVal => {
    if (newVal) {
        // 弹窗打开时
        if (isEdit.value && props.article) {
            // 编辑模式：填充数据
            fillFormData(props.article)
        } else {
            // 新增模式：重置表单
            resetForm()
        }
    } else {
        // 弹窗关闭时重置（确保下次打开是干净的）
        resetForm()
    }
})

// 监听 article 变化（处理先传 article 后打开弹窗的情况）
watch(
    () => props.article,
    newArticle => {
        if (visible.value && newArticle) {
            fillFormData(newArticle)
        }
    },
    { deep: true }
)

const handleClose = () => {
    // 关闭弹窗
    visible.value = false
}

// 上传校验
const imgUrl = ref('')
const businessId = ref(null)

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
        const uploadBusinessId = crypto.randomUUID()
        const fileRes = await uploadFile(file, {
            businessId: uploadBusinessId,
        })
        console.log('fileRes', fileRes)

        if (fileRes?.filePath) {
            imgUrl.value = `${fileBaseUrl}${fileRes.filePath}`
            formData.value.coverImage = fileRes.filePath
            businessId.value = uploadBusinessId
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
    if (!formRef.value) return

    try {
        await formRef.value.validate()
    } catch (error) {
        console.log('表单验证失败')
        return
    }

    try {
        loading.value = true

        // 处理标签数组为字符串
        const submitData = {
            title: formData.value.title,
            content: formData.value.content,
            coverImage: formData.value.coverImage,
            categoryId: formData.value.categoryId,
            summary: formData.value.summary,
            tags: formData.value.tagArray.join(','),
        }

        console.log('提交数据：', submitData)

        // 根据模式调用不同接口
        if (isEdit.value) {
            // 编辑模式：调用更新接口
            submitData.id = props.article.id
            await updateArticle(props.article.id, submitData)
            ElMessage.success('文章更新成功')
        } else {
            // 新增模式：调用创建接口
            await addArticle(submitData)
            ElMessage.success('文章创建成功')
        }

        // 触发成功事件，通知父组件刷新列表
        emit('success')
        handleClose()
    } catch (err) {
        console.error('操作失败：', err)
        ElMessage.error(isEdit.value ? '文章更新失败' : '文章创建失败')
    } finally {
        loading.value = false
    }
}
</script>
