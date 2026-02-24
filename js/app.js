/* ============================================================
   IS THIS WORTH MY MONEY? - Main Application Logic
   ============================================================
   Sections:
   0.  Internationalization (i18n)
   1.  Constants & State
   2.  Navigation
   3.  Profile Management
   4.  Searchable Currency Dropdown
   5.  Currency Helpers
   6.  Number Formatting
   7.  Hourly Rate Calculation
   8.  Regular Purchase Calculation
   9.  Workday Visualization
   10. One-time Purchase Calculation
     10b. Saving Goal Calculator
   11. Pie Chart Rendering
   12. Share Functionality
   13. Reset & Stay
   14. DOM Helpers
   15. Multi-Slice Pie Chart
   16. Daily Expenses Wizard
     16a. Core Steps (Housing, Utilities, Food, Transport)
     16b. Milestone & Profile Expenses
     16c. Other Monthly Expenses
     16d. Over-Income Alert
     16e. Result Page Rendering (Sections 1–5)
     16f. Amend Your Figures (Section 6)
     16g. Welcome-Back Modal (Returning Users)
     16h. Swipe Navigation
   17. Input Formatting
   18. Initialization
   ============================================================ */

/* ============================================================
   0. INTERNATIONALIZATION (i18n)
   ============================================================ */

/** Current language code */
var currentLang = localStorage.getItem("worthMyMoneyLang") || "en";

/** Available languages — add new languages here */
var LANGUAGES = [
  { code: "vi", label: "Tiếng Việt", flag: "🇻🇳", short: "VI" },
  { code: "en", label: "English", flag: "🇬🇧", short: "EN" }
];

/** All locale data — keyed by language code */
var LOCALE_MAP = {
  vi: (typeof LOCALE_VI !== "undefined") ? LOCALE_VI : {},
  en: (typeof LOCALE_EN !== "undefined") ? LOCALE_EN : {}
};

/** Active locale strings */
var localeData = LOCALE_MAP[currentLang] || LOCALE_MAP["en"];

/** Get a translated string by key */
function t(key) {
  return localeData[key] || key;
}

/** Get month name by 0-indexed month number */
function getMonthName(monthIdx) {
  var keys = ["month1", "month2", "month3", "month4", "month5", "month6",
              "month7", "month8", "month9", "month10", "month11", "month12"];
  return t(keys[monthIdx]);
}

/** Set the app language and update all visible text */
function setLanguage(langCode) {
  currentLang = langCode;
  localStorage.setItem("worthMyMoneyLang", langCode);
  localeData = LOCALE_MAP[langCode] || LOCALE_MAP["en"];
  applyLanguage();
  closeLangDropdown();
}

/** Apply current language to all static HTML elements */
function applyLanguage() {
  // Update page title
  document.title = t("pageTitle");
  document.documentElement.lang = currentLang === "vi" ? "vi" : "en";

  // Update lang buttons text
  var langInfo = LANGUAGES.find(function(l) { return l.code === currentLang; });
  var shortLabel = langInfo ? langInfo.short : currentLang.toUpperCase();
  var langBtns = document.querySelectorAll(".lang-btn");
  for (var i = 0; i < langBtns.length; i++) {
    langBtns[i].textContent = shortLabel;
  }

  // --- HOME ---
  setHTML(".home-title", t("homeTitle"));
  setText("#home-tagline", t("homeTagline"));
  setTextAll(".home-question", t("homeQuestion"));
  setTextByOnclick("navigateTo('regular')", t("homeBtnRegular"));
  setTextByOnclick("navigateTo('onetime')", t("homeBtnOnetime"));
  setTextByOnclick("navigateTo('expenses')", t("homeBtnExpenses"));

  // --- PROFILE ---
  setText(".profile-title-text", t("profileTitle"));
  applyProfileLabels();

  // --- REGULAR ---
  setHTML(".regular-title", t("regularTitle"));
  applyRegularLabels();

  // --- ONE-TIME ---
  setHTML(".onetime-title", t("onetimeTitle"));
  applyOnetimeLabels();

  // --- EXPENSES ---
  setText(".expenses-title", t("expensesTitle"));
  applyExpensesLabels();

  // --- MODALS ---
  applyModalLabels();

  // Update OTHER_EXPENSE_CATEGORIES labels
  updateOtherExpenseCategoryLabels();

  // Update feedback links
  var fbLinks = document.querySelectorAll(".feedback-link");
  for (var fb = 0; fb < fbLinks.length; fb++) {
    fbLinks[fb].textContent = t("feedbackLink");
  }
}

/** Helper: set innerHTML of first matching element */
function setHTML(selector, html) {
  var el = document.querySelector(selector);
  if (el) el.innerHTML = html;
}

/** Helper: set textContent of first matching element */
function setText(selector, text) {
  var el = document.querySelector(selector);
  if (el) el.textContent = text;
}

/** Helper: set textContent of all matching elements */
function setTextAll(selector, text) {
  var els = document.querySelectorAll(selector);
  for (var i = 0; i < els.length; i++) {
    els[i].textContent = text;
  }
}

/** Helper: set text of buttons by their onclick attribute content */
function setTextByOnclick(onclickContent, text) {
  var btns = document.querySelectorAll("button[onclick*=\"" + onclickContent + "\"]");
  for (var i = 0; i < btns.length; i++) {
    // Only update if the button has no child elements (simple text buttons)
    if (btns[i].children.length === 0) {
      btns[i].textContent = text;
    }
  }
}

function applyProfileLabels() {
  var profileScreen = document.getElementById("screen-profile");
  if (!profileScreen) return;

  // Profile field labels
  var rows = profileScreen.querySelectorAll(".profile-row");
  if (rows[0]) rows[0].querySelector(".profile-label").textContent = t("profileName");
  if (rows[1]) rows[1].querySelector(".profile-label").innerHTML = t("profileIncome") + ' <span class="required">*</span>';
  if (rows[2]) rows[2].querySelector(".profile-label").textContent = t("profileCurrency");
  if (rows[3]) rows[3].querySelector(".profile-label").innerHTML = t("profileHours") + ' <span class="required">*</span>';

  var nameInput = document.getElementById("profile-name");
  if (nameInput) nameInput.placeholder = t("profileNamePlaceholder");

  var currSearch = document.getElementById("currency-search");
  if (currSearch) currSearch.placeholder = t("profileCurrencyPlaceholder");

  var hoursSuffix = profileScreen.querySelector(".profile-suffix");
  if (hoursSuffix) hoursSuffix.textContent = t("profileHoursSuffix");

  // Hourly rate card
  var hourlyLabel = profileScreen.querySelector(".hourly-rate-label");
  if (hourlyLabel) hourlyLabel.textContent = t("profileHourlyLabel");
  var hourlyNote = profileScreen.querySelector(".hourly-rate-note");
  if (hourlyNote) hourlyNote.textContent = t("profileHourlyNote");

  // Workday section
  var workdayRows = document.querySelectorAll("#profile-workday-section .profile-row");
  if (workdayRows[0]) workdayRows[0].querySelector(".profile-label").textContent = t("profileStartTime");
  if (workdayRows[1]) {
    workdayRows[1].querySelector(".profile-label").textContent = t("profileDaysLabel");
    var daySuffix = workdayRows[1].querySelector(".profile-suffix");
    if (daySuffix) daySuffix.textContent = t("profileDaysSuffix");
  }

  // Expenses summary
  var expTitle = document.querySelector(".profile-expenses-header .exp-sub-title");
  if (expTitle) expTitle.textContent = t("profileExpensesTitle");
  var editBtn = document.querySelector(".profile-expenses-header .exp-edit-btn");
  if (editBtn) editBtn.textContent = t("profileExpensesEdit");

  // Navigation buttons on profile page
  var profileNav = profileScreen.querySelectorAll(".home-btn");
  if (profileNav[0]) profileNav[0].textContent = t("homeBtnRegular");
  if (profileNav[1]) profileNav[1].textContent = t("homeBtnOnetime");
  if (profileNav[2]) profileNav[2].textContent = t("homeBtnExpenses");

  var profileQuestion = profileScreen.querySelector(".home-question");
  if (profileQuestion) profileQuestion.textContent = t("homeQuestion");

  // Income summary link
  var incomeLinks = profileScreen.querySelectorAll(".income-summary-link");
  for (var i = 0; i < incomeLinks.length; i++) {
    incomeLinks[i].textContent = t("profileUpdateIncome");
  }
}

function applyRegularLabels() {
  var screen = document.getElementById("screen-regular");
  if (!screen) return;

  // Input card labels
  var inputRows = screen.querySelectorAll(".input-row");
  if (inputRows[0]) inputRows[0].querySelector(".input-label").textContent = t("regularItemLabel");
  if (inputRows[1]) inputRows[1].querySelector(".input-label").innerHTML = t("regularTimesLabel") + ' <span class="required">*</span>';
  if (inputRows[2]) inputRows[2].querySelector(".input-label").textContent = t("regularPerLabel");
  if (inputRows[3]) inputRows[3].querySelector(".input-label").innerHTML = t("regularCostLabel") + ' <span class="required">*</span>';

  var itemInput = document.getElementById("regular-item");
  if (itemInput) itemInput.placeholder = t("regularItemPlaceholder");

  // Frequency options
  var freqSelect = document.getElementById("regular-frequency");
  if (freqSelect) {
    freqSelect.options[0].textContent = t("regularFreqDay");
    freqSelect.options[1].textContent = t("regularFreqWeek");
    freqSelect.options[2].textContent = t("regularFreqMonth");
  }

  // Currency note
  var notes = screen.querySelectorAll(".income-summary-note");
  for (var i = 0; i < notes.length; i++) {
    notes[i].textContent = t("regularCurrencyNote");
  }

  // Monthly total suffix
  var totalPeriod = screen.querySelector(".total-period");
  if (totalPeriod) totalPeriod.textContent = t("regularPerMonth");

  // Pie legend
  var pieLegendIncome = screen.querySelector("#regular-pie-legend .pie-legend-income + .pie-legend-text, #regular-pie-legend .pie-legend-item:last-child .pie-legend-text");
  // Use a more targeted approach
  var pieLegendItems = screen.querySelectorAll("#regular-pie-legend .pie-legend-text");
  if (pieLegendItems[1]) pieLegendItems[1].textContent = t("regularPieIncome");

  // Workday card
  var workTitle = screen.querySelector(".workday-title");
  if (workTitle) workTitle.textContent = t("regularWorkdayTitle");
  var workRows = screen.querySelectorAll(".workday-input-row .input-label");
  if (workRows[0]) workRows[0].textContent = t("regularWorkdayStart");
  if (workRows[1]) workRows[1].textContent = t("regularWorkdayDays");
  if (workRows[2]) workRows[2].textContent = t("regularWorkdayDaysSuffix");

  // Warning card
  var warningTitle = screen.querySelector(".warning-title");
  if (warningTitle) warningTitle.textContent = t("regularWarningTitle");
  var warningAdvice = screen.querySelector(".warning-advice");
  if (warningAdvice) warningAdvice.innerHTML = t("regularWarningAdvice");

  // No income
  var noIncomeLink = screen.querySelector(".no-income-link");
  if (noIncomeLink) noIncomeLink.textContent = t("regularNoIncome");

  // Income summary
  var summaryLabels = screen.querySelectorAll(".income-summary-label");
  if (summaryLabels[0]) summaryLabels[0].textContent = t("regularIncomeLabel");
  if (summaryLabels[1]) summaryLabels[1].textContent = t("regularRateLabel");
  var summaryLink = screen.querySelector(".income-summary-link");
  if (summaryLink) summaryLink.textContent = t("profileUpdateIncome");

  // Bottom nav
  var navBtns = screen.querySelectorAll(".bottom-nav .nav-btn");
  if (navBtns[0]) navBtns[0].textContent = t("regularBtnReset");
  if (navBtns[1]) navBtns[1].textContent = t("regularBtnOnetime");
  if (navBtns[2]) navBtns[2].textContent = t("regularBtnExpenses");
}

function applyOnetimeLabels() {
  var screen = document.getElementById("screen-onetime");
  if (!screen) return;

  var inputRows = screen.querySelectorAll(".input-row");
  if (inputRows[0]) inputRows[0].querySelector(".input-label").textContent = t("onetimeItemLabel");
  if (inputRows[1]) inputRows[1].querySelector(".input-label").innerHTML = t("onetimeCostLabel") + ' <span class="required">*</span>';

  var itemInput = document.getElementById("onetime-item");
  if (itemInput) itemInput.placeholder = t("onetimeItemPlaceholder");

  var notes = screen.querySelectorAll(".income-summary-note");
  for (var i = 0; i < notes.length; i++) {
    notes[i].textContent = t("regularCurrencyNote");
  }

  // Pie legend income
  var pieLegendItems = screen.querySelectorAll("#onetime-pie-legend .pie-legend-text");
  if (pieLegendItems[1]) pieLegendItems[1].textContent = t("onetimePieIncome");

  // Saving goal links
  var savLinks = screen.querySelectorAll(".saving-goal-link");
  for (var i = 0; i < savLinks.length; i++) {
    savLinks[i].textContent = t("onetimeSavingLink");
  }

  // Warning
  var warningTitle = screen.querySelector(".warning-title");
  if (warningTitle) warningTitle.textContent = t("onetimeWarningTitle");
  var warningBottom = screen.querySelector(".warning-bottom");
  if (warningBottom) warningBottom.innerHTML = t("onetimeWarningBottom");

  // Saving goal card
  var savTitle = screen.querySelector(".saving-goal-title");
  if (savTitle) savTitle.textContent = t("onetimeSavingTitle");
  var savRow = screen.querySelector(".saving-goal-input-row");
  if (savRow) {
    var labels = savRow.querySelectorAll(".input-label");
    if (labels[0]) labels[0].textContent = t("onetimeSavingLabel");
    if (labels[1]) labels[1].textContent = t("onetimeSavingPerMonth");
  }

  // No income
  var noIncomeLink = screen.querySelector(".no-income-link");
  if (noIncomeLink) noIncomeLink.textContent = t("onetimeNoIncome");

  // Income summary
  var summaryLabels = screen.querySelectorAll(".income-summary-label");
  if (summaryLabels[0]) summaryLabels[0].textContent = t("onetimeIncomeLabel");
  if (summaryLabels[1]) summaryLabels[1].textContent = t("onetimeRateLabel");
  var summaryLink = screen.querySelector(".income-summary-link");
  if (summaryLink) summaryLink.textContent = t("profileUpdateIncome");

  // Bottom nav
  var navBtns = screen.querySelectorAll(".bottom-nav .nav-btn");
  if (navBtns[0]) navBtns[0].textContent = t("onetimeBtnReset");
  if (navBtns[1]) navBtns[1].textContent = t("onetimeBtnRegular");
  if (navBtns[2]) navBtns[2].textContent = t("onetimeBtnExpenses");
}

function applyExpensesLabels() {
  var screen = document.getElementById("screen-expenses");
  if (!screen) return;

  // Subtitle
  var subtitle = document.getElementById("expenses-subtitle");
  if (subtitle) subtitle.textContent = t("expensesSubtitle");

  // No income
  var noIncomeText = screen.querySelector(".exp-no-income-text");
  if (noIncomeText) noIncomeText.innerHTML = t("expensesNoIncome");
  var noIncomeLink = screen.querySelector(".exp-no-income-link");
  if (noIncomeLink) noIncomeLink.textContent = t("expensesNoIncomeLink");

  // Housing step
  var housingTitle = screen.querySelector("#expenses-step-housing .exp-step-title");
  if (housingTitle) housingTitle.textContent = t("housingTitle");
  var housingQ = document.getElementById("housing-question");
  if (housingQ) housingQ.innerHTML = t("housingQuestion");
  var housingNoLabel = document.getElementById("housing-choice-no");
  if (housingNoLabel) housingNoLabel.querySelector(".exp-choice-label").innerHTML = t("housingChoiceNo");
  var housingYesLabel = document.getElementById("housing-choice-yes");
  if (housingYesLabel) housingYesLabel.querySelector(".exp-choice-label").innerHTML = t("housingChoiceYes");
  var housingNoMsg = screen.querySelector("#housing-no-msg .exp-message-text");
  if (housingNoMsg) housingNoMsg.innerHTML = t("housingNoMsg");
  // Housing amount labels
  var housingAmountSection = document.getElementById("housing-amount-section");
  if (housingAmountSection) {
    var hLabels = housingAmountSection.querySelectorAll(".input-label");
    if (hLabels[0]) hLabels[0].textContent = t("housingAmountLabel");
    if (hLabels[1]) hLabels[1].textContent = t("housingAmountSuffix");
  }

  // Utilities step
  var utilitiesTitle = screen.querySelector("#expenses-step-utilities .exp-step-title");
  if (utilitiesTitle) utilitiesTitle.textContent = t("utilitiesTitle");
  var utilitiesQ = document.getElementById("utilities-question");
  if (utilitiesQ) utilitiesQ.innerHTML = t("utilitiesQuestion");
  var utilNoLabel = document.getElementById("utilities-choice-no");
  if (utilNoLabel) utilNoLabel.querySelector(".exp-choice-label").innerHTML = t("utilitiesChoiceNo");
  var utilYesLabel = document.getElementById("utilities-choice-yes");
  if (utilYesLabel) utilYesLabel.querySelector(".exp-choice-label").innerHTML = t("utilitiesChoiceYes");
  var utilNoMsg = screen.querySelector("#utilities-no-msg .exp-message-text");
  if (utilNoMsg) utilNoMsg.innerHTML = t("utilitiesNoMsg");
  var utilTotalLabel = screen.querySelector("#utilities-total-section .input-label");
  if (utilTotalLabel) utilTotalLabel.textContent = t("utilitiesTotalLabel");
  var utilOr = document.getElementById("utilities-or-1");
  if (utilOr) utilOr.querySelector("span").textContent = t("utilitiesOrSeparator");
  var utilBreakdownBtn = document.getElementById("utilities-breakdown-btn");
  if (utilBreakdownBtn) {
    var isOpen = document.getElementById("utilities-breakdown-section").style.display !== "none";
    utilBreakdownBtn.textContent = isOpen ? t("utilitiesBreakdownClose") : t("utilitiesBreakdownOpen");
  }
  // Breakdown labels
  var breakdownLabels = screen.querySelectorAll("#utilities-breakdown-section .exp-breakdown-label");
  if (breakdownLabels[0]) breakdownLabels[0].textContent = t("utilitiesElectricity");
  if (breakdownLabels[1]) breakdownLabels[1].textContent = t("utilitiesWater");
  if (breakdownLabels[2]) breakdownLabels[2].textContent = t("utilitiesInternet");
  if (breakdownLabels[3]) breakdownLabels[3].textContent = t("utilitiesOthers");

  // Food step
  var foodTitle = screen.querySelector("#expenses-step-food .exp-step-title");
  if (foodTitle) foodTitle.textContent = t("foodTitle");
  var foodQ = document.getElementById("food-question");
  if (foodQ) foodQ.innerHTML = t("foodQuestion");
  var foodNoBtn = document.getElementById("food-choice-no");
  if (foodNoBtn) foodNoBtn.querySelector(".exp-choice-label").innerHTML = t("foodChoiceNo");
  var foodYesBtn = document.getElementById("food-choice-yes");
  if (foodYesBtn) foodYesBtn.querySelector(".exp-choice-label").innerHTML = t("foodChoiceYes");
  var foodNoMsg = screen.querySelector("#food-no-msg .exp-message-text");
  if (foodNoMsg) foodNoMsg.textContent = t("foodNoMsg");
  // Food subcategory badges
  var foodBadges = screen.querySelectorAll("#food-breakdown-section .exp-subcat-badge");
  if (foodBadges[0]) foodBadges[0].textContent = t("foodGroceries");
  if (foodBadges[1]) foodBadges[1].textContent = t("foodEatingOut");
  if (foodBadges[2]) foodBadges[2].textContent = t("foodCoffee");
  if (foodBadges[3]) foodBadges[3].textContent = t("foodOthers");
  // Food times labels
  var foodTimesLabels = screen.querySelectorAll("#food-breakdown-section .exp-times-label");
  for (var i = 0; i < foodTimesLabels.length; i++) {
    foodTimesLabels[i].textContent = (i % 2 === 0) ? t("foodTimesLabel") : t("foodTimesPerMonth");
  }

  // Transport step
  var transTitle = screen.querySelector("#expenses-step-transport .exp-step-title");
  if (transTitle) transTitle.textContent = t("transportTitle");
  var transQ = document.getElementById("transport-question");
  if (transQ) transQ.innerHTML = t("transportQuestion");
  var transNoBtn = document.getElementById("transport-choice-no");
  if (transNoBtn) transNoBtn.querySelector(".exp-choice-label").innerHTML = t("transportChoiceNo");
  var transYesBtn = document.getElementById("transport-choice-yes");
  if (transYesBtn) transYesBtn.querySelector(".exp-choice-label").innerHTML = t("transportChoiceYes");
  var transNoMsg = screen.querySelector("#transport-no-msg .exp-message-text");
  if (transNoMsg) transNoMsg.textContent = t("transportNoMsg");
  // Transport subcategory badges
  var transBadges = screen.querySelectorAll("#transport-breakdown-section .exp-subcat-badge");
  if (transBadges[0]) transBadges[0].textContent = t("transportRental");
  if (transBadges[1]) transBadges[1].textContent = t("transportGas");
  if (transBadges[2]) transBadges[2].textContent = t("transportUber");
  if (transBadges[3]) transBadges[3].textContent = t("transportOthers");
  // Transport times labels
  var transTimesLabels = screen.querySelectorAll("#transport-breakdown-section .exp-times-label");
  if (transTimesLabels[0]) transTimesLabels[0].textContent = t("transportPerMonth");
  for (var j = 1; j < transTimesLabels.length; j++) {
    transTimesLabels[j].textContent = (j % 2 === 1) ? t("transportTimesLabel") : t("transportTimesPerMonth");
  }

  // Currency notes in expenses
  var currencyNotes = screen.querySelectorAll(".income-summary-note");
  for (var k = 0; k < currencyNotes.length; k++) {
    currencyNotes[k].textContent = t("regularCurrencyNote");
  }

  // Milestone
  var promptTitle = screen.querySelector(".exp-other-prompt-title");
  if (promptTitle) promptTitle.textContent = t("milestonePromptTitle");
  var promptSub = screen.querySelector(".exp-other-prompt-subtitle");
  if (promptSub) promptSub.textContent = t("milestonePromptSubtitle");
  var promptYes = screen.querySelector(".exp-other-prompt-btn-yes");
  if (promptYes) promptYes.textContent = t("milestonePromptYes");
  var promptSkip = screen.querySelector(".exp-other-prompt-btn-skip");
  if (promptSkip) promptSkip.textContent = t("milestonePromptSkip");

  // Other expenses step
  var otherSub = document.getElementById("other-expenses-subtitle");
  if (otherSub) otherSub.textContent = t("otherExpSubtitle");
  var otherTitle = screen.querySelector(".exp-other-section-title");
  if (otherTitle) otherTitle.textContent = t("otherExpSectionTitle");
  var otherSearch = document.getElementById("other-expenses-search");
  if (otherSearch) otherSearch.placeholder = t("otherExpSearchPlaceholder");
  var noResultsText = screen.querySelector(".exp-other-no-results-text");
  if (noResultsText) noResultsText.innerHTML = t("otherExpNoResults");
  var overIncTitle = screen.querySelector(".exp-other-over-income-title");
  if (overIncTitle) overIncTitle.textContent = t("otherExpOverIncomeTitle");
  var overIncText = screen.querySelector(".exp-other-over-income-text");
  if (overIncText) overIncText.innerHTML = t("otherExpOverIncomeText");

  // Over income buttons
  var overIncReview = screen.querySelector(".exp-other-over-income-btn[onclick='dismissOtherOverIncome()']");
  if (overIncReview) overIncReview.textContent = t("otherExpOverIncomeReview");
  var overIncAdjust = screen.querySelector(".exp-other-over-income-btn[onclick='adjustIncomeFromOther()']");
  if (overIncAdjust) overIncAdjust.textContent = t("otherExpOverIncomeAdjust");

  // Result page
  applyResultLabels();
}

