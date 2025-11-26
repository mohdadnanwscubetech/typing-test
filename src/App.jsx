import React, { useEffect, useRef, useState } from 'react'
import data from "./assets/data.json"

export default function App() {
  const [paragraph, setParagraph] = useState("")
  const [input, setInput] = useState("")
  const [selectedTime, setSelectedTime] = useState(1)
  const [timeLeft, setTimeLeft] = useState(0)
  const [isRunning, setIsRunning] = useState(false)

  const [showResult, setShowResult] = useState(false)
  const [correctChars, setCorrectChars] = useState(0)
  const [wrongChars, setWrongChars] = useState(0)
  const [wpm, setWPM] = useState(0)
  const [accuracy, setAccuracy] = useState(0)

  const paragraphRef = useRef(null);
  const lastCharRef = useRef(null);


  useEffect(() => {
    if (lastCharRef.current && paragraphRef.current) {
      const charRect = lastCharRef.current.getBoundingClientRect();
      const parentRect = paragraphRef.current.getBoundingClientRect();

      // check if last char is below visible area
      if (charRect.bottom > parentRect.bottom) {
        paragraphRef.current.scrollTop += charRect.bottom - parentRect.bottom;
      }
      // check if last char is above visible area (optional)
      else if (charRect.top < parentRect.top) {
        paragraphRef.current.scrollTop -= parentRect.top - charRect.top;
      }
    }
  }, [input]);


  // Pick random paragraph
  useEffect(() => {
    const random = data[Math.floor(Math.random() * data.length)]
    setParagraph(random.text)
  }, [])




  // Typing start
  const handleTyping = (e) => {
    if (!isRunning) {
      setIsRunning(true)
      setTimeLeft(selectedTime * 60)
    }
    setInput(e.target.value)
  }

  // Timer logic
  useEffect(() => {
    let timer = null

    if (isRunning && timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      console.log("time left =", timeLeft, "this is timer =", timer)
    }

    if (isRunning && timeLeft === 0) {
      calculateResult()
      setShowResult(true)
      setIsRunning(false)
    }

    return () => clearTimeout(timer)
  }, [timeLeft, isRunning])



  // Result calculation
  const calculateResult = () => {
    const paraChars = paragraph.split("")
    const inputChars = input.split("")

    let correct = 0
    let wrong = 0

    inputChars.forEach((ch, index) => {
      if (paraChars[index] === ch) correct++
      else wrong++
    })

    const totalWords = input.trim().split(" ").length
    const timeInMin = selectedTime

    const wpmCalc = Math.round(totalWords / timeInMin)
    const accuracyCalc = Math.round((correct / (correct + wrong)) * 100)

    setCorrectChars(correct)
    setWrongChars(wrong)
    setWPM(wpmCalc)
    setAccuracy(isNaN(accuracyCalc) ? 0 : accuracyCalc)
  }



  // Reset
  const resetTest = () => {
    setInput("")
    setIsRunning(false)
    setTimeLeft(0)
    const random = data[Math.floor(Math.random() * data.length)]
    setParagraph(random.text)
    setShowResult(false)
  }


  return (
    <>
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="w-full max-w-3xl bg-gray-800 p-6 rounded-2xl shadow-xl border border-gray-700">

          <h1 className="text-3xl font-semibold text-white text-center mb-6">
            Typing Speed Test
          </h1>

          {/* Time dropdown */}
          <div className="flex justify-center mb-6">
            <select
              onChange={(e) => setSelectedTime(e.target.value)}
              className="px-4 py-2 bg-gray-900 text-white rounded-lg border border-gray-700"
            >
              <option value="1">1 Min</option>
              <option value="2">2 Min</option>
              <option value="3">3 Min</option>
              <option value="4">4 Min</option>
              <option value="5">5 Min</option>
            </select>
          </div>

          {/* Timer */}
          <div className="text-center mb-4 text-lg text-white">
            Time Left: <span className="text-yellow-400">{timeLeft}s</span>
          </div>

          {/* Highlighted Paragraph */}
          <div
            ref={paragraphRef}
            className="bg-gray-700 p-4 para rounded-xl text-lg leading-relaxed text-white mb-6 h-40 overflow-y-auto border border-gray-600"
          >
            {paragraph.split("").map((char, index) => {
              const typedChar = input[index];
              let color = "text-white";

              if (typedChar !== undefined) {
                color = typedChar === char ? "text-green-400" : "text-red-400";
              }

              return (
                <span
                  key={index}
                  className={color}
                  ref={index === input.length - 1 ? lastCharRef : null} // last typed char ko ref
                >
                  {char}
                </span>
              );
            })}
          </div>


          {/* Typing box */}
          <textarea
            value={input}
            onChange={handleTyping}
            disabled={!isRunning && showResult}

            placeholder="Start typing here..."
            className="w-full h-32 p-4   bg-gray-900 text-white rounded-xl border border-gray-700 resize-none"
          />

          {/* Buttons */}
          <div className="flex justify-center gap-4 mt-6">
            <button
              onClick={resetTest}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
            >
              Reset Test
            </button>
          </div>

        </div>
      </div>

      {/* RESULT POPUP */}
      {showResult && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center">
          <div className="bg-gray-800 text-white p-6 rounded-2xl w-96 shadow-xl border border-gray-700">

            <h2 className="text-2xl font-semibold mb-4 text-center">Test Results</h2>

            {/* Gross WPM */}
            <div className="mb-3">
              <p className="text-gray-300 text-sm">Typing Speed</p>
              <p className="text-green-400 text-3xl font-bold">{wpm} WPM</p>
            </div>

            {/* Accuracy */}
            <div className="mb-3">
              <p className="text-gray-300 text-sm">Accuracy</p>
              <p className="text-blue-400 text-3xl font-bold">{accuracy}%</p>
            </div>

            {/* Net Speed = Gross WPM - Mistakes */}
            <div className="mb-3">
              <p className="text-gray-300 text-sm">Net Speed</p>
              <p className="text-yellow-400 text-3xl font-bold">{wpm - Math.round(wrongChars / 5)} WPM
</p>
            </div>

            <button
              onClick={resetTest}
              className="w-full mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-xl"
            >
              Restart Test
            </button>

          </div>
        </div>
      )}

    </>
  )
}