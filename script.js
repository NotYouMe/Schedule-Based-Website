// Initialize Supabase (Use your own keys here)
const supabaseUrl = 'https://iygjtjckumirkxgohjdj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5Z2p0amNrdW1pcmt4Z29oamRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyMDgyOTIsImV4cCI6MjA4Nzc4NDI5Mn0.dXRJ2TvfP3WQr_jcO_MprRiy64lETcqS6gF2f4e0Pqs';
const sb = supabase.createClient(supabaseUrl, supabaseKey);
// Checks to see if Supabase actually decided to load in today
document.addEventListener('DOMContentLoaded', () => {
    console.log("🚀 Mindspill: System fully initialized.");
    
let state = {
    thoughts: JSON.parse(localStorage.getItem('mindspill_data')) || [],
    isLoggedIn: false
};

// --- AUTH LOGIC ---
const authNavBtn = document.getElementById('auth-nav-btn');
const authPage = document.getElementById('auth-page');

authNavBtn.onclick = () => {
    if (state.isLoggedIn) {
        sb.auth.signOut().then(() => location.reload());
    } else {
        authPage.classList.remove('hidden');
    }
};

document.getElementById('close-auth').onclick = () => authPage.classList.add('hidden');

sb.auth.onAuthStateChange(async (event, session) => {
    state.isLoggedIn = !!session;
    if (session) {
        authNavBtn.textContent = "Logout";
        fetchCloudData();
    } else {
        renderUI(); // Render from local storage if no user
    }
});

// --- CORE FUNCTIONS ---
document.getElementById('add-btn').onclick = async () => {
    const task = document.getElementById('thought-task').value;
    const time = document.getElementById('thought-time').value;

    if (!task || !time) return alert("Please fill in both fields.");

    const newThought = { id: Date.now(), task, time, triggered: false };
    
    if (state.isLoggedIn) {
        const { data: { user } } = await sb.auth.getUser();
        await sb.from('thoughts').insert([{ task, time, user_id: user.id }]);
        fetchCloudData();
    } else {
        state.thoughts.push(newThought);
        saveLocal();
        renderUI();
    }
    document.getElementById('thought-task').value = '';
};

async function fetchCloudData() {
    const { data } = await sb.from('thoughts').select('*').order('time');
    state.thoughts = data || [];
    renderUI();
}

function saveLocal() {
    localStorage.setItem('mindspill_data', JSON.stringify(state.thoughts));
}

function renderUI() {
    const grid = document.getElementById('storage-grid');
    const slices = document.getElementById('clock-slices');
    grid.innerHTML = '';
    slices.innerHTML = '';

    state.thoughts.forEach(t => {
        // Render Box
        const box = document.createElement('div');
        box.className = 'thought-box';
        box.innerHTML = `<h3>${t.time}</h3><p>${t.task}</p>`;
        grid.appendChild(box);

        // Render Clock Slice (24-hour logic)
        const [h, m] = t.time.split(':');
        const rotation = ((parseInt(h) + parseInt(m)/60) / 24) * 360;
        const slice = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        slice.setAttribute("cx", "50");
        slice.setAttribute("cy", "50");
        slice.setAttribute("r", "22.5");
        slice.setAttribute("class", "time-slice");
        slice.setAttribute("transform", `rotate(${rotation} 50 50)`);
        slices.appendChild(slice);
    });
}

// Selectors
    const authNavBtn = document.getElementById('auth-nav-btn');
    const authPage = document.getElementById('auth-page');
    const signupBtn = document.getElementById('signup-btn');
    const loginBtn = document.getElementById('login-btn');
    const addBtn = document.getElementById('add-btn');
    const themeBtn = document.getElementById('theme-toggle');


    // TEST: Check if the button is even found by the script
    if (!authNavBtn) {
        console.error("Critical Error: 'auth-nav-btn' not found in HTML.");
        return;
    }

    // 1. Open the Login Overlay
    authNavBtn.addEventListener('click', () => {
        console.log("Account button clicked."); // Verify in F12 Console
        
        // If logged in, sign out. If logged out, show the login page.
        sb.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                sb.auth.signOut().then(() => location.reload());
            } else {
                authPage.classList.remove('hidden');
                // Ensure the overlay is visible over other elements
                authPage.style.display = 'flex'; 
            }
        });
    });

    // 2. Close the Login Overlay
    if (closeAuth) {
        closeAuth.onclick = () => {
            authPage.classList.add('hidden');
            authPage.style.display = 'none';
        };
    }
    
    // Initial Clock Setup
    drawNumbers();
    setInterval(tick, 1000);
    tick();
});