function applyResultLabels() {
  // Section 1
  setText("#res-section-numbers .res-title", t("resNumbersTitle"));
  setText(".res-card-earn .res-summary-label", t("resEarnLabel"));
  setText(".res-card-spend .res-summary-label", t("resSpendLabel"));
  setText(".res-card-save .res-summary-label", t("resSaveLabel"));

  // Section 2
  setText("#res-section-time .res-title", t("resTimeTitle"));

  // Section 3
  setText("#res-section-ahead .res-title", t("resAheadTitle"));
  setText(".res-ahead-label", t("resAheadSavingLabel"));
  setText(".res-ahead-unit", t("resAheadPerYear"));
  setHTML(".res-ahead-explain", t("resAheadExplain"));
  setText(".res-ahead-bottom-card:first-child .res-ahead-bottom-label", t("resAheadEmergencyLabel"));

  // Section 4
  setText("#res-section-health .res-title", t("resHealthTitle"));
  var colTitles = document.querySelectorAll(".res-health-col-title");
  if (colTitles[0]) colTitles[0].textContent = t("resHealthYouLabel");
  if (colTitles[1]) colTitles[1].textContent = t("resHealthRecommended");
  var catLabels = document.querySelectorAll(".res-health-cat-label");
  if (catLabels[0]) catLabels[0].textContent = t("resHealthNeeds");
  if (catLabels[1]) catLabels[1].textContent = t("resHealthWants");
  if (catLabels[2]) catLabels[2].textContent = t("resHealthSavings");
  setHTML(".res-health-footnote", t("resHealthFootnote"));
  setText(".res-score-title", t("resScoreTitle"));

  // Health tier names
  var tierRows = document.querySelectorAll(".res-score-row");
  var tierNames = [t("tierTight"), t("tierStretched"), t("tierBalance"), t("tierHealthy"), t("tierStrong")];
  for (var i = 0; i < tierRows.length && i < tierNames.length; i++) {
    var nameEl = tierRows[i].querySelector(".res-score-name");
    if (nameEl) nameEl.textContent = tierNames[i];
  }

  // Section 5
  setText("#res-section-whatif .res-title", t("resWhatifTitle"));
  setText(".whatif-subtitle", t("resWhatifSubtitle"));
  setText(".whatif-divider-label", t("resWhatifDividerLabel"));

  // What-if category names
  var whatifCatNames = document.querySelectorAll(".whatif-cat-name");
  var catNameMap = ["🏠 " + t("catHousing"), "⚡ " + t("catUtilities"), "🍜 " + t("catFood"), "🚗 " + t("catTransport"), "🎭 " + t("catOthers")];
  for (var j = 0; j < whatifCatNames.length && j < catNameMap.length; j++) {
    whatifCatNames[j].textContent = catNameMap[j];
  }

  // What-if impact labels
  var impactLabels = document.querySelectorAll(".whatif-impact-label");
  if (impactLabels[0]) impactLabels[0].textContent = t("resWhatifSpendLabel");
  if (impactLabels[1]) impactLabels[1].textContent = t("resWhatifHealthLabel");
  if (impactLabels[2]) impactLabels[2].textContent = t("resWhatifSaveLabel");

  // What-if no change
  var noChanges = document.querySelectorAll(".whatif-impact-delta.neutral");
  for (var nc = 0; nc < noChanges.length; nc++) {
    noChanges[nc].textContent = t("resWhatifNoChange");
  }

  var resetBtn = document.getElementById("whatif-btn-reset");
  if (resetBtn) resetBtn.textContent = t("resWhatifReset");

  // Section 6
  setText("#res-section-amend .res-title", t("resAmendTitle"));
  setText(".res-amend-subtitle", t("resAmendSubtitle"));

  // Amend button labels
  var amendLabels = document.querySelectorAll("#res-amend-buttons .res-amend-label");
  var amendNames = [t("catHousing"), t("catUtilities"), t("catFood"), t("catTransport"), t("catOthers"), t("catIncomeMonth")];
  for (var al = 0; al < amendLabels.length && al < amendNames.length; al++) {
    amendLabels[al].textContent = amendNames[al];
  }
}

function applyModalLabels() {
  // Welcome-back modal
  var wbTitle = document.querySelector(".wb-modal-title");
  if (wbTitle) wbTitle.textContent = t("wbTitle");
  var wbSub = document.querySelector(".wb-modal-subtitle");
  if (wbSub) wbSub.textContent = t("wbSubtitle");
  var wbResult = document.querySelector(".wb-modal-result-btn");
  if (wbResult) wbResult.textContent = t("wbResultBtn");
  var wbFresh = document.querySelector(".wb-modal-start-btn");
  if (wbFresh) wbFresh.textContent = t("wbStartFresh");

  // WB amend labels
  var wbAmendLabels = document.querySelectorAll("#wb-modal-buttons .res-amend-label");
  var wbNames = [t("catHousing"), t("catUtilities"), t("catFood"), t("catTransport"), t("catOthers"), t("catIncomeMonth")];
  for (var i = 0; i < wbAmendLabels.length && i < wbNames.length; i++) {
    wbAmendLabels[i].textContent = wbNames[i];
  }

  // Over-income modal
  var oiTitle = document.querySelector("#over-income-modal .modal-title");
  if (oiTitle) oiTitle.textContent = t("overIncomeTitle");
  var oiBody = document.querySelector("#over-income-modal .modal-body");
  if (oiBody) oiBody.textContent = t("overIncomeBody");
  var oiReview = document.querySelector(".modal-btn-review");
  if (oiReview) oiReview.textContent = t("overIncomeReview");
  var oiAdjust = document.querySelector(".modal-btn-adjust");
  if (oiAdjust) oiAdjust.textContent = t("overIncomeAdjust");
}

/** Update the OTHER_EXPENSE_CATEGORIES labels to match current language */
function updateOtherExpenseCategoryLabels() {
  var labelMap = {
    entertainment: "otherCatEntertainment",
    subscriptions: "otherCatSubscriptions",
    healthWellness: "otherCatHealthWellness",
    shopping: "otherCatShopping",
    educationWork: "otherCatEducationWork",
    childCare: "otherCatChildCare",
    tax: "otherCatTax",
    loansInvestments: "otherCatLoansInvestments",
    socialResponsibilities: "otherCatSocialResponsibilities",
    insurance: "otherCatInsurance",
    others: "otherCatOthers"
  };
  for (var i = 0; i < OTHER_EXPENSE_CATEGORIES.length; i++) {
    var cat = OTHER_EXPENSE_CATEGORIES[i];
    if (labelMap[cat.key]) {
      cat.label = t(labelMap[cat.key]);
    }
  }
}

/* --- Language dropdown & popup --- */

var langDropdownOpen = false;

/** Toggle language dropdown on a lang button */
function toggleLangDropdown(event) {
  event.stopPropagation();
  var btn = event.currentTarget;

  // Close any existing dropdown
  closeLangDropdown();

  // Create dropdown
  var dropdown = document.createElement("div");
  dropdown.className = "lang-dropdown";
  dropdown.id = "lang-dropdown-menu";

  LANGUAGES.forEach(function(lang) {
    var option = document.createElement("button");
    option.className = "lang-dropdown-option";
    if (lang.code === currentLang) option.classList.add("active");
    option.innerHTML = '<span class="lang-dropdown-flag">' + lang.flag + '</span>' +
                       '<span class="lang-dropdown-label">' + lang.label + '</span>';
    option.addEventListener("click", function(e) {
      e.stopPropagation();
      setLanguage(lang.code);
    });
    dropdown.appendChild(option);
  });

  // Position relative to the button
  btn.style.position = "relative";
  btn.appendChild(dropdown);
  langDropdownOpen = true;

  // Close on outside click
  setTimeout(function() {
    document.addEventListener("click", closeLangDropdownHandler);
  }, 10);
}

function closeLangDropdownHandler() {
  closeLangDropdown();
  document.removeEventListener("click", closeLangDropdownHandler);
}

function closeLangDropdown() {
  var existing = document.getElementById("lang-dropdown-menu");
  if (existing) existing.remove();
  langDropdownOpen = false;
}

/** Show language selection popup for first-time users */
function showLanguagePopup() {
  var popup = document.getElementById("lang-popup-modal");
  if (popup) popup.style.display = "flex";
}

function dismissLanguagePopup() {
  var popup = document.getElementById("lang-popup-modal");
  if (popup) popup.style.display = "none";
  localStorage.setItem("worthMyMoneyLangChosen", "true");
  showOnboarding();
}

function selectLanguageFromPopup(langCode) {
  setLanguage(langCode);
  dismissLanguagePopup();
}

/** Open the feedback form in a new tab (language-aware) */
function openFeedback() {
  var url = t("feedbackUrl");
  if (url && url !== "feedbackUrl") {
    window.open(url, "_blank");
  }
}

/* ============================================================
   1. CONSTANTS & STATE
   ============================================================ */
var WEEKS_PER_MONTH = 4.33;
var DAYS_PER_MONTH = 30.44;

/** Load profile from localStorage or return defaults */
function loadProfile() {
  var saved = localStorage.getItem("worthMyMoneyProfile");
  if (saved) {
    return JSON.parse(saved);
  }
  return {
    name: "",
    income: 0,
    currency: "USD",
    hoursPerWeek: 40,
  };
}

var profile = loadProfile();
var lastRegularResult = null;
var lastOnetimeResult = null;
var navigationHistory = [];

/** Load expenses from localStorage */
function loadExpenses() {
  var saved = localStorage.getItem("worthMyMoneyExpenses");
  if (saved) return JSON.parse(saved);
  return null;
}

var expensesData = loadExpenses();
var expenseStep = 'housing';
var _calcTotalExpenses = 0; /* cached for emergency fund calculator */

/* ============================================================
   2. NAVIGATION
   ============================================================ */

/** Navigate to a screen by ID */
function navigateTo(screenId) {
  var currentScreen = document.querySelector(".screen.active");
  if (currentScreen) {
    navigationHistory.push(currentScreen.id.replace("screen-", ""));
    currentScreen.classList.remove("active");
  }

  var target = document.getElementById("screen-" + screenId);
  if (target) {
    target.classList.add("active");
  }

  sessionStorage.setItem("worthMyMoneyScreen", screenId);
  window.scrollTo(0, 0);

  if (screenId === "profile") populateProfileForm();
  if (screenId === "regular") updateCurrencyBadge("regular");
  if (screenId === "onetime") updateCurrencyBadge("onetime");
  if (screenId === "expenses") initExpensesScreen(true);
}

/** Go back to previous screen */
function navigateBack() {
  if (navigationHistory.length > 0) {
    var prev = navigationHistory.pop();
    var currentScreen = document.querySelector(".screen.active");
    if (currentScreen) currentScreen.classList.remove("active");
    document.getElementById("screen-" + prev).classList.add("active");

    // If returning from profile after amending income, re-render result page
    if (amendingFromResult && prev === "expenses") {
      amendingFromResult = false;
      sessionStorage.removeItem("worthMyMoneyAmending");
      showExpenseStep("result");
    }
  } else {
    navigateTo("home");
  }
}

/* ============================================================
   3. PROFILE MANAGEMENT
   ============================================================ */

/** Fill the profile form with current data */
function populateProfileForm() {
  document.getElementById("profile-name").value = profile.name;
  document.getElementById("profile-income").value = profile.income
    ? formatNumber(profile.income)
    : "";
  document.getElementById("profile-hours").value = profile.hoursPerWeek || "";

  var found = CURRENCIES.find(function (c) { return c.code === profile.currency; });
  var searchInput = document.getElementById("currency-search");
  if (found) {
    searchInput.value = found.code + " - " + found.name;
  }
  document.getElementById("profile-currency").value = profile.currency;

  updateHourlyRateCard();
  showProfileWorkdayFields();
  updateProfileExpenses();
}

/** Core profile save — notify=true shows validation + toast, false for silent auto-save */
var profileAutoSaveTimer = null;

function saveProfileCore(notify) {
  var incomeVal = parseFormattedNumber(document.getElementById("profile-income").value);
  var hoursVal = parseFormattedNumber(document.getElementById("profile-hours").value);

  if (notify) {
    var missing = [];
    if (!incomeVal) missing.push("profile-income");
    if (!hoursVal) missing.push("profile-hours");
    if (missing.length) { showValidationError(missing); return; }
  }

  profile.name = document.getElementById("profile-name").value.trim();
  profile.income = incomeVal;
  profile.currency = document.getElementById("profile-currency").value || profile.currency;
  profile.hoursPerWeek = hoursVal;

  localStorage.setItem("worthMyMoneyProfile", JSON.stringify(profile));
  updateHourlyRateCard();
  if (notify) showToast(t("toastProfileSaved"));
}

/** Save profile (manual button click — validates + shows toast) */
function saveProfile() {
  saveProfileCore(true);
}

/** Auto-save profile on input change (debounced, silent) */
function autoSaveProfile() {
  clearTimeout(profileAutoSaveTimer);
  profileAutoSaveTimer = setTimeout(function() {
    saveProfileCore(false);
  }, 500);
}

/** Show workday fields in profile if user has set them */
function showProfileWorkdayFields() {
  var section = document.getElementById("profile-workday-section");
  if (profile.workStartTime || profile.daysPerWeek) {
    section.style.display = "";
    document.getElementById("profile-start-time").value = profile.workStartTime || "08:30";
    document.getElementById("profile-days-per-week").value = profile.daysPerWeek || "";
  }
}

/** Save workday data from profile page */
function saveProfileWorkday() {
  profile.workStartTime = document.getElementById("profile-start-time").value;
  profile.daysPerWeek = parseFloat(
    document.getElementById("profile-days-per-week").value.replace(",", ".")
  ) || 5;
  localStorage.setItem("worthMyMoneyProfile", JSON.stringify(profile));
  showToast(t("toastWorkdaySaved"));
}

/* ============================================================
   4. SEARCHABLE CURRENCY DROPDOWN
   ============================================================ */

function setupCurrencySearch() {
  var searchInput = document.getElementById("currency-search");
  var dropdown = document.getElementById("currency-dropdown");
  var hiddenInput = document.getElementById("profile-currency");

  function renderOptions(filter) {
    dropdown.innerHTML = "";
    var query = (filter || "").toLowerCase();
    var filtered = CURRENCIES.filter(function (c) {
      return (
        c.code.toLowerCase().includes(query) ||
        c.name.toLowerCase().includes(query) ||
        c.symbol.toLowerCase().includes(query)
      );
    });

    if (filtered.length === 0) {
      var noResult = document.createElement("div");
      noResult.className = "currency-no-results";
      noResult.textContent = t("currencyNoResult");
      dropdown.appendChild(noResult);
      return;
    }

    filtered.forEach(function (c) {
      var opt = document.createElement("div");
      opt.className = "currency-option";
      opt.textContent = c.code + " - " + c.name;
      opt.dataset.code = c.code;
      opt.addEventListener("mousedown", function (e) {
        e.preventDefault();
        selectCurrency(c);
      });
      dropdown.appendChild(opt);
    });
  }

  function selectCurrency(c) {
    hiddenInput.value = c.code;
    searchInput.value = c.code + " - " + c.name;
    dropdown.classList.remove("open");
    autoSaveProfile();
  }

  searchInput.addEventListener("focus", function () {
    this.select();
    renderOptions("");
    dropdown.classList.add("open");
  });

  searchInput.addEventListener("input", function () {
    renderOptions(this.value);
    dropdown.classList.add("open");
  });

  searchInput.addEventListener("blur", function () {
    dropdown.classList.remove("open");
    var current = hiddenInput.value;
    var found = CURRENCIES.find(function (c) { return c.code === current; });
    if (found) {
      searchInput.value = found.code + " - " + found.name;
    }
  });
}

/* ============================================================
   5. CURRENCY HELPERS
   ============================================================ */

function getCurrencyDisplay() {
  var found = CURRENCIES.find(function (c) { return c.code === profile.currency; });
  return found ? found.symbol : profile.currency;
}

function updateCurrencyBadge(screen) {
  var badge = document.getElementById(screen + "-currency-badge");
  if (badge) {
    badge.textContent = getCurrencyDisplay();
  }
}

/* ============================================================
   6. NUMBER FORMATTING
   ============================================================ */

/** Format number with comma thousand separators */
function formatNumber(num) {
  if (num === null || num === undefined || isNaN(num)) return "0";
  var parts = num.toString().split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.join(".");
}

/** Format with 1 decimal place (truncated, not rounded) */
function formatDecimal(num) {
  return formatNumber(Math.floor(num * 10) / 10);
}

/** Smart rounding based on value magnitude */
function roundForDisplay(num) {
  if (num >= 1000) return Math.round(num / 100) * 100;
  if (num >= 10) return Math.round(num);
  return Math.round(num * 100) / 100;
}

/** Parse a formatted string back to a number */
function parseFormattedNumber(str) {
  if (!str) return 0;
  return parseFloat(str.toString().replace(/,/g, "")) || 0;
}

/** Format currency value: "VND 10,000,000" */
function formatCurrency(amount) {
  return getCurrencyDisplay() + " " + formatNumber(Math.round(amount));
}

/** Compact format: 6000000 → "6,000K", 500000 → "500K", 1200 → "1,200" */
function formatCompact(num) {
  if (num >= 1000000) return formatNumber(Math.round(num / 1000)) + "K";
  if (num >= 10000) return formatNumber(Math.round(num / 1000)) + "K";
  return formatNumber(Math.round(num));
}

/* ============================================================
   7. HOURLY RATE CALCULATION
   ============================================================ */

function calculateHourlyRate() {
  if (!profile.income || !profile.hoursPerWeek) return 0;
  return profile.income / (profile.hoursPerWeek * WEEKS_PER_MONTH);
}

