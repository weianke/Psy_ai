<template>
    <div class="rich-text-editor">
        <div class="editor-container">
            <WangToolbar
                :editor="editorRef"
                :defaultConfig="toolbarConfig"
                mode="default"
                class="editor-toolbar"
            />
            <WangEditor
                :defaultConfig="editorConfig"
                mode="default"
                class="wang-editor"
                @onCreated="handleEditorCreated"
                @onChange="handleEditorChange"
                @onDestroyed="handleEditorDestroyed"
            />
        </div>

        <!-- 字数统计 -->
        <div v-if="showWordCount" class="editor-footer">
            <div class="word-count">
                <span class="count-text">{{ currentCharCount }} / {{ maxCharCount }}</span>
                <div class="progress-bar">
                    <div
                        class="progress-fill"
                        :style="{
                            width: Math.min((currentCharCount / maxCharCount) * 100, 100) + '%',
                        }"
                    ></div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, onBeforeUnmount, shallowRef, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import '@wangeditor/editor/dist/css/style.css'
import { Editor as WangEditor, Toolbar as WangToolbar } from '@wangeditor/editor-for-vue'

// Props
const props = defineProps({
    modelValue: {
        type: String,
        default: '',
    },
    placeholder: {
        type: String,
        default: '请输入内容...',
    },
    maxCharCount: {
        type: Number,
        default: 2000,
    },
    showWordCount: {
        type: Boolean,
        default: true,
    },
    showSecurityTip: {
        type: Boolean,
        default: true,
    },
    toolbarKeys: {
        type: Array,
        default: () => [
            'bold',
            'italic',
            'underline',
            'color',
            'bgColor',
            '|',
            'fontSize',
            'fontFamily',
            '|',
            'header1',
            'header2',
            'header3',
            '|',
            'bulletedList',
            'numberedList',
            'blockquote',
            '|',
            'insertLink',
            '|',
            'undo',
            'redo',
        ],
    },
    minHeight: {
        type: String,
        default: '300px',
    },
})

// Emits
const emit = defineEmits(['update:modelValue', 'change', 'created'])

// 响应式数据
const editorRef = shallowRef(null)
const currentCharCount = ref(0)
const isEditorReady = ref(false)
const isUpdating = ref(false) // 统一的更新锁

// 编辑器配置
const editorConfig = reactive({
    placeholder: props.placeholder,
    MENU_CONF: {
        fontSize: {
            fontSizeList: [
                '12px',
                '13px',
                '14px',
                '15px',
                '16px',
                '17px',
                '18px',
                '19px',
                '20px',
                '22px',
                '24px',
                '26px',
                '28px',
                '30px',
                '32px',
                '36px',
            ],
        },
        fontFamily: {
            fontFamilyList: [
                'Arial',
                'Tahoma',
                'Verdana',
                '"Times New Roman"',
                '"Courier New"',
                '"Microsoft YaHei"',
                '"微软雅黑"',
                '"SimSun"',
                '"宋体"',
                '"SimHei"',
                '"黑体"',
                '"KaiTi"',
                '"楷体"',
            ],
        },
        color: {
            colors: [
                '#000000',
                '#333333',
                '#666666',
                '#999999',
                '#CCCCCC',
                '#4A90E2',
                '#7ED321',
                '#F5A623',
                '#9013FE',
                '#FF6B6B',
                '#FF4757',
                '#FF3838',
                '#FF2D2D',
                '#DC3545',
                '#FFA502',
                '#FF6348',
                '#FF7675',
                '#FDCB6E',
                '#F39C12',
                '#FFC312',
                '#F1C40F',
                '#F39801',
                '#FFD93D',
                '#FFDD59',
                '#2ED573',
                '#1DD1A1',
                '#10AC84',
                '#00B894',
                '#00A085',
                '#3742FA',
                '#2F3542',
                '#40739E',
                '#487EB0',
                '#0984E3',
                '#8E44AD',
                '#9B59B6',
                '#A55EEA',
                '#3D5AFE',
                '#667AFA',
                '#FD79A8',
                '#E84393',
                '#FF7675',
                '#FF6B9D',
                '#FF5722',
            ],
        },
        bgColor: {
            colors: [
                '#FFFFFF',
                '#F8F9FA',
                '#E9ECEF',
                '#DEE2E6',
                '#CED4DA',
                '#E3F2FD',
                '#E8F5E8',
                '#FFF3E0',
                '#F3E5F5',
                '#FFEBEE',
                '#FCE4EC',
                '#F8BBD9',
                '#F48FB1',
                '#FFF3E0',
                '#FFE0B2',
                '#FFCC80',
                '#FFB74D',
                '#FFFDE7',
                '#FFF9C4',
                '#FFF176',
                '#FFEB3B',
                '#E8F5E8',
                '#C8E6C9',
                '#A5D6A7',
                '#81C784',
                '#E3F2FD',
                '#BBDEFB',
                '#90CAF9',
                '#64B5F6',
                '#F3E5F5',
                '#E1BEE7',
                '#CE93D8',
                '#BA68C8',
                '#FAFAFA',
                '#F5F5F5',
                '#EEEEEE',
                '#E0E0E0',
            ],
        },
        lineHeight: {
            lineHeightList: ['1', '1.15', '1.2', '1.5', '1.75', '2', '2.5', '3'],
        },
    },
})

