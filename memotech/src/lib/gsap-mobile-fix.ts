/**
 * GSAP Mobile Pointer Capture Fix
 * 
 * Suppresses "releasePointerCapture" errors that occur on mobile devices
 * when GSAP's Draggable plugin tries to release a pointer that doesn't exist.
 * This is a common issue on touch devices where pointers may be lost/interrupted.
 * 
 * The functionality is unaffected - this only silences the DOM error.
 */

export function setupGSAPMobileFix() {
  if (typeof window === "undefined") return;

  // Store the original console.error
  const originalError = console.error;

  // Override console.error to filter out the specific GSAP pointer error
  console.error = function (...args: any[]) {
    // Check if this is the GSAP releasePointerCapture error
    const errorMessage = args[0]?.toString?.() || "";
    const errorStr = args.join(" ");

    if (
      errorMessage.includes("releasePointerCapture") &&
      errorMessage.includes("Failed to execute") &&
      (errorMessage.includes("No active pointer") || errorStr.includes("No active pointer"))
    ) {
      // Silently ignore this specific error
      return;
    }

    // Call the original console.error for all other errors
    originalError.apply(console, args);
  };

  // Also patch the Element.prototype.releasePointerCapture to handle errors gracefully
  const originalReleasePointerCapture =
    Element.prototype.releasePointerCapture;

  Element.prototype.releasePointerCapture = function (pointerId: number) {
    try {
      originalReleasePointerCapture.call(this, pointerId);
    } catch (error: any) {
      // Silently catch and ignore pointer capture errors on mobile
      if (
        error?.name === "NotFoundError" &&
        error?.message?.includes("releasePointerCapture")
      ) {
        // This is the expected error on mobile - ignore it
        return;
      }
      // Re-throw any other errors
      throw error;
    }
  };
}
