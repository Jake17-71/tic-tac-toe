import GameLogic from './gameLogic.js'

const rootSelector = `[data-js-settings]`

class gameMain {
  selectors = {
    root: rootSelector,
    boardSizeSelector: `[data-js-board-size]`,
    aiDifficulty: `[data-js-ai-difficulty]`,
    playerSymbolSelector: `[data-js-player-symbol]`,

    gameBoardSelector: `[data-js-game-board]`,
  }

  stateClasses = {
    isActive: 'game__button--active',
  }

  constructor(rootElement) {
    this.rootElement = rootElement
    this.boardSizeElements = this.rootElement.querySelectorAll(this.selectors.boardSizeSelector)
    this.aiDifficultyElement = this.rootElement.querySelector(this.selectors.aiDifficulty)
    this.playerSymbolElements = this.rootElement.querySelectorAll(this.selectors.playerSymbolSelector)
    this.gameBoardElement = document.querySelector(this.selectors.gameBoardSelector)

    this.settings = {
      boardSize: this.getBoardSize(),
      playerSymbol: this.getPlayerSymbol(),
      aiDifficulty: this.getAiDifficulty(),
    }

    this.gameLogic = null
    this.initGame()

    this.bindEvent()
  }

  getBoardSize() {
    const activeButton = Array.from(this.boardSizeElements).find(button =>
      button.classList.contains(this.stateClasses.isActive)
    )

    return activeButton ? +activeButton.dataset.jsBoardSize : 3
  }

  getPlayerSymbol() {
    const symbolButton = Array.from(this.playerSymbolElements).find(button =>
      button.classList.contains(this.stateClasses.isActive)
    )

    return symbolButton ? symbolButton.dataset.jsPlayerSymbol : 'O'
  }

  getAiDifficulty() {
    return this.aiDifficultyElement.value
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

    this.gameLogic.updateSettings(this.settings)
  }

  recreateBoard(boardSize) {
    this.gameBoardElement.innerHTML = ''
    this.gameBoardElement.dataset.boardSize = boardSize

    const size = +boardSize
    for (let i = 0; i < Math.pow(size, 2); i++) {
      const button = document.createElement('button')
      button.classList.add('game__cell')
      button.dataset.jsCell = ''
      button.dataset.index = `${i}`
      button.type = 'button'
      this.gameBoardElement.appendChild(button)
    }

    this.initGame()
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

  initGame() {
    this.gameLogic = new GameLogic(this.gameBoardElement, this.settings)
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

    this.aiDifficultyElement.addEventListener('change', () =>
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