const rec_btn = document.querySelector('.rec_btn');
const records = document.querySelector('.records');

if (navigator.mediaDevices.getUserMedia) {
  const constraints = { audio: true };
  let chunks = [];

  let onSuccess = function(stream) {
    const mediaRecorder = new MediaRecorder(stream);

    // onmousedown
    // rec_btn.onmousedown = function() { 
    rec_btn.ontouchstart = function() { 
      if (document.getElementById("audio")){
        document.getElementById("audio").parentNode.removeChild(document.getElementById("audio"))
      }
      mediaRecorder.start();
      rec_btn.style.background = "red";
    }

    // onmouseup
    // rec_btn.onmouseup = function() {
    rec_btn.ontouchend = function() {
      mediaRecorder.stop();
      rec_btn.style.background = "";
      rec_btn.style.color = "";
    }

    mediaRecorder.onstop = function(e) {
      const recContainer = document.createElement('article');
      recContainer.id = "audio";

      const audio = document.createElement('audio');
      audio.id = "audio_element";
      audio.setAttribute('controls', '');

      recContainer.appendChild(audio);
      records.appendChild(recContainer);

      audio.controls = true;
      const blob = new Blob(chunks, { 'type' : 'audio/ogg; codecs=opus' });
      chunks = [];
      const audioURL = window.URL.createObjectURL(blob);
      audio.src = audioURL;
      audio.play();
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