function updateHourlyRateCard() {
  var card = document.getElementById("hourly-rate-card");
  var value = document.getElementById("hourly-rate-value");

  if (profile.income > 0 && profile.hoursPerWeek > 0) {
    var rate = calculateHourlyRate();
    value.textContent = getCurrencyDisplay() + " " + formatNumber(roundForDisplay(rate));
    card.classList.add("visible");
  } else {
    card.classList.remove("visible");
  }
}

/* ============================================================
   8. REGULAR PURCHASE CALCULATION
   ============================================================ */

function calculateRegular() {
  var rawItem = document.getElementById("regular-item").value.trim();
  var item = rawItem || t("defaultItemRegular");
  var yourItem = rawItem || t("defaultItemRegular");
  var times = parseFormattedNumber(document.getElementById("regular-times").value);
  var frequency = document.getElementById("regular-frequency").value;
  var cost = parseFormattedNumber(document.getElementById("regular-cost").value);

  var missing = [];
  if (!times) missing.push("regular-times");
  if (!cost) missing.push("regular-cost");
  if (missing.length) { showValidationError(missing); return; }

  /* Calculate monthly cost */
  var monthlyTotal = 0;
  if (frequency === "day") {
    monthlyTotal = times * cost * DAYS_PER_MONTH;
  } else if (frequency === "week") {
    monthlyTotal = times * cost * WEEKS_PER_MONTH;
  } else {
    monthlyTotal = times * cost;
  }

  /* Show monthly total */
  document.getElementById("regular-monthly-total").style.display = "flex";
  document.getElementById("regular-total-amount").textContent = formatCurrency(monthlyTotal);

  showIncomeSummary("regular");

  /* No income set */
  if (!profile.income) {
    hideElement("regular-result-normal");
    hideElement("regular-result-warning");
    hideElement("regular-workday-card");
    showElement("regular-no-income");
    showElement("regular-bottom-nav");
    lastRegularResult = { item: item, monthlyTotal: monthlyTotal, hasIncome: false };
    return;
  }

  hideElement("regular-no-income");

  var hourlyRate = calculateHourlyRate();
  var monthlyHours = profile.hoursPerWeek * WEEKS_PER_MONTH;
  var hoursNeeded = monthlyTotal / hourlyRate;
  var percentOfIncome = (monthlyTotal / profile.income) * 100;

  lastRegularResult = {
    item: item,
    yourItem: yourItem,
    monthlyTotal: monthlyTotal,
    hoursNeeded: hoursNeeded,
    percentOfIncome: percentOfIncome,
    monthlyHours: monthlyHours,
    hasIncome: true,
  };

  if (percentOfIncome <= 100) {
    /* Normal result (purple card) */
    hideElement("regular-result-warning");
    showElement("regular-result-normal");
    showElement("regular-workday-card");
    hideElement("workday-result");
    prefillWorkdayInputs();

    var resultText = document.getElementById("regular-result-text");
    var prefix = profile.name
      ? (currentLang === "vi" ? profile.name + ", bạn làm " : profile.name + ", you work ")
      : (currentLang === "vi" ? "Bạn làm " : "You work ");
    var suffix = currentLang === "vi"
      ? " giờ</span>/ tháng để chi trả cho " + yourItem + ".<br>Tức là khoảng <span class='highlight-bold'>" + formatDecimal(percentOfIncome) + "%</span> thu nhập hàng tháng."
      : " hours</span>/ month to pay for " + yourItem + ".<br>That's <span class='highlight-bold'>" + formatDecimal(percentOfIncome) + "%</span> of your monthly income.";
    resultText.innerHTML = prefix + "<span class='highlight'>" + formatDecimal(hoursNeeded) + suffix;

    document.getElementById("regular-pie-label").textContent = yourItem;
    drawPie("regular-pie-chart", percentOfIncome);
  } else {
    /* Warning result (red card) */
    hideElement("regular-result-normal");
    hideElement("regular-workday-card");
    showElement("regular-result-warning");

    var monthlyHoursRounded = Math.floor(monthlyHours);
    var hoursNeededRounded = Math.round(hoursNeeded);
    var hoursShort = hoursNeededRounded - monthlyHoursRounded;

    if (currentLang === "vi") {
      document.getElementById("regular-warning-text").innerHTML =
        "Cần tới " + formatNumber(hoursNeededRounded) + " giờ làm mỗi tháng để chi trả cho khoản này.<br>" +
        "Bạn chỉ làm " + formatNumber(monthlyHoursRounded) + " giờ/ tháng.<br>" +
        (rawItem ? rawItem + " của bạn chiếm " : "Món này chiếm ") + Math.round(percentOfIncome) + "% thu nhập.<br>" +
        "Dù làm không nghỉ, bạn vẫn thiếu " + formatNumber(hoursShort) + " giờ!!!";
    } else {
      document.getElementById("regular-warning-text").innerHTML =
        "Requires " + formatNumber(hoursNeededRounded) + " work hours per month.<br>" +
        "You only work " + formatNumber(monthlyHoursRounded) + " hours/month.<br>" +
        (rawItem ? rawItem + " takes up " : "This takes up ") + Math.round(percentOfIncome) + "% of income.<br>" +
        "Even working non-stop, you're short " + formatNumber(hoursShort) + " hours!!!";
    }
  }

  showElement("regular-bottom-nav");
}

/* ============================================================
   9. WORKDAY VISUALIZATION (regular purchases only)
   ============================================================ */

function calculateWorkday() {
  if (!lastRegularResult || !lastRegularResult.hasIncome) return;

  var startTimeStr = document.getElementById("workday-start-time").value;
  var daysRaw = document.getElementById("workday-days-per-week").value.replace(",", ".");
  var daysPerWeek = parseFloat(daysRaw);

  if (!startTimeStr || !daysRaw || isNaN(daysPerWeek) || daysPerWeek <= 0) {
    var missing = [];
    if (!startTimeStr) missing.push("workday-start-time");
    if (!daysRaw || isNaN(daysPerWeek) || daysPerWeek <= 0) missing.push("workday-days-per-week");
    showValidationError(missing);
    return;
  }

  /* Save to profile */
  profile.workStartTime = startTimeStr;
  profile.daysPerWeek = daysPerWeek;
  localStorage.setItem("worthMyMoneyProfile", JSON.stringify(profile));
  showProfileWorkdayFields();

  /* Calculate daily minutes */
  var workDaysPerMonth = daysPerWeek * WEEKS_PER_MONTH;
  var dailyMinutes = Math.round((lastRegularResult.hoursNeeded / workDaysPerMonth) * 60);

  /* Calculate end time */
  var parts = startTimeStr.split(":");
  var totalEndMinutes = parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10) + dailyMinutes;
  var endHour = Math.floor(totalEndMinutes / 60) % 24;
  var endMin = totalEndMinutes % 60;
  var endTimeStr = String(endHour).padStart(2, "0") + ":" + String(endMin).padStart(2, "0");

  /* Store for sharing */
  lastRegularResult.workday = {
    dailyMinutes: dailyMinutes,
    startTime: startTimeStr,
    endTime: endTimeStr,
    item: lastRegularResult.item,
  };

  /* Format duration: minutes if < 60, otherwise hours + minutes */
  var durationStr;
  if (dailyMinutes < 60) {
    durationStr = dailyMinutes + " " + t("unitMinutes");
  } else {
    var h = Math.floor(dailyMinutes / 60);
    var m = dailyMinutes % 60;
    durationStr = h + " " + t("unitHours");
    if (m > 0) durationStr += " " + m + " " + t("unitMinutes");
  }

  /* Display result */
  document.getElementById("workday-result").style.display = "";
  if (currentLang === "vi") {
    document.getElementById("workday-result-text").innerHTML =
      "Mỗi ngày đi làm, bạn cày <span class='highlight'>" + durationStr +
      "</span> để kiếm tiền mua <strong>" + lastRegularResult.yourItem +
      "</strong>.<br>Tức là từ <span class='highlight-bold'>" + startTimeStr +
      " – " + endTimeStr + "</span>.<br>Có đáng không? Bạn tự quyết định nha!";
  } else {
    document.getElementById("workday-result-text").innerHTML =
      "Every workday, you grind <span class='highlight'>" + durationStr +
      "</span> to pay for <strong>" + lastRegularResult.yourItem +
      "</strong>.<br>That's <span class='highlight-bold'>" + startTimeStr +
      " – " + endTimeStr + "</span>.<br>Is it worth it? Only you know.";
  }
}

function prefillWorkdayInputs() {
  if (profile.workStartTime) {
    document.getElementById("workday-start-time").value = profile.workStartTime;
  }
  if (profile.daysPerWeek) {
    document.getElementById("workday-days-per-week").value = profile.daysPerWeek;
  }
}

function shareWorkdayResult() {
  var card = document.getElementById("regular-workday-card");
  if (card && card.style.display !== "none") {
    captureAndShare(card);
  }
}

/* ============================================================
   10. ONE-TIME PURCHASE CALCULATION
   ============================================================ */

function calculateOnetime() {
  var rawItem = document.getElementById("onetime-item").value.trim();
  var item = rawItem || t("defaultItemRegular");
  var yourItem = rawItem || t("defaultItemRegular");
  var cost = parseFormattedNumber(document.getElementById("onetime-cost").value);

  if (!cost) { showValidationError(["onetime-cost"]); return; }

  showIncomeSummary("onetime");

  /* No income set */
  if (!profile.income) {
    hideElement("onetime-result-normal");
    hideElement("onetime-result-warning");
    showElement("onetime-no-income");
    showElement("onetime-bottom-nav");
    lastOnetimeResult = { item: item, cost: cost, hasIncome: false };
    return;
  }

  hideElement("onetime-no-income");

  var hourlyRate = calculateHourlyRate();
  var percentOfIncome = (cost / profile.income) * 100;
  var hoursNeeded = cost / hourlyRate;
  var monthsOfIncome = cost / profile.income;

  lastOnetimeResult = {
    item: item,
    yourItem: yourItem,
    cost: cost,
    hoursNeeded: hoursNeeded,
    percentOfIncome: percentOfIncome,
    monthsOfIncome: monthsOfIncome,
    hasIncome: true,
  };

  /* Hide saving goal card on new calculation */
  hideElement("onetime-saving-goal");
  hideElement("saving-goal-result");

  if (percentOfIncome <= 100) {
    /* Normal result (green card) */
    hideElement("onetime-result-warning");
    showElement("onetime-result-normal");

    var resultText = document.getElementById("onetime-result-text");
    if (currentLang === "vi") {
      var prefix = profile.name ? profile.name + ", bạn" : "Bạn";
      resultText.innerHTML =
        prefix + " cần làm việc <span class='highlight'>" + formatDecimal(hoursNeeded) +
        " giờ</span> để chi trả cho khoản này.<br> Nghĩa là <span class='highlight-bold'>" +
        formatDecimal(percentOfIncome) + "%</span> thu nhập hàng tháng.";
    } else {
      var prefix = profile.name ? profile.name + ", you" : "You";
      resultText.innerHTML =
        prefix + " need to work <span class='highlight'>" + formatDecimal(hoursNeeded) +
        " hours</span> to afford this.<br>That's <span class='highlight-bold'>" +
        formatDecimal(percentOfIncome) + "%</span> of your monthly income.";
    }

    document.getElementById("onetime-pie-label").textContent = yourItem;
    drawPie("onetime-pie-chart", percentOfIncome);
  } else {
    /* Warning result (red card) */
    hideElement("onetime-result-normal");
    showElement("onetime-result-warning");

    if (currentLang === "vi") {
      document.getElementById("onetime-warning-text").innerHTML =
        "Tận <span class='highlight'>" + formatDecimal(monthsOfIncome) +
        " tháng</span> thu nhập mới đủ chi trả cho khoản này. " +
        "Tương đương <span class='highlight'>" + formatNumber(Math.round(hoursNeeded)) +
        " giờ</span> làm việc.";
    } else {
      document.getElementById("onetime-warning-text").innerHTML =
        "It would take <span class='highlight'>" + formatDecimal(monthsOfIncome) +
        " months</span> of income to afford this. " +
        "That's <span class='highlight'>" + formatNumber(Math.round(hoursNeeded)) +
        " hours</span> of work.";
    }

    /* Saving plans as visual tiers */
    var currency = getCurrencyDisplay();
    var tiers = [
      { label: t("savingTierAggressive"), pct: 50 },
      { label: t("savingTierBalanced"), pct: 25 },
      { label: t("savingTierRelaxed"), pct: 10 },
    ];

    var tiersHTML = "<p class='saving-tiers-heading'>" + t("savingTiersHeading") + "</p><div class='saving-tiers-row'>";
    tiers.forEach(function (tier) {
      var saving = Math.round(profile.income * tier.pct / 100);
      var months = Math.ceil(cost / saving);
      tiersHTML +=
        "<div class='saving-tier'>" +
          "<div class='saving-tier-label'>" + tier.label + "</div>" +
          "<div class='saving-tier-months'>" + months + " <small>" + t("unitMonths") + "</small></div>" +
          "<div class='saving-tier-detail'>" + currency + " " + formatCompact(saving) + t("regularPerMonth") + "</div>" +
          "<div class='saving-tier-pct'>" + tier.pct + "% " + t("savingTierOfIncome") + "</div>" +
        "</div>";
    });
    tiersHTML += "</div>";

    document.getElementById("onetime-warning-advice").innerHTML = tiersHTML;
  }

  /* Update saving goal currency badge */
  var savingBadge = document.getElementById("saving-currency-badge");
  if (savingBadge) savingBadge.textContent = getCurrencyDisplay();

  showElement("onetime-bottom-nav");
}

/* ------------------------------------------------------------
   10b. Saving Goal Calculator
   ------------------------------------------------------------ */

/** Toggle the saving goal card visibility */
function toggleSavingGoal() {
  var card = document.getElementById("onetime-saving-goal");
  if (card.style.display === "none" || card.style.display === "") {
    showElement("onetime-saving-goal");
    hideElement("saving-goal-result");
    document.getElementById("saving-amount").value = "";
    document.getElementById("saving-amount").focus();
  } else {
    hideElement("onetime-saving-goal");
  }
}

/** Calculate saving goal based on user's monthly saving amount */
function calculateSavingGoal() {
  if (!lastOnetimeResult || !lastOnetimeResult.hasIncome) return;

  var savingPerMonth = parseFormattedNumber(document.getElementById("saving-amount").value);
  if (!savingPerMonth) { showValidationError(["saving-amount"]); return; }

  var cost = lastOnetimeResult.cost;
  var item = lastOnetimeResult.item;
  var monthsNeeded = Math.ceil(cost / savingPerMonth);
  var percentOfIncome = Math.round((savingPerMonth / profile.income) * 100);

  /* Calculate target date */
  var targetDate = new Date();
  targetDate.setMonth(targetDate.getMonth() + monthsNeeded);
  var targetStr = getMonthName(targetDate.getMonth()) + " " + targetDate.getFullYear();

  /* Build result text */
  var resultEl = document.getElementById("saving-goal-result-text");
  var nameStr = profile.name || t("defaultYou");

  var yourItem = lastOnetimeResult.yourItem || item;
  if (currentLang === "vi") {
    resultEl.innerHTML =
      nameStr + ", bạn có thể chi trả cho <strong>" + yourItem + "<br> </strong> sau <span class='highlight'>" +
      monthsNeeded + " tháng</span>!" +
      "<br> Tiết kiệm <span class='highlight-bold'>" + getCurrencyDisplay() + " " + formatNumber(savingPerMonth) +
      "/tháng</span> (" + percentOfIncome + "% thu nhập) và bạn sẽ đạt mục tiêu vào <span class='highlight'>" + targetStr + "</span>";
  } else {
    resultEl.innerHTML =
      nameStr + ", you can afford <strong>" + yourItem + "</strong> in <span class='highlight'>" +
      monthsNeeded + " months saving</span>!" +
      "<br> Save <span class='highlight-bold'>" + getCurrencyDisplay() + " " + formatNumber(savingPerMonth) +
      "/month</span> (" + percentOfIncome + "% of income) and you reach your goal by <span class='highlight'>" + targetStr + "</span>";
  }

  showElement("saving-goal-result");
}

/** Share the saving goal card as image */
function shareSavingGoal() {
  var card = document.getElementById("onetime-saving-goal");
  if (card && card.style.display !== "none") {
    captureAndShare(card);
  }
}

/* ============================================================
   11. PIE CHART RENDERING
   ============================================================ */

function drawPie(elementId, percentage) {
  var canvas = document.getElementById(elementId);
  var ctx = canvas.getContext("2d");
  var size = canvas.width;
  var center = size / 2;
  var radius = center;

  ctx.clearRect(0, 0, size, size);

  /* Income (pink full circle) */
  ctx.beginPath();
  ctx.moveTo(center, center);
  ctx.arc(center, center, radius, 0, Math.PI * 2);
  ctx.closePath();
  ctx.fillStyle = "#F4C4C4";
  ctx.fill();

  /* Expense (blue slice) */
  var startAngle = -Math.PI / 2;
  var endAngle = startAngle + (percentage / 100) * Math.PI * 2;
  ctx.beginPath();
  ctx.moveTo(center, center);
  ctx.arc(center, center, radius, startAngle, endAngle);
  ctx.closePath();
  ctx.fillStyle = "#5B6AD0";
  ctx.fill();
}

/* ============================================================
   12. SHARE FUNCTIONALITY
   ============================================================ */

function shareRegularResult() {
  if (!lastRegularResult) return;
  var card = document.getElementById("regular-result-normal");
  if (card.style.display === "none") card = document.getElementById("regular-result-warning");
  if (card.style.display === "none") card = document.getElementById("regular-no-income");
  captureAndShare(card);
}

function shareOnetimeResult() {
  if (!lastOnetimeResult) return;
  var card = document.getElementById("onetime-result-normal");
  if (card.style.display === "none") card = document.getElementById("onetime-result-warning");
  if (card.style.display === "none") card = document.getElementById("onetime-no-income");
  captureAndShare(card);
}

function shareTimeSection() {
  var section = document.getElementById("res-section-time");
  if (section) captureAndShare(section);
}

function shareHealthSection() {
  var section = document.getElementById("res-section-health");
  if (section) captureAndShare(section);
}

function captureAndShare(cardElement) {
  if (!cardElement) return;
  showToast(t("toastPreparing"));

  /* Hide share buttons inside the captured area */
  var shareBtns = cardElement.querySelectorAll(".res-share-footer");
  for (var sb = 0; sb < shareBtns.length; sb++) shareBtns[sb].style.display = "none";

  html2canvas(cardElement, {
    backgroundColor: null,
    scale: 2,
    useCORS: true,
    logging: false,
  }).then(function (cardCanvas) {
    /* Restore share buttons */
    for (var sb = 0; sb < shareBtns.length; sb++) shareBtns[sb].style.display = "";

    var watermarkHeight = 40;
    var finalCanvas = document.createElement("canvas");
    finalCanvas.width = cardCanvas.width;
    finalCanvas.height = cardCanvas.height + watermarkHeight * 2;

    var ctx = finalCanvas.getContext("2d");
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);
    ctx.drawImage(cardCanvas, 0, 0);

    ctx.fillStyle = "#aaaaaa";
    ctx.font = "600 24px Nunito, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("www.isthisworthmymoney.com", finalCanvas.width / 2, cardCanvas.height + watermarkHeight);

    finalCanvas.toBlob(function (blob) {
      if (!blob) {
        showToast(t("toastImageFail"));
        return;
      }

      var file = new File([blob], "is-this-worth-my-money.png", { type: "image/png" });

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        navigator.share({ title: t("shareTitle"), files: [file] })
          .catch(function () { downloadImage(blob); });
      } else {
        downloadImage(blob);
      }
    }, "image/png");
  }).catch(function () {
    for (var sb = 0; sb < shareBtns.length; sb++) shareBtns[sb].style.display = "";
    showToast(t("toastImageError"));
  });
}

function downloadImage(blob) {
  var url = URL.createObjectURL(blob);
  var a = document.createElement("a");
  a.href = url;
  a.download = "is-this-worth-my-money.png";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast(t("toastImageSaved"));
}

function showToast(message) {
  var existing = document.querySelector(".toast");
  if (existing) existing.remove();

  var toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  toast.style.cssText =
    "position:fixed;bottom:40px;left:50%;transform:translateX(-50%);" +
    "background:#333;color:#fff;padding:10px 24px;border-radius:24px;" +
    "font-family:Nunito,sans-serif;font-size:14px;font-weight:600;" +
    "z-index:9999;opacity:0;transition:opacity 0.3s;";
  document.body.appendChild(toast);
  requestAnimationFrame(function () { toast.style.opacity = "1"; });
  setTimeout(function () {
    toast.style.opacity = "0";
    setTimeout(function () { toast.remove(); }, 300);
  }, 2000);
}

/* ============================================================
   13. RESET & STAY
   ============================================================ */

