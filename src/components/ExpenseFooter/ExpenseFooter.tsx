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
  const lastClickTime = useRef<number>(0);
  const clickCount = useRef<number>(0);

  const pl = (target ?? 0) - total;
  const plColor = pl > 0 ? "text-green-600" : pl < 0 ? "text-red-600" : "text-gray-600";

  // Handle double-click for PC users to navigate to dashboard
  const handleDoubleClick = () => {
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
  };

  // Handle click detection for double-click functionality
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
    const now = Date.now();
    const timeDiff = now - lastClickTime.current;
    
    if (timeDiff < 300) { // Double-click detected within 300ms
      clickCount.current++;
      if (clickCount.current === 2) {
        handleDoubleClick();
        clickCount.current = 0;
        return;
      }
    } else {
      clickCount.current = 1;
    }
    
    lastClickTime.current = now;
    
    // Reset click count after timeout to prevent confusion
    setTimeout(() => {
      if (clickCount.current === 1) {
        clickCount.current = 0;
      }
    }, 350);
  };

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

  // Mouse events - Use click detection instead of drag for PC
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    // Don't start drag on mouse, use click detection instead
    handleClick(e);
  };

  // Touch events - Keep drag functionality for mobile
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
          onDoubleClick={handleDoubleClick}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
          title="Double-click to go to Dashboard (PC) | Long press and swipe up (Mobile)"
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

      {/* Target Edit Modal - Professional */}
      {showTargetModal && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-0 sm:p-6"
          onClick={handleModalClose}
        >
          <div 
            className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-sm animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
            style={{
              marginTop: "15vh",
            }}
          >


            <div className="px-4 pt-4 pb-4 sm:px-8 sm:pt-8 sm:pb-6">
              <div className="text-center mb-6 sm:mb-8">
                <h3 className="text-lg sm:text-2xl font-semibold sm:font-light text-gray-900 mb-1 sm:mb-2">
                  Edit Target
                </h3>
                <p className="text-sm sm:text-base text-gray-500 font-light">
                  Set your monthly spending goal
                </p>
              </div>
              
              <div className="mb-6 sm:mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-2 sm:mb-3">
                  Target Amount
                </label>
                <div className="relative">
                  <span className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-base sm:text-lg font-medium">₹</span>
                  <input
                    type="number"
                    value={targetValue}
                    onChange={(e) => setTargetValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleTargetSave();
                      if (e.key === 'Escape') handleModalClose();
                    }}
                    className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-3 sm:py-4 text-base sm:text-lg border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-mono transition-all hover:border-gray-300"
                    placeholder="0"
                    autoFocus
                  />
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleTargetSave}
                  className="w-full px-4 sm:px-6 py-3 sm:py-4 bg-blue-600 text-white rounded-lg sm:rounded-xl text-base font-medium hover:bg-blue-700 transition-all shadow-sm"
                >
                  Save Target
                </button>
                <div className="flex gap-3">
                  <button
                    onClick={handleModalClose}
                    className="flex-1 px-4 sm:px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-lg sm:rounded-xl text-base font-medium hover:bg-gray-50 hover:border-gray-300 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleTargetDelete}
                    className="flex-1 px-4 sm:px-6 py-3 bg-white border border-red-200 text-red-600 rounded-lg sm:rounded-xl text-base font-medium hover:bg-red-50 hover:border-red-300 transition-all"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}