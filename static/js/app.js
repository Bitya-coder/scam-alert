const analyzeButton = document.querySelector("#analyzeButton");
const messageInput = document.querySelector("#messageInput");
const result = document.querySelector("#result");
const imageInput = document.querySelector("#imageInput");
const linkInput = document.querySelector("#linkInput");

// ---------------- LANGUAGE SETTINGS ----------------

const translations = {
    en: {
        tagline: "Your digital safety matters.",
        heading: "Check suspicious content",
        messagePlaceholder: "Paste a suspicious message here",
        linkPlaceholder: "Paste a suspicious link here",
        imageLabel: "Or upload a screenshot:",
        analyze: "Analyze",

        highRisk: "HIGH RISK",
        uncertain: "UNCERTAIN - More verification is needed.",
        lowRisk: "LOW RISK",

        highRiskMessage: "This content contains multiple warning signs and may be a scam.",
        uncertainMessage: "Some warning signs were found. More verification is needed.",
        lowRiskMessage: "No obvious warning signs were detected. However, this does not guarantee that the content is safe.",

        urlDetected: "URL pattern detected:",
        invalidURL: "The link format could not be recognized.",
        emptyInput: "Please enter a message or link first.",
        readingImage: "Reading screenshot... Please wait",
        noText: "No readable text found in this screenshot.",
        imageError: "Could not read the screenshot. Please try another image.",
        chatButton: "Ask ChatGPT for a Second Opinion"
    },

    am: {
        tagline: "የዲጂታል ደህንነትዎ ወሳኝ ነው።",
        heading: "አጠራጣሪ ይዘቶችን ይፈትሹ",
        messagePlaceholder: "አጠራጣሪ መልዕክት እዚህ ያስገቡ",
        linkPlaceholder: "አጠራጣሪ ሊንክ እዚህ ያስገቡ",
        imageLabel: "ወይም የስክሪንሾት ምስል ይጫኑ፦",
        analyze: "መርምር",

        highRisk: "ከፍተኛ የአደጋ ደረጃ",
        uncertain: "እርግጠኛ አይደለም - ተጨማሪ ማረጋገጫ ያስፈልጋል።",
        lowRisk: "ዝቅተኛ የአደጋ ደረጃ",

        highRiskMessage: "ይህ ይዘት በርካታ የማጭበርበር ምልክቶችን ይዟል።",
        uncertainMessage: "አንዳንድ የማጭበርበር ምልክቶች ተገኝተዋል። ተጨማሪ ማረጋገጫ ያስፈልጋል።",
        lowRiskMessage: "ግልጽ የአደጋ ምልክቶች አልተገኙም። ሆኖም ይህ ይዘቱ ደህንነቱ የተጠበቀ መሆኑን አያረጋግጥም።",

        urlDetected: "የሊንክ አጠራጣሪ ቅርጸት ተገኝቷል፦",
        invalidURL: "የሊንኩን ቅርጸት ማወቅ አልተቻለም።",
        emptyInput: "እባክዎ መጀመሪያ መልዕክት ወይም ሊንክ ያስገቡ።",
        readingImage: "ስክሪንሾቱ በመነበብ ላይ ነው... እባክዎ ይጠብቁ።",
        noText: "በዚህ ስክሪንሾት ውስጥ ሊነበብ የሚችል ጽሑፍ አልተገኘም።",
        imageError: "ስክሪንሾቱን ማንበብ አልተቻለም። እባክዎ ሌላ ምስል ይሞክሩ።",
        chatButton: "ሌላ አስተያየት ከChatGPT ያግኙ"
    }
};

const languageSelect = document.getElementById("languageSelect");

function getWords() {
    return translations[languageSelect.value] || translations.en;
}

function changeLanguage(language) {
    const words = translations[language] || translations.en;

    document.querySelectorAll("[data-translate]").forEach(element => {
        const key = element.dataset.translate;
        if (words[key]) {
            element.textContent = words[key];
        }
    });

    document.querySelectorAll("[data-placeholder]").forEach(element => {
        const key = element.dataset.placeholder;
        if (words[key]) {
            element.placeholder = words[key];
        }
    });

    document.documentElement.lang = language;
}

languageSelect.addEventListener("change", function () {
    changeLanguage(this.value);
});

// ---------------- WARNING TRANSLATIONS ----------------

const warningTranslations = {
    en: {
        "Urgent or threatening language": "Urgent or threatening language",
        "Requests for private information": "Requests for private information",
        "Unexpected prizes or rewards": "Unexpected prizes or rewards",
        "Pressure to click a link": "Pressure to click a link"
    },

    am: {
        "Urgent or threatening language": "አስቸኳይ ወይም አስፈራሪ ቋንቋ",
        "Requests for private information": "የግል መረጃ ጥያቄ",
        "Unexpected prizes or rewards": "ያልተጠበቁ ሽልማቶች ወይም ስጦታዎች",
        "Pressure to click a link": "ሊንክ እንዲጫኑ ግፊት ማድረግ"
    }
};

