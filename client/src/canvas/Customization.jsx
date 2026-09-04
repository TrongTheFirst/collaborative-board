import {Palette, Type, Ruler, Plus, Minus} from "lucide-react";
import { useState, useEffect } from "react";

import {ELLIPSE_STYLE} from "../canvas/tools/Ellipse.js";
import {LINE_STYLE} from "../canvas/tools/Line.js";
import {PENCIL_STYLE} from "../canvas/tools/Pencil.js";
import {RECTANGLE_STYLE} from "../canvas/tools/Rectangle.js";
import {TEXT_STYLE} from "../canvas/tools/Text.js";


const PRESET_COLORS = [
    { name: "Black", value: "#000000" },
    { name: "Red", value: "#dc2626" },
    { name: "Green", value: "#16a34a" },
    { name: "Blue", value: "#2563eb" },
];
const STROKE_WIDTHS = [
    { label: "Thin", value: 1 },
    { label: "Medium", value: 3 },
    { label: "Thick", value: 6 },
];
const STROKE_STYLES = [
    { label: "Solid", value: "solid", dasharray: "0" },
    { label: "Dashed", value: "dashed", dasharray: "5,4" },
    { label: "Dotted", value: "dotted", dasharray: "1.5,4" },
];
const FONT_SIZES = [
    { label: "Small", value: 16 },
    { label: "Medium", value: 20 },
    { label: "Large", value: 28 },
    { label: "Extra Large", value: 36 },
]
const FONT_OPTIONS = [
    { label: "Handwritten", value: "cursive" },
    { label: "Sans-serif", value: "sans-serif" },
    { label: "Serif", value: "serif" },
    { label: "Monospace", value: "monospace" },
];

function ColorSwitch({ color, selected, onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-label={color.name}
            aria-pressed={selected}
            className={`w-7 h-7 rounded-lg cursor-pointer transition-transform duration-150 hover:scale-110 ring-offset-2 ${
                selected ? "ring-2 ring-gray-900" : "ring-1 ring-black/10"
            }`}
            style={{ backgroundColor: color.value }}
        />
    );
}

