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
        addSoundVolume(mediaStream);
        addVideoToCanvas(mediaStream)


      })
      .catch(function(err) {
        console.log('Error: ', err.name + ": " + err.message);
      });
  }

  //------------------------------

  function addVideoToCanvas(mediaStream) {
    const video = document.querySelector('.video');
    video.srcObject = mediaStream;

    video.onloadedmetadata = function(e) {
      video.play();
    };

    canvasList = document.querySelectorAll('.canvas');
    canvasList.map = [].map;

    const contextList = canvasList.map(item => {
      return item.getContext('2d', { alpha: false });
    });

    video.addEventListener('loadedmetadata', function() {
      canvasList.forEach(item => {
        item.width = video.videoWidth;
        item.height = video.videoHeight;
      })
    });

    video.addEventListener('play', function() {
      const that = this;

      contextList.forEach((item, i ) => {
        draw(video, item, i);
      })
    }, 0);

    function draw(video, context, itemNum) {
      if (!video.paused && !video.ended) {
        context.drawImage(video, 0, 0);

        requestAnimationFrame(() => {
          draw(video, context, itemNum);
        });
      }
    }
  }

  //------------------------------

  // Source: https://github.com/mdn/voice-change-o-matic
  function addSoundVolume(stream) {
    var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    var source;
    var stream;

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
      source = audioCtx.createMediaStreamSource(stream);
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

      analyser.fftSize = 1024;
      var bufferLength = analyser.fftSize;
      var dataArray = new Uint8Array(bufferLength);

      canvasCtx.clearRect(0, 0, width, height);

      var draw = function() {
        drawVisual = requestAnimationFrame(draw);
        analyser.getByteTimeDomainData(dataArray);

        canvasCtx.fillStyle = '#000';
        canvasCtx.fillRect(0, 0, width, height);

        canvasCtx.lineWidth = 3;
        canvasCtx.strokeStyle = '#FFF';

        canvasCtx.beginPath();

        var sliceWidth = width * 1.0 / bufferLength;
        var x = 0;

        for(var i = 0; i < bufferLength; i++) {

          var v = dataArray[i] / 128.0;
          var y = v * height/2;

          if(i === 0) {
            canvasCtx.moveTo(x, y);
          } else {
            canvasCtx.lineTo(x, y);
          }

          x += sliceWidth;
        }

        canvasCtx.lineTo(canvas.width, canvas.height/2);
        canvasCtx.stroke();
      };

      draw();
    }
  }

  //------------------------------

  function addData() {
    const chanksCount = 4;
    const chankLength = 40;
    const min = 120;
    const max = min + chankLength * chanksCount;
    let chankItemsCounter = min;

    // console.log(randChanksSections);

    const dataElem = document.querySelector('.data');
    const dataList = document.createElement('ul');
    dataList.classList.add('data__list');


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
    var feMap = document.getElementById('feMap');
    let currentVal = 0;
    const maxVal = 160;
    const step = 5;
    let direction = 'up';

    animate();

    function animate() {
      if (direction === 'up') {
        if (currentVal < maxVal) {
          currentVal += step;
          setVal();
        }
        else {
          direction = 'down';
          setVal();
        }
      }
      else {
        if (currentVal > 0) {
          currentVal -= step;
          setVal();
        }
        else {
          const randDelay = Math.round(Math.random() * 3) + 10;

          setTimeout(function() {
            animate();
            direction = 'up';
          }, randDelay * 1000)
        }
      }

      function setVal() {
        let newVal = currentVal;
        if (currentVal % 2) {
          newVal = -newVal;
        }

        feMap.setAttribute('scale', newVal);

        requestAnimationFrame(animate);
      }
    }
  }

  //------------------------------

  getStream();
  addData();
  animateFilter();

})();
