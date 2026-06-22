"use client";

import { useEffect } from "react";
import { setupGSAPMobileFix } from "@/lib/gsap-mobile-fix";

/**
 * Client-side component that initializes the GSAP mobile pointer capture fix
 * This runs once when the app loads in the browser
 */
export default function GSAPMobileFixClient() {
  useEffect(() => {
    setupGSAPMobileFix();
  }, []);

  return null; // This component doesn't render anything
}
