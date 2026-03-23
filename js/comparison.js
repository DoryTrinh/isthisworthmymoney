/* ============================================================
   COMPARISON CALCULATOR ENGINE
   ============================================================
   Config-driven "Option A vs Option B" calculator.
   To create a new comparison, just define a new config object
   and call renderComparisonScreen(config).

   UNIT SYSTEMS:
   Each config can define a `unitSystems` array. Each system
   provides overrides for input units, labels, placeholders,
   defaults, and its own calculate function.
   ============================================================ */

/* ---------- REGISTRY ---------- */
var comparisonConfigs = {};
var activeUnitSystem = {}; // configId -> unitSystem id

function registerComparison(config) {
  comparisonConfigs[config.id] = config;
  // Default to first unit system
  if (config.unitSystems && config.unitSystems.length > 0) {
    activeUnitSystem[config.id] = config.unitSystems[0].id;
  }
}

/* ---------- HELPERS ---------- */

/** Get the active unit system object for a config */
function getActiveUnitSystem(config) {
  if (!config.unitSystems || config.unitSystems.length === 0) return null;
  var activeId = activeUnitSystem[config.id];
  for (var i = 0; i < config.unitSystems.length; i++) {
    if (config.unitSystems[i].id === activeId) return config.unitSystems[i];
  }
  return config.unitSystems[0];
}

/** Resolve an input field's properties using active unit system overrides */
function resolveInput(inp, unitSystem) {
  if (!unitSystem || !unitSystem.inputOverrides || !unitSystem.inputOverrides[inp.id]) {
    return inp;
  }
  var overrides = unitSystem.inputOverrides[inp.id];
  // Merge: override wins, original is fallback
  var resolved = {};
  for (var key in inp) {
    if (inp.hasOwnProperty(key)) resolved[key] = inp[key];
  }
  for (var key in overrides) {
    if (overrides.hasOwnProperty(key)) resolved[key] = overrides[key];
  }
  return resolved;
}

/* ---------- RENDERER ---------- */

function renderComparisonScreen(configId) {
  var config = comparisonConfigs[configId];
  if (!config) return;

  var container = document.getElementById("compare-body");
  if (!container) return;

  container.innerHTML = "";
  container.setAttribute("data-config", configId);

  // Title + subtitle
  var title = document.getElementById("compare-title");
  var subtitle = document.getElementById("compare-subtitle");
  if (title) title.textContent = config.title;
  if (subtitle) {
    subtitle.textContent = config.subtitle || "";
    subtitle.style.display = config.subtitle ? "" : "none";
  }

  var unitSystem = getActiveUnitSystem(config);

  // Unit system toggle (if multiple systems)
  if (config.unitSystems && config.unitSystems.length > 1) {
    var toggle = document.createElement("div");
    toggle.className = "compare-unit-toggle";
    config.unitSystems.forEach(function(us) {
      var btn = document.createElement("button");
      btn.className = "compare-unit-btn" + (us.id === activeUnitSystem[configId] ? " active" : "");
      btn.textContent = us.label;
      btn.onclick = function() {
        activeUnitSystem[configId] = us.id;
        renderComparisonScreen(configId);
      };
      toggle.appendChild(btn);
    });
    container.appendChild(toggle);
  }

  // Build input card
  var card = document.createElement("div");
  card.className = "card input-card";

  var inner = document.createElement("div");
  inner.className = "card-inner";

  // Group inputs by section
  var sharedInputs = [];
  var sideAInputs = [];
  var sideBInputs = [];

  config.inputs.forEach(function(inp) {
    var resolved = resolveInput(inp, unitSystem);
    if (resolved.shared) {
      sharedInputs.push(resolved);
    } else if (resolved.side === "A") {
      sideAInputs.push(resolved);
    } else {
      sideBInputs.push(resolved);
    }
  });

  // Render shared inputs
  if (sharedInputs.length > 0) {
    sharedInputs.forEach(function(inp) {
      inner.appendChild(buildInputRow(inp, config));
    });
  }

  // Render side A
  if (sideAInputs.length > 0) {
    var labelA = document.createElement("div");
    labelA.className = "compare-section-label compare-section-a";
    labelA.textContent = config.optionA.label;
    inner.appendChild(labelA);
    sideAInputs.forEach(function(inp) {
      inner.appendChild(buildInputRow(inp, config));
    });
  }

  // Render side B
  if (sideBInputs.length > 0) {
    var labelB = document.createElement("div");
    labelB.className = "compare-section-label compare-section-b";
    labelB.textContent = config.optionB.label;
    inner.appendChild(labelB);
    sideBInputs.forEach(function(inp) {
      inner.appendChild(buildInputRow(inp, config));
    });
  }

  // Submit button
  var submit = document.createElement("div");
  submit.className = "card-submit";
  var btn = document.createElement("button");
  btn.className = "submit-arrow";
  btn.textContent = "Go";
  btn.onclick = function() { runComparison(configId); };
  submit.appendChild(btn);
  inner.appendChild(submit);

  card.appendChild(inner);
  container.appendChild(card);

  // Result area (hidden initially)
  var resultArea = document.createElement("div");
  resultArea.id = "compare-results";
  resultArea.style.display = "none";
  container.appendChild(resultArea);
}

