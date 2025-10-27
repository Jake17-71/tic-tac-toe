const rootSelector = `[data-js-rules-modal]`

class Modal {
  selectors = {
    root: rootSelector,
    closeButtonSelector: `[data-js-rules-close]`,
    openButtonSelector: `[data-js-rules-button]`,
  }

  constructor(rootElement) {
    this.rootElement = rootElement
    this.closeButtonElement = document.querySelector(this.selectors.closeButtonSelector)
    this.openButtonElement = document.querySelector(this.selectors.openButtonSelector)

    this.bindEvent()
  }

  onOpenButtonClick() {
    this.rootElement.showModal()
  }

  onCloseButtonClick() {
    this.rootElement.close()
  }

  onBackdropClick(event) {
    const rect = this.rootElement.getBoundingClientRect()
    const isInDialog = (
      rect.top <= event.clientY &&
      event.clientY <= rect.top + rect.height &&
      rect.left <= event.clientX &&
      event.clientX <= rect.left + rect.width
    )

    if (!isInDialog) {
      this.rootElement.close()
    }
  }

  bindEvent() {
    this.openButtonElement.addEventListener('click', () => this.onOpenButtonClick())
    this.closeButtonElement.addEventListener('click', () => this.onCloseButtonClick())
    this.rootElement.addEventListener('click', (event) => this.onBackdropClick(event))
  }
}

class ModalsCollection {
  constructor() {
    this.init()
  }

  init() {
    document.querySelectorAll(rootSelector).forEach((element) => {
      new Modal(element)
    })
  }
}

export default ModalsCollection