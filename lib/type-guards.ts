/**
 * Type guards and utility functions for Notion API responses
 * Centralized to avoid duplication across the codebase
 */

/**
 * Type guard to check if the post is a valid page object with properties
 */
export function isPageObjectResponse(post: any): post is { id: string; properties: Record<string, any> } {
  return post && 
         typeof post === 'object' && 
         'properties' in post && 
         'id' in post && 
         post.properties &&
         typeof post.properties === 'object';
}

/**
 * Safely get property value with type checking
 */
export function getPropertyValue(properties: Record<string, any>, propertyName: string, propertyType: string): any {
  const property = properties[propertyName];
  if (!property || property.type !== propertyType) return null;
  return property[propertyType];
}

/**
 * Extract searchable text from a Notion rich text array
 */
export function extractTextFromRichText(richText: any[]): string {
  if (!richText || !Array.isArray(richText)) return '';
  
  return richText
    .map(item => item.plain_text || '')
    .join(' ');
}

/**
 * Extract searchable text from a title array
 */
export function extractTextFromTitle(title: any[]): string {
  if (!title || !Array.isArray(title)) return '';
  
  return title
    .map(item => item.plain_text || '')
    .join(' ');
}

/**
 * Generate slug from title array (moved from notion.ts for consistency)
 */
export function generateSlug(title: any[]): string {
  if (!title || !title.length) return '';
  
  const plainText = title.map(textObj => textObj.plain_text || '').join('');
  
  return plainText
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .trim();
}