function buildInputRow(inp, config) {
  var row = document.createElement("div");
  row.className = "input-row";

  var label = document.createElement("span");
  label.className = "input-label";
  label.textContent = inp.label;
  if (inp.required !== false) {
    label.innerHTML = inp.label + ' <span class="required">*</span>';
  }
  row.appendChild(label);

  if (inp.type === "currency") {
    var group = document.createElement("span");
    group.className = "exp-currency-input-group";
    var badge = document.createElement("span");
    badge.className = "currency-badge";
    badge.textContent = getCurrencyDisplay();
    group.appendChild(badge);
    var input = document.createElement("input");
    input.type = "text";
    input.id = "compare-" + inp.id;
    input.className = "number-input cost-input";
    input.placeholder = inp.placeholder || "0";
    input.setAttribute("inputmode", "numeric");
    group.appendChild(input);
    row.appendChild(group);
  } else if (inp.type === "select") {
    var select = document.createElement("select");
    select.id = "compare-" + inp.id;
    select.className = "frequency-select";
    (inp.options || []).forEach(function(opt) {
      var option = document.createElement("option");
      option.value = opt.value;
      option.textContent = opt.label;
      if (opt.selected) option.selected = true;
      select.appendChild(option);
    });
    row.appendChild(select);
  } else {
    // number or text
    var input = document.createElement("input");
    input.type = "text";
    input.id = "compare-" + inp.id;
    input.className = inp.type === "number" ? "number-input compare-number-input" : "text-input";
    input.placeholder = inp.placeholder || "";
    if (inp.type === "number") {
      input.setAttribute("inputmode", inp.decimal ? "decimal" : "numeric");
    }
    if (inp.defaultValue !== undefined) {
      input.value = inp.defaultValue;
    }
    row.appendChild(input);

    if (inp.unit) {
      var unit = document.createElement("span");
      unit.className = "input-label compare-unit";
      unit.textContent = inp.unit;
      row.appendChild(unit);
    }
  }

  // Setup number formatting after element is in DOM
  setTimeout(function() {
    var el = document.getElementById("compare-" + inp.id);
    if (el && (inp.type === "currency" || (inp.type === "number" && !inp.decimal))) {
      setupNumberInput(el);
    } else if (el && inp.type === "number" && inp.decimal) {
      el.addEventListener("input", function() {
        var raw = this.value.replace(/[^\d.]/g, "");
        var parts = raw.split(".");
        if (parts.length > 2) raw = parts[0] + "." + parts.slice(1).join("");
        this.value = raw;
      });
    }
  }, 0);

  return row;
}

/* ---------- CALCULATION ---------- */

function runComparison(configId) {
  var config = comparisonConfigs[configId];
  if (!config) return;

  var unitSystem = getActiveUnitSystem(config);

  // Gather input values (use resolved inputs for correct types)
  var values = {};
  var missingFields = [];

  config.inputs.forEach(function(rawInp) {
    var inp = resolveInput(rawInp, unitSystem);
    var el = document.getElementById("compare-" + inp.id);
    if (!el) return;

    if (inp.type === "select") {
      values[inp.id] = el.value;
    } else if (inp.type === "currency" || inp.type === "number") {
      values[inp.id] = parseFormattedNumber(el.value);
      if (inp.required !== false && !values[inp.id]) {
        missingFields.push("compare-" + inp.id);
      }
    } else {
      values[inp.id] = el.value.trim();
      if (inp.required !== false && !values[inp.id]) {
        missingFields.push("compare-" + inp.id);
      }
    }
  });

  if (missingFields.length > 0) {
    showValidationError(missingFields);
    return;
  }

  // Use unit system's calculate if it has one, otherwise config's
  var calcFn = (unitSystem && unitSystem.calculate) ? unitSystem.calculate : config.calculate;
  var results = calcFn(values);
  if (!results) return;

  renderComparisonResults(config, results);
}

