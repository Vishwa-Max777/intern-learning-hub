console.log("Quiz Automation Helper: Content script loaded", new Date().toISOString())

// Global variables to control automation
let automationRunning = false
let currentQuestionNumber = 1
let totalQuestionsProcessed = 0
let lastActivityTimestamp = Date.now()
let watchdogTimer = null
let pageReloadCount = 0
const MAX_PAGE_RELOADS = 5

// Store the port for persistent connection
let port = null


// Initialize the port connection
function initializePort() {
  try {
    // Close existing port if any
    if (port) {
      try {
        port.disconnect()
      } catch (e) {
        console.log("Error disconnecting old port:", e)
      }
    }

    // Create a new long-lived connection
    port = chrome.runtime.connect({ name: "quiz-automation" })

    port.onMessage.addListener((message) => {
      console.log("Port received message:", message)
      handleMessage(message, (response) => {
        try {
          port.postMessage({ response, messageId: message.messageId })
        } catch (e) {
          console.error("Error sending response via port:", e)
        }
      })
    })

    port.onDisconnect.addListener(() => {
      console.log("Port disconnected. Reconnecting in 1 second...")
      setTimeout(initializePort, 1000)
    })

    // Send ready message
    port.postMessage({ type: "CONTENT_SCRIPT_READY", timestamp: Date.now() })
    console.log("Port initialized and ready message sent")
  } catch (e) {
    console.error("Error initializing port:", e)
    // Try to reconnect after a delay
    setTimeout(initializePort, 2000)
  }
}

// Initialize port when script loads
initializePort()

// Set up a MutationObserver to detect page changes
const observer = new MutationObserver((mutations) => {
  // This will fire when the DOM changes, which might indicate a page transition
  lastActivityTimestamp = Date.now()

  // Check if we're still on a quiz page
  const quizInfo = getQuizInfo()
  if (quizInfo.isQuizPage && automationRunning) {
    console.log("DOM changed, might be a new question. Updating state...")

    // If the current question number changed, update our tracking
    if (quizInfo.quizProgress.current !== currentQuestionNumber) {
      currentQuestionNumber = quizInfo.quizProgress.current
      console.log(`Question number updated to ${currentQuestionNumber}`)
    }
  }
})

// Start observing the document
observer.observe(document.body, {
  childList: true,
  subtree: true,
  attributes: true,
  characterData: true,
})

// Set up a watchdog timer to detect stalled automation
function startWatchdog() {
  if (watchdogTimer) {
    clearInterval(watchdogTimer)
  }

  watchdogTimer = setInterval(() => {
    const now = Date.now()
    const timeSinceLastActivity = now - lastActivityTimestamp

    // If no activity for 30 seconds and automation is running, something might be wrong
    if (timeSinceLastActivity > 30000 && automationRunning) {
      console.log("Watchdog: No activity detected for 30 seconds, attempting recovery...")

      // Try to recover by reloading the page if we haven't exceeded the limit
      if (pageReloadCount < MAX_PAGE_RELOADS) {
        pageReloadCount++
        console.log(`Watchdog: Reloading page (${pageReloadCount}/${MAX_PAGE_RELOADS})`)

        // Store automation state before reload
        chrome.storage.local.set(
          {
            automationState: {
              running: true,
              currentQuestion: currentQuestionNumber,
              totalProcessed: totalQuestionsProcessed,
              timestamp: Date.now(),
            },
          },
          () => {
            // Reload the page
            window.location.reload()
          },
        )
      } else {
        console.log("Watchdog: Max reload attempts reached, stopping automation")
        automationRunning = false
        chrome.storage.local.set({ automationState: { running: false } })
      }
    }
  }, 10000) // Check every 10 seconds
}

// Start the watchdog
startWatchdog()

// Check if we need to resume automation after a page reload
function checkForAutomationResume() {
  chrome.storage.local.get(["automationState"], (result) => {
    if (result.automationState && result.automationState.running) {
      // Check if the stored state is recent (within last 2 minutes)
      const now = Date.now()
      const storedTime = result.automationState.timestamp || 0

      if (now - storedTime < 120000) {
        console.log("Resuming automation after page reload")
        automationRunning = true
        currentQuestionNumber = result.automationState.currentQuestion || 1
        totalQuestionsProcessed = result.automationState.totalProcessed || 0

        // Wait a moment for the page to fully load
        setTimeout(() => {
          startAutomation()
        }, 2000)
      } else {
        console.log("Found stale automation state, not resuming")
        chrome.storage.local.set({ automationState: { running: false } })
      }
    }
  })
}