// 工具栏配置
const toolbarConfig = reactive({
    toolbarKeys: props.toolbarKeys,
})

// 监听外部 modelValue 变化
watch(
    () => props.modelValue,
    newVal => {
        // 如果正在更新中或编辑器未就绪，跳过
        if (isUpdating.value || !isEditorReady.value) return

        // 获取编辑器当前内容
        const currentHtml = editorRef.value ? editorRef.value.getHtml() : ''

        // 内容相同则跳过更新
        if (currentHtml === newVal) return

        // 标记为更新状态
        isUpdating.value = true

        // 更新编辑器内容
        nextTick(() => {
            if (editorRef.value) {
                try {
                    editorRef.value.setHtml(newVal || '')
                } catch (e) {
                    console.warn('设置编辑器内容失败:', e)
                }
            }
            // 延迟解锁，确保更新完成
            setTimeout(() => {
                isUpdating.value = false
            }, 100)
        })
    }
)

// 方法
const handleEditorCreated = editor => {
    editorRef.value = editor

    // 设置初始内容
    if (props.modelValue) {
        isUpdating.value = true
        nextTick(() => {
            try {
                editor.setHtml(props.modelValue)
                updateCharCount()
            } catch (e) {
                console.warn('设置初始内容失败:', e)
            }
            setTimeout(() => {
                isUpdating.value = false
                isEditorReady.value = true
            }, 100)
        })
    } else {
        isEditorReady.value = true
    }

    // 触发创建事件
    emit('created', editor)
}

const handleEditorChange = editor => {
    // 如果正在更新中，跳过此次变更
    if (isUpdating.value) return

    // 更新字数统计
    updateCharCount()

    // 获取最新内容
    try {
        const html = editor.getHtml()

        // 标记为更新状态，防止循环
        isUpdating.value = true

        // 触发更新
        emit('update:modelValue', html)
        emit('change', {
            html: html,
            text: editor.getText(),
        })

        // 延迟解锁
        setTimeout(() => {
            isUpdating.value = false
        }, 100)
    } catch (e) {
        console.warn('处理编辑器变更失败:', e)
        isUpdating.value = false
    }
}

const handleEditorDestroyed = () => {
    isEditorReady.value = false
    editorRef.value = null
}

const updateCharCount = () => {
    if (!editorRef.value) return

    try {
        const text = editorRef.value.getText()
        const cleanText = text.replace(/\s+/g, ' ').trim()
        currentCharCount.value = cleanText === '' ? 0 : cleanText.length

        if (currentCharCount.value > props.maxCharCount) {
            ElMessage.warning(`内容长度不能超过 ${props.maxCharCount} 字符`)
        }
    } catch (e) {
        console.warn('更新字数统计失败:', e)
    }
}

