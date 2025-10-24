const rootSelector = `[data-js-settings]`

class gameMain {
  selectors = {
    root: rootSelector,
    boardSizeSelector: `[data-js-board-size]`,
    aiDifficulty: `[data-js-ai-difficulty]`,
    playerSymbolSelector: `[data-js-player-symbol]`,
  }

  stateClasses = {
    isActive: 'game__button--active',
  }

  constructor(rootElement) {
    this.rootElement = rootElement
    this.boardSizeElements = this.rootElement.querySelectorAll(this.selectors.boardSizeSelector)
    this.aiDificultyElement = this.rootElement.querySelector(this.selectors.aiDifficulty)
    this.playerSymbolElements = this.rootElement.querySelectorAll(this.selectors.playerSymbolSelector)

    this.settings = {
      boardSize: this.getBoardSize(),
      playerSymbol: this.getPlayerSymbol(),
      aiDifficulty: this.getAiDifficulty(),
    }

    this.bindEvent()
  }

  getBoardSize() {
    const activeButton = Array.from(this.boardSizeElements).find(button =>
      button.classList.contains(this.stateClasses.isActive)
    )

    return activeButton ? activeButton.dataset.jsBoardSize : '3'
  }

  getPlayerSymbol() {
    const symbolButton = Array.from(this.playerSymbolElements).find(button =>
      button.classList.contains(this.stateClasses.isActive)
    )

    return symbolButton ? symbolButton.dataset.jsPlayerSymbol : 'O'
  }

  getAiDifficulty() {
    return this.aiDificultyElement.value
  }

  updateSettings() {
    const boardSize = this.getBoardSize()
    const playerSymbol = this.getPlayerSymbol()
    const aiDifficulty = this.getAiDifficulty()

    this.settings = {
      boardSize,
      playerSymbol,
      aiDifficulty,
    }
  }

  recreateBoard(boardSize) {

  }

  onBoardSizeButtonClick(event) {
    const buttonClicked = event.currentTarget
    const boardSize = buttonClicked.dataset.jsBoardSize

    this.boardSizeElements.forEach(button =>
      button.classList.remove(this.stateClasses.isActive)
    )

    buttonClicked.classList.add(this.stateClasses.isActive)

    this.recreateBoard(boardSize)

    this.updateSettings()
  }

  onPlayerSymbolButtonClick(event) {
    const buttonClicked = event.currentTarget

    this.playerSymbolElements.forEach(button =>
      button.classList.remove(this.stateClasses.isActive)
    )

    buttonClicked.classList.add(this.stateClasses.isActive)

    this.updateSettings()
  }

  bindEvent() {
    this.boardSizeElements.forEach(button =>
      button.addEventListener('click', (event) =>
        this.onBoardSizeButtonClick(event)
      )
    )

    this.playerSymbolElements.forEach(button =>
      button.addEventListener('click', (event) =>
        this.onPlayerSymbolButtonClick(event)
      )
    )

    this.aiDificultyElement.addEventListener('change', () =>
      this.updateSettings()
    )
  }
}

class gameMainCollection {
  constructor() {
    this.init()
  }

  init() {
    document.querySelectorAll(rootSelector).forEach((element) => {
      new gameMain(element)
    })
  }
}

export default gameMainCollection