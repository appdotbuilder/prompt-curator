import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { trpc } from '@/utils/trpc';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Plus, Search, Filter, FileText, Sparkles, AlertTriangle } from 'lucide-react';
import { PromptCard } from '@/components/PromptCard';
import { PromptForm } from '@/components/PromptForm';
import type { Prompt, CreatePromptInput, UpdatePromptInput } from '../../server/src/schema';

function App() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'alphabetical'>('newest');

  // Load prompts from API
  const loadPrompts = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await trpc.getPrompts.query();
      setPrompts(result);
    } catch (error) {
      console.error('Failed to load prompts:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPrompts();
  }, [loadPrompts]);

  // Get all unique tags from prompts
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    prompts.forEach(prompt => {
      prompt.tags.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [prompts]);

  // Filter and sort prompts
  const filteredAndSortedPrompts = useMemo(() => {
    let filtered = prompts;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(prompt => 
        prompt.text.toLowerCase().includes(query) ||
        (prompt.description && prompt.description.toLowerCase().includes(query)) ||
        prompt.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Apply tag filter
    if (selectedTag !== 'all') {
      filtered = filtered.filter(prompt => 
        prompt.tags.includes(selectedTag)
      );
    }

    // Apply sorting
    const sorted = [...filtered];
    switch (sortBy) {
      case 'newest':
        sorted.sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
        break;
      case 'oldest':
        sorted.sort((a, b) => a.created_at.getTime() - b.created_at.getTime());
        break;
      case 'alphabetical':
        sorted.sort((a, b) => a.text.localeCompare(b.text));
        break;
    }

    return sorted;
  }, [prompts, searchQuery, selectedTag, sortBy]);

  // Handle form submission for create
  const handleCreateSubmit = async (formData: CreatePromptInput) => {
    try {
      const newPrompt = await trpc.createPrompt.mutate(formData);
      setPrompts((prev: Prompt[]) => [...prev, newPrompt]);
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('Failed to create prompt:', error);
      throw error;
    }
  };

  // Handle form submission for edit
  const handleEditSubmit = async (formData: CreatePromptInput) => {
    if (!editingPrompt) return;
    
    try {
      const updateData: UpdatePromptInput = {
        id: editingPrompt.id,
        text: formData.text,
        description: formData.description,
        image_url: formData.image_url,
        tags: formData.tags
      };
      const updatedPrompt = await trpc.updatePrompt.mutate(updateData);
      if (updatedPrompt) {
        setPrompts((prev: Prompt[]) => 
          prev.map(p => p.id === editingPrompt.id ? updatedPrompt : p)
        );
      }
      setEditingPrompt(null);
    } catch (error) {
      console.error('Failed to update prompt:', error);
      throw error;
    }
  };

  // Handle prompt deletion
  const handleDelete = async (promptId: number) => {
    try {
      const success = await trpc.deletePrompt.mutate({ id: promptId });
      if (success) {
        setPrompts((prev: Prompt[]) => prev.filter(p => p.id !== promptId));
      }
    } catch (error) {
      console.error('Failed to delete prompt:', error);
    }
  };

  // Handle editing a prompt
  const startEdit = (prompt: Prompt) => {
    setEditingPrompt(prompt);
  };

  // Clear search and filters
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedTag('all');
    setSortBy('newest');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-3">
            <Sparkles className="inline h-8 w-8 mr-2 text-purple-600" />
            Prompt Curator
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Organize, manage, and curate your text-to-image prompts with powerful search and tagging features
          </p>
          
          {/* Stub Data Warning */}
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg max-w-2xl mx-auto">
            <div className="flex items-center justify-center gap-2 text-yellow-800 text-sm">
              <AlertTriangle className="h-4 w-4 flex-shrink-0" />
              <span>
                <strong>Development Mode:</strong> This app uses stub backend data. Created prompts won't persist between sessions.
              </span>
            </div>
          </div>
        </div>

        {/* Controls Section */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-3 flex-1">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search prompts, descriptions, or tags..."
                  value={searchQuery}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Tag Filter */}
              <Select value={selectedTag} onValueChange={setSelectedTag}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by tag" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All tags</SelectItem>
                  {allTags.map(tag => (
                    <SelectItem key={tag} value={tag}>
                      #{tag} ({prompts.filter(p => p.tags.includes(tag)).length})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Sort */}
              <Select value={sortBy} onValueChange={(value: 'newest' | 'oldest' | 'alphabetical') => setSortBy(value)}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest first</SelectItem>
                  <SelectItem value="oldest">Oldest first</SelectItem>
                  <SelectItem value="alphabetical">A-Z</SelectItem>
                </SelectContent>
              </Select>

              {/* Clear Filters */}
              {(searchQuery || selectedTag !== 'all' || sortBy !== 'newest') && (
                <Button variant="outline" onClick={clearFilters} className="whitespace-nowrap">
                  Clear filters
                </Button>
              )}
            </div>

            {/* Create Button */}
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 whitespace-nowrap">
                  <Plus className="mr-2 h-5 w-5" />
                  Create Prompt
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-xl">Create New Prompt</DialogTitle>
                  <DialogDescription>
                    Add a new text-to-image prompt to your collection
                  </DialogDescription>
                </DialogHeader>
                <PromptForm
                  onSubmit={handleCreateSubmit}
                  onCancel={() => setIsCreateDialogOpen(false)}
                  isLoading={isLoading}
                />
              </DialogContent>
            </Dialog>
          </div>

          {/* Active Filters Display */}
          {(searchQuery || selectedTag !== 'all') && (
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
              <span className="text-sm text-gray-600">Active filters:</span>
              {searchQuery && (
                <Badge variant="secondary">
                  Search: "{searchQuery}"
                </Badge>
              )}
              {selectedTag !== 'all' && (
                <Badge variant="secondary">
                  Tag: #{selectedTag}
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Results Summary */}
        {prompts.length > 0 && (
          <div className="flex items-center justify-between mb-6 text-sm text-gray-600">
            <span>
              Showing {filteredAndSortedPrompts.length} of {prompts.length} prompts
            </span>
            {allTags.length > 0 && (
              <span>
                {allTags.length} unique tags
              </span>
            )}
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={!!editingPrompt} onOpenChange={(open) => !open && setEditingPrompt(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl">Edit Prompt</DialogTitle>
              <DialogDescription>
                Update your prompt details
              </DialogDescription>
            </DialogHeader>
            {editingPrompt && (
              <PromptForm
                initialData={editingPrompt}
                onSubmit={handleEditSubmit}
                onCancel={() => setEditingPrompt(null)}
                isLoading={isLoading}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Prompts Grid */}
        {isLoading && prompts.length === 0 ? (
          <div className="text-center py-16">
            <div className="loading-spinner h-12 w-12 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your prompt collection...</p>
          </div>
        ) : filteredAndSortedPrompts.length === 0 ? (
          prompts.length === 0 ? (
            <div className="text-center py-16">
              <div className="bg-white rounded-2xl shadow-sm border p-8 max-w-md mx-auto">
                <FileText className="h-16 w-16 text-purple-300 mx-auto mb-6" />
                <h3 className="text-xl font-semibold text-gray-700 mb-3">No prompts yet</h3>
                <p className="text-gray-500 mb-6 leading-relaxed">
                  Start building your collection of text-to-image prompts! 
                  Create your first prompt to organize and manage your creative ideas.
                </p>
                <Button 
                  onClick={() => setIsCreateDialogOpen(true)}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Prompt
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="bg-white rounded-2xl shadow-sm border p-8 max-w-md mx-auto">
                <Search className="h-16 w-16 text-gray-300 mx-auto mb-6" />
                <h3 className="text-xl font-semibold text-gray-700 mb-3">No matching prompts</h3>
                <p className="text-gray-500 mb-6">
                  No prompts match your current search criteria. 
                  Try adjusting your filters or search terms.
                </p>
                <Button variant="outline" onClick={clearFilters}>
                  Clear all filters
                </Button>
              </div>
            </div>
          )
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredAndSortedPrompts.map((prompt: Prompt) => (
              <PromptCard
                key={prompt.id}
                prompt={prompt}
                onEdit={startEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

        {/* Footer */}
        <footer className="text-center mt-16 pt-8 border-t border-gray-200">
          <p className="text-gray-500 text-sm">
            Built with ❤️ for creative minds using React, Tailwind CSS, and tRPC
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;