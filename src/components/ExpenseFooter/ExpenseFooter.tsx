import { useState, useRef } from "react";
import { useRouter } from "next/router";
import { useUpdateTargetMutation } from "@/service/query/endpoints/ExpenseApi";

interface Props {
  total: number;
  target: number | null;
  onAddExpense: () => void;
  month?: string; // Add month prop for target updates
}

export default function ExpenseFooter({ total, target, onAddExpense, month }: Props) {
  const router = useRouter();
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  const [targetValue, setTargetValue] = useState(target?.toString() || "0");
  const [showTargetModal, setShowTargetModal] = useState(false);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const dragStartTime = useRef<number>(0);
  const [updateTarget] = useUpdateTargetMutation();

  const pl = (target ?? 0) - total;
  const plColor = pl > 0 ? "text-green-600" : pl < 0 ? "text-red-600" : "text-gray-600";

  const handleStart = (clientY: number) => {
    setStartY(clientY);
    setCurrentY(clientY);
    dragStartTime.current = Date.now();

    // Start long press timer
    longPressTimer.current = setTimeout(() => {
      setIsDragging(true);
      triggerHapticFeedback(); // Haptic feedback when drag mode activates
    }, 150); // Reduced to 150ms for faster response
  };

  const handleMove = (clientY: number) => {
    if (isDragging) {
      setCurrentY(clientY);
    }
  };

  const handleEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }

    if (isDragging) {
      const deltaY = startY - currentY;
      const dragDuration = Date.now() - dragStartTime.current;

      // Enhanced swipe up detection - more sensitive for mobile
      if (deltaY > 50) { // Reduced threshold from 100px to 50px
        // Add a smooth transition before navigation
        const footerElement = document.querySelector('.expense-footer') as HTMLElement;
        if (footerElement) {
          footerElement.style.transform = 'translateY(-100vh)';
          footerElement.style.opacity = '0';
          setTimeout(() => {
            router.push('/dashboard');
          }, 200); // Wait for animation to complete
        } else {
          router.push('/dashboard');
        }
      }
      // If it was a long press without much drag, open add expense modal
      else if (Math.abs(deltaY) < 30 && dragDuration > 500) { // Increased tolerance from 20px to 30px
        onAddExpense();
      }
    }

    setIsDragging(false);
    setStartY(0);
    setCurrentY(0);
  };

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleStart(e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    e.preventDefault();
    handleMove(e.clientY);
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    e.preventDefault();
    handleEnd();
  };

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    handleStart(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    handleMove(e.touches[0].clientY);
  };

  const handleTouchEnd = () => {
    handleEnd();
  };

  // Handle target click for editing
  const handleTargetClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isDragging) {
      setShowTargetModal(true);
      setTargetValue(target?.toString() || "0");
    }
  };

  // Handle target save
  const handleTargetSave = async () => {
    if (!month) return;
    
    try {
      const newTarget = parseFloat(targetValue);
      if (isNaN(newTarget)) return;
      
      await updateTarget({
        month,
        target: newTarget,
      }).unwrap();
      
      // Success feedback
      if ('vibrate' in navigator) {
        navigator.vibrate([50, 30, 50]); // Success pattern
      }
      
      setShowTargetModal(false);
    } catch (error) {
      console.error('Failed to update target:', error);
      
      // Error feedback
      if ('vibrate' in navigator) {
        navigator.vibrate(200); // Error vibration
      }
    }
  };

  // Handle target delete
  const handleTargetDelete = async () => {
    if (!month) return;
    
    try {
      await updateTarget({
        month,
        target: 0,
      }).unwrap();
      
      // Success feedback
      if ('vibrate' in navigator) {
        navigator.vibrate([50, 30, 50]); // Success pattern
      }
      
      setShowTargetModal(false);
    } catch (error) {
      console.error('Failed to delete target:', error);
      
      // Error feedback
      if ('vibrate' in navigator) {
        navigator.vibrate(200); // Error vibration
      }
    }
  };

  // Close modal
  const handleModalClose = () => {
    setShowTargetModal(false);
    setTargetValue(target?.toString() || "0");
  };

  // Calculate transform for drag effect with enhanced animations
  const deltaY = isDragging ? currentY - startY : 0;
  const transform = isDragging
    ? `translateY(${Math.min(0, deltaY)}px) scale(${1 - Math.abs(deltaY) * 0.0005})`
    : 'translateY(0) scale(1)';

  const opacity = isDragging
    ? Math.max(0.3, 1 - Math.abs(deltaY) * 0.003)
    : 1;

  // Add blur effect during drag
  const blur = isDragging && Math.abs(deltaY) > 20
    ? `blur(${Math.min(8, Math.abs(deltaY) * 0.1)}px)`
    : 'blur(0px)';

  // Background overlay effect
  const overlayOpacity = isDragging && deltaY < -30
    ? Math.min(0.5, Math.abs(deltaY) * 0.01)
    : 0;

  // Haptic feedback simulation for mobile
  const triggerHapticFeedback = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(50); // Short vibration for mobile devices
    }
  };
  return (
    <>
      {/* Background overlay for swipe up effect */}
      {isDragging && deltaY < -30 && (
        <div
          className="fixed inset-0 bg-gradient-to-t from-blue-500/20 to-transparent transition-opacity duration-200 z-20 pointer-events-none"
          style={{ opacity: overlayOpacity }}
        />
      )}

      <div className="fixed inset-x-0 bottom-6 flex justify-center pointer-events-none z-30">
        <div
          className="expense-footer pointer-events-auto flex items-center justify-center px-4 sm:px-6 py-2.5 sm:py-3 rounded-3xl shadow-2xl bg-white/90 backdrop-blur-lg border border-gray-200/50 cursor-pointer select-none transition-all duration-300 hover:shadow-xl active:scale-95"
          style={{
            minWidth: 260,
            maxWidth: 360,
            transform,
            opacity,
            filter: blur,
            userSelect: 'none',
            touchAction: 'pan-y',
            willChange: 'transform, opacity, filter',
            boxShadow: isDragging
              ? '0 20px 60px -12px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.2)'
              : '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={isDragging ? handleMouseMove : undefined}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
        >
          <div className="grid grid-cols-3 gap-3 sm:gap-4 w-full max-w-xs">
            <div className="text-xs sm:text-sm text-center">
              <div className="text-gray-500 mb-0.5">Total</div>
              <span className="font-mono font-semibold text-blue-700">₹{total}</span>
            </div>
            <div className="text-xs sm:text-sm text-center">
              <div className="text-gray-500 mb-0.5">Target</div>
              <span 
                className="font-mono font-semibold text-indigo-700 cursor-pointer hover:text-indigo-800 hover:bg-indigo-50 px-2 py-1 rounded-lg transition-all duration-200 inline-block focus:outline-none focus:ring-2 focus:ring-indigo-300"
                onClick={handleTargetClick}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleTargetClick(e as any);
                  }
                }}
                tabIndex={0}
                role="button"
                aria-label="Click to edit target amount"
                title="Click to edit target"
              >
                ₹{target ?? 0}
              </span>
            </div>
            <div className="text-xs sm:text-sm text-center">
              <div className="text-gray-500 mb-0.5">P/L</div>
              <span className={`font-mono font-semibold ${plColor}`}>₹{pl || "0"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Target Edit Modal - Compact */}
      {showTargetModal && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={handleModalClose}
        >
          <div 
            className="bg-white rounded-xl shadow-xl w-full max-w-xs mx-4 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4">
              <h3 className="text-base font-medium text-gray-900 mb-3 text-center">
                Edit Target
              </h3>
              
              <div className="mb-4">
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">₹</span>
                  <input
                    type="number"
                    value={targetValue}
                    onChange={(e) => setTargetValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleTargetSave();
                      if (e.key === 'Escape') handleModalClose();
                    }}
                    className="w-full pl-7 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none font-mono text-base hover:border-gray-400 transition-colors"
                    placeholder="0"
                    autoFocus
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleTargetDelete}
                  className="px-3 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 active:scale-95 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-red-300"
                  title="Delete target"
                >
                  ×
                </button>
                <button
                  onClick={handleModalClose}
                  className="flex-1 px-3 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 active:scale-95 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleTargetSave}
                  className="flex-1 px-3 py-2 bg-indigo-500 text-white rounded-lg text-sm font-medium hover:bg-indigo-600 active:scale-95 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}