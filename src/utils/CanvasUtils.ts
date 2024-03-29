import { Canvas, createCanvas, CanvasRenderingContext2D } from "canvas";
import { CANVAS_FONT } from "../Constants";

const cache: { text: string, size: number, font: string }[] = [];

export function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number, func: "fill" | "stroke" | "clip" = "fill") {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    switch (func) {
        case "clip":
            ctx.clip();
            break;
        case "fill":
            ctx.fill();
            break;
        case "stroke":
            ctx.stroke();
            break;
    }
}

export function rgbToHsl(r: number, g: number, b: number) {
    r /= 255, g /= 255, b /= 255;

    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h: number, s: number;
    const l = (max + min) / 2;

    if (max == min) {
        h = s = 0; // achromatic
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }

        h /= 6;
    }

    return {
        h,
        s,
        l
    };
}

/**
 * Fill a canvas with a specific color
 * @param color hex string of color
 * @param width width of the canvas
 * @param height height of the canvas
 * @returns A Canvas with the color
 */
export function canvasColor(color: string, width = 700, height = 320) {
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    if (!color.startsWith("#")) color = `#${color}`;
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    return canvas;
}

export function cloneCanvas(oldCanvas: Canvas) {

    //create a new canvas
    const newCanvas = createCanvas(oldCanvas.width, oldCanvas.height);
    const context = newCanvas.getContext("2d");

    //apply the old canvas to the new one
    context.drawImage(oldCanvas, 0, 0);

    //return the new canvas
    return newCanvas;
}

export function fitTextOnCanvas(ctx: CanvasRenderingContext2D, text: string, width: number, font = CANVAS_FONT, startSize = 100) {

    const cached = cache.find(value => value.text === text && value.font === font);
    if (cached)
        return cached.size;

    // start with a large font size
    let fontsize = startSize;

    const prevFont = ctx.font;

    ctx.font = `${fontsize}px ${font}`;

    // lower the font size until the text fits the canvas
    do {
        fontsize--;
        ctx.font = `${fontsize}px ${font}`;
    } while (ctx.measureText(text).width > width);

    ctx.font = prevFont;

    cache.push({ text, size: fontsize, font });

    return fontsize;

}

export function underlineText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number) {
    const metrics = ctx.measureText(text);
    const actualHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
    const fontSize = Math.floor(actualHeight * 1.4);
    const height = Math.ceil(fontSize * 0.08);
    switch (ctx.textAlign) {
        case "center": x -= (metrics.width / 2); break;
        case "right": x -= metrics.width; break;
    }
    switch (ctx.textBaseline) {
        case "top": y += (fontSize); break;
        case "middle": y += (fontSize / 2); break;
    }
    ctx.save();
    roundRect(ctx, x, y, metrics.width, height, height * 0.2, "fill");
    ctx.restore();
}