// ---------------- MAIN SCAM DETECTION ----------------
 function analyzeMessage(message) {
    const link = linkInput.value.trim();
    const lowerMessage = (message + " " + link).toLowerCase();

    const language = languageSelect.value;
    const words = getWords();

    // Suspicious URL patterns
    const suspiciousLinkSigns = [
        "http://",
        "@",
        "bit.ly",
        "tinyurl.com"
    ];

    const foundLinkSigns = suspiciousLinkSigns.filter(sign =>
        link.toLowerCase().includes(sign)
    );

    // Check whether the URL format is valid
    let validURL = true;

    if (link !== "") {
        try {
            const parsedURL = new URL(link);

            if (
                parsedURL.protocol !== "http:" &&
                parsedURL.protocol !== "https:"
            ) {
                validURL = false;
            }
        } catch {
            validURL = false;
        }
    }

    // Warning categories
    const warningSigns = [
        {
            name: "Urgent or threatening language",
            words: [
                "urgent",
                "immediately",
                "account will be blocked",
                "act now",
                "አስቸኳይ",
                "ወዲያውኑ",
                "ሊዘጋ ነው",
                "እንዳይታገድ",
                "አሁኑኑ"
            ]
        },
        {
            name: "Requests for private information",
            words: [
                "password",
                "otp",
                "pin",
                "bank details",
                "verification code",
                "የይለፍ ቃል",
                "የባንክ መረጃ",
                "የግል መረጃ",
                "የማረጋገጫ ኮድ",
                "ፒን",
                "ኦቲፒ"
            ]
        },
        {
            name: "Unexpected prizes or rewards",
            words: [
                "you have won",
                "you won",
                "claim your prize",
                "free money",
                "lottery winner",
                "አሸንፈዋል",
                "ሽልማትዎን ይውሰዱ",
                "ነፃ ገንዘብ",
                "የሎተሪ አሸናፊ",
                "ሽልማት አግኝተዋል"
            ]
        },
        {
            name: "Pressure to click a link",
            words: [
                "click here",
                "clicking here",
                "verify your account",
                "open this link",
                "ይህን ሊንክ ይጫኑ",
                "ሊንኩን ይክፈቱ",
                "እዚህ ይጫኑ",
                "ሂሳብዎን ያረጋግጡ",
                "ይህን ሊንክ ይክፈቱ"
            ]
        }
    ];

    let foundSigns = [];

    warningSigns.forEach(sign => {
        if (sign.words.some(word => lowerMessage.includes(word))) {
            foundSigns.push(sign.name);
        }
    });

    // Translate detected warning categories
    let translatedSigns = foundSigns.map(sign =>
        warningTranslations[language]?.[sign] || sign
    );

    // Add URL warning details
    const linkDetails = foundLinkSigns.map(sign =>
        words.urlDetected + " " + sign
    );

    // Invalid URL format is displayed as information.
    // It is NOT counted as an additional warning if another
    // URL warning has already been detected.
    if (!validURL) {
        linkDetails.push(words.invalidURL);
    }

    // Count URL warnings without double-counting an invalid URL.
    const linkRiskCount = Math.max(
        foundLinkSigns.length,
        !validURL && link !== "" ? 1 : 0
    );

    const totalWarnings = foundSigns.length + linkRiskCount;

    const allDetails = [...translatedSigns, ...linkDetails];

    // Display risk result
    if (totalWarnings >= 2) {
        result.className = "result high-risk";
        result.textContent =
            words.highRisk + "\n" +
            words.highRiskMessage + "\n\n" +
            allDetails.join("\n");

    } else if (totalWarnings === 1) {
        result.className = "result uncertain";
        result.textContent =
            words.uncertain + "\n" +
            words.uncertainMessage + "\n\n" +
            allDetails.join("\n");
 } else {
        result.className = "result low-risk";
        result.textContent =
            words.lowRisk + "\n" +
            words.lowRiskMessage;
    }

    // Add ChatGPT second-opinion button
    addChatGPTButton(message, link);
}

// ---------------- CHATGPT SECOND OPINION ----------------

function addChatGPTButton(message, link) {
    const chatButton = document.createElement("button");

    chatButton.textContent = getWords().chatButton;

    chatButton.addEventListener("click", function () {
        const prompt =
            "I am using Scam Alert and would like a second opinion on this potentially suspicious content.\n\n" +
            "Message: " + (message || "None provided") +
            "\nLink: " + (link || "None provided") +
            "\n\nPlease examine possible phishing indicators, impersonation, suspicious requests, and warning signs. Explain your findings in simple language. Do not assume a link is safe just because it looks legitimate.";

        const chatGPTURL =
            "https://chatgpt.com/?q=" + encodeURIComponent(prompt);

        window.open(chatGPTURL, "_blank", "noopener,noreferrer");
    });

    result.appendChild(document.createElement("br"));
    result.appendChild(document.createElement("br"));
    result.appendChild(chatButton);
}

// ---------------- ANALYZE MESSAGES AND LINKS ----------------

analyzeButton.addEventListener("click", function () {
    const message = messageInput.value.trim();
    const link = linkInput.value.trim();

    if (message === "" && link === "") {
        result.className = "result";
        result.textContent = getWords().emptyInput;
        return;
    }

    analyzeMessage(message);
});

// ---------------- SCREENSHOT OCR ----------------

imageInput.addEventListener("change", async function () {
    const image = imageInput.files[0];

    if (!image) {
        return;
    }

    result.className = "result";
    result.textContent = getWords().readingImage;

    try {
        const worker = await Tesseract.createWorker("eng+amh");

        const { data: { text } } = await worker.recognize(image);

        await worker.terminate();

        if (text.trim() === "") {
            result.textContent = getWords().noText;
        } else {
            messageInput.value = text.trim();
            analyzeMessage(text.trim());
        }

    } catch (error) {
        result.textContent = getWords().imageError;
        console.error(error);
    }
});

messageInput.placeholder = getWords().messagePlaceholder;