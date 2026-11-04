const money = new Intl.NumberFormat("en-CA", {
  style: "currency",
  currency: "CAD",
  maximumFractionDigits: 0,
});

const menuButton = document.querySelector(".menu-toggle");
const navigation = document.querySelector(".main-nav");
const quoteForm = document.querySelector("#quote-form");
const steps = [...document.querySelectorAll(".form-step")];
const progressBar = document.querySelector("#progress-bar");
const previousButton = document.querySelector("#prev-step");
const nextButton = document.querySelector("#next-step");
const estimatePanel = document.querySelector("#estimate");
let currentStep = 0;
let latestSummary = "";

menuButton.addEventListener("click", () => {
  const open = menuButton.getAttribute("aria-expanded") === "true";
  menuButton.setAttribute("aria-expanded", String(!open));
  navigation.classList.toggle("open", !open);
  document.body.classList.toggle("menu-open", !open);
});

navigation.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    menuButton.setAttribute("aria-expanded", "false");
    navigation.classList.remove("open");
    document.body.classList.remove("menu-open");
  });
});

function showStep(index) {
  currentStep = index;
  steps.forEach((step, stepIndex) => step.classList.toggle("active", stepIndex === index));
  progressBar.style.width = `${((index + 1) / steps.length) * 100}%`;
  previousButton.style.visibility = index === 0 ? "hidden" : "visible";
  nextButton.textContent = index === steps.length - 1 ? "See my estimate" : "Continue";
}

previousButton.addEventListener("click", () => showStep(Math.max(0, currentStep - 1)));
nextButton.addEventListener("click", () => {
  if (currentStep < steps.length - 1) {
    showStep(currentStep + 1);
    return;
  }
  calculateEstimate();
});

function toggleConditional(id) {
  const input = document.querySelector(`#${id}`);
  const panel = document.querySelector(`[data-for="${id}"]`);
  if (!input || !panel) return;
  const update = () => {
    if (panel.classList.contains("compact")) panel.classList.toggle("visible", input.checked);
    else panel.hidden = !input.checked;
  };
  input.addEventListener("change", update);
  update();
}

["bookkeeping", "hst", "payroll"].forEach(toggleConditional);

function range(low, high) {
  return `${money.format(Math.round(low))}–${money.format(Math.round(high))}`;
}

function calculateEstimate() {
  let monthlyLow = 0;
  let monthlyHigh = 0;
  let annualLow = 0;
  let annualHigh = 0;
  const services = [];

  const statementFrequency = quoteForm.elements.statements.value;
  const statements = {
    monthly: [190, 275, "Monthly financial statements"],
    quarterly: [75, 115, "Quarterly financial statements"],
    annual: [35, 55, "Annual financial statements"],
    none: [0, 0, "No financial statements"],
  }[statementFrequency];
  monthlyLow += statements[0]; monthlyHigh += statements[1]; services.push(["Reporting", statements[2]]);

  if (document.querySelector("#bookkeeping").checked) {
    const volume = document.querySelector("#transactions").value;
    const bookkeeping = {
      75: [240, 325, "Up to 75 transactions/month"],
      200: [375, 525, "76–200 transactions/month"],
      400: [575, 775, "201–400 transactions/month"],
      more: [850, 1200, "More than 400 transactions/month"],
    }[volume];
    monthlyLow += bookkeeping[0]; monthlyHigh += bookkeeping[1]; services.push(["Bookkeeping", bookkeeping[2]]);
  } else services.push(["Bookkeeping", "Not selected"]);

  if (document.querySelector("#hst").checked) {
    const frequency = document.querySelector("#hst-frequency").value;
    const hst = {
      monthly: [65, 100, "Monthly GST/HST filing"],
      quarterly: [30, 50, "Quarterly GST/HST filing"],
      annual: [10, 20, "Annual GST/HST filing"],
    }[frequency];
    monthlyLow += hst[0]; monthlyHigh += hst[1]; services.push(["GST/HST", hst[2]]);
  }

  if (document.querySelector("#payroll").checked) {
    const count = document.querySelector("#employees").value;
    const payroll = {
      5: [45, 75, "PD7A support for 1–5 employees"],
      15: [80, 135, "PD7A support for 6–15 employees"],
      more: [140, 240, "PD7A support for 16+ employees"],
    }[count];
    monthlyLow += payroll[0]; monthlyHigh += payroll[1]; services.push(["Payroll", payroll[2]]);
  }

  if (document.querySelector("#t4").checked) {
    annualLow += 180; annualHigh += 450; services.push(["T4", "Annual slips and summary"]);
  }
  if (document.querySelector("#t2").checked) {
    annualLow += 1500; annualHigh += 2500; services.push(["T2", "Annual corporate tax return"]);
  }

  const analysisChoice = quoteForm.elements.analysis.value;
  const analysis = {
    monthly: [250, 450, "Monthly financial analysis"],
    quarterly: [90, 150, "Quarterly financial analysis"],
    none: [0, 0, "Not selected"],
  }[analysisChoice];
  monthlyLow += analysis[0]; monthlyHigh += analysis[1]; services.push(["Analysis", analysis[2]]);

  document.querySelector("#monthly-estimate").textContent = range(monthlyLow, monthlyHigh);
  document.querySelector("#annual-estimate").textContent = range(annualLow, annualHigh);
  document.querySelector("#estimate-summary").innerHTML = services
    .map(([label, value]) => `<div><span>${label}</span><span>${value}</span></div>`).join("");

  latestSummary = [
    "Z&Y Accounting & Advisory — Planning Estimate",
    `Recurring services: ${range(monthlyLow, monthlyHigh)} per month CAD`,
    `Annual services: ${range(annualLow, annualHigh)} per year CAD`,
    "",
    ...services.map(([label, value]) => `${label}: ${value}`),
    "",
    "Planning estimate only; final scope and price require a review of the records. HST excluded.",
  ].join("\n");

  quoteForm.hidden = true;
  estimatePanel.hidden = false;
  progressBar.style.width = "100%";
  estimatePanel.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

document.querySelector("#edit-estimate").addEventListener("click", () => {
  estimatePanel.hidden = true;
  quoteForm.hidden = false;
  showStep(0);
});

document.querySelector("#copy-estimate").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(latestSummary);
  } catch {
    const textarea = document.createElement("textarea");
    textarea.value = latestSummary;
    document.body.append(textarea);
    textarea.select();
    document.execCommand("copy");
    textarea.remove();
  }
  const toast = document.querySelector("#toast");
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2200);
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));
document.querySelector("#year").textContent = new Date().getFullYear();
showStep(0);