function resetAndStay(screen) {
  if (screen === "regular") {
    document.getElementById("regular-item").value = "";
    document.getElementById("regular-times").value = "";
    document.getElementById("regular-cost").value = "";
    document.getElementById("regular-frequency").value = "week";
    hideElement("regular-monthly-total");
    hideElement("regular-result-normal");
    hideElement("regular-result-warning");
    hideElement("regular-workday-card");
    hideElement("regular-no-income");
    hideElement("regular-income-summary");
    hideElement("regular-bottom-nav");
    lastRegularResult = null;
  } else if (screen === "onetime") {
    document.getElementById("onetime-item").value = "";
    document.getElementById("onetime-cost").value = "";
    hideElement("onetime-result-normal");
    hideElement("onetime-result-warning");
    hideElement("onetime-saving-goal");
    hideElement("onetime-no-income");
    hideElement("onetime-income-summary");
    hideElement("onetime-bottom-nav");
    lastOnetimeResult = null;
  }
  window.scrollTo(0, 0);
}

/* ============================================================
   14. DOM HELPERS
   ============================================================ */

function showElement(id) {
  var el = document.getElementById(id);
  if (el) el.style.display = "";
}

function hideElement(id) {
  var el = document.getElementById(id);
  if (el) el.style.display = "none";
}

/** Shake missing fields and show friendly alert */
function showValidationError(fieldIds) {
  fieldIds.forEach(function (id) {
    var el = document.getElementById(id);
    if (el) {
      el.classList.remove("shake");
      void el.offsetWidth;
      el.classList.add("shake");
      el.addEventListener("animationend", function () {
        el.classList.remove("shake");
      }, { once: true });
    }
  });
  showToast(t("toastValidation"));
}

function showIncomeSummary(screen) {
  var summary = document.getElementById(screen + "-income-summary");
  var incomeVal = document.getElementById(screen + "-summary-income");
  var rateVal = document.getElementById(screen + "-summary-rate");

  summary.style.display = "";

  if (profile.income) {
    incomeVal.textContent = formatCurrency(profile.income);
    incomeVal.classList.remove("not-set");
    rateVal.textContent = getCurrencyDisplay() + " " + formatNumber(roundForDisplay(calculateHourlyRate()));
    rateVal.classList.remove("not-set");
  } else {
    incomeVal.textContent = t("incomeNotSet");
    incomeVal.classList.add("not-set");
    rateVal.textContent = t("incomeNotSet");
    rateVal.classList.add("not-set");
  }
}

/* ============================================================
   15. MULTI-SLICE PIE CHART
   ============================================================ */

var EXPENSE_COLORS = {
  housing:   "#ff5655",
  utilities: "#eeab88",
  food:      "#d4faaf",
  transport: "#a3d78a",
  others:    "#c4b5dc",
  remaining: "#DEDBD7"
};

/**
 * Draw a multi-slice pie chart.
 * @param {string} elementId - Canvas element ID
 * @param {Array} slices - Array of { value: number (percentage), color: string }
 */
function drawMultiSlicePie(elementId, slices) {
  var canvas = document.getElementById(elementId);
  if (!canvas) return;
  var ctx = canvas.getContext("2d");
  var size = canvas.width;
  var center = size / 2;
  var radius = center;

  ctx.clearRect(0, 0, size, size);

  var total = 0;
  slices.forEach(function(s) { total += s.value; });

  var allSlices = slices.slice();
  if (total < 100) {
    allSlices.push({ value: 100 - total, color: EXPENSE_COLORS.remaining });
  }

  var startAngle = -Math.PI / 2;
  allSlices.forEach(function(slice) {
    if (slice.value <= 0) return;
    var sweepAngle = (slice.value / 100) * Math.PI * 2;
    var endAngle = startAngle + sweepAngle;

    ctx.beginPath();
    ctx.moveTo(center, center);
    ctx.arc(center, center, radius, startAngle, endAngle);
    ctx.closePath();
    ctx.fillStyle = slice.color;
    ctx.fill();

    startAngle = endAngle;
  });
}

/* ============================================================
   16. DAILY EXPENSES WIZARD
   ============================================================ */

function createEmptyExpenses() {
  return {
    housing: { answered: false, pays: false, monthlyAmount: 0, utilities: { answered: false, pays: false, mode: "none", totalAmount: 0, breakdown: { electricity: 0, water: 0, internet: 0, others: 0 } } },
    food: { answered: false, pays: false, groceries: { amount: 0, times: 0 }, eatingOut: { amount: 0, times: 0 }, coffee: { amount: 0, times: 0 }, others: { amount: 0, times: 0 } },
    transport: { answered: false, pays: false, rental: { amount: 0 }, gas: { amount: 0, times: 0 }, uber: { amount: 0, times: 0 }, others: { amount: 0, times: 0 } },
    otherExpenses: createEmptyOtherExpenses(),
    lastUpdated: null
  };
}

var OTHER_EXPENSE_CATEGORIES = [
  { key: 'entertainment', label: 'Giải trí' },
  { key: 'subscriptions', label: 'Đăng ký dịch vụ' },
  { key: 'healthWellness', label: 'Sức khỏe/ Làm đẹp' },
  { key: 'shopping', label: 'Mua sắm' },
  { key: 'educationWork', label: 'Học tập/ Công việc' },
  { key: 'childCare', label: 'Con cái/ Gia đình/ Thú cưng' },
  { key: 'tax', label: 'Thuế' },
  { key: 'loansInvestments', label: 'Vay/ Đầu tư' },
  { key: 'socialResponsibilities', label: 'Trách nhiệm xã hội/ Quà/ Từ thiện' },
  { key: 'insurance', label: 'Bảo hiểm' },
  { key: 'others', label: 'Khác' }
];

function createEmptyOtherExpenses() {
  var obj = {};
  OTHER_EXPENSE_CATEGORIES.forEach(function(cat) {
    obj[cat.key] = { items: [] };
  });
  return obj;
}

function saveExpenses() {
  expensesData.lastUpdated = new Date().toISOString();
  localStorage.setItem("worthMyMoneyExpenses", JSON.stringify(expensesData));
}

/** Initialize the expenses screen. freshEntry=true when user navigates here (not on refresh). */
function initExpensesScreen(freshEntry) {
  updateExpensesCurrencyBadges();

  if (!profile.income) {
    showElement("expenses-no-income");
    hideElement("expenses-subtitle");
    hideElement("expenses-step-housing");
    hideElement("expenses-step-utilities");
    hideElement("expenses-step-food");
    hideElement("expenses-step-transport");
    hideElement("expenses-milestone");
    hideElement("expenses-step-otherExpenses");
    hideElement("expenses-step-result");
    return;
  }

  hideElement("expenses-no-income");
  showElement("expenses-subtitle");

  var savedStep = sessionStorage.getItem("worthMyMoneyExpenseStep");

  if (expensesData && expensesData.lastUpdated) {
    repopulateExpensesFromData();
    // Restore the step the user was on, default to milestone
    var validSteps = ["housing", "utilities", "food", "transport", "milestone", "otherExpenses", "result"];
    var targetStep = (savedStep && validSteps.indexOf(savedStep) !== -1) ? savedStep : "milestone";
    showExpenseStep(targetStep);

    // Show welcome-back modal when user navigates here fresh (not on page refresh)
    if (freshEntry) {
      showWelcomeBackModal();
    }
  } else {
    expensesData = createEmptyExpenses();
    showExpenseStep("housing");
  }
}

/** Show a specific step, hide all others */
function showExpenseStep(step) {
  expenseStep = step;
  sessionStorage.setItem("worthMyMoneyExpenseStep", step);
  hideElement("expenses-step-housing");
  hideElement("expenses-step-utilities");
  hideElement("expenses-step-food");
  hideElement("expenses-step-transport");
  hideElement("expenses-milestone");
  hideElement("expenses-step-otherExpenses");
  hideElement("expenses-step-result");

  if (step === "housing") {
    showElement("expenses-step-housing");
    showElement("expenses-subtitle");
    updateHousingNavState();
  } else if (step === "utilities") {
    showElement("expenses-step-utilities");
    showElement("expenses-subtitle");
    updateStepPieChart("utilities");
    updateUtilitiesNavState();
  } else if (step === "food") {
    showElement("expenses-step-food");
    showElement("expenses-subtitle");
    updateStepPieChart("food");
    updateFoodNavState();
  } else if (step === "transport") {
    showElement("expenses-step-transport");
    showElement("expenses-subtitle");
    updateStepPieChart("transport");
    updateTransportIntro();
    updateTransportNavState();
  } else if (step === "milestone") {
    showElement("expenses-milestone");
    hideElement("expenses-subtitle");
    renderMilestoneSummary();
    triggerConfetti();
  } else if (step === "otherExpenses") {
    showElement("expenses-step-otherExpenses");
    hideElement("expenses-subtitle");
    hideElement("other-expenses-over-income");
    // Restore elements that showOtherOverIncome() may have hidden
    showElement("other-expenses-subtitle");
    showElement("other-expenses-cards");
    var dots = document.querySelector("#expenses-step-otherExpenses .exp-progress-dots");
    if (dots) dots.style.display = "";
    var sectionHeader = document.querySelector("#expenses-step-otherExpenses .exp-other-section-header");
    if (sectionHeader) sectionHeader.style.display = "";
    var searchWrap = document.querySelector("#expenses-step-otherExpenses .exp-other-search-wrap");
    if (searchWrap) searchWrap.style.display = "";
    var bottomNav = document.querySelector("#expenses-step-otherExpenses .exp-bottom-nav");
    if (bottomNav) bottomNav.style.display = "";
    // Ensure otherExpenses data exists
    if (!expensesData.otherExpenses) {
      expensesData.otherExpenses = createEmptyOtherExpenses();
    }
    renderOtherExpensesCards("");
    document.getElementById("other-expenses-search").value = "";
  } else if (step === "result") {
    showElement("expenses-step-result");
    hideElement("expenses-subtitle");
    renderResultPage();
  }

  window.scrollTo(0, 0);
}

function goToHousingStep() { showExpenseStep("housing"); }

function goToUtilitiesStep() {
  collectHousingData();
  if (amendingFromResult) { finishAmend(); return; }
  if (checkExpensesOverIncome("utilities")) return;
  showExpenseStep("utilities");
}

function goToFoodStep() {
  collectUtilitiesData();
  if (amendingFromResult) { finishAmend(); return; }
  if (checkExpensesOverIncome("food")) return;
  showExpenseStep("food");
}

function goToTransportStep() {
  if (!validateFoodAmountTimes()) return;
  collectFoodData();
  if (amendingFromResult) { finishAmend(); return; }
  if (checkExpensesOverIncome("transport")) return;
  showExpenseStep("transport");
}

function showMilestoneSummary() {
  collectTransportData();
  if (amendingFromResult) { finishAmend(); return; }
  if (checkExpensesOverIncome("milestone")) return;
  saveExpenses();
  showExpenseStep("milestone");
}

/** Custom back for expenses */
function expensesBack() {
  // If amending from result page, go back to result instead of normal flow
  if (amendingFromResult) {
    finishAmend();
    return;
  }
  if (expenseStep === "utilities") { showExpenseStep("housing"); return; }
  if (expenseStep === "food") { showExpenseStep("utilities"); return; }
  if (expenseStep === "transport") { showExpenseStep("food"); return; }
  if (expenseStep === "milestone") { showExpenseStep("transport"); return; }
  if (expenseStep === "otherExpenses") { collectOtherExpensesFromDOM(); saveExpenses(); showExpenseStep("milestone"); return; }
  if (expenseStep === "result") { showExpenseStep("otherExpenses"); return; }
  navigateBack();
}

/* --- Housing Step --- */

function housingChoice(pays) {
  var noBtn = document.getElementById("housing-choice-no");
  var yesBtn = document.getElementById("housing-choice-yes");

  // Toggle deselect: tapping the same choice again resets to unanswered
  if (expensesData.housing.answered && expensesData.housing.pays === pays) {
    expensesData.housing.answered = false;
    expensesData.housing.pays = false;
    expensesData.housing.monthlyAmount = 0;
    noBtn.classList.remove("selected", "not-selected");
    yesBtn.classList.remove("selected", "not-selected");
    hideElement("housing-no-msg");
    hideElement("housing-amount-section");
    hideElement("housing-result");
    hideElement("housing-pie-area");
    document.getElementById("housing-amount").value = "";
    updateHousingNavState();
    return;
  }

  expensesData.housing.answered = true;
  expensesData.housing.pays = pays;

  noBtn.classList.toggle("selected", !pays);
  noBtn.classList.toggle("not-selected", pays);
  yesBtn.classList.toggle("selected", pays);
  yesBtn.classList.toggle("not-selected", !pays);

  if (pays) {
    hideElement("housing-no-msg");
    showElement("housing-amount-section");
  } else {
    showElement("housing-no-msg");
    hideElement("housing-amount-section");
    hideElement("housing-result");
    hideElement("housing-pie-area");
    expensesData.housing.monthlyAmount = 0;
    document.getElementById("housing-amount").value = "";
  }

  updateHousingNavState();
}

/** Validation: housing is valid if answered */
function isHousingValid() {
  if (!expensesData.housing.answered) return false;
  if (!expensesData.housing.pays) return true; // "No" is valid
  // If "Yes", must have entered an amount > 0
  return parseFormattedNumber(document.getElementById("housing-amount").value) > 0;
}

function updateHousingNavState() {
  var btn = document.getElementById("housing-nav-forward");
  if (!btn) return;
  var valid = isHousingValid();
  btn.disabled = !valid;
  btn.classList.toggle("exp-nav-disabled", !valid);
}

function submitHousingAmount() {
  var amount = parseFormattedNumber(document.getElementById("housing-amount").value);
  if (!amount) { showValidationError(["housing-amount"]); return; }

  expensesData.housing.monthlyAmount = amount;

  var pct = (amount / profile.income * 100);
  var hourlyRate = calculateHourlyRate();
  var hours = amount / hourlyRate;

  if (currentLang === "vi") {
    document.getElementById("housing-result-text").innerHTML =
      "<span class='highlight'>" + formatDecimal(pct) + "%</span> thu nhập. " +
      "Mỗi ngày đi làm, <span class='highlight'>" + formatDecimal(hours) + " giờ</span> chỉ để trả tiền nhà.";
  } else {
    document.getElementById("housing-result-text").innerHTML =
      "<span class='highlight'>" + formatDecimal(pct) + "%</span> of income. " +
      "Each workday, <span class='highlight'>" + formatDecimal(hours) + " hours</span> just for housing.";
  }

  showElement("housing-result");

  // Update pie
  var pieArea = document.getElementById("housing-pie-area");
  pieArea.style.display = "";
  drawMultiSlicePie("housing-step-pie", [{ value: pct, color: EXPENSE_COLORS.housing }]);
  document.getElementById("housing-pie-legend").innerHTML =
    '<div class="exp-pie-legend-item"><span class="exp-pie-legend-dot" style="background:' + EXPENSE_COLORS.housing + '"></span><span class="exp-pie-legend-label">' + t("catHousing") + '</span></div>' +
    '<div class="exp-pie-legend-item"><span class="exp-pie-legend-dot" style="background:' + EXPENSE_COLORS.remaining + '"></span><span class="exp-pie-legend-label">?</span></div>';
}

/* --- Utilities Step --- */

function utilitiesChoice(pays) {
  var noBtn = document.getElementById("utilities-choice-no");
  var yesBtn = document.getElementById("utilities-choice-yes");

  // Toggle deselect
  if (expensesData.housing.utilities.answered && expensesData.housing.utilities.pays === pays) {
    expensesData.housing.utilities.answered = false;
    expensesData.housing.utilities.pays = false;
    expensesData.housing.utilities.mode = "none";
    expensesData.housing.utilities.totalAmount = 0;
    expensesData.housing.utilities.breakdown = { electricity: 0, water: 0, internet: 0, others: 0 };
    noBtn.classList.remove("selected", "not-selected");
    yesBtn.classList.remove("selected", "not-selected");
    hideElement("utilities-no-msg");
    hideElement("utilities-input-section");
    clearUtilitiesInputs();
    updateUtilitiesNavState();
    return;
  }

  expensesData.housing.utilities.answered = true;
  expensesData.housing.utilities.pays = pays;

  noBtn.classList.toggle("selected", !pays);
  noBtn.classList.toggle("not-selected", pays);
  yesBtn.classList.toggle("selected", pays);
  yesBtn.classList.toggle("not-selected", !pays);

  if (pays) {
    hideElement("utilities-no-msg");
    showElement("utilities-input-section");
    expensesData.housing.utilities.mode = "total";
  } else {
    showElement("utilities-no-msg");
    hideElement("utilities-input-section");
    expensesData.housing.utilities.mode = "none";
    expensesData.housing.utilities.totalAmount = 0;
    expensesData.housing.utilities.breakdown = { electricity: 0, water: 0, internet: 0, others: 0 };
    clearUtilitiesInputs();
  }

  updateUtilitiesNavState();
}

function clearUtilitiesInputs() {
  document.getElementById("utilities-total").value = "";
  document.getElementById("utilities-electricity").value = "";
  document.getElementById("utilities-water").value = "";
  document.getElementById("utilities-internet").value = "";
  document.getElementById("utilities-others").value = "";
  // Collapse breakdown if open
  document.getElementById("utilities-breakdown-section").style.display = "none";
  document.getElementById("utilities-breakdown-btn").textContent = t("utilitiesBreakdownOpen");
}

function isUtilitiesValid() {
  if (!expensesData.housing.utilities.answered) return false;
  if (!expensesData.housing.utilities.pays) return true; // "No" is valid
  // If "Yes", check total field OR any breakdown field > 0
  var totalVal = parseFormattedNumber(document.getElementById("utilities-total").value);
  if (totalVal > 0) return true;
  var bkIds = ["utilities-electricity", "utilities-water", "utilities-internet", "utilities-others"];
  for (var i = 0; i < bkIds.length; i++) {
    var el = document.getElementById(bkIds[i]);
    if (el && parseFormattedNumber(el.value) > 0) return true;
  }
  return false;
}

function updateUtilitiesNavState() {
  var btn = document.getElementById("utilities-nav-forward");
  if (!btn) return;
  var valid = isUtilitiesValid();
  btn.disabled = !valid;
  btn.classList.toggle("exp-nav-disabled", !valid);
}

function toggleUtilitiesBreakdown() {
  var section = document.getElementById("utilities-breakdown-section");
  var btn = document.getElementById("utilities-breakdown-btn");
  if (section.style.display === "none") {
    section.style.display = "";
    btn.textContent = t("utilitiesBreakdownClose");
    expensesData.housing.utilities.mode = "breakdown";
  } else {
    section.style.display = "none";
    btn.textContent = t("utilitiesBreakdownOpen");
    expensesData.housing.utilities.mode = "total";
  }
}

/* --- Food Step --- */

function foodChoice(pays) {
  var noBtn = document.getElementById("food-choice-no");
  var yesBtn = document.getElementById("food-choice-yes");

  // Toggle deselect
  if (expensesData.food.answered && expensesData.food.pays === pays) {
    expensesData.food.answered = false;
    expensesData.food.pays = false;
    clearFoodData();
    noBtn.classList.remove("selected", "not-selected");
    yesBtn.classList.remove("selected", "not-selected");
    hideElement("food-no-msg");
    hideElement("food-breakdown-section");
    updateFoodNavState();
    return;
  }

  expensesData.food.answered = true;
  expensesData.food.pays = pays;

  noBtn.classList.toggle("selected", !pays);
  noBtn.classList.toggle("not-selected", pays);
  yesBtn.classList.toggle("selected", pays);
  yesBtn.classList.toggle("not-selected", !pays);

  if (pays) {
    hideElement("food-no-msg");
    showElement("food-breakdown-section");
  } else {
    showElement("food-no-msg");
    hideElement("food-breakdown-section");
    clearFoodData();
  }

  updateFoodNavState();
}

function clearFoodData() {
  expensesData.food.groceries = { amount: 0, times: 0 };
  expensesData.food.eatingOut = { amount: 0, times: 0 };
  expensesData.food.coffee = { amount: 0, times: 0 };
  expensesData.food.others = { amount: 0, times: 0 };
  var ids = ["food-groceries-amount", "food-groceries-times", "food-eating-amount", "food-eating-times",
             "food-coffee-amount", "food-coffee-times", "food-others-amount", "food-others-times"];
  ids.forEach(function(id) { document.getElementById(id).value = ""; });
}

function isFoodValid() {
  if (!expensesData.food.answered) return false;
  if (!expensesData.food.pays) return true; // "No I don't pay" is a valid answer
  // If "Yes I pay", at least 1 subcategory must have an amount > 0
  var ids = ["food-groceries-amount", "food-eating-amount", "food-coffee-amount", "food-others-amount"];
  for (var i = 0; i < ids.length; i++) {
    if (parseFormattedNumber(document.getElementById(ids[i]).value) > 0) return true;
  }
  return false;
}

