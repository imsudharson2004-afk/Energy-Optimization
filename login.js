/* =========================================================
   ENERSIGHT AI LOGIN ENGINE
   ========================================================= */

// Use relative API path so it works in both local development and deployed cloud container
const API_URL = "";


/* =========================================================
   ELEMENTS
   ========================================================= */

const loginForm = document.getElementById("loginForm");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const loginButton = document.getElementById("loginButton");
const buttonText = document.getElementById("buttonText");
const buttonIcon = document.getElementById("buttonIcon");
const loadingSpinner = document.getElementById("loadingSpinner");
const loginMessage = document.getElementById("loginMessage");
const togglePassword = document.getElementById("togglePassword");
const fillDemo = document.getElementById("fillDemo");

const forgotPasswordBtn = document.getElementById("forgotPasswordBtn");
const forgotModal = document.getElementById("forgotModal");
const closeForgot = document.getElementById("closeForgot");
const forgotForm = document.getElementById("forgotForm");
const forgotUsername = document.getElementById("forgotUsername");
const forgotMessage = document.getElementById("forgotMessage");
const resetButton = document.getElementById("resetButton");


/* =========================================================
   UTILITY
   ========================================================= */

function showLoginMessage(message, type = "error") {
    if (!loginMessage) return;
    loginMessage.textContent = message;
    loginMessage.className = "login-message " + type;
}

function clearLoginMessage() {
    if (!loginMessage) return;
    loginMessage.textContent = "";
    loginMessage.className = "login-message";
}

function setLoading(isLoading) {
    if (!loginButton) return;
    if (isLoading) {
        loginButton.classList.add("loading");
        loginButton.disabled = true;
    } else {
        loginButton.classList.remove("loading");
        loginButton.disabled = false;
    }
}


/* =========================================================
   CHECK EXISTING LOGIN
   ========================================================= */

async function checkExistingSession() {
    try {
        const response = await fetch(`${API_URL}/api/me`, {
            credentials: "include"
        });

        if (!response.ok) {
            return;
        }

        const data = await response.json();

        if (data && data.authenticated) {
            window.location.href = "index.html";
        }
    } catch (error) {
        console.log("Checking session: server waiting for connection.");
    }
}


/* =========================================================
   PASSWORD VISIBILITY
   ========================================================= */

if (togglePassword && passwordInput) {
    togglePassword.addEventListener("click", () => {
        const isPassword = passwordInput.type === "password";
        passwordInput.type = isPassword ? "text" : "password";

        togglePassword.innerHTML = isPassword
            ? '<i class="fa-solid fa-eye-slash"></i>'
            : '<i class="fa-solid fa-eye"></i>';

        togglePassword.setAttribute(
            "aria-label",
            isPassword ? "Hide password" : "Show password"
        );
    });
}


/* =========================================================
   INPUT ANIMATION
   ========================================================= */

[usernameInput, passwordInput].forEach(input => {
    if (!input) return;

    input.addEventListener("input", () => {
        clearLoginMessage();

        if (input.value.trim() !== "") {
            input.parentElement.classList.add("has-value");
        } else {
            input.parentElement.classList.remove("has-value");
        }
    });
});


/* =========================================================
   DEMO ACCOUNT
   ========================================================= */

if (fillDemo && usernameInput && passwordInput) {
    fillDemo.addEventListener("click", () => {
        usernameInput.value = "admin";
        passwordInput.value = "admin123";

        usernameInput.parentElement.classList.add("has-value");
        passwordInput.parentElement.classList.add("has-value");

        clearLoginMessage();

        if (loginButton) {
            loginButton.animate(
                [
                    { transform: "scale(1)" },
                    { transform: "scale(1.02)" },
                    { transform: "scale(1)" }
                ],
                { duration: 350 }
            );
        }
    });
}


/* =========================================================
   LOGIN
   ========================================================= */

