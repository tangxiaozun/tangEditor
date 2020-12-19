/**
 * @description 上传图片
 * @author wangfupeng
 */

import Editor from '../../editor/index'
import {arrForEach} from '../../utils/util'

export type ResType = {
    errno: number | string
    data: string[]
}

class UploadVideo {
    private editor: Editor

    constructor(editor: Editor) {
        this.editor = editor
    }

    /**
     * 往编辑区域插入视频
     * @param src 视频地址
     */
    public insertVideo(src: string): void {
        const editor = this.editor
        const config = editor.config

        const i18nPrefix = 'validate.'
        const t = (text: string, prefix: string = i18nPrefix): string => {
            return editor.i18next.t(prefix + text)
        }

        // 先插入视频，无论是否能成功
        editor.cmd.do('insertHTML', `<iframe src="${src}" style="max-width:100%;" ></iframe>`)
        // 执行回调函数
        // config.linkVideoCallback(src)

        // 加载视频
        let video: any = document.createElement('video')
        video.onload = () => {
            video = null
        }
        video.onerror = () => {
            config.customAlert(
                t('插入视频错误'),
                'error',
                `wangEditor: ${t('插入视频错误')}，${t('视频链接')} "${src}"，${t('下载链接失败')}`
            )
            video = null
        }
        video.onabort = () => (video = null)
        video.src = src
    }

    /**
     * 上传视频
     * @param files 文件列表
     */
    public uploadVideo(files: FileList | File[]): void {
        if (!files.length) {
            return
        }

        const editor = this.editor
        const config = editor.config

        // ------------------------------ i18next ------------------------------

        const i18nPrefix = 'validate.'
        const t = (text: string): string => {
            return editor.i18next.t(i18nPrefix + text)
        }

        // ------------------------------ 获取配置信息 ------------------------------

        const maxSize = config.uploadVideoMaxSize
        const maxSizeM = maxSize / 1024 / 1024
        // 自定义上传视频
        const customUploadVideo = config.customUploadVideo

        if (!customUploadVideo) {
            // 没有 customUploadImg 的情况下
            return
        }

        // ------------------------------ 验证文件信息 ------------------------------
        const resultFiles: File[] = []
        const errInfos: string[] = []
        arrForEach(files, file => {
            const name = file.name
            const size = file.size

            // chrome 低版本 name === undefined
            if (!name || !size) {
                return
            }

            if (/\.(mp4|jpeg)$/i.test(name) === false) {
                // 后缀名不合法，不是视频
                errInfos.push(`【${name}】${t('不是视频')}`)
                return
            }

            if (maxSize < size) {
                // 上传图片过大
                errInfos.push(`【${name}】${t('大于')} ${maxSizeM}M`)
                return
            }

            // 验证通过的加入结果列表
            resultFiles.push(file)
        })

        // 抛出验证信息
        if (errInfos.length) {
            config.customAlert(`${t('视频验证未通过')}: \n` + errInfos.join('\n'), 'warning')
            return
        }

        // 如果过滤后文件列表为空直接返回
        if (resultFiles.length === 0) {
            config.customAlert(t('传入的文件不合法'), 'warning')
            return
        }

        // ------------------------------ 自定义上传 ------------------------------
        if (customUploadVideo && typeof customUploadVideo === 'function') {
            customUploadVideo(resultFiles, this.insertVideo.bind(this))
            return
        }

    }
}

export default UploadVideo
