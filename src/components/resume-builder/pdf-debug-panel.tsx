/**
 * PDF Debug Panel
 * Component for testing and debugging PDF generation
 */

"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { PDFDebugHelper } from "@/lib/pdf-debug-helper";
import type { PDFDebugReport } from "@/lib/pdf-debug-helper";
import { Bug, CheckCircle, FileText, Loader2, XCircle } from "lucide-react";
import { useState } from "react";

const sampleHtml = `<div style="font-family: Arial, sans-serif; padding: 20px; color: #000;">
  <h1 style="color: #333; margin-bottom: 10px;">John Doe</h1>
  <h2 style="color: #666; margin-bottom: 15px;">Software Engineer</h2>
  
  <div style="margin-bottom: 20px;">
    <p><strong>Email:</strong> john.doe@example.com</p>
    <p><strong>Phone:</strong> +1 (555) 123-4567</p>
    <p><strong>Location:</strong> San Francisco, CA</p>
  </div>
  
  <h3 style="color: #333; margin-bottom: 10px;">Experience</h3>
  <div style="margin-bottom: 15px;">
    <h4 style="margin-bottom: 5px;">Senior Software Engineer</h4>
    <p style="margin: 0; font-style: italic;">Tech Company Inc.</p>
    <p style="margin: 0; font-size: 14px; color: #666;">2020 - Present</p>
    <ul style="margin-top: 8px;">
      <li>Led development of microservices architecture</li>
      <li>Improved system performance by 40%</li>
      <li>Mentored junior developers</li>
    </ul>
  </div>
  
  <h3 style="color: #333; margin-bottom: 10px;">Education</h3>
  <div style="margin-bottom: 15px;">
    <h4 style="margin-bottom: 5px;">Bachelor of Computer Science</h4>
    <p style="margin: 0; font-style: italic;">University of Technology</p>
    <p style="margin: 0; font-size: 14px; color: #666;">2016 - 2020</p>
  </div>
  
  <h3 style="color: #333; margin-bottom: 10px;">Skills</h3>
  <ul>
    <li>JavaScript, TypeScript</li>
    <li>React, Vue.js, Angular</li>
    <li>Node.js, Python</li>
    <li>AWS, Docker, Kubernetes</li>
  </ul>
</div>`;

