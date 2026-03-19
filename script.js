:root {
    --primary: #1a365d; /* Deep Navy */
    --accent: #2b6cb0;
    --bg: #f7fafc;
    --surface: #ffffff;
    --text: #2d3748;
    --border: #e2e8f0;
    --shadow: 0 4px 6px rgba(0,0,0,0.05);
}

[data-theme="dark"] {
    --bg: #1a202c;
    --surface: #2d3748;
    --text: #f7fafc;
    --border: #4a5568;
    --primary: #63b3ed;
}

body {
    margin: 0;
    font-family: 'Inter', -apple-system, sans-serif;
    background-color: var(--bg);
    color: var(--text);
    transition: background 0.3s ease;
}

/* Nav Bar */
.top-nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.25rem 5%;
    background: var(--surface);
    border-bottom: 2px solid var(--border);
    box-shadow: var(--shadow);
}

.brand { font-weight: 800; font-size: 1.4rem; letter-spacing: 2px; color: var(--primary); }

.auth-trigger {
    background: var(--primary);
    color: #fff;
    border: none;
    padding: 0.6rem 1.2rem;
    border-radius: 4px;
    font-weight: 600;
    cursor: pointer;
}

/* Auth Page Overlay */
.page-overlay {
    position: fixed;
    inset: 0;
    background: var(--bg);
    z-index: 1000;
    display: flex;
    justify-content: center;
    align-items: center;
}

.auth-modal {
    background: var(--surface);
    padding: 3rem;
    border-radius: 8px;
    width: 90%;
    max-width: 400px;
    box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);
    position: relative;
    border: 1px solid var(--border);
}

.hidden { display: none !important; }

/* Dashboard Components */
.content-wrapper { max-width: 1100px; margin: 0 auto; padding: 2rem; }

.input-panel {
    display: flex;
    gap: 1rem;
    background: var(--surface);
    padding: 1.5rem;
    border-radius: 8px;
    border: 1px solid var(--border);
    margin-bottom: 2rem;
}

input {
    padding: 0.8rem;
    border: 1px solid var(--border);
    border-radius: 4px;
    background: var(--bg);
    color: var(--text);
    font-size: 1rem;
    flex: 1;
}

.thought-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1.5rem;
    margin-bottom: 3rem;
}

.thought-box {
    background: var(--surface);
    padding: 1.5rem;
    border-radius: 4px;
    border-left: 5px solid var(--primary);
    box-shadow: var(--shadow);
}

/* Clock Visualization */
.chrono-visualizer { text-align: center; margin-top: 2rem; }
.clock-container { position: relative; width: 320px; height: 320px; margin: 0 auto; }

#visual-clock { transform: rotate(-90deg); }
.clock-rim { fill: var(--border); }
.clock-face { fill: var(--surface); }

.time-slice {
    fill: none;
    stroke: var(--primary);
    stroke-width: 45;
    stroke-dasharray: 1.5 282.7;
    stroke-linecap: round;
}

#hour-hand { stroke: var(--primary); stroke-width: 2.5; stroke-linecap: round; }

#digital-readout {
    position: absolute;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    font-size: 1.6rem;
    font-weight: 700;
}
