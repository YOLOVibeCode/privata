import * as fs from 'fs-extra';
import * as path from 'path';
import { Logger } from './Logger';

export class FileSystem {
  constructor(private logger: Logger) {}

  async exists(filePath: string): Promise<boolean> {
    try {
      return await fs.pathExists(filePath);
    } catch (error) {
      this.logger.debug(`Failed to check if path exists: ${filePath}`, error);
      return false;
    }
  }

  async readFile(filePath: string): Promise<string> {
    try {
      return await fs.readFile(filePath, 'utf8');
    } catch (error) {
      this.logger.error(`Failed to read file: ${filePath}`, error);
      throw error;
    }
  }

  async writeFile(filePath: string, content: string): Promise<void> {
    try {
      await fs.ensureDir(path.dirname(filePath));
      await fs.writeFile(filePath, content, 'utf8');
    } catch (error) {
      this.logger.error(`Failed to write file: ${filePath}`, error);
      throw error;
    }
  }

  async readJson(filePath: string): Promise<any> {
    try {
      return await fs.readJson(filePath);
    } catch (error) {
      this.logger.error(`Failed to read JSON file: ${filePath}`, error);
      throw error;
    }
  }

  async writeJson(filePath: string, data: any): Promise<void> {
    try {
      await fs.ensureDir(path.dirname(filePath));
      await fs.writeJson(filePath, data, { spaces: 2 });
    } catch (error) {
      this.logger.error(`Failed to write JSON file: ${filePath}`, error);
      throw error;
    }
  }

  async readDir(dirPath: string, options: { recursive?: boolean } = {}): Promise<string[]> {
    try {
      if (options.recursive) {
        const files: string[] = [];
        await this.readDirRecursive(dirPath, files);
        return files;
      } else {
        return await fs.readdir(dirPath);
      }
    } catch (error) {
      this.logger.error(`Failed to read directory: ${dirPath}`, error);
      throw error;
    }
  }

  private async readDirRecursive(dirPath: string, files: string[]): Promise<void> {
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        
        if (entry.isDirectory()) {
          await this.readDirRecursive(fullPath, files);
        } else {
          files.push(fullPath);
        }
      }
    } catch (error) {
      this.logger.debug(`Failed to read directory recursively: ${dirPath}`, error);
    }
  }

  async ensureDir(dirPath: string): Promise<void> {
    try {
      await fs.ensureDir(dirPath);
    } catch (error) {
      this.logger.error(`Failed to ensure directory: ${dirPath}`, error);
      throw error;
    }
  }

  async copyDir(src: string, dest: string): Promise<void> {
    try {
      await fs.copy(src, dest);
    } catch (error) {
      this.logger.error(`Failed to copy directory: ${src} -> ${dest}`, error);
      throw error;
    }
  }

  async remove(filePath: string): Promise<void> {
    try {
      await fs.remove(filePath);
    } catch (error) {
      this.logger.error(`Failed to remove: ${filePath}`, error);
      throw error;
    }
  }

  async stat(filePath: string): Promise<fs.Stats> {
    try {
      return await fs.stat(filePath);
    } catch (error) {
      this.logger.error(`Failed to get stats: ${filePath}`, error);
      throw error;
    }
  }

  async isFile(filePath: string): Promise<boolean> {
    try {
      const stat = await fs.stat(filePath);
      return stat.isFile();
    } catch (error) {
      return false;
    }
  }

  async isDirectory(filePath: string): Promise<boolean> {
    try {
      const stat = await fs.stat(filePath);
      return stat.isDirectory();
    } catch (error) {
      return false;
    }
  }

  async glob(pattern: string, options: { cwd?: string } = {}): Promise<string[]> {
    try {
      const glob = require('glob');
      return await glob(pattern, { cwd: options.cwd });
    } catch (error) {
      this.logger.error(`Failed to glob pattern: ${pattern}`, error);
      throw error;
    }
  }
}

