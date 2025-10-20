/**
 * CLI UI Utilities
 * Provides consistent formatting, colors, and visual elements for the CLI demo
 */

import chalk from 'chalk';
import Table from 'cli-table3';

export class CliUI {
  /**
   * Print a section header
   */
  static header(text: string, symbol: string = '='): void {
    console.log('\n' + chalk.bold.cyan(symbol.repeat(70)));
    console.log(chalk.bold.cyan(`  ${text}`));
    console.log(chalk.bold.cyan(symbol.repeat(70)));
  }

  /**
   * Print a sub-header
   */
  static subHeader(text: string, emoji: string = '📋'): void {
    console.log('\n' + chalk.bold.blue(`${emoji} ${text}`));
    console.log(chalk.blue('-'.repeat(60)));
  }

  /**
   * Print success message
   */
  static success(message: string, emoji: string = '✅'): void {
    console.log(chalk.green(`${emoji} ${message}`));
  }

  /**
   * Print error message
   */
  static error(message: string, emoji: string = '❌'): void {
    console.log(chalk.red(`${emoji} ${message}`));
  }

  /**
   * Print info message
   */
  static info(message: string, emoji: string = 'ℹ️'): void {
    console.log(chalk.blue(`${emoji}  ${message}`));
  }

  /**
   * Print warning message
   */
  static warning(message: string, emoji: string = '⚠️'): void {
    console.log(chalk.yellow(`${emoji}  ${message}`));
  }

  /**
   * Print key-value pair
   */
  static keyValue(key: string, value: any, indent: number = 3): void {
    const spaces = ' '.repeat(indent);
    console.log(`${spaces}${chalk.gray(key + ':')} ${chalk.white(value)}`);
  }

  /**
   * Print a metric
   */
  static metric(label: string, value: string | number, unit: string = '', emoji: string = '📊'): void {
    console.log(`   ${emoji} ${chalk.cyan(label)}: ${chalk.bold.white(value)}${unit ? chalk.gray(unit) : ''}`);
  }

  /**
   * Create a table for displaying data
   */
  static createTable(headers: string[]): Table.Table {
    return new Table({
      head: headers.map(h => chalk.bold.cyan(h)),
      style: {
        head: [],
        border: ['gray']
      }
    });
  }

  /**
   * Print a database content table
   */
  static printDatabaseTable(title: string, data: any[]): void {
    if (data.length === 0) {
      this.warning(`No data found in ${title}`);
      return;
    }

    this.subHeader(title, '📊');

    const keys = Object.keys(data[0]);
    const table = this.createTable(keys);

    data.forEach(row => {
      table.push(keys.map(key => {
        const value = row[key];
        if (value === null || value === undefined) {
          return chalk.gray('null');
        }
        if (typeof value === 'object') {
          return chalk.yellow(JSON.stringify(value));
        }
        return String(value);
      }));
    });

    console.log(table.toString());
    this.info(`Total records: ${data.length}`, '📈');
  }

  /**
   * Print a step in the demonstration
   */
  static step(stepNumber: number, title: string, description?: string): void {
    console.log('\n' + chalk.bold.magenta(`Step ${stepNumber}: ${title}`));
    if (description) {
      console.log(chalk.gray(`   ${description}`));
    }
  }

  /**
   * Print a comparison (before/after)
   */
  static comparison(label: string, before: any, after: any): void {
    console.log(`   ${chalk.gray(label)}:`);
    console.log(`      ${chalk.red('Before:')} ${chalk.white(before)}`);
    console.log(`      ${chalk.green('After:')}  ${chalk.white(after)}`);
  }

  /**
   * Print a divider
   */
  static divider(): void {
    console.log(chalk.gray('   ' + '─'.repeat(60)));
  }

  /**
   * Print compliance score
   */
  static complianceScore(score: number, label: string): void {
    let color = chalk.red;
    let emoji = '❌';

    if (score >= 90) {
      color = chalk.green;
      emoji = '✅';
    } else if (score >= 70) {
      color = chalk.yellow;
      emoji = '⚠️';
    }

    console.log(`   ${emoji} ${chalk.cyan(label)}: ${color.bold(score + '%')}`);
  }

  /**
   * Print ASCII art banner
   */
  static banner(): void {
    console.log(chalk.cyan(`
╔═══════════════════════════════════════════════════════════════════╗
║                                                                   ║
║   ██████╗ ██████╗ ██╗██╗   ██╗ █████╗ ████████╗ █████╗          ║
║   ██╔══██╗██╔══██╗██║██║   ██║██╔══██╗╚══██╔══╝██╔══██╗         ║
║   ██████╔╝██████╔╝██║██║   ██║███████║   ██║   ███████║         ║
║   ██╔═══╝ ██╔══██╗██║╚██╗ ██╔╝██╔══██║   ██║   ██╔══██║         ║
║   ██║     ██║  ██║██║ ╚████╔╝ ██║  ██║   ██║   ██║  ██║         ║
║   ╚═╝     ╚═╝  ╚═╝╚═╝  ╚═══╝  ╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝         ║
║                                                                   ║
║              GDPR/HIPAA Compliance Demonstration                 ║
║                  Privacy by Design, Data by Default              ║
║                                                                   ║
╚═══════════════════════════════════════════════════════════════════╝
    `));
  }

  /**
   * Print a progress indicator
   */
  static progress(current: number, total: number, label: string): void {
    const percentage = Math.round((current / total) * 100);
    const filled = Math.round((current / total) * 20);
    const bar = '█'.repeat(filled) + '░'.repeat(20 - filled);

    console.log(`   ${chalk.cyan(label)}: [${chalk.green(bar)}] ${chalk.bold.white(percentage + '%')}`);
  }

  /**
   * Wait for user input
   */
  static async pressEnter(message: string = 'Press ENTER to continue...'): Promise<void> {
    const inquirer = require('inquirer');
    await inquirer.prompt([
      {
        type: 'input',
        name: 'continue',
        message: chalk.gray(message),
      }
    ]);
  }

  /**
   * Clear the console
   */
  static clear(): void {
    console.clear();
  }
}
