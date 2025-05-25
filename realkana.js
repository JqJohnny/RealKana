// ==UserScript==
// @name         RealKana Definition Helper (Local Kana Glosses)
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Show kana definitions from local dictionary (hiragana + katakana)
// @match        https://realkana.com/*
// @grant        GM_xmlhttpRequest
// @connect      jisho.org
// ==/UserScript==

(function () {
  'use strict';

  console.log("RealKana Definitions Loaded");

  function showDefinition(input) {
      console.log("🔍 Searching for:", input);
      const url = `https://jisho.org/api/v1/search/words?keyword=${encodeURIComponent(input)}`;

      GM_xmlhttpRequest({
          method: "GET",
          url: url,
          onload: function (response) {
              let gloss = 'No definition found.';
              try {
                  const data = JSON.parse(response.responseText);
                  if (data && data.data && data.data.length > 0) {
                      const entry = data.data[0];
                      const japanese = entry.japanese[0]?.word || entry.japanese[0]?.reading;
                      const english = entry.senses[0]?.english_definitions?.join(', ');
                      gloss = `${japanese}: ${english}`;
                  }
              } catch (err) {
                  gloss = 'Error parsing response.';
                  console.error("Parsing Error:", err);
              }

              console.log("📘 Definition:", gloss);
              displayDefinition(gloss);
          },
          onerror: function (err) {
              console.error("Request failed", err);
          }
      });
  }

  function displayDefinition(gloss) {
  let defBox = document.querySelector('#kana-definition');
  if (!defBox) {
    defBox = document.createElement('div');
    defBox.id = 'kana-definition';
    defBox.style.marginTop = '16px';
    defBox.style.fontSize = '18px';
    defBox.style.color = '#007acc';
    defBox.style.fontWeight = 'bold';
    document.querySelector('#prompt')?.appendChild(defBox);
  }
  defBox.textContent = `📘 Definition: ${gloss}`;
}


  function waitForInput() {
    const inputBox = document.querySelector('#«r0»');
    if (!inputBox) {
      setTimeout(waitForInput, 500);
      return;
    }

    inputBox.addEventListener('keyup', function (e) {
      if (e.key === 'Enter') {
      setTimeout(showDefinition, 500, inputBox.value);
      }
    });

  }

  waitForInput();
})();