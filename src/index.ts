// ==UserScript==
// @name         clipchamp-tts-download
// @namespace    http://tampermonkey.net/
// @version      v1.0.2
// @description  为 Clipchamp 文本转语音面板增加音频下载按钮
// @author       iuroc
// @match        https://app.clipchamp.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=clipchamp.com
// @grant        none
// @license      MIT
// @homepage     https://github.com/iuroc/clipchamp-tts-download
// ==/UserScript==

import van from 'vanjs-core'

const { div, a, button } = van.tags

const inputValue = van.state('')

const observer = new MutationObserver(() => {
    if (!location.pathname.startsWith('/editor/')) return
    const panel = document.getElementById('property-panel-drawer-text-to-speech.config')
    if (!panel || panel.childElementCount == 0) return
    const flexBox = panel.querySelector<HTMLElement>('.isPropertyPanel')
    const downloadBtn = panel?.querySelector<HTMLElement>('.download-btn')
    const inputElement = document.querySelector<HTMLTextAreaElement>('[data-testid="voice-script-textarea"')
    if (!flexBox || !inputElement || downloadBtn) return
    inputElement.addEventListener('input', (event) => {
        inputValue.val = (event.target as HTMLTextAreaElement).value
    })
    inputValue.val = inputElement.value
    van.add(flexBox, div({ style: `padding: 0px 16px 12px; display: flex;` },
        button({
            class: 'download-btn',
            style: () => `
                        display: flex;
                        align-items: center;
                        gap: 5px;
                        flex-direction: column;
                        background-color: transparent;
                        border: 1px solid var(--colorNeutralStroke1);
                        flex: 1;
                        color: ${inputValue.val.trim() && currentBlobURL.val ? 'black' : 'var(--colorNeutralForegroundDisabled)'};
                        padding: 8px var(--spacingHorizontalM);
                        border-radius: var(--borderRadiusMedium);
                        font-family: var(--fontFamilyBase);
                        cursor: ${inputValue.val.trim() && currentBlobURL.val ? 'pointer' : 'no-drop'};`,
            onclick: () => {
                if (inputValue.val.trim() && currentBlobURL.val) {
                    const filename = prompt('请输入保存的文件名', Date.now().toString())
                    if (filename == null) return
                    const link = document.createElement('a')
                    link.href = currentBlobURL.val
                    link.download = filename + '.mp3'
                    document.body.appendChild(link)
                    link.click()
                    link.remove()
                }
            }
        },
            div({ style: `font-weight: var(--fontWeightSemibold);` }, '下载音频'),
            div({ style: `font-size: 12px; color: var(--colorNeutralForegroundDisabled);` }, '请先预览后下载'),
        )
    ))
})

observer.observe(document.body, {
    childList: true,
    subtree: true
})

const currentBlobURL = van.state('')

class NewBlob extends Blob {
    constructor(blobParts?: BlobPart[], options?: BlobPropertyBag) {
        super(blobParts, options)
        currentBlobURL.val = URL.createObjectURL(this)
    }
}

window.Blob = NewBlob