// Check for resume on script load
setTimeout(checkForAutomationResume, 1000)

// Also listen for one-time messages (as backup)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Content script received one-time message:", request)
  lastActivityTimestamp = Date.now() // Update activity timestamp
  handleMessage(request, sendResponse)
  return true // Keep the message channel open for async response
})

// Unified message handler
function handleMessage(request, sendResponse) {
  // Simple ping to check if content script is loaded
  if (request.action === "ping") {
    console.log("Ping received, responding...")
    sendResponse({ status: "ok", timestamp: Date.now() })
  } else if (request.action === "checkQuizPage") {
    const quizInfo = getQuizInfo()
    sendResponse({
      isQuizPage: quizInfo.isQuizPage,
      elements: quizInfo.elements,
      quizProgress: quizInfo.quizProgress,
      timestamp: Date.now(),
    })
  } else if (request.action === "startAutomation") {
    console.log("Starting automation...")
    automationRunning = true
    pageReloadCount = 0 // Reset reload counter

    // Store automation state
    chrome.storage.local.set({
      automationState: {
        running: true,
        currentQuestion: currentQuestionNumber,
        totalProcessed: totalQuestionsProcessed,
        timestamp: Date.now(),
      },
    })

    // Start in a non-blocking way
    startAutomation()
      .then(() => {
        console.log("Automation completed successfully")
        try {
          sendResponse({ status: "success", timestamp: Date.now() })
        } catch (e) {
          console.log("Could not send completion response:", e)
        }
      })
      .catch((error) => {
        console.error("Automation error:", error)
        try {
          sendResponse({ status: "error", message: error.toString(), timestamp: Date.now() })
        } catch (e) {
          console.log("Could not send error response:", e)
        }
      })
  } else if (request.action === "stopAutomation") {
    console.log("Stopping automation...")
    automationRunning = false

    // Clear automation state
    chrome.storage.local.set({ automationState: { running: false } })

    sendResponse({ status: "success", message: "Automation stopped", timestamp: Date.now() })
  } else if (request.action === "getStatus") {
    sendResponse({
      running: automationRunning,
      currentQuestion: currentQuestionNumber,
      totalProcessed: totalQuestionsProcessed,
      quizInfo: getQuizInfo(),
      lastActivity: lastActivityTimestamp,
      timestamp: Date.now(),
    })
  }
}

// Get information about the current quiz state
function getQuizInfo() {
  const quizIndicators = {
    questionContainer: document.querySelector(".que.multichoice"),
    questionText: document.querySelector(".qtext"),
    answerOptions: document.querySelector('.answer input[type="radio"]'),
    nextButton: document.querySelector(".mod_quiz-next-nav"),
    summaryPage: document.querySelector(".quizsummaryofattempt"),
    finishButton: document.querySelector("input[name='finishattempt']"),
  }

  // Try to determine quiz progress
  const quizProgress = { current: 0, total: 0 }
  try {
    // Look for navigation buttons that might indicate progress
    const navButtons = document.querySelectorAll(".qnbutton")
    if (navButtons.length > 0) {
      quizProgress.total = navButtons.length

      // Find which one is current
      const currentButton = document.querySelector(".qnbutton.thispage")
      if (currentButton) {
        // Extract the question number
        const questionText = currentButton.textContent.trim()
        const match = questionText.match(/\d+/)
        if (match) {
          quizProgress.current = Number.parseInt(match[0], 10)
          currentQuestionNumber = quizProgress.current
        }
      }
    }
  } catch (e) {
    console.error("Error determining quiz progress:", e)
  }

  const isQuizPage = Object.values(quizIndicators).some((indicator) => indicator !== null)

  return {
    isQuizPage,
    elements: {
      questionExists: !!quizIndicators.questionText,
      optionsExist: !!quizIndicators.answerOptions,
      nextButtonExists: !!quizIndicators.nextButton,
      summaryPageExists: !!quizIndicators.summaryPage,
      finishButtonExists: !!quizIndicators.finishButton,
    },
    quizProgress,
  }
}

