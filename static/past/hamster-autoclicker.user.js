// ==UserScript==
// @name         Hamster Kombat Autoclicker
// @namespace    Violentmonkey Scripts
// @match        *://*.hamsterkombat.io/*
// @version      1.2
// @description  12.06.2024, 21:43:52
// @grant        none
// @icon         https://hamsterkombat.io/images/icons/hamster-coin.png
// @downloadURL  https://github.com/mudachyo/Hamster-Kombat/raw/main/hamster-autoclicker.user.js
// @updateURL    https://github.com/mudachyo/Hamster-Kombat/raw/main/hamster-autoclicker.user.js
// @homepage     https://github.com/mudachyo/Hamster-Kombat
// ==/UserScript==
(function () {
    // Configuration for log styles
    const styles = {
        success: 'background: #28a745; color: #ffffff; font-weight: bold; padding: 4px 8px; border-radius: 4px;',
        starting: 'background: #8640ff; color: #ffffff; font-weight: bold; padding: 4px 8px; border-radius: 4px;',
        error: 'background: #dc3545; color: #ffffff; font-weight: bold; padding: 4px 8px; border-radius: 4px;',
        info: 'background: #007bff; color: #ffffff; font-weight: bold; padding: 4px 8px; border-radius: 4px;'
    };
    const logPrefix = '%c[HamsterKombatBot] ';

    // Overriding console.log to add prefix and styles
    const originalLog = console.log;
    console.log = function () {
        if (typeof arguments[0] === 'string' && arguments[0].includes('[HamsterKombatBot]')) {
            originalLog.apply(console, arguments);
        }
    };

    // Disable other console methods for cleaner output
    console.error = console.warn = console.info = console.debug = () => {};

    // Clear console and display starting messages
    console.clear();
    console.log(`${logPrefix}Starting`, styles.starting);
    console.log(`${logPrefix}Created by https://t.me/mudachyo`, styles.starting);
    console.log(`${logPrefix}Github https://github.com/mudachyo/Hamster-Kombat`, styles.starting);

    // Script settings
    const settings = {
        minEnergy: 25, // Minimum energy needed to click the coin
        minInterval: 30, // Minimum interval between clicks in milliseconds
        maxInterval: 100, // Maximum interval between clicks in milliseconds
        minEnergyRefillDelay: 60000, // Minimum delay in milliseconds for energy refill (60 seconds)
        maxEnergyRefillDelay: 180000, // Maximum delay in milliseconds for energy refill (180 seconds)
        maxRetries: 5 // Maximum retries before reloading the page
    };

    let retryCount = 0;

    // Function to get the position of an element
    function getElementPosition(element) {
        let currentElement = element;
        let top = 0, left = 0;
        do {
            top += currentElement.offsetTop || 0;
            left += currentElement.offsetLeft || 0;
            currentElement = currentElement.offsetParent;
        } while (currentElement);
        return { top, left };
    }

    // Function to generate a random number within a range
    function getRandomNumber(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // Function to perform a random click
    function performRandomClick() {
        const energyElement = document.getElementsByClassName("user-tap-energy")[0];
        const buttonElement = document.getElementsByClassName('user-tap-button')[0];

        if (!energyElement || !buttonElement) {
            // Element not found, retry
            console.log(`${logPrefix}Element not found, retrying...`, styles.error);

            retryCount++;
            if (retryCount >= settings.maxRetries) {
                console.log(`${logPrefix}Max retries reached, reloading page...`, styles.error);
                location.reload();
            } else {
                // Add a delay before the next attempt
                setTimeout(() => {
                    performRandomClick();
                }, 2000);
            }
            return;
        }

        retryCount = 0; // Reset retry count on successful element detection

        const energy = parseInt(energyElement.getElementsByTagName("p")[0].textContent.split(" / ")[0]);
        if (energy > settings.minEnergy) {
            // Generate random coordinates within the button's area
            let { top, left } = getElementPosition(buttonElement);
            const randomX = Math.floor(left + Math.random() * buttonElement.offsetWidth);
            const randomY = Math.floor(top + Math.random() * buttonElement.offsetHeight);

            // Create click events at the specified coordinates
            const pointerDownEvent = new PointerEvent('pointerdown', { clientX: randomX, clientY: randomY });
            const pointerUpEvent = new PointerEvent('pointerup', { clientX: randomX, clientY: randomY });
            // Perform click
            buttonElement.dispatchEvent(pointerDownEvent);
            buttonElement.dispatchEvent(pointerUpEvent);

            console.log(`${logPrefix}Button clicked at (${randomX}, ${randomY})`, styles.success);
        } else {
            // Log insufficient energy and pause for refill
            console.log(`${logPrefix}Insufficient energy, pausing script for energy refill.`, styles.info);

            // Generate random delay for energy refill
            const randomEnergyRefillDelay = getRandomNumber(settings.minEnergyRefillDelay, settings.maxEnergyRefillDelay);
            const delayInSeconds = randomEnergyRefillDelay / 1000;

            // Log delay information
            console.log(`${logPrefix}Energy refill delay set to: ${delayInSeconds} seconds.`, styles.info);

            // Set delay before the next energy check
            setTimeout(performRandomClick, randomEnergyRefillDelay);
            return;
        }
        // Generate next click with a random interval
        const randomInterval = getRandomNumber(settings.minInterval, settings.maxInterval);
        setTimeout(performRandomClick, randomInterval);
    }

    // Function to click the "Thank you, Bybit" button
    function clickThankYouBybitButton() {
        const thankYouButton = document.querySelector('.bottom-sheet-button.button.button-primary.button-large');
        if (thankYouButton) {
            thankYouButton.click();
            console.log(`${logPrefix}'Thank you' button clicked.`, styles.success);
        }
    }

    // Start executing clicks with a 5-second delay
    setTimeout(() => {
        console.log(`${logPrefix}Script starting after 5 seconds delay...`, styles.starting);
        clickThankYouBybitButton();
        performRandomClick();
    }, 5000); // 5-second delay
})();
