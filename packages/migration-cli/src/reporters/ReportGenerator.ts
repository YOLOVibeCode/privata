import { MigrationEngine } from '../core/MigrationEngine';
import { FileSystem } from '../utils/FileSystem';
import { Logger } from '../utils/Logger';
import { ReportData, MigrationResults, MigrationPlan, ProjectAnalysis, ComplianceAnalysis } from '../types';
import * as path from 'path';

export class ReportGenerator {
  private fileSystem: FileSystem;
  private logger: Logger;

  constructor(private migrationEngine: MigrationEngine) {
    this.fileSystem = new FileSystem(migrationEngine.logger);
    this.logger = migrationEngine.logger;
  }

  async generateReport(results: MigrationResults): Promise<{ path: string; content: string }> {
    this.logger.info('Generating migration report...');

    const reportData: ReportData = {
      migrationPlan: await this.getMigrationPlan(),
      results,
      analysis: await this.getProjectAnalysis(),
      complianceAnalysis: await this.getComplianceAnalysis(),
      timestamp: new Date(),
      version: '1.0.0',
    };

    // Generate JSON report
    const jsonReport = await this.generateJSONReport(reportData);
    
    // Generate HTML report
    const htmlReport = await this.generateHTMLReport(reportData);
    
    // Generate Markdown report
    const markdownReport = await this.generateMarkdownReport(reportData);

    const outputPath = this.migrationEngine.options.outputPath || './privata-migration';
    
    // Save reports
    const jsonPath = path.join(outputPath, 'migration-report.json');
    const htmlPath = path.join(outputPath, 'migration-report.html');
    const markdownPath = path.join(outputPath, 'migration-report.md');

    await this.fileSystem.writeFile(jsonPath, jsonReport);
    await this.fileSystem.writeFile(htmlPath, htmlReport);
    await this.fileSystem.writeFile(markdownPath, markdownReport);

    this.logger.info('Migration report generated successfully');
    
    return {
      path: jsonPath,
      content: jsonReport,
    };
  }

  private async generateJSONReport(reportData: ReportData): Promise<string> {
    return JSON.stringify(reportData, null, 2);
  }

