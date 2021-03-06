/* global Hammer, DoorBase */

// ===================== Пример кода первой двери =======================
/**
 * @class Door0
 * @augments DoorBase
 * @param {Number} number
 * @param {Function} onUnlock
 */

function Door0 (number, onUnlock) {
  DoorBase.apply(this, arguments);

  var buttons = [
    this.popup.querySelector('.door-riddle__button_0'),
    this.popup.querySelector('.door-riddle__button_1'),
    this.popup.querySelector('.door-riddle__button_2')
  ];

  buttons.forEach(function (b) {
    b.addEventListener('pointerdown', _onButtonPointerDown.bind(this));
    b.addEventListener('pointerup', _onButtonPointerUp.bind(this));
    b.addEventListener('pointercancel', _onButtonPointerUp.bind(this));
    b.addEventListener('pointerleave', _onButtonPointerUp.bind(this));
  }.bind(this));

  function _onButtonPointerDown (e) {
    e.target.classList.add('door-riddle__button_pressed');
    checkCondition.apply(this);
  }

  function _onButtonPointerUp (e) {
    e.target.classList.remove('door-riddle__button_pressed');
  }

  /**
   * Проверяем, можно ли теперь открыть дверь
   */
  function checkCondition () {
    var isOpened = true;
    buttons.forEach(function (b) {
      if (!b.classList.contains('door-riddle__button_pressed')) {
        isOpened = false;
      }
    });

    // Если все три кнопки зажаты одновременно, то откроем эту дверь
    if (isOpened) {
      this.unlock();
    }
  }
}

// Наследуемся от класса DoorBase
Door0.prototype = Object.create(DoorBase.prototype);
Door0.prototype.constructor = DoorBase;
// END ===================== Пример кода первой двери =======================

/**
 * @class Door1
 * @augments DoorBase
 * @param {Number} number
 * @param {Function} onUnlock
 */
function Door1 (number, onUnlock) {
  DoorBase.apply(this, arguments);

  // ==== Напишите свой код для открытия второй двери здесь ====
  var cat = this.popup.querySelector('.door-riddle__cat');
  var text = this.popup.querySelector('.door-riddle__text');
  var classPressed = 'door-riddle__cat_pressed';
  var isStartElemMatch = false;
  var isTouchStarted = false;

  var slideCounter = 0;
  var messages = [
    {
      className: 'door-riddle__spot_paw-right',
      text: 'Погладь правую лапку'
    },
    {
      className: 'door-riddle__spot_paw-left',
      text: 'А теперь левую'
    },
    {
      className: 'door-riddle__spot_head',
      text: 'Теперь за ушком'
    },
    {
      text: 'Гладь как следует, не отлынивай'
    },
    {
      text: 'Всё, проходи'
    }
  ];

  cat.addEventListener('pointerdown', _onButtonPointerDown.bind(this));
  cat.addEventListener('touchstart', _onButtonPointerDown.bind(this));

  cat.addEventListener('pointermove', _onButtonPointerMove.bind(this));
  cat.addEventListener('touchmove', _onButtonPointerMove.bind(this));

  cat.addEventListener('pointerup', _onButtonPointerUp.bind(this));
  cat.addEventListener('pointercancel', _onButtonPointerUp.bind(this));

  function _onButtonPointerDown (e) {
    if (isTouchStarted) {
      return;
    }

    if (slideCounter > 0) {
      isTouchStarted = true;

      var currentMessage = messages[slideCounter - 1];
      var waitedClass = currentMessage.className;

      if (waitedClass) {
        if (e.target.classList.contains(waitedClass)) {
          isStartElemMatch = true;
        }
      } else {
        isStartElemMatch = true;
      }
    }

    cat.classList.add(classPressed);
  }

  function _onButtonPointerMove (e) {
    if (isStartElemMatch || slideCounter === 0) {
      changeStep.apply(this);

      if (isStartElemMatch) {
        isStartElemMatch = false;
      }
    }
  }

  function _onButtonPointerUp (e) {
    checkCondition.apply(this);
    cat.classList.remove(classPressed);
    isTouchStarted = false;
  }

  function changeStep () {
    if (messages[slideCounter]) {
      text.innerHTML = messages[slideCounter].text;
      slideCounter++;
      isStartElemMatch = false;
    }
  }

  function checkCondition () {
    if (slideCounter === messages.length) {
      this.unlock();
    }
  }
  // ==== END Напишите свой код для открытия второй двери здесь ====
}
Door1.prototype = Object.create(DoorBase.prototype);
Door1.prototype.constructor = DoorBase;

