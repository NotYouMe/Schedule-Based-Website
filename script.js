const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// --- State Management ---
let myThoughts = [];

// --- Auth Handling ---
const authTrigger = document.getElementById('auth-trigger');
const authSection = document.getElementById('auth-section');

authTrigger.addEventListener('click', () => {
    const user = supabase.auth.getUser();
    if(authTrigger.textContent === 'Logout') {
        supabase.auth.signOut();
    } else {
        authSection.classList.remove('hidden');
    }
});

document.getElementById('close-auth').onclick = () => authSection.classList.add('hidden');

supabase.auth.onAuthStateChange((event, session) => {
    if (session) {
        authSection.classList.add('hidden');
        authTrigger.textContent = 'Logout';
        fetchThoughts();
    } else {
        authTrigger.textContent = 'Account';
        document.getElementById('storage-grid').innerHTML = '';
    }
});

// --- Theme Toggle ---
document.getElementById('theme-toggle').onclick = () => {
    const theme = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
};

// --- Database Operations ---
async function fetchThoughts() {
    const { data } = await supabase.from('thoughts').select('*');
    myThoughts = data || [];
    renderUI();
}

document.getElementById('add-thought').onclick = async () => {
    const task = document.getElementById('thought-input').value;
    const time = document.getElementById('time-input').value;
    if(!task || !time) return;

    await supabase.from('thoughts').insert([{ task, assigned_time: time }]);
    fetchThoughts();
};

// --- Clock & Alarm Engine ---
function updateClock() {
    const now = new Date();
    const h = now.getHours();
    const m = now.getMinutes();
    const s = now.getSeconds();

    // Rotate Hand (360 degrees / 24 hours)
    const deg = ((h + m/60) / 24) * 360;
    document.getElementById('hour-hand').setAttribute('transform', `rotate(${deg}, 50, 50)`);
    document.getElementById('digital-time').textContent = now.toLocaleTimeString();

    // Check Alarms
    const currentTimeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    myThoughts.forEach(t => {
        if(t.assigned_time.startsWith(currentTimeStr) && !t.alerted) {
            triggerAlarm(t);
        }
    });
}

function triggerAlarm(thought) {
    document.getElementById('alarm-tone').play();
    alert(`Reminder: ${thought.task}`);
    thought.alerted = true; // Local flag to prevent repeat alerts
}

function renderUI() {
    const grid = document.getElementById('storage-grid');
    const partitions = document.getElementById('clock-partitions');
    grid.innerHTML = '';
    partitions.innerHTML = '';

    myThoughts.forEach(t => {
        // Create Box
        const box = document.createElement('div');
        box.className = 'thought-box';
        box.innerHTML = `<strong>${t.assigned_time}</strong><br>${t.task}`;
        grid.appendChild(box);

        // Create Clock Partition
        const [hours, minutes] = t.assigned_time.split(':');
        const rotation = ((parseInt(hours) + parseInt(minutes)/60) / 24) * 360;
        
        const line = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        line.setAttribute("cx", "50");
        line.setAttribute("cy", "50");
        line.setAttribute("r", "22.5");
        line.setAttribute("class", "partition");
        line.setAttribute("transform", `rotate(${rotation} 50 50)`);
        partitions.appendChild(line);
    });
}

setInterval(updateClock, 1000);