function Customization({currTool}){

    const styles = {ELLIPSE_STYLE, LINE_STYLE, RECTANGLE_STYLE, PENCIL_STYLE, TEXT_STYLE};

    //rect, ellipse, line, pencil, text
    const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0].value);
    //rect, ellipse, line, pencil
    const [selectedWidth, setSelectedWidth] = useState(STROKE_WIDTHS[1].value);
    //rect, ellipse, line
    const [selectedStyle, setSelectedStyle] = useState(STROKE_STYLES[0].value);
    //text
    const [selectedFont, setSelectedFont] = useState(FONT_OPTIONS[0].value);
    //text
    const [selectedSize, setSelectedSize] = useState(FONT_SIZES[1].value);

    useEffect(() => {
        [RECTANGLE_STYLE, ELLIPSE_STYLE, LINE_STYLE].forEach(style => {
            style.strokeColor = selectedColor;
            style.strokeWidth = selectedWidth;
            style.strokeStyle = selectedStyle;
        });

        PENCIL_STYLE.strokeColor = selectedColor;
        PENCIL_STYLE.strokeWidth = selectedWidth;


        TEXT_STYLE.fillStyle = selectedColor;
        TEXT_STYLE.fontStyle = selectedFont;
        TEXT_STYLE.fontSize = `${selectedSize}px`;
    },[selectedColor, selectedWidth, selectedFont, selectedStyle, selectedSize]);

    return (
        <div className="fixed inset-y-0 left-0 z-40 flex items-start pointer-events-none">
            <div className="ml-4 mt-24 w-56 bg-white border border-gray-200 rounded-xl shadow-md pointer-events-auto">
                <div className="px-4 py-3"> {/* color chooser */}
                    <span className="text-[13px] font-medium text-gray-600">
                        Color
                    </span>
                    <div className="mt-2 flex flex-row items-center gap-2.5">
                        {PRESET_COLORS.map((color) => (
                            <button
                                type="button"
                                key={color.value}
                                aria-label={color.name}
                                aria-pressed={selectedColor === color.value}
                                onClick={() => setSelectedColor(color.value)}
                                className={`w-7 h-7 rounded-lg cursor-pointer transition-transform duration-150 hover:scale-110 ring-offset-2 ${
                                    selectedColor === color.value ? "ring-2 ring-gray-900" : "ring-1 ring-black/10"
                                }`}
                                style={{ backgroundColor: color.value }}
                            />
                        ))}

                        <div className="w-px h-6 bg-gray-200 mx-0.5" />

                        <label
                            className="relative w-7 h-7 rounded-lg cursor-pointer ring-1 ring-black/10 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:scale-110 transition-transform duration-150"
                            style={{
                                background: !PRESET_COLORS.some((c) => c.value === selectedColor)
                                    ? selectedColor
                                    : "conic-gradient(from 90deg, #f87171, #fbbf24, #34d399, #60a5fa, #a78bfa, #f87171)"
                            }}
                        >
                            <Plus size={14} strokeWidth={2} className={PRESET_COLORS.some((c) => c.value === selectedColor) ? "text-white/90" : "text-white/90 opacity-0"} />
                            <input
                                type="color"
                                value={selectedColor}
                                onChange={(e) => setSelectedColor(e.target.value)}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                        </label>
                    </div>
                </div>
                {currTool!=="text" &&
                    <>
                        <div className="px-4 py-3">
                            <span className="text-[13px] font-medium text-gray-600">
                                Stroke width
                            </span>
                            <div className="mt-2 flex flex-row items-center gap-2.5">
                                {STROKE_WIDTHS.map((stroke) => (
                                    <button
                                        key={stroke.value}
                                        type="button"
                                        aria-label={stroke.label}
                                        aria-pressed={selectedWidth === stroke.value}
                                        onClick={() => setSelectedWidth(stroke.value)}
                                        className={`w-9 h-7 flex items-center justify-center rounded-md transition-colors cursor-pointer bg-gray-100 ${
                                            selectedWidth === stroke.value
                                                ? "bg-indigo-100"
                                                : "hover:bg-gray-200"
                                        }`}
                                    >
                                <span>
                                    <Minus strokeWidth={stroke.value}/>
                                </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                        {currTool!=="pencil" && <div className="px-4 py-3">
                            <span className="text-[13px] font-medium text-gray-600">
                                Stroke style
                            </span>
                            <div className="mt-2 flex flex-row items-center gap-2.5">
                                {STROKE_STYLES.map((stroke) => (
                                    <button
                                        key={stroke.value}
                                        type="button"
                                        title={stroke.label}
                                        aria-label={stroke.label}
                                        aria-pressed={selectedStyle === stroke.value}
                                        onClick={() => setSelectedStyle(stroke.value)}
                                        className={`w-9 h-7 flex items-center justify-center rounded-md transition-colors cursor-pointer ${
                                            selectedStyle === stroke.value
                                                ? "bg-indigo-100"
                                                : "bg-gray-100 hover:bg-gray-200"
                                        }`}
                                    >
                                        <svg width="20" height="10" viewBox="0 0 20 10">
                                            <line
                                                x1="1" y1="5" x2="19" y2="5"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeDasharray={stroke.dasharray}
                                                className={selectedStyle === stroke.value ? "stroke-indigo-700" : "stroke-gray-700"}
                                            />
                                        </svg>
                                    </button>
                                ))}
                            </div>
                        </div>}
                    </>
                }
                {currTool==="text" &&
                    <>
                        <div className="px-4 py-3">
                            <span className="text-[13px] font-medium text-gray-600">
                                Font size
                            </span>
                            <div className="mt-2 flex flex-row items-center gap-2">
                                {FONT_SIZES.map((font) => (
                                    <button
                                        key={font.value}
                                        type="button"
                                        title={font.label}
                                        aria-label={font.label}
                                        aria-pressed={selectedSize === font.value}
                                        onClick={() => setSelectedSize(font.value)}
                                        className={`w-9 h-9 flex flex-col items-center justify-center gap-0.5 rounded-md transition-colors cursor-pointer ${
                                            selectedSize === font.value
                                                ? "bg-indigo-100"
                                                : "bg-gray-100 hover:bg-gray-200"
                                        }`}
                                    >
                                        <span
                                            className={`leading-none ${selectedSize === font.value ? "text-indigo-700" : "text-gray-700"}`}
                                            style={{ fontSize: `${font.value}px` }}
                                        >
                                            Aa
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="px-4 py-3">
                            <span className="text-[13px] font-medium text-gray-600">
                                Font
                            </span>
                            <div className="mt-2 flex flex-row items-center gap-2">
                                {FONT_OPTIONS.map((font) => (
                                    <button
                                        key={font.value}
                                        type="button"
                                        title={font.label}
                                        aria-label={font.label}
                                        aria-pressed={selectedFont === font.value}
                                        onClick={() => setSelectedFont(font.value)}
                                        className={`w-9 h-7 flex items-center justify-center rounded-md transition-colors cursor-pointer ${
                                            selectedFont === font.value
                                                ? "bg-indigo-100"
                                                : "bg-gray-100 hover:bg-gray-200"
                                        }`}
                                    >
                                        <span
                                            className={`text-sm ${selectedFont === font.value ? "text-indigo-700" : "text-gray-700"}`}
                                            style={{ fontFamily: font.value }}
                                        >
                                            Aa
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </>
                }
            </div>
        </div>
    )
}
export default Customization;