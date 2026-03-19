// Initialize Supabase (Use your own keys here)
const supabaseUrl = 'https://iygjtjckumirkxgohjdj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5Z2p0amNrdW1pcmt4Z29oamRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyMDgyOTIsImV4cCI6MjA4Nzc4NDI5Mn0.dXRJ2TvfP3WQr_jcO_MprRiy64lETcqS6gF2f4e0Pqs';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

let state = {
    thoughts: JSON.parse(localStorage.getItem('mindspill_data')) || [],
    isLoggedIn: false
};

// --- AUTH LOGIC ---
const authNavBtn = document.getElementById('auth-nav-btn');
const authPage = document.getElementById('auth-page');

authNavBtn.onclick = () => {
    if (state.isLoggedIn) {
        supabase.auth.signOut().then(() => location.reload());
    } else {
        authPage.classList.remove('hidden');
    }
};

document.getElementById('close-auth').onclick = () => authPage.classList.add('hidden');

supabase.auth.onAuthStateChange(async (event, session) => {
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
        const { data: { user } } = await supabase.auth.getUser();
        await supabase.from('thoughts').insert([{ task, time, user_id: user.id }]);
        fetchCloudData();
    } else {
        state.thoughts.push(newThought);
        saveLocal();
        renderUI();
    }
    document.getElementById('thought-task').value = '';
};

async function fetchCloudData() {
    const { data } = await supabase.from('thoughts').select('*').order('time');
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

// --- CLOCK & ALARM ENGINE ---
function tick() {
    const now = new Date();
    document.getElementById('digital-readout').textContent = now.toLocaleTimeString();

    // Hand rotation
    const rot = ((now.getHours() + now.getMinutes()/60) / 24) * 360;
    document.getElementById('hour-hand').setAttribute('transform', `rotate(${rot}, 50, 50)`);

    // Check Alarm
    const currentStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    state.thoughts.forEach(t => {
        if (t.time === currentStr && !t.triggered) {
            document.getElementById('alarm-sound').play();
            alert(`MINDPILL REMINDER: ${t.task}`);
            t.triggered = true;
        }
    });
}

// --- THEME ---
document.getElementById('theme-toggle').onclick = () => {
    const theme = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
};

setInterval(tick, 1000);
renderUI();
