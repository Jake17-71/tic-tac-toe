const rootSelector = `[data-js-game-board]`

class GameLogic {
  selectors = {
    root: rootSelector,
    gameCellSelector: `[data-js-cell]`,
  }

  constructor(rootElement, settings) {
    this.rootElement = rootElement
    this.gameCellElements = this.rootElement.querySelectorAll(this.selectors.gameCellSelector)
    this.settings = settings
    this.board = Array(this.settings.boardSize).fill(null).map(() => Array(this.settings.boardSize).fill(null))
    this.currentPlayer = settings.playerSymbol
    this.aiDifficulty = settings.aiDifficulty
    this.gameActive = false
    this.winner = null
    this.winPatterns = this.generateWinPatterns(this.settings.boardSize)

    this.init()
  }

  init() {
    this.bindEvents()
  }

  generateWinPatterns(size) {
    const patterns = []

    // Генерация горизонталей
    for (let row = 0; row < size; row++) {
      const pattern = []
      for (let col = 0; col < size; col++) {
        pattern.push([row, col])
      }
      patterns.push(pattern)
    }

    // Генерация вертикалей
    for (let col = 0; col < size; col++) {
      const pattern = []
      for (let row = 0; row < size; row++) {
        pattern.push([row, col])
      }
      patterns.push(pattern)
    }

    // Главная диагональ (слева-направо сверху-вниз)
    const diag1 = []
    for (let i = 0; i < size; i++) {
      diag1.push([i, i])
    }
    patterns.push(diag1)

    // Побочная диагональ (справа-налево сверху-вниз)
    const diag2 = []
    for (let i = 0; i < size; i++) {
      diag2.push([i, size - 1 - i])
    }
    patterns.push(diag2)

    return patterns
  }

  checkWin(symbol) {
    for (const pattern of this.winPatterns) {
      // Проверяем, все ли клетки в паттерне заполнены указанным символом
      const isWinningPattern = pattern.every(([row, col]) => {
        return this.board[row][col] === symbol
      })

      if (isWinningPattern) {
        return true
      }
    }

    return false
  }

  checkDraw() {
    // Проверяем, что все клетки заполнены (нет null)
    for (let row = 0; row < this.board.length; row++) {
      for (let col = 0; col < this.board[row].length; col++) {
        if (this.board[row][col] === null) {
          return false
        }
      }
    }
    return true
  }

  onCellClick(event) {
    if (!this.gameActive) {
      this.gameActive = true
    }

    const cellClicked = event.currentTarget
    const index = +cellClicked.dataset.index

    if (cellClicked.dataset.value || !this.gameActive) {
      return
    }

    const playerSymbol = this.settings.playerSymbol
    this.makeMove(index, playerSymbol)

    if (!this.gameActive) {
      return
    }

    this.makeAiMove()
  }

  makeMove(index, symbol) {
    const row = Math.floor(index / this.settings.boardSize)
    const col = index % this.settings.boardSize

    this.board[row][col] = symbol

    this.updateCellUI(index, symbol)

    this.checkGameEnd(symbol)
  }

  updateCellUI(index, symbol) {
    const cell = this.gameCellElements[index]
    cell.textContent = symbol
    cell.dataset.value = symbol
  }

  checkGameEnd(symbol) {
    if (this.checkWin(symbol)) {
      this.gameActive = false
      this.winner = symbol
      console.log(`Player ${symbol} wins!`)
      // TODO: Показать сообщение о победе
      return
    }

    if (this.checkDraw()) {
      this.gameActive = false
      console.log('Draw!')
      // TODO: Показать сообщение о ничьей
    }
  }

  makeAiMove() {
    this.checkAiDifficulty()
  }

  checkAiDifficulty() {
    switch (this.settings.aiDifficulty) {
      case "easy":
        return this.easyAi()
      case "medium":
        return this.mediumAi()
      case "hard":
        return this.hardAi()
      default:
        return this.mediumAi()
    }
  }

  easyAi() {
    // TODO: Реализовать случайный ход
  }

  mediumAi() {
    // TODO: Реализовать базовые правила + случайность
  }

  hardAi() {
    // TODO: Реализовать minimax
  }

  updateSettings(settings) {
    this.settings = settings
    this.board = Array(settings.boardSize).fill(null).map(() => Array(settings.boardSize).fill(null))
    this.currentPlayer = settings.playerSymbol
    this.aiDifficulty = settings.aiDifficulty
    this.gameActive = true
    this.winPatterns = this.generateWinPatterns(settings.boardSize)
  }

  bindEvents() {
    this.gameCellElements.forEach(cell =>
      cell.addEventListener('click', (event) => this.onCellClick(event))
    )
  }
}

export default GameLogic
