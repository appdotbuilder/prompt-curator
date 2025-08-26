import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { DialogFooter } from '@/components/ui/dialog';
import { Tag, X } from 'lucide-react';
import { useState } from 'react';
import type { CreatePromptInput, Prompt } from '../../../server/src/schema';

interface PromptFormProps {
  initialData?: Prompt;
  onSubmit: (data: CreatePromptInput) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function PromptForm({ initialData, onSubmit, onCancel, isLoading = false }: PromptFormProps) {
  const [formData, setFormData] = useState<CreatePromptInput>({
    text: initialData?.text || '',
    description: initialData?.description || null,
    image_url: initialData?.image_url,
    tags: initialData?.tags || []
  });
  
  const [tagInput, setTagInput] = useState('');
  const [tagError, setTagError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const addTag = () => {
    const trimmedTag = tagInput.trim().toLowerCase();
    setTagError('');

    if (!trimmedTag) {
      return;
    }

    if (trimmedTag.length > 20) {
      setTagError('Tag must be 20 characters or less');
      return;
    }

    if (formData.tags.includes(trimmedTag)) {
      setTagError('Tag already exists');
      return;
    }

    if (formData.tags.length >= 10) {
      setTagError('Maximum 10 tags allowed');
      return;
    }

    setFormData((prev: CreatePromptInput) => ({
      ...prev,
      tags: [...prev.tags, trimmedTag]
    }));
    setTagInput('');
  };

  const removeTag = (tagToRemove: string) => {
    setFormData((prev: CreatePromptInput) => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Prompt Text */}
      <div className="space-y-2">
        <label htmlFor="prompt-text" className="block text-sm font-medium text-gray-700">
          Prompt Text *
        </label>
        <Textarea
          id="prompt-text"
          placeholder="A serene landscape with rolling hills, a crystal-clear lake reflecting the golden sunset, and wild flowers in the foreground..."
          value={formData.text}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            setFormData((prev: CreatePromptInput) => ({ ...prev, text: e.target.value }))
          }
          required
          rows={4}
          className="form-input resize-none"
          maxLength={1000}
        />
        <p className="text-xs text-gray-500">
          {formData.text.length}/1000 characters
        </p>
      </div>
      
      {/* Description */}
      <div className="space-y-2">
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description <span className="text-gray-400">(optional)</span>
        </label>
        <Input
          id="description"
          placeholder="A brief description of when or how to use this prompt..."
          value={formData.description || ''}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setFormData((prev: CreatePromptInput) => ({
              ...prev,
              description: e.target.value || null
            }))
          }
          className="form-input"
          maxLength={200}
        />
        {formData.description && (
          <p className="text-xs text-gray-500">
            {formData.description.length}/200 characters
          </p>
        )}
      </div>

      {/* Image URL */}
      <div className="space-y-2">
        <label htmlFor="image-url" className="block text-sm font-medium text-gray-700">
          Generated Image URL <span className="text-gray-400">(optional)</span>
        </label>
        <Input
          id="image-url"
          type="url"
          placeholder="https://example.com/generated-image.jpg"
          value={formData.image_url || ''}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setFormData((prev: CreatePromptInput) => ({
              ...prev,
              image_url: e.target.value || undefined
            }))
          }
          className="form-input"
        />
        <p className="text-xs text-gray-500">
          💡 Add a URL to display the generated image result in the prompt card
        </p>
      </div>

      {/* Tags */}
      <div className="space-y-3">
        <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
          Tags <span className="text-gray-400">({formData.tags.length}/10)</span>
        </label>
        
        {/* Tag Input */}
        <div className="flex gap-2">
          <Input
            id="tags"
            placeholder="nature, landscape, sunset..."
            value={tagInput}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setTagInput(e.target.value);
              if (tagError) setTagError('');
            }}
            onKeyPress={handleTagKeyPress}
            className="form-input flex-1"
            maxLength={20}
          />
          <Button 
            type="button" 
            onClick={addTag} 
            variant="outline"
            disabled={!tagInput.trim() || formData.tags.length >= 10}
            className="px-3"
          >
            <Tag className="h-4 w-4" />
          </Button>
        </div>

        {/* Tag Error */}
        {tagError && (
          <p className="text-xs text-red-600">{tagError}</p>
        )}

        {/* Current Tags */}
        {formData.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-md">
            {formData.tags.map((tag: string) => (
              <Badge 
                key={tag} 
                variant="secondary" 
                className="flex items-center gap-1 pr-1 tag-badge cursor-pointer hover:bg-red-100 hover:text-red-800 hover:border-red-300 transition-colors"
                onClick={() => removeTag(tag)}
              >
                #{tag}
                <X className="h-3 w-3 hover:bg-red-200 rounded-full" />
              </Badge>
            ))}
          </div>
        )}

        <p className="text-xs text-gray-500">
          💡 Use tags to categorize your prompts (e.g., #nature, #portrait, #abstract). Click tags to remove them.
        </p>
      </div>
      
      <DialogFooter className="gap-2 sm:gap-0">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={isLoading || !formData.text.trim()}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
        >
          {isLoading ? (
            <>
              <div className="loading-spinner h-4 w-4 mr-2" />
              {initialData ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            initialData ? 'Update Prompt' : 'Create Prompt'
          )}
        </Button>
      </DialogFooter>
    </form>
  );
}