if (loginForm) {
    loginForm.addEventListener("submit", async event => {
        event.preventDefault();
        clearLoginMessage();

        const username = usernameInput ? usernameInput.value.trim() : "";
        const password = passwordInput ? passwordInput.value : "";

        if (!username || !password) {
            showLoginMessage("Please enter your username and password.");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/api/login`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    username,
                    password
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Invalid username or password.");
            }

            // Login successful
            if (buttonText) buttonText.textContent = "Access Granted";
            if (buttonIcon) buttonIcon.className = "fa-solid fa-check";

            showLoginMessage("Authentication successful. Opening dashboard...", "success");

            setTimeout(() => {
                window.location.href = "index.html";
            }, 600);

        } catch (error) {
            console.error("Login error:", error);

            if (
                error instanceof TypeError ||
                (error.message && error.message.includes("Failed to fetch"))
            ) {
                showLoginMessage("Backend server is starting up or offline. Please wait a moment.");
            } else {
                showLoginMessage(error.message || "Authentication error.");
            }

            setLoading(false);
        }
    });
}


/* =========================================================
   FORGOT PASSWORD MODAL
   ========================================================= */

if (forgotPasswordBtn && forgotModal) {
    forgotPasswordBtn.addEventListener("click", () => {
        forgotModal.classList.add("active");
        if (forgotUsername) forgotUsername.focus();
    });
}

function closeForgotModal() {
    if (!forgotModal) return;
    forgotModal.classList.remove("active");
    if (forgotMessage) {
        forgotMessage.textContent = "";
        forgotMessage.className = "forgot-message";
    }
}

if (closeForgot) {
    closeForgot.addEventListener("click", closeForgotModal);
}

if (forgotModal) {
    forgotModal.addEventListener("click", event => {
        if (event.target === forgotModal) {
            closeForgotModal();
        }
    });
}

document.addEventListener("keydown", event => {
    if (event.key === "Escape" && forgotModal && forgotModal.classList.contains("active")) {
        closeForgotModal();
    }
});


/* =========================================================
   FORGOT PASSWORD REQUEST
   ========================================================= */

if (forgotForm) {
    forgotForm.addEventListener("submit", async event => {
        event.preventDefault();

        const username = forgotUsername ? forgotUsername.value.trim() : "";

        if (!username) {
            if (forgotMessage) {
                forgotMessage.textContent = "Please enter your username.";
                forgotMessage.className = "forgot-message error";
            }
            return;
        }

        if (resetButton) {
            resetButton.disabled = true;
            resetButton.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Processing...';
        }

        try {
            const response = await fetch(`${API_URL}/api/forgot-password`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ username })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Unable to process request.");
            }

            if (forgotMessage) {
                forgotMessage.textContent = data.message || "Recovery link sent for administrator approval.";
                forgotMessage.className = "forgot-message success";
            }

            if (resetButton) {
                resetButton.innerHTML = '<i class="fa-solid fa-check"></i> Request Sent';
            }

        } catch (error) {
            console.error("Forgot password error:", error);

            if (forgotMessage) {
                if (
                    error instanceof TypeError ||
                    (error.message && error.message.includes("Failed to fetch"))
                ) {
                    forgotMessage.textContent = "Backend server is offline.";
                } else {
                    forgotMessage.textContent = error.message;
                }
                forgotMessage.className = "forgot-message error";
            }

            if (resetButton) {
                resetButton.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Request Reset';
            }

        } finally {
            setTimeout(() => {
                if (resetButton) resetButton.disabled = false;
            }, 1200);
        }
    });
}


/* =========================================================
   ENTER KEY SHORTCUT
   ========================================================= */

document.addEventListener("keydown", event => {
    if (event.key === "Enter" && document.activeElement === usernameInput && passwordInput) {
        passwordInput.focus();
    }
});


/* =========================================================
   INITIAL CHECK
   ========================================================= */

checkExistingSession();

console.log(
    "%c EnerSight AI ",
    "background:#35e0a1;color:#03110c;padding:6px 10px;border-radius:5px;font-weight:bold;"
);
console.log("Campus Energy Intelligence System initialized.");
