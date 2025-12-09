let certificateData = null;

async function loadCertificates() {
    if (certificateData) return certificateData;

    const response = await fetch("certificados.json", {
        cache: "no-cache"
    });
    if (!response.ok) {
        throw new Error("Failed to load certificate registry.");
    }
    certificateData = await response.json();
    return certificateData;
}

function renderNotFound(code) {
    const container = document.getElementById("result");
    container.innerHTML = `
        <p class="error"><strong>Certificate not found.</strong></p>
        <p class="hint">
            Please check if the <strong>Credential ID</strong> was typed correctly:
            <code>${code || "—"}</code>.
            If you believe this is an error, contact AI4Tech support.
        </p>
    `;
}

function renderError(message) {
    const container = document.getElementById("result");
    container.innerHTML = `
        <p class="error"><strong>Verification error.</strong></p>
        <p class="hint">${message}</p>
    `;
}

function renderCertificate(code, cert) {
    const container = document.getElementById("result");

    const normalizedStatus = (cert.status || "").toLowerCase();
    let statusClass = "status-valid";
    let statusLabel = "Valid";

    if (normalizedStatus === "expired") {
        statusClass = "status-expired";
        statusLabel = "Expired";
    } else if (normalizedStatus === "revoked") {
        statusClass = "status-revoked";
        statusLabel = "Revoked";
    }

    container.innerHTML = `
        <div class="result-card">
            <div class="result-header">
                <div class="result-title">Certificate details</div>
                <span class="status-pill ${statusClass}">${statusLabel}</span>
            </div>

            <div>
                <span class="field-label">Participant</span>
                <span class="field-value">${cert.name}</span>
            </div>

            <div>
                <span class="field-label">Credential ID</span>
                <span class="field-value code-box">${code}</span>
            </div>

            <div>
                <span class="field-label">Course</span>
                <span class="field-value">${cert.course}</span>
            </div>

            <div>
                <span class="field-label">Workload</span>
                <span class="field-value">${cert.hours} hours</span>
            </div>

            <div>
                <span class="field-label">Issue date</span>
                <span class="field-value">${cert.issue_date}</span>
            </div>

            <div>
                <span class="field-label">Instructors</span>
                <span class="field-value">
                    ${(cert.instructors || []).join(", ")}
                </span>
            </div>

            <div>
                <span class="field-label">Partners</span>
                <span class="field-value">
                    ${(cert.partners || []).join(", ") || "—"}
                </span>
            </div>

            <div style="grid-column: 1 / -1;">
                <span class="field-label">Notes</span>
                <span class="field-value">
                    ${cert.notes || "No additional notes for this certificate."}
                </span>
            </div>
        </div>
    `;
}

async function verifyCertificate(code) {
    const trimmed = code.trim();
    const container = document.getElementById("result");

    if (!trimmed) {
        container.innerHTML = `
            <p class="placeholder">
                Please enter a <strong>Credential ID</strong> to verify a certificate.
            </p>
        `;
        return;
    }

    container.innerHTML = `<p class="loading">Verifying certificate <code>${trimmed}</code>…</p>`;

    try {
        const data = await loadCertificates();
        const cert = data[trimmed];

        if (!cert) {
            renderNotFound(trimmed);
            return;
        }

        renderCertificate(trimmed, cert);
    } catch (err) {
        console.error(err);
        renderError("Unable to access the certificate registry at this moment.");
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("search-form");
    const input = document.getElementById("code");
    const yearSpan = document.getElementById("year");

    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        verifyCertificate(input.value);
    });

    // Support for URL parameter ?id=AI4T-2025-0001
    const params = new URLSearchParams(window.location.search);
    const idParam = params.get("id");
    if (idParam) {
        input.value = idParam;
        verifyCertificate(idParam);
    }
});
