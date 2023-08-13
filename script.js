'use strict';

/////////////////////////////////////////////////
// BANKER APP
/////////////////////////////////////////////////
// Data
const account1 = {
  owner: 'Osama Azhar',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2023-07-05T14:11:59.604Z',
    '2023-07-20T17:01:17.194Z',
    '2023-07-22T23:36:17.929Z',
    '2023-07-23T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Hassan Azhar',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

// Web Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

//Code
const formatMovementsDate = function (date, locale) {
  const calcDaysPassed = (date1, date2) =>
    Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));

  const daysPased = calcDaysPassed(new Date(), date);

  if (daysPased === 0) return 'Today';
  if (daysPased === 1) return 'Yesterday';
  if (daysPased <= 7) return `${daysPased} days ago`;

  return new Intl.DateTimeFormat(locale).format(date);
};

const formatcur = function (value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(value);
};

//Displaying balance movements in the component
const displayMovement = function (accs, sort = false) {
  containerMovements.innerHTML = '';

  const movs = sort
    ? accs.movements.slice().sort((a, b) => a - b)
    : accs.movements;

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    //adding dates on movements
    const date = new Date(accs.movementsDates[i]);
    const displayDate = formatMovementsDate(date, accs.locale);

    const formattedMov = formatcur(mov, accs.locale, accs.currency);

    const html = `
    <div class="movements__row">
      <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
    <div class="movements__date">${displayDate}</div>
      <div class="movements__value">${formattedMov}€</div>
    </div>`;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};
// displayMovement(account1.movements);
////////////////////////////////////////

//calculating balance and displaying on UI
const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, curr) => acc + curr, 0);

  labelBalance.textContent = formatcur(acc.balance, acc.locale, acc.currency);
};

//////////////////////////////////////

//displaying summary
const calcDisplaySummary = function (acc) {
  const income = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, curr) => acc + curr, 0);

  labelSumIn.textContent = formatcur(income, acc.locale, acc.currency);

  const expenditure = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, curr) => acc + curr, 0);
  labelSumOut.textContent = formatcur(
    Math.abs(expenditure),
    acc.locale,
    acc.currency
  );

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(mov => (mov * acc.interestRate) / 100)
    .filter((int, i, arr) => int >= 1)
    .reduce((acc, curr) => acc + curr, 0);

  labelSumInterest.textContent = formatcur(interest, acc.locale, acc.currency);
};

/////////////////////////////////////////////////

//making the username from the accounts
const createUserName = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(function (name) {
        return name[0];
      })
      .join('');
  });
};
createUserName(accounts);

//To update the overall UI of the App
const updateUI = function (account) {
  //display movements
  displayMovement(account);
  //display balance
  calcDisplayBalance(account);
  //display summary
  calcDisplaySummary(account);
};

const startLogoutTimer = function () {
  //set timeout to 1 minutes
  let time = 60;

  const tick = () => {
    const min = String(Math.trunc(time / 60)).padStart(2, 0);
    const sec = String(time % 60).padStart(2, 0);
    //in each call, print remaining timer on UI
    labelTimer.textContent = `${min}:${sec}`;

    //when time is 0, stop the timer and logout the user
    if (time === 0) {
      clearInterval(timer);
      labelWelcome.textContent = 'Login to get started';
      containerApp.style.opacity = 0;
    }
    //decrease timer by 1
    time--;
  };

  //call timer every secoond
  tick();
  const timer = setInterval(tick, 1000);
  return timer;
};

let currentAccount, timer;

btnLogin.addEventListener('click', function (e) {
  e.preventDefault();
  console.log('LOGIN');

  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );

  const now = new Date();
  const options = {
    hour: 'numeric',
    minute: 'numeric',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  };

  labelDate.textContent = new Intl.DateTimeFormat(
    currentAccount.locale,
    options
  ).format(now);

  if (currentAccount?.pin === Number(inputLoginPin.value)) {
    //display UI message on successsfull login
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;

    containerApp.style.opacity = 100;
    //clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();

    //checking upon login, if timer exist then clear it, otherwise keep on going.
    if (timer) clearInterval(timer);
    timer = startLogoutTimer();

    //updating the front-end
    updateUI(currentAccount);
  }
});

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  console.log('transfer button clicked');

  const amount = Number(inputTransferAmount.value);
  const receiveAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  console.log(amount, receiveAcc);

  if (
    amount > 0 &&
    receiveAcc &&
    currentAccount.balance >= amount &&
    receiveAcc?.username !== currentAccount.username
  ) {
    console.log('transfer amount');

    //transfer amount between acounts
    currentAccount.movements.push(-amount);
    receiveAcc.movements.push(amount);

    //add transfer date
    currentAccount.movementsDates.push(new Date().toISOString());
    receiveAcc.movementsDates.push(new Date().toISOString());

    updateUI(currentAccount);

    //reset the timer upon transfer activity
    clearInterval(timer);
    timer = startLogoutTimer();
  }
  inputTransferTo.value = inputTransferAmount.value = '';
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();
  console.log('close account');

  const deleteUser = inputCloseUsername.value;
  const deleteUserPin = Number(inputClosePin.value);
  console.log(deleteUser, deleteUserPin);

  inputCloseUsername.value = inputClosePin.value = '';
  if (deleteUser === currentAccount?.username) {
    if (deleteUserPin === currentAccount?.pin) {
      console.log('username and pin are correct');

      const index = accounts.findIndex(
        acc => acc.username === currentAccount.username
      );
      console.log(index);

      //delete account
      accounts.splice(index, 1);

      //hiding the UI
      containerApp.style.opacity = 0;
    } else {
      console.log('you have entered the wrong password');
    }
  } else {
    console.log(`you can only delete the current user account`);
  }
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Number(inputLoanAmount.value);

  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    setTimeout(() => {
      currentAccount.movements.push(amount);
      //add loan date
      currentAccount.movementsDates.push(new Date().toISOString());

      updateUI(currentAccount);
      console.log(`${amount} Loan granted! `);
    }, 4000);
    console.log('transferring loan, please wait...');

    clearInterval(timer);
    timer = startLogoutTimer();
  } else {
    console.log(`you can not get this much load :( `);
  }
  inputLoanAmount.value = '';
});

let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();

  displayMovement(currentAccount, !sorted);
  sorted = !sorted;
});
//////////////////////

labelBalance.addEventListener('click', function () {
  const movementsUI = Array.from(
    document.querySelectorAll('.movements__value')
  );

  const movsUIArray = movementsUI.map(el => el.textContent.replace('€', ''));
});
/////////////////////////////////////////////////

labelBalance.addEventListener('click', function () {
  [...document.querySelectorAll('.movements__row')].forEach(function (row, i) {
    if (i % 2 === 0) {
      row.style.backgroundColor = 'green';
    }
  });
});
