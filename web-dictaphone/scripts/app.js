// set up basic variables for app
const rec    = document.querySelector('.rec');
const soundClips = document.querySelector('.sound-clips');
const canvas = document.querySelector('.visualizer');
const mainSection = document.querySelector('.main-controls');

// disable stop button while not recording

stop.disabled = true;

// visualiser setup - create web audio api context and canvas

let audioCtx;
const canvasCtx = canvas.getContext("2d");

//main block for doing the audio recording


if (navigator.mediaDevices.getUserMedia) {
  console.log('getUserMedia supported.');

  const constraints = { audio: true };
  let chunks = [];

  let onSuccess = function(stream) {
    const mediaRecorder = new MediaRecorder(stream);

    visualize(stream);

    // onmousedown
    rec.touchstart = function() { 
      console.log("onmousedown");
      console.log("remove element");
      if (document.getElementById("audio")){
        document.getElementById("audio").parentNode.removeChild(document.getElementById("audio"))
      }
      mediaRecorder.start();
      console.log(mediaRecorder.state);
      console.log("recorder started");
      rec.style.background = "red";
    }

    // onmouseup
    rec.touchend = function() {
      console.log("onmouseup");
      mediaRecorder.stop();
      console.log(mediaRecorder.state);
      console.log("recorder stopped");
      rec.style.background = "";
      rec.style.color = "";
      // mediaRecorder.requestData();
    }


    mediaRecorder.onstop = function(e) {
      console.log("data available after MediaRecorder.stop() called.");

      const clipName = 'My unnamed clip';

      const clipContainer = document.createElement('article');
      clipContainer.id = "audio";
      const audio = document.createElement('audio');

      clipContainer.classList.add('clip');
      audio.setAttribute('controls', '');

      clipContainer.appendChild(audio);
      soundClips.appendChild(clipContainer);

      audio.controls = true;
      const blob = new Blob(chunks, { 'type' : 'audio/ogg; codecs=opus' });
      chunks = [];
      const audioURL = window.URL.createObjectURL(blob);
      audio.src = audioURL;
      console.log("recorder stopped");
    }

    mediaRecorder.ondataavailable = function(e) {
      chunks.push(e.data);
    }
  }

  let onError = function(err) {
    console.log('The following error occured: ' + err);
  }

  navigator.mediaDevices.getUserMedia(constraints).then(onSuccess, onError);

} else {
   console.log('getUserMedia not supported on your browser!');
}

function visualize(stream) {
  if(!audioCtx) {
    audioCtx = new AudioContext();
  }

  const source = audioCtx.createMediaStreamSource(stream);

  const analyser = audioCtx.createAnalyser();
  analyser.fftSize = 2048;
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  source.connect(analyser);
  //analyser.connect(audioCtx.destination);

  draw()

  function draw() {
    const WIDTH = canvas.width
    const HEIGHT = canvas.height;

    requestAnimationFrame(draw);

    analyser.getByteTimeDomainData(dataArray);

    canvasCtx.fillStyle = 'rgb(200, 200, 200)';
    canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

    canvasCtx.lineWidth = 2;
    canvasCtx.strokeStyle = 'rgb(0, 0, 0)';

    canvasCtx.beginPath();

    let sliceWidth = WIDTH * 1.0 / bufferLength;
    let x = 0;


    for(let i = 0; i < bufferLength; i++) {

      let v = dataArray[i] / 128.0;
      let y = v * HEIGHT/2;

      if(i === 0) {
        canvasCtx.moveTo(x, y);
      } else {
        canvasCtx.lineTo(x, y);
      }

      x += sliceWidth;
    }

    canvasCtx.lineTo(canvas.width, canvas.height/2);
    canvasCtx.stroke();

  }
}

window.onresize = function() {
  canvas.width = mainSection.offsetWidth;
}

window.onresize();
