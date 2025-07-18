import { spawn } from "child_process";
import fs from "fs/promises";
import * as path from "path";

const joinPath = (...paths: string[]) => path.join(__dirname, '../', ...paths);

const probeGifDuration = async (gifPath: string): Promise<number> => {
  return new Promise((resolve) => {
    const ffprobe = spawn("ffprobe", [
      "-v", "quiet",
      "-print_format", "json",
      "-show_format",
      gifPath
    ]);
    let data = "";
    ffprobe.stdout.on("data", chunk => data += chunk.toString());
    ffprobe.on("close", () => {
      try {
        const info = JSON.parse(data);
        resolve(parseFloat(info.format.duration) || 5);
      } catch {
        resolve(5);
      }
    });
    ffprobe.on("error", () => resolve(5));
  });
};

export const generateGIF = async (gif: string, identifier: string): Promise<Buffer> => {
  const textPath = joinPath(`_temp/texts/${identifier}-text.png`);
  const gifPath = joinPath(`assets/${gif}.gif`);
  let duration = 5, targetFps = 10, maxColors = 96;
  
  duration = await probeGifDuration(gifPath);
  if (duration > 5) { targetFps = 8; maxColors = 64; }
  else if (duration > 2) { targetFps = 10; maxColors = 96; }
  else { targetFps = 12; maxColors = 128; }

  const ffmpegArgs = [
    "-i", textPath,
    "-i", gifPath,
    "-filter_complex",
    `[0:v]scale=700:-1:flags=fast_bilinear[v0];` +
    `[1:v]scale=700:-1:flags=fast_bilinear[v1];` +
    `[v0][v1]vstack=inputs=2[stacked];` +
    `[stacked]fps=${targetFps},split[s0][s1];` +
    `[s0]palettegen=max_colors=${maxColors}:reserve_transparent=0[p];` +
    `[s1][p]paletteuse=dither=sierra2_4a:diff_mode=rectangle`,
    "-fs", "5M",
    "-loop", "0",
    "-preset", "ultrafast",
    "-threads", "4",        
    "-f", "gif",           
    "pipe:1"               
  ];

  return new Promise<Buffer>(async (resolve, reject) => {
    const ffmpeg = spawn("ffmpeg", ffmpegArgs);
    const chunks: Buffer[] = [];
    ffmpeg.stdout.on("data", chunk => chunks.push(chunk));
    ffmpeg.on("close", async (code) => {
      // Parallel cleanup
      await Promise.all([
        fs.unlink(textPath).catch(() => {}),
      ]);
      if (code === 0) resolve(Buffer.concat(chunks));
      else reject(new Error("FFmpeg failed"));
    });
    ffmpeg.on("error", reject);
  });
};