/** Validate food: if amount > 0, times must also be > 0 (and vice versa) */
function validateFoodAmountTimes() {
  if (!expensesData.food.pays) return true;
  var pairs = [
    ["food-groceries-amount", "food-groceries-times"],
    ["food-eating-amount", "food-eating-times"],
    ["food-coffee-amount", "food-coffee-times"],
    ["food-others-amount", "food-others-times"]
  ];
  for (var i = 0; i < pairs.length; i++) {
    var amountInput = document.getElementById(pairs[i][0]);
    var timesInput = document.getElementById(pairs[i][1]);
    var amountVal = parseFormattedNumber(amountInput.value);
    var timesVal = parseFormattedNumber(timesInput.value);
    if (amountVal > 0 && timesVal <= 0) {
      timesInput.classList.remove("shake");
      void timesInput.offsetWidth;
      timesInput.classList.add("shake");
      timesInput.addEventListener("animationend", function() { this.classList.remove("shake"); }, { once: true });
      showToast(t("toastFillTimes"));
      timesInput.focus();
      return false;
    }
    if (amountVal <= 0 && timesVal > 0) {
      amountInput.classList.remove("shake");
      void amountInput.offsetWidth;
      amountInput.classList.add("shake");
      amountInput.addEventListener("animationend", function() { this.classList.remove("shake"); }, { once: true });
      showToast(t("toastFillAmount"));
      amountInput.focus();
      return false;
    }
  }
  return true;
}

function updateFoodNavState() {
  var btn = document.getElementById("food-nav-forward");
  if (!btn) return;
  var valid = isFoodValid();
  btn.disabled = !valid;
  btn.classList.toggle("exp-nav-disabled", !valid);
}

/* --- Transport Step --- */

function transportChoice(pays) {
  var noBtn = document.getElementById("transport-choice-no");
  var yesBtn = document.getElementById("transport-choice-yes");

  // Toggle deselect
  if (expensesData.transport.answered && expensesData.transport.pays === pays) {
    expensesData.transport.answered = false;
    expensesData.transport.pays = false;
    clearTransportData();
    noBtn.classList.remove("selected", "not-selected");
    yesBtn.classList.remove("selected", "not-selected");
    hideElement("transport-no-msg");
    hideElement("transport-breakdown-section");
    updateTransportNavState();
    return;
  }

  expensesData.transport.answered = true;
  expensesData.transport.pays = pays;

  noBtn.classList.toggle("selected", !pays);
  noBtn.classList.toggle("not-selected", pays);
  yesBtn.classList.toggle("selected", pays);
  yesBtn.classList.toggle("not-selected", !pays);

  if (pays) {
    hideElement("transport-no-msg");
    showElement("transport-breakdown-section");
  } else {
    showElement("transport-no-msg");
    hideElement("transport-breakdown-section");
    clearTransportData();
  }

  updateTransportNavState();
}

function clearTransportData() {
  expensesData.transport.rental = { amount: 0 };
  expensesData.transport.gas = { amount: 0, times: 0 };
  expensesData.transport.uber = { amount: 0, times: 0 };
  expensesData.transport.others = { amount: 0, times: 0 };
  var ids = ["transport-rental-amount", "transport-gas-amount", "transport-gas-times",
             "transport-uber-amount", "transport-uber-times", "transport-others-amount", "transport-others-times"];
  ids.forEach(function(id) { document.getElementById(id).value = ""; });
}

function isTransportValid() {
  if (!expensesData.transport.answered) return false;
  if (!expensesData.transport.pays) return true; // "No" is valid
  // If "Yes", at least 1 subcategory must have amount > 0
  var ids = ["transport-rental-amount", "transport-gas-amount", "transport-uber-amount", "transport-others-amount"];
  for (var i = 0; i < ids.length; i++) {
    if (parseFormattedNumber(document.getElementById(ids[i]).value) > 0) return true;
  }
  return false;
}

function updateTransportNavState() {
  var btn = document.getElementById("transport-nav-forward");
  if (!btn) return;
  var valid = isTransportValid();
  btn.disabled = !valid;
  btn.classList.toggle("exp-nav-disabled", !valid);
}

function updateTransportIntro() {
  var foodTotal = getFoodMonthly();
  var el = document.getElementById("transport-intro-text");
  var q = document.getElementById("transport-question");
  if (foodTotal > 0) {
    var foodPct = (foodTotal / profile.income * 100);
    if (currentLang === "vi") {
      el.innerHTML = "Ăn uống chiếm thêm <span class='highlight'>" + formatDecimal(foodPct) + "%</span> thu nhập.<br><strong>Giờ xem bạn đi lại bằng gì nhé.</strong>";
    } else {
      el.innerHTML = "Food takes another <span class='highlight'>" + formatDecimal(foodPct) + "%</span> of income.<br><strong>Now let's see how you get around.</strong>";
    }
    el.style.display = "";
    q.style.display = "none";
  } else if (expensesData.food.answered && !expensesData.food.pays) {
    if (currentLang === "vi") {
      el.innerHTML = "Vui ghê! No bụng mà ví vẫn an toàn.<br><strong>Giờ xem bạn đi lại bằng gì nhé.</strong>";
    } else {
      el.innerHTML = "Nice! Full belly and wallet intact.<br><strong>Now let's check your transport costs.</strong>";
    }
    el.style.display = "";
    q.style.display = "none";
  } else {
    el.style.display = "none";
    q.style.display = "";
  }
}

/* --- Data Collection --- */

function collectHousingData() {
  if (expensesData.housing.pays) {
    expensesData.housing.monthlyAmount = parseFormattedNumber(document.getElementById("housing-amount").value);
  } else {
    expensesData.housing.monthlyAmount = 0;
  }
}

function collectUtilitiesData() {
  if (!expensesData.housing.utilities.pays) {
    expensesData.housing.utilities.mode = "none";
    expensesData.housing.utilities.totalAmount = 0;
    expensesData.housing.utilities.breakdown = { electricity: 0, water: 0, internet: 0, others: 0 };
    return;
  }

  if (document.getElementById("utilities-breakdown-section").style.display !== "none") {
    expensesData.housing.utilities.mode = "breakdown";
    expensesData.housing.utilities.breakdown.electricity = parseFormattedNumber(document.getElementById("utilities-electricity").value);
    expensesData.housing.utilities.breakdown.water = parseFormattedNumber(document.getElementById("utilities-water").value);
    expensesData.housing.utilities.breakdown.internet = parseFormattedNumber(document.getElementById("utilities-internet").value);
    expensesData.housing.utilities.breakdown.others = parseFormattedNumber(document.getElementById("utilities-others").value);
  } else {
    expensesData.housing.utilities.mode = "total";
    expensesData.housing.utilities.totalAmount = parseFormattedNumber(document.getElementById("utilities-total").value);
  }
}

function collectFoodData() {
  if (expensesData.food.pays) {
    expensesData.food.groceries.amount = parseFormattedNumber(document.getElementById("food-groceries-amount").value);
    expensesData.food.groceries.times = parseFormattedNumber(document.getElementById("food-groceries-times").value);
    expensesData.food.eatingOut.amount = parseFormattedNumber(document.getElementById("food-eating-amount").value);
    expensesData.food.eatingOut.times = parseFormattedNumber(document.getElementById("food-eating-times").value);
    expensesData.food.coffee.amount = parseFormattedNumber(document.getElementById("food-coffee-amount").value);
    expensesData.food.coffee.times = parseFormattedNumber(document.getElementById("food-coffee-times").value);
    expensesData.food.others.amount = parseFormattedNumber(document.getElementById("food-others-amount").value);
    expensesData.food.others.times = parseFormattedNumber(document.getElementById("food-others-times").value);
  }
}

function collectTransportData() {
  if (expensesData.transport.pays) {
    expensesData.transport.rental.amount = parseFormattedNumber(document.getElementById("transport-rental-amount").value);
    expensesData.transport.gas.amount = parseFormattedNumber(document.getElementById("transport-gas-amount").value);
    expensesData.transport.gas.times = parseFormattedNumber(document.getElementById("transport-gas-times").value);
    expensesData.transport.uber.amount = parseFormattedNumber(document.getElementById("transport-uber-amount").value);
    expensesData.transport.uber.times = parseFormattedNumber(document.getElementById("transport-uber-times").value);
    expensesData.transport.others.amount = parseFormattedNumber(document.getElementById("transport-others-amount").value);
    expensesData.transport.others.times = parseFormattedNumber(document.getElementById("transport-others-times").value);
  }
}

/* --- Calculation Helpers --- */

function getUtilitiesMonthly() {
  var u = expensesData.housing.utilities;
  if (!u.pays) return 0;
  if (u.mode === "total") return u.totalAmount || 0;
  if (u.mode === "breakdown") {
    return (u.breakdown.electricity || 0) + (u.breakdown.water || 0) +
           (u.breakdown.internet || 0) + (u.breakdown.others || 0);
  }
  return 0;
}

function getFoodMonthly() {
  if (!expensesData.food.pays) return 0;
  var f = expensesData.food;
  return (f.groceries.amount * f.groceries.times) +
         (f.eatingOut.amount * f.eatingOut.times) +
         (f.coffee.amount * f.coffee.times) +
         (f.others.amount * f.others.times);
}

function getTransportMonthly() {
  if (!expensesData.transport.pays) return 0;
  var t = expensesData.transport;
  return (t.rental.amount || 0) +
         (t.gas.amount * t.gas.times) +
         (t.uber.amount * t.uber.times) +
         (t.others.amount * t.others.times);
}

function getOtherCategoryTotal(key) {
  if (!expensesData.otherExpenses || !expensesData.otherExpenses[key]) return 0;
  var items = expensesData.otherExpenses[key].items;
  var total = 0;
  items.forEach(function(item) {
    total += (item.amount || 0) * (item.times || 0);
  });
  return total;
}

function getOtherExpensesMonthly() {
  if (!expensesData.otherExpenses) return 0;
  var total = 0;
  OTHER_EXPENSE_CATEGORIES.forEach(function(cat) {
    total += getOtherCategoryTotal(cat.key);
  });
  return total;
}

function getExpenseTotals() {
  return {
    housing: expensesData.housing.monthlyAmount || 0,
    utilities: getUtilitiesMonthly(),
    food: getFoodMonthly(),
    transport: getTransportMonthly(),
    others: getOtherExpensesMonthly()
  };
}

/* --- Step Pie Chart Updates --- */

function buildSlicesUpTo(step) {
  var totals = getExpenseTotals();
  var income = profile.income;
  var slices = [];
  var legends = [];

  // Housing is included from the utilities step onward
  if (step === "utilities" || step === "food" || step === "transport" || step === "milestone") {
    if (totals.housing > 0) {
      slices.push({ value: (totals.housing / income) * 100, color: EXPENSE_COLORS.housing });
      legends.push({ label: t("catHousing"), color: EXPENSE_COLORS.housing });
    }
  }
  // Utilities included from the food step onward
  if (step === "food" || step === "transport" || step === "milestone") {
    if (totals.utilities > 0) {
      slices.push({ value: (totals.utilities / income) * 100, color: EXPENSE_COLORS.utilities });
      legends.push({ label: t("catUtilities"), color: EXPENSE_COLORS.utilities });
    }
  }
  // Food included from the transport step onward
  if (step === "transport" || step === "milestone") {
    if (totals.food > 0) {
      slices.push({ value: (totals.food / income) * 100, color: EXPENSE_COLORS.food });
      legends.push({ label: t("catFood"), color: EXPENSE_COLORS.food });
    }
  }
  // Transport in milestone and beyond
  if (step === "milestone" || step === "otherExpenses" || step === "result") {
    if (totals.transport > 0) {
      slices.push({ value: (totals.transport / income) * 100, color: EXPENSE_COLORS.transport });
      legends.push({ label: t("catTransport"), color: EXPENSE_COLORS.transport });
    }
  }
  // Others in milestone (if data exists), otherExpenses, and result
  if (step === "milestone" || step === "otherExpenses" || step === "result") {
    if (totals.others > 0) {
      slices.push({ value: (totals.others / income) * 100, color: EXPENSE_COLORS.others });
      legends.push({ label: t("catOthers"), color: EXPENSE_COLORS.others });
    }
  }
  legends.push({ label: "?", color: EXPENSE_COLORS.remaining });

  return { slices: slices, legends: legends };
}

function updateStepPieChart(step) {
  var data = buildSlicesUpTo(step);
  var hasData = data.slices.length > 0;
  var areaId, pieId, legendId;

  if (step === "utilities") {
    areaId = "utilities-pie-area"; pieId = "utilities-step-pie"; legendId = "utilities-pie-legend";
  } else if (step === "food") {
    areaId = "food-pie-area"; pieId = "food-step-pie"; legendId = "food-pie-legend";
  } else if (step === "transport") {
    areaId = "transport-pie-area"; pieId = "transport-step-pie"; legendId = "transport-pie-legend";
  } else {
    return;
  }

  var area = document.getElementById(areaId);
  area.style.display = hasData ? "" : "none";
  if (hasData) {
    drawMultiSlicePie(pieId, data.slices);
    renderPieLegend(legendId, data.legends);
  }
}

function renderPieLegend(elementId, legends) {
  var html = "";
  legends.forEach(function(item) {
    html += '<div class="exp-pie-legend-item">' +
      '<span class="exp-pie-legend-dot" style="background:' + item.color + '"></span>' +
      '<span class="exp-pie-legend-label">' + item.label + '</span></div>';
  });
  document.getElementById(elementId).innerHTML = html;
}

/* --- Currency Badges --- */

function updateExpensesCurrencyBadges() {
  var symbol = getCurrencyDisplay();
  var ids = [
    "expenses-housing-currency", "expenses-utilities-currency",
    "exp-util-elec-currency", "exp-util-water-currency",
    "exp-util-internet-currency", "exp-util-others-currency",
    "exp-food-groc-currency", "exp-food-eat-currency",
    "exp-food-coffee-currency", "exp-food-other-currency",
    "exp-trans-rental-currency", "exp-trans-gas-currency",
    "exp-trans-uber-currency", "exp-trans-other-currency"
  ];
  ids.forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.textContent = symbol;
  });
}

/* --- Navigate to expense step by category key --- */

function goToExpenseCategory(key) {
  var step = key === "others" ? "otherExpenses" : key;
  var currentScreen = document.querySelector(".screen.active");
  if (currentScreen && currentScreen.id === "screen-expenses") {
    showExpenseStep(step);
  } else {
    navigateTo("expenses");
    showExpenseStep(step);
  }
}

/* --- Milestone Summary --- */

function renderMilestoneSummary() {
  var totals = getExpenseTotals();
  var income = profile.income;
  var hourlyRate = calculateHourlyRate();

  var data = buildSlicesUpTo("milestone");
  drawMultiSlicePie("milestone-pie", data.slices);
  renderPieLegend("milestone-legend", data.legends);

  var totalExpenses = totals.housing + totals.utilities + totals.food + totals.transport + totals.others;
  var totalPct = (totalExpenses / income) * 100;
  var totalHours = totalExpenses / hourlyRate;

  if (currentLang === "vi") {
    document.getElementById("milestone-summary-text").innerHTML =
      "Bạn đã chi <span class='highlight'>" + formatDecimal(totalPct) + "%</span> thu nhập cho các chi phí lớn. " +
      "Tương đương <span class='highlight-bold'>" + formatDecimal(totalHours) + " giờ</span> làm việc.";
  } else {
    document.getElementById("milestone-summary-text").innerHTML =
      "You've spent <span class='highlight'>" + formatDecimal(totalPct) + "%</span> of income on major expenses. " +
      "That's <span class='highlight-bold'>" + formatDecimal(totalHours) + " hours</span> of work.";
  }

  var hoursHTML = "";
  var categories = [
    { key: "housing", label: t("catHousing"), icon: "\uD83C\uDFE0" },
    { key: "utilities", label: t("catUtilities"), icon: "\uD83D\uDCA1" },
    { key: "food", label: t("catFood"), icon: "\uD83C\uDF7D\uFE0F" },
    { key: "transport", label: t("catTransport"), icon: "\uD83D\uDE97" },
    { key: "others", label: t("catOthers"), icon: "\uD83D\uDCE6" }
  ];

  categories.forEach(function(cat) {
    var amount = totals[cat.key];
    if (amount > 0) {
      var hours = amount / hourlyRate;
      hoursHTML += '<div class="exp-hours-row clickable" onclick="goToExpenseCategory(\'' + cat.key + '\')">' +
        '<span class="exp-hours-icon">' + cat.icon + '</span>' +
        '<span class="exp-hours-label">' + cat.label + '</span>' +
        '<span class="exp-hours-value">' + formatDecimal(hours) + ' ' + t("unitHoursLong") + '</span></div>';
    }
  });
  document.getElementById("milestone-hours-breakdown").innerHTML = hoursHTML;

  updateProfileExpenses();
}

/* ------------------------------------------------------------
   16c. Other Monthly Expenses
   ------------------------------------------------------------ */

/** Track which cards are expanded */
var otherExpensesExpandedCards = {};

/** Render all category cards into the container */
function renderOtherExpensesCards(filter) {
  var container = document.getElementById("other-expenses-cards");
  var noResults = document.getElementById("other-expenses-no-results");
  var noResultsCard = document.getElementById("other-expenses-no-results-card");
  if (!container) return;

  var query = (filter || "").toLowerCase().trim();
  var html = "";
  var matchCount = 0;

  OTHER_EXPENSE_CATEGORIES.forEach(function(cat) {
    var matches = !query || cat.label.toLowerCase().indexOf(query) !== -1;
    if (!matches) return;
    matchCount++;
    html += buildOtherExpenseCardHTML(cat.key, cat.label);
  });

  container.innerHTML = html;

  // No results state
  if (query && matchCount === 0) {
    noResults.style.display = "";
    // Show "Others" card in the no-results section
    noResultsCard.innerHTML = buildOtherExpenseCardHTML("others", "Others");
    attachOtherExpenseCardListeners(noResultsCard);
  } else {
    noResults.style.display = "none";
  }

  // Attach listeners to all cards in the main container
  attachOtherExpenseCardListeners(container);
}

/** Build HTML for a single category card */
function buildOtherExpenseCardHTML(key, label) {
  var isExpanded = otherExpensesExpandedCards[key];
  var catTotal = getOtherCategoryTotal(key);
  var hasFill = catTotal > 0;
  var items = (expensesData.otherExpenses && expensesData.otherExpenses[key])
    ? expensesData.otherExpenses[key].items : [];

  var cardClass = "exp-other-card";
  if (isExpanded) cardClass += " expanded";
  if (hasFill) cardClass += " filled";

  var html = '<div class="' + cardClass + '" data-key="' + key + '">';
  html += '<div class="exp-other-card-header" data-key="' + key + '">';
  html += '<span class="exp-other-card-label">' + label + '</span>';
  if (hasFill) {
    html += '<span class="exp-other-card-total">' + formatCurrency(catTotal) + '</span>';
  }
  html += '</div>';

  if (isExpanded) {
    html += '<div class="exp-other-card-body">';
    // Render existing items or 1 empty row
    var rowItems = items.length > 0 ? items : [{ name: '', amount: 0, times: 0 }];
    rowItems.forEach(function(item, idx) {
      html += buildOtherExpenseRowHTML(key, idx, item);
    });
    html += '<button class="exp-other-add-btn" data-action="add" data-key="' + key + '">';
    html += '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="9" fill="#02b887"/><path d="M10 6v8M6 10h8" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg>';
    html += '</button>';
    html += '</div>';
  }

  html += '</div>';
  return html;
}

/** Build HTML for a single expense row inside a card */
function buildOtherExpenseRowHTML(key, idx, item) {
  var currency = getCurrencyDisplay();
  var nameVal = item.name || '';
  var amountVal = item.amount ? formatNumber(item.amount) : '';
  var timesVal = item.times ? formatNumber(item.times) : '';

  var html = '<div class="exp-other-row" data-key="' + key + '" data-idx="' + idx + '">';
  html += '<div class="exp-other-row-inputs">';
  html += '<input type="text" class="exp-other-row-name" placeholder="' + t("expRowName") + '" value="' + nameVal + '" data-field="name">';
  html += '<span class="exp-other-row-sep">:</span>';
  html += '<span class="currency-badge">' + currency + '</span>';
  html += '<input type="text" class="number-input exp-other-row-amount" placeholder="' + t("expRowAmount") + '" inputmode="numeric" value="' + amountVal + '" data-field="amount">';
  html += '<span class="exp-times-x">&times;</span>';
  html += '<input type="text" class="number-input exp-other-row-times" placeholder="' + t("expRowQty") + '" inputmode="numeric" value="' + timesVal + '" data-field="times">';
  html += '<span class="exp-times-label">' + t("expRowTimesMonth") + '</span>';
  html += '<button class="exp-other-remove-btn" data-action="remove" data-key="' + key + '" data-idx="' + idx + '">';
  html += '<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M4 4l8 8M12 4l-8 8" stroke="#A09A94" stroke-width="2" stroke-linecap="round"/></svg>';
  html += '</button>';
  html += '</div>';
  html += '</div>';
  return html;
}