// 公开方法
const getHtml = () => {
    return editorRef.value ? editorRef.value.getHtml() : ''
}

const getText = () => {
    return editorRef.value ? editorRef.value.getText() : ''
}

const setHtml = html => {
    if (!editorRef.value) return

    isUpdating.value = true
    try {
        editorRef.value.setHtml(html)
    } catch (e) {
        console.warn('设置HTML失败:', e)
    }
    setTimeout(() => {
        isUpdating.value = false
    }, 100)
}

const clear = () => {
    if (!editorRef.value) return

    isUpdating.value = true
    try {
        editorRef.value.clear()
        emit('update:modelValue', '')
    } catch (e) {
        console.warn('清空编辑器失败:', e)
    }
    setTimeout(() => {
        isUpdating.value = false
    }, 100)
}

const insertText = text => {
    if (editorRef.value) {
        editorRef.value.insertText(text)
    }
}

const focus = () => {
    if (editorRef.value) {
        editorRef.value.focus()
    }
}

defineExpose({
    getHtml,
    getText,
    setHtml,
    clear,
    insertText,
    focus,
    editor: editorRef,
})

// 监听 placeholder 变化
watch(
    () => props.placeholder,
    newPlaceholder => {
        editorConfig.placeholder = newPlaceholder
    }
)

// 组件销毁时清理
onBeforeUnmount(() => {
    if (editorRef.value) {
        try {
            editorRef.value.destroy()
        } catch (e) {
            console.warn('销毁编辑器失败:', e)
        }
    }
    isEditorReady.value = false
})
</script>

<style scoped>
.rich-text-editor {
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    overflow: hidden;
    background: white;
}

.editor-container {
    display: flex;
    flex-direction: column;
}

.editor-toolbar {
    border-bottom: 1px solid #e5e7eb;
}

.wang-editor {
    min-height: v-bind(minHeight);
}

/* 工具栏样式 */
:deep(.w-e-toolbar) {
    border: none;
    background: #f9fafb;
    padding: 0.5rem;
    flex-wrap: wrap;
}

:deep(.w-e-toolbar .w-e-bar-item) {
    margin: 0 0.125rem;
    border-radius: 0.25rem;
    height: 28px;
    min-width: 28px;
}

:deep(.w-e-toolbar .w-e-bar-item:hover) {
    background: #e5e7eb;
}

:deep(.w-e-toolbar .w-e-bar-item.w-e-bar-item-active) {
    background: #eaf2ff !important;
    color: #2563eb !important;
    outline: 1px solid #bfdbfe;
}

:deep(.w-e-toolbar .w-e-bar-divider) {
    margin: 0 0.25rem;
}

/* 编辑器内容区域样式 */
:deep(.w-e-text-container) {
    background: white;
    padding: 1rem;
    position: relative;
}

:deep(.w-e-text-container [data-slate-editor]) {
    min-height: v-bind(minHeight);
    padding: 0;
    text-align: left !important;
    line-height: 1.6;
}

:deep(.w-e-text-container [data-slate-editor] p) {
    text-align: left !important;
    margin: 0 0 0.5rem 0;
    padding: 0;
    line-height: inherit;
}

/* 颜色面板样式优化 */
:deep(.w-e-color-panel) {
    max-width: 300px;
    padding: 8px;
}

:deep(.w-e-color-panel .w-e-color-list) {
    display: grid;
    grid-template-columns: repeat(8, 1fr);
    gap: 4px;
}

:deep(.w-e-color-panel .w-e-color-item) {
    width: 24px;
    height: 24px;
    border-radius: 4px;
    border: 1px solid #e5e7eb;
    cursor: pointer;
    transition: all 0.2s ease;
}

:deep(.w-e-color-panel .w-e-color-item:hover) {
    transform: scale(1.1);
    border-color: #4a90e2;
    box-shadow: 0 2px 4px rgba(74, 144, 226, 0.3);
}

/* 字体面板样式优化 */
:deep(.w-e-select-list) {
    max-height: 200px;
    overflow-y: auto;
}

:deep(.w-e-select-list .w-e-select-list-item) {
    padding: 8px 12px;
    cursor: pointer;
    transition: background-color 0.2s ease;
}

