import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Pencil, Trash2, Calendar, Copy, Check, Image as ImageIcon } from 'lucide-react';
import { useState } from 'react';
import type { Prompt } from '../../../server/src/schema';

interface PromptCardProps {
  prompt: Prompt;
  onEdit: (prompt: Prompt) => void;
  onDelete: (promptId: number) => Promise<void>;
}

export function PromptCard({ prompt, onEdit, onDelete }: PromptCardProps) {
  const [copied, setCopied] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(prompt.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  const handleDelete = async () => {
    await onDelete(prompt.id);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
  };

  return (
    <Card className="prompt-card hover:shadow-lg transition-all duration-300 border-l-4 border-l-purple-500">
      {/* Generated Image */}
      {prompt.image_url && (
        <div className="relative aspect-video w-full overflow-hidden bg-gray-100">
          {imageLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <ImageIcon className="h-8 w-8 text-gray-400" />
              <span className="sr-only">Loading image...</span>
            </div>
          )}
          {!imageError ? (
            <img
              src={prompt.image_url}
              alt="Generated image for prompt"
              className={`w-full h-full object-cover transition-opacity duration-200 ${
                imageLoading ? 'opacity-0' : 'opacity-100'
              }`}
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 text-gray-500">
              <ImageIcon className="h-8 w-8 mb-2" />
              <span className="text-sm">Failed to load image</span>
            </div>
          )}
        </div>
      )}

      <CardHeader>
        <div className="flex justify-between items-start gap-2">
          <CardTitle className="text-lg line-clamp-2 flex-1 min-w-0">
            {prompt.text}
          </CardTitle>
          <div className="flex gap-1 flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
              title="Copy prompt text"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(prompt)}
              className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              title="Edit prompt"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                  title="Delete prompt"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Prompt</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this prompt? This action cannot be undone.
                    <div className="mt-2 p-3 bg-gray-50 rounded-md">
                      <p className="font-medium text-sm text-gray-800 line-clamp-3">
                        "{prompt.text}"
                      </p>
                    </div>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleDelete} 
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
        {prompt.description && (
          <CardDescription className="line-clamp-3 text-gray-600">
            {prompt.description}
          </CardDescription>
        )}
      </CardHeader>
      
      <CardContent>
        {prompt.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {prompt.tags.map((tag: string) => (
              <Badge 
                key={tag} 
                variant="secondary" 
                className="text-xs tag-badge"
              >
                #{tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-0">
        <div className="text-xs text-gray-500 flex items-center justify-between w-full flex-wrap gap-2">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>Created: {prompt.created_at.toLocaleDateString()}</span>
          </div>
          {prompt.updated_at.getTime() !== prompt.created_at.getTime() && (
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>Updated: {prompt.updated_at.toLocaleDateString()}</span>
            </div>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}