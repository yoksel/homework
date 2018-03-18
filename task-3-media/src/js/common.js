'use strict';

/* global requestAnimationFrame */

(function () {
  function getStream () {
    navigator.mediaDevices.getUserMedia({
      audio: true,
      video: {
        width: {min: 320, ideal: 800},
        height: {min: 240, ideal: 600}
      }
    })
      .then(function (mediaStream) {
        const video = document.querySelector('.video');
        const content = document.querySelector('.content');

        video.srcObject = mediaStream;

        video.addEventListener('loadedmetadata', function (e) {
          video.play();
          content.classList.add('content--video-playing');
          animateFilter();
        });

        addSoundVolume(mediaStream);
        checkMove(video, mediaStream);
        addData(video);

        // Bad performance
        // addVideoToCanvasWebGL(mediaStream);
      })
      .catch(function (err) {
        console.log('Error: ', err.name + ': ' + err.message);
      });
  }

  // ------------------------------

  function checkMove (video, mediaStream) {
    let prevPixels = '';

    const moveDetectionElem = document.querySelector('.move-detection');
    const canvas = document.querySelector('.move-detection__detector');
    const context = canvas.getContext('2d', { alpha: false });
    const moveDetectedClass = 'move-detection--detected';
    let isAnalisysAdded = false;

    video.addEventListener('play', () => {
      moveDetectionElem.classList.remove('move-detection--hidden');
      draw(video, context);
    }, 0);

    function draw (video, context) {
      if (!video.paused && !video.ended) {
        context.drawImage(video, 0, 0, canvas.clientWidth, canvas.clientHeight);

        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        let newPixels = imageData.data;

        // If pic already exist && analysis not added yet
        if (prevPixels && !isAnalisysAdded) {
          addAnalisys(newPixels);
          isAnalisysAdded = true;
        }

        if (prevPixels) {
          const snapIsSame = checkPixelsDiff(prevPixels, newPixels);

          if (snapIsSame === false) {
            moveDetectionElem.classList.add(moveDetectedClass);
          } else {
            moveDetectionElem.classList.remove(moveDetectedClass);
          }
        }

        prevPixels = newPixels;

        setTimeout(() => {
          requestAnimationFrame(() => {
            draw(video, context);
          });
        },
        500);
      }
    }
  }

  // ------------------------------

  function checkPixelsDiff (prevPixels, newPixels) {
    let snapIsSame = true;
    const threshold = 15;

    for (var i = 0; i < prevPixels.length; i += 500) {
      if (Math.abs(prevPixels[i] - newPixels[i]) > threshold) {
        return false;
      }
    }

    return snapIsSame;
  }

  // ------------------------------

  // Source: https://github.com/mdn/voice-change-o-matic
  function addSoundVolume (mediaStream) {
    var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    var source;

    // Set up the different audio nodes we will use for the app
    var analyser = audioCtx.createAnalyser();
    analyser.minDecibels = -90;
    analyser.maxDecibels = -10;
    analyser.smoothingTimeConstant = 0.85;

    var distortion = audioCtx.createWaveShaper();
    var gainNode = audioCtx.createGain();
    var biquadFilter = audioCtx.createBiquadFilter();
    var convolver = audioCtx.createConvolver();

    var visualizer = document.querySelector('.audio-visualizer');
    var canvas = document.querySelector('.audio-visualizer__canvas');
    var canvasCtx = canvas.getContext('2d');

    if (navigator.mediaDevices.getUserMedia) {
      source = audioCtx.createMediaStreamSource(mediaStream);
      source.connect(analyser);
      analyser.connect(distortion);
      distortion.connect(biquadFilter);
      biquadFilter.connect(convolver);
      convolver.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      visualizer.classList.remove('audio-visualizer--hidden');
      visualize();
    } else {
      console.log('getUserMedia not supported on your browser');
    }

    function visualize () {
      const width = canvas.width;
      const height = canvas.height;

      analyser.fftSize = 128; // 256
      var bufferLengthAlt = analyser.frequencyBinCount;
      var dataArrayAlt = new Uint8Array(bufferLengthAlt);

      canvasCtx.clearRect(0, 0, width, height);

      var drawAlt = function () {
        checkSoundLevel(dataArrayAlt);

        analyser.getByteFrequencyData(dataArrayAlt);

        canvasCtx.fillStyle = 'hsl(0, 0%, 0%)';
        canvasCtx.fillRect(0, 0, width, height);

        var barWidth = (width / bufferLengthAlt);
        var barHeight;
        var x = 0;

        for (var i = 0; i < bufferLengthAlt; i++) {
          barHeight = dataArrayAlt[i];

          canvasCtx.fillStyle = 'hsla(0, 0%,' + barHeight + '%, 1)';
          canvasCtx.fillRect(x, height - barHeight / 2, barWidth, barHeight / 2);

          x += barWidth + 3;
        }

        requestAnimationFrame(drawAlt);
      };

      drawAlt();
    }
  }

  // ------------------------------

  function checkSoundLevel (dataArrayAlt) {
    const visualizer = document.querySelector('.audio-visualizer');
    const visualizerLoudWarningClass = 'audio-visualizer--loud-warning';
    const audioWarning = document.querySelector('.audio-visualizer__warning');
    const content = document.querySelector('.content');
    const contentLoudWarningClass = 'content--loud-warning';

    const firstColumns = dataArrayAlt.slice(0, 10);
    const firstColumnsSum = firstColumns.reduce((prev, item) => {
      return prev + item;
    }, 0);

    if (firstColumnsSum > 500) {
      audioWarning.innerHTML = 'Too loud';
      content.classList.add(contentLoudWarningClass);
      visualizer.classList.add(visualizerLoudWarningClass);
    } else {
      audioWarning.innerHTML = 'Normal';
      content.classList.remove(contentLoudWarningClass);
      visualizer.classList.remove(visualizerLoudWarningClass);
    }
  }

  // ------------------------------

  function addData (video) {
    const chanksCount = 4;
    const chankLength = 25;
    const min = 120;
    let chankItemsCounter = min;

    const dataElem = document.querySelector('.data');
    const dataList = document.createElement('ul');
    dataList.classList.add('data__list');

    video.addEventListener('play', function () {
      dataElem.classList.remove('data--hidden');
    }, 0);

    for (var i = 0; i < chanksCount; i++) {
      const dataItem = document.createElement('li');
      dataItem.classList.add('data__item');
      dataItem.innerHTML = '';
      dataList.appendChild(dataItem);
      let sectionLength = 0;
      const spaceSize = 3;
      const randChanksSections = [
        Math.round(Math.random() * 6) + 5,
        Math.round(Math.random() * 4) + 6
      ];
      let currentSection = 0;
      let currentSectionLength = randChanksSections[currentSection];
      let currentChankLength = Math.round(Math.random() * chankLength / 2) + chankLength / 2;
      const chanksSum = randChanksSections[0] + randChanksSections[1] + spaceSize * 2;

      // Cut empty tails
      if (currentChankLength - spaceSize <= chanksSum) {
        currentChankLength = chanksSum - spaceSize;
      }

      for (var k = 0; k < currentChankLength; k++) {
        if (sectionLength > currentSectionLength && sectionLength <= currentSectionLength + spaceSize) {
          dataItem.innerHTML += chankItemsCounter + '<br/>';

          if (sectionLength === currentSectionLength + spaceSize) {
            currentSection++;
            currentSectionLength = randChanksSections[currentSection];
            sectionLength = 0;
          }
        } else {
          let contentList = [
            `${chankItemsCounter}`,
            (chankItemsCounter * 50).toString(16)
          ];

          // Add random short tails
          const randSetLength = Math.round(Math.random() * 2) + 1;

          for (var m = 0; m < randSetLength; m++) {
            contentList.push((chankItemsCounter - 40 + m).toString(16));
          }

          dataItem.innerHTML += contentList.join('\t') + '<br>';
        }
        sectionLength++;
        chankItemsCounter++;
      }
    }

    dataElem.appendChild(dataList);
  }

  // ------------------------------

  function addAnalisys (pixels) {
    const dataElem = document.querySelector('.analysis');
    const dataContentElem = document.querySelector('.analysis__content');
    dataElem.classList.remove('analysis--hidden');

    const pixelsSrcData = pixels.slice(0, 200);
    let pixelsData = [];

    pixelsSrcData.forEach(item => {
      if (item >= 8 && item !== 255) {
        pixelsData.push(item.toString(2).substr(0, 4));
      }
    });

    dataContentElem.innerHTML = pixelsData.join(' ');

    toggleVisibility();

    function toggleVisibility () {
      dataElem.classList.toggle('analysis--hidden');
      const delay = Math.random() * 3000 + 4000;

      setTimeout(toggleVisibility, delay);
    }
  }

  // ------------------------------

  function animateFilter () {
    const feMap = document.getElementById('feMap');
    const feOffset = document.getElementById('feOffset');
    const content = document.querySelector('.content');
    const contentHasFilterClass = 'content--has-filter';
    let classWasAdded = false;
    let currentVal = 0;
    let currentOffset = 0;
    const maxVal = 240;
    const steps = 3;
    const step = maxVal / steps;
    let direction = 'up';

    animate();

    function animate () {
      if (direction === 'up') {
        if (currentVal < maxVal) {
          currentVal += step;
          setVal();

          if (!classWasAdded) {
            content.classList.add(contentHasFilterClass);
            classWasAdded = true;
          }
        } else {
          direction = 'down';
          setVal();

          if (classWasAdded) {
            content.classList.remove(contentHasFilterClass);
            classWasAdded = false;
          }
        }
      } else {
        if (currentVal > 0) {
          currentVal -= step;
          setVal();
        } else {
          const randDelay = Math.round(Math.random() * 3) + 2;
          feMap.setAttribute('scale', 0);

          setTimeout(function () {
            animate();
            direction = 'up';
          }, randDelay * 1000);
        }
      }
    }

    function setVal () {
      let newVal = currentVal;
      currentOffset = currentVal / 2.5;

      if (currentVal % 2) {
        newVal = -newVal;
      }

      feMap.setAttribute('scale', newVal);
      feOffset.setAttribute('dx', -currentOffset);
      feOffset.setAttribute('dy', -currentOffset);

      requestAnimationFrame(animate);
    }
  }

  // ------------------------------

  getStream();
})();