// Main function to start the automation process
async function startAutomation() {
  console.log("Starting automation process")
  lastActivityTimestamp = Date.now()

  // Process questions until we reach the end or automation is stopped
  while (automationRunning) {
    try {
      // Get current quiz info
      const quizInfo = getQuizInfo()
      lastActivityTimestamp = Date.now()

      // Send status update through port if available
      try {
        if (port) {
          port.postMessage({
            type: "STATUS_UPDATE",
            data: {
              running: automationRunning,
              currentQuestion: currentQuestionNumber,
              totalProcessed: totalQuestionsProcessed,
              quizInfo: quizInfo,
              timestamp: Date.now(),
            },
          })
        }
      } catch (e) {
        console.log("Could not send status update:", e)
      }

      // Check if we're on a quiz page
      if (!quizInfo.isQuizPage) {
        console.log("Not on a quiz page or reached the end of the quiz")
        automationRunning = false
        chrome.storage.local.set({ automationState: { running: false } })
        break
      }

      // Check if we've reached the summary page (end of quiz)
      if (quizInfo.elements.summaryPageExists) {
        console.log("Reached quiz summary page - quiz completed")
        automationRunning = false
        chrome.storage.local.set({ automationState: { running: false } })
        break
      }

      // Process the current question
      await processCurrentQuestion()
      totalQuestionsProcessed++
      lastActivityTimestamp = Date.now()

      // Update automation state after each question
      chrome.storage.local.set({
        automationState: {
          running: true,
          currentQuestion: currentQuestionNumber,
          totalProcessed: totalQuestionsProcessed,
          timestamp: Date.now(),
        },
      })

      // Add a delay between questions to avoid overloading
      await new Promise((resolve) => setTimeout(resolve, 2000))
    } catch (error) {
      console.error("Error in automation loop:", error)

      // If there's a connection error, try to recover
      if (
        error.message.includes("back/forward cache") ||
        error.message.includes("message channel is closed") ||
        error.message.includes("Receiving end does not exist")
      ) {
        console.log("Detected connection issue, attempting recovery...")

        // Try to reinitialize the port
        initializePort()

        // Wait a bit longer before retrying
        await new Promise((resolve) => setTimeout(resolve, 5000))
      } else {
        // For other errors, use a shorter delay
        await new Promise((resolve) => setTimeout(resolve, 3000))
      }
    }
  }

  console.log("Automation process completed or stopped")
}

// Main function to process the current question
async function processCurrentQuestion() {
  console.log(`Processing question #${currentQuestionNumber}`)
  lastActivityTimestamp = Date.now()

  // Extract question and options
  const questionData = extractQuestionData()

  if (!questionData) {
    throw new Error("Could not extract question data")
  }

  console.log("Extracted question:", questionData)

  // Send to background script for API processing
  let response
  try {
    response = await sendMessageToBackground({
      action: "processQuestion",
      questionData: questionData,
    })
  } catch (error) {
    console.error("Error communicating with background script:", error)

    // Try a different approach if the first one fails
    try {
      console.log("Trying alternative communication method...")
      response = await new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(
          {
            action: "processQuestion",
            questionData: questionData,
          },
          (result) => {
            if (chrome.runtime.lastError) {
              reject(new Error(chrome.runtime.lastError.message))
            } else {
              resolve(result)
            }
          },
        )
      })
    } catch (fallbackError) {
      throw new Error("Failed to communicate with background script after multiple attempts: " + fallbackError.message)
    }
  }

  if (!response || response.error) {
    throw new Error(response?.error || "Failed to get answer from API")
  }

  // Select the correct answer
  selectAnswer(response.answer)
  lastActivityTimestamp = Date.now()

  // Add a small delay before clicking next
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Click the next button
  await clickNextButton()
  lastActivityTimestamp = Date.now()

  // Add a delay to allow the next page to load
  await new Promise((resolve) => setTimeout(resolve, 1500))
}

// Helper function to send messages to background script with retry
async function sendMessageToBackground(message, maxRetries = 5) {
  let retries = 0

  while (retries < maxRetries) {
    try {
      return await new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(message, (response) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message))
            return
          }
          resolve(response)
        })
      })
    } catch (error) {
      console.log(`Attempt ${retries + 1} failed: ${error.message}`)
      retries++

      if (retries >= maxRetries) {
        throw error
      }

      // Exponential backoff
      const delay = Math.min(1000 * Math.pow(2, retries), 10000)
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }
}

