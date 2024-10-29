import { existsSync, readdirSync, statSync } from "fs";
import { join } from "path";

/**
 * Get all files in a folder and its subfolders
 * @param directory the parent directory to get all files from
 * @returns all files found in all sub-directories
 */
export function loadFiles(directory: string, fileExtension = ".*") {
    const files: string[] = [];
    const dirs: string[] = [];

    try {
        if (existsSync(directory)) {
            const dirContent = readdirSync(directory);

            dirContent.forEach(file => {
                const fullPath = join(directory, file);

                if (statSync(fullPath).isFile()) {
                    if (fullPath.endsWith(fileExtension) || fileExtension === ".*")
                        files.push(fullPath);
                }
                else {
                    dirs.push(fullPath);
                }
            });

            dirs.forEach(dir => {
                loadFiles(dir).forEach(file => files.push(file));
            });
        }
    } catch (ex) {
        console.error(ex);
        return;
    }

    return files;
}

/**
 * 
 * @param array list of items to iterate through
 * @param callbackFn callback function to run
 */
export async function asyncForEach<T>(array: T[], callbackFn: (value: T, index: number, array: readonly T[]) => Promise<any> | any) {
    for (let i = 0; i < array.length; i++) {
        const exit = await callbackFn(array[i], i, array);
        if (exit === true) return true;
    }
    return false;
}

/**
 * 
 * @param map map to iterate through
 * @param callbackFn callback function to run
 */
export async function asyncMapForEach<T, D>(map: Map<T, D>, callbackFn: (key: T, value: D, index: number, map: ReadonlyMap<T, D>) => Promise<any> | any) {
    const keys = Array.from(map.keys());
    const values = Array.from(map.values());
    for (let i = 0; i < map.size; i++) {
        const exit = await callbackFn(keys[i], values[i], i, map);
        if (exit === true) break;
    }
}