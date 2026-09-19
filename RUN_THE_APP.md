# How to run the app in your browser

## Start the app

1. Open the **Correct partition** project folder.
2. Open a terminal in that folder.
3. Run:

   ```powershell
   npm run dev
   ```

4. Wait until the terminal displays a local address, normally:

   ```text
   http://localhost:5173/
   ```

   The port number may be different if `5173` is already in use.

5. Hold `Ctrl` and click the address, or copy it into your web browser.

Keep the terminal open while using the app. The page will normally update
automatically when the project files change. If it does not, refresh the
browser page.

## Stop the app

Return to the terminal running the app and press:

```text
Ctrl+C
```

You can then close the terminal.

## Start it again later

Open a new terminal in the project folder and run `npm run dev` again.

## First-time setup on another computer

After copying or downloading the project onto a different computer, install
its dependencies once before starting it:

```powershell
npm install
npm run dev
```

This requires Node.js to be installed on that computer.
