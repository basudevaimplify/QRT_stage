import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { FileUploadEnhanced } from '@/components/FileUploadEnhanced';

export default function Index() {
  const navigate = useNavigate();

  const handleUploadComplete = () => {
    navigate('/dashboard/finance');
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center space-y-8">
          <h1 className="text-4xl font-bold text-foreground">
            Welcome to IntelliFin
          </h1>
          <p className="text-lg text-muted-foreground text-center max-w-2xl">
            Upload your financial documents to get started with automated processing and analysis.
          </p>
          <div className="w-full max-w-2xl">
            <FileUploadEnhanced onUploadComplete={handleUploadComplete} />
          </div>
        </div>
      </main>
    </div>
  );
} 