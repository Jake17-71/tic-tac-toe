const rootSelector = `[data-js-game-board]`

class GameLogic {
  selectors = {
    root: rootSelector,
    gameCellSelector: `[data-js-cell]`,
    gameOverlaySelector: `[data-js-game-overlay]`,
    gameOverlayTitleSelector: `[data-js-game-overlay-title]`,
    newGameButtonSelector: `[data-js-new-game]`,
    gameStatusSelector: `[data-js-game-status]`,
    gameScoreSelector: `[data-js-game-score]`,
  }

  constructor(rootElement, settings) {
    this.rootElement = rootElement
    this.gameCellElements = this.rootElement.querySelectorAll(this.selectors.gameCellSelector)
    this.gameOverlayElement = document.querySelector(this.selectors.gameOverlaySelector)
    this.gameOverlayTitleElement = document.querySelector(this.selectors.gameOverlayTitleSelector)
    this.newGameButtonElement = document.querySelector(this.selectors.newGameButtonSelector)
    this.gameStatusElement = document.querySelector(this.selectors.gameStatusSelector)
    this.gameScoreElement = document.querySelector(this.selectors.gameScoreSelector)
    this.settings = settings
    this.board = Array(this.settings.boardSize).fill(null).map(() => Array(this.settings.boardSize).fill(null))
    this.currentPlayer = settings.playerSymbol
    this.aiDifficulty = settings.aiDifficulty
    this.gameActive = false
    this.winner = null
    this.winningPattern = null
    this.winLength = this.getWinLength(this.settings.boardSize)
    this.winPatterns = this.generateWinPatterns(this.settings.boardSize, this.winLength)

    const savedScore = this.loadScoreFromStorage()
    this.userWins = savedScore.userWins
    this.botWins = savedScore.botWins

    this.init()
  }

  getWinLength(boardSize) {
    // 3×3 → 3 в ряд
    // 4×4 и 5×5 → 4 в ряд
    return boardSize === 3 ? 3 : 4
  }

  loadScoreFromStorage() {
    try {
      const savedScore = localStorage.getItem('ticTacToeScore')
      if (savedScore) {
        const score = JSON.parse(savedScore)
        return {
          userWins: score.userWins || 0,
          botWins: score.botWins || 0,
        }
      }
    } catch (error) {

    }
    return { userWins: 0, botWins: 0 }
  }

  saveScoreToStorage() {
    try {
      const score = {
        userWins: this.userWins,
        botWins: this.botWins,
      }
      localStorage.setItem('ticTacToeScore', JSON.stringify(score))
    } catch (error) {
      console.error(error)
    }
  }

  init() {
    this.bindEvents()
    this.updateScoreDisplay()
    this.checkForBotFirstMove()
  }

  checkForBotFirstMove() {
    if (this.settings.playerSymbol === 'X') {
      this.gameActive = true
      this.makeAiMove()
    }
  }

  generateWinPatterns(boardSize, winLength) {
    const patterns = []

    // Генерация горизонтальных паттернов
    for (let row = 0; row < boardSize; row++) {
      for (let startCol = 0; startCol <= boardSize - winLength; startCol++) {
        const pattern = []
        for (let i = 0; i < winLength; i++) {
          pattern.push([row, startCol + i])
        }
        patterns.push(pattern)
      }
    }

    // Генерация вертикальных паттернов
    for (let col = 0; col < boardSize; col++) {
      for (let startRow = 0; startRow <= boardSize - winLength; startRow++) {
        const pattern = []
        for (let i = 0; i < winLength; i++) {
          pattern.push([startRow + i, col])
        }
        patterns.push(pattern)
      }
    }

    // Генерация диагональных паттернов (слева-направо, сверху-вниз)
    for (let row = 0; row <= boardSize - winLength; row++) {
      for (let col = 0; col <= boardSize - winLength; col++) {
        const pattern = []
        for (let i = 0; i < winLength; i++) {
          pattern.push([row + i, col + i])
        }
        patterns.push(pattern)
      }
    }

    // Генерация диагональных паттернов (справа-налево, сверху-вниз)
    for (let row = 0; row <= boardSize - winLength; row++) {
      for (let col = winLength - 1; col < boardSize; col++) {
        const pattern = []
        for (let i = 0; i < winLength; i++) {
          pattern.push([row + i, col - i])
        }
        patterns.push(pattern)
      }
    }

    return patterns
  }

