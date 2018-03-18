'use strict';

(function () {

  function getStream() {
    let canvasList = [];

    navigator.mediaDevices.getUserMedia({
      audio: true,
      video: {
        width: { min: 300, ideal: 800 },
        height: { min: 200, ideal: 600 }
        }
      })
      .then(function(mediaStream) {
        const video = document.querySelector('.video');
        const content = document.querySelector('.content');

        video.srcObject = mediaStream;
        let prevPixels = '';

        video.addEventListener('loadedmetadata',function(e) {
          video.play();
          content.classList.add('content--video-playing');
        });

        addSoundVolume(mediaStream);
        addVideoToCanvas(video, mediaStream);
        checkMove(video, mediaStream);

        addData(video);
        animateFilter();

        // Bad performance
        // addVideoToCanvasWebGL(mediaStream);
      })
      .catch(function(err) {
        console.log('Error: ', err.name + ": " + err.message);
      });
  }

  //------------------------------

  function addVideoToCanvas(video, mediaStream) {
    let prevPixels = '';

    const canvas = document.querySelector('#video-canvas');
    const context = canvas.getContext('2d', { alpha: false });

    video.addEventListener('loadedmetadata', function() {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    });

    video.addEventListener('play', function() {
      draw(video, context);
    }, 0);

    function draw(video, context) {
      if (!video.paused && !video.ended) {
        context.drawImage(video, 0, 0);

        requestAnimationFrame(() => {
          draw(video, context);
        });
      }
    }
  }

  //------------------------------

  function checkMove(video, mediaStream) {
    let prevPixels = '';

    const moveDetectionElem = document.querySelector('.move-detection');
    const canvas = document.querySelector('.move-detection__detector');
    const context = canvas.getContext('2d', { alpha: false });
    const moveDetectedClass = 'move-detection--detected';

    video.addEventListener('play', () => {
      moveDetectionElem.classList.remove('move-detection--hidden');
      draw(video, context);
    }, 0);

    function draw(video, context) {

      if (!video.paused && !video.ended) {
        context.drawImage(video, 0, 0, canvas.clientWidth, canvas.clientHeight);

        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        let newPixels = imageData.data;

        if (prevPixels) {
          const snapIsSame = checkPixelsDiff(prevPixels, newPixels);

          if (snapIsSame === false) {
            moveDetectionElem.classList.add(moveDetectedClass);
          }
          else {
            moveDetectionElem.classList.remove(moveDetectedClass);
          }
        }

        prevPixels = newPixels;

        setTimeout(() => {
          requestAnimationFrame(() => {
            draw(video, context);
          })
        },
        500);

      }
    }
  }

  //------------------------------

  function checkPixelsDiff(prevPixels, newPixels) {
    let snapIsSame = true;
    const threshold = 20;

    for (var i = 0; i < prevPixels.length; i += 500) {
      if (Math.abs(prevPixels[i] - newPixels[i]) > threshold ){
        return false;
      }
    }

    return snapIsSame;
  }

  //------------------------------

  // Source: https://github.com/mdn/voice-change-o-matic
  function addSoundVolume(mediaStream) {
    var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    var source;

    //set up the different audio nodes we will use for the app
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
    var canvasCtx = canvas.getContext("2d");

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

    function visualize() {
      const width = canvas.width;
      const height = canvas.height;

      analyser.fftSize = 256;
      var bufferLengthAlt = analyser.frequencyBinCount;
      var dataArrayAlt = new Uint8Array(bufferLengthAlt);

      canvasCtx.clearRect(0, 0, width, height);

      var drawAlt = function() {
        drawVisual = requestAnimationFrame(drawAlt);

        analyser.getByteFrequencyData(dataArrayAlt);

        canvasCtx.fillStyle = 'hsl(0, 0, 0)';
        canvasCtx.fillRect(0, 0, width, height);

        var barWidth = (width / bufferLengthAlt) * 2.5;
        var barHeight;
        var x = 0;

        for(var i = 0; i < bufferLengthAlt; i++) {
          barHeight = dataArrayAlt[i];

          canvasCtx.fillStyle = 'hsl(0, 0%,' + barHeight + '%)';
          // console.log('barHeight', barHeight);
          canvasCtx.fillRect(x,height-barHeight/2,barWidth,barHeight/2);

          x += barWidth + 1;
        }
      };

      drawAlt();
    }
  }

  //------------------------------

  function addData(video) {
    const chanksCount = 4;
    const chankLength = 40;
    const min = 120;
    const max = min + chankLength * chanksCount;
    let chankItemsCounter = min;

    const dataElem = document.querySelector('.data');
    const dataList = document.createElement('ul');
    dataList.classList.add('data__list');

    video.addEventListener('play', function() {
      dataElem.classList.remove('data--hidden');
    }, 0);

    for(var i = 0; i < chanksCount; i++ ) {
      const dataItem = document.createElement('li');
      dataItem.classList.add('data__item');
      dataItem.innerHTML = '';
      dataList.appendChild(dataItem);
      let sectionLength = 0;
      const randChanksSections = [
        Math.round(Math.random() * 6) + 5,
        Math.round(Math.random() * 5) + 3
      ];
      let currentSection = 0;
      let currentSectionLength = randChanksSections[currentSection];
      let currentChankLength = Math.round(Math.random() * chankLength / 2) + chankLength / 2;

      for(var k = 0; k < currentChankLength; k++ ) {
        if (sectionLength > currentSectionLength && sectionLength <= currentSectionLength + 3) {
            dataItem.innerHTML += chankItemsCounter + '<br/>';

            if (sectionLength == currentSectionLength + 3) {
              currentSection++;
              currentSectionLength = randChanksSections[currentSection] + k;
              sectionLength = 0;
            }
        }
        else {
          let contentList = [
            chankItemsCounter,
            (chankItemsCounter * 50).toString(16),
            (chankItemsCounter - 40).toString(16),
            (chankItemsCounter - 30).toString(16),
          ];

          dataItem.innerHTML += content = contentList.join('\t') + '<br/>';
        }
        sectionLength++;
        chankItemsCounter++;
      }
    }

    dataElem.appendChild(dataList);
  }

  //------------------------------

  function animateFilter() {
    const feMap = document.getElementById('feMap');
    const feOffset = document.getElementById('feOffset');
    const content = document.querySelector('.content');
    const contentHasFilterClass = 'content--has-filter';
    let classWasAdded = false;
    let currentVal = 0;
    const maxVal = 100;
    let currentOffset = 0;
    const step = 5;
    let direction = 'up';

    animate();

    function animate() {
      if (direction === 'up') {
        if (currentVal < maxVal) {
          currentVal += step;
          setVal();

          if (!classWasAdded) {
            content.classList.add(contentHasFilterClass);
            classWasAdded = true;
          }
        }
        else {
          direction = 'down';
          setVal();

          if (classWasAdded) {
            content.classList.remove(contentHasFilterClass);
            classWasAdded = false;
          }
        }
      }
      else {
        if (currentVal > 0) {
          currentVal -= step;
          setVal();
        }
        else {
          const randDelay = Math.round(Math.random() * 3) + 5;
          feMap.setAttribute('scale', 0);

          setTimeout(function() {
            animate();
            direction = 'up';
          }, randDelay * 1000)
        }
      }
    }

    function setVal() {
      let newVal = currentVal;
      currentOffset = currentVal / 2.5;

      if (currentVal % 2) {
        newVal = -newVal;
      }

      feMap.setAttribute('scale', newVal);
      feOffset.setAttribute('x', -currentOffset);
      feOffset.setAttribute('y', -currentOffset);

      requestAnimationFrame(animate);
    }
  }

  //------------------------------

  getStream();

})();
