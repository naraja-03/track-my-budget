// Utility functions for creating and parsing URL-friendly slugs

/**
 * Convert a title to a URL-friendly slug
 * Example: "My Budget Project" -> "my-budget-project"
 */
export function createSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters except hyphens and spaces
    .replace(/[\s_]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading and trailing hyphens
}

/**
 * Convert a slug back to a readable title
 * Example: "my-budget-project" -> "My Budget Project"
 */
export function slugToTitle(slug: string): string {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Create a unique slug by appending a number if needed
 * Example: If "my-project" exists, return "my-project-2"
 */
export function createUniqueSlug(title: string, existingSlugs: string[]): string {
  const baseSlug = createSlug(title);
  
  if (!existingSlugs.includes(baseSlug)) {
    return baseSlug;
  }
  
  let counter = 2;
  let uniqueSlug = `${baseSlug}-${counter}`;
  
  while (existingSlugs.includes(uniqueSlug)) {
    counter++;
    uniqueSlug = `${baseSlug}-${counter}`;
  }
  
  return uniqueSlug;
}

/**
 * Validate if a string is a valid slug format
 */
export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

/**
 * Check if a string looks like a MongoDB ObjectId
 */
export function isObjectId(str: string): boolean {
  return /^[0-9a-fA-F]{24}$/.test(str);
}