function renderComparisonResults(config, results) {
  var area = document.getElementById("compare-results");
  if (!area) return;
  area.innerHTML = "";
  area.style.display = "";

  // Winner banner
  if (results.winner) {
    var banner = document.createElement("div");
    banner.className = "compare-winner-banner";
    banner.innerHTML = '<span class="compare-winner-icon">&#9733;</span> ' + results.winner;
    area.appendChild(banner);
  }

  // Summary cards
  if (results.cards && results.cards.length > 0) {
    var grid = document.createElement("div");
    grid.className = "compare-cards-grid";

    results.cards.forEach(function(cardData) {
      var card = document.createElement("div");
      card.className = "compare-result-card" + (cardData.highlight ? " compare-highlight" : "");

      var val = document.createElement("div");
      val.className = "compare-result-value";
      val.textContent = cardData.value;

      var lbl = document.createElement("div");
      lbl.className = "compare-result-label";
      lbl.textContent = cardData.label;

      card.appendChild(val);
      card.appendChild(lbl);
      grid.appendChild(card);
    });

    area.appendChild(grid);
  }

  // Year-by-year breakdown table
  if (results.yearlyBreakdown) {
    var tableWrap = document.createElement("div");
    tableWrap.className = "compare-table-wrap";

    var table = document.createElement("table");
    table.className = "compare-table";

    var thead = document.createElement("thead");
    var headerRow = document.createElement("tr");
    results.yearlyBreakdown.headers.forEach(function(h) {
      var th = document.createElement("th");
      th.textContent = h;
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    var tbody = document.createElement("tbody");
    results.yearlyBreakdown.rows.forEach(function(rowData) {
      var tr = document.createElement("tr");
      if (rowData.highlight) tr.className = "compare-row-highlight";
      rowData.cells.forEach(function(cell) {
        var td = document.createElement("td");
        td.textContent = cell;
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    tableWrap.appendChild(table);
    area.appendChild(tableWrap);
  }

  // Notes
  if (results.notes && results.notes.length > 0) {
    var notesDiv = document.createElement("div");
    notesDiv.className = "compare-notes";
    results.notes.forEach(function(note) {
      var p = document.createElement("p");
      p.className = "compare-note";
      p.textContent = note;
      notesDiv.appendChild(p);
    });
    area.appendChild(notesDiv);
  }

  // Share button
  var footer = document.createElement("div");
  footer.className = "compare-share-footer";
  var shareBtn = document.createElement("button");
  shareBtn.className = "submit-arrow";
  shareBtn.innerHTML = "Share";
  shareBtn.onclick = function() {
    captureAndShare(area);
  };
  footer.appendChild(shareBtn);
  area.appendChild(footer);

  area.scrollIntoView({ behavior: "smooth", block: "start" });
}

/* ============================================================
   EV TOTAL COST OF OWNERSHIP CONFIG
   ============================================================
   Two unit systems: US (miles, gallons, MPG) and Metric (km, liters, L/100km).
   Each system overrides input labels, units, placeholders, defaults,
   and provides its own calculate function.
   ============================================================ */

registerComparison({
  id: "ev-cost",
  title: "EV vs Gas Car",
  subtitle: "Total cost of ownership comparison",
  optionA: { label: "Electric Vehicle" },
  optionB: { label: "Gas Car" },

  /* Base inputs — these are the field definitions.
     Unit systems override unit, label, placeholder, defaultValue per field. */
  inputs: [
    { id: "annualDistance", label: "Annual distance driven", type: "number", unit: "miles", shared: true, placeholder: "12,000", defaultValue: "12,000" },
    { id: "evPrice", label: "Purchase price", type: "currency", side: "A", placeholder: "35,000" },
    { id: "evEfficiency", label: "Efficiency", type: "number", unit: "miles/kWh", side: "A", placeholder: "3.5", decimal: true, defaultValue: "3.5" },
    { id: "electricityRate", label: "Electricity rate", type: "number", unit: "/kWh", side: "A", placeholder: "0.13", decimal: true },
    { id: "gasCarPrice", label: "Purchase price", type: "currency", side: "B", placeholder: "28,000" },
    { id: "gasEfficiency", label: "Fuel efficiency", type: "number", unit: "MPG", side: "B", placeholder: "30" },
    { id: "gasPrice", label: "Gas price", type: "number", unit: "/gallon", side: "B", placeholder: "3.50", decimal: true }
  ],

  unitSystems: [
    {
      id: "us",
      label: "US (miles, gallons)",
      inputOverrides: {
        annualDistance: { label: "Annual miles driven", unit: "miles", placeholder: "12,000", defaultValue: "12,000" },
        evEfficiency:  { label: "Efficiency", unit: "miles/kWh", placeholder: "3.5", defaultValue: "3.5" },
        electricityRate: { label: "Electricity rate", unit: "/kWh", placeholder: "0.13" },
        gasEfficiency: { label: "Fuel efficiency", unit: "MPG", placeholder: "30", defaultValue: "30" },
        gasPrice:      { label: "Gas price", unit: "/gallon", placeholder: "3.50" }
      },
      calculate: function(v) {
        // US: miles, MPG (miles per gallon), miles/kWh
        var annualElecCost = (v.annualDistance / v.evEfficiency) * v.electricityRate;
        var annualGasCost = (v.annualDistance / v.gasEfficiency) * v.gasPrice;
        return evBuildResults(v, annualElecCost, annualGasCost);
      }
    },
    {
      id: "metric",
      label: "Metric (km, liters)",
      inputOverrides: {
        annualDistance: { label: "Annual km driven", unit: "km", placeholder: "20,000", defaultValue: "20,000" },
        evEfficiency:  { label: "Efficiency", unit: "km/kWh", placeholder: "5.5", decimal: true, defaultValue: "5.5" },
        electricityRate: { label: "Electricity rate", unit: "/kWh", placeholder: "0.15" },
        gasEfficiency: { label: "Fuel consumption", unit: "L/100km", placeholder: "8", decimal: true, defaultValue: "8" },
        gasPrice:      { label: "Gas price", unit: "/liter", placeholder: "1.80" }
      },
      calculate: function(v) {
        // Metric: km, L/100km, km/kWh
        var annualElecCost = (v.annualDistance / v.evEfficiency) * v.electricityRate;
        // L/100km: liters = (distance / 100) * consumption
        var annualLiters = (v.annualDistance / 100) * v.gasEfficiency;
        var annualGasCost = annualLiters * v.gasPrice;
        return evBuildResults(v, annualElecCost, annualGasCost);
      }
    }
  ]
});

/** Shared result builder for EV calculator (both unit systems) */
function evBuildResults(v, annualElecCost, annualGasCost) {
  var annualFuelSavings = annualGasCost - annualElecCost;
  var monthlyDiff = annualFuelSavings / 12;
  var priceDiff = v.evPrice - v.gasCarPrice;

  var breakEvenYear = annualFuelSavings > 0 ? Math.ceil(priceDiff / annualFuelSavings) : null;
  var breakEvenText = breakEvenYear !== null && breakEvenYear > 0
    ? "Year " + breakEvenYear
    : (priceDiff <= 0 ? "Immediately" : "Never (gas is cheaper)");

  var headers = ["Year", "EV Total Cost", "Gas Car Total Cost", "EV Savings"];
  var rows = [];
  for (var y = 1; y <= 10; y++) {
    var evTotal = v.evPrice + (annualElecCost * y);
    var gasTotal = v.gasCarPrice + (annualGasCost * y);
    var savings = gasTotal - evTotal;
    rows.push({
      cells: [
        y,
        formatCurrency(Math.round(evTotal)),
        formatCurrency(Math.round(gasTotal)),
        (savings >= 0 ? "" : "-") + formatCurrency(Math.abs(Math.round(savings)))
      ],
      highlight: breakEvenYear !== null && y === breakEvenYear
    });
  }

  var fiveYearSavings = (v.gasCarPrice + annualGasCost * 5) - (v.evPrice + annualElecCost * 5);
  var winner = fiveYearSavings > 0
    ? "The EV saves you " + formatCurrency(Math.round(fiveYearSavings)) + " over 5 years"
    : "The gas car saves you " + formatCurrency(Math.abs(Math.round(fiveYearSavings))) + " over 5 years";

  return {
    winner: winner,
    cards: [
      { label: "Annual fuel savings", value: formatCurrency(Math.round(annualFuelSavings)), highlight: annualFuelSavings > 0 },
      { label: "Monthly savings", value: formatCurrency(Math.round(monthlyDiff)) },
      { label: "Break-even point", value: breakEvenText },
      { label: "Upfront price difference", value: formatCurrency(Math.round(priceDiff)) }
    ],
    yearlyBreakdown: { headers: headers, rows: rows },
    notes: [
      "This comparison only includes purchase price and fuel/electricity costs.",
      "Not included: insurance, maintenance, tax credits, depreciation, or financing costs.",
      "EVs generally have lower maintenance costs."
    ]
  };
}