/** Attach event listeners to cards in a container (using delegation-like approach) */
function attachOtherExpenseCardListeners(container) {
  // Card header click → toggle expand
  var headers = container.querySelectorAll(".exp-other-card-header");
  headers.forEach(function(header) {
    header.addEventListener("click", function() {
      var key = this.getAttribute("data-key");
      toggleOtherExpenseCard(key);
    });
  });

  // Add button click
  var addBtns = container.querySelectorAll("[data-action='add']");
  addBtns.forEach(function(btn) {
    btn.addEventListener("click", function(e) {
      e.stopPropagation();
      var key = this.getAttribute("data-key");
      addOtherExpenseRow(key);
    });
  });

  // Remove button click
  var removeBtns = container.querySelectorAll("[data-action='remove']");
  removeBtns.forEach(function(btn) {
    btn.addEventListener("click", function(e) {
      e.stopPropagation();
      var key = this.getAttribute("data-key");
      var idx = parseInt(this.getAttribute("data-idx"), 10);
      removeOtherExpenseRow(key, idx);
    });
  });

  // Setup number formatting on new inputs
  var amountInputs = container.querySelectorAll(".exp-other-row-amount, .exp-other-row-times");
  amountInputs.forEach(function(input) {
    setupNumberInput(input);
  });

  // Live update card total on input change
  var allInputs = container.querySelectorAll(".exp-other-row-name, .exp-other-row-amount, .exp-other-row-times");
  allInputs.forEach(function(input) {
    input.addEventListener("input", function() {
      var row = this.closest(".exp-other-row");
      if (!row) return;
      var key = row.getAttribute("data-key");
      syncOtherExpenseRowToData(row, key);
      updateOtherExpenseCardHeader(key);
    });
  });
}

/** Toggle a category card expanded/collapsed */
function toggleOtherExpenseCard(key) {
  // Collect current data before re-render
  collectOtherExpensesFromDOM();

  if (otherExpensesExpandedCards[key]) {
    delete otherExpensesExpandedCards[key];
  } else {
    otherExpensesExpandedCards[key] = true;
    // Ensure at least 1 empty row
    if (!expensesData.otherExpenses[key]) {
      expensesData.otherExpenses[key] = { items: [] };
    }
    if (expensesData.otherExpenses[key].items.length === 0) {
      expensesData.otherExpenses[key].items.push({ name: '', amount: 0, times: 0 });
    }
  }

  var searchVal = document.getElementById("other-expenses-search").value;
  renderOtherExpensesCards(searchVal);
}

/** Add a new expense row to a category */
function addOtherExpenseRow(key) {
  collectOtherExpensesFromDOM();
  if (!expensesData.otherExpenses[key]) {
    expensesData.otherExpenses[key] = { items: [] };
  }
  expensesData.otherExpenses[key].items.push({ name: '', amount: 0, times: 0 });

  var searchVal = document.getElementById("other-expenses-search").value;
  renderOtherExpensesCards(searchVal);
}

/** Remove an expense row from a category (keep at least 1) */
function removeOtherExpenseRow(key, idx) {
  collectOtherExpensesFromDOM();
  if (!expensesData.otherExpenses[key]) return;
  var items = expensesData.otherExpenses[key].items;
  if (items.length <= 1) return; // always keep at least 1 row
  items.splice(idx, 1);

  var searchVal = document.getElementById("other-expenses-search").value;
  renderOtherExpensesCards(searchVal);
}

/** Sync a single row's DOM values to the data model */
function syncOtherExpenseRowToData(rowEl, key) {
  var idx = parseInt(rowEl.getAttribute("data-idx"), 10);
  if (!expensesData.otherExpenses[key]) return;
  var items = expensesData.otherExpenses[key].items;
  if (idx >= items.length) return;

  var nameInput = rowEl.querySelector("[data-field='name']");
  var amountInput = rowEl.querySelector("[data-field='amount']");
  var timesInput = rowEl.querySelector("[data-field='times']");

  items[idx].name = nameInput ? nameInput.value.trim() : '';
  items[idx].amount = amountInput ? parseFormattedNumber(amountInput.value) : 0;
  items[idx].times = timesInput ? parseFormattedNumber(timesInput.value) : 0;
}

/** Collect all other expenses data from DOM inputs */
function collectOtherExpensesFromDOM() {
  var container = document.getElementById("other-expenses-cards");
  if (!container) return;

  OTHER_EXPENSE_CATEGORIES.forEach(function(cat) {
    var rows = container.querySelectorAll('.exp-other-row[data-key="' + cat.key + '"]');
    if (rows.length === 0) return;
    var items = [];
    rows.forEach(function(row) {
      var nameInput = row.querySelector("[data-field='name']");
      var amountInput = row.querySelector("[data-field='amount']");
      var timesInput = row.querySelector("[data-field='times']");
      items.push({
        name: nameInput ? nameInput.value.trim() : '',
        amount: amountInput ? parseFormattedNumber(amountInput.value) : 0,
        times: timesInput ? parseFormattedNumber(timesInput.value) : 0
      });
    });
    if (!expensesData.otherExpenses) expensesData.otherExpenses = createEmptyOtherExpenses();
    expensesData.otherExpenses[cat.key] = { items: items };
  });

  // Also collect from no-results section
  var noResultsCard = document.getElementById("other-expenses-no-results-card");
  if (noResultsCard) {
    var rows = noResultsCard.querySelectorAll('.exp-other-row[data-key="others"]');
    if (rows.length > 0) {
      var items = [];
      rows.forEach(function(row) {
        var nameInput = row.querySelector("[data-field='name']");
        var amountInput = row.querySelector("[data-field='amount']");
        var timesInput = row.querySelector("[data-field='times']");
        items.push({
          name: nameInput ? nameInput.value.trim() : '',
          amount: amountInput ? parseFormattedNumber(amountInput.value) : 0,
          times: timesInput ? parseFormattedNumber(timesInput.value) : 0
        });
      });
      if (!expensesData.otherExpenses) expensesData.otherExpenses = createEmptyOtherExpenses();
      expensesData.otherExpenses.others = { items: items };
    }
  }
}

/** Update a card header to show total when filled */
function updateOtherExpenseCardHeader(key) {
  var total = getOtherCategoryTotal(key);
  var card = document.querySelector('.exp-other-card[data-key="' + key + '"]');
  if (!card) return;

  var totalEl = card.querySelector(".exp-other-card-total");
  if (total > 0) {
    card.classList.add("filled");
    if (totalEl) {
      totalEl.textContent = formatCurrency(total);
    } else {
      var header = card.querySelector(".exp-other-card-header");
      var span = document.createElement("span");
      span.className = "exp-other-card-total";
      span.textContent = formatCurrency(total);
      header.appendChild(span);
    }
  } else {
    card.classList.remove("filled");
    if (totalEl) totalEl.remove();
  }
}

/** Setup search functionality */
function setupOtherExpensesSearch() {
  var searchInput = document.getElementById("other-expenses-search");
  if (!searchInput) return;
  searchInput.addEventListener("input", function() {
    collectOtherExpensesFromDOM();
    renderOtherExpensesCards(this.value);
  });
}

/* --- Other Expenses Navigation --- */

/** Validate other expenses: amount and times must both be filled or both empty */
function validateOtherExpenses() {
  var containers = [
    document.getElementById("other-expenses-cards"),
    document.getElementById("other-expenses-no-results-card")
  ];
  for (var c = 0; c < containers.length; c++) {
    var container = containers[c];
    if (!container) continue;
    var rows = container.querySelectorAll(".exp-other-row");
    for (var i = 0; i < rows.length; i++) {
      var row = rows[i];
      var amountInput = row.querySelector("[data-field='amount']");
      var timesInput = row.querySelector("[data-field='times']");
      var amountVal = amountInput ? parseFormattedNumber(amountInput.value) : 0;
      var timesVal = timesInput ? parseFormattedNumber(timesInput.value) : 0;
      var hasAmount = amountVal > 0;
      var hasTimes = timesVal > 0;
      if (hasAmount && !hasTimes) {
        timesInput.classList.remove("shake");
        void timesInput.offsetWidth;
        timesInput.classList.add("shake");
        timesInput.addEventListener("animationend", function() { this.classList.remove("shake"); }, { once: true });
        showToast(t("toastFillTimes"));
        timesInput.focus();
        return false;
      }
      if (!hasAmount && hasTimes) {
        amountInput.classList.remove("shake");
        void amountInput.offsetWidth;
        amountInput.classList.add("shake");
        amountInput.addEventListener("animationend", function() { this.classList.remove("shake"); }, { once: true });
        showToast(t("toastFillAmount"));
        amountInput.focus();
        return false;
      }
    }
  }
  return true;
}

function goToOtherExpensesStep() {
  showExpenseStep("otherExpenses");
}

function goToResultStep() {
  if (!validateOtherExpenses()) return;
  collectOtherExpensesFromDOM();
  saveExpenses();

  // If amending, skip over-income check and go straight to result
  if (amendingFromResult) {
    amendingFromResult = false;
    sessionStorage.removeItem("worthMyMoneyAmending");
    showExpenseStep("result");
    return;
  }

  // Check over-income with all 5 categories
  var totals = getExpenseTotals();
  var totalAll = totals.housing + totals.utilities + totals.food + totals.transport + totals.others;
  if (totalAll > profile.income) {
    showOtherOverIncome();
    return;
  }

  showExpenseStep("result");
}

function goBackFromOtherExpenses() {
  collectOtherExpensesFromDOM();
  saveExpenses();
  showExpenseStep("milestone");
}

/* --- Other Expenses Over-Income Alert --- */

function showOtherOverIncome() {
  var totals = getExpenseTotals();
  var totalAll = totals.housing + totals.utilities + totals.food + totals.transport + totals.others;
  var currency = getCurrencyDisplay();

  var html = '<div class="exp-other-over-income-rows">';
  var cats = [
    { label: t("catHousing"), val: totals.housing },
    { label: t("catUtilities"), val: totals.utilities },
    { label: t("catFood"), val: totals.food },
    { label: t("catTransport"), val: totals.transport },
    { label: t("catOthers"), val: totals.others }
  ];
  cats.forEach(function(c) {
    html += '<div class="exp-other-over-income-row">' +
      '<span class="exp-other-over-income-cat">' + c.label + '</span>' +
      '<span class="exp-other-over-income-val">' + currency + ' ' + formatNumber(Math.round(c.val)) + '</span></div>';
  });
  html += '</div>';
  html += '<div class="exp-other-over-income-total">' + t("resOverIncomeTotal") + ' ' + formatCurrency(totalAll) + '</div>';

  document.getElementById("other-expenses-breakdown").innerHTML = html;
  document.getElementById("other-over-income-amount").textContent = t("resOverIncomeIncome") + ' ' + formatCurrency(profile.income);

  // Hide all other content on the page, show only the alert
  hideElement("other-expenses-subtitle");
  var dots = document.querySelector("#expenses-step-otherExpenses .exp-progress-dots");
  if (dots) dots.style.display = "none";
  var sectionHeader = document.querySelector("#expenses-step-otherExpenses .exp-other-section-header");
  if (sectionHeader) sectionHeader.style.display = "none";
  var searchWrap = document.querySelector("#expenses-step-otherExpenses .exp-other-search-wrap");
  if (searchWrap) searchWrap.style.display = "none";
  hideElement("other-expenses-cards");
  hideElement("other-expenses-no-results");
  var bottomNav = document.querySelector("#expenses-step-otherExpenses .exp-bottom-nav");
  if (bottomNav) bottomNav.style.display = "none";

  showElement("other-expenses-over-income");
  window.scrollTo(0, 0);
}

function dismissOtherOverIncome() {
  hideElement("other-expenses-over-income");

  // Restore all other content
  showElement("other-expenses-subtitle");
  var dots = document.querySelector("#expenses-step-otherExpenses .exp-progress-dots");
  if (dots) dots.style.display = "";
  var sectionHeader = document.querySelector("#expenses-step-otherExpenses .exp-other-section-header");
  if (sectionHeader) sectionHeader.style.display = "";
  var searchWrap = document.querySelector("#expenses-step-otherExpenses .exp-other-search-wrap");
  if (searchWrap) searchWrap.style.display = "";
  showElement("other-expenses-cards");
  var bottomNav = document.querySelector("#expenses-step-otherExpenses .exp-bottom-nav");
  if (bottomNav) bottomNav.style.display = "";
}

function adjustIncomeFromOther() {
  hideElement("other-expenses-over-income");
  collectOtherExpensesFromDOM();
  saveExpenses();
  navigateTo("profile");
}

/* --- Confetti --- */

function triggerConfetti() {
  var canvas = document.getElementById("confetti-canvas");
  if (!canvas) return;

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  var ctx = canvas.getContext("2d");

  var particles = [];
  var colors = ["#a3d78a", "#c1e59f", "#eeab88", "#ff5655", "#A97BF4", "#F4C4C4"];

  for (var i = 0; i < 80; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      w: Math.random() * 8 + 4,
      h: Math.random() * 6 + 3,
      color: colors[Math.floor(Math.random() * colors.length)],
      vy: Math.random() * 3 + 2,
      vx: (Math.random() - 0.5) * 2,
      rot: Math.random() * 360,
      rotSpd: (Math.random() - 0.5) * 10,
      opacity: 1
    });
  }

  var startTime = Date.now();
  var duration = 3000;

  function animate() {
    var elapsed = Date.now() - startTime;
    if (elapsed > duration) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    var globalOpacity = elapsed > (duration - 1000) ? (duration - elapsed) / 1000 : 1;

    particles.forEach(function(p) {
      p.y += p.vy;
      p.x += p.vx;
      p.rot += p.rotSpd;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot * Math.PI / 180);
      ctx.globalAlpha = globalOpacity;
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    });

    requestAnimationFrame(animate);
  }

  animate();
}

/* --- Profile Expenses Display --- */

function updateProfileExpenses() {
  var screens = ["profile"];
  var hasData = expensesData && expensesData.lastUpdated;

  for (var s = 0; s < screens.length; s++) {
    var prefix = screens[s];
    var section = document.getElementById(prefix + "-expenses-section");
    if (!section) continue;

    if (!hasData) {
      section.style.display = "none";
      continue;
    }

    section.style.display = "";
    var totals = getExpenseTotals();
    var html = "";
    var categories = [
      { key: "housing", label: t("catHousing") },
      { key: "utilities", label: t("catUtilities") },
      { key: "food", label: t("catFood") },
      { key: "transport", label: t("catTransport") },
      { key: "others", label: t("catOthers") }
    ];

    categories.forEach(function(cat) {
      if (totals[cat.key] > 0) {
        html += '<div class="profile-expense-row clickable" onclick="goToExpenseCategory(\'' + cat.key + '\')">' +
          '<span class="profile-expense-cat">' + cat.label + '</span>' +
          '<span class="profile-expense-amount">' + formatCurrency(totals[cat.key]) + '</span></div>';
      }
    });

    document.getElementById(prefix + "-expenses-summary").innerHTML = html;

    var total = totals.housing + totals.utilities + totals.food + totals.transport + totals.others;
    document.getElementById(prefix + "-expenses-total").innerHTML =
      '<span class="profile-expense-cat" style="font-weight:800;">' + t("catTotal") + '</span>' +
      '<span class="profile-expense-amount" style="font-size:16px;">' + formatCurrency(total) + '</span>';
  }
}

/* --- Repopulate from saved data --- */

function repopulateExpensesFromData() {
  if (!expensesData) return;

  // Backward compatibility: ensure otherExpenses exists
  if (!expensesData.otherExpenses) {
    expensesData.otherExpenses = createEmptyOtherExpenses();
  }

  // Ensure answered flags exist (backward compat with old saved data)
  if (expensesData.housing.answered === undefined) {
    expensesData.housing.answered = expensesData.housing.pays || expensesData.housing.monthlyAmount > 0 || expensesData.lastUpdated;
  }
  if (expensesData.housing.utilities.answered === undefined) {
    expensesData.housing.utilities.answered = expensesData.housing.utilities.pays || expensesData.housing.utilities.mode !== "none" || expensesData.lastUpdated;
  }
  if (expensesData.food.answered === undefined) {
    expensesData.food.answered = expensesData.food.pays || expensesData.lastUpdated;
  }
  if (expensesData.transport.answered === undefined) {
    expensesData.transport.answered = expensesData.transport.pays || expensesData.lastUpdated;
  }

  // Save a snapshot of all data before calling choice functions,
  // which may modify expensesData via toggle-deselect or mode resets.
  var snapshot = JSON.parse(JSON.stringify(expensesData));

  // Clear answered flags so choice functions don't trigger toggle-deselect
  expensesData.housing.answered = false;
  expensesData.housing.utilities.answered = false;
  expensesData.food.answered = false;
  expensesData.transport.answered = false;

  // Housing
  if (snapshot.housing.answered) {
    housingChoice(snapshot.housing.pays);
    if (snapshot.housing.pays && snapshot.housing.monthlyAmount) {
      document.getElementById("housing-amount").value = formatNumber(expensesData.housing.monthlyAmount);
    }
  }

  // Utilities
  if (snapshot.housing.utilities.answered) {
    utilitiesChoice(snapshot.housing.utilities.pays);
    if (snapshot.housing.utilities.pays) {
      if (snapshot.housing.utilities.mode === "total" && snapshot.housing.utilities.totalAmount) {
        document.getElementById("utilities-total").value = formatNumber(snapshot.housing.utilities.totalAmount);
      } else if (snapshot.housing.utilities.mode === "breakdown") {
        toggleUtilitiesBreakdown();
        var b = snapshot.housing.utilities.breakdown;
        if (b.electricity) document.getElementById("utilities-electricity").value = formatNumber(b.electricity);
        if (b.water) document.getElementById("utilities-water").value = formatNumber(b.water);
        if (b.internet) document.getElementById("utilities-internet").value = formatNumber(b.internet);
        if (b.others) document.getElementById("utilities-others").value = formatNumber(b.others);
      }
    }
  }

  // Food
  if (snapshot.food.answered) {
    foodChoice(snapshot.food.pays);
    if (snapshot.food.pays) {
      var f = snapshot.food;
      if (f.groceries.amount) document.getElementById("food-groceries-amount").value = formatNumber(f.groceries.amount);
      if (f.groceries.times) document.getElementById("food-groceries-times").value = formatNumber(f.groceries.times);
      if (f.eatingOut.amount) document.getElementById("food-eating-amount").value = formatNumber(f.eatingOut.amount);
      if (f.eatingOut.times) document.getElementById("food-eating-times").value = formatNumber(f.eatingOut.times);
      if (f.coffee.amount) document.getElementById("food-coffee-amount").value = formatNumber(f.coffee.amount);
      if (f.coffee.times) document.getElementById("food-coffee-times").value = formatNumber(f.coffee.times);
      if (f.others.amount) document.getElementById("food-others-amount").value = formatNumber(f.others.amount);
      if (f.others.times) document.getElementById("food-others-times").value = formatNumber(f.others.times);
    }
  }

  // Transport
  if (snapshot.transport.answered) {
    transportChoice(snapshot.transport.pays);
    if (snapshot.transport.pays) {
      var t = snapshot.transport;
      if (t.rental.amount) document.getElementById("transport-rental-amount").value = formatNumber(t.rental.amount);
      if (t.gas.amount) document.getElementById("transport-gas-amount").value = formatNumber(t.gas.amount);
      if (t.gas.times) document.getElementById("transport-gas-times").value = formatNumber(t.gas.times);
      if (t.uber.amount) document.getElementById("transport-uber-amount").value = formatNumber(t.uber.amount);
      if (t.uber.times) document.getElementById("transport-uber-times").value = formatNumber(t.uber.times);
      if (t.others.amount) document.getElementById("transport-others-amount").value = formatNumber(t.others.amount);
      if (t.others.times) document.getElementById("transport-others-times").value = formatNumber(t.others.times);
    }
  }

  // Restore expensesData from snapshot since choice functions may have modified it
  expensesData.housing = snapshot.housing;
  expensesData.food = snapshot.food;
  expensesData.transport = snapshot.transport;
}

/* ------------------------------------------------------------
   16d. Over-Income Alert
   ------------------------------------------------------------ */

/**
 * Check if accumulated expenses exceed income.
 * Called during forward navigation in the expenses wizard.
 * @param {string} targetStep - Step user is navigating TO
 * @returns {boolean} true if blocked (over income), false if OK
 */
function checkExpensesOverIncome(targetStep) {
  var income = profile.income;
  if (!income) return false;

  var totals = getExpenseTotals();
  var accumulated = 0;

  // Housing is always collected before any forward navigation
  accumulated += totals.housing;

  // Utilities collected when navigating to food or beyond
  if (targetStep === "food" || targetStep === "transport" || targetStep === "milestone") {
    accumulated += totals.utilities;
  }

  // Food collected when navigating to transport or beyond
  if (targetStep === "transport" || targetStep === "milestone") {
    accumulated += totals.food;
  }

  // Transport collected when navigating to milestone
  if (targetStep === "milestone") {
    accumulated += totals.transport;
  }

  if (accumulated > income) {
    showOverIncomeModal();
    return true;
  }
  return false;
}

