document.addEventListener("DOMContentLoaded", () => {
  const apiKeyInput = document.getElementById("apiKey")
  const saveKeyButton = document.getElementById("saveKey")
  const startButton = document.getElementById("startAutomation")
  const stopButton = document.createElement("button")
  stopButton.textContent = "Stop Automation"
  stopButton.className = "btn-danger"
  stopButton.style.display = "none" // Hide initially

  const statusDiv = document.getElementById("status")

  // Create hidden debug info div for logging (not visible to user)
  const debugInfoDiv = document.createElement("div")
  debugInfoDiv.style.display = "none"
  document.body.appendChild(debugInfoDiv)

  // Add progress indicator
  const progressDiv = document.createElement("div")
  progressDiv.className = "progress-info mt-2 p-2 border"
  progressDiv.innerHTML = `
    <div>Progress: <span id="current-question">-</span>/<span id="total-questions">-</span></div>
    <div class="mt-1">Last activity: <span id="last-activity">-</span></div>
  `
  document.querySelector(".container").appendChild(progressDiv)

  // Store port for persistent connection
  let port = null
  let messageCounter = 0
  const pendingMessages = new Map()
  let reconnectAttempts = 0
  const MAX_RECONNECT_ATTEMPTS = 10

  // Function to initialize port connection
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

      // Create a new port
      port = window.chrome.runtime.connect({ name: "popup-port" })

      port.onMessage.addListener((message) => {
        console.log("Port received message:", message)

        // Handle responses to our messages
        if (message.messageId && pendingMessages.has(message.messageId)) {
          const { resolve } = pendingMessages.get(message.messageId)
          pendingMessages.delete(message.messageId)
          resolve(message.response)
        }
      })

      port.onDisconnect.addListener(() => {
        console.log("Port disconnected")
        port = null

        // Try to reconnect with exponential backoff
        if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
          reconnectAttempts++
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000)
          logDebug(`Port disconnected. Reconnecting in ${delay / 1000} seconds...`)
          setTimeout(initializePort, delay)
        } else {
          logDebug(`Maximum reconnection attempts reached (${MAX_RECONNECT_ATTEMPTS}).`)
        }
      })

      // Reset reconnect counter on successful connection
      reconnectAttempts = 0
      logDebug("Port connection established")
    } catch (e) {
      console.error("Error initializing port:", e)
      logDebug(`Error initializing port: ${e.message}`)

      // Try to reconnect with exponential backoff
      if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        reconnectAttempts++
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000)
        setTimeout(initializePort, delay)
      }
    }
  }

  // Initialize port when popup opens
  initializePort()

  // Function to send message through port with promise
  function sendPortMessage(message) {
    return new Promise((resolve, reject) => {
      if (!port) {
        reject(new Error("Port not connected"))
        return
      }

      const messageId = `msg_${Date.now()}_${messageCounter++}`
      pendingMessages.set(messageId, { resolve, reject })

      try {
        port.postMessage({ ...message, messageId })

        // Set timeout to prevent hanging promises
        setTimeout(() => {
          if (pendingMessages.has(messageId)) {
            pendingMessages.delete(messageId)
            reject(new Error("Message response timeout"))
          }
        }, 5000)
      } catch (e) {
        pendingMessages.delete(messageId)
        reject(e)
      }
    })
  }

  // Function to show status
  function showStatus(message, type) {
    statusDiv.textContent = message
    statusDiv.className = "status " + type
  }

  // Function to log debug info (hidden from user)
  function logDebug(message) {
    console.log(message)
    // Still log to hidden div for debugging if needed
    const timestamp = new Date().toLocaleTimeString()
    debugInfoDiv.innerHTML += `<p><small>${timestamp}</small> ${message}</p>`
  }

  // Function to update progress display
  function updateProgress(current, total) {
    document.getElementById("current-question").textContent = current || "-"
    document.getElementById("total-questions").textContent = total || "-"
  }

  // Load saved API key
  window.chrome.storage.local.get(["geminiApiKey"], (result) => {
    if (result.geminiApiKey) {
      apiKeyInput.value = result.geminiApiKey
      showStatus("API key loaded", "success")

      // Clear status after 2 seconds
      setTimeout(() => {
        statusDiv.textContent = ""
        statusDiv.className = "status"
      }, 2000)
    }
  })

  // Check automation state
  window.chrome.storage.local.get(["automationState"], (result) => {
    if (result.automationState && result.automationState.running) {
      // Check if the state is recent (within last 2 minutes)
      const now = Date.now()
      const storedTime = result.automationState.timestamp || 0

      if (now - storedTime < 120000) {
        logDebug("Detected active automation session")
        startButton.style.display = "none"
        stopButton.style.display = "block"
        startButton.parentNode.insertBefore(stopButton, startButton)

        updateProgress(result.automationState.currentQuestion, "-")
      }
    }
  })

  // Save API key
  saveKeyButton.addEventListener("click", () => {
    const apiKey = apiKeyInput.value.trim()
    if (apiKey) {
      window.chrome.storage.local.set({ geminiApiKey: apiKey }, () => {
        showStatus("API key saved successfully!", "success")

        // Clear status after 2 seconds
        setTimeout(() => {
          statusDiv.textContent = ""
          statusDiv.className = "status"
        }, 2000)
      })
    } else {
      showStatus("Please enter a valid API key", "error")
    }
  })

  // Function to send message with retry
  async function sendMessageWithRetry(message, maxRetries = 5) {
    let lastError = null

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await new Promise((resolve, reject) => {
          window.chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (!tabs || !tabs[0] || !tabs[0].id) {
              reject(new Error("No active tab found"))
              return
            }

            window.chrome.tabs.sendMessage(tabs[0].id, message, (response) => {
              if (window.chrome.runtime.lastError) {
                reject(new Error(window.chrome.runtime.lastError.message))
                return
              }
              resolve(response)
            })
          })
        })
      } catch (error) {
        lastError = error
        logDebug(`Attempt ${attempt + 1} failed: ${error.message}`)

        // Special handling for bfcache error
        if (
          error.message.includes("back/forward cache") ||
          error.message.includes("message channel is closed") ||
          error.message.includes("Receiving end does not exist")
        ) {
          logDebug("Detected connection issue. Trying to refresh the connection...")

          // Try to inject the content script manually
          try {
            await window.chrome.scripting.executeScript({
              target: { tabId: (await window.chrome.tabs.query({ active: true, currentWindow: true }))[0].id },
              files: ["content.js"],
            })
            logDebug("Content script re-injected")

            // Give it a moment to initialize
            await new Promise((resolve) => setTimeout(resolve, 500))
          } catch (injectionError) {
            logDebug(`Failed to re-inject content script: ${injectionError.message}`)
          }
        }

        // Wait before retrying with exponential backoff
        if (attempt < maxRetries - 1) {
          const delay = Math.min(1000 * Math.pow(2, attempt), 10000)
          await new Promise((resolve) => setTimeout(resolve, delay))
        }
      }
    }

    throw lastError
  }

  // Check if content script is injected (silently)
  async function checkContentScript() {
    logDebug("Checking if content script is injected...")

    try {
      const tabs = await window.chrome.tabs.query({ active: true, currentWindow: true })
      const currentTab = tabs[0]
      logDebug(`Current URL: ${currentTab.url}`)

      try {
        const response = await sendMessageWithRetry({ action: "ping" })

        if (response && response.status === "ok") {
          logDebug("Content script is properly injected and responding!")
          return true
        } else {
          logDebug("Content script responded but with unexpected data")
          return false
        }
      } catch (error) {
        logDebug(`Error: ${error.message}`)
        logDebug("Content script is not injected. Trying to inject manually...")

        // Try to inject the content script manually
        try {
          await window.chrome.scripting.executeScript({
            target: { tabId: currentTab.id },
            files: ["content.js"],
          })
          logDebug("Content script injected manually!")

          // Verify injection worked
          try {
            const verifyResponse = await sendMessageWithRetry({ action: "ping" })
            if (verifyResponse && verifyResponse.status === "ok") {
              logDebug("Verified content script is now working!")
              return true
            }
          } catch (verifyError) {
            logDebug(`Verification failed: ${verifyError.message}`)
          }
        } catch (err) {
          logDebug(`Failed to inject content script: ${err.message}`)
        }
        return false
      }
    } catch (error) {
      logDebug(`Exception: ${error.message}`)
      return false
    }
  }

  // Add the stop button after the start button
  startButton.parentNode.insertBefore(stopButton, startButton.nextSibling)

  // Function to poll for status updates
  let statusInterval = null

  function startStatusPolling() {
    if (statusInterval) {
      clearInterval(statusInterval)
    }

    statusInterval = setInterval(async () => {
      try {
        const response = await sendMessageWithRetry({ action: "getStatus" }, 2) // Fewer retries for polling
        if (response) {
          updateProgress(response.currentQuestion, response.quizInfo?.quizProgress?.total || "-")

          // Update UI based on automation status
          if (response.running) {
            startButton.style.display = "none"
            stopButton.style.display = "block"
          } else {
            startButton.style.display = "block"
            stopButton.style.display = "none"
          }
        }
      } catch (error) {
        console.log("Status polling error:", error)
        // Don't show these errors to avoid cluttering the debug panel
      }
    }, 2000)
  }

  // Start polling when popup opens
  startStatusPolling()

  // Start automation
  startButton.addEventListener("click", async () => {
    const apiKey = await window.chrome.storage.local.get(["geminiApiKey"])
    if (!apiKey.geminiApiKey) {
      showStatus("Please save your API key first", "error")
      return
    }

    showStatus("Starting automation...", "success")

    // First check if content script is injected
    const isInjected = await checkContentScript()
    if (!isInjected) {
      showStatus("Failed to connect to quiz page", "error")
      return
    }

    try {
      const response = await sendMessageWithRetry({ action: "startAutomation" })

      if (response && response.status === "success") {
        showStatus("Automation running", "success")
        logDebug("Automation started successfully")

        // Show stop button and hide start button
        startButton.style.display = "none"
        stopButton.style.display = "block"
      } else {
        const errorMsg = response?.message || "Failed to start automation"
        showStatus(`Error: ${errorMsg}`, "error")
        logDebug(`Automation error: ${errorMsg}`)
      }
    } catch (error) {
      showStatus(`Connection error`, "error")
      logDebug(`Error starting automation: ${error.message}`)
    }
  })

  // Stop automation
  stopButton.addEventListener("click", async () => {
    showStatus("Stopping automation...", "success")

    try {
      const response = await sendMessageWithRetry({ action: "stopAutomation" })

      if (response && response.status === "success") {
        showStatus("Automation stopped", "success")
        logDebug("Automation stopped successfully")

        // Show start button and hide stop button
        startButton.style.display = "block"
        stopButton.style.display = "none"
      } else {
        const errorMsg = response?.message || "Failed to stop automation"
        showStatus(`Error: ${errorMsg}`, "error")
        logDebug(`Automation error: ${errorMsg}`)
      }
    } catch (error) {
      showStatus(`Connection error`, "error")
      logDebug(`Error stopping automation: ${error.message}`)

      // Force stop by updating storage
      window.chrome.storage.local.set({ automationState: { running: false } }, () => {
        logDebug("Forced automation stop via storage update")
        startButton.style.display = "block"
        stopButton.style.display = "none"
      })
    }
  })

  // Add a force reload button for emergency recovery
  const forceReloadButton = document.createElement("button")
  forceReloadButton.textContent = "Force Page Reload"
  forceReloadButton.className = "btn btn-warning mt-2"
  forceReloadButton.addEventListener("click", async () => {
    logDebug("Forcing page reload...")

    try {
      const tabs = await window.chrome.tabs.query({ active: true, currentWindow: true })
      if (tabs && tabs[0] && tabs[0].id) {
        // Store automation state before reload if it's running
        const state = await window.chrome.storage.local.get(["automationState"])
        if (state.automationState && state.automationState.running) {
          await window.chrome.storage.local.set({
            automationState: {
              ...state.automationState,
              timestamp: Date.now(),
            },
          })
          logDebug("Saved automation state before reload")
        }

        // Reload the page
        window.chrome.tabs.reload(tabs[0].id)
        logDebug("Page reload initiated")
      } else {
        logDebug("No active tab found to reload")
      }
    } catch (error) {
      logDebug(`Error forcing reload: ${error.message}`)
    }
  })

  // Add the force reload button
  document.querySelector(".container").insertBefore(forceReloadButton, debugInfoDiv)

  // Check quiz page silently on load
  checkIfQuizPage()
})

