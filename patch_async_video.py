import re

with open('src/pages/AsyncVideoInterview.jsx', 'r') as f:
    content = f.read()

# Add recordedVideoBlob state and video url
content = content.replace(
    "const [isSubmitting, setIsSubmitting] = useState(false);",
    "const [isSubmitting, setIsSubmitting] = useState(false);\n  const [recordedVideoUrl, setRecordedVideoUrl] = useState(null);\n  const recordedChunksRef = useRef([]);"
)

# In handleDataAvailable, store chunk in ref
handle_data_pattern = r"(const handleDataAvailable = async \(event\) => \{\n\s*if \(event\.data && event\.data\.size > 0\) \{\n\s*const currentChunkIndex = chunkIndexRef\.current\+\+;\n\s*const blob = event\.data;)"
content = re.sub(
    handle_data_pattern,
    r"\1\n      recordedChunksRef.current.push(blob);",
    content
)

# In stopRecording, set video URL
stop_recording_pattern = r"(const stopRecording = \(\) => \{\n\s*if \(mediaRecorderRef\.current && isRecording\) \{\n\s*mediaRecorderRef\.current\.stop\(\);\n\s*setIsRecording\(false\);\n\s*setHasRecorded\(true\);)"
content = re.sub(
    stop_recording_pattern,
    r"\1\n      // Create local video URL for preview\n      setTimeout(() => {\n        const fullBlob = new Blob(recordedChunksRef.current, { type: 'video/webm' });\n        const videoUrl = URL.createObjectURL(fullBlob);\n        setRecordedVideoUrl(videoUrl);\n      }, 500);\n",
    content
)

# In startRecording, clear chunks ref
start_recording_pattern = r"(const startRecording = \(\) => \{\n\s*if \(!streamRef\.current\) return;\n\s*chunkIndexRef\.current = 0;)"
content = re.sub(
    start_recording_pattern,
    r"\1\n    recordedChunksRef.current = [];\n    setRecordedVideoUrl(null);",
    content
)


# Re-record logic
re_record_pattern = r"(onClick=\{\(\) => setHasRecorded\(false\)\})"
content = re.sub(
    re_record_pattern,
    r"onClick={() => { setHasRecorded(false); setRecordedVideoUrl(null); recordedChunksRef.current = []; if (videoRef.current && streamRef.current) videoRef.current.srcObject = streamRef.current; }}",
    content
)


# In the video element area, if hasRecorded, show video preview
video_area_pattern = r"(<video\n\s*ref=\{videoRef\}\n\s*autoPlay\n\s*muted\n\s*playsInline\n\s*className=\"absolute inset-0 w-full h-full object-cover transform scale-x-\[-1\]\"\n\s*/>)"
content = re.sub(
    video_area_pattern,
    r"""{hasRecorded && recordedVideoUrl ? (
                  <video
                    src={recordedVideoUrl}
                    controls
                    autoPlay
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover transform scale-x-[-1]"
                  />
                )}""",
    content
)

with open('src/pages/AsyncVideoInterview.jsx', 'w') as f:
    f.write(content)