/** Show the over-income modal */
function showOverIncomeModal() {
  var modal = document.getElementById("over-income-modal");
  if (modal) modal.style.display = "flex";
}

/** Dismiss the modal (Review numbers) - user stays on current step */
function dismissOverIncomeModal() {
  var modal = document.getElementById("over-income-modal");
  if (modal) modal.style.display = "none";
}

/** Navigate to profile to adjust income */
function adjustIncomeFromModal() {
  dismissOverIncomeModal();
  navigateTo("profile");
}

/* ------------------------------------------------------------
   16e. Result Page Rendering
   ------------------------------------------------------------ */

/** Color map for timeline segments — Red for spending, Gold for savings */
var TIMELINE_COLORS = {
  housing:   "#E85D3A",
  utilities: "#E85D3A",
  food:      "#E85D3A",
  transport: "#E85D3A",
  others:    "#E85D3A",
  savings:   "#E8C07A"
};

/** Text colors — matching track colors */
var TIMELINE_TEXT_COLORS = {
  housing:   "#E85D3A",
  utilities: "#E85D3A",
  food:      "#E85D3A",
  transport: "#E85D3A",
  others:    "#E85D3A",
  savings:   "#D4940A"
};

/** Render all sections of the result page */
function renderResultPage() {
  var income = profile.income;
  var totals = getExpenseTotals();
  var totalExpenses = totals.housing + totals.utilities + totals.food + totals.transport + totals.others;
  var monthlySavings = income - totalExpenses;

  renderResultSection1(income, totalExpenses, monthlySavings);
  renderResultSection2(income, totals, monthlySavings);
  renderResultSection3(income, totalExpenses, monthlySavings);
  renderResultSection4(income, totals, totalExpenses, monthlySavings);
  renderResultSection5(income, totals);
  renderResultSection6(income, totals);
}

/** Section 1: The numbers are in */
function renderResultSection1(income, totalExpenses, monthlySavings) {
  var currency = getCurrencyDisplay();
  document.getElementById("res-earn-currency").textContent = currency;
  document.getElementById("res-earn-value").textContent = formatNumber(Math.round(income));
  document.getElementById("res-spend-currency").textContent = currency;
  document.getElementById("res-spend-value").textContent = formatNumber(Math.round(totalExpenses));
  document.getElementById("res-save-currency").textContent = currency;
  document.getElementById("res-save-value").textContent = monthlySavings > 0
    ? formatNumber(Math.round(monthlySavings))
    : "0";
}

/** Section 2: Where your money goes (paycheck story — days out of 30) */
function renderResultSection2(income, totals, monthlySavings) {
  var DAYS = 30;
  var totalExpenses = totals.housing + totals.utilities + totals.food + totals.transport + totals.others;
  var expenseDays = Math.round((totalExpenses / income) * DAYS);
  if (expenseDays > DAYS) expenseDays = DAYS;
  var savingsDays = DAYS - expenseDays;

  // Title
  document.getElementById("res-time-title").textContent = t("resTimeTitle");

  // Intro text — paycheck story
  var introEl = document.getElementById("res-time-intro");
  var dayLabel = t("resTimeDayLabel");
  var introHTML = t("resTimeIntro") + "<br>";
  if (savingsDays > 0) {
    introHTML += t("resTimeExpenseLine").replace("{expDay}", expenseDays) + "<br>";
    introHTML += t("resTimeSavingsLine").replace("{savDays}", savingsDays);
  } else {
    introHTML += t("resTimeNoSavings");
  }
  introEl.innerHTML = introHTML;

  // Timeline day labels
  var daysEl = document.getElementById("res-timeline-days");
  daysEl.innerHTML = "<span>" + dayLabel + " 1</span>" +
    "<span>" + dayLabel + " 10</span>" +
    "<span>" + dayLabel + " 20</span>" +
    "<span>" + dayLabel + " 30</span>";

  // Build timeline segments & breakdown
  var categories = [
    { key: "housing", label: t("catHousing"), total: totals.housing },
    { key: "utilities", label: t("catUtilities"), total: totals.utilities },
    { key: "food", label: t("catFood"), total: totals.food },
    { key: "transport", label: t("catTransport"), total: totals.transport },
    { key: "others", label: t("catOthers"), total: totals.others }
  ];

  var trackHTML = "";
  var breakdownHTML = "<p class='res-time-breakdown-title'>" + t("resTimeBreakdownTitle") + "</p>";
  var currentDay = 0;

  categories.forEach(function(cat) {
    if (cat.total <= 0) return;
    var exactDays = (cat.total / income) * DAYS;
    var endDayExact = currentDay + exactDays;
    var startDayRound = Math.round(currentDay);
    var endDayRound = Math.round(endDayExact);
    if (endDayRound > DAYS) endDayRound = DAYS;
    if (endDayRound <= startDayRound) endDayRound = startDayRound + 1;
    var widthPct = (exactDays / DAYS) * 100;

    trackHTML += "<div class='res-timeline-seg' style='flex:" + widthPct.toFixed(2) + ";background:" + TIMELINE_COLORS[cat.key] + ";'></div>";

    var displayStart = startDayRound + 1; // Day 1-based
    var displayEnd = endDayRound;

    breakdownHTML += "<div class='res-time-row'>" +
      "<span class='res-time-dot' style='background:" + TIMELINE_COLORS[cat.key] + "'></span>" +
      "<span class='res-time-range' style='color:" + TIMELINE_TEXT_COLORS[cat.key] + "'>" + dayLabel + " " + displayStart + "–" + displayEnd + ":</span>" +
      "<span class='res-time-cat'>" + cat.label + "</span></div>";

    currentDay = endDayExact;
  });

  // Savings segment
  if (savingsDays > 0) {
    var savingsWidthPct = (savingsDays / DAYS) * 100;
    trackHTML += "<div class='res-timeline-seg' style='flex:" + savingsWidthPct.toFixed(2) + ";background:" + TIMELINE_COLORS.savings + ";'></div>";

    var savingsStart = Math.round(currentDay) + 1;
    breakdownHTML += "<div class='res-time-row'>" +
      "<span class='res-time-dot' style='background:" + TIMELINE_COLORS.savings + "'></span>" +
      "<span class='res-time-range' style='color:" + TIMELINE_TEXT_COLORS.savings + "'>" + dayLabel + " " + savingsStart + "–" + DAYS + ":</span>" +
      "<span class='res-time-cat'>" + t("resSavingsYours") + "</span></div>";
  }

  document.getElementById("res-timeline-track").innerHTML = trackHTML;
  document.getElementById("res-time-breakdown").innerHTML = breakdownHTML;
}

/** Section 3: Looking ahead */
function renderResultSection3(income, totalExpenses, monthlySavings) {
  _calcTotalExpenses = totalExpenses;

  var annualSavings = monthlySavings * 12;
  var emergencyFund = totalExpenses * 6;

  // Annual savings
  var annualEl = document.getElementById("res-annual-value");
  if (monthlySavings > 0) {
    annualEl.textContent = formatCurrency(annualSavings);
    annualEl.classList.remove("res-nothing");
  } else {
    annualEl.textContent = t("resNothing");
    annualEl.classList.add("res-nothing");
  }

  // Emergency fund amount — split currency + number
  var currency = getCurrencyDisplay();
  document.getElementById("res-emergency-currency").textContent = currency;
  document.getElementById("res-emergency-value").textContent = formatNumber(Math.round(emergencyFund));

  // Months to save / nothing state
  var monthsLabel = document.getElementById("res-emergency-months-label");
  var monthsValue = document.getElementById("res-emergency-months-value");
  var monthsNote = document.getElementById("res-emergency-months-note");
  var monthsCard = document.getElementById("res-emergency-months-card");

  if (monthlySavings > 0) {
    var monthsToSave = Math.ceil(emergencyFund / monthlySavings);
    if (currentLang === "vi") {
      monthsLabel.textContent = "Bạn cần làm";
      monthsValue.innerHTML = "<span class='res-ahead-months-value'>" + monthsToSave + " tháng</span>";
      monthsNote.textContent = "để tích lũy quỹ dự phòng";
    } else {
      monthsLabel.textContent = "You'll need";
      monthsValue.innerHTML = "<span class='res-ahead-months-value'>" + monthsToSave + " months</span>";
      monthsNote.textContent = "to build your emergency fund";
    }
    monthsCard.classList.remove("res-nothing-card");
  } else {
    if (currentLang === "vi") {
      monthsLabel.textContent = "Với tốc độ hiện tại, bạn chưa tạo được quỹ dự phòng. Chỉ cần cắt giảm nhỏ thôi cũng thay đổi được.";
    } else {
      monthsLabel.textContent = "At this pace, you can't build an emergency fund yet. Even small cuts can make a difference.";
    }
    monthsValue.textContent = "";
    monthsNote.textContent = "";
    monthsCard.classList.add("res-nothing-card");
  }

  // Initialize emergency fund calculator
  initEmergencyCalc(monthlySavings);
}

/** Emergency fund calculator — toggle visibility */
function toggleEmergencyCalc() {
  var section = document.getElementById("ahead-calc-section");
  var btn = document.getElementById("ahead-calc-toggle");
  if (section.style.display === "none") {
    section.style.display = "";
    btn.textContent = t("resAheadCalcClose");
  } else {
    section.style.display = "none";
    btn.textContent = t("resAheadCalcToggle");
  }
}

/** Emergency fund calculator — set defaults & attach listeners */
function initEmergencyCalc(monthlySavings) {
  var savingsInput = document.getElementById("ahead-calc-savings");
  var toggleBtn = document.getElementById("ahead-calc-toggle");
  var section = document.getElementById("ahead-calc-section");

  // Reset to closed state
  section.style.display = "none";
  toggleBtn.textContent = t("resAheadCalcToggle");

  // Set labels
  document.getElementById("ahead-calc-months-label").textContent = t("resAheadCalcMonthsLabel");
  document.getElementById("ahead-calc-savings-label").textContent = t("resAheadCalcSavingsLabel");
  document.getElementById("ahead-calc-months-unit").textContent = t("resAheadCalcMonthsUnit");
  document.getElementById("ahead-calc-savings-suffix").textContent = t("resAheadCalcSavingsSuffix");

  // Set result card labels
  document.getElementById("ahead-calc-goal-label").textContent = t("resAheadCalcGoalLabel");
  document.getElementById("ahead-calc-need-label").textContent = t("resAheadCalcNeedLabel");
  document.getElementById("ahead-calc-need-note").textContent = t("resAheadCalcNeedNote");

  // Set currency
  var currency = getCurrencyDisplay();
  document.getElementById("ahead-calc-currency").textContent = currency;
  document.getElementById("ahead-calc-goal-currency").textContent = currency;

  // Set defaults
  document.getElementById("ahead-calc-months-value").textContent = "6";
  savingsInput.value = monthlySavings > 0 ? formatNumber(Math.round(monthlySavings)) : "";

  // Remove old listeners by cloning savings input
  var newSavings = savingsInput.cloneNode(true);
  savingsInput.parentNode.replaceChild(newSavings, savingsInput);

  // Re-attach formatting + calculation listener
  setupNumberInput(newSavings);
  newSavings.addEventListener("input", updateEmergencyCalc);

  // Calculate initial result
  updateEmergencyCalc();
}

/** Emergency fund calculator — step months up/down */
function stepEmergencyMonths(delta) {
  var valueEl = document.getElementById("ahead-calc-months-value");
  var current = parseInt(valueEl.textContent, 10) || 6;
  var next = current + delta;
  if (next < 1) next = 1;
  if (next > 24) next = 24;
  valueEl.textContent = next;
  updateEmergencyCalc();
}

/** Emergency fund calculator — recalculate result */
function updateEmergencyCalc() {
  var savings = parseFormattedNumber(document.getElementById("ahead-calc-savings").value);
  var months = parseInt(document.getElementById("ahead-calc-months-value").textContent, 10) || 0;
  var goalValue = document.getElementById("ahead-calc-goal-value");
  var needValue = document.getElementById("ahead-calc-need-value");

  if (months > 0 && _calcTotalExpenses > 0) {
    var totalNeeded = _calcTotalExpenses * months;
    goalValue.textContent = formatNumber(Math.round(totalNeeded));
  } else {
    goalValue.textContent = "—";
  }

  if (savings > 0 && months > 0 && _calcTotalExpenses > 0) {
    var totalNeeded = _calcTotalExpenses * months;
    var monthsNeeded = Math.ceil(totalNeeded / savings);
    if (currentLang === "vi") {
      needValue.textContent = monthsNeeded + " tháng";
    } else {
      needValue.textContent = monthsNeeded + " months";
    }
  } else {
    needValue.textContent = "—";
  }
}

/** Section 4: How healthy is your budget? */
function renderResultSection4(income, totals, totalExpenses, monthlySavings) {
  var needsTotal = totals.housing + totals.utilities + totals.food + totals.transport;
  var wantsTotal = totals.others;
  var savingsPct = monthlySavings > 0 ? Math.round((monthlySavings / income) * 100) : 0;
  var needsPct = Math.round((needsTotal / income) * 100);
  var wantsPct = Math.round((wantsTotal / income) * 100);

  // Cap bar widths at 100%
  var needsBarW = Math.min(needsPct, 100);
  var wantsBarW = Math.min(wantsPct, 100);
  var savingsBarW = Math.min(savingsPct, 100);

  // Needs: green if <= 50%, red otherwise
  var needsBar = document.getElementById("res-bar-needs-you");
  needsBar.style.width = needsBarW + "%";
  needsBar.className = "res-health-bar " + (needsPct <= 50 ? "res-bar-green" : "res-bar-red");
  document.getElementById("res-label-needs-you").textContent = needsPct + "%";

  // Wants: green if <= 30%, red otherwise
  var wantsBar = document.getElementById("res-bar-wants-you");
  wantsBar.style.width = wantsBarW + "%";
  wantsBar.className = "res-health-bar " + (wantsPct <= 30 ? "res-bar-green" : "res-bar-red");
  document.getElementById("res-label-wants-you").textContent = wantsPct + "%";

  // Savings: green if >= 20%, grey if 0, red otherwise
  var savingsBar = document.getElementById("res-bar-savings-you");
  savingsBar.style.width = savingsBarW > 0 ? savingsBarW + "%" : "100%";
  if (savingsPct === 0) {
    savingsBar.className = "res-health-bar res-bar-grey";
  } else if (savingsPct >= 20) {
    savingsBar.className = "res-health-bar res-bar-green";
  } else {
    savingsBar.className = "res-health-bar res-bar-red";
  }
  document.getElementById("res-label-savings-you").textContent = savingsPct > 0 ? savingsPct + "%" : "";

  // Savings health score — highlight active tier
  var activeTier;
  if (savingsPct <= 0) {
    activeTier = "tight";
  } else if (savingsPct <= 9) {
    activeTier = "stretched";
  } else if (savingsPct <= 19) {
    activeTier = "balance";
  } else if (savingsPct <= 29) {
    activeTier = "healthy";
  } else {
    activeTier = "strong";
  }

  var rows = document.querySelectorAll(".res-score-row");
  for (var i = 0; i < rows.length; i++) {
    var row = rows[i];
    var youLabel = row.querySelector(".res-score-you");
    if (youLabel) row.removeChild(youLabel);
    if (row.getAttribute("data-tier") === activeTier) {
      row.classList.add("active");
      var youSpan = document.createElement("span");
      youSpan.className = "res-score-you";
      youSpan.textContent = t("resYouLabel");
      row.appendChild(youSpan);
    } else {
      row.classList.remove("active");
    }
  }

  // Verdict text
  var verdict = document.getElementById("res-score-verdict");
  if (savingsPct === 0) {
    verdict.textContent = currentLang === "vi" ? "Ối, có lẽ nên xem lại các khoản chi tiêu nhé." : "Oops, you might want to review your expenses.";
  } else {
    verdict.textContent = currentLang === "vi" ? "Bạn đang tiết kiệm " + savingsPct + "% thu nhập." : "You're saving " + savingsPct + "% of income.";
  }
}

/** Section 5: What if... interactive calculator */
var whatifOriginals = {};
var whatifIncome = 0;
var whatifCats = ["housing", "utilities", "food", "transport", "others"];
var whatifListenersAttached = false;

function renderResultSection5(income, totals) {
  whatifIncome = income;
  whatifOriginals = {
    housing: totals.housing,
    utilities: totals.utilities,
    food: totals.food,
    transport: totals.transport,
    others: totals.others
  };

  var currency = getCurrencyDisplay();
  document.getElementById("whatif-spend-currency").textContent = currency;
  document.getElementById("whatif-save-currency").textContent = currency;

  // Set up sliders with real data
  for (var i = 0; i < whatifCats.length; i++) {
    var cat = whatifCats[i];
    var orig = Math.round(whatifOriginals[cat]);
    var slider = document.getElementById("whatif-slider-" + cat);
    var maxVal = Math.round(orig * 2);
    if (maxVal < 1) maxVal = Math.round(profile.income * 0.5) || 1000;

    slider.min = 0;
    slider.max = maxVal;
    slider.step = 1;
    slider.value = orig;

    document.getElementById("whatif-" + cat + "-current").textContent = formatNumber(Math.round(orig));
  }

  // Attach listeners only once
  if (!whatifListenersAttached) {
    for (var j = 0; j < whatifCats.length; j++) {
      (function(cat) {
        document.getElementById("whatif-slider-" + cat).addEventListener("input", whatifRecalculate);

        var newInput = document.getElementById("whatif-" + cat + "-new");
        // Live formatting while typing
        newInput.addEventListener("input", function() {
          var raw = parseFormattedNumber(this.value);
          var slider = document.getElementById("whatif-slider-" + cat);
          if (!isNaN(raw) && raw >= 0) {
            // Expand slider max if typed value exceeds it
            var sliderMax = parseInt(slider.max);
            if (raw > sliderMax) {
              slider.max = Math.round(raw * 1.5);
            }
            slider.value = Math.round(raw);
          }
          whatifRecalculate();
        });
        // Format on blur
        newInput.addEventListener("blur", function() {
          var raw = parseFormattedNumber(this.value);
          if (!isNaN(raw) && raw >= 0) {
            this.value = formatNumber(Math.round(raw));
          } else {
            // Reset to slider value if invalid
            this.value = formatNumber(parseInt(document.getElementById("whatif-slider-" + cat).value));
          }
        });
        // Select all on focus for easy replacement
        newInput.addEventListener("focus", function() {
          this.select();
        });
      })(whatifCats[j]);
    }
    document.getElementById("whatif-btn-reset").addEventListener("click", whatifReset);
    whatifListenersAttached = true;
  }

  whatifRecalculate();
}

function whatifGetTierName(pct) {
  if (pct <= 0) return t("tierTight");
  if (pct <= 9) return t("tierStretched");
  if (pct <= 19) return t("tierBalance");
  if (pct <= 29) return t("tierHealthy");
  return t("tierStrong");
}

function whatifGetTierColor(pct) {
  if (pct <= 0) return "#E85D3A";
  if (pct <= 9) return "#D4940A";
  if (pct <= 19) return "#A3B865";
  if (pct <= 29) return "#02b887";
  return "#2E8B57";
}

