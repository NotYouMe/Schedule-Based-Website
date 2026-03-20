// 1. DATABASE CONFIGURATION
const sb = supabase.createClient('https://iygjtjckumirkxgohjdj.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5Z2p0amNrdW1pcmt4Z29oamRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyMDgyOTIsImV4cCI6MjA4Nzc4NDI5Mn0.dXRJ2TvfP3WQr_jcO_MprRiy64lETcqS6gF2f4e0Pqs');

document.addEventListener('DOMContentLoaded', () => {
    console.log("🚀 MINDSPILL: System Booted. Watching for clicks...");

    // 2. ELEMENT SELECTORS
    const authNavBtn = document.getElementById('auth-nav-btn');
    const authPage   = document.getElementById('auth-page');
    const signupBtn  = document.getElementById('signup-btn');
    const loginBtn   = document.getElementById('login-btn');
    const closeAuth  = document.getElementById('close-auth');
    const themeBtn   = document.getElementById('theme-toggle');
    const addBtn     = document.getElementById('add-btn');

    // 3. THEME TOGGLE LOGIC
    if (themeBtn) {
        themeBtn.onclick = () => {
            console.log("🖱️ CLICK: Theme Toggle");
            const current = document.documentElement.getAttribute('data-theme');
            const next = current === 'light' ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', next);
        };
    }

    // 4. AUTH NAVIGATION
    if (authNavBtn) {
        authNavBtn.onclick = () => {
            console.log("🖱️ CLICK: Account Nav Button");
            authPage.classList.remove('hidden');
            authPage.style.display = 'flex';
        };
    }

    if (closeAuth) {
        closeAuth.onclick = () => {
            console.log("🖱️ CLICK: Close Auth Overlay");
            authPage.classList.add('hidden');
            authPage.style.display = 'none';
        };
    }

    // 5. CREATE ACCOUNT (SUPABASE)
    if (signupBtn) {
        signupBtn.onclick = async () => {
            console.log("🖱️ CLICK: Signup Button");
            const email = document.getElementById('auth-email').value;
            const password = document.getElementById('auth-password').value;

            console.log(`📡 Sending: Signup for ${email}`);
            const { data, error } = await sb.auth.signUp({ email, password });

            if (error) {
                console.error("❌ ERROR:", error.message);
                alert("Error: " + error.message);
            } else {
                console.log("🎉 SUCCESS: Account created!", data);
                alert("Success! Check your email or try logging in.");
            }
        };
    }

    // 6. LOGIN (SUPABASE)
    if (loginBtn) {
        loginBtn.onclick = async () => {
            console.log("🖱️ CLICK: Login Button");
            const email = document.getElementById('auth-email').value;
            const password = document.getElementById('auth-password').value;

            console.log(`📡 Sending: Login for ${email}`);
            const { data, error } = await sb.auth.signInWithPassword({ email, password });

            if (error) {
                console.error("❌ ERROR:", error.message);
                alert("Error: " + error.message);
            } else {
                console.log("🔓 SUCCESS: Logged in.", data);
                location.reload();
            }
        };
    }

    // 7. TASK ADDITION
    if (addBtn) {
        addBtn.onclick = () => {
            console.log("🖱️ CLICK: Add Task Button");
            // Add your saving logic here
        };
    }

    // 8. CLOCK VISUALS
    drawNumbers();
    setInterval(tick, 1000);
});

// 9. CLOCK FUNCTIONS (Placed outside listener to keep it clean)
function drawNumbers() {
    const numberGroup = document.getElementById('clock-numbers');
    if (!numberGroup) return;
    numberGroup.innerHTML = '';
    for (let i = 1; i <= 24; i++) {
        const angle = (i / 24) * (2 * Math.PI) - (Math.PI / 2);
        const x = 50 + 38 * Math.cos(angle);
        const y = 50 + 38 * Math.sin(angle);
        const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttribute("x", x);
        text.setAttribute("y", y);
        text.setAttribute("class", "clock-labels");
        text.textContent = i;
        numberGroup.appendChild(text);
    }
}

function tick() {
    const readout = document.getElementById('digital-readout');
    const hand = document.getElementById('hour-hand');
    if (!readout || !hand) return;

    const now = new Date();
    readout.textContent = now.toLocaleTimeString();

    const totalMinutes = (now.getHours() * 60) + now.getMinutes();
    const degrees = (totalMinutes / 1440) * 360;
    hand.setAttribute('transform', `rotate(${degrees}, 50, 50)`);
}
