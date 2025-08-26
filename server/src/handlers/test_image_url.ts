// Test handler to verify image URL functionality works
import { db } from '../db';
import { promptsTable } from '../db/schema';
import { type CreatePromptInput, type Prompt } from '../schema';
import { createPrompt } from './create_prompt';
import { updatePrompt } from './update_prompt';

export const testImageUrlFunctionality = async (): Promise<void> => {
  // Test creating prompt with image URL
  const testInput: CreatePromptInput = {
    text: 'Test prompt with image',
    description: 'Testing image URL functionality',
    image_url: 'https://example.com/test-image.jpg',
    tags: ['test', 'image']
  };

  const createdPrompt = await createPrompt(testInput);
  console.log('Created prompt with image URL:', createdPrompt);

  // Test updating prompt to add image URL
  const updatedPrompt = await updatePrompt({
    id: createdPrompt.id,
    image_url: 'https://example.com/updated-image.jpg'
  });
  console.log('Updated prompt with new image URL:', updatedPrompt);

  // Test updating prompt to remove image URL
  const removedImagePrompt = await updatePrompt({
    id: createdPrompt.id,
    image_url: null
  });
  console.log('Removed image URL from prompt:', removedImagePrompt);

  console.log('Image URL functionality test completed successfully!');
};