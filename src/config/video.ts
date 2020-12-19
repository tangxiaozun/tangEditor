/**
 * @description 视频相关的配置
 * @author hutianhao
 */

import { EMPTY_FN } from '../utils/const'

export default {
    // 插入网络视频前的回调函数
    onlineVideoCheck: (video: string): string | boolean => {
        return true
    },

    // 插入网络视频成功之后的回调函数
    onlineVideoCallback: EMPTY_FN,

    // accept
    uploadVideoAccept: ['mp4'],

    // 上传图片的最大体积，默认 30M
    uploadVideoMaxSize: 30 * 1024 * 1024,

    // 自定义上传
    customUploadImg: null,

}
