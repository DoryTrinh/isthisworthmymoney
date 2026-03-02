/* ============================================================
   EMBED CALCULATOR — Lightweight logic for blog embeds
   ============================================================ */

(function() {
  'use strict';

  /* ----------------------------------------------------------
     Language detection & translations
     ---------------------------------------------------------- */
  var lang = document.documentElement.lang || 'en';

  var t = {
    en: {
      none: 'None',
      // Regular result — within budget
      occupies: 'This occupies <strong>%pct%%</strong> of your income, that translates to <strong>%hours% hours</strong> of work per month.',
      startWork: 'If you start working at <strong>8:30 AM</strong>, you work until <strong>%time%</strong> to earn this item.',
      // Regular result — over budget
      uhoh: '\u26A0\uFE0F Uh-oh, there\'s a problem',
      requires: 'Requires <strong>%hours% work hours</strong> per month. You only work <strong>%max% hours/month</strong>.',
      takesUp: 'This takes up <strong>%pct%%</strong> of income. Even working non-stop, you\'re short <strong>%hours% hours</strong>!!!',
      cutBack: 'If you don\'t want to drown in debt, consider cutting back or finding a cheaper option.',
      // One-time result — affordable
      needWork: 'You need to work <strong>%hours% hours</strong> to afford this.',
      thats: 'That\'s <strong>%pct%%</strong> of your monthly income.',
      // One-time result — big purchase
      pause: 'Hmm\u2026 let\'s pause and think',
      wouldTake: 'It would take <strong>%months% months</strong> of income to afford this. That\'s <strong>%hours% hours</strong> of work.',
      saveUp: 'Want to save up for this?',
      aggressive: 'Aggressive',
      balanced: 'Balanced',
      relaxed: 'Relaxed',
      months: 'months',
      ofIncome: 'of income',
      bigPurchase: 'Big purchases need careful consideration \uD83E\uDD14',
      nextDay: '(next day)',
      plusDays: '(+%d% days)'
    },
    vi: {
      none: 'Kh\u00f4ng ch\u1ecdn',
      // Regular result — within budget
      occupies: 'Kho\u1ea3n n\u00e0y chi\u1ebfm <strong>%pct%%</strong> thu nh\u1eadp c\u1ee7a b\u1ea1n, t\u01b0\u01a1ng \u0111\u01b0\u01a1ng <strong>%hours% gi\u1edd</strong> l\u00e0m vi\u1ec7c m\u1ed7i th\u00e1ng.',
      startWork: 'N\u1ebfu b\u1ea1n b\u1eaft \u0111\u1ea7u l\u00e0m l\u00fac <strong>8:30 s\u00e1ng</strong>, b\u1ea1n ph\u1ea3i l\u00e0m \u0111\u1ebfn <strong>%time%</strong> \u0111\u1ec3 ki\u1ebfm \u0111\u01b0\u1ee3c s\u1ed1 ti\u1ec1n n\u00e0y.',
      // Regular result — over budget
      uhoh: '\u26A0\uFE0F C\u00f3 v\u1ea5n \u0111\u1ec1 r\u1ed3i',
      requires: 'C\u1ea7n <strong>%hours% gi\u1edd l\u00e0m vi\u1ec7c</strong> m\u1ed7i th\u00e1ng. B\u1ea1n ch\u1ec9 l\u00e0m <strong>%max% gi\u1edd/th\u00e1ng</strong>.',
      takesUp: 'Kho\u1ea3n n\u00e0y chi\u1ebfm <strong>%pct%%</strong> thu nh\u1eadp. D\u00f9 l\u00e0m kh\u00f4ng ngh\u1ec9, b\u1ea1n v\u1eabn thi\u1ebfu <strong>%hours% gi\u1edd</strong>!!!',
      cutBack: 'N\u1ebfu kh\u00f4ng mu\u1ed1n ch\u00ecm trong n\u1ee3, h\u00e3y c\u00e2n nh\u1eafc c\u1eaft gi\u1ea3m ho\u1eb7c t\u00ecm l\u1ef1a ch\u1ecdn r\u1ebb h\u01a1n.',
      // One-time result — affordable
      needWork: 'B\u1ea1n c\u1ea7n l\u00e0m <strong>%hours% gi\u1edd</strong> \u0111\u1ec3 mua \u0111\u01b0\u1ee3c m\u00f3n n\u00e0y.',
      thats: 'T\u01b0\u01a1ng \u0111\u01b0\u01a1ng <strong>%pct%%</strong> thu nh\u1eadp h\u00e0ng th\u00e1ng c\u1ee7a b\u1ea1n.',
      // One-time result — big purchase
      pause: 'Hmm\u2026 d\u1eebng l\u1ea1i suy ngh\u0129 ch\u00fat nh\u00e9',
      wouldTake: 'B\u1ea1n c\u1ea7n <strong>%months% th\u00e1ng</strong> thu nh\u1eadp \u0111\u1ec3 mua m\u00f3n n\u00e0y. T\u01b0\u01a1ng \u0111\u01b0\u01a1ng <strong>%hours% gi\u1edd</strong> l\u00e0m vi\u1ec7c.',
      saveUp: 'B\u1ea1n mu\u1ed1n ti\u1ebft ki\u1ec7m \u0111\u1ec3 mua?',
      aggressive: 'Si\u00eat ch\u1eb7t',
      balanced: 'C\u00e2n b\u1eb1ng',
      relaxed: 'Tho\u1ea3i m\u00e1i',
      months: 'th\u00e1ng',
      ofIncome: 'thu nh\u1eadp',
      bigPurchase: 'Mua s\u1eafm l\u1edbn c\u1ea7n c\u00e2n nh\u1eafc k\u1ef9 \uD83E\uDD14',
      nextDay: '(ng\u00e0y h\u00f4m sau)',
      plusDays: '(+%d% ng\u00e0y)'
    }
  };

  var s = t[lang] || t.en;

  /* ----------------------------------------------------------
     Currency Data (compact subset)
     ---------------------------------------------------------- */
  var CURRENCIES = [
    { code: 'VND', symbol: 'VND', name: 'Vietnamese Dong' },
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '\u20AC', name: 'Euro' },
    { code: 'GBP', symbol: '\u00A3', name: 'British Pound' },
    { code: 'JPY', symbol: '\u00A5', name: 'Japanese Yen' },
    { code: 'CNY', symbol: '\u00A5', name: 'Chinese Yuan' },
    { code: 'KRW', symbol: '\u20A9', name: 'South Korean Won' },
    { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
    { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar' },
    { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
    { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
    { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar' },
    { code: 'TWD', symbol: 'NT$', name: 'New Taiwan Dollar' },
    { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar' },
    { code: 'THB', symbol: '\u0E3F', name: 'Thai Baht' },
    { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit' },
    { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah' },
    { code: 'PHP', symbol: '\u20B1', name: 'Philippine Peso' },
    { code: 'INR', symbol: '\u20B9', name: 'Indian Rupee' },
    { code: 'AED', symbol: 'AED', name: 'UAE Dirham' },
    { code: 'SAR', symbol: 'SAR', name: 'Saudi Riyal' },
    { code: 'MXN', symbol: 'MX$', name: 'Mexican Peso' },
    { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
    { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
    { code: 'TRY', symbol: '\u20BA', name: 'Turkish Lira' },
    { code: 'SEK', symbol: 'kr', name: 'Swedish Krona' },
    { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone' },
    { code: 'PLN', symbol: 'z\u0142', name: 'Polish Zloty' },
    { code: 'NGN', symbol: '\u20A6', name: 'Nigerian Naira' },
    { code: 'EGP', symbol: 'E\u00A3', name: 'Egyptian Pound' },
    { code: 'RUB', symbol: '\u20BD', name: 'Russian Ruble' },
    { code: 'PKR', symbol: 'Rs', name: 'Pakistani Rupee' },
    { code: 'BDT', symbol: '\u09F3', name: 'Bangladeshi Taka' },
    { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling' }
  ];

  /* ----------------------------------------------------------
     Number Formatting
     ---------------------------------------------------------- */
  function formatNumber(num) {
    if (!num && num !== 0) return '';
    var parts = num.toString().split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
  }

  function parseFormattedNumber(str) {
    if (!str) return 0;
    return parseFloat(str.replace(/,/g, '')) || 0;
  }

  function setupNumberInput(input) {
    input.addEventListener('input', function() {
      var pos = input.selectionStart;
      var oldLen = input.value.length;

      var raw = input.value.replace(/[^\d.]/g, '');
      // Keep only the first decimal point
      var dot = raw.indexOf('.');
      if (dot !== -1) {
        raw = raw.substring(0, dot + 1) + raw.substring(dot + 1).replace(/\./g, '');
      }

      if (raw === '' || raw === '.') {
        input.value = raw;
        return;
      }

      var parts = raw.split('.');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      input.value = parts.join('.');

      var newLen = input.value.length;
      var newPos = pos + (newLen - oldLen);
      if (newPos < 0) newPos = 0;
      if (newPos > newLen) newPos = newLen;
      input.setSelectionRange(newPos, newPos);
    });
  }

  /* ----------------------------------------------------------
     Currency Helpers
     ---------------------------------------------------------- */
  function populateCurrencyDropdown(select) {
    var none = document.createElement('option');
    none.value = '';
    none.textContent = s.none;
    select.appendChild(none);

    for (var i = 0; i < CURRENCIES.length; i++) {
      var opt = document.createElement('option');
      opt.value = CURRENCIES[i].code;
      opt.textContent = CURRENCIES[i].code + ' (' + CURRENCIES[i].symbol + ')';
      select.appendChild(opt);
    }
  }

  function getCurrencySymbol(code) {
    if (!code) return '';
    for (var i = 0; i < CURRENCIES.length; i++) {
      if (CURRENCIES[i].code === code) return CURRENCIES[i].symbol;
    }
    return code;
  }

  /* ----------------------------------------------------------
     Calculation Helpers
     ---------------------------------------------------------- */
  function getHoursPerMonth(daysPerWeek) {
    return daysPerWeek * 8 * 52 / 12;
  }

  function toMonthlyFrequency(times, period, daysPerWeek) {
    switch (period) {
      case 'day':   return times * daysPerWeek * 52 / 12;
      case 'week':  return times * 52 / 12;
      case 'month': return times;
      case 'year':  return times / 12;
      default:      return times;
    }
  }

  function formatWorkEndTime(decimalHours) {
    var totalMin = Math.round(decimalHours * 60);
    var hour = 8 + Math.floor((30 + totalMin) / 60);
    var minute = (30 + totalMin) % 60;

    var days = 0;
    if (hour >= 24) {
      days = Math.floor(hour / 24);
      hour = hour % 24;
    }

    var period = hour >= 12 ? 'PM' : 'AM';
    var display = hour > 12 ? hour - 12 : hour;
    if (display === 0) display = 12;

    var time = display + ':' + (minute < 10 ? '0' : '') + minute + ' ' + period;
    if (days === 1) time += ' ' + s.nextDay;
    else if (days > 1) time += ' ' + s.plusDays.replace('%d%', days);
    return time;
  }

  function formatHours(h) {
    if (h < 10) return h.toFixed(1);
    return formatNumber(Math.round(h));
  }

  /* ----------------------------------------------------------
     Validation
     ---------------------------------------------------------- */
  function shakeField(el) {
    el.classList.add('shake');
    setTimeout(function() { el.classList.remove('shake'); }, 500);
  }

  /* ----------------------------------------------------------
     CALCULATOR 1 — Regular Expense
     ---------------------------------------------------------- */
  function initRegularCalculator() {
    var incomeInput    = document.getElementById('income');
    var currencySelect = document.getElementById('currency');
    var daysSelect     = document.getElementById('days');
    var freqInput      = document.getElementById('frequency');
    var periodSelect   = document.getElementById('period');
    var priceInput     = document.getElementById('price');
    var calcBtn        = document.getElementById('calculate');
    var resultDiv      = document.getElementById('result');
    var badge          = document.getElementById('currency-badge');

    populateCurrencyDropdown(currencySelect);
    setupNumberInput(incomeInput);
    setupNumberInput(priceInput);

    currencySelect.addEventListener('change', function() {
      var sym = getCurrencySymbol(currencySelect.value);
      badge.textContent = sym;
      badge.style.display = sym ? 'inline-block' : 'none';
    });

    calcBtn.addEventListener('click', function() {
      var income = parseFormattedNumber(incomeInput.value);
      var price  = parseFormattedNumber(priceInput.value);

      if (!income || !price) {
        if (!income) shakeField(incomeInput);
        if (!price)  shakeField(priceInput);
        return;
      }

      var days         = parseInt(daysSelect.value) || 5;
      var freq         = parseInt(freqInput.value) || 1;
      var period       = periodSelect.value;
      var currency     = currencySelect.value;
      var sym          = getCurrencySymbol(currency);

      var hoursPerMonth   = getHoursPerMonth(days);
      var hourlyRate      = income / hoursPerMonth;
      var monthlyExpense  = price * toMonthlyFrequency(freq, period, days);
      var pctOfIncome     = (monthlyExpense / income) * 100;
      var hoursPerMo      = monthlyExpense / hourlyRate;
      var hoursForOne     = price / hourlyRate;
      var endTime         = formatWorkEndTime(hoursForOne);

      var html = '';

      if (pctOfIncome <= 100) {
        /* --- Within budget --- */
        resultDiv.className = 'embed-result result-ok';
        html += '<div class="result-icon">\u2705</div>';
        html += '<div class="result-text">';
        html += s.occupies.replace('%pct%', pctOfIncome.toFixed(1)).replace('%hours%', formatHours(hoursPerMo));
        html += '<br><br>';
        html += s.startWork.replace('%time%', endTime);
        html += '</div>';
      } else {
        /* --- Over budget --- */
        resultDiv.className = 'embed-result result-warning';
        var shortHours = hoursPerMo - hoursPerMonth;
        html += '<div class="result-title warning">' + s.uhoh + '</div>';
        html += '<div class="result-text">';
        html += s.requires.replace('%hours%', formatHours(hoursPerMo)).replace('%max%', Math.round(hoursPerMonth));
        html += '<br><br>';
        html += s.takesUp.replace('%pct%', pctOfIncome.toFixed(0)).replace('%hours%', formatHours(shortHours));
        html += '<br><br>';
        html += s.cutBack;
        html += '</div>';
      }

      resultDiv.innerHTML = html;
      resultDiv.style.display = 'block';
      resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  }

  /* ----------------------------------------------------------
     CALCULATOR 2 — One-Time Expense
     ---------------------------------------------------------- */
  function initOneTimeCalculator() {
    var incomeInput    = document.getElementById('income');
    var currencySelect = document.getElementById('currency');
    var daysSelect     = document.getElementById('days');
    var priceInput     = document.getElementById('price');
    var calcBtn        = document.getElementById('calculate');
    var resultDiv      = document.getElementById('result');
    var badge          = document.getElementById('currency-badge');

    populateCurrencyDropdown(currencySelect);
    setupNumberInput(incomeInput);
    setupNumberInput(priceInput);

    currencySelect.addEventListener('change', function() {
      var sym = getCurrencySymbol(currencySelect.value);
      badge.textContent = sym;
      badge.style.display = sym ? 'inline-block' : 'none';
    });

    calcBtn.addEventListener('click', function() {
      var income = parseFormattedNumber(incomeInput.value);
      var price  = parseFormattedNumber(priceInput.value);

      if (!income || !price) {
        if (!income) shakeField(incomeInput);
        if (!price)  shakeField(priceInput);
        return;
      }

      var days     = parseInt(daysSelect.value) || 5;
      var currency = currencySelect.value;
      var sym      = getCurrencySymbol(currency);

      var hoursPerMonth = getHoursPerMonth(days);
      var hourlyRate    = income / hoursPerMonth;
      var hoursToAfford = price / hourlyRate;
      var pctOfIncome   = (price / income) * 100;
      var monthsOfIncome = price / income;

      var html = '';

      if (pctOfIncome < 100) {
        /* --- Affordable --- */
        resultDiv.className = 'embed-result result-ok';
        html += '<div class="result-icon">\u2705</div>';
        html += '<div class="result-text">';
        html += s.needWork.replace('%hours%', formatHours(hoursToAfford));
        html += '<br>';
        html += s.thats.replace('%pct%', pctOfIncome.toFixed(1));
        html += '</div>';
      } else {
        /* --- Big purchase — show savings plan --- */
        resultDiv.className = 'embed-result result-warning';

        var aggressiveMonths = Math.ceil(price / (income * 0.5));
        var balancedMonths   = Math.ceil(price / (income * 0.25));
        var relaxedMonths    = Math.ceil(price / (income * 0.1));
        var aggressiveSave   = income * 0.5;
        var balancedSave     = income * 0.25;
        var relaxedSave      = income * 0.1;

        var pre = sym ? sym + ' ' : '';

        html += '<div class="result-title warning">' + s.pause + '</div>';
        html += '<div class="result-text">';
        html += s.wouldTake.replace('%months%', monthsOfIncome.toFixed(1)).replace('%hours%', formatHours(hoursToAfford));
        html += '</div>';

        html += '<div class="result-subtitle">' + s.saveUp + '</div>';
        html += '<div class="savings-cards">';

        // Aggressive
        html += '<div class="savings-card">';
        html += '<div class="savings-label">' + s.aggressive + '</div>';
        html += '<div class="savings-months">' + aggressiveMonths + ' <span>' + s.months + '</span></div>';
        html += '<div class="savings-detail">' + pre + formatNumber(Math.round(aggressiveSave)) + '/mo</div>';
        html += '<div class="savings-detail">50% ' + s.ofIncome + '</div>';
        html += '</div>';

        // Balanced
        html += '<div class="savings-card">';
        html += '<div class="savings-label">' + s.balanced + '</div>';
        html += '<div class="savings-months">' + balancedMonths + ' <span>' + s.months + '</span></div>';
        html += '<div class="savings-detail">' + pre + formatNumber(Math.round(balancedSave)) + '/mo</div>';
        html += '<div class="savings-detail">25% ' + s.ofIncome + '</div>';
        html += '</div>';

        // Relaxed
        html += '<div class="savings-card">';
        html += '<div class="savings-label">' + s.relaxed + '</div>';
        html += '<div class="savings-months">' + relaxedMonths + ' <span>' + s.months + '</span></div>';
        html += '<div class="savings-detail">' + pre + formatNumber(Math.round(relaxedSave)) + '/mo</div>';
        html += '<div class="savings-detail">10% ' + s.ofIncome + '</div>';
        html += '</div>';

        html += '</div>'; // .savings-cards

        html += '<div class="result-footer">' + s.bigPurchase + '</div>';
      }

      resultDiv.innerHTML = html;
      resultDiv.style.display = 'block';
      resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  }

  /* ----------------------------------------------------------
     Auto-init based on which calculator is on the page
     ---------------------------------------------------------- */
  document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('regular-calc'))  initRegularCalculator();
    if (document.getElementById('onetime-calc'))  initOneTimeCalculator();
  });

})();