/**
 * @class Door2
 * @augments DoorBase
 * @param {Number} number
 * @param {Function} onUnlock
 */
function Door2 (number, onUnlock) {
  DoorBase.apply(this, arguments);

  // ==== Напишите свой код для открытия третьей двери здесь ====
  var keySwipe = this.popup.querySelector('.popup__content_level_2');
  var classPressed = 'popup__content_level_pressed';
  var classMatch = 'popup__content_level_match';
  var keyClassName = 'door-icon_key';
  var key = this.popup.querySelector('.' + keyClassName);
  var keyHole = this.popup.querySelector('.door-icon_keyhole');
  var keyHoleCoords = keyHole.getClientRects()[0];
  var halfKeyHole = keyHoleCoords.width / 2;
  var isTouchStarted = false;

  keySwipe.addEventListener('pointerdown', _onButtonPointerDown.bind(this));
  keySwipe.addEventListener('touchstart', _onButtonPointerDown.bind(this));

  keySwipe.addEventListener('pointermove', _onButtonPointerMove.bind(this));
  keySwipe.addEventListener('touchmove', _onButtonPointerMove.bind(this));

  keySwipe.addEventListener('pointerup', _onButtonPointerUp.bind(this));
  keySwipe.addEventListener('pointerleave', _onButtonPointerUp.bind(this));
  keySwipe.addEventListener('pointercancel', _onButtonPointerUp.bind(this));


  function _onButtonPointerDown (e) {
    if (isTouchStarted) {
      return;
    }
    if (e.target.classList.contains(keyClassName)) {
      isTouchStarted = true;
      key.style.left = e.clientX - halfKeyHole;
      key.style.top = e.clientY - halfKeyHole;
      keySwipe.classList.add(classPressed);
    }
  }

  function _onButtonPointerMove (e) {
    if (!keySwipe.classList.contains(classPressed) || !isTouchStarted) {
      return;
    }

    var eX = e.clientX ? e.clientX : e.touches[0].clientX;
    var eY = e.clientY ? e.clientY : e.touches[0].clientY;

    var keyCoords = key.getClientRects()[0];
    key.style.left = eX - halfKeyHole;
    key.style.top = eY - halfKeyHole;

    var diffX = Math.abs(keyHoleCoords.x - keyCoords.x);
    var diffY = Math.abs(keyHoleCoords.y - keyCoords.y);

    if (diffX < 50 && diffY < 50) {
      keySwipe.classList.add(classMatch);

      this.unlock();
    }
  }

  function _onButtonPointerUp (e) {
    keySwipe.classList.remove(classPressed);
    isTouchStarted = false;
  }
  // ==== END Напишите свой код для открытия третьей двери здесь ====
}
Door2.prototype = Object.create(DoorBase.prototype);
Door2.prototype.constructor = DoorBase;

/**
 * Сундук
 * @class Box
 * @augments DoorBase
 * @param {Number} number
 * @param {Function} onUnlock
 */
function Box (number, onUnlock) {
  DoorBase.apply(this, arguments);
  var that = this;
  var isUnlocked = false;

  // ==== Напишите свой код для открытия сундука здесь ====

  var takeAway = document.querySelector('.door-riddle__takeaway');
  // Для примера сундук откроется просто по клику на него
  // this.popup.addEventListener('click', function() {
  //   this.unlock();
  // }.bind(this));

  var mc = new Hammer.Manager(takeAway);
  var pinch = new Hammer.Pinch();
  mc.add([pinch]);

  mc.on('pinch', function (ev) {
    if (!isUnlocked) {
      that.unlock();
      isUnlocked = true;
    }
  });

  // ==== END Напишите свой код для открытия сундука здесь ====

  this.showCongratulations = function () {
    alert('Поздравляю! Игра пройдена!');
  };
}
Box.prototype = Object.create(DoorBase.prototype);
Box.prototype.constructor = DoorBase;
