const video = document.getElementById('video')

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('models'),
  faceapi.nets.faceRecognitionNet.loadFromUri('models'),
  faceapi.nets.faceExpressionNet.loadFromUri('models')
]).then(startVideo)

function startVideo() {
  navigator.getUserMedia(
    { video: {} },
    stream => video.srcObject = stream,
    err => console.error(err)
  )
}

video.addEventListener('play', () => {
  const canvas = faceapi.createCanvasFromMedia(video)
  document.body.append(canvas)
  const displaySize = { width: video.width, height: video.height }
  faceapi.matchDimensions(canvas, displaySize)
  setInterval(async () => {
    const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions()
    const resizedDetections = faceapi.resizeResults(detections, displaySize)
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
    faceapi.draw.drawDetections(canvas, resizedDetections)
    faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
    faceapi.draw.drawFaceExpressions(canvas, resizedDetections)

    if (detections.length > 0) {
      const emotions = detections[0].expressions;
      const sortedEmotions = Object.entries(emotions).sort((a, b) => b[1] - a[1]);
      const dominantEmotion = sortedEmotions[0][0];
      polym(dominantEmotion);
    }
  }, 5000)
})

function polym(params) {

  if (params != "neutral") {
    // dont do anything
  } else {
    const API_KEY = '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';
    const API_URL = 'https://api.openai.com/v1/chat/completions';
    const qw= "I FERREN Have Feal like "+params+" Please talk to me with questions asking about my emotions";
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`
    };

    const requestData = {
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'user', content: qw },
      ],
      temperature: 0.7
    };

    fetch(API_URL, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(requestData)
    })
      .then(response => response.json())
      .then(data => {
        console.log(data);
        console.log(data.choices[0].message.content);
        emotionprt(data.choices[0].message.content);

      })
      .catch(error => {
        console.error('Terjadi kesalahan:', error);
      });
  }
}

function emotionprt(emotions) {
  console.log(emotions);
  if ('speechSynthesis' in window) {
    const message = new SpeechSynthesisUtterance(`Ferren Andrea. ${emotions} , and you mush to know, Agustinus allways love you`);
    speechSynthesis.speak(message);
  } else {
    console.log('Text-to-speech is not supported in this browser');
  }

}
