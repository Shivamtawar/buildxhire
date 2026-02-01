export class SpeechRecognitionService {
  constructor() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    this.recognition = SpeechRecognition ? new SpeechRecognition() : null
    
    if (this.recognition) {
      this.recognition.continuous = true
      this.recognition.interimResults = true
      this.recognition.lang = 'en-US'
    }
  }

  isSupported() {
    return this.recognition !== null
  }

  start(onResult, onEnd, onError) {
    if (!this.recognition) {
      onError?.('Speech recognition not supported')
      return
    }

    this.recognition.onresult = (event) => {
      let transcript = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript
      }
      onResult?.(transcript)
    }

    this.recognition.onend = () => {
      onEnd?.()
    }

    this.recognition.onerror = (event) => {
      onError?.(event.error)
    }

    this.recognition.start()
  }

  stop() {
    if (this.recognition) {
      this.recognition.stop()
    }
  }
}

export class TextToSpeechService {
  constructor() {
    this.synth = window.speechSynthesis
  }

  isSupported() {
    return 'speechSynthesis' in window
  }

  speak(text, onEnd) {
    if (!this.isSupported()) return

    this.synth.cancel() // Cancel any ongoing speech

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.9
    utterance.pitch = 1
    utterance.volume = 1

    if (onEnd) {
      utterance.onend = onEnd
    }

    this.synth.speak(utterance)
  }

  stop() {
    if (this.synth) {
      this.synth.cancel()
    }
  }
}
