console.log("Quiz Automation Helper: Background script loaded", new Date().toISOString())


// Store active ports
const activePorts = new Map()

// Keep track of active tabs with automation
const activeTabs = new Set()

// Listen for port connections
chrome.runtime.onConnect.addListener((port) => {
  console.log("New port connection:", port.name)

  if (port.name === "quiz-automation") {
    const tabId = port.sender.tab.id
    activePorts.set(tabId, port)

    // If this tab is in active automation, monitor it
    if (activeTabs.has(tabId)) {
      console.log(`Tab ${tabId} reconnected and is under active automation`)
    }

    port.onMessage.addListener((message, port) => {
      console.log("Background received port message:", message)

      if (message.type === "CONTENT_SCRIPT_READY") {
        console.log("Content script is ready in tab:", tabId)
      } else if (message.type === "STATUS_UPDATE") {
        // Store status for monitoring
        if (message.data.running) {
          activeTabs.add(tabId)
        } else {
          activeTabs.delete(tabId)
        }
        console.log("Status update from tab:", tabId, message.data)
      } else if (message.response) {
        // This is a response to a previous message
        console.log("Received response for message:", message.messageId)
      }
    })

    port.onDisconnect.addListener(() => {
      console.log("Port disconnected for tab:", tabId)
      activePorts.delete(tabId)

      // If this tab was in active automation, try to reconnect
      if (activeTabs.has(tabId)) {
        console.log(`Tab ${tabId} disconnected during active automation, attempting recovery...`)

        // Try to inject the content script again
        setTimeout(() => {
          try {
            chrome.scripting
              .executeScript({
                target: { tabId: tabId },
                files: ["content.js"],
              })
              .then(() => {
                console.log(`Successfully re-injected content script into tab ${tabId}`)
              })
              .catch((err) => {
                console.error(`Failed to re-inject content script into tab ${tabId}:`, err)

                // If we can't re-inject, remove from active tabs
                activeTabs.delete(tabId)
              })
          } catch (e) {
            console.error(`Error attempting to re-inject content script:`, e)
            activeTabs.delete(tabId)
          }
        }, 2000)
      }
    })
  }
})

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Background script received message:", request.action, "from tab:", sender.tab?.id)

  if (request.action === "processQuestion") {
    // If this tab is sending messages, it's active
    if (sender.tab?.id) {
      activeTabs.add(sender.tab.id)
    }

    processQuestionWithGemini(request.questionData)
      .then((answer) => {
        console.log("Processed question, sending answer back")
        sendResponse({ answer: answer, timestamp: Date.now() })
      })
      .catch((error) => {
        console.error("API error:", error)
        sendResponse({ error: error.toString(), timestamp: Date.now() })
      })
    return true // Required for async sendResponse
  }
})

// Set up a periodic check for active tabs
setInterval(() => {
  if (activeTabs.size > 0) {
    console.log(`Monitoring ${activeTabs.size} active automation tabs`)

    // Check each active tab
    for (const tabId of activeTabs) {
      if (!activePorts.has(tabId)) {
        console.log(`Tab ${tabId} is active but has no port connection, attempting recovery...`)

        // Try to inject the content script
        try {
          chrome.scripting
            .executeScript({
              target: { tabId: tabId },
              files: ["content.js"],
            })
            .then(() => {
              console.log(`Successfully re-injected content script into tab ${tabId}`)
            })
            .catch((err) => {
              console.error(`Failed to re-inject content script into tab ${tabId}:`, err)

              // If we can't inject after multiple attempts, give up
              if (err.message.includes("cannot access contents")) {
                console.log(`Tab ${tabId} is no longer accessible, removing from active tabs`)
                activeTabs.delete(tabId)
              }
            })
        } catch (e) {
          console.error(`Error attempting to re-inject content script:`, e)
        }
      }
    }
  }
}, 30000) // Check every 30 seconds

// Process question with Gemini API
async function processQuestionWithGemini(questionData) {
  try {
    // Get API key from storage
    const result = await chrome.storage.local.get(["geminiApiKey"])
    const apiKey = result.geminiApiKey

    if (!apiKey) {
      throw new Error("API key not found")
    }

    // Format the prompt for Gemini
    const prompt = formatPrompt(questionData)

    // Call Gemini API with retry
    const response = await callGeminiAPIWithRetry(prompt, apiKey)

    // Parse the response to get the answer
    return parseGeminiResponse(response, questionData.options)
  } catch (error) {
    console.error("Error processing with Gemini:", error)
    throw error
  }
}

// Format the prompt for Gemini
function formatPrompt(questionData) {
  const optionsText = questionData.options
    .map((opt, index) => `${String.fromCharCode(97 + index)}. ${opt.text}`)
    .join("\n")

  return `Answer this multiple choice question. Only respond with the letter (a, b, c, or d) of the correct answer option.
  
Question: ${questionData.question}

Options:
${optionsText}

Correct answer (just the letter a, b, c, or d):`
}

// Call Gemini API with retry
async function callGeminiAPIWithRetry(prompt, apiKey, maxRetries = 3) {
  let lastError = null

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await callGeminiAPI(prompt, apiKey)
    } catch (error) {
      console.error(`API attempt ${attempt + 1} failed:`, error)
      lastError = error

      // Wait before retrying
      if (attempt < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, 2000 * (attempt + 1)))
      }
    }
  }

  throw lastError || new Error("Failed to call Gemini API after multiple attempts")
}

// Call Gemini API
async function callGeminiAPI(prompt, apiKey) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`

  const requestBody = {
    contents: [
      {
        parts: [
          {
            text: prompt,
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: 100,
    },
  }

  console.log("Sending request to Gemini API")
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`API error: ${response.status} ${errorText}`)
  }

  return await response.json()
}

// Parse Gemini response to get the answer
function parseGeminiResponse(response, options) {
  try {
    // Extract the text from the response
    const text = response.candidates[0].content.parts[0].text.trim()
    console.log("Gemini response:", text)

    // First, check if it's just a single letter (a, b, c, d)
    if (/^[a-d]$/i.test(text)) {
      return text.toLowerCase()
    }

    // Next, check if it starts with a letter followed by a period or parenthesis
    const letterMatch = text.match(/^[a-d][.)]\s*(.*)/i)
    if (letterMatch) {
      return letterMatch[1].trim()
    }

    // If that fails, look for the option text directly
    for (const option of options) {
      if (text.includes(option.text)) {
        return option.text
      }
    }

    // If all else fails, return the full text
    return text
  } catch (error) {
    console.error("Error parsing Gemini response:", error)
    return ""
  }
}

// Notify that background script is fully loaded
console.log("Quiz Automation Helper: Background script fully initialized", new Date().toISOString())
