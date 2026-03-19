// Initialize Supabase (Use your own keys here)
const supabaseUrl = 'https://iygjtjckumirkxgohjdj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5Z2p0amNrdW1pcmt4Z29oamRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyMDgyOTIsImV4cCI6MjA4Nzc4NDI5Mn0.dXRJ2TvfP3WQr_jcO_MprRiy64lETcqS6gF2f4e0Pqs';
const sb = supabase.createClient(supabaseUrl, supabaseKey);

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

document.addEventListener('DOMContentLoaded', () => {
    const authNavBtn = document.getElementById('auth-nav-btn');
    const authPage = document.getElementById('auth-page');
    const closeAuth = document.getElementById('close-auth');

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
