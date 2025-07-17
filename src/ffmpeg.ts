import { exec } from "child_process";
import fs from 'fs/promises';
import * as path from 'path';

const sh = (command: string): Promise<{ stdout: string, stderr: string }> => {
  return new Promise((resolve, reject) => {
    exec(command, (err, stdout, stderr) => {
      if (err) {
        reject(err);
      } else {
        resolve({ stdout, stderr });
      }
    });
  });
};

const joinPath = (...paths: string[]) => {
  return path.join(__dirname, '../', ...paths);
}

export const generateGIF = async (gif: string, identifier: string): Promise<Buffer> => {
  try {
    const textPath = joinPath(`_temp/texts/${identifier}-text.png`);
    const gifPath = joinPath(`assets/${gif}.gif`);
    const destinationPath = joinPath(`_temp/${identifier}.gif`);

    // Get GIF duration
    let duration = 5; // Default fallback
    let targetFps = 10;
    let maxColors = 96;
    
    try {
      const { stdout: gifInfo } = await sh(
        `ffprobe -v quiet -print_format json -show_format "${gifPath}"`
      );
      const info = JSON.parse(gifInfo);
      duration = parseFloat(info.format.duration) || 5;
      
      // Adaptive optimization based on duration
      if (duration > 5) {
        targetFps = 8;
        maxColors = 64;
      } else if (duration > 2) {
        targetFps = 10;
        maxColors = 96;
      } else {
        targetFps = 12;
        maxColors = 128;
      }
    } catch (probeError) {
      // Continue with defaults if probe fails
      console.warn('Could not probe GIF duration, using defaults');
    }

    // Single-pass optimized processing
    await sh(
      `ffmpeg -i "${textPath}" -i "${gifPath}" ` +
      `-filter_complex "` +
        `[0:v]scale=700:-1:flags=fast_bilinear[v0]; ` +
        `[1:v]scale=700:-1:flags=fast_bilinear[v1]; ` +
        `[v0][v1]vstack=inputs=2[stacked]; ` +
        `[stacked]fps=${targetFps},split[s0][s1]; ` +
        `[s0]palettegen=max_colors=${maxColors}:reserve_transparent=0[p]; ` +
        `[s1][p]paletteuse=dither=sierra2_4a:diff_mode=rectangle" ` +
      `-fs 5M ` +
      `-loop 0 ` +
      `-preset fast ` +
      `-threads 0 ` +
      `-y "${destinationPath}"`
    );

    const image = await fs.readFile(destinationPath);

    // Parallel cleanup
    await Promise.all([
      fs.unlink(textPath).catch(() => {}),
      fs.unlink(destinationPath).catch(() => {})
    ]);

    return image;
  } catch (err) {
    throw err;
  }
};