  private async generateHTMLReport(reportData: ReportData): Promise<string> {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Privata Migration Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .header h1 { color: #2c3e50; margin: 0; }
        .header p { color: #7f8c8d; margin: 5px 0; }
        .section { margin-bottom: 30px; }
        .section h2 { color: #34495e; border-bottom: 2px solid #3498db; padding-bottom: 10px; }
        .section h3 { color: #2c3e50; margin-top: 20px; }
        .metric { display: inline-block; margin: 10px 20px 10px 0; padding: 10px 15px; background: #ecf0f1; border-radius: 5px; }
        .metric-value { font-size: 24px; font-weight: bold; color: #27ae60; }
        .metric-label { font-size: 14px; color: #7f8c8d; }
        .success { color: #27ae60; }
        .warning { color: #f39c12; }
        .error { color: #e74c3c; }
        .code { background: #f8f9fa; padding: 10px; border-radius: 5px; font-family: monospace; }
        .list { list-style: none; padding: 0; }
        .list li { padding: 5px 0; border-bottom: 1px solid #ecf0f1; }
        .list li:last-child { border-bottom: none; }
        .badge { display: inline-block; padding: 3px 8px; border-radius: 3px; font-size: 12px; font-weight: bold; }
        .badge-success { background: #d4edda; color: #155724; }
        .badge-warning { background: #fff3cd; color: #856404; }
        .badge-error { background: #f8d7da; color: #721c24; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
        .card { background: #f8f9fa; padding: 15px; border-radius: 5px; border-left: 4px solid #3498db; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 Privata Migration Report</h1>
            <p>Generated on ${reportData.timestamp.toLocaleString()}</p>
            <p>Version: ${reportData.version}</p>
        </div>

        <div class="section">
            <h2>📊 Migration Summary</h2>
            <div class="grid">
                <div class="card">
                    <div class="metric">
                        <div class="metric-value">${reportData.results.filesTransformed}</div>
                        <div class="metric-label">Files Transformed</div>
                    </div>
                </div>
                <div class="card">
                    <div class="metric">
                        <div class="metric-value">${reportData.results.dependenciesAdded}</div>
                        <div class="metric-label">Dependencies Added</div>
                    </div>
                </div>
                <div class="card">
                    <div class="metric">
                        <div class="metric-value">${reportData.results.complianceFeaturesAdded}</div>
                        <div class="metric-label">Compliance Features Added</div>
                    </div>
                </div>
                <div class="card">
                    <div class="metric">
                        <div class="metric-value">${Math.round(reportData.results.executionTime / 1000)}s</div>
                        <div class="metric-label">Execution Time</div>
                    </div>
                </div>
            </div>
        </div>

        <div class="section">
            <h2>🛡️ Compliance Analysis</h2>
            <div class="grid">
                <div class="card">
                    <h3>GDPR Compliance</h3>
                    <div class="metric">
                        <div class="metric-value">${reportData.complianceAnalysis.gdpr.score}/100</div>
                        <div class="metric-label">GDPR Score</div>
                    </div>
                    <ul class="list">
                        ${reportData.complianceAnalysis.gdpr.requirements.map(req => `<li>✅ ${req}</li>`).join('')}
                        ${reportData.complianceAnalysis.gdpr.issues.map(issue => `<li class="warning">⚠️ ${issue}</li>`).join('')}
                    </ul>
                </div>
                <div class="card">
                    <h3>HIPAA Compliance</h3>
                    <div class="metric">
                        <div class="metric-value">${reportData.complianceAnalysis.hipaa.score}/100</div>
                        <div class="metric-label">HIPAA Score</div>
                    </div>
                    <ul class="list">
                        ${reportData.complianceAnalysis.hipaa.requirements.map(req => `<li>✅ ${req}</li>`).join('')}
                        ${reportData.complianceAnalysis.hipaa.issues.map(issue => `<li class="warning">⚠️ ${issue}</li>`).join('')}
                    </ul>
                </div>
                <div class="card">
                    <h3>Data Protection</h3>
                    <div class="metric">
                        <div class="metric-value">${reportData.complianceAnalysis.dataProtection.score}/100</div>
                        <div class="metric-label">Data Protection Score</div>
                    </div>
                    <ul class="list">
                        ${reportData.complianceAnalysis.dataProtection.requirements.map(req => `<li>✅ ${req}</li>`).join('')}
                        ${reportData.complianceAnalysis.dataProtection.issues.map(issue => `<li class="warning">⚠️ ${issue}</li>`).join('')}
                    </ul>
                </div>
                <div class="card">
                    <h3>Privacy Controls</h3>
                    <div class="metric">
                        <div class="metric-value">${reportData.complianceAnalysis.privacyControls.score}/100</div>
                        <div class="metric-label">Privacy Controls Score</div>
                    </div>
                    <ul class="list">
                        ${reportData.complianceAnalysis.privacyControls.requirements.map(req => `<li>✅ ${req}</li>`).join('')}
                        ${reportData.complianceAnalysis.privacyControls.issues.map(issue => `<li class="warning">⚠️ ${issue}</li>`).join('')}
                    </ul>
                </div>
            </div>
        </div>

        <div class="section">
            <h2>📁 Generated Files</h2>
            <ul class="list">
                ${reportData.results.generatedFiles.map(file => `
                    <li>
                        <strong>${file.path}</strong>
                        <span class="badge badge-success">${file.type}</span>
                        <p>${file.description}</p>
                    </li>
                `).join('')}
            </ul>
        </div>

        <div class="section">
            <h2>⚠️ Issues & Warnings</h2>
            ${reportData.results.errors.length > 0 ? `
                <h3 class="error">Errors</h3>
                <ul class="list">
                    ${reportData.results.errors.map(error => `
                        <li class="error">
                            <span class="badge badge-error">ERROR</span>
                            ${error.message}
                            ${error.file ? `<br><small>File: ${error.file}</small>` : ''}
                        </li>
                    `).join('')}
                </ul>
            ` : ''}
            ${reportData.results.warnings.length > 0 ? `
                <h3 class="warning">Warnings</h3>
                <ul class="list">
                    ${reportData.results.warnings.map(warning => `
                        <li class="warning">
                            <span class="badge badge-warning">WARNING</span>
                            ${warning.message}
                            ${warning.file ? `<br><small>File: ${warning.file}</small>` : ''}
                        </li>
                    `).join('')}
                </ul>
            ` : ''}
        </div>

        <div class="section">
            <h2>📋 Next Steps</h2>
            <ol>
                <li>Review the generated files and configurations</li>
                <li>Install new dependencies: <code class="code">npm install</code></li>
                <li>Update your application configuration</li>
                <li>Test your application thoroughly</li>
                <li>Deploy with confidence!</li>
            </ol>
        </div>

        <div class="section">
            <h2>🔗 Resources</h2>
            <ul>
                <li><a href="https://privata.dev/docs">Privata Documentation</a></li>
                <li><a href="https://privata.dev/examples">Code Examples</a></li>
                <li><a href="https://privata.dev/support">Support</a></li>
            </ul>
        </div>
    </div>
</body>
</html>`;

    return html;
  }

  private async generateMarkdownReport(reportData: ReportData): Promise<string> {
    return `# 🚀 Privata Migration Report

Generated on: ${reportData.timestamp.toLocaleString()}  
Version: ${reportData.version}

## 📊 Migration Summary

| Metric | Value |
|--------|-------|
| Files Transformed | ${reportData.results.filesTransformed} |
| Dependencies Added | ${reportData.results.dependenciesAdded} |
| Dependencies Removed | ${reportData.results.dependenciesRemoved} |
| Compliance Features Added | ${reportData.results.complianceFeaturesAdded} |
| Execution Time | ${Math.round(reportData.results.executionTime / 1000)}s |

## 🛡️ Compliance Analysis

### GDPR Compliance: ${reportData.complianceAnalysis.gdpr.score}/100
${reportData.complianceAnalysis.gdpr.requirements.map(req => `- ✅ ${req}`).join('\n')}
${reportData.complianceAnalysis.gdpr.issues.map(issue => `- ⚠️ ${issue}`).join('\n')}

### HIPAA Compliance: ${reportData.complianceAnalysis.hipaa.score}/100
${reportData.complianceAnalysis.hipaa.requirements.map(req => `- ✅ ${req}`).join('\n')}
${reportData.complianceAnalysis.hipaa.issues.map(issue => `- ⚠️ ${issue}`).join('\n')}

### Data Protection: ${reportData.complianceAnalysis.dataProtection.score}/100
${reportData.complianceAnalysis.dataProtection.requirements.map(req => `- ✅ ${req}`).join('\n')}
${reportData.complianceAnalysis.dataProtection.issues.map(issue => `- ⚠️ ${issue}`).join('\n')}

### Privacy Controls: ${reportData.complianceAnalysis.privacyControls.score}/100
${reportData.complianceAnalysis.privacyControls.requirements.map(req => `- ✅ ${req}`).join('\n')}
${reportData.complianceAnalysis.privacyControls.issues.map(issue => `- ⚠️ ${issue}`).join('\n')}

## 📁 Generated Files

${reportData.results.generatedFiles.map(file => `- **${file.path}** (${file.type}) - ${file.description}`).join('\n')}

## ⚠️ Issues & Warnings

${reportData.results.errors.length > 0 ? `
### Errors
${reportData.results.errors.map(error => `- ❌ ${error.message}${error.file ? ` (${error.file})` : ''}`).join('\n')}
` : ''}

${reportData.results.warnings.length > 0 ? `
### Warnings
${reportData.results.warnings.map(warning => `- ⚠️ ${warning.message}${warning.file ? ` (${warning.file})` : ''}`).join('\n')}
` : ''}

## 📋 Next Steps

1. Review the generated files and configurations
2. Install new dependencies: \`npm install\`
3. Update your application configuration
4. Test your application thoroughly
5. Deploy with confidence!

## 🔗 Resources

- [Privata Documentation](https://privata.dev/docs)
- [Code Examples](https://privata.dev/examples)
- [Support](https://privata.dev/support)

---

**Generated by Privata Migration CLI v${reportData.version}** 🚀
`;
  }

  private async getMigrationPlan(): Promise<MigrationPlan> {
    // This would be implemented to get the actual migration plan
    return {
      projectType: 'node',
      filesToTransform: [],
      dependenciesToAdd: [],
      dependenciesToRemove: [],
      complianceFeatures: [],
      transformations: [],
      issues: [],
      estimatedTime: 0,
      riskLevel: 'low',
    };
  }

  private async getProjectAnalysis(): Promise<ProjectAnalysis> {
    // This would be implemented to get the actual project analysis
    return {
      projectType: 'node',
      framework: 'unknown',
      language: 'unknown',
      totalFiles: 0,
      linesOfCode: 0,
      files: [],
      packageJson: null,
      dependencies: [],
      devDependencies: [],
      scripts: {},
      ormUsage: {},
      ormFiles: [],
      apiFiles: [],
      dataFiles: [],
      testFiles: [],
      configFiles: [],
      conflictingDependencies: [],
      complexDependencies: [],
      existingCompliance: false,
      customImplementations: [],
      testCoverage: 0,
      hasDatabaseConfig: false,
      hasSecurityConfig: false,
      hasPrivacyConfig: false,
    };
  }

  private async getComplianceAnalysis(): Promise<ComplianceAnalysis> {
    // This would be implemented to get the actual compliance analysis
    return {
      gdpr: { score: 0, requirements: [], issues: [], recommendations: [] },
      hipaa: { score: 0, requirements: [], issues: [], recommendations: [] },
      dataProtection: { score: 0, requirements: [], issues: [], recommendations: [] },
      privacyControls: { score: 0, requirements: [], issues: [], recommendations: [] },
      issues: [],
      recommendations: [],
      overallScore: 0,
    };
  }
}