export function PDFDebugPanel() {
  const [htmlContent, setHtmlContent] = useState(sampleHtml);
  const [debugReport, setDebugReport] = useState<PDFDebugReport | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);
  const [isRunningTests, setIsRunningTests] = useState(false);

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    setDebugReport(null);

    try {
      const report = await PDFDebugHelper.generateDebugReport(htmlContent);
      setDebugReport(report);
      PDFDebugHelper.logDebugReport(report);
    } catch (error) {
      console.error("Failed to generate debug report:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRunTests = async () => {
    setIsRunningTests(true);
    setTestResults(null);

    try {
      const results = await PDFDebugHelper.runComprehensiveTest();
      setTestResults(results);
      console.log("Comprehensive test results:", results);
    } catch (error) {
      console.error("Failed to run comprehensive tests:", error);
    } finally {
      setIsRunningTests(false);
    }
  };

  const handleLoadSample = () => {
    setHtmlContent(sampleHtml);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bug className="h-5 w-5" />
            PDF Debug Panel
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              HTML Content to Test
            </label>
            <Textarea
              value={htmlContent}
              onChange={(e) => setHtmlContent(e.target.value)}
              placeholder="Enter HTML content to test..."
              className="min-h-[200px] font-mono text-sm"
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleGenerateReport}
              disabled={isGenerating || !htmlContent.trim()}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Report...
                </>
              ) : (
                <>
                  <FileText className="mr-2 h-4 w-4" />
                  Generate Debug Report
                </>
              )}
            </Button>

            <Button onClick={handleLoadSample} variant="outline">
              Load Sample HTML
            </Button>

            <Button
              onClick={handleRunTests}
              disabled={isRunningTests}
              variant="secondary"
            >
              {isRunningTests ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Running Tests...
                </>
              ) : (
                "Run Comprehensive Tests"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {debugReport && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {debugReport.generation.success ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              Debug Report
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium mb-2">HTML Content</h4>
                <p className="text-sm text-gray-600">
                  Length: {debugReport.htmlContent.length} characters
                </p>
              </div>

              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-medium mb-2">Validation</h4>
                <Badge
                  variant={
                    debugReport.validation.isValid ? "default" : "destructive"
                  }
                >
                  {debugReport.validation.isValid ? "Valid" : "Invalid"}
                </Badge>
                <p className="text-sm text-gray-600 mt-1">
                  {debugReport.validation.errors.length} errors,{" "}
                  {debugReport.validation.warnings.length} warnings
                </p>
              </div>

              <div className="p-4 bg-purple-50 rounded-lg">
                <h4 className="font-medium mb-2">Generation</h4>
                <Badge
                  variant={
                    debugReport.generation.success ? "default" : "destructive"
                  }
                >
                  {debugReport.generation.success ? "Success" : "Failed"}
                </Badge>
                {debugReport.generation.pdfSize && (
                  <p className="text-sm text-gray-600 mt-1">
                    PDF Size:{" "}
                    {(debugReport.generation.pdfSize / 1024).toFixed(2)} KB
                  </p>
                )}
                {debugReport.generation.generationTime && (
                  <p className="text-sm text-gray-600">
                    Time: {debugReport.generation.generationTime}ms
                  </p>
                )}
              </div>
            </div>

            {debugReport.validation.errors.length > 0 && (
              <Alert>
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Validation Errors:</strong>
                  <ul className="list-disc list-inside mt-1">
                    {debugReport.validation.errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {debugReport.validation.warnings.length > 0 && (
              <Alert>
                <AlertDescription>
                  <strong>Warnings:</strong>
                  <ul className="list-disc list-inside mt-1">
                    {debugReport.validation.warnings.map((warning, index) => (
                      <li key={index}>{warning}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {debugReport.generation.error && (
              <Alert>
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Generation Error:</strong>{" "}
                  {debugReport.generation.error}
                </AlertDescription>
              </Alert>
            )}

            {debugReport.recommendations.length > 0 && (
              <div className="p-4 bg-yellow-50 rounded-lg">
                <h4 className="font-medium mb-2">Recommendations</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {debugReport.recommendations.map((rec, index) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">Content Analysis</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  Has Content:{" "}
                  {debugReport.validation.contentAnalysis.hasContent
                    ? "✅"
                    : "❌"}
                </div>
                <div>
                  Has Text:{" "}
                  {debugReport.validation.contentAnalysis.hasText ? "✅" : "❌"}
                </div>
                <div>
                  Has Visible Elements:{" "}
                  {debugReport.validation.contentAnalysis.hasVisibleElements
                    ? "✅"
                    : "❌"}
                </div>
                <div>
                  Has Images:{" "}
                  {debugReport.validation.contentAnalysis.hasImages
                    ? "✅"
                    : "❌"}
                </div>
                <div>
                  Element Count:{" "}
                  {debugReport.validation.contentAnalysis.elementCount}
                </div>
                <div>
                  Text Length:{" "}
                  {debugReport.validation.contentAnalysis.textLength}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {testResults && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {testResults.overallSuccess ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              Comprehensive Test Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {testResults.testResults.map((result: any, index: number) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    {result.success ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span className="font-medium">{result.name}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {result.pdfSize &&
                      `${(result.pdfSize / 1024).toFixed(2)} KB`}
                    {result.generationTime && ` • ${result.generationTime}ms`}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm">
                <strong>Overall Result:</strong>{" "}
                {testResults.overallSuccess
                  ? "All tests passed!"
                  : "Some tests failed. Check console for details."}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default PDFDebugPanel;
