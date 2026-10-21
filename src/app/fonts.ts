import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";

export const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"], display: "swap" });
export const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"], display: "swap" });
export const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});

export const fontVariables = `${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable}`;