// --- Draw Clock Numbers ---
function drawNumbers() {
    const numberGroup = document.getElementById('clock-numbers');
    numberGroup.innerHTML = '';
    for (let i = 1; i <= 24; i++) {
        const angle = (i / 24) * (2 * Math.PI) - (Math.PI / 2);
        const x = 50 + 38 * Math.cos(angle); // 38 is the radius for text
        const y = 50 + 38 * Math.sin(angle);
        
        const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttribute("x", x);
        text.setAttribute("y", y);
        text.textContent = i;
        numberGroup.appendChild(text);
    }
}
// --- BETTER CLOCK & ALARM ENGINE ---
function tick() {
    const now = new Date();
    
    // 1. Digital Display
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    const s = String(now.getSeconds()).padStart(2, '0');
    document.getElementById('digital-readout').textContent = `${h}:${m}:${s}`;

    // 2. Analog Hand Rotation
    // We remove the -90deg rotation from the SVG CSS and handle it here for accuracy
    const totalMinutes = (now.getHours() * 60) + now.getMinutes();
    const degrees = (totalMinutes / 1440) * 360; // 1440 mins in 24 hours
    
    const hourHand = document.getElementById('hour-hand');
    // Origin is 50,50
    hourHand.setAttribute('transform', `rotate(${degrees}, 50, 50)`);

    // 3. Alarm Check
    const currentShortTime = `${h}:${m}`;
    state.thoughts.forEach(t => {
        if (t.time === currentShortTime && !t.triggered) {
            triggerAlarm(t);
        }
    });
}
function triggerAlarm(t) {
    t.triggered = true;
    const audio = document.getElementById('alarm-sound');
    audio.play().catch(e => console.log("Audio play blocked until user interaction."));
    alert(`MINDPILL: ${t.task}`);
}

// Initialization
drawNumbers();
setInterval(tick, 1000);
tick(); // Run once immediately

// --- THEME ---
document.getElementById('theme-toggle').onclick = () => {
    const theme = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
};

setInterval(tick, 1000);
renderUI();
// --- 2. AUTH OVERLAY NAVIGATION ---
    if (authNavBtn) {
        authNavBtn.onclick = () => {
            console.log("👤 Clicked: Account Navigation Button");
            authPage.classList.toggle('hidden');
            console.log("✅ Success: Auth Overlay toggled");
        };
    }
    // --- 3. CREATE ACCOUNT (SUPABASE) ---
    if (signupBtn) {
        signupBtn.onclick = async () => {
            console.log("📝 Clicked: Create Account Button");
            const email = document.getElementById('auth-email').value;
            const password = document.getElementById('auth-password').value;

            if (!email || !password) {
                console.warn("⚠️ Warning: Signup attempted with empty fields.");
                return alert("Please enter both email and password.");
            }

            const { data, error } = await sb.auth.signUp({ email, password });

            if (error) {
                console.error("❌ Error: Signup failed:", error.message);
                alert(error.message);
            } else {
                console.log("🎉 Success: Account created for", email);
                alert("Account created! Check your email for the verification link.");
            }
        };
    }

    // --- 4. LOGIN (SUPABASE) ---
    if (loginBtn) {
        loginBtn.onclick = async () => {
            console.log("🔑 Clicked: Login Button");
            const email = document.getElementById('auth-email').value;
            const password = document.getElementById('auth-password').value;

            const { data, error } = await sb.auth.signInWithPassword({ email, password });

            if (error) {
                console.error("❌ Error: Login failed:", error.message);
                alert(error.message);
            } else {
                console.log("🔓 Success: User session started.");
                location.reload(); // Refresh to sync data
            }
        };
    }

    // --- 5. ADD TASK ---
    if (addBtn) {
        addBtn.onclick = () => {
            console.log("📥 Clicked: Add Thought Button");
            const task = document.getElementById('thought-task').value;
            const time = document.getElementById('thought-time').value;
            
            if (task && time) {
                console.log(`✅ Success: Task "${task}" scheduled for ${time}`);
                // [Your saving logic here]
                renderUI();
            } else {
                console.warn("⚠️ Warning: Task added without content or time.");
            }
        };
    }

    // --- PREVENTING LINE 70 ERROR ---
    function renderUI() {
        const grid = document.getElementById('storage-grid');
        const slices = document.getElementById('clock-slices');

        // Check if elements exist before touching them
        if (!grid || !slices) {
            console.error("❌ UI Error: Storage grid or clock slices missing from HTML.");
            return;
        }

        grid.innerHTML = '';
        slices.innerHTML = '';
        console.log("🔄 UI: Timetable and Clock refreshed.");
    }

