# Application Format and Final Output

## Required Output

Create a single standalone HTML file. It must contain:

- HTML markup;
- Custom styles inside `<style>`;
- JavaScript logic inside `<script>`.

Do not create separate CSS and JS files. Do not require a bundler, npm, a local server, or pre-compilation.

## Including Libraries

External libraries may be included via CDN if they are genuinely needed for the task. The viewport parameter is defined in registry `FMT-02`, and CDN inclusion rules are in `FMT-03`.

Place external classic scripts in `<head>` with `defer`. Do not add `defer` to an embedded inline script: place it before the closing `</body>` tag or run it after the DOM is ready.

Do not include a library just for a simple effect that can be achieved using standard browser features.

## Running from a File

The application must run when opening the HTML file directly in a browser. Therefore:

- Do not require a local server;
- Do not load required local data via `fetch`, XHR, or dynamic import;
- Do not rely on server-side APIs;
- Do not use build paths that only exist in a development environment.

If a library is included via CDN, network access is required to load it. Do not claim offline functionality unless the external dependency is embedded directly into the HTML.

## Self-Containment

All data required to demonstrate interactivity must be defined inside the HTML. The only exception is optional external libraries loaded from a CDN.

The application must gracefully handle the absence of an optional library: either fall back to a native implementation or log a clear error to the console without leaving the interface in an infinite loading state.

## Final Delivery

In response to a request to create an application, deliver the finished HTML file. Do not add explanatory text, launch instructions, or comments to the HTML itself. An explanation in a chat message does not replace the HTML file.
