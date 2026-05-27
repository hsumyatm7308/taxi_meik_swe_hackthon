import { useRef, useEffect, useState, type KeyboardEvent, type ClipboardEvent, type ChangeEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { RotateCcw } from "lucide-react";

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  onComplete?: (value: string) => void;
}

export function OtpInput({ value, onChange, disabled = false, onComplete }: OtpInputProps) {
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Split string value into an array of 6 elements
  const values = value.padEnd(6, " ").slice(0, 6).split("");

  useEffect(() => {
    // Focus the first empty input or the first input on mount
    const firstEmptyIndex = value.length < 6 ? value.length : 5;
    if (inputRefs.current[firstEmptyIndex] && !disabled) {
      inputRefs.current[firstEmptyIndex]?.focus();
    }
  }, []);

  const focusInput = (index: number) => {
    if (index >= 0 && index < 6) {
      inputRefs.current[index]?.focus();
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>, index: number) => {
    const val = e.target.value;
    // We only care about the last character typed if it's a digit
    const digit = val.slice(-1);
    if (!/^\d$/.test(digit) && digit !== "") {
      return; // Ignore non-digit characters
    }

    const newValues = [...values];
    newValues[index] = digit || " ";
    const newString = newValues.join("").trimEnd();
    onChange(newString);

    if (digit !== "") {
      if (index < 5) {
        focusInput(index + 1);
      } else {
        // Last digit entered, blur or trigger complete
        inputRefs.current[index]?.blur();
        if (newString.length === 6 && onComplete) {
          onComplete(newString);
        }
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      const newValues = [...values];
      
      if (values[index] !== " ") {
        // If current box is filled, clear it
        newValues[index] = " ";
        const newString = newValues.join("").trimEnd();
        onChange(newString);
      } else if (index > 0) {
        // If current box is empty, go back and clear previous box
        newValues[index - 1] = " ";
        const newString = newValues.join("").trimEnd();
        onChange(newString);
        focusInput(index - 1);
      }
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      focusInput(index - 1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      focusInput(index - 1 + 2); // focus next
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData("text");
    const digits = pastedText.replace(/\D/g, "").slice(0, 6);
    
    if (digits.length > 0) {
      onChange(digits);
      // Focus appropriate box
      const focusTarget = Math.min(digits.length, 5);
      inputRefs.current[focusTarget]?.focus();
      
      if (digits.length === 6 && onComplete) {
        onComplete(digits);
      }
    }
  };

  return (
    <div className="flex justify-between gap-2 sm:gap-3 w-full max-w-sm mx-auto my-4">
      {Array.from({ length: 6 }).map((_, index) => {
        const char = values[index];
        const isFilled = char !== " " && char !== undefined;
        const isFocused = focusedIndex === index;

        return (
          <motion.div
            key={index}
            className="relative flex-1 aspect-square max-w-[56px] min-w-[40px]"
            animate={{
              scale: isFocused ? 1.05 : 1,
            }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <input
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              value={char === " " ? "" : char}
              disabled={disabled}
              onChange={(e) => handleInputChange(e, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onPaste={handlePaste}
              onFocus={() => setFocusedIndex(index)}
              onBlur={() => setFocusedIndex(null)}
              className={cn(
                "w-full h-full text-center text-xl sm:text-2xl font-bold rounded-xl border transition-all duration-300 outline-none select-none",
                "bg-white/10 border-white/20 text-white placeholder:text-transparent",
                "focus:border-sky-400 focus:bg-white/15 focus:shadow-[0_0_12px_rgba(56,189,248,0.25)]",
                isFilled && "border-white/40 bg-white/15",
                disabled && "opacity-50 cursor-not-allowed"
              )}
            />
            {/* Active cursor visual blinker effect */}
            {isFocused && !isFilled && (
              <span className="absolute inset-x-0 bottom-3 mx-auto w-4 h-0.5 bg-sky-400 animate-pulse" />
            )}
          </motion.div>
        );
      })}
    </div>
  );
}

interface ResendTimerProps {
  onResend: () => void;
  loading?: boolean;
}

export function ResendTimer({ onResend, loading = false }: ResendTimerProps) {
  const [timeLeft, setTimeLeft] = useState(59);

  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleResend = () => {
    setTimeLeft(59);
    onResend();
  };

  return (
    <div className="flex items-center justify-center text-sm min-h-[40px]">
      <AnimatePresence mode="wait">
        {timeLeft > 0 ? (
          <motion.p
            key="timer"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-white/60 flex items-center gap-1.5"
          >
            Resend code in{" "}
            <span className="font-semibold text-sky-300 tabular-nums">
              0:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
            </span>
          </motion.p>
        ) : (
          <motion.button
            key="button"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            type="button"
            disabled={loading}
            onClick={handleResend}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider text-sky-200 transition-all",
              "border border-sky-400/20 bg-sky-400/10 hover:bg-sky-400/20 hover:text-white active:scale-95 disabled:opacity-50"
            )}
          >
            <RotateCcw className={cn("h-3 w-3", loading && "animate-spin")} />
            {loading ? "Sending..." : "Resend Code"}
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
