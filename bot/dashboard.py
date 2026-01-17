"""
Simple Flask Dashboard for Content Bot Management
"""
import os
import json
from datetime import datetime
from flask import Flask, jsonify, render_template_string
from bot.main import run_daily_workflow, get_bot_status
from bot.ideas_generator import get_daily_idea, load_ideas
from bot.config import OUTPUT_DIR, LOGS_DIR

app = Flask(__name__)

DASHBOARD_HTML = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Content Bot Dashboard</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #0f0f23;
            color: #e0e0e0;
            min-height: 100vh;
            padding: 20px;
        }
        .container { max-width: 1200px; margin: 0 auto; }
        h1 { color: #8b5cf6; margin-bottom: 30px; font-size: 2rem; }
        h2 { color: #a78bfa; margin: 20px 0 15px; font-size: 1.25rem; }
        .card {
            background: #1a1a2e;
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 20px;
            border: 1px solid #2a2a4a;
        }
        .status-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
        }
        .status-item {
            background: #252540;
            padding: 15px;
            border-radius: 8px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .status-item span:first-child { font-weight: 500; }
        .badge {
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.85rem;
            font-weight: 500;
        }
        .badge-success { background: #22c55e20; color: #22c55e; }
        .badge-warning { background: #f59e0b20; color: #f59e0b; }
        .badge-error { background: #ef444420; color: #ef4444; }
        .btn {
            background: #8b5cf6;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 1rem;
            font-weight: 500;
            transition: background 0.2s;
        }
        .btn:hover { background: #7c3aed; }
        .btn:disabled { background: #4a4a6a; cursor: not-allowed; }
        .btn-secondary { background: #374151; }
        .btn-secondary:hover { background: #4b5563; }
        .idea-card {
            background: #252540;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 15px;
        }
        .idea-title { color: #a78bfa; font-size: 1.1rem; margin-bottom: 8px; }
        .idea-desc { color: #9ca3af; line-height: 1.5; }
        .idea-category { 
            display: inline-block;
            background: #8b5cf620;
            color: #a78bfa;
            padding: 4px 10px;
            border-radius: 4px;
            font-size: 0.8rem;
            margin-top: 10px;
        }
        .log-entry {
            background: #0d0d1a;
            padding: 10px 15px;
            border-radius: 6px;
            margin-bottom: 8px;
            font-family: monospace;
            font-size: 0.9rem;
            overflow-x: auto;
        }
        .actions { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 20px; }
        #result { margin-top: 20px; padding: 15px; background: #252540; border-radius: 8px; display: none; }
        .loading { opacity: 0.6; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Content Bot Dashboard</h1>
        
        <div class="card">
            <h2>Configuration Status</h2>
            <div class="status-grid" id="status-grid">
                <div class="status-item"><span>Loading...</span></div>
            </div>
        </div>
        
        <div class="card">
            <h2>Quick Actions</h2>
            <div class="actions">
                <button class="btn" onclick="runWorkflow()">Run Workflow Now</button>
                <button class="btn btn-secondary" onclick="previewIdea()">Preview Next Idea</button>
                <button class="btn btn-secondary" onclick="refreshStatus()">Refresh Status</button>
            </div>
            <div id="result"></div>
        </div>
        
        <div class="card">
            <h2>Recent Ideas</h2>
            <div id="ideas-list">
                <p style="color: #6b7280;">Loading ideas...</p>
            </div>
        </div>
        
        <div class="card">
            <h2>Recent Runs</h2>
            <div id="recent-runs">
                <p style="color: #6b7280;">Loading recent runs...</p>
            </div>
        </div>
    </div>
    
    <script>
        async function fetchJSON(url) {
            const res = await fetch(url);
            return res.json();
        }
        
        function renderStatus(data) {
            const grid = document.getElementById('status-grid');
            const items = Object.entries(data.configured).map(([key, value]) => {
                const label = key.replace('_', ' ').replace(/\\b\\w/g, l => l.toUpperCase());
                const badge = value 
                    ? '<span class="badge badge-success">Configured</span>'
                    : '<span class="badge badge-warning">Not Set</span>';
                return `<div class="status-item"><span>${label}</span>${badge}</div>`;
            }).join('');
            grid.innerHTML = items;
        }
        
        function renderIdeas(data) {
            const list = document.getElementById('ideas-list');
            if (!data.ideas || data.ideas.length === 0) {
                list.innerHTML = '<p style="color: #6b7280;">No ideas found.</p>';
                return;
            }
            const html = data.ideas.slice(0, 5).map(idea => `
                <div class="idea-card">
                    <div class="idea-title">${idea.title}</div>
                    <div class="idea-desc">${idea.description}</div>
                    <span class="idea-category">${idea.category || 'General'}</span>
                </div>
            `).join('');
            list.innerHTML = html;
        }
        
        function renderRuns(data) {
            const list = document.getElementById('recent-runs');
            if (!data.runs || data.runs.length === 0) {
                list.innerHTML = '<p style="color: #6b7280;">No runs yet.</p>';
                return;
            }
            const html = data.runs.map(run => {
                const status = run.success 
                    ? '<span class="badge badge-success">Success</span>'
                    : '<span class="badge badge-error">Failed</span>';
                return `
                    <div class="log-entry">
                        ${run.timestamp} - ${run.idea?.title || 'Unknown'} ${status}
                    </div>
                `;
            }).join('');
            list.innerHTML = html;
        }
        
        async function refreshStatus() {
            const data = await fetchJSON('/api/status');
            renderStatus(data);
        }
        
        async function loadIdeas() {
            const data = await fetchJSON('/api/ideas');
            renderIdeas(data);
        }
        
        async function loadRuns() {
            const data = await fetchJSON('/api/runs');
            renderRuns(data);
        }
        
        async function previewIdea() {
            const result = document.getElementById('result');
            result.style.display = 'block';
            result.innerHTML = '<p class="loading">Generating preview...</p>';
            
            const data = await fetchJSON('/api/preview-idea');
            result.innerHTML = `
                <h3 style="color: #a78bfa; margin-bottom: 10px;">${data.title}</h3>
                <p style="margin-bottom: 10px;">${data.description}</p>
                <span class="idea-category">${data.category || 'General'}</span>
            `;
        }
        
        async function runWorkflow() {
            const result = document.getElementById('result');
            result.style.display = 'block';
            result.innerHTML = '<p class="loading">Running workflow... This may take a few minutes.</p>';
            
            try {
                const data = await fetchJSON('/api/run');
                if (data.success) {
                    result.innerHTML = `
                        <p style="color: #22c55e;">Workflow completed successfully!</p>
                        <p>Idea: ${data.idea?.title || 'Unknown'}</p>
                        <p>Media: ${data.media_path || 'None'}</p>
                    `;
                } else {
                    result.innerHTML = `
                        <p style="color: #ef4444;">Workflow failed</p>
                        <p>Errors: ${data.errors?.join(', ') || 'Unknown error'}</p>
                    `;
                }
                loadRuns();
            } catch (e) {
                result.innerHTML = `<p style="color: #ef4444;">Error: ${e.message}</p>`;
            }
        }
        
        // Initial load
        refreshStatus();
        loadIdeas();
        loadRuns();
    </script>
</body>
</html>
"""


@app.route('/')
def dashboard():
    return render_template_string(DASHBOARD_HTML)


@app.route('/api/status')
def api_status():
    return jsonify(get_bot_status())


@app.route('/api/ideas')
def api_ideas():
    try:
        data = load_ideas()
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e), "ideas": []})


@app.route('/api/preview-idea')
def api_preview_idea():
    try:
        idea = get_daily_idea(prefer_ai=False)
        return jsonify(idea)
    except Exception as e:
        return jsonify({"error": str(e)})


@app.route('/api/run')
def api_run():
    try:
        result = run_daily_workflow(prefer_ai_ideas=True)
        return jsonify(result)
    except Exception as e:
        return jsonify({"success": False, "errors": [str(e)]})


@app.route('/api/runs')
def api_runs():
    runs = []
    try:
        if os.path.exists(OUTPUT_DIR):
            files = sorted(
                [f for f in os.listdir(OUTPUT_DIR) if f.startswith('run_result_')],
                reverse=True
            )[:10]
            
            for f in files:
                path = os.path.join(OUTPUT_DIR, f)
                with open(path) as file:
                    runs.append(json.load(file))
    except Exception as e:
        pass
    
    return jsonify({"runs": runs})


def run_dashboard(port=5001):
    """Run the dashboard server"""
    app.run(host='0.0.0.0', port=port, debug=False)


if __name__ == '__main__':
    run_dashboard()
