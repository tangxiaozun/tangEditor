/**
 * @description video 菜单 panel tab 配置
 * @author tonghan
 */

import Editor from '../../editor/index'
import {PanelConf, PanelTabConf} from '../menu-constructors/Panel'
import {getRandom} from '../../utils/util'
import $ from '../../utils/dom-core'
import UploadVideo from './upload-video'
import {videoRegex} from '../../utils/const'

export default function (editor: Editor, video: string): PanelConf {
    const config = editor.config
    const uploadVideo = new UploadVideo(editor)
    // panel 中需要用到的id
    const inputIFrameId = getRandom('input-iframe')
    const btnOkId = getRandom('btn-ok')
    const i18nPrefix = 'menus.panelMenus.video.'
    const t = (text: string, prefix: string = i18nPrefix): string => {
        return editor.i18next.t(prefix + text)
    }

    // panel 中需要用到的id
    const upTriggerId = getRandom('up-trigger-id')
    const upFileId = getRandom('up-file-id')

    /**
     * 插入链接
     * @param iframe html标签
     */
    function insertVideo(video: string): void {
        editor.cmd.do('insertHTML', video + '<p><br></p>')

        // video添加后的回调
        editor.config.onlineVideoCallback(video)
    }

    /**
     * 校验在线视频链接
     * @param video 在线视频链接
     */
    function checkOnlineVideo(video: string): boolean {
        // 编辑器进行正常校验，video 合规则使指针为true，不合规为false
        let flag = true
        if (!videoRegex.test(video)) {
            flag = false
        }

        // 查看开发者自定义配置的返回值
        const check = editor.config.onlineVideoCheck(video)
        if (check === undefined) {
            if (flag === false) console.log(t('您刚才插入的视频链接未通过编辑器校验', 'validate.'))
        } else if (check === true) {
            // 用户通过了开发者的校验
            if (flag === false) {
                editor.config.customAlert(
                    `${t('您插入的网络视频无法识别', 'validate.')}，${t(
                        '请替换为正确的网络视频格式',
                        'validate.'
                    )}：如<iframe src=...></iframe>`,
                    'warning'
                )
            } else {
                return true
            }
        } else {
            //用户未能通过开发者的校验，开发者希望我们提示这一字符串
            editor.config.customAlert(check, 'error')
        }
        return false
    }

    // tabs 配置 -----------------------------------------
    const accepts: string = config.uploadVideoAccept.map((item: string) => `video/${item}`).join(',')
    //上传视频的菜单
    const tabsConf: PanelTabConf[] = [
        // first tab
        {
            // 标题
            title: t('插入本地视频'),
            // 模板，//不需要多文件上传如果需要的话，在input中加上 multiple
            tpl: `<div class="w-e-up-img-container">
                    <div id="${upTriggerId}" class="w-e-up-btn">
                        <i class="w-e-icon-upload2"></i>
                    </div>
                    <div style="display:none;">
                        <input id="${upFileId}" type="file" accept="${accepts}"/>
                    </div>
                </div>`,
            // 事件绑定
            events: [
                // 触发选择视频
                {
                    selector: '#' + upTriggerId,
                    type: 'click',
                    fn: () => {
                        const $file = $('#' + upFileId)
                        const fileElem = $file.elems[0]
                        if (fileElem) {
                            fileElem.click()
                        } else {
                            // 返回 true 可关闭 panel
                            return true
                        }
                    },
                },
                // 选择图片完毕
                {
                    selector: '#' + upFileId,
                    type: 'change',
                    fn: () => {
                        const $file = $('#' + upFileId)
                        const fileElem = $file.elems[0]
                        if (!fileElem) {
                            // 返回 true 可关闭 panel
                            return true
                        }

                        // 获取选中的 file 对象列表
                        const fileList = (fileElem as any).files
                        if (fileList.length) {
                            uploadVideo.uploadVideo(fileList)
                        }

                        // 返回 true 可关闭 panel
                        return true
                    },
                },
            ],
        }, // first tab end
        // second tab
        {
            // tab 的标题
            title: t('插入网络视频'),
            // title: editor.i18next.t('menus.panelMenus.video.插入视频'),
            // 模板
            tpl: `<div>
                        <input 
                            id="${inputIFrameId}" 
                            type="text" 
                            class="block" 
                            placeholder="${editor.i18next.t('如')}：<iframe src=... ></iframe>"/>
                        </td>
                        <div class="w-e-button-container">
                            <button type="button" id="${btnOkId}" class="right">
                                ${editor.i18next.t('插入')}
                            </button>
                        </div>
                    </div>`,
            // 事件绑定
            events: [
                // 插入视频
                {
                    selector: '#' + btnOkId,
                    type: 'click',
                    fn: () => {
                        // 执行插入视频
                        const $video = $('#' + inputIFrameId)
                        let video = $video.val().trim()

                        // 视频为空，则不插入
                        if (!video) return
                        // 对当前用户插入的内容进行判断，插入为空，或者返回false，都停止插入
                        if (!checkOnlineVideo(video)) return

                        insertVideo(video)

                        // 返回 true，表示该事件执行完之后，panel 要关闭。否则 panel 不会关闭
                        return true
                    },
                },
            ],

        }, // second tab end
    ]


    const conf: PanelConf = {
        width: 300,
        height: 0,
        tabs: [],
    }
    // 显示“插入本地视频”
    if (
        window.FileReader && config.customUploadVideo
    ) {
        conf.tabs.push(tabsConf[0])
    }
    // 显示“插入网络视频”
    if (config.showLinkImg) {
        conf.tabs.push(tabsConf[1])
    }
    return conf
}