// Extract question and options from the page
function extractQuestionData() {
  try {
    // Extract the question text
    const questionElement = document.querySelector(".qtext")
    if (!questionElement) {
      console.error("Question element not found")
      return null
    }

    const questionText = questionElement.textContent.trim()
    console.log("Found question text:", questionText)

    // Extract all options
    const options = []
    const optionElements = document.querySelectorAll(".answer .d-flex.w-auto .flex-fill.ml-1")
    const optionInputs = document.querySelectorAll('.answer input[type="radio"]')

    if (optionElements.length === 0 || optionInputs.length === 0) {
      console.error("Option elements not found", {
        optionElementsCount: optionElements.length,
        optionInputsCount: optionInputs.length,
      })
      return null
    }

    console.log(`Found ${optionElements.length} options`)

    for (let i = 0; i < optionElements.length; i++) {
      options.push({
        id: optionInputs[i].id,
        value: optionInputs[i].value,
        text: optionElements[i].textContent.trim(),
        letter: String.fromCharCode(97 + i), // 'a', 'b', 'c', 'd'
      })
    }

    return {
      question: questionText,
      options: options,
    }
  } catch (error) {
    console.error("Error extracting question data:", error)
    return null
  }
}

// Select the answer based on the API response
function selectAnswer(answerText) {
  try {
    const options = document.querySelectorAll(".answer .d-flex.w-auto .flex-fill.ml-1")
    const optionInputs = document.querySelectorAll('.answer input[type="radio"]')

    console.log("Selecting answer:", answerText)
    console.log(
      "Available options:",
      Array.from(options).map((o) => o.textContent.trim()),
    )

    // Check if the answer is just a letter (a, b, c, d)
    if (/^[a-d]$/i.test(answerText.trim())) {
      const letterIndex = answerText.trim().toLowerCase().charCodeAt(0) - 97 // Convert 'a' to 0, 'b' to 1, etc.
      if (letterIndex >= 0 && letterIndex < optionInputs.length) {
        optionInputs[letterIndex].click()
        console.log(`Selected answer by letter (${answerText}):`, options[letterIndex].textContent.trim())
        return
      }
    }

    // First, try to find an exact match
    for (let i = 0; i < options.length; i++) {
      const optionText = options[i].textContent.trim()
      if (optionText.toLowerCase() === answerText.toLowerCase()) {
        optionInputs[i].click()
        console.log("Selected answer (exact match):", optionText)
        return
      }
    }

    // If no exact match, try to find the closest match
    let bestMatchIndex = 0
    let bestMatchScore = 0

    for (let i = 0; i < options.length; i++) {
      const optionText = options[i].textContent.trim().toLowerCase()
      const answerLower = answerText.toLowerCase()

      // Simple similarity score - count how many words from the answer appear in the option
      const answerWords = answerLower.split(/\s+/)
      let matchScore = 0

      for (const word of answerWords) {
        if (optionText.includes(word) && word.length > 2) {
          // Only count meaningful words
          matchScore++
        }
      }

      if (matchScore > bestMatchScore) {
        bestMatchScore = matchScore
        bestMatchIndex = i
      }
    }

    // Select the best match
    optionInputs[bestMatchIndex].click()
    console.log("Selected best match answer:", options[bestMatchIndex].textContent.trim())
  } catch (error) {
    console.error("Error selecting answer:", error)
  }
}

// Click the next button
async function clickNextButton() {
  try {
    const nextButton = document.querySelector(".mod_quiz-next-nav")
    if (nextButton) {
      nextButton.click()
      console.log("Clicked next button")
      return true
    } else {
      console.warn("Next button not found")

      // Check if we're on the summary page
      const summaryPage = document.querySelector(".quizsummaryofattempt")
      if (summaryPage) {
        console.log("Reached quiz summary page - quiz completed")
        return false
      }

      // Check if there's a finish attempt button
      const finishButton = document.querySelector("input[name='finishattempt']")
      if (finishButton) {
        console.log("Found finish attempt button, clicking it")
        finishButton.click()
        return true
      }

      return false
    }
  } catch (error) {
    console.error("Error clicking next button:", error)
    return false
  }
}

// Notify that content script is fully loaded
console.log("Quiz Automation Helper: Content script fully initialized", new Date().toISOString())
