/* ============================================================
   EMBED CALCULATOR — Lightweight logic for blog embeds
   ============================================================ */

(function() {
  'use strict';

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
    none.textContent = 'None';
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
    if (days === 1) time += ' (next day)';
    else if (days > 1) time += ' (+' + days + ' days)';
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
        html += 'This occupies <strong>' + pctOfIncome.toFixed(1) + '%</strong> of your income, ';
        html += 'that translates to <strong>' + formatHours(hoursPerMo) + ' hours</strong> of work per month.';
        html += '<br><br>';
        html += 'If you start working at <strong>8:30 AM</strong>, ';
        html += 'you work until <strong>' + endTime + '</strong> to earn this item.';
        html += '</div>';
      } else {
        /* --- Over budget --- */
        resultDiv.className = 'embed-result result-warning';
        var shortHours = hoursPerMo - hoursPerMonth;
        html += '<div class="result-title warning">\u26A0\uFE0F Uh-oh, there\'s a problem</div>';
        html += '<div class="result-text">';
        html += 'Requires <strong>' + formatHours(hoursPerMo) + ' work hours</strong> per month. ';
        html += 'You only work <strong>' + Math.round(hoursPerMonth) + ' hours/month</strong>.';
        html += '<br><br>';
        html += 'This takes up <strong>' + pctOfIncome.toFixed(0) + '%</strong> of income. ';
        html += 'Even working non-stop, you\'re short <strong>' + formatHours(shortHours) + ' hours</strong>!!!';
        html += '<br><br>';
        html += 'If you don\'t want to drown in debt, consider cutting back or finding a cheaper option.';
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
        html += 'You need to work <strong>' + formatHours(hoursToAfford) + ' hours</strong> to afford this.';
        html += '<br>';
        html += 'That\'s <strong>' + pctOfIncome.toFixed(1) + '%</strong> of your monthly income.';
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

        html += '<div class="result-title warning">Hmm\u2026 let\'s pause and think</div>';
        html += '<div class="result-text">';
        html += 'It would take <strong>' + monthsOfIncome.toFixed(1) + ' months</strong> of income to afford this. ';
        html += 'That\'s <strong>' + formatHours(hoursToAfford) + ' hours</strong> of work.';
        html += '</div>';

        html += '<div class="result-subtitle">Want to save up for this?</div>';
        html += '<div class="savings-cards">';

        // Aggressive
        html += '<div class="savings-card">';
        html += '<div class="savings-label">Aggressive</div>';
        html += '<div class="savings-months">' + aggressiveMonths + ' <span>months</span></div>';
        html += '<div class="savings-detail">' + pre + formatNumber(Math.round(aggressiveSave)) + '/mo</div>';
        html += '<div class="savings-detail">50% of income</div>';
        html += '</div>';

        // Balanced
        html += '<div class="savings-card">';
        html += '<div class="savings-label">Balanced</div>';
        html += '<div class="savings-months">' + balancedMonths + ' <span>months</span></div>';
        html += '<div class="savings-detail">' + pre + formatNumber(Math.round(balancedSave)) + '/mo</div>';
        html += '<div class="savings-detail">25% of income</div>';
        html += '</div>';

        // Relaxed
        html += '<div class="savings-card">';
        html += '<div class="savings-label">Relaxed</div>';
        html += '<div class="savings-months">' + relaxedMonths + ' <span>months</span></div>';
        html += '<div class="savings-detail">' + pre + formatNumber(Math.round(relaxedSave)) + '/mo</div>';
        html += '<div class="savings-detail">10% of income</div>';
        html += '</div>';

        html += '</div>'; // .savings-cards

        html += '<div class="result-footer">Big purchases need careful consideration \uD83E\uDD14</div>';
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
