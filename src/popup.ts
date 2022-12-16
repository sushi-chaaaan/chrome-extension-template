"use strict"

import "./popup.css"
;(function () {
  // We will make use of Storage API to get and store `count` value
  // More information on Storage API can we found at
  // https://developer.chrome.com/extensions/storage

  // To get storage access, we have to mention it in `permissions` property of manifest.json file
  // More information on Permissions can we found at
  // https://developer.chrome.com/extensions/declare_permissions
  const counterStorage = {
    get: (callback: (arg0: number) => void) => {
      chrome.storage.local.get(["count"], (result) => {
        callback(result.count)
      })
    },
    set: (value: number, callback: () => void) => {
      chrome.storage.local.set(
        {
          count: value,
        },
        () => {
          callback()
        }
      )
    },
  }

  function setupCounter(initialValue = 0) {
    const counter = <HTMLInputElement>document.getElementById("counter")
    counter.innerHTML = String(initialValue)

    const incrementButton = <HTMLButtonElement>(
      document.getElementById("incrementBtn")
    )
    incrementButton.addEventListener("click", () => {
      updateCounter({
        type: "INCREMENT",
      })
    })

    const decrementButton = <HTMLButtonElement>(
      document.getElementById("decrementBtn")
    )
    decrementButton.addEventListener("click", () => {
      updateCounter({
        type: "DECREMENT",
      })
    })
  }

  function updateCounter({ type }: { type: string }) {
    counterStorage.get((count) => {
      let newCount: number

      if (type === "INCREMENT") {
        newCount = count + 1
      } else if (type === "DECREMENT") {
        newCount = count - 1
      } else {
        newCount = count
      }

      counterStorage.set(newCount, () => {
        const counter = <HTMLInputElement>document.getElementById("counter")
        counter.innerHTML = String(newCount)

        // Communicate with content script of
        // active tab by sending a message
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          const tab = tabs[0]

          if (tab && tab.id) {
            chrome.tabs.sendMessage(
              tab.id,
              {
                type: "COUNT",
                payload: {
                  count: newCount,
                },
              },
              () => {
                console.log("Current count value passed to contentScript file")
              }
            )
          }
        })
      })
    })
  }

  function restoreCounter() {
    // Restore count value
    counterStorage.get((count) => {
      if (typeof count === "undefined") {
        // Set counter value as 0
        counterStorage.set(0, () => {
          setupCounter(0)
        })
      } else {
        setupCounter(count)
      }
    })
  }

  document.addEventListener("DOMContentLoaded", restoreCounter)

  // Communicate with background file by sending a message
  chrome.runtime.sendMessage(
    {
      type: "GREETINGS",
      payload: {
        message: "Hello, my name is Pop. I am from Popup.",
      },
    },
    (response) => {
      console.log(response.message)
    }
  )
})()
