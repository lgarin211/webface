const video = document.getElementById('video')

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('/webface/models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('/webface/models'),
  faceapi.nets.faceRecognitionNet.loadFromUri('/webface/models'),
  faceapi.nets.faceExpressionNet.loadFromUri('/webface/models')
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
      emotionprt(dominantEmotion);
    }
  }, 5000)
})

function emotionprt(emotions) {
  console.log(emotions);
  if ('speechSynthesis' in window) {
    const message = new SpeechSynthesisUtterance(`${emotions}`);
    speechSynthesis.speak(message);
  } else {
    console.log('Text-to-speech is not supported in this browser');
  }
  //request pertanyaan ke https://openai.com/

}



const API_ENDPOINT = 'https://api.openai.com/v1/chat/completion';

function askQuestion(question) {
  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': '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' // Replace with your actual API key
    },
    body: JSON.stringify({
      prompt: question,
      max_tokens: 100
    })
  };

  fetch(API_ENDPOINT, requestOptions)
    .then(response => response.json())
    .then(data => handleResponse(data))
    .catch(error => console.error('Error:', error));
}

function handleResponse(data) {
  // Handle the response from the OpenAI API here
  console.log(data.choices[0].text);
  // You can use the generated text or perform further processing as needed
}

// Example usage
const question = "What is the capital of France?";
askQuestion(question);
