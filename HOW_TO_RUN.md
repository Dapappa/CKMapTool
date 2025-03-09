# How to Run the Calgary Interactive Map Tool

Since you're seeing a blank page when opening the HTML file directly, you need to view it through a local web server to ensure all resources load correctly.

## Option 1: Using VS Code and Live Server (Recommended)

1. Install [Visual Studio Code](https://code.visualstudio.com/) if you don't have it already
2. Install the "Live Server" extension:
   - Open VS Code
   - Click on the Extensions icon in the sidebar (or press Ctrl+Shift+X / Cmd+Shift+X)
   - Search for "Live Server"
   - Install the extension by Ritwick Dey

3. Open your project folder in VS Code
4. Right-click on `index.html` in the file explorer
5. Select "Open with Live Server"
6. This will open your browser at an address like http://127.0.0.1:5500/index.html

## Option 2: Using Python's built-in server

If you have Python installed:

1. Open a terminal/command prompt
2. Navigate to your project folder:
   ```
   cd path/to/InteractiveMapTool
   ```
3. Start a simple HTTP server:
   - Python 3: `python -m http.server`
   - Python 2: `python -m SimpleHTTPServer`
4. Open your browser and navigate to http://localhost:8000

## Option 3: Using Node.js http-server

If you have Node.js installed:

1. Install http-server globally:
   ```
   npm install -g http-server
   ```
2. Navigate to your project folder in the terminal
3. Run:
   ```
   http-server
   ```
4. Open your browser and navigate to http://localhost:8080

## Why a Server is Needed

When you open an HTML file directly in the browser (using the `file://` protocol), certain features may be restricted due to browser security policies. This includes:

- Loading local resources like SVG files
- Some JavaScript functionality 
- CORS (Cross-Origin Resource Sharing) restrictions

A local web server provides the proper environment to test your interactive map as it would behave when deployed. 