:deep(.w-e-select-list .w-e-select-list-item:hover) {
    background-color: #f8f9fa;
}

:deep(.w-e-select-list .w-e-select-list-item.selected) {
    background-color: #e3f2fd;
    color: #4a90e2;
}

:deep(.w-e-text-placeholder) {
    color: #9ca3af;
    font-style: normal;
    text-align: left !important;
    padding: 0;
    margin: 0;
    line-height: 1.6;
    position: absolute;
    top: 1rem;
    left: 1rem;
    right: 1rem;
    pointer-events: none;
    white-space: pre-wrap;
    font-family: 'Source Han Sans CN', 'Microsoft YaHei', sans-serif;
}

/* 下拉面板样式 */
:deep(.w-e-panel) {
    z-index: 3000 !important;
    pointer-events: auto;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border-radius: 0.375rem;
    border: 1px solid #e5e7eb;
    background: white;
    max-width: 320px;
}

/* 字体选择面板样式 */
:deep(.w-e-panel .w-e-panel-content .w-e-panel-content-font-family) {
    max-height: 200px;
    overflow-y: auto;
}

:deep(
    .w-e-panel .w-e-panel-content .w-e-panel-content-font-family .w-e-panel-content-font-family-item
) {
    padding: 8px 12px;
    cursor: pointer;
    border-bottom: 1px solid #f0f0f0;
    font-size: 14px;
    line-height: 1.4;
}

:deep(
    .w-e-panel
        .w-e-panel-content
        .w-e-panel-content-font-family
        .w-e-panel-content-font-family-item:hover
) {
    background-color: #f8f9fa;
}

:deep(
    .w-e-panel
        .w-e-panel-content
        .w-e-panel-content-font-family
        .w-e-panel-content-font-family-item.selected
) {
    background-color: #e3f2fd;
    color: #4a90e2;
    font-weight: 500;
}

/* 字号选择面板样式 */
:deep(.w-e-panel .w-e-panel-content .w-e-panel-content-font-size) {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 4px;
    padding: 8px;
}

:deep(
    .w-e-panel .w-e-panel-content .w-e-panel-content-font-size .w-e-panel-content-font-size-item
) {
    padding: 6px 8px;
    text-align: center;
    cursor: pointer;
    border-radius: 4px;
    border: 1px solid #e5e7eb;
    transition: all 0.2s ease;
}

:deep(
    .w-e-panel
        .w-e-panel-content
        .w-e-panel-content-font-size
        .w-e-panel-content-font-size-item:hover
) {
    background-color: #f8f9fa;
    border-color: #4a90e2;
}

:deep(
    .w-e-panel
        .w-e-panel-content
        .w-e-panel-content-font-size
        .w-e-panel-content-font-size-item.selected
) {
    background-color: #4a90e2;
    color: white;
    border-color: #4a90e2;
}

:deep(.w-e-select-list .selected::after) {
    content: '✔';
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
    color: #4a90e2;
    font-size: 12px;
}

/* 编辑器底部 */
.editor-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 1rem;
    background: #f9fafb;
    border-top: 1px solid #e5e7eb;
}

.word-count {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.75rem;
    color: #6b7280;
}

.count-text {
    font-weight: 500;
}

.progress-bar {
    width: 60px;
    height: 4px;
    background: #e5e7eb;
    border-radius: 2px;
    overflow: hidden;
}

.progress-fill {
    height: 100%;
    background: #4a90e2;
    transition: all 0.3s ease;
    border-radius: 2px;
}

/* 响应式设计 */
@media (max-width: 768px) {
    :deep(.w-e-toolbar) {
        padding: 0.375rem;
    }

    :deep(.w-e-toolbar .w-e-bar-item) {
        margin: 0 0.0625rem;
        height: 24px;
        min-width: 24px;
        font-size: 0.875rem;
    }

    :deep(.w-e-text-container) {
        padding: 0.75rem;
    }

    .editor-footer {
        padding: 0.375rem 0.75rem;
    }
}
</style>