  checkWin(symbol) {
    for (const pattern of this.winPatterns) {
      // Проверяем, все ли клетки в паттерне заполнены указанным символом
      const isWinningPattern = pattern.every(([row, col]) => {
        return this.board[row][col] === symbol
      })

      if (isWinningPattern) {
        this.winningPattern = pattern
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

    if (this.gameActive || !this.winner) {
      this.updateGameStatus(symbol)
    }
  }

  updateCellUI(index, symbol) {
    const cell = this.gameCellElements[index]
    cell.textContent = symbol
    cell.dataset.value = symbol
  }

  updateGameStatus(currentSymbol) {
    if (!this.gameStatusElement) {
      return
    }

    const nextSymbol = currentSymbol === 'X' ? 'O' : 'X'
    this.gameStatusElement.textContent = `Player ${nextSymbol}'s turn`
  }

  updateScoreDisplay() {
    if (!this.gameScoreElement) {
      return
    }

    this.gameScoreElement.textContent = `User: ${this.userWins} | Bot: ${this.botWins}`
  }

  checkGameEnd(symbol) {
    if (this.checkWin(symbol)) {
      this.gameActive = false
      this.winner = symbol

      const aiSymbol = this.settings.playerSymbol === 'X' ? 'O' : 'X'
      if (symbol === this.settings.playerSymbol) {
        this.userWins++
      } else if (symbol === aiSymbol) {
        this.botWins++
      }

      this.saveScoreToStorage()
      this.updateScoreDisplay()
      this.highlightWinningCells()

      this.showGameOverModal(`Player ${symbol} wins!`)
      return
    }

    if (this.checkDraw()) {
      this.gameActive = false
      this.showGameOverModal('Draw!')
    }
  }

  highlightWinningCells() {
    if (!this.winningPattern) {
      return
    }

    for (const [row, col] of this.winningPattern) {
      const index = row * this.settings.boardSize + col
      const cell = this.gameCellElements[index]
      if (cell) {
        cell.classList.add('game__cell--winner')
      }
    }
  }

  clearWinningHighlight() {
    this.gameCellElements.forEach(cell => {
      cell.classList.remove('game__cell--winner')
    })
    this.winningPattern = null
  }

  showGameOverModal(message) {
    this.gameOverlayTitleElement.textContent = message
    this.gameOverlayElement.removeAttribute('hidden')
  }

  hideGameOverModal() {
    this.gameOverlayElement.setAttribute('hidden', '')
  }

  resetGame() {
    this.board = Array(this.settings.boardSize).fill(null).map(() => Array(this.settings.boardSize).fill(null))
    this.gameActive = false
    this.winner = null

    this.clearWinningHighlight()

    this.gameCellElements.forEach(cell => {
      cell.textContent = ''
      cell.removeAttribute('data-value')
    })

    this.hideGameOverModal()

    if (this.gameStatusElement) {
      const firstPlayer = this.settings.playerSymbol === 'X' ? 'O' : this.settings.playerSymbol
      this.gameStatusElement.textContent = `Player ${firstPlayer}'s turn`
    }

    this.checkForBotFirstMove()
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
      let emptyCellCount = 0

      for (const [row, col] of pattern) {
        if (this.board[row][col] === symbol) {
          symbolCount++
        } else if (this.board[row][col] === null) {
          emptyCell = [row, col]
          emptyCellCount++
        }
      }

      // Если в паттерне winLength-1 нужных символов и одна пустая клетка
      if (symbolCount === this.winLength - 1 && emptyCellCount === 1) {
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
    const boardSize = this.settings.boardSize
    const emptyCells = this.getEmptyCells()

    // Для больших полей: первые 2 хода всегда в центре/рядом с центром
    if (boardSize >= 4 && emptyCells.length >= boardSize * boardSize - 2) {
      const center = Math.floor(boardSize / 2)
      const centerIndex = center * boardSize + center

      // Первый ход - берем центр если свободен
      if (this.board[center][center] === null) {
        this.makeMove(centerIndex, aiSymbol)
        return
      }

      // Второй ход - берем клетку рядом с центром
      const nearCenter = [
        [center - 1, center], [center + 1, center],
        [center, center - 1], [center, center + 1],
      ]

      for (const [row, col] of nearCenter) {
        if (row >= 0 && row < boardSize && col >= 0 && col < boardSize &&
            this.board[row][col] === null) {
          this.makeMove(row * boardSize + col, aiSymbol)
          return
        }
      }
    }

    // Остальные ходы - minimax
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

    const emptyCells = this.getEmptyCells()

    // Ограничение глубины для больших полей
    const maxDepth = this.settings.boardSize > 3 ? 4 : Infinity
    if (depth >= maxDepth) {
      return 0
    }

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
    this.winLength = this.getWinLength(settings.boardSize)
    this.winPatterns = this.generateWinPatterns(settings.boardSize, this.winLength)

    this.resetGame()
  }

  bindEvents() {
    this.gameCellElements.forEach(cell =>
      cell.addEventListener('click', (event) => this.onCellClick(event))
    )

    this.newGameButtonElement.addEventListener('click', () => this.resetGame())
  }
}

export default GameLogic
