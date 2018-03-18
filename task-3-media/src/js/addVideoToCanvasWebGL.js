// Source: https://krpano.com/ios/bugs/ios8-webgl-video/

function addVideoToCanvasWebGL(mediaStream) {
  var video = document.querySelector('.video');
  var videoIsReady = false;
  video.autoplay = true;
  video.loop = true;

  video.oncanplay = function () {
    videoIsReady=true;
  };

  video.onerror = function () {
    var err = "unknown error";

    switch(video.error.code)
    {
      case 1: err = "video loading aborted"; break;
      case 2: err = "network loading error"; break;
      case 3: err = "video decoding failed / corrupted data or unsupported codec"; break;
      case 4: err = "video not supported"; break;
    };

    console.log("Error: " + err + " (errorcode="+video.error.code+")");
  };

  video.srcObject = mediaStream;
  video.play();

  var canvas = document.getElementById("video-canvas");
  const gl = canvas.getContext('webgl');

  if (!gl) {
    console.log("No WebGL support");
  }

  // prepare WebGL
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  var vs = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vs, "attribute vec2 vx;varying vec2 tx;void main(){gl_Position=vec4(vx.x*2.0-1.0,1.0-vx.y*2.0,0,1);tx=vx;}");
  gl.compileShader(vs);

  var ps = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(ps, "precision mediump float;uniform sampler2D sm;varying vec2 tx;void main(){gl_FragColor=texture2D(sm,tx);}");
  gl.compileShader(ps);

  var shader  = gl.createProgram();
  gl.attachShader(shader, vs);
  gl.attachShader(shader, ps);
  gl.linkProgram(shader);
  gl.useProgram(shader);

  var vx_ptr = gl.getAttribLocation(shader, "vx");
  gl.enableVertexAttribArray(vx_ptr);
  gl.uniform1i(gl.getUniformLocation(shader, "sm"), 0);

  var vx = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vx);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0,0, 1,0, 1,1, 0,1]), gl.STATIC_DRAW);

  var ix = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ix);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0,1,2, 0,2,3]), gl.STATIC_DRAW);

  var tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T,     gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S,     gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

  // load the video


  var errcnt=0;

  // requestAnimationFrame loop
  function frameloop()
  {
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, tex);

    if (videoIsReady)
    {
      try
      {
        // upload the video frame
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, video);
      }
      catch(e)
      {
        // log only the first few errors
        errcnt++;
        if (errcnt < 10)
          console.log(e);
        else if (errcnt == 10)
          console.log("...");
      }
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, vx);
    gl.vertexAttribPointer(vx_ptr, 2, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ix);
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);

    window.requestAnimationFrame(frameloop);
  }

  frameloop();
}
