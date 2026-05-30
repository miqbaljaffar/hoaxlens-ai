import React, { useState, useRef } from 'react';
import { Upload, FileImage, Loader2, Image as ImageIcon, Sparkles, Check, AlertCircle } from 'lucide-react';
import { ClaimAnalysisResult } from '../types';

interface OcrCheckerProps {
  onCheckImage: (base64: string, mimeType: string) => void;
  isLoading: boolean;
}

export default function OcrChecker({ onCheckImage, isLoading }: OcrCheckerProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // File loading events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Only image files (PNG, JPEG, WEBP) are supported for screenshot analysis.');
      return;
    }

    setSelectedFile(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result && typeof event.target.result === 'string') {
        setSelectedImage(event.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleClear = () => {
    setSelectedImage(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleVerify = () => {
    if (!selectedImage || !selectedFile) return;
    onCheckImage(selectedImage, selectedFile.type);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8" id="ocr-vision-checker">
      
      {/* Visual Hub Title */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center space-x-1.5 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full text-indigo-400 text-xs font-mono">
          <Sparkles className="h-3 w-3 animate-pulse" />
          <span>Multimodal Screenshot Extraction Pipeline</span>
        </div>
        <h2 className="text-3xl font-bold text-white tracking-tight">Screenshot & Image Fact-Checking</h2>
        <p className="text-slate-400 text-sm">
          Whatsapp forwards, Instagram memes, or headlines screenshotted? Drop the image here. We extract the visual claims with high precision and cross-verify with web groundings.
        </p>
      </div>

      {/* Main Upload Dropzone and preview */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-6 md:p-8 backdrop-blur-md shadow-2xl">
        {!selectedImage ? (
          /* Zero state / uploading box - supports drag-and-drop */
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={handleButtonClick}
            className={`cursor-pointer rounded-xl border-2 border-dashed p-12 text-center transition-all ${
              dragActive 
                ? 'border-emerald-500 bg-emerald-500/5' 
                : 'border-slate-800 hover:border-slate-700 bg-slate-950/40'
            }`}
            id="drag-drop-zone"
          >
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleChange}
              accept="image/*"
              className="hidden"
            />
            
            <div className="space-y-4">
              <div className="h-12 w-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto">
                <Upload className="h-6 w-6 animate-bounce" />
              </div>

              <div>
                <p className="text-slate-200 text-sm font-semibold">Drag and drop your claim screenshot here</p>
                <p className="text-slate-500 text-xs mt-1">or click to browse local files (PNG, JPEG, WEBP)</p>
              </div>

              <div className="text-[10px] text-slate-500 font-mono inline-flex items-center space-x-1 justify-center bg-slate-950 px-2 py-1 rounded">
                <AlertCircle className="h-3.5 w-3.5 text-indigo-400" />
                <span>Max size: 10MB • Direct OCR verification</span>
              </div>
            </div>
          </div>
        ) : (
          /* File Preview state */
          <div className="space-y-6" id="selected-image-preview">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-slate-950 border border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded bg-slate-900 flex items-center justify-center shrink-0">
                  <FileImage className="h-5 w-5 text-indigo-400" />
                </div>
                <div className="text-left w-full">
                  <p className="text-xs font-semibold text-slate-200 truncate max-w-[200px] sm:max-w-xs">{selectedFile?.name}</p>
                  <p className="text-[10px] text-slate-500 font-mono tracking-wide mt-0.5">
                    {Math.round((selectedFile?.size || 0) / 1024)} KB • Image format
                  </p>
                </div>
              </div>

              <div className="flex space-x-2 shrink-0">
                <button
                  type="button"
                  onClick={handleClear}
                  className="px-4 py-1.5 rounded-lg border border-slate-800 hover:bg-slate-900 text-slate-400 hover:text-rose-400 text-xs font-semibold transition"
                >
                  Cancel
                </button>
                
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={handleVerify}
                  className="px-5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 text-xs font-bold transition flex items-center justify-center whitespace-nowrap"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5 text-slate-950" />
                      <span>Reading text...</span>
                    </>
                  ) : (
                    <>
                      <Check className="h-3.5 w-3.5 mr-1.5 text-slate-950" />
                      <span>Process OCR & Verify</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Simulated Frame */}
            <div className="relative flex justify-center p-3 rounded-xl border border-slate-800 bg-slate-950/80 max-h-[420px] overflow-hidden group">
              <img
                src={selectedImage}
                alt="Claim preview"
                className="max-h-[400px] w-auto object-contain rounded"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 to-transparent pointer-events-none" />
            </div>

            {/* OCR Reassurance Notes under loading */}
            {isLoading && (
              <div className="p-4 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-center animate-pulse">
                <p className="text-xs text-indigo-400 font-medium">
                  Applying multimodal visual models to extract key headlines, cleaning metadata, and matching with search grounding archives. Please hold on...
                </p>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
