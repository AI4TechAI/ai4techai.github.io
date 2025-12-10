let certificateData = null;

/* ================================
   Load certificate registry (JSON)
   ================================ */
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

/* ================================
   UI Helper Blocks
   ================================ */

function renderNotFound(code) {
    const container = document.getElementById("result");
    container.innerHTML = `
        <p class="error"><strong>Certificate not found.</strong></p>
        <p class="hint">
            Please check if the <strong>Credential ID</strong> was typed correctly:
            <code>${code || "—"}</code>.<br>
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

/* ================================
   Render Certificate Details
   ================================ */

function renderCertificate(code, cert) {
    const container = document.getElementById("result");

    // Status formatting
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

    // LinkedIn block (fully centered, updated text)
    const linkedinBlock = cert.linkedin_url
        ? `
        <div class="linkedin-block">
            <a href="${cert.linkedin_url}" target="_blank"
               class="linkedin-btn" rel="noreferrer">

                <span class="linkedin-icon">
                    <svg viewBox="0 0 24 24">
                        <path fill="currentColor"
                            d="M22.225 0H1.771C.792 0 0 .774 0
                            1.729v20.542C0 23.227.792 24 1.771
                            24h20.451C23.2 24 24 23.227 24
                            22.271V1.729C24 .774 23.2 0 22.225
                            0zM7.059 20.452H3.577V9.039h3.482v11.413zM5.318
                            7.433a2.016 2.016 0 110-4.032 2.016
                            2.016 0 010 4.032zm15.135 13.019h-3.476v-5.559c0-1.327-.027-3.033-1.848-3.033-1.849
                            0-2.132 1.445-2.132 2.939v5.653H9.52V9.039h3.337v1.561h.047c.464-.879
                            1.598-1.804 3.289-1.804 3.518 0 4.26
                            2.317 4.26 5.331v6.325z">
                        </path>
                    </svg>
                </span>

                <span>Add your Certificate to LinkedIn</span>
            </a>
        </div>
        `
        : "";

    // Main certificate card
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
                <span class="field-value">${(cert.instructors || []).join(", ")}</span>
            </div>

            <div>
                <span class="field-label">Partners</span>
                <span class="field-value">${(cert.partners || []).join(", ") || "—"}</span>
            </div>

            <div style="grid-column: 1 / -1;">
                <span class="field-label">Notes</span>
                <span class="field-value">${cert.notes || "No additional notes."}</span>
            </div>

            ${linkedinBlock}

        </div>
    `;
}

/* ================================
   Main Verification Handler
   ================================ */

async function verifyCertificate(code) {
    const trimmed = code.trim();
    const container = document.getElementById("result");

    if (!trimmed) {
        container.innerHTML = `
            <p class="placeholder">
                Please enter a <strong>Credential ID</strong> to verify a certificate.
            </p>`;
        return;
    }

    container.innerHTML = `
        <p class="loading">
            Verifying certificate <code>${trimmed}</code>…
        </p>`;

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
        renderError("Unable to access the certificate registry at the moment.");
    }
}

/* ================================
   Page Initialization
   ================================ */

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

    // Support direct links: verify.ai4tech.ai/?id=XXXXX
    const params = new URLSearchParams(window.location.search);
    const idParam = params.get("id");

    if (idParam) {
        input.value = idParam;
        verifyCertificate(idParam);
    }
});
