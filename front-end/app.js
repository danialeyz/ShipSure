/* =========================
   MOCK BACKEND FETCH
   ========================= */
function fetchPullRequests() {
  return Promise.resolve({
    pullRequests: [
      {
        id: 1,
        title: "Fix auth bypass in login",
        link: "https://github.com/org/repo/pull/42",
        risk: 78,
        coderabbitReviews: [
          {
            name: "SQL Injection test",
            type: "danger",
            risk: 85,
            description: "Potential unsafe query detected",
          },
          {
            name: "Auth edge case test",
            type: "warning",
            risk: 55,
            description: "Token expiry edge case not fully covered",
          },
          {
            name: "Login happy path",
            type: "success",
            description: "Basic login flow passed",
          },
        ],
        generatedTests: [
          {
            test: "Expired JWT validation",
            reason: "Auth middleware did not handle expired tokens",
          },
          {
            test: "Malformed payload test",
            reason: "Missing schema validation for login payload",
          },
        ],
      },
    ],
  });
}

/* =========================
   HELPERS
   ========================= */
function iconByType(type) {
  if (type === "danger") return "❌";
  if (type === "warning") return "⚠️";
  if (type === "success") return "✅";
  return "ℹ️";
}

function riskMeta(risk) {
  if (risk >= 70) {
    return { label: "High Risk", color: "text-red-400 bg-red-500/10" };
  }
  if (risk >= 40) {
    return { label: "Medium Risk", color: "text-yellow-400 bg-yellow-500/10" };
  }
  return { label: "Low Risk", color: "text-emerald-400 bg-emerald-500/10" };
}

/* =========================
   SECTION RENDERER
   ========================= */
function renderSection(title, items, showRisk = false) {
  if (!items.length) return "";

  return `
    <section>
      <h3 class="text-sm font-semibold text-slate-300 mb-2">
        ${title}
      </h3>
      <ul class="space-y-2">
        ${items
          .map((item) => {
            const risk = showRisk ? riskMeta(item.risk) : null;

            return `
            <li class="p-3 rounded bg-[#0b1220] border border-slate-800">
              <div class="flex justify-between items-start">
                <div>
                  <div class="flex items-center gap-2">
                    <span>${iconByType(item.type)}</span>
                    <span class="font-medium">${item.name}</span>
                  </div>
                  <p class="text-sm text-slate-400 mt-1">
                    ${item.description}
                  </p>
                </div>

                ${
                  showRisk
                    ? `
                      <div class="text-right ml-4">
                        <div class="text-xs ${risk.color} px-2 py-1 rounded-full">
                          ${risk.label}
                        </div>
                        <div class="text-[11px] text-slate-400 mt-1">
                          ${item.risk}%
                        </div>
                      </div>
                    `
                    : ""
                }
              </div>
            </li>
          `;
          })
          .join("")}
      </ul>
    </section>
  `;
}

/* =========================
   MAIN RENDER
   ========================= */
function renderPullRequests(data) {
  const container = document.getElementById("accordion");
  container.innerHTML = "";

  data.pullRequests.forEach((pr) => {
    const risk = riskMeta(pr.risk);

    const errors = pr.coderabbitReviews.filter((r) => r.type === "danger");
    const warnings = pr.coderabbitReviews.filter((r) => r.type === "warning");
    const passed = pr.coderabbitReviews.filter((r) => r.type === "success");

    const card = document.createElement("div");
    card.className = "rounded-lg bg-[#0f172a] border border-slate-800";

    card.innerHTML = `
      <!-- HEADER -->
      <button
        class="w-full flex justify-between items-center p-4 hover:bg-slate-800/40 transition"
        data-toggle
      >
        <div>
          <h2 class="text-lg font-medium">${pr.title}</h2>
          <a href="${pr.link}" target="_blank"
             class="text-sm text-emerald-400 hover:underline">
            View Pull Request
          </a>
        </div>

        <div class="text-right">
          <div class="text-sm ${risk.color} px-3 py-1 rounded-full">
            ${risk.label}
          </div>
          <div class="text-xs text-slate-400 mt-1">
            Risk Score: ${pr.risk}%
          </div>
        </div>
      </button>

      <!-- CONTENT -->
      <div class="hidden px-4 pb-4 space-y-6">

        ${renderSection("❌ Errors", errors, true)}
        ${renderSection("⚠️ Warnings", warnings, true)}
        ${renderSection("✅ Passed Tests", passed, false)}

        <section>
          <h3 class="text-sm font-semibold text-slate-300 mb-2">
            Generated Tests
          </h3>
          <ul class="space-y-2">
            ${pr.generatedTests
              .map(
                (t) => `
              <li class="p-3 rounded bg-[#0b1220] border border-slate-800">
                <div class="font-medium">${t.test}</div>
                <p class="text-sm text-slate-400">
                  Reason: ${t.reason}
                </p>
              </li>
            `
              )
              .join("")}
          </ul>
        </section>

      </div>
    `;

    container.appendChild(card);
  });

  attachAccordionHandlers();
}

/* =========================
   ACCORDION BEHAVIOR
   ========================= */
function attachAccordionHandlers() {
  document.querySelectorAll("[data-toggle]").forEach((btn) => {
    btn.addEventListener("click", () => {
      btn.nextElementSibling.classList.toggle("hidden");
    });
  });
}

/* =========================
   INIT
   ========================= */
document.addEventListener("DOMContentLoaded", () => {
  fetchPullRequests().then(renderPullRequests);
});
