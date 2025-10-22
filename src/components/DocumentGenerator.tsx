import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FileText, Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface DocumentGeneratorProps {
  conversationId?: string;
  messages: Array<{ role: string; content: string }>;
  caseType: string;
}

export const DocumentGenerator = ({
  conversationId,
  messages,
  caseType
}: DocumentGeneratorProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedDoc, setGeneratedDoc] = useState<string | null>(null);

  const generateDocument = async (docType: 'fir' | 'notice' | 'complaint') => {
    setIsGenerating(true);
    try {
      // Extract case facts from conversation
      const caseFacts = messages
        .filter(m => m.role === 'user')
        .map(m => m.content)
        .join('\n\n');

      // Simple document generation based on type
      let document = '';
      const date = new Date().toLocaleDateString('en-IN');

      switch (docType) {
        case 'fir':
          document = `FIRST INFORMATION REPORT (FIR)

Date: ${date}
Case Type: ${caseType}

TO THE OFFICER IN CHARGE,
[Police Station Name]

SUBJECT: First Information Report under Section 154 CrPC

Sir/Madam,

I beg to state that:

${caseFacts}

I request you to kindly register my complaint and take necessary legal action against the accused as per law.

Thanking you,

Yours faithfully,
[Complainant Name]
[Address]
[Contact Number]

---
Note: This is a draft template. Please consult with a lawyer before filing.`;
          break;

        case 'notice':
          document = `LEGAL NOTICE

Date: ${date}

TO:
[Name and Address of Opposite Party]

SUBJECT: Legal Notice under [Applicable Section]

Dear Sir/Madam,

Under instructions from and on behalf of my client, I serve you with this legal notice as follows:

${caseFacts}

You are hereby called upon to [specific demand] within 15 days from receipt of this notice, failing which my client shall be constrained to initiate appropriate legal proceedings against you.

Take notice and govern yourself accordingly.

Yours faithfully,
[Advocate Name]
[Enrollment Number]

---
Note: This is a draft template. Please consult with a lawyer before sending.`;
          break;

        case 'complaint':
          document = `CRIMINAL COMPLAINT

Date: ${date}

TO THE MAGISTRATE,
[Court Name]

SUBJECT: Criminal Complaint under ${caseType} Laws

Respected Sir/Madam,

The complainant most respectfully submits as follows:

${caseFacts}

PRAYER:
It is therefore most respectfully prayed that this Hon'ble Court may be pleased to:
1. Take cognizance of the offence
2. Issue process against the accused
3. Pass such other orders as this Hon'ble Court may deem fit

Place: [City]
Date: ${date}

Yours faithfully,
[Complainant Name]

---
Note: This is a draft template. Please consult with a lawyer before filing.`;
          break;
      }

      setGeneratedDoc(document);
      toast.success('Document generated successfully');
    } catch (error) {
      console.error('Document generation error:', error);
      toast.error('Failed to generate document');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadDocument = () => {
    if (!generatedDoc) return;
    
    const blob = new Blob([generatedDoc], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `legal-document-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Document downloaded');
  };

  return (
    <Card className="p-4 border-border">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-law-gold" />
          <h3 className="font-semibold text-foreground">Generate Legal Documents</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <Button
            variant="outline"
            onClick={() => generateDocument('fir')}
            disabled={isGenerating || messages.length < 2}
            className="w-full"
          >
            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'FIR Draft'}
          </Button>
          <Button
            variant="outline"
            onClick={() => generateDocument('notice')}
            disabled={isGenerating || messages.length < 2}
            className="w-full"
          >
            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Legal Notice'}
          </Button>
          <Button
            variant="outline"
            onClick={() => generateDocument('complaint')}
            disabled={isGenerating || messages.length < 2}
            className="w-full"
          >
            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Complaint'}
          </Button>
        </div>

        {generatedDoc && (
          <div className="space-y-2">
            <div className="p-3 bg-muted rounded-lg max-h-60 overflow-y-auto">
              <pre className="text-xs whitespace-pre-wrap font-mono">{generatedDoc}</pre>
            </div>
            <Button
              onClick={downloadDocument}
              variant="default"
              className="w-full gap-2"
            >
              <Download className="w-4 h-4" />
              Download Document
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};