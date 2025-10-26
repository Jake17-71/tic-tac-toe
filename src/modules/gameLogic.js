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

  getEmptyCells() {
    const emptyCells = []

    for (let row = 0; row < this.board.length; row++) {
      for (let col = 0; col < this.board[row].length; col++) {
        if (this.board[row][col] === null) {
          const index = row * this.settings.boardSize + col
          emptyCells.push(index)
        }
      }
    }

    return emptyCells
  }

  getRandomEmptyCell() {
    const emptyCells = this.getEmptyCells()

    if (emptyCells.length > 0) {
      const randomIndex = Math.floor(Math.random() * emptyCells.length)
      return emptyCells[randomIndex]
    }

    return null
  }

  findWinningMove(symbol) {

    for (const pattern of this.winPatterns) {
      let emptyCell = null
      let symbolCount = 0

      for (const [row, col] of pattern) {
        if (this.board[row][col] === symbol) {
          symbolCount++
        } else if (this.board[row][col] === null) {
          emptyCell = [row, col]
        }
      }

      if (symbolCount === this.settings.boardSize - 1 &&
        emptyCell) {
        const [row, col] = emptyCell
        return row * this.settings.boardSize + col
      }
    }

    return null
  }

  easyAi() {
    const aiSymbol = this.settings.playerSymbol === 'X' ? 'O' : 'X'
    const cellIndex = this.getRandomEmptyCell()

    if (cellIndex !== null) {
      this.makeMove(cellIndex, aiSymbol)
    }
  }

  mediumAi() {
    const aiSymbol = this.settings.playerSymbol === 'X' ? 'O' : 'X'
    const playerSymbol = this.settings.playerSymbol

    const winningMove = this.findWinningMove(aiSymbol)
    if (winningMove !== null) {
      this.makeMove(winningMove, aiSymbol)
      return
    }

    const blockingMove = this.findWinningMove(playerSymbol)
    if (blockingMove !== null) {
      this.makeMove(blockingMove, aiSymbol)
      return
    }

    const randomCell = this.getRandomEmptyCell()
    if (randomCell !== null) {
      this.makeMove(randomCell, aiSymbol)
    }
  }

  hardAi() {
    const aiSymbol = this.settings.playerSymbol === 'X' ? 'O' : 'X'
    const bestMove = this.findBestMove(aiSymbol)

    if (bestMove !== null) {
      this.makeMove(bestMove, aiSymbol)
    }
  }

  findBestMove(aiSymbol) {
    let bestScore = -Infinity
    let bestMove = null
    let alpha = -Infinity
    let beta = Infinity
    const emptyCells = this.getEmptyCells()

    for (const index of emptyCells) {
      const row = Math.floor(index / this.settings.boardSize)
      const col = index % this.settings.boardSize

      // Делаем ход
      this.board[row][col] = aiSymbol

      // Вычисляем оценку для этого хода с alpha-beta отсечением
      const score = this.minimax(0, false, aiSymbol, alpha, beta)

      // Отменяем ход
      this.board[row][col] = null

      // Выбираем лучший ход
      if (score > bestScore) {
        bestScore = score
        bestMove = index
      }

      // Обновляем alpha для отсечения
      alpha = Math.max(alpha, bestScore)
    }

    return bestMove
  }

  // Minimax алгоритм с alpha-beta отсечением
  minimax(depth, isMaximizing, aiSymbol, alpha, beta) {
    const playerSymbol = this.settings.playerSymbol

    if (this.checkWin(aiSymbol)) {
      return 10 - depth
    }
    if (this.checkWin(playerSymbol)) {
      return depth - 10
    }
    if (this.checkDraw()) {
      return 0
    }

    // Ограничение глубины для больших полей
    const maxDepth = this.settings.boardSize > 3 ? 6 : Infinity
    if (depth >= maxDepth) {
      return 0
    }

    const emptyCells = this.getEmptyCells()

    if (isMaximizing) {
      // Ход AI - максимизируем оценку
      let bestScore = -Infinity

      for (const index of emptyCells) {
        const row = Math.floor(index / this.settings.boardSize)
        const col = index % this.settings.boardSize

        this.board[row][col] = aiSymbol
        const score = this.minimax(depth + 1, false, aiSymbol, alpha, beta)
        this.board[row][col] = null

        bestScore = Math.max(score, bestScore)
        alpha = Math.max(alpha, bestScore)

        // Beta отсечение
        if (beta <= alpha) {
          break
        }
      }

      return bestScore
    } else {
      // Ход игрока - минимизируем оценку
      let bestScore = Infinity

      for (const index of emptyCells) {
        const row = Math.floor(index / this.settings.boardSize)
        const col = index % this.settings.boardSize

        this.board[row][col] = playerSymbol
        const score = this.minimax(depth + 1, true, aiSymbol, alpha, beta)
        this.board[row][col] = null

        bestScore = Math.min(score, bestScore)
        beta = Math.min(beta, bestScore)

        // Alpha отсечение
        if (beta <= alpha) {
          break
        }
      }

      return bestScore
    }
  }

  updateSettings(settings) {
    this.settings = settings
    this.board = Array(settings.boardSize).fill(null).map(() => Array(settings.boardSize).fill(null))
    this.currentPlayer = settings.playerSymbol
    this.aiDifficulty = settings.aiDifficulty
    this.gameActive = false
    this.winPatterns = this.generateWinPatterns(settings.boardSize)
  }

  bindEvents() {
    this.gameCellElements.forEach(cell =>
      cell.addEventListener('click', (event) => this.onCellClick(event))
    )
  }
}

export default GameLogic