function whatifRecalculate() {
  var totalSpending = 0;
  var originalTotal = 0;
  var currency = getCurrencyDisplay();

  for (var i = 0; i < whatifCats.length; i++) {
    var cat = whatifCats[i];
    var slider = document.getElementById("whatif-slider-" + cat);
    var val = parseInt(slider.value);
    var orig = whatifOriginals[cat];
    totalSpending += val;
    originalTotal += orig;

    // Update display values
    var currentEl = document.getElementById("whatif-" + cat + "-current");
    var newEl = document.getElementById("whatif-" + cat + "-new");
    // Only update input value if it's not currently focused (user typing)
    if (document.activeElement !== newEl) {
      newEl.value = formatNumber(Math.round(val));
    }

    if (Math.round(val) !== Math.round(orig)) {
      currentEl.classList.remove("same");
      newEl.classList.add("changed");
    } else {
      currentEl.classList.add("same");
      newEl.classList.remove("changed");
    }

    // Update slider track fill
    var sliderMin = parseInt(slider.min);
    var sliderMax = parseInt(slider.max);
    var pct = ((val - sliderMin) / (sliderMax - sliderMin)) * 100;
    slider.style.background = "linear-gradient(to right, #E85D3A 0%, #E85D3A " + pct + "%, #EDEAE6 " + pct + "%, #EDEAE6 100%)";
  }

  var monthlySaving = whatifIncome - totalSpending;
  var savingsPct = Math.round((monthlySaving / whatifIncome) * 100);
  var spendingDelta = totalSpending - originalTotal;
  var savingDelta = monthlySaving - (whatifIncome - originalTotal);
  var origSavingsPct = Math.round(((whatifIncome - originalTotal) / whatifIncome) * 100);
  var healthDelta = savingsPct - origSavingsPct;

  // Update spending impact
  document.getElementById("whatif-impact-spending").textContent = formatNumber(Math.round(totalSpending));

  var spendDeltaEl = document.getElementById("whatif-impact-spending-delta");
  if (spendingDelta === 0) {
    spendDeltaEl.textContent = t("resWhatifNoChange");
    spendDeltaEl.className = "whatif-impact-delta neutral";
  } else if (spendingDelta < 0) {
    spendDeltaEl.textContent = "\u2212" + currency + " " + formatNumber(Math.round(Math.abs(spendingDelta)));
    spendDeltaEl.className = "whatif-impact-delta positive";
  } else {
    spendDeltaEl.textContent = "+" + currency + " " + formatNumber(Math.round(spendingDelta));
    spendDeltaEl.className = "whatif-impact-delta negative";
  }

  // Update health score impact
  var healthEl = document.getElementById("whatif-impact-health");
  healthEl.textContent = savingsPct + "%";
  healthEl.style.color = whatifGetTierColor(savingsPct);
  document.getElementById("whatif-impact-tier").textContent = whatifGetTierName(savingsPct);

  var healthDeltaEl = document.getElementById("whatif-impact-health-delta");
  if (healthDelta === 0) {
    healthDeltaEl.textContent = t("resWhatifNoChange");
    healthDeltaEl.className = "whatif-impact-delta neutral";
  } else if (healthDelta > 0) {
    healthDeltaEl.textContent = "+" + healthDelta + "%";
    healthDeltaEl.className = "whatif-impact-delta positive";
  } else {
    healthDeltaEl.textContent = healthDelta + "%";
    healthDeltaEl.className = "whatif-impact-delta negative";
  }

  // Update saving impact
  var savingEl = document.getElementById("whatif-impact-saving");
  if (monthlySaving < 0) {
    savingEl.textContent = "\u2212" + formatNumber(Math.round(Math.abs(monthlySaving)));
    savingEl.className = "whatif-impact-value negative";
  } else {
    savingEl.textContent = formatNumber(Math.round(monthlySaving));
    savingEl.className = "whatif-impact-value save";
  }

  var saveDeltaEl = document.getElementById("whatif-impact-saving-delta");
  if (savingDelta === 0) {
    saveDeltaEl.textContent = t("resWhatifNoChange");
    saveDeltaEl.className = "whatif-impact-delta neutral";
  } else if (savingDelta > 0) {
    saveDeltaEl.textContent = "+" + currency + " " + formatNumber(Math.round(savingDelta));
    saveDeltaEl.className = "whatif-impact-delta positive";
  } else {
    saveDeltaEl.textContent = "\u2212" + currency + " " + formatNumber(Math.round(Math.abs(savingDelta)));
    saveDeltaEl.className = "whatif-impact-delta negative";
  }
}

function whatifReset() {
  for (var i = 0; i < whatifCats.length; i++) {
    var cat = whatifCats[i];
    document.getElementById("whatif-slider-" + cat).value = Math.round(whatifOriginals[cat]);
  }
  whatifRecalculate();
}

/* ------------------------------------------------------------
   16f. Amend Your Figures (Section 6)
   ------------------------------------------------------------ */

/** Populate the amend card with current values */
function renderResultSection6(income, totals) {
  var el;
  el = document.getElementById("res-amend-housing");
  if (el) el.textContent = formatCurrency(totals.housing);
  el = document.getElementById("res-amend-utilities");
  if (el) el.textContent = formatCurrency(totals.utilities);
  el = document.getElementById("res-amend-food");
  if (el) el.textContent = formatCurrency(totals.food);
  el = document.getElementById("res-amend-transport");
  if (el) el.textContent = formatCurrency(totals.transport);
  el = document.getElementById("res-amend-others");
  if (el) el.textContent = formatCurrency(totals.others);
  el = document.getElementById("res-amend-income");
  if (el) el.textContent = formatCurrency(income);
}

/** Track whether we're amending from the result page */
var amendingFromResult = sessionStorage.getItem("worthMyMoneyAmending") === "true";

/** Navigate to a category step to amend figures */
function amendExpenseCategory(category) {
  amendingFromResult = true;
  sessionStorage.setItem("worthMyMoneyAmending", "true");
  if (category === "income") {
    navigateTo("profile");
    return;
  }
  if (category === "housing") {
    showExpenseStep("housing");
  } else if (category === "utilities") {
    showExpenseStep("utilities");
  } else if (category === "food") {
    showExpenseStep("food");
  } else if (category === "transport") {
    showExpenseStep("transport");
  } else if (category === "otherExpenses") {
    showExpenseStep("otherExpenses");
  }
}

/** Return to result page after amending, collecting & saving data */
function finishAmend() {
  amendingFromResult = false;
  sessionStorage.removeItem("worthMyMoneyAmending");
  // Collect data for the current step before returning
  if (expenseStep === "housing") {
    collectHousingData();
  } else if (expenseStep === "utilities") {
    collectUtilitiesData();
  } else if (expenseStep === "food") {
    collectFoodData();
  } else if (expenseStep === "transport") {
    collectTransportData();
  } else if (expenseStep === "otherExpenses") {
    collectOtherExpensesFromDOM();
  }
  saveExpenses();
  showExpenseStep("result");
}

/* ------------------------------------------------------------
   16g. Welcome-Back Modal (Returning Users)
   ------------------------------------------------------------ */

/** Show the welcome-back modal for returning users with saved data */
function showWelcomeBackModal() {
  var modal = document.getElementById("welcome-back-modal");
  if (!modal) return;

  // Populate values
  var totals = getExpenseTotals();
  var greeting = document.getElementById("wb-modal-greeting");
  if (profile.name) {
    greeting.textContent = t("wbGreetingName").replace("{name}", profile.name);
  } else {
    greeting.textContent = t("wbGreeting");
  }

  var el;
  el = document.getElementById("wb-amend-housing");
  if (el) el.textContent = formatCurrency(totals.housing);
  el = document.getElementById("wb-amend-utilities");
  if (el) el.textContent = formatCurrency(totals.utilities);
  el = document.getElementById("wb-amend-food");
  if (el) el.textContent = formatCurrency(totals.food);
  el = document.getElementById("wb-amend-transport");
  if (el) el.textContent = formatCurrency(totals.transport);
  el = document.getElementById("wb-amend-others");
  if (el) el.textContent = formatCurrency(totals.others);
  el = document.getElementById("wb-amend-income");
  if (el) el.textContent = formatCurrency(profile.income);

  modal.style.display = "flex";
}

/** Dismiss the welcome-back modal */
function dismissWelcomeBackModal() {
  var modal = document.getElementById("welcome-back-modal");
  if (modal) modal.style.display = "none";
}

/** Amend a category from the welcome-back modal */
function wbAmendCategory(category) {
  dismissWelcomeBackModal();
  amendExpenseCategory(category);
}

/** Go straight to the results page */
function wbGoToResults() {
  dismissWelcomeBackModal();
  showExpenseStep("result");
}

/** Start fresh — clear data AND reset all UI fields */
function wbStartFresh() {
  dismissWelcomeBackModal();
  expensesData = createEmptyExpenses();
  saveExpenses();

  // Reset all choice card selections
  var choiceCards = document.querySelectorAll(".exp-choice-card, .exp-choice-btn");
  for (var i = 0; i < choiceCards.length; i++) {
    choiceCards[i].classList.remove("selected", "not-selected");
  }

  // Clear all expense input fields
  var expenseInputIds = [
    "housing-amount",
    "utilities-total", "utilities-electricity", "utilities-water", "utilities-internet", "utilities-others",
    "food-groceries-amount", "food-groceries-times",
    "food-eating-amount", "food-eating-times",
    "food-coffee-amount", "food-coffee-times",
    "food-others-amount", "food-others-times",
    "transport-rental-amount",
    "transport-gas-amount", "transport-gas-times",
    "transport-uber-amount", "transport-uber-times",
    "transport-others-amount", "transport-others-times"
  ];
  for (var j = 0; j < expenseInputIds.length; j++) {
    var el = document.getElementById(expenseInputIds[j]);
    if (el) el.value = "";
  }

  // Hide conditional sections
  var hideSections = [
    "housing-no-msg", "housing-amount-section", "housing-result", "housing-pie-area",
    "utilities-no-msg", "utilities-input-section", "utilities-breakdown-section", "utilities-result", "utilities-pie-area",
    "food-no-msg", "food-breakdown-section", "food-result", "food-pie-area",
    "transport-no-msg", "transport-breakdown-section", "transport-result", "transport-pie-area"
  ];
  for (var k = 0; k < hideSections.length; k++) {
    hideElement(hideSections[k]);
  }

  // Reset nav forward buttons to disabled
  var navForwards = ["housing-nav-forward", "utilities-nav-forward", "food-nav-forward", "transport-nav-forward"];
  for (var m = 0; m < navForwards.length; m++) {
    var btn = document.getElementById(navForwards[m]);
    if (btn) {
      btn.classList.add("exp-nav-disabled");
      btn.disabled = true;
    }
  }

  // Clear other expenses
  var otherContainer = document.getElementById("other-expenses-list");
  if (otherContainer) otherContainer.innerHTML = "";

  showExpenseStep("housing");
}

/* ------------------------------------------------------------
   16h. Swipe Navigation
   ------------------------------------------------------------ */

/** Try to navigate forward in the expenses wizard. Returns true if navigation happened. */
function swipeExpensesForward() {
  // If amending from result, forward also returns to result
  if (amendingFromResult) {
    finishAmend();
    return true;
  }
  if (expenseStep === "housing") {
    if (!isHousingValid()) return false;
    goToUtilitiesStep();
    return true;
  }
  if (expenseStep === "utilities") {
    if (!isUtilitiesValid()) return false;
    goToFoodStep();
    return true;
  }
  if (expenseStep === "food") {
    if (!isFoodValid()) return false;
    goToTransportStep();
    return true;
  }
  if (expenseStep === "transport") {
    if (!isTransportValid()) return false;
    showMilestoneSummary();
    return true;
  }
  if (expenseStep === "otherExpenses") {
    if (!validateOtherExpenses()) return false;
    goToResultStep();
    return true;
  }
  // milestone and result: no forward swipe (milestone has explicit buttons, result is the end)
  return false;
}

/** Try to navigate backward in the expenses wizard. Returns true if navigation happened. */
function swipeExpensesBack() {
  if (expenseStep === "housing") {
    return false;
  }
  expensesBack();
  return true;
}

/** Setup touch swipe detection on the expenses screen */
function setupExpensesSwipe() {
  var screen = document.getElementById("screen-expenses");
  if (!screen) return;

  var startX = 0;
  var startY = 0;
  var tracking = false;
  var SWIPE_THRESHOLD = 60;

  screen.addEventListener("touchstart", function(e) {
    var tag = e.target.tagName.toLowerCase();
    if (tag === "input" || tag === "textarea" || tag === "select" || tag === "button") {
      tracking = false;
      return;
    }
    if (e.target.closest("button") || e.target.closest("a")) {
      tracking = false;
      return;
    }
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    tracking = true;
  }, { passive: true });

  screen.addEventListener("touchend", function(e) {
    if (!tracking) return;
    tracking = false;

    var endX = e.changedTouches[0].clientX;
    var endY = e.changedTouches[0].clientY;
    var dx = endX - startX;
    var dy = endY - startY;

    if (Math.abs(dx) < SWIPE_THRESHOLD || Math.abs(dy) > Math.abs(dx)) return;

    var success;
    if (dx < 0) {
      success = swipeExpensesForward();
    } else {
      success = swipeExpensesBack();
    }

    if (!success) {
      bounceExpensesScreen(dx < 0 ? "left" : "right");
    }
  }, { passive: true });
}

/** Visual bounce when swipe is rejected */
function bounceExpensesScreen(direction) {
  var screen = document.getElementById("screen-expenses");
  if (!screen) return;
  screen.classList.remove("swipe-bounce-left", "swipe-bounce-right");
  void screen.offsetWidth;
  screen.classList.add("swipe-bounce-" + direction);
  screen.addEventListener("animationend", function handler() {
    screen.classList.remove("swipe-bounce-left", "swipe-bounce-right");
    screen.removeEventListener("animationend", handler);
  });
}

/* ============================================================
   17. INPUT FORMATTING
   ============================================================ */

function setupNumberInput(input) {
  input.addEventListener("input", function () {
    var raw = this.value.replace(/,/g, "").replace(/[^\d]/g, "");
    if (raw === "") {
      this.value = "";
      return;
    }
    this.value = formatNumber(parseInt(raw, 10));
  });
}

/* ============================================================
   18. INITIALIZATION
   ============================================================ */

/** Scroll to top of page */
function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/* ============================================================
   ONBOARDING TOOLTIP
   ============================================================ */
var _onboardStep = 0;
var ONBOARD_TOTAL = 2;

function showOnboarding() {
  if (localStorage.getItem("worthMyMoneyOnboarded")) return;
  _onboardStep = 0;
  document.getElementById("onboarding-overlay").style.display = "";
  renderOnboardingStep();
}

function renderOnboardingStep() {
  var bubble = document.getElementById("onboarding-bubble");
  var headingEl = document.getElementById("onboarding-heading");
  var textEl = document.getElementById("onboarding-text");
  var skipBtn = document.getElementById("onboarding-skip");
  var navEl = document.getElementById("onboarding-nav");

  // Step heading & text
  headingEl.textContent = t("onboardHeading" + (_onboardStep + 1));
  textEl.textContent = t("onboardText" + (_onboardStep + 1));

  // Back / Next navigation + Skip (only on step 1)
  var navHTML = "";
  if (_onboardStep === 0) {
    // Step 1: Next + Skip
    navHTML += "<button class='onboarding-nav-btn' onclick='onboardNav(event,\"next\")'>" + t("onboardNext") + "</button>";
    skipBtn.textContent = t("onboardSkip");
    skipBtn.style.display = "";
  } else {
    // Step 2: Back | Got it, no Skip
    navHTML += "<button class='onboarding-nav-btn' onclick='onboardNav(event,\"prev\")'>" + t("onboardBack") + "</button>";
    navHTML += "<span class='onboarding-nav-sep'>|</span>";
    navHTML += "<button class='onboarding-nav-btn' onclick='onboardNav(event,\"next\")'>" + t("onboardDone") + "</button>";
    skipBtn.style.display = "none";
  }
  navEl.innerHTML = navHTML;

  // Remove old step classes, add current
  bubble.className = "onboarding-bubble step-" + (_onboardStep + 1);

  // Position bubble
  positionOnboardingBubble();
}

function onboardNav(e, dir) {
  e.stopPropagation();
  if (dir === "next") {
    nextOnboardingStep();
  } else {
    prevOnboardingStep();
  }
}

function positionOnboardingBubble() {
  var bubble = document.getElementById("onboarding-bubble");
  var BUBBLE_W = 260;

  if (_onboardStep === 0) {
    // Point to profile icon — anchor bubble so arrow tip aligns with icon center
    var profileBtn = document.querySelector("#screen-home .profile-btn");
    if (profileBtn) {
      var rect = profileBtn.getBoundingClientRect();
      bubble.style.top = (rect.bottom + 12) + "px";
      // Arrow is 20px from bubble right edge; align that with icon center
      var iconCenterX = rect.left + rect.width / 2;
      var bubbleLeft = iconCenterX + 20 - BUBBLE_W;
      bubble.style.left = Math.max(8, bubbleLeft) + "px";
      bubble.style.right = "auto";
    }
  } else {
    // Point to "What do you want to calculate?" heading — center bubble under it
    var question = document.querySelector("#screen-home .home-question");
    if (question) {
      var rect = question.getBoundingClientRect();
      bubble.style.top = (rect.bottom + 12) + "px";
      // Center bubble under the heading
      var headingCenterX = rect.left + rect.width / 2;
      var bubbleLeft = headingCenterX - BUBBLE_W / 2;
      bubble.style.left = Math.max(8, bubbleLeft) + "px";
      bubble.style.right = "auto";
    }
  }
}

function prevOnboardingStep() {
  if (_onboardStep > 0) {
    _onboardStep--;
    renderOnboardingStep();
  }
}

function onboardingOverlayClick(e) {
  var bubble = document.getElementById("onboarding-bubble");
  if (bubble.contains(e.target)) return;
  nextOnboardingStep();
}

function nextOnboardingStep() {
  _onboardStep++;
  if (_onboardStep >= ONBOARD_TOTAL) {
    dismissOnboarding();
    return;
  }
  renderOnboardingStep();
}

function dismissOnboarding() {
  document.getElementById("onboarding-overlay").style.display = "none";
  localStorage.setItem("worthMyMoneyOnboarded", "1");
}

document.addEventListener("DOMContentLoaded", function () {
  /* Back to top button — show/hide on scroll */
  var backToTopBtn = document.getElementById("back-to-top");
  if (backToTopBtn) {
    window.addEventListener("scroll", function () {
      if (window.scrollY > 400) {
        backToTopBtn.classList.add("visible");
      } else {
        backToTopBtn.classList.remove("visible");
      }
    }, { passive: true });
  }

  /* Restore last active screen on refresh */
  var savedScreen = sessionStorage.getItem("worthMyMoneyScreen");
  if (savedScreen && document.getElementById("screen-" + savedScreen)) {
    document.querySelector(".screen.active").classList.remove("active");
    document.getElementById("screen-" + savedScreen).classList.add("active");
  }

  populateProfileForm();
  updateProfileExpenses();

  /* Initialize expenses screen if it was restored */
  if (savedScreen === "expenses") initExpensesScreen();
  setupCurrencySearch();
  setupOtherExpensesSearch();

  /* Live formatting on numeric inputs */
  ["profile-income", "profile-hours", "regular-times", "regular-cost", "onetime-cost", "saving-amount",
   "housing-amount", "utilities-total",
   "utilities-electricity", "utilities-water", "utilities-internet", "utilities-others",
   "food-groceries-amount", "food-groceries-times",
   "food-eating-amount", "food-eating-times",
   "food-coffee-amount", "food-coffee-times",
   "food-others-amount", "food-others-times",
   "transport-rental-amount",
   "transport-gas-amount", "transport-gas-times",
   "transport-uber-amount", "transport-uber-times",
   "transport-others-amount", "transport-others-times"]
    .forEach(function (id) {
      var el = document.getElementById(id);
      if (el) setupNumberInput(el);
    });

  /* Auto-save profile when income or hours change */
  document.getElementById("profile-income").addEventListener("input", autoSaveProfile);
  document.getElementById("profile-hours").addEventListener("input", autoSaveProfile);

  /* Validation listeners for expense subcategory inputs */
  var housingAmountEl = document.getElementById("housing-amount");
  if (housingAmountEl) housingAmountEl.addEventListener("input", function() { updateHousingNavState(); });
  ["utilities-total", "utilities-electricity", "utilities-water", "utilities-internet", "utilities-others"].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.addEventListener("input", function() { updateUtilitiesNavState(); });
  });
  ["food-groceries-amount", "food-eating-amount", "food-coffee-amount", "food-others-amount"].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.addEventListener("input", function() { updateFoodNavState(); });
  });
  ["transport-rental-amount", "transport-gas-amount", "transport-uber-amount", "transport-others-amount"].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.addEventListener("input", function() { updateTransportNavState(); });
  });

  /* Currency badges */
  if (profile.currency) {
    updateCurrencyBadge("regular");
    updateCurrencyBadge("onetime");
  }

  /* Enter key bindings */
  function bindEnterKey(ids, handler) {
    ids.forEach(function (id) {
      var el = document.getElementById(id);
      if (el) {
        el.addEventListener("keydown", function (e) {
          if (e.key === "Enter") { e.preventDefault(); handler(); }
        });
      }
    });
  }

  bindEnterKey(["regular-item", "regular-times", "regular-cost"], calculateRegular);
  bindEnterKey(["onetime-item", "onetime-cost"], calculateOnetime);
  bindEnterKey(["workday-start-time", "workday-days-per-week"], calculateWorkday);
  bindEnterKey(["profile-start-time", "profile-days-per-week"], saveProfileWorkday);
  bindEnterKey(["profile-name", "profile-income", "profile-hours"], saveProfile);
  bindEnterKey(["saving-amount"], calculateSavingGoal);

  /* Expenses: Enter key navigates to next step */
  bindEnterKey(["housing-amount"], function() {
    if (isHousingValid()) goToUtilitiesStep();
  });
  bindEnterKey(["utilities-total"], function() {
    if (isUtilitiesValid()) goToFoodStep();
  });

  /* Swipe navigation for expenses wizard */
  setupExpensesSwipe();

  /* Language: wire up lang buttons */
  var langButtons = document.querySelectorAll(".lang-btn");
  for (var lb = 0; lb < langButtons.length; lb++) {
    langButtons[lb].addEventListener("click", toggleLangDropdown);
  }

  /* Language: apply current language */
  applyLanguage();

  /* Language: show popup for first-time users */
  var langChosen = localStorage.getItem("worthMyMoneyLangChosen");
  if (!langChosen) {
    showLanguagePopup();
  } else {
    showOnboarding();
  }
});
