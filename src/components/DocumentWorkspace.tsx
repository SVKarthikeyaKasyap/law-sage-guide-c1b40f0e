import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import {
  FileText, Download, Loader2, ScanSearch, Wand2,
  AlertTriangle, CheckCircle2, XCircle, Info, ChevronDown, ChevronUp
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface ScanIssue {
  severity: 'critical' | 'warning' | 'info';
  location: string;
  issue: string;
  suggestion: string;
}

interface ScanResult {
  overallScore: number;
  verdict: 'VALID' | 'NEEDS_CHANGES' | 'INVALID';
  summary: string;
  issues: ScanIssue[];
  strengths: string[];
  missingElements: string[];
}

interface DocumentWorkspaceProps {
  conversationId?: string;
  messages: Array<{ role: string; content: string }>;
  caseType: string;
  country?: string;
  onMissingDetails?: (details: string[]) => void;
}

type DocType = 'fir' | 'notice' | 'complaint';

export const DocumentWorkspace = ({
  conversationId,
  messages,
  caseType,
  country = 'india',
  onMissingDetails
}: DocumentWorkspaceProps) => {
  const [activeDoc, setActiveDoc] = useState<DocType | null>(null);
  const [documentText, setDocumentText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [showIssues, setShowIssues] = useState(true);

  const docTypes: { id: DocType; label: string; description: string }[] = [
    { id: 'fir', label: 'FIR Draft', description: 'First Information Report' },
    { id: 'notice', label: 'Legal Notice', description: 'Formal Legal Notice' },
    { id: 'complaint', label: 'Complaint', description: 'Court Complaint Draft' },
  ];

  const generateDocument = async (type: DocType) => {
    setActiveDoc(type);
    setIsGenerating(true);
    setScanResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('analyze-document', {
        body: {
          action: 'generate',
          documentType: type,
          caseType,
          country,
          chatContext: messages,
        }
      });

      if (error) throw error;
      if (data?.content) {
        setDocumentText(data.content);
        toast.success(`${type.toUpperCase()} draft generated from chat context`);
      }
    } catch (error) {
      console.error('Generation error:', error);
      toast.error('Failed to generate document. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const scanDocument = async () => {
    if (!documentText.trim()) {
      toast.error('Please enter or generate a document to scan');
      return;
    }

    setIsScanning(true);
    setScanResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('analyze-document', {
        body: {
          action: 'scan',
          documentText,
          documentType: activeDoc || 'legal document',
          caseType,
          country,
        }
      });

      if (error) throw error;
      if (data?.result) {
        setScanResult(data.result);
        const verdict = data.result.verdict;
        if (verdict === 'VALID') {
          toast.success('Document looks correct!');
        } else if (verdict === 'NEEDS_CHANGES') {
          toast.warning(`Found ${data.result.issues?.length || 0} issues that need attention`);
        } else {
          toast.error('Document has critical issues');
        }
      }
    } catch (error) {
      console.error('Scan error:', error);
      toast.error('Failed to scan document');
    } finally {
      setIsScanning(false);
    }
  };

  const editWithAI = async () => {
    if (!documentText.trim()) {
      toast.error('No document to edit');
      return;
    }

    setIsEditing(true);

    try {
      const { data, error } = await supabase.functions.invoke('analyze-document', {
        body: {
          action: 'edit',
          documentText,
          documentType: activeDoc || 'legal document',
          caseType,
          country,
        }
      });

      if (error) throw error;
      if (data?.content) {
        setDocumentText(data.content);
        setScanResult(null);

        // Check if there are missing details that need user input
        if (data.missingDetails && data.missingDetails.length > 0 && onMissingDetails) {
          toast.info('Some details are missing — switching to chat for your input.');
          onMissingDetails(data.missingDetails);
        } else {
          toast.success('Document updated with AI corrections');
        }
      }
    } catch (error) {
      console.error('Edit error:', error);
      toast.error('Failed to edit document');
    } finally {
      setIsEditing(false);
    }
  };

  const downloadDocument = () => {
    if (!documentText) return;
    const blob = new Blob([documentText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeDoc || 'legal'}-document-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Document downloaded');
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <XCircle className="w-4 h-4 text-destructive" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      default: return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case 'VALID': return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30';
      case 'NEEDS_CHANGES': return 'bg-amber-500/10 text-amber-600 border-amber-500/30';
      case 'INVALID': return 'bg-destructive/10 text-destructive border-destructive/30';
      default: return '';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600';
    if (score >= 50) return 'text-amber-600';
    return 'text-destructive';
  };

  return (
    <div className="space-y-4">
      {/* Document Type Selector */}
      <Card className="p-4 border-border">
        <div className="flex items-center gap-2 mb-3">
          <FileText className="w-5 h-5 text-accent" />
          <h3 className="font-semibold text-foreground">Legal Document Workspace</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Generate documents from chat context, paste your own, or scan existing documents for correctness.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4">
          {docTypes.map((doc) => (
            <Button
              key={doc.id}
              variant={activeDoc === doc.id ? 'default' : 'outline'}
              onClick={() => generateDocument(doc.id)}
              disabled={isGenerating || messages.length < 2}
              className="w-full flex flex-col items-center py-3 h-auto"
            >
              {isGenerating && activeDoc === doc.id ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span className="font-medium">{doc.label}</span>
                  <span className="text-xs opacity-70">{doc.description}</span>
                </>
              )}
            </Button>
          ))}
        </div>

        {messages.length < 2 && (
          <p className="text-xs text-muted-foreground text-center">
            💡 Start a conversation in Chat first to generate documents from context, or paste a document below to scan it.
          </p>
        )}
      </Card>

      {/* Document Editor */}
      <Card className="p-4 border-border">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-foreground text-sm">Document Editor</h4>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={scanDocument}
              disabled={isScanning || !documentText.trim()}
              className="gap-1"
            >
              {isScanning ? <Loader2 className="w-3 h-3 animate-spin" /> : <ScanSearch className="w-3 h-3" />}
              Scan & Check
            </Button>
            {scanResult && scanResult.issues.length > 0 && (
              <Button
                variant="default"
                size="sm"
                onClick={editWithAI}
                disabled={isEditing}
                className="gap-1"
              >
                {isEditing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
                Edit with AI
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={downloadDocument}
              disabled={!documentText.trim()}
              className="gap-1"
            >
              <Download className="w-3 h-3" />
              Download
            </Button>
          </div>
        </div>

        <Textarea
          value={documentText}
          onChange={(e) => {
            setDocumentText(e.target.value);
            setScanResult(null);
          }}
          placeholder="Paste a legal document here to scan for correctness, or click a document type above to generate from your chat conversation..."
          className="min-h-[300px] font-mono text-xs resize-y"
        />
      </Card>

      {/* Scan Results */}
      {scanResult && (
        <Card className="p-4 border-border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h4 className="font-semibold text-foreground">Scan Results</h4>
              <Badge className={getVerdictColor(scanResult.verdict)}>
                {scanResult.verdict === 'VALID' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                {scanResult.verdict === 'NEEDS_CHANGES' && <AlertTriangle className="w-3 h-3 mr-1" />}
                {scanResult.verdict === 'INVALID' && <XCircle className="w-3 h-3 mr-1" />}
                {scanResult.verdict}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-2xl font-bold ${getScoreColor(scanResult.overallScore)}`}>
                {scanResult.overallScore}
              </span>
              <span className="text-xs text-muted-foreground">/100</span>
            </div>
          </div>

          <Progress value={scanResult.overallScore} className="mb-4 h-2" />

          <p className="text-sm text-muted-foreground mb-4">{scanResult.summary}</p>

          {/* Strengths */}
          {scanResult.strengths && scanResult.strengths.length > 0 && (
            <div className="mb-4">
              <h5 className="text-sm font-medium text-emerald-600 mb-2 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Strengths
              </h5>
              <ul className="space-y-1">
                {scanResult.strengths.map((s, i) => (
                  <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                    <span className="text-emerald-500 mt-0.5">✓</span> {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Issues */}
          {scanResult.issues && scanResult.issues.length > 0 && (
            <div className="mb-4">
              <button
                onClick={() => setShowIssues(!showIssues)}
                className="flex items-center gap-1 text-sm font-medium text-amber-600 mb-2 hover:underline"
              >
                <AlertTriangle className="w-4 h-4" />
                Issues Found ({scanResult.issues.length})
                {showIssues ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
              {showIssues && (
                <ScrollArea className="max-h-[300px]">
                  <div className="space-y-3">
                    {scanResult.issues.map((issue, i) => (
                      <div
                        key={i}
                        className={`p-3 rounded-lg border ${
                          issue.severity === 'critical'
                            ? 'border-destructive/30 bg-destructive/5'
                            : issue.severity === 'warning'
                            ? 'border-amber-500/30 bg-amber-500/5'
                            : 'border-blue-500/30 bg-blue-500/5'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          {getSeverityIcon(issue.severity)}
                          <div className="flex-1">
                            <p className="text-sm font-medium text-foreground">{issue.issue}</p>
                            {issue.location && (
                              <p className="text-xs text-muted-foreground mt-1 font-mono bg-muted px-2 py-1 rounded">
                                📍 "{issue.location}"
                              </p>
                            )}
                            {issue.suggestion && (
                              <p className="text-xs text-muted-foreground mt-1">
                                💡 <strong>Fix:</strong> {issue.suggestion}
                              </p>
                            )}
                          </div>
                          <Badge variant="outline" className="text-xs capitalize shrink-0">
                            {issue.severity}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </div>
          )}

          {/* Missing Elements */}
          {scanResult.missingElements && scanResult.missingElements.length > 0 && (
            <div>
              <h5 className="text-sm font-medium text-destructive mb-2 flex items-center gap-1">
                <XCircle className="w-4 h-4" /> Missing Elements
              </h5>
              <ul className="space-y-1">
                {scanResult.missingElements.map((m, i) => (
                  <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                    <span className="text-destructive mt-0.5">✗</span> {m}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Edit with AI button at bottom */}
          {scanResult.issues.length > 0 && (
            <div className="mt-4 pt-4 border-t border-border">
              <Button
                onClick={editWithAI}
                disabled={isEditing}
                className="w-full gap-2"
              >
                {isEditing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Wand2 className="w-4 h-4" />
                )}
                Edit with AI — Fix All Issues Automatically
              </Button>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};
