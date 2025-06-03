import van from 'vanjs-core'

const { div, textarea, button } = van.tags

const loading = van.state(true)

let oldInputElement: HTMLTextAreaElement | null = null

let currentBlobURL: string

const inputValue = van.state('')

const OriginalBlob = Blob

class NewBlob extends Blob {
    constructor(blobParts?: BlobPart[], options?: BlobPropertyBag) {
        super(blobParts, options)
        currentBlobURL = URL.createObjectURL(this)
        const link = document.createElement('a')
        link.href = currentBlobURL
        link.download = `${Date.now()}.mp3`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }
}

waitElement(() => document.querySelector<HTMLElement>('.sc-kIggGm.hFaPBZ')).then(element => {
    element.remove()
})

waitElement(() => document.querySelector<HTMLElement>('.sc-lhcyFC.fmodYU')).then(element => {
    element.remove()
})

waitElement(() => document.querySelectorAll<HTMLElement>('video')).then(elements => {
    elements.forEach(element => element.remove())
})

waitElement(() => document.getElementById('sidebar-button-recordCreate')).then(element => {
    element.click()
    document.body.style.removeProperty('user-select')
    waitElement(() => document.getElementById('voiceover')).then(element => {
        element.click()
        waitElement(() => document.getElementById('property-panel-drawer-text-to-speech.config')).then(element => {
            loading.val = false
            waitElement(() => document.querySelector<HTMLTextAreaElement>('[data-testid="voice-script-textarea"]')).then(element => oldInputElement = element)
        })
    })
})

function changeOldInputValue(newValue: string) {
    if (oldInputElement) {
        const anyElement = oldInputElement as any
        const oldValue = oldInputElement.value
        oldInputElement.value = newValue
        anyElement._valueTracker.setValue(oldValue)
        oldInputElement.dispatchEvent(new Event('input', { bubbles: true }))
    }
}

const Panel = () => {
    return div({ style: `position: fixed; inset: 0; background-color: white; display: block; font-family: 'Noto Sans SC';` },
        div({ style: 'max-width: 800px; padding: 30px; margin: auto;', }, () => loading.val ? div('正在加载中...') :
            div({ style: `display: flex; gap: 20px; flex-direction: column;` },
                div({ style: 'font-size: 20px; font-weight: bold;' }, '文本转语音'),
                textarea({
                    placeholder: '请输入需要转换的文本', style: `
                    display: block;
                    height: 300px;
                    outline: none;
                    padding: 12px 15px;
                    border: 2px solid #d1e7dd;
                    border-radius: 10px;
                    font-family: \'Noto Sans SC\';
                    overflow: hidden;
                    resize: none;`,
                    oninput: (event: any) => {
                        inputValue.val = event.target.value
                        if (oldInputElement) {
                            changeOldInputValue(event.target.value)
                        }
                    }
                }),
                div({ style: `display: flex; gap: 15px;` },
                    button({
                        style: () => `
                        padding: 8px 12px;
                        border: 1px solid ${inputValue.val.trim() ? '#198754' : '#d1e7dd'};
                        background-color: white;
                        color: ${inputValue.val.trim() ? '#198754' : '#d1e7dd'};
                        border-radius: 10px;
                        cursor: ${inputValue.val.trim() ? 'pointer' : 'no-drop'};`,
                        onclick: () => {
                            if (!inputValue.val.trim()) return
                            window.Blob = OriginalBlob
                            const previewButton = document.querySelector<HTMLElement>('[data-testid="voice-preview-button"]')
                            previewButton?.click()
                        }
                    }, '试听音频'),
                    button({
                        style: () => `
                        padding: 8px 12px;
                        border: 0;
                        background-color: ${inputValue.val.trim() ? '#198754' : '#d1e7dd'};
                        color: white;
                        border-radius: 10px;
                        cursor: ${inputValue.val.trim() ? 'pointer' : 'no-drop'};`,
                        onclick: () => {
                            if (!inputValue.val.trim()) return
                            window.Blob = NewBlob
                            const previewButton = document.querySelector<HTMLElement>('[data-testid="voice-preview-button"]')
                            previewButton?.click()

                            changeOldInputValue('')
                            changeOldInputValue(inputValue.val)
                        }
                    }, '下载音频'),
                )
            )
        )
    )
}

van.add(document.body, Panel())

function waitElement<T>(getElement: () => T, target: Node = document.body) {
    return new Promise<NonNullable<T>>(resolve => {
        const observer = new MutationObserver(() => {
            const element = getElement()
            if (element) {
                observer.disconnect()
                resolve(element)
            }
        })
        observer.observe(target, {
            childList: true,
            subtree: true
        })
    })
}