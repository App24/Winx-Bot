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