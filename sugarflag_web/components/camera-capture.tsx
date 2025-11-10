"use client"

import { useState, useRef, useCallback } from 'react'
import { Camera, X, Check, AlertCircle } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { encryptImage } from '@/lib/crypto'

interface CameraCaptureProps {
  onCapture: (imageData: string, encrypted?: { encryptedData: string; iv: string; key: string }) => void
  enableEncryption?: boolean
}

export function CameraCapture({ onCapture, enableEncryption = false }: CameraCaptureProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isCameraReady, setIsCameraReady] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
        setIsCameraReady(true)
      }
    } catch (error) {
      console.error('Camera access error:', error)
      toast({
        title: 'Camera Error',
        description: 'Could not access camera. Please check permissions.',
        variant: 'destructive',
      })
    }
  }, [])

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    setIsCameraReady(false)
  }, [])

  const handleOpen = useCallback(() => {
    setIsOpen(true)
    startCamera()
  }, [startCamera])

  const handleClose = useCallback(() => {
    setIsOpen(false)
    stopCamera()
    setCapturedImage(null)
  }, [stopCamera])

  const capturePhoto = useCallback(() => {
    if (!videoRef.current) return

    const canvas = document.createElement('canvas')
    canvas.width = videoRef.current.videoWidth
    canvas.height = videoRef.current.videoHeight

    const context = canvas.getContext('2d')
    if (!context) return

    context.drawImage(videoRef.current, 0, 0)

    // Convert to base64 JPEG (compressed)
    const imageData = canvas.toDataURL('image/jpeg', 0.8)
    setCapturedImage(imageData)
  }, [])

  const handleConfirm = useCallback(async () => {
    if (!capturedImage) return

    setIsProcessing(true)

    try {
      if (enableEncryption) {
        // Encrypt the image before sending
        const encrypted = await encryptImage(capturedImage)
        onCapture(capturedImage, encrypted)

        toast({
          title: 'Photo Captured',
          description: 'Photo encrypted and ready to analyze',
        })
      } else {
        onCapture(capturedImage)

        toast({
          title: 'Photo Captured',
          description: 'Photo ready to analyze',
        })
      }

      handleClose()
    } catch (error) {
      console.error('Error processing image:', error)
      toast({
        title: 'Processing Error',
        description: 'Failed to process image. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsProcessing(false)
    }
  }, [capturedImage, enableEncryption, onCapture, handleClose])

  const handleRetake = useCallback(() => {
    setCapturedImage(null)
  }, [])

  if (!isOpen) {
    return (
      <button
        onClick={handleOpen}
        className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
      >
        <Camera className="w-5 h-5" />
        Take Photo
      </button>
    )
  }

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-gradient-to-b from-black/50 to-transparent">
        <button
          onClick={handleClose}
          className="p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
          aria-label="Close camera"
        >
          <X className="w-6 h-6" />
        </button>

        {enableEncryption && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/20 border border-green-500/50">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs text-white font-medium">Encrypted</span>
          </div>
        )}
      </div>

      {/* Camera View / Captured Image */}
      <div className="relative w-full h-full">
        {capturedImage ? (
          <img
            src={capturedImage}
            alt="Captured"
            className="w-full h-full object-contain"
          />
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />

            {!isCameraReady && (
              <div className="absolute inset-0 flex items-center justify-center bg-black">
                <div className="text-center text-white">
                  <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">Accessing camera...</p>
                </div>
              </div>
            )}

            {/* Guide overlay */}
            {isCameraReady && (
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 bg-black/40" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] max-w-md aspect-[3/4] border-2 border-white rounded-lg shadow-lg" />
                <div className="absolute bottom-20 left-0 right-0 text-center text-white text-sm">
                  <p>Position nutrition label within frame</p>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/50 to-transparent">
        {capturedImage ? (
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={handleRetake}
              disabled={isProcessing}
              className="p-4 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors disabled:opacity-50"
              aria-label="Retake photo"
            >
              <X className="w-6 h-6" />
            </button>

            <button
              onClick={handleConfirm}
              disabled={isProcessing}
              className="p-6 rounded-full bg-green-500 text-white hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Confirm photo"
            >
              {isProcessing ? (
                <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Check className="w-8 h-8" />
              )}
            </button>
          </div>
        ) : (
          <div className="flex justify-center">
            <button
              onClick={capturePhoto}
              disabled={!isCameraReady}
              className="p-6 rounded-full bg-white hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Capture photo"
            >
              <div className="w-16 h-16 rounded-full border-4 border-gray-800" />
            </button>
          </div>
        )}
      </div>

      {/* Instructions */}
      {!capturedImage && (
        <div className="absolute top-20 left-0 right-0 px-4">
          <div className="max-w-md mx-auto p-4 bg-blue-500/20 border border-blue-500/50 rounded-lg backdrop-blur-sm">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-white">
                <p className="font-medium mb-1">Tips for best results:</p>
                <ul className="space-y-1 text-xs opacity-90">
                  <li>• Ensure good lighting</li>
                  <li>• Keep label flat and in focus</li>
                  <li>• Avoid shadows and glare</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