// Function to check if the current page is a quiz page (silently)
async function checkIfQuizPage(showStatus, logDebug) {
  console.log("Checking if current page is a quiz page...")

  try {
    const tabs = await window.chrome.tabs.query({ active: true, currentWindow: true })

    const sendMessage = () => {
      return new Promise((resolve, reject) => {
        window.chrome.tabs.sendMessage(tabs[0].id, { action: "checkQuizPage" }, (response) => {
          if (window.chrome.runtime.lastError) {
            reject(new Error(window.chrome.runtime.lastError.message))
            return
          }
          resolve(response)
        })
      })
    }

    try {
      const response = await sendMessage()

      if (response && response.isQuizPage) {
        console.log("Quiz page detected")

        // Update progress display
        if (response.quizProgress && response.quizProgress.total > 0) {
          document.getElementById("current-question").textContent = response.quizProgress.current
          document.getElementById("total-questions").textContent = response.quizProgress.total
        }
      } else {
        console.log("Not a quiz page")
      }
    } catch (error) {
      console.log(`Connection error: ${error.message}`)

      // Special handling for bfcache error - try to inject silently
      if (
        error.message.includes("back/forward cache") ||
        error.message.includes("message channel is closed") ||
        error.message.includes("Receiving end does not exist")
      ) {
        console.log("Detected connection issue. Trying to refresh the connection...")

        // Try to inject the content script manually
        try {
          await window.chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            files: ["content.js"],
          })
          console.log("Content script re-injected. Trying again...")

          // Try again after a short delay
          setTimeout(async () => {
            try {
              await sendMessage()
            } catch (retryError) {
              console.log(`Retry failed: ${retryError.message}`)
            }
          }, 500)
        } catch (injectionError) {
          console.log(`Failed to re-inject content script: ${injectionError.message}`)
        }
      }
    }
  } catch (error) {
    console.log(`Exception: ${error.message}`